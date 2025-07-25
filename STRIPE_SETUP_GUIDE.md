# 🚀 Stripe Integration Setup Guide

## Overview
This guide provides step-by-step instructions to complete your Stripe integration for EvolvIQ's premium subscription system.

## 📋 Pre-Deployment Checklist

### ✅ Code Integration Status
- [x] **Backend Integration**: Stripe payment endpoints added to FastAPI
- [x] **Frontend Components**: PremiumPaywall updated with Stripe integration
- [x] **Payment API Service**: Created for handling Stripe API calls
- [x] **Subscription Management**: User subscription status and portal access
- [x] **Success/Cancel Pages**: Payment flow completion handling
- [x] **Webhook Handlers**: Automatic subscription status updates
- [x] **Database Schema**: Firebase user documents extended for Stripe data

## 🔑 1. Stripe Dashboard Setup

### Step 1: Create Products and Prices
Log into your Stripe Dashboard and create the following:

#### **Premium Monthly Plan**
1. Go to **Products** → **Add Product**
2. **Name**: `Premium Monthly`
3. **Description**: `EvolvIQ Premium Monthly Subscription`
4. **Pricing Model**: Recurring
5. **Price**: `$47.00 USD`
6. **Billing Period**: Monthly
7. **Trial Period**: 3 days
8. **Save** and copy the **Price ID** (starts with `price_`)

#### **Premium Annual Plan**
1. **Name**: `Premium Annual`
2. **Description**: `EvolvIQ Premium Annual Subscription (2 months free)`
3. **Price**: `$470.00 USD`
4. **Billing Period**: Yearly
5. **Trial Period**: 3 days
6. **Save** and copy the **Price ID**

#### **Business Plan**
1. **Name**: `Business Plan`
2. **Description**: `EvolvIQ Business Plan for Teams`
3. **Price**: `$147.00 USD`
4. **Billing Period**: Monthly
5. **Trial Period**: None
6. **Save** and copy the **Price ID**

### Step 2: Configure Customer Portal
1. Go to **Settings** → **Customer Portal**
2. **Enable** customer portal
3. **Configure settings**:
   - ✅ Allow customers to update payment methods
   - ✅ Allow customers to update billing address
   - ✅ Allow customers to cancel subscriptions
   - ✅ Allow customers to switch plans
   - ✅ Show proration preview
4. **Business Information**: Add your company details
5. **Terms of Service**: Link to your terms page
6. **Privacy Policy**: Link to your privacy page
7. **Save configuration**

### Step 3: Set Up Webhooks
1. Go to **Developers** → **Webhooks**
2. **Add Endpoint**
3. **Endpoint URL**: `https://evolviq-website-production.up.railway.app/api/payments/webhook`
4. **Select Events**:
   - ✅ `customer.subscription.created`
   - ✅ `customer.subscription.updated`
   - ✅ `customer.subscription.deleted`
   - ✅ `invoice.payment_succeeded`
   - ✅ `invoice.payment_failed`
5. **Add Endpoint**
6. **Copy the Webhook Signing Secret** (starts with `whsec_`)

## 🔧 2. Environment Variables Setup

### Railway Backend Environment Variables
Add these to your Railway deployment:

```bash
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_... # Your Stripe Secret Key (TEST)
STRIPE_WEBHOOK_SECRET=whsec_... # Webhook signing secret from Step 3

# Stripe Price IDs (from Step 1)
STRIPE_PRICE_MONTHLY=price_... # Premium Monthly Price ID
STRIPE_PRICE_ANNUAL=price_... # Premium Annual Price ID  
STRIPE_PRICE_BUSINESS=price_... # Business Plan Price ID

# Firebase Service Account (for admin operations)
FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...} # Service account JSON
```

### Frontend Environment Variables (if needed)
Add to your React app environment:

```bash
# Only if you need client-side Stripe
REACT_APP_STRIPE_PUBLISHABLE_KEY=pk_test_... # Your Stripe Publishable Key (TEST)
```

## 🗃️ 3. Firebase Service Account Setup

### Step 1: Create Service Account
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. **Project Settings** → **Service Accounts** tab
4. **Generate New Private Key**
5. Download the JSON file
6. **Minify the JSON** (remove spaces and newlines)
7. Add the entire JSON as `FIREBASE_SERVICE_ACCOUNT_KEY` environment variable

### Step 2: Firestore Security Rules
Update your Firestore rules to allow admin access:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow admin access for subscription updates
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      // Allow admin writes for webhook updates
      allow write: if true; // This allows webhook updates
    }
  }
}
```

## 🚀 4. Deployment Steps

### Step 1: Deploy Backend Changes
```bash
cd backend
git add .
git commit -m "Add Stripe payment integration"
git push origin main
```

### Step 2: Deploy Frontend Changes
```bash
cd frontend
git add .
git commit -m "Add Stripe payment components"
git push origin main
```

### Step 3: Update Routes (if using React Router)
Add these routes to your React Router configuration:

```jsx
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentCancelled from './pages/PaymentCancelled';

