"""
Persistent session storage using Redis or fallback to file-based storage
Replaces in-memory session storage for production use
"""

import json
import os
import pickle
import redis
import logging
from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
from pathlib import Path
import asyncio
from dataclasses import dataclass, asdict
import pandas as pd
import numpy as np

logger = logging.getLogger(__name__)

# Redis configuration
REDIS_HOST = os.getenv("REDIS_HOST", "localhost")
REDIS_PORT = int(os.getenv("REDIS_PORT", "6379"))
REDIS_DB = int(os.getenv("REDIS_DB", "0"))
REDIS_PASSWORD = os.getenv("REDIS_PASSWORD")

# Session configuration
SESSION_TTL = int(os.getenv("SESSION_TTL_HOURS", "24")) * 3600  # Default 24 hours
SESSION_CLEANUP_INTERVAL = 3600  # Clean up expired sessions every hour

@dataclass
class SessionMetadata:
    """Session metadata structure"""
    session_id: str
    tool_type: str
    user_id: Optional[str]
    created_at: datetime
    updated_at: datetime
    expires_at: datetime
    status: str
    name: str
    description: Optional[str]
    
    def to_dict(self):
        data = asdict(self)
        # Convert datetime objects to ISO format
        for key in ['created_at', 'updated_at', 'expires_at']:
            if key in data and data[key]:
                data[key] = data[key].isoformat()
        return data
    
    @classmethod
    def from_dict(cls, data: Dict[str, Any]):
        # Convert ISO strings back to datetime
        for key in ['created_at', 'updated_at', 'expires_at']:
            if key in data and data[key]:
                if isinstance(data[key], str):
                    data[key] = datetime.fromisoformat(data[key])
        return cls(**data)

class SessionStorage:
    """Abstract base class for session storage"""
    
    async def save_session(self, session_id: str, data: Dict[str, Any], ttl: int = SESSION_TTL):
        raise NotImplementedError
    
    async def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        raise NotImplementedError
    
    async def delete_session(self, session_id: str) -> bool:
        raise NotImplementedError
    
    async def list_sessions(self, user_id: Optional[str] = None) -> List[SessionMetadata]:
        raise NotImplementedError
    
    async def cleanup_expired_sessions(self):
        raise NotImplementedError

