/**
 * Global Error Handling Context
 * Provides centralized error management with user-friendly notifications
 * 
 * This replaces scattered console.error calls and alert() popups
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

const ErrorContext = createContext(null);

// Error types for different severity levels
export const ERROR_TYPES = {
  SUCCESS: 'success',
  INFO: 'info', 
  WARNING: 'warning',
  ERROR: 'error'
};

// Error categories for different error sources
export const ERROR_CATEGORIES = {
  NETWORK: 'network',
  VALIDATION: 'validation',
  AUTHENTICATION: 'auth',
  AUTHORIZATION: 'authz',
  PAYMENT: 'payment',
  FILE_UPLOAD: 'file_upload',
  PREMIUM: 'premium',
  SYSTEM: 'system'
};

const ErrorProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  // Add a new notification
  const addNotification = useCallback((notification) => {
    const id = Date.now().toString();
    const newNotification = {
      id,
      type: ERROR_TYPES.ERROR,
      title: 'Error',
      message: 'An error occurred',
      category: ERROR_CATEGORIES.SYSTEM,
      duration: 5000, // 5 seconds default
      actions: [],
      ...notification
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove after duration (unless duration is 0 for persistent notifications)
    if (newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  }, []);

  // Remove a notification
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  // Clear all notifications
  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Convenience methods for different error types
  const showSuccess = useCallback((message, options = {}) => {
    return addNotification({
      type: ERROR_TYPES.SUCCESS,
      title: 'Success',
      message,
      duration: 3000,
      ...options
    });
  }, [addNotification]);

  const showError = useCallback((message, options = {}) => {
    return addNotification({
      type: ERROR_TYPES.ERROR,
      title: 'Error',
      message,
      duration: 8000, // Longer for errors
      ...options
    });
  }, [addNotification]);

  const showWarning = useCallback((message, options = {}) => {
    return addNotification({
      type: ERROR_TYPES.WARNING,
      title: 'Warning',
      message,
      duration: 5000,
      ...options
    });
  }, [addNotification]);

  const showInfo = useCallback((message, options = {}) => {
    return addNotification({
      type: ERROR_TYPES.INFO,
      title: 'Information',
      message,
      duration: 4000,
      ...options
    });
  }, [addNotification]);

  // Handle different types of errors with context-aware messages
  const handleError = useCallback((error, context = {}) => {
    console.error('Error occurred:', error, context);

    let message = 'An unexpected error occurred';
    let title = 'Error';
    let category = ERROR_CATEGORIES.SYSTEM;
    let actions = [];

    // Handle different error types
    if (error?.name === 'ValidationError') {
      category = ERROR_CATEGORIES.VALIDATION;
      title = 'Validation Error';
      message = error.message || 'Please check your input and try again';
    } else if (error?.message?.includes('auth') || error?.status === 401) {
      category = ERROR_CATEGORIES.AUTHENTICATION;
      title = 'Authentication Required';
      message = 'Please log in to continue';
      actions = [
        {
          label: 'Log In',
          action: () => window.location.href = '/membership'
        }
      ];
    } else if (error?.status === 403) {
      category = ERROR_CATEGORIES.AUTHORIZATION;
      title = 'Access Denied';
      message = 'You don\'t have permission to perform this action';
    } else if (error?.status === 402 || error?.message?.includes('premium')) {
      category = ERROR_CATEGORIES.PREMIUM;
      title = 'Premium Required';
      message = 'This feature requires a premium subscription';
      actions = [
        {
          label: 'Upgrade',
          action: () => window.location.href = '/membership'
        }
      ];
    } else if (error?.status === 429) {
      category = ERROR_CATEGORIES.NETWORK;
      title = 'Rate Limited';
      message = 'Too many requests. Please wait a moment and try again';
    } else if (error?.message?.includes('network') || error?.message?.includes('fetch')) {
      category = ERROR_CATEGORIES.NETWORK;
      title = 'Connection Error';
      message = 'Please check your internet connection and try again';
      actions = [
        {
          label: 'Retry',
          action: context.retryAction
        }
      ].filter(action => action.action); // Remove if no retry action provided
    } else if (error?.message?.includes('file') || error?.message?.includes('upload')) {
      category = ERROR_CATEGORIES.FILE_UPLOAD;
      title = 'Upload Error';
      message = error.message || 'File upload failed. Please try again';
    }

    return showError(message, {
      title,
      category,
      actions,
      duration: actions.length > 0 ? 0 : 8000, // Persistent if actions available
      details: context.details
    });
  }, [showError]);

  // Handle API response errors
  const handleApiError = useCallback(async (response, context = {}) => {
    let errorData = {};
    try {
      errorData = await response.json();
    } catch (e) {
      // Response doesn't have JSON body
    }

    const error = {
      status: response.status,
      message: errorData.message || `HTTP ${response.status}: ${response.statusText}`,
      details: errorData.details
    };

    return handleError(error, context);
  }, [handleError]);

  const value = {
    notifications,
    addNotification,
    removeNotification,
    clearNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    handleError,
    handleApiError
  };

  return (
    <ErrorContext.Provider value={value}>
      {children}
      <NotificationContainer 
        notifications={notifications} 
        onRemove={removeNotification} 
      />
    </ErrorContext.Provider>
  );
};

// Notification display component
const NotificationContainer = ({ notifications, onRemove }) => {
  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications.map(notification => (
        <NotificationCard
          key={notification.id}
          notification={notification}
          onRemove={() => onRemove(notification.id)}
        />
      ))}
    </div>
  );
};

// Individual notification card
const NotificationCard = ({ notification, onRemove }) => {
  const { type, title, message, actions } = notification;

  const getIcon = () => {
    switch (type) {
      case ERROR_TYPES.SUCCESS:
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case ERROR_TYPES.INFO:
        return <Info className="w-5 h-5 text-blue-600" />;
      case ERROR_TYPES.WARNING:
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case ERROR_TYPES.ERROR:
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Info className="w-5 h-5 text-gray-600" />;
    }
  };

  const getBackgroundColor = () => {
    switch (type) {
      case ERROR_TYPES.SUCCESS:
        return 'bg-green-50 border-green-200';
      case ERROR_TYPES.INFO:
        return 'bg-blue-50 border-blue-200';
      case ERROR_TYPES.WARNING:
        return 'bg-yellow-50 border-yellow-200';
      case ERROR_TYPES.ERROR:
        return 'bg-red-50 border-red-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`${getBackgroundColor()} border rounded-lg p-4 shadow-lg animate-slide-in`}>
      <div className="flex items-start">
        <div className="flex-shrink-0 mr-3">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 mb-1">
            {title}
          </h4>
          <p className="text-sm text-gray-700">
            {message}
          </p>
          {actions && actions.length > 0 && (
            <div className="mt-3 flex space-x-2">
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className="text-xs font-medium text-chestnut hover:text-chestnut/80 underline"
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="flex-shrink-0 ml-4">
          <button
            onClick={onRemove}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Hook for using the error context
export const useError = () => {
  const context = useContext(ErrorContext);
  if (!context) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return context;
};

export default ErrorProvider;