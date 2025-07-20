import React from 'react';
import { CheckCircle } from 'lucide-react';

const StepNavigation = ({ steps, currentStep, onStepClick, className = "" }) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
      <h2 className="text-xl font-bold text-charcoal mb-6">Analysis Progress</h2>
      
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-charcoal/60 mb-2">
          <span>Step {currentStep} of {steps.length}</span>
          <span>{Math.round((currentStep / steps.length) * 100)}% Complete</span>
        </div>
        <div className="w-full bg-pearl h-3 rounded-full overflow-hidden">
          <div 
            className="bg-chestnut h-3 rounded-full transition-all duration-500"
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step List */}
      <div className="space-y-3">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isComplete = stepNumber < currentStep;
          const isAccessible = stepNumber <= currentStep;

          return (
            <button
              key={step.id}
              onClick={() => isAccessible && onStepClick(stepNumber)}
              disabled={!isAccessible}
              className={`w-full p-4 rounded-lg text-left transition-all duration-200 ${
                isActive 
                  ? 'bg-chestnut text-white shadow-md' 
                  : isComplete 
                    ? 'bg-green-50 text-charcoal hover:bg-green-100 border border-green-200'
                    : isAccessible
                      ? 'bg-bone text-charcoal hover:bg-bone/80 border border-khaki'
                      : 'bg-gray-50 text-gray-400 cursor-not-allowed'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  isActive 
                    ? 'bg-white text-chestnut' 
                    : isComplete 
                      ? 'bg-green-600 text-white'
                      : isAccessible
                        ? 'bg-khaki text-charcoal'
                        : 'bg-gray-300 text-gray-500'
                }`}>
                  {isComplete ? <CheckCircle size={16} /> : stepNumber}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{step.name}</div>
                  {step.description && (
                    <div className={`text-sm mt-1 ${
                      isActive ? 'text-white/80' : 'text-charcoal/60'
                    }`}>
                      {step.description}
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default StepNavigation;