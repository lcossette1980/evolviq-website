import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LineChart, 
  Brain, 
  Network, 
  MessageSquare, 
  BarChart3,
  TrendingUp,
  GitBranch,
  FileText
} from 'lucide-react';
import { colors } from '../../../utils/colors';

/**
 * Interactive Tools Tab Component
 * Displays available ML/AI tools and analytics
 */
const InteractiveToolsTab = () => {
  const navigate = useNavigate();

  const tools = [
    {
      id: 'linear-regression',
      title: 'Linear Regression Analysis',
      description: 'Build predictive models with regression analysis',
      path: '/tools/linear-regression',
      icon: TrendingUp,
      color: colors.chestnut,
      category: 'Predictive Analytics'
    },
    {
      id: 'eda-explorer',
      title: 'Exploratory Data Analysis',
      description: 'Discover insights and patterns in your data',
      path: '/tools/eda-explorer',
      icon: BarChart3,
      color: colors.khaki,
      category: 'Data Exploration'
    },
    {
      id: 'classification',
      title: 'Classification Explorer',
      description: 'Build and evaluate classification models',
      path: '/tools/classification-explorer',
      icon: Brain,
      color: colors.navy,
      category: 'Machine Learning'
    },
    {
      id: 'clustering',
      title: 'Clustering Analysis',
      description: 'Find natural groupings in your data',
      path: '/tools/clustering-explorer',
      icon: Network,
      color: colors.chestnut,
      category: 'Unsupervised Learning'
    },
    {
      id: 'nlp',
      title: 'NLP Text Analysis',
      description: 'Analyze and understand text data',
      path: '/tools/nlp-explorer',
      icon: MessageSquare,
      color: colors.khaki,
      category: 'Natural Language Processing'
    }
  ];

  const categories = [...new Set(tools.map(tool => tool.category))];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Interactive ML/AI Tools
        </h2>
        <p className="text-gray-600">
          Explore our suite of machine learning and AI analysis tools to gain insights from your data.
        </p>
      </div>

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
                    className="border rounded-lg p-6 hover:shadow-md transition-all cursor-pointer group"
                    onClick={() => navigate(tool.path)}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform"
                        style={{ backgroundColor: `${tool.color}20` }}
                      >
                        <Icon className="w-6 h-6" style={{ color: tool.color }} />
                      </div>
                    </div>
                    
                    <h4 className="font-semibold text-gray-900 mb-2 group-hover:text-chestnut transition-colors">
                      {tool.title}
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      {tool.description}
                    </p>
                    
                    <div className="flex items-center text-sm font-medium" style={{ color: tool.color }}>
                      <span>Launch Tool</span>
                      <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      ))}

      {/* Quick Start Guide */}
      <div className="bg-gradient-to-r from-chestnut to-khaki text-white rounded-lg p-6">
        <div className="flex items-center mb-4">
          <FileText className="w-8 h-8 mr-3" />
          <h3 className="text-xl font-semibold">New to ML/AI Tools?</h3>
        </div>
        <p className="mb-4">
          Start with our Exploratory Data Analysis tool to understand your data before moving to advanced modeling.
        </p>
        <button
          onClick={() => navigate('/tools/eda-explorer')}
          className="bg-white text-chestnut px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
        >
          Start with EDA Explorer
        </button>
      </div>
    </div>
  );
};

export default InteractiveToolsTab;