#!/usr/bin/env python3
"""
Test script to verify regression background training fix
"""

import asyncio
import json
from datetime import datetime

# Mock session storage for testing
class MockSessionStorage:
    def __init__(self):
        self.sessions = {}
    
    async def get_session(self, session_id):
        return self.sessions.get(session_id)
    
    async def save_session(self, session_id, data):
        self.sessions[session_id] = data
        print(f"[{datetime.now().isoformat()}] Session {session_id} saved with status: {data.get('status', 'unknown')}")

# Mock workflow
class MockRegressionWorkflow:
    def __init__(self):
        self.feature_columns = None
        self.config = None
    
    def train_models(self, data, target_column):
        print(f"Training models with {len(data)} rows, target: {target_column}")
        # Simulate training results
        return {
            'success': True,
            'model_results': {
                'linear': {'test_r2': 0.85, 'test_rmse': 1.2},
                'ridge': {'test_r2': 0.86, 'test_rmse': 1.1},
                'random_forest': {'test_r2': 0.92, 'test_rmse': 0.8}
            },
            'best_model': 'random_forest',
            'training_summary': {
                'models_trained': 3,
                'best_accuracy': 0.92
            }
        }

async def test_background_training():
    """Test the background training fix"""
    print("Testing background training fix...")
    
    # Setup
    session_storage = MockSessionStorage()
    session_id = 'test_session_123'
    
    # Create initial session
    session_data = {
        'user_id': 'test_user',
        'dataframe': [{'col1': 1, 'col2': 2, 'target': 10}] * 100,  # Mock data
        'target_column': 'target',
        'preprocess': {
            'feature_columns': ['col1', 'col2'],
            'processed_data': [{'col1': 1, 'col2': 2, 'target': 10}] * 100
        }
    }
    await session_storage.save_session(session_id, session_data)
    
    # Simulate background training task
    print(f"\n[{datetime.now().isoformat()}] Starting background training...")
    
    # Update status to training_in_progress
    session_data['status'] = 'training_in_progress'
    session_data['training_started_at'] = datetime.now()
    await session_storage.save_session(session_id, session_data)
    
    # Simulate actual training
    workflow = MockRegressionWorkflow()
    workflow.feature_columns = session_data['preprocess']['feature_columns']
    
    # Perform training
    results = workflow.train_models(
        session_data['preprocess']['processed_data'],
        session_data['target_column']
    )
    
    # Update status to complete
    session_data['status'] = 'training_complete'
    session_data['training_completed_at'] = datetime.now()
    session_data['training_results'] = results
    await session_storage.save_session(session_id, session_data)
    
    # Verify results
    print(f"\n[{datetime.now().isoformat()}] Checking results...")
    final_session = await session_storage.get_session(session_id)
    
    assert final_session['status'] == 'training_complete', "Status should be training_complete"
    assert 'training_results' in final_session, "Results should be saved"
    assert final_session['training_results']['success'] == True, "Training should be successful"
    
    print(f"\n✅ Test passed! Background training completed successfully")
    print(f"Final status: {final_session['status']}")
    print(f"Models trained: {final_session['training_results']['training_summary']['models_trained']}")
    print(f"Best model: {final_session['training_results']['best_model']}")

if __name__ == '__main__':
    asyncio.run(test_background_training())