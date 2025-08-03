import React from 'react';
import { BarChart3, AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * Custom error fallback for chart components
 * Provides a visual placeholder when charts fail to render
 */
const ChartErrorFallback = ({ error, onRetry, height = 300 }) => {
  return (
    <div 
      className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center p-8"
      style={{ minHeight: height }}
    >
      <div className="text-center max-w-sm">
        <div className="flex justify-center mb-4">
          <div className="relative">
            <BarChart3 className="w-12 h-12 text-gray-400" />
            <AlertTriangle className="w-6 h-6 text-red-500 absolute -bottom-1 -right-1" />
          </div>
        </div>
        
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Unable to Load Chart
        </h3>
        
        <p className="text-sm text-gray-600 mb-4">
          We encountered an error while loading this visualization. 
          The data might be unavailable or there could be a rendering issue.
        </p>
        
        {onRetry && (
          <button
            onClick={onRetry}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-chestnut"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </button>
        )}
        
        {process.env.NODE_ENV === 'development' && error && (
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-xs text-gray-500 hover:text-gray-700">
              Error Details
            </summary>
            <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto max-h-32">
              {error.toString()}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
};

export default ChartErrorFallback;