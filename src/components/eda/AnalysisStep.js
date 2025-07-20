import React from 'react';
import { BarChart3, TrendingUp, CheckCircle, Play } from 'lucide-react';
import StepContainer from '../shared/StepContainer';

const AnalysisStep = ({ onAnalyze, isLoading, preprocessingResults }) => {
  const analysisComponents = [
    {
      icon: CheckCircle,
      title: 'Data Quality Assessment',
      description: 'Comprehensive evaluation of data completeness, consistency, and validity',
      features: ['Missing value analysis', 'Duplicate detection', 'Data type validation', 'Overall quality score']
    },
    {
      icon: BarChart3,
      title: 'Univariate Analysis',
      description: 'Detailed analysis of individual variables and their distributions',
      features: ['Distribution analysis', 'Summary statistics', 'Outlier detection', 'Normality tests']
    },
    {
      icon: TrendingUp,
      title: 'Bivariate & Correlation Analysis',
      description: 'Explore relationships and correlations between variables',
      features: ['Correlation matrices', 'Feature interactions', 'Multicollinearity detection', 'Association patterns']
    }
  ];

  return (
    <StepContainer
      title="Run Exploratory Data Analysis"
      description="Execute comprehensive analysis on your preprocessed dataset"
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
            The following comprehensive analysis will be performed on your dataset. 
            This process may take a few minutes depending on the size of your data.
          </p>
        </div>

        {/* Preprocessing Summary */}
        {preprocessingResults && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
              <CheckCircle size={16} />
              Preprocessing Complete
            </h3>
            <p className="text-green-700 text-sm">
              Your data has been successfully preprocessed and is ready for analysis.
            </p>
          </div>
        )}

        {/* Analysis Components */}
        <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6">
          {analysisComponents.map((component, index) => {
            const Icon = component.icon;
            
            return (
              <div key={index} className="bg-white border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-chestnut/10 rounded-lg">
                    <Icon size={24} className="text-chestnut" />
                  </div>
                  <h3 className="font-semibold text-charcoal">{component.title}</h3>
                </div>
                
                <p className="text-charcoal/70 text-sm mb-4">
                  {component.description}
                </p>
                
                <ul className="space-y-2">
                  {component.features.map((feature, idx) => (
                    <li key={idx} className="text-sm text-charcoal/60 flex items-center gap-2">
                      <div className="w-1.5 h-1.5 bg-chestnut rounded-full"></div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>

        {/* Analysis Action */}
        <div className="bg-white border rounded-lg p-8 text-center">
          <div className="mb-6">
            <Play size={48} className="mx-auto text-chestnut mb-4" />
            <h3 className="text-xl font-semibold text-charcoal mb-2">
              Ready to Analyze Your Data
            </h3>
            <p className="text-charcoal/70">
              Click "Start Analysis" to begin the comprehensive exploratory data analysis.
              All three analysis components will run simultaneously for efficiency.
            </p>
          </div>

          {isLoading && (
            <div className="mb-6">
              <div className="flex justify-center space-x-1 mb-4">
                <div className="w-2 h-2 bg-chestnut rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-chestnut rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-chestnut rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
              <p className="text-charcoal/60">
                Analysis in progress... This may take a few minutes.
              </p>
            </div>
          )}

          <div className="text-sm text-charcoal/50">
            <p>Analysis time estimate: 30 seconds - 5 minutes</p>
          </div>
        </div>
      </div>
    </StepContainer>
  );
};

export default AnalysisStep;