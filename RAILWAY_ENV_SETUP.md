# Railway Environment Variables Setup

This guide documents the environment variables configured for the EvolvIQ Railway deployment.

## Current Environment Variables

### 1. Firebase Configuration
```bash
# Firebase service account credentials (JSON string) - ALREADY SET ✅
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account","project_id":"evolviq-795b7",...}

# Note: The app expects GOOGLE_APPLICATION_CREDENTIALS, but you have FIREBASE_SERVICE_ACCOUNT_KEY
# The code needs to be updated to use FIREBASE_SERVICE_ACCOUNT_KEY
```

### 2. Admin Configuration
```bash
# Comma-separated list of admin email addresses - NOT SET ❌
ADMIN_EMAILS=admin@evolviq.com,your-email@evolviq.com
# ACTION REQUIRED: Add this variable with your admin email addresses
```

### 3. Stripe Configuration (TEST MODE) ✅
```bash
# All Stripe variables are configured for TEST mode
STRIPE_SECRET_KEY="sk_test_..." # ✅ SET
STRIPE_WEBHOOK_SECRET="whsec_..." # ✅ SET
STRIPE_PRICE_MONTHLY="price_1RoRszAVsMNYP0TtfIvcKmck" # ✅ SET
STRIPE_PRICE_ANNUAL="price_1RoRuAAVsMNYP0TtLu7NJJox" # ✅ SET
STRIPE_PRICE_BUSINESS="price_1RoRugAVsMNYP0TtHRYn83az" # ✅ SET
REACT_APP_STRIPE_PUBLISHABLE_K="pk_test_..." # ✅ SET (for frontend)

# WARNING: These are TEST keys. For production, update to live keys:
# STRIPE_SECRET_KEY="sk_live_..."
# STRIPE_WEBHOOK_SECRET="whsec_live_..."
```

### 4. OpenAI Configuration ✅
```bash
OPENAI_API_KEY="sk-proj-..." # ✅ SET
# Note: Make sure this key has sufficient credits/quota
```

### 5. Railway System Variables ✅
```bash
PORT="8000" # ✅ SET
PYTHONPATH="/app" # ✅ SET
```

### 6. Missing Variables That Should Be Added

```bash
# CORS Configuration (currently allows all origins)
CORS_ALLOWED_ORIGINS=https://evolviq.com,https://www.evolviq.com,http://localhost:3000

# Admin emails for the admin system
ADMIN_EMAILS=your-admin@evolviq.com

# Optional Email Configuration (if you need email features)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
ADMIN_EMAIL=admin@evolviq.com
```

## Code Updates Required

The code currently looks for `GOOGLE_APPLICATION_CREDENTIALS` but you have `FIREBASE_SERVICE_ACCOUNT_KEY`. Update main.py to use your variable name:

```python
# In main.py, change this:
cred_path = os.getenv('GOOGLE_APPLICATION_CREDENTIALS', 'path/to/serviceAccount.json')

# To this:
firebase_service_account = os.getenv('FIREBASE_SERVICE_ACCOUNT_KEY')
if firebase_service_account:
    cred = credentials.Certificate(json.loads(firebase_service_account))
    firebase_admin.initialize_app(cred)
```

## Summary

✅ **Working**: Firebase, Stripe (test mode), OpenAI, Railway system vars
❌ **Missing**: ADMIN_EMAILS, CORS_ALLOWED_ORIGINS
⚠️  **Code Update Needed**: Use FIREBASE_SERVICE_ACCOUNT_KEY instead of GOOGLE_APPLICATION_CREDENTIALS