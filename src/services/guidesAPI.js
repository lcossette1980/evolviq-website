// Implementation Guides API Service with Firebase integration
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from './firebase';

class GuidesAPI {
  constructor() {
    this.guides = {
      'AIImplementationPlaybook': {
        id: 'AIImplementationPlaybook',
        title: 'AI Implementation Playbook',
        description: 'Comprehensive guide to implementing AI in your organization',
        premium: true,
        estimatedTime: '2-4 hours',
        sections: ['overview', 'assessment', 'planning', 'framework', 'leadership', 'roadmap']
      },
      'AIReadinessAssessment': {
        id: 'AIReadinessAssessment',
        title: 'AI Readiness Assessment',
        description: 'Evaluate your organization\'s AI readiness and capabilities',
        premium: true,
        estimatedTime: '1-2 hours',
        sections: ['current-state', 'capabilities', 'gaps', 'recommendations']
      },
      'AIUseCaseROIToolkit': {
        id: 'AIUseCaseROIToolkit',
        title: 'AI Use Case ROI Toolkit',
        description: 'Calculate and evaluate ROI for AI projects',
        premium: true,
        estimatedTime: '1-3 hours',
        sections: ['evaluation', 'metrics', 'calculator', 'reporting']
      },
      'AIStrategyStarterKit': {
        id: 'AIStrategyStarterKit',
        title: 'AI Strategy Starter Kit',
        description: 'Framework for developing AI strategy',
        premium: true,
        estimatedTime: '2-3 hours',
        sections: ['strategy', 'roadmap', 'governance', 'implementation']
      }
    };
  }

  // User Progress Management
  async createUserProgress(userId, guideId, initialData = {}) {
    try {
      const progressRef = doc(db, 'guideProgress', userId, 'guides', guideId);
      
      const progressData = {
        id: guideId,
        userId,
        guideTitle: this.guides[guideId]?.title || 'Unknown Guide',
        startedAt: serverTimestamp(),
        lastAccessedAt: serverTimestamp(),
        completedSections: [],
        formData: {},
        isCompleted: false,
        completionPercentage: 0,
        timeSpent: 0,
        ...initialData
      };

      await setDoc(progressRef, progressData);
      return progressData;
    } catch (error) {
      console.error('Error creating user progress:', error);
      throw error;
    }
  }

  async getUserProgress(userId, guideId) {
    try {
      const progressRef = doc(db, 'guideProgress', userId, 'guides', guideId);
      const progressSnap = await getDoc(progressRef);
      
      if (progressSnap.exists()) {
        return { id: progressSnap.id, ...progressSnap.data() };
      } else {
        // Create new progress record
        return await this.createUserProgress(userId, guideId);
      }
    } catch (error) {
      console.error('Error getting user progress:', error);
      throw error;
    }
  }

  async updateUserProgress(userId, guideId, updateData) {
    try {
      const progressRef = doc(db, 'guideProgress', userId, 'guides', guideId);
      
      const updates = {
        ...updateData,
        lastAccessedAt: serverTimestamp()
      };

      // Calculate completion percentage if sections are provided
      if (updateData.completedSections && this.guides[guideId]?.sections) {
        const totalSections = this.guides[guideId].sections.length;
        const completedCount = updateData.completedSections.length;
        updates.completionPercentage = Math.round((completedCount / totalSections) * 100);
        updates.isCompleted = completedCount === totalSections;
      }

      await updateDoc(progressRef, updates);
      return updates;
    } catch (error) {
      console.error('Error updating user progress:', error);
      throw error;
    }
  }

  async getUserGuides(userId, limitCount = 10) {
    try {
      const progressRef = collection(db, 'guideProgress', userId, 'guides');
      const q = query(
        progressRef,
        orderBy('lastAccessedAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting user guides:', error);
      throw error;
    }
  }

  // Access History Management
  async logGuideAccess(userId, guideId, accessType = 'view') {
    try {
      const sessionId = `${guideId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const accessRef = doc(db, 'guideAccessHistory', userId, 'sessions', sessionId);
      
      await setDoc(accessRef, {
        id: sessionId,
        userId,
        guideId,
        guideTitle: this.guides[guideId]?.title || 'Unknown Guide',
        accessType, // 'view', 'start', 'complete', 'download'
        timestamp: serverTimestamp(),
        userAgent: navigator.userAgent,
        referrer: document.referrer
      });

      return sessionId;
    } catch (error) {
      console.error('Error logging guide access:', error);
      throw error;
    }
  }

  async getAccessHistory(userId, guideId = null, limitCount = 20) {
    try {
      const accessRef = collection(db, 'guideAccessHistory', userId, 'sessions');
      let q;
      
      if (guideId) {
        q = query(
          accessRef,
          where('guideId', '==', guideId),
          orderBy('timestamp', 'desc'),
          limit(limitCount)
        );
      } else {
        q = query(
          accessRef,
          orderBy('timestamp', 'desc'),
          limit(limitCount)
        );
      }
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting access history:', error);
      throw error;
    }
  }

  // Form Data Management
  async saveFormData(userId, guideId, sectionId, formData) {
    try {
      const progressRef = doc(db, 'guideProgress', userId, 'guides', guideId);
      
      await updateDoc(progressRef, {
        [`formData.${sectionId}`]: formData,
        lastAccessedAt: serverTimestamp()
      });

      return formData;
    } catch (error) {
      console.error('Error saving form data:', error);
      throw error;
    }
  }

  async getFormData(userId, guideId, sectionId = null) {
    try {
      const progress = await this.getUserProgress(userId, guideId);
      
      if (sectionId) {
        return progress.formData?.[sectionId] || {};
      } else {
        return progress.formData || {};
      }
    } catch (error) {
      console.error('Error getting form data:', error);
      throw error;
    }
  }

  // Section Completion Management
  async markSectionComplete(userId, guideId, sectionId) {
    try {
      const progress = await this.getUserProgress(userId, guideId);
      const completedSections = progress.completedSections || [];
      
      if (!completedSections.includes(sectionId)) {
        completedSections.push(sectionId);
        
        await this.updateUserProgress(userId, guideId, {
          completedSections
        });

        // Log completion
        await this.logGuideAccess(userId, guideId, 'section_complete');
      }

      return completedSections;
    } catch (error) {
      console.error('Error marking section complete:', error);
      throw error;
    }
  }

  async markSectionIncomplete(userId, guideId, sectionId) {
    try {
      const progress = await this.getUserProgress(userId, guideId);
      const completedSections = progress.completedSections || [];
      
      const updatedSections = completedSections.filter(id => id !== sectionId);
      
      await this.updateUserProgress(userId, guideId, {
        completedSections: updatedSections
      });

      return updatedSections;
    } catch (error) {
      console.error('Error marking section incomplete:', error);
      throw error;
    }
  }

  // Export and Download Management
  async generateGuideExport(userId, guideId, format = 'pdf') {
    try {
      const progress = await this.getUserProgress(userId, guideId);
      
      // Log export
      await this.logGuideAccess(userId, guideId, 'export');

      // In a real implementation, this would generate a PDF or other format
      // For now, return the progress data
      return {
        guideId,
        userId,
        exportFormat: format,
        generatedAt: new Date().toISOString(),
        data: progress
      };
    } catch (error) {
      console.error('Error generating guide export:', error);
      throw error;
    }
  }

  // Real-time Progress Subscription
  subscribeToProgress(userId, guideId, callback) {
    const progressRef = doc(db, 'guideProgress', userId, 'guides', guideId);
    
    return onSnapshot(progressRef, (doc) => {
      if (doc.exists()) {
        callback({ id: doc.id, ...doc.data() });
      } else {
        callback(null);
      }
    });
  }

  // Utility Methods
  getGuideInfo(guideId) {
    return this.guides[guideId] || null;
  }

  getAllGuides() {
    return Object.values(this.guides);
  }

  async getGuidesSummary(userId) {
    try {
      const userGuides = await this.getUserGuides(userId);
      const allGuides = this.getAllGuides();
      
      return allGuides.map(guide => {
        const progress = userGuides.find(p => p.id === guide.id);
        
        return {
          ...guide,
          progress: progress ? {
            startedAt: progress.startedAt,
            lastAccessedAt: progress.lastAccessedAt,
            completionPercentage: progress.completionPercentage || 0,
            isCompleted: progress.isCompleted || false,
            timeSpent: progress.timeSpent || 0
          } : null
        };
      });
    } catch (error) {
      console.error('Error getting guides summary:', error);
      throw error;
    }
  }
}

export default new GuidesAPI();