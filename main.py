# FastAPI Backend for ML Tools Integration
# Optimized for React frontend and Firebase integration

from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel, Field
from typing import Dict, List, Optional, Any, Union
import pandas as pd
import numpy as np
import io
import json
import uuid
import asyncio
from datetime import datetime
import logging
from pathlib import Path
import tempfile
import os

# Import all ML frameworks
from regression.enhanced_regression_framework import RegressionWorkflow, RegressionConfig
from ml_frameworks import (
    EDAWorkflow, EDAConfig,
    ClassificationWorkflow, ClassificationConfig,
    ClusteringWorkflow, ClusteringConfig,
    NLPWorkflow, NLPConfig
)

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="EvolvIQ ML Tools API",
    description="Interactive Machine Learning Analysis API with EDA, Classification, Clustering, NLP & Regression",
    version="2.0.0"
)

# Configure CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for now
    allow_credentials=False,  # Set to False when using allow_origins=["*"]
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"]
)

# Global session storage (in production, use Redis or database)
active_sessions: Dict[str, Dict[str, Any]] = {}  # session_id -> {tool_type: workflow_instance}
session_data: Dict[str, Dict] = {}  # session_id -> session metadata

# Pydantic Models
class SessionCreateRequest(BaseModel):
    name: Optional[str] = "Untitled Session"
    description: Optional[str] = None

class SessionResponse(BaseModel):
    session_id: str
    name: str
    description: Optional[str]
    status: str
    created_at: datetime

class DataValidationResponse(BaseModel):
    is_valid: bool
    errors: List[str]
    warnings: List[str]
    recommendations: List[str]
    summary: Dict[str, Any]

class PreprocessingConfig(BaseModel):
    handle_missing: str = Field(default="auto", description="Method to handle missing values")
    encode_categorical: str = Field(default="onehot", description="Method to encode categorical variables")
    scale_features: bool = Field(default=True, description="Whether to scale features")

class TrainingConfig(BaseModel):
    test_size: float = Field(default=0.2, ge=0.1, le=0.5)
    models_to_include: List[str] = Field(default=['linear', 'ridge', 'lasso', 'elastic_net', 'random_forest'])
    hyperparameter_tuning: bool = Field(default=True)
    cv_folds: int = Field(default=5, ge=3, le=10)

class PredictionRequest(BaseModel):
    data: Dict[str, Union[float, int, str]]

class TrainingRequest(BaseModel):
    config: TrainingConfig
    target_column: str

class PreprocessingRequest(BaseModel):
    config: PreprocessingConfig
    target_column: str

# Utility Functions
def get_session_workflow(session_id: str, tool_type: str = 'regression') -> Any:
    """Get workflow for session and tool type, create if doesn't exist."""
    if session_id not in active_sessions:
        active_sessions[session_id] = {}
        session_data[session_id] = {
            'created_at': datetime.now(),
            'status': 'created',
            'data': None,
            'tools_used': []
        }
    
    if tool_type not in active_sessions[session_id]:
        if tool_type == 'regression':
            active_sessions[session_id][tool_type] = RegressionWorkflow()
        elif tool_type == 'eda':
            active_sessions[session_id][tool_type] = EDAWorkflow()
        elif tool_type == 'classification':
            active_sessions[session_id][tool_type] = ClassificationWorkflow()
        elif tool_type == 'clustering':
            active_sessions[session_id][tool_type] = ClusteringWorkflow()
        elif tool_type == 'nlp':
            active_sessions[session_id][tool_type] = NLPWorkflow()
        else:
            raise ValueError(f"Unknown tool type: {tool_type}")
        
        # Track which tools have been used
        if tool_type not in session_data[session_id]['tools_used']:
            session_data[session_id]['tools_used'].append(tool_type)
    
    return active_sessions[session_id][tool_type]

def save_uploaded_file(upload_file: UploadFile) -> str:
    """Save uploaded file temporarily and return path."""
    temp_dir = Path(tempfile.gettempdir()) / "regression_uploads"
    temp_dir.mkdir(exist_ok=True)
    
    file_path = temp_dir / f"{uuid.uuid4()}_{upload_file.filename}"
    
    with open(file_path, "wb") as buffer:
        content = upload_file.file.read()
        buffer.write(content)
    
    return str(file_path)

