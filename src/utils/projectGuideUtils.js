/**
 * Project Guide Management Utilities
 * Handles the nested structure of guides under projects per user
 */

import { doc, updateDoc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';

/**
 * Get the path to a user's project guides
 */
export const getProjectGuidesPath = (userId, projectId) => {
  return `users/${userId}/projects/${projectId}/guides`;
};

/**
 * Initialize guides for a project
 */
export const initializeProjectGuides = async (userId, projectId) => {
  const guides = {
    implementation_playbook: {
      id: 'implementation_playbook',
      title: 'AI Implementation Playbook',
      status: 'not_started',
      progress: 0,
      sections: {},
      lastAccessed: null,
      completedAt: null
    },
    ai_readiness_assessment: {
      id: 'ai_readiness_assessment', 
      title: 'AI Readiness Assessment',
      status: 'not_started',
      progress: 0,
      sections: {},
      lastAccessed: null,
      completedAt: null
    },
    ai_use_case_roi_toolkit: {
      id: 'ai_use_case_roi_toolkit',
      title: 'AI Use Case & ROI Toolkit',
      status: 'not_started',
      progress: 0,
      sections: {},
      lastAccessed: null,
      completedAt: null
    },
    ai_strategy_starter_kit: {
      id: 'ai_strategy_starter_kit',
      title: 'AI Strategy Starter Kit',
      status: 'not_started',
      progress: 0,
      sections: {},
      lastAccessed: null,
      completedAt: null
    }
  };

  // Create the project document with guides
  const projectRef = doc(db, 'users', userId, 'projects', projectId);
  await setDoc(projectRef, {
    guides,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  }, { merge: true });

  return guides;
};

/**
 * Get all guides for a project
 */
export const getProjectGuides = async (userId, projectId) => {
  try {
    const projectRef = doc(db, 'users', userId, 'projects', projectId);
    const projectDoc = await getDoc(projectRef);
    
    if (!projectDoc.exists()) {
      // Initialize if doesn't exist
      return await initializeProjectGuides(userId, projectId);
    }
    
    return projectDoc.data()?.guides || {};
  } catch (error) {
    console.error('Error getting project guides:', error);
    throw error;
  }
};

/**
 * Update guide progress
 */
export const updateGuideProgress = async (userId, projectId, guideId, progressData) => {
  try {
    const projectRef = doc(db, 'users', userId, 'projects', projectId);
    
    const updates = {
      [`guides.${guideId}.progress`]: progressData.progress || 0,
      [`guides.${guideId}.status`]: progressData.status || 'in_progress',
      [`guides.${guideId}.lastAccessed`]: serverTimestamp(),
      [`guides.${guideId}.sections`]: progressData.sections || {},
      updatedAt: serverTimestamp()
    };
    
    if (progressData.status === 'completed') {
      updates[`guides.${guideId}.completedAt`] = serverTimestamp();
    }
    
    await updateDoc(projectRef, updates);
    
    return true;
  } catch (error) {
    console.error('Error updating guide progress:', error);
    throw error;
  }
};

/**
 * Get specific guide data
 */
export const getGuideData = async (userId, projectId, guideId) => {
  try {
    const guides = await getProjectGuides(userId, projectId);
    return guides[guideId] || null;
  } catch (error) {
    console.error('Error getting guide data:', error);
    throw error;
  }
};

/**
 * Save guide section data
 */
export const saveGuideSectionData = async (userId, projectId, guideId, sectionId, data) => {
  try {
    const projectRef = doc(db, 'users', userId, 'projects', projectId);
    
    await updateDoc(projectRef, {
      [`guides.${guideId}.sections.${sectionId}`]: {
        ...data,
        updatedAt: serverTimestamp()
      },
      [`guides.${guideId}.lastAccessed`]: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return true;
  } catch (error) {
    console.error('Error saving guide section:', error);
    throw error;
  }
};

/**
 * Calculate overall guide completion for a project
 */
export const calculateProjectGuideCompletion = (guides) => {
  if (!guides || Object.keys(guides).length === 0) {
    return 0;
  }
  
  const totalGuides = Object.keys(guides).length;
  const totalProgress = Object.values(guides).reduce((sum, guide) => {
    return sum + (guide.progress || 0);
  }, 0);
  
  return Math.round(totalProgress / totalGuides);
};

/**
 * Get guide statistics for a project
 */
export const getProjectGuideStats = (guides) => {
  const stats = {
    total: 0,
    completed: 0,
    inProgress: 0,
    notStarted: 0,
    overallProgress: 0
  };
  
  if (!guides) return stats;
  
  Object.values(guides).forEach(guide => {
    stats.total++;
    
    switch (guide.status) {
      case 'completed':
        stats.completed++;
        break;
      case 'in_progress':
        stats.inProgress++;
        break;
      default:
        stats.notStarted++;
    }
  });
  
  stats.overallProgress = calculateProjectGuideCompletion(guides);
  
  return stats;
};

/**
 * Migrate existing guide data to new structure
 */
export const migrateGuidesToProjectStructure = async (userId) => {
  try {
    // Get user's projects
    const userRef = doc(db, 'users', userId);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();
    
    if (!userData?.projects) {
      console.log('No projects to migrate');
      return;
    }
    
    // For each project, check if guides need migration
    for (const projectId of Object.keys(userData.projects)) {
      const projectData = userData.projects[projectId];
      
      // Check if old structure exists
      if (projectData.guides && typeof projectData.guides === 'object') {
        // Migrate to new structure
        await initializeProjectGuides(userId, projectId);
        
        // Copy existing guide data
        for (const [guideId, guideData] of Object.entries(projectData.guides)) {
          if (guideData.progress || guideData.data) {
            await updateGuideProgress(userId, projectId, guideId, {
              progress: guideData.progress || 0,
              status: guideData.progress === 100 ? 'completed' : 'in_progress',
              sections: guideData.data || {}
            });
          }
        }
        
        console.log(`Migrated guides for project: ${projectId}`);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error migrating guides:', error);
    throw error;
  }
};

export default {
  getProjectGuidesPath,
  initializeProjectGuides,
  getProjectGuides,
  updateGuideProgress,
  getGuideData,
  saveGuideSectionData,
  calculateProjectGuideCompletion,
  getProjectGuideStats,
  migrateGuidesToProjectStructure
};