# FastAPI Backend for ML Tools Integration with Security
# Version 3.0 - With comprehensive security implementations

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
    litellm.success_callback = []
    litellm.failure_callback = []
    litellm._async_success_callback = []
    litellm._async_failure_callback = []
    litellm.suppress_debug_info = True
    litellm.set_verbose = False
    litellm.turn_off_message_logging = True
    print("✅ LiteLLM successfully disabled in main.py")
except ImportError:
    print("⚠️ LiteLLM not found for disabling")
    pass

from fastapi import FastAPI, File, UploadFile, HTTPException, BackgroundTasks, Query, Request, Depends
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
import stripe

# Import Firebase Admin FIRST
import firebase_admin
from firebase_admin import credentials

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize Firebase Admin SDK BEFORE other imports
if not firebase_admin._apps:
    # Try FIREBASE_SERVICE_ACCOUNT_KEY first (Railway uses this)
    firebase_service_account = os.getenv('FIREBASE_SERVICE_ACCOUNT_KEY')
    if firebase_service_account:
        try:
            cred = credentials.Certificate(json.loads(firebase_service_account))
            firebase_admin.initialize_app(cred)
            logger.info("✅ Firebase Admin SDK initialized from FIREBASE_SERVICE_ACCOUNT_KEY")
        except Exception as e:
            logger.error(f"Failed to initialize Firebase from FIREBASE_SERVICE_ACCOUNT_KEY: {e}")
    else:
        # Fallback to GOOGLE_APPLICATION_CREDENTIALS (file path)
        cred_path = os.getenv('GOOGLE_APPLICATION_CREDENTIALS')
        if cred_path and os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
            logger.info("✅ Firebase Admin SDK initialized from file")
        else:
            logger.warning("⚠️ Firebase credentials not found - authentication disabled")

# Import security modules AFTER Firebase is initialized
from admin_auth import admin_auth, verify_admin_access, get_current_user
from premium_verification import premium_verification, verify_premium_access, get_premium_status
from rate_limiting import (
    rate_limiter, rate_limit_default, rate_limit_ml_tools, 
    rate_limit_file_upload, rate_limit_assessment, rate_limit_export
)
from forms_api import forms_api, ContactFormData, ServiceIntakeForm
from security_utils import (
    SecurityUtils, SecureFileStorage, security_utils, secure_storage,
    validate_request_size, MAX_FILE_SIZE, MAX_DATAFRAME_ROWS
)
from memory_utils import MemoryManager, memory_manager, df_processor
from session_storage import session_storage, SessionMetadata, session_cleanup_task

# Import all ML frameworks
from regression.enhanced_regression_framework import RegressionWorkflow, RegressionConfig
from eda.enhanced_eda_framework import EDAWorkflow, EDAConfig
from classification.enhanced_classification_framework import ClassificationWorkflow, ClassificationConfig
from clustering.enhanced_clustering_framework import ClusteringWorkflow, ClusteringConfig
from nlp.enhanced_nlp_framework import NLPWorkflow, NLPConfig

# Import Stripe integration
stripe_integration = None
try:
    from stripe_integration import StripeIntegration
    stripe_integration = StripeIntegration()
    logger.info("✅ Stripe integration loaded successfully")
except Exception as e:
    logger.error(f"❌ Failed to load Stripe integration: {e}")
    stripe_integration = None

# Import New Assessment API
new_assessment_router = None
try:
    from new_assessment_api import assessment_router as new_assessment_router
    logger.info("✅ New Assessment API loaded successfully")
except Exception as e:
    logger.error(f"❌ Failed to load New Assessment API: {e}")
    new_assessment_router = None

# Import Payment Router
payment_router = None
try:
    from payment_router import payment_router
    logger.info("✅ Payment router loaded successfully")
except Exception as e:
    logger.error(f"❌ Failed to load Payment router: {e}")
    payment_router = None

# Import WebSocket server
websocket_app = None
websocket_server = None
try:
    from websocket_server import get_websocket_app, get_websocket_server
    websocket_app = get_websocket_app()
    websocket_server = get_websocket_server()
    logger.info("✅ WebSocket server loaded successfully")
except Exception as e:
    logger.error(f"❌ Failed to load WebSocket server: {e}")
    websocket_app = None
    websocket_server = None

# Create FastAPI app
app = FastAPI(
    title="EvolvIQ ML Tools API",
    description="Interactive Machine Learning Analysis API with Enterprise Security",
    version="3.0.0"
)

# Root endpoint for health checks
@app.get("/")
async def root():
    """Root endpoint for Railway health checks"""
    return {
        "status": "online",
        "message": "EvolvIQ ML Tools API",
        "version": "3.0.0",
        "docs": "/docs",
        "health": "/health"
    }

# Configure CORS for React frontend
cors_origins_env = os.getenv("CORS_ALLOWED_ORIGINS", "*")
if cors_origins_env == "*":
    cors_origins = ["*"]
else:
    cors_origins = cors_origins_env.split(",")
    if "http://localhost:3000" not in cors_origins:
        cors_origins.append("http://localhost:3000")

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,  # Enable for auth
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*", "X-RateLimit-Limit", "X-RateLimit-Remaining", "X-RateLimit-Reset"]
)

# Security Middleware
@app.middleware("http")
async def security_middleware(request: Request, call_next):
    """Security middleware for request validation and headers"""
    # Check request size for uploads
    if request.method == "POST" and request.headers.get("content-type", "").startswith("multipart/form-data"):
        content_length = request.headers.get("content-length")
        if content_length and int(content_length) > MAX_FILE_SIZE:
            raise HTTPException(413, f"File too large. Maximum size is {MAX_FILE_SIZE // (1024*1024)}MB")
    
    # Process request
    response = await call_next(request)
    
    # Add security headers
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
    
    return response

# Mount WebSocket server
if websocket_app:
    app.mount("/socket.io", websocket_app)
    logger.info("✅ WebSocket server mounted at /socket.io")

# Mount New Assessment router
if new_assessment_router:
    app.include_router(new_assessment_router)
    logger.info("✅ New Assessment router mounted")

# Mount Payment router
if payment_router:
    app.include_router(payment_router)
    logger.info("✅ Payment router mounted")

# Startup Events
@app.on_event("startup")
async def startup_validation():
    """Validate critical environment variables on startup"""
    required_vars = {
        "ADMIN_EMAILS": "Admin authentication system",
        "STRIPE_SECRET_KEY": "Payment processing",
        "FIREBASE_SERVICE_ACCOUNT_KEY": "Firebase authentication"
    }
    
    missing = []
    for var, feature in required_vars.items():
        if not os.getenv(var):
            missing.append(f"{var} ({feature})")
    
    if missing:
        logger.warning(f"⚠️ Missing environment variables: {', '.join(missing)}")
        logger.warning("Some features will be disabled")
    
    # Start background tasks
    asyncio.create_task(session_cleanup_task())
    asyncio.create_task(cleanup_old_files_task())
    await rate_limiter.start_cleanup_task()

async def cleanup_old_files_task():
    """Periodic cleanup of old uploaded files"""
    while True:
        try:
            await asyncio.sleep(3600)  # Run every hour
            secure_storage.cleanup_old_files(max_age_hours=24)
            logger.info("Cleaned up old uploaded files")
        except Exception as e:
            logger.error(f"Error in cleanup task: {e}")

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
    user_id: Optional[str] = None

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
    plan_id: str
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
async def get_session_workflow(
    session_id: str, 
    tool_type: str = 'regression',
    user_id: Optional[str] = None
) -> Any:
    """Get workflow for session with persistent storage"""
    # Try to load from persistent storage
    session_data = await session_storage.get_session(session_id)
    
    if not session_data:
        # Create new session
        session_data = {
            'tool_type': tool_type,
            'user_id': user_id,
            'created_at': datetime.now(),
            'status': 'created',
            'name': f'Untitled {tool_type.title()} Session',
            'tools_used': []
        }
        await session_storage.save_session(session_id, session_data)
    
    # Create workflow instance if needed
    if tool_type == 'regression':
        workflow = RegressionWorkflow(RegressionConfig())
    elif tool_type == 'classification':
        workflow = ClassificationWorkflow(ClassificationConfig())
    elif tool_type == 'clustering':
        workflow = ClusteringWorkflow(ClusteringConfig())
    elif tool_type == 'nlp':
        workflow = NLPWorkflow(NLPConfig())
    elif tool_type == 'eda':
        workflow = EDAWorkflow(EDAConfig())
    else:
        raise ValueError(f"Unknown tool type: {tool_type}")
    
    return workflow

