# Railway Deployment Configuration

This document outlines all the environment variables and configurations needed for deploying the Evolviq Website backend on Railway.

## Required Environment Variables

### 1. **OpenAI Configuration**
```bash
OPENAI_API_KEY=your_openai_api_key_here
```
- **Required**: Yes
- **Description**: Your OpenAI API key for GPT-based features
- **Used for**: AI Knowledge Assessment, Change Readiness Assessment, and other AI-powered features
- **Get it from**: https://platform.openai.com/api-keys

### 2. **Firebase Configuration**
```bash
# Firebase Service Account (for backend admin access)
FIREBASE_SERVICE_ACCOUNT_KEY='{
  "type": "service_account",
  "project_id": "evolviq-795b7",
  "private_key_id": "your_private_key_id",
  "private_key": "your_private_key",
  "client_email": "your_service_account_email",
  "client_id": "your_client_id",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  "client_x509_cert_url": "your_cert_url"
}'

# Alternative: Base64 encoded service account
FIREBASE_SERVICE_ACCOUNT_BASE64=your_base64_encoded_service_account_json
```
- **Required**: Yes (for backend Firebase Admin SDK)
- **Description**: Firebase service account credentials for server-side operations
- **Get it from**: Firebase Console → Project Settings → Service Accounts → Generate New Private Key
- **Note**: The frontend uses client-side Firebase SDK with public config, but the backend needs service account for admin operations

### 3. **Authentication & Security**
```bash
# Currently NOT USED - Backend has no authentication
# If you want to secure your backend in the future, you would need:
# FIREBASE_ADMIN_SDK_INITIALIZED=true
# And implement Firebase token verification in your backend
```
- **Required**: No (current implementation has no backend authentication)
- **Current Status**: Your backend is an open API with no authentication
- **Security Note**: Anyone can call your backend endpoints. Consider adding Firebase Admin SDK to verify user tokens if you need to:
  - Track usage per user
  - Protect your OpenAI API usage
  - Store user-specific data
  - Implement rate limiting per user

### 4. **CORS Configuration**
```bash
CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com,https://your-other-domain.com
```
- **Required**: Yes
- **Description**: Comma-separated list of allowed frontend origins
- **Example**: `https://evolviq.com,https://www.evolviq.com`

### 5. **Email Configuration (if applicable)**
```bash
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_app_specific_password
EMAIL_USE_TLS=True
```
- **Required**: Only if email features are enabled
- **Description**: SMTP configuration for sending emails

### 6. **File Upload Configuration**
```bash
MAX_UPLOAD_SIZE=10485760  # 10MB in bytes
ALLOWED_FILE_EXTENSIONS=csv,xlsx,xls,json,txt
```
- **Required**: No (defaults provided)
- **Description**: File upload constraints for ML tools

### 7. **API Rate Limiting**
```bash
RATE_LIMIT_PER_MINUTE=60
RATE_LIMIT_PER_HOUR=1000
```
- **Required**: No (defaults provided)
- **Description**: API rate limiting configuration

### 8. **Environment Configuration**
```bash
ENVIRONMENT=production
DEBUG=False
LOG_LEVEL=INFO
```
- **Required**: Yes
- **Description**: Environment settings
- **Important**: Always set `DEBUG=False` in production

### 9. **ML Tool Specific Variables**
```bash
# Session Management
SESSION_TIMEOUT_MINUTES=30
MAX_SESSIONS_PER_USER=5

# Processing Limits
MAX_ROWS_PER_DATASET=10000
MAX_COLUMNS_PER_DATASET=100
PROCESSING_TIMEOUT_SECONDS=300
```
- **Required**: No (defaults provided)
- **Description**: Limits for ML processing tools

### 10. **Session Storage Configuration**
```bash
# For temporary session data (ML tool sessions)
SESSION_STORAGE_TYPE=memory  # Options: memory, redis, firebase
REDIS_URL=redis://your-redis-url:6379  # Only if using Redis
```
- **Required**: No (defaults to in-memory storage)
- **Description**: Where to store temporary ML tool session data
- **Note**: Firebase stores permanent data (users, projects, assessments), while sessions are for temporary ML processing

## Railway-Specific Configuration

### Build Configuration
In your Railway service settings, ensure:
1. **Build Command**: `pip install -r requirements.txt`
2. **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT` (for FastAPI)
   - Or: `gunicorn wsgi:app` (for Flask)
3. **Watch Paths**: Set to your backend directory

### Domain Configuration
1. Generate a Railway domain or add a custom domain
2. Update the frontend's `apiConfig.js` to point to your Railway backend URL

### Firebase Setup
1. The frontend connects directly to Firebase using the public configuration
2. The backend needs a Firebase service account for admin operations:
   - Go to Firebase Console → Your Project → Project Settings
   - Navigate to "Service Accounts" tab
   - Click "Generate New Private Key"
   - Download the JSON file
   - Add the contents to Railway as `FIREBASE_SERVICE_ACCOUNT_KEY`
3. Alternatively, you can base64 encode the JSON and use `FIREBASE_SERVICE_ACCOUNT_BASE64`

## Setting Environment Variables in Railway

1. Go to your Railway project dashboard
2. Select your backend service
3. Navigate to the "Variables" tab
4. Add each environment variable using the "New Variable" button
5. Railway will automatically restart your service when variables are updated

## Security Best Practices

1. **Never commit secrets**: Keep all sensitive values in environment variables
2. **Use strong secrets**: Generate cryptographically secure random strings
3. **Rotate keys regularly**: Update API keys and secrets periodically
4. **Limit CORS origins**: Only allow your specific frontend domains
5. **Enable HTTPS**: Railway provides HTTPS by default on generated domains

## Monitoring and Logs

Railway provides built-in logging. To view logs:
1. Go to your service in Railway
2. Click on the "Logs" tab
3. Use log levels appropriately (ERROR, WARNING, INFO, DEBUG)

## Common Issues and Troubleshooting

### 1. CORS Errors
- Ensure `CORS_ALLOWED_ORIGINS` includes your frontend URL
- Check that the URL includes the protocol (https://)

### 2. Firebase Connection Issues
- Verify `FIREBASE_SERVICE_ACCOUNT_KEY` is correctly formatted JSON
- Check Firebase project ID matches your project
- Ensure Firebase Admin SDK is initialized properly in backend
- Verify Firestore security rules allow backend access

### 3. OpenAI API Errors
- Verify `OPENAI_API_KEY` is valid
- Check API quota and billing on OpenAI dashboard
- Monitor rate limits

### 4. File Upload Issues
- Check `MAX_UPLOAD_SIZE` setting
- Verify allowed file extensions
- Ensure temporary storage is available

## Frontend Configuration

After deploying the backend, update your frontend's `apiConfig.js`:

```javascript
const API_CONFIG = {
  // Update this to your Railway backend URL
  BASE_URL: 'https://your-backend-service.railway.app',
  // ... rest of configuration
};
```

## Support

For Railway-specific issues:
- Railway Documentation: https://docs.railway.app
- Railway Discord: https://discord.gg/railway

For application-specific issues:
- Check application logs in Railway
- Review environment variable configuration
- Ensure all required services are running