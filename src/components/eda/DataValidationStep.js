import React from 'react';
import { CheckCircle, AlertCircle, Info, Database } from 'lucide-react';
import StepContainer from '../shared/StepContainer';

const DataValidationStep = ({ validationResults, onValidate, fileName }) => {
  if (!validationResults) {
    return (
      <StepContainer
        title="Data Validation"
        description="Validating your uploaded data..."
        currentStep={2}
        totalSteps={6}
        canGoNext={false}
        canGoPrevious={true}
      >
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-chestnut mx-auto"></div>
          <p className="text-charcoal/60 mt-4">Processing your data...</p>
        </div>
      </StepContainer>
    );
  }

  const { validation, summary } = validationResults;
  const isValid = validation?.is_valid;

  return (
    <StepContainer
      title="Data Validation Results"
      description={`Validation results for ${fileName}`}
      currentStep={2}
      totalSteps={6}
      onNext={onValidate}
      canGoNext={isValid}
      nextLabel={isValid ? "Continue to Configuration" : "Fix Issues First"}
    >
      <div className="space-y-6">
        {/* Overall Status */}
        <div className={`p-4 rounded-lg border ${
          isValid 
            ? 'bg-green-50 border-green-200' 
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center gap-3">
            {isValid ? (
              <CheckCircle className="text-green-600" size={24} />
            ) : (
              <AlertCircle className="text-red-600" size={24} />
            )}
            <div>
              <h3 className={`font-semibold ${
                isValid ? 'text-green-800' : 'text-red-800'
              }`}>
                {isValid ? 'Data Validation Successful' : 'Data Validation Issues Found'}
              </h3>
              <p className={`text-sm ${
                isValid ? 'text-green-700' : 'text-red-700'
              }`}>
                {isValid 
                  ? 'Your dataset is ready for analysis'
                  : 'Please review and address the issues below'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Dataset Summary */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="font-semibold text-charcoal mb-4 flex items-center gap-2">
            <Database size={20} />
            Dataset Overview
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-bone rounded-lg">
              <div className="text-2xl font-bold text-chestnut">
                {summary?.shape?.[0]?.toLocaleString() || 'N/A'}
              </div>
              <div className="text-sm text-charcoal/70">Rows</div>
            </div>
            
            <div className="text-center p-4 bg-bone rounded-lg">
              <div className="text-2xl font-bold text-chestnut">
                {summary?.shape?.[1] || 'N/A'}
              </div>
              <div className="text-sm text-charcoal/70">Columns</div>
            </div>
            
            <div className="text-center p-4 bg-bone rounded-lg">
            <div className="text-2xl font-bold text-chestnut">
                {summary?.memory_usage_mb ?? summary?.memory_usage ?? 'N/A'}
              </div>
              <div className="text-sm text-charcoal/70">Memory Usage</div>
            </div>
            
            <div className="text-center p-4 bg-bone rounded-lg">
              <div className="text-2xl font-bold text-chestnut">
                {Object.values(summary?.missing_values || {}).reduce((a, b) => a + b, 0)}
              </div>
              <div className="text-sm text-charcoal/70">Missing Values</div>
            </div>
          </div>
        </div>

        {/* Column Information */}
        {summary?.columns && (
          <div className="bg-white border rounded-lg p-6">
            <h3 className="font-semibold text-charcoal mb-4">Column Information</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Column</th>
                    <th className="text-left py-2">Type</th>
                    <th className="text-left py-2">Missing</th>
                    <th className="text-left py-2">Unique Values</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.columns.map((col, idx) => (
                    <tr key={idx} className="border-b border-gray-100">
                      <td className="py-2 font-medium">{col}</td>
                      <td className="py-2 text-charcoal/70">
                        {summary.dtypes?.[col] || 'Unknown'}
                      </td>
                      <td className="py-2">
                        {summary.missing_values?.[col] || 0}
                      </td>
                      <td className="py-2 text-charcoal/70">
                        -
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Validation Messages */}
        {validation?.errors?.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="font-semibold text-red-800 mb-2">Errors</h3>
            <ul className="space-y-1">
              {validation.errors.map((error, idx) => (
                <li key={idx} className="text-red-700 text-sm">• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {validation?.warnings?.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h3 className="font-semibold text-yellow-800 mb-2">Warnings</h3>
            <ul className="space-y-1">
              {validation.warnings.map((warning, idx) => (
                <li key={idx} className="text-yellow-700 text-sm">• {warning}</li>
              ))}
            </ul>
          </div>
        )}

        {validation?.recommendations?.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
              <Info size={16} />
              Recommendations
            </h3>
            <ul className="space-y-1">
              {validation.recommendations.map((rec, idx) => (
                <li key={idx} className="text-blue-700 text-sm">• {rec}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </StepContainer>
  );
};

export default DataValidationStep;
