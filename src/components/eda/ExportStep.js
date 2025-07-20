import React from 'react';
import { Download, Home, RotateCcw, FileText, BarChart3, Share } from 'lucide-react';
import StepContainer from '../shared/StepContainer';

const ExportStep = ({ 
  analysisResults, 
  validationResults, 
  onReturnToDashboard, 
  onStartNew 
}) => {
  const handleDownloadReport = () => {
    // Generate and download analysis report
    const reportData = {
      timestamp: new Date().toISOString(),
      dataset: validationResults?.summary,
      analysis: analysisResults
    };
    
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `eda_report_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const exportOptions = [
    {
      icon: FileText,
      title: 'Download Analysis Report',
      description: 'Comprehensive JSON report with all analysis results',
      action: handleDownloadReport,
      primary: true
    },
    {
      icon: BarChart3,
      title: 'Export Visualizations',
      description: 'Download charts and graphs as PNG images',
      action: () => alert('Visualization export coming soon!')
    },
    {
      icon: Share,
      title: 'Share Results',
      description: 'Generate shareable link for your analysis',
      action: () => alert('Sharing feature coming soon!')
    }
  ];

  const nextSteps = [
    {
      title: 'Machine Learning',
      description: 'Use your insights to build predictive models',
      link: '/linear-regression',
      icon: BarChart3
    },
    {
      title: 'Classification',
      description: 'Build classification models based on your findings',
      link: '/classification-explorer', 
      icon: BarChart3
    },
    {
      title: 'Clustering',
      description: 'Discover hidden patterns in your data',
      link: '/clustering-explorer',
      icon: BarChart3
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Success Header */}
      <div className="bg-green-50 border-b border-green-200 p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold text-green-800 mb-2">
            Analysis Complete!
          </h2>
          <p className="text-green-700">
            Your exploratory data analysis has been completed successfully. 
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
              <div className="text-sm text-charcoal/70">Rows Analyzed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-chestnut">
                {validationResults?.summary?.shape?.[1] || 'N/A'}
              </div>
              <div className="text-sm text-charcoal/70">Features Analyzed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-chestnut">
                {analysisResults?.bivariate?.strongCorrelations?.length || 0}
              </div>
              <div className="text-sm text-charcoal/70">Strong Correlations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-chestnut">
                {analysisResults?.quality?.overall_score || 'N/A'}%
              </div>
              <div className="text-sm text-charcoal/70">Quality Score</div>
            </div>
          </div>
        </div>

        {/* Export Options */}
        <div>
          <h3 className="font-semibold text-charcoal mb-4">Export Your Results</h3>
          <div className="grid md:grid-cols-3 gap-4">
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
              Start New Analysis
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportStep;