import React from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';

const StepContainer = ({
  title,
  description,
  children,
  currentStep,
  totalSteps,
  onNext,
  onPrevious,
  nextLabel = "Next Step",
  previousLabel = "Previous",
  canGoNext = true,
  canGoPrevious = true,
  isLoading = false,
  className = ""
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-charcoal">{title}</h2>
            {description && (
              <p className="text-charcoal/70 mt-1">{description}</p>
            )}
          </div>
          <div className="text-sm text-charcoal/60">
            Step {currentStep} of {totalSteps}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {children}
      </div>

      {/* Footer with Navigation */}
      <div className="border-t border-gray-200 p-6">
        <div className="flex justify-between items-center">
          <button
            onClick={onPrevious}
            disabled={!canGoPrevious || isLoading || currentStep === 1}
            className="flex items-center gap-2 px-4 py-2 text-charcoal bg-bone border border-khaki rounded-lg hover:bg-bone/80 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            <ArrowLeft size={16} />
            {previousLabel}
          </button>

          <div className="flex items-center gap-2">
            {isLoading && (
              <div className="flex items-center gap-2 text-charcoal/60">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-chestnut"></div>
                <span>Processing...</span>
              </div>
            )}
          </div>

          <button
            onClick={onNext}
            disabled={!canGoNext || isLoading}
            className="flex items-center gap-2 px-4 py-2 text-white bg-chestnut rounded-lg hover:bg-chestnut/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {nextLabel}
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StepContainer;