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
              context: { sessionId: response.session_id },
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
          const response = await assessmentAPI.submitAssessmentResponse({
            questionId: conversation.context.currentQuestionId || 'current',
            answer: content,
            sessionData: {
              session_id: activeAssessment.sessionId,
              current_question: content,
              questionIndex: get().progress.currentQuestion
            }
          });
          
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
        const { activeAssessment } = get();
        
        set({ isLoading: true });
        
        try {
          // Generate results based on analysis
          const results = {
            sessionId: activeAssessment.sessionId,
            completedAt: new Date().toISOString(),
            overallScore: analysisData.overallScore || 75,
            maturityLevel: analysisData.maturityLevel || 3,
            maturityScores: analysisData.maturityScores || {
              ai_fundamentals: 80,
              machine_learning: 70,
              generative_ai: 75,
              ai_ethics: 65,
              business_application: 80,
              technical_implementation: 70
            },
            basicInsights: analysisData.basicInsights || {
              strengths: ['Strong foundational understanding', 'Good practical awareness'],
              growthAreas: ['Advanced technical concepts', 'Implementation experience']
            },
            conceptAnalysis: analysisData.conceptAnalysis || {
              detected_concepts: ['Machine Learning', 'Neural Networks', 'AI Ethics'],
              knowledge_gaps: ['Deep Learning Architecture', 'Production Deployment'],
              confidence_level: 0.78
            },
            questionsAnswered: get().progress.currentQuestion,
            totalSections: get().progress.totalQuestions
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
          
          // Generate learning plan
          get().generateLearningPlan(results);
          
        } catch (error) {
          set({ 
            error: `Failed to complete assessment: ${error.message}`,
            isLoading: false 
          });
        }
      },
      
      generateLearningPlan: async (results) => {
        try {
          const learningPlan = {
            basicRecommendations: [
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
              },
              {
                title: "AI Ethics and Governance",
                description: "Learn responsible AI practices and guidelines",
                priority: "medium",
                estimatedTime: "1-2 weeks"
              }
            ],
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