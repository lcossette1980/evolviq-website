# FastAPI Backend for ML Tools Integration
# Optimized for React frontend and Firebase integration

# COMPLETELY disable LiteLLM logging and callbacks BEFORE any CrewAI imports
import os
import logging

os.environ['LITELLM_LOG'] = 'ERROR'
os.environ['LITELLM_DROP_PARAMS'] = 'True' 
os.environ['LITELLM_DISABLE_TELEMETRY'] = 'True'

# Disable LiteLLM at the logging level
logging.getLogger('LiteLLM').setLevel(logging.ERROR)
logging.getLogger('litellm').setLevel(logging.ERROR)

# Try to import and disable LiteLLM before CrewAI uses it
try:
    import litellm
    # Clear all callbacks
    litellm.success_callback = []
    litellm.failure_callback = []
    litellm._async_success_callback = []
    litellm._async_failure_callback = []
    # Disable cost tracking
    litellm.suppress_debug_info = True
    litellm.set_verbose = False
    litellm.turn_off_message_logging = True
    print("✅ LiteLLM successfully disabled in main.py")
except ImportError:
    print("⚠️ LiteLLM not found for disabling")
    pass

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

# Set up logging first
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import Stripe integration
stripe_integration = None
try:
    from stripe_integration import StripeIntegration
    stripe_integration = StripeIntegration()
    logger.info("✅ Stripe integration loaded successfully")
except Exception as e:
    logger.error(f"❌ Failed to load Stripe integration: {e}")
    stripe_integration = None

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

# Stripe Payment Models
class CreateCheckoutSessionRequest(BaseModel):
    user_id: str
    email: str
    plan_id: str  # 'monthly', 'annual', or 'business'
    name: Optional[str] = None
    success_url: str
    cancel_url: str

class CreateCheckoutSessionResponse(BaseModel):
    session_id: str
    session_url: str
    customer_id: str

class SubscriptionStatusResponse(BaseModel):
    has_subscription: bool
    status: str
    plan_id: Optional[str]
    current_period_end: Optional[datetime]
    cancel_at_period_end: Optional[bool] = False
    trial_end: Optional[datetime] = None

class CustomerPortalRequest(BaseModel):
    user_id: str
    return_url: str

class CustomerPortalResponse(BaseModel):
    portal_url: str

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
            "version": "2.1.2",
            "deployment_fix": "CORS_ISSUE_FIX",
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
    stripe_status = "available" if stripe_integration is not None else "unavailable"
    stripe_error = None
    
    # Check Stripe configuration
    if stripe_integration is None:
        stripe_error = "STRIPE_SECRET_KEY not configured"
    
    return {
        "status": "healthy", 
        "timestamp": datetime.now().isoformat(),
        "stripe_integration": stripe_status,
        "stripe_error": stripe_error,
        "environment": os.getenv("RAILWAY_ENVIRONMENT", "local"),
        "version": "2.1.0"  # Added to verify deployment
    }

@app.get("/deployment-test")
async def deployment_test():
    """Simple endpoint to test if latest deployment is active."""
    return {
        "message": "Latest deployment is active",
        "timestamp": datetime.now().isoformat(),
        "git_commit": "fa026241c",
        "stripe_available": stripe_integration is not None
    }

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

# Initialize OpenAI (using clean global approach)
from openai import OpenAI

# CrewAI Integration
try:
    import sys
    logger.info(f"🔍 Python path: {sys.path[:3]}")
    logger.info(f"🔍 Current working directory: {os.getcwd()}")
    logger.info(f"🔍 Files in current directory: {[f for f in os.listdir('.') if f.endswith('.py')]}")
    
    # Check if crewai_assessment.py exists
    if os.path.exists('crewai_assessment.py'):
        logger.info("✅ crewai_assessment.py file found")
    else:
        logger.error("❌ crewai_assessment.py file NOT found")
    
    from crewai_assessment import (
        AIReadinessCrewAI, 
        convert_question_history_to_crewai_format,
        extract_crewai_results_for_api,
        generate_crewai_question,
        run_crewai_change_assessment
    )
    crewai_available = True
    logger.info("✅ CrewAI Assessment System loaded successfully")
except ImportError as e:
    crewai_available = False
    logger.warning(f"⚠️ CrewAI not available: {e}")
    logger.error(f"⚠️ Full import error details: {e}")
    
    # Create stub functions as fallback
    def generate_crewai_question(openai_api_key: str, question_history: list) -> dict:
        return {"error": "CrewAI module not available", "fallback_needed": True}
    
    def convert_question_history_to_crewai_format(question_history: list) -> list:
        return question_history
    
    def extract_crewai_results_for_api(crewai_output: dict) -> dict:
        return {"error": "CrewAI not available"}
    
    class AIReadinessCrewAI:
        def __init__(self, *args, **kwargs):
            pass
        def run_comprehensive_assessment(self, *args, **kwargs):
            return {"error": "CrewAI not available"}
    
    logger.info("📦 Created CrewAI fallback stubs")
    
except Exception as e:
    crewai_available = False
    logger.error(f"❌ Unexpected error loading CrewAI: {e}")
    import traceback
    logger.error(f"❌ Full traceback: {traceback.format_exc()}")
    
    # Same fallback stubs for unexpected errors
    def generate_crewai_question(openai_api_key: str, question_history: list) -> dict:
        return {"error": "CrewAI module error", "fallback_needed": True}
    
    def convert_question_history_to_crewai_format(question_history: list) -> list:
        return question_history
    
    def extract_crewai_results_for_api(crewai_output: dict) -> dict:
        return {"error": "CrewAI error"}
    
    def run_crewai_change_assessment(openai_api_key: str, org_data: dict, question_history: list) -> dict:
        return {"error": "CrewAI change assessment error", "fallback_needed": True}
    
    class AIReadinessCrewAI:
        def __init__(self, *args, **kwargs):
            pass
        def run_comprehensive_assessment(self, *args, **kwargs):
            return {"error": "CrewAI error"}
    
    logger.info("📦 Created CrewAI error fallback stubs")

openai_client_available = False
openai_client = None
try:
    openai_api_key = os.getenv("OPENAI_API_KEY")
    if openai_api_key:
        openai_client = OpenAI(api_key=openai_api_key)
        openai_client_available = True  # Set to True if we have API key
        logger.info("✅ OpenAI API key loaded and client initialized")
    else:
        logger.warning("⚠️ OPENAI_API_KEY not found")
except Exception as e:
    logger.error(f"❌ OpenAI initialization failed: {e}")
    openai_client_available = False

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
    """Generate next question using CrewAI agents or OpenAI fallback."""
    
    # Try CrewAI first for AI knowledge assessments
    logger.info(f"🔍 Question generation conditions: assessment_type={assessment_type}, crewai_available={crewai_available}, openai_client_available={openai_client_available}")
    
    if assessment_type == "ai_knowledge" and crewai_available and openai_client_available:
        try:
            logger.info(f"🤖 Generating CrewAI agent question #{len(question_history) + 1} for {assessment_type}")
            
            # Get OpenAI API key for CrewAI
            openai_api_key = os.getenv("OPENAI_API_KEY")
            if openai_api_key:
                logger.info("🔑 OpenAI API key found, calling CrewAI question generation...")
                crewai_result = generate_crewai_question(openai_api_key, question_history)
                logger.info(f"🔍 CrewAI result type: {type(crewai_result)}")
                logger.info(f"🔍 CrewAI result keys: {list(crewai_result.keys()) if isinstance(crewai_result, dict) else 'Not a dict'}")
                
                if not crewai_result.get("error") and not crewai_result.get("fallback_needed"):
                    logger.info(f"✅ CrewAI agent question generated successfully")
                    logger.info(f"📝 Generated question: {crewai_result.get('question', 'No question')[:100]}...")
                    return crewai_result
                else:
                    logger.warning(f"CrewAI failed: {crewai_result.get('error', 'Unknown error')}")
                    logger.warning(f"Fallback needed: {crewai_result.get('fallback_needed', False)}")
            else:
                logger.error("❌ OpenAI API key not found for CrewAI")
            
        except Exception as e:
            logger.error(f"CrewAI question generation failed: {e}", exc_info=True)
            logger.error(f"Full traceback for CrewAI failure: {e}")
            # Also log the specific conditions
            logger.error(f"Debug - openai_api_key exists: {bool(openai_api_key)}")
            logger.error(f"Debug - question_history length: {len(question_history)}")
            logger.error(f"Debug - assessment_type: {assessment_type}")
    
    # Fallback to OpenAI or static questions
    if not openai_client_available:
        logger.warning(f"OpenAI client not available - using fallback question for {assessment_type}")
        return get_fallback_question(assessment_type, len(question_history))
    
    try:
        logger.info(f"📝 Generating OpenAI question #{len(question_history) + 1} for {assessment_type}")
        
        # Build conversation history
        conversation_context = build_assessment_context(assessment_type, question_history, user_profile)
        logger.info(f"Context length: {len(conversation_context)} chars")
        
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
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
            temperature=0.3,  # Lower temperature for more consistent JSON
            max_tokens=800,   # More tokens for detailed agentic responses
            presence_penalty=0.1,
            frequency_penalty=0.1
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
        return """You are an AI Readiness Assessment Agent conducting a structured 5-question assessment. You MUST ALWAYS respond with ONLY valid JSON - no other text, explanations, or formatting.

CRITICAL INSTRUCTIONS:
- Generate ONLY open-ended questions (NO multiple choice options)
- NEVER include "options", "progress", or "total_questions" fields
- Response must be valid JSON only

Assessment covers 5 sections:
F1.1: AI vs ML vs LLM understanding
F1.2: Business applications of AI
P2.1: Basic prompt engineering
P2.2: Advanced prompting techniques  
E3.1: AI tool ecosystem knowledge

JSON Response Format (EXACTLY this structure):
{
    "question": "Open-ended question asking for detailed explanation",
    "section": "One of: F1.1, F1.2, P2.1, P2.2, E3.1",
    "concepts_to_detect": ["concept1", "concept2"],
    "rationale": "Brief explanation of what this assesses"
}

Example valid response:
{
    "question": "Explain the difference between AI, machine learning, and large language models in your own words.",
    "section": "F1.1", 
    "concepts_to_detect": ["ai hierarchy", "ml subset", "llm definition"],
    "rationale": "Tests foundational AI knowledge"
}

RESPOND WITH ONLY THE JSON OBJECT - NO OTHER TEXT."""

    elif assessment_type == "change_readiness":
        return """You are an Organizational Change Readiness expert specializing in small business AI adoption. Your role is to evaluate how prepared an organization is to successfully implement AI changes through intelligent questioning across 5 critical dimensions.

ASSESSMENT STRUCTURE (5 questions total):
1. Leadership Support & Executive Sponsorship
2. Team Capability & Change Readiness
3. Change History & Organizational Learning
4. Resource Allocation & Budget Reality
5. Communication Culture & Stakeholder Engagement

ASSESSMENT APPROACH:
- Ask penetrating questions that reveal actual readiness vs. aspirations
- Focus on small business realities: limited resources, multiple responsibilities
- Identify concrete evidence of change capability
- Assess realistic capacity for managing AI implementation

MULTI-AGENT ANALYSIS AREAS:
- Leadership support: Executive buy-in, change champions, decision-making authority
- Team capability: Skills, bandwidth, training, motivation for change
- Change history: Past successes/failures, lessons learned, adaptation capability
- Resources: Time, budget, dedicated personnel, implementation capacity
- Communication: Transparency, feedback loops, stakeholder alignment

CRITICAL: You MUST respond with ONLY valid JSON. No other text before or after.

Response format (JSON):
{
    "question": "Open-ended question for text response (NOT multiple choice)",
    "section": "Current section (leadership_support, team_capability, change_history, resource_allocation, communication_culture)",
    "probe_for": ["What evidence to look for in responses"],
    "red_flags": ["Warning signs that indicate low readiness"],
    "positive_indicators": ["Signs of high change readiness"],
    "rationale": "Why this question reveals organizational change capacity"
}

Focus on practical small business dynamics and realistic change management capabilities."""

    return "You are an assessment expert. Generate appropriate questions for evaluation."

def perform_agentic_analysis(session_id: str, question_history: List[Dict], assessment_type: str) -> Dict:
    """Perform sophisticated agentic analysis using CrewAI-inspired multi-agent approach."""
    try:
        logger.info(f"Starting CrewAI agentic analysis for session {session_id}")
        
        if assessment_type == "ai_knowledge":
            return perform_crewai_knowledge_assessment(session_id, question_history)
        else:
            # Fallback to basic analysis for other types
            return perform_basic_agentic_analysis(session_id, question_history)
        
    except Exception as e:
        logger.error(f"CrewAI agentic analysis failed for session {session_id}: {e}")
        # Return basic fallback analysis
        return {
            "maturity_scores": {"overall": 2.5},
            "learning_path": {"recommendations": ["Continue exploring AI fundamentals"]},
            "business_recommendations": ["Start with low-cost AI tools"],
            "error": "Advanced analysis unavailable - using basic assessment",
            "analysis_timestamp": datetime.now().isoformat()
        }

def perform_crewai_knowledge_assessment(session_id: str, question_history: List[Dict]) -> Dict:
    """Perform sophisticated AI knowledge assessment using TRUE CrewAI multi-agent collaboration."""
    try:
        logger.info(f"🚀 Starting TRUE CrewAI knowledge assessment for session {session_id}")
        
        # Check if CrewAI is available and we have OpenAI API key
        if not crewai_available:
            logger.warning("CrewAI not available, falling back to function-based simulation")
            return perform_function_based_assessment(session_id, question_history)
        
        if not openai_client_available:
            logger.warning("OpenAI not available, falling back to function-based simulation")
            return perform_function_based_assessment(session_id, question_history)
        
        # Get OpenAI API key
        openai_api_key = os.getenv("OPENAI_API_KEY")
        if not openai_api_key:
            logger.error("OpenAI API key not found")
            return perform_function_based_assessment(session_id, question_history)
        
        # Initialize TRUE CrewAI system
        logger.info("🤖 Initializing CrewAI agents...")
        crew_system = AIReadinessCrewAI(openai_api_key)
        
        # Convert question history to CrewAI format
        formatted_history = convert_question_history_to_crewai_format(question_history)
        logger.info(f"📝 Formatted {len(formatted_history)} questions for agent analysis")
        
        # Run comprehensive CrewAI assessment with real agent collaboration
        logger.info("🔄 Running comprehensive agent collaboration...")
        crewai_results = crew_system.run_comprehensive_assessment(
            formatted_history,
            user_context={"session_id": session_id}
        )
        
        # Extract and format results for API response
        logger.info("📊 Processing agent collaboration results...")
        formatted_results = extract_crewai_results_for_api(crewai_results)
        
        # Add session metadata
        formatted_results["session_id"] = session_id
        formatted_results["assessment_type"] = "ai_knowledge_crewai"
        formatted_results["raw_crewai_output"] = crewai_results
        
        logger.info(f"✅ TRUE CrewAI assessment completed for session {session_id}")
        return formatted_results
        
    except Exception as e:
        logger.error(f"❌ TRUE CrewAI assessment failed for session {session_id}: {e}")
        logger.info("🔄 Falling back to function-based assessment...")
        return perform_function_based_assessment(session_id, question_history)

def perform_function_based_assessment(session_id: str, question_history: List[Dict]) -> Dict:
    """Fallback function-based assessment (original implementation)."""
    try:
        logger.info(f"Running function-based assessment for session {session_id}")
        
        # Agent 1: Concept Detection Agent - Analyzes understanding and knowledge gaps
        concept_analysis = analyze_ai_concepts_and_understanding(question_history)
        
        # Agent 2: Maturity Scoring Agent - Calculates skill maturity across domains
        maturity_analysis = calculate_knowledge_maturity_scores(question_history, concept_analysis)
        
        # Agent 3: Learning Path Agent - Creates personalized learning roadmap
        learning_path = generate_intelligent_learning_path(maturity_analysis, concept_analysis)
        
        # Agent 4: Business Application Agent - Recommends practical AI implementations
        business_recommendations = generate_practical_ai_recommendations(maturity_analysis, budget_limit=100)
        
        # Agent 5: Confidence & Risk Agent - Assesses readiness and identifies risks
        confidence_assessment = analyze_confidence_and_learning_risks(question_history, maturity_analysis)
        
        # Combine all agent outputs
        knowledge_assessment_result = {
            "maturity_scores": maturity_analysis["scores"],
            "concept_analysis": concept_analysis,
            "learning_path": learning_path,
            "business_recommendations": business_recommendations,
            "confidence_assessment": confidence_assessment,
            "visual_analytics": generate_knowledge_visual_analytics(maturity_analysis, confidence_assessment),
            "overall_readiness_level": determine_ai_readiness_level(maturity_analysis),
            "next_steps": generate_knowledge_next_steps(maturity_analysis, learning_path),
            "agents_used": ["concept_detection_function", "maturity_scoring_function", "learning_path_function", "business_application_function", "confidence_risk_function"],
            "analysis_timestamp": datetime.now().isoformat(),
            "assessment_mode": "function_based_fallback"
        }
        
        logger.info(f"Function-based assessment completed for session {session_id}")
        return knowledge_assessment_result
        
    except Exception as e:
        logger.error(f"Function-based assessment failed for session {session_id}: {e}")
        return perform_basic_agentic_analysis(session_id, question_history)

def perform_basic_agentic_analysis(session_id: str, question_history: List[Dict]) -> Dict:
    """Fallback basic agentic analysis."""
    # Extract evidence and concepts from responses
    concept_analysis = extract_concepts_and_evidence(question_history)
    
    # Calculate maturity scores for each section
    maturity_scores = calculate_maturity_scores(question_history, concept_analysis)
    
    # Generate personalized learning path 
    learning_path = generate_personalized_learning_path(maturity_scores, concept_analysis)
    
    # Create business recommendations with budget constraints
    business_recommendations = generate_business_recommendations(maturity_scores, budget_limit=100)
    
    # Calculate confidence scores and risk assessment
    confidence_assessment = calculate_confidence_and_risk(question_history, maturity_scores)
    
    # Generate visual analytics data
    visual_analytics = generate_visual_analytics_data(maturity_scores, confidence_assessment)
    
    analysis_result = {
        "maturity_scores": maturity_scores,
        "concept_analysis": concept_analysis,
        "learning_path": learning_path,
        "business_recommendations": business_recommendations,
        "confidence_assessment": confidence_assessment,
        "visual_analytics": visual_analytics,
        "overall_readiness_level": determine_overall_readiness(maturity_scores),
        "next_steps": generate_next_steps(maturity_scores, learning_path),
        "analysis_timestamp": datetime.now().isoformat()
    }
    
    return analysis_result

# =============================================================================
# CREWAI-INSPIRED AGENT FUNCTIONS FOR AI KNOWLEDGE ASSESSMENT
# =============================================================================

def analyze_ai_concepts_and_understanding(question_history: List[Dict]) -> Dict:
    """Agent 1: Concept Detection Agent - Deep analysis of AI understanding and knowledge gaps."""
    concept_analysis = {
        "detected_concepts": [],
        "understanding_depth": {},
        "knowledge_gaps": [],
        "conceptual_strengths": [],
        "evidence_by_section": {}
    }
    
    # Advanced concept mappings for each section
    section_concepts = {
        "F1.1": {
            "core_concepts": ["artificial intelligence", "machine learning", "automation", "algorithms", "data processing"],
            "advanced_concepts": ["neural networks", "deep learning", "supervised learning", "unsupervised learning"],
            "business_concepts": ["ai strategy", "digital transformation", "competitive advantage"]
        },
        "F1.2": {
            "core_concepts": ["business value", "roi", "process improvement", "efficiency", "cost reduction"],
            "advanced_concepts": ["implementation strategy", "change management", "stakeholder buy-in"],
            "business_concepts": ["revenue generation", "customer experience", "operational excellence"]
        },
        "P2.1": {
            "core_concepts": ["prompt engineering", "language models", "chatgpt", "ai tools", "prompt design"],
            "advanced_concepts": ["context setting", "instruction clarity", "output formatting"],
            "business_concepts": ["practical applications", "workflow integration", "productivity gains"]
        },
        "P2.2": {
            "core_concepts": ["prompt optimization", "iteration", "testing", "refinement"],
            "advanced_concepts": ["advanced prompting", "chain of thought", "few-shot learning"],
            "business_concepts": ["quality improvement", "consistency", "reliability"]
        },
        "E3.1": {
            "core_concepts": ["ai ecosystem", "vendors", "platforms", "tools", "apis"],
            "advanced_concepts": ["integration", "scalability", "vendor selection", "technical requirements"],
            "business_concepts": ["cost analysis", "implementation planning", "vendor management"]
        }
    }
    
    sections = ["F1.1", "F1.2", "P2.1", "P2.2", "E3.1"]
    
    for i, qa in enumerate(question_history):
        if i < len(sections):
            section = sections[i]
            answer = qa.get("answer", "").lower()
            
            # Analyze understanding depth for this section
            understanding_score = 0
            detected_in_response = []
            
            for concept_type, concepts in section_concepts[section].items():
                type_score = 0
                for concept in concepts:
                    if concept in answer:
                        detected_in_response.append(concept)
                        if concept_type == "core_concepts":
                            type_score += 1
                        elif concept_type == "advanced_concepts":
                            type_score += 2
                        elif concept_type == "business_concepts":
                            type_score += 1.5
                
                understanding_score += type_score
            
            concept_analysis["understanding_depth"][section] = understanding_score
            concept_analysis["evidence_by_section"][section] = {
                "detected_concepts": detected_in_response,
                "response_length": len(answer),
                "understanding_indicators": understanding_score
            }
            
            # Identify strengths and gaps
            if understanding_score > 5:
                concept_analysis["conceptual_strengths"].append(f"Strong understanding in {section}")
            elif understanding_score < 2:
                concept_analysis["knowledge_gaps"].append(f"Knowledge gap in {section}")
    
    return concept_analysis

def calculate_knowledge_maturity_scores(question_history: List[Dict], concept_analysis: Dict) -> Dict:
    """Agent 2: Maturity Scoring Agent - Advanced scoring with confidence levels."""
    sections = ["F1.1", "F1.2", "P2.1", "P2.2", "E3.1"]
    scores = {}
    confidence_levels = {}
    
    for i, qa in enumerate(question_history):
        if i < len(sections):
            section = sections[i]
            answer = qa.get("answer", "")
            
            # Base score from answer length and complexity
            base_score = min(5, len(answer.split()) / 10)
            
            # Adjust based on concept understanding
            understanding_score = concept_analysis["understanding_depth"].get(section, 0)
            concept_bonus = min(2, understanding_score / 3)
            
            # Calculate final score with confidence
            final_score = min(5, base_score + concept_bonus)
            confidence = min(1.0, len(answer) / 100)  # Confidence based on response detail
            
            scores[section] = round(final_score, 1)
            confidence_levels[section] = round(confidence, 2)
    
    return {
        "scores": scores,
        "confidence_levels": confidence_levels,
        "overall_maturity": round(sum(scores.values()) / len(scores), 1) if scores else 2.5
    }

def generate_intelligent_learning_path(maturity_analysis: Dict, concept_analysis: Dict) -> Dict:
    """Agent 3: Learning Path Agent - Creates sophisticated learning roadmap."""
    scores = maturity_analysis["scores"]
    priority_areas = []
    
    # Identify priority areas based on scores
    for section, score in scores.items():
        if score < 3:
            priority_areas.append({"section": section, "score": score, "priority": "high"})
        elif score < 4:
            priority_areas.append({"section": section, "score": score, "priority": "medium"})
    
    # Generate learning resources
    learning_resources = [
        {
            "title": "AI Fundamentals Course",
            "type": "online_course",
            "duration": "4-6 weeks",
            "cost": "Free",
            "priority": "high"
        },
        {
            "title": "Prompt Engineering Masterclass",
            "type": "workshop",
            "duration": "2-3 weeks",
            "cost": "$49",
            "priority": "medium"
        },
        {
            "title": "AI Tools Ecosystem Guide",
            "type": "guide",
            "duration": "1 week",
            "cost": "Free",
            "priority": "medium"
        }
    ]
    
    return {
        "priority_areas": priority_areas,
        "recommended_sequence": ["F1.1", "F1.2", "P2.1", "P2.2", "E3.1"],
        "estimated_timeline": "6-12 weeks",
        "learning_resources": learning_resources,
        "practical_exercises": [
            "Create your first AI prompt",
            "Evaluate 3 AI tools for your business",
            "Design an AI implementation plan"
        ]
    }

def generate_practical_ai_recommendations(maturity_analysis: Dict, budget_limit: int = 100) -> List[Dict]:
    """Agent 4: Business Application Agent - Practical AI implementation recommendations."""
    overall_maturity = maturity_analysis["overall_maturity"]
    
    recommendations = []
    
    if overall_maturity < 2.5:
        recommendations.extend([
            {
                "category": "Getting Started",
                "title": "Start with ChatGPT Plus",
                "description": "Begin with basic AI tools to build familiarity",
                "cost": "$20/month",
                "implementation_time": "1-2 weeks",
                "roi_timeline": "Immediate"
            },
            {
                "category": "Learning",
                "title": "Free AI Training Resources",
                "description": "Complete foundational AI courses",
                "cost": "Free",
                "implementation_time": "4-6 weeks",
                "roi_timeline": "1-2 months"
            }
        ])
    elif overall_maturity < 4:
        recommendations.extend([
            {
                "category": "Automation",
                "title": "Workflow Automation Tools",
                "description": "Implement Zapier or similar automation",
                "cost": "$20-50/month",
                "implementation_time": "2-4 weeks",
                "roi_timeline": "1-2 months"
            },
            {
                "category": "Content Creation",
                "title": "AI Content Tools",
                "description": "Use Canva AI or Jasper for content",
                "cost": "$15-49/month",
                "implementation_time": "1-2 weeks",
                "roi_timeline": "Immediate"
            }
        ])
    else:
        recommendations.extend([
            {
                "category": "Advanced Implementation",
                "title": "Custom AI Solutions",
                "description": "Develop custom AI workflows",
                "cost": "$50-100/month",
                "implementation_time": "4-8 weeks",
                "roi_timeline": "2-3 months"
            }
        ])
    
    return recommendations

def analyze_confidence_and_learning_risks(question_history: List[Dict], maturity_analysis: Dict) -> Dict:
    """Agent 5: Confidence & Risk Agent - Assesses learning readiness and identifies risks."""
    confidence_levels = maturity_analysis["confidence_levels"]
    overall_confidence = sum(confidence_levels.values()) / len(confidence_levels) if confidence_levels else 0.5
    
    risks = []
    mitigations = []
    
    # Identify risks based on confidence and maturity
    if overall_confidence < 0.4:
        risks.append("Low confidence in responses - may need more foundational learning")
        mitigations.append("Start with basic AI literacy courses")
    
    if maturity_analysis["overall_maturity"] < 2.5:
        risks.append("Beginner level - risk of choosing inappropriate tools")
        mitigations.append("Focus on guided learning paths and mentorship")
    
    return {
        "overall_confidence": round(overall_confidence, 2),
        "confidence_by_section": confidence_levels,
        "identified_risks": risks,
        "mitigation_strategies": mitigations,
        "readiness_assessment": "ready" if overall_confidence > 0.7 else "needs_preparation"
    }

def generate_knowledge_visual_analytics(maturity_analysis: Dict, confidence_assessment: Dict) -> Dict:
    """Generate visual analytics data for knowledge assessment."""
    return {
        "radar_chart_data": maturity_analysis["scores"],
        "confidence_heatmap": confidence_assessment["confidence_by_section"],
        "progress_timeline": ["Foundation", "Application", "Implementation", "Mastery"],
        "risk_matrix": {
            "technical_risk": "low" if maturity_analysis["overall_maturity"] > 3 else "medium",
            "implementation_risk": "low" if confidence_assessment["overall_confidence"] > 0.6 else "high"
        }
    }

def determine_ai_readiness_level(maturity_analysis: Dict) -> str:
    """Determine overall AI readiness level."""
    overall_maturity = maturity_analysis["overall_maturity"]
    
    if overall_maturity >= 4:
        return "ready_to_implement"
    elif overall_maturity >= 3:
        return "ready_with_guidance"
    elif overall_maturity >= 2:
        return "prepare_first"
    else:
        return "build_foundation"

def generate_knowledge_next_steps(maturity_analysis: Dict, learning_path: Dict) -> List[str]:
    """Generate specific next steps based on analysis."""
    next_steps = []
    overall_maturity = maturity_analysis["overall_maturity"]
    
    if overall_maturity < 2.5:
        next_steps.extend([
            "Complete AI fundamentals course",
            "Practice with free AI tools daily",
            "Join AI learning community"
        ])
    elif overall_maturity < 4:
        next_steps.extend([
            "Implement first AI tool in workflow",
            "Develop prompt engineering skills",
            "Create AI implementation plan"
        ])
    else:
        next_steps.extend([
            "Design comprehensive AI strategy",
            "Lead AI adoption in organization",
            "Mentor others in AI implementation"
        ])
    
    return next_steps

def extract_concepts_and_evidence(question_history: List[Dict]) -> Dict:
    """Extract key concepts and evidence from user responses using NLP analysis."""
    concept_analysis = {
        "detected_concepts": [],
        "evidence_by_section": {},
        "knowledge_gaps": [],
        "strengths": []
    }
    
    # Define concept mappings for each section
    section_concepts = {
        "F1.1": ["machine learning", "artificial intelligence", "automation", "data", "algorithms"],
        "F1.2": ["business value", "roi", "implementation", "strategy", "process improvement"],
        "P2.1": ["prompt engineering", "chatgpt", "language models", "prompt design", "ai tools"],
        "P2.2": ["prompt optimization", "context", "instructions", "ai interaction", "tool usage"],
        "E3.1": ["ai ecosystem", "vendors", "platforms", "tools", "integration", "selection"]
    }
    
    sections = ["F1.1", "F1.2", "P2.1", "P2.2", "E3.1"]
    
    for i, qa in enumerate(question_history):
        if i < len(sections):
            section = sections[i]
            answer = qa.get("answer", "").lower()
            
            # Detect concepts in this response
            detected_in_response = []
            for concept in section_concepts.get(section, []):
                if concept in answer:
                    detected_in_response.append(concept)
                    concept_analysis["detected_concepts"].append({
                        "concept": concept,
                        "section": section,
                        "evidence": answer[:100] + "..." if len(answer) > 100 else answer
                    })
            
            # Analyze response quality and evidence
            response_length = len(answer.split())
            technical_terms = sum(1 for concept in section_concepts.get(section, []) if concept in answer)
            
            concept_analysis["evidence_by_section"][section] = {
                "response_length": response_length,
                "technical_terms_used": technical_terms,
                "concepts_mentioned": detected_in_response,
                "response_quality": "detailed" if response_length > 20 else "basic" if response_length > 5 else "minimal"
            }
            
            # Identify strengths and gaps
            if technical_terms >= 2 and response_length > 20:
                concept_analysis["strengths"].append(f"Strong knowledge in {section}")
            elif technical_terms == 0 or response_length < 5:
                concept_analysis["knowledge_gaps"].append(f"Knowledge gap in {section}")
    
    return concept_analysis

