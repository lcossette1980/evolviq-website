/**
 * Tool Progression Validation
 * Ensures users complete required configurations before advancing
 */

/**
 * Validation rules for each tool type
 */
const VALIDATION_RULES = {
  clustering: {
    dataUpload: {
      required: ['file', 'dataShape'],
      message: 'Please upload a dataset before proceeding'
    },
    configuration: {
      required: ['algorithms'],
      validate: (config) => {
        if (!config.algorithms || config.algorithms.length === 0) {
          return { isValid: false, message: 'Please select at least one clustering algorithm' };
        }
        if (config.maxClusters && config.minClusters && config.maxClusters < config.minClusters) {
          return { isValid: false, message: 'Maximum clusters must be greater than minimum clusters' };
        }
        return { isValid: true };
      }
    },
    analysis: {
      required: ['sessionId', 'results'],
      message: 'Analysis must be completed before viewing results'
    }
  },
  
  classification: {
    dataUpload: {
      required: ['file', 'dataShape', 'targetColumn'],
      message: 'Please upload a dataset and select target column'
    },
    configuration: {
      required: ['models'],
      validate: (config) => {
        if (!config.models || config.models.length === 0) {
          return { isValid: false, message: 'Please select at least one classification model' };
        }
        if (config.testSize && (config.testSize < 0.1 || config.testSize > 0.5)) {
          return { isValid: false, message: 'Test size must be between 10% and 50%' };
        }
        return { isValid: true };
      }
    },
    training: {
      required: ['sessionId', 'trainingStarted'],
      message: 'Model training must be initiated'
    }
  },
  
  regression: {
    dataUpload: {
      required: ['file', 'dataShape'],
      message: 'Please upload a dataset before proceeding'
    },
    preprocessing: {
      required: ['targetColumn', 'features'],
      validate: (config) => {
        if (!config.targetColumn) {
          return { isValid: false, message: 'Please select a target column for regression' };
        }
        if (!config.features || config.features.length === 0) {
          return { isValid: false, message: 'Please select at least one feature column' };
        }
        return { isValid: true };
      }
    },
    training: {
      required: ['models', 'preprocessingComplete'],
      validate: (config) => {
        if (!config.models || config.models.length === 0) {
          return { isValid: false, message: 'Please select at least one regression model' };
        }
        return { isValid: true };
      }
    }
  },
  
  nlp: {
    dataUpload: {
      required: ['file', 'textColumn'],
      message: 'Please upload text data and select text column'
    },
    configuration: {
      required: ['tasks'],
      validate: (config) => {
        if (!config.tasks || config.tasks.length === 0) {
          return { isValid: false, message: 'Please select at least one NLP task' };
        }
        if (config.language && !['en', 'es', 'fr', 'de', 'zh'].includes(config.language)) {
          return { isValid: false, message: 'Selected language is not supported' };
        }
        return { isValid: true };
      }
    },
    analysis: {
      required: ['sessionId', 'processingStarted'],
      message: 'Text analysis must be initiated'
    }
  },
  
  eda: {
    dataUpload: {
      required: ['file', 'dataShape'],
      message: 'Please upload a dataset for exploration'
    },
    analysis: {
      required: ['columns', 'dataTypes'],
      validate: (config) => {
        if (!config.columns || config.columns.length === 0) {
          return { isValid: false, message: 'Dataset must contain at least one column' };
        }
        return { isValid: true };
      }
    }
  }
};

/**
 * Validate if user can proceed to next step
 */
export const validateToolStep = (toolType, currentStep, stepData) => {
  const toolRules = VALIDATION_RULES[toolType];
  if (!toolRules) {
    console.warn(`No validation rules defined for tool type: ${toolType}`);
    return { isValid: true };
  }
  
  const stepRules = toolRules[currentStep];
  if (!stepRules) {
    return { isValid: true };
  }
  
  // Check required fields
  if (stepRules.required) {
    for (const field of stepRules.required) {
      if (!stepData[field]) {
        return { 
          isValid: false, 
          message: stepRules.message || `Missing required field: ${field}` 
        };
      }
    }
  }
  
  // Run custom validation if provided
  if (stepRules.validate) {
    return stepRules.validate(stepData);
  }
  
  return { isValid: true };
};

/**
 * Get validation summary for all steps
 */
export const getToolValidationSummary = (toolType, allStepData) => {
  const toolRules = VALIDATION_RULES[toolType];
  if (!toolRules) {
    return { isValid: true, steps: {} };
  }
  
  const summary = {
    isValid: true,
    steps: {}
  };
  
  Object.entries(toolRules).forEach(([step, rules]) => {
    const stepData = allStepData[step] || {};
    const validation = validateToolStep(toolType, step, stepData);
    
    summary.steps[step] = validation;
    if (!validation.isValid) {
      summary.isValid = false;
    }
  });
  
  return summary;
};

/**
 * Check if user has required premium features for tool configuration
 */
export const validatePremiumFeatures = (toolType, config, isPremium) => {
  const premiumFeatures = {
    clustering: ['gmm', 'spectral'],
    classification: ['xgboost', 'lightgbm', 'catboost', 'neural_network'],
    regression: ['xgboost', 'lightgbm', 'neural_network'],
    nlp: ['deep_sentiment', 'advanced_ner', 'text_generation'],
    eda: ['advanced_statistics', 'correlation_matrix']
  };
  
  const toolPremiumFeatures = premiumFeatures[toolType] || [];
  const usedPremiumFeatures = [];
  
  // Check algorithms/models
  if (config.algorithms) {
    config.algorithms.forEach(algo => {
      if (toolPremiumFeatures.includes(algo)) {
        usedPremiumFeatures.push(algo);
      }
    });
  }
  
  if (config.models) {
    config.models.forEach(model => {
      if (toolPremiumFeatures.includes(model)) {
        usedPremiumFeatures.push(model);
      }
    });
  }
  
  if (config.tasks) {
    config.tasks.forEach(task => {
      if (toolPremiumFeatures.includes(task)) {
        usedPremiumFeatures.push(task);
      }
    });
  }
  
  if (usedPremiumFeatures.length > 0 && !isPremium) {
    return {
      isValid: false,
      message: `Premium subscription required for: ${usedPremiumFeatures.join(', ')}`,
      premiumFeatures: usedPremiumFeatures
    };
  }
  
  return { isValid: true };
};

/**
 * Validate data size limits
 */
export const validateDataLimits = (dataShape, isPremium) => {
  const limits = {
    free: {
      maxRows: 10000,
      maxColumns: 50,
      maxFileSize: 10 * 1024 * 1024 // 10MB
    },
    premium: {
      maxRows: 1000000,
      maxColumns: 500,
      maxFileSize: 100 * 1024 * 1024 // 100MB
    }
  };
  
  const userLimits = isPremium ? limits.premium : limits.free;
  
  if (dataShape.rows > userLimits.maxRows) {
    return {
      isValid: false,
      message: `Dataset exceeds row limit (${userLimits.maxRows.toLocaleString()} rows for ${isPremium ? 'premium' : 'free'} users)`
    };
  }
  
  if (dataShape.columns > userLimits.maxColumns) {
    return {
      isValid: false,
      message: `Dataset exceeds column limit (${userLimits.maxColumns} columns for ${isPremium ? 'premium' : 'free'} users)`
    };
  }
  
  if (dataShape.fileSize && dataShape.fileSize > userLimits.maxFileSize) {
    return {
      isValid: false,
      message: `File size exceeds limit (${Math.round(userLimits.maxFileSize / 1024 / 1024)}MB for ${isPremium ? 'premium' : 'free'} users)`
    };
  }
  
  return { isValid: true };
};

export default {
  validateToolStep,
  getToolValidationSummary,
  validatePremiumFeatures,
  validateDataLimits
};