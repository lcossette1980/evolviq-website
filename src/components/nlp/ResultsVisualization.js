import React, { useState } from 'react';
import { MessageCircle, BarChart3, TrendingUp, Hash, Smile, Brain } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, LineChart, Line, ScatterChart, Scatter } from 'recharts';
import StepContainer from '../shared/StepContainer';

const ResultsVisualization = ({ analysisResults, validationResults, onNext }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!analysisResults) {
    return (
      <StepContainer
        title="NLP Analysis Results"
        description="Comprehensive natural language processing results and insights"
        currentStep={5}
        totalSteps={5}
        canGoNext={false}
      >
        <div className="text-center py-8">
          <p className="text-charcoal/60">No NLP results available</p>
        </div>
      </StepContainer>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'sentiment', label: 'Sentiment', icon: Smile },
    { id: 'keywords', label: 'Keywords', icon: Hash },
    { id: 'insights', label: 'Insights', icon: Brain }
  ];

  // Mock data for demonstration
  const textStats = analysisResults.text_stats || {
    total_texts: 1000,
    avg_words_per_text: 24.5,
    avg_chars_per_text: 142.3,
    unique_words: 5420,
    languages: { 'en': 85, 'es': 10, 'fr': 3, 'other': 2 }
  };

  const sentimentResults = analysisResults.sentiment_analysis || [
    { method: 'VADER', positive: 45, negative: 25, neutral: 30 },
    { method: 'TextBlob', positive: 42, negative: 28, neutral: 30 },
    { method: 'ML Model', positive: 48, negative: 23, neutral: 29 }
  ];

  const keywordResults = analysisResults.keyword_extraction || [
    { word: 'excellent', tfidf: 0.234, frequency: 156 },
    { word: 'delicious', tfidf: 0.221, frequency: 143 },
    { word: 'amazing', tfidf: 0.198, frequency: 134 },
    { word: 'terrible', tfidf: 0.187, frequency: 89 },
    { word: 'outstanding', tfidf: 0.176, frequency: 78 },
    { word: 'disappointing', tfidf: 0.165, frequency: 67 },
    { word: 'wonderful', tfidf: 0.154, frequency: 92 },
    { word: 'horrible', tfidf: 0.143, frequency: 54 }
  ];

  const topicResults = analysisResults.topic_modeling || [
    { topic: 'Topic 0', words: ['food', 'delicious', 'restaurant', 'taste', 'meal'], weight: 0.25 },
    { topic: 'Topic 1', words: ['service', 'staff', 'friendly', 'quick', 'helpful'], weight: 0.22 },
    { topic: 'Topic 2', words: ['price', 'expensive', 'value', 'money', 'cost'], weight: 0.20 },
    { topic: 'Topic 3', words: ['ambiance', 'atmosphere', 'music', 'lighting', 'decor'], weight: 0.18 },
    { topic: 'Topic 4', words: ['location', 'parking', 'accessible', 'convenient', 'area'], weight: 0.15 }
  ];

  const classificationResults = analysisResults.text_classification || [
    { model: 'Naive Bayes', accuracy: 0.847, precision: 0.851, recall: 0.847, f1: 0.849 },
    { model: 'SVM', accuracy: 0.923, precision: 0.925, recall: 0.923, f1: 0.924 },
    { model: 'Logistic Regression', accuracy: 0.891, precision: 0.894, recall: 0.891, f1: 0.893 },
    { model: 'Random Forest', accuracy: 0.876, precision: 0.879, recall: 0.876, f1: 0.877 }
  ];

  const COLORS = ['#8B4513', '#A59E8C', '#D4B08A', '#E8C6A0', '#F2E2C7'];

  const renderOverviewTab = () => (
    <div className="space-y-6">
      {/* Text Statistics */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="font-semibold text-charcoal mb-4">Text Dataset Statistics</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-bone rounded-lg">
            <div className="text-2xl font-bold text-chestnut">{textStats.total_texts?.toLocaleString()}</div>
            <div className="text-sm text-charcoal/70">Total Texts</div>
          </div>
          <div className="text-center p-4 bg-bone rounded-lg">
            <div className="text-2xl font-bold text-chestnut">{textStats.avg_words_per_text?.toFixed(1)}</div>
            <div className="text-sm text-charcoal/70">Avg Words/Text</div>
          </div>
          <div className="text-center p-4 bg-bone rounded-lg">
            <div className="text-2xl font-bold text-chestnut">{textStats.avg_chars_per_text?.toFixed(0)}</div>
            <div className="text-sm text-charcoal/70">Avg Characters</div>
          </div>
          <div className="text-center p-4 bg-bone rounded-lg">
            <div className="text-2xl font-bold text-chestnut">{textStats.unique_words?.toLocaleString()}</div>
            <div className="text-sm text-charcoal/70">Unique Words</div>
          </div>
        </div>
      </div>

      {/* Language Distribution */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="font-semibold text-charcoal mb-4">Language Distribution</h3>
        <div className="flex justify-center">
          <ResponsiveContainer width={400} height={300}>
            <PieChart>
              <Pie
                data={Object.entries(textStats.languages || {}).map(([lang, percentage]) => ({ 
                  name: lang.toUpperCase(), 
                  value: percentage 
                }))}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8B4513"
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}%`}
              >
                {Object.entries(textStats.languages || {}).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value}%`, 'Percentage']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Classification Results (if available) */}
      {classificationResults.length > 0 && (
        <div className="bg-white border rounded-lg p-6">
          <h3 className="font-semibold text-charcoal mb-4">Text Classification Performance</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-charcoal">Model</th>
                  <th className="text-center py-3 px-4 font-semibold text-charcoal">Accuracy</th>
                  <th className="text-center py-3 px-4 font-semibold text-charcoal">Precision</th>
                  <th className="text-center py-3 px-4 font-semibold text-charcoal">Recall</th>
                  <th className="text-center py-3 px-4 font-semibold text-charcoal">F1-Score</th>
                </tr>
              </thead>
              <tbody>
                {classificationResults.map((result, idx) => (
                  <tr key={idx} className={`border-b ${idx === 0 ? 'bg-green-50' : 'hover:bg-bone'}`}>
                    <td className="py-3 px-4 font-medium">
                      {result.model}
                      {idx === 0 && <span className="ml-2 text-xs bg-green-600 text-white px-2 py-1 rounded">Best</span>}
                    </td>
                    <td className="py-3 px-4 text-center">{(result.accuracy * 100).toFixed(1)}%</td>
                    <td className="py-3 px-4 text-center">{(result.precision * 100).toFixed(1)}%</td>
                    <td className="py-3 px-4 text-center">{(result.recall * 100).toFixed(1)}%</td>
                    <td className="py-3 px-4 text-center">{(result.f1 * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );

  const renderSentimentTab = () => (
    <div className="space-y-6">
      {/* Sentiment Distribution */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="font-semibold text-charcoal mb-4">Sentiment Analysis Results</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={sentimentResults}>
            <CartesianGrid strokeDasharray="3 3" stroke="#A59E8C" />
            <XAxis dataKey="method" tick={{ fill: '#2A2A2A', fontSize: 12 }} />
            <YAxis tick={{ fill: '#2A2A2A', fontSize: 12 }} />
            <Tooltip />
            <Bar dataKey="positive" stackId="a" fill="#22C55E" name="Positive" />
            <Bar dataKey="neutral" stackId="a" fill="#A59E8C" name="Neutral" />
            <Bar dataKey="negative" stackId="a" fill="#EF4444" name="Negative" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Sentiment Summary */}
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-6 text-center">
          <div className="text-3xl mb-2">😊</div>
          <div className="text-2xl font-bold text-green-800">
            {Math.round(sentimentResults.reduce((sum, r) => sum + r.positive, 0) / sentimentResults.length)}%
          </div>
          <div className="text-green-600">Positive Sentiment</div>
        </div>
        
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
          <div className="text-3xl mb-2">😐</div>
          <div className="text-2xl font-bold text-gray-800">
            {Math.round(sentimentResults.reduce((sum, r) => sum + r.neutral, 0) / sentimentResults.length)}%
          </div>
          <div className="text-gray-600">Neutral Sentiment</div>
        </div>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-3xl mb-2">😟</div>
          <div className="text-2xl font-bold text-red-800">
            {Math.round(sentimentResults.reduce((sum, r) => sum + r.negative, 0) / sentimentResults.length)}%
          </div>
          <div className="text-red-600">Negative Sentiment</div>
        </div>
      </div>

      {/* Sentiment Insights */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="font-semibold text-charcoal mb-4">Sentiment Insights</h3>
        <div className="space-y-3">
          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="font-medium text-green-800">Overall Positive Tone</div>
            <div className="text-sm text-green-700">
              The majority of texts show positive sentiment, indicating favorable reception or experience.
            </div>
          </div>
          
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="font-medium text-blue-800">Consistent Across Methods</div>
            <div className="text-sm text-blue-700">
              Different sentiment analysis methods show similar patterns, indicating reliable results.
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderKeywordsTab = () => (
    <div className="space-y-6">
      {/* Top Keywords */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="font-semibold text-charcoal mb-4">Top Keywords by TF-IDF Score</h3>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={keywordResults.slice(0, 8)} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" stroke="#A59E8C" />
            <XAxis type="number" tick={{ fill: '#2A2A2A', fontSize: 12 }} />
            <YAxis dataKey="word" type="category" tick={{ fill: '#2A2A2A', fontSize: 12 }} />
            <Tooltip 
              formatter={(value, name) => [value.toFixed(3), 'TF-IDF Score']}
            />
            <Bar dataKey="tfidf" fill="#8B4513" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Keyword Details */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="font-semibold text-charcoal mb-4">Keyword Analysis</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {keywordResults.slice(0, 6).map((keyword, idx) => (
            <div key={idx} className="p-4 bg-bone rounded-lg border">
              <div className="font-semibold text-charcoal text-lg">{keyword.word}</div>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-charcoal/70">TF-IDF:</span>
                  <span className="font-medium">{keyword.tfidf.toFixed(3)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal/70">Frequency:</span>
                  <span className="font-medium">{keyword.frequency}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Topic Modeling Results */}
      {topicResults.length > 0 && (
        <div className="bg-white border rounded-lg p-6">
          <h3 className="font-semibold text-charcoal mb-4">Discovered Topics</h3>
          <div className="space-y-4">
            {topicResults.map((topic, idx) => (
              <div key={idx} className="p-4 bg-bone rounded-lg border">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-semibold text-charcoal">{topic.topic}</h4>
                  <span className="text-sm bg-chestnut text-white px-3 py-1 rounded-full">
                    {(topic.weight * 100).toFixed(0)}%
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {topic.words.map((word, wordIdx) => (
                    <span key={wordIdx} className="px-2 py-1 bg-white border rounded text-sm">
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderInsightsTab = () => (
    <div className="space-y-6">
      {/* Key Insights */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="font-semibold text-charcoal mb-4">Key Insights</h3>
        <div className="space-y-4">
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h4 className="font-medium text-green-800 mb-2">Content Quality</h4>
            <p className="text-green-700 text-sm">
              The text data shows high quality with an average of {textStats.avg_words_per_text?.toFixed(1)} words per document, 
              indicating substantial content for meaningful analysis.
            </p>
          </div>
          
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-800 mb-2">Sentiment Pattern</h4>
            <p className="text-blue-700 text-sm">
              Strong positive sentiment bias suggests the content represents satisfied customers, 
              positive reviews, or favorable feedback scenarios.
            </p>
          </div>
          
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="font-medium text-yellow-800 mb-2">Vocabulary Richness</h4>
            <p className="text-yellow-700 text-sm">
              With {textStats.unique_words?.toLocaleString()} unique words across {textStats.total_texts?.toLocaleString()} documents, 
              the vocabulary diversity indicates rich, varied content suitable for detailed analysis.
            </p>
          </div>
        </div>
      </div>

      {/* Business Applications */}
      <div className="bg-white border rounded-lg p-6">
        <h3 className="font-semibold text-charcoal mb-4">Business Applications</h3>
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-charcoal mb-3">Customer Insights</h4>
            <ul className="space-y-2 text-sm text-charcoal/70">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-chestnut rounded-full mt-2"></div>
                Monitor customer satisfaction trends
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-chestnut rounded-full mt-2"></div>
                Identify common pain points and praise
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-chestnut rounded-full mt-2"></div>
                Track sentiment changes over time
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-chestnut rounded-full mt-2"></div>
                Prioritize product improvement areas
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-charcoal mb-3">Strategic Actions</h4>
            <ul className="space-y-2 text-sm text-charcoal/70">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-chestnut rounded-full mt-2"></div>
                Develop targeted marketing messages
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-chestnut rounded-full mt-2"></div>
                Create automated response systems
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-chestnut rounded-full mt-2"></div>
                Enhance customer service protocols
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-chestnut rounded-full mt-2"></div>
                Guide content creation strategies
              </li>
            </ul>
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
              <div className="font-medium text-charcoal">Monitor Sentiment Trends</div>
              <div className="text-sm text-charcoal/70">
                Set up regular sentiment monitoring to track changes in customer perception
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-bone rounded-lg">
            <div className="w-2 h-2 bg-chestnut rounded-full mt-2"></div>
            <div>
              <div className="font-medium text-charcoal">Leverage Positive Keywords</div>
              <div className="text-sm text-charcoal/70">
                Use frequently mentioned positive terms in marketing and communication
              </div>
            </div>
          </div>
          
          <div className="flex items-start gap-3 p-3 bg-bone rounded-lg">
            <div className="w-2 h-2 bg-chestnut rounded-full mt-2"></div>
            <div>
              <div className="font-medium text-charcoal">Address Negative Themes</div>
              <div className="text-sm text-charcoal/70">
                Focus on improving areas highlighted by negative sentiment patterns
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'sentiment':
        return renderSentimentTab();
      case 'keywords':
        return renderKeywordsTab();
      case 'insights':
        return renderInsightsTab();
      default:
        return null;
    }
  };

  return (
    <StepContainer
      title="NLP Analysis Results"
      description="Comprehensive natural language processing results and insights"
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