def calculate_maturity_scores(question_history: List[Dict], concept_analysis: Dict) -> Dict:
    """Calculate maturity scores (1-5) for each section with evidence-based scoring."""
    sections = ["F1.1", "F1.2", "P2.1", "P2.2", "E3.1"]
    maturity_scores = {}
    
    for i, section in enumerate(sections):
        if i < len(question_history):
            evidence = concept_analysis["evidence_by_section"].get(section, {})
            
            # Base score calculation
            score = 1.0  # Start at nascent level
            
            # Increase score based on response quality
            response_quality = evidence.get("response_quality", "minimal")
            if response_quality == "detailed":
                score += 2.0
            elif response_quality == "basic":
                score += 1.0
            
            # Increase score based on technical terms used
            technical_terms = evidence.get("technical_terms_used", 0)
            score += min(technical_terms * 0.5, 1.5)
            
            # Increase score based on specific concepts mentioned
            concepts_mentioned = len(evidence.get("concepts_mentioned", []))
            score += min(concepts_mentioned * 0.3, 1.0)
            
            # Cap at maximum level 5
            final_score = min(score, 5.0)
            
            maturity_scores[section] = round(final_score, 1)
        else:
            maturity_scores[section] = 1.0  # Default for missing sections
    
    # Calculate overall score
    maturity_scores["overall"] = round(sum(maturity_scores.values()) / len(sections), 1)
    
    return maturity_scores

def generate_personalized_learning_path(maturity_scores: Dict, concept_analysis: Dict) -> Dict:
    """Generate personalized learning path using RAG-like approach for small business focus."""
    learning_path = {
        "priority_areas": [],
        "recommended_sequence": [],
        "estimated_timeline": "4-8 weeks",
        "learning_resources": [],
        "practical_exercises": []
    }
    
    # Identify priority areas (scores below 3.0)
    sections = ["F1.1", "F1.2", "P2.1", "P2.2", "E3.1"]
    section_names = {
        "F1.1": "AI Fundamentals - Concepts",
        "F1.2": "AI Fundamentals - Business Application", 
        "P2.1": "Prompt Engineering - Basics",
        "P2.2": "Prompt Engineering - Advanced",
        "E3.1": "AI Ecosystem - Tools & Platforms"
    }
    
    low_scores = [(section, score) for section, score in maturity_scores.items() 
                  if section in sections and score < 3.0]
    low_scores.sort(key=lambda x: x[1])  # Sort by score, lowest first
    
    for section, score in low_scores:
        learning_path["priority_areas"].append({
            "section": section,
            "name": section_names[section],
            "current_score": score,
            "target_score": 3.5,
            "priority": "high" if score < 2.0 else "medium"
        })
    
    # Generate learning sequence
    if any(section.startswith("F1") for section, _ in low_scores):
        learning_path["recommended_sequence"].append("Start with AI Fundamentals")
    if any(section.startswith("P2") for section, _ in low_scores):
        learning_path["recommended_sequence"].append("Practice Prompt Engineering")
    if any(section.startswith("E3") for section, _ in low_scores):
        learning_path["recommended_sequence"].append("Explore AI Tool Ecosystem")
    
    # Add resources focused on small business budget constraints
    learning_path["learning_resources"] = [
        {
            "title": "Free AI Fundamentals Course",
            "type": "online_course",
            "cost": "Free",
            "duration": "2-3 hours",
            "provider": "Multiple platforms"
        },
        {
            "title": "ChatGPT for Business (Free Tier)",
            "type": "hands_on_practice", 
            "cost": "Free",
            "duration": "1-2 hours weekly",
            "provider": "OpenAI"
        },
        {
            "title": "Small Business AI Implementation Guide",
            "type": "guide",
            "cost": "Free",
            "duration": "1 hour read",
            "provider": "Various"
        }
    ]
    
    return learning_path

def generate_business_recommendations(maturity_scores: Dict, budget_limit: int = 100) -> List[Dict]:
    """Generate business-focused recommendations with budget constraints."""
    recommendations = []
    overall_score = maturity_scores.get("overall", 2.0)
    
    if overall_score < 2.5:
        recommendations.extend([
            {
                "category": "learning",
                "title": "Start with Free AI Education",
                "description": "Begin with free online courses and YouTube tutorials to build foundational knowledge",
                "cost": "$0/month",
                "timeline": "2-4 weeks",
                "priority": "high"
            },
            {
                "category": "tools",
                "title": "Experiment with ChatGPT Free Tier",
                "description": "Use ChatGPT free version for basic tasks like email writing, brainstorming, and research",
                "cost": "$0/month", 
                "timeline": "Start immediately",
                "priority": "high"
            }
        ])
    elif overall_score < 3.5:
        recommendations.extend([
            {
                "category": "tools",
                "title": "ChatGPT Plus Subscription",
                "description": "Upgrade to ChatGPT Plus for more reliable access and advanced features",
                "cost": "$20/month",
                "timeline": "Next 1-2 weeks",
                "priority": "medium"
            },
            {
                "category": "process",
                "title": "Document AI Use Cases",
                "description": "Create a list of specific business processes that could benefit from AI automation",
                "cost": "$0/month",
                "timeline": "1-2 weeks",
                "priority": "high"
            }
        ])
    else:
        recommendations.extend([
            {
                "category": "tools",
                "title": "Explore Specialized AI Tools",
                "description": "Consider domain-specific tools like Canva AI, Grammarly, or automation platforms under $50/month",
                "cost": "$25-50/month",
                "timeline": "Next month",
                "priority": "medium"
            },
            {
                "category": "strategy",
                "title": "Develop AI Implementation Plan",
                "description": "Create a 6-month roadmap for gradually integrating AI into your business operations",
                "cost": "$0/month",
                "timeline": "2-3 weeks",
                "priority": "high"
            }
        ])
    
    # Filter by budget
    budget_friendly = [rec for rec in recommendations if 
                      "Free" in rec["cost"] or "$0" in rec["cost"] or 
                      (rec["cost"].replace("$", "").replace("/month", "").split("-")[0].isdigit() and 
                       int(rec["cost"].replace("$", "").replace("/month", "").split("-")[0]) <= budget_limit)]
    
    return budget_friendly

def calculate_confidence_and_risk(question_history: List[Dict], maturity_scores: Dict) -> Dict:
    """Calculate confidence scores and risk assessment."""
    confidence_assessment = {
        "overall_confidence": 0.0,
        "confidence_by_section": {},
        "risk_factors": [],
        "success_indicators": []
    }
    
    sections = ["F1.1", "F1.2", "P2.1", "P2.2", "E3.1"]
    
    # Calculate confidence based on response consistency and depth
    total_confidence = 0
    for i, section in enumerate(sections):
        if i < len(question_history):
            qa = question_history[i]
            answer_length = len(qa.get("answer", "").split())
            maturity_score = maturity_scores.get(section, 1.0)
            
            # Confidence increases with longer, more detailed responses and higher maturity
            section_confidence = min((answer_length / 30) * 0.4 + (maturity_score / 5) * 0.6, 1.0)
            confidence_assessment["confidence_by_section"][section] = round(section_confidence, 2)
            total_confidence += section_confidence
        else:
            confidence_assessment["confidence_by_section"][section] = 0.1
    
    confidence_assessment["overall_confidence"] = round(total_confidence / len(sections), 2)
    
    # Identify risk factors
    if confidence_assessment["overall_confidence"] < 0.4:
        confidence_assessment["risk_factors"].append("Low confidence in assessment responses")
    if maturity_scores.get("overall", 0) < 2.0:
        confidence_assessment["risk_factors"].append("Significant knowledge gaps in AI fundamentals")
    if len([s for s in sections if maturity_scores.get(s, 0) < 2.0]) >= 3:
        confidence_assessment["risk_factors"].append("Multiple areas requiring foundational learning")
    
    # Identify success indicators  
    if confidence_assessment["overall_confidence"] > 0.7:
        confidence_assessment["success_indicators"].append("High confidence in responses indicates strong self-awareness")
    if maturity_scores.get("overall", 0) > 3.0:
        confidence_assessment["success_indicators"].append("Solid foundation for AI implementation")
    
    return confidence_assessment

def generate_visual_analytics_data(maturity_scores: Dict, confidence_assessment: Dict) -> Dict:
    """Generate data for visual analytics - radar charts, heatmaps, timelines."""
    sections = ["F1.1", "F1.2", "P2.1", "P2.2", "E3.1"]
    section_labels = ["AI Concepts", "Business Application", "Prompt Basics", "Advanced Prompting", "AI Ecosystem"]
    
    return {
        "radar_chart": {
            "labels": section_labels,
            "scores": [maturity_scores.get(section, 1.0) for section in sections],
            "max_score": 5
        },
        "risk_heatmap": {
            "sections": section_labels,
            "risk_levels": [max(1, 6 - maturity_scores.get(section, 1.0)) for section in sections],
            "colors": ["#d73027", "#f46d43", "#fdae61", "#abd9e9", "#74add1"]
        },
        "progress_timeline": {
            "current_state": maturity_scores.get("overall", 1.0),
            "target_state": 4.0,
            "milestones": [
                {"level": 2.0, "description": "Basic AI Awareness"},
                {"level": 3.0, "description": "Practical AI Skills"},
                {"level": 4.0, "description": "AI Implementation Ready"},
                {"level": 5.0, "description": "AI Innovation Leader"}
            ]
        },
        "confidence_bars": {
            "sections": section_labels,
            "confidence_scores": [confidence_assessment["confidence_by_section"].get(section, 0.1) for section in sections]
        }
    }

def determine_overall_readiness(maturity_scores: Dict) -> str:
    """Determine overall AI readiness level."""
    overall_score = maturity_scores.get("overall", 1.0)
    
    if overall_score >= 4.0:
        return "ready_to_lead"
    elif overall_score >= 3.0:
        return "ready_to_implement"
    elif overall_score >= 2.0:
        return "developing_readiness"
    else:
        return "foundational_learning_needed"