async def save_uploaded_file(
    file: UploadFile, 
    user_id: str = "anonymous", 
    session_id: Optional[str] = None
) -> str:
    """Save uploaded file with security validation"""
    if not session_id:
        session_id = str(uuid.uuid4())
    
    try:
        file_path = await secure_storage.save_uploaded_file(file, user_id, session_id)
        return file_path
    except Exception as e:
        logger.error(f"Failed to save file: {e}")
        raise HTTPException(status_code=400, detail=str(e))

def load_data_file(file_path: str) -> pd.DataFrame:
    """Load data file into pandas DataFrame with validation"""
    try:
        file_ext = Path(file_path).suffix.lower()
        
        if file_ext == '.csv':
            data = pd.read_csv(file_path)
        elif file_ext in ['.xlsx', '.xls']:
            data = pd.read_excel(file_path)
        elif file_ext == '.json':
            data = pd.read_json(file_path)
        elif file_ext == '.tsv':
            data = pd.read_csv(file_path, sep='\t')
        else:
            raise ValueError(f"Unsupported file format: {file_ext}")
        
        # Validate DataFrame size
        validation = SecurityUtils.validate_dataframe_size(data)
        logger.info(f"Loaded DataFrame: {validation}")
        
        # Optimize memory usage
        data = memory_manager.optimize_dataframe(data)
        
        # Sanitize column names
        data.columns = SecurityUtils.validate_column_names(data.columns.tolist())
        
        return data
        
    except Exception as e:
        logger.error(f"Failed to load data file: {e}")
        raise

# ADMIN ENDPOINTS
@app.get("/api/admin/verify-access")
async def verify_admin_access_endpoint(admin_data: dict = Depends(verify_admin_access)):
    """Verify admin access - server-side verification only"""
    return {"access_granted": True, "admin_data": admin_data}

@app.get("/api/admin/list")
async def list_admins(admin_data: dict = Depends(verify_admin_access)):
    """List all admin emails"""
    return {
        "admins": admin_auth.get_admin_list(),
        "requested_by": admin_data["email"]
    }

@app.post("/api/admin/add")
async def add_admin_endpoint(
    email: str,
    admin_data: dict = Depends(verify_admin_access)
):
    """Add a new admin (runtime only)"""
    success = await admin_auth.add_admin(email)
    return {
        "success": success,
        "message": "Admin added (runtime only)" if success else "Admin already exists",
        "note": "Update ADMIN_EMAILS environment variable for persistence"
    }

# PREMIUM ENDPOINTS
@app.get("/api/auth/premium-status")
async def get_premium_status_endpoint(
    premium_status: dict = Depends(get_premium_status)
):
    """Get current user's premium status"""
    return {"premium_status": premium_status.dict()}

@app.get("/api/premium/verify")
async def verify_premium_endpoint(
    premium_status: dict = Depends(verify_premium_access)
):
    """Verify premium access for protected resources"""
    return {
        "access_granted": True,
        "premium_status": premium_status.dict()
    }

# FORMS ENDPOINTS
@app.post("/api/forms/contact")
async def submit_contact_form_endpoint(
    form_data: ContactFormData,
    request: Request,
    background_tasks: BackgroundTasks,
    _: dict = Depends(rate_limit_default)
):
    """Submit contact form"""
    return await forms_api.submit_contact_form(form_data, request, background_tasks)

@app.post("/api/forms/service-intake")
async def submit_service_intake_endpoint(
    form_data: ServiceIntakeForm,
    request: Request,
    background_tasks: BackgroundTasks,
    _: dict = Depends(rate_limit_default)
):
    """Submit service intake form"""
    return await forms_api.submit_service_intake(form_data, request, background_tasks)

@app.get("/api/admin/forms/submissions")
async def get_form_submissions(
    form_type: Optional[str] = None,
    status: Optional[str] = None,
    limit: int = Query(100, le=500),
    offset: int = Query(0, ge=0),
    admin_data: dict = Depends(verify_admin_access)
):
    """Get form submissions (admin only)"""
    return await forms_api.get_submissions(form_type, status, limit, offset)

@app.put("/api/admin/forms/submissions/{submission_id}/status")
async def update_submission_status_endpoint(
    submission_id: str,
    status: str,
    note: Optional[str] = None,
    admin_data: dict = Depends(verify_admin_access)
):
    """Update form submission status"""
    return await forms_api.update_submission_status(
        submission_id, 
        status, 
        note, 
        admin_data["email"]
    )

