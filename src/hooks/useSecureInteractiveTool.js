/**
 * Secure Interactive Tool Hook
 * Replaces insecure tool implementations with authenticated versions
 */

import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSecureAPI, getErrorMessage } from '../utils/secureAPI';

export const useSecureInteractiveTool = (toolType) => {
  const { user } = useAuth();
  const { secureCall, uploadFile, isAuthenticated } = useSecureAPI();
  
  // Core state
  const [currentStep, setCurrentStep] = useState(1);
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Step data
  const [stepData, setStepData] = useState({});
  
  // Authentication check
  useEffect(() => {
    if (!isAuthenticated) {
      setError('Please log in to use this tool');
    }
  }, [isAuthenticated]);

  // Create secure session
  const createSession = useCallback(async () => {
    if (!isAuthenticated) {
      setError('Authentication required');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await secureCall('/api/tools/sessions', {
        method: 'POST',
        body: JSON.stringify({
          toolType,
          userId: user?.uid
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSessionId(data.sessionId);
        return true;
      } else {
        throw new Error('Failed to create session');
      }
    } catch (error) {
      console.error('Session creation failed:', error);
      setError(getErrorMessage(error));
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, toolType, user, secureCall]);

  // Handle file upload with authentication
  const handleUpload = useCallback(async (file) => {
    if (!sessionId) {
      setError('No active session. Please refresh the page.');
      return null;
    }

    if (!file) {
      setError('Please select a file to upload');
      return null;
    }

    // Client-side file validation
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      setError('File too large. Maximum size is 10MB.');
      return null;
    }

    const allowedTypes = [
      'text/csv',
      'application/json',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ];
    
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Please upload CSV, Excel, or JSON files.');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await uploadFile(
        `/api/tools/${toolType}/upload?session_id=${sessionId}`,
        file,
        { session_id: sessionId }
      );

      if (response.ok) {
        const result = await response.json();
        setStepData(prev => ({
          ...prev,
          [currentStep]: result
        }));
        return result;
      } else {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setError(getErrorMessage(error));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, toolType, currentStep, uploadFile]);

  // Process step with authentication
  const processStep = useCallback(async (step, data) => {
    if (!sessionId) {
      setError('No active session');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await secureCall(`/api/tools/${toolType}/process`, {
        method: 'POST',
        body: JSON.stringify({
          session_id: sessionId,
          step,
          data
        })
      });

      if (response.ok) {
        const result = await response.json();
        setStepData(prev => ({
          ...prev,
          [step]: result
        }));
        return result;
      } else {
        throw new Error('Processing failed');
      }
    } catch (error) {
      console.error('Step processing failed:', error);
      setError(getErrorMessage(error));
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, toolType, secureCall]);

  // Navigation helpers
  const nextStep = useCallback(() => {
    setCurrentStep(prev => prev + 1);
  }, []);

  const previousStep = useCallback(() => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  }, []);

  const goToStep = useCallback((step) => {
    setCurrentStep(step);
  }, []);

  // Reset state
  const reset = useCallback(() => {
    setCurrentStep(1);
    setSessionId(null);
    setStepData({});
    setError(null);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    // State
    currentStep,
    sessionId,
    isLoading,
    error,
    stepData,
    isAuthenticated,
    
    // Actions
    createSession,
    handleUpload,
    processStep,
    nextStep,
    previousStep,
    goToStep,
    reset,
    clearError,
    
    // Utilities
    setStepData,
    setCurrentStep,
    setError
  };
};

export default useSecureInteractiveTool;