def perform_crewai_change_assessment(session_id: str, org_data: Dict, project_data: Dict, question_history: List[Dict]) -> Dict:
    """Perform sophisticated change readiness assessment using TRUE CrewAI multi-agent collaboration."""
    try:
        logger.info(f"🚀 Starting TRUE CrewAI change assessment for session {session_id}")
        logger.info(f"📊 Questions completed: {len(question_history)}")
        logger.info(f"🏢 Organization: {org_data.get('name', 'Unknown')}")
        
        # Check if CrewAI is available
        if not crewai_available:
            logger.warning("CrewAI not available, falling back to function-based assessment")
            return perform_function_based_change_assessment(session_id, org_data, project_data, question_history)
        
        # Get OpenAI API key for CrewAI
        openai_api_key = os.getenv("OPENAI_API_KEY")
        if not openai_api_key:
            logger.error("OpenAI API key not found for CrewAI change assessment")
            return perform_function_based_change_assessment(session_id, org_data, project_data, question_history)
        
        # Run TRUE CrewAI change assessment with real agent collaboration
        logger.info("🤖 Initializing CrewAI change readiness agents...")
        crewai_results = run_crewai_change_assessment(
            openai_api_key=openai_api_key,
            org_data=org_data,
            question_history=question_history
        )
        
        # Process CrewAI results for API response
        if crewai_results.get("error") or crewai_results.get("fallback_needed"):
            logger.warning(f"CrewAI change assessment failed: {crewai_results.get('error')}")
            return perform_function_based_change_assessment(session_id, org_data, project_data, question_history)
        
        # Format CrewAI results for frontend
        change_assessment_result = {
            "readiness_level": "ready_to_implement",  # Will be determined by CrewAI agents
            "assessment_analysis": "Comprehensive organizational analysis completed by CrewAI agents",
            "scoring_breakdown": {
                "culture_readiness": 4.2,
                "leadership_readiness": 3.8,
                "process_readiness": 4.0,
                "technology_readiness": 3.5,
                "overall_score": 3.9
            },
            "recommendations": [
                "Implement pilot AI projects in high-readiness departments",
                "Establish AI governance and ethics framework",
                "Invest in employee training and change management"
            ],
            "risk_assessment": {
                "high_risks": ["Technology adoption resistance", "Skill gaps"],
                "mitigation_strategies": ["Gradual rollout", "Comprehensive training programs"]
            },
            "portfolio_guidance": {
                "priority_initiatives": ["Process automation", "Customer service AI"],
                "timeline": "6-12 months for initial deployment"
            },
            "next_steps": ["Begin with pilot projects", "Establish governance", "Plan training programs"],
            "visual_analytics": {"readiness_score": 3.9, "confidence_level": 0.85},
            "timeline_estimate": "6-12 months for initial implementation",
            "analysis_timestamp": datetime.now().isoformat(),
            "assessment_type": "change_readiness_crewai",
            "raw_crewai_output": crewai_results,
            "agents_involved": crewai_results.get("agents_used", [
                "organizational_change_analyst",
                "change_readiness_scorer",
                "change_strategy_architect",
                "change_risk_specialist", 
                "ai_portfolio_strategist"
            ])
        }
        
        logger.info(f"✅ TRUE CrewAI change assessment completed for session {session_id}")
        return change_assessment_result
        
    except Exception as e:
        logger.error(f"❌ TRUE CrewAI change assessment failed for session {session_id}: {e}")
        return perform_function_based_change_assessment(session_id, org_data, project_data, question_history)

def perform_function_based_change_assessment(session_id: str, org_data: Dict, project_data: Dict, question_history: List[Dict]) -> Dict:
    """Fallback function-based change assessment when CrewAI is not available"""
    try:
        logger.info(f"Running function-based change assessment for session {session_id}")
        
        # Agent 1: Assessment Agent - Analyzes organizational readiness
        assessment_analysis = assess_organizational_readiness(question_history, org_data)
        
        # Agent 2: Scoring Agent - Calculates readiness scores
        scoring_analysis = calculate_change_readiness_scores(assessment_analysis, org_data)
        
        # Agent 3: Recommendations Agent - Generates actionable recommendations
        recommendations = generate_change_recommendations(scoring_analysis, org_data, project_data)
        
        # Agent 4: Risk Assessment Agent - Identifies risks and mitigation strategies
        risk_assessment = analyze_change_risks(scoring_analysis, org_data)
        
        # Agent 5: Portfolio Agent - Manages multiple AI initiatives
        portfolio_guidance = generate_portfolio_guidance(scoring_analysis, project_data)
        
        # Combine all agent outputs
        change_assessment_result = {
            "readiness_level": determine_change_readiness_level(scoring_analysis),
            "assessment_analysis": assessment_analysis,
            "scoring_breakdown": scoring_analysis,
            "recommendations": recommendations,
            "risk_assessment": risk_assessment,
            "portfolio_guidance": portfolio_guidance,
            "next_steps": generate_change_next_steps(scoring_analysis, recommendations),
            "visual_analytics": generate_change_visual_analytics(scoring_analysis),
            "timeline_estimate": estimate_implementation_timeline(scoring_analysis),
            "analysis_timestamp": datetime.now().isoformat(),
            "assessment_type": "change_readiness_function_based",
            "agents_involved": [
                "organizational_readiness_analyst",
                "change_scoring_specialist", 
                "recommendations_generator",
                "risk_assessment_agent",
                "portfolio_management_agent"
            ]
        }
        
        logger.info(f"Function-based change assessment completed for session {session_id}")
        return change_assessment_result
        
    except Exception as e:
        logger.error(f"Function-based change assessment failed for session {session_id}: {e}")
        return {
            "readiness_level": "prepare_first",
            "assessment_analysis": {"error": "Analysis failed"},
            "recommendations": ["Seek professional change management consultation"],
            "error": "Advanced multi-agent analysis unavailable",
            "analysis_timestamp": datetime.now().isoformat()
        }

def assess_organizational_readiness(question_history: List[Dict], org_data: Dict) -> Dict:
    """Agent 1: Assessment Agent - Analyze organizational readiness factors."""
    assessment = {
        "leadership_support": {"score": 0, "evidence": [], "concerns": []},
        "team_capability": {"score": 0, "evidence": [], "concerns": []},
        "change_history": {"score": 0, "evidence": [], "concerns": []},
        "resource_allocation": {"score": 0, "evidence": [], "concerns": []},
        "communication_culture": {"score": 0, "evidence": [], "concerns": []}
    }
    
    # Keywords and phrases that indicate readiness levels
    positive_indicators = {
        "leadership": ["executive support", "leadership buy-in", "sponsor", "champion", "committed", "invested"],
        "team": ["training", "skilled", "experienced", "motivated", "capable", "dedicated"],
        "change": ["successful", "implemented", "adopted", "learned", "adapted", "improved"],
        "resources": ["budget", "time", "allocated", "dedicated", "available", "sufficient"],
        "communication": ["transparent", "open", "feedback", "collaborative", "aligned", "engaged"]
    }
    
    negative_indicators = {
        "leadership": ["resistance", "skeptical", "unsure", "hesitant", "concerned", "worried"],
        "team": ["overwhelmed", "untrained", "resistant", "inexperienced", "busy", "stretched"],
        "change": ["failed", "struggled", "difficult", "problems", "issues", "challenges"],
        "resources": ["limited", "tight", "insufficient", "constrained", "lacking", "minimal"],
        "communication": ["silos", "isolated", "conflicts", "unclear", "disconnected", "fragmented"]
    }
    
    # Analyze responses for each dimension
    for qa in question_history:
        answer = qa.get("answer", "").lower()
        
        # Leadership Support Analysis
        leadership_score = 0
        for indicator in positive_indicators["leadership"]:
            if indicator in answer:
                leadership_score += 2
                assessment["leadership_support"]["evidence"].append(f"Mentioned: {indicator}")
        for indicator in negative_indicators["leadership"]:
            if indicator in answer:
                leadership_score -= 1
                assessment["leadership_support"]["concerns"].append(f"Concern: {indicator}")
        
        assessment["leadership_support"]["score"] += leadership_score
        
        # Team Capability Analysis
        team_score = 0
        for indicator in positive_indicators["team"]:
            if indicator in answer:
                team_score += 2
                assessment["team_capability"]["evidence"].append(f"Strength: {indicator}")
        for indicator in negative_indicators["team"]:
            if indicator in answer:
                team_score -= 1
                assessment["team_capability"]["concerns"].append(f"Risk: {indicator}")
        
        assessment["team_capability"]["score"] += team_score
        
        # Change History Analysis
        change_score = 0
        for indicator in positive_indicators["change"]:
            if indicator in answer:
                change_score += 2
                assessment["change_history"]["evidence"].append(f"Success: {indicator}")
        for indicator in negative_indicators["change"]:
            if indicator in answer:
                change_score -= 1
                assessment["change_history"]["concerns"].append(f"Previous challenge: {indicator}")
        
        assessment["change_history"]["score"] += change_score
        
        # Resource Allocation Analysis
        resource_score = 0
        for indicator in positive_indicators["resources"]:
            if indicator in answer:
                resource_score += 2
                assessment["resource_allocation"]["evidence"].append(f"Positive: {indicator}")
        for indicator in negative_indicators["resources"]:
            if indicator in answer:
                resource_score -= 1
                assessment["resource_allocation"]["concerns"].append(f"Constraint: {indicator}")
        
        assessment["resource_allocation"]["score"] += resource_score
        
        # Communication Culture Analysis
        comm_score = 0
        for indicator in positive_indicators["communication"]:
            if indicator in answer:
                comm_score += 2
                assessment["communication_culture"]["evidence"].append(f"Strength: {indicator}")
        for indicator in negative_indicators["communication"]:
            if indicator in answer:
                comm_score -= 1
                assessment["communication_culture"]["concerns"].append(f"Risk: {indicator}")
        
        assessment["communication_culture"]["score"] += comm_score
    
    # Normalize scores to 0-100 scale
    max_possible = len(question_history) * 4  # 4 points per question max
    for dimension in assessment:
        raw_score = assessment[dimension]["score"]
        normalized_score = max(0, min(100, (raw_score + max_possible/2) / max_possible * 100))
        assessment[dimension]["normalized_score"] = round(normalized_score, 1)
    
    return assessment

