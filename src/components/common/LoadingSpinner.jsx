/**
 * Loading Spinner Component with Better User Feedback
 * Provides clear loading states and progress indication
 */

import React, { useState, useEffect } from 'react';
import { Loader2, Clock } from 'lucide-react';

const LoadingSpinner = ({ 
  message = 'Loading...', 
  size = 'medium',
  showProgress = false,
  estimatedTime = null,
  onCancel = null,
  className = ''
}) => {
  const [timeElapsed, setTimeElapsed] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const getSizeClasses = () => {
    switch (size) {
      case 'small':
        return 'w-4 h-4';
      case 'large':
        return 'w-12 h-12';
      case 'medium':
      default:
        return 'w-8 h-8';
    }
  };

  const getProgressMessage = () => {
    if (!estimatedTime) return message;
    
    const progress = Math.min((timeElapsed / estimatedTime) * 100, 95);
    return `${message} (${Math.round(progress)}%)`;
  };

  const isSlowLoading = timeElapsed > 10; // Show additional info after 10 seconds

  return (
    <div className={`flex flex-col items-center justify-center space-y-4 ${className}`}>
      <div className="relative">
        <Loader2 className={`${getSizeClasses()} animate-spin text-chestnut`} />
        {showProgress && estimatedTime && (
          <div className="absolute -bottom-1 -right-1">
            <div className="w-3 h-3 bg-chestnut rounded-full animate-pulse"></div>
          </div>
        )}
      </div>
      
      <div className="text-center">
        <p className="text-charcoal font-medium">
          {getProgressMessage()}
        </p>
        
        {timeElapsed > 0 && (
          <div className="flex items-center justify-center mt-2 text-sm text-charcoal/60">
            <Clock className="w-4 h-4 mr-1" />
            <span>{Math.floor(timeElapsed / 60)}:{(timeElapsed % 60).toString().padStart(2, '0')}</span>
          </div>
        )}
        
        {isSlowLoading && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
            <p className="text-yellow-800 mb-2">
              This is taking longer than usual. Please wait...
            </p>
            {onCancel && (
              <button
                onClick={onCancel}
                className="text-chestnut hover:text-chestnut/80 underline text-sm"
              >
                Cancel
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// Full-screen loading overlay
export const LoadingOverlay = ({ 
  message = 'Loading...', 
  onCancel = null,
  transparent = false 
}) => {
  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center ${
      transparent ? 'bg-black/20' : 'bg-white'
    }`}>
      <LoadingSpinner 
        message={message}
        size="large"
        showProgress={true}
        onCancel={onCancel}
      />
    </div>
  );
};

// Inline loading state for forms and components
export const InlineLoader = ({ message = 'Loading...', className = '' }) => {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <Loader2 className="w-4 h-4 animate-spin text-chestnut" />
      <span className="text-sm text-charcoal/70">{message}</span>
    </div>
  );
};

// Button loading state
export const LoadingButton = ({ 
  children, 
  isLoading = false, 
  loadingText = 'Processing...', 
  disabled = false,
  onClick = () => {},
  className = '',
  ...props 
}) => {
  return (
    <button
      onClick={onClick}
      disabled={isLoading || disabled}
      className={`
        flex items-center justify-center space-x-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{loadingText}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default LoadingSpinner;