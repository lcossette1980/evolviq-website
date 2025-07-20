import React, { useState } from 'react';
import { BarChart3, TrendingUp, CheckCircle, Eye, Download } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ScatterChart, Scatter, Cell } from 'recharts';
import StepContainer from '../shared/StepContainer';

const ResultsVisualization = ({ analysisResults, validationResults }) => {
  const [activeTab, setActiveTab] = useState('quality');

  if (!analysisResults) {
    return (
      <StepContainer
        title="Analysis Results"
        description="Displaying your comprehensive EDA results"
        currentStep={5}
        totalSteps={6}
        canGoNext={false}
      >
        <div className="text-center py-8">
          <p className="text-charcoal/60">No analysis results available</p>
        </div>
      </StepContainer>
    );
  }

  const tabs = [
    { id: 'quality', label: 'Data Quality', icon: CheckCircle },
    { id: 'univariate', label: 'Univariate', icon: BarChart3 },
    { id: 'bivariate', label: 'Correlations', icon: TrendingUp }
  ];

  const renderQualityResults = () => {
    const quality = analysisResults.quality;
    
    return (
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-chestnut">
              {quality?.completeness?.score || 'N/A'}%
            </div>
            <div className="text-sm text-charcoal/70">Completeness</div>
          </div>
          <div className="bg-white border rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-chestnut">
              {quality?.consistency?.score || 'N/A'}%
            </div>
            <div className="text-sm text-charcoal/70">Consistency</div>
          </div>
          <div className="bg-white border rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-chestnut">
              {quality?.validity?.score || 'N/A'}%
            </div>
            <div className="text-sm text-charcoal/70">Validity</div>
          </div>
          <div className="bg-white border rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-chestnut">
              {quality?.overall_score || 'N/A'}%
            </div>
            <div className="text-sm text-charcoal/70">Overall Score</div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <h3 className="font-semibold text-charcoal mb-4">Quality Assessment Details</h3>
          <div className="space-y-4">
            {quality?.issues?.map((issue, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <div>
                  <div className="font-medium text-yellow-800">{issue.type}</div>
                  <div className="text-sm text-yellow-700">{issue.description}</div>
                </div>
              </div>
            )) || (
              <p className="text-charcoal/60">No quality issues detected</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderUnivariateResults = () => {
    const univariate = analysisResults.univariate;
    
    if (!univariate?.numeric_analysis?.summary_stats) {
      return <p className="text-charcoal/60">No univariate analysis results available</p>;
    }

    const stats = univariate.numeric_analysis.summary_stats;
    const chartData = Object.entries(stats).map(([feature, data]) => ({
      feature,
      mean: data.mean,
      std: data.std,
      skewness: Math.abs(data.skewness || 0)
    }));

    return (
      <div className="space-y-6">
        <div className="bg-white border rounded-lg p-6">
          <h3 className="font-semibold text-charcoal mb-4">Feature Statistics</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#A59E8C" />
              <XAxis dataKey="feature" tick={{ fill: '#2A2A2A', fontSize: 12 }} />
              <YAxis tick={{ fill: '#2A2A2A', fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="mean" fill="#8B4513" name="Mean" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <h3 className="font-semibold text-charcoal mb-4">Distribution Analysis</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {Object.entries(stats).slice(0, 4).map(([feature, data], idx) => (
              <div key={idx} className="p-4 bg-bone rounded-lg">
                <div className="font-medium text-charcoal mb-2">{feature}</div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-charcoal/70">Mean:</span>
                    <span>{data.mean?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal/70">Std Dev:</span>
                    <span>{data.std?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal/70">Skewness:</span>
                    <span>{Math.abs(data.skewness || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderBivariateResults = () => {
    const bivariate = analysisResults.bivariate;
    
    if (!bivariate?.strongCorrelations) {
      return <p className="text-charcoal/60">No correlation analysis results available</p>;
    }

    const strongCorrs = bivariate.strongCorrelations || [];
    const corrData = strongCorrs.map((corr, idx) => ({
      id: idx,
      x: Math.random() * 100,
      y: Math.random() * 100,
      correlation: Math.abs(corr.correlation),
      features: `${corr.feature1} × ${corr.feature2}`
    }));

    return (
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white border rounded-lg p-6">
            <h3 className="font-semibold text-charcoal mb-4">Strong Correlations</h3>
            <div className="space-y-3">
              {strongCorrs.length > 0 ? strongCorrs.map((corr, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-bone rounded-lg">
                  <span className="font-medium">{corr.feature1} × {corr.feature2}</span>
                  <span className={`px-2 py-1 rounded text-sm font-bold text-white ${
                    Math.abs(corr.correlation) > 0.8 ? 'bg-red-600' :
                    Math.abs(corr.correlation) > 0.6 ? 'bg-orange-500' : 'bg-yellow-500'
                  }`}>
                    {corr.correlation.toFixed(3)}
                  </span>
                </div>
              )) : (
                <p className="text-charcoal/60">No strong correlations found</p>
              )}
            </div>
          </div>

          <div className="bg-white border rounded-lg p-6">
            <h3 className="font-semibold text-charcoal mb-4">Correlation Strength</h3>
            {corrData.length > 0 && (
              <ResponsiveContainer width="100%" height={200}>
                <ScatterChart data={corrData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#A59E8C" />
                  <XAxis tick={{ fill: '#2A2A2A', fontSize: 12 }} />
                  <YAxis tick={{ fill: '#2A2A2A', fontSize: 12 }} />
                  <Tooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-3 border rounded shadow">
                            <p className="font-medium">{data.features}</p>
                            <p>Correlation: {data.correlation.toFixed(3)}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Scatter dataKey="correlation" fill="#8B4513" />
                </ScatterChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <h3 className="font-semibold text-charcoal mb-4">Analysis Summary</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-bone rounded-lg">
              <div className="text-2xl font-bold text-chestnut">
                {strongCorrs.length}
              </div>
              <div className="text-sm text-charcoal/70">Strong Correlations</div>
            </div>
            <div className="text-center p-4 bg-bone rounded-lg">
              <div className="text-2xl font-bold text-chestnut">
                {bivariate.multicollinearity ? 'Yes' : 'No'}
              </div>
              <div className="text-sm text-charcoal/70">Multicollinearity</div>
            </div>
            <div className="text-center p-4 bg-bone rounded-lg">
              <div className="text-2xl font-bold text-chestnut">
                {validationResults?.summary?.shape?.[1] || 'N/A'}
              </div>
              <div className="text-sm text-charcoal/70">Features Analyzed</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'quality':
        return renderQualityResults();
      case 'univariate':
        return renderUnivariateResults();
      case 'bivariate':
        return renderBivariateResults();
      default:
        return null;
    }
  };

  return (
    <StepContainer
      title="Analysis Results"
      description="Comprehensive exploratory data analysis results"
      currentStep={5}
      totalSteps={6}
      onNext={() => {}}
      canGoNext={true}
      nextLabel="Continue to Export"
    >
      <div className="space-y-6">
        {/* Tab Navigation */}
        <div className="bg-white border rounded-lg p-1 flex">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-chestnut text-white'
                    : 'text-charcoal hover:bg-bone'
                }`}
              >
                <Icon size={16} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {renderTabContent()}
      </div>
    </StepContainer>
  );
};

export default ResultsVisualization;