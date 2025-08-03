/**
 * Client-Side Rate Limiting Utilities
 * Prevents unnecessary API calls and improves user experience
 * 
 * Works with backend rate limiting for comprehensive protection
 */

// Local storage keys for client-side rate limiting
const RATE_LIMIT_PREFIX = 'rl_';
const CLEANUP_INTERVAL = 60000; // Clean up old entries every minute

// Rate limit configurations (should match backend tiers)
const CLIENT_RATE_LIMITS = {
  // Form submissions (prevent accidental double-submits)
  forms: {
    maxRequests: 3,
    windowMs: 5 * 60 * 1000, // 5 minutes
    message: 'Please wait before submitting another form'
  },
  
  // Search queries (prevent spam)
  search: {
    maxRequests: 10,
    windowMs: 60 * 1000, // 1 minute
    message: 'Please wait before searching again'
  },
  
  // Tool processing (prevent resource waste)
  tools: {
    maxRequests: 5,
    windowMs: 10 * 60 * 1000, // 10 minutes
    message: 'Please wait before processing another request'
  },
  
  // File uploads (prevent bandwidth abuse)
  uploads: {
    maxRequests: 2,
    windowMs: 30 * 60 * 1000, // 30 minutes
    message: 'Please wait before uploading another file'
  }
};

class ClientRateLimiter {
  constructor() {
    this.startCleanupInterval();
  }

  /**
   * Check if action is allowed under client-side rate limiting
   */
  isAllowed(action, identifier = 'default') {
    const config = CLIENT_RATE_LIMITS[action];
    if (!config) return { allowed: true };

    const key = `${RATE_LIMIT_PREFIX}${action}_${identifier}`;
    const now = Date.now();
    const windowStart = now - config.windowMs;

    // Get stored requests
    const stored = localStorage.getItem(key);
    let requests = stored ? JSON.parse(stored) : [];

    // Remove expired requests
    requests = requests.filter(timestamp => timestamp > windowStart);

    // Check if limit exceeded
    if (requests.length >= config.maxRequests) {
      const oldestRequest = Math.min(...requests);
      const retryAfter = Math.ceil((oldestRequest + config.windowMs - now) / 1000);
      
      return {
        allowed: false,
        message: config.message,
        retryAfter,
        limit: config.maxRequests,
        remaining: 0,
        reset: oldestRequest + config.windowMs
      };
    }

    // Add current request
    requests.push(now);
    localStorage.setItem(key, JSON.stringify(requests));

    return {
      allowed: true,
      limit: config.maxRequests,
      remaining: config.maxRequests - requests.length,
      reset: now + config.windowMs
    };
  }

  /**
   * Record a successful action (for tracking)
   */
  recordAction(action, identifier = 'default') {
    this.isAllowed(action, identifier);
  }

  /**
   * Clear rate limit data for an action
   */
  clearRateLimit(action, identifier = 'default') {
    const key = `${RATE_LIMIT_PREFIX}${action}_${identifier}`;
    localStorage.removeItem(key);
  }

  /**
   * Get current rate limit status
   */
  getStatus(action, identifier = 'default') {
    return this.isAllowed(action, identifier);
  }

  /**
   * Clean up expired rate limit data
   */
  cleanup() {
    const now = Date.now();
    const keysToRemove = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(RATE_LIMIT_PREFIX)) {
        try {
          const stored = localStorage.getItem(key);
          const requests = stored ? JSON.parse(stored) : [];
          
          // Find the action type
          const actionMatch = key.match(new RegExp(`${RATE_LIMIT_PREFIX}([^_]+)_`));
          if (actionMatch) {
            const action = actionMatch[1];
            const config = CLIENT_RATE_LIMITS[action];
            
            if (config) {
              const windowStart = now - config.windowMs;
              const validRequests = requests.filter(timestamp => timestamp > windowStart);
              
              if (validRequests.length === 0) {
                keysToRemove.push(key);
              } else if (validRequests.length !== requests.length) {
                localStorage.setItem(key, JSON.stringify(validRequests));
              }
            }
          }
        } catch (error) {
          // Remove corrupted entries
          keysToRemove.push(key);
        }
      }
    }

    // Remove expired/corrupted entries
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }

  /**
   * Start periodic cleanup
   */
  startCleanupInterval() {
    setInterval(() => this.cleanup(), CLEANUP_INTERVAL);
  }
}

// Global rate limiter instance
const rateLimiter = new ClientRateLimiter();

/**
 * Rate limiting decorator for functions
 */
export const withRateLimit = (action, identifier, options = {}) => {
  return (target, propertyKey, descriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = async function(...args) {
      const rateLimit = rateLimiter.isAllowed(action, identifier);
      
      if (!rateLimit.allowed) {
        if (options.onRateLimited) {
          options.onRateLimited(rateLimit);
        } else {
          throw new Error(rateLimit.message);
        }
        return;
      }

      try {
        const result = await originalMethod.apply(this, args);
        if (options.onSuccess) {
          options.onSuccess(result, rateLimit);
        }
        return result;
      } catch (error) {
        if (options.onError) {
          options.onError(error, rateLimit);
        }
        throw error;
      }
    };

    return descriptor;
  };
};

/**
 * React hook for rate limiting
 */
export const useRateLimit = (action, identifier = 'default') => {
  const checkRateLimit = () => rateLimiter.isAllowed(action, identifier);
  const recordAction = () => rateLimiter.recordAction(action, identifier);
  const clearRateLimit = () => rateLimiter.clearRateLimit(action, identifier);
  const getStatus = () => rateLimiter.getStatus(action, identifier);

  return {
    checkRateLimit,
    recordAction,
    clearRateLimit,
    getStatus
  };
};

/**
 * Enhanced fetch with rate limiting and error handling
 */
export const rateLimitedFetch = async (url, options = {}, rateLimitConfig = {}) => {
  const { 
    action = 'api', 
    identifier = 'default',
    showRateLimitError = true 
  } = rateLimitConfig;

  // Check client-side rate limit
  const rateLimit = rateLimiter.isAllowed(action, identifier);
  if (!rateLimit.allowed) {
    const error = new Error(rateLimit.message);
    error.code = 'CLIENT_RATE_LIMITED';
    error.retryAfter = rateLimit.retryAfter;
    throw error;
  }

  try {
    const response = await fetch(url, options);

    // Parse server-side rate limit headers
    const serverRateLimit = {
      limit: response.headers.get('X-RateLimit-Limit'),
      remaining: response.headers.get('X-RateLimit-Remaining'),
      reset: response.headers.get('X-RateLimit-Reset'),
      retryAfter: response.headers.get('Retry-After')
    };

    // Handle server-side rate limiting
    if (response.status === 429) {
      const retryAfter = parseInt(serverRateLimit.retryAfter) || 60;
      const error = new Error(`Rate limit exceeded. Try again in ${retryAfter} seconds.`);
      error.code = 'SERVER_RATE_LIMITED';
      error.retryAfter = retryAfter;
      error.rateLimit = serverRateLimit;
      throw error;
    }

    // Return response with rate limit info
    return {
      response,
      clientRateLimit: rateLimit,
      serverRateLimit
    };

  } catch (error) {
    // Don't record action if it failed due to rate limiting
    if (error.code !== 'CLIENT_RATE_LIMITED' && error.code !== 'SERVER_RATE_LIMITED') {
      rateLimiter.recordAction(action, identifier);
    }
    throw error;
  }
};

/**
 * Debounced function with rate limiting
 */
export const createDebouncedRateLimitedFunction = (
  fn, 
  debounceMs = 300, 
  action = 'debounced',
  identifier = 'default'
) => {
  let timeoutId;
  
  return (...args) => {
    clearTimeout(timeoutId);
    
    timeoutId = setTimeout(() => {
      const rateLimit = rateLimiter.isAllowed(action, identifier);
      if (rateLimit.allowed) {
        fn(...args);
      } else {
        console.warn(`Rate limited: ${rateLimit.message}`);
      }
    }, debounceMs);
  };
};

/**
 * Get user-friendly rate limit message
 */
export const getRateLimitMessage = (error) => {
  if (error.code === 'CLIENT_RATE_LIMITED' || error.code === 'SERVER_RATE_LIMITED') {
    const retryAfter = error.retryAfter;
    if (retryAfter < 60) {
      return `Please wait ${retryAfter} seconds before trying again.`;
    } else {
      const minutes = Math.ceil(retryAfter / 60);
      return `Please wait ${minutes} minute${minutes > 1 ? 's' : ''} before trying again.`;
    }
  }
  return error.message;
};

/**
 * Rate limit status component data
 */
export const getRateLimitStatusForDisplay = (action, identifier = 'default') => {
  const status = rateLimiter.getStatus(action, identifier);
  const config = CLIENT_RATE_LIMITS[action];
  
  if (!config) return null;

  const usagePercent = ((config.maxRequests - status.remaining) / config.maxRequests) * 100;
  const isNearLimit = usagePercent > 80;
  const timeUntilReset = status.reset - Date.now();

  return {
    ...status,
    usagePercent,
    isNearLimit,
    timeUntilReset: Math.max(0, timeUntilReset),
    config
  };
};

export default rateLimiter;