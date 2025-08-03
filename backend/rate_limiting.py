"""
Rate Limiting System for API Protection
Prevents abuse and ensures fair resource usage
"""

from fastapi import HTTPException, Request
from typing import Dict, Optional, Tuple
from datetime import datetime, timedelta
import asyncio
import logging
from collections import defaultdict
import time

logger = logging.getLogger(__name__)

# Rate limit configurations
RATE_LIMITS = {
    # Format: (requests, window_seconds)
    "default": (60, 60),  # 60 requests per minute
    "ml_tools": (10, 60),  # 10 ML operations per minute
    "file_upload": (20, 300),  # 20 uploads per 5 minutes
    "admin": (100, 60),  # 100 admin requests per minute
    "premium": (200, 60),  # 200 requests per minute for premium users
    "assessment": (5, 300),  # 5 assessments per 5 minutes
    "export": (30, 300),  # 30 exports per 5 minutes
}

# In-memory storage for rate limiting (consider Redis for production)
request_counts = defaultdict(lambda: defaultdict(list))
blocked_ips = {}  # IP: block_until_timestamp

class RateLimiter:
    """Rate limiting implementation"""
    
    def __init__(self):
        logger.info("✅ Rate limiting system initialized")
        # Start cleanup task
        asyncio.create_task(self._cleanup_task())
    
    async def _cleanup_task(self):
        """Periodic cleanup of old request records"""
        while True:
            try:
                await asyncio.sleep(300)  # Run every 5 minutes
                current_time = time.time()
                
                # Clean up request counts
                for key in list(request_counts.keys()):
                    for window in list(request_counts[key].keys()):
                        # Remove timestamps older than the longest window
                        request_counts[key][window] = [
                            ts for ts in request_counts[key][window]
                            if current_time - ts < 600  # Keep last 10 minutes
                        ]
                        # Remove empty windows
                        if not request_counts[key][window]:
                            del request_counts[key][window]
                    # Remove empty keys
                    if not request_counts[key]:
                        del request_counts[key]
                
                # Clean up expired blocks
                for ip in list(blocked_ips.keys()):
                    if current_time > blocked_ips[ip]:
                        del blocked_ips[ip]
                        logger.info(f"Unblocked IP: {ip}")
                        
            except Exception as e:
                logger.error(f"Error in cleanup task: {e}")
    
    def _get_client_id(self, request: Request, user_id: Optional[str] = None) -> str:
        """Get unique client identifier"""
        if user_id:
            return f"user_{user_id}"
        
        # Try to get real IP from headers
        forwarded_for = request.headers.get("X-Forwarded-For")
        if forwarded_for:
            # Take the first IP in the chain
            client_ip = forwarded_for.split(",")[0].strip()
        else:
            client_ip = request.headers.get("X-Real-IP", request.client.host)
        
        return f"ip_{client_ip}"
    
    def _check_blocked(self, client_id: str):
        """Check if client is blocked"""
        if client_id in blocked_ips:
            block_until = blocked_ips[client_id]
            if time.time() < block_until:
                remaining = int(block_until - time.time())
                raise HTTPException(
                    status_code=429,
                    detail=f"Too many requests. Blocked for {remaining} seconds."
                )
            else:
                del blocked_ips[client_id]
    
    async def check_rate_limit(
        self, 
        request: Request, 
        limit_type: str = "default",
        user_id: Optional[str] = None,
        is_premium: bool = False
    ) -> Dict[str, any]:
        """Check if request should be rate limited"""
        
        # Get client identifier
        client_id = self._get_client_id(request, user_id)
        
        # Check if blocked
        self._check_blocked(client_id)
        
        # Use premium limits if applicable
        if is_premium and limit_type == "default":
            limit_type = "premium"
        
        # Get rate limit configuration
        if limit_type not in RATE_LIMITS:
            limit_type = "default"
        
        max_requests, window_seconds = RATE_LIMITS[limit_type]
        
        # Get current time
        current_time = time.time()
        window_start = current_time - window_seconds
        
        # Get request timestamps for this client and window
        window_key = f"{limit_type}_{window_seconds}"
        timestamps = request_counts[client_id][window_key]
        
        # Remove old timestamps
        timestamps[:] = [ts for ts in timestamps if ts > window_start]
        
        # Check if limit exceeded
        if len(timestamps) >= max_requests:
            # Calculate when the oldest request will expire
            oldest_timestamp = min(timestamps)
            retry_after = int(oldest_timestamp + window_seconds - current_time) + 1
            
            # Check for repeat offenders
            violation_key = f"violations_{client_id}"
            violations = request_counts[violation_key].get("count", [])
            violations.append(current_time)
            # Keep violations from last hour
            violations[:] = [v for v in violations if current_time - v < 3600]
            request_counts[violation_key]["count"] = violations
            
            # Block repeat offenders
            if len(violations) > 10:  # More than 10 violations in an hour
                block_duration = min(3600, 300 * (len(violations) - 10))  # Up to 1 hour
                blocked_ips[client_id] = current_time + block_duration
                logger.warning(f"Blocked {client_id} for {block_duration}s due to repeated violations")
            
            raise HTTPException(
                status_code=429,
                detail=f"Rate limit exceeded. Try again in {retry_after} seconds.",
                headers={"Retry-After": str(retry_after)}
            )
        
        # Add current timestamp
        timestamps.append(current_time)
        
        # Return rate limit info
        return {
            "limit": max_requests,
            "remaining": max_requests - len(timestamps),
            "reset": int(current_time + window_seconds),
            "window": window_seconds
        }
    
    async def get_rate_limit_headers(
        self,
        limit_info: Dict[str, any]
    ) -> Dict[str, str]:
        """Get rate limit headers for response"""
        return {
            "X-RateLimit-Limit": str(limit_info["limit"]),
            "X-RateLimit-Remaining": str(limit_info["remaining"]),
            "X-RateLimit-Reset": str(limit_info["reset"]),
            "X-RateLimit-Window": str(limit_info["window"])
        }

# Create singleton instance
rate_limiter = RateLimiter()

# FastAPI dependencies
async def rate_limit_default(request: Request):
    """Default rate limiting dependency"""
    return await rate_limiter.check_rate_limit(request, "default")

async def rate_limit_ml_tools(request: Request):
    """Rate limiting for ML tools"""
    return await rate_limiter.check_rate_limit(request, "ml_tools")

async def rate_limit_file_upload(request: Request):
    """Rate limiting for file uploads"""
    return await rate_limiter.check_rate_limit(request, "file_upload")

async def rate_limit_assessment(request: Request):
    """Rate limiting for assessments"""
    return await rate_limiter.check_rate_limit(request, "assessment")

async def rate_limit_export(request: Request):
    """Rate limiting for exports"""
    return await rate_limiter.check_rate_limit(request, "export")

# Advanced rate limiting with user context
async def rate_limit_with_user(
    request: Request,
    limit_type: str = "default",
    user_data: Optional[Dict] = None
):
    """Rate limiting that considers user context"""
    user_id = user_data.get("user_id") if user_data else None
    is_premium = user_data.get("is_premium", False) if user_data else False
    
    return await rate_limiter.check_rate_limit(
        request, 
        limit_type, 
        user_id=user_id,
        is_premium=is_premium
    )