# HEALTH ENDPOINTS
@app.get("/health")
async def health_check():
    """Enhanced health check with security status"""
    try:
        # Basic health info
        health_info = {
            "status": "healthy",
            "timestamp": datetime.now().isoformat(),
            "version": "3.0.0",
            "environment": os.getenv("RAILWAY_ENVIRONMENT", "local")
        }
        
        # Check Stripe
        stripe_status = "connected" if stripe_integration else "not_connected"
        health_info["stripe_integration"] = stripe_status
        
        # Check WebSocket
        websocket_status = "connected" if websocket_server else "not_connected"
        health_info["websocket_integration"] = websocket_status
        
        # Security status
        health_info["security"] = {
            "admin_auth": len(admin_auth.get_admin_list()) > 0,
            "firebase_auth": firebase_admin._apps is not None and len(firebase_admin._apps) > 0,
            "rate_limiting": True,
            "premium_verification": stripe_integration is not None,
            "forms_api": True,
            "session_storage": True
        }
        
        # Memory status
        memory_info = memory_manager.get_memory_info()
        health_info["memory"] = memory_info
        
        # Session count
        sessions = await session_storage.list_sessions()
        health_info["active_sessions"] = len(sessions)
        
        return health_info
        
    except Exception as e:
        logger.error(f"Health check error: {e}")
        return {
            "status": "error",
            "timestamp": datetime.now().isoformat(),
            "error": str(e)
        }

@app.get("/health/detailed")
async def detailed_health_check(admin_data: dict = Depends(verify_admin_access)):
    """Detailed health check for admins"""
    health_info = await health_check()
    
    # Add detailed information
    health_info["detailed"] = {
        "admin_count": len(admin_auth.get_admin_list()),
        "rate_limits": {
            "default": rate_limiter.RATE_LIMITS["default"],
            "ml_tools": rate_limiter.RATE_LIMITS["ml_tools"],
            "file_upload": rate_limiter.RATE_LIMITS["file_upload"]
        },
        "ml_frameworks": {
            "regression": True,
            "classification": True,
            "clustering": True,
            "nlp": True,
            "eda": True
        },
        "storage": {
            "type": type(session_storage).__name__,
            "sessions": len(await session_storage.list_sessions())
        }
    }
    
    return health_info

# SESSION ENDPOINTS
@app.post("/api/{tool_type}/session", response_model=SessionResponse)
async def create_session(
    tool_type: str,
    request: SessionCreateRequest,
    current_user: dict = Depends(get_current_user),
    rate_limit: dict = Depends(rate_limit_default)
):
    """Create a new analysis session for any tool type"""
    if tool_type not in ['regression', 'classification', 'clustering', 'nlp', 'eda']:
        raise HTTPException(status_code=400, detail=f"Invalid tool type: {tool_type}")
    
    try:
        session_id = f"{tool_type}_{uuid.uuid4().hex[:12]}"
        
        # Create session with user context
        workflow = await get_session_workflow(session_id, tool_type, current_user['user_id'])
        
        # Save session data
        session_data = {
            'name': request.name,
            'description': request.description,
            'status': 'created',
            'tool_type': tool_type,
            'user_id': current_user['user_id'],
            'created_at': datetime.now()
        }
        
        await session_storage.save_session(session_id, session_data)
        
        return SessionResponse(
            session_id=session_id,
            name=request.name,
            description=request.description,
            status='created',
            created_at=session_data['created_at'],
            user_id=current_user['user_id']
        )
        
    except Exception as e:
        logger.error(f"Failed to create session: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/sessions")
async def list_user_sessions(
    current_user: dict = Depends(get_current_user),
    rate_limit: dict = Depends(rate_limit_default)
):
    """List all sessions for current user"""
    sessions = await session_storage.list_sessions(current_user['user_id'])
    return {
        "sessions": [session.to_dict() for session in sessions],
        "count": len(sessions)
    }

@app.delete("/api/sessions/{session_id}")
async def delete_session(
    session_id: str,
    current_user: dict = Depends(get_current_user),
    rate_limit: dict = Depends(rate_limit_default)
):
    """Delete a session"""
    # Verify ownership
    session_data = await session_storage.get_session(session_id)
    if not session_data:
        raise HTTPException(status_code=404, detail="Session not found")
    
    if session_data.get('user_id') != current_user['user_id'] and not current_user.get('is_admin'):
        raise HTTPException(status_code=403, detail="Not authorized to delete this session")
    
    success = await session_storage.delete_session(session_id)
    return {"success": success}

