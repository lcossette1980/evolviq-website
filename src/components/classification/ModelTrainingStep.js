import React from 'react';
import { Brain, CheckCircle, Play } from 'lucide-react';
import StepContainer from '../shared/StepContainer';

const ModelTrainingStep = ({ selectedModels, validationResults, onTrain, isLoading }) => {
  const modelDetails = {
    logistic_regression: { name: 'Logistic Regression', icon: '📊', complexity: 'Low' },
    random_forest: { name: 'Random Forest', icon: '🌳', complexity: 'Medium' },
    gradient_boosting: { name: 'Gradient Boosting', icon: '⚡', complexity: 'High' },
    svm_rbf: { name: 'SVM (RBF)', icon: '🎯', complexity: 'High' },
    decision_tree: { name: 'Decision Tree', icon: '🌿', complexity: 'Medium' },
    naive_bayes: { name: 'Naive Bayes', icon: '📐', complexity: 'Low' },
    knn: { name: 'K-Nearest Neighbors', icon: '📍', complexity: 'Low' },
    neural_network: { name: 'Neural Network', icon: '🧠', complexity: 'High' }
  };

  const trainingSteps = [
    {
      title: 'Data Preprocessing',
      description: 'Split data into train/test sets and apply feature scaling',
      tasks: ['Train/test split (80/20)', 'Feature scaling (StandardScaler)', 'Handle categorical variables']
    },
    {
      title: 'Model Training',
      description: 'Train each selected model with optimized parameters',
      tasks: ['Initialize model parameters', 'Fit training data', 'Cross-validation']
    },
    {
      title: 'Performance Evaluation',
      description: 'Evaluate models on test set with multiple metrics',
      tasks: ['Accuracy calculation', 'Precision, Recall, F1-Score', 'ROC-AUC analysis']
    },
    {
      title: 'Results Compilation',
      description: 'Generate comprehensive comparison and insights',
      tasks: ['Model ranking', 'Feature importance', 'Confusion matrices']
    }
  ];

  return (
    <StepContainer
      title="Train Classification Models"
      description="Execute comprehensive model training and evaluation"
      currentStep={4}
      totalSteps={6}
      onNext={onTrain}
      canGoNext={!isLoading}
      nextLabel={isLoading ? "Training Models..." : "Start Training"}
      isLoading={isLoading}
    >
      <div className="space-y-6">
        {/* Training Overview */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-800 mb-2">Training Overview</h3>
          <p className="text-blue-700">
            Your selected models will be trained using robust cross-validation and evaluated with 
            multiple performance metrics. Training time depends on data size and model complexity.
          </p>
        </div>

        {/* Selected Models */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="font-semibold text-charcoal mb-4 flex items-center gap-2">
            <Brain size={20} />
            Selected Models ({selectedModels?.length || 0})
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {selectedModels?.map(modelId => {
              const model = modelDetails[modelId];
              if (!model) return null;
              
              return (
                <div key={modelId} className="p-4 bg-bone rounded-lg border">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{model.icon}</span>
                    <div>
                      <div className="font-medium text-charcoal">{model.name}</div>
                      <div className="text-sm text-charcoal/60">
                        Complexity: {model.complexity}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Training Process */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="font-semibold text-charcoal mb-4">Training Process</h3>
          
          <div className="space-y-4">
            {trainingSteps.map((step, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-chestnut text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-charcoal">{step.title}</h4>
                  <p className="text-sm text-charcoal/60 mb-2">{step.description}</p>
                  <ul className="text-xs text-charcoal/50 space-y-1">
                    {step.tasks.map((task, taskIdx) => (
                      <li key={taskIdx} className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-chestnut rounded-full"></div>
                        {task}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dataset Info */}
        {validationResults && (
          <div className="bg-bone border rounded-lg p-4">
            <h4 className="font-medium text-charcoal mb-3">Training Dataset</h4>
            <div className="grid md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-bold text-chestnut">
                  {validationResults.summary?.shape?.[0]?.toLocaleString() || 'N/A'}
                </div>
                <div className="text-charcoal/60">Total Samples</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-chestnut">
                  {Math.floor((validationResults.summary?.shape?.[0] || 0) * 0.8)?.toLocaleString()}
                </div>
                <div className="text-charcoal/60">Training Samples</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-chestnut">
                  {(validationResults.summary?.shape?.[1] - 1) || 'N/A'}
                </div>
                <div className="text-charcoal/60">Features</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-chestnut">
                  {Object.keys(validationResults.summary?.target_classes || {}).length || 'N/A'}
                </div>
                <div className="text-charcoal/60">Classes</div>
              </div>
            </div>
          </div>
        )}

        {/* Training Action */}
        <div className="bg-white border rounded-lg p-8 text-center">
          <div className="mb-6">
            <Play size={48} className="mx-auto text-chestnut mb-4" />
            <h3 className="text-xl font-semibold text-charcoal mb-2">
              Ready to Train Models
            </h3>
            <p className="text-charcoal/70">
              Click "Start Training" to begin the machine learning process. 
              All selected models will be trained simultaneously for efficiency.
            </p>
          </div>

          {isLoading && (
            <div className="mb-6">
              <div className="flex justify-center space-x-1 mb-4">
                <div className="w-2 h-2 bg-chestnut rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-chestnut rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-chestnut rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <p className="text-charcoal/60">
                Training in progress... This may take several minutes.
              </p>
            </div>
          )}

          <div className="text-sm text-charcoal/50">
            <p>Estimated training time: {Math.ceil((selectedModels?.length || 1) * 0.5)} - {(selectedModels?.length || 1) * 2} minutes</p>
          </div>
        </div>
      </div>
    </StepContainer>
  );
};

export default ModelTrainingStep;