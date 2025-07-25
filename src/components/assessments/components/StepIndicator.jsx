import React from 'react';
import { Brain, MessageSquare, TrendingUp, BookOpen } from 'lucide-react';

const StepIndicator = ({ currentStep, colors }) => {
  const assessmentSteps = [
    { id: 'intro', title: 'Introduction', icon: Brain },
    { id: 'assessment', title: 'Assessment', icon: MessageSquare },
    { id: 'results', title: 'Results', icon: TrendingUp },
    { id: 'learning', title: 'Learning Plan', icon: BookOpen }
  ];

  return (
    <div className="flex justify-center mb-6 sm:mb-8 px-4">
      <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto max-w-full">
        {assessmentSteps.map((step, index) => {
          const Icon = step.icon;
          const isActive = step.id === currentStep;
          const isCompleted = assessmentSteps.findIndex(s => s.id === currentStep) > index;
          
          return (
            <div key={step.id} className="flex items-center flex-shrink-0">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                isActive ? 'text-white' : 
                isCompleted ? 'bg-green-100 text-green-600' : 
                'bg-gray-100 text-gray-400'
              }`}
              style={isActive ? { backgroundColor: colors.chestnut } : {}}
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="ml-1 sm:ml-2 mr-2 sm:mr-4">
                <div className={`text-xs sm:text-sm font-medium ${
                  isActive ? 'text-chestnut' : 
                  isCompleted ? 'text-green-600' : 
                  'text-gray-400'
                }`}
                style={isActive ? { color: colors.chestnut } : {}}
                >
                  {step.title}
                </div>
              </div>
              {index < assessmentSteps.length - 1 && (
                <div className={`w-4 sm:w-8 h-0.5 ${
                  isCompleted ? 'bg-green-300' : 'bg-gray-200'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StepIndicator;