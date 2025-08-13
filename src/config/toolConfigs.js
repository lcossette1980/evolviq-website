/**
 * Tool Configuration Definitions
 * Centralizes tool-specific settings and eliminates duplication
 */

export const EDA_TOOL_CONFIG = {
  title: "Exploratory Data Analysis",
  description: "Comprehensive data exploration and statistical analysis",
  toolType: "eda",
  requiresPremium: false,
  sessionName: "EDA Analysis Session",
  sessionDescription: "Exploratory Data Analysis session",
  maxFileSize: 50 * 1024 * 1024, // 50MB
  allowedFileTypes: [
    'text/csv',
    'application/json',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ],
  stepEndpoints: {
    analyze: '/api/:tool/analyze'
  },
  steps: [
    {
      id: 1,
      name: 'Upload Data',
      description: 'Upload your dataset for analysis',
      component: 'upload'
    },
    {
      id: 2,
      name: 'Validate Data',
      description: 'Review data structure and quality',
      component: 'validate'
    },
    {
      id: 3,
      name: 'Configure Analysis',
      description: 'Set analysis parameters and cleaning options',
      component: 'configure'
    },
    {
      id: 4,
      name: 'Run Analysis',
      description: 'Perform comprehensive exploratory data analysis',
      component: 'analyze'
    },
    {
      id: 5,
      name: 'View Results',
      description: 'Explore insights and visualizations',
      component: 'results'
    }
  ]
};

export const CLASSIFICATION_TOOL_CONFIG = {
  title: "Classification Analysis",
  description: "Train and compare classification models",
  toolType: "classification",
  requiresPremium: true,
  sessionName: "Classification Analysis Session",
  sessionDescription: "Classification model training and evaluation",
  maxFileSize: 50 * 1024 * 1024,
  allowedFileTypes: [
    'text/csv',
    'application/json',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ],
  stepEndpoints: {
    preprocess: '/api/:tool/preprocess',
    train: '/api/:tool/train'
  },
  steps: [
    {
      id: 1,
      name: 'Upload Data',
      description: 'Upload your dataset for classification',
      component: 'upload'
    },
    {
      id: 2,
      name: 'Validate Data',
      description: 'Review data structure and quality',
      component: 'validate'
    },
    {
      id: 3,
      name: 'Select Target',
      description: 'Choose the column you want to predict',
      component: 'target'
    },
    {
      id: 4,
      name: 'Select Models',
      description: 'Choose classification algorithms to compare',
      component: 'configure'
    },
    {
      id: 5,
      name: 'Train Models',
      description: 'Train and evaluate selected models',
      component: 'train'
    },
    {
      id: 6,
      name: 'View Results',
      description: 'Compare model performance and insights',
      component: 'results'
    }
  ]
};

export const CLUSTERING_TOOL_CONFIG = {
  title: "Clustering Analysis",
  description: "Discover patterns and group similar data points",
  toolType: "clustering",
  requiresPremium: true,
  sessionName: "Clustering Analysis Session",
  sessionDescription: "Unsupervised clustering analysis and optimization",
  maxFileSize: 50 * 1024 * 1024,
  allowedFileTypes: [
    'text/csv',
    'application/json',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ],
  stepEndpoints: {
    analyze: '/api/:tool/analyze'
  },
  steps: [
    {
      id: 1,
      name: 'Upload Data',
      description: 'Upload your dataset for clustering',
      component: 'upload'
    },
    {
      id: 2,
      name: 'Validate Data',
      description: 'Review data structure and features',
      component: 'validate'
    },
    {
      id: 3,
      name: 'Configure Analysis',
      description: 'Set clustering algorithms and parameters',
      component: 'configure'
    },
    {
      id: 4,
      name: 'Run Analysis',
      description: 'Perform clustering and optimization',
      component: 'analyze'
    },
    {
      id: 5,
      name: 'View Results',
      description: 'Explore clusters and insights',
      component: 'results'
    }
  ]
};

export const REGRESSION_TOOL_CONFIG = {
  title: "Linear Regression Analysis",
  description: "Build and evaluate predictive regression models",
  toolType: "regression",
  requiresPremium: false,
  sessionName: "Regression Analysis Session",
  sessionDescription: "Linear regression model training and evaluation",
  maxFileSize: 50 * 1024 * 1024,
  allowedFileTypes: [
    'text/csv',
    'application/json',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ],
  stepEndpoints: {
    preprocess: '/api/:tool/preprocess',
    train: '/api/:tool/train'
  },
  steps: [
    {
      id: 1,
      name: 'Upload Data',
      description: 'Upload your dataset for regression analysis',
      component: 'upload'
    },
    {
      id: 2,
      name: 'Validate Data',
      description: 'Review data structure and target variable',
      component: 'validate'
    },
    {
      id: 3,
      name: 'Preprocess',
      description: 'Clean and prepare data for modeling',
      component: 'preprocess'
    },
    {
      id: 4,
      name: 'Train Models',
      description: 'Train and evaluate regression models',
      component: 'train'
    },
    {
      id: 5,
      name: 'Results',
      description: 'Analyze model performance and coefficients',
      component: 'results'
    },
    {
      id: 6,
      name: 'Predict',
      description: 'Make predictions with trained model',
      component: 'predict'
    }
  ]
};

export const NLP_TOOL_CONFIG = {
  title: "Natural Language Processing",
  description: "Analyze and process text data with advanced NLP techniques",
  toolType: "nlp",
  requiresPremium: false,
  sessionName: "NLP Analysis Session",
  sessionDescription: "Natural language processing and text analysis",
  maxFileSize: 20 * 1024 * 1024, // 20MB for text files
  allowedFileTypes: [
    'text/csv',
    'text/plain',
    'application/json'
  ],
  steps: [
    {
      id: 1,
      name: 'Upload Text',
      description: 'Upload your text data for analysis',
      component: 'upload'
    },
    {
      id: 2,
      name: 'Validate Data',
      description: 'Review text data structure and quality',
      component: 'validate'
    },
    {
      id: 3,
      name: 'Analysis Configuration',
      description: 'Choose NLP analysis techniques',
      component: 'configure'
    },
    {
      id: 4,
      name: 'Run Analysis',
      description: 'Perform sentiment, topic, and entity analysis',
      component: 'analyze'
    },
    {
      id: 5,
      name: 'View Results',
      description: 'Explore insights and visualizations',
      component: 'results'
    }
  ]
};

// Tool registry for easy access
export const TOOL_CONFIGS = {
  eda: EDA_TOOL_CONFIG,
  classification: CLASSIFICATION_TOOL_CONFIG,
  clustering: CLUSTERING_TOOL_CONFIG,
  regression: REGRESSION_TOOL_CONFIG,
  nlp: NLP_TOOL_CONFIG
};

// Helper function to get tool config
export const getToolConfig = (toolType) => {
  const config = TOOL_CONFIGS[toolType];
  if (!config) {
    throw new Error(`Unknown tool type: ${toolType}`);
  }
  return config;
};
