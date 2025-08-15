import React from 'react';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

const ValidationResultsStep = ({ validationResults, onNext, onPrevious, toolType }) => {
  if (!validationResults) {
    return (
      <div className="text-center py-8">
        <p className="text-charcoal/60">No validation data available</p>
        <button
          onClick={onPrevious}
          className="mt-4 text-chestnut hover:text-chestnut/80"
        >
          Go back to upload
        </button>
      </div>
    );
  }

  const { summary, validation, errors = [], warnings = [], recommendations = [] } = validationResults;
  const isValid = validationResults.is_valid !== false;

  return (
    <div className="space-y-6">
      <div className="text-2xl font-serif font-bold text-charcoal">Data Validation Results</div>

      {/* Summary Stats */}
      {summary && (
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-charcoal mb-4">Dataset Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <span className="text-charcoal/60">Rows:</span>
              <span className="ml-2 font-medium">{summary.shape?.[0] || 'N/A'}</span>
            </div>
            <div>
              <span className="text-charcoal/60">Columns:</span>
              <span className="ml-2 font-medium">{summary.shape?.[1] || 'N/A'}</span>
            </div>
            <div>
              <span className="text-charcoal/60">Memory:</span>
              <span className="ml-2 font-medium">
                {summary.memory_usage_mb ? `${summary.memory_usage_mb.toFixed(2)} MB` : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-charcoal/60">Missing:</span>
              <span className="ml-2 font-medium">
                {summary.missing_percentage !== undefined ? `${summary.missing_percentage.toFixed(1)}%` : 'N/A'}
              </span>
            </div>
          </div>

          {/* Column Types */}
          {summary.column_types && (
            <div className="mt-4 pt-4 border-t">
              <h4 className="font-medium text-charcoal mb-2">Column Types</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                {summary.numerical_columns?.length > 0 && (
                  <div>
                    <span className="text-charcoal/60">Numerical:</span>
                    <span className="ml-2 font-medium">{summary.numerical_columns.length}</span>
                  </div>
                )}
                {summary.categorical_columns?.length > 0 && (
                  <div>
                    <span className="text-charcoal/60">Categorical:</span>
                    <span className="ml-2 font-medium">{summary.categorical_columns.length}</span>
                  </div>
                )}
                {summary.text_columns?.length > 0 && (
                  <div>
                    <span className="text-charcoal/60">Text:</span>
                    <span className="ml-2 font-medium">{summary.text_columns.length}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Validation Status */}
      <div className={`border rounded-lg p-4 ${
        isValid ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
      }`}>
        <div className="flex items-center">
          {isValid ? (
            <>
              <CheckCircle className="text-green-600 mr-2" size={20} />
              <span className="font-medium text-green-800">Data validation successful</span>
            </>
          ) : (
            <>
              <AlertCircle className="text-red-600 mr-2" size={20} />
              <span className="font-medium text-red-800">Data validation failed</span>
            </>
          )}
        </div>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h4 className="font-medium text-red-800 mb-2">Errors</h4>
          <ul className="list-disc list-inside text-red-700 text-sm space-y-1">
            {errors.map((error, i) => (
              <li key={i}>{error}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-800 mb-2">Warnings</h4>
          <ul className="list-disc list-inside text-yellow-700 text-sm space-y-1">
            {warnings.map((warning, i) => (
              <li key={i}>{warning}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <Info className="text-blue-600 mr-2 mt-0.5" size={20} />
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Recommendations</h4>
              <ul className="list-disc list-inside text-blue-700 text-sm space-y-1">
                {recommendations.map((rec, i) => (
                  <li key={i}>{rec}</li>
                ))}
              </ul>
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
          onClick={onNext}
          disabled={!isValid}
          className={`px-6 py-2 rounded-lg font-medium ${
            isValid
              ? 'bg-chestnut text-white hover:bg-chestnut/90'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
};

export default ValidationResultsStep;