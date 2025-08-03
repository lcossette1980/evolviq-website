"""
Server-side Premium Status Verification
CRITICAL: Stripe is the ONLY source of truth for premium status
Client-side premium claims are NEVER trusted
"""

from fastapi import HTTPException, Depends, Request
from firebase_admin import auth, firestore
import stripe
import os
import logging
from typing import Dict, Optional, List
from datetime import datetime, timedelta
from dataclasses import dataclass
import asyncio

logger = logging.getLogger(__name__)

# Initialize Stripe
stripe.api_key = os.getenv("STRIPE_SECRET_KEY")
if not stripe.api_key:
    logger.error("⚠️  STRIPE_SECRET_KEY not configured!")

# Firestore client (lazy initialization)
db = None

def get_db():
    global db
    if db is None:
        try:
            db = firestore.client()
        except Exception as e:
            logger.error(f"Failed to initialize Firestore: {e}")
            return None
    return db

# Cache for premium verification (with TTL)
premium_cache = {}
CACHE_TTL = timedelta(minutes=15)  # Cache premium status for 15 minutes

@dataclass
class PremiumStatus:
    """Premium subscription status"""
    is_premium: bool
    subscription_id: Optional[str] = None
    status: Optional[str] = None  # active, trialing, past_due, canceled, etc.
    current_period_end: Optional[datetime] = None
    plan_name: Optional[str] = None
    features: List[str] = None
    
    def dict(self):
        return {
            "is_premium": self.is_premium,
            "subscription_id": self.subscription_id,
            "status": self.status,
            "current_period_end": self.current_period_end.isoformat() if self.current_period_end else None,
            "plan_name": self.plan_name,
            "features": self.features or []
        }

