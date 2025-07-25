import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { db } from '../services/firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  updateDoc 
} from 'firebase/firestore';
import logger from '../utils/logger';

const ProjectContext = createContext();

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};

export const ProjectProvider = ({ children }) => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user's projects
  useEffect(() => {
    if (user) {
      loadProjects();
    } else {
      setProjects([]);
      setCurrentProject(null);
      setLoading(false);
    }
  }, [user]);

  const loadProjects = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const projectsRef = collection(db, 'projects');
      const q = query(
        projectsRef, 
        where('userId', '==', user.uid),
        orderBy('lastUpdated', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const projectsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setProjects(projectsList);
      
      // Set current project to the most recently updated
      if (projectsList.length > 0 && !currentProject) {
        setCurrentProject(projectsList[0]);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const createProject = async (projectData) => {
    if (!user) throw new Error('User must be logged in to create a project');
    
    try {
      const projectId = `project_${user.uid}_${Date.now()}`;
      const newProject = {
        id: projectId,
        userId: user.uid,
        name: projectData.name,
        description: projectData.description || '',
        type: projectData.type || 'general',
        organization: {
          name: projectData.organizationName || '',
          size: projectData.organizationSize || 0,
          industry: projectData.industry || '',
          type: projectData.organizationType || 'small_business'
        },
        objective: projectData.objective || '',
        stage: projectData.stage || 'exploring',
        budget: projectData.budget || '10k_50k',
        timeline: projectData.timeline || '6_months',
        created: serverTimestamp(),
        lastUpdated: serverTimestamp(),
        status: 'active',
        assessments: {},
        guides: {},
        actionItems: [],
        timeline: []
      };
      
      await setDoc(doc(db, 'projects', projectId), newProject);
      
      // Add to local state
      const projectWithId = { ...newProject, id: projectId, created: new Date(), lastUpdated: new Date() };
      setProjects([projectWithId, ...projects]);
      setCurrentProject(projectWithId);
      
      return projectWithId;
    } catch (error) {
      console.error('Error creating project:', error);
      throw error;
    }
  };

  const updateProject = async (projectId, updates) => {
    if (!user) throw new Error('User must be logged in to update a project');
    
    try {
      const projectRef = doc(db, 'projects', projectId);
      await updateDoc(projectRef, {
        ...updates,
        lastUpdated: serverTimestamp()
      });
      
      // Update local state
      setProjects(projects.map(p => 
        p.id === projectId 
          ? { ...p, ...updates, lastUpdated: new Date() }
          : p
      ));
      
      if (currentProject?.id === projectId) {
        setCurrentProject({ ...currentProject, ...updates, lastUpdated: new Date() });
      }
    } catch (error) {
      console.error('Error updating project:', error);
      throw error;
    }
  };

  const switchProject = (projectId) => {
    const project = projects.find(p => p.id === projectId);
    if (project) {
      setCurrentProject(project);
    }
  };

  const archiveProject = async (projectId) => {
    await updateProject(projectId, { status: 'archived' });
    
    // If archiving current project, switch to another active project
    if (currentProject?.id === projectId) {
      const activeProject = projects.find(p => p.id !== projectId && p.status === 'active');
      setCurrentProject(activeProject || null);
    }
  };

  const addAssessmentToProject = async (projectId, assessmentType, assessmentData) => {
    if (!projectId || !currentProject) return;
    
    const assessmentId = `assessment_${Date.now()}`;
    const assessments = currentProject.assessments || {};
    
    if (!assessments[assessmentType]) {
      assessments[assessmentType] = [];
    }
    
    assessments[assessmentType].push({
      id: assessmentId,
      date: new Date().toISOString(),
      ...assessmentData
    });
    
    // Add to timeline
    const timelineEvent = {
      id: `event_${Date.now()}`,
      type: 'assessment_completed',
      assessmentType,
      date: new Date().toISOString(),
      title: `Completed ${assessmentType.replace('_', ' ')} assessment`,
      data: { 
        assessmentId,
        score: assessmentData.overallScore,
        level: assessmentData.maturityLevel || assessmentData.readinessLevel
      }
    };
    
    // Generate intelligent guide recommendations based on assessment results
    try {
      const guidesAPI = (await import('../services/guidesAPI')).default;
      const guideRecommendations = await guidesAPI.generateGuideRecommendations(
        user.uid, 
        assessmentData, 
        assessmentType
      );
      
      // Store guide recommendations with the project
      const existingGuideRecs = currentProject.guideRecommendations || [];
      const newGuideRecommendations = [...existingGuideRecs, ...guideRecommendations];
      
      // Generate enhanced learning plan based on assessment results
      const assessmentAPI = (await import('../services/assessmentAPI')).default;
      const enhancedLearningPlan = await assessmentAPI.generateEnhancedLearningPlan(
        user.uid,
        assessmentData,
        assessmentType
      );

      console.log(`🎯 Generated ${guideRecommendations.length} guide recommendations and enhanced learning plan for ${assessmentType}`);
      
      await updateProject(projectId, { 
        assessments,
        timeline: [...(currentProject.timeline || []), timelineEvent],
        guideRecommendations: newGuideRecommendations,
        lastGuideRecommendationUpdate: new Date().toISOString(),
        enhancedLearningPlan: {
          ...enhancedLearningPlan,
          assessmentId,
          assessmentType
        },
        lastLearningPlanUpdate: new Date().toISOString()
      });
      
    } catch (error) {
      console.error('❌ Error generating guide recommendations:', error);
      // Continue with basic project update if guide recommendations fail
      await updateProject(projectId, { 
        assessments,
        timeline: [...(currentProject.timeline || []), timelineEvent]
      });
    }
  };

  const trackActionItemCompletion = async (projectId, actionItemId, status) => {
    if (!projectId || !currentProject) return;
    
    try {
      // Import assessmentAPI here to avoid circular imports
      const assessmentAPI = (await import('../services/assessmentAPI')).default;
      
      // Update in action items database
      await assessmentAPI.updateActionItem(actionItemId, { status });
      
      // Add to project timeline if completing an action
      if (status === 'completed') {
        const actionItem = await assessmentAPI.getActionItems(user.uid, projectId)
          .then(items => items.find(item => item.id === actionItemId));
        
        if (actionItem) {
          const timelineEvent = {
            id: `event_${Date.now()}`,
            type: 'action_completed',
            date: new Date().toISOString(),
            title: `Completed: ${actionItem.title}`,
            data: { 
              actionItemId,
              category: actionItem.category,
              priority: actionItem.priority
            }
          };
          
          await updateProject(projectId, { 
            timeline: [...(currentProject.timeline || []), timelineEvent]
          });
        }
      }
    } catch (error) {
      console.error('Error tracking action item completion:', error);
    }
  };

  const updateGuideProgress = async (projectId, guideId, progressData) => {
    if (!projectId || !currentProject) return;
    
    const guides = currentProject.guides || {};
    
    guides[guideId] = {
      ...(guides[guideId] || {}),
      ...progressData,
      lastAccessed: new Date().toISOString()
    };
    
    await updateProject(projectId, { guides });
  };

  const addActionItem = async (projectId, actionItem) => {
    if (!projectId || !currentProject) return;
    
    const newActionItem = {
      id: `action_${Date.now()}`,
      created: new Date().toISOString(),
      status: 'pending',
      ...actionItem
    };
    
    const actionItems = [...(currentProject.actionItems || []), newActionItem];
    
    await updateProject(projectId, { actionItems });
  };

  const updateActionItem = async (projectId, actionItemId, updates) => {
    if (!projectId || !currentProject) return;
    
    const actionItems = currentProject.actionItems.map(item =>
      item.id === actionItemId
        ? { ...item, ...updates, lastUpdated: new Date().toISOString() }
        : item
    );
    
    await updateProject(projectId, { actionItems });
  };

  const generateActionItemsFromAssessment = async (projectId, assessmentType, assessmentData) => {
    if (!user || !projectId) return [];
    
    try {
      // Import APIs here to avoid circular imports
      const assessmentAPI = (await import('../services/assessmentAPI')).default;
      const aiAgentsAPI = (await import('../services/aiAgentsAPI')).default;
      
      // Generate enhanced action items from CrewAI assessment analysis
      const enhancedActionItems = await assessmentAPI.generateEnhancedActionItems(
        user.uid,
        projectId,
        assessmentData,
        assessmentType
      );
      
      // Fallback: Generate basic action items if enhanced parsing didn't work
      let basicActionItems = [];
      if (!enhancedActionItems || enhancedActionItems.length === 0) {
        console.log('🔄 Enhanced parsing yielded no results, falling back to basic action items');
        basicActionItems = await assessmentAPI.generateActionItemsFromAssessment(
          user.uid,
          projectId,
          assessmentType,
          assessmentData
        );
      }
      
      // Check if we have multiple assessments to generate intelligent cross-assessment actions
      const allAssessments = await assessmentAPI.getUserAssessments(user.uid);
      const projectAssessments = allAssessments.filter(a => 
        a.isComplete && 
        new Date(a.lastUpdated) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Within last 30 days
      );
      
      let intelligentActions = [];
      if (projectAssessments.length >= 2) {
        console.log('Generating intelligent cross-assessment action items...');
        try {
          const intelligentResult = await aiAgentsAPI.generateIntelligentActionItems(user.uid, projectId);
          intelligentActions = intelligentResult.createdActions;
          console.log(`Generated ${intelligentActions.length} intelligent action items`);
        } catch (error) {
          console.error('Error generating intelligent actions:', error);
          // Continue with basic actions if intelligent generation fails
        }
      }
      
      // Combine enhanced actions (or fallback basic actions) with intelligent actions
      const primaryActionItems = enhancedActionItems?.length > 0 ? enhancedActionItems : basicActionItems;
      const allActionItems = [...primaryActionItems, ...intelligentActions];
      
      console.log(`✅ Total action items generated: ${allActionItems.length} (Enhanced: ${enhancedActionItems?.length || 0}, Basic: ${basicActionItems.length}, Intelligent: ${intelligentActions.length})`);
      
      // Update project with action item count (for dashboard stats)
      const currentActionItems = currentProject?.actionItems || [];
      await updateProject(projectId, { 
        actionItems: [...currentActionItems, ...allActionItems.map(item => ({
          id: item.id,
          title: item.title,
          status: item.status,
          priority: item.priority,
          category: item.category,
          created: item.createdAt
        }))]
      });
      
      return allActionItems;
    } catch (error) {
      console.error('Error generating action items from assessment:', error);
      return [];
    }
  };

  const value = {
    projects,
    currentProject,
    loading,
    createProject,
    updateProject,
    switchProject,
    archiveProject,
    addAssessmentToProject,
    updateGuideProgress,
    addActionItem,
    updateActionItem,
    generateActionItemsFromAssessment,
    trackActionItemCompletion,
    loadProjects
  };

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};