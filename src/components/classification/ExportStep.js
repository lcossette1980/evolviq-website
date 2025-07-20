import React from 'react';
import { Download, Home, RotateCcw, FileText, BarChart3, Share, Brain } from 'lucide-react';

const ExportStep = ({ 
  trainingResults, 
  validationResults, 
  onReturnToDashboard, 
  onStartNew 
}) => {
  const handleDownloadReport = () => {
    const reportData = {
      timestamp: new Date().toISOString(),
      model_type: 'Classification',
      dataset: validationResults?.summary,
      training_results: trainingResults,
      best_model: trainingResults?.comparison_data?.[0],
      feature_importance: trainingResults?.feature_importance
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `classification_report_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportOptions = [
    {
      icon: FileText,
      title: 'Download Model Report',
      description: 'Comprehensive JSON report with all training results and metrics',
      action: handleDownloadReport,
      primary: true
    },
    {
      icon: BarChart3,
      title: 'Export Visualizations',
      description: 'Download performance charts and confusion matrices',
      action: () => alert('Visualization export coming soon!')
    },
    {
      icon: Brain,
      title: 'Model Artifacts',
      description: 'Download trained model files for deployment',
      action: () => alert('Model export coming soon!')
    },
    {
      icon: Share,
      title: 'Share Results',
      description: 'Generate shareable link for your analysis',
      action: () => alert('Sharing feature coming soon!')
    }
  ];

  const bestModel = trainingResults?.comparison_data?.[0];

  const nextSteps = [
    {
      title: 'Model Deployment',
      description: 'Deploy your best model to production environment',
      link: '/guides/model-deployment',
      icon: Brain
    },
    {
      title: 'Advanced Analytics',
      description: 'Explore deeper insights with EDA and other tools',
      link: '/tools/eda-explorer',
      icon: BarChart3
    },
    {
      title: 'Clustering Analysis',
      description: 'Discover hidden patterns in your data',
      link: '/tools/clustering-explorer',
      icon: Brain
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Success Header */}
      <div className="bg-green-50 border-b border-green-200 p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Brain size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">
            Classification Complete!
          </h2>
          <p className="text-green-700">
            Your classification models have been trained and evaluated successfully. 
            Review your results and choose your next steps.
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
              <div className="text-sm text-charcoal/70">Samples Trained</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-chestnut">
                {trainingResults?.comparison_data?.length || 'N/A'}
              </div>
              <div className="text-sm text-charcoal/70">Models Compared</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-chestnut">
                {bestModel ? (bestModel.accuracy * 100).toFixed(1) + '%' : 'N/A'}
              </div>
              <div className="text-sm text-charcoal/70">Best Accuracy</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-chestnut">
                {bestModel?.name?.substring(0, 10) || 'N/A'}
              </div>
              <div className="text-sm text-charcoal/70">Best Model</div>
            </div>
          </div>
        </div>

        {/* Best Model Highlight */}
        {bestModel && (
          <div className="bg-white border rounded-lg p-6">
            <h3 className="font-semibold text-charcoal mb-4">Best Performing Model</h3>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-bold text-green-800">{bestModel.name}</h4>
                <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Best
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-bold text-green-700">{(bestModel.accuracy * 100).toFixed(1)}%</div>
                  <div className="text-green-600">Accuracy</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-green-700">{(bestModel.precision * 100).toFixed(1)}%</div>
                  <div className="text-green-600">Precision</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-green-700">{(bestModel.recall * 100).toFixed(1)}%</div>
                  <div className="text-green-600">Recall</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-green-700">{(bestModel.f1_score * 100).toFixed(1)}%</div>
                  <div className="text-green-600">F1-Score</div>
                </div>
              </div>
            </div>
          </div>
        )}

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
              Start New Classification
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportStep;