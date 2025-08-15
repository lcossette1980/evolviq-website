import React, { useState } from 'react';
import { Settings, BarChart, AlertCircle } from 'lucide-react';

const EDAConfigurationStep = ({ validationResults, onConfigure, onPrevious, isLoading }) => {
  const [config, setConfig] = useState({
    analysis_types: ['quality', 'univariate', 'bivariate'],
    handle_missing: 'report',
    correlation_threshold: 0.7,
    outlier_method: 'iqr'
  });

  const handleSubmit = () => {
    onConfigure(config);
  };

  const toggleAnalysisType = (type) => {
    setConfig(prev => ({
      ...prev,
      analysis_types: prev.analysis_types.includes(type)
        ? prev.analysis_types.filter(t => t !== type)
        : [...prev.analysis_types, type]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border rounded-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Settings className="text-chestnut" size={24} />
          <h3 className="text-lg font-semibold text-charcoal">Analysis Configuration</h3>
        </div>

        {/* Analysis Types */}
        <div className="mb-6">
          <h4 className="font-medium text-charcoal mb-3">Analysis Types</h4>
          <div className="space-y-2">
            <label className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={config.analysis_types.includes('quality')}
                onChange={() => toggleAnalysisType('quality')}
                className="mr-3 text-chestnut focus:ring-chestnut"
              />
              <div>
                <div className="font-medium">Data Quality Analysis</div>
                <div className="text-sm text-charcoal/60">Missing values, duplicates, data types</div>
              </div>
            </label>

            <label className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={config.analysis_types.includes('univariate')}
                onChange={() => toggleAnalysisType('univariate')}
                className="mr-3 text-chestnut focus:ring-chestnut"
              />
              <div>
                <div className="font-medium">Univariate Analysis</div>
                <div className="text-sm text-charcoal/60">Distribution, statistics for each variable</div>
              </div>
            </label>

            <label className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={config.analysis_types.includes('bivariate')}
                onChange={() => toggleAnalysisType('bivariate')}
                className="mr-3 text-chestnut focus:ring-chestnut"
              />
              <div>
                <div className="font-medium">Bivariate Analysis</div>
                <div className="text-sm text-charcoal/60">Correlations and relationships between variables</div>
              </div>
            </label>

            <label className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={config.analysis_types.includes('multivariate')}
                onChange={() => toggleAnalysisType('multivariate')}
                className="mr-3 text-chestnut focus:ring-chestnut"
              />
              <div>
                <div className="font-medium">Multivariate Analysis</div>
                <div className="text-sm text-charcoal/60">PCA, feature interactions</div>
              </div>
            </label>
          </div>
        </div>

        {/* Missing Data Handling */}
        <div className="mb-6">
          <h4 className="font-medium text-charcoal mb-3">Missing Data Handling</h4>
          <select
            value={config.handle_missing}
            onChange={(e) => setConfig(prev => ({ ...prev, handle_missing: e.target.value }))}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-chestnut/20 focus:border-chestnut"
          >
            <option value="report">Report Only</option>
            <option value="drop">Drop Missing Values</option>
            <option value="impute_mean">Impute with Mean</option>
            <option value="impute_median">Impute with Median</option>
            <option value="impute_mode">Impute with Mode</option>
          </select>
        </div>

        {/* Correlation Threshold */}
        <div className="mb-6">
          <h4 className="font-medium text-charcoal mb-3">
            Correlation Threshold: {config.correlation_threshold}
          </h4>
          <input
            type="range"
            min="0.5"
            max="1"
            step="0.1"
            value={config.correlation_threshold}
            onChange={(e) => setConfig(prev => ({ 
              ...prev, 
              correlation_threshold: parseFloat(e.target.value) 
            }))}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-charcoal/60 mt-1">
            <span>0.5 (Moderate)</span>
            <span>1.0 (Perfect)</span>
          </div>
        </div>

        {/* Outlier Detection Method */}
        <div className="mb-6">
          <h4 className="font-medium text-charcoal mb-3">Outlier Detection Method</h4>
          <select
            value={config.outlier_method}
            onChange={(e) => setConfig(prev => ({ ...prev, outlier_method: e.target.value }))}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-chestnut/20 focus:border-chestnut"
          >
            <option value="iqr">IQR (Interquartile Range)</option>
            <option value="zscore">Z-Score</option>
            <option value="isolation">Isolation Forest</option>
            <option value="none">None</option>
          </select>
        </div>
      </div>

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
          disabled={config.analysis_types.length === 0 || isLoading}
          className={`px-6 py-2 rounded-lg font-medium ${
            config.analysis_types.length === 0 || isLoading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-chestnut text-white hover:bg-chestnut/90'
          }`}
        >
          {isLoading ? 'Configuring...' : 'Continue to Analysis'}
        </button>
      </div>
    </div>
  );
};

export default EDAConfigurationStep;