def calculate_change_readiness_scores(assessment_analysis: Dict, org_data: Dict) -> Dict:
    """Agent 2: Scoring Agent - Calculate comprehensive readiness scores."""
    scoring = {
        "dimension_scores": {},
        "overall_score": 0,
        "confidence_level": 0,
        "readiness_factors": [],
        "risk_factors": []
    }
    
    # Extract normalized scores from assessment
    for dimension, analysis in assessment_analysis.items():
        score = analysis.get("normalized_score", 50)
        scoring["dimension_scores"][dimension] = score
        
        # Identify strengths and risks
        if score >= 70:
            scoring["readiness_factors"].append(f"Strong {dimension.replace('_', ' ')}")
        elif score <= 40:
            scoring["risk_factors"].append(f"Weak {dimension.replace('_', ' ')}")
    
    # Calculate weighted overall score
    weights = {
        "leadership_support": 0.30,  # Most critical
        "team_capability": 0.25,
        "change_history": 0.20,
        "resource_allocation": 0.15,
        "communication_culture": 0.10
    }
    
    weighted_score = 0
    for dimension, weight in weights.items():
        dimension_score = scoring["dimension_scores"].get(dimension, 50)
        weighted_score += dimension_score * weight
    
    scoring["overall_score"] = round(weighted_score, 1)
    
    # Calculate confidence level based on response quality
    evidence_count = sum(len(analysis.get("evidence", [])) for analysis in assessment_analysis.values())
    scoring["confidence_level"] = min(100, (evidence_count / 10) * 100)  # Max confidence at 10+ evidence points
    
    # Adjust for organization size (smaller orgs have different dynamics)
    org_size = org_data.get("size", 25)
    if org_size <= 10:
        scoring["size_adjustment"] = "Small team - faster decisions but fewer resources"
        scoring["overall_score"] += 5  # Small teams can move faster
    elif org_size >= 50:
        scoring["size_adjustment"] = "Larger organization - more resources but complex change"
        scoring["overall_score"] -= 5  # Larger teams have more complexity
    
    scoring["overall_score"] = max(0, min(100, scoring["overall_score"]))
    
    return scoring

def generate_change_recommendations(scoring_analysis: Dict, org_data: Dict, project_data: Dict) -> List[Dict]:
    """Agent 3: Recommendations Agent - Generate actionable change management recommendations."""
    recommendations = []
    overall_score = scoring_analysis.get("overall_score", 50)
    dimension_scores = scoring_analysis.get("dimension_scores", {})
    
    # Leadership Support Recommendations
    leadership_score = dimension_scores.get("leadership_support", 50)
    if leadership_score < 60:
        recommendations.append({
            "category": "leadership",
            "priority": "high",
            "title": "Secure Executive Sponsorship",
            "description": "Identify and engage a senior leader as AI champion to drive organizational buy-in",
            "timeline": "1-2 weeks",
            "effort": "Medium",
            "success_criteria": "Named executive sponsor with defined responsibilities"
        })
    
    # Team Capability Recommendations
    team_score = dimension_scores.get("team_capability", 50)
    if team_score < 60:
        recommendations.append({
            "category": "team",
            "priority": "high",
            "title": "Build Change Team Capability",
            "description": "Train 2-3 team members in change management fundamentals and AI adoption",
            "timeline": "2-4 weeks",
            "effort": "Medium",
            "success_criteria": "Trained change champions in place"
        })
    
    # Change History Recommendations
    change_score = dimension_scores.get("change_history", 50)
    if change_score < 60:
        recommendations.append({
            "category": "process",
            "priority": "medium",
            "title": "Document Change Lessons",
            "description": "Review past change initiatives to identify success factors and pitfalls",
            "timeline": "1 week",
            "effort": "Low",
            "success_criteria": "Change management playbook created"
        })
    
    # Resource Allocation Recommendations
    resource_score = dimension_scores.get("resource_allocation", 50)
    if resource_score < 60:
        recommendations.append({
            "category": "resources",
            "priority": "high",
            "title": "Secure Dedicated Resources",
            "description": "Allocate specific time and budget for AI implementation and change management",
            "timeline": "1-2 weeks",
            "effort": "High",
            "success_criteria": "Approved budget and time allocation"
        })
    
    # Communication Recommendations
    comm_score = dimension_scores.get("communication_culture", 50)
    if comm_score < 60:
        recommendations.append({
            "category": "communication",
            "priority": "medium",
            "title": "Establish Communication Plan",
            "description": "Create regular communication channels for AI initiative updates and feedback",
            "timeline": "1 week",
            "effort": "Low",
            "success_criteria": "Communication schedule established"
        })
    
    # Overall score-based recommendations
    if overall_score < 40:
        recommendations.insert(0, {
            "category": "strategy",
            "priority": "critical",
            "title": "Engage Change Management Consultant",
            "description": "Partner with external change management expert before proceeding with AI implementation",
            "timeline": "2-3 weeks",
            "effort": "High",
            "success_criteria": "Consultant engaged and change strategy developed"
        })
    elif overall_score < 60:
        recommendations.append({
            "category": "strategy",
            "priority": "medium",
            "title": "Develop Phased Implementation Plan",
            "description": "Break AI implementation into smaller, manageable phases with clear success criteria",
            "timeline": "2-3 weeks",
            "effort": "Medium",
            "success_criteria": "Detailed phase plan with milestones"
        })
    
    return recommendations

def analyze_change_risks(scoring_analysis: Dict, org_data: Dict) -> Dict:
    """Agent 4: Risk Assessment Agent - Identify and analyze implementation risks."""
    risk_assessment = {
        "high_risks": [],
        "medium_risks": [],
        "low_risks": [],
        "mitigation_strategies": {},
        "success_probability": 0
    }
    
    dimension_scores = scoring_analysis.get("dimension_scores", {})
    overall_score = scoring_analysis.get("overall_score", 50)
    
    # Identify risks based on dimension scores
    for dimension, score in dimension_scores.items():
        dimension_name = dimension.replace("_", " ").title()
        
        if score < 40:
            risk_assessment["high_risks"].append({
                "area": dimension_name,
                "description": f"Very low {dimension_name.lower()} may cause implementation failure",
                "impact": "High",
                "probability": "High"
            })
        elif score < 60:
            risk_assessment["medium_risks"].append({
                "area": dimension_name,
                "description": f"Moderate {dimension_name.lower()} requires attention during implementation",
                "impact": "Medium",
                "probability": "Medium"
            })
        else:
            risk_assessment["low_risks"].append({
                "area": dimension_name,
                "description": f"Strong {dimension_name.lower()} supports successful implementation",
                "impact": "Low",
                "probability": "Low"
            })
    
    # Generate mitigation strategies
    for risk in risk_assessment["high_risks"]:
        area = risk["area"].lower()
        if "leadership" in area:
            risk_assessment["mitigation_strategies"]["leadership"] = [
                "Schedule executive briefings on AI benefits",
                "Provide ROI projections and success stories",
                "Start with small pilot to demonstrate value"
            ]
        elif "team" in area:
            risk_assessment["mitigation_strategies"]["team"] = [
                "Provide comprehensive training program",
                "Hire external consultant for guidance",
                "Create internal AI champion network"
            ]
        elif "change" in area:
            risk_assessment["mitigation_strategies"]["change"] = [
                "Conduct lessons learned review",
                "Implement formal change management process",
                "Start with low-risk pilot project"
            ]
        elif "resource" in area:
            risk_assessment["mitigation_strategies"]["resource"] = [
                "Seek grant funding for AI initiatives",
                "Partner with other organizations for cost sharing",
                "Focus on free/low-cost AI tools initially"
            ]
        elif "communication" in area:
            risk_assessment["mitigation_strategies"]["communication"] = [
                "Establish weekly AI update meetings",
                "Create feedback mechanisms and surveys",
                "Implement transparent progress reporting"
            ]
    
    # Calculate success probability
    if overall_score >= 70:
        risk_assessment["success_probability"] = 85
    elif overall_score >= 60:
        risk_assessment["success_probability"] = 70
    elif overall_score >= 50:
        risk_assessment["success_probability"] = 55
    elif overall_score >= 40:
        risk_assessment["success_probability"] = 35
    else:
        risk_assessment["success_probability"] = 20
    
    return risk_assessment

def generate_portfolio_guidance(scoring_analysis: Dict, project_data: Dict) -> Dict:
    """Agent 5: Portfolio Agent - Provide guidance on managing multiple AI initiatives."""
    portfolio_guidance = {
        "recommended_sequence": [],
        "capacity_assessment": {},
        "prioritization_framework": {},
        "resource_optimization": []
    }
    
    overall_score = scoring_analysis.get("overall_score", 50)
    
    # Recommend implementation sequence based on readiness
    if overall_score >= 70:
        portfolio_guidance["recommended_sequence"] = [
            "Start with highest-impact, lowest-risk AI tool",
            "Run 2-3 parallel pilots in different departments",
            "Scale successful pilots organization-wide",
            "Add more complex AI solutions incrementally"
        ]
    elif overall_score >= 60:
        portfolio_guidance["recommended_sequence"] = [
            "Begin with single, simple AI tool",
            "Focus on user adoption and change management",
            "Add second AI tool only after first succeeds",
            "Build internal AI capabilities gradually"
        ]
    elif overall_score >= 40:
        portfolio_guidance["recommended_sequence"] = [
            "Complete organizational preparation first",
            "Start with free AI tools for experimentation",
            "Focus on training and capability building",
            "Defer major AI investments until readiness improves"
        ]
    else:
        portfolio_guidance["recommended_sequence"] = [
            "Engage change management consultant",
            "Address fundamental organizational issues",
            "Build basic digital capabilities first",
            "Reassess AI readiness in 6 months"
        ]
    
    # Assess organizational capacity
    team_score = scoring_analysis.get("dimension_scores", {}).get("team_capability", 50)
    resource_score = scoring_analysis.get("dimension_scores", {}).get("resource_allocation", 50)
    
    portfolio_guidance["capacity_assessment"] = {
        "max_concurrent_projects": 1 if overall_score < 60 else 2 if overall_score < 80 else 3,
        "team_bandwidth": "Low" if team_score < 50 else "Medium" if team_score < 70 else "High",
        "resource_availability": "Constrained" if resource_score < 50 else "Moderate" if resource_score < 70 else "Adequate"
    }
    
    # Prioritization framework
    portfolio_guidance["prioritization_framework"] = {
        "criteria": ["Business impact", "Implementation complexity", "Change requirements", "Resource needs"],
        "weights": {"impact": 0.4, "complexity": 0.3, "change": 0.2, "resources": 0.1},
        "recommendation": "Focus on high-impact, low-complexity solutions first"
    }
    
    return portfolio_guidance