def load_data_file(file_path: str) -> pd.DataFrame:
    """Load data file into pandas DataFrame."""
    file_extension = Path(file_path).suffix.lower()
    
    if file_extension == '.csv':
        return pd.read_csv(file_path)
    elif file_extension in ['.xlsx', '.xls']:
        return pd.read_excel(file_path)
    elif file_extension == '.json':
        return pd.read_json(file_path)
    else:
        raise ValueError(f"Unsupported file format: {file_extension}")

def cleanup_temp_file(file_path: str):
    """Clean up temporary file."""
    try:
        if os.path.exists(file_path):
            os.remove(file_path)
    except Exception as e:
        logger.warning(f"Failed to cleanup temp file {file_path}: {e}")

# API Endpoints

@app.get("/")
async def root():
    """Health check endpoint."""
    try:
        return {
            "message": "EvolvIQ ML Tools API",
            "status": "running",
            "version": "2.0.0",
            "timestamp": datetime.now().isoformat(),
            "health": "ok",
            "available_tools": ["regression", "eda", "classification", "clustering", "nlp"],
            "endpoints": {
                "regression": "/api/regression/*",
                "eda": "/api/eda/*",
                "classification": "/api/classification/*",
                "clustering": "/api/clustering/*",
                "nlp": "/api/nlp/*"
            }
        }
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        raise HTTPException(status_code=500, detail="Health check failed")

@app.get("/health")
async def health_check():
    """Alternative health check endpoint."""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/api/regression/session", response_model=SessionResponse)
async def create_session(request: SessionCreateRequest):
    """Create a new regression analysis session."""
    try:
        session_id = f"regression_{uuid.uuid4().hex[:12]}"
        
        # Initialize workflow
        workflow = get_session_workflow(session_id, 'regression')
        
        # Update session data
        session_data[session_id].update({
            'name': request.name,
            'description': request.description,
            'status': 'created'
        })
        
        return SessionResponse(
            session_id=session_id,
            name=request.name,
            description=request.description,
            status='created',
            created_at=session_data[session_id]['created_at']
        )
        
    except Exception as e:
        logger.error(f"Failed to create session: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/regression/validate-data")