# DATA VALIDATION ENDPOINT
@app.post("/api/{tool_type}/validate-data")
async def validate_data(
    tool_type: str,
    file: UploadFile = File(...),
    session_id: str = Query(...),
    current_user: dict = Depends(get_current_user),
    rate_limit: dict = Depends(rate_limit_file_upload)
):
    """Validate uploaded data file with rate limiting"""
    temp_file_path = None
    
    try:
        # Validate file
        await SecurityUtils.validate_upload_file(file)
        
        # Save uploaded file with user context
        temp_file_path = await save_uploaded_file(
            file, 
            user_id=current_user['user_id'],
            session_id=session_id
        )
        
        # Load and validate data
        data = load_data_file(temp_file_path)
        
        # Get workflow and validate
        workflow = await get_session_workflow(session_id, tool_type, current_user['user_id'])
        
        # Tool-specific validation
        if tool_type == 'regression' or tool_type == 'classification':
            numeric_columns = data.select_dtypes(include=[np.number]).columns.tolist()
            if not numeric_columns:
                raise HTTPException(
                    status_code=400,
                    detail="No numeric columns found in the dataset"
                )
            target_column = numeric_columns[-1]
            validation_result = workflow.validate_data(data, target_column)
        else:
            validation_result = workflow.validate_data(data)
        
        # Update session data
        session_update = {
            'data_shape': data.shape,
            'columns': data.columns.tolist(),
            'status': 'data_uploaded',
            'uploaded_by': current_user['user_id'],
            'upload_time': datetime.now()
        }
        
        # Get existing session data and update
        existing_session = await session_storage.get_session(session_id)
        if existing_session:
            existing_session.update(session_update)
            await session_storage.save_session(session_id, existing_session)
        
        # Return validation results with rate limit info
        return {
            "validation": validation_result,
            "data_info": {
                "rows": data.shape[0],
                "columns": data.shape[1],
                "memory_mb": memory_manager.estimate_dataframe_memory(data)
            },
            "rate_limit": rate_limit
        }
        
    except Exception as e:
        logger.error(f"Validation failed: {e}")
        raise HTTPException(status_code=400, detail=str(e))
    finally:
        # Clean up temp file
        if temp_file_path and os.path.exists(temp_file_path):
            try:
                os.unlink(temp_file_path)
            except:
                pass

