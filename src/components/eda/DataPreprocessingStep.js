import React, { useState } from 'react';
import { Settings, Trash2, Filter } from 'lucide-react';
import StepContainer from '../shared/StepContainer';

const DataPreprocessingStep = ({ validationResults, onPreprocess, isLoading }) => {
  const [config, setConfig] = useState({
    handleMissing: 'drop_rows',
    removeDuplicates: true,
    removeOutliers: false,
    columnsToRemove: []
  });

  const columns = validationResults?.summary?.columns || [];
  const missingValues = validationResults?.summary?.missing_values || {};

  const handleConfigChange = (key, value) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const toggleColumnRemoval = (column) => {
    setConfig(prev => ({
      ...prev,
      columnsToRemove: prev.columnsToRemove.includes(column)
        ? prev.columnsToRemove.filter(col => col !== column)
        : [...prev.columnsToRemove, column]
    }));
  };

  const handleSubmit = () => {
    onPreprocess(config);
  };

  return (
    <StepContainer
      title="Configure Data Preprocessing"
      description="Set up data cleaning and preprocessing options"
      currentStep={3}
      totalSteps={6}
      onNext={handleSubmit}
      canGoNext={true}
      nextLabel="Apply Preprocessing"
      isLoading={isLoading}
    >
      <div className="space-y-6">
        {/* Missing Values Handling */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="font-semibold text-charcoal mb-4 flex items-center gap-2">
            <Filter size={20} />
            Missing Values Strategy
          </h3>
          
          <div className="space-y-3">
            <label className="flex items-center gap-3">
              <input
                type="radio"
                name="handleMissing"
                value="drop_rows"
                checked={config.handleMissing === 'drop_rows'}
                onChange={(e) => handleConfigChange('handleMissing', e.target.value)}
                className="text-chestnut"
              />
              <div>
                <div className="font-medium">Drop rows with missing values</div>
                <div className="text-sm text-charcoal/60">Remove any rows that contain missing data</div>
              </div>
            </label>
            
            <label className="flex items-center gap-3">
              <input
                type="radio"
                name="handleMissing"
                value="fill_median"
                checked={config.handleMissing === 'fill_median'}
                onChange={(e) => handleConfigChange('handleMissing', e.target.value)}
                className="text-chestnut"
              />
              <div>
                <div className="font-medium">Fill with median/mode</div>
                <div className="text-sm text-charcoal/60">Fill numeric columns with median, categorical with mode</div>
              </div>
            </label>
            
            <label className="flex items-center gap-3">
              <input
                type="radio"
                name="handleMissing"
                value="interpolate"
                checked={config.handleMissing === 'interpolate'}
                onChange={(e) => handleConfigChange('handleMissing', e.target.value)}
                className="text-chestnut"
              />
              <div>
                <div className="font-medium">Interpolate values</div>
                <div className="text-sm text-charcoal/60">Use interpolation for numeric columns</div>
              </div>
            </label>
          </div>
        </div>

        {/* Additional Options */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="font-semibold text-charcoal mb-4 flex items-center gap-2">
            <Settings size={20} />
            Additional Options
          </h3>
          
          <div className="space-y-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={config.removeDuplicates}
                onChange={(e) => handleConfigChange('removeDuplicates', e.target.checked)}
                className="text-chestnut"
              />
              <div>
                <div className="font-medium">Remove duplicate rows</div>
                <div className="text-sm text-charcoal/60">Remove exact duplicate rows from the dataset</div>
              </div>
            </label>
            
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={config.removeOutliers}
                onChange={(e) => handleConfigChange('removeOutliers', e.target.checked)}
                className="text-chestnut"
              />
              <div>
                <div className="font-medium">Remove outliers</div>
                <div className="text-sm text-charcoal/60">Remove statistical outliers using IQR method</div>
              </div>
            </label>
          </div>
        </div>

        {/* Column Management */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="font-semibold text-charcoal mb-4 flex items-center gap-2">
            <Trash2 size={20} />
            Column Management
          </h3>
          
          <p className="text-sm text-charcoal/60 mb-4">
            Select columns to remove (e.g., ID columns, irrelevant features)
          </p>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-2">
            {columns.map((column) => {
              const isSelected = config.columnsToRemove.includes(column);
              const hasMissing = missingValues[column] > 0;
              
              return (
                <label
                  key={column}
                  className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected 
                      ? 'bg-red-50 border-red-200' 
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleColumnRemoval(column)}
                    className="text-red-600"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-sm">{column}</div>
                    {hasMissing && (
                      <div className="text-xs text-red-600">
                        {missingValues[column]} missing
                      </div>
                    )}
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Configuration Summary */}
        <div className="bg-bone border rounded-lg p-4">
          <h4 className="font-medium text-charcoal mb-2">Configuration Summary</h4>
          <ul className="text-sm text-charcoal/70 space-y-1">
            <li>• Missing values: {config.handleMissing.replace('_', ' ')}</li>
            <li>• Remove duplicates: {config.removeDuplicates ? 'Yes' : 'No'}</li>
            <li>• Remove outliers: {config.removeOutliers ? 'Yes' : 'No'}</li>
            <li>• Columns to remove: {config.columnsToRemove.length || 'None'}</li>
          </ul>
        </div>
      </div>
    </StepContainer>
  );
};

export default DataPreprocessingStep;