/**
 * Unified Interactive Tool Base Component
 * Eliminates 90% code duplication across all ML tools
 * 
 * This replaces the massive duplication in:
 * - EDAExplorePage
 * - ClassificationExplorePage  
 * - ClusteringExplorePage
 * - LinearRegressionPage
 * - NLPExplorePage
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSecureAPI } from '../../utils/secureAPI';
import StepNavigation from '../shared/StepNavigation';
import API_CONFIG, { buildUrl } from '../../config/apiConfig';
import LoadingState from '../shared/LoadingState';
import ErrorBoundary from '../common/ErrorBoundary';
import ToolPageSkeleton from './ToolPageSkeleton';

const UnifiedInteractiveTool = ({ 
  toolConfig,
  toolType,
  children 
}) => {
  const { user, verifyPremiumAccess } = useAuth();
  const { secureCall, uploadFile, isAuthenticated } = useSecureAPI();
  const navigate = useNavigate();

  // Core state shared by all tools
  const [currentStep, setCurrentStep] = useState(1);
  const [sessionId, setSessionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stepData, setStepData] = useState({});
  const [isInitializing, setIsInitializing] = useState(true);

  // Auto-scroll to top when step changes (common UX pattern)
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  // Authentication check for premium tools
  useEffect(() => {
    const checkAccess = async () => {
      if (toolConfig.requiresPremium && isAuthenticated) {
        try {
          await verifyPremiumAccess();
        } catch (error) {
          if (error.message.includes('Premium subscription required')) {
            navigate('/membership');
            return;
          }
          setError('Access verification failed. Please try again.');
        }
      }
    };

    checkAccess();
  }, [toolConfig.requiresPremium, isAuthenticated, verifyPremiumAccess, navigate]);

  // Create secure session for the tool
  const isCreatingRef = useRef(false);

  const createSession = useCallback(async () => {
    if (isCreatingRef.current || sessionId) return; // debounce duplicate calls
    try {
      isCreatingRef.current = true;
      setIsLoading(true);
      setError(null);

      const response = await secureCall(`/api/${toolType}/session`, {
        method: 'POST',
        body: JSON.stringify({
          name: toolConfig.sessionName,
          description: toolConfig.sessionDescription,
          user_id: user.uid,
          tool_type: toolType
        })
      });

      if (response.ok) {
        const data = await response.json();
        setSessionId(data.session_id);
        console.log(`✅ ${toolType} session created:`, data.session_id);
      } else {
        throw new Error(`Failed to create ${toolType} session`);
      }
    } catch (error) {
      console.error(`Session creation error for ${toolType}:`, error);
      setError(`Failed to create analysis session: ${error.message}`);
    } finally {
      setIsLoading(false);
      setIsInitializing(false);
      isCreatingRef.current = false;
    }
  }, [toolType, toolConfig, user, secureCall, sessionId]);

  // Initialize session on mount
  useEffect(() => {
    if (isAuthenticated && !sessionId) {
      createSession();
    }
  }, [isAuthenticated, sessionId, createSession]);

  // Unified file upload handler
  const handleFileUpload = async (file) => {
    if (!sessionId) {
      setError('No session available. Please refresh the page.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // File validation
      const maxSize = toolConfig.maxFileSize || 50 * 1024 * 1024; // 50MB default
      if (file.size > maxSize) {
        throw new Error(`File too large. Maximum size: ${Math.round(maxSize / 1024 / 1024)}MB`);
      }

      const allowedTypes = toolConfig.allowedFileTypes || [
        'text/csv',
        'application/json', 
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];

      if (!allowedTypes.includes(file.type)) {
        throw new Error('File type not supported. Please upload CSV, Excel, or JSON files.');
      }

      // Upload with secure API
      const additional = { session_id: sessionId };
      if (toolType === 'nlp') {
        // Try to detect text column - backend will validate
        additional['text_column'] = 'text';
      }
      const response = await uploadFile(
        `/api/${toolType}/validate-data?session_id=${encodeURIComponent(sessionId)}`,
        file,
        additional
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.detail || 'Upload failed');
      }

      const raw = await response.json();

      // Normalize backend response shapes across tools
      const normalizeUploadResult = (type, input) => {
        let validation = null;
        let summary = null;
        // Common cases:
        // - Regression/Classification workflow returns { validation: { validation: {...}, summary: {...} } }
        // - Generic endpoint returns { validation: {...}, data_info: { rows, columns, memory_mb } }
        if (input?.validation?.summary || input?.validation?.validation) {
          validation = input.validation.validation || input.validation;
          summary = input.validation.summary || null;
        } else if (input?.validation || input?.data_info) {
          validation = input.validation || null;
          if (input.summary) {
            summary = input.summary;
          } else if (input.data_info) {
            summary = {
              shape: [input.data_info.rows, input.data_info.columns],
              memory_usage_mb: input.data_info.memory_mb,
            };
          }
        } else {
          validation = input?.validation || null;
          summary = input?.summary || null;
        }

        // Derive convenience fields used by some UIs
        const numericColumns = summary?.numerical_columns || input?.numeric_columns || [];
        const suggestedTarget = input?.suggested_target || (numericColumns.length ? numericColumns[numericColumns.length - 1] : undefined);

        return {
          // Preserve both normalized and convenience forms
          validation: validation || { is_valid: true, errors: [], warnings: [], recommendations: [] },
          summary: summary || null,
          // Convenience top-level for legacy components
          is_valid: validation?.is_valid ?? true,
          errors: validation?.errors || [],
          warnings: validation?.warnings || [],
          recommendations: validation?.recommendations || [],
          numeric_columns: numericColumns,
          suggested_target: suggestedTarget,
          _raw: input
        };
      };

      const result = normalizeUploadResult(toolType, raw);

      // Additional NLP-specific ingestion checks
      if (toolType === 'nlp') {
        const cols = result?.summary?.columns || [];
        const textCol = cols.find(c => ['text', 'content', 'body', 'message'].includes(String(c).toLowerCase()));
        if (!textCol) {
          throw new Error('NLP CSV/JSON must include a text column (e.g., "text", "content", "body", or "message").');
        }
      }

      // Store upload results in step data
      setStepData(prev => ({
        ...prev,
        uploadedFile: file,
        uploadResults: result
      }));

      console.log(`✅ ${toolType} file uploaded successfully`);
      addNotification({ type: 'success', message: `${toolType.toUpperCase()} file uploaded successfully` });
      
      // Auto-advance to next step if upload successful
      if (result.is_valid !== false) {
        nextStep();
      }

    } catch (error) {
      console.error(`Upload error for ${toolType}:`, error);
      setError(`Upload failed: ${error.message}`);
      addNotification({ type: 'error', message: error.message || 'Upload failed' });
    } finally {
      setIsLoading(false);
    }
  };

  // Unified step processing
  const processStep = async (stepName, data) => {
    if (!sessionId) {
      setError('No session available. Please refresh the page.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // If a backend endpoint is defined for this step, call it with proper shape
      if (toolConfig.stepEndpoints && toolConfig.stepEndpoints[stepName]) {
        let endpoint = toolConfig.stepEndpoints[stepName].replace(':tool', toolType);
        // Append session_id as required by backend endpoints
        endpoint += (endpoint.includes('?') ? '&' : '?') + `session_id=${encodeURIComponent(sessionId)}`;

        const response = await secureCall(endpoint, {
          method: 'POST',
          body: JSON.stringify(data || {})
        });
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || errorData.detail || `${stepName} processing failed`);
        }
        const raw = await response.json();
        // Normalize known step payloads
        let normalized = raw;
        if (stepName === 'preprocess' && raw?.preprocess) normalized = raw.preprocess;
        if (stepName === 'train' && raw?.results) normalized = raw.results;
        if (stepName === 'analyze' && raw?.analysis) normalized = raw.analysis;

        setStepData(prev => ({ ...prev, [stepName]: normalized }));
        console.log(`✅ ${toolType} ${stepName} completed via server`);
        return normalized;
      } else {
        // Local-only step
        setStepData(prev => ({ ...prev, [stepName]: data }));
        console.log(`✅ ${toolType} ${stepName} stored locally`);
        return data;
      }

    } catch (error) {
      console.error(`Processing error for ${toolType} ${stepName}:`, error);
      setError(`Processing failed: ${error.message}`);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Navigation helpers
  const nextStep = () => {
    if (currentStep < toolConfig.steps.length) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const goToStep = (step) => {
    if (step >= 1 && step <= toolConfig.steps.length) {
      setCurrentStep(step);
    }
  };

  // Reset tool state
  const resetTool = () => {
    setCurrentStep(1);
    setStepData({});
    setError(null);
    createSession(); // Create new session
  };

  // Export data
  const exportResults = async (format = 'json') => {
    try {
      setIsLoading(true);
      // Backend provides GET /api/{tool_type}/export/{session_id}?format=
      const res = await secureCall(`/api/${toolType}/export/${encodeURIComponent(sessionId)}?format=${encodeURIComponent(format)}`, {
        method: 'GET'
      });
      if (!res.ok) {
        throw new Error('Export failed');
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${toolType}_results_${new Date().toISOString().slice(0, 10)}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (error) {
      setError(`Export failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Context object passed to child components
  const toolContext = {
    // State
    currentStep,
    sessionId,
    isLoading,
    error,
    stepData,
    user,
    
    // Navigation
    nextStep,
    prevStep,
    goToStep,
    resetTool,
    
    // Actions
    handleFileUpload,
    processStep,
    exportResults,
    
    // Utilities
    setError,
    setStepData,
    setIsLoading
  };

  // Lightweight toast notifications
  const [notifications, setNotifications] = useState([]);
  const addNotification = ({ type = 'info', message }) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 4000);
  };

  const currentStepConfig = toolConfig.steps[currentStep - 1];

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-bone py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-3xl font-bold text-charcoal mb-4">Authentication Required</h1>
          <p className="text-xl text-charcoal/80 mb-8">Please log in to use this tool.</p>
          <button 
            onClick={() => navigate('/membership')}
            className="bg-chestnut text-white px-6 py-3 rounded-lg font-medium hover:bg-chestnut/90"
          >
            Log In
          </button>
        </div>
      </div>
    );
  }

  // Show skeleton while initializing
  if (isInitializing) {
    return <ToolPageSkeleton />;
  }

  return (
    <ErrorBoundary level="tool">
      <div className="min-h-screen bg-bone">
        {/* Toasts */}
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map(n => (
            <div key={n.id} className={`px-4 py-2 rounded shadow text-white ${
              n.type === 'success' ? 'bg-green-600' : n.type === 'error' ? 'bg-red-600' : 'bg-gray-800'
            }`}>
              {n.message}
            </div>
          ))}
        </div>
        {/* Tool Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-charcoal">{toolConfig.title}</h1>
                <p className="text-charcoal/70 mt-1">{toolConfig.description}</p>
              </div>
              
              {/* Tool Actions */}
              <div className="flex items-center space-x-3">
                {sessionId && (
                  <span className="text-sm text-charcoal/60">
                    Session: {sessionId.slice(-8)}
                  </span>
                )}
                <button
                  onClick={resetTool}
                  className="text-chestnut hover:text-chestnut/80 text-sm font-medium"
                >
                  Reset Tool
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Step Navigation */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-4">
            <StepNavigation
              steps={toolConfig.steps}
              currentStep={currentStep}
              onStepClick={goToStep}
            />
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="bg-red-50 border-b border-red-200">
            <div className="max-w-6xl mx-auto px-4 py-3">
              <div className="flex items-center justify-between">
                <p className="text-red-800">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="text-red-600 hover:text-red-800"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {isLoading && <LoadingState message={`Processing ${currentStepConfig?.name}...`} />}

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            {/* Step Header */}
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-charcoal mb-2">
                Step {currentStep}: {currentStepConfig?.name}
              </h2>
              <p className="text-charcoal/70">{currentStepConfig?.description}</p>
            </div>

            {/* Step Content - Passed to child components */}
            <div className="min-h-[400px]">
              {children({ toolContext, currentStepConfig })}
            </div>

            {/* Step Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t border-gray-100">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className="px-4 py-2 text-charcoal border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              <div className="text-sm text-charcoal/60">
                Step {currentStep} of {toolConfig.steps.length}
              </div>
              
              <button
                onClick={nextStep}
                disabled={currentStep === toolConfig.steps.length}
                className="px-4 py-2 bg-chestnut text-white rounded-lg hover:bg-chestnut/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default UnifiedInteractiveTool;
