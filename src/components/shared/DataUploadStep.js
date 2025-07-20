import React, { useState } from 'react';
import { Upload, FileText, AlertCircle } from 'lucide-react';

const DataUploadStep = ({ 
  onUpload, 
  isLoading = false, 
  error = null, 
  acceptedFormats = ".csv,.xlsx,.xls,.json",
  title = "Upload Your Dataset",
  description = "Upload your data file to begin the analysis"
}) => {
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (file) => {
    if (file && onUpload) {
      onUpload(file);
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

      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${
          dragOver 
            ? 'border-chestnut bg-chestnut/5' 
            : 'border-khaki/50 hover:border-khaki'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
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
          disabled={isLoading}
        />
        
        <label
          htmlFor="file-upload"
          className={`cursor-pointer inline-flex flex-col items-center justify-center w-full ${
            isLoading ? 'cursor-not-allowed' : ''
          }`}
        >
          <Upload size={32} className="mx-auto mb-3 text-khaki" />
          
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-chestnut"></div>
              <span className="text-charcoal/70">Processing...</span>
            </div>
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