class RedisSessionStorage(SessionStorage):
    """Redis-based session storage"""
    
    def __init__(self):
        try:
            self.redis_client = redis.Redis(
                host=REDIS_HOST,
                port=REDIS_PORT,
                db=REDIS_DB,
                password=REDIS_PASSWORD,
                decode_responses=False  # We'll handle encoding/decoding
            )
            # Test connection
            self.redis_client.ping()
            logger.info("✅ Redis session storage initialized")
        except Exception as e:
            logger.error(f"Failed to connect to Redis: {e}")
            raise
    
    def _serialize_data(self, data: Dict[str, Any]) -> bytes:
        """Serialize session data for storage"""
        # Handle special types
        serializable_data = {}
        
        for key, value in data.items():
            if isinstance(value, pd.DataFrame):
                # Store DataFrames as dict with type marker
                serializable_data[key] = {
                    "_type": "dataframe",
                    "data": value.to_dict('records'),
                    "columns": list(value.columns),
                    "index": list(value.index)
                }
            elif isinstance(value, np.ndarray):
                # Store numpy arrays
                serializable_data[key] = {
                    "_type": "ndarray",
                    "data": value.tolist(),
                    "shape": value.shape,
                    "dtype": str(value.dtype)
                }
            elif isinstance(value, datetime):
                serializable_data[key] = {
                    "_type": "datetime",
                    "data": value.isoformat()
                }
            else:
                serializable_data[key] = value
        
        return pickle.dumps(serializable_data)
    
    def _deserialize_data(self, data: bytes) -> Dict[str, Any]:
        """Deserialize session data from storage"""
        deserialized = pickle.loads(data)
        
        # Reconstruct special types
        for key, value in deserialized.items():
            if isinstance(value, dict) and "_type" in value:
                if value["_type"] == "dataframe":
                    deserialized[key] = pd.DataFrame(
                        value["data"],
                        columns=value["columns"]
                    )
                elif value["_type"] == "ndarray":
                    deserialized[key] = np.array(
                        value["data"],
                        dtype=value["dtype"]
                    ).reshape(value["shape"])
                elif value["_type"] == "datetime":
                    deserialized[key] = datetime.fromisoformat(value["data"])
        
        return deserialized
    
    async def save_session(self, session_id: str, data: Dict[str, Any], ttl: int = SESSION_TTL):
        """Save session data to Redis"""
        try:
            # Create metadata
            metadata = SessionMetadata(
                session_id=session_id,
                tool_type=data.get('tool_type', 'unknown'),
                user_id=data.get('user_id'),
                created_at=data.get('created_at', datetime.now()),
                updated_at=datetime.now(),
                expires_at=datetime.now() + timedelta(seconds=ttl),
                status=data.get('status', 'active'),
                name=data.get('name', 'Untitled Session'),
                description=data.get('description')
            )
            
            # Save metadata
            metadata_key = f"session:metadata:{session_id}"
            self.redis_client.setex(
                metadata_key,
                ttl,
                json.dumps(metadata.to_dict())
            )
            
            # Save session data
            data_key = f"session:data:{session_id}"
            serialized = self._serialize_data(data)
            self.redis_client.setex(data_key, ttl, serialized)
            
            # Add to user's session list if user_id provided
            if metadata.user_id:
                user_sessions_key = f"user:sessions:{metadata.user_id}"
                self.redis_client.sadd(user_sessions_key, session_id)
                self.redis_client.expire(user_sessions_key, ttl)
            
            logger.info(f"Session {session_id} saved to Redis (TTL: {ttl}s)")
            
        except Exception as e:
            logger.error(f"Failed to save session to Redis: {e}")
            raise
    
    async def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get session data from Redis"""
        try:
            data_key = f"session:data:{session_id}"
            data = self.redis_client.get(data_key)
            
            if not data:
                return None
            
            # Update expiration on access
            ttl = self.redis_client.ttl(data_key)
            if ttl > 0:
                self.redis_client.expire(data_key, SESSION_TTL)
                metadata_key = f"session:metadata:{session_id}"
                self.redis_client.expire(metadata_key, SESSION_TTL)
            
            return self._deserialize_data(data)
            
        except Exception as e:
            logger.error(f"Failed to get session from Redis: {e}")
            return None
    
    async def delete_session(self, session_id: str) -> bool:
        """Delete session from Redis"""
        try:
            # Get metadata to find user_id
            metadata_key = f"session:metadata:{session_id}"
            metadata_data = self.redis_client.get(metadata_key)
            
            if metadata_data:
                metadata = json.loads(metadata_data)
                user_id = metadata.get('user_id')
                
                # Remove from user's session list
                if user_id:
                    user_sessions_key = f"user:sessions:{user_id}"
                    self.redis_client.srem(user_sessions_key, session_id)
            
            # Delete session data and metadata
            data_key = f"session:data:{session_id}"
            deleted = self.redis_client.delete(data_key, metadata_key)
            
            return deleted > 0
            
        except Exception as e:
            logger.error(f"Failed to delete session from Redis: {e}")
            return False
    
    async def list_sessions(self, user_id: Optional[str] = None) -> List[SessionMetadata]:
        """List all sessions or sessions for a specific user"""
        sessions = []
        
        try:
            if user_id:
                # Get user's sessions
                user_sessions_key = f"user:sessions:{user_id}"
                session_ids = self.redis_client.smembers(user_sessions_key)
                
                for session_id in session_ids:
                    metadata_key = f"session:metadata:{session_id.decode()}"
                    metadata_data = self.redis_client.get(metadata_key)
                    if metadata_data:
                        metadata = SessionMetadata.from_dict(json.loads(metadata_data))
                        sessions.append(metadata)
            else:
                # Get all sessions (scan for metadata keys)
                cursor = 0
                while True:
                    cursor, keys = self.redis_client.scan(
                        cursor, 
                        match="session:metadata:*",
                        count=100
                    )
                    
                    for key in keys:
                        metadata_data = self.redis_client.get(key)
                        if metadata_data:
                            metadata = SessionMetadata.from_dict(json.loads(metadata_data))
                            sessions.append(metadata)
                    
                    if cursor == 0:
                        break
            
            # Sort by updated_at descending
            sessions.sort(key=lambda x: x.updated_at, reverse=True)
            
            return sessions
            
        except Exception as e:
            logger.error(f"Failed to list sessions: {e}")
            return []
    
    async def cleanup_expired_sessions(self):
        """Clean up expired sessions (Redis handles this automatically with TTL)"""
        # Redis automatically removes expired keys
        # This method can be used for additional cleanup if needed
        logger.info("Redis handles session expiration automatically via TTL")

class FileSessionStorage(SessionStorage):
    """File-based session storage (fallback when Redis is not available)"""
    
    def __init__(self, storage_path: str = "/tmp/ml_sessions"):
        self.storage_path = Path(storage_path)
        self.storage_path.mkdir(parents=True, exist_ok=True)
        logger.info(f"✅ File session storage initialized at {self.storage_path}")
    
    def _get_session_path(self, session_id: str) -> Path:
        return self.storage_path / f"{session_id}.session"
    
    def _get_metadata_path(self, session_id: str) -> Path:
        return self.storage_path / f"{session_id}.metadata"
    
    async def save_session(self, session_id: str, data: Dict[str, Any], ttl: int = SESSION_TTL):
        """Save session data to file"""
        try:
            # Create metadata
            metadata = SessionMetadata(
                session_id=session_id,
                tool_type=data.get('tool_type', 'unknown'),
                user_id=data.get('user_id'),
                created_at=data.get('created_at', datetime.now()),
                updated_at=datetime.now(),
                expires_at=datetime.now() + timedelta(seconds=ttl),
                status=data.get('status', 'active'),
                name=data.get('name', 'Untitled Session'),
                description=data.get('description')
            )
            
            # Save metadata
            metadata_path = self._get_metadata_path(session_id)
            with open(metadata_path, 'w') as f:
                json.dump(metadata.to_dict(), f)
            
            # Save session data
            data_path = self._get_session_path(session_id)
            with open(data_path, 'wb') as f:
                pickle.dump(data, f)
            
            logger.info(f"Session {session_id} saved to file")
            
        except Exception as e:
            logger.error(f"Failed to save session to file: {e}")
            raise
    
    async def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get session data from file"""
        try:
            data_path = self._get_session_path(session_id)
            metadata_path = self._get_metadata_path(session_id)
            
            if not data_path.exists():
                return None
            
            # Check expiration
            if metadata_path.exists():
                with open(metadata_path, 'r') as f:
                    metadata = SessionMetadata.from_dict(json.load(f))
                
                if metadata.expires_at < datetime.now():
                    # Session expired
                    await self.delete_session(session_id)
                    return None
            
            # Load session data
            with open(data_path, 'rb') as f:
                return pickle.load(f)
            
        except Exception as e:
            logger.error(f"Failed to get session from file: {e}")
            return None
    
    async def delete_session(self, session_id: str) -> bool:
        """Delete session files"""
        try:
            data_path = self._get_session_path(session_id)
            metadata_path = self._get_metadata_path(session_id)
            
            deleted = False
            if data_path.exists():
                data_path.unlink()
                deleted = True
            
            if metadata_path.exists():
                metadata_path.unlink()
                deleted = True
            
            return deleted
            
        except Exception as e:
            logger.error(f"Failed to delete session files: {e}")
            return False
    
    async def list_sessions(self, user_id: Optional[str] = None) -> List[SessionMetadata]:
        """List all sessions or sessions for a specific user"""
        sessions = []
        
        try:
            for metadata_file in self.storage_path.glob("*.metadata"):
                with open(metadata_file, 'r') as f:
                    metadata = SessionMetadata.from_dict(json.load(f))
                
                # Filter by user if specified
                if user_id and metadata.user_id != user_id:
                    continue
                
                # Skip expired sessions
                if metadata.expires_at < datetime.now():
                    continue
                
                sessions.append(metadata)
            
            # Sort by updated_at descending
            sessions.sort(key=lambda x: x.updated_at, reverse=True)
            
            return sessions
            
        except Exception as e:
            logger.error(f"Failed to list sessions: {e}")
            return []
    
    async def cleanup_expired_sessions(self):
        """Clean up expired session files"""
        try:
            current_time = datetime.now()
            cleaned = 0
            
            for metadata_file in self.storage_path.glob("*.metadata"):
                try:
                    with open(metadata_file, 'r') as f:
                        metadata = SessionMetadata.from_dict(json.load(f))
                    
                    if metadata.expires_at < current_time:
                        session_id = metadata_file.stem.replace('.metadata', '')
                        await self.delete_session(session_id)
                        cleaned += 1
                
                except Exception as e:
                    logger.error(f"Error processing {metadata_file}: {e}")
            
            if cleaned > 0:
                logger.info(f"Cleaned up {cleaned} expired sessions")
                
        except Exception as e:
            logger.error(f"Failed to cleanup expired sessions: {e}")

# Factory function to create appropriate storage
def create_session_storage() -> SessionStorage:
    """Create session storage instance based on availability"""
    try:
        # Try Redis first
        return RedisSessionStorage()
    except Exception as e:
        logger.warning(f"Redis not available ({e}), falling back to file storage")
        return FileSessionStorage()

# Global storage instance
session_storage = create_session_storage()

# Background task for cleanup
async def session_cleanup_task():
    """Periodic session cleanup"""
    while True:
        try:
            await asyncio.sleep(SESSION_CLEANUP_INTERVAL)
            await session_storage.cleanup_expired_sessions()
        except Exception as e:
            logger.error(f"Session cleanup error: {e}")