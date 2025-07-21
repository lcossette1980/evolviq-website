import React, { useState } from 'react';
import { BarChart3, TrendingUp, CheckCircle, Eye, Download } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ScatterChart, Scatter, Cell } from 'recharts';
import StepContainer from '../shared/StepContainer';

const ResultsVisualization = ({ analysisResults, validationResults, onNext }) => {
  const [activeTab, setActiveTab] = useState('quality');
  const [selectedVariable, setSelectedVariable] = useState(
    analysisResults?.univariate?.numeric_analysis?.summary_stats ? 
    Object.keys(analysisResults.univariate.numeric_analysis.summary_stats)[0] : 
    null
  );

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
    const qualityResponse = analysisResults.quality;
    
    // If quality assessment API failed, show appropriate message
    if (!qualityResponse) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800 font-medium mb-2">Quality Assessment Unavailable</p>
          <p className="text-yellow-700 text-sm">The quality assessment API returned an error. Please try again or contact support if the issue persists.</p>
        </div>
      );
    }

    console.log('Quality data structure:', qualityResponse);
    
    // Extract the actual assessment data from the API response
    const quality = qualityResponse.assessment;
    
    return (
      <div className="space-y-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-chestnut">
              {typeof (quality?.completeness?.score ?? quality?.completeness) === 'number' 
                ? `${(quality?.completeness?.score ?? quality?.completeness).toFixed(1)}%` 
                : 'N/A'}
            </div>
            <div className="text-sm text-charcoal/70">Completeness</div>
          </div>
          <div className="bg-white border rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-chestnut">
              {typeof (quality?.consistency?.score ?? quality?.consistency) === 'number' 
                ? `${(quality?.consistency?.score ?? quality?.consistency).toFixed(1)}%` 
                : 'N/A'}
            </div>
            <div className="text-sm text-charcoal/70">Consistency</div>
          </div>
          <div className="bg-white border rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-chestnut">
              {typeof (quality?.validity?.score ?? quality?.validity) === 'number' 
                ? `${(quality?.validity?.score ?? quality?.validity).toFixed(1)}%` 
                : 'N/A'}
            </div>
            <div className="text-sm text-charcoal/70">Validity</div>
          </div>
          <div className="bg-white border rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-chestnut">
              {typeof quality?.overall_score === 'number' 
                ? `${quality.overall_score.toFixed(1)}%` 
                : 'N/A'}
            </div>
            <div className="text-sm text-charcoal/70">Overall Score</div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <h3 className="font-semibold text-charcoal mb-4">Quality Assessment Details</h3>
          <div className="space-y-4">
            {quality?.issues?.length > 0 ? quality.issues.map((issue, idx) => (
              <div key={idx} className="flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2"></div>
                <div>
                  <div className="font-medium text-yellow-800">{issue.type}</div>
                  <div className="text-sm text-yellow-700">{issue.description}</div>
                </div>
              </div>
            )) : (
              <p className="text-charcoal/60">No quality issues detected</p>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderUnivariateResults = () => {
    const univariate = analysisResults.univariate;
    
    if (!univariate) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800 font-medium mb-2">Univariate Analysis Unavailable</p>
          <p className="text-yellow-700 text-sm">The univariate analysis API returned an error. Please try again or contact support if the issue persists.</p>
        </div>
      );
    }

    console.log('Univariate data structure:', univariate);
    
    if (!univariate?.numeric_analysis?.summary_stats) {
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <p className="text-blue-800 font-medium mb-2">No Numeric Data Detected</p>
          <p className="text-blue-700 text-sm">Your dataset may not contain numeric columns suitable for univariate analysis.</p>
        </div>
      );
    }

    const stats = univariate.numeric_analysis.summary_stats;
    
    // Ensure we have a valid selected variable
    const currentSelectedVariable = selectedVariable || Object.keys(stats)[0];
    
    const chartData = Object.entries(stats).map(([feature, data]) => ({
      feature,
      mean: data.mean,
      std: data.std,
      skewness: Math.abs(data.skewness || 0)
    }));

    const selectedVarData = stats[currentSelectedVariable];
    
    // Generate mock histogram data for the selected variable
    const histogramData = selectedVarData ? Array.from({ length: 20 }, (_, i) => ({
      bin: (selectedVarData.min + (i * (selectedVarData.max - selectedVarData.min) / 20)).toFixed(1),
      frequency: Math.floor(Math.random() * 50) + 10
    })) : [];

    return (
      <div className="space-y-6">
        {/* Variable Selector */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="font-semibold text-charcoal mb-4">Select Variable for Detailed Analysis</h3>
          <div className="grid md:grid-cols-4 lg:grid-cols-6 gap-2">
            {Object.keys(stats).map((variable) => (
              <button
                key={variable}
                onClick={() => setSelectedVariable(variable)}
                className={`p-3 rounded-lg text-sm font-medium transition-all ${
                  currentSelectedVariable === variable
                    ? 'bg-chestnut text-white'
                    : 'bg-bone text-charcoal hover:bg-chestnut/10'
                }`}
              >
                {variable}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Variable Details */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="font-semibold text-charcoal mb-4">
            Variable Analysis: <span className="text-chestnut">{currentSelectedVariable}</span>
          </h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Statistics */}
            <div>
              <h4 className="font-medium text-charcoal mb-3">Statistical Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between p-2 bg-bone rounded">
                  <span className="text-charcoal/70">Mean:</span>
                  <span className="font-medium">{typeof selectedVarData?.mean === 'number' ? selectedVarData.mean.toFixed(3) : 'N/A'}</span>
                </div>
                <div className="flex justify-between p-2 bg-bone rounded">
                  <span className="text-charcoal/70">Median:</span>
                  <span className="font-medium">{typeof selectedVarData?.median === 'number' ? selectedVarData.median.toFixed(3) : 'N/A'}</span>
                </div>
                <div className="flex justify-between p-2 bg-bone rounded">
                  <span className="text-charcoal/70">Standard Deviation:</span>
                  <span className="font-medium">{typeof selectedVarData?.std === 'number' ? selectedVarData.std.toFixed(3) : 'N/A'}</span>
                </div>
                <div className="flex justify-between p-2 bg-bone rounded">
                  <span className="text-charcoal/70">Minimum:</span>
                  <span className="font-medium">{typeof selectedVarData?.min === 'number' ? selectedVarData.min.toFixed(3) : 'N/A'}</span>
                </div>
                <div className="flex justify-between p-2 bg-bone rounded">
                  <span className="text-charcoal/70">Maximum:</span>
                  <span className="font-medium">{typeof selectedVarData?.max === 'number' ? selectedVarData.max.toFixed(3) : 'N/A'}</span>
                </div>
                <div className="flex justify-between p-2 bg-bone rounded">
                  <span className="text-charcoal/70">Skewness:</span>
                  <span className="font-medium">{typeof selectedVarData?.skewness === 'number' ? selectedVarData.skewness.toFixed(3) : 'N/A'}</span>
                </div>
                <div className="flex justify-between p-2 bg-bone rounded">
                  <span className="text-charcoal/70">Kurtosis:</span>
                  <span className="font-medium">{typeof selectedVarData?.kurtosis === 'number' ? selectedVarData.kurtosis.toFixed(3) : 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Distribution Histogram */}
            <div>
              <h4 className="font-medium text-charcoal mb-3">Distribution</h4>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={histogramData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#A59E8C" />
                  <XAxis dataKey="bin" tick={{ fill: '#2A2A2A', fontSize: 10 }} />
                  <YAxis tick={{ fill: '#2A2A2A', fontSize: 10 }} />
                  <Tooltip />
                  <Bar dataKey="frequency" fill="#8B4513" name="Frequency" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Overview Chart */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="font-semibold text-charcoal mb-4">All Variables Overview</h3>
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
      </div>
    );
  };

  const renderBivariateResults = () => {
    const bivariateResponse = analysisResults.bivariate;
    
    if (!bivariateResponse) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800 font-medium mb-2">Correlation Analysis Unavailable</p>
          <p className="text-yellow-700 text-sm">The bivariate analysis API returned an error. Please try again or contact support if the issue persists.</p>
        </div>
      );
    }

    console.log('Bivariate data structure:', bivariateResponse);

    // Extract the actual correlation data from the API response
    const bivariate = bivariateResponse.correlation_analysis;
    const strongCorrs = bivariate?.strong_correlations || [];
    
    // Generate correlation matrix data for heatmap using actual API data
    const correlationData = bivariate?.pearson_correlation || {};
    const features = Object.keys(correlationData);
    
    if (features.length === 0) {
      return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <p className="text-blue-800 font-medium mb-2">No Correlation Data Available</p>
          <p className="text-blue-700 text-sm">Your dataset may not contain enough numeric columns for correlation analysis.</p>
        </div>
      );
    }
    
    const correlationMatrix = features.flatMap((row, i) => 
      features.map((col, j) => ({
        x: col,
        y: row,
        value: correlationData[row]?.[col] || (i === j ? 1 : 0)
      }))
    );

    const getCorrelationColor = (value) => {
      const absValue = Math.abs(value);
      if (absValue > 0.8) return '#B91C1C'; // Strong red
      if (absValue > 0.6) return '#DC2626'; // Medium red
      if (absValue > 0.4) return '#F59E0B'; // Orange
      if (absValue > 0.2) return '#EAB308'; // Yellow
      return '#E5E7EB'; // Light gray
    };

    return (
      <div className="space-y-6">
        {/* Correlation Heatmap */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="font-semibold text-charcoal mb-4">Correlation Matrix Heatmap</h3>
          <div className="overflow-x-auto">
            <div className="inline-block min-w-full">
              <div className="grid grid-cols-6 gap-1" style={{ gridTemplateColumns: 'auto repeat(5, 1fr)' }}>
                {/* Empty top-left cell */}
                <div></div>
                {/* Column headers */}
                {features.map(feature => (
                  <div key={feature} className="text-xs font-medium text-center p-2 text-charcoal">
                    {feature}
                  </div>
                ))}
                
                {/* Matrix cells */}
                {features.map((rowFeature, rowIdx) => (
                  <React.Fragment key={rowFeature}>
                    {/* Row header */}
                    <div className="text-xs font-medium p-2 text-charcoal flex items-center">
                      {rowFeature}
                    </div>
                    {/* Correlation cells */}
                    {features.map((colFeature, colIdx) => {
                      const corrValue = correlationMatrix.find(
                        item => item.x === colFeature && item.y === rowFeature
                      )?.value || 0;
                      return (
                        <div
                          key={`${rowFeature}-${colFeature}`}
                          className="aspect-square flex items-center justify-center text-xs font-bold rounded"
                          style={{ 
                            backgroundColor: getCorrelationColor(corrValue),
                            color: Math.abs(corrValue) > 0.5 ? 'white' : '#374151'
                          }}
                          title={`${rowFeature} × ${colFeature}: ${corrValue}`}
                        >
                          {typeof corrValue === 'number' ? corrValue.toFixed(2) : '0.00'}
                        </div>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
          
          {/* Legend */}
          <div className="mt-4 flex items-center justify-center gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-600 rounded"></div>
              <span>Strong (&gt; 0.8)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-500 rounded"></div>
              <span>Moderate (0.4-0.8)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-yellow-400 rounded"></div>
              <span>Weak (0.2-0.4)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-300 rounded"></div>
              <span>Very Weak (&lt; 0.2)</span>
            </div>
          </div>
        </div>

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
                    {typeof corr.correlation === 'number' ? corr.correlation.toFixed(3) : 'N/A'}
                  </span>
                </div>
              )) : (
                <p className="text-charcoal/60">No strong correlations found</p>
              )}
            </div>
          </div>

          <div className="bg-white border rounded-lg p-6">
            <h3 className="font-semibold text-charcoal mb-4">Correlation Distribution</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-red-50 border border-red-200 rounded-lg">
                <span className="font-medium text-red-800">Strong (|r| &gt; 0.8)</span>
                <span className="px-2 py-1 bg-red-600 text-white rounded text-sm font-bold">
                  {strongCorrs.filter(c => Math.abs(c.correlation) > 0.8).length}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <span className="font-medium text-orange-800">Moderate (0.4 &lt; |r| ≤ 0.8)</span>
                <span className="px-2 py-1 bg-orange-500 text-white rounded text-sm font-bold">
                  {strongCorrs.filter(c => Math.abs(c.correlation) > 0.4 && Math.abs(c.correlation) <= 0.8).length}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <span className="font-medium text-yellow-800">Weak (|r| ≤ 0.4)</span>
                <span className="px-2 py-1 bg-yellow-500 text-white rounded text-sm font-bold">
                  {strongCorrs.filter(c => Math.abs(c.correlation) <= 0.4).length}
                </span>
              </div>
            </div>
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
      totalSteps={5}
      onNext={onNext}
      canGoNext={true}
      nextLabel="Return to Dashboard"
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