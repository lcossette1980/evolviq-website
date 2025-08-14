import React, { useState } from 'react';
import { BarChart3, Target, TrendingUp, Eye } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, ScatterChart, Scatter, Cell } from 'recharts';
import StepContainer from '../shared/StepContainer';

const ResultsVisualization = ({ analysisResults, validationResults, onNext }) => {
  const [activeTab, setActiveTab] = useState('optimization');

  if (!analysisResults?.optimization_data && !analysisResults?.clustering_results) {
    return (
      <StepContainer
        title="Clustering Results"
        description="Comprehensive analysis of clustering performance"
        currentStep={5}
        totalSteps={5}
        canGoNext={false}
      >
        <div className="text-center py-8">
          <p className="text-charcoal/60">No clustering results available</p>
        </div>
      </StepContainer>
    );
  }

  const tabs = [
    { id: 'optimization', label: 'Cluster Optimization', icon: Target },
    { id: 'comparison', label: 'Algorithm Comparison', icon: BarChart3 },
    { id: 'visualization', label: 'Cluster Visualization', icon: Eye },
    { id: 'insights', label: 'Insights', icon: TrendingUp }
  ];

  // Mock data for demonstration
  const optimizationData = (analysisResults.optimization_data || []).filter(Boolean);
  const fallbackOptimization = [
    { k: 2, elbow: 1567, silhouette: 0.642, calinski: 158.2, davies: 0.821 },
    { k: 3, elbow: 956, silhouette: 0.731, calinski: 234.7, davies: 0.643 },
    { k: 4, elbow: 743, silhouette: 0.687, calinski: 201.3, davies: 0.754 },
    { k: 5, elbow: 612, silhouette: 0.625, calinski: 178.9, davies: 0.892 },
    { k: 6, elbow: 523, silhouette: 0.578, calinski: 156.4, davies: 0.967 },
    { k: 7, elbow: 467, silhouette: 0.534, calinski: 134.8, davies: 1.089 },
    { k: 8, elbow: 428, silhouette: 0.489, calinski: 121.6, davies: 1.234 }
  ];
  const optDataSafe = (optimizationData.length ? optimizationData : fallbackOptimization).map(d => ({
    k: Number(d.k ?? 0),
    elbow: Number(d.elbow ?? 0),
    silhouette: Number(d.silhouette ?? 0),
    calinski: Number(d.calinski ?? 0),
    davies: Number(d.davies ?? 0)
  }));

  const clusteringResultsRaw = analysisResults.clustering_results || [
    { algorithm: 'K-Means', silhouette: 0.731, calinski: 234.7, davies: 0.643, n_clusters: 3, n_noise: 0 },
    { algorithm: 'Hierarchical', silhouette: 0.702, calinski: 198.6, davies: 0.723, n_clusters: 3, n_noise: 0 },
    { algorithm: 'DBSCAN', silhouette: 0.645, calinski: 167.8, davies: 0.834, n_clusters: 4, n_noise: 12 },
    { algorithm: 'Gaussian Mixture', silhouette: 0.718, calinski: 221.4, davies: 0.667, n_clusters: 3, n_noise: 0 }
  ];
  const clusteringResults = clusteringResultsRaw.map(r => ({
    algorithm: r.algorithm || r.name || 'Unknown',
    silhouette: Number(r.silhouette ?? r?.evaluation?.silhouette_score ?? 0),
    calinski: Number(r.calinski ?? r?.evaluation?.calinski_harabasz_score ?? 0),
    davies: Number(r.davies ?? r?.evaluation?.davies_bouldin_score ?? 0),
    n_clusters: Number(r.n_clusters ?? 0),
    n_noise: Number(r.n_noise ?? r?.evaluation?.n_noise_points ?? 0)
  }));

  // Mock cluster visualization data
  const clusterVisualizationData = analysisResults.visualization_data || [
    { x: 2.1, y: 1.5, cluster: 0, size: 45 },
    { x: -1.2, y: 2.3, cluster: 1, size: 38 },
    { x: 1.8, y: -1.1, cluster: 2, size: 42 },
    { x: 2.5, y: 1.8, cluster: 0, size: 45 },
    { x: -1.5, y: 2.1, cluster: 1, size: 38 },
    { x: 1.5, y: -0.8, cluster: 2, size: 42 },
    { x: 2.3, y: 1.2, cluster: 0, size: 45 },
    { x: -0.9, y: 2.5, cluster: 1, size: 38 },
    { x: 1.9, y: -1.3, cluster: 2, size: 42 }
  ];

  const bestOpt = optDataSafe.length
    ? optDataSafe.reduce((best, current) => (current.silhouette > best.silhouette ? current : best))
    : { k: 0, silhouette: 0 };
  const bestK = Number(bestOpt.k ?? 0);

  const bestAlgorithm = clusteringResults[0] || { algorithm: 'Unknown', silhouette: 0, calinski: 0, davies: 0, n_clusters: 0, n_noise: 0 };

  const COLORS = ['#8B4513', '#A59E8C', '#D4B08A', '#E8C6A0', '#F2E2C7'];

  const renderOptimizationTab = () => (
    <div className="space-y-6">
      {/* Optimal K Summary */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="font-semibold text-charcoal mb-4">Optimal Cluster Number</h3>
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="text-3xl font-bold text-green-800 mb-1">{bestK}</div>
            <div className="text-sm text-green-600">Recommended Clusters</div>
            <div className="text-xs text-green-500 mt-1">Based on Silhouette Score</div>
          </div>
          <div className="text-center p-4 bg-bone rounded-lg">
            <div className="text-2xl font-bold text-chestnut mb-1">
              {Number((optDataSafe.find(d => d.k === bestK) || {}).silhouette ?? 0).toFixed(3)}
            </div>
            <div className="text-sm text-charcoal/60">Silhouette Score</div>
          </div>
          <div className="text-center p-4 bg-bone rounded-lg">
            <div className="text-2xl font-bold text-chestnut mb-1">
              {Number((optDataSafe.find(d => d.k === bestK) || {}).calinski ?? 0).toFixed(1)}
            </div>
            <div className="text-sm text-charcoal/60">Calinski-Harabasz</div>
          </div>
        </div>
      </div>

      {/* Elbow Method */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="font-semibold text-charcoal mb-4">Elbow Method (WCSS)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={optimizationData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#A59E8C" />
            <XAxis dataKey="k" tick={{ fill: '#2A2A2A', fontSize: 12 }} />
            <YAxis tick={{ fill: '#2A2A2A', fontSize: 12 }} />
            <Tooltip 
              formatter={(value, name) => [Number(value ?? 0).toFixed(0), 'WCSS']}
              labelFormatter={(label) => `k = ${label}`}
            />
            <Line 
              type="monotone" 
              dataKey="elbow" 
              stroke="#8B4513" 
              strokeWidth={3}
              dot={{ fill: '#8B4513', strokeWidth: 2, r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Silhouette Analysis */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="font-semibold text-charcoal mb-4">Silhouette Analysis</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={optimizationData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#A59E8C" />
            <XAxis dataKey="k" tick={{ fill: '#2A2A2A', fontSize: 12 }} />
            <YAxis tick={{ fill: '#2A2A2A', fontSize: 12 }} domain={[0, 1]} />
            <Tooltip 
              formatter={(value) => [Number(value ?? 0).toFixed(3), 'Silhouette Score']}
              labelFormatter={(label) => `k = ${label}`}
            />
            <Bar dataKey="silhouette" fill="#8B4513">
              {optimizationData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.k === bestK ? '#A44A3F' : '#8B4513'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderComparisonTab = () => (
    <div className="space-y-6">
      {/* Algorithm Comparison Table */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="font-semibold text-charcoal mb-4">Algorithm Performance Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold text-charcoal">Algorithm</th>
                <th className="text-center py-3 px-4 font-semibold text-charcoal">Silhouette</th>
                <th className="text-center py-3 px-4 font-semibold text-charcoal">Calinski-Harabasz</th>
                <th className="text-center py-3 px-4 font-semibold text-charcoal">Davies-Bouldin</th>
                <th className="text-center py-3 px-4 font-semibold text-charcoal">Clusters</th>
                <th className="text-center py-3 px-4 font-semibold text-charcoal">Noise Points</th>
              </tr>
            </thead>
            <tbody>
              {clusteringResults.map((result, idx) => (
                <tr key={idx} className={`border-b ${idx === 0 ? 'bg-green-50' : 'hover:bg-bone'}`}>
                  <td className="py-3 px-4 font-medium">
                    {result.algorithm}
                    {idx === 0 && <span className="ml-2 text-xs bg-green-600 text-white px-2 py-1 rounded">Best</span>}
                  </td>
                  <td className="py-3 px-4 text-center">{Number(result.silhouette ?? 0).toFixed(3)}</td>
                  <td className="py-3 px-4 text-center">{Number(result.calinski ?? 0).toFixed(1)}</td>
                  <td className="py-3 px-4 text-center">{Number(result.davies ?? 0).toFixed(3)}</td>
                  <td className="py-3 px-4 text-center">{result.n_clusters}</td>
                  <td className="py-3 px-4 text-center">{result.n_noise}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Metrics Chart */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="font-semibold text-charcoal mb-4">Algorithm Performance Metrics</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={clusteringResults}>
            <CartesianGrid strokeDasharray="3 3" stroke="#A59E8C" />
            <XAxis 
              dataKey="algorithm" 
              tick={{ fill: '#2A2A2A', fontSize: 10 }} 
              angle={-45} 
              textAnchor="end" 
              height={100}
            />
            <YAxis tick={{ fill: '#2A2A2A', fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="silhouette" fill="#8B4513" name="Silhouette Score" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderVisualizationTab = () => (
    <div className="space-y-6">
      {/* Cluster Scatter Plot */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="font-semibold text-charcoal mb-4">
          Cluster Visualization (PCA Projection) - {bestAlgorithm?.algorithm}
        </h3>
        <ResponsiveContainer width="100%" height={400}>
          <ScatterChart data={clusterVisualizationData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#A59E8C" />
            <XAxis 
              type="number" 
              dataKey="x" 
              name="PC1" 
              tick={{ fill: '#2A2A2A', fontSize: 12 }}
              label={{ value: 'Principal Component 1', position: 'insideBottom', offset: -10 }}
            />
            <YAxis 
              type="number" 
              dataKey="y" 
              name="PC2" 
              tick={{ fill: '#2A2A2A', fontSize: 12 }}
              label={{ value: 'Principal Component 2', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              cursor={{ strokeDasharray: '3 3' }}
              formatter={(value, name) => [Number(value ?? 0).toFixed(2), name === 'x' ? 'PC1' : 'PC2']}
              labelFormatter={() => 'Data Point'}
            />
            <Scatter dataKey="y" fill="#8B4513">
              {clusterVisualizationData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[entry.cluster % COLORS.length]} />
              ))}
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      {/* Cluster Sizes */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="font-semibold text-charcoal mb-4">Cluster Distribution</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {[0, 1, 2].map(clusterId => {
            const clusterPoints = clusterVisualizationData.filter(d => d.cluster === clusterId);
            const clusterSize = clusterPoints[0]?.size || 0;
            
            return (
              <div key={clusterId} className="text-center p-4 bg-bone rounded-lg">
                <div 
                  className="w-4 h-4 rounded-full mx-auto mb-2"
                  style={{ backgroundColor: COLORS[clusterId] }}
                ></div>
                <div className="text-xl font-bold text-chestnut">{clusterSize}</div>
                <div className="text-sm text-charcoal/60">Cluster {clusterId + 1}</div>
                <div className="text-xs text-charcoal/50">
                  {((clusterSize / validationResults?.summary?.shape?.[0] * 100) || 0).toFixed(1)}% of data
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderInsightsTab = () => (
    <div className="space-y-6">
      {/* Best Algorithm Highlight */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="font-semibold text-charcoal mb-4">Best Performing Algorithm</h3>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-lg font-bold text-green-800">{bestAlgorithm?.algorithm}</h4>
            <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
              Best
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="font-bold text-green-700">{Number(bestAlgorithm?.silhouette ?? 0).toFixed(3)}</div>
              <div className="text-green-600">Silhouette Score</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-green-700">{Number(bestAlgorithm?.calinski ?? 0).toFixed(1)}</div>
              <div className="text-green-600">Calinski-Harabasz</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-green-700">{Number(bestAlgorithm?.davies ?? 0).toFixed(3)}</div>
              <div className="text-green-600">Davies-Bouldin</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-green-700">{bestAlgorithm?.n_clusters}</div>
              <div className="text-green-600">Clusters Found</div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Insights */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="font-semibold text-charcoal mb-4">Key Insights</h3>
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">Optimal Clustering</h4>
            <p className="text-green-700 text-sm">
              Analysis suggests {bestK} clusters provide the best separation with a Silhouette score of {Number((optDataSafe.find(d => d.k === bestK) || {}).silhouette ?? 0).toFixed(3)}.
              {bestAlgorithm?.algorithm} algorithm performs best for this dataset.
            </p>
          </div>
          
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Data Structure</h4>
            <p className="text-blue-700 text-sm">
              The data shows clear cluster separation, suggesting natural groupings exist. 
              {bestAlgorithm?.n_noise > 0 ? 
                `${bestAlgorithm.n_noise} noise points were identified, indicating some outliers.` :
                'No noise points detected, indicating clean cluster boundaries.'
              }
            </p>
          </div>
          
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-medium text-yellow-800 mb-2">Business Applications</h4>
            <p className="text-yellow-700 text-sm">
              These clusters can be used for customer segmentation, market analysis, or feature engineering. 
              Each cluster represents a distinct group with unique characteristics worth investigating further.
            </p>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="font-semibold text-charcoal mb-4">Recommendations</h3>
        <div className="space-y-3">
          <div className="flex items-start gap-3 p-3 bg-bone rounded-lg">
            <div className="w-2 h-2 bg-chestnut rounded-full mt-2"></div>
            <div>
              <div className="font-medium text-charcoal">Use {bestAlgorithm?.algorithm} for production</div>
              <div className="text-sm text-charcoal/70">
                This algorithm provided the best clustering quality for your dataset
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-bone rounded-lg">
            <div className="w-2 h-2 bg-chestnut rounded-full mt-2"></div>
            <div>
              <div className="font-medium text-charcoal">Focus on {bestK}-cluster solution</div>
              <div className="text-sm text-charcoal/70">
                This provides optimal balance between simplicity and cluster quality
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-bone rounded-lg">
            <div className="w-2 h-2 bg-chestnut rounded-full mt-2"></div>
            <div>
              <div className="font-medium text-charcoal">Investigate cluster characteristics</div>
              <div className="text-sm text-charcoal/70">
                Analyze feature distributions within each cluster for business insights
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'optimization':
        return renderOptimizationTab();
      case 'comparison':
        return renderComparisonTab();
      case 'visualization':
        return renderVisualizationTab();
      case 'insights':
        return renderInsightsTab();
      default:
        return null;
    }
  };

  return (
    <StepContainer
      title="Clustering Results"
      description="Comprehensive analysis of clustering performance and insights"
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
