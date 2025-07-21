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
  increment
} from 'firebase/firestore';
import { db } from './firebase';
import API_CONFIG, { buildUrl, createRequestConfig } from '../config/apiConfig';

class AssessmentAPI {
  constructor() {
    // Use centralized API configuration
    this.baseURL = API_CONFIG.BASE_URL;
  }

  // =============================================================================
  // FIREBASE OPERATIONS
  // =============================================================================

  async getAssessment(userId, assessmentType) {
    try {
      const assessmentRef = doc(db, 'assessments', `${userId}_${assessmentType}`);
      const assessmentDoc = await getDoc(assessmentRef);
      
      if (assessmentDoc.exists()) {
        return {
          id: assessmentDoc.id,
          ...assessmentDoc.data()
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting assessment:', error);
      throw error;
    }
  }

  async saveAssessmentProgress(userId, assessmentType, progressData) {
    try {
      const assessmentRef = doc(db, 'assessments', `${userId}_${assessmentType}`);
      
      await setDoc(assessmentRef, {
        userId,
        assessmentType,
        ...progressData,
        lastUpdated: serverTimestamp(),
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      return true;
    } catch (error) {
      console.error('Error saving assessment progress:', error);
      throw error;
    }
  }

  async getUserAssessments(userId) {
    try {
      const assessmentsRef = collection(db, 'assessments');
      const q = query(
        assessmentsRef,
        where('userId', '==', userId),
        orderBy('lastUpdated', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const assessments = [];
      
      querySnapshot.forEach((doc) => {
        assessments.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return assessments;
    } catch (error) {
      console.error('Error getting user assessments:', error);
      throw error;
    }
  }

  async deleteAssessment(userId, assessmentType) {
    try {
      const assessmentRef = doc(db, 'assessments', `${userId}_${assessmentType}`);
      await deleteDoc(assessmentRef);
      return true;
    } catch (error) {
      console.error('Error deleting assessment:', error);
      throw error;
    }
  }

  // =============================================================================
  // API COMMUNICATION
  // =============================================================================

  async makeAPICall(endpoint, method = 'GET', data = null) {
    try {
      // Use centralized API configuration
      const config = createRequestConfig(method, data);
      const url = buildUrl(endpoint);

      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`API call failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API call error:', error);
      throw error;
    }
  }

  // =============================================================================
  // AI KNOWLEDGE NAVIGATOR
  // =============================================================================

  async startAIKnowledgeAssessment(userId) {
    try {
      // Call backend to start AI knowledge assessment using centralized config
      const response = await this.makeAPICall(API_CONFIG.ENDPOINTS.ASSESSMENTS.AI_KNOWLEDGE_START, 'POST', {
        user_id: userId,
        assessment_type: "ai_knowledge"
      });

      // Save initial state to Firebase
      await this.saveAssessmentProgress(userId, 'ai_knowledge_navigator', {
        isStarted: true,
        currentQuestionIndex: 0,
        responses: [],
        interactionHistory: [response],
        startedAt: new Date().toISOString()
      });

      return response.data || response;
    } catch (error) {
      console.error('Error starting AI knowledge assessment:', error);
      throw new Error('Failed to start AI Knowledge assessment. Please check your connection and try again.');
    }
  }

  async submitAssessmentResponse(userId, assessmentType, responseData) {
    try {
      // Map frontend assessment types to backend types
      const assessmentTypeMapping = {
        'ai_knowledge_navigator': 'ai_knowledge',
        'change_readiness': 'change_readiness'
      };
      
      const backendAssessmentType = assessmentTypeMapping[assessmentType] || assessmentType;
      
      // Call backend to process response using centralized config
      let endpoint;
      if (assessmentType === 'ai_knowledge_navigator') {
        endpoint = API_CONFIG.ENDPOINTS.ASSESSMENTS.AI_KNOWLEDGE_RESPOND;
      } else if (assessmentType === 'change_readiness') {
        endpoint = API_CONFIG.ENDPOINTS.ASSESSMENTS.CHANGE_READINESS_RESPOND;
      } else {
        endpoint = `/api/${backendAssessmentType}/respond`;
      }
      
      const response = await this.makeAPICall(endpoint, 'POST', {
        user_id: userId,
        assessment_type: backendAssessmentType,
        question_id: responseData.questionId,
        answer: responseData.answer,
        session_data: responseData.sessionData || {}
      });

      // Check if the response was successful
      if (response.success === false) {
        throw new Error(`Assessment failed: ${response.error}`);
      }
      
      return response.data || response;
    } catch (error) {
      console.error('Error submitting assessment response:', error);
      throw new Error('Failed to process assessment response. Please try again.');
    }
  }


  // =============================================================================
  // CHANGE READINESS ASSESSMENT
  // =============================================================================

  async startChangeReadinessAssessment(userId, organizationData, projectData) {
    try {
      // Call backend to start change readiness assessment using centralized config
      const response = await this.makeAPICall(API_CONFIG.ENDPOINTS.ASSESSMENTS.CHANGE_READINESS_START, 'POST', {
        user_id: userId,
        assessment_type: "change_readiness"
      });

      // Save initial state to Firebase
      await this.saveAssessmentProgress(userId, 'change_readiness', {
        isStarted: true,
        organizationData,
        projectData,
        currentAgentIndex: 0,
        responses: [],
        agentAnalysis: {},
        startedAt: new Date().toISOString()
      });

      return response.data || response;
    } catch (error) {
      console.error('Error starting change readiness assessment:', error);
      throw new Error('Failed to start Change Readiness assessment. Please check your connection and try again.');
    }
  }

  async submitChangeReadinessResponse(userId, responseData) {
    try {
      // Call backend to process response using centralized config
      const response = await this.makeAPICall(API_CONFIG.ENDPOINTS.ASSESSMENTS.CHANGE_READINESS_RESPOND, 'POST', {
        user_id: userId,
        assessment_type: "change_readiness",
        question_id: responseData.questionId,
        answer: responseData.answer,
        session_data: responseData.sessionData || {}
      });

      return response.data || response;
    } catch (error) {
      console.error('Error submitting change readiness response:', error);
      throw new Error('Failed to process change readiness response. Please try again.');
    }
  }


  // =============================================================================
  // ASSESSMENT ANALYTICS
  // =============================================================================

  async getAssessmentAnalytics(userId) {
    try {
      const assessments = await this.getUserAssessments(userId);
      
      const analytics = {
        totalAssessments: assessments.length,
        completedAssessments: assessments.filter(a => a.isComplete).length,
        assessmentTypes: {},
        averageScores: {},
        recentActivity: []
      };

      assessments.forEach(assessment => {
        // Count by type
        analytics.assessmentTypes[assessment.assessmentType] = 
          (analytics.assessmentTypes[assessment.assessmentType] || 0) + 1;
        
        // Calculate average scores
        if (assessment.results && assessment.results.overallScore) {
          if (!analytics.averageScores[assessment.assessmentType]) {
            analytics.averageScores[assessment.assessmentType] = [];
          }
          analytics.averageScores[assessment.assessmentType].push(assessment.results.overallScore);
        }
        
        // Recent activity
        if (assessment.lastUpdated) {
          analytics.recentActivity.push({
            type: assessment.assessmentType,
            action: assessment.isComplete ? 'completed' : 'started',
            date: assessment.lastUpdated,
            score: assessment.results?.overallScore
          });
        }
      });

      // Calculate averages
      Object.keys(analytics.averageScores).forEach(type => {
        const scores = analytics.averageScores[type];
        analytics.averageScores[type] = scores.reduce((a, b) => a + b, 0) / scores.length;
      });

      // Sort recent activity
      analytics.recentActivity.sort((a, b) => new Date(b.date) - new Date(a.date));
      analytics.recentActivity = analytics.recentActivity.slice(0, 10);

      return analytics;
    } catch (error) {
      console.error('Error getting assessment analytics:', error);
      throw error;
    }
  }

  // =============================================================================
  // LEARNING PLAN MANAGEMENT
  // =============================================================================

  async saveLearningProgress(userId, assessmentType, progressData) {
    try {
      const progressRef = doc(db, 'learningProgress', `${userId}_${assessmentType}`);
      
      await setDoc(progressRef, {
        userId,
        assessmentType,
        ...progressData,
        lastUpdated: serverTimestamp(),
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      return true;
    } catch (error) {
      console.error('Error saving learning progress:', error);
      throw error;
    }
  }

  async getLearningProgress(userId, assessmentType) {
    try {
      const progressRef = doc(db, 'learningProgress', `${userId}_${assessmentType}`);
      const progressDoc = await getDoc(progressRef);
      
      if (progressDoc.exists()) {
        return {
          id: progressDoc.id,
          ...progressDoc.data()
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting learning progress:', error);
      throw error;
    }
  }

  async updateLessonProgress(userId, assessmentType, lessonId, status) {
    try {
      const progressRef = doc(db, 'learningProgress', `${userId}_${assessmentType}`);
      
      await updateDoc(progressRef, {
        [`lessons.${lessonId}.status`]: status,
        [`lessons.${lessonId}.completedAt`]: status === 'completed' ? new Date().toISOString() : null,
        [`lessons.${lessonId}.lastAccessed`]: new Date().toISOString(),
        lastUpdated: serverTimestamp()
      });
      
      return true;
    } catch (error) {
      console.error('Error updating lesson progress:', error);
      throw error;
    }
  }

  // =============================================================================
  // ACTION ITEM MANAGEMENT
  // =============================================================================

  async createActionItem(userId, projectId, actionItemData) {
    try {
      const actionItemId = `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const actionItem = {
        id: actionItemId,
        userId,
        projectId,
        title: actionItemData.title,
        description: actionItemData.description || '',
        category: actionItemData.category || 'general', // 'learning', 'organizational', 'technical', 'process'
        priority: actionItemData.priority || 'medium', // 'high', 'medium', 'low'
        status: 'pending', // 'pending', 'in_progress', 'completed', 'blocked'
        source: actionItemData.source || 'manual', // 'ai_knowledge_navigator', 'change_readiness', 'agent_generated', 'manual'
        sourceAssessmentId: actionItemData.sourceAssessmentId || null,
        dueDate: actionItemData.dueDate || null,
        estimatedHours: actionItemData.estimatedHours || null,
        dependencies: actionItemData.dependencies || [],
        tags: actionItemData.tags || [],
        assignedTo: actionItemData.assignedTo || userId,
        generatedBy: actionItemData.generatedBy || 'user', // 'assessment', 'ai_agent', 'user'
        metadata: actionItemData.metadata || {}, // Additional context from assessments
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        completedAt: null
      };

      const actionItemRef = doc(db, 'actionItems', actionItemId);
      await setDoc(actionItemRef, actionItem);
      
      return actionItem;
    } catch (error) {
      console.error('Error creating action item:', error);
      throw error;
    }
  }

  async getActionItems(userId, projectId = null, filters = {}) {
    try {
      const actionItemsRef = collection(db, 'actionItems');
      let q = query(
        actionItemsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );

      if (projectId) {
        q = query(
          actionItemsRef,
          where('userId', '==', userId),
          where('projectId', '==', projectId),
          orderBy('createdAt', 'desc')
        );
      }

      const querySnapshot = await getDocs(q);
      let actionItems = [];
      
      querySnapshot.forEach((doc) => {
        actionItems.push({
          id: doc.id,
          ...doc.data()
        });
      });

      // Apply filters
      if (filters.status) {
        actionItems = actionItems.filter(item => item.status === filters.status);
      }
      if (filters.category) {
        actionItems = actionItems.filter(item => item.category === filters.category);
      }
      if (filters.priority) {
        actionItems = actionItems.filter(item => item.priority === filters.priority);
      }
      if (filters.source) {
        actionItems = actionItems.filter(item => item.source === filters.source);
      }

      return actionItems;
    } catch (error) {
      console.error('Error getting action items:', error);
      throw error;
    }
  }

  async updateActionItem(actionItemId, updates) {
    try {
      const actionItemRef = doc(db, 'actionItems', actionItemId);
      const updateData = {
        ...updates,
        lastUpdated: new Date().toISOString()
      };

      // Handle completion
      if (updates.status === 'completed' && !updates.completedAt) {
        updateData.completedAt = new Date().toISOString();
      } else if (updates.status !== 'completed') {
        updateData.completedAt = null;
      }

      await updateDoc(actionItemRef, updateData);
      return true;
    } catch (error) {
      console.error('Error updating action item:', error);
      throw error;
    }
  }

  async deleteActionItem(actionItemId) {
    try {
      const actionItemRef = doc(db, 'actionItems', actionItemId);
      await deleteDoc(actionItemRef);
      return true;
    } catch (error) {
      console.error('Error deleting action item:', error);
      throw error;
    }
  }

  async generateActionItemsFromAssessment(userId, projectId, assessmentType, assessmentData) {
    try {
      console.log('generateActionItemsFromAssessment - assessmentData:', assessmentData);
      const actionItems = [];

      if (assessmentType === 'ai_knowledge_navigator') {
        // Generate learning-focused action items
        const analysisData = assessmentData.analysis || assessmentData;
        const maturityScores = assessmentData.maturityScores || analysisData.maturity_scores || {};
        const learningPlan = assessmentData.learningPath || analysisData.learning_path || {};
        
        console.log('maturityScores:', maturityScores);
        console.log('learningPlan:', learningPlan);

        // Create action items for low maturity areas
        Object.entries(maturityScores).forEach(([area, score]) => {
          console.log(`Checking maturity area ${area}: ${score}`);
          if (score < 3) { // Below intermediate level
            console.log(`Creating action item for low maturity area: ${area}`);
            const actionItem = {
              title: `Improve ${area.replace('_', ' ')} knowledge`,
              description: `Focus on building foundational knowledge in ${area.replace('_', ' ')} to reach intermediate level`,
              category: 'learning',
              priority: score < 2 ? 'high' : 'medium',
              source: 'ai_knowledge_navigator',
              sourceAssessmentId: assessmentData.assessmentId,
              generatedBy: 'assessment',
              estimatedHours: 8,
              tags: ['learning', area],
              metadata: {
                currentScore: score,
                targetScore: 3,
                assessmentArea: area
              }
            };
            actionItems.push(actionItem);
          }
        });

        // Create action items from learning plan recommendations
        const learningResources = learningPlan.learning_resources || learningPlan.learningResources || [];
        const recommendations = learningPlan.basic_recommendations || learningPlan.basicRecommendations || learningResources || [];
        console.log('recommendations:', recommendations);
        if (recommendations.length > 0) {
          console.log(`Creating action items from ${recommendations.length} recommendations`);
          recommendations.slice(0, 3).forEach((recommendation, index) => {
            const actionItem = {
              title: recommendation.title || `Learning Recommendation ${index + 1}`,
              description: recommendation.description || recommendation,
              category: 'learning',
              priority: index === 0 ? 'high' : 'medium',
              source: 'ai_knowledge_navigator',
              sourceAssessmentId: assessmentData.assessmentId,
              generatedBy: 'assessment',
              estimatedHours: 4,
              tags: ['learning', 'recommendation'],
              metadata: {
                recommendationType: 'basic',
                order: index
              }
            };
            actionItems.push(actionItem);
          });
        }
      }

      if (assessmentType === 'change_readiness') {
        // Generate organizational and process action items
        const readinessLevel = assessmentData.readinessLevel;
        const recommendations = assessmentData.recommendations || [];
        const agentAnalysis = assessmentData.agentAnalysis || {};

        // Create high-priority organizational actions based on readiness level
        if (readinessLevel === 'get_help') {
          actionItems.push({
            title: 'Schedule organizational readiness consultation',
            description: 'Your organization needs additional preparation before AI implementation. Schedule a consultation to identify key blockers.',
            category: 'organizational',
            priority: 'high',
            source: 'change_readiness',
            sourceAssessmentId: assessmentData.assessmentId,
            generatedBy: 'assessment',
            estimatedHours: 2,
            tags: ['consultation', 'readiness'],
            metadata: { readinessLevel }
          });
        }

        if (readinessLevel === 'prepare_first') {
          actionItems.push({
            title: 'Develop change management plan',
            description: 'Create a structured plan for managing organizational change during AI implementation.',
            category: 'process',
            priority: 'high',
            source: 'change_readiness',
            sourceAssessmentId: assessmentData.assessmentId,
            generatedBy: 'assessment',
            estimatedHours: 12,
            tags: ['change-management', 'planning'],
            metadata: { readinessLevel }
          });
        }

        // Create action items from agent recommendations
        recommendations.slice(0, 5).forEach((recommendation, index) => {
          const actionItem = {
            title: recommendation.title || `Change Readiness Action ${index + 1}`,
            description: recommendation.description || recommendation,
            category: recommendation.category || 'organizational',
            priority: index < 2 ? 'high' : 'medium',
            source: 'change_readiness',
            sourceAssessmentId: assessmentData.assessmentId,
            generatedBy: 'assessment',
            estimatedHours: recommendation.estimatedHours || 6,
            tags: ['change-readiness', 'recommendation'],
            metadata: {
              recommendationType: 'agent',
              order: index,
              agent: recommendation.agent
            }
          };
          actionItems.push(actionItem);
        });
      }

      // Create all action items in database
      const createdActionItems = [];
      for (const actionItemData of actionItems) {
        const createdItem = await this.createActionItem(userId, projectId, actionItemData);
        createdActionItems.push(createdItem);
      }

      return createdActionItems;
    } catch (error) {
      console.error('Error generating action items from assessment:', error);
      throw error;
    }
  }

  async getActionItemAnalytics(userId, projectId = null) {
    try {
      const actionItems = await this.getActionItems(userId, projectId);
      
      const analytics = {
        totalItems: actionItems.length,
        byStatus: {},
        byCategory: {},
        byPriority: {},
        bySource: {},
        completionRate: 0,
        overdueTasks: 0,
        recentActivity: []
      };

      actionItems.forEach(item => {
        // Count by status
        analytics.byStatus[item.status] = (analytics.byStatus[item.status] || 0) + 1;
        
        // Count by category
        analytics.byCategory[item.category] = (analytics.byCategory[item.category] || 0) + 1;
        
        // Count by priority
        analytics.byPriority[item.priority] = (analytics.byPriority[item.priority] || 0) + 1;
        
        // Count by source
        analytics.bySource[item.source] = (analytics.bySource[item.source] || 0) + 1;
        
        // Check for overdue items
        if (item.dueDate && new Date(item.dueDate) < new Date() && item.status !== 'completed') {
          analytics.overdueTasks++;
        }
        
        // Recent activity
        analytics.recentActivity.push({
          id: item.id,
          title: item.title,
          status: item.status,
          lastUpdated: item.lastUpdated,
          completedAt: item.completedAt
        });
      });

      // Calculate completion rate
      const completedItems = analytics.byStatus.completed || 0;
      analytics.completionRate = actionItems.length > 0 ? (completedItems / actionItems.length * 100).toFixed(1) : 0;

      // Sort recent activity
      analytics.recentActivity.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
      analytics.recentActivity = analytics.recentActivity.slice(0, 10);

      return analytics;
    } catch (error) {
      console.error('Error getting action item analytics:', error);
      throw error;
    }
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  async exportAssessmentData(userId, assessmentType) {
    try {
      const assessment = await this.getAssessment(userId, assessmentType);
      const progress = await this.getLearningProgress(userId, assessmentType);
      
      const exportData = {
        assessment,
        progress,
        exportedAt: new Date().toISOString(),
        version: '1.0'
      };
      
      return exportData;
    } catch (error) {
      console.error('Error exporting assessment data:', error);
      throw error;
    }
  }

  async importAssessmentData(userId, importData) {
    try {
      if (importData.assessment) {
        await this.saveAssessmentProgress(
          userId,
          importData.assessment.assessmentType,
          importData.assessment
        );
      }
      
      if (importData.progress) {
        await this.saveLearningProgress(
          userId,
          importData.progress.assessmentType,
          importData.progress
        );
      }
      
      return true;
    } catch (error) {
      console.error('Error importing assessment data:', error);
      throw error;
    }
  }

  // =============================================================================
  // ERROR HANDLING AND VALIDATION
  // =============================================================================

  validateAssessmentData(data) {
    const errors = [];
    
    if (!data.userId) {
      errors.push('User ID is required');
    }
    
    if (!data.assessmentType) {
      errors.push('Assessment type is required');
    }
    
    if (data.responses && !Array.isArray(data.responses)) {
      errors.push('Responses must be an array');
    }
    
    return errors;
  }

  sanitizeUserInput(input) {
    if (typeof input !== 'string') return input;
    
    // Basic sanitization
    return input
      .trim()
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  }
}

// Export singleton instance
const assessmentAPI = new AssessmentAPI();
export default assessmentAPI;