class PremiumVerification:
    """Handles server-side premium status verification"""
    
    def __init__(self):
        if not stripe.api_key:
            logger.warning("⚠️  Stripe not configured - premium features disabled!")
        else:
            logger.info("✅ Premium verification system initialized")
    
    async def verify_firebase_token(self, auth_header: str) -> Dict[str, Any]:
        """Verify Firebase ID token from Authorization header"""
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Invalid authorization header")
        
        token = auth_header.split(" ")[1]
        
        try:
            # Verify the Firebase ID token
            decoded_token = auth.verify_id_token(token)
            return decoded_token
        except Exception as e:
            logger.error(f"Token verification failed: {e}")
            raise HTTPException(status_code=401, detail="Invalid or expired token")
    
    async def get_stripe_customer_id(self, user_id: str, email: str) -> Optional[str]:
        """Get Stripe customer ID for a user"""
        try:
            # First check Firestore for stored customer ID
            db = get_db()
            if not db:
                return None
            user_doc = db.collection('users').document(user_id).get()
            if user_doc.exists:
                data = user_doc.to_dict()
                if 'stripe_customer_id' in data:
                    return data['stripe_customer_id']
            
            # If not found, search Stripe by email
            customers = stripe.Customer.list(email=email, limit=1)
            if customers.data:
                customer_id = customers.data[0].id
                # Store in Firestore for future use
                if db:
                    db.collection('users').document(user_id).set({
                    'stripe_customer_id': customer_id
                }, merge=True)
                return customer_id
            
            return None
        except Exception as e:
            logger.error(f"Error getting Stripe customer: {e}")
            return None
    
    async def check_stripe_subscription(self, customer_id: str) -> PremiumStatus:
        """Check subscription status in Stripe"""
        try:
            # Get active subscriptions
            subscriptions = stripe.Subscription.list(
                customer=customer_id,
                status='all',
                limit=10
            )
            
            # Find active or trialing subscription
            active_sub = None
            for sub in subscriptions.data:
                if sub.status in ['active', 'trialing']:
                    active_sub = sub
                    break
            
            if not active_sub:
                return PremiumStatus(is_premium=False)
            
            # Extract subscription details
            plan_name = active_sub.items.data[0].price.nickname if active_sub.items.data else "Premium"
            
            # Determine features based on plan
            features = self._get_plan_features(active_sub.items.data[0].price.id if active_sub.items.data else None)
            
            return PremiumStatus(
                is_premium=True,
                subscription_id=active_sub.id,
                status=active_sub.status,
                current_period_end=datetime.fromtimestamp(active_sub.current_period_end),
                plan_name=plan_name,
                features=features
            )
            
        except Exception as e:
            logger.error(f"Error checking Stripe subscription: {e}")
            return PremiumStatus(is_premium=False)
    
    def _get_plan_features(self, price_id: Optional[str]) -> List[str]:
        """Get features for a specific plan"""
        # Map price IDs to features
        # You should customize this based on your actual Stripe products
        feature_map = {
            # Example mappings - replace with your actual price IDs
            "price_1234": ["unlimited_assessments", "advanced_analytics", "priority_support"],
            "price_5678": ["basic_assessments", "standard_analytics"],
        }
        
        # Default premium features
        default_features = [
            "unlimited_ml_analysis",
            "advanced_exports",
            "priority_processing",
            "custom_models"
        ]
        
        return feature_map.get(price_id, default_features)
    
    async def sync_premium_status_from_stripe(self, user_id: str, email: str) -> PremiumStatus:
        """
        Main function to verify premium status
        This is the ONLY reliable way to check premium status
        """
        # Check cache first
        cache_key = f"premium_{user_id}"
        if cache_key in premium_cache:
            cached_data, cache_time = premium_cache[cache_key]
            if datetime.now() - cache_time < CACHE_TTL:
                return cached_data
        
        # Get Stripe customer ID
        customer_id = await self.get_stripe_customer_id(user_id, email)
        
        if not customer_id:
            # No Stripe customer = no premium
            status = PremiumStatus(is_premium=False)
        else:
            # Check Stripe subscription
            status = await self.check_stripe_subscription(customer_id)
        
        # Update Firestore with current status (for frontend reference only)
        try:
            db = get_db()
            if db:
                db.collection('users').document(user_id).set({
                    'premium_status': status.dict(),
                    'premium_verified_at': datetime.now().isoformat(),
                    'premium_verified_by': 'server'
                }, merge=True)
        except Exception as e:
            logger.error(f"Error updating Firestore: {e}")
        
        # Cache the result
        premium_cache[cache_key] = (status, datetime.now())
        
        return status
    
    async def verify_premium_access(self, request: Request) -> PremiumStatus:
        """FastAPI dependency for premium routes"""
        # Get authorization header
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            raise HTTPException(status_code=401, detail="Authorization required")
        
        # Verify Firebase token
        token_data = await self.verify_firebase_token(auth_header)
        user_id = token_data.get("uid")
        email = token_data.get("email", "")
        
        # Sync and verify premium status
        status = await self.sync_premium_status_from_stripe(user_id, email)
        
        if not status.is_premium:
            raise HTTPException(status_code=403, detail="Premium subscription required")
        
        return status
    
    async def clear_premium_cache(self, user_id: Optional[str] = None):
        """Clear premium cache - useful after subscription changes"""
        if user_id:
            cache_key = f"premium_{user_id}"
            if cache_key in premium_cache:
                del premium_cache[cache_key]
        else:
            premium_cache.clear()
    
    async def handle_stripe_webhook(self, event_type: str, event_data: Dict[str, Any]):
        """Handle Stripe webhook events to update premium status"""
        if event_type in ['customer.subscription.created', 'customer.subscription.updated', 
                         'customer.subscription.deleted', 'customer.subscription.trial_will_end']:
            # Extract customer ID
            customer_id = event_data.get('customer')
            if customer_id:
                # Find user by customer ID
                db = get_db()
                if not db:
                    return False
                users = db.collection('users').where('stripe_customer_id', '==', customer_id).get()
                for user in users:
                    user_id = user.id
                    # Clear cache to force refresh
                    await self.clear_premium_cache(user_id)
                    logger.info(f"Cleared premium cache for user {user_id} after {event_type}")

# Create singleton instance
premium_verification = PremiumVerification()

# FastAPI dependencies
async def verify_premium_access(request: Request) -> PremiumStatus:
    """Verify user has active premium subscription"""
    return await premium_verification.verify_premium_access(request)

async def get_premium_status(request: Request) -> PremiumStatus:
    """Get current premium status (doesn't require premium)"""
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Authorization required")
    
    token_data = await premium_verification.verify_firebase_token(auth_header)
    user_id = token_data.get("uid")
    email = token_data.get("email", "")
    
    return await premium_verification.sync_premium_status_from_stripe(user_id, email)