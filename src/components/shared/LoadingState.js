import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingState = ({ 
  message = "Processing...", 
  submessage = null,
  className = ""
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border p-12 text-center ${className}`}>
      <div className="flex flex-col items-center">
        <Loader2 size={48} className="text-chestnut animate-spin mb-4" />
        <h3 className="text-xl font-semibold text-charcoal mb-2">{message}</h3>
        {submessage && (
          <p className="text-charcoal/60">{submessage}</p>
        )}
        <div className="mt-6 flex space-x-1">
          <div className="w-2 h-2 bg-chestnut rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-chestnut rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
          <div className="w-2 h-2 bg-chestnut rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingState;