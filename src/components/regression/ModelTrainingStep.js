import React, { useState } from 'react';
import { Play, TrendingUp } from 'lucide-react';

const ModelTrainingStep = ({ preprocessResults, validationResults, onTrain, onPrevious, isLoading }) => {
  const [config, setConfig] = useState({
    models: ['linear_regression'],
    test_size: 0.2,
    cross_validation: true,
    cv_folds: 5
  });

  const availableModels = [
    { id: 'linear_regression', name: 'Linear Regression', description: 'Standard linear model' },
    { id: 'ridge', name: 'Ridge Regression', description: 'L2 regularization' },
    { id: 'lasso', name: 'Lasso Regression', description: 'L1 regularization' },
    { id: 'elastic_net', name: 'Elastic Net', description: 'Combined L1+L2' },
    { id: 'random_forest', name: 'Random Forest', description: 'Ensemble tree model' },
    { id: 'gradient_boosting', name: 'Gradient Boosting', description: 'Boosted trees' }
  ];

  const toggleModel = (modelId) => {
    setConfig(prev => ({
      ...prev,
      models: prev.models.includes(modelId)
        ? prev.models.filter(m => m !== modelId)
        : [...prev.models, modelId]
    }));
  };

  const handleSubmit = () => {
    onTrain(config);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="text-chestnut" size={24} />
          <h3 className="text-lg font-semibold text-charcoal">Model Training Configuration</h3>
        </div>

        {/* Model Selection */}
        <div className="mb-6">
          <h4 className="font-medium text-charcoal mb-3">Select Models to Train</h4>
          <div className="grid md:grid-cols-2 gap-2">
            {availableModels.map(model => (
              <label key={model.id} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.models.includes(model.id)}
                  onChange={() => toggleModel(model.id)}
                  className="mr-3 text-chestnut focus:ring-chestnut"
                />
                <div>
                  <div className="font-medium">{model.name}</div>
                  <div className="text-xs text-charcoal/60">{model.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Test Size */}
        <div className="mb-6">
          <h4 className="font-medium text-charcoal mb-3">
            Test Set Size: {Math.round(config.test_size * 100)}%
          </h4>
          <input
            type="range"
            min="10"
            max="40"
            step="5"
            value={config.test_size * 100}
            onChange={(e) => setConfig(prev => ({ 
              ...prev, 
              test_size: parseInt(e.target.value) / 100 
            }))}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-charcoal/60 mt-1">
            <span>10% (More training data)</span>
            <span>40% (More test data)</span>
          </div>
        </div>

        {/* Cross Validation */}
        <div className="mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.cross_validation}
              onChange={(e) => setConfig(prev => ({ 
                ...prev, 
                cross_validation: e.target.checked 
              }))}
              className="mr-3 text-chestnut focus:ring-chestnut"
            />
            <div>
              <div className="font-medium">Enable Cross-Validation</div>
              <div className="text-sm text-charcoal/60">More robust model evaluation</div>
            </div>
          </label>

          {config.cross_validation && (
            <div className="mt-3 ml-6">
              <label className="text-sm text-charcoal/70">
                Number of Folds:
                <input
                  type="number"
                  min="3"
                  max="10"
                  value={config.cv_folds}
                  onChange={(e) => setConfig(prev => ({ 
                    ...prev, 
                    cv_folds: parseInt(e.target.value) 
                  }))}
                  className="ml-2 w-16 px-2 py-1 border rounded focus:ring-2 focus:ring-chestnut/20"
                />
              </label>
            </div>
          )}
        </div>
      </div>

      {/* Dataset Summary */}
      {preprocessResults && (
        <div className="bg-bone border rounded-lg p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="font-bold text-chestnut text-2xl">
                {preprocessResults.X_shape?.[0] || validationResults?.summary?.shape?.[0] || 'N/A'}
              </div>
              <div className="text-charcoal/60 text-sm">Samples</div>
            </div>
            <div>
              <div className="font-bold text-chestnut text-2xl">
                {preprocessResults.X_shape?.[1] || preprocessResults.feature_columns?.length || 'N/A'}
              </div>
              <div className="text-charcoal/60 text-sm">Features</div>
            </div>
            <div>
              <div className="font-bold text-chestnut text-2xl">
                {config.models.length}
              </div>
              <div className="text-charcoal/60 text-sm">Models</div>
            </div>
          </div>
        </div>
      )}

      {/* Training Action */}
      {isLoading ? (
        <div className="bg-white border rounded-lg p-8 text-center">
          <div className="flex justify-center space-x-1 mb-4">
            <div className="w-2 h-2 bg-chestnut rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-chestnut rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-chestnut rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
          <p className="text-charcoal/60">Training models...</p>
          <p className="text-sm text-charcoal/40 mt-2">This may take a moment</p>
        </div>
      ) : (
        <div className="bg-white border rounded-lg p-8 text-center">
          <Play size={48} className="mx-auto text-chestnut mb-4" />
          <h3 className="text-xl font-semibold text-charcoal mb-2">Ready to Train</h3>
          <p className="text-charcoal/70">
            Train {config.models.length} regression model{config.models.length !== 1 ? 's' : ''}
            {config.cross_validation && ` with ${config.cv_folds}-fold cross-validation`}
          </p>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={onPrevious}
          disabled={isLoading}
          className="text-charcoal/60 hover:text-charcoal disabled:opacity-50"
        >
          ← Previous
        </button>
        <button
          onClick={handleSubmit}
          disabled={config.models.length === 0 || isLoading}
          className={`px-6 py-3 rounded-lg font-medium flex items-center gap-2 ${
            config.models.length === 0 || isLoading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-chestnut text-white hover:bg-chestnut/90'
          }`}
        >
          {isLoading ? (
            <>Training Models...</>
          ) : (
            <>
              <Play size={20} />
              Start Training
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ModelTrainingStep;