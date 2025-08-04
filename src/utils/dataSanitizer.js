/**
 * Data Sanitization Utilities
 * Removes potentially sensitive information from datasets before export
 */

// Common PII field patterns
const PII_FIELD_PATTERNS = [
  /^email$/i,
  /^e[\-_]?mail$/i,
  /^phone$/i,
  /^tel$/i,
  /^mobile$/i,
  /^ssn$/i,
  /^social[\-_]?security$/i,
  /^tax[\-_]?id$/i,
  /^driver[\-_]?license$/i,
  /^passport$/i,
  /^credit[\-_]?card$/i,
  /^account[\-_]?number$/i,
  /^routing[\-_]?number$/i,
  /^ip[\-_]?address$/i,
  /^address$/i,
  /^street$/i,
  /^zip[\-_]?code$/i,
  /^postal[\-_]?code$/i,
  /^date[\-_]?of[\-_]?birth$/i,
  /^dob$/i,
  /^birth[\-_]?date$/i,
  /password/i,
  /secret/i,
  /token/i,
  /api[\-_]?key/i,
  /private[\-_]?key/i
];

// Email pattern for value detection
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Phone number patterns
const PHONE_PATTERNS = [
  /^\+?1?[\s.-]?\(?[0-9]{3}\)?[\s.-]?[0-9]{3}[\s.-]?[0-9]{4}$/,
  /^[0-9]{3}[\s.-]?[0-9]{3}[\s.-]?[0-9]{4}$/,
  /^\([0-9]{3}\)[\s.-]?[0-9]{3}[\s.-]?[0-9]{4}$/
];

// SSN pattern
const SSN_PATTERN = /^[0-9]{3}-?[0-9]{2}-?[0-9]{4}$/;

// Credit card patterns
const CC_PATTERNS = [
  /^[0-9]{4}[\s.-]?[0-9]{4}[\s.-]?[0-9]{4}[\s.-]?[0-9]{4}$/,
  /^[0-9]{16}$/
];

/**
 * Check if a field name indicates PII
 */
const isPIIField = (fieldName) => {
  if (!fieldName || typeof fieldName !== 'string') return false;
  return PII_FIELD_PATTERNS.some(pattern => pattern.test(fieldName));
};

/**
 * Check if a value looks like PII
 */
const isPIIValue = (value) => {
  if (!value || typeof value !== 'string') return false;
  
  // Check for email
  if (EMAIL_PATTERN.test(value)) return true;
  
  // Check for phone numbers
  if (PHONE_PATTERNS.some(pattern => pattern.test(value))) return true;
  
  // Check for SSN
  if (SSN_PATTERN.test(value)) return true;
  
  // Check for credit cards
  if (CC_PATTERNS.some(pattern => pattern.test(value))) return true;
  
  return false;
};

/**
 * Sanitize a single data row
 */
const sanitizeRow = (row, options = {}) => {
  const { 
    removeFields = true, 
    removeValues = true,
    customFields = []
  } = options;
  
  const sanitized = { ...row };
  
  Object.keys(sanitized).forEach(key => {
    // Check custom fields first
    if (customFields.includes(key)) {
      delete sanitized[key];
      return;
    }
    
    // Check field names
    if (removeFields && isPIIField(key)) {
      delete sanitized[key];
      return;
    }
    
    // Check values
    if (removeValues && isPIIValue(sanitized[key])) {
      sanitized[key] = '[REDACTED]';
    }
  });
  
  return sanitized;
};

/**
 * Sanitize an entire dataset
 */
export const sanitizeDataset = (data, options = {}) => {
  if (!data) return data;
  
  // Handle arrays
  if (Array.isArray(data)) {
    return data.map(row => sanitizeRow(row, options));
  }
  
  // Handle single object
  if (typeof data === 'object') {
    return sanitizeRow(data, options);
  }
  
  return data;
};

/**
 * Get a summary of what will be sanitized
 */
export const getSanitizationSummary = (data) => {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return { fields: [], values: 0 };
  }
  
  const piiFields = new Set();
  let piiValueCount = 0;
  
  // Check first row for field names
  const firstRow = data[0];
  Object.keys(firstRow).forEach(key => {
    if (isPIIField(key)) {
      piiFields.add(key);
    }
  });
  
  // Check all rows for PII values
  data.forEach(row => {
    Object.entries(row).forEach(([key, value]) => {
      if (!piiFields.has(key) && isPIIValue(value)) {
        piiValueCount++;
      }
    });
  });
  
  return {
    fields: Array.from(piiFields),
    values: piiValueCount
  };
};

/**
 * Sanitize data for export with user confirmation
 */
export const sanitizeForExport = (data, options = {}) => {
  const summary = getSanitizationSummary(data);
  
  // If no PII detected, return original data
  if (summary.fields.length === 0 && summary.values === 0) {
    return {
      sanitized: data,
      summary: summary,
      hasPII: false
    };
  }
  
  // Sanitize the data
  const sanitized = sanitizeDataset(data, options);
  
  return {
    sanitized: sanitized,
    summary: summary,
    hasPII: true
  };
};

export default {
  sanitizeDataset,
  sanitizeForExport,
  getSanitizationSummary,
  isPIIField,
  isPIIValue
};