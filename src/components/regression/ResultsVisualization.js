import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import regressionAPI from '../../services/regressionAPI';

const ResultsVisualization = ({ trainingResults, sessionId, onContinue }) => {
  const [fullResults, setFullResults] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadFullResults();
  }, [sessionId]);

  const loadFullResults = async () => {
    try {
      setIsLoading(true);
      const results = await regressionAPI.getResults(sessionId);
      setFullResults(results);
    } catch (error) {
      setError('Failed to load visualization data');
      console.error('Results loading error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportModel = async () => {
    try {
      const blob = await regressionAPI.exportModel(sessionId);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${trainingResults?.best_model || 'model'}_${new Date().toISOString().split('T')[0]}.joblib`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      alert('Failed to export model: ' + error.message);
    }
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin w-8 h-8 border-4 border-chestnut border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-charcoal/60">Loading results and visualizations...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={loadFullResults}
          className="bg-chestnut text-white px-4 py-2 rounded-lg hover:bg-chestnut/90"
        >
          Retry
        </button>
      </div>
    );
  }

  const { model_results, comparison_data, best_model, feature_importance, visualizations, training_summary } = fullResults || trainingResults;

  const tabs = [
    { id: 'overview', name: 'Overview', icon: '📊' },
    { id: 'comparison', name: 'Model Comparison', icon: '🔍' },
    { id: 'features', name: 'Feature Importance', icon: '🎯' },
    { id: 'residuals', name: 'Residual Analysis', icon: '📈' }
  ];

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-medium text-green-800 mb-2">Best Model</h3>
          <p className="text-2xl font-bold text-green-600">{best_model?.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</p>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-medium text-blue-800 mb-2">R² Score</h3>
          <p className="text-2xl font-bold text-blue-600">{training_summary?.best_r2_score?.toFixed(3) || 'N/A'}</p>
          <p className="text-sm text-blue-600">Higher is better</p>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 text-center">
          <h3 className="text-lg font-medium text-purple-800 mb-2">RMSE</h3>
          <p className="text-2xl font-bold text-purple-600">{training_summary?.best_rmse?.toFixed(3) || 'N/A'}</p>
          <p className="text-sm text-purple-600">Lower is better</p>
        </div>
      </div>

      {/* Models Trained */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-charcoal mb-4">Training Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-charcoal/60">Models Trained:</span>
            <div className="font-medium text-charcoal">{training_summary?.models_trained || 0}</div>
          </div>
          <div>
            <span className="text-charcoal/60">Best Performance:</span>
            <div className="font-medium text-charcoal">{(training_summary?.best_r2_score * 100)?.toFixed(1) || 0}% R²</div>
          </div>
          <div>
            <span className="text-charcoal/60">Cross-Validation:</span>
            <div className="font-medium text-charcoal">5-Fold CV</div>
          </div>
          <div>
            <span className="text-charcoal/60">Feature Count:</span>
            <div className="font-medium text-charcoal">{feature_importance?.length || 0}</div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={exportModel}
          className="bg-charcoal text-white px-6 py-3 rounded-lg hover:bg-charcoal/90 transition-colors"
        >
          Export Best Model
        </button>
        <button
          onClick={onContinue}
          className="bg-chestnut text-white px-6 py-3 rounded-lg hover:bg-chestnut/90 transition-colors"
        >
          Make Predictions
        </button>
      </div>
    </div>
  );

  const renderModelComparison = () => (
    <div className="space-y-6">
      {/* Model Comparison Chart */}
      {visualizations?.model_comparison && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-charcoal mb-4">Model Performance Comparison</h3>
          <Plot
            data={visualizations.model_comparison.data}
            layout={{
              ...visualizations.model_comparison.layout,
              autosize: true,
              margin: { l: 50, r: 50, t: 50, b: 100 }
            }}
            style={{ width: '100%', height: '400px' }}
            config={{ responsive: true, displayModeBar: false }}
          />
        </div>
      )}

      {/* Detailed Results Table */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-charcoal mb-4">Detailed Results</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 text-charcoal">Model</th>
                <th className="text-right py-2 text-charcoal">R² Score</th>
                <th className="text-right py-2 text-charcoal">RMSE</th>
                <th className="text-right py-2 text-charcoal">MAE</th>
                <th className="text-right py-2 text-charcoal">CV Mean</th>
                <th className="text-right py-2 text-charcoal">CV Std</th>
              </tr>
            </thead>
            <tbody>
              {comparison_data?.map((result, index) => (
                <tr key={result.Model} className={`border-b ${index === 0 ? 'bg-green-50' : ''}`}>
                  <td className="py-2 font-medium">
                    {result.Model.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    {index === 0 && <span className="ml-2 text-xs bg-green-500 text-white px-2 py-1 rounded">Best</span>}
                  </td>
                  <td className="text-right py-2">{result.test_r2?.toFixed(3)}</td>
                  <td className="text-right py-2">{result.test_rmse?.toFixed(3)}</td>
                  <td className="text-right py-2">{result.test_mae?.toFixed(3)}</td>
                  <td className="text-right py-2">{result.cv_mean?.toFixed(3)}</td>
                  <td className="text-right py-2">±{result.cv_std?.toFixed(3)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderFeatureImportance = () => (
    <div className="space-y-6">
      {feature_importance && feature_importance.length > 0 ? (
        <>
          {/* Feature Importance Chart */}
          {visualizations?.feature_importance && (
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-charcoal mb-4">Feature Importance</h3>
              <Plot
                data={visualizations.feature_importance.data}
                layout={{
                  ...visualizations.feature_importance.layout,
                  autosize: true,
                  margin: { l: 150, r: 50, t: 50, b: 50 }
                }}
                style={{ width: '100%', height: '500px' }}
                config={{ responsive: true, displayModeBar: false }}
              />
            </div>
          )}

          {/* Feature Importance Table */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-charcoal mb-4">Feature Rankings</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Rank</th>
                    <th className="text-left py-2">Feature</th>
                    <th className="text-right py-2">Importance</th>
                    <th className="text-right py-2">Relative %</th>
                  </tr>
                </thead>
                <tbody>
                  {feature_importance.slice(0, 15).map((feature, index) => {
                    const maxImportance = feature_importance[0]?.importance || 1;
                    const relativePercent = (feature.importance / maxImportance) * 100;
                    
                    return (
                      <tr key={feature.feature} className="border-b">
                        <td className="py-2 font-medium">#{index + 1}</td>
                        <td className="py-2">{feature.feature}</td>
                        <td className="text-right py-2">{feature.importance?.toFixed(4)}</td>
                        <td className="text-right py-2">
                          <div className="flex items-center justify-end">
                            <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                              <div 
                                className="bg-chestnut h-2 rounded-full" 
                                style={{ width: `${relativePercent}%` }}
                              ></div>
                            </div>
                            {relativePercent.toFixed(0)}%
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800">Feature importance is not available for the selected model type.</p>
        </div>
      )}
    </div>
  );

  const renderResidualAnalysis = () => (
    <div className="space-y-6">
      {visualizations?.residual_analysis && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-charcoal mb-4">Residual Analysis</h3>
          <Plot
            data={visualizations.residual_analysis.data}
            layout={{
              ...visualizations.residual_analysis.layout,
              autosize: true,
              margin: { l: 50, r: 50, t: 50, b: 50 }
            }}
            style={{ width: '100%', height: '600px' }}
            config={{ responsive: true, displayModeBar: false }}
          />
          
          <div className="mt-4 text-sm text-charcoal/70">
            <p><strong>Interpretation Guide:</strong></p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Residuals vs Predicted: Should show random scatter around zero</li>
              <li>Residual Distribution: Should be approximately normal</li>
              <li>Q-Q Plot: Points should follow the diagonal line for normal distribution</li>
              <li>Standardized Residuals: Most points should be within ±2 standard deviations</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-serif font-bold text-charcoal mb-2">
          Training Results
        </h2>
        <p className="text-charcoal/70">
          Comprehensive analysis of your trained regression models with performance metrics and visualizations.
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-chestnut text-chestnut'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'comparison' && renderModelComparison()}
        {activeTab === 'features' && renderFeatureImportance()}
        {activeTab === 'residuals' && renderResidualAnalysis()}
      </div>
    </div>
  );
};

export default ResultsVisualization;