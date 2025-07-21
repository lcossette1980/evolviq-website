import assessmentAPI from './assessmentAPI';
import { buildUrl } from '../config/apiConfig';

class AIAgentsAPI {
  constructor() {
    // Use the centralized API configuration
    this.buildUrl = buildUrl;
  }

  // =============================================================================
  // CROSS-ASSESSMENT INTELLIGENCE AGENT
  // =============================================================================

  async analyzeUserProfile(userId, projectId) {
    try {
      // Get all assessments for the user
      const assessments = await assessmentAPI.getUserAssessments(userId);
      const actionItems = await assessmentAPI.getActionItems(userId, projectId);
      
      const profile = {
        aiKnowledgeLevel: null,
        organizationalReadiness: null,
        learningGaps: [],
        organizationalGaps: [],
        actionPatterns: {},
        recommendedFocus: null
      };

      // Analyze AI Knowledge assessments
      const aiKnowledgeAssessments = assessments.filter(a => a.assessmentType === 'ai_knowledge_navigator');
      if (aiKnowledgeAssessments.length > 0) {
        const latest = aiKnowledgeAssessments[0];
        profile.aiKnowledgeLevel = {
          overallScore: latest.results?.overallScore || 0,
          maturityLevel: latest.results?.overallMaturityLevel || 1,
          maturityScores: latest.results?.maturityScores || {},
          date: latest.lastUpdated
        };

        // Identify learning gaps (scores below 3)
        Object.entries(latest.results?.maturityScores || {}).forEach(([area, score]) => {
          if (score < 3) {
            profile.learningGaps.push({
              area,
              currentScore: score,
              priority: score < 2 ? 'high' : 'medium'
            });
          }
        });
      }

      // Analyze Change Readiness assessments
      const changeReadinessAssessments = assessments.filter(a => a.assessmentType === 'change_readiness');
      if (changeReadinessAssessments.length > 0) {
        const latest = changeReadinessAssessments[0];
        profile.organizationalReadiness = {
          readinessLevel: latest.results?.readinessLevel || 'get_help',
          overallScore: latest.results?.overallScore || 0,
          recommendations: latest.results?.recommendations || [],
          date: latest.lastUpdated
        };

        // Extract organizational gaps
        if (latest.results?.recommendations) {
          latest.results.recommendations.forEach(rec => {
            if (rec.category === 'organizational' || rec.category === 'process') {
              profile.organizationalGaps.push({
                title: rec.title,
                description: rec.description,
                category: rec.category,
                priority: rec.priority || 'medium'
              });
            }
          });
        }
      }

      // Analyze action item completion patterns
      const completedItems = actionItems.filter(item => item.status === 'completed');
      const totalItems = actionItems.length;
      
      profile.actionPatterns = {
        completionRate: totalItems > 0 ? (completedItems.length / totalItems * 100).toFixed(1) : 0,
        averageTimeToComplete: this.calculateAverageCompletionTime(completedItems),
        preferredCategories: this.getPreferredCategories(completedItems),
        strugglingAreas: this.getStrugglingAreas(actionItems)
      };

      return profile;
    } catch (error) {
      console.error('Error analyzing user profile:', error);
      throw error;
    }
  }

  async generateIntelligentActionItems(userId, projectId) {
    try {
      const profile = await this.analyzeUserProfile(userId, projectId);
      const intelligentActions = [];

      // Cross-assessment analysis
      if (profile.aiKnowledgeLevel && profile.organizationalReadiness) {
        const aiScore = profile.aiKnowledgeLevel.overallScore;
        const readinessLevel = profile.organizationalReadiness.readinessLevel;

        // Intelligent sequencing based on readiness vs knowledge
        if (aiScore > 70 && readinessLevel === 'get_help') {
          intelligentActions.push({
            title: 'Focus on organizational preparation before technical advancement',
            description: 'Your AI knowledge is strong, but organizational readiness needs attention. Prioritize change management and stakeholder alignment.',
            category: 'organizational',
            priority: 'high',
            source: 'agent_generated',
            generatedBy: 'ai_agent',
            estimatedHours: 16,
            tags: ['strategy', 'organizational-readiness'],
            metadata: {
              agentType: 'sequencing_agent',
              reasoning: 'High AI knowledge with low organizational readiness'
            }
          });
        }

        if (aiScore < 50 && readinessLevel === 'start_now') {
          intelligentActions.push({
            title: 'Build AI foundational knowledge before implementation',
            description: 'Your organization is ready, but focus on building AI knowledge first to maximize implementation success.',
            category: 'learning',
            priority: 'high',
            source: 'agent_generated',
            generatedBy: 'ai_agent',
            estimatedHours: 20,
            tags: ['learning', 'foundations'],
            metadata: {
              agentType: 'sequencing_agent',
              reasoning: 'High organizational readiness with low AI knowledge'
            }
          });
        }

        // Personalized learning paths
        if (profile.learningGaps.length > 0 && profile.actionPatterns.preferredCategories.includes('learning')) {
          const highPriorityGaps = profile.learningGaps.filter(gap => gap.priority === 'high');
          if (highPriorityGaps.length > 0) {
            intelligentActions.push({
              title: `Intensive ${highPriorityGaps[0].area.replace('_', ' ')} bootcamp`,
              description: `Based on your learning preferences and critical gap in ${highPriorityGaps[0].area}, complete a focused intensive training.`,
              category: 'learning',
              priority: 'high',
              source: 'agent_generated',
              generatedBy: 'ai_agent',
              estimatedHours: 12,
              tags: ['learning', 'intensive', highPriorityGaps[0].area],
              metadata: {
                agentType: 'personalization_agent',
                targetArea: highPriorityGaps[0].area,
                currentScore: highPriorityGaps[0].currentScore
              }
            });
          }
        }

        // Process optimization based on struggles
        if (profile.actionPatterns.strugglingAreas.length > 0) {
          const strugglingArea = profile.actionPatterns.strugglingAreas[0];
          intelligentActions.push({
            title: `Create support system for ${strugglingArea} activities`,
            description: `You've had challenges completing ${strugglingArea} tasks. Set up accountability partners, break tasks smaller, or seek mentoring.`,
            category: 'process',
            priority: 'medium',
            source: 'agent_generated',
            generatedBy: 'ai_agent',
            estimatedHours: 4,
            tags: ['support', 'accountability', strugglingArea],
            metadata: {
              agentType: 'optimization_agent',
              strugglingCategory: strugglingArea
            }
          });
        }

        // Success pattern reinforcement
        if (profile.actionPatterns.completionRate > 70) {
          const preferredCategory = profile.actionPatterns.preferredCategories[0];
          if (preferredCategory) {
            intelligentActions.push({
              title: `Scale your success in ${preferredCategory} to other areas`,
              description: `You excel at ${preferredCategory} tasks (${profile.actionPatterns.completionRate}% completion rate). Apply these same strategies to organizational and technical areas.`,
              category: 'process',
              priority: 'medium',
              source: 'agent_generated',
              generatedBy: 'ai_agent',
              estimatedHours: 6,
              tags: ['success-scaling', preferredCategory],
              metadata: {
                agentType: 'success_amplification_agent',
                strongCategory: preferredCategory,
                completionRate: profile.actionPatterns.completionRate
              }
            });
          }
        }
      }

      // Timeline-based urgency agent
      const urgentActions = this.generateUrgentActions(profile);
      intelligentActions.push(...urgentActions);

      // Create action items in database
      const createdActions = [];
      for (const actionData of intelligentActions) {
        const createdItem = await assessmentAPI.createActionItem(userId, projectId, actionData);
        createdActions.push(createdItem);
      }

      return {
        createdActions,
        profile,
        intelligenceInsights: this.generateInsights(profile, intelligentActions)
      };
    } catch (error) {
      console.error('Error generating intelligent action items:', error);
      throw error;
    }
  }

  generateUrgentActions(profile) {
    const urgentActions = [];

    // If org readiness is "get_help" and no organizational actions taken recently
    if (profile.organizationalReadiness?.readinessLevel === 'get_help') {
      urgentActions.push({
        title: 'Schedule immediate organizational assessment meeting',
        description: 'Your readiness assessment indicates urgent need for organizational preparation. Schedule a team meeting within 48 hours.',
        category: 'organizational',
        priority: 'high',
        source: 'agent_generated',
        generatedBy: 'ai_agent',
        estimatedHours: 3,
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
        tags: ['urgent', 'organizational', 'meeting'],
        metadata: {
          agentType: 'urgency_agent',
          reasoning: 'Critical organizational readiness gap'
        }
      });
    }

    // If learning gaps are critical and no learning actions in progress
    const criticalLearningGaps = profile.learningGaps?.filter(gap => gap.priority === 'high') || [];
    if (criticalLearningGaps.length > 0) {
      urgentActions.push({
        title: 'Begin immediate learning intervention',
        description: `Critical knowledge gaps identified in ${criticalLearningGaps.map(g => g.area).join(', ')}. Start learning immediately to avoid project delays.`,
        category: 'learning',
        priority: 'high',
        source: 'agent_generated',
        generatedBy: 'ai_agent',
        estimatedHours: 8,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week from now
        tags: ['urgent', 'learning', 'critical-gap'],
        metadata: {
          agentType: 'urgency_agent',
          criticalAreas: criticalLearningGaps.map(g => g.area)
        }
      });
    }

    return urgentActions;
  }

  generateInsights(profile, generatedActions) {
    const insights = [];

    if (profile.aiKnowledgeLevel && profile.organizationalReadiness) {
      const aiScore = profile.aiKnowledgeLevel.overallScore;
      const readiness = profile.organizationalReadiness.readinessLevel;

      if (aiScore > 70 && readiness === 'start_now') {
        insights.push({
          type: 'success_predictor',
          title: 'High Success Probability',
          message: 'Your combination of strong AI knowledge and organizational readiness indicates high likelihood of implementation success.',
          confidence: 0.85
        });
      }

      if (profile.actionPatterns.completionRate > 80) {
        insights.push({
          type: 'execution_strength',
          title: 'Strong Execution Pattern',
          message: `Your ${profile.actionPatterns.completionRate}% completion rate shows excellent follow-through. This is a key success factor.`,
          confidence: 0.9
        });
      }

      if (profile.learningGaps.length > 3) {
        insights.push({
          type: 'learning_focus',
          title: 'Focus Learning Efforts',
          message: `With ${profile.learningGaps.length} knowledge gaps, concentrate on 1-2 critical areas at a time for better results.`,
          confidence: 0.8
        });
      }
    }

    return insights;
  }

  calculateAverageCompletionTime(completedItems) {
    if (completedItems.length === 0) return null;
    
    const completionTimes = completedItems
      .filter(item => item.completedAt && item.createdAt)
      .map(item => {
        const created = new Date(item.createdAt);
        const completed = new Date(item.completedAt);
        return (completed - created) / (1000 * 60 * 60 * 24); // days
      });

    if (completionTimes.length === 0) return null;
    
    const average = completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length;
    return Math.round(average * 10) / 10; // round to 1 decimal
  }

  getPreferredCategories(completedItems) {
    const categoryCounts = {};
    completedItems.forEach(item => {
      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
    });

    return Object.entries(categoryCounts)
      .sort(([,a], [,b]) => b - a)
      .map(([category]) => category);
  }

  getStrugglingAreas(actionItems) {
    const now = new Date();
    const categoryMetrics = {};

    actionItems.forEach(item => {
      if (!categoryMetrics[item.category]) {
        categoryMetrics[item.category] = { total: 0, completed: 0, overdue: 0 };
      }
      
      categoryMetrics[item.category].total++;
      
      if (item.status === 'completed') {
        categoryMetrics[item.category].completed++;
      }
      
      if (item.dueDate && new Date(item.dueDate) < now && item.status !== 'completed') {
        categoryMetrics[item.category].overdue++;
      }
    });

    return Object.entries(categoryMetrics)
      .filter(([category, metrics]) => {
        const completionRate = metrics.total > 0 ? metrics.completed / metrics.total : 1;
        const overdueRate = metrics.total > 0 ? metrics.overdue / metrics.total : 0;
        return completionRate < 0.5 || overdueRate > 0.3; // struggling if <50% completion or >30% overdue
      })
      .map(([category]) => category);
  }

  // =============================================================================
  // ADAPTIVE LEARNING AGENT
  // =============================================================================

  async generateAdaptiveLearningPlan(userId, aiKnowledgeResults) {
    try {
      const maturityScores = aiKnowledgeResults.maturityScores || {};
      const overallLevel = aiKnowledgeResults.overallMaturityLevel || 1;
      
      const adaptivePlan = {
        currentLevel: overallLevel,
        targetLevel: Math.min(overallLevel + 1, 5),
        prioritizedAreas: [],
        learningPath: [],
        estimatedTimeline: null
      };

      // Prioritize learning areas based on current scores and importance
      const areaImportance = {
        ai_fundamentals: 1.0,
        business_application: 0.9,
        generative_ai: 0.8,
        ai_ethics: 0.7,
        machine_learning: 0.6,
        technical_implementation: 0.5
      };

      const prioritizedAreas = Object.entries(maturityScores)
        .map(([area, score]) => ({
          area,
          score,
          importance: areaImportance[area] || 0.5,
          priority: (areaImportance[area] || 0.5) * (5 - score) // Higher priority for important low-scoring areas
        }))
        .sort((a, b) => b.priority - a.priority);

      adaptivePlan.prioritizedAreas = prioritizedAreas.slice(0, 3); // Focus on top 3

      // Generate learning path
      adaptivePlan.learningPath = this.generateLearningPath(adaptivePlan.prioritizedAreas);
      adaptivePlan.estimatedTimeline = this.calculateLearningTimeline(adaptivePlan.learningPath);

      return adaptivePlan;
    } catch (error) {
      console.error('Error generating adaptive learning plan:', error);
      throw error;
    }
  }

  generateLearningPath(prioritizedAreas) {
    const learningResources = {
      ai_fundamentals: [
        { type: 'course', title: 'AI Fundamentals for Business', hours: 8 },
        { type: 'reading', title: 'AI Strategy Overview', hours: 3 },
        { type: 'practice', title: 'AI Use Case Analysis', hours: 4 }
      ],
      business_application: [
        { type: 'course', title: 'AI Business Value Creation', hours: 6 },
        { type: 'case_study', title: 'Small Business AI Success Stories', hours: 4 },
        { type: 'workshop', title: 'AI ROI Calculation', hours: 3 }
      ],
      generative_ai: [
        { type: 'course', title: 'Generative AI for Business', hours: 10 },
        { type: 'hands_on', title: 'Prompt Engineering Workshop', hours: 6 },
        { type: 'practice', title: 'Building AI Workflows', hours: 8 }
      ],
      ai_ethics: [
        { type: 'course', title: 'Responsible AI Implementation', hours: 5 },
        { type: 'reading', title: 'AI Ethics Guidelines', hours: 2 },
        { type: 'exercise', title: 'Bias Detection Workshop', hours: 4 }
      ],
      machine_learning: [
        { type: 'course', title: 'ML for Non-Technical Leaders', hours: 12 },
        { type: 'hands_on', title: 'No-Code ML Tools', hours: 6 },
        { type: 'project', title: 'Simple ML Implementation', hours: 10 }
      ],
      technical_implementation: [
        { type: 'course', title: 'AI Implementation Planning', hours: 8 },
        { type: 'workshop', title: 'Vendor Selection Process', hours: 4 },
        { type: 'practice', title: 'Technical Requirements', hours: 6 }
      ]
    };

    const learningPath = [];
    
    prioritizedAreas.forEach((area, index) => {
      const resources = learningResources[area.area] || [];
      const phaseTitle = `Phase ${index + 1}: ${area.area.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}`;
      
      learningPath.push({
        phase: index + 1,
        title: phaseTitle,
        currentScore: area.score,
        targetScore: Math.min(area.score + 1, 5),
        resources: resources.map(resource => ({
          ...resource,
          priority: index === 0 ? 'high' : index === 1 ? 'medium' : 'low'
        })),
        estimatedHours: resources.reduce((sum, r) => sum + r.hours, 0)
      });
    });

    return learningPath;
  }

  calculateLearningTimeline(learningPath) {
    const totalHours = learningPath.reduce((sum, phase) => sum + phase.estimatedHours, 0);
    const hoursPerWeek = 5; // Assume 5 hours per week for learning
    const weeks = Math.ceil(totalHours / hoursPerWeek);
    
    return {
      totalHours,
      estimatedWeeks: weeks,
      hoursPerWeek,
      milestones: learningPath.map((phase, index) => ({
        week: Math.ceil(learningPath.slice(0, index + 1).reduce((sum, p) => sum + p.estimatedHours, 0) / hoursPerWeek),
        phase: phase.phase,
        title: phase.title
      }))
    };
  }
}

// Export singleton instance
const aiAgentsAPI = new AIAgentsAPI();
export default aiAgentsAPI;