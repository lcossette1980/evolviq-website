import React, { useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle } from 'lucide-react';

const DataUploadStep = ({ 
  onUpload, 
  isLoading = false, 
  error = null, 
  acceptedFormats = ".csv,.xlsx,.xls,.json",
  title = "Upload Your Dataset",
  description = "Upload your data file to begin the analysis",
  requiresTargetColumn = false,
  targetColumnLabel = "Target Column",
  targetColumnPlaceholder = "e.g., 'target'",
  uploadedFile = null,
  validationResults = null,
  showValidationResults = false,
  onNext = null
}) => {
  const [dragOver, setDragOver] = useState(false);
  const [targetColumn, setTargetColumn] = useState('');

  const handleFileSelect = (file) => {
    if (file && onUpload) {
      if (requiresTargetColumn) {
        if (!targetColumn) {
          // Don't upload if target column is required but not provided
          return;
        }
        onUpload(file, targetColumn);
      } else {
        onUpload(file);
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  // Show validation results if they exist
  if (showValidationResults && validationResults && uploadedFile) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8">
        <div className="text-center mb-6">
          <CheckCircle size={48} className="mx-auto text-green-600 mb-4" />
          <h2 className="text-2xl font-bold text-charcoal mb-2">{title}</h2>
          <p className="text-charcoal/70">{description}</p>
        </div>

        {/* Upload Success */}
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-3">
            <CheckCircle size={20} className="text-green-600" />
            <div>
              <div className="font-medium text-green-800">File Uploaded Successfully</div>
              <div className="text-sm text-green-700">{uploadedFile.name}</div>
            </div>
          </div>
        </div>

        {/* Validation Results */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-charcoal">Dataset Overview</h3>
          
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-bone rounded-lg">
              <div className="text-xl font-bold text-chestnut">
                {validationResults.summary?.shape?.[0]?.toLocaleString() || 'N/A'}
              </div>
              <div className="text-sm text-charcoal/70">Rows</div>
            </div>
            <div className="text-center p-4 bg-bone rounded-lg">
              <div className="text-xl font-bold text-chestnut">
                {validationResults.summary?.shape?.[1] || 'N/A'}
              </div>
              <div className="text-sm text-charcoal/70">Columns</div>
            </div>
            <div className="text-center p-4 bg-bone rounded-lg">
              <div className="text-xl font-bold text-chestnut">
                {validationResults.summary?.memory_usage || 'N/A'}
              </div>
              <div className="text-sm text-charcoal/70">Size</div>
            </div>
            <div className="text-center p-4 bg-bone rounded-lg">
              <div className="text-xl font-bold text-chestnut">
                {Object.keys(validationResults.summary?.missing_values || {}).length}
              </div>
              <div className="text-sm text-charcoal/70">Missing Cols</div>
            </div>
          </div>

          {validationResults.summary?.columns && (
            <div>
              <h4 className="font-medium text-charcoal mb-2">Columns Preview</h4>
              <div className="flex flex-wrap gap-2">
                {validationResults.summary.columns.slice(0, 10).map((col, idx) => (
                  <span key={idx} className="px-3 py-1 bg-khaki/20 border border-khaki rounded-full text-sm">
                    {col}
                  </span>
                ))}
                {validationResults.summary.columns.length > 10 && (
                  <span className="px-3 py-1 bg-gray-100 rounded-full text-sm text-charcoal/60">
                    +{validationResults.summary.columns.length - 10} more
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {onNext && (
          <div className="mt-8 text-center">
            <button
              onClick={onNext}
              className="px-6 py-3 bg-chestnut text-white rounded-lg hover:bg-chestnut/90 transition-colors"
            >
              Continue to Next Step
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-8">
      <div className="text-center mb-6">
        <FileText size={48} className="mx-auto text-chestnut mb-4" />
        <h2 className="text-2xl font-bold text-charcoal mb-2">{title}</h2>
        <p className="text-charcoal/70">{description}</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle size={20} className="text-red-600 mt-0.5" />
          <div>
            <div className="font-medium text-red-800">Upload Error</div>
            <div className="text-sm text-red-700">{error}</div>
          </div>
        </div>
      )}

      {/* Target Column Input */}
      {requiresTargetColumn && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-charcoal mb-2">
            {targetColumnLabel}
          </label>
          <input
            type="text"
            value={targetColumn}
            onChange={(e) => setTargetColumn(e.target.value)}
            placeholder={targetColumnPlaceholder}
            className="w-full px-3 py-2 border border-khaki/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-chestnut"
            disabled={isLoading}
          />
          <p className="text-xs text-charcoal/50 mt-1">
            Specify the column name that contains the target variable
          </p>
        </div>
      )}

      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
          dragOver 
            ? 'border-chestnut bg-chestnut/5' 
            : 'border-khaki/50 hover:border-khaki'
        } ${isLoading || (requiresTargetColumn && !targetColumn) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <input
          type="file"
          id="file-upload"
          accept={acceptedFormats}
          onChange={(e) => handleFileSelect(e.target.files[0])}
          className="hidden"
          disabled={isLoading || (requiresTargetColumn && !targetColumn)}
        />
        
        <label
          htmlFor="file-upload"
          className={`cursor-pointer inline-flex flex-col items-center justify-center w-full ${
            isLoading || (requiresTargetColumn && !targetColumn) ? 'cursor-not-allowed' : ''
          }`}
        >
          <Upload size={32} className="mx-auto mb-3 text-khaki" />
          
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-chestnut"></div>
              <span className="text-charcoal/70">Processing...</span>
            </div>
          ) : requiresTargetColumn && !targetColumn ? (
            <>
              <p className="text-lg font-medium text-charcoal/50 mb-2">
                Enter target column name above to enable upload
              </p>
              <p className="text-sm text-charcoal/50">
                Target column is required for this analysis
              </p>
            </>
          ) : (
            <>
              <p className="text-lg font-medium text-charcoal mb-2">
                Drop your file here or click to browse
              </p>
              <p className="text-sm text-charcoal/70">
                Supported formats: CSV, Excel, JSON
              </p>
              <p className="text-xs text-charcoal/50 mt-2">
                Maximum file size: 100MB
              </p>
            </>
          )}
        </label>
      </div>

      <div className="mt-6 text-center text-sm text-charcoal/60">
        <p>Your data is processed securely and never stored permanently</p>
      </div>
    </div>
  );
};

export default DataUploadStep;