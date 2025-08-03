"""
Security utilities for input validation, file handling, and data sanitization
"""

from fastapi import HTTPException, UploadFile
import os
import hashlib
import magic
import tempfile
from typing import Dict, Any, Optional, List
import pandas as pd
import numpy as np
from pathlib import Path
import logging
import re
from datetime import datetime

logger = logging.getLogger(__name__)

# Security configurations
MAX_FILE_SIZE = 100 * 1024 * 1024  # 100MB
MAX_DATAFRAME_ROWS = 100000  # Maximum rows for DataFrames
MAX_DATAFRAME_MEMORY = 500 * 1024 * 1024  # 500MB max memory for DataFrame

ALLOWED_FILE_EXTENSIONS = {'.csv', '.xlsx', '.xls', '.json', '.tsv'}
ALLOWED_MIME_TYPES = {
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/json',
    'text/tab-separated-values',
    'text/plain'  # Some CSV files report as text/plain
}

# Dangerous patterns in filenames
DANGEROUS_PATTERNS = [
    r'\.\./',  # Directory traversal
    r'\.\.\\',  # Windows directory traversal
    r'^/',  # Absolute paths
    r'^~',  # Home directory
    r'\x00',  # Null bytes
    r'[<>:"|?*]',  # Windows forbidden characters
]

class SecurityUtils:
    """Security utilities for the application"""
    
    @staticmethod
    def validate_filename(filename: str) -> str:
        """Validate and sanitize filename"""
        if not filename:
            raise ValueError("Empty filename")
        
        # Check length
        if len(filename) > 255:
            raise ValueError("Filename too long")
        
        # Check for dangerous patterns
        for pattern in DANGEROUS_PATTERNS:
            if re.search(pattern, filename):
                raise ValueError(f"Dangerous pattern in filename: {pattern}")
        
        # Extract extension
        path = Path(filename)
        extension = path.suffix.lower()
        
        if extension not in ALLOWED_FILE_EXTENSIONS:
            raise ValueError(f"File type not allowed: {extension}")
        
        # Sanitize filename
        safe_name = re.sub(r'[^\w\s.-]', '_', path.stem)
        safe_name = safe_name.strip()[:200]  # Limit stem length
        
        return f"{safe_name}{extension}"
    
    @staticmethod
    async def validate_upload_file(file: UploadFile) -> Dict[str, Any]:
        """Comprehensive file upload validation"""
        # Validate filename
        try:
            safe_filename = SecurityUtils.validate_filename(file.filename)
        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))
        
        # Check file size (reading in chunks)
        file_size = 0
        chunk_size = 1024 * 1024  # 1MB chunks
        
        # Create temporary file for validation
        with tempfile.NamedTemporaryFile(delete=False) as tmp_file:
            tmp_path = tmp_file.name
            
            # Read and validate file size
            while True:
                chunk = await file.read(chunk_size)
                if not chunk:
                    break
                file_size += len(chunk)
                if file_size > MAX_FILE_SIZE:
                    os.unlink(tmp_path)
                    raise HTTPException(
                        status_code=413, 
                        detail=f"File too large. Maximum size is {MAX_FILE_SIZE // (1024*1024)}MB"
                    )
                tmp_file.write(chunk)
        
        # Reset file position
        await file.seek(0)
        
        # Validate MIME type
        try:
            mime = magic.Magic(mime=True)
            file_mime = mime.from_file(tmp_path)
            
            if file_mime not in ALLOWED_MIME_TYPES:
                os.unlink(tmp_path)
                raise HTTPException(
                    status_code=400,
                    detail=f"File type not allowed: {file_mime}"
                )
        except Exception as e:
            logger.warning(f"MIME type detection failed: {e}, continuing with extension check")
        
        # Calculate file hash for deduplication
        file_hash = SecurityUtils.calculate_file_hash(tmp_path)
        
        # Clean up temp file
        os.unlink(tmp_path)
        
        return {
            "filename": safe_filename,
            "size": file_size,
            "hash": file_hash,
            "mime_type": file_mime if 'file_mime' in locals() else None
        }
    
    @staticmethod
    def calculate_file_hash(file_path: str) -> str:
        """Calculate SHA-256 hash of a file"""
        sha256_hash = hashlib.sha256()
        with open(file_path, "rb") as f:
            for byte_block in iter(lambda: f.read(4096), b""):
                sha256_hash.update(byte_block)
        return sha256_hash.hexdigest()
    
    @staticmethod
    def validate_dataframe_size(df: pd.DataFrame) -> Dict[str, Any]:
        """Validate DataFrame size and memory usage"""
        # Check row count
        row_count = len(df)
        if row_count > MAX_DATAFRAME_ROWS:
            raise ValueError(f"Dataset too large: {row_count} rows (max: {MAX_DATAFRAME_ROWS})")
        
        # Check memory usage
        memory_usage = df.memory_usage(deep=True).sum()
        if memory_usage > MAX_DATAFRAME_MEMORY:
            raise ValueError(
                f"Dataset uses too much memory: {memory_usage // (1024*1024)}MB "
                f"(max: {MAX_DATAFRAME_MEMORY // (1024*1024)}MB)"
            )
        
        return {
            "rows": row_count,
            "columns": len(df.columns),
            "memory_mb": round(memory_usage / (1024 * 1024), 2)
        }
    
    @staticmethod
    def serialize_dataframe_safely(
        df: pd.DataFrame, 
        max_rows: int = 1000,
        include_stats: bool = True
    ) -> Dict[str, Any]:
        """Safely serialize DataFrame to dict with size limits"""
        result = {}
        
        # Add statistics if requested
        if include_stats:
            result['stats'] = {
                'total_rows': len(df),
                'total_columns': len(df.columns),
                'memory_mb': round(df.memory_usage(deep=True).sum() / (1024 * 1024), 2)
            }
        
        # Handle truncation
        if len(df) > max_rows:
            result['data'] = df.head(max_rows).to_dict('records')
            result['truncated'] = True
            result['rows_shown'] = max_rows
            result['message'] = f'Showing first {max_rows} rows of {len(df)} total'
        else:
            result['data'] = df.to_dict('records')
            result['truncated'] = False
            result['rows_shown'] = len(df)
        
        return result
    
    @staticmethod
    def sanitize_input(value: Any, max_length: int = 10000) -> Any:
        """Sanitize user input to prevent injection attacks"""
        if isinstance(value, str):
            # Remove null bytes
            value = value.replace('\x00', '')
            
            # Limit length
            if len(value) > max_length:
                value = value[:max_length]
            
            # Remove control characters (except newlines and tabs)
            value = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', value)
            
            return value.strip()
        
        elif isinstance(value, (list, tuple)):
            return [SecurityUtils.sanitize_input(item, max_length) for item in value]
        
        elif isinstance(value, dict):
            return {
                key: SecurityUtils.sanitize_input(val, max_length) 
                for key, val in value.items()
            }
        
        return value
    
    @staticmethod
    def validate_column_names(columns: List[str]) -> List[str]:
        """Validate and sanitize DataFrame column names"""
        sanitized = []
        
        for col in columns:
            # Remove special characters that could cause issues
            clean_col = re.sub(r'[^\w\s.-]', '_', str(col))
            clean_col = clean_col.strip()
            
            # Ensure unique names
            if clean_col in sanitized:
                i = 1
                while f"{clean_col}_{i}" in sanitized:
                    i += 1
                clean_col = f"{clean_col}_{i}"
            
            sanitized.append(clean_col)
        
        return sanitized
    
    @staticmethod
    def validate_ml_config(config: Dict[str, Any]) -> Dict[str, Any]:
        """Validate ML configuration parameters"""
        validated = {}
        
        # Validate test size
        test_size = config.get('test_size', 0.2)
        if not 0.05 <= test_size <= 0.5:
            raise ValueError("test_size must be between 0.05 and 0.5")
        validated['test_size'] = test_size
        
        # Validate random state
        random_state = config.get('random_state', 42)
        if not isinstance(random_state, int) or random_state < 0:
            raise ValueError("random_state must be a non-negative integer")
        validated['random_state'] = random_state
        
        # Validate model selections
        models = config.get('models_to_include', [])
        if isinstance(models, list):
            # Sanitize model names
            validated['models_to_include'] = [
                re.sub(r'[^\w\s.-]', '', str(model)).strip() 
                for model in models
            ]
        
        # Add other validations as needed
        return validated

# Middleware for request validation
async def validate_request_size(request, max_size: int = 100 * 1024 * 1024):
    """Validate request body size"""
    content_length = request.headers.get('content-length')
    if content_length:
        content_length = int(content_length)
        if content_length > max_size:
            raise HTTPException(
                status_code=413,
                detail=f"Request too large. Maximum size is {max_size // (1024*1024)}MB"
            )

# File storage security
class SecureFileStorage:
    """Secure file storage with validation"""
    
    def __init__(self, base_path: str = "/tmp/ml_uploads"):
        self.base_path = Path(base_path)
        self.base_path.mkdir(parents=True, exist_ok=True)
    
    async def save_uploaded_file(
        self, 
        file: UploadFile,
        user_id: str,
        session_id: str
    ) -> str:
        """Securely save uploaded file"""
        # Validate file
        validation = await SecurityUtils.validate_upload_file(file)
        
        # Create secure directory structure
        user_dir = self.base_path / f"user_{user_id}" / f"session_{session_id}"
        user_dir.mkdir(parents=True, exist_ok=True)
        
        # Generate unique filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{timestamp}_{validation['hash'][:8]}_{validation['filename']}"
        file_path = user_dir / filename
        
        # Save file
        await file.seek(0)
        with open(file_path, 'wb') as f:
            while True:
                chunk = await file.read(1024 * 1024)  # 1MB chunks
                if not chunk:
                    break
                f.write(chunk)
        
        logger.info(f"File saved: {file_path} (size: {validation['size']} bytes)")
        
        return str(file_path)
    
    def cleanup_old_files(self, max_age_hours: int = 24):
        """Clean up old uploaded files"""
        cutoff_time = datetime.now().timestamp() - (max_age_hours * 3600)
        
        for user_dir in self.base_path.iterdir():
            if user_dir.is_dir():
                for session_dir in user_dir.iterdir():
                    if session_dir.is_dir():
                        for file_path in session_dir.iterdir():
                            if file_path.stat().st_mtime < cutoff_time:
                                file_path.unlink()
                                logger.info(f"Cleaned up old file: {file_path}")
                        
                        # Remove empty directories
                        if not any(session_dir.iterdir()):
                            session_dir.rmdir()
                
                if not any(user_dir.iterdir()):
                    user_dir.rmdir()

# Export utilities
security_utils = SecurityUtils()
secure_storage = SecureFileStorage()