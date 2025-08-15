import React, { useState } from 'react';
import { Settings, AlertCircle } from 'lucide-react';

const DataPreprocessingStep = ({ validationResults, onPreprocess, onPrevious, isLoading }) => {
  const numericColumns = validationResults?.summary?.numerical_columns || 
                         validationResults?.numeric_columns || [];
  const categoricalColumns = validationResults?.summary?.categorical_columns || [];
  const suggestedTarget = validationResults?.suggested_target || 
                         (numericColumns.length > 0 ? numericColumns[numericColumns.length - 1] : '');

  const [config, setConfig] = useState({
    target_column: suggestedTarget,
    feature_columns: numericColumns.filter(col => col !== suggestedTarget),
    handle_missing: 'drop',
    scaling_method: 'standard',
    encoding_method: 'onehot'
  });

  const handleSubmit = () => {
    if (!config.target_column) {
      alert('Please select a target column');
      return;
    }
    onPreprocess(config);
  };

  const toggleFeature = (col) => {
    setConfig(prev => ({
      ...prev,
      feature_columns: prev.feature_columns.includes(col)
        ? prev.feature_columns.filter(c => c !== col)
        : [...prev.feature_columns, col]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Settings className="text-chestnut" size={24} />
          <h3 className="text-lg font-semibold text-charcoal">Data Preprocessing</h3>
        </div>

        {/* Target Selection */}
        <div className="mb-6">
          <h4 className="font-medium text-charcoal mb-3">Select Target Variable</h4>
          <select
            value={config.target_column}
            onChange={(e) => {
              const newTarget = e.target.value;
              setConfig(prev => ({
                ...prev,
                target_column: newTarget,
                feature_columns: numericColumns.filter(col => col !== newTarget)
              }));
            }}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-chestnut/20 focus:border-chestnut"
          >
            <option value="">-- Select Target Column --</option>
            {numericColumns.map(col => (
              <option key={col} value={col}>{col}</option>
            ))}
          </select>
          {config.target_column && (
            <p className="text-sm text-charcoal/60 mt-2">
              This is the variable you want to predict
            </p>
          )}
        </div>

        {/* Feature Selection */}
        {config.target_column && numericColumns.length > 1 && (
          <div className="mb-6">
            <h4 className="font-medium text-charcoal mb-3">Select Features</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {numericColumns
                .filter(col => col !== config.target_column)
                .map(col => (
                  <label key={col} className="flex items-center p-2 border rounded hover:bg-gray-50 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={config.feature_columns.includes(col)}
                      onChange={() => toggleFeature(col)}
                      className="mr-2 text-chestnut focus:ring-chestnut"
                    />
                    <span className="truncate">{col}</span>
                  </label>
                ))}
            </div>
            {categoricalColumns.length > 0 && (
              <p className="text-sm text-charcoal/60 mt-2">
                {categoricalColumns.length} categorical columns will be encoded automatically
              </p>
            )}
          </div>
        )}

        {/* Missing Data Handling */}
        <div className="mb-6">
          <h4 className="font-medium text-charcoal mb-3">Handle Missing Values</h4>
          <select
            value={config.handle_missing}
            onChange={(e) => setConfig(prev => ({ ...prev, handle_missing: e.target.value }))}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-chestnut/20 focus:border-chestnut"
          >
            <option value="drop">Drop rows with missing values</option>
            <option value="mean">Fill with mean</option>
            <option value="median">Fill with median</option>
            <option value="forward_fill">Forward fill</option>
            <option value="backward_fill">Backward fill</option>
          </select>
        </div>

        {/* Feature Scaling */}
        <div className="mb-6">
          <h4 className="font-medium text-charcoal mb-3">Feature Scaling</h4>
          <select
            value={config.scaling_method}
            onChange={(e) => setConfig(prev => ({ ...prev, scaling_method: e.target.value }))}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-chestnut/20 focus:border-chestnut"
          >
            <option value="standard">Standard Scaling (Z-score)</option>
            <option value="minmax">Min-Max Scaling (0-1)</option>
            <option value="robust">Robust Scaling</option>
            <option value="none">No Scaling</option>
          </select>
        </div>

        {/* Categorical Encoding */}
        {categoricalColumns.length > 0 && (
          <div className="mb-6">
            <h4 className="font-medium text-charcoal mb-3">Categorical Encoding</h4>
            <select
              value={config.encoding_method}
              onChange={(e) => setConfig(prev => ({ ...prev, encoding_method: e.target.value }))}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-chestnut/20 focus:border-chestnut"
            >
              <option value="onehot">One-Hot Encoding</option>
              <option value="label">Label Encoding</option>
              <option value="target">Target Encoding</option>
            </select>
          </div>
        )}
      </div>

      {/* Warnings */}
      {config.feature_columns.length === 0 && config.target_column && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <AlertCircle className="text-yellow-600 mr-2 mt-0.5" size={20} />
            <div>
              <p className="text-yellow-800">No features selected</p>
              <p className="text-sm text-yellow-700 mt-1">
                Please select at least one feature for regression analysis
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <button
          onClick={onPrevious}
          className="text-charcoal/60 hover:text-charcoal"
        >
          ← Previous
        </button>
        <button
          onClick={handleSubmit}
          disabled={!config.target_column || config.feature_columns.length === 0 || isLoading}
          className={`px-6 py-2 rounded-lg font-medium ${
            !config.target_column || config.feature_columns.length === 0 || isLoading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-chestnut text-white hover:bg-chestnut/90'
          }`}
        >
          {isLoading ? 'Preprocessing...' : 'Preprocess Data'}
        </button>
      </div>
    </div>
  );
};

export default DataPreprocessingStep;