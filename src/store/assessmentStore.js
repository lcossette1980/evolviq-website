import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import assessmentAPI from '../services/assessmentAPI';

/**
 * Modern Assessment State Management
 * Centralized state for conversational assessments with proper separation of concerns
 */
export const useAssessmentStore = create(
  devtools(
    (set, get) => ({
      // Assessment State
      activeAssessment: null,
      currentStep: 'intro',
      assessmentType: null,
      
      // Conversation State
      conversation: {
        messages: [],
        currentAgent: null,
        isTyping: false,
        context: {},
        suggestions: [],
        started: false
      },
      
      // Progress State
      progress: {
        currentQuestion: 0,
        totalQuestions: 5,
        completionPercentage: 0,
        maturityScores: {},
        overallScore: 0
      },
      
      // Results State
      results: null,
      learningPlan: null,
      error: null,
      isLoading: false,
      
      // UI State
      showPremiumFeatures: false,
      
      // Actions
      startAssessment: async (type, config = {}) => {
        set({ isLoading: true, error: null, assessmentType: type });
        
        try {
          const response = await assessmentAPI.startAIKnowledgeAssessment(
            config.userId || get().activeAssessment?.userId
          );
          
          const initialMessage = {
            id: `msg_${Date.now()}`,
            role: 'agent',
            type: 'question',
            content: response.question,
            context: response.context,
            agent: {
              name: response.agent_name || 'AI Knowledge Expert',
              focus: response.agent_focus || 'AI Assessment',
              avatar: '/agents/ai-expert.svg'
            },
            timestamp: Date.now(),
            suggestions: [
              "I have basic understanding",
              "I'm quite experienced", 
              "I'm just getting started",
              "Let me explain in detail"
            ]
          };
          
          set({
            activeAssessment: {
              type,
              sessionId: response.session_id,
              userId: config.userId,
              startedAt: Date.now(),
              status: 'active'
            },
            conversation: {
              messages: [initialMessage],
              currentAgent: initialMessage.agent,
              isTyping: false,
              context: { 
                sessionId: response.session_id,
                currentQuestionId: response.question_id || 'intro'
              },
              suggestions: initialMessage.suggestions,
              started: true
            },
            currentStep: 'assessment',
            isLoading: false
          });
          
        } catch (error) {
          set({ 
            error: `Failed to start assessment: ${error.message}`,
            isLoading: false 
          });
        }
      },
      
      sendMessage: async (content, messageType = 'text') => {
        const { activeAssessment, conversation } = get();
        
        if (!activeAssessment?.sessionId) {
          set({ error: 'No active assessment session' });
          return;
        }
        
        // Add user message immediately
        const userMessage = {
          id: `msg_${Date.now()}`,
          role: 'user',
          type: messageType,
          content,
          timestamp: Date.now()
        };
        
        set(state => ({
          conversation: {
            ...state.conversation,
            messages: [...state.conversation.messages, userMessage],
            isTyping: true,
            suggestions: []
          }
        }));
        
        try {
          const response = await assessmentAPI.submitAssessmentResponse(
            activeAssessment.userId || 'current_user',
            activeAssessment.type || 'ai_knowledge',
            {
              questionId: get().conversation.context?.currentQuestionId || 'intro',
              answer: content,
              sessionData: {
                session_id: activeAssessment.sessionId,
                current_question: content,
                questionIndex: get().progress.currentQuestion
              }
            }
          );
          
          // Handle assessment completion
          if (response.completed) {
            const finalMessage = {
              id: `msg_${Date.now()}_final`,
              role: 'agent',
              type: 'completion',
              content: "Excellent! I've completed your assessment analysis. Let me prepare your personalized results...",
              agent: conversation.currentAgent,
              timestamp: Date.now()
            };
            
            set(state => ({
              conversation: {
                ...state.conversation,
                messages: [...state.conversation.messages, finalMessage],
                isTyping: false
              },
              progress: {
                ...state.progress,
                completionPercentage: 100
              }
            }));
            
            // Load and display results
            setTimeout(() => {
              get().completeAssessment(response.analysis || {});
            }, 2000);
            
          } else {
            // Continue with next question
            const agentMessage = {
              id: `msg_${Date.now()}_response`,
              role: 'agent',
              type: 'question',
              content: response.question,
              context: response.context,
              agent: {
                name: response.agent_name || conversation.currentAgent.name,
                focus: response.agent_focus || conversation.currentAgent.focus,
                avatar: conversation.currentAgent.avatar
              },
              timestamp: Date.now(),
              suggestions: [
                "Yes, that's accurate",
                "Not quite, let me clarify",
                "I need more context",
                "Can you explain further?"
              ]
            };
            
            set(state => ({
              conversation: {
                ...state.conversation,
                messages: [...state.conversation.messages, agentMessage],
                currentAgent: agentMessage.agent,
                isTyping: false,
                suggestions: agentMessage.suggestions,
                context: {
                  ...state.conversation.context,
                  currentQuestionId: response.question_id
                }
              },
              progress: {
                ...state.progress,
                currentQuestion: state.progress.currentQuestion + 1,
                completionPercentage: Math.round(((state.progress.currentQuestion + 1) / state.progress.totalQuestions) * 100)
              }
            }));
          }
          
        } catch (error) {
          set(state => ({
            conversation: {
              ...state.conversation,
              isTyping: false
            },
            error: `Failed to send message: ${error.message}`
          }));
        }
      },
      
      completeAssessment: async (analysisData = {}) => {
        const { activeAssessment, conversation } = get();
        
        set({ isLoading: true });
        
        try {
          console.log('🎯 Assessment completion - analysisData:', analysisData);
          
          // Use real CrewAI results if available, otherwise fallback to defaults
          const results = {
            sessionId: activeAssessment.sessionId,
            completedAt: new Date().toISOString(),
            
            // Use actual CrewAI analysis data
            overallScore: analysisData.overall_score || analysisData.overallScore || 75,
            maturityLevel: analysisData.maturity_level || analysisData.maturityLevel || 3,
            readinessLevel: analysisData.readiness_level || analysisData.readinessLevel,
            
            // Real maturity scores from CrewAI
            maturityScores: analysisData.maturity_scores || analysisData.maturityScores || {
              ai_fundamentals: 75,
              machine_learning: 70,
              generative_ai: 75,
              ai_ethics: 65,
              business_application: 80,
              technical_implementation: 70
            },
            
            // Real insights from CrewAI analysis
            basicInsights: {
              strengths: analysisData.strengths || analysisData.basicInsights?.strengths || ['Strong foundational understanding'],
              growthAreas: analysisData.growth_areas || analysisData.basicInsights?.growthAreas || ['Advanced technical concepts']
            },
            
            // Learning path from CrewAI
            learningPath: analysisData.learning_path || analysisData.learningPath || {},
            
            // Business recommendations from CrewAI
            businessRecommendations: analysisData.business_recommendations || analysisData.businessRecommendations || [],
            
            // Raw CrewAI output for enhanced processing
            rawCrewAIResults: analysisData.raw_crewai_output || analysisData.crewai_results || null,
            
            // Assessment metadata
            questionsAnswered: get().progress.currentQuestion,
            totalSections: get().progress.totalQuestions,
            responses: conversation.messages.filter(m => m.role === 'user').map(m => m.content),
            
            // Assessment type and user info
            assessmentType: activeAssessment.type || 'ai_knowledge',
            userId: activeAssessment.userId
          };
          
          set({
            results,
            currentStep: 'results',
            isLoading: false,
            activeAssessment: {
              ...activeAssessment,
              status: 'completed',
              completedAt: Date.now()
            }
          });
          
          // Save assessment results to Firestore
          try {
            await assessmentAPI.saveAssessmentProgress(
              results.userId,
              results.assessmentType,
              {
                results,
                isComplete: true,
                completedAt: results.completedAt,
                sessionId: results.sessionId,
                status: 'completed'
              }
            );
            console.log('✅ Assessment results saved to Firestore');
          } catch (firestoreError) {
            console.error('❌ Error saving to Firestore:', firestoreError);
          }
          
          // Generate and save enhanced learning plan from CrewAI results
          await get().generateLearningPlan(results);
          
          // Generate action items from assessment results
          try {
            if (results.userId && results.businessRecommendations?.length > 0) {
              await assessmentAPI.generateActionItemsFromAssessment(
                results.userId,
                null, // projectId - can be null for user-level action items
                results.assessmentType,
                { results, assessmentId: results.sessionId }
              );
              console.log('✅ Action items generated from assessment');
            }
          } catch (actionItemError) {
            console.error('❌ Error generating action items:', actionItemError);
          }
          
        } catch (error) {
          set({ 
            error: `Failed to complete assessment: ${error.message}`,
            isLoading: false 
          });
        }
      },
      
      generateLearningPlan: async (results) => {
        try {
          console.log('📚 Generating learning plan from results:', results);
          
          // Extract learning recommendations from CrewAI results
          const learningPath = results.learningPath || {};
          const maturityScores = results.maturityScores || {};
          const rawCrewAI = results.rawCrewAIResults;
          
          // Generate intelligent recommendations based on actual assessment data
          const basicRecommendations = [];
          
          // Add maturity-based recommendations
          Object.entries(maturityScores).forEach(([area, score]) => {
            if (score < 80) { // Areas needing improvement
              const areaName = area.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
              let priority = 'medium';
              let estimatedTime = '3-4 weeks';
              
              if (score < 60) {
                priority = 'high';
                estimatedTime = '4-6 weeks';
              }
              
              basicRecommendations.push({
                title: `Improve ${areaName}`,
                description: `Your current score is ${score}%. Focus on building stronger ${areaName.toLowerCase()} capabilities.`,
                priority,
                estimatedTime,
                currentScore: score,
                targetScore: Math.min(100, score + 20),
                area
              });
            }
          });
          
          // Add learning path specific recommendations if available
          if (learningPath.basic_recommendations) {
            learningPath.basic_recommendations.forEach((rec, index) => {
              if (typeof rec === 'string') {
                basicRecommendations.push({
                  title: `Learning Focus ${index + 1}`,
                  description: rec,
                  priority: index === 0 ? 'high' : 'medium',
                  estimatedTime: '2-4 weeks',
                  source: 'crewai_analysis'
                });
              } else if (rec && typeof rec === 'object') {
                basicRecommendations.push({
                  title: rec.title || `Learning Recommendation ${index + 1}`,
                  description: rec.description || rec.content || 'AI learning recommendation',
                  priority: rec.priority || (index === 0 ? 'high' : 'medium'),
                  estimatedTime: rec.duration || rec.estimatedTime || '2-4 weeks',
                  source: 'crewai_analysis'
                });
              }
            });
          }
          
          // Fallback recommendations if no specific ones were generated
          if (basicRecommendations.length === 0) {
            basicRecommendations.push(
              {
                title: "Strengthen Core AI Concepts",
                description: "Focus on fundamental AI principles and terminology",
                priority: "high",
                estimatedTime: "2-3 weeks"
              },
              {
                title: "Hands-on Machine Learning Practice", 
                description: "Work with real datasets and ML algorithms",
                priority: "medium",
                estimatedTime: "4-6 weeks"
              }
            );
          }
          
          const learningPlan = {
            basicRecommendations,
            createdAt: new Date().toISOString(),
            assessmentId: results.sessionId,
            userId: results.userId,
            assessmentType: results.assessmentType,
            basedOnScores: maturityScores,
            progressTracking: {
              phases: [
                { name: "Foundation", duration: "3 weeks", status: "recommended" },
                { name: "Practice", duration: "6 weeks", status: "upcoming" },
                { name: "Specialization", duration: "8 weeks", status: "future" }
              ],
              estimatedCompletion: "3-4 months"
            }
          };
          
          set({ learningPlan });
          
          // Save learning plan to Firestore
          try {
            await assessmentAPI.saveLearningProgress(
              results.userId,
              results.assessmentType,
              learningPlan
            );
            console.log('✅ Learning plan saved to Firestore');
          } catch (learningPlanError) {
            console.error('❌ Error saving learning plan:', learningPlanError);
          }
          
        } catch (error) {
          console.error('Failed to generate learning plan:', error);
        }
      },
      
      retakeAssessment: () => {
        set({
          activeAssessment: null,
          currentStep: 'intro',
          conversation: {
            messages: [],
            currentAgent: null,
            isTyping: false,
            context: {},
            suggestions: [],
            started: false
          },
          progress: {
            currentQuestion: 0,
            totalQuestions: 5,
            completionPercentage: 0,
            maturityScores: {},
            overallScore: 0
          },
          results: null,
          learningPlan: null,
          error: null
        });
      },
      
      setCurrentStep: (step) => set({ currentStep: step }),
      setShowPremiumFeatures: (show) => set({ showPremiumFeatures: show }),
      clearError: () => set({ error: null }),
      
      // Getters
      getMaturityLevelText: (level) => {
        const levels = {
          1: 'Beginner',
          2: 'Basic', 
          3: 'Intermediate',
          4: 'Advanced',
          5: 'Expert'
        };
        return levels[level] || 'Unknown';
      },
      
      getMaturityLevelColor: (level) => {
        const colors = {
          1: '#ef4444',
          2: '#f97316',
          3: '#eab308', 
          4: '#22c55e',
          5: '#16a34a'
        };
        return colors[level] || '#6b7280';
      }
    }),
    { name: 'assessment-store' }
  )
);