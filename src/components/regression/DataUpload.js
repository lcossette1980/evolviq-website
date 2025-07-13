import React, { useState, useRef } from 'react';

const DataUpload = ({ onUpload, isLoading, error }) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file) => {
    // Validate file type
    const allowedTypes = ['.csv', '.xlsx', '.xls', '.json'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!allowedTypes.includes(fileExtension)) {
      alert('Please upload a CSV, Excel, or JSON file.');
      return;
    }

    // Validate file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      alert('File size must be less than 50MB.');
      return;
    }

    setSelectedFile(file);
  };

  const handleUpload = () => {
    if (selectedFile && onUpload) {
      onUpload(selectedFile);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif font-bold text-charcoal mb-2">
          Upload Your Dataset
        </h2>
        <p className="text-charcoal/70">
          Upload a CSV, Excel, or JSON file containing your regression data. 
          The dataset should include both features and target variables.
        </p>
      </div>

      {/* File Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-chestnut bg-chestnut/5'
            : selectedFile
            ? 'border-green-400 bg-green-50'
            : 'border-gray-300 hover:border-chestnut hover:bg-chestnut/5'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,.xlsx,.xls,.json"
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isLoading}
        />
        
        {selectedFile ? (
          <div className="space-y-3">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-charcoal">{selectedFile.name}</p>
              <p className="text-xs text-charcoal/60">{formatFileSize(selectedFile.size)}</p>
            </div>
            <button
              onClick={() => setSelectedFile(null)}
              className="text-sm text-chestnut hover:text-chestnut/80"
              disabled={isLoading}
            >
              Remove file
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="w-16 h-16 mx-auto bg-charcoal/10 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-charcoal/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-medium text-charcoal">
                Drop your file here, or <span className="text-chestnut">browse</span>
              </p>
              <p className="text-sm text-charcoal/60">
                CSV, Excel, or JSON files up to 50MB
              </p>
            </div>
          </div>
        )}
      </div>

      {/* File Requirements */}
      <div className="bg-pearl/30 rounded-lg p-4">
        <h3 className="text-sm font-medium text-charcoal mb-2">Data Requirements:</h3>
        <ul className="text-sm text-charcoal/70 space-y-1">
          <li>• At least one numeric column for the target variable</li>
          <li>• At least one feature column</li>
          <li>• Minimum 50 rows recommended for reliable results</li>
          <li>• Missing values will be handled automatically</li>
          <li>• Categorical variables will be encoded appropriately</li>
        </ul>
      </div>

      {/* Upload Button */}
      {selectedFile && (
        <div className="flex justify-center">
          <button
            onClick={handleUpload}
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
                Uploading...
              </div>
            ) : (
              'Upload and Validate'
            )}
          </button>
        </div>
      )}

      {/* Sample Data Link */}
      <div className="text-center">
        <p className="text-sm text-charcoal/60 mb-2">
          Don't have data? Try our sample datasets:
        </p>
        <div className="flex justify-center space-x-4 text-sm">
          <button
            onClick={() => {
              // Create sample housing data
              const sampleData = `price,bedrooms,bathrooms,sqft,age,location
320000,3,2,1800,5,suburban
450000,4,3,2400,2,urban
280000,2,1,1200,15,rural
520000,4,4,3000,1,urban
350000,3,2,2000,8,suburban`;
              
              const blob = new Blob([sampleData], { type: 'text/csv' });
              const file = new File([blob], 'sample_housing_data.csv', { type: 'text/csv' });
              handleFile(file);
            }}
            className="text-chestnut hover:text-chestnut/80"
          >
            Housing Prices
          </button>
          <span className="text-charcoal/40">|</span>
          <button
            onClick={() => {
              // Create sample sales data
              const sampleData = `sales,marketing_spend,employees,region,season
45000,8000,12,north,spring
62000,12000,18,south,summer
38000,6000,10,east,fall
71000,15000,22,west,summer
52000,9500,15,north,winter`;
              
              const blob = new Blob([sampleData], { type: 'text/csv' });
              const file = new File([blob], 'sample_sales_data.csv', { type: 'text/csv' });
              handleFile(file);
            }}
            className="text-chestnut hover:text-chestnut/80"
          >
            Sales Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default DataUpload;