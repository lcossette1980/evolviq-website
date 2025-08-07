/**
 * Tier Configuration
 * Defines access levels and features for free vs premium users
 */

export const TIER_CONFIG = {
  free: {
    name: 'Free',
    assessments: {
      allowed: ['ai_knowledge_assessment'],
      resultsLevel: 'basic', // basic, detailed, full
      showActionItems: false,
      showLearningPlan: true,
      maxAssessmentsPerMonth: 3
    },
    tools: {
      allowed: ['eda'],
      features: {
        eda: {
          maxRows: 10000,
          maxColumns: 50,
          exportFormats: ['csv'],
          advancedVisualizations: false
        }
      }
    },
    projects: {
      enabled: false,
      maxProjects: 0
    },
    guides: {
      allowed: [], // No premium guides for free tier
      showPreviews: true
    },
    dashboard: {
      tabs: ['overview', 'assessments', 'tools', 'learning'],
      hideProjectsTab: true,
      showUpgradePrompts: true
    },
    export: {
      formats: ['csv', 'json'],
      includeBranding: true,
      maxExportsPerMonth: 10
    }
  },
  
  trial: {
    name: '3-Day Trial',
    duration: 3, // days
    assessments: {
      allowed: ['ai_knowledge_assessment', 'change_readiness_assessment'],
      resultsLevel: 'detailed',
      showActionItems: true,
      showLearningPlan: true,
      maxAssessmentsPerMonth: 10
    },
    tools: {
      allowed: ['eda', 'regression', 'classification', 'clustering', 'nlp'],
      features: {
        eda: {
          maxRows: 50000,
          maxColumns: 100,
          exportFormats: ['csv', 'excel'],
          advancedVisualizations: true
        },
        regression: {
          models: ['linear', 'ridge', 'lasso', 'elastic_net', 'random_forest'],
          maxRows: 50000,
          exportModel: true
        },
        classification: {
          models: ['logistic', 'decision_tree', 'random_forest', 'svm', 'naive_bayes'],
          maxRows: 50000,
          exportModel: true
        },
        clustering: {
          algorithms: ['kmeans', 'hierarchical', 'dbscan'],
          maxRows: 50000,
          exportResults: true
        },
        nlp: {
          tasks: ['sentiment', 'entities', 'keywords', 'summarization'],
          maxDocuments: 1000,
          exportResults: true
        }
      }
    },
    projects: {
      enabled: true,
      maxProjects: 3
    },
    guides: {
      allowed: ['all'],
      showPreviews: false
    },
    dashboard: {
      tabs: ['overview', 'assessments', 'projects', 'tools', 'learning', 'action-items'],
      hideProjectsTab: false,
      showUpgradePrompts: true,
      showTrialBanner: true
    },
    export: {
      formats: ['csv', 'json', 'excel', 'pdf'],
      includeBranding: false,
      maxExportsPerMonth: 50
    }
  },
  
  premium: {
    name: 'Premium',
    assessments: {
      allowed: ['all'],
      resultsLevel: 'full',
      showActionItems: true,
      showLearningPlan: true,
      maxAssessmentsPerMonth: 'unlimited'
    },
    tools: {
      allowed: ['all'],
      features: {
        eda: {
          maxRows: 1000000,
          maxColumns: 500,
          exportFormats: ['all'],
          advancedVisualizations: true
        },
        regression: {
          models: ['all'],
          maxRows: 1000000,
          exportModel: true,
          advancedModels: ['xgboost', 'lightgbm', 'neural_network']
        },
        classification: {
          models: ['all'],
          maxRows: 1000000,
          exportModel: true,
          advancedModels: ['xgboost', 'lightgbm', 'catboost', 'neural_network']
        },
        clustering: {
          algorithms: ['all'],
          maxRows: 1000000,
          exportResults: true,
          advancedAlgorithms: ['gmm', 'spectral']
        },
        nlp: {
          tasks: ['all'],
          maxDocuments: 10000,
          exportResults: true,
          advancedTasks: ['deep_sentiment', 'advanced_ner', 'text_generation']
        }
      }
    },
    projects: {
      enabled: true,
      maxProjects: 'unlimited'
    },
    guides: {
      allowed: ['all'],
      showPreviews: false,
      earlyAccess: true
    },
    dashboard: {
      tabs: ['all'],
      hideProjectsTab: false,
      showUpgradePrompts: false,
      premiumBadge: true
    },
    export: {
      formats: ['all'],
      includeBranding: false,
      maxExportsPerMonth: 'unlimited',
      apiAccess: true
    },
    support: {
      priority: true,
      responseTime: '24 hours',
      dedicatedChannel: true
    }
  }
};

/**
 * Get user's tier configuration
 */
export const getUserTierConfig = (user) => {
  if (!user || user.isAnonymous) {
    return TIER_CONFIG.free;
  }
  // Trial takes precedence when present
  if (user.subscriptionStatus === 'trialing') {
    return TIER_CONFIG.trial;
  }
  // Active subscription OR explicit premium flag → premium
  if (user.isPremium || user.subscriptionStatus === 'active') {
    return TIER_CONFIG.premium;
  }
  return TIER_CONFIG.free;
};

/**
 * Check if user has access to a specific feature
 */
export const hasFeatureAccess = (user, feature, subFeature = null) => {
  const tierConfig = getUserTierConfig(user);
  
  // Check main feature access
  if (!tierConfig[feature]) {
    return false;
  }
  
  const featureConfig = tierConfig[feature];
  
  // Check if feature is enabled
  if (featureConfig.enabled === false) {
    return false;
  }
  
  // Check allowed list
  if (featureConfig.allowed) {
    if (featureConfig.allowed === 'all' || featureConfig.allowed.includes('all')) {
      return true;
    }
    
    if (subFeature) {
      return featureConfig.allowed.includes(subFeature);
    }
    
    return featureConfig.allowed.length > 0;
  }
  
  return true;
};

/**
 * Get feature limits for user's tier
 */
export const getFeatureLimits = (user, feature) => {
  const tierConfig = getUserTierConfig(user);
  
  if (!tierConfig[feature]) {
    return null;
  }
  
  return tierConfig[feature];
};

/**
 * Check if user needs to upgrade for a feature
 */
export const needsUpgrade = (user, feature, subFeature = null) => {
  // Premium users don't need upgrades
  if (user?.isPremium && user?.subscriptionStatus === 'active') {
    return false;
  }
  
  // Check if feature is accessible in current tier
  const hasAccess = hasFeatureAccess(user, feature, subFeature);
  
  // If no access in current tier, check if available in premium
  if (!hasAccess) {
    const premiumConfig = TIER_CONFIG.premium;
    const premiumFeature = premiumConfig[feature];
    
    if (premiumFeature?.allowed === 'all' || 
        (premiumFeature?.allowed && premiumFeature.allowed.includes(subFeature || feature))) {
      return true;
    }
  }
  
  return false;
};

/**
 * Get upgrade message for a feature
 */
export const getUpgradeMessage = (feature, subFeature = null) => {
  const messages = {
    assessments: {
      change_readiness_assessment: 'Unlock the Change Readiness Assessment with a premium subscription',
      default: 'Get access to all assessments and detailed insights with premium'
    },
    tools: {
      classification: 'Unlock Classification Explorer and advanced ML models with premium',
      clustering: 'Access Clustering Analysis and advanced algorithms with premium',
      regression: 'Get full Regression Analysis capabilities with premium',
      nlp: 'Unlock NLP Explorer and advanced text analysis with premium',
      default: 'Access all interactive tools with a premium subscription'
    },
    projects: {
      default: 'Create and manage unlimited projects with premium'
    },
    guides: {
      default: 'Access all premium guides and implementation playbooks'
    },
    export: {
      pdf: 'Export to PDF format with premium',
      excel: 'Export to Excel format with premium',
      default: 'Unlock all export formats and remove branding with premium'
    }
  };
  
  const featureMessages = messages[feature] || {};
  return featureMessages[subFeature] || featureMessages.default || 'Upgrade to premium for full access';
};

export default {
  TIER_CONFIG,
  getUserTierConfig,
  hasFeatureAccess,
  getFeatureLimits,
  needsUpgrade,
  getUpgradeMessage
};
