"""
Memory management utilities for handling large datasets and preventing memory exhaustion
"""

import pandas as pd
import numpy as np
import psutil
import gc
from typing import Dict, Any, Optional, List, Union
import logging
from functools import wraps
import warnings

logger = logging.getLogger(__name__)

# Memory thresholds
MEMORY_WARNING_THRESHOLD = 0.7  # Warn at 70% memory usage
MEMORY_CRITICAL_THRESHOLD = 0.85  # Critical at 85% memory usage
MAX_DATAFRAME_MEMORY = 500 * 1024 * 1024  # 500MB per DataFrame
MAX_RESULT_SIZE = 100 * 1024 * 1024  # 100MB for results

class MemoryManager:
    """Manages memory usage for ML operations"""
    
    @staticmethod
    def get_memory_info() -> Dict[str, Any]:
        """Get current memory usage information"""
        memory = psutil.virtual_memory()
        return {
            "total_mb": memory.total / (1024 * 1024),
            "available_mb": memory.available / (1024 * 1024),
            "used_mb": memory.used / (1024 * 1024),
            "percent": memory.percent,
            "status": "ok" if memory.percent < MEMORY_WARNING_THRESHOLD * 100 else "warning"
        }
    
    @staticmethod
    def check_memory_available(required_mb: float = 100) -> bool:
        """Check if sufficient memory is available"""
        memory = psutil.virtual_memory()
        available_mb = memory.available / (1024 * 1024)
        
        if available_mb < required_mb:
            logger.warning(f"Low memory: {available_mb:.1f}MB available, {required_mb:.1f}MB required")
            return False
        
        if memory.percent > MEMORY_CRITICAL_THRESHOLD * 100:
            logger.error(f"Critical memory usage: {memory.percent:.1f}%")
            return False
        
        return True
    
    @staticmethod
    def estimate_dataframe_memory(df: pd.DataFrame) -> float:
        """Estimate memory usage of a DataFrame in MB"""
        return df.memory_usage(deep=True).sum() / (1024 * 1024)
    
    @staticmethod
    def optimize_dataframe(df: pd.DataFrame, aggressive: bool = False) -> pd.DataFrame:
        """Optimize DataFrame memory usage"""
        original_memory = MemoryManager.estimate_dataframe_memory(df)
        
        # Optimize numeric columns
        for col in df.select_dtypes(include=['int']).columns:
            col_min = df[col].min()
            col_max = df[col].max()
            
            # Downcast integers
            if col_min >= 0:
                if col_max < 255:
                    df[col] = df[col].astype(np.uint8)
                elif col_max < 65535:
                    df[col] = df[col].astype(np.uint16)
                elif col_max < 4294967295:
                    df[col] = df[col].astype(np.uint32)
            else:
                if col_min > np.iinfo(np.int8).min and col_max < np.iinfo(np.int8).max:
                    df[col] = df[col].astype(np.int8)
                elif col_min > np.iinfo(np.int16).min and col_max < np.iinfo(np.int16).max:
                    df[col] = df[col].astype(np.int16)
                elif col_min > np.iinfo(np.int32).min and col_max < np.iinfo(np.int32).max:
                    df[col] = df[col].astype(np.int32)
        
        # Optimize float columns
        for col in df.select_dtypes(include=['float']).columns:
            df[col] = pd.to_numeric(df[col], downcast='float')
        
        # Convert object columns to category if beneficial
        if aggressive:
            for col in df.select_dtypes(include=['object']).columns:
                num_unique_values = len(df[col].unique())
                num_total_values = len(df[col])
                if num_unique_values / num_total_values < 0.5:  # Less than 50% unique
                    df[col] = df[col].astype('category')
        
        optimized_memory = MemoryManager.estimate_dataframe_memory(df)
        reduction_pct = (original_memory - optimized_memory) / original_memory * 100
        
        logger.info(f"DataFrame memory optimized: {original_memory:.1f}MB -> {optimized_memory:.1f}MB ({reduction_pct:.1f}% reduction)")
        
        return df
    
    @staticmethod
    def chunk_dataframe(df: pd.DataFrame, chunk_size: int = 10000) -> List[pd.DataFrame]:
        """Split DataFrame into chunks for processing"""
        n_chunks = len(df) // chunk_size + (1 if len(df) % chunk_size else 0)
        chunks = []
        
        for i in range(n_chunks):
            start_idx = i * chunk_size
            end_idx = min((i + 1) * chunk_size, len(df))
            chunks.append(df.iloc[start_idx:end_idx])
        
        return chunks
    
    @staticmethod
    def serialize_large_result(result: Any, max_size_mb: float = 100) -> Dict[str, Any]:
        """Serialize large results with size limits"""
        if isinstance(result, pd.DataFrame):
            memory_mb = MemoryManager.estimate_dataframe_memory(result)
            
            if memory_mb > max_size_mb:
                # Sample the data
                sample_ratio = max_size_mb / memory_mb
                sample_size = int(len(result) * sample_ratio)
                
                return {
                    "data": result.sample(n=sample_size).to_dict('records'),
                    "sampled": True,
                    "sample_size": sample_size,
                    "total_size": len(result),
                    "message": f"Data sampled from {len(result)} to {sample_size} rows due to size constraints"
                }
            else:
                return {
                    "data": result.to_dict('records'),
                    "sampled": False,
                    "total_size": len(result)
                }
        
        elif isinstance(result, dict):
            # For dictionaries with DataFrames
            serialized = {}
            for key, value in result.items():
                if isinstance(value, pd.DataFrame):
                    serialized[key] = MemoryManager.serialize_large_result(value, max_size_mb / len(result))
                else:
                    serialized[key] = value
            return serialized
        
        else:
            return result
    
    @staticmethod
    def cleanup():
        """Force garbage collection to free memory"""
        gc.collect()
        
        # Log current memory status
        memory_info = MemoryManager.get_memory_info()
        logger.info(f"Memory cleanup completed. Current usage: {memory_info['percent']:.1f}%")

def memory_guard(threshold: float = MEMORY_WARNING_THRESHOLD):
    """Decorator to check memory before executing function"""
    def decorator(func):
        @wraps(func)
        def wrapper(*args, **kwargs):
            # Check memory before execution
            memory = psutil.virtual_memory()
            if memory.percent > threshold * 100:
                warnings.warn(f"High memory usage: {memory.percent:.1f}%", ResourceWarning)
            
            # Execute function
            result = func(*args, **kwargs)
            
            # Cleanup if memory is high
            if memory.percent > MEMORY_CRITICAL_THRESHOLD * 100:
                MemoryManager.cleanup()
            
            return result
        return wrapper
    return decorator

class DataFrameProcessor:
    """Safe DataFrame processing with memory management"""
    
    @staticmethod
    @memory_guard()
    def safe_merge(df1: pd.DataFrame, df2: pd.DataFrame, **merge_kwargs) -> pd.DataFrame:
        """Safely merge DataFrames with memory checks"""
        # Estimate result size
        estimated_size = len(df1) * len(df2) * 8 / (1024 * 1024)  # Rough estimate in MB
        
        if estimated_size > MAX_DATAFRAME_MEMORY / (1024 * 1024):
            raise MemoryError(f"Merge operation would use approximately {estimated_size:.1f}MB, exceeding limit")
        
        # Check available memory
        if not MemoryManager.check_memory_available(estimated_size):
            raise MemoryError("Insufficient memory for merge operation")
        
        return pd.merge(df1, df2, **merge_kwargs)
    
    @staticmethod
    def safe_groupby(df: pd.DataFrame, by: Union[str, List[str]], agg_func: Dict[str, Any],
                     chunk_size: Optional[int] = None) -> pd.DataFrame:
        """Safely perform groupby operations with optional chunking"""
        if chunk_size and len(df) > chunk_size:
            # Process in chunks
            chunks = MemoryManager.chunk_dataframe(df, chunk_size)
            results = []
            
            for i, chunk in enumerate(chunks):
                logger.info(f"Processing chunk {i+1}/{len(chunks)}")
                chunk_result = chunk.groupby(by).agg(agg_func)
                results.append(chunk_result)
                
                # Clean up after each chunk
                del chunk
                if i % 5 == 0:  # Cleanup every 5 chunks
                    MemoryManager.cleanup()
            
            # Combine results
            combined = pd.concat(results)
            return combined.groupby(level=list(range(combined.index.nlevels))).agg(agg_func)
        
        else:
            return df.groupby(by).agg(agg_func)
    
    @staticmethod
    def safe_pivot(df: pd.DataFrame, **pivot_kwargs) -> pd.DataFrame:
        """Safely create pivot tables with memory checks"""
        # Estimate result size based on unique values
        if 'index' in pivot_kwargs and 'columns' in pivot_kwargs:
            n_index = df[pivot_kwargs['index']].nunique() if isinstance(pivot_kwargs['index'], str) else len(df)
            n_columns = df[pivot_kwargs['columns']].nunique()
            estimated_cells = n_index * n_columns
            
            if estimated_cells > 1000000:  # More than 1M cells
                raise ValueError(f"Pivot would create {estimated_cells:,} cells, which may cause memory issues")
        
        return df.pivot_table(**pivot_kwargs)

# Utility functions for ML frameworks
def process_in_batches(data: pd.DataFrame, processor_func, batch_size: int = 10000, **kwargs):
    """Process large DataFrame in batches"""
    results = []
    n_batches = (len(data) + batch_size - 1) // batch_size
    
    for i in range(n_batches):
        start_idx = i * batch_size
        end_idx = min((i + 1) * batch_size, len(data))
        batch = data.iloc[start_idx:end_idx]
        
        logger.info(f"Processing batch {i+1}/{n_batches} (rows {start_idx}-{end_idx})")
        
        # Check memory before processing
        if not MemoryManager.check_memory_available(50):  # Need at least 50MB
            MemoryManager.cleanup()
            if not MemoryManager.check_memory_available(50):
                raise MemoryError("Insufficient memory to continue processing")
        
        # Process batch
        batch_result = processor_func(batch, **kwargs)
        results.append(batch_result)
        
        # Cleanup periodically
        if i % 10 == 0:
            MemoryManager.cleanup()
    
    return results

# Export utilities
memory_manager = MemoryManager()
df_processor = DataFrameProcessor()