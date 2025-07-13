import React, { useState } from 'react';

const DataPreprocessing = ({ validationResults, onPreprocess, isLoading }) => {
  const [config, setConfig] = useState({
    handle_missing: 'auto',
    encode_categorical: 'onehot',
    scale_features: true
  });

  const handleSubmit = () => {
    if (onPreprocess) {
      onPreprocess(config);
    }
  };

  const missingValueOptions = [
    { value: 'auto', label: 'Auto (Recommended)', description: 'Automatically choose the best strategy' },
    { value: 'drop', label: 'Drop Missing Values', description: 'Remove rows with any missing values' },
    { value: 'impute', label: 'Impute Missing Values', description: 'Fill missing values with median/mode' }
  ];

  const encodingOptions = [
    { value: 'onehot', label: 'One-Hot Encoding', description: 'Create binary columns for each category' },
    { value: 'label', label: 'Label Encoding', description: 'Convert categories to numeric labels' }
  ];

  if (!validationResults) {
    return <div>Loading...</div>;
  }

  const hasCategorical = validationResults.summary?.categorical_columns?.length > 0;
  const hasMissing = Object.values(validationResults.summary?.missing_values || {}).some(val => val > 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif font-bold text-charcoal mb-2">
          Data Preprocessing
        </h2>
        <p className="text-charcoal/70">
          Configure how to prepare your data for machine learning. These settings will be applied 
          before training your regression models.
        </p>
      </div>

      {/* Current Data Overview */}
      <div className="bg-pearl/20 rounded-lg p-4">
        <h3 className="text-lg font-medium text-charcoal mb-3">Current Dataset</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-xl font-bold text-chestnut">{validationResults.summary.shape[0]}</div>
            <div className="text-sm text-charcoal/60">Rows</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-chestnut">{validationResults.summary.shape[1]}</div>
            <div className="text-sm text-charcoal/60">Columns</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-chestnut">{validationResults.summary.numerical_columns?.length || 0}</div>
            <div className="text-sm text-charcoal/60">Numeric</div>
          </div>
          <div className="text-center">
            <div className="text-xl font-bold text-chestnut">{validationResults.summary.categorical_columns?.length || 0}</div>
            <div className="text-sm text-charcoal/60">Categorical</div>
          </div>
        </div>
      </div>

      {/* Missing Values Handling */}
      {hasMissing && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-charcoal mb-4">
            Missing Values Handling
          </h3>
          <p className="text-sm text-charcoal/60 mb-4">
            Your dataset contains missing values. Choose how to handle them:
          </p>
          
          <div className="space-y-3">
            {missingValueOptions.map((option) => (
              <label key={option.value} className="flex items-start p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="missing"
                  value={option.value}
                  checked={config.handle_missing === option.value}
                  onChange={(e) => setConfig(prev => ({ ...prev, handle_missing: e.target.value }))}
                  className="mt-1 mr-3 text-chestnut focus:ring-chestnut"
                />
                <div>
                  <div className="font-medium text-charcoal">{option.label}</div>
                  <div className="text-sm text-charcoal/60">{option.description}</div>
                </div>
              </label>
            ))}
          </div>

          {/* Missing Values Summary */}
          <div className="mt-4 p-3 bg-yellow-50 rounded-lg">
            <h4 className="text-sm font-medium text-yellow-800 mb-2">Missing Values Summary:</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(validationResults.summary.missing_values || {})
                .filter(([_, count]) => count > 0)
                .map(([column, count]) => (
                  <div key={column} className="flex justify-between">
                    <span className="text-yellow-700">{column}</span>
                    <span className="text-yellow-600">{count} missing</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Categorical Encoding */}
      {hasCategorical && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-charcoal mb-4">
            Categorical Variable Encoding
          </h3>
          <p className="text-sm text-charcoal/60 mb-4">
            Your dataset contains categorical variables. Choose how to encode them for machine learning:
          </p>
          
          <div className="space-y-3">
            {encodingOptions.map((option) => (
              <label key={option.value} className="flex items-start p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="radio"
                  name="encoding"
                  value={option.value}
                  checked={config.encode_categorical === option.value}
                  onChange={(e) => setConfig(prev => ({ ...prev, encode_categorical: e.target.value }))}
                  className="mt-1 mr-3 text-chestnut focus:ring-chestnut"
                />
                <div>
                  <div className="font-medium text-charcoal">{option.label}</div>
                  <div className="text-sm text-charcoal/60">{option.description}</div>
                </div>
              </label>
            ))}
          </div>

          {/* Categorical Columns Summary */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Categorical Columns:</h4>
            <div className="flex flex-wrap gap-2">
              {validationResults.summary.categorical_columns?.map((column) => (
                <span key={column} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                  {column}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Feature Scaling */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-charcoal mb-4">
          Feature Scaling
        </h3>
        <p className="text-sm text-charcoal/60 mb-4">
          Scale features to have similar ranges, which can improve model performance, 
          especially for algorithms like SVM and Neural Networks.
        </p>
        
        <label className="flex items-center">
          <input
            type="checkbox"
            checked={config.scale_features}
            onChange={(e) => setConfig(prev => ({ ...prev, scale_features: e.target.checked }))}
            className="mr-3 text-chestnut focus:ring-chestnut"
          />
          <div>
            <div className="font-medium text-charcoal">Scale Features (Recommended)</div>
            <div className="text-sm text-charcoal/60">
              Standardize features to have mean=0 and std=1
            </div>
          </div>
        </label>
      </div>

      {/* Processing Summary */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="text-md font-medium text-green-800 mb-2">Processing Summary</h3>
        <ul className="text-sm text-green-700 space-y-1">
          <li>• Target variable: <strong>{validationResults.selectedTarget}</strong></li>
          <li>• Missing values: <strong>{config.handle_missing}</strong></li>
          {hasCategorical && (
            <li>• Categorical encoding: <strong>{config.encode_categorical}</strong></li>
          )}
          <li>• Feature scaling: <strong>{config.scale_features ? 'Yes' : 'No'}</strong></li>
        </ul>
      </div>

      {/* Estimated Impact */}
      <div className="bg-pearl/20 rounded-lg p-4">
        <h3 className="text-md font-medium text-charcoal mb-2">Estimated Impact</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="font-medium text-charcoal">Rows after processing:</div>
            <div className="text-charcoal/60">
              {config.handle_missing === 'drop' 
                ? `~${Math.max(0, validationResults.summary.shape[0] - Object.values(validationResults.summary.missing_values || {}).reduce((a, b) => Math.max(a, b), 0))}`
                : validationResults.summary.shape[0]
              }
            </div>
          </div>
          <div>
            <div className="font-medium text-charcoal">Feature columns:</div>
            <div className="text-charcoal/60">
              {config.encode_categorical === 'onehot' && hasCategorical
                ? `${validationResults.summary.shape[1] - 1}+ (expanded)`
                : validationResults.summary.shape[1] - 1
              }
            </div>
          </div>
          <div>
            <div className="font-medium text-charcoal">Data types:</div>
            <div className="text-charcoal/60">All numeric</div>
          </div>
        </div>
      </div>

      {/* Process Button */}
      <div className="flex justify-center">
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className={`px-8 py-3 rounded-lg font-medium transition-colors ${
            isLoading
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
              Processing...
            </div>
          ) : (
            'Process Data'
          )}
        </button>
      </div>
    </div>
  );
};

export default DataPreprocessing;