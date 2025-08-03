/**
 * Input Validation and Sanitization Utilities
 * Prevents injection attacks and ensures data integrity
 * 
 * 🚨 SECURITY: This addresses the missing input validation vulnerability
 */

import DOMPurify from 'dompurify';

// Email validation regex (RFC 5322 compliant)
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

// Phone validation regex (international format)
const PHONE_REGEX = /^[+]?[1-9][\d]{0,15}$/;

// URL validation regex
const URL_REGEX = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/;

// SQL injection patterns to detect
const SQL_INJECTION_PATTERNS = [
  /(\bselect\b|\binsert\b|\bupdate\b|\bdelete\b|\bdrop\b|\bunion\b|\bexec\b|\bscript\b)/i,
  /('|\\\'|;|--|%27|%3D|%3C|%3E|%00)/i,
  /(<|%3C)(\/|%2F)*[a-z0-9%]+(>|%3E)/i,
  /(<|%3C)(i|%69|%49)(m|%6D|%4D)(g|%67|%47)[^\n]+(>|%3E)/i
];

// XSS patterns to detect
const XSS_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
  /javascript:/gi,
  /on\w+\s*=/gi,
  /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
  /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi
];

// Custom validation error class
export class ValidationError extends Error {
  constructor(message, field, code) {
    super(message);
    this.name = 'ValidationError';
    this.field = field;
    this.code = code;
  }
}

// Sanitize HTML content
export const sanitizeHtml = (input) => {
  if (typeof input !== 'string') return input;
  
  // Use DOMPurify to remove malicious HTML
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 'br', 'p'],
    ALLOWED_ATTR: []
  });
};

// Sanitize plain text (remove HTML entirely)
export const sanitizeText = (input) => {
  if (typeof input !== 'string') return input;
  
  // Remove all HTML tags and decode entities
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
};

// Detect potential SQL injection
export const detectSqlInjection = (input) => {
  if (typeof input !== 'string') return false;
  
  return SQL_INJECTION_PATTERNS.some(pattern => pattern.test(input));
};

// Detect potential XSS
export const detectXss = (input) => {
  if (typeof input !== 'string') return false;
  
  return XSS_PATTERNS.some(pattern => pattern.test(input));
};

// Validate email address
export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') {
    throw new ValidationError('Email is required', 'email', 'REQUIRED');
  }
  
  email = email.trim().toLowerCase();
  
  if (email.length > 254) {
    throw new ValidationError('Email address is too long', 'email', 'TOO_LONG');
  }
  
  if (!EMAIL_REGEX.test(email)) {
    throw new ValidationError('Invalid email format', 'email', 'INVALID_FORMAT');
  }
  
  // Check for suspicious patterns
  if (detectSqlInjection(email) || detectXss(email)) {
    throw new ValidationError('Email contains invalid characters', 'email', 'INVALID_CHARACTERS');
  }
  
  return email;
};

// Validate phone number
export const validatePhone = (phone) => {
  if (!phone) return null; // Phone is optional in most cases
  
  if (typeof phone !== 'string') {
    throw new ValidationError('Phone must be a string', 'phone', 'INVALID_TYPE');
  }
  
  // Remove spaces, dashes, parentheses
  const cleanPhone = phone.replace(/[\s\-()]/g, '');
  
  if (!PHONE_REGEX.test(cleanPhone)) {
    throw new ValidationError('Invalid phone number format', 'phone', 'INVALID_FORMAT');
  }
  
  return cleanPhone;
};

// Validate URL
export const validateUrl = (url) => {
  if (!url) return null; // URL is optional in most cases
  
  if (typeof url !== 'string') {
    throw new ValidationError('URL must be a string', 'url', 'INVALID_TYPE');
  }
  
  url = url.trim();
  
  if (!URL_REGEX.test(url)) {
    throw new ValidationError('Invalid URL format', 'url', 'INVALID_FORMAT');
  }
  
  return url;
};

// Validate name fields
export const validateName = (name, fieldName = 'name') => {
  if (!name || typeof name !== 'string') {
    throw new ValidationError(`${fieldName} is required`, fieldName, 'REQUIRED');
  }
  
  name = sanitizeText(name).trim();
  
  if (name.length < 1) {
    throw new ValidationError(`${fieldName} cannot be empty`, fieldName, 'EMPTY');
  }
  
  if (name.length > 100) {
    throw new ValidationError(`${fieldName} is too long (max 100 characters)`, fieldName, 'TOO_LONG');
  }
  
  // Check for numbers and special characters (names should be mostly letters)
  if (!/^[a-zA-Z\s\-.\']+$/.test(name)) {
    throw new ValidationError(`${fieldName} contains invalid characters`, fieldName, 'INVALID_CHARACTERS');
  }
  
  // Check for suspicious patterns
  if (detectSqlInjection(name) || detectXss(name)) {
    throw new ValidationError(`${fieldName} contains invalid characters`, fieldName, 'INVALID_CHARACTERS');
  }
  
  return name;
};

// Validate organization name
export const validateOrganizationName = (orgName) => {
  if (!orgName || typeof orgName !== 'string') {
    throw new ValidationError('Organization name is required', 'organizationName', 'REQUIRED');
  }
  
  orgName = sanitizeText(orgName).trim();
  
  if (orgName.length < 1) {
    throw new ValidationError('Organization name cannot be empty', 'organizationName', 'EMPTY');
  }
  
  if (orgName.length > 200) {
    throw new ValidationError('Organization name is too long (max 200 characters)', 'organizationName', 'TOO_LONG');
  }
  
  // Allow letters, numbers, spaces, and common business characters
  if (!/^[a-zA-Z0-9\s\-.&,\']+$/.test(orgName)) {
    throw new ValidationError('Organization name contains invalid characters', 'organizationName', 'INVALID_CHARACTERS');
  }
  
  if (detectSqlInjection(orgName) || detectXss(orgName)) {
    throw new ValidationError('Organization name contains invalid characters', 'organizationName', 'INVALID_CHARACTERS');
  }
  
  return orgName;
};

// Validate text area inputs (descriptions, notes, etc.)
export const validateTextArea = (text, fieldName, maxLength = 5000, required = false) => {
  if (!text || typeof text !== 'string') {
    if (required) {
      throw new ValidationError(`${fieldName} is required`, fieldName, 'REQUIRED');
    }
    return '';
  }
  
  text = sanitizeText(text).trim();
  
  if (required && text.length < 1) {
    throw new ValidationError(`${fieldName} cannot be empty`, fieldName, 'EMPTY');
  }
  
  if (text.length > maxLength) {
    throw new ValidationError(`${fieldName} is too long (max ${maxLength} characters)`, fieldName, 'TOO_LONG');
  }
  
  if (detectSqlInjection(text) || detectXss(text)) {
    throw new ValidationError(`${fieldName} contains invalid characters`, fieldName, 'INVALID_CHARACTERS');
  }
  
  return text;
};

// Validate array selections (like services interested)
export const validateSelection = (selection, fieldName, allowedValues = [], required = false) => {
  if (!selection || !Array.isArray(selection)) {
    if (required) {
      throw new ValidationError(`${fieldName} is required`, fieldName, 'REQUIRED');
    }
    return [];
  }
  
  if (required && selection.length === 0) {
    throw new ValidationError(`Please select at least one ${fieldName}`, fieldName, 'EMPTY');
  }
  
  if (selection.length > 20) {
    throw new ValidationError(`Too many ${fieldName} selected (max 20)`, fieldName, 'TOO_MANY');
  }
  
  // Validate each selection
  for (const item of selection) {
    if (typeof item !== 'string') {
      throw new ValidationError(`Invalid ${fieldName} selection`, fieldName, 'INVALID_TYPE');
    }
    
    if (allowedValues.length > 0 && !allowedValues.includes(item)) {
      throw new ValidationError(`Invalid ${fieldName} selection: ${item}`, fieldName, 'INVALID_SELECTION');
    }
    
    if (detectSqlInjection(item) || detectXss(item)) {
      throw new ValidationError(`${fieldName} contains invalid characters`, fieldName, 'INVALID_CHARACTERS');
    }
  }
  
  return selection;
};

// Validate file uploads
export const validateFile = (file, allowedTypes = [], maxSize = 50 * 1024 * 1024) => {
  if (!file) {
    throw new ValidationError('File is required', 'file', 'REQUIRED');
  }
  
  if (!(file instanceof File)) {
    throw new ValidationError('Invalid file object', 'file', 'INVALID_TYPE');
  }
  
  if (file.size > maxSize) {
    const maxSizeMB = Math.round(maxSize / 1024 / 1024);
    throw new ValidationError(`File is too large (max ${maxSizeMB}MB)`, 'file', 'TOO_LARGE');
  }
  
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    throw new ValidationError('File type not allowed', 'file', 'INVALID_TYPE');
  }
  
  // Check for suspicious file names
  if (detectSqlInjection(file.name) || detectXss(file.name)) {
    throw new ValidationError('File name contains invalid characters', 'file', 'INVALID_FILENAME');
  }
  
  return file;
};

// Validate service intake form
export const validateServiceIntakeForm = (formData) => {
  const errors = {};
  const validatedData = {};
  
  try {
    validatedData.firstName = validateName(formData.firstName, 'firstName');
  } catch (error) {
    errors.firstName = error.message;
  }
  
  try {
    validatedData.lastName = validateName(formData.lastName, 'lastName');
  } catch (error) {
    errors.lastName = error.message;
  }
  
  try {
    validatedData.email = validateEmail(formData.email);
  } catch (error) {
    errors.email = error.message;
  }
  
  try {
    validatedData.phone = validatePhone(formData.phone);
  } catch (error) {
    errors.phone = error.message;
  }
  
  try {
    validatedData.organizationName = validateOrganizationName(formData.organizationName);
  } catch (error) {
    errors.organizationName = error.message;
  }
  
  try {
    validatedData.website = validateUrl(formData.website);
  } catch (error) {
    errors.website = error.message;
  }
  
  try {
    validatedData.projectDescription = validateTextArea(
      formData.projectDescription, 
      'project description', 
      2000
    );
  } catch (error) {
    errors.projectDescription = error.message;
  }
  
  try {
    validatedData.currentChallenges = validateTextArea(
      formData.currentChallenges, 
      'current challenges', 
      2000
    );
  } catch (error) {
    errors.currentChallenges = error.message;
  }
  
  try {
    const allowedServices = [
      'quick-assessment',
      'half-day-strategy',
      'ai-basics-training',
      'change-readiness',
      'genai-workshops',
      'pilot-support',
      'governance-setup',
      'website-development',
      'custom-consulting'
    ];
    validatedData.servicesInterested = validateSelection(
      formData.servicesInterested, 
      'services', 
      allowedServices, 
      true
    );
  } catch (error) {
    errors.servicesInterested = error.message;
  }
  
  // Add timestamp and metadata
  validatedData.submittedAt = new Date().toISOString();
  validatedData.userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
  validatedData.referrer = typeof document !== 'undefined' ? document.referrer : '';
  
  if (Object.keys(errors).length > 0) {
    const validationError = new ValidationError('Form validation failed', 'form', 'VALIDATION_FAILED');
    validationError.errors = errors;
    throw validationError;
  }
  
  return validatedData;
};

// Get user-friendly error message
export const getValidationErrorMessage = (error) => {
  if (!(error instanceof ValidationError)) {
    return 'An error occurred while validating your input.';
  }
  
  const messages = {
    'REQUIRED': 'This field is required.',
    'EMPTY': 'This field cannot be empty.',
    'TOO_LONG': error.message,
    'TOO_SHORT': error.message,
    'INVALID_FORMAT': error.message,
    'INVALID_TYPE': error.message,
    'INVALID_CHARACTERS': 'This field contains invalid characters.',
    'INVALID_SELECTION': error.message,
    'TOO_LARGE': error.message,
    'VALIDATION_FAILED': 'Please correct the errors below.'
  };
  
  return messages[error.code] || error.message;
};

export default {
  sanitizeHtml,
  sanitizeText,
  validateEmail,
  validatePhone,
  validateUrl,
  validateName,
  validateOrganizationName,
  validateTextArea,
  validateSelection,
  validateFile,
  validateServiceIntakeForm,
  getValidationErrorMessage,
  ValidationError
};