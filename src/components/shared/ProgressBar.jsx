import React from 'react';

const ProgressBar = ({ progress, className = '', showLabel = false }) => {
  return (
    <div className={`w-full ${className}`}>
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="bg-chestnut h-full rounded-full transition-all duration-300 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
      {showLabel && (
        <div className="text-right mt-1">
          <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
        </div>
      )}
    </div>
  );
};

export default ProgressBar;