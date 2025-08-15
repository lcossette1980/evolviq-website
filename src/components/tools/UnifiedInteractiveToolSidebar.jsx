/**
 * Unified Interactive Tool with Sidebar Navigation
 * Modern UI/UX with sidebar navigation and tabbed results
 * Replaces the vertical step navigation with a cleaner layout
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useSecureAPI } from '../../utils/secureAPI';
import API_CONFIG, { buildUrl } from '../../config/apiConfig';
import LoadingState from '../shared/LoadingState';
import ErrorBoundary from '../common/ErrorBoundary';
import ToolPageSkeleton from './ToolPageSkeleton';
import { CheckCircle, Circle, ChevronRight, AlertCircle, X } from 'lucide-react';

const UnifiedInteractiveToolSidebar = ({ 
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
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [resultTabs, setResultTabs] = useState([]);
  const [activeResultTab, setActiveResultTab] = useState(0);

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
    if (isCreatingRef.current || sessionId) return;
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
      const maxSize = toolConfig.maxFileSize || 50 * 1024 * 1024;
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

        const numericColumns = summary?.numerical_columns || input?.numeric_columns || [];
        const suggestedTarget = input?.suggested_target || (numericColumns.length ? numericColumns[numericColumns.length - 1] : undefined);

        return {
          validation: validation || { is_valid: true, errors: [], warnings: [], recommendations: [] },
          summary: summary || null,
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

      // Additional NLP-specific checks
      if (toolType === 'nlp') {
        const cols = result?.summary?.columns || [];
        const textCol = cols.find(c => ['text', 'content', 'body', 'message'].includes(String(c).toLowerCase()));
        if (!textCol) {
          throw new Error('NLP CSV/JSON must include a text column (e.g., "text", "content", "body", or "message").');
        }
      }

      // Store upload results
      setStepData(prev => ({
        ...prev,
        uploadedFile: file,
        uploadResults: result
      }));

      // Mark step as completed
      setCompletedSteps(prev => new Set([...prev, 1]));

      console.log(`✅ ${toolType} file uploaded successfully`);
      addNotification({ type: 'success', message: `${toolType.toUpperCase()} file uploaded successfully` });
      
      // Auto-advance if valid
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

      if (toolConfig.stepEndpoints && toolConfig.stepEndpoints[stepName]) {
        let endpoint = toolConfig.stepEndpoints[stepName].replace(':tool', toolType);
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
        
        let normalized = raw;
        if (stepName === 'preprocess' && raw?.preprocess) normalized = raw.preprocess;
        if (stepName === 'train' && raw?.results) normalized = raw.results;
        if (stepName === 'analyze' && raw?.analysis) normalized = raw.analysis;

        setStepData(prev => ({ ...prev, [stepName]: normalized }));
        
        // Mark current step as completed
        setCompletedSteps(prev => new Set([...prev, currentStep]));
        
        // If this is a results step, update result tabs
        if (stepName === 'train' || stepName === 'analyze') {
          updateResultTabs(normalized);
        }
        
        console.log(`✅ ${toolType} ${stepName} completed via server`);
        return normalized;
      } else {
        // Local-only step
        setStepData(prev => ({ ...prev, [stepName]: data }));
        setCompletedSteps(prev => new Set([...prev, currentStep]));
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

  // Update result tabs based on results
  const updateResultTabs = (results) => {
    const tabs = [];
    if (results?.model_comparison) tabs.push({ name: 'Model Comparison', key: 'comparison' });
    if (results?.visualizations) tabs.push({ name: 'Visualizations', key: 'visualizations' });
    if (results?.feature_importance) tabs.push({ name: 'Feature Importance', key: 'features' });
    if (results?.metrics) tabs.push({ name: 'Metrics', key: 'metrics' });
    if (results?.clusters) tabs.push({ name: 'Clusters', key: 'clusters' });
    if (results?.sentiment) tabs.push({ name: 'Sentiment Analysis', key: 'sentiment' });
    if (results?.topics) tabs.push({ name: 'Topics', key: 'topics' });
    setResultTabs(tabs);
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
    setCompletedSteps(new Set());
    setResultTabs([]);
    setActiveResultTab(0);
    setError(null);
    createSession();
  };

  // Export data
  const exportResults = async (format = 'json') => {
    try {
      setIsLoading(true);
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
    currentStep,
    sessionId,
    isLoading,
    error,
    stepData,
    user,
    completedSteps,
    resultTabs,
    activeResultTab,
    setActiveResultTab,
    nextStep,
    prevStep,
    goToStep,
    resetTool,
    handleFileUpload,
    processStep,
    exportResults,
    setError,
    setStepData,
    setIsLoading
  };

  // Toast notifications
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

  if (isInitializing) {
    return <ToolPageSkeleton />;
  }

  return (
    <ErrorBoundary level="tool">
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar Navigation */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Tool Header */}
          <div className="p-6 border-b border-gray-200">
            <h1 className="text-xl font-bold text-charcoal">{toolConfig.title}</h1>
            <p className="text-sm text-charcoal/70 mt-1">{toolConfig.description}</p>
            {sessionId && (
              <div className="mt-3 text-xs text-charcoal/50">
                Session: {sessionId.slice(-8)}
              </div>
            )}
          </div>

          {/* Step Navigation */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                Process Steps
              </h3>
              <nav className="space-y-1">
                {toolConfig.steps.map((step, index) => {
                  const stepNumber = index + 1;
                  const isActive = currentStep === stepNumber;
                  const isCompleted = completedSteps.has(stepNumber);
                  const isClickable = isCompleted || stepNumber <= currentStep;

                  return (
                    <button
                      key={step.id}
                      onClick={() => isClickable && goToStep(stepNumber)}
                      disabled={!isClickable}
                      className={`w-full flex items-center px-3 py-3 text-sm rounded-lg transition-all ${
                        isActive 
                          ? 'bg-chestnut text-white shadow-sm' 
                          : isCompleted
                          ? 'bg-green-50 text-green-700 hover:bg-green-100'
                          : isClickable
                          ? 'text-charcoal hover:bg-gray-100'
                          : 'text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <span className="flex items-center justify-center w-6 h-6 mr-3">
                        {isCompleted ? (
                          <CheckCircle size={20} />
                        ) : (
                          <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-medium ${
                            isActive 
                              ? 'border-white text-white' 
                              : 'border-gray-300 text-gray-500'
                          }`}>
                            {stepNumber}
                          </span>
                        )}
                      </span>
                      <div className="flex-1 text-left">
                        <div className="font-medium">{step.name}</div>
                        <div className={`text-xs mt-0.5 ${
                          isActive ? 'text-white/80' : 'text-gray-500'
                        }`}>
                          {step.description}
                        </div>
                      </div>
                      {isActive && <ChevronRight size={16} className="ml-2" />}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Results Tabs (if available) */}
            {resultTabs.length > 0 && (
              <div className="p-4 border-t border-gray-200">
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  Results & Visualizations
                </h3>
                <div className="space-y-1">
                  {resultTabs.map((tab, index) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveResultTab(index)}
                      className={`w-full text-left px-3 py-2 text-sm rounded-lg transition-all ${
                        activeResultTab === index
                          ? 'bg-bone text-charcoal font-medium'
                          : 'text-charcoal/70 hover:bg-gray-100'
                      }`}
                    >
                      {tab.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={resetTool}
              className="w-full text-center py-2 text-sm text-chestnut hover:text-chestnut/80 font-medium"
            >
              Reset Tool
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full text-center py-2 text-sm text-gray-600 hover:text-gray-800 mt-2"
            >
              Back to Dashboard
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border-b border-red-200 px-6 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <AlertCircle size={20} className="text-red-600 mr-2" />
                  <p className="text-red-800">{error}</p>
                </div>
                <button
                  onClick={() => setError(null)}
                  className="text-red-600 hover:text-red-800"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
          )}

          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-40 flex items-center justify-center">
              <div className="text-center">
                <div className="flex justify-center space-x-2 mb-4">
                  <div className="w-3 h-3 bg-chestnut rounded-full animate-bounce"></div>
                  <div className="w-3 h-3 bg-chestnut rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-3 h-3 bg-chestnut rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <p className="text-charcoal/60">Processing {currentStepConfig?.name}...</p>
              </div>
            </div>
          )}

          {/* Step Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-8">
              <div className="max-w-4xl mx-auto">
                {/* Step Header */}
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-charcoal mb-2">
                    {currentStepConfig?.name}
                  </h2>
                  <p className="text-charcoal/70">{currentStepConfig?.description}</p>
                </div>

                {/* Step Content - Rendered by child components */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  {children({ toolContext, currentStepConfig })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Toast Notifications */}
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {notifications.map(n => (
            <div 
              key={n.id} 
              className={`px-4 py-3 rounded-lg shadow-lg text-white flex items-center ${
                n.type === 'success' ? 'bg-green-600' : 
                n.type === 'error' ? 'bg-red-600' : 'bg-gray-800'
              }`}
            >
              {n.message}
              <button
                onClick={() => setNotifications(prev => prev.filter(notif => notif.id !== n.id))}
                className="ml-4 text-white/80 hover:text-white"
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default UnifiedInteractiveToolSidebar;