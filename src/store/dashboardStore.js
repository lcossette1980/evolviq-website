import React from 'react';
import { create } from 'zustand';
import guidesAPI from '../services/guidesAPI';
import assessmentAPI from '../services/assessmentAPI';
import { getUserAssessments, getUserAssessmentSummaries } from '../services/assessmentService';

/**
 * Dashboard State Management Store
 * Centralizes all dashboard state and actions using Zustand
 */
export const useDashboardStore = create((set, get) => ({
  // UI State
  activeTab: 'overview',
  isLoading: true,
  showCreateProject: false,
  showProjectSelector: false,
  expandedActionItems: new Set(),

  // Data State
  guidesSummary: [],
  actionItems: [],
  actionItemAnalytics: null,
  userAssessments: [],
  assessmentSummaries: {},
  guideProgress: {},
  newProjectData: {
    name: '',
    description: '',
    type: 'genai_implementation',
    organizationName: '',
    organizationSize: '',
    industry: '',
    objective: '',
    stage: 'exploring',
    budget: '10k_50k',
    timeline: '6_months'
  },

  // UI Actions
  setActiveTab: (tab) => set({ activeTab: tab }),
  setShowCreateProject: (show) => set({ showCreateProject: show }),
  setShowProjectSelector: (show) => set({ showProjectSelector: show }),
  toggleExpandedActionItem: (itemId) => set((state) => {
    const newExpanded = new Set(state.expandedActionItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    return { expandedActionItems: newExpanded };
  }),

  // Project Data Actions
  updateNewProjectData: (updates) => set((state) => ({
    newProjectData: { ...state.newProjectData, ...updates }
  })),
  resetNewProjectData: () => set({
    newProjectData: {
      name: '',
      description: '',
      type: 'genai_implementation',
      organizationName: '',
      organizationSize: '',
      industry: '',
      objective: '',
      stage: 'exploring',
      budget: '10k_50k',
      timeline: '6_months'
    }
  }),

  // Data Loading Actions
  loadDashboardData: async (user, currentProject) => {
    if (!user) return;
    
    set({ isLoading: true });
    
    try {
      const projectId = currentProject?.id || null;
      
      // Load all data in parallel
      const [
        guides,
        items,
        analytics,
        oldAssessments,
        newAssessments,
        assessmentSummaries,
        allGuideProgress
      ] = await Promise.all([
        guidesAPI.getGuidesSummary(user.uid),
        assessmentAPI.getActionItems(user.uid, projectId),
        assessmentAPI.getActionItemAnalytics(user.uid, projectId),
        assessmentAPI.getUserAssessments(user.uid),
        getUserAssessments(user.uid), // New assessments from subcollection
        getUserAssessmentSummaries(user.uid), // Assessment summaries
        loadGuideProgress(user.uid)
      ]);

      // Merge old and new assessments
      const allAssessments = [...oldAssessments];
      
      // Add new assessments with proper format
      newAssessments.forEach(assessment => {
        allAssessments.push({
          id: assessment.id,
          userId: assessment.userId,
          assessmentType: assessment.type === 'ai-knowledge' ? 'ai_knowledge' : 
                         assessment.type === 'org-readiness' ? 'change_readiness' : assessment.type,
          type: assessment.type,
          results: assessment.results,
          responses: assessment.responses,
          completedAt: assessment.completedAt || assessment.createdAt,
          isComplete: true,
          orgInfo: assessment.orgInfo,
          // Add learning plan if available
          learningPlan: assessment.results?.learning_path || [],
          actionItems: assessment.results?.recommendations || []
        });
      });

      set({
        guidesSummary: guides,
        actionItems: items,
        actionItemAnalytics: analytics,
        userAssessments: allAssessments,
        assessmentSummaries,
        guideProgress: allGuideProgress,
        isLoading: false
      });

      console.log('Dashboard data loaded:', {
        guides: guides.length,
        actionItems: items.length,
        assessments: allAssessments.length,
        completedAssessments: allAssessments.filter(a => a.isComplete).length,
        analytics,
        currentProject: currentProject?.id
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
      set({ isLoading: false });
    }
  },

  // Getters
  getCompletedAssessments: () => {
    const { userAssessments } = get();
    return userAssessments.filter(assessment => assessment.isComplete);
  },

  // Core assessment completion state (AI Knowledge + Org Readiness)
  hasCompletedCoreAssessments: () => {
    const { assessmentSummaries } = get();
    const aiKnowledgeDone = Boolean(assessmentSummaries['ai-knowledge']);
    const orgReadinessDone = Boolean(assessmentSummaries['org-readiness'] || assessmentSummaries['change_readiness']);
    return aiKnowledgeDone && orgReadinessDone;
  },

  getCoreAssessmentChecklist: () => {
    const { assessmentSummaries } = get();
    return {
      aiKnowledge: {
        id: 'ai-knowledge',
        completed: Boolean(assessmentSummaries['ai-knowledge']),
        lastCompleted: assessmentSummaries['ai-knowledge']?.lastCompleted || null
      },
      orgReadiness: {
        id: 'org-readiness',
        completed: Boolean(assessmentSummaries['org-readiness'] || assessmentSummaries['change_readiness']),
        lastCompleted: (assessmentSummaries['org-readiness'] || assessmentSummaries['change_readiness'])?.lastCompleted || null
      }
    };
  },

  getPendingActionItems: () => {
    const { actionItems } = get();
    return actionItems.filter(item => item.status === 'pending');
  },

  getInProgressActionItems: () => {
    const { actionItems } = get();
    return actionItems.filter(item => item.status === 'in_progress');
  }
}));

/**
 * Helper function to load guide progress for all guides
 */
async function loadGuideProgress(userId) {
  const allGuideProgress = {};
  const guideIds = [
    'AIImplementationPlaybook', 
    'AIReadinessAssessment', 
    'AIUseCaseROIToolkit', 
    'AIStrategyStarterKit', 
    'AIEthicsGovernance'
  ];
  
  const progressPromises = guideIds.map(async (guideId) => {
    try {
      const progress = await guidesAPI.getUserProgress(userId, guideId);
      if (progress && (progress.completedSections?.length > 0 || Object.keys(progress.formData || {}).length > 0)) {
        return {
          [guideId]: {
            ...progress,
            progress: progress.completedSections ? Math.round((progress.completedSections.length / 5) * 100) : 0,
            lastAccessed: progress.lastAccessed || new Date().toISOString()
          }
        };
      }
    } catch (error) {
      console.error(`Error loading progress for ${guideId}:`, error);
    }
    return {};
  });

  const progressResults = await Promise.all(progressPromises);
  progressResults.forEach(result => Object.assign(allGuideProgress, result));
  
  return allGuideProgress;
}

// Custom hook for dashboard data with automatic loading
export const useDashboardData = (user, currentProject) => {
  const { loadDashboardData, isLoading } = useDashboardStore();
  
  React.useEffect(() => {
    loadDashboardData(user, currentProject);
  }, [user, currentProject, loadDashboardData]);
  
  return { isLoading };
};
