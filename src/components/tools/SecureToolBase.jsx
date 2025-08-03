/**
 * Secure Tool Base Component
 * Provides authentication and error handling for all interactive tools
 */

import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import useSecureInteractiveTool from '../../hooks/useSecureInteractiveTool';
import LoadingState from '../shared/LoadingState';
import StepNavigation from '../shared/StepNavigation';
import { AlertCircle, Lock, CreditCard } from 'lucide-react';

const SecureToolBase = ({ 
  toolType, 
  toolName, 
  requiresPremium = false,
  steps = [],
  children 
}) => {
  const { user, isPremium } = useAuth();
  const navigate = useNavigate();
  const toolState = useSecureInteractiveTool(toolType);

  // Initialize session when user is authenticated
  useEffect(() => {
    if (user && !user.isAnonymous && !toolState.sessionId) {
      toolState.createSession();
    }
  }, [user, toolState.sessionId, toolState.createSession]);

  // Authentication required
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <Lock className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Authentication Required
          </h2>
          <p className="text-gray-600 mb-6">
            Please log in to access {toolName}. Our interactive tools require authentication for security and data protection.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/')}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go to Home Page
            </button>
            <button
              onClick={() => navigate('/membership')}
              className="w-full text-blue-600 border border-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors"
            >
              Learn About Membership
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Anonymous users not allowed
  if (user.isAnonymous) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-amber-500" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Account Required
          </h2>
          <p className="text-gray-600 mb-6">
            Please create an account to use {toolName}. Anonymous users cannot access interactive tools for security reasons.
          </p>
          <button
            onClick={() => navigate('/membership')}
            className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Account
          </button>
        </div>
      </div>
    );
  }

  // Premium required
  if (requiresPremium && !isPremium) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <CreditCard className="w-16 h-16 mx-auto mb-4 text-purple-500" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Premium Required
          </h2>
          <p className="text-gray-600 mb-6">
            {toolName} is a premium feature. Upgrade your membership to access advanced interactive tools and analytics.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => navigate('/membership')}
              className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Upgrade to Premium
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full text-gray-600 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Session initialization
  if (!toolState.sessionId && !toolState.error) {
    return (
      <LoadingState 
        message={`Initializing ${toolName}...`}
        submessage="Setting up your secure analysis environment"
      />
    );
  }

  // Error state
  if (toolState.error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <AlertCircle className="w-16 h-16 mx-auto mb-4 text-red-500" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Something went wrong
          </h2>
          <p className="text-red-600 mb-6">
            {toolState.error}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => {
                toolState.clearError();
                toolState.createSession();
              }}
              className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full text-gray-600 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main tool interface
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{toolName}</h1>
          <p className="text-gray-600">
            Secure analysis environment • Session ID: {toolState.sessionId?.substring(0, 8)}...
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Step Navigation */}
          <div className="lg:col-span-1">
            <StepNavigation
              steps={steps}
              currentStep={toolState.currentStep}
              onStepClick={toolState.goToStep}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-lg p-6">
              {/* Loading overlay */}
              {toolState.isLoading && (
                <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-10">
                  <div className="flex items-center space-x-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="text-gray-600">Processing...</span>
                  </div>
                </div>
              )}

              {/* Error message */}
              {toolState.error && (
                <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <span className="text-red-700">{toolState.error}</span>
                    <button
                      onClick={toolState.clearError}
                      className="ml-auto text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}

              {/* Tool content */}
              {children(toolState)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecureToolBase;