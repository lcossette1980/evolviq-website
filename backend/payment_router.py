"""
Payment Router for handling Stripe checkout and payment operations
"""

from fastapi import APIRouter, HTTPException, Depends, Request
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)

# Create router
payment_router = APIRouter(prefix="/api/payments", tags=["payments"])

# Import dependencies
from premium_verification import premium_verification

# Pydantic models
class CheckoutSessionRequest(BaseModel):
    plan_id: str
    success_url: str
    cancel_url: str
    customer_email: Optional[EmailStr] = None
    metadata: Optional[Dict[str, Any]] = None

# Dependency to get current user
async def get_current_user(request: Request) -> dict:
    """Get current user from Firebase token"""
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Authorization required")
    
    # Verify Firebase token
    user_data = await premium_verification.verify_firebase_token(auth_header)
    return user_data

@payment_router.post("/create-checkout-session")
async def create_checkout_session(
    checkout_data: CheckoutSessionRequest,
    current_user: dict = Depends(get_current_user)
):
    """Create a Stripe checkout session for premium subscription"""
    try:
        # Get stripe integration
        from main import stripe_integration
        
        if not stripe_integration:
            raise HTTPException(status_code=503, detail="Payment service unavailable")
        
        # Use user email if not provided
        customer_email = checkout_data.customer_email or current_user.get('email')
        
        # Create metadata including user ID
        metadata = checkout_data.metadata or {}
        metadata['firebase_uid'] = current_user['uid']
        metadata['user_email'] = customer_email
        
        # Create checkout session
        session = await stripe_integration.create_checkout_session(
            current_user['uid'],  # user_id
            customer_email,       # email
            checkout_data.plan_id,
            checkout_data.success_url,
            checkout_data.cancel_url,
            current_user.get('displayName') or current_user.get('name')  # name
        )
        
        return {
            "session_id": session['session_id'],
            "checkout_url": session['session_url']
        }
        
    except Exception as e:
        logger.error(f"Failed to create checkout session: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@payment_router.get("/subscription-status")
async def get_subscription_status(
    current_user: dict = Depends(get_current_user)
):
    """Get current subscription status for the user"""
    try:
        # Get stripe integration
        from main import stripe_integration
        
        if not stripe_integration:
            raise HTTPException(status_code=503, detail="Payment service unavailable")
        
        # Get Stripe customer ID
        customer_id = await premium_verification.get_stripe_customer_id(
            current_user['uid'],
            current_user['email']
        )
        
        if not customer_id:
            return {
                "has_subscription": False,
                "subscription_status": None,
                "current_period_end": None
            }
        
        # Get subscription from Stripe
        subscriptions = await stripe_integration.get_customer_subscriptions(customer_id)
        
        if not subscriptions:
            return {
                "has_subscription": False,
                "subscription_status": None,
                "current_period_end": None
            }
        
        # Return the first active subscription
        active_sub = next((s for s in subscriptions if s.status == 'active'), None)
        
        if active_sub:
            return {
                "has_subscription": True,
                "subscription_status": active_sub.status,
                "current_period_end": active_sub.current_period_end,
                "plan_name": active_sub.items.data[0].price.nickname if active_sub.items.data else None
            }
        else:
            return {
                "has_subscription": False,
                "subscription_status": subscriptions[0].status if subscriptions else None,
                "current_period_end": None
            }
            
    except Exception as e:
        logger.error(f"Failed to get subscription status: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@payment_router.post("/cancel-subscription")
async def cancel_subscription(
    current_user: dict = Depends(get_current_user)
):
    """Cancel the user's subscription"""
    try:
        # Get stripe integration
        from main import stripe_integration
        
        if not stripe_integration:
            raise HTTPException(status_code=503, detail="Payment service unavailable")
        
        # Get Stripe customer ID
        customer_id = await premium_verification.get_stripe_customer_id(
            current_user['uid'],
            current_user['email']
        )
        
        if not customer_id:
            raise HTTPException(status_code=404, detail="No subscription found")
        
        # Cancel subscription
        result = await stripe_integration.cancel_subscription(customer_id)
        
        return {
            "success": True,
            "message": "Subscription will be cancelled at the end of the current billing period"
        }
        
    except Exception as e:
        logger.error(f"Failed to cancel subscription: {e}")
        raise HTTPException(status_code=500, detail=str(e))