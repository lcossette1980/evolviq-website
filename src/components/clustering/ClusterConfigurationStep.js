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
      title="Select Algorithms"
      description="Choose clustering algorithms to compare"
      currentStep={3}
      totalSteps={6}
      onNext={handleSubmit}
      canGoNext={config.algorithms.length > 0}
      nextLabel="Start Analysis"
      isLoading={isLoading}
    >
      <div className="space-y-6">
        {/* Algorithm Selection */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-charcoal mb-4">
            Select Algorithms ({config.algorithms.length} selected)
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {availableAlgorithms.map(algorithm => {
              const isSelected = config.algorithms.includes(algorithm.id);
              
              return (
                <div
                  key={algorithm.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    isSelected 
                      ? 'border-chestnut bg-chestnut text-white' 
                      : 'border-gray-200 bg-white hover:border-chestnut'
                  }`}
                  onClick={() => toggleAlgorithm(algorithm.id)}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{algorithm.name}</span>
                    <div className={`w-3 h-3 rounded-full ${
                      isSelected ? 'bg-white' : 'border border-gray-300'
                    }`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Basic Settings */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-charcoal mb-4">Analysis Settings</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Cluster Range
              </label>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="number"
                  min="2"
                  max="10"
                  value={config.minClusters}
                  onChange={(e) => handleConfigChange('minClusters', parseInt(e.target.value))}
                  className="px-3 py-2 border border-khaki/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-chestnut"
                  placeholder="Min"
                />
                <input
                  type="number"
                  min="3"
                  max="15"
                  value={config.maxClusters}
                  onChange={(e) => handleConfigChange('maxClusters', parseInt(e.target.value))}
                  className="px-3 py-2 border border-khaki/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-chestnut"
                  placeholder="Max"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-charcoal mb-2">
                Scaling Method
              </label>
              <select
                value={config.scalingMethod}
                onChange={(e) => handleConfigChange('scalingMethod', e.target.value)}
                className="w-full px-3 py-2 border border-khaki/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-chestnut"
              >
                <option value="standard">Standard Scaler</option>
                <option value="minmax">Min-Max Scaler</option>
                <option value="robust">Robust Scaler</option>
                <option value="none">No Scaling</option>
              </select>
            </div>
          </div>
        </div>

        {/* Dataset Summary */}
        {validationResults && (
          <div className="bg-bone border rounded-lg p-4">
            <div className="grid grid-cols-4 gap-4 text-center text-sm">
              <div>
                <div className="font-bold text-chestnut">
                  {validationResults.summary?.shape?.[0]?.toLocaleString() || 'N/A'}
                </div>
                <div className="text-charcoal/60">Samples</div>
              </div>
              <div>
                <div className="font-bold text-chestnut">
                  {validationResults.summary?.shape?.[1] || 'N/A'}
                </div>
                <div className="text-charcoal/60">Features</div>
              </div>
              <div>
                <div className="font-bold text-chestnut">
                  {config.algorithms.length}
                </div>
                <div className="text-charcoal/60">Algorithms</div>
              </div>
              <div>
                <div className="font-bold text-chestnut">
                  {config.maxClusters - config.minClusters + 1}
                </div>
                <div className="text-charcoal/60">Cluster Tests</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </StepContainer>
  );
};

export default ClusterConfigurationStep;