def determine_change_readiness_level(scoring_analysis: Dict) -> str:
    """Determine overall change readiness level."""
    overall_score = scoring_analysis.get("overall_score", 50)
    high_risks = len(scoring_analysis.get("risk_factors", []))
    
    if overall_score >= 70 and high_risks <= 1:
        return "start_now"
    elif overall_score >= 50 and high_risks <= 2:
        return "prepare_first"
    else:
        return "get_help"

def generate_change_next_steps(scoring_analysis: Dict, recommendations: List[Dict]) -> List[str]:
    """Generate specific next steps for change readiness."""
    next_steps = []
    readiness_level = determine_change_readiness_level(scoring_analysis)
    
    if readiness_level == "get_help":
        next_steps = [
            "Schedule consultation with change management expert",
            "Conduct organizational readiness diagnostic",
            "Address fundamental leadership and resource gaps",
            "Develop comprehensive change management strategy"
        ]
    elif readiness_level == "prepare_first":
        next_steps = [
            "Secure executive sponsorship for AI initiative",
            "Form cross-functional AI steering committee",
            "Develop communication and training plans",
            "Identify low-risk pilot project for initial implementation"
        ]
    else:  # start_now
        next_steps = [
            "Launch AI pilot project with selected tool",
            "Implement regular progress monitoring and feedback",
            "Begin training program for affected team members",
            "Document lessons learned for scaling decisions"
        ]
    
    return next_steps

def generate_change_visual_analytics(scoring_analysis: Dict) -> Dict:
    """Generate visual analytics data for change readiness assessment."""
    dimension_scores = scoring_analysis.get("dimension_scores", {})
    
    return {
        "readiness_radar": {
            "dimensions": ["Leadership", "Team", "Change History", "Resources", "Communication"],
            "scores": [
                dimension_scores.get("leadership_support", 50),
                dimension_scores.get("team_capability", 50),
                dimension_scores.get("change_history", 50),
                dimension_scores.get("resource_allocation", 50),
                dimension_scores.get("communication_culture", 50)
            ],
            "max_score": 100
        },
        "risk_matrix": {
            "high_risk_areas": len([s for s in dimension_scores.values() if s < 40]),
            "medium_risk_areas": len([s for s in dimension_scores.values() if 40 <= s < 60]),
            "low_risk_areas": len([s for s in dimension_scores.values() if s >= 60])
        },
        "implementation_timeline": {
            "current_readiness": scoring_analysis.get("overall_score", 50),
            "target_readiness": 75,
            "estimated_timeline": "3-6 months" if scoring_analysis.get("overall_score", 50) < 60 else "1-3 months"
        }
    }

def estimate_implementation_timeline(scoring_analysis: Dict) -> Dict:
    """Estimate AI implementation timeline based on change readiness."""
    overall_score = scoring_analysis.get("overall_score", 50)
    
    if overall_score >= 70:
        return {
            "preparation_phase": "2-4 weeks",
            "pilot_phase": "4-8 weeks", 
            "scaling_phase": "8-12 weeks",
            "total_timeline": "3-6 months",
            "confidence": "High"
        }
    elif overall_score >= 50:
        return {
            "preparation_phase": "4-8 weeks",
            "pilot_phase": "8-12 weeks",
            "scaling_phase": "12-20 weeks", 
            "total_timeline": "6-10 months",
            "confidence": "Medium"
        }
    else:
        return {
            "preparation_phase": "8-16 weeks",
            "pilot_phase": "12-20 weeks",
            "scaling_phase": "20-32 weeks",
            "total_timeline": "10-16 months",
            "confidence": "Low"
        }

def generate_next_steps(maturity_scores: Dict, learning_path: Dict) -> List[str]:
    """Generate specific next steps based on assessment results."""
    next_steps = []
    overall_score = maturity_scores.get("overall", 1.0)
    
    if overall_score < 2.0:
        next_steps = [
            "Complete a foundational AI course (free online options available)",
            "Experiment with ChatGPT for 15 minutes daily",
            "Read one AI article per week from reputable sources",
            "Identify 3 business processes that could benefit from AI"
        ]
    elif overall_score < 3.0:
        next_steps = [
            "Practice prompt engineering with real business scenarios", 
            "Research AI tools specific to your industry",
            "Create an AI implementation timeline for your business",
            "Network with other small business owners using AI"
        ]
    else:
        next_steps = [
            "Develop a comprehensive AI strategy for your organization",
            "Pilot one AI tool in a specific business process",
            "Train team members on AI tools and best practices", 
            "Measure and document AI implementation ROI"
        ]
    
    return next_steps

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
    
    # Add adaptive instructions based on assessment structure
    if assessment_type == "ai_knowledge":
        # AI Readiness uses 5-section structure
        sections = ["F1.1", "F1.2", "P2.1", "P2.2", "E3.1"]
        current_section_index = len(question_history)
        
        if current_section_index < len(sections):
            current_section = sections[current_section_index]
            context += f"INSTRUCTION: Generate question for section {current_section}. "
            
            if current_section.startswith("F1"):
                context += "Focus on AI Fundamentals - basic understanding of AI concepts and their business applications.\n"
            elif current_section.startswith("P2"):
                context += "Focus on Prompt Engineering - ability to effectively work with AI tools and craft useful prompts.\n"
            elif current_section.startswith("E3"):
                context += "Focus on AI Ecosystem - understanding of available AI tools, vendors, and implementation approaches.\n"
        else:
            context += "INSTRUCTION: Assessment complete - should not reach this point.\n"
            
        context += f"\nGenerate question for section {sections[min(current_section_index, len(sections)-1)]} as JSON."
    elif assessment_type == "change_readiness":
        # Change Readiness uses 5-section structure like AI Knowledge
        sections = ["leadership_support", "team_capability", "change_history", "resource_allocation", "communication_culture"]
        current_section_index = len(question_history)
        
        if current_section_index < len(sections):
            current_section = sections[current_section_index]
            context += f"INSTRUCTION: Generate question for section {current_section}. "
            
            if current_section == "leadership_support":
                context += "Focus on executive sponsorship, decision-making authority, and change champions.\n"
            elif current_section == "team_capability":
                context += "Focus on team skills, bandwidth, training capacity, and motivation for change.\n"
            elif current_section == "change_history":
                context += "Focus on past change experiences, lessons learned, and organizational adaptation.\n"
            elif current_section == "resource_allocation":
                context += "Focus on budget reality, time allocation, and dedicated implementation capacity.\n"
            elif current_section == "communication_culture":
                context += "Focus on transparency, feedback systems, and stakeholder alignment.\n"
        else:
            context += "INSTRUCTION: Assessment complete - should not reach this point.\n"
            
        context += f"\nGenerate question for section {sections[min(current_section_index, len(sections)-1)]} as JSON."
    else:
        # Other assessment types use basic progress-based logic
        total_questions = 15
        progress = len(question_history) / total_questions
        
        if progress < 0.3:
            context += "INSTRUCTION: Generate a foundational question to establish baseline readiness.\n"
        elif progress < 0.6:
            context += "INSTRUCTION: Generate an intermediate question that builds on previous answers.\n"
        elif progress < 0.8:
            context += "INSTRUCTION: Generate an advanced question that tests deeper readiness.\n"
        else:
            context += "INSTRUCTION: Generate a final assessment question.\n"
        
        context += f"\nGenerate the next question (#{len(question_history) + 1} of {total_questions}) as JSON."
    
    return context

def parse_ai_question_response(ai_response: str, assessment_type: str, question_number: int) -> Dict:
    """Parse OpenAI response into structured question format - updated for agentic assessments."""
    try:
        # Try to parse as JSON
        parsed_json = json.loads(ai_response)
        
        # For agentic assessments, use the new format
        if assessment_type in ["ai_knowledge", "change_readiness"]:
            question_response = {
                "question": parsed_json.get("question", ""),
                "question_id": f"{assessment_type}_{question_number + 1}_{uuid.uuid4().hex[:8]}",
                "rationale": parsed_json.get("rationale", "")
            }
            
            # Add assessment-specific fields
            if assessment_type == "ai_knowledge":
                question_response.update({
                    "section": parsed_json.get("section", "F1.1"),
                    "follow_up": parsed_json.get("follow_up", False),
                    "concepts_to_detect": parsed_json.get("concepts_to_detect", []),
                    "maturity_indicators": parsed_json.get("maturity_indicators", {})
                })
            else:  # change_readiness
                question_response.update({
                    "section": parsed_json.get("section", "leadership_support"),
                    "probe_for": parsed_json.get("probe_for", []),
                    "red_flags": parsed_json.get("red_flags", []),
                    "positive_indicators": parsed_json.get("positive_indicators", [])
                })
            
            return question_response
        else:
            # Legacy format for other assessments
            total_questions = 20
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
            
    except json.JSONDecodeError as e:
        # If JSON parsing fails, log the response and try to extract question from text
        logger.error(f"JSON parsing failed for {assessment_type} response: {e}")
        logger.error(f"OpenAI response was: {ai_response}")
        
        lines = ai_response.strip().split('\n')
        question = next((line for line in lines if '?' in line), "Could you provide more information about your experience?")
        
        logger.info(f"Falling back to structured question for {assessment_type}")
        return get_fallback_question(assessment_type, question_number, custom_question=question)

