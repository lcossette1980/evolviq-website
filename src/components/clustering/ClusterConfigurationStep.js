import React, { useState } from 'react';
import { Settings, Target, Info } from 'lucide-react';
import StepContainer from '../shared/StepContainer';

const ClusterConfigurationStep = ({ validationResults, onConfigure, isLoading }) => {
  const [config, setConfig] = useState({
    algorithms: ['kmeans', 'hierarchical', 'dbscan'],
    maxClusters: 8,
    minClusters: 2,
    enableDimensionalityReduction: true,
    scalingMethod: 'standard'
  });

  const availableAlgorithms = [
    { 
      id: 'kmeans', 
      name: 'K-Means', 
      category: 'Partitioning', 
      complexity: 'Low',
      description: 'Fast, assumes spherical clusters of equal size'
    },
    { 
      id: 'hierarchical', 
      name: 'Hierarchical Clustering', 
      category: 'Hierarchical', 
      complexity: 'Medium',
      description: 'Creates cluster hierarchy, no need to specify k'
    },
    { 
      id: 'dbscan', 
      name: 'DBSCAN', 
      category: 'Density-based', 
      complexity: 'Medium',
      description: 'Finds arbitrary shapes, handles noise and outliers'
    },
    { 
      id: 'gmm', 
      name: 'Gaussian Mixture', 
      category: 'Model-based', 
      complexity: 'High',
      description: 'Handles overlapping clusters, provides probabilities'
    },
    { 
      id: 'spectral', 
      name: 'Spectral Clustering', 
      category: 'Graph-based', 
      complexity: 'High',
      description: 'Effective for non-convex clusters, uses similarity matrix'
    },
    { 
      id: 'meanshift', 
      name: 'Mean Shift', 
      category: 'Density-based', 
      complexity: 'Medium',
      description: 'Automatically determines cluster count, handles noise'
    }
  ];

  const toggleAlgorithm = (algorithmId) => {
    setConfig(prev => ({
      ...prev,
      algorithms: prev.algorithms.includes(algorithmId)
        ? prev.algorithms.filter(id => id !== algorithmId)
        : [...prev.algorithms, algorithmId]
    }));
  };

  const handleConfigChange = (key, value) => {
    setConfig(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmit = () => {
    onConfigure(config);
  };

  const getComplexityColor = (complexity) => {
    switch (complexity) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <StepContainer
      title="Configure Clustering Analysis"
      description="Select algorithms and optimization parameters"
      currentStep={3}
      totalSteps={6}
      onNext={handleSubmit}
      canGoNext={config.algorithms.length > 0}
      nextLabel="Start Clustering Analysis"
      isLoading={isLoading}
    >
      <div className="space-y-6">
        {/* Configuration Overview */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
            <Info size={16} />
            Clustering Configuration Guide
          </h3>
          <div className="text-blue-700 text-sm space-y-2">
            <p>• <strong>Multiple algorithms</strong> will be compared to find the best clustering approach</p>
            <p>• <strong>Optimal cluster number</strong> will be determined using Elbow method and Silhouette analysis</p>
            <p>• <strong>Feature scaling</strong> is essential for distance-based algorithms like K-Means</p>
            <p>• Results will include cluster quality metrics and visualizations</p>
          </div>
        </div>

        {/* Dataset Summary */}
        {validationResults && (
          <div className="bg-white border rounded-lg p-4">
            <h3 className="font-semibold text-charcoal mb-3">Dataset Summary</h3>
            <div className="grid md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-xl font-bold text-chestnut">
                  {validationResults.summary?.shape?.[0]?.toLocaleString() || 'N/A'}
                </div>
                <div className="text-charcoal/60">Samples</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-chestnut">
                  {validationResults.summary?.shape?.[1] || 'N/A'}
                </div>
                <div className="text-charcoal/60">Features</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-chestnut">
                  {validationResults.summary?.memory_usage || 'N/A'}
                </div>
                <div className="text-charcoal/60">Memory Usage</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-chestnut">
                  {Object.keys(validationResults.summary?.missing_values || {}).length || 0}
                </div>
                <div className="text-charcoal/60">Missing Columns</div>
              </div>
            </div>
          </div>
        )}

        {/* Algorithm Selection */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="font-semibold text-charcoal mb-4 flex items-center gap-2">
            <Settings size={20} />
            Select Clustering Algorithms ({config.algorithms.length} selected)
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableAlgorithms.map(algorithm => {
              const isSelected = config.algorithms.includes(algorithm.id);
              
              return (
                <div
                  key={algorithm.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-chestnut bg-chestnut/5 shadow-md' 
                      : 'border-gray-200 bg-white hover:border-chestnut/50'
                  }`}
                  onClick={() => toggleAlgorithm(algorithm.id)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <h4 className="font-semibold text-charcoal pr-2">{algorithm.name}</h4>
                    <div className={`w-4 h-4 rounded-full border-2 border-chestnut flex-shrink-0 ${
                      isSelected ? 'bg-chestnut' : 'bg-transparent'
                    }`} />
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-charcoal/70">Category:</span>
                      <span className="font-medium">{algorithm.category}</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-charcoal/70">Complexity:</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getComplexityColor(algorithm.complexity)}`}>
                        {algorithm.complexity}
                      </span>
                    </div>
                    
                    <p className="text-xs text-charcoal/60 mt-3 leading-relaxed">
                      {algorithm.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Optimization Parameters */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="font-semibold text-charcoal mb-4 flex items-center gap-2">
            <Target size={20} />
            Optimization Parameters
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Cluster Range
              </label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-charcoal/60 mb-1">Minimum</label>
                  <input
                    type="number"
                    min="2"
                    max="10"
                    value={config.minClusters}
                    onChange={(e) => handleConfigChange('minClusters', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-chestnut"
                  />
                </div>
                <div>
                  <label className="block text-xs text-charcoal/60 mb-1">Maximum</label>
                  <input
                    type="number"
                    min="3"
                    max="15"
                    value={config.maxClusters}
                    onChange={(e) => handleConfigChange('maxClusters', parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-chestnut"
                  />
                </div>
              </div>
              <p className="text-xs text-charcoal/50 mt-1">
                Range of cluster numbers to test for optimization
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Feature Scaling Method
              </label>
              <select
                value={config.scalingMethod}
                onChange={(e) => handleConfigChange('scalingMethod', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-chestnut"
              >
                <option value="standard">Standard Scaler (Z-score)</option>
                <option value="minmax">Min-Max Scaler (0-1)</option>
                <option value="robust">Robust Scaler (Median/IQR)</option>
                <option value="none">No Scaling</option>
              </select>
              <p className="text-xs text-charcoal/50 mt-1">
                Scaling method for feature normalization
              </p>
            </div>
          </div>

          <div className="mt-4">
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={config.enableDimensionalityReduction}
                onChange={(e) => handleConfigChange('enableDimensionalityReduction', e.target.checked)}
                className="text-chestnut"
              />
              <div>
                <div className="font-medium">Enable PCA for Visualization</div>
                <div className="text-sm text-charcoal/60">
                  Apply Principal Component Analysis for 2D/3D cluster visualization
                </div>
              </div>
            </label>
          </div>
        </div>

        {/* Configuration Summary */}
        <div className="bg-bone border rounded-lg p-4">
          <h4 className="font-medium text-charcoal mb-2">Analysis Configuration</h4>
          <div className="text-sm text-charcoal/70 space-y-1">
            <div>• Selected algorithms: {config.algorithms.length}</div>
            <div>• Cluster range: {config.minClusters} - {config.maxClusters}</div>
            <div>• Scaling method: {config.scalingMethod}</div>
            <div>• PCA visualization: {config.enableDimensionalityReduction ? 'Enabled' : 'Disabled'}</div>
            <div>• Estimated analysis time: {Math.ceil(config.algorithms.length * 1.5)} - {config.algorithms.length * 3} minutes</div>
          </div>
        </div>

        {config.algorithms.length === 0 && (
          <div className="text-center text-charcoal/60 py-4">
            Please select at least one clustering algorithm to continue
          </div>
        )}
      </div>
    </StepContainer>
  );
};

export default ClusterConfigurationStep;