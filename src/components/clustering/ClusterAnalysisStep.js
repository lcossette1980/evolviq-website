import React from 'react';
import { Brain, Target, BarChart3, Play } from 'lucide-react';
import StepContainer from '../shared/StepContainer';

const ClusterAnalysisStep = ({ config, validationResults, onAnalyze, isLoading }) => {
  const algorithmDetails = {
    kmeans: { name: 'K-Means', icon: '🎯', complexity: 'Low' },
    hierarchical: { name: 'Hierarchical', icon: '🌳', complexity: 'Medium' },
    dbscan: { name: 'DBSCAN', icon: '🔍', complexity: 'Medium' },
    gmm: { name: 'Gaussian Mixture', icon: '📊', complexity: 'High' },
    spectral: { name: 'Spectral', icon: '🌐', complexity: 'High' },
    meanshift: { name: 'Mean Shift', icon: '📍', complexity: 'Medium' }
  };

  const analysisSteps = [
    {
      title: 'Data Preprocessing',
      description: 'Scale features and prepare data for clustering algorithms',
      tasks: ['Apply feature scaling', 'Handle missing values', 'Prepare feature matrix']
    },
    {
      title: 'Cluster Optimization',
      description: 'Determine optimal number of clusters using multiple methods',
      tasks: ['Elbow method analysis', 'Silhouette score calculation', 'Gap statistic evaluation']
    },
    {
      title: 'Algorithm Training',
      description: 'Train selected clustering algorithms with optimal parameters',
      tasks: ['Initialize algorithms', 'Fit clustering models', 'Extract cluster assignments']
    },
    {
      title: 'Quality Evaluation',
      description: 'Evaluate clustering quality with comprehensive metrics',
      tasks: ['Silhouette analysis', 'Calinski-Harabasz index', 'Davies-Bouldin index']
    },
    {
      title: 'Dimensionality Reduction',
      description: 'Create visualizations using PCA projection',
      tasks: ['Apply PCA transformation', 'Generate 2D projections', 'Prepare visualization data']
    }
  ];

  return (
    <StepContainer
      title="Run Clustering Analysis"
      description="Execute comprehensive clustering analysis with selected algorithms"
      currentStep={4}
      totalSteps={6}
      onNext={onAnalyze}
      canGoNext={!isLoading}
      nextLabel={isLoading ? "Analyzing..." : "Start Analysis"}
      isLoading={isLoading}
    >
      <div className="space-y-6">
        {/* Analysis Overview */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-800 mb-2">Analysis Overview</h3>
          <p className="text-blue-700">
            The clustering analysis will determine the optimal number of clusters and compare 
            multiple algorithms. This process includes cluster optimization, algorithm training, 
            and comprehensive quality evaluation.
          </p>
        </div>

        {/* Selected Algorithms */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="font-semibold text-charcoal mb-4 flex items-center gap-2">
            <Brain size={20} />
            Selected Algorithms ({config?.algorithms?.length || 0})
          </h3>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {config?.algorithms?.map(algorithmId => {
              const algorithm = algorithmDetails[algorithmId];
              if (!algorithm) return null;
              
              return (
                <div key={algorithmId} className="p-4 bg-bone rounded-lg border">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{algorithm.icon}</span>
                    <div>
                      <div className="font-medium text-charcoal">{algorithm.name}</div>
                      <div className="text-sm text-charcoal/60">
                        Complexity: {algorithm.complexity}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Analysis Process */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="font-semibold text-charcoal mb-4">Analysis Process</h3>
          
          <div className="space-y-4">
            {analysisSteps.map((step, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-chestnut text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-charcoal">{step.title}</h4>
                  <p className="text-sm text-charcoal/60 mb-2">{step.description}</p>
                  <ul className="text-xs text-charcoal/50 space-y-1">
                    {step.tasks.map((task, taskIdx) => (
                      <li key={taskIdx} className="flex items-center gap-2">
                        <div className="w-1 h-1 bg-chestnut rounded-full"></div>
                        {task}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Configuration Summary */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="font-semibold text-charcoal mb-4 flex items-center gap-2">
            <Target size={20} />
            Analysis Configuration
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-charcoal/70">Cluster Range:</span>
                <span className="font-medium">{config?.minClusters || 2} - {config?.maxClusters || 8}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal/70">Scaling Method:</span>
                <span className="font-medium capitalize">{config?.scalingMethod || 'Standard'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal/70">PCA Visualization:</span>
                <span className="font-medium">{config?.enableDimensionalityReduction ? 'Enabled' : 'Disabled'}</span>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-charcoal/70">Dataset Size:</span>
                <span className="font-medium">
                  {validationResults?.summary?.shape?.[0]?.toLocaleString() || 'N/A'} × {validationResults?.summary?.shape?.[1] || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal/70">Algorithms:</span>
                <span className="font-medium">{config?.algorithms?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-charcoal/70">Est. Time:</span>
                <span className="font-medium">{Math.ceil((config?.algorithms?.length || 1) * 1.5)}-{(config?.algorithms?.length || 1) * 3}min</span>
              </div>
            </div>
          </div>
        </div>

        {/* Analysis Action */}
        <div className="bg-white border rounded-lg p-8 text-center">
          <div className="mb-6">
            <Play size={48} className="mx-auto text-chestnut mb-4" />
            <h3 className="text-xl font-semibold text-charcoal mb-2">
              Ready to Start Clustering Analysis
            </h3>
            <p className="text-charcoal/70">
              Click "Start Analysis" to begin the clustering process. 
              All optimization and algorithm training will run automatically.
            </p>
          </div>

          {isLoading && (
            <div className="mb-6">
              <div className="flex justify-center space-x-1 mb-4">
                <div className="w-2 h-2 bg-chestnut rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-chestnut rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-chestnut rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <div className="space-y-2">
                <p className="text-charcoal/60">
                  Analysis in progress... This may take several minutes.
                </p>
                <div className="text-sm text-charcoal/50">
                  Processing: Cluster optimization → Algorithm training → Quality evaluation
                </div>
              </div>
            </div>
          )}

          <div className="text-sm text-charcoal/50">
            <p>The analysis will automatically determine optimal cluster numbers and compare algorithm performance</p>
          </div>
        </div>
      </div>
    </StepContainer>
  );
};

export default ClusterAnalysisStep;