# MODEL TRAINING ENDPOINT
@app.post("/api/{tool_type}/train")
async def train_models(
    tool_type: str,
    request: TrainingRequest,
    background_tasks: BackgroundTasks,
    session_id: str = Query(...),
    current_user: dict = Depends(get_current_user),
    rate_limit: dict = Depends(rate_limit_ml_tools)
):
    """Train models with rate limiting and premium checks"""
    try:
        # Premium model check
        premium_models = ['xgboost', 'lightgbm', 'catboost', 'neural_network', 'deep_learning']
        using_premium = any(model in request.config.models_to_include for model in premium_models)
        
        if using_premium:
            # Verify premium status
            premium_status = await premium_verification.sync_premium_status_from_stripe(
                current_user['user_id'],
                current_user['email']
            )
            if not premium_status.is_premium:
                raise HTTPException(
                    status_code=403,
                    detail="Premium subscription required for advanced models"
                )
        
        # Check memory before training
        if not memory_manager.check_memory_available(500):  # Need at least 500MB
            raise HTTPException(
                status_code=503,
                detail="Insufficient memory available. Please try again later."
            )
        
        # For long-running tasks, use background processing
        if len(request.config.models_to_include) > 3:
            background_tasks.add_task(
                train_models_background,
                session_id,
                tool_type,
                request,
                current_user['user_id']
            )
            return {
                "status": "training_started",
                "session_id": session_id,
                "message": "Training started in background. Check status for updates.",
                "estimated_time": len(request.config.models_to_include) * 30,  # seconds
                "rate_limit": rate_limit
            }
        
        # For smaller tasks, process immediately
        workflow = await get_session_workflow(session_id, tool_type, current_user['user_id'])
        
        # Get session data
        session_data = await session_storage.get_session(session_id)
        if not session_data or 'data_shape' not in session_data:
            raise HTTPException(status_code=400, detail="No data uploaded for this session")
        
        # Train models (simplified for example)
        results = {
            "status": "completed",
            "models_trained": len(request.config.models_to_include),
            "training_time": datetime.now().isoformat()
        }
        
        # Update session
        session_data['status'] = 'training_complete'
        session_data['training_results'] = results
        await session_storage.save_session(session_id, session_data)
        
        return {
            "results": results,
            "rate_limit": rate_limit
        }
        
    except Exception as e:
        logger.error(f"Training failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Background training task
async def train_models_background(
    session_id: str, 
    tool_type: str,
    request: TrainingRequest, 
    user_id: str
):
    """Background task for model training"""
    try:
        # Update session status
        session_data = await session_storage.get_session(session_id)
        if session_data:
            session_data['status'] = 'training_in_progress'
            session_data['training_started_at'] = datetime.now()
            await session_storage.save_session(session_id, session_data)
        
        # Get workflow and train
        workflow = await get_session_workflow(session_id, tool_type, user_id)
        
        # Simulate training (replace with actual implementation)
        await asyncio.sleep(10)  # Simulate work
        
        results = {
            "status": "completed",
            "models_trained": len(request.config.models_to_include),
            "training_time": datetime.now().isoformat()
        }
        
        # Update status when complete
        if session_data:
            session_data['status'] = 'training_complete'
            session_data['training_completed_at'] = datetime.now()
            session_data['training_results'] = results
            await session_storage.save_session(session_id, session_data)
            
    except Exception as e:
        logger.error(f"Background training failed: {e}")
        if session_data:
            session_data['status'] = 'training_failed'
            session_data['error'] = str(e)
            await session_storage.save_session(session_id, session_data)

# EXPORT ENDPOINT
@app.get("/api/{tool_type}/export/{session_id}")
async def export_results(
    tool_type: str,
    session_id: str,
    format: str = Query("json", regex="^(json|csv|excel)$"),
    include_models: bool = Query(False),
    current_user: dict = Depends(get_current_user),
    rate_limit: dict = Depends(rate_limit_export)
):
    """Export analysis results"""
    try:
        # Get session data
        session_data = await session_storage.get_session(session_id)
        if not session_data:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Verify ownership
        if session_data.get('user_id') != current_user['user_id'] and not current_user.get('is_admin'):
            raise HTTPException(status_code=403, detail="Not authorized to export this session")
        
        # Get workflow
        workflow = await get_session_workflow(session_id, tool_type, current_user['user_id'])
        
        # Export results
        export_data = workflow.export_results(format=format, include_models=include_models)
        
        # Return appropriate response
        if format == "json":
            return {"data": json.loads(export_data), "rate_limit": rate_limit}
        elif format == "csv":
            return FileResponse(
                io.BytesIO(export_data.encode()),
                media_type="text/csv",
                headers={
                    "Content-Disposition": f"attachment; filename={session_id}_results.csv",
                    "X-RateLimit-Limit": str(rate_limit["limit"]),
                    "X-RateLimit-Remaining": str(rate_limit["remaining"])
                }
            )
        elif format == "excel":
            return FileResponse(
                io.BytesIO(export_data),
                media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                headers={
                    "Content-Disposition": f"attachment; filename={session_id}_results.xlsx",
                    "X-RateLimit-Limit": str(rate_limit["limit"]),
                    "X-RateLimit-Remaining": str(rate_limit["remaining"])
                }
            )
            
    except Exception as e:
        logger.error(f"Export failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# STRIPE WEBHOOK ENDPOINT
@app.post("/api/stripe/webhook")
async def stripe_webhook(
    request: Request,
    background_tasks: BackgroundTasks
):
    """Handle Stripe webhook events"""
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')
    webhook_secret = os.getenv('STRIPE_WEBHOOK_SECRET')
    
    if not webhook_secret:
        logger.error("Stripe webhook secret not configured")
        raise HTTPException(status_code=500, detail="Webhook secret not configured")
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, webhook_secret
        )
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")
    
    # Handle the event using stripe_integration
    if stripe_integration:
        background_tasks.add_task(
            stripe_integration.process_webhook_event,
            event['type'],
            event['data']['object']
        )
    else:
        logger.warning("Stripe integration not available to handle webhook")
    
    return {"status": "success"}

# Existing endpoints remain the same...
# Add the remaining endpoints from the original main.py here

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)