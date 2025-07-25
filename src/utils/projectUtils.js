import { colors } from './colors';

/**
 * Utility functions for project-related operations
 */

export const getProjectStatusColor = (status) => {
  switch (status) {
    case 'active': return colors.chestnut;
    case 'completed': return colors.khaki;
    case 'on_hold': return colors.pearl;
    case 'archived': return colors.charcoal;
    default: return colors.chestnut;
  }
};

export const getReadinessLevelColor = (level) => {
  switch (level) {
    case 1: return '#ef4444';
    case 2: return '#f97316'; 
    case 3: return '#eab308';
    case 4: return '#22c55e';
    case 5: return '#16a34a';
    default: return colors.charcoal;
  }
};

export const getMaturityLevelText = (level) => {
  switch (level) {
    case 1: return 'Beginner';
    case 2: return 'Basic';
    case 3: return 'Intermediate';
    case 4: return 'Advanced';
    case 5: return 'Expert';
    default: return 'Unknown';
  }
};

export const getMaturityLevelColor = (level) => {
  return getReadinessLevelColor(level);
};

export const formatDate = (timestamp) => {
  if (!timestamp) return new Date().toLocaleDateString();
  
  // Handle Firebase timestamp
  if (timestamp.seconds) {
    return new Date(timestamp.seconds * 1000).toLocaleDateString();
  }
  
  // Handle regular timestamp
  return new Date(timestamp).toLocaleDateString();
};