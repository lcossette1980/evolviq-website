import React from 'react';
import { Play } from 'lucide-react';
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
      title="Start Analysis"
      description="Run clustering analysis with selected algorithms"
      currentStep={4}
      totalSteps={6}
      onNext={onAnalyze}
      canGoNext={!isLoading && (config?.algorithms?.length > 0)}
      nextLabel={isLoading ? "Analyzing..." : (config?.algorithms?.length > 0 ? "Start Analysis" : "Select Algorithms First")}
      isLoading={isLoading}
    >
      <div className="space-y-6">
        {/* Selected Algorithms */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold text-charcoal mb-4">
            Selected Algorithms ({config?.algorithms?.length || 0})
          </h3>
          
          <div className="grid md:grid-cols-4 gap-3">
            {config?.algorithms?.map(algorithmId => {
              const algorithm = algorithmDetails[algorithmId];
              if (!algorithm) return null;
              
              return (
                <div key={algorithmId} className="p-3 bg-bone rounded-lg border text-center">
                  <div className="font-medium text-charcoal text-sm">
                    {algorithm.name}
                  </div>
                </div>
              );
            })}
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
                  {config?.maxClusters - config?.minClusters + 1 || 'N/A'}
                </div>
                <div className="text-charcoal/60">Cluster Tests</div>
              </div>
              <div>
                <div className="font-bold text-chestnut">
                  {config?.algorithms?.length || 0}
                </div>
                <div className="text-charcoal/60">Algorithms</div>
              </div>
            </div>
          </div>
        )}

        {/* Analysis Action */}
        {isLoading ? (
          <div className="bg-white border rounded-lg p-8 text-center">
            <div className="flex justify-center space-x-1 mb-4">
              <div className="w-2 h-2 bg-chestnut rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-chestnut rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-chestnut rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
            <p className="text-charcoal/60">Running clustering analysis...</p>
          </div>
        ) : (
          <div className="bg-white border rounded-lg p-8 text-center">
            <Play size={48} className="mx-auto text-chestnut mb-4" />
            <h3 className="text-xl font-semibold text-charcoal mb-2">Ready to Analyze</h3>
            <p className="text-charcoal/70">Run {config?.algorithms?.length || 0} algorithms with optimal cluster detection</p>
          </div>
        )}
      </div>
    </StepContainer>
  );
};

export default ClusterAnalysisStep;
