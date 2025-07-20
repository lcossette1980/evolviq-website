import React from 'react';
import { Download, Home, RotateCcw, FileText, BarChart3, Share, Target } from 'lucide-react';

const ExportStep = ({ 
  analysisResults, 
  validationResults, 
  onReturnToDashboard, 
  onStartNew 
}) => {
  const handleDownloadReport = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      analysis_type: 'Clustering',
      dataset: validationResults?.summary,
      clustering_results: analysisResults,
      optimization_data: analysisResults?.optimization_data,
      best_algorithm: analysisResults?.clustering_results?.[0]
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clustering_report_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportOptions = [
    {
      icon: FileText,
      title: 'Download Analysis Report',
      description: 'Comprehensive JSON report with all clustering results',
      action: handleDownloadReport,
      primary: true
    },
    {
      icon: BarChart3,
      title: 'Export Visualizations',
      description: 'Download cluster plots and optimization charts',
      action: () => alert('Visualization export coming soon!')
    },
    {
      icon: Target,
      title: 'Cluster Assignments',
      description: 'Download data with cluster labels for each point',
      action: () => alert('Cluster assignments export coming soon!')
    },
    {
      icon: Share,
      title: 'Share Results',
      description: 'Generate shareable link for your analysis',
      action: () => alert('Sharing feature coming soon!')
    }
  ];

  const bestResult = analysisResults?.clustering_results?.[0];
  const optimalK = analysisResults?.optimization_data?.reduce((best, current) => 
    current.silhouette > best.silhouette ? current : best
  )?.k || 3;

  const nextSteps = [
    {
      title: 'Classification Analysis',
      description: 'Use cluster labels as features for supervised learning',
      link: '/tools/classification-explorer',
      icon: Target
    },
    {
      title: 'Advanced Analytics',
      description: 'Explore deeper insights with EDA and other tools',
      link: '/tools/eda-explorer',
      icon: BarChart3
    },
    {
      title: 'Predictive Modeling',
      description: 'Build regression models based on cluster insights',
      link: '/tools/linear-regression',
      icon: BarChart3
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Success Header */}
      <div className="bg-green-50 border-b border-green-200 p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Target size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">
            Clustering Analysis Complete!
          </h2>
          <p className="text-green-700">
            Your clustering analysis has been completed successfully. 
            Review your results and explore the discovered patterns.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-8">
        {/* Analysis Summary */}
        <div className="bg-bone rounded-lg p-6">
          <h3 className="font-semibold text-charcoal mb-4">Analysis Summary</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-chestnut">
                {validationResults?.summary?.shape?.[0]?.toLocaleString() || 'N/A'}
              </div>
              <div className="text-sm text-charcoal/70">Data Points Clustered</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-chestnut">
                {analysisResults?.clustering_results?.length || 'N/A'}
              </div>
              <div className="text-sm text-charcoal/70">Algorithms Compared</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-chestnut">
                {optimalK}
              </div>
              <div className="text-sm text-charcoal/70">Optimal Clusters</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-chestnut">
                {bestResult ? bestResult.silhouette.toFixed(3) : 'N/A'}
              </div>
              <div className="text-sm text-charcoal/70">Best Silhouette Score</div>
            </div>
          </div>
        </div>

        {/* Best Algorithm Highlight */}
        {bestResult && (
          <div className="bg-white border rounded-lg p-6">
            <h3 className="font-semibold text-charcoal mb-4">Best Clustering Algorithm</h3>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-bold text-green-800">{bestResult.algorithm}</h4>
                <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Best Performance
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-bold text-green-700">{bestResult.silhouette.toFixed(3)}</div>
                  <div className="text-green-600">Silhouette Score</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-green-700">{bestResult.calinski.toFixed(1)}</div>
                  <div className="text-green-600">Calinski-Harabasz</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-green-700">{bestResult.davies.toFixed(3)}</div>
                  <div className="text-green-600">Davies-Bouldin</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-green-700">{bestResult.n_clusters}</div>
                  <div className="text-green-600">Clusters Found</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Key Findings */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="font-semibold text-charcoal mb-4">Key Findings</h3>
          <div className="space-y-3">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="font-medium text-green-800">Optimal Structure Identified</div>
              <div className="text-sm text-green-700">
                Your data naturally forms {optimalK} distinct clusters with strong internal cohesion.
              </div>
            </div>
            
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="font-medium text-blue-800">Algorithm Performance</div>
              <div className="text-sm text-blue-700">
                {bestResult?.algorithm} provided the best clustering quality with a silhouette score of {bestResult?.silhouette.toFixed(3)}.
              </div>
            </div>
            
            {bestResult?.n_noise > 0 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="font-medium text-yellow-800">Outliers Detected</div>
                <div className="text-sm text-yellow-700">
                  {bestResult.n_noise} data points were identified as outliers or noise, requiring special attention.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Export Options */}
        <div>
          <h3 className="font-semibold text-charcoal mb-4">Export Your Results</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {exportOptions.map((option, idx) => {
              const Icon = option.icon;
              return (
                <button
                  key={idx}
                  onClick={option.action}
                  className={`p-4 rounded-lg border text-left transition-all hover:shadow-md ${
                    option.primary 
                      ? 'bg-chestnut text-white border-chestnut hover:bg-chestnut/90' 
                      : 'bg-white border-gray-200 hover:border-chestnut'
                  }`}
                >
                  <Icon size={24} className={`mb-3 ${option.primary ? 'text-white' : 'text-chestnut'}`} />
                  <div className={`font-medium mb-1 ${option.primary ? 'text-white' : 'text-charcoal'}`}>
                    {option.title}
                  </div>
                  <div className={`text-sm ${option.primary ? 'text-white/80' : 'text-charcoal/60'}`}>
                    {option.description}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Next Steps */}
        <div>
          <h3 className="font-semibold text-charcoal mb-4">Recommended Next Steps</h3>
          <div className="grid md:grid-cols-3 gap-4">
            {nextSteps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <a
                  key={idx}
                  href={step.link}
                  className="block p-4 bg-white border border-gray-200 rounded-lg hover:border-chestnut hover:shadow-md transition-all"
                >
                  <Icon size={24} className="text-chestnut mb-3" />
                  <div className="font-medium text-charcoal mb-1">{step.title}</div>
                  <div className="text-sm text-charcoal/60">{step.description}</div>
                </a>
              );
            })}
          </div>
        </div>

        {/* Business Applications */}
        <div className="bg-bone border rounded-lg p-6">
          <h3 className="font-semibold text-charcoal mb-4">Business Applications</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-charcoal mb-2">Customer Segmentation</h4>
              <ul className="space-y-1 text-charcoal/70">
                <li>• Target marketing campaigns by cluster</li>
                <li>• Develop cluster-specific products</li>
                <li>• Optimize pricing strategies</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-charcoal mb-2">Data Engineering</h4>
              <ul className="space-y-1 text-charcoal/70">
                <li>• Use clusters as new features</li>
                <li>• Improve predictive models</li>
                <li>• Identify data anomalies</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Navigation Actions */}
        <div className="border-t pt-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={onReturnToDashboard}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-chestnut text-white rounded-lg hover:bg-chestnut/90 transition-all"
            >
              <Home size={20} />
              Return to Dashboard
            </button>
            
            <button
              onClick={onStartNew}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-bone text-charcoal border border-khaki rounded-lg hover:bg-bone/80 transition-all"
            >
              <RotateCcw size={20} />
              Start New Clustering
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportStep;