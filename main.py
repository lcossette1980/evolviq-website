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
cors_origins_env = os.getenv("CORS_ALLOWED_ORIGINS", "*")
if cors_origins_env == "*":
    cors_origins = ["*"]
else:
    cors_origins = cors_origins_env.split(",")
    # Always allow localhost for development
    if "http://localhost:3000" not in cors_origins:
        cors_origins.append("http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,  # Use environment variable or default to all origins
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
        
        # Return structure similar to regression endpoint
        return {
            "validation": validation_result,
            "summary": {
                "shape": data.shape,
                "columns": data.columns.tolist(),
                "dtypes": data.dtypes.astype(str).to_dict(),
                "missing_values": data.isnull().sum().to_dict(),
                "memory_usage": f"{data.memory_usage(deep=True).sum() / 1024 / 1024:.1f} MB"
            }
        }
        
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
        
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_details = f"Univariate analysis failed: {str(e) or 'Unknown error'}\nTraceback: {traceback.format_exc()}"
        logger.error(error_details)
        raise HTTPException(status_code=500, detail=str(e) or f"Unknown error: {type(e).__name__}")


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
        
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        error_details = f"Bivariate analysis failed: {str(e) or 'Unknown error'}\nTraceback: {traceback.format_exc()}"
        logger.error(error_details)
        raise HTTPException(status_code=500, detail=str(e) or f"Unknown error: {type(e).__name__}")


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
        
        # Return structure similar to regression endpoint
        return {
            "validation": validation_result,
            "summary": {
                "shape": data.shape,
                "columns": data.columns.tolist(),
                "dtypes": data.dtypes.astype(str).to_dict(),
                "missing_values": data.isnull().sum().to_dict(),
                "memory_usage": f"{data.memory_usage(deep=True).sum() / 1024 / 1024:.1f} MB"
            }
        }
        
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
        
        # Return structure similar to regression endpoint
        return {
            "validation": validation_result,
            "summary": {
                "shape": data.shape,
                "columns": data.columns.tolist(),
                "dtypes": data.dtypes.astype(str).to_dict(),
                "missing_values": data.isnull().sum().to_dict(),
                "memory_usage": f"{data.memory_usage(deep=True).sum() / 1024 / 1024:.1f} MB",
                "text_column": text_column
            }
        }
        
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

# ============================================================================
# ASSESSMENT ENDPOINTS
# ============================================================================

# Initialize OpenAI client
try:
    openai_api_key = os.getenv("OPENAI_API_KEY")
    if openai_api_key:
        from openai import OpenAI
        openai_client = OpenAI(api_key=openai_api_key)
        logger.info("✅ OpenAI API key configured")
    else:
        logger.warning("⚠️ OPENAI_API_KEY not found - assessment features will be limited")
        openai_client = None
except Exception as e:
    logger.error(f"❌ OpenAI initialization failed: {e}")
    openai_client = None

# Assessment data models
class AssessmentStartRequest(BaseModel):
    user_id: Optional[str] = None
    assessment_type: str = Field(..., description="Type of assessment (ai_knowledge_navigator, change_readiness)")

class AssessmentResponse(BaseModel):
    question: str
    options: Optional[List[str]] = None
    question_id: str
    progress: Dict[str, Any]

class AssessmentAnswerRequest(BaseModel):
    user_id: Optional[str] = None
    assessment_type: str
    question_id: str
    answer: Any
    session_data: Optional[Dict] = None

# Assessment session storage
assessment_sessions: Dict[str, Dict] = {}

def generate_ai_question(assessment_type: str, question_history: List[Dict], user_profile: Dict = None) -> Dict:
    """Generate next question using OpenAI based on assessment history."""
    if not openai_client:
        # Fallback to sample questions if OpenAI not available
        logger.warning(f"OpenAI client not available - using fallback question for {assessment_type}")
        return get_fallback_question(assessment_type, len(question_history))
    
    try:
        logger.info(f"Generating AI question #{len(question_history) + 1} for {assessment_type}")
        
        # Build conversation history
        conversation_context = build_assessment_context(assessment_type, question_history, user_profile)
        logger.info(f"Context length: {len(conversation_context)} chars")
        
        response = openai_client.chat.completions.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": get_assessment_system_prompt(assessment_type)
                },
                {
                    "role": "user", 
                    "content": conversation_context
                }
            ],
            temperature=0.7,
            max_tokens=500
        )
        
        # Parse the AI response
        ai_response = response.choices[0].message.content
        logger.info(f"OpenAI response received: {ai_response[:100]}...")
        
        parsed_question = parse_ai_question_response(ai_response, assessment_type, len(question_history))
        logger.info(f"Generated question: {parsed_question.get('question', 'No question')[:50]}...")
        return parsed_question
        
    except Exception as e:
        logger.error(f"OpenAI question generation failed: {e}")
        logger.error(f"Falling back to sample question for {assessment_type}")
        return get_fallback_question(assessment_type, len(question_history))

