"""
Server-side Admin Authentication System
CRITICAL: This is the ONLY source of truth for admin access
Client-side admin claims are NEVER trusted
"""

from fastapi import HTTPException, Depends, Request
from firebase_admin import auth
import os
import logging
from typing import Dict, Optional, List, Any
from datetime import datetime, timedelta
import json

logger = logging.getLogger(__name__)

# Load admin emails from environment variable
ADMIN_EMAILS = os.getenv("ADMIN_EMAILS", "").split(",")
ADMIN_EMAILS = [email.strip() for email in ADMIN_EMAILS if email.strip()]

# Cache for admin verification (with TTL)
admin_cache = {}
CACHE_TTL = timedelta(minutes=5)  # Cache admin status for 5 minutes

class AdminAuth:
    """Handles server-side admin authentication and authorization"""
    
    def __init__(self):
        if not ADMIN_EMAILS:
            logger.warning("⚠️  No ADMIN_EMAILS configured - admin system disabled!")
        else:
            logger.info(f"✅ Admin system initialized with {len(ADMIN_EMAILS)} admin emails")
    
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
    
    def is_admin_email(self, email: str) -> bool:
        """Check if email is in admin list"""
        return email in ADMIN_EMAILS
    
    async def verify_admin_access(self, request: Request) -> Dict[str, Any]:
        """
        Main admin verification function
        This is the ONLY way to verify admin access
        """
        # Get authorization header
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            raise HTTPException(status_code=401, detail="Authorization required")
        
        # Verify Firebase token
        token_data = await self.verify_firebase_token(auth_header)
        user_id = token_data.get("uid")
        email = token_data.get("email", "")
        
        # Check cache first
        cache_key = f"admin_{user_id}"
        if cache_key in admin_cache:
            cached_data, cache_time = admin_cache[cache_key]
            if datetime.now() - cache_time < CACHE_TTL:
                if cached_data["is_admin"]:
                    return cached_data
                else:
                    raise HTTPException(status_code=403, detail="Admin access required")
        
        # Verify admin status
        is_admin = self.is_admin_email(email)
        
        # Create admin data
        admin_data = {
            "user_id": user_id,
            "email": email,
            "is_admin": is_admin,
            "verified_at": datetime.now().isoformat(),
            "admin_level": "full" if is_admin else None
        }
        
        # Cache the result
        admin_cache[cache_key] = (admin_data, datetime.now())
        
        if not is_admin:
            logger.warning(f"Admin access denied for user {email} (uid: {user_id})")
            raise HTTPException(status_code=403, detail="Admin access required")
        
        logger.info(f"Admin access granted for {email} (uid: {user_id})")
        return admin_data
    
    async def clear_admin_cache(self, user_id: Optional[str] = None):
        """Clear admin cache - useful when admin list changes"""
        if user_id:
            cache_key = f"admin_{user_id}"
            if cache_key in admin_cache:
                del admin_cache[cache_key]
        else:
            admin_cache.clear()
    
    async def add_admin(self, email: str) -> bool:
        """Add a new admin (requires updating environment variable)"""
        if email not in ADMIN_EMAILS:
            ADMIN_EMAILS.append(email)
            # Note: This only updates the running instance
            # You need to update the actual environment variable for persistence
            logger.info(f"Added {email} to admin list (runtime only)")
            await self.clear_admin_cache()
            return True
        return False
    
    async def remove_admin(self, email: str) -> bool:
        """Remove an admin (requires updating environment variable)"""
        if email in ADMIN_EMAILS:
            ADMIN_EMAILS.remove(email)
            # Note: This only updates the running instance
            # You need to update the actual environment variable for persistence
            logger.info(f"Removed {email} from admin list (runtime only)")
            await self.clear_admin_cache()
            return True
        return False
    
    def get_admin_list(self) -> List[str]:
        """Get current list of admin emails"""
        return ADMIN_EMAILS.copy()

# Create singleton instance
admin_auth = AdminAuth()

# Dependency for FastAPI routes
async def verify_admin_access(request: Request) -> Dict[str, Any]:
    """FastAPI dependency for admin routes"""
    return await admin_auth.verify_admin_access(request)

# Dependency for getting current user (not necessarily admin)
async def get_current_user(request: Request) -> Dict[str, Any]:
    """Get current authenticated user (may not be admin)"""
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        raise HTTPException(status_code=401, detail="Authorization required")
    
    token_data = await admin_auth.verify_firebase_token(auth_header)
    return {
        "user_id": token_data.get("uid"),
        "email": token_data.get("email", ""),
        "is_admin": admin_auth.is_admin_email(token_data.get("email", ""))
    }