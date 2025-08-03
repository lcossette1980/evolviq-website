# Railway Environment Variables Setup

This guide helps you configure the necessary environment variables for Railway deployment.

## Required Environment Variables

### 1. Firebase Configuration
```bash
# Firebase service account credentials (JSON string)
GOOGLE_APPLICATION_CREDENTIALS={"type":"service_account","project_id":"your-project",...}

# Or alternatively, use a path (if you're mounting the file)
# GOOGLE_APPLICATION_CREDENTIALS=/app/serviceAccount.json
```

### 2. Admin Configuration
```bash
# Comma-separated list of admin email addresses
ADMIN_EMAILS=admin@yourcompany.com,admin2@yourcompany.com
```

### 3. Stripe Configuration
```bash
# Your Stripe secret key
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx

# Stripe webhook secret for verifying webhook signatures
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx

# Stripe price IDs (create these in Stripe Dashboard)
STRIPE_PRICE_MONTHLY=price_xxxxxxxxxxxxx
STRIPE_PRICE_ANNUAL=price_xxxxxxxxxxxxx
STRIPE_PRICE_BUSINESS=price_xxxxxxxxxxxxx
```

### 4. CORS Configuration
```bash
# Allowed origins for CORS (comma-separated)
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
```

### 5. Optional Email Configuration
```bash
# SMTP settings for sending emails
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
ADMIN_EMAIL=admin@yourcompany.com
```

### 6. OpenAI Configuration (for assessments)
```bash
# Your OpenAI API key
OPENAI_API_KEY=sk-xxxxxxxxxxxxx
```

## Setting Variables in Railway

1. Go to your Railway project
2. Click on your service
3. Go to "Variables" tab
4. Click "Raw Editor"
5. Paste your environment variables in KEY=VALUE format

## Example Configuration
```
ADMIN_EMAILS=admin@evolviq.com
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxxx
CORS_ALLOWED_ORIGINS=https://evolviq.com,https://www.evolviq.com
OPENAI_API_KEY=sk-xxxxxxxxxxxxx
```

## Notes
- The application will start without these variables but some features will be disabled
- Firebase credentials can be passed as a JSON string or file path
- Make sure to use production keys for Stripe in production
- CORS origins should match your frontend domain(s)