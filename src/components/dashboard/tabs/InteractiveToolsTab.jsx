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

  // Current available tools
  const initialOfferings = [
    {
      id: 'linear-regression',
      title: 'Linear Regression Analysis',
      description: 'Build predictive models with regression analysis',
      detailedDescription: 'Master predictive analytics with our comprehensive linear regression tool. Upload your data, visualize relationships, build models, and generate actionable insights. Perfect for sales forecasting, trend analysis, and business predictions.',
      features: ['Data visualization', 'Model training', 'Performance metrics', 'Residual analysis', 'Export predictions'],
      path: '/tools/linear-regression',
      icon: TrendingUp,
      color: colors.chestnut,
      category: 'Initial Offerings',
      originalCategory: 'Predictive Analytics',
      image: '/images/resources/lin-reg.jpg',
      difficulty: 'Intermediate',
      timeEstimate: '15-30 mins',
      status: 'available'
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
      category: 'Initial Offerings',
      originalCategory: 'Data Exploration',
      image: '/images/resources/eda.jpg',
      difficulty: 'Beginner',
      timeEstimate: '10-20 mins',
      status: 'available'
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
      category: 'Initial Offerings',
      originalCategory: 'Machine Learning',
      image: '/images/resources/classification.jpg',
      difficulty: 'Advanced',
      timeEstimate: '20-40 mins',
      status: 'available'
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
      category: 'Initial Offerings',
      originalCategory: 'Unsupervised Learning',
      image: '/images/resources/clustering.jpg',
      difficulty: 'Intermediate',
      timeEstimate: '15-30 mins',
      status: 'available'
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
      category: 'Initial Offerings',
      originalCategory: 'Natural Language Processing',
      image: '/images/resources/nlp.jpg',
      difficulty: 'Intermediate',
      timeEstimate: '10-25 mins',
      status: 'available'
    }
  ];

  // Coming soon tools
  const comingSoonTools = [
    // Data Exploration
    {
      id: 'time-series',
      title: 'Time Series Explorer',
      description: 'Analyze trends, seasonality, and forecasting',
      detailedDescription: 'Advanced time series analysis with trend detection, seasonality decomposition, and multiple forecasting models. Perfect for sales data, stock prices, and temporal patterns.',
      features: ['Trend analysis', 'Seasonality detection', 'ARIMA models', 'Prophet forecasting', 'Anomaly detection'],
      icon: LineChart,
      color: colors.khaki,
      category: 'Data Exploration',
      difficulty: 'Intermediate',
      timeEstimate: '20-30 mins',
      status: 'coming-soon'
    },
    {
      id: 'data-profiler',
      title: 'Data Profiler',
      description: 'Automated data quality assessment',
      detailedDescription: 'Comprehensive data profiling with automated quality checks, missing value analysis, and data type inference. Essential for data preparation.',
      features: ['Quality scoring', 'Missing value patterns', 'Outlier detection', 'Data type inference', 'Profiling reports'],
      icon: FileText,
      color: colors.khaki,
      category: 'Data Exploration',
      difficulty: 'Beginner',
      timeEstimate: '5-10 mins',
      status: 'coming-soon'
    },
    {
      id: 'dashboard-builder',
      title: 'Interactive Dashboard Builder',
      description: 'Drag-and-drop dashboard creation',
      detailedDescription: 'Create beautiful, interactive dashboards without coding. Connect to multiple data sources and build real-time visualizations.',
      features: ['Drag-and-drop interface', 'Real-time updates', 'Multiple chart types', 'Export to PDF', 'Sharing capabilities'],
      icon: BarChart3,
      color: colors.khaki,
      category: 'Data Exploration',
      difficulty: 'Beginner',
      timeEstimate: '30-60 mins',
      status: 'coming-soon'
    },
    // Predictive Analytics
    {
      id: 'forecasting-suite',
      title: 'Forecasting Suite',
      description: 'Advanced time series forecasting',
      detailedDescription: 'State-of-the-art forecasting with ARIMA, Prophet, and neural networks. Multi-step ahead predictions with confidence intervals.',
      features: ['Multiple algorithms', 'Multi-step forecasting', 'Confidence intervals', 'Model comparison', 'Backtesting'],
      icon: TrendingUp,
      color: colors.chestnut,
      category: 'Predictive Analytics',
      difficulty: 'Advanced',
      timeEstimate: '30-45 mins',
      status: 'coming-soon'
    },
    {
      id: 'ab-testing',
      title: 'A/B Testing Calculator',
      description: 'Statistical significance and power analysis',
      detailedDescription: 'Design and analyze A/B tests with proper statistical rigor. Calculate sample sizes, test significance, and visualize results.',
      features: ['Sample size calculator', 'Power analysis', 'Significance testing', 'Effect size estimation', 'Visual reports'],
      icon: GitBranch,
      color: colors.chestnut,
      category: 'Predictive Analytics',
      difficulty: 'Intermediate',
      timeEstimate: '15-20 mins',
      status: 'coming-soon'
    },
    {
      id: 'survival-analysis',
      title: 'Survival Analysis',
      description: 'Customer churn and time-to-event modeling',
      detailedDescription: 'Analyze customer lifetime, churn probability, and time-to-event data. Essential for retention strategies and risk assessment.',
      features: ['Kaplan-Meier curves', 'Cox regression', 'Churn prediction', 'Hazard analysis', 'Cohort comparison'],
      icon: Clock,
      color: colors.chestnut,
      category: 'Predictive Analytics',
      difficulty: 'Advanced',
      timeEstimate: '25-40 mins',
      status: 'coming-soon'
    },
    // Machine Learning
    {
      id: 'automl',
      title: 'AutoML Pipeline',
      description: 'Automated model selection and tuning',
      detailedDescription: 'Let AI build your ML models. Automated algorithm selection, hyperparameter tuning, and model comparison.',
      features: ['Auto algorithm selection', 'Hyperparameter tuning', 'Model ensembling', 'Feature engineering', 'Deployment ready'],
      icon: Brain,
      color: colors.navy,
      category: 'Machine Learning',
      difficulty: 'Beginner',
      timeEstimate: '20-30 mins',
      status: 'coming-soon'
    },
    {
      id: 'ensemble-builder',
      title: 'Ensemble Model Builder',
      description: 'Combine models for better performance',
      detailedDescription: 'Build powerful ensemble models using voting, stacking, and boosting. Combine multiple algorithms for superior results.',
      features: ['Voting classifiers', 'Stacking', 'Boosting methods', 'Model blending', 'Performance comparison'],
      icon: Network,
      color: colors.navy,
      category: 'Machine Learning',
      difficulty: 'Advanced',
      timeEstimate: '30-45 mins',
      status: 'coming-soon'
    },
    {
      id: 'anomaly-detection',
      title: 'Anomaly Detection',
      description: 'Identify outliers and unusual patterns',
      detailedDescription: 'Detect fraud, system anomalies, and quality issues using advanced outlier detection algorithms.',
      features: ['Isolation Forest', 'DBSCAN', 'One-class SVM', 'Real-time detection', 'Alert system'],
      icon: Star,
      color: colors.navy,
      category: 'Machine Learning',
      difficulty: 'Intermediate',
      timeEstimate: '15-25 mins',
      status: 'coming-soon'
    },
    // Unsupervised Learning
    {
      id: 'dimension-reduction',
      title: 'Dimensionality Reduction',
      description: 'PCA, t-SNE, and UMAP visualizations',
      detailedDescription: 'Reduce high-dimensional data for visualization and analysis. Explore complex datasets in 2D and 3D.',
      features: ['PCA analysis', 't-SNE plots', 'UMAP projections', '3D visualization', 'Feature extraction'],
      icon: GitBranch,
      color: colors.chestnut,
      category: 'Unsupervised Learning',
      difficulty: 'Advanced',
      timeEstimate: '20-30 mins',
      status: 'coming-soon'
    },
    {
      id: 'association-rules',
      title: 'Association Rules Mining',
      description: 'Market basket analysis',
      detailedDescription: 'Discover product associations and build recommendation engines. Perfect for retail and e-commerce analytics.',
      features: ['Apriori algorithm', 'FP-Growth', 'Rule visualization', 'Lift analysis', 'Cross-selling insights'],
      icon: Network,
      color: colors.chestnut,
      category: 'Unsupervised Learning',
      difficulty: 'Intermediate',
      timeEstimate: '15-25 mins',
      status: 'coming-soon'
    },
    {
      id: 'topic-modeling',
      title: 'Topic Modeling',
      description: 'Discover themes in documents',
      detailedDescription: 'Automatically discover topics and themes in large document collections using LDA and NMF algorithms.',
      features: ['LDA modeling', 'NMF analysis', 'Topic visualization', 'Document clustering', 'Keyword extraction'],
      icon: FileText,
      color: colors.chestnut,
      category: 'Unsupervised Learning',
      difficulty: 'Intermediate',
      timeEstimate: '20-30 mins',
      status: 'coming-soon'
    },
    // Natural Language Processing
    {
      id: 'text-summarization',
      title: 'Text Summarization',
      description: 'Automatic document summarization',
      detailedDescription: 'Generate concise summaries of long documents using extractive and abstractive methods.',
      features: ['Extractive summaries', 'Abstractive AI', 'Multi-document', 'Length control', 'Key points extraction'],
      icon: FileText,
      color: colors.khaki,
      category: 'Natural Language Processing',
      difficulty: 'Intermediate',
      timeEstimate: '10-15 mins',
      status: 'coming-soon'
    },
    {
      id: 'ner',
      title: 'Named Entity Recognition',
      description: 'Extract entities from text',
      detailedDescription: 'Identify and extract people, places, organizations, and custom entities from text documents.',
      features: ['Pre-trained models', 'Custom entities', 'Multi-language', 'Batch processing', 'Export to JSON'],
      icon: MessageSquare,
      color: colors.khaki,
      category: 'Natural Language Processing',
      difficulty: 'Intermediate',
      timeEstimate: '15-20 mins',
      status: 'coming-soon'
    },
    {
      id: 'translation',
      title: 'Language Translation',
      description: 'Multi-language translation',
      detailedDescription: 'Translate text between multiple languages with domain-specific models for technical and business content.',
      features: ['50+ languages', 'Domain models', 'Batch translation', 'Format preservation', 'Quality scoring'],
      icon: MessageSquare,
      color: colors.khaki,
      category: 'Natural Language Processing',
      difficulty: 'Beginner',
      timeEstimate: '5-10 mins',
      status: 'coming-soon'
    },
    // Computer Vision
    {
      id: 'image-classification',
      title: 'Image Classification',
      description: 'Train custom image classifiers',
      detailedDescription: 'Build powerful image classification models with pre-trained networks and transfer learning.',
      features: ['Transfer learning', 'Custom training', 'Real-time inference', 'Model export', 'Mobile deployment'],
      icon: Brain,
      color: colors.navy,
      category: 'Computer Vision',
      difficulty: 'Advanced',
      timeEstimate: '30-60 mins',
      status: 'coming-soon'
    },
    {
      id: 'object-detection',
      title: 'Object Detection',
      description: 'Detect and locate objects in images',
      detailedDescription: 'Identify and locate multiple objects in images with bounding boxes and confidence scores.',
      features: ['YOLO models', 'Real-time detection', 'Custom objects', 'Video support', 'API access'],
      icon: Star,
      color: colors.navy,
      category: 'Computer Vision',
      difficulty: 'Advanced',
      timeEstimate: '20-40 mins',
      status: 'coming-soon'
    },
    {
      id: 'image-segmentation',
      title: 'Image Segmentation',
      description: 'Pixel-level image analysis',
      detailedDescription: 'Perform semantic and instance segmentation for medical imaging, satellite imagery, and more.',
      features: ['Semantic segmentation', 'Instance segmentation', 'Medical imaging', 'Mask R-CNN', 'U-Net models'],
      icon: Network,
      color: colors.navy,
      category: 'Computer Vision',
      difficulty: 'Expert',
      timeEstimate: '30-45 mins',
      status: 'coming-soon'
    },
    // Deep Learning
    {
      id: 'nn-designer',
      title: 'Neural Network Designer',
      description: 'Visual neural network builder',
      detailedDescription: 'Design and train neural networks with a visual drag-and-drop interface. No coding required.',
      features: ['Drag-drop layers', 'Auto-architecture', 'Training visualization', 'Model export', 'TensorFlow/PyTorch'],
      icon: Brain,
      color: colors.chestnut,
      category: 'Deep Learning',
      difficulty: 'Intermediate',
      timeEstimate: '40-60 mins',
      status: 'coming-soon'
    },
    {
      id: 'transfer-learning',
      title: 'Transfer Learning Hub',
      description: 'Fine-tune pre-trained models',
      detailedDescription: 'Adapt state-of-the-art models like BERT, GPT, and ResNet to your specific use cases.',
      features: ['Model zoo', 'Fine-tuning', 'Few-shot learning', 'Domain adaptation', 'Performance tracking'],
      icon: GitBranch,
      color: colors.chestnut,
      category: 'Deep Learning',
      difficulty: 'Advanced',
      timeEstimate: '45-90 mins',
      status: 'coming-soon'
    },
    {
      id: 'model-interpretability',
      title: 'Model Interpretability',
      description: 'Understand AI decisions',
      detailedDescription: 'Explain black-box model predictions using SHAP, LIME, and other interpretability techniques.',
      features: ['SHAP values', 'LIME explanations', 'Feature importance', 'Decision paths', 'What-if analysis'],
      icon: Star,
      color: colors.chestnut,
      category: 'Deep Learning',
      difficulty: 'Intermediate',
      timeEstimate: '15-25 mins',
      status: 'coming-soon'
    },
    // Business Intelligence
    {
      id: 'customer-segmentation',
      title: 'Customer Segmentation',
      description: 'RFM and behavioral analysis',
      detailedDescription: 'Segment customers based on behavior, value, and engagement for targeted marketing campaigns.',
      features: ['RFM analysis', 'Behavioral clustering', 'Segment profiles', 'Campaign recommendations', 'Export segments'],
      icon: Users,
      color: colors.khaki,
      category: 'Business Intelligence',
      difficulty: 'Intermediate',
      timeEstimate: '20-30 mins',
      status: 'coming-soon'
    },
    {
      id: 'revenue-predictor',
      title: 'Revenue Predictor',
      description: 'Sales forecasting with scenarios',
      detailedDescription: 'Predict future revenue with multiple scenarios and external factors. Essential for business planning.',
      features: ['Multi-scenario', 'External factors', 'Confidence bands', 'What-if analysis', 'Dashboard export'],
      icon: TrendingUp,
      color: colors.khaki,
      category: 'Business Intelligence',
      difficulty: 'Intermediate',
      timeEstimate: '25-35 mins',
      status: 'coming-soon'
    },
    {
      id: 'sentiment-dashboard',
      title: 'Sentiment Dashboard',
      description: 'Real-time sentiment tracking',
      detailedDescription: 'Monitor customer sentiment across social media, reviews, and feedback channels in real-time.',
      features: ['Multi-channel', 'Real-time updates', 'Trend analysis', 'Alert system', 'Competitor tracking'],
      icon: MessageSquare,
      color: colors.khaki,
      category: 'Business Intelligence',
      difficulty: 'Beginner',
      timeEstimate: '10-20 mins',
      status: 'coming-soon'
    }
  ];

  const tools = [...initialOfferings, ...comingSoonTools];

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
            <div className="flex gap-4 justify-end">
              <div>
                <p className="text-sm text-gray-500">Available Now</p>
                <p className="text-2xl font-bold" style={{ color: colors.chestnut }}>
                  {tools.filter(t => t.status === 'available').length}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Coming Soon</p>
                <p className="text-2xl font-bold text-gray-400">
                  {tools.filter(t => t.status === 'coming-soon').length}
                </p>
              </div>
            </div>
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
                    className={`border rounded-lg overflow-hidden transition-all group bg-white ${
                      tool.status === 'coming-soon' 
                        ? 'cursor-not-allowed opacity-75' 
                        : 'hover:shadow-xl cursor-pointer'
                    }`}
                    onClick={() => tool.status !== 'coming-soon' && navigate(tool.path)}
                    onMouseEnter={() => setHoveredTool(tool.id)}
                    onMouseLeave={() => setHoveredTool(null)}
                  >
                    {/* Tool Image */}
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={tool.image || '/images/resources/coming-soon.jpg'} 
                        alt={tool.title}
                        className={`w-full h-full object-cover transition-transform duration-300 ${
                          tool.status === 'coming-soon' ? 'filter grayscale' : 'group-hover:scale-105'
                        }`}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      {tool.status === 'coming-soon' && (
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 rounded-full bg-gray-900 text-white text-xs font-medium">
                            Coming Soon
                          </span>
                        </div>
                      )}
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
                        <div className="flex items-center text-sm font-medium" style={{ 
                          color: tool.status === 'coming-soon' ? '#9CA3AF' : tool.color 
                        }}>
                          <span>{tool.status === 'coming-soon' ? 'Coming Soon' : 'Launch Tool'}</span>
                          {tool.status !== 'coming-soon' && (
                            <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                          )}
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