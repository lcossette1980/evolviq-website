import React, { useState, useEffect } from 'react';

const ModelTraining = ({ preprocessingResults, onTrain, isLoading }) => {
  const [config, setConfig] = useState({
    test_size: 0.2,
    models_to_include: ['linear', 'ridge', 'lasso', 'elastic_net', 'random_forest'],
    hyperparameter_tuning: true,
    cv_folds: 5
  });
  const [trainingProgress, setTrainingProgress] = useState(0);
  const [trainingMessage, setTrainingMessage] = useState('');

  const availableModels = [
    { 
      id: 'linear', 
      name: 'Linear Regression', 
      description: 'Simple linear relationship between features and target',
      pros: 'Fast, interpretable, good baseline',
      cons: 'Assumes linear relationships'
    },
    { 
      id: 'ridge', 
      name: 'Ridge Regression', 
      description: 'Linear regression with L2 regularization',
      pros: 'Handles multicollinearity, prevents overfitting',
      cons: 'Less interpretable coefficients'
    },
    { 
      id: 'lasso', 
      name: 'Lasso Regression', 
      description: 'Linear regression with L1 regularization',
      pros: 'Feature selection, sparse solutions',
      cons: 'Can be unstable with correlated features'
    },
    { 
      id: 'elastic_net', 
      name: 'Elastic Net', 
      description: 'Combines L1 and L2 regularization',
      pros: 'Balances Ridge and Lasso benefits',
      cons: 'More hyperparameters to tune'
    },
    { 
      id: 'random_forest', 
      name: 'Random Forest', 
      description: 'Ensemble of decision trees',
      pros: 'Handles non-linearity, robust to outliers',
      cons: 'Less interpretable, can overfit'
    },
    { 
      id: 'gradient_boosting', 
      name: 'Gradient Boosting', 
      description: 'Sequential ensemble of weak learners',
      pros: 'High accuracy, handles complex patterns',
      cons: 'Prone to overfitting, longer training'
    },
    { 
      id: 'svr', 
      name: 'Support Vector Regression', 
      description: 'SVM adapted for regression',
      pros: 'Effective in high dimensions, memory efficient',
      cons: 'Sensitive to feature scaling, slower on large datasets'
    }
  ];

  const handleModelToggle = (modelId) => {
    setConfig(prev => ({
      ...prev,
      models_to_include: prev.models_to_include.includes(modelId)
        ? prev.models_to_include.filter(id => id !== modelId)
        : [...prev.models_to_include, modelId]
    }));
  };

  useEffect(() => {
    if (isLoading) {
      // Simulate progress updates for better user feedback
      const messages = [
        'Initializing models...',
        'Splitting data into train/test sets...',
        'Training models...',
        'Performing cross-validation...',
        'Evaluating model performance...',
        'Comparing results...'
      ];
      
      let currentMessage = 0;
      const interval = setInterval(() => {
        setTrainingProgress(prev => Math.min(prev + 10, 90));
        setTrainingMessage(messages[Math.min(currentMessage++, messages.length - 1)]);
      }, 3000);
      
      return () => clearInterval(interval);
    } else {
      setTrainingProgress(0);
      setTrainingMessage('');
    }
  }, [isLoading]);

  const handleSubmit = () => {
    if (onTrain && config.models_to_include.length > 0) {
      // Check for large datasets and warn about potential timeouts
      const totalRows = preprocessingResults.final_shape[0];
      const totalFeatures = preprocessingResults.feature_columns?.length || 0;
      const dataSize = totalRows * totalFeatures;
      
      if (dataSize > 50000 || config.models_to_include.includes('gradient_boosting')) {
        const confirmMessage = `Your dataset has ${totalRows} rows and ${totalFeatures} features. ` +
          `Training ${config.models_to_include.length} models might take several minutes. ` +
          `Consider reducing the number of models or using a smaller dataset if you experience timeouts.\n\n` +
          `Continue with training?`;
        
        if (!window.confirm(confirmMessage)) {
          return;
        }
      }
      
      onTrain(config);
    }
  };

  if (!preprocessingResults) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif font-bold text-charcoal mb-2">
          Model Training Configuration
        </h2>
        <p className="text-charcoal/70">
          Configure and train multiple regression models to find the best performer for your data.
        </p>
      </div>

      {/* Data Summary */}
      <div className="bg-pearl/20 rounded-lg p-4">
        <h3 className="text-lg font-medium text-charcoal mb-3">Preprocessed Data</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-xl font-bold text-chestnut">{preprocessingResults.final_shape[0]}</div>
            <div className="text-sm text-charcoal/60">Rows</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-chestnut">{preprocessingResults.feature_columns?.length || 0}</div>
            <div className="text-sm text-charcoal/60">Features</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-chestnut">{Math.round(config.test_size * 100)}%</div>
            <div className="text-sm text-charcoal/60">Test Split</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-chestnut">{config.cv_folds}</div>
            <div className="text-sm text-charcoal/60">CV Folds</div>
          </div>
        </div>
      </div>

      {/* Train/Test Split */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-charcoal mb-4">Train/Test Split</h3>
        <p className="text-sm text-charcoal/60 mb-4">
          Percentage of data to use for testing model performance.
        </p>
        
        <div className="space-y-3">
          {[0.1, 0.2, 0.3].map((size) => (
            <label key={size} className="flex items-center">
              <input
                type="radio"
                name="test_size"
                value={size}
                checked={config.test_size === size}
                onChange={(e) => setConfig(prev => ({ ...prev, test_size: parseFloat(e.target.value) }))}
                className="mr-3 text-chestnut focus:ring-chestnut"
              />
              <div>
                <span className="font-medium text-charcoal">{Math.round(size * 100)}% Test Data</span>
                <span className="text-sm text-charcoal/60 ml-2">
                  ({Math.round(preprocessingResults.final_shape[0] * size)} test, {Math.round(preprocessingResults.final_shape[0] * (1-size))} train)
                </span>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Cross-Validation */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-charcoal mb-4">Cross-Validation</h3>
        <p className="text-sm text-charcoal/60 mb-4">
          Number of folds for cross-validation to assess model stability.
        </p>
        
        <div className="flex space-x-4">
          {[3, 5, 10].map((folds) => (
            <label key={folds} className="flex items-center">
              <input
                type="radio"
                name="cv_folds"
                value={folds}
                checked={config.cv_folds === folds}
                onChange={(e) => setConfig(prev => ({ ...prev, cv_folds: parseInt(e.target.value) }))}
                className="mr-2 text-chestnut focus:ring-chestnut"
              />
              <span className="text-charcoal">{folds}-Fold</span>
            </label>
          ))}
        </div>
      </div>

      {/* Model Selection */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-charcoal mb-4">Model Selection</h3>
        <p className="text-sm text-charcoal/60 mb-4">
          Choose which models to train and compare. Select at least one model.
        </p>
        
        <div className="grid gap-4">
          {availableModels.map((model) => (
            <label key={model.id} className="flex items-start p-4 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={config.models_to_include.includes(model.id)}
                onChange={() => handleModelToggle(model.id)}
                className="mt-1 mr-3 text-chestnut focus:ring-chestnut"
              />
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-charcoal">{model.name}</h4>
                  <div className="flex space-x-2 text-xs">
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded">Pros: {model.pros}</span>
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded">Cons: {model.cons}</span>
                  </div>
                </div>
                <p className="text-sm text-charcoal/60 mt-1">{model.description}</p>
              </div>
            </label>
          ))}
        </div>
        
        <div className="mt-4 text-sm text-charcoal/60">
          Selected: {config.models_to_include.length} model{config.models_to_include.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Hyperparameter Tuning */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-charcoal mb-4">Advanced Options</h3>
        
        <label className="flex items-start">
          <input
            type="checkbox"
            checked={config.hyperparameter_tuning}
            onChange={(e) => setConfig(prev => ({ ...prev, hyperparameter_tuning: e.target.checked }))}
            className="mt-1 mr-3 text-chestnut focus:ring-chestnut"
          />
          <div>
            <div className="font-medium text-charcoal">Hyperparameter Tuning</div>
            <div className="text-sm text-charcoal/60">
              Automatically optimize model parameters for better performance (increases training time)
            </div>
          </div>
        </label>
      </div>

      {/* Training Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-md font-medium text-blue-800 mb-2">Training Summary</h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• {config.models_to_include.length} model{config.models_to_include.length !== 1 ? 's' : ''} will be trained</li>
          <li>• {Math.round(config.test_size * 100)}% of data held out for testing</li>
          <li>• {config.cv_folds}-fold cross-validation for model evaluation</li>
          <li>• Hyperparameter tuning: {config.hyperparameter_tuning ? 'Enabled' : 'Disabled'}</li>
          <li>• Estimated training time: {config.models_to_include.length * (config.hyperparameter_tuning ? 2 : 1)} - {config.models_to_include.length * (config.hyperparameter_tuning ? 5 : 2)} minutes</li>
        </ul>
        
        {preprocessingResults && (preprocessingResults.final_shape[0] * (preprocessingResults.feature_columns?.length || 0)) > 50000 && (
          <div className="mt-3 p-3 bg-yellow-100 border border-yellow-300 rounded">
            <p className="text-xs text-yellow-800">
              <strong>Large Dataset Detected:</strong> Your dataset has {preprocessingResults.final_shape[0]} rows and {preprocessingResults.feature_columns?.length || 0} features. 
              For better performance, consider:
            </p>
            <ul className="text-xs text-yellow-700 mt-1 ml-4 list-disc">
              <li>Reducing the number of models to train</li>
              <li>Disabling hyperparameter tuning for faster training</li>
              <li>Using fewer cross-validation folds</li>
            </ul>
          </div>
        )}
      </div>

      {/* Train Button and Progress */}
      <div className="space-y-4">
        {isLoading && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="mb-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-blue-700">{trainingMessage}</span>
                <span className="text-sm text-blue-600">{trainingProgress}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${trainingProgress}%` }}
                />
              </div>
            </div>
            <p className="text-xs text-blue-600 mt-2">
              This may take several minutes for large datasets. Please don't close this window.
            </p>
          </div>
        )}
        
        <div className="flex justify-center">
          <button
            onClick={handleSubmit}
            disabled={isLoading || config.models_to_include.length === 0}
            className={`px-8 py-3 rounded-lg font-medium transition-colors ${
              isLoading || config.models_to_include.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-chestnut text-white hover:bg-chestnut/90'
            }`}
          >
            {isLoading ? (
              <div className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Training Models...
              </div>
            ) : (
              `Train ${config.models_to_include.length} Model${config.models_to_include.length !== 1 ? 's' : ''}`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModelTraining;