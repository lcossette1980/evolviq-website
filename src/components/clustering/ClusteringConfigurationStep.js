import React, { useState } from 'react';
import { Settings, Layers } from 'lucide-react';

const ClusteringConfigurationStep = ({ validationResults, onConfigure, onPrevious, isLoading }) => {
  const numericColumns = validationResults?.summary?.numerical_columns || 
                         validationResults?.numeric_columns || 
                         [];
  
  // Initialize with all numeric columns selected by default
  const [config, setConfig] = useState({
    algorithms: ['kmeans'],
    n_clusters_range: [2, 10],
    scaling_method: 'standard',
    handle_missing: 'drop',
    feature_columns: numericColumns.length > 0 ? numericColumns : [],
    optimization_metric: 'silhouette'
  });

  const handleSubmit = () => {
    onConfigure(config);
  };

  const toggleAlgorithm = (algo) => {
    setConfig(prev => ({
      ...prev,
      algorithms: prev.algorithms.includes(algo)
        ? prev.algorithms.filter(a => a !== algo)
        : [...prev.algorithms, algo]
    }));
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
          <Layers className="text-chestnut" size={24} />
          <h3 className="text-lg font-semibold text-charcoal">Clustering Configuration</h3>
        </div>

        {/* Algorithms */}
        <div className="mb-6">
          <h4 className="font-medium text-charcoal mb-3">Clustering Algorithms</h4>
          <div className="grid md:grid-cols-2 gap-2">
            <label className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={config.algorithms.includes('kmeans')}
                onChange={() => toggleAlgorithm('kmeans')}
                className="mr-3 text-chestnut focus:ring-chestnut"
              />
              <div>
                <div className="font-medium">K-Means</div>
                <div className="text-xs text-charcoal/60">Centroid-based clustering</div>
              </div>
            </label>

            <label className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={config.algorithms.includes('hierarchical')}
                onChange={() => toggleAlgorithm('hierarchical')}
                className="mr-3 text-chestnut focus:ring-chestnut"
              />
              <div>
                <div className="font-medium">Hierarchical</div>
                <div className="text-xs text-charcoal/60">Tree-based clustering</div>
              </div>
            </label>

            <label className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={config.algorithms.includes('dbscan')}
                onChange={() => toggleAlgorithm('dbscan')}
                className="mr-3 text-chestnut focus:ring-chestnut"
              />
              <div>
                <div className="font-medium">DBSCAN</div>
                <div className="text-xs text-charcoal/60">Density-based clustering</div>
              </div>
            </label>

            <label className="flex items-center p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
              <input
                type="checkbox"
                checked={config.algorithms.includes('gaussian_mixture')}
                onChange={() => toggleAlgorithm('gaussian_mixture')}
                className="mr-3 text-chestnut focus:ring-chestnut"
              />
              <div>
                <div className="font-medium">Gaussian Mixture</div>
                <div className="text-xs text-charcoal/60">Probabilistic clustering</div>
              </div>
            </label>
          </div>
        </div>

        {/* Number of Clusters Range */}
        <div className="mb-6">
          <h4 className="font-medium text-charcoal mb-3">Number of Clusters to Test</h4>
          <div className="flex items-center gap-4">
            <div>
              <label className="text-sm text-charcoal/60">Min:</label>
              <input
                type="number"
                min="2"
                max="20"
                value={config.n_clusters_range[0]}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  n_clusters_range: [parseInt(e.target.value), prev.n_clusters_range[1]]
                }))}
                className="ml-2 w-20 px-3 py-1 border rounded focus:ring-2 focus:ring-chestnut/20"
              />
            </div>
            <div>
              <label className="text-sm text-charcoal/60">Max:</label>
              <input
                type="number"
                min="2"
                max="20"
                value={config.n_clusters_range[1]}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  n_clusters_range: [prev.n_clusters_range[0], parseInt(e.target.value)]
                }))}
                className="ml-2 w-20 px-3 py-1 border rounded focus:ring-2 focus:ring-chestnut/20"
              />
            </div>
          </div>
        </div>

        {/* Feature Selection */}
        {numericColumns.length > 0 ? (
          <div className="mb-6">
            <h4 className="font-medium text-charcoal mb-3">Features for Clustering</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {numericColumns.map(col => (
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
          </div>
        ) : (
          <div className="mb-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800">
              No numeric columns detected in your dataset. Clustering requires numeric features.
            </p>
            <p className="text-sm text-yellow-700 mt-2">
              Please ensure your data contains numeric columns or upload a different dataset.
            </p>
          </div>
        )}

        {/* Optimization Metric */}
        <div className="mb-6">
          <h4 className="font-medium text-charcoal mb-3">Optimization Metric</h4>
          <select
            value={config.optimization_metric}
            onChange={(e) => setConfig(prev => ({ ...prev, optimization_metric: e.target.value }))}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-chestnut/20 focus:border-chestnut"
          >
            <option value="silhouette">Silhouette Score</option>
            <option value="calinski_harabasz">Calinski-Harabasz Index</option>
            <option value="davies_bouldin">Davies-Bouldin Index</option>
            <option value="inertia">Inertia (K-Means only)</option>
          </select>
        </div>

        {/* Scaling Method */}
        <div className="mb-6">
          <h4 className="font-medium text-charcoal mb-3">Feature Scaling</h4>
          <select
            value={config.scaling_method}
            onChange={(e) => setConfig(prev => ({ ...prev, scaling_method: e.target.value }))}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-chestnut/20 focus:border-chestnut"
          >
            <option value="standard">Standard Scaling</option>
            <option value="minmax">Min-Max Scaling</option>
            <option value="robust">Robust Scaling</option>
            <option value="none">No Scaling</option>
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
          disabled={config.algorithms.length === 0 || config.feature_columns.length === 0 || isLoading}
          className={`px-6 py-2 rounded-lg font-medium ${
            config.algorithms.length === 0 || config.feature_columns.length === 0 || isLoading
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

export default ClusteringConfigurationStep;