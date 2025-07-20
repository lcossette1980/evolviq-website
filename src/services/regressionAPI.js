// Linear Regression API Service with Firebase integration
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject 
} from 'firebase/storage';
import { db, storage } from './firebase';

class RegressionAPI {
  constructor() {
    // Use production API for regression tool - it's running and active
    this.baseURL = 'https://evolviq-website-production.up.railway.app';
  }

  // Session Management
  async createSession(userId, sessionData) {
    try {
      const sessionId = `regression_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const sessionRef = doc(db, 'regressionSessions', sessionId);
      
      await setDoc(sessionRef, {
        id: sessionId,
        userId,
        ...sessionData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'created'
      });
      
      return sessionId;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  }

  async getSession(sessionId) {
    try {
      const sessionRef = doc(db, 'regressionSessions', sessionId);
      const sessionSnap = await getDoc(sessionRef);
      
      if (sessionSnap.exists()) {
        return { id: sessionSnap.id, ...sessionSnap.data() };
      } else {
        throw new Error('Session not found');
      }
    } catch (error) {
      console.error('Error getting session:', error);
      throw error;
    }
  }

  async updateSession(sessionId, updateData) {
    try {
      // Skip Firebase updates for now
      console.log('Session update skipped (Firebase bypass):', sessionId, updateData);
    } catch (error) {
      console.error('Error updating session:', error);
      throw error;
    }
  }

  async getUserSessions(userId, limitCount = 10) {
    try {
      const sessionsRef = collection(db, 'regressionSessions');
      const q = query(
        sessionsRef,
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting user sessions:', error);
      throw error;
    }
  }

  async deleteSession(sessionId) {
    try {
      const sessionRef = doc(db, 'regressionSessions', sessionId);
      await deleteDoc(sessionRef);
    } catch (error) {
      console.error('Error deleting session:', error);
      throw error;
    }
  }

  // File Upload and Storage
  async uploadDataFile(file, sessionId, userId) {
    try {
      const fileRef = ref(storage, `regression-data/${userId}/${sessionId}/${file.name}`);
      
      // Upload file
      const snapshot = await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      // Update session with file info
      await this.updateSession(sessionId, {
        dataFile: {
          name: file.name,
          size: file.size,
          type: file.type,
          url: downloadURL,
          path: snapshot.ref.fullPath,
          uploadedAt: serverTimestamp()
        },
        status: 'data_uploaded'
      });
      
      return {
        url: downloadURL,
        name: file.name,
        size: file.size
      };
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  }

  async deleteDataFile(sessionId) {
    try {
      const session = await this.getSession(sessionId);
      if (session.dataFile?.path) {
        const fileRef = ref(storage, session.dataFile.path);
        await deleteObject(fileRef);
        
        await this.updateSession(sessionId, {
          dataFile: null,
          status: 'created'
        });
      }
    } catch (error) {
      console.error('Error deleting file:', error);
      throw error;
    }
  }


  // Data Processing API Calls
  async validateData(sessionId, file) {
    try {
      console.log('=== VALIDATION DEBUG ===');
      console.log('API URL:', this.baseURL);
      console.log('Session ID:', sessionId);
      console.log('File name:', file.name);
      console.log('File size:', file.size);
      console.log('File type:', file.type);
      
      const formData = new FormData();
      formData.append('file', file);
      
      const url = `${this.baseURL}/api/regression/validate-data?session_id=${sessionId}`;
      console.log('Full URL:', url);
      
      console.log('Making fetch request...');
      
      // Test basic connectivity first
      try {
        console.log('Testing basic connectivity...');
        const testResponse = await fetch(`${this.baseURL}/health`, {
          method: 'GET'
        });
        console.log('Health check response:', testResponse.status);
      } catch (healthError) {
        console.error('Health check failed:', healthError);
        throw new Error('Cannot connect to regression API service');
      }
      
      // Add reasonable timeout for small files
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('Request timing out after 30 seconds');
        controller.abort();
      }, 30000);
      
      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      console.log('Response received:', response.status, response.statusText);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Validation failed response:', errorText);
        throw new Error(`Validation failed: ${response.status} - ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Validation complete:', result.is_valid);
      console.log('=== VALIDATION DEBUG END ===');
      
      return result;
    } catch (error) {
      console.error('=== VALIDATION ERROR ===');
      console.error('Error type:', error.name);
      console.error('Error message:', error.message);
      console.error('Full error:', error);
      console.error('=== VALIDATION ERROR END ===');
      throw error;
    }
  }

  async preprocessData(sessionId, preprocessingConfig) {
    try {
      console.log('Preprocessing request:', {
        sessionId,
        config: preprocessingConfig.config,
        target_column: preprocessingConfig.target_column
      });

      const response = await fetch(`${this.baseURL}/api/regression/preprocess?session_id=${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          config: preprocessingConfig.config,
          target_column: preprocessingConfig.target_column
        })
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        throw new Error(`Preprocessing failed: ${response.status} - ${response.statusText} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('Preprocessing result:', result);
      
      return result;
    } catch (error) {
      console.error('Error preprocessing data:', error);
      throw error;
    }
  }

  async trainModels(sessionId, trainingConfig) {
    try {
      // Create an AbortController for timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minute timeout
      
      console.log('Starting model training with config:', trainingConfig);
      
      const response = await fetch(`${this.baseURL}/api/regression/train?session_id=${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          config: trainingConfig.config,
          target_column: trainingConfig.target_column
        }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Training failed response:', errorText);
        throw new Error(`Training failed: ${response.status} - ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Skip Firebase update
      console.log('Training complete');
      
      return result;
    } catch (error) {
      if (error.name === 'AbortError') {
        console.error('Training request timed out after 5 minutes');
        throw new Error('Training is taking too long. This might be due to a large dataset or complex models. Please try with fewer models or a smaller dataset.');
      } else if (error.message.includes('Failed to fetch')) {
        console.error('Network error during training:', error);
        throw new Error('Connection lost during training. This often happens with large datasets. Please try again with a smaller dataset or fewer models.');
      }
      console.error('Error training models:', error);
      throw error;
    }
  }

  async getTrainingStatus(sessionId) {
    try {
      const response = await fetch(`${this.baseURL}/api/regression/training-status/${sessionId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to get training status: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error getting training status:', error);
      throw error;
    }
  }

  async getResults(sessionId) {
    try {
      const response = await fetch(`${this.baseURL}/api/regression/results/${sessionId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to get results: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Skip Firebase update
      console.log('Results accessed');
      
      return result;
    } catch (error) {
      console.error('Error getting results:', error);
      throw error;
    }
  }

  async makePrediction(sessionId, predictionData) {
    try {
      const response = await fetch(`${this.baseURL}/api/regression/predict?session_id=${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: predictionData
        })
      });
      
      if (!response.ok) {
        throw new Error(`Prediction failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Skip Firebase prediction logging
      console.log('Prediction made:', result);
      
      return result;
    } catch (error) {
      console.error('Error making prediction:', error);
      throw error;
    }
  }

  async exportModel(sessionId, exportFormat = 'joblib') {
    try {
      const response = await fetch(`${this.baseURL}/api/regression/export/${sessionId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          format: exportFormat
        })
      });
      
      if (!response.ok) {
        throw new Error(`Export failed: ${response.statusText}`);
      }
      
      // Handle binary response for file download
      const blob = await response.blob();
      return blob;
    } catch (error) {
      console.error('Error exporting model:', error);
      throw error;
    }
  }

  // Utility methods
  async getSessionSummary(sessionId) {
    try {
      const session = await this.getSession(sessionId);
      
      return {
        id: session.id,
        name: session.name || 'Untitled Session',
        status: session.status,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        hasData: !!session.dataFile,
        isProcessed: session.status === 'data_preprocessed' || session.status === 'models_trained',
        isTrained: session.status === 'models_trained',
        modelCount: session.training?.results?.model_results ? Object.keys(session.training.results.model_results).length : 0,
        bestModel: session.training?.results?.best_model_name
      };
    } catch (error) {
      console.error('Error getting session summary:', error);
      throw error;
    }
  }
}

export default new RegressionAPI();