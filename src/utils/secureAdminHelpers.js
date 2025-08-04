/**
 * Secure Admin Helpers - Replaces adminHelpers.js
 * Uses server-side verification instead of client-side email checks
 * 
 * 🚨 SECURITY: This replaces the client-side admin bypass vulnerability
 */

/**
 * Verify admin access with server-side authentication
 * This is the ONLY way to check admin access
 */
export const verifyAdminAccess = async (user) => {
  try {
    if (!user || user.isAnonymous) {
      return null;
    }

    const token = await user.getIdToken();
    const response = await fetch('/api/admin/verify-access', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      return data.admin_data;
    }

    return null;
  } catch (error) {
    console.error('Admin access verification failed:', error);
    return null;
  }
};

/**
 * Make authenticated admin API calls
 */
export const adminApiCall = async (user, endpoint, options = {}) => {
  try {
    if (!user || user.isAnonymous) {
      throw new Error('Authentication required');
    }

    const token = await user.getIdToken();
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (response.status === 401) {
      throw new Error('Authentication failed');
    }

    if (response.status === 403) {
      throw new Error('Admin access denied');
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Request failed');
    }

    return response;
  } catch (error) {
    console.error('Admin API call failed:', error);
    throw error;
  }
};

/**
 * Get users with admin authentication
 */
export const getUsers = async (user) => {
  const response = await adminApiCall(user, '/api/admin/users');
  return await response.json();
};

/**
 * Get analytics with admin authentication
 */
export const getAnalytics = async (user) => {
  const response = await adminApiCall(user, '/api/admin/analytics');
  return await response.json();
};

/**
 * Disable user account (super admin only)
 */
export const disableUser = async (user, userId) => {
  const response = await adminApiCall(user, `/api/admin/users/${userId}/disable`, {
    method: 'POST'
  });
  return await response.json();
};

/**
 * Check if user has specific admin permission
 */
export const hasPermission = (adminData, permission) => {
  return adminData && adminData.permissions && adminData.permissions.includes(permission);
};

/**
 * Get admin role display name
 */
export const getAdminRoleDisplay = (role) => {
  const roleNames = {
    'admin': 'Administrator',
    'super_admin': 'Super Administrator'
  };
  return roleNames[role] || 'Unknown';
};

// Keep the existing utility functions that don't involve authentication
export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export const formatDateTime = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const calculateMetrics = (data) => {
  if (!data || !Array.isArray(data)) return {};
  
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  
  const recentData = data.filter(item => 
    item.createdAt && new Date(item.createdAt) >= thirtyDaysAgo
  );
  
  return {
    total: data.length,
    recent: recentData.length,
    growthRate: data.length > 0 ? (recentData.length / data.length) * 100 : 0
  };
};

export const exportToCSV = (data, filename) => {
  if (!data || data.length === 0) return;
  
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const value = row[header] || '';
        // Escape quotes and wrap in quotes if contains comma
        return typeof value === 'string' && value.includes(',') 
          ? `"${value.replace(/"/g, '""')}"` 
          : value;
      }).join(',')
    )
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  window.URL.revokeObjectURL(url);
};

export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Remove localStorage functions as admin data should come from server
// Keep only session storage for temporary UI state
export const getSessionData = (key) => {
  try {
    const data = sessionStorage.getItem(`admin_ui_${key}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error reading ${key} from session storage:`, error);
    return null;
  }
};

export const setSessionData = (key, data) => {
  try {
    sessionStorage.setItem(`admin_ui_${key}`, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error saving ${key} to session storage:`, error);
    return false;
  }
};

// Local storage helpers for admin UI preferences (not for authentication)
export const getStoredData = (key) => {
  try {
    const data = localStorage.getItem(`admin_ui_${key}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Error reading ${key} from local storage:`, error);
    return null;
  }
};

export const setStoredData = (key, data) => {
  try {
    localStorage.setItem(`admin_ui_${key}`, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error saving ${key} to local storage:`, error);
    return false;
  }
};

// Helper functions for managing stored data arrays
export const addToStoredData = (key, newItem) => {
  const existingData = getStoredData(key) || [];
  const updatedData = [...existingData, { 
    ...newItem, 
    id: generateId(), 
    createdAt: new Date().toISOString() 
  }];
  return setStoredData(key, updatedData);
};

export const removeFromStoredData = (key, itemId) => {
  const existingData = getStoredData(key) || [];
  const updatedData = existingData.filter(item => item.id !== itemId);
  return setStoredData(key, updatedData);
};

export const updateStoredData = (key, itemId, updates) => {
  const existingData = getStoredData(key) || [];
  const updatedData = existingData.map(item => 
    item.id === itemId 
      ? { ...item, ...updates, updatedAt: new Date().toISOString() } 
      : item
  );
  return setStoredData(key, updatedData);
};

export default {
  verifyAdminAccess,
  adminApiCall,
  getUsers,
  getAnalytics,
  disableUser,
  hasPermission,
  getAdminRoleDisplay,
  formatDate,
  formatDateTime,
  calculateMetrics,
  exportToCSV,
  validateEmail,
  generateId,
  getSessionData,
  setSessionData,
  getStoredData,
  setStoredData,
  addToStoredData,
  removeFromStoredData,
  updateStoredData
};