# EvolvIQ Linear Regression API

FastAPI backend for the interactive linear regression analysis tool.

## Features

- Data validation and preprocessing
- Multiple regression models (Linear, Ridge, Lasso, Random Forest, etc.)
- Interactive visualizations
- Model export and prediction capabilities
- Session management with Firebase integration

## Local Development

```bash
# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## API Documentation

Once deployed, visit `/docs` for interactive API documentation.

## Endpoints

- `POST /api/regression/session` - Create new session
- `POST /api/regression/validate-data` - Validate uploaded data
- `POST /api/regression/preprocess` - Preprocess data
- `POST /api/regression/train` - Train models
- `GET /api/regression/results/{session_id}` - Get results
- `POST /api/regression/predict` - Make predictions
- `POST /api/regression/export/{session_id}` - Export model

## Railway Deployment

This API is configured for Railway deployment with:
- Dockerfile for containerization
- railway.json for deployment configuration
- Automatic port detection from environment variables
- CORS configured for frontend domains