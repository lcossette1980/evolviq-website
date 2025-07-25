/**
 * Production-ready logging utility
 * Handles different log levels and environments
 */

const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

class Logger {
  constructor() {
    this.level = this.getLogLevel();
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  getLogLevel() {
    const envLevel = process.env.REACT_APP_LOG_LEVEL;
    if (envLevel && LOG_LEVELS[envLevel] !== undefined) {
      return LOG_LEVELS[envLevel];
    }
    // Default to INFO in production, DEBUG in development
    return process.env.NODE_ENV === 'production' ? LOG_LEVELS.INFO : LOG_LEVELS.DEBUG;
  }

  shouldLog(level) {
    return LOG_LEVELS[level] <= this.level;
  }

  formatMessage(level, message, context = {}) {
    const timestamp = new Date().toISOString();
    const contextStr = Object.keys(context).length > 0 ? ` | Context: ${JSON.stringify(context)}` : '';
    return `[${timestamp}] ${level}: ${message}${contextStr}`;
  }

  error(message, context = {}) {
    if (this.shouldLog('ERROR')) {
      const formattedMessage = this.formatMessage('ERROR', message, context);
      console.error(formattedMessage);
      
      // In production, send to error reporting service
      if (!this.isDevelopment) {
        this.sendToErrorService('error', message, context);
      }
    }
  }

  warn(message, context = {}) {
    if (this.shouldLog('WARN')) {
      const formattedMessage = this.formatMessage('WARN', message, context);
      console.warn(formattedMessage);
    }
  }

  info(message, context = {}) {
    if (this.shouldLog('INFO')) {
      const formattedMessage = this.formatMessage('INFO', message, context);
      console.info(formattedMessage);
    }
  }

  debug(message, context = {}) {
    if (this.shouldLog('DEBUG')) {
      const formattedMessage = this.formatMessage('DEBUG', message, context);
      console.log(formattedMessage);
    }
  }

  // API-specific logging
  apiRequest(method, url, data = null) {
    this.debug(`API Request: ${method} ${url}`, { data });
  }

  apiResponse(method, url, status, data = null) {
    this.debug(`API Response: ${method} ${url} - ${status}`, { data });
  }

  apiError(method, url, error) {
    this.error(`API Error: ${method} ${url}`, { 
      message: error.message, 
      stack: error.stack 
    });
  }

  // User action logging
  userAction(action, context = {}) {
    this.info(`User Action: ${action}`, context);
  }

  // Assessment-specific logging
  assessmentStart(type, userId) {
    this.info(`Assessment Started: ${type}`, { userId });
  }

  assessmentComplete(type, userId, score) {
    this.info(`Assessment Completed: ${type}`, { userId, score });
  }

  // Performance logging
  performance(operation, duration, context = {}) {
    this.debug(`Performance: ${operation} took ${duration}ms`, context);
  }

  sendToErrorService(level, message, context) {
    // TODO: Implement actual error service integration
    // Example: Sentry, LogRocket, etc.
    const errorData = {
      level,
      message,
      context,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };
    
    // Placeholder for actual service call
    console.warn('Would send to error service:', errorData);
  }
}

// Create singleton instance
const logger = new Logger();

export default logger;

// Convenience exports
export const { error, warn, info, debug, apiRequest, apiResponse, apiError, userAction, assessmentStart, assessmentComplete, performance } = logger;