async def validate_data(
    file: UploadFile = File(...),
    session_id: str = Query(...)
):
    """Validate uploaded data file."""
    temp_file_path = None
    
    try:
        # Validate file type
        if not file.filename.endswith(('.csv', '.xlsx', '.xls', '.json')):
            raise HTTPException(
                status_code=400, 
                detail="Unsupported file format. Please upload CSV, Excel, or JSON files."
            )
        
        # Save uploaded file temporarily
        temp_file_path = save_uploaded_file(file)
        
        # Load data
        data = load_data_file(temp_file_path)
        
        # Get workflow and validate
        workflow = get_session_workflow(session_id, 'regression')
        
        # For validation, we need a target column - let's use the last numeric column as default
        numeric_columns = data.select_dtypes(include=[np.number]).columns.tolist()
        if not numeric_columns:
            raise HTTPException(
                status_code=400,
                detail="No numeric columns found in the dataset"
            )
        
        target_column = numeric_columns[-1]  # Use last numeric column as default target
        validation_result = workflow.validate_data(data, target_column)
        
        # Store data in session
        session_data[session_id]['data'] = data
        session_data[session_id]['status'] = 'data_uploaded'
        session_data[session_id]['target_column'] = target_column
        session_data[session_id]['columns'] = data.columns.tolist()
        session_data[session_id]['numeric_columns'] = numeric_columns
        
        return {
            "is_valid": validation_result['validation']['is_valid'],
            "errors": validation_result['validation']['errors'],
            "warnings": validation_result['validation']['warnings'],
            "recommendations": validation_result['validation']['recommendations'],
            "summary": validation_result['summary'],
            "suggested_target": target_column,
            "available_columns": data.columns.tolist(),
            "numeric_columns": numeric_columns
        }
        
    except Exception as e:
        logger.error(f"Data validation failed: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    
    finally:
        if temp_file_path:
            cleanup_temp_file(temp_file_path)

@app.post("/api/regression/preprocess")
async def preprocess_data(request: PreprocessingRequest, session_id: str = Query(...)):
    """Preprocess the uploaded data."""
    try:
        # Get workflow and session data
        workflow = get_session_workflow(session_id, 'regression')
        
        if session_id not in session_data or session_data[session_id]['data'] is None:
            raise HTTPException(status_code=400, detail="No data found for session")
        
        data = session_data[session_id]['data']
        
        # Update workflow config
        workflow.config.handle_missing = request.config.handle_missing
        workflow.config.encode_categorical = request.config.encode_categorical
        workflow.config.scale_features = request.config.scale_features
        
        # Preprocess data
        result = workflow.preprocess_data(data, request.target_column)
        
        if result['success']:
            # Store preprocessed data
            session_data[session_id]['preprocessed_data'] = pd.DataFrame(result['processed_data'])
            session_data[session_id]['target_column'] = request.target_column
            session_data[session_id]['feature_columns'] = result['feature_columns']
            session_data[session_id]['status'] = 'data_preprocessed'
            
            return {
                "success": True,
                "feature_columns": result['feature_columns'],
                "preprocessing_steps": result['preprocessing_steps'],
                "final_shape": result['final_shape'],
                "target_column": request.target_column
            }
        else:
            raise HTTPException(status_code=400, detail=result['error'])
        
    except Exception as e:
        logger.error(f"Preprocessing failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/regression/train")
async def train_models(request: TrainingRequest, session_id: str = Query(...), background_tasks: BackgroundTasks = None):
    """Train regression models."""
    try:
        # Get workflow and session data
        workflow = get_session_workflow(session_id, 'regression')
        
        if session_id not in session_data or 'preprocessed_data' not in session_data[session_id]:
            raise HTTPException(status_code=400, detail="No preprocessed data found for session")
        
        data = session_data[session_id]['preprocessed_data']
        target_column = request.target_column
        
        # Update workflow config
        workflow.config.test_size = request.config.test_size
        workflow.config.models_to_include = request.config.models_to_include
        workflow.config.hyperparameter_tuning = request.config.hyperparameter_tuning
        workflow.config.cv_folds = request.config.cv_folds
        
        # Train models
        result = workflow.train_models(data, target_column)
        
        if result['success']:
            # Update session status
            session_data[session_id]['status'] = 'models_trained'
            session_data[session_id]['training_results'] = result
            
            return {
                "success": True,
                "model_results": result['model_results'],
                "comparison_data": result['comparison_data'],
                "best_model": result['best_model'],
                "feature_importance": result['feature_importance'],
                "training_summary": result['training_summary']
            }
        else:
            raise HTTPException(status_code=400, detail=result['error'])
        
    except Exception as e:
        logger.error(f"Training failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/regression/training-status/{session_id}")
async def get_training_status(session_id: str):
    """Get training status for a session."""
    try:
        if session_id not in session_data:
            raise HTTPException(status_code=404, detail="Session not found")
        
        status = session_data[session_id]['status']
        
        return {
            "session_id": session_id,
            "status": status,
            "is_training": status == 'training',
            "is_complete": status == 'models_trained',
            "updated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Failed to get training status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.options("/api/regression/results/{session_id}")
async def options_results(session_id: str):
    """Handle OPTIONS request for results endpoint."""
    return {"message": "OK"}

@app.get("/api/regression/results/{session_id}")
async def get_results(session_id: str):
    """Get training results and visualizations."""
    try:
        logger.info(f"Getting results for session: {session_id}")
        
        # Get workflow
        workflow = get_session_workflow(session_id, 'regression')
        
        if session_id not in session_data or session_data[session_id]['status'] != 'models_trained':
            raise HTTPException(status_code=400, detail="No trained models found for session")
        
        # Skip visualization generation for now to fix CORS issue
        # viz_result = workflow.get_visualizations()
        
        training_results = session_data[session_id]['training_results']
        
        return {
            "success": True,
            "model_results": training_results['model_results'],
            "comparison_data": training_results['comparison_data'],
            "best_model": training_results['best_model'],
            "feature_importance": training_results['feature_importance'],
            "visualizations": {},  # Empty for now
            "training_summary": training_results['training_summary']
        }
        
    except Exception as e:
        logger.error(f"Failed to get results: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/regression/predict")
async def make_prediction(request: PredictionRequest, session_id: str = Query(...)):
    """Make a prediction with the trained model."""
    try:
        # Get workflow
        workflow = get_session_workflow(session_id, 'regression')
        
        if session_id not in session_data or session_data[session_id]['status'] != 'models_trained':
            raise HTTPException(status_code=400, detail="No trained models found for session")
        
        # Make prediction
        result = workflow.make_prediction(request.data)
        
        if result['success']:
            return result
        else:
            raise HTTPException(status_code=400, detail=result['error'])
        
    except Exception as e:
        logger.error(f"Prediction failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/regression/export/{session_id}")
async def export_model(session_id: str):
    """Export the trained model."""
    try:
        # Get workflow
        workflow = get_session_workflow(session_id, 'regression')
        
        if session_id not in session_data or session_data[session_id]['status'] != 'models_trained':
            raise HTTPException(status_code=400, detail="No trained models found for session")
        
        # Export model
        result = workflow.export_model()
        
        if result['success']:
            # Create temporary file for download
            temp_dir = Path(tempfile.gettempdir()) / "model_exports"
            temp_dir.mkdir(exist_ok=True)
            
            export_path = temp_dir / result['filename']
            
            # Decode and save model
            import base64
            model_bytes = base64.b64decode(result['model_data'])
            with open(export_path, 'wb') as f:
                f.write(model_bytes)
            
            return FileResponse(
                path=export_path,
                filename=result['filename'],
                media_type='application/octet-stream'
            )
        else:
            raise HTTPException(status_code=400, detail=result['error'])
        
    except Exception as e:
        logger.error(f"Model export failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/regression/sessions")
async def list_sessions():
    """List all active sessions."""
    try:
        sessions = []
        for session_id, data in session_data.items():
            sessions.append({
                "session_id": session_id,
                "name": data.get('name', 'Untitled Session'),
                "status": data.get('status', 'unknown'),
                "created_at": data.get('created_at', datetime.now()).isoformat(),
                "has_data": data.get('data') is not None,
                "is_trained": data.get('status') == 'models_trained'
            })
        
        return {"sessions": sessions}
        
    except Exception as e:
        logger.error(f"Failed to list sessions: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/regression/session/{session_id}")
async def delete_session(session_id: str):
    """Delete a session and clean up resources."""
    try:
        if session_id in active_sessions:
            del active_sessions[session_id]
        
        if session_id in session_data:
            del session_data[session_id]
        
        return {"message": f"Session {session_id} deleted successfully"}
        
    except Exception as e:
        logger.error(f"Failed to delete session: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# =============================================================================
# EDA ENDPOINTS
# =============================================================================

@app.post("/api/eda/validate-data")
async def validate_eda_data(
    file: UploadFile = File(...),
    session_id: str = Query(...)
):
    """Validate uploaded data file for EDA analysis."""
    temp_file_path = None
    
    try:
        # Save uploaded file temporarily
        temp_file_path = save_uploaded_file(file)
        
        # Load data
        data = load_data_file(temp_file_path)
        
        # Get workflow and validate
        workflow = get_session_workflow(session_id, 'eda')
        validation_result = workflow.validate_data(data)
        
        # Store data in session
        session_data[session_id]['data'] = data
        session_data[session_id]['status'] = 'data_uploaded'
        session_data[session_id]['columns'] = data.columns.tolist()
        
        return validation_result
        
    except Exception as e:
        logger.error(f"EDA data validation failed: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    
    finally:
        if temp_file_path:
            cleanup_temp_file(temp_file_path)

@app.post("/api/eda/quality-assessment")
async def perform_quality_assessment(session_id: str = Query(...)):
    """Perform data quality assessment."""
    try:
        workflow = get_session_workflow(session_id, 'eda')
        
        if session_id not in session_data or session_data[session_id]['data'] is None:
            raise HTTPException(status_code=400, detail="No data found for session")
        
        data = session_data[session_id]['data']
        result = workflow.perform_quality_assessment(data)
        
        return result
        
    except Exception as e:
        logger.error(f"Quality assessment failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/eda/univariate-analysis")
async def perform_univariate_analysis(session_id: str = Query(...)):
    """Perform univariate analysis."""
    try:
        workflow = get_session_workflow(session_id, 'eda')
        
        if session_id not in session_data or session_data[session_id]['data'] is None:
            raise HTTPException(status_code=400, detail="No data found for session")
        
        data = session_data[session_id]['data']
        result = workflow.perform_univariate_analysis(data)
        
        return result
        
    except Exception as e:
        logger.error(f"Univariate analysis failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/eda/bivariate-analysis")
async def perform_bivariate_analysis(session_id: str = Query(...)):
    """Perform bivariate analysis."""
    try:
        workflow = get_session_workflow(session_id, 'eda')
        
        if session_id not in session_data or session_data[session_id]['data'] is None:
            raise HTTPException(status_code=400, detail="No data found for session")
        
        data = session_data[session_id]['data']
        result = workflow.perform_bivariate_analysis(data)
        
        return result
        
    except Exception as e:
        logger.error(f"Bivariate analysis failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/eda/clean-data")
async def clean_eda_data(session_id: str = Query(...)):
    """Clean the dataset."""
    try:
        workflow = get_session_workflow(session_id, 'eda')
        
        if session_id not in session_data or session_data[session_id]['data'] is None:
            raise HTTPException(status_code=400, detail="No data found for session")
        
        data = session_data[session_id]['data']
        result = workflow.clean_data(data)
        
        if result['success']:
            # Store cleaned data
            session_data[session_id]['cleaned_data'] = pd.DataFrame(result['cleaned_data'])
            session_data[session_id]['status'] = 'data_cleaned'
        
        return result
        
    except Exception as e:
        logger.error(f"Data cleaning failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# =============================================================================
# CLASSIFICATION ENDPOINTS
# =============================================================================

@app.post("/api/classification/validate-data")
async def validate_classification_data(
    file: UploadFile = File(...),
    session_id: str = Query(...),
    target_column: str = Query(...)
):
    """Validate uploaded data file for classification analysis."""
    temp_file_path = None
    
    try:
        # Save uploaded file temporarily
        temp_file_path = save_uploaded_file(file)
        
        # Load data
        data = load_data_file(temp_file_path)
        
        # Get workflow and validate
        workflow = get_session_workflow(session_id, 'classification')
        validation_result = workflow.validate_data(data, target_column)
        
        # Store data in session
        session_data[session_id]['data'] = data
        session_data[session_id]['status'] = 'data_uploaded'
        session_data[session_id]['target_column'] = target_column
        session_data[session_id]['columns'] = data.columns.tolist()
        
        return validation_result
        
    except Exception as e:
        logger.error(f"Classification data validation failed: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    
    finally:
        if temp_file_path:
            cleanup_temp_file(temp_file_path)

class ClassificationPreprocessingRequest(BaseModel):
    target_column: str

@app.post("/api/classification/preprocess")
async def preprocess_classification_data(
    request: ClassificationPreprocessingRequest, 
    session_id: str = Query(...)
):
    """Preprocess the uploaded data for classification."""
    try:
        workflow = get_session_workflow(session_id, 'classification')
        
        if session_id not in session_data or session_data[session_id]['data'] is None:
            raise HTTPException(status_code=400, detail="No data found for session")
        
        data = session_data[session_id]['data']
        result = workflow.preprocess_data(data, request.target_column)
        
        if result['success']:
            # Store preprocessed data
            session_data[session_id]['preprocessed_data'] = pd.DataFrame(result['processed_data'])
            session_data[session_id]['target_column'] = request.target_column
            session_data[session_id]['feature_columns'] = result['feature_columns']
            session_data[session_id]['status'] = 'data_preprocessed'
        
        return result
        
    except Exception as e:
        logger.error(f"Classification preprocessing failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

class ClassificationTrainingRequest(BaseModel):
    target_column: str
    models_to_include: Optional[List[str]] = None

@app.post("/api/classification/train")
async def train_classification_models(
    request: ClassificationTrainingRequest, 
    session_id: str = Query(...)
):
    """Train classification models."""
    try:
        workflow = get_session_workflow(session_id, 'classification')
        
        if session_id not in session_data or 'preprocessed_data' not in session_data[session_id]:
            raise HTTPException(status_code=400, detail="No preprocessed data found for session")
        
        data = session_data[session_id]['preprocessed_data']
        
        # Update config if models specified
        if request.models_to_include:
            workflow.config.models_to_include = request.models_to_include
        
        result = workflow.train_models(data, request.target_column)
        
        if result['success']:
            session_data[session_id]['status'] = 'models_trained'
            session_data[session_id]['training_results'] = result
        
        return result
        
    except Exception as e:
        logger.error(f"Classification training failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/classification/results/{session_id}")
async def get_classification_results(session_id: str):
    """Get classification training results."""
    try:
        if session_id not in session_data or session_data[session_id]['status'] != 'models_trained':
            raise HTTPException(status_code=400, detail="No trained models found for session")
        
        training_results = session_data[session_id]['training_results']
        
        return {
            "success": True,
            "model_results": training_results['model_results'],
            "comparison_data": training_results['comparison_data'],
            "best_model": training_results['best_model'],
            "feature_importance": training_results['feature_importance'],
            "confusion_matrix": training_results['confusion_matrix'],
            "training_summary": training_results['training_summary']
        }
        
    except Exception as e:
        logger.error(f"Failed to get classification results: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# =============================================================================
# CLUSTERING ENDPOINTS
# =============================================================================

@app.post("/api/clustering/validate-data")
async def validate_clustering_data(
    file: UploadFile = File(...),
    session_id: str = Query(...)
):
    """Validate uploaded data file for clustering analysis."""
    temp_file_path = None
    
    try:
        # Save uploaded file temporarily
        temp_file_path = save_uploaded_file(file)
        
        # Load data
        data = load_data_file(temp_file_path)
        
        # Get workflow and validate
        workflow = get_session_workflow(session_id, 'clustering')
        validation_result = workflow.validate_data(data)
        
        # Store data in session
        session_data[session_id]['data'] = data
        session_data[session_id]['status'] = 'data_uploaded'
        session_data[session_id]['columns'] = data.columns.tolist()
        
        return validation_result
        
    except Exception as e:
        logger.error(f"Clustering data validation failed: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    
    finally:
        if temp_file_path:
            cleanup_temp_file(temp_file_path)

@app.post("/api/clustering/preprocess")
async def preprocess_clustering_data(session_id: str = Query(...)):
    """Preprocess the uploaded data for clustering."""
    try:
        workflow = get_session_workflow(session_id, 'clustering')
        
        if session_id not in session_data or session_data[session_id]['data'] is None:
            raise HTTPException(status_code=400, detail="No data found for session")
        
        data = session_data[session_id]['data']
        result = workflow.preprocess_data(data)
        
        if result['success']:
            session_data[session_id]['status'] = 'data_preprocessed'
        
        return result
        
    except Exception as e:
        logger.error(f"Clustering preprocessing failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/clustering/find-optimal-clusters")
async def find_optimal_clusters(session_id: str = Query(...)):
    """Find optimal number of clusters."""
    try:
        workflow = get_session_workflow(session_id, 'clustering')
        result = workflow.find_optimal_clusters()
        
        return result
        
    except Exception as e:
        logger.error(f"Finding optimal clusters failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

class ClusteringRequest(BaseModel):
    n_clusters: Optional[int] = None
    algorithms_to_include: Optional[List[str]] = None

@app.post("/api/clustering/perform-clustering")
async def perform_clustering_analysis(
    request: ClusteringRequest, 
    session_id: str = Query(...)
):
    """Perform clustering analysis."""
    try:
        workflow = get_session_workflow(session_id, 'clustering')
        
        # Update config if algorithms specified
        if request.algorithms_to_include:
            workflow.config.algorithms_to_include = request.algorithms_to_include
        
        result = workflow.perform_clustering(request.n_clusters)
        
        if result['success']:
            session_data[session_id]['status'] = 'clustering_complete'
            session_data[session_id]['clustering_results'] = result
        
        return result
        
    except Exception as e:
        logger.error(f"Clustering analysis failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/clustering/insights/{session_id}")
async def get_clustering_insights(session_id: str):
    """Get clustering insights."""
    try:
        workflow = get_session_workflow(session_id, 'clustering')
        result = workflow.get_cluster_insights()
        
        return result
        
    except Exception as e:
        logger.error(f"Failed to get clustering insights: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# =============================================================================
# NLP ENDPOINTS
# =============================================================================

@app.post("/api/nlp/validate-data")
async def validate_nlp_data(
    file: UploadFile = File(...),
    session_id: str = Query(...),
    text_column: str = Query(...)
):
    """Validate uploaded data file for NLP analysis."""
    temp_file_path = None
    
    try:
        # Save uploaded file temporarily
        temp_file_path = save_uploaded_file(file)
        
        # Load data
        data = load_data_file(temp_file_path)
        
        # Get workflow and validate
        workflow = get_session_workflow(session_id, 'nlp')
        validation_result = workflow.validate_data(data, text_column)
        
        # Store data in session
        session_data[session_id]['data'] = data
        session_data[session_id]['status'] = 'data_uploaded'
        session_data[session_id]['text_column'] = text_column
        session_data[session_id]['columns'] = data.columns.tolist()
        
        return validation_result
        
    except Exception as e:
        logger.error(f"NLP data validation failed: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    
    finally:
        if temp_file_path:
            cleanup_temp_file(temp_file_path)

class NLPAnalysisRequest(BaseModel):
    text_column: str
    sentiment_analysis: bool = True
    topic_modeling: bool = True
    named_entity_recognition: bool = True
    n_topics: int = 5

@app.post("/api/nlp/analyze")
async def perform_nlp_analysis(
    request: NLPAnalysisRequest, 
    session_id: str = Query(...)
):
    """Perform comprehensive NLP analysis."""
    try:
        workflow = get_session_workflow(session_id, 'nlp')
        
        if session_id not in session_data or session_data[session_id]['data'] is None:
            raise HTTPException(status_code=400, detail="No data found for session")
        
        data = session_data[session_id]['data']
        
        # Update config based on request
        workflow.config.sentiment_analysis = request.sentiment_analysis
        workflow.config.topic_modeling = request.topic_modeling
        workflow.config.named_entity_recognition = request.named_entity_recognition
        workflow.config.n_topics = request.n_topics
        
        # Extract text documents
        text_documents = data[request.text_column].dropna().astype(str).tolist()
        
        result = workflow.analyze_text(text_documents)
        
        if result['success']:
            session_data[session_id]['status'] = 'analysis_complete'
            session_data[session_id]['nlp_results'] = result
        
        return result
        
    except Exception as e:
        logger.error(f"NLP analysis failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/nlp/insights/{session_id}")
async def get_nlp_insights(session_id: str):
    """Get NLP analysis insights."""
    try:
        workflow = get_session_workflow(session_id, 'nlp')
        result = workflow.generate_insights()
        
        return result
        
    except Exception as e:
        logger.error(f"Failed to get NLP insights: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Error handlers
@app.exception_handler(404)
async def not_found_handler(request, exc):
    return {"error": "Endpoint not found", "status_code": 404}

@app.exception_handler(500)
async def internal_error_handler(request, exc):
    return {"error": "Internal server error", "status_code": 500}

@app.on_event("startup")
async def startup_event():
    """Log startup information."""
    logger.info("🚀 EvolvIQ ML Tools API starting up...")
    logger.info(f"📊 Active sessions storage initialized")
    logger.info(f"🤖 Available tools: Regression, EDA, Classification, Clustering, NLP")
    logger.info(f"🔧 Environment: {os.getenv('RAILWAY_ENVIRONMENT', 'local')}")
    logger.info(f"🌐 Port: {os.getenv('PORT', '8000')}")

if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.getenv("PORT", 8000))
    logger.info(f"🚀 Starting server on port {port}")
    uvicorn.run(app, host="0.0.0.0", port=port)