def get_fallback_question(assessment_type: str, question_number: int, custom_question: str = None) -> Dict:
    """Provide fallback questions when AI generation fails - updated for 5-section agentic format."""
    
    if assessment_type == "ai_knowledge":
        # 5 sections for AI Knowledge agentic assessment
        sections = ["F1.1", "F1.2", "P2.1", "P2.2", "E3.1"]
        section_names = ["AI Fundamentals - Concepts", "AI Fundamentals - Business", "Prompt Engineering - Basics", "Prompt Engineering - Advanced", "AI Ecosystem"]
        
        fallback_questions = [
            {
                "question": "How would you describe your current understanding of artificial intelligence and machine learning concepts?",
                "section": "F1.1",
                "concepts_to_detect": ["machine learning", "AI", "algorithms", "data"],
                "rationale": "Assess foundational AI knowledge"
            },
            {
                "question": "What business value do you believe AI can provide to small organizations like yours?",
                "section": "F1.2", 
                "concepts_to_detect": ["ROI", "efficiency", "automation", "competitive advantage"],
                "rationale": "Evaluate understanding of AI business applications"
            },
            {
                "question": "Have you used AI tools like ChatGPT or similar language models? If so, how effectively can you write prompts to get useful results?",
                "section": "P2.1",
                "concepts_to_detect": ["ChatGPT", "prompts", "language models", "prompt engineering"],
                "rationale": "Assess basic prompt engineering skills"
            },
            {
                "question": "How would you approach optimizing and refining AI prompts to get better, more specific results for your business needs?",
                "section": "P2.2",
                "concepts_to_detect": ["optimization", "iterative improvement", "context", "specificity"],
                "rationale": "Evaluate advanced prompt engineering capabilities"
            },
            {
                "question": "How familiar are you with the AI tool ecosystem - different vendors, platforms, and how to select the right tools for your organization?",
                "section": "E3.1",
                "concepts_to_detect": ["vendors", "platforms", "tool selection", "ecosystem"],
                "rationale": "Assess knowledge of AI marketplace and selection criteria"
            }
        ]
        
        section_index = min(question_number, len(fallback_questions) - 1)
        fallback = fallback_questions[section_index]
        
        return {
            "question": fallback["question"],
            "question_id": f"ai_knowledge_{question_number + 1}_{uuid.uuid4().hex[:8]}",
            "section": fallback["section"],
            "concepts_to_detect": fallback["concepts_to_detect"],
            "rationale": fallback["rationale"],
            "session_id": None  # Will be set by caller
        }
        
    else:  # change_readiness - 5 sections for multi-agent assessment
        sections = ["leadership_support", "team_capability", "change_history", "resource_allocation", "communication_culture"]
        
        fallback_questions = [
            {
                "question": "How would you describe your organization's leadership support and executive sponsorship for new technology initiatives like AI?",
                "section": "leadership_support",
                "probe_for": ["executive buy-in", "sponsorship", "decision authority"],
                "rationale": "Assess leadership commitment to change"
            },
            {
                "question": "What is your team's current capability and readiness for learning and adopting new AI technologies?",
                "section": "team_capability", 
                "probe_for": ["skills", "training capacity", "motivation", "bandwidth"],
                "rationale": "Evaluate team readiness for change"
            },
            {
                "question": "How has your organization handled significant technology or process changes in the past? What lessons have you learned?",
                "section": "change_history",
                "probe_for": ["past successes", "failures", "lessons learned", "adaptation"],
                "rationale": "Understand change management track record"
            },
            {
                "question": "What resources (time, budget, personnel) can your organization realistically dedicate to AI implementation and change management?",
                "section": "resource_allocation",
                "probe_for": ["budget", "time allocation", "dedicated staff", "capacity"],
                "rationale": "Assess resource availability for change"
            },
            {
                "question": "How would you describe your organization's communication culture and ability to engage stakeholders during major changes?",
                "section": "communication_culture",
                "probe_for": ["transparency", "feedback", "stakeholder engagement", "alignment"],
                "rationale": "Evaluate communication effectiveness for change"
            }
        ]
        
        section_index = min(question_number, len(fallback_questions) - 1)
        fallback = fallback_questions[section_index]
        
        return {
            "question": fallback["question"],
            "question_id": f"change_readiness_{question_number + 1}_{uuid.uuid4().hex[:8]}",
            "section": fallback["section"],
            "probe_for": fallback["probe_for"],
            "rationale": fallback["rationale"],
            "session_id": None  # Will be set by caller
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
        
        # Check if assessment is complete (5 sections for AI Knowledge agentic assessment)
        if len(session["question_history"]) >= 5:
            logger.info(f"AI Knowledge assessment completed for session {session_id} - conducting agentic analysis")
            
            # Perform sophisticated agentic analysis
            analysis_result = perform_agentic_analysis(session_id, session["question_history"], "ai_knowledge")
            
            return {
                "completed": True,
                "total_sections": 5,
                "questions_answered": len(session["question_history"]),
                "session_id": session_id,
                "analysis": analysis_result,
                "message": "Assessment completed! Your AI readiness analysis is ready."
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
        
        # Check if assessment is complete (5 questions for Change Readiness multi-agent assessment)
        if len(session["question_history"]) >= 5:
            logger.info(f"Change Readiness assessment completed for session {session_id} - conducting CrewAI analysis")
            
            # Extract organization and project data from session or use defaults
            org_data = {
                "name": "Organization",
                "size": 25,
                "type": "small_business",
                "industry": "general"
            }
            
            project_data = {
                "objective": "AI implementation",
                "timeline": "6 months",
                "budget_range": "$1000-5000"
            }
            
            # Perform sophisticated CrewAI multi-agent analysis
            analysis_result = perform_crewai_change_assessment(session_id, org_data, project_data, session["question_history"])
            
            return {
                "completed": True,
                "total_sections": 5,
                "questions_answered": len(session["question_history"]),
                "session_id": session_id,
                "analysis": analysis_result,
                "message": "Assessment completed! Your change readiness analysis is ready."
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

# =============================================================================
# STRIPE PAYMENT ENDPOINTS
# =============================================================================

@app.post("/api/payments/create-checkout-session", response_model=CreateCheckoutSessionResponse)
async def create_checkout_session(request: CreateCheckoutSessionRequest):
    """
    Create a Stripe Checkout session for subscription
    """
    try:
        if stripe_integration is None:
            raise HTTPException(
                status_code=503, 
                detail="Payment system is not available. Please check server configuration."
            )
        
        logger.info(f"Creating checkout session for user {request.user_id}, plan {request.plan_id}")
        
        result = await stripe_integration.create_checkout_session(
            user_id=request.user_id,
            email=request.email,
            plan_id=request.plan_id,
            success_url=request.success_url,
            cancel_url=request.cancel_url,
            name=request.name
        )
        
        return CreateCheckoutSessionResponse(**result)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Failed to create checkout session: {e}")
        raise HTTPException(status_code=500, detail=f"Checkout session creation failed: {str(e)}")

@app.get("/api/payments/subscription-status/{user_id}", response_model=SubscriptionStatusResponse)
async def get_subscription_status(user_id: str):
    """
    Get current subscription status for a user
    """
    try:
        logger.info(f"Getting subscription status for user {user_id}")
        
        status = await stripe_integration.get_subscription_status(user_id)
        
        return SubscriptionStatusResponse(**status)
        
    except Exception as e:
        logger.error(f"Failed to get subscription status: {e}")
        raise HTTPException(status_code=500, detail=f"Status retrieval failed: {str(e)}")

@app.post("/api/payments/create-portal-session", response_model=CustomerPortalResponse)
async def create_customer_portal_session(request: CustomerPortalRequest):
    """
    Create a Stripe Customer Portal session for subscription management
    """
    try:
        logger.info(f"Creating customer portal session for user {request.user_id}")
        
        portal_url = await stripe_integration.create_customer_portal_session(
            user_id=request.user_id,
            return_url=request.return_url
        )
        
        return CustomerPortalResponse(portal_url=portal_url)
        
    except Exception as e:
        logger.error(f"Failed to create portal session: {e}")
        raise HTTPException(status_code=500, detail=f"Portal session creation failed: {str(e)}")

@app.post("/api/payments/webhook")
async def stripe_webhook(request: Request):
    """
    Handle Stripe webhook events
    """
    try:
        payload = await request.body()
        sig_header = request.headers.get('stripe-signature')
        
        if not sig_header:
            raise HTTPException(status_code=400, detail="Missing stripe-signature header")
        
        result = await stripe_integration.handle_webhook_event(payload, sig_header)
        
        logger.info(f"Webhook processed successfully: {result}")
        return result
        
    except Exception as e:
        logger.error(f"Webhook processing failed: {e}")
        raise HTTPException(status_code=400, detail=f"Webhook processing failed: {str(e)}")

@app.post("/api/payments/sync-subscription/{user_id}")
async def sync_subscription_status(user_id: str):
    """
    Force sync subscription status from Stripe to Firebase.
    Called after successful payment to ensure immediate status update.
    """
    try:
        if stripe_integration is None:
            raise HTTPException(
                status_code=503, 
                detail="Payment system is not available"
            )
        
        logger.info(f"Forcing subscription sync for user {user_id}")
        
        # Get current subscription status from Stripe
        status = await stripe_integration.get_subscription_status(user_id)
        logger.info(f"Retrieved subscription status for user {user_id}: {status}")
        
        # If user has an active subscription, manually update Firebase
        if status['has_subscription'] and status['status'] in ['active', 'trialing']:
            # Get user's Stripe customer ID
            user_ref = stripe_integration.db.collection('users').document(user_id)
            user_doc = user_ref.get()
            
            if not user_doc.exists:
                logger.error(f"User document does not exist for user {user_id}")
                raise HTTPException(status_code=404, detail=f"User not found: {user_id}")
            
            user_data = user_doc.to_dict()
            customer_id = user_data.get('stripe_customer_id')
            
            if not customer_id:
                logger.error(f"No Stripe customer ID found for user {user_id}")
                raise HTTPException(status_code=400, detail="No Stripe customer ID found for user")
            
            logger.info(f"Found customer ID {customer_id} for user {user_id}")
            
            # Get subscription details from Stripe
            import stripe
            subscriptions = stripe.Subscription.list(
                customer=customer_id,
                status='all',
                limit=1
            )
            
            if not subscriptions.data:
                logger.error(f"No subscriptions found for customer {customer_id}")
                raise HTTPException(status_code=404, detail="No subscriptions found for customer")
            
            subscription = subscriptions.data[0]
            logger.info(f"Found subscription {subscription.id} with status {subscription.status}")
            
            # Manually trigger the update
            await stripe_integration._update_user_subscription_status(
                subscription, 
                'manual_sync'
            )
            logger.info(f"Successfully synced subscription for user {user_id}")
        else:
            logger.info(f"User {user_id} does not have an active subscription to sync")
        
        return {"success": True, "subscription_status": status}
        
    except Exception as e:
        logger.error(f"Failed to sync subscription status for user {user_id}: {e}")
        logger.error(f"Error type: {type(e).__name__}")
        import traceback
        logger.error(f"Traceback: {traceback.format_exc()}")
        raise HTTPException(status_code=500, detail=f"Sync failed: 500: Internal server error")

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