def get_assessment_system_prompt(assessment_type: str) -> str:
    """Get the system prompt for the specific assessment type."""
    if assessment_type == "ai_knowledge":
        return """You are an AI Knowledge Assessment expert. Your role is to evaluate a user's understanding of artificial intelligence concepts and their readiness to implement AI in their business.

Generate the next assessment question based on the conversation history. Consider:
1. The user's previous answers to gauge their knowledge level
2. Areas that need deeper exploration
3. Practical business applications vs theoretical knowledge
4. Progressive difficulty based on demonstrated competence

Response format (JSON):
{
    "question": "Your specific question here",
    "options": ["Option 1", "Option 2", "Option 3", "Option 4", "Option 5"],
    "category": "Category name (e.g. AI Fundamentals, Business Application, Ethics, Implementation)",
    "difficulty": "beginner|intermediate|advanced",
    "rationale": "Why this question is important for assessment"
}

Keep questions practical, business-focused, and progressively adaptive to the user's demonstrated knowledge level."""

    elif assessment_type == "change_readiness":
        return """You are an Organizational Change Readiness expert. Your role is to evaluate how prepared an organization is to successfully implement AI and other transformative changes.

Generate the next assessment question based on the conversation history. Consider:
1. Organizational culture and leadership style
2. Change management processes and history
3. Resource allocation and support systems
4. Communication patterns and stakeholder engagement
5. Previous change successes and failures

Response format (JSON):
{
    "question": "Your specific question here",
    "options": ["Option 1", "Option 2", "Option 3", "Option 4", "Option 5"],
    "category": "Category name (e.g. Leadership, Culture, Resources, Communication, Process)",
    "difficulty": "basic|intermediate|complex",
    "rationale": "Why this question reveals change readiness"
}

Focus on practical organizational dynamics, leadership effectiveness, and change management capabilities."""

    return "You are an assessment expert. Generate appropriate questions for evaluation."

def build_assessment_context(assessment_type: str, question_history: List[Dict], user_profile: Dict = None) -> str:
    """Build context for OpenAI based on assessment history."""
    context = f"Assessment Type: {assessment_type}\n"
    context += f"Questions Completed: {len(question_history)}\n\n"
    
    if user_profile:
        context += f"User Profile: {json.dumps(user_profile, indent=2)}\n\n"
    
    context += "Previous Questions and Answers:\n"
    for i, item in enumerate(question_history, 1):
        context += f"{i}. Q: {item['question']}\n"
        context += f"   A: {item['answer']}\n"
        if 'category' in item:
            context += f"   Category: {item['category']}\n"
        context += "\n"
    
    # Add adaptive instructions based on progress
    total_questions = 20 if assessment_type == "ai_knowledge" else 15
    progress = len(question_history) / total_questions
    
    if progress < 0.3:
        context += "INSTRUCTION: Generate a foundational question to establish baseline knowledge/readiness.\n"
    elif progress < 0.6:
        context += "INSTRUCTION: Generate an intermediate question that builds on previous answers to explore specific areas.\n"
    elif progress < 0.8:
        context += "INSTRUCTION: Generate an advanced question that tests deeper understanding/readiness in identified areas.\n"
    else:
        context += "INSTRUCTION: Generate a final assessment question that captures remaining knowledge gaps or readiness factors.\n"
    
    context += f"\nGenerate the next question (#{len(question_history) + 1} of {total_questions}) as JSON."
    
    return context

def parse_ai_question_response(ai_response: str, assessment_type: str, question_number: int) -> Dict:
    """Parse OpenAI response into structured question format."""
    try:
        # Try to parse as JSON
        parsed_json = json.loads(ai_response)
        
        total_questions = 20 if assessment_type == "ai_knowledge" else 15
        
        return {
            "question": parsed_json.get("question", ""),
            "options": parsed_json.get("options", []),
            "question_id": f"{assessment_type}_{question_number}_{uuid.uuid4().hex[:8]}",
            "category": parsed_json.get("category", "General"),
            "difficulty": parsed_json.get("difficulty", "intermediate"),
            "rationale": parsed_json.get("rationale", ""),
            "progress": {
                "current_question": question_number + 1,
                "total_questions": total_questions,
                "category": parsed_json.get("category", "General"),
                "percentage": int(((question_number + 1) / total_questions) * 100)
            }
        }
    except json.JSONDecodeError:
        # If JSON parsing fails, try to extract question from text
        lines = ai_response.strip().split('\n')
        question = next((line for line in lines if '?' in line), "Could you provide more information about your experience?")
        
        return get_fallback_question(assessment_type, question_number, custom_question=question)

def get_fallback_question(assessment_type: str, question_number: int, custom_question: str = None) -> Dict:
    """Provide fallback questions when AI generation fails."""
    total_questions = 20 if assessment_type == "ai_knowledge" else 15
    
    if assessment_type == "ai_knowledge":
        fallback_questions = [
            {
                "question": custom_question or "How familiar are you with machine learning concepts?",
                "options": [
                    "Not familiar at all",
                    "Basic understanding",
                    "Moderate understanding", 
                    "Good understanding",
                    "Expert level"
                ],
                "category": "AI Fundamentals"
            },
            {
                "question": custom_question or "What AI applications are most relevant to your business?",
                "options": [
                    "Customer service automation",
                    "Data analysis and insights",
                    "Process optimization",
                    "Content creation",
                    "Predictive analytics"
                ],
                "category": "Business Application"
            }
        ]
    else:  # change_readiness
        fallback_questions = [
            {
                "question": custom_question or "How does your organization typically handle change?",
                "options": [
                    "Resist change strongly",
                    "Cautious but adaptable",
                    "Neutral approach",
                    "Embrace change readily",
                    "Lead change actively"
                ],
                "category": "Change Culture"
            }
        ]
    
    fallback = fallback_questions[question_number % len(fallback_questions)]
    
    return {
        "question": fallback["question"],
        "options": fallback["options"],
        "question_id": f"{assessment_type}_{question_number}_{uuid.uuid4().hex[:8]}",
        "category": fallback["category"],
        "progress": {
            "current_question": question_number + 1,
            "total_questions": total_questions,
            "category": fallback["category"],
            "percentage": int(((question_number + 1) / total_questions) * 100)
        }
    }

@app.post("/api/ai-knowledge/start")
async def start_ai_knowledge_assessment(request: AssessmentStartRequest):
    """Start AI Knowledge Assessment with AI-generated questions."""
    try:
        logger.info(f"Starting AI Knowledge Assessment for user: {request.user_id}")
        
        # Create session ID
        session_id = f"ai_knowledge_{request.user_id or 'anonymous'}_{uuid.uuid4().hex[:8]}"
        
        # Initialize session
        assessment_sessions[session_id] = {
            "assessment_type": "ai_knowledge",
            "user_id": request.user_id,
            "question_history": [],
            "started_at": datetime.now().isoformat(),
            "current_question_number": 0
        }
        
        # Generate first question using AI
        first_question = generate_ai_question("ai_knowledge", [])
        first_question["session_id"] = session_id
        
        logger.info(f"Generated first AI Knowledge question for session {session_id}")
        return first_question
        
    except Exception as e:
        logger.error(f"Failed to start AI Knowledge assessment: {e}")
        raise HTTPException(status_code=500, detail=f"Assessment initialization failed: {str(e)}")

@app.post("/api/ai-knowledge/respond")
async def respond_ai_knowledge_assessment(request: AssessmentAnswerRequest):
    """Process AI Knowledge Assessment response and get next AI-generated question."""
    try:
        logger.info(f"Processing AI Knowledge response for question: {request.question_id}")
        
        # Extract session ID from request or try to find session
        session_id = None
        if request.session_data and "session_id" in request.session_data:
            session_id = request.session_data["session_id"]
        else:
            # Find session by user_id and assessment type
            for sid, session in assessment_sessions.items():
                if (session["user_id"] == request.user_id and 
                    session["assessment_type"] == "ai_knowledge"):
                    session_id = sid
                    break
        
        if not session_id or session_id not in assessment_sessions:
            raise HTTPException(status_code=404, detail="Assessment session not found")
        
        session = assessment_sessions[session_id]
        
        # Store the previous question and answer
        question_data = {
            "question_id": request.question_id,
            "question": request.session_data.get("current_question", "") if request.session_data else "",
            "answer": request.answer,
            "answered_at": datetime.now().isoformat()
        }
        session["question_history"].append(question_data)
        
        logger.info(f"Stored question history for session {session_id}: {len(session['question_history'])} questions")
        logger.info(f"Latest answer: {request.answer} for question: {question_data['question'][:50] if question_data['question'] else 'No question text'}...")
        
        # Check if assessment is complete (20 questions for AI Knowledge)
        if len(session["question_history"]) >= 20:
            logger.info(f"AI Knowledge assessment completed for session {session_id}")
            return {
                "completed": True,
                "total_questions": len(session["question_history"]),
                "session_id": session_id,
                "message": "Assessment completed! Thank you for your responses."
            }
        
        # Generate next question using AI based on conversation history
        next_question = generate_ai_question("ai_knowledge", session["question_history"])
        next_question["session_id"] = session_id
        
        session["current_question_number"] = len(session["question_history"])
        
        logger.info(f"Generated next AI Knowledge question #{len(session['question_history']) + 1} for session {session_id}")
        return next_question
        
    except Exception as e:
        logger.error(f"Failed to process AI Knowledge response: {e}")
        raise HTTPException(status_code=500, detail=f"Response processing failed: {str(e)}")

@app.post("/api/change-readiness/start")
async def start_change_readiness_assessment(request: AssessmentStartRequest):
    """Start Change Readiness Assessment with AI-generated questions."""
    try:
        logger.info(f"Starting Change Readiness Assessment for user: {request.user_id}")
        
        # Create session ID
        session_id = f"change_readiness_{request.user_id or 'anonymous'}_{uuid.uuid4().hex[:8]}"
        
        # Initialize session
        assessment_sessions[session_id] = {
            "assessment_type": "change_readiness",
            "user_id": request.user_id,
            "question_history": [],
            "started_at": datetime.now().isoformat(),
            "current_question_number": 0
        }
        
        # Generate first question using AI
        first_question = generate_ai_question("change_readiness", [])
        first_question["session_id"] = session_id
        
        logger.info(f"Generated first Change Readiness question for session {session_id}")
        return first_question
        
    except Exception as e:
        logger.error(f"Failed to start Change Readiness assessment: {e}")
        raise HTTPException(status_code=500, detail=f"Assessment initialization failed: {str(e)}")

@app.post("/api/change-readiness/respond")
async def respond_change_readiness_assessment(request: AssessmentAnswerRequest):
    """Process Change Readiness Assessment response and get next AI-generated question."""
    try:
        logger.info(f"Processing Change Readiness response for question: {request.question_id}")
        
        # Extract session ID from request or try to find session
        session_id = None
        if request.session_data and "session_id" in request.session_data:
            session_id = request.session_data["session_id"]
        else:
            # Find session by user_id and assessment type
            for sid, session in assessment_sessions.items():
                if (session["user_id"] == request.user_id and 
                    session["assessment_type"] == "change_readiness"):
                    session_id = sid
                    break
        
        if not session_id or session_id not in assessment_sessions:
            raise HTTPException(status_code=404, detail="Assessment session not found")
        
        session = assessment_sessions[session_id]
        
        # Store the previous question and answer
        session["question_history"].append({
            "question_id": request.question_id,
            "question": request.session_data.get("current_question", "") if request.session_data else "",
            "answer": request.answer,
            "answered_at": datetime.now().isoformat()
        })
        
        # Check if assessment is complete (15 questions for Change Readiness)
        if len(session["question_history"]) >= 15:
            logger.info(f"Change Readiness assessment completed for session {session_id}")
            return {
                "completed": True,
                "total_questions": len(session["question_history"]),
                "session_id": session_id,
                "message": "Assessment completed! Thank you for your responses."
            }
        
        # Generate next question using AI based on conversation history
        next_question = generate_ai_question("change_readiness", session["question_history"])
        next_question["session_id"] = session_id
        
        session["current_question_number"] = len(session["question_history"])
        
        logger.info(f"Generated next Change Readiness question #{len(session['question_history']) + 1} for session {session_id}")
        return next_question
        
    except Exception as e:
        logger.error(f"Failed to process Change Readiness response: {e}")
        raise HTTPException(status_code=500, detail=f"Response processing failed: {str(e)}")

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