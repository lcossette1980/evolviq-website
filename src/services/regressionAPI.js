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
    // Update with your actual Railway URL when you have it
    this.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
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
      const sessionRef = doc(db, 'regressionSessions', sessionId);
      await updateDoc(sessionRef, {
        ...updateData,
        updatedAt: serverTimestamp()
      });
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
      const formData = new FormData();
      formData.append('file', file);
      formData.append('session_id', sessionId);
      
      const response = await fetch(`${this.baseURL}/api/regression/validate-data`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Validation failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Update session with validation results
      await this.updateSession(sessionId, {
        validation: result,
        status: result.is_valid ? 'data_validated' : 'validation_failed'
      });
      
      return result;
    } catch (error) {
      console.error('Error validating data:', error);
      throw error;
    }
  }

  async preprocessData(sessionId, preprocessingConfig) {
    try {
      const response = await fetch(`${this.baseURL}/api/regression/preprocess`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          session_id: sessionId,
          config: preprocessingConfig
        })
      });
      
      if (!response.ok) {
        throw new Error(`Preprocessing failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Update session with preprocessing results
      await this.updateSession(sessionId, {
        preprocessing: {
          config: preprocessingConfig,
          results: result,
          completedAt: serverTimestamp()
        },
        status: 'data_preprocessed'
      });
      
      return result;
    } catch (error) {
      console.error('Error preprocessing data:', error);
      throw error;
    }
  }

  async trainModels(sessionId, trainingConfig) {
    try {
      const response = await fetch(`${this.baseURL}/api/regression/train`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          session_id: sessionId,
          config: trainingConfig
        })
      });
      
      if (!response.ok) {
        throw new Error(`Training failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Update session with training results
      await this.updateSession(sessionId, {
        training: {
          config: trainingConfig,
          results: result,
          completedAt: serverTimestamp()
        },
        status: 'models_trained'
      });
      
      return result;
    } catch (error) {
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
      
      // Update session with results access
      await this.updateSession(sessionId, {
        lastAccessedAt: serverTimestamp()
      });
      
      return result;
    } catch (error) {
      console.error('Error getting results:', error);
      throw error;
    }
  }

  async makePrediction(sessionId, predictionData) {
    try {
      const response = await fetch(`${this.baseURL}/api/regression/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          session_id: sessionId,
          data: predictionData
        })
      });
      
      if (!response.ok) {
        throw new Error(`Prediction failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      // Log prediction to session
      const session = await this.getSession(sessionId);
      const predictions = session.predictions || [];
      predictions.push({
        input: predictionData,
        output: result,
        timestamp: serverTimestamp()
      });
      
      await this.updateSession(sessionId, {
        predictions: predictions.slice(-50) // Keep last 50 predictions
      });
      
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