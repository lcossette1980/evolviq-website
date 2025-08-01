import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LineChart, 
  Brain, 
  Network, 
  MessageSquare, 
  BarChart3,
  TrendingUp,
  GitBranch,
  FileText,
  Star,
  Clock,
  Users
} from 'lucide-react';
import { colors } from '../../../utils/colors';

/**
 * Interactive Tools Tab Component
 * Displays available ML/AI tools and analytics
 */
const InteractiveToolsTab = () => {
  const navigate = useNavigate();
  const [hoveredTool, setHoveredTool] = useState(null);

  const tools = [
    {
      id: 'linear-regression',
      title: 'Linear Regression Analysis',
      description: 'Build predictive models with regression analysis',
      detailedDescription: 'Master predictive analytics with our comprehensive linear regression tool. Upload your data, visualize relationships, build models, and generate actionable insights. Perfect for sales forecasting, trend analysis, and business predictions.',
      features: ['Data visualization', 'Model training', 'Performance metrics', 'Residual analysis', 'Export predictions'],
      path: '/tools/linear-regression',
      icon: TrendingUp,
      color: colors.chestnut,
      category: 'Predictive Analytics',
      image: '/images/resources/lin-reg.jpg',
      difficulty: 'Intermediate',
      timeEstimate: '15-30 mins'
    },
    {
      id: 'eda-explorer',
      title: 'Exploratory Data Analysis',
      description: 'Discover insights and patterns in your data',
      detailedDescription: 'Uncover hidden patterns and insights in your data with our intuitive EDA tool. Get automated statistical summaries, interactive visualizations, and data quality assessments. The perfect starting point for any data project.',
      features: ['Automated insights', 'Interactive charts', 'Statistical summaries', 'Data quality report', 'Correlation analysis'],
      path: '/tools/eda-explorer',
      icon: BarChart3,
      color: colors.khaki,
      category: 'Data Exploration',
      image: '/images/resources/eda.jpg',
      difficulty: 'Beginner',
      timeEstimate: '10-20 mins'
    },
    {
      id: 'classification',
      title: 'Classification Explorer',
      description: 'Build and evaluate classification models',
      detailedDescription: 'Create powerful classification models to categorize and predict outcomes. Compare multiple algorithms, tune parameters, and evaluate performance with comprehensive metrics. Ideal for customer segmentation, risk assessment, and decision support.',
      features: ['Multiple algorithms', 'Cross-validation', 'Feature importance', 'Confusion matrices', 'ROC curves'],
      path: '/tools/classification-explorer',
      icon: Brain,
      color: colors.navy,
      category: 'Machine Learning',
      image: '/images/resources/classification.jpg',
      difficulty: 'Advanced',
      timeEstimate: '20-40 mins'
    },
    {
      id: 'clustering',
      title: 'Clustering Analysis',
      description: 'Find natural groupings in your data',
      detailedDescription: 'Discover natural patterns and segments in your data without predefined labels. Use advanced clustering algorithms to identify customer segments, detect anomalies, and reveal hidden structures in complex datasets.',
      features: ['K-means & hierarchical', 'Optimal clusters', 'Cluster visualization', 'Silhouette analysis', 'Segment profiling'],
      path: '/tools/clustering-explorer',
      icon: Network,
      color: colors.chestnut,
      category: 'Unsupervised Learning',
      image: '/images/resources/clustering.jpg',
      difficulty: 'Intermediate',
      timeEstimate: '15-30 mins'
    },
    {
      id: 'nlp',
      title: 'NLP Text Analysis',
      description: 'Analyze and understand text data',
      detailedDescription: 'Transform unstructured text into actionable insights. Perform sentiment analysis, topic modeling, and text classification. Perfect for analyzing customer feedback, social media data, and document collections.',
      features: ['Sentiment analysis', 'Topic modeling', 'Word clouds', 'Text classification', 'Entity extraction'],
      path: '/tools/nlp-explorer',
      icon: MessageSquare,
      color: colors.khaki,
      category: 'Natural Language Processing',
      image: '/images/resources/nlp.jpg',
      difficulty: 'Intermediate',
      timeEstimate: '10-25 mins'
    }
  ];

  const categories = [...new Set(tools.map(tool => tool.category))];

  const featuredTool = tools.find(t => t.id === 'eda-explorer');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Interactive ML/AI Tools
            </h2>
            <p className="text-gray-600">
              Explore our suite of machine learning and AI analysis tools to gain insights from your data.
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Total Tools</p>
            <p className="text-2xl font-bold" style={{ color: colors.chestnut }}>{tools.length}</p>
          </div>
        </div>
      </div>

      {/* Featured Tool */}
      {featuredTool && (
        <div className="bg-gradient-to-r from-gray-900 to-gray-700 rounded-lg shadow-lg overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2 p-8 text-white">
              <div className="flex items-center mb-4">
                <Star className="w-5 h-5 mr-2 text-yellow-400" />
                <span className="text-sm font-medium text-yellow-400">RECOMMENDED FOR BEGINNERS</span>
              </div>
              <h3 className="text-3xl font-bold mb-4">{featuredTool.title}</h3>
              <p className="text-gray-200 mb-6">{featuredTool.detailedDescription}</p>
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  <span className="text-sm">{featuredTool.timeEstimate}</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-4 h-4 mr-2" />
                  <span className="text-sm">{featuredTool.difficulty}</span>
                </div>
              </div>
              <button
                onClick={() => navigate(featuredTool.path)}
                className="bg-white text-gray-900 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors inline-flex items-center"
              >
                Start with EDA
                <span className="ml-2">→</span>
              </button>
            </div>
            <div className="md:w-1/2 relative h-64 md:h-auto">
              <img 
                src={featuredTool.image} 
                alt={featuredTool.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-gray-900/50 to-transparent md:hidden" />
            </div>
          </div>
        </div>
      )}

      {/* Tools by Category */}
      {categories.map(category => (
        <div key={category} className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {category}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tools
              .filter(tool => tool.category === category)
              .map(tool => {
                const Icon = tool.icon;
                
                return (
                  <div
                    key={tool.id}
                    className="border rounded-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer group bg-white"
                    onClick={() => navigate(tool.path)}
                    onMouseEnter={() => setHoveredTool(tool.id)}
                    onMouseLeave={() => setHoveredTool(null)}
                  >
                    {/* Tool Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={tool.image} 
                        alt={tool.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute top-4 right-4">
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center backdrop-blur-sm bg-white/90"
                          style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        >
                          <Icon className="w-6 h-6" style={{ color: tool.color }} />
                        </div>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <div className="flex items-center gap-2 text-white text-sm">
                          <span className="px-2 py-1 rounded bg-white/20 backdrop-blur-sm">
                            {tool.difficulty}
                          </span>
                          <span className="px-2 py-1 rounded bg-white/20 backdrop-blur-sm">
                            {tool.timeEstimate}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Tool Content */}
                    <div className="p-6">
                      <h4 className="font-semibold text-lg text-gray-900 mb-2 group-hover:text-chestnut transition-colors">
                        {tool.title}
                      </h4>
                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                        {tool.detailedDescription}
                      </p>
                      
                      {/* Features */}
                      <div className="mb-4">
                        <p className="text-xs font-medium text-gray-500 mb-2">KEY FEATURES:</p>
                        <div className="flex flex-wrap gap-1">
                          {tool.features.slice(0, 3).map((feature, index) => (
                            <span 
                              key={index}
                              className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600"
                            >
                              {feature}
                            </span>
                          ))}
                          {tool.features.length > 3 && (
                            <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                              +{tool.features.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-sm font-medium" style={{ color: tool.color }}>
                          <span>Launch Tool</span>
                          <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      ))}

      {/* Learning Path */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Recommended Learning Path
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            { step: 1, tool: 'EDA Explorer', desc: 'Understand your data' },
            { step: 2, tool: 'Linear Regression', desc: 'Build predictive models' },
            { step: 3, tool: 'Classification', desc: 'Categorize outcomes' },
            { step: 4, tool: 'Clustering', desc: 'Find patterns' },
            { step: 5, tool: 'NLP Analysis', desc: 'Analyze text data' }
          ].map((item, index) => (
            <div key={item.step} className="relative">
              <div className="text-center">
                <div 
                  className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2"
                  style={{ 
                    backgroundColor: index === 0 ? colors.chestnut : '#f3f4f6',
                    color: index === 0 ? 'white' : '#6b7280'
                  }}
                >
                  {item.step}
                </div>
                <h4 className="font-medium text-sm text-gray-900">{item.tool}</h4>
                <p className="text-xs text-gray-500 mt-1">{item.desc}</p>
              </div>
              {index < 4 && (
                <div className="hidden md:block absolute top-6 left-full w-full h-0.5 bg-gray-200" 
                     style={{ transform: 'translateX(-50%)' }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InteractiveToolsTab;