// Add to your routes:
<Route path="/payment-success" element={<PaymentSuccess />} />
<Route path="/payment-cancelled" element={<PaymentCancelled />} />
```

## 🧪 5. Testing Checklist

### Test Payment Flow
1. **Access Premium Content**: Navigate to premium content
2. **Trigger Paywall**: Should see the updated paywall with Stripe integration
3. **Select Plan**: Choose monthly/annual plan
4. **Payment Process**: Click "Start 3-Day Free Trial"
5. **Stripe Checkout**: Should redirect to Stripe-hosted checkout
6. **Test Card**: Use `4242 4242 4242 4242` for testing
7. **Success Flow**: Should redirect to payment success page
8. **Dashboard Access**: Verify premium content is now accessible

### Test Subscription Management
1. **Account Settings**: Navigate to account/subscription page
2. **View Status**: Should show active subscription with trial
3. **Manage Subscription**: Click "Manage Subscription"
4. **Customer Portal**: Should open Stripe Customer Portal
5. **Update Payment**: Test payment method updates
6. **Cancel/Reactivate**: Test subscription cancellation

### Test Webhooks
1. **Stripe Dashboard**: Go to Webhooks section
2. **Send Test Webhook**: Use "Send test webhook" feature
3. **Check Logs**: Verify webhook is received in Railway logs
4. **User Status**: Check that user's subscription status updates in Firebase

## 🏭 6. Production Setup

### Step 1: Switch to Live Mode
1. **Stripe Dashboard**: Toggle to "Live mode"
2. **Recreate Products**: Set up the same products in live mode
3. **Update Environment Variables**: Replace test keys with live keys:
   ```bash
   STRIPE_SECRET_KEY=sk_live_... # Live secret key
   STRIPE_PRICE_MONTHLY=price_... # Live price IDs
   STRIPE_PRICE_ANNUAL=price_...
   STRIPE_PRICE_BUSINESS=price_...
   ```
4. **Webhook Endpoint**: Update webhook URL to production domain
5. **Update Webhook Secret**: Use live webhook secret

### Step 2: Compliance Setup
1. **Tax Collection**: Configure tax settings in Stripe
2. **Billing Details**: Ensure billing address collection is enabled
3. **Terms & Privacy**: Update customer portal with correct URLs
4. **Email Notifications**: Configure Stripe email settings

## 📊 7. Monitoring & Analytics

### Stripe Dashboard Monitoring
- **Payments**: Monitor successful/failed payments
- **Subscriptions**: Track active subscriptions and churn
- **Customers**: Customer lifecycle and LTV
- **Webhooks**: Ensure all webhooks are processing successfully

### Application Monitoring
- **Railway Logs**: Monitor for payment processing errors
- **Firebase**: Check user subscription status updates
- **Frontend**: Monitor for payment flow completion rates

## 🆘 8. Troubleshooting

### Common Issues

#### **"Invalid API Key" Error**
- Verify `STRIPE_SECRET_KEY` is set correctly
- Ensure you're using the right key for test/live mode

#### **"Price not found" Error**
- Check that `STRIPE_PRICE_*` environment variables match your Stripe price IDs
- Verify prices exist in current mode (test/live)

#### **Webhook Not Received**
- Check webhook URL is accessible: `https://your-domain.com/api/payments/webhook`
- Verify webhook secret is correct
- Check Railway logs for webhook processing errors

#### **User Subscription Not Updating**
- Check Firebase service account permissions
- Verify webhook events are being processed
- Check Firestore security rules allow admin writes

#### **Customer Portal Not Working**
- Ensure customer portal is enabled in Stripe
- Check that customer has an active subscription
- Verify customer ID exists in user's Firebase document

## 📞 9. Support

### Documentation
- **Stripe Docs**: https://stripe.com/docs
- **Firebase Admin**: https://firebase.google.com/docs/admin
- **Railway Deployment**: https://docs.railway.app

### Testing Resources
- **Test Cards**: https://stripe.com/docs/testing#cards
- **Webhook Testing**: https://stripe.com/docs/webhooks/test

---

## 🎯 Next Steps After Setup

1. **Test thoroughly** with test cards and webhook events
2. **Monitor logs** for any errors during the first few transactions
3. **Set up analytics** to track conversion rates and subscription metrics
4. **Configure email notifications** for failed payments and subscription updates
5. **Plan for customer support** workflows for payment-related inquiries

## 💡 Additional Considerations

### Security
- Never expose secret keys on the frontend
- Always validate webhook signatures
- Use HTTPS for all payment-related endpoints
- Regularly rotate API keys

### User Experience
- Clear messaging about trial periods and billing
- Easy cancellation process
- Transparent pricing with no hidden fees
- Responsive payment flow on mobile devices

### Business Operations
- Set up reconciliation processes
- Monitor for failed payments and dunning
- Plan for tax compliance as you scale
- Consider implementing usage-based billing for future plans

---

**🎉 Congratulations!** Your Stripe integration is now ready for production. The system will automatically handle subscriptions, trials, cancellations, and keep user access in sync with their payment status.