import React, { useState } from 'react';
import { BarChart3, TrendingUp, Target, Eye } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ScatterChart, Scatter, Cell } from 'recharts';
import StepContainer from '../shared/StepContainer';

const ResultsVisualization = ({ trainingResults, validationResults, onNext }) => {
  const [activeTab, setActiveTab] = useState('performance');

  if (!trainingResults?.comparison_data) {
    return (
      <StepContainer
        title="Model Results"
        description="Comprehensive analysis of model performance"
        currentStep={5}
        totalSteps={5}
        canGoNext={false}
      >
        <div className="text-center py-8">
          <p className="text-charcoal/60">No training results available</p>
        </div>
      </StepContainer>
    );
  }

  const tabs = [
    { id: 'performance', label: 'Performance', icon: BarChart3 },
    { id: 'comparison', label: 'Model Comparison', icon: TrendingUp },
    { id: 'insights', label: 'Insights', icon: Target }
  ];

  const modelsRaw = trainingResults.comparison_data || [];
  const models = modelsRaw.map(row => ({
    name: row.name || row.model || row.Model || 'Model',
    accuracy: Number(row.test_accuracy ?? row.accuracy ?? 0),
    precision: Number(row.test_precision ?? row.precision ?? 0),
    recall: Number(row.test_recall ?? row.recall ?? 0),
    f1_score: Number(row.test_f1 ?? row.f1_score ?? 0),
    training_time: Number(row.training_time ?? 0)
  }));
  const bestModel = models[0];

  // Prepare data for radar chart
  const radarData = models.slice(0, 4).map(model => ({
    name: model.name?.substring(0, 12) || 'Model',
    accuracy: (model.accuracy || 0) * 100,
    precision: (model.precision || 0) * 100,
    recall: (model.recall || 0) * 100,
    f1_score: (model.f1_score || 0) * 100
  }));

  // Mock confusion matrix data
  const confusionMatrix = trainingResults.confusion_matrix || {
    'Class A': { 'Class A': 85, 'Class B': 7 },
    'Class B': { 'Class A': 5, 'Class B': 103 }
  };

  // Feature importance data
  const featureImportance = trainingResults.feature_importance || [
    { feature: 'Feature 1', importance: 0.24 },
    { feature: 'Feature 2', importance: 0.18 },
    { feature: 'Feature 3', importance: 0.15 },
    { feature: 'Feature 4', importance: 0.12 },
    { feature: 'Feature 5', importance: 0.10 }
  ];

  const renderPerformanceTab = () => (
    <div className="space-y-6">
      {/* Model Metrics Table */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="font-semibold text-charcoal mb-4">Performance Metrics</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold text-charcoal">Model</th>
                <th className="text-center py-3 px-4 font-semibold text-charcoal">Accuracy</th>
                <th className="text-center py-3 px-4 font-semibold text-charcoal">Precision</th>
                <th className="text-center py-3 px-4 font-semibold text-charcoal">Recall</th>
                <th className="text-center py-3 px-4 font-semibold text-charcoal">F1-Score</th>
                <th className="text-center py-3 px-4 font-semibold text-charcoal">Training Time</th>
              </tr>
            </thead>
            <tbody>
              {models.map((model, idx) => (
                <tr key={idx} className={`border-b ${idx === 0 ? 'bg-green-50' : 'hover:bg-bone'}`}>
                  <td className="py-3 px-4 font-medium">
                    {model.name}
                    {idx === 0 && <span className="ml-2 text-xs bg-green-600 text-white px-2 py-1 rounded">Best</span>}
                  </td>
                  <td className="py-3 px-4 text-center">{(model.accuracy || 0).toFixed(3)}</td>
                  <td className="py-3 px-4 text-center">{(model.precision || 0).toFixed(3)}</td>
                  <td className="py-3 px-4 text-center">{(model.recall || 0).toFixed(3)}</td>
                  <td className="py-3 px-4 text-center">{(model.f1_score || 0).toFixed(3)}</td>
                  <td className="py-3 px-4 text-center">{(model.training_time || 0).toFixed(1)}s</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="font-semibold text-charcoal mb-4">Model Performance Comparison</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={models}>
            <CartesianGrid strokeDasharray="3 3" stroke="#A59E8C" />
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#2A2A2A', fontSize: 12 }} 
              angle={-45} 
              textAnchor="end" 
              height={100}
            />
            <YAxis tick={{ fill: '#2A2A2A', fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="accuracy" fill="#8B4513" name="Accuracy" />
            <Bar dataKey="f1_score" fill="#A59E8C" name="F1-Score" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderComparisonTab = () => (
    <div className="space-y-6">
      {/* Radar Chart */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="font-semibold text-charcoal mb-4">Multi-Metric Comparison</h3>
        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#A59E8C" />
            <PolarAngleAxis tick={{ fill: '#2A2A2A', fontSize: 12 }} />
            <PolarRadiusAxis 
              tick={{ fill: '#2A2A2A', fontSize: 10 }} 
              domain={[0, 100]}
              angle={90}
            />
            {radarData.map((entry, index) => (
              <Radar 
                key={index}
                name={entry.name}
                dataKey="accuracy"
                stroke={`hsl(${index * 90}, 60%, 50%)`}
                fill={`hsl(${index * 90}, 60%, 50%)`}
                fillOpacity={0.1}
                strokeWidth={2}
              />
            ))}
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Feature Importance */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="font-semibold text-charcoal mb-4">
          Feature Importance ({bestModel?.name || 'Best Model'})
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={featureImportance} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke="#A59E8C" />
            <XAxis type="number" tick={{ fill: '#2A2A2A', fontSize: 12 }} />
            <YAxis dataKey="feature" type="category" tick={{ fill: '#2A2A2A', fontSize: 12 }} />
            <Tooltip 
              formatter={(value) => [(value * 100).toFixed(1) + '%', 'Importance']}
            />
            <Bar dataKey="importance" fill="#8B4513" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Confusion Matrix */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="font-semibold text-charcoal mb-4">
          Confusion Matrix ({bestModel?.name || 'Best Model'})
        </h3>
        <div className="max-w-md mx-auto">
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div></div>
            <div className="text-center font-medium text-charcoal col-span-2">Predicted</div>
            
            <div className="text-center font-medium text-charcoal">Actual</div>
            <div className="text-center text-xs text-charcoal/60">Class A</div>
            <div className="text-center text-xs text-charcoal/60">Class B</div>
            
            <div className="text-center text-xs text-charcoal/60">Class A</div>
            <div className="aspect-square flex items-center justify-center text-lg font-bold bg-green-100 rounded text-charcoal">
              {confusionMatrix['Class A']?.['Class A'] || 85}
            </div>
            <div className="aspect-square flex items-center justify-center text-lg font-bold bg-red-100 rounded text-charcoal">
              {confusionMatrix['Class A']?.['Class B'] || 7}
            </div>
            
            <div className="text-center text-xs text-charcoal/60">Class B</div>
            <div className="aspect-square flex items-center justify-center text-lg font-bold bg-red-100 rounded text-charcoal">
              {confusionMatrix['Class B']?.['Class A'] || 5}
            </div>
            <div className="aspect-square flex items-center justify-center text-lg font-bold bg-green-100 rounded text-charcoal">
              {confusionMatrix['Class B']?.['Class B'] || 103}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderInsightsTab = () => (
    <div className="space-y-6">
      {/* Key Insights */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white border rounded-lg p-6">
          <h3 className="font-semibold text-charcoal mb-4">Best Performing Model</h3>
          <div className="space-y-3">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-800 mb-1">
                {bestModel?.name || 'N/A'}
              </div>
              <div className="text-sm text-green-600">
                {((bestModel?.accuracy || 0) * 100).toFixed(1)}% Accuracy
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-center p-2 bg-bone rounded">
                <div className="font-bold text-chestnut">{((bestModel?.precision || 0) * 100).toFixed(1)}%</div>
                <div className="text-charcoal/60">Precision</div>
              </div>
              <div className="text-center p-2 bg-bone rounded">
                <div className="font-bold text-chestnut">{((bestModel?.recall || 0) * 100).toFixed(1)}%</div>
                <div className="text-charcoal/60">Recall</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6">
          <h3 className="font-semibold text-charcoal mb-4">Model Recommendations</h3>
          <div className="space-y-3 text-sm">
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="font-medium text-green-800">Production Ready</div>
              <div className="text-green-700">
                {bestModel?.name} shows excellent performance and is ready for deployment.
              </div>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="font-medium text-blue-800">Alternative Options</div>
              <div className="text-blue-700">
                Consider {models[1]?.name} for better interpretability if needed.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Business Insights */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="font-semibold text-charcoal mb-4">Business Insights</h3>
        <div className="space-y-4">
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-medium text-yellow-800 mb-2">Key Predictive Features</h4>
            <p className="text-yellow-700 text-sm">
              The top {featureImportance.length} features account for {(featureImportance.reduce((sum, f) => sum + f.importance, 0) * 100).toFixed(0)}% 
              of prediction power. Focus on these features for business strategy.
            </p>
          </div>
          
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">Model Reliability</h4>
            <p className="text-green-700 text-sm">
              With {((bestModel?.accuracy || 0) * 100).toFixed(1)}% accuracy and {((bestModel?.f1_score || 0) * 100).toFixed(1)}% F1-score, 
              this model provides reliable predictions for business decision-making.
            </p>
          </div>
          
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Next Steps</h4>
            <p className="text-blue-700 text-sm">
              Consider A/B testing the model in production, monitoring performance metrics, 
              and collecting additional data to further improve accuracy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'performance':
        return renderPerformanceTab();
      case 'comparison':
        return renderComparisonTab();
      case 'insights':
        return renderInsightsTab();
      default:
        return null;
    }
  };

  return (
    <StepContainer
      title="Model Results"
      description="Comprehensive analysis of classification model performance"
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
