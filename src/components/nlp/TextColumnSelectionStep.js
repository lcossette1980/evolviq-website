import React, { useState } from 'react';
import { FileText } from 'lucide-react';

const TextColumnSelectionStep = ({ validationResults, onSelectColumn, isLoading }) => {
  const textColumns = validationResults?.summary?.text_columns || 
                       validationResults?.summary?.categorical_columns || 
                       [];
  const selectedDefault = validationResults?.summary?.selected_text_column || textColumns[0] || '';
  const [selectedColumn, setSelectedColumn] = useState(selectedDefault);

  const handleContinue = () => {
    if (selectedColumn) {
      onSelectColumn(selectedColumn);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <FileText className="text-chestnut" size={24} />
          <h3 className="text-lg font-semibold text-charcoal">Select Text Column</h3>
        </div>
        
        {textColumns.length > 0 ? (
          <>
            <p className="text-charcoal/70 mb-4">
              Choose the column that contains the text data you want to analyze:
            </p>
            
            <div className="space-y-3">
              {textColumns.map((column) => (
                <label 
                  key={column} 
                  className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <input
                    type="radio"
                    name="textColumn"
                    value={column}
                    checked={selectedColumn === column}
                    onChange={(e) => setSelectedColumn(e.target.value)}
                    className="mr-3 text-chestnut focus:ring-chestnut"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-charcoal">{column}</div>
                    {validationResults?.summary?.selected_text_column === column && (
                      <div className="text-sm text-green-600">Auto-detected</div>
                    )}
                  </div>
                </label>
              ))}
            </div>
          </>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">
              No text columns detected in your dataset. Please ensure your file contains at least one column with text data.
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-center">
        <button
          onClick={handleContinue}
          disabled={!selectedColumn || isLoading}
          className={`px-8 py-3 rounded-lg font-medium transition-colors ${
            !selectedColumn || isLoading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-chestnut text-white hover:bg-chestnut/90'
          }`}
        >
          {isLoading ? 'Processing...' : 'Continue with Analysis'}
        </button>
      </div>
    </div>
  );
};

export default TextColumnSelectionStep;