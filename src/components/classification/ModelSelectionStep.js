import React, { useState } from 'react';
import { Brain, Info, TrendingUp } from 'lucide-react';
import StepContainer from '../shared/StepContainer';

const ModelSelectionStep = ({ validationResults, onSelectModels, isLoading }) => {
  const [selectedModels, setSelectedModels] = useState(['logistic_regression', 'random_forest', 'gradient_boosting']);

  const availableModels = [
    { 
      id: 'logistic_regression', 
      name: 'Logistic Regression', 
      category: 'Linear', 
      complexity: 'Low', 
      interpretability: 'High',
      description: 'Fast, interpretable, works well with linear patterns'
    },
    { 
      id: 'random_forest', 
      name: 'Random Forest', 
      category: 'Ensemble', 
      complexity: 'Medium', 
      interpretability: 'Medium',
      description: 'Robust, handles non-linear patterns, feature importance'
    },
    { 
      id: 'gradient_boosting', 
      name: 'Gradient Boosting', 
      category: 'Ensemble', 
      complexity: 'High', 
      interpretability: 'Low',
      description: 'High accuracy, complex patterns, requires tuning'
    },
    { 
      id: 'svm_rbf', 
      name: 'SVM (RBF)', 
      category: 'Support Vector', 
      complexity: 'High', 
      interpretability: 'Low',
      description: 'Effective for complex boundaries, kernel trick'
    },
    { 
      id: 'decision_tree', 
      name: 'Decision Tree', 
      category: 'Tree-based', 
      complexity: 'Medium', 
      interpretability: 'High',
      description: 'Highly interpretable, prone to overfitting'
    },
    { 
      id: 'naive_bayes', 
      name: 'Naive Bayes', 
      category: 'Probabilistic', 
      complexity: 'Low', 
      interpretability: 'High',
      description: 'Fast, works well with small datasets'
    },
    { 
      id: 'knn', 
      name: 'K-Nearest Neighbors', 
      category: 'Instance-based', 
      complexity: 'Low', 
      interpretability: 'Medium',
      description: 'Simple, non-parametric, sensitive to scale'
    },
    { 
      id: 'neural_network', 
      name: 'Neural Network', 
      category: 'Deep Learning', 
      complexity: 'High', 
      interpretability: 'Low',
      description: 'Flexible, captures complex patterns, needs data'
    }
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

  const getComplexityColor = (complexity) => {
    switch (complexity) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <StepContainer
      title="Select Classification Models"
      description="Choose the machine learning algorithms to train and compare"
      currentStep={3}
      totalSteps={6}
      onNext={handleSubmit}
      canGoNext={selectedModels.length > 0}
      nextLabel="Train Selected Models"
      isLoading={isLoading}
    >
      <div className="space-y-6">
        {/* Model Selection Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
            <Info size={16} />
            Model Selection Guide
          </h3>
          <div className="text-blue-700 text-sm space-y-2">
            <p>• <strong>Linear models</strong> (Logistic Regression, SVM) work well when data is linearly separable</p>
            <p>• <strong>Tree-based models</strong> (Random Forest, Decision Tree) handle non-linear patterns naturally</p>
            <p>• <strong>Ensemble methods</strong> (Random Forest, Gradient Boosting) often provide the best performance</p>
            <p>• Consider the trade-off between <strong>accuracy</strong> and <strong>interpretability</strong> for your use case</p>
          </div>
        </div>

        {/* Dataset Summary */}
        {validationResults && (
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold text-charcoal mb-3">Dataset Summary</h3>
            <div className="grid md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-xl font-bold text-chestnut">
                  {validationResults.summary?.shape?.[0]?.toLocaleString() || 'N/A'}
                </div>
                <div className="text-charcoal/60">Samples</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-chestnut">
                  {(validationResults.summary?.shape?.[1] - 1) || 'N/A'}
                </div>
                <div className="text-charcoal/60">Features</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-chestnut">
                  {Object.keys(validationResults.summary?.target_classes || {}).length || 'N/A'}
                </div>
                <div className="text-charcoal/60">Classes</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-chestnut">
                  {validationResults.summary?.memory_usage || 'N/A'}
                </div>
                <div className="text-charcoal/60">Memory</div>
              </div>
            </div>
          </div>
        )}

        {/* Model Cards */}
        <div>
          <h3 className="font-semibold text-charcoal mb-4 flex items-center gap-2">
            <Brain size={20} />
            Available Models ({selectedModels.length} selected)
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableModels.map(model => {
              const isSelected = selectedModels.includes(model.id);
              
              return (
                <div
                  key={model.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-chestnut bg-chestnut/5 shadow-md' 
                      : 'border-gray-200 bg-white hover:border-chestnut/50'
                  }`}
                  onClick={() => toggleModel(model.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold text-charcoal pr-2">{model.name}</h4>
                    <div className={`w-4 h-4 rounded-full border-2 border-chestnut flex-shrink-0 ${
                      isSelected ? 'bg-chestnut' : 'bg-transparent'
                    }`} />
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-charcoal/70">Category:</span>
                      <span className="font-medium">{model.category}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-charcoal/70">Complexity:</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getComplexityColor(model.complexity)}`}>
                        {model.complexity}
                      </span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-charcoal/70">Interpretability:</span>
                      <span className="font-medium">{model.interpretability}</span>
                    </div>
                    
                    <p className="text-xs text-charcoal/60 mt-3 leading-relaxed">
                      {model.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selection Summary */}
        <div className="bg-bone border rounded-lg p-4">
          <h4 className="font-medium text-charcoal mb-2">Training Configuration</h4>
          <div className="text-sm text-charcoal/70 space-y-1">
            <div>• Selected models: {selectedModels.length}</div>
            <div>• Training method: 5-fold cross-validation</div>
            <div>• Evaluation metrics: Accuracy, Precision, Recall, F1-Score, ROC-AUC</div>
            <div>• Estimated training time: {Math.ceil(selectedModels.length * 0.5)} - {selectedModels.length * 2} minutes</div>
          </div>
        </div>

        {selectedModels.length === 0 && (
          <div className="text-center text-charcoal/60 py-4">
            Please select at least one model to continue
          </div>
        )}
      </div>
    </StepContainer>
  );
};

export default ModelSelectionStep;