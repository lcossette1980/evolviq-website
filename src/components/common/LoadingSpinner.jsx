import React from 'react';
import { colors } from '../../utils/colors';

/**
 * Loading Spinner Component
 * Reusable loading indicator with consistent styling
 */
const LoadingSpinner = ({ message = "Loading...", fullScreen = false }) => {
  if (fullScreen) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div 
            className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" 
            style={{ borderBottomColor: colors.chestnut }}
          />
          <p className="text-gray-600">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center p-8">
      <div className="text-center">
        <div 
          className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-2" 
          style={{ borderBottomColor: colors.chestnut }}
        />
        <p className="text-sm text-gray-600">{message}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;