/**
 * Secure API utility with authentication
 * Replaces insecure API calls throughout the application
 */

import { useAuth } from '../contexts/AuthContext';
import { auth } from '../services/firebase';
import API_CONFIG, { buildUrl } from '../config/apiConfig';

class SecureAPIError extends Error {
  constructor(message, code, status) {
    super(message);
    this.name = 'SecureAPIError';
    this.code = code;
    this.status = status;
  }
}

/**
 * Make authenticated API calls with proper error handling
 * Note: This function requires a user object to be passed in
 */
export const authenticatedFetch = async (user, url, options = {}) => {
  if (!user) {
    throw new SecureAPIError('Authentication required', 'AUTH_REQUIRED', 401);
  }

  try {
    // Get token from Firebase auth
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new SecureAPIError('Firebase user not authenticated', 'AUTH_REQUIRED', 401);
    }
    const token = await currentUser.getIdToken();
    
    const fullUrl = url?.startsWith('http') ? url : buildUrl(url);
    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      
      if (response.status === 401) {
        throw new SecureAPIError('Authentication failed', 'AUTH_FAILED', 401);
      } else if (response.status === 403) {
        throw new SecureAPIError('Access denied', 'ACCESS_DENIED', 403);
      } else if (response.status === 402) {
        throw new SecureAPIError('Premium subscription required', 'PREMIUM_REQUIRED', 402);
      } else if (response.status === 429) {
        throw new SecureAPIError('Rate limit exceeded', 'RATE_LIMIT', 429);
      } else {
        throw new SecureAPIError(
          errorData.message || 'Request failed', 
          errorData.code || 'REQUEST_FAILED', 
          response.status
        );
      }
    }

    return response;
  } catch (error) {
    if (error instanceof SecureAPIError) {
      throw error;
    }
    
    // Network or other errors
    throw new SecureAPIError(
      'Network error. Please check your connection.',
      'NETWORK_ERROR',
      0
    );
  }
};

/**
 * Hook for secure API calls in components
 */
export const useSecureAPI = () => {
  const { user } = useAuth();

  const secureCall = async (url, options = {}) => {
    if (!user) {
      throw new SecureAPIError('Must be logged in', 'AUTH_REQUIRED', 401);
    }

    // Get token from Firebase auth
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new SecureAPIError('Firebase user not authenticated', 'AUTH_REQUIRED', 401);
    }
    const token = await currentUser.getIdToken();
    
    const fullUrl = url?.startsWith('http') ? url : buildUrl(url);
    return await fetch(fullUrl, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });
  };

  const uploadFile = async (url, file, additionalData = {}) => {
    if (!user) {
      throw new SecureAPIError('Must be logged in', 'AUTH_REQUIRED', 401);
    }

    // Get token from Firebase auth
    const currentUser = auth.currentUser;
    if (!currentUser) {
      throw new SecureAPIError('Firebase user not authenticated', 'AUTH_REQUIRED', 401);
    }
    const token = await currentUser.getIdToken();
    const formData = new FormData();
    formData.append('file', file);
    
    // Add additional data
    Object.entries(additionalData).forEach(([key, value]) => {
      formData.append(key, value);
    });

    const fullUrl = url?.startsWith('http') ? url : buildUrl(url);
    return await fetch(fullUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
        // Don't set Content-Type for FormData - browser sets it with boundary
      },
      body: formData
    });
  };

  return {
    secureCall,
    uploadFile,
    isAuthenticated: !!user
  };
};

/**
 * Secure session management for tools
 */
export class SecureToolSession {
  constructor(toolType, userId) {
    this.toolType = toolType;
    this.userId = userId;
    this.sessionId = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized) return this.sessionId;

    try {
      const response = await authenticatedFetch('/api/' + this.toolType + '/session', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Session',
          description: `${this.toolType} analysis session`,
          user_id: this.userId,
          tool_type: this.toolType
        })
      });

      if (response.ok) {
        const data = await response.json();
        this.sessionId = data.session_id || data.sessionId;
        this.isInitialized = true;
        return this.sessionId;
      } else {
        throw new Error('Failed to create secure session');
      }
    } catch (error) {
      console.error('Session initialization failed:', error);
      throw error;
    }
  }

  async uploadData(file) {
    if (!this.isInitialized) {
      throw new Error('Session not initialized');
    }

    try {
      const response = await authenticatedFetch(
        `/api/${this.toolType}/validate-data?session_id=${this.sessionId}`,
        {
          method: 'POST',
          headers: {
            // Remove Content-Type for file uploads
          },
          body: (() => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('session_id', this.sessionId);
            return formData;
          })()
        }
      );

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      return await response.json();
    } catch (error) {
      console.error('Upload failed:', error);
      throw error;
    }
  }

  async processStep(step, data) {
    if (!this.isInitialized) {
      throw new Error('Session not initialized');
    }

    try {
      // No generic process endpoint on backend; store client-side or map to specific endpoints
      return { ok: true, data };

    } catch (error) {
      console.error('Processing failed:', error);
      throw error;
    }
  }
}

/**
 * User-friendly error messages
 */
export const getErrorMessage = (error) => {
  const messages = {
    'AUTH_REQUIRED': 'Please log in to use this feature.',
    'AUTH_FAILED': 'Your session has expired. Please log in again.',
    'ACCESS_DENIED': 'You don\'t have permission to access this feature.',
    'PREMIUM_REQUIRED': 'This feature requires a premium subscription.',
    'RATE_LIMIT': 'Too many requests. Please wait a moment and try again.',
    'NETWORK_ERROR': 'Connection problem. Please check your internet and try again.',
    'FILE_TOO_LARGE': 'File is too large. Please upload a smaller file.',
    'INVALID_FILE_TYPE': 'File type not supported. Please upload a CSV, Excel, or JSON file.'
  };

  return messages[error.code] || error.message || 'Something went wrong. Please try again.';
};

export default {
  authenticatedFetch,
  useSecureAPI,
  SecureToolSession,
  SecureAPIError,
  getErrorMessage
};
