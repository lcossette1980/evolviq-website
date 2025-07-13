import React, { useState } from 'react';

const DataValidation = ({ validationResults, onValidate, isLoading }) => {
  const [selectedTarget, setSelectedTarget] = useState(
    validationResults?.suggested_target || ''
  );

  if (!validationResults) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin w-8 h-8 border-4 border-chestnut border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-charcoal/60">Loading validation results...</p>
      </div>
    );
  }

  const { summary, errors = [], warnings = [], recommendations = [] } = validationResults;

  const handleContinue = () => {
    if (selectedTarget && onValidate) {
      onValidate(selectedTarget);
    }
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat().format(num);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif font-bold text-charcoal mb-2">
          Data Validation Results
        </h2>
        <p className="text-charcoal/70">
          Review your dataset and select the target variable for regression analysis.
        </p>
      </div>

      {/* Validation Status */}
      <div className={`rounded-lg p-4 ${
        validationResults.is_valid 
          ? 'bg-green-50 border border-green-200' 
          : 'bg-red-50 border border-red-200'
      }`}>
        <div className="flex items-center">
          {validationResults.is_valid ? (
            <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          )}
          <span className={`font-medium ${
            validationResults.is_valid ? 'text-green-800' : 'text-red-800'
          }`}>
            {validationResults.is_valid ? 'Data validation passed' : 'Data validation failed'}
          </span>
        </div>
      </div>

      {/* Dataset Summary */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-charcoal mb-4">Dataset Summary</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-3 bg-pearl/20 rounded-lg">
            <div className="text-2xl font-bold text-chestnut">{formatNumber(summary.shape[0])}</div>
            <div className="text-sm text-charcoal/60">Rows</div>
          </div>
          <div className="text-center p-3 bg-pearl/20 rounded-lg">
            <div className="text-2xl font-bold text-chestnut">{summary.shape[1]}</div>
            <div className="text-sm text-charcoal/60">Columns</div>
          </div>
          <div className="text-center p-3 bg-pearl/20 rounded-lg">
            <div className="text-2xl font-bold text-chestnut">{summary.numerical_columns?.length || 0}</div>
            <div className="text-sm text-charcoal/60">Numeric</div>
          </div>
          <div className="text-center p-3 bg-pearl/20 rounded-lg">
            <div className="text-2xl font-bold text-chestnut">{summary.categorical_columns?.length || 0}</div>
            <div className="text-sm text-charcoal/60">Categorical</div>
          </div>
        </div>

        {/* Memory Usage */}
        <div className="text-sm text-charcoal/60 mb-4">
          Memory usage: {(summary.memory_usage_mb || 0).toFixed(2)} MB
        </div>

        {/* Missing Values */}
        {Object.values(summary.missing_values || {}).some(val => val > 0) && (
          <div className="mb-4">
            <h4 className="text-md font-medium text-charcoal mb-2">Missing Values</h4>
            <div className="space-y-1">
              {Object.entries(summary.missing_values || {})
                .filter(([_, count]) => count > 0)
                .map(([column, count]) => (
                  <div key={column} className="flex justify-between text-sm">
                    <span className="text-charcoal/70">{column}</span>
                    <span className="text-red-600">{formatNumber(count)} missing</span>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Duplicate Rows */}
        {summary.duplicate_rows > 0 && (
          <div className="text-sm">
            <span className="text-charcoal/70">Duplicate rows: </span>
            <span className="text-orange-600">{formatNumber(summary.duplicate_rows)}</span>
          </div>
        )}
      </div>

      {/* Target Variable Selection */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-charcoal mb-4">Select Target Variable</h3>
        <p className="text-sm text-charcoal/60 mb-4">
          Choose the column you want to predict (dependent variable). This should be a numeric column.
        </p>
        
        <div className="space-y-2">
          {validationResults.numeric_columns?.map((column) => (
            <label key={column} className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="radio"
                name="target"
                value={column}
                checked={selectedTarget === column}
                onChange={(e) => setSelectedTarget(e.target.value)}
                className="mr-3 text-chestnut focus:ring-chestnut"
              />
              <div className="flex-1">
                <div className="font-medium text-charcoal">{column}</div>
                {summary.numerical_stats?.[column] && (
                  <div className="text-sm text-charcoal/60">
                    Range: {summary.numerical_stats[column].min?.toFixed(2)} - {summary.numerical_stats[column].max?.toFixed(2)} | 
                    Mean: {summary.numerical_stats[column].mean?.toFixed(2)}
                  </div>
                )}
              </div>
              {column === validationResults.suggested_target && (
                <span className="text-xs bg-chestnut text-white px-2 py-1 rounded">Suggested</span>
              )}
            </label>
          ))}
        </div>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="text-md font-medium text-red-800 mb-2">Errors</h4>
          <ul className="text-sm text-red-700 space-y-1">
            {errors.map((error, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-2">•</span>
                <span>{error}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="text-md font-medium text-yellow-800 mb-2">Warnings</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            {warnings.map((warning, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-2">⚠</span>
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-md font-medium text-blue-800 mb-2">Recommendations</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            {recommendations.map((rec, index) => (
              <li key={index} className="flex items-start">
                <span className="mr-2">💡</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Continue Button */}
      {validationResults.is_valid && (
        <div className="flex justify-center">
          <button
            onClick={handleContinue}
            disabled={!selectedTarget || isLoading}
            className={`px-8 py-3 rounded-lg font-medium transition-colors ${
              !selectedTarget || isLoading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-chestnut text-white hover:bg-chestnut/90'
            }`}
          >
            Continue to Preprocessing
          </button>
        </div>
      )}
    </div>
  );
};

export default DataValidation;