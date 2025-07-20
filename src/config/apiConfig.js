// Centralized API configuration for all services
const API_CONFIG = {
  // Base URL for all API calls - Railway production backend
  BASE_URL: 'https://evolviq-website-production.up.railway.app',
  
  // API endpoints organized by service
  ENDPOINTS: {
    // EDA Tool endpoints
    EDA: {
      UPLOAD: '/upload',
      VALIDATE: '/api/eda/validate-data',
      UNIVARIATE_ANALYSIS: '/api/eda/univariate-analysis',
      BIVARIATE_ANALYSIS: '/api/eda/bivariate-analysis',
      QUALITY_ASSESSMENT: '/api/eda/quality-assessment',
      DATA_CLEANING: '/api/eda/clean-data'
    },
    
    // Classification Tool endpoints
    CLASSIFICATION: {
      UPLOAD: '/upload',
      VALIDATE: '/validate',
      TRAIN: '/classification/train',
      PREDICT: '/classification/predict',
      EVALUATE: '/classification/evaluate'
    },
    
    // Clustering Tool endpoints
    CLUSTERING: {
      UPLOAD: '/upload',
      VALIDATE: '/validate',
      CLUSTER: '/clustering/cluster',
      OPTIMIZE: '/clustering/optimize',
      VISUALIZE: '/clustering/visualize'
    },
    
    // NLP Tool endpoints
    NLP: {
      UPLOAD: '/upload',
      VALIDATE: '/validate',
      ANALYZE: '/nlp/analyze',
      SENTIMENT: '/nlp/sentiment',
      EXTRACT: '/nlp/extract'
    },
    
    // Assessment endpoints
    ASSESSMENTS: {
      AI_READINESS: '/assessments/ai-readiness',
      AI_KNOWLEDGE_START: '/api/ai-knowledge/start',
      AI_KNOWLEDGE_RESPOND: '/api/ai-knowledge/respond',
      CHANGE_READINESS_START: '/api/change-readiness/start',
      CHANGE_READINESS_RESPOND: '/api/change-readiness/respond',
      SUBMIT: '/assessments/submit',
      RESULTS: '/assessments/results'
    }
  },
  
  // Common headers for all requests
  HEADERS: {
    'Content-Type': 'application/json'
  },
  
  // Request timeout in milliseconds
  TIMEOUT: 30000
};

// Helper function to build full URL
export const buildUrl = (endpoint) => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Helper function to create API request configuration
export const createRequestConfig = (method = 'GET', body = null, headers = {}) => {
  const config = {
    method,
    headers: {
      ...API_CONFIG.HEADERS,
      ...headers
    },
    timeout: API_CONFIG.TIMEOUT
  };
  
  if (body) {
    if (body instanceof FormData) {
      // Remove Content-Type header for FormData to let browser set it with boundary
      delete config.headers['Content-Type'];
    }
    config.body = body instanceof FormData ? body : JSON.stringify(body);
  }
  
  return config;
};

export default API_CONFIG;