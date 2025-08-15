import React, { useState } from 'react';
import StepContainer from '../shared/StepContainer';

const ModelSelectionStep = ({ validationResults, onSelectModels, onPrevious, isLoading }) => {
  const [selectedModels, setSelectedModels] = useState(['logistic_regression', 'random_forest', 'gradient_boosting']);

  const availableModels = [
    { id: 'logistic_regression', name: 'Logistic Regression' },
    { id: 'random_forest', name: 'Random Forest' },
    { id: 'gradient_boosting', name: 'Gradient Boosting' },
    { id: 'svm_rbf', name: 'SVM (RBF)' },
    { id: 'decision_tree', name: 'Decision Tree' },
    { id: 'naive_bayes', name: 'Naive Bayes' },
    { id: 'knn', name: 'K-Nearest Neighbors' },
    { id: 'neural_network', name: 'Neural Network' }
  ];

  const toggleModel = (modelId) => {
    setSelectedModels(prev => 
      prev.includes(modelId)
        ? prev.filter(id => id !== modelId)
        : [...prev, modelId]
    );
  };

  const handleSubmit = () => {
    onSelectModels(selectedModels);
  };


  return (
    <StepContainer
      title="Select Models"
      description="Choose classification algorithms to train"
      currentStep={3}
      totalSteps={6}
      onNext={handleSubmit}
      onPrevious={onPrevious}
      canGoNext={selectedModels.length > 0}
      nextLabel="Train Models"
      isLoading={isLoading}
    >
      <div className="space-y-6">
        {/* Model Selection */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-charcoal mb-4">
            Select Models ({selectedModels.length} selected)
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
            {availableModels.map(model => {
              const isSelected = selectedModels.includes(model.id);
              
              return (
                <div
                  key={model.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-chestnut bg-chestnut text-white' 
                      : 'border-gray-200 bg-white hover:border-chestnut'
                  }`}
                  onClick={() => toggleModel(model.id)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{model.name}</span>
                    <div className={`w-3 h-3 rounded-full ${
                      isSelected ? 'bg-white' : 'border border-gray-300'
                    }`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Summary */}
        {validationResults && (
          <div className="bg-bone border rounded-lg p-4">
            <div className="grid grid-cols-4 gap-4 text-center text-sm">
              <div>
                <div className="font-bold text-chestnut">
                  {validationResults.summary?.shape?.[0]?.toLocaleString() || 'N/A'}
                </div>
                <div className="text-charcoal/60">Samples</div>
              </div>
              <div>
                <div className="font-bold text-chestnut">
                  {(validationResults.summary?.shape?.[1] - 1) || 'N/A'}
                </div>
                <div className="text-charcoal/60">Features</div>
              </div>
              <div>
                <div className="font-bold text-chestnut">
                  {Object.keys(validationResults.summary?.target_classes || {}).length || 'N/A'}
                </div>
                <div className="text-charcoal/60">Classes</div>
              </div>
              <div>
                <div className="font-bold text-chestnut">
                  {selectedModels.length}
                </div>
                <div className="text-charcoal/60">Models</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </StepContainer>
  );
};

export default ModelSelectionStep;