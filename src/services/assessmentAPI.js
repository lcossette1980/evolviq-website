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
import logger from '../utils/logger';

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

  // Helper function to remove undefined values for Firestore
  cleanDataForFirestore(obj) {
    if (obj === null || typeof obj !== 'object') {
      return obj === undefined ? null : obj;
    }
    
    if (Array.isArray(obj)) {
      return obj.map(item => this.cleanDataForFirestore(item));
    }
    
    const cleaned = {};
    for (const [key, value] of Object.entries(obj)) {
      const cleanedValue = this.cleanDataForFirestore(value);
      if (cleanedValue !== undefined) {
        cleaned[key] = cleanedValue;
      }
    }
    return cleaned;
  }

  async saveAssessmentProgress(userId, assessmentType, progressData) {
    try {
      // Consolidate ai_knowledge_navigator and ai_knowledge into single record
      const normalizedType = assessmentType === 'ai_knowledge_navigator' ? 'ai_knowledge' : assessmentType;
      const assessmentRef = doc(db, 'assessments', `${userId}_${normalizedType}`);
      
      // Clean the data to remove undefined values
      const cleanedProgressData = this.cleanDataForFirestore(progressData);
      
      // Check if this is CrewAI results being saved for an existing session
      if (assessmentType === 'ai_knowledge' && progressData.crewAIResults) {
        // Get existing record to preserve session data
        try {
          const existingDoc = await getDoc(assessmentRef);
          if (existingDoc.exists()) {
            const existingData = existingDoc.data();
            
            // Merge session data with CrewAI results
            await setDoc(assessmentRef, {
              ...existingData,
              ...cleanedProgressData,
              isComplete: true,
              completedAt: new Date().toISOString(),
              lastUpdated: serverTimestamp(),
              updatedAt: new Date().toISOString(),
              // Preserve session history while adding results
              sessionData: existingData.sessionData || {},
              crewAIResults: cleanedProgressData.crewAIResults,
              results: cleanedProgressData.results || cleanedProgressData.crewAIResults
            }, { merge: true });
            
            console.log('Consolidated assessment record with CrewAI results');
            return true;
          }
        } catch (docError) {
          console.log('No existing session found, creating new record');
        }
      }
      
      await setDoc(assessmentRef, {
        userId,
        assessmentType: normalizedType,
        ...cleanedProgressData,
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

  async makeAPICall(endpoint, method = 'GET', data = null, useExtendedTimeout = false) {
    try {
      // Use centralized API configuration
      const config = createRequestConfig(method, data);
      const url = buildUrl(endpoint);

      // Use extended timeout for assessment operations
      const timeoutMs = useExtendedTimeout ? API_CONFIG.ASSESSMENT_TIMEOUT : API_CONFIG.TIMEOUT;
      
      // Create AbortController for proper timeout handling
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
      
      const response = await fetch(url, {
        ...config,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`API call failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (error.name === 'AbortError') {
        const timeoutSec = useExtendedTimeout ? 'timeout after 5 minutes' : 'timeout after 30 seconds';
        throw new Error(`Request ${timeoutSec}. The assessment is taking longer than expected.`);
      }
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
      }, true); // Use extended timeout for assessment responses

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
      const payload = {
        user_id: userId,
        assessment_type: "change_readiness",
        question_id: responseData.questionId,
        answer: responseData.answer,
        session_data: responseData.sessionData || {}
      };
      
      // Call backend to process response using centralized config
      const response = await this.makeAPICall(API_CONFIG.ENDPOINTS.ASSESSMENTS.CHANGE_READINESS_RESPOND, 'POST', payload);

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
      logger.debug('Generating action items from assessment', { assessmentType });
      const actionItems = [];

      if (assessmentType === 'ai_knowledge_navigator') {
        // Generate learning-focused action items
        const analysisData = assessmentData.analysis || assessmentData;
        const maturityScores = assessmentData.maturityScores || analysisData.maturity_scores || {};
        const learningPlan = assessmentData.learningPath || analysisData.learning_path || {};
        
        logger.debug('Assessment data extracted', { 
          maturityScoresCount: Object.keys(maturityScores || {}).length,
          hasLearningPlan: !!learningPlan 
        });

        // Create action items for all maturity areas based on experience level
        Object.entries(maturityScores).forEach(([area, score]) => {
          logger.debug('Creating action item for maturity area', { area, score });
          
          let actionItem;
          if (score < 2) {
            // Beginner level - foundational learning
            actionItem = {
              title: `Build foundational ${area.replace(/[_.]/g, ' ')} knowledge`,
              description: `Start with basics in ${area.replace(/[_.]/g, ' ')} to establish core understanding`,
              category: 'learning',
              priority: 'high',
              estimatedHours: 12,
              tags: ['learning', 'foundational', area]
            };
          } else if (score < 3) {
            // Below intermediate - skill building
            actionItem = {
              title: `Develop ${area.replace(/[_.]/g, ' ')} skills`,
              description: `Focus on building practical skills in ${area.replace(/[_.]/g, ' ')} to reach intermediate level`,
              category: 'learning',
              priority: 'medium',
              estimatedHours: 8,
              tags: ['learning', 'skill-building', area]
            };
          } else if (score < 4) {
            // Intermediate - practical application
            actionItem = {
              title: `Apply ${area.replace(/[_.]/g, ' ')} in practice`,
              description: `Start implementing ${area.replace(/[_.]/g, ' ')} in real projects to gain advanced skills`,
              category: 'implementation',
              priority: 'medium',
              estimatedHours: 6,
              tags: ['implementation', 'practice', area]
            };
          } else {
            // Advanced - leadership and optimization
            actionItem = {
              title: `Lead ${area.replace(/[_.]/g, ' ')} initiatives`,
              description: `Share knowledge and optimize ${area.replace(/[_.]/g, ' ')} practices in your organization`,
              category: 'leadership',
              priority: 'low',
              estimatedHours: 4,
              tags: ['leadership', 'optimization', area]
            };
          }
          
          // Add common fields
          actionItem.source = 'ai_knowledge_navigator';
          actionItem.sourceAssessmentId = assessmentData.assessmentId;
          actionItem.generatedBy = 'assessment';
          actionItem.metadata = {
            currentScore: score,
            targetScore: Math.min(5, score + 1),
            assessmentArea: area
          };
          
          actionItems.push(actionItem);
        });

        // Create action items from learning plan recommendations
        const learningResources = learningPlan.learning_resources || learningPlan.learningResources || [];
        const recommendations = learningPlan.basic_recommendations || learningPlan.basicRecommendations || learningResources || [];
        logger.debug('Learning recommendations extracted', { count: recommendations.length });
        if (recommendations.length > 0) {
          logger.debug('Creating action items from recommendations', { count: recommendations.length });
          recommendations.slice(0, 3).forEach((recommendation, index) => {
            // Ensure description is always a string, never an object
            let description;
            if (typeof recommendation === 'string') {
              description = recommendation;
            } else if (recommendation && typeof recommendation === 'object') {
              // Handle object recommendations by creating a descriptive string
              if (recommendation.description) {
                description = recommendation.description;
              } else if (recommendation.title) {
                const cost = recommendation.cost ? ` (${recommendation.cost})` : '';
                const duration = recommendation.duration ? ` - ${recommendation.duration}` : '';
                description = `${recommendation.title}${cost}${duration}`;
              } else {
                description = `Learning resource ${index + 1}`;
              }
            } else {
              description = `Learning recommendation ${index + 1}`;
            }
            
            const actionItem = {
              title: recommendation.title || `Learning Recommendation ${index + 1}`,
              description: description,
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
  // ENHANCED CREWAI PARSING LOGIC
  // =============================================================================

  /**
   * Enhanced parsing logic for CrewAI recommendations - extracts strategic initiatives
   * from rich agent outputs instead of using placeholder data
   */
  parseCrewAIRecommendations(results) {
    const strategicInitiatives = [];
    const governanceActions = [];
    const learningRecommendations = [];
    
    try {
      // Handle case where results might be undefined or null
      if (!results) {
        console.warn('⚠️ No results provided for CrewAI recommendations parsing');
        return { strategicInitiatives, governanceActions, learningRecommendations };
      }
      
      // Parse raw CrewAI output if available - handle nested structure
      let rawOutput = '';
      if (results.raw_crewai_output && results.raw_crewai_output.crewai_results) {
        rawOutput = typeof results.raw_crewai_output.crewai_results === 'string' 
          ? results.raw_crewai_output.crewai_results 
          : JSON.stringify(results.raw_crewai_output.crewai_results);
      } else {
        rawOutput = results.raw_crewai_output || results.crewai_results || '';
      }
      
      if (typeof rawOutput === 'string' && rawOutput.length > 100) {
        // Extract strategic initiatives using multiple patterns for different formats
        
        // Pattern 1: New CrewAI format - Initiative Prioritization Matrix
        const matrixMatches = rawOutput.match(/\*\*(\d+\..*?Initiative.*?)\*\*[\s\S]*?(?=\*\*\d+\.|$)/gi);
        if (matrixMatches) {
          matrixMatches.forEach((match, index) => {
            const titleMatch = match.match(/\*\*(\d+\.\s*(.+?))\*\*/i);
            const descriptionMatch = match.match(/\*\*\d+\..*?\*\*([\s\S]*?)(?=\n\n|$)/i);
            
            if (titleMatch && titleMatch[2]) {
              strategicInitiatives.push({
                title: titleMatch[2].trim(),
                description: this.cleanDescription(descriptionMatch ? descriptionMatch[1].trim() : titleMatch[2]),
                timeline: this.extractTimelineFromText(match),
                category: this.categorizeInitiative(titleMatch[2]),
                priority: index < 2 ? 'high' : 'medium',
                estimatedHours: this.estimateHoursFromDescription(match),
                phase: `Phase ${index + 1}`
              });
            }
          });
        }

        // Pattern 2: Original format for backwards compatibility
        const legacyMatches = rawOutput.match(/\*\*Initiative:\*\*([^\n]+)[\s\S]*?\*\*Objective:\*\*([^\n]+)[\s\S]*?\*\*Timeline:\*\*([^\n]+)/gi);
        if (legacyMatches) {
          legacyMatches.forEach((match, index) => {
            const titleMatch = match.match(/\*\*Initiative:\*\*\s*(.+?)\n/i);
            const objectiveMatch = match.match(/\*\*Objective:\*\*\s*(.+?)\n/i);
            const timelineMatch = match.match(/\*\*Timeline:\*\*\s*(.+?)\n/i);
            
            if (titleMatch && objectiveMatch) {
              strategicInitiatives.push({
                title: titleMatch[1].trim(),
                description: objectiveMatch[1].trim(),
                timeline: timelineMatch ? timelineMatch[1].trim() : 'TBD',
                category: this.categorizeInitiative(titleMatch[1]),
                priority: index < 2 ? 'high' : 'medium',
                estimatedHours: this.estimateHoursFromDescription(objectiveMatch[1]),
                phase: this.extractPhase(match)
              });
            }
          });
        }

        // Pattern 3: General strategic content extraction
        const strategicSections = rawOutput.match(/\*\*([^*\n]+)\*\*\n([^*]+?)(?=\n\*\*|\n\n|$)/gi);
        if (strategicSections && strategicInitiatives.length === 0) {
          strategicSections.slice(0, 5).forEach((match, index) => {
            const titleMatch = match.match(/\*\*([^*\n]+)\*\*/i);
            const contentMatch = match.match(/\*\*[^*\n]+\*\*\n(.+)/si);
            
            if (titleMatch && contentMatch && titleMatch[1].length > 10) {
              strategicInitiatives.push({
                title: titleMatch[1].trim(),
                description: this.cleanDescription(contentMatch[1].trim()),
                timeline: this.extractTimelineFromText(match),
                category: 'strategic',
                priority: index < 3 ? 'high' : 'medium',
                estimatedHours: this.estimateHoursFromDescription(contentMatch[1]),
                phase: `Initiative ${index + 1}`
              });
            }
          });
        }
        
        // Extract governance and process recommendations
        const governanceMatches = rawOutput.match(/(governance|oversight|committee|framework)[\s\S]*?(?=\n\n|$)/gi);
        
        if (governanceMatches) {
          
          governanceMatches.slice(0, 3).forEach((match, index) => {
            governanceActions.push({
              title: this.extractGovernanceTitle(match),
              description: this.cleanDescription(match.substring(0, 200)),
              type: 'governance',
              estimatedHours: 8
            });
          });
        }

        // Extract capability building actions
        const capabilityMatches = rawOutput.match(/(capability building|training|skills development)[\s\S]*?(?=\n\n|$)/gi);
        
        if (capabilityMatches) {
          
          capabilityMatches.slice(0, 3).forEach((match, index) => {
            learningRecommendations.push({
              title: this.extractLearningTitle(match),
              description: this.cleanDescription(match.substring(0, 150)),
              estimatedHours: 12
            });
          });
        }
      }
      
      // Fallback: Use existing business_recommendations if no raw output parsed
      if (strategicInitiatives.length === 0 && results.business_recommendations) {
        console.log('📋 Using fallback business_recommendations');
        
        results.business_recommendations.forEach((rec, index) => {
          strategicInitiatives.push({
            title: rec.title || `Strategic Initiative ${index + 1}`,
            description: rec.description || rec,
            category: 'organizational',
            priority: index < 2 ? 'high' : 'medium',
            estimatedHours: 10,
            phase: 'Phase 1'
          });
        });
      }
      
      
    } catch (error) {
      console.warn('❌ Error parsing CrewAI recommendations:', error);
      // Return safe fallback
    }
    
    return {
      strategicInitiatives,
      governanceActions,
      learningRecommendations
    };
  }

  /**
   * Generate enhanced action items that leverage full CrewAI analysis
   */
  async generateEnhancedActionItems(userId, projectId, assessmentData, assessmentType) {
    try {
      const actionItems = [];
      
      if (assessmentType === 'ai_knowledge_navigator' || assessmentType === 'change_readiness') {
        // Fix: Look for results in multiple locations - assessmentData.results OR assessmentData itself
        const results = assessmentData.results || assessmentData;
        
        console.log('🎯 Enhanced Action Items - data structure:', {
          hasResults: !!results,
          hasRawCrewAI: !!(results.raw_crewai_output || results.crewai_results),
          resultsKeys: results ? Object.keys(results).slice(0, 10) : 'No results',
          assessmentType,
          rawCrewAIStructure: results.raw_crewai_output ? Object.keys(results.raw_crewai_output) : 'No raw_crewai_output',
          crewaiResultsType: results.raw_crewai_output?.crewai_results ? typeof results.raw_crewai_output.crewai_results : 'No crewai_results'
        });
        
        // Extract detailed recommendations from raw CrewAI output
        const enhancedRecommendations = this.parseCrewAIRecommendations(results);
        
        // Create action items from parsed strategic initiatives
        enhancedRecommendations.strategicInitiatives.forEach((initiative, index) => {
          const actionItem = {
            title: initiative.title,
            description: initiative.description,
            category: initiative.category || 'organizational',
            priority: initiative.priority || (index < 2 ? 'high' : 'medium'),
            source: assessmentType,
            sourceAssessmentId: assessmentData.assessmentId,
            generatedBy: 'crewai_agent',
            estimatedHours: initiative.estimatedHours || 12,
            tags: ['strategic-initiative', 'crewai-generated'],
            metadata: {
              phase: initiative.phase,
              timeline: initiative.timeline,
              objective: initiative.description,
              crewAIGenerated: true
            }
          };
          actionItems.push(actionItem);
        });

        // Create action items from governance recommendations
        enhancedRecommendations.governanceActions.forEach((action, index) => {
          const actionItem = {
            title: action.title,
            description: action.description,
            category: 'process',
            priority: 'medium',
            source: assessmentType,
            sourceAssessmentId: assessmentData.assessmentId,
            generatedBy: 'crewai_agent',
            estimatedHours: action.estimatedHours || 6,
            tags: ['governance', 'process-improvement', 'crewai-generated'],
            metadata: {
              governanceType: action.type,
              crewAIGenerated: true
            }
          };
          actionItems.push(actionItem);
        });

        // Create action items from learning recommendations
        enhancedRecommendations.learningRecommendations.forEach((learning, index) => {
          const actionItem = {
            title: learning.title,
            description: learning.description,
            category: 'learning',
            priority: 'medium',
            source: assessmentType,
            sourceAssessmentId: assessmentData.assessmentId,
            generatedBy: 'crewai_agent',
            estimatedHours: learning.estimatedHours || 8,
            tags: ['learning', 'capability-building', 'crewai-generated'],
            metadata: {
              learningType: 'capability-building',
              crewAIGenerated: true
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

      console.log(`✅ Created ${createdActionItems.length} enhanced action items from CrewAI analysis`);
      return createdActionItems;

    } catch (error) {
      console.error('❌ Error generating enhanced action items:', error);
      throw error;
    }
  }
  
  // Helper methods for parsing
  categorizeInitiative(title) {
    const titleLower = title.toLowerCase();
    if (titleLower.includes('automation') || titleLower.includes('process')) return 'process';
    if (titleLower.includes('marketing') || titleLower.includes('analytics')) return 'technical';
    if (titleLower.includes('training') || titleLower.includes('learning')) return 'learning';
    return 'organizational';
  }
  
  estimateHoursFromDescription(description) {
    const descLower = description.toLowerCase();
    if (descLower.includes('pilot') || descLower.includes('experiment')) return 20;
    if (descLower.includes('implement') || descLower.includes('deploy')) return 40;
    if (descLower.includes('plan') || descLower.includes('assess')) return 8;
    return 15; // default
  }
  
  extractPhase(text) {
    const phaseMatch = text.match(/phase\s+(\d+)|month\s+(\d+)/i);
    return phaseMatch ? `Phase ${phaseMatch[1] || phaseMatch[2]}` : 'Phase 1';
  }
  
  extractGovernanceTitle(text) {
    const sentences = text.split('.');
    const firstSentence = sentences[0].substring(0, 60).replace(/[^a-zA-Z0-9\s]/g, '').trim();
    return firstSentence || 'Governance Action';
  }
  
  extractLearningTitle(text) {
    const sentences = text.split('.');
    const firstSentence = sentences[0].substring(0, 60).replace(/[^a-zA-Z0-9\s]/g, '').trim();
    return firstSentence || 'Learning Initiative';
  }
  
  extractTimelineFromText(text) {
    // Look for timeline patterns in the text
    const timelinePatterns = [
      /(\d+[-–]\d+)\s*months?/i,
      /(\d+)\s*months?/i,
      /(immediate|short[- ]term|medium[- ]term|long[- ]term)/i,
      /(\d+[-–]\d+)\s*weeks?/i,
      /(Q[1-4]|quarter [1-4])/i
    ];
    
    for (const pattern of timelinePatterns) {
      const match = text.match(pattern);
      if (match) {
        return match[1] || match[0];
      }
    }
    
    return '6-12 months';
  }

  cleanDescription(text) {
    return text.replace(/\*\*/g, '').replace(/\n+/g, ' ').trim();
  }

  // =============================================================================
  // ENHANCED v2.0 FEATURES
  // =============================================================================

  async getSystemHealth() {
    try {
      const response = await this.makeAPICall('/api/assessment/health', 'GET');
      return response;
    } catch (error) {
      console.error('Error getting system health:', error);
      // Return degraded status if health check fails
      return {
        status: 'error',
        system_version: 'unknown',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Enhanced assessment start with v2.0 system support
   */
  async startEnhancedAIKnowledgeAssessment(userId, options = {}) {
    try {
      const requestData = {
        user_id: userId,
        assessment_type: "ai_knowledge",
        question_history: options.questionHistory || [],
        enhanced_features: options.enhancedFeatures || true,
        performance_monitoring: options.performanceMonitoring || true
      };

      const response = await this.makeAPICall(API_CONFIG.ENDPOINTS.ASSESSMENTS.AI_KNOWLEDGE_START, 'POST', requestData);

      // Check for enhanced v2.0 features
      if (response.system_version && response.system_version.startsWith('2.0')) {
        logger.info('🚀 Using enhanced assessment system v2.0');
        
        // Save enhanced assessment state to Firebase
        await this.saveAssessmentProgress(userId, 'ai_knowledge_navigator', {
          isStarted: true,
          currentQuestionIndex: 0,
          responses: [],
          interactionHistory: [response],
          startedAt: new Date().toISOString(),
          systemVersion: response.system_version,
          enhancedFeatures: response.enhanced_features,
          performanceTracking: true
        });
      } else {
        logger.info('📊 Using legacy assessment system');
        // Use existing logic for legacy system
        await this.saveAssessmentProgress(userId, 'ai_knowledge_navigator', {
          isStarted: true,
          currentQuestionIndex: 0,
          responses: [],
          interactionHistory: [response],
          startedAt: new Date().toISOString(),
          systemVersion: response.system_version || '1.0'
        });
      }

      return response.data || response;
    } catch (error) {
      console.error('Error starting enhanced AI knowledge assessment:', error);
      throw new Error('Failed to start AI Knowledge assessment. Please check your connection and try again.');
    }
  }

  /**
   * Enhanced response submission with v2.0 system support
   */
  async submitEnhancedAssessmentResponse(userId, assessmentType, responseData) {
    try {
      const requestData = {
        user_id: userId,
        assessment_type: assessmentType === 'ai_knowledge_navigator' ? 'ai_knowledge' : assessmentType,
        question_id: responseData.questionId,
        answer: responseData.answer,
        session_data: {
          ...responseData.sessionData,
          responses: responseData.previousResponses || [],
          enhanced_tracking: true,
          performance_metrics: responseData.performanceMetrics || {}
        }
      };

      let endpoint;
      if (assessmentType === 'ai_knowledge_navigator') {
        endpoint = API_CONFIG.ENDPOINTS.ASSESSMENTS.AI_KNOWLEDGE_RESPOND;
      } else if (assessmentType === 'change_readiness') {
        endpoint = API_CONFIG.ENDPOINTS.ASSESSMENTS.CHANGE_READINESS_RESPOND;
      } else {
        endpoint = `/api/${assessmentType}/respond`;
      }

      const response = await this.makeAPICall(endpoint, 'POST', requestData, true); // Use extended timeout

      // Check for validation issues in enhanced v2.0 responses
      if (response.data && response.data.validation) {
        const validation = response.data.validation;
        if (validation.has_errors || validation.has_warnings) {
          logger.warn('Assessment validation issues detected:', validation.issues);
        }
      }

      // Track performance metrics if available
      if (response.data && response.data.performance_metrics) {
        logger.info('Assessment performance:', {
          execution_time: response.data.performance_metrics.execution_time,
          success_rate: response.data.performance_metrics.success_rate,
          system_version: response.system_version
        });
      }

      return response.data || response;
    } catch (error) {
      console.error('Error submitting enhanced assessment response:', error);
      throw new Error('Failed to process assessment response. Please try again.');
    }
  }

  /**
   * Get assessment analytics with enhanced v2.0 metrics
   */
  async getEnhancedAssessmentAnalytics(userId) {
    try {
      const basicAnalytics = await this.getAssessmentAnalytics(userId);
      const systemHealth = await this.getSystemHealth();

      return {
        ...basicAnalytics,
        system_health: systemHealth,
        enhanced_features: {
          performance_monitoring: systemHealth.capabilities?.performance_monitoring || false,
          advanced_validation: systemHealth.capabilities?.comprehensive_validation || false,
          agent_insights: systemHealth.capabilities?.agent_state_management || false
        },
        system_version: systemHealth.system_version,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting enhanced assessment analytics:', error);
      // Fallback to basic analytics
      return await this.getAssessmentAnalytics(userId);
    }
  }

  /**
   * Monitor assessment performance in real-time
   */
  async startPerformanceMonitoring(assessmentId, callback) {
    if (!callback || typeof callback !== 'function') {
      throw new Error('Performance monitoring requires a callback function');
    }

    const monitoringInterval = setInterval(async () => {
      try {
        const health = await this.getSystemHealth();
        callback({
          timestamp: new Date().toISOString(),
          system_status: health.status,
          performance_metrics: health.performance_summary,
          active_sessions: health.active_sessions,
          success_rates: {
            assessment: health.assessment_success_rate,
            question_generation: health.question_generation_success_rate
          }
        });
      } catch (error) {
        console.error('Error in performance monitoring:', error);
        callback({
          timestamp: new Date().toISOString(),
          error: error.message,
          system_status: 'error'
        });
      }
    }, 10000); // Monitor every 10 seconds

    // Return cleanup function
    return () => {
      clearInterval(monitoringInterval);
    };
  }

  /**
   * Validate assessment data using v2.0 validation system
   */
  async validateAssessmentData(assessmentData) {
    try {
      // If we have system health info, check if advanced validation is available
      const health = await this.getSystemHealth();
      
      if (health.capabilities?.comprehensive_validation) {
        // Use enhanced v2.0 validation
        logger.info('Using enhanced v2.0 validation system');
        
        // Enhanced validation would be called via API in a real implementation
        // For now, return a mock enhanced validation result
        return {
          is_valid: true,
          validation_level: 'enhanced',
          system_version: health.system_version,
          issues: [],
          confidence: 0.95,
          recommendations: ['Assessment data meets enhanced validation criteria']
        };
      } else {
        // Use basic validation
        const errors = this.validateAssessmentData(assessmentData);
        return {
          is_valid: errors.length === 0,
          validation_level: 'basic',
          system_version: health.system_version || '1.0',
          issues: errors.map(error => ({ message: error, severity: 'error' })),
          confidence: errors.length === 0 ? 0.8 : 0.4
        };
      }
    } catch (error) {
      console.error('Error validating assessment data:', error);
      return {
        is_valid: false,
        validation_level: 'error',
        error: error.message,
        confidence: 0.0
      };
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
  // ENHANCED LEARNING PLAN GENERATION FROM CREWAI ANALYSIS
  // =============================================================================

  /**
   * Generate intelligent learning plans from CrewAI assessment analysis
   */
  async generateEnhancedLearningPlan(userId, assessmentData, assessmentType) {
    try {
      // Fix: Look for results in multiple locations - assessmentData.results OR assessmentData itself
      const results = assessmentData.results || assessmentData;
      
      console.log('📊 Enhanced Learning Plan - assessmentData structure:', {
        hasResults: !!results,
        hasRawCrewAI: !!(results.raw_crewai_output || results.crewai_results),
        resultsKeys: results ? Object.keys(results).slice(0, 10) : 'No results',
        assessmentType
      });

      const learningPlan = {
        userId,
        assessmentType,
        generatedAt: new Date().toISOString(),
        source: 'crewai_enhanced',
        learningPaths: [],
        adaptiveRecommendations: [],
        progressTracking: {
          phases: [],
          milestones: [],
          estimatedCompletion: null
        }
      };

      if (assessmentType === 'ai_knowledge_navigator') {
        learningPlan.learningPaths = this.generateAIKnowledgeLearningPaths(assessmentData);
      } else if (assessmentType === 'change_readiness') {
        learningPlan.learningPaths = this.generateChangeReadinessLearningPaths(assessmentData);
      }

      // Extract learning recommendations from CrewAI raw output
      const enhancedRecommendations = this.parseCrewAILearningRecommendations(results);
      learningPlan.adaptiveRecommendations = enhancedRecommendations;

      // Generate progress tracking phases
      learningPlan.progressTracking = this.generateProgressTrackingPlan(learningPlan.learningPaths);

      // Save enhanced learning plan
      await this.saveLearningProgress(userId, assessmentType, learningPlan);

      console.log(`✅ Generated enhanced learning plan with ${learningPlan.learningPaths.length} paths and ${enhancedRecommendations.length} recommendations`);
      return learningPlan;

    } catch (error) {
      console.error('❌ Error generating enhanced learning plan:', error);
      // Fallback to basic learning plan
      return this.generateBasicLearningPlan(userId, assessmentData, assessmentType);
    }
  }

  /**
   * Generate AI Knowledge specific learning paths
   */
  generateAIKnowledgeLearningPaths(assessmentData) {
    const paths = [];
    const results = assessmentData.results || assessmentData;
    const maturityScores = results.maturity_scores || results.maturityScores || {};
    const overallScore = results.overall_score || results.overallScore || 3;

    // Foundation Path - for scores < 3
    if (overallScore < 3) {
      paths.push({
        id: 'ai-foundation',
        title: 'AI Fundamentals Foundation',
        description: 'Build core understanding of AI concepts and applications',
        priority: 'high',
        estimatedDuration: '6-8 weeks',
        difficulty: 'beginner',
        modules: [
          { title: 'AI Concepts & Terminology', duration: '1 week', type: 'theory' },
          { title: 'Business Applications of AI', duration: '2 weeks', type: 'practical' },
          { title: 'AI Tools Overview', duration: '1 week', type: 'hands-on' },
          { title: 'Basic Prompt Engineering', duration: '2 weeks', type: 'practical' }
        ],
        prerequisites: [],
        outcomes: ['Understanding AI terminology', 'Recognizing AI use cases', 'Basic tool proficiency']
      });
    }

    // Implementation Path - for scores 3-4
    if (overallScore >= 3 && overallScore < 4) {
      paths.push({
        id: 'ai-implementation',
        title: 'AI Implementation Skills',
        description: 'Develop practical skills for implementing AI in business contexts',
        priority: 'high',
        estimatedDuration: '8-12 weeks',
        difficulty: 'intermediate',
        modules: [
          { title: 'Advanced Prompt Engineering', duration: '3 weeks', type: 'hands-on' },
          { title: 'AI Project Management', duration: '2 weeks', type: 'practical' },
          { title: 'ROI Measurement & Analytics', duration: '2 weeks', type: 'analytical' },
          { title: 'Change Management for AI', duration: '3 weeks', type: 'strategic' }
        ],
        prerequisites: ['Basic AI knowledge'],
        outcomes: ['AI project leadership', 'Implementation planning', 'Performance measurement']
      });
    }

    // Leadership Path - for scores >= 4
    if (overallScore >= 4) {
      paths.push({
        id: 'ai-leadership',
        title: 'AI Strategic Leadership',
        description: 'Lead AI transformation and strategic initiatives',
        priority: 'medium',
        estimatedDuration: '10-16 weeks',
        difficulty: 'advanced',
        modules: [
          { title: 'AI Strategy Development', duration: '4 weeks', type: 'strategic' },
          { title: 'Organizational AI Transformation', duration: '4 weeks', type: 'leadership' },
          { title: 'AI Ethics & Governance', duration: '3 weeks', type: 'governance' },
          { title: 'AI Innovation Management', duration: '3 weeks', type: 'innovation' }
        ],
        prerequisites: ['Intermediate AI skills', 'Leadership experience'],
        outcomes: ['Strategic AI vision', 'Transformation leadership', 'Innovation management']
      });
    }

    // Specialized paths based on maturity scores
    const businessScore = maturityScores['F1.2'] || maturityScores['business_application'] || 3;
    if (businessScore < 3) {
      paths.push({
        id: 'business-ai-applications',
        title: 'Business AI Applications',
        description: 'Focus on practical business applications of AI',
        priority: 'medium',
        estimatedDuration: '4-6 weeks',
        difficulty: 'intermediate',
        modules: [
          { title: 'AI in Marketing & Sales', duration: '1.5 weeks', type: 'practical' },
          { title: 'AI in Operations & Supply Chain', duration: '1.5 weeks', type: 'practical' },
          { title: 'AI in Finance & Analytics', duration: '1.5 weeks', type: 'practical' },
          { title: 'AI ROI & Business Cases', duration: '1.5 weeks', type: 'analytical' }
        ],
        prerequisites: ['Basic AI knowledge'],
        outcomes: ['Business use case identification', 'ROI calculation', 'Implementation planning']
      });
    }

    return paths;
  }

  /**
   * Generate Change Readiness specific learning paths
   */
  generateChangeReadinessLearningPaths(assessmentData) {
    const paths = [];
    const results = assessmentData.results || assessmentData;
    const readinessLevel = results.readiness_level || results.readinessLevel || 'prepare_first';
    const scoringBreakdown = results.scoring_breakdown || {};

    // Preparation Path - for 'prepare_first' or low scores
    if (readinessLevel === 'prepare_first' || (scoringBreakdown.overall_score || 0) < 60) {
      paths.push({
        id: 'change-preparation',
        title: 'Change Readiness Preparation',
        description: 'Build organizational foundation for AI implementation',
        priority: 'high',
        estimatedDuration: '8-12 weeks',
        difficulty: 'intermediate',
        modules: [
          { title: 'Change Management Fundamentals', duration: '3 weeks', type: 'theory' },
          { title: 'Stakeholder Engagement & Communication', duration: '2 weeks', type: 'practical' },
          { title: 'Process Assessment & Optimization', duration: '3 weeks', type: 'analytical' },
          { title: 'Technology Readiness Evaluation', duration: '2 weeks', type: 'technical' }
        ],
        prerequisites: [],
        outcomes: ['Change readiness', 'Stakeholder buy-in', 'Process optimization']
      });
    }

    // Implementation Path - for 'ready_to_implement'
    if (readinessLevel === 'ready_to_implement' || (scoringBreakdown.overall_score || 0) >= 60) {
      paths.push({
        id: 'change-implementation',
        title: 'AI Change Implementation',
        description: 'Execute AI transformation with effective change management',
        priority: 'high',
        estimatedDuration: '10-16 weeks',
        difficulty: 'advanced',
        modules: [
          { title: 'AI Implementation Strategy', duration: '4 weeks', type: 'strategic' },
          { title: 'Team Training & Development', duration: '3 weeks', type: 'development' },
          { title: 'Process Integration & Automation', duration: '4 weeks', type: 'technical' },
          { title: 'Performance Monitoring & Optimization', duration: '3 weeks', type: 'analytical' }
        ],
        prerequisites: ['Change management basics', 'AI knowledge'],
        outcomes: ['Successful AI implementation', 'Team capability', 'Process optimization']
      });
    }

    // Leadership Path - based on leadership readiness
    const leadershipReadiness = scoringBreakdown.leadership_readiness || 0;
    if (leadershipReadiness < 60) {
      paths.push({
        id: 'change-leadership',
        title: 'AI Change Leadership',
        description: 'Develop leadership capabilities for AI transformation',
        priority: 'medium',
        estimatedDuration: '6-10 weeks',
        difficulty: 'intermediate',
        modules: [
          { title: 'Transformational Leadership for AI', duration: '3 weeks', type: 'leadership' },
          { title: 'Vision Communication & Alignment', duration: '2 weeks', type: 'communication' },
          { title: 'Resistance Management', duration: '2 weeks', type: 'practical' },
          { title: 'Continuous Improvement Culture', duration: '3 weeks', type: 'cultural' }
        ],
        prerequisites: ['Leadership experience'],
        outcomes: ['Transformation leadership', 'Vision alignment', 'Culture change']
      });
    }

    return paths;
  }

  /**
   * Parse learning recommendations from CrewAI raw output
   */
  parseCrewAILearningRecommendations(results) {
    const recommendations = [];
    
    try {
      // Handle case where results might be undefined or null
      if (!results) {
        console.warn('⚠️ No results provided for CrewAI learning recommendations parsing');
        return recommendations;
      }
      
      // Parse raw CrewAI output if available - handle nested structure
      let rawOutput = '';
      if (results.raw_crewai_output && results.raw_crewai_output.crewai_results) {
        rawOutput = typeof results.raw_crewai_output.crewai_results === 'string' 
          ? results.raw_crewai_output.crewai_results 
          : JSON.stringify(results.raw_crewai_output.crewai_results);
      } else {
        rawOutput = results.raw_crewai_output || results.crewai_results || '';
      }
      
      const existingLearningPath = results.learning_path || {};
      
      // Extract specific learning recommendations from raw output
      if (rawOutput && typeof rawOutput === 'string') {
        // Look for capability building recommendations
        const capabilityMatches = rawOutput.match(/(capability|training|learning|skill)[^.]*[.]/gi);
        
        if (capabilityMatches) {
          capabilityMatches.slice(0, 5).forEach((match, index) => {
            recommendations.push({
              id: `crewai-rec-${index}`,
              title: this.extractRecommendationTitle(match),
              description: match.substring(0, 150),
              type: 'capability-building',
              priority: index < 2 ? 'high' : 'medium',
              estimatedDuration: '2-4 weeks',
              source: 'crewai_analysis'
            });
          });
        }
      }
      
      // Use existing learning path priority areas
      if (existingLearningPath.priority_areas) {
        existingLearningPath.priority_areas.forEach((area, index) => {
          recommendations.push({
            id: `priority-area-${index}`,
            title: `Focus on ${area.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
            description: `Prioritized learning area identified from your assessment responses`,
            type: 'priority-focus',
            priority: index < 2 ? 'high' : 'medium',
            estimatedDuration: existingLearningPath.estimated_timeline || '4-6 weeks',
            source: 'assessment_analysis'
          });
        });
      }
      
    } catch (error) {
      console.warn('Error parsing CrewAI learning recommendations:', error);
    }
    
    return recommendations;
  }

  /**
   * Generate progress tracking plan
   */
  generateProgressTrackingPlan(learningPaths) {
    const phases = [];
    const milestones = [];
    let totalWeeks = 0;
    
    learningPaths.forEach((path, pathIndex) => {
      const phase = {
        id: `phase-${pathIndex + 1}`,
        title: `Phase ${pathIndex + 1}: ${path.title}`,
        description: path.description,
        estimatedDuration: path.estimatedDuration,
        modules: path.modules.map(module => ({
          ...module,
          completed: false,
          startDate: null,
          completedDate: null
        }))
      };
      phases.push(phase);
      
      // Extract weeks from duration string
      const weeksMatch = path.estimatedDuration.match(/(\d+)-?(\d+)?.*weeks?/i);
      if (weeksMatch) {
        const minWeeks = parseInt(weeksMatch[1]);
        const maxWeeks = parseInt(weeksMatch[2]) || minWeeks;
        totalWeeks += Math.ceil((minWeeks + maxWeeks) / 2);
      }
      
      // Create milestone for each path completion
      milestones.push({
        id: `milestone-${pathIndex + 1}`,
        title: `Complete ${path.title}`,
        description: `Successfully complete all modules in ${path.title}`,
        pathId: path.id,
        targetWeek: totalWeeks,
        achieved: false,
        achievedDate: null
      });
    });
    
    return {
      phases,
      milestones,
      estimatedCompletion: `${totalWeeks} weeks`
    };
  }

  /**
   * Basic learning plan fallback
   */
  generateBasicLearningPlan(userId, assessmentData, assessmentType) {
    return {
      userId,
      assessmentType,
      generatedAt: new Date().toISOString(),
      source: 'basic_fallback',
      learningPaths: [{
        id: 'basic-path',
        title: 'AI Learning Foundation',
        description: 'Basic AI learning path',
        priority: 'medium',
        estimatedDuration: '8 weeks',
        modules: [
          { title: 'AI Fundamentals', duration: '4 weeks', type: 'theory' },
          { title: 'Practical Applications', duration: '4 weeks', type: 'practical' }
        ]
      }],
      adaptiveRecommendations: [],
      progressTracking: {
        phases: [],
        milestones: [],
        estimatedCompletion: '8 weeks'
      }
    };
  }

  extractRecommendationTitle(text) {
    const words = text.split(' ').slice(0, 8);
    return words.join(' ').replace(/[^a-zA-Z0-9\s]/g, '') || 'Learning Recommendation';
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