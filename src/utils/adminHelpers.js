// Admin utility functions for EvolvIQ Dashboard

export const checkAdminAccess = (user) => {
  // In production, this would check against a database of admin users
  const adminEmails = ['loren@evolviq.org'];
  return user && !user.isAnonymous && adminEmails.includes(user.email);
};

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

export const mockApiCall = (data, delay = 1000) => {
  return new Promise(resolve => {
    setTimeout(() => resolve(data), delay);
  });
};

// Local storage helpers for admin data
export const getStoredData = (key) => {
  try {
    const data = localStorage.getItem(`admin_${key}`);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error reading ${key} from storage:`, error);
    return [];
  }
};

export const setStoredData = (key, data) => {
  try {
    localStorage.setItem(`admin_${key}`, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error saving ${key} to storage:`, error);
    return false;
  }
};

export const addToStoredData = (key, newItem) => {
  const existingData = getStoredData(key);
  const updatedData = [...existingData, { ...newItem, id: generateId(), createdAt: new Date().toISOString() }];
  return setStoredData(key, updatedData);
};

export const removeFromStoredData = (key, itemId) => {
  const existingData = getStoredData(key);
  const updatedData = existingData.filter(item => item.id !== itemId);
  return setStoredData(key, updatedData);
};

export const updateStoredData = (key, itemId, updates) => {
  const existingData = getStoredData(key);
  const updatedData = existingData.map(item => 
    item.id === itemId ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
  );
  return setStoredData(key, updatedData);
};