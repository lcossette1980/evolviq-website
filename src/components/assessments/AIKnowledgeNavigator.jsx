import React, { useState, useEffect } from 'react';
import { scrollToTop } from '../../utils/scrollUtils';
import { BookOpen, Target, Lock, Home, Brain, MessageSquare, TrendingUp } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useProject } from '../../contexts/ProjectContext';
import { useNavigate } from 'react-router-dom';
import assessmentAPI from '../../services/assessmentAPI';
import PremiumPaywall from '../auth/PremiumPaywall';
import ErrorBoundary, { useErrorHandler } from '../common/ErrorBoundary';
import logger from '../../utils/logger';

// Import sub-components
import AssessmentIntro from './components/AssessmentIntro.jsx';
import AssessmentQuestion from './components/AssessmentQuestion.jsx';
import AssessmentResults from './components/AssessmentResults.jsx';
import StepIndicator from './components/StepIndicator.jsx';

const AIKnowledgeNavigator = () => {
  const { user } = useAuth();
  const { currentProject, addAssessmentToProject, generateActionItemsFromAssessment } = useProject();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState('intro');
  const [assessment, setAssessment] = useState({
    responses: [],
    currentQuestionIndex: 0,
    interactionHistory: [],
    maturityScores: {},
    overallScore: 0,
    confidence: 0,
    isComplete: false
  });
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [userResponse, setUserResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [learningPlan, setLearningPlan] = useState(null);
  const [showPremiumFeatures, setShowPremiumFeatures] = useState(false);
  const { reportError } = useErrorHandler();

  const handleUpgrade = (selectedPlan) => {
    try {
      logger.userAction('Premium upgrade initiated', { plan: selectedPlan });
      // TODO: Implement actual payment processing
      alert('Payment processing would be implemented here');
      setShowPremiumFeatures(false);
    } catch (error) {
      reportError(error, { action: 'handleUpgrade', plan: selectedPlan });
    }
  };

  // Brand color palette
  const colors = {
    charcoal: '#2A2A2A',
    chestnut: '#A44A3F',
    khaki: '#A59E8C',
    pearl: '#D7CEB2',
    bone: '#F5F2EA'
  };

  const assessmentSteps = [
    { id: 'intro', title: 'Introduction', icon: Brain },
    { id: 'assessment', title: 'Assessment', icon: MessageSquare },
    { id: 'results', title: 'Results', icon: TrendingUp },
    { id: 'learning', title: 'Learning Plan', icon: BookOpen }
  ];

  const maturityAreas = [
    { id: 'ai_fundamentals', title: 'AI Fundamentals', description: 'Basic understanding of AI concepts' },
    { id: 'machine_learning', title: 'Machine Learning', description: 'ML algorithms and applications' },
    { id: 'generative_ai', title: 'Generative AI', description: 'LLMs and generative models' },
    { id: 'ai_ethics', title: 'AI Ethics', description: 'Responsible AI practices' },
    { id: 'business_application', title: 'Business Application', description: 'Applying AI to business problems' },
    { id: 'technical_implementation', title: 'Technical Implementation', description: 'Building and deploying AI systems' }
  ];

  useEffect(() => {
    if (user) {
      loadPreviousAssessment();
    }
  }, [user]);

  const loadPreviousAssessment = async () => {
    try {
      const previousAssessment = await assessmentAPI.getAssessment(user.uid, 'ai_knowledge_navigator');
      if (previousAssessment) {
        setAssessment(previousAssessment);
        if (previousAssessment.isComplete) {
          setCurrentStep('results');
          setResults(previousAssessment.results);
          
          // Set learning plan or generate basic one if missing
          if (previousAssessment.learningPlan) {
            setLearningPlan(previousAssessment.learningPlan);
          } else {
            // Generate basic learning plan if missing from saved data
            const basicLearningPlan = {
              basicRecommendations: [
                {
                  title: "Start with AI Fundamentals",
                  description: "Build a solid foundation with basic AI concepts and terminology"
                },
                {
                  title: "Practice with Real Tools", 
                  description: "Use the EvolvIQ platform tools to gain hands-on experience"
                },
                {
                  title: "Join AI Communities",
                  description: "Connect with other learners and AI practitioners for support"
                },
                {
                  title: "Apply to Your Work",
                  description: "Look for small AI opportunities in your current role"
                }
              ]
            };
            setLearningPlan(basicLearningPlan);
          }
          
          // Scroll to top when showing cached results
          setTimeout(() => scrollToTop('smooth'), 100);
        }
      }
    } catch (error) {
      console.error('Error loading previous assessment:', error);
    }
  };

  // Helper function to detect uncertain responses that shouldn't get high scores
  const hasUncertainResponses = (responses) => {
    if (!responses || responses.length === 0) return false;
    
    const uncertaintyIndicators = [
      'not sure', 'don\'t know', 'think they are the same', 'need to learn',
      'i think', 'maybe', 'probably', 'kind of', 'not too sure', 'basic',
      'i don\'t know', 'no idea', 'unsure', 'confused', 'unclear'
    ];
    
    const allResponses = responses.map(r => r.response?.toLowerCase() || '').join(' ');
    const uncertainCount = uncertaintyIndicators.filter(indicator => 
      allResponses.includes(indicator)
    ).length;
    
    return uncertainCount >= 2; // If 2+ uncertainty indicators, likely beginner
  };

  const startAssessment = async () => {
    setIsLoading(true);
    try {
      const response = await assessmentAPI.startAIKnowledgeAssessment(user.uid);
      logger.assessmentStart('ai_knowledge_navigator', user.uid);
      setCurrentQuestion(response); // The response itself contains question, options, etc.
      setCurrentStep('assessment');
      setAssessment(prev => ({
        ...prev,
        responses: [],
        currentQuestionIndex: 0,
        interactionHistory: [response]
      }));
    } catch (error) {
      console.error('Error starting assessment:', error);
      alert('Failed to start assessment. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const submitResponse = async () => {
    if (!userResponse.trim()) return;

    setIsLoading(true);
    try {
      const response = await assessmentAPI.submitAssessmentResponse(
        user.uid,
        'ai_knowledge_navigator',
        {
          questionId: currentQuestion?.question_id || 'unknown',
          answer: userResponse,
          sessionData: {
            session_id: currentQuestion?.session_id,
            current_question: currentQuestion?.question,
            questionIndex: assessment.currentQuestionIndex
          }
        }
      );
      
      logger.debug('Assessment response received', { completed: response.completed });

      const updatedAssessment = {
        ...assessment,
        responses: [...assessment.responses, {
          question: currentQuestion,
          response: userResponse,
          timestamp: new Date().toISOString()
        }],
        currentQuestionIndex: assessment.currentQuestionIndex + 1,
        interactionHistory: [...assessment.interactionHistory, response]
      };

      setUserResponse('');

      if (response.completed) {
        // Assessment is complete with sophisticated agentic analysis
        setCurrentStep('results');
        // Scroll to top to show results clearly
        setTimeout(() => scrollToTop('smooth'), 100);
        updatedAssessment.isComplete = true;
        
        // Use the sophisticated analysis from the backend
        const analysis = response.analysis || {};
        const maturityScores = analysis.maturity_scores || {};
        
        // Get overall score from correct backend field
        const backendOverallScore = analysis.overall_score_percentage || 0;
        
        // Add validation for obviously incorrect scores
        let validatedScore = backendOverallScore;
        if (backendOverallScore > 85 && hasUncertainResponses(assessment.responses)) {
          console.warn('Detected potentially inflated score for uncertain responses, applying correction');
          validatedScore = Math.max(20, Math.min(45, backendOverallScore * 0.4));
        }
        
        updatedAssessment.results = {
          totalSections: response.total_sections || 5,
          sessionId: response.session_id,
          message: response.message,
          
          // Use validated score
          overallScore: validatedScore,
          maturityScores: analysis.maturity_scores || maturityScores,
          maturityLevel: analysis.maturity_level || Math.round(Object.values(analysis.maturity_scores || maturityScores).reduce((a, b) => a + b, 0) / Object.keys(analysis.maturity_scores || maturityScores).length),
          overallReadinessLevel: analysis.overall_readiness_level,
          
          // Extract basicInsights properly for frontend display
          basicInsights: analysis.basicInsights || {
            strengths: analysis.concept_analysis?.strengths || ["AI Understanding", "Learning Mindset"],
            growthAreas: analysis.concept_analysis?.knowledge_gaps || ["Advanced Implementation", "Tool Integration"]
          },
          
          // Rich analysis data
          conceptAnalysis: analysis.concept_analysis,
          concept_analysis: analysis.concept_analysis, // Keep both for compatibility
          learningPath: analysis.learning_path,
          businessRecommendations: analysis.business_recommendations,
          confidenceAssessment: analysis.confidence_assessment,
          visualAnalytics: analysis.visual_analytics,
          nextSteps: analysis.next_steps,
          
          // CrewAI metadata for agent display
          crewai_metadata: analysis.crewai_metadata,
          agents_used: analysis.crewai_metadata?.agents_used || [],
          
          questionsAnswered: updatedAssessment.responses.length,
          completedAt: new Date().toISOString(),
          analysisTimestamp: analysis.analysis_timestamp
        };
        
        setAssessment(updatedAssessment);
        setResults(updatedAssessment.results);
        
        // Generate basic learning plan
        const basicLearningPlan = {
          basicRecommendations: [
            {
              title: "Start with AI Fundamentals",
              description: "Build a solid foundation with basic AI concepts and terminology"
            },
            {
              title: "Practice with Real Tools", 
              description: "Use the EvolvIQ platform tools to gain hands-on experience"
            },
            {
              title: "Join AI Communities",
              description: "Connect with other learners and AI practitioners for support"
            },
            {
              title: "Apply to Your Work",
              description: "Look for small AI opportunities in your current role"
            }
          ]
        };
        
        // Enhanced learning plan for premium users
        if (user.isPremium && analysis.learning_path) {
          basicLearningPlan.detailedPlan = analysis.learning_path.phases || [
            {
              title: "Foundation Phase",
              duration: "2-4 weeks",
              focus: "Core AI Concepts",
              objectives: ["Understand AI terminology", "Learn about different AI types", "Explore use cases"],
              resources: ["AI Basics course", "Industry case studies", "Glossary reference"]
            }
          ];
        }
        
        setLearningPlan(basicLearningPlan);
        
        // Track assessment completion in project with rich data
        if (currentProject) {
          const assessmentData = {
            overallScore: validatedScore,
            maturityScores: maturityScores,
            maturityLevel: Math.ceil(validatedScore / 20), // Convert percentage back to 1-5 scale
            overallReadinessLevel: analysis.overall_readiness_level,
            learningPath: analysis.learning_path,
            businessRecommendations: analysis.business_recommendations,
            completedAt: new Date().toISOString(),
            assessmentId: `ai_knowledge_${user.uid}_${Date.now()}`,
            questionsAnswered: updatedAssessment.responses.length,
            sessionId: response.session_id,
            analysisType: 'agentic_ai_readiness'
          };
          
          // Only add fields that are defined
          try {
            await addAssessmentToProject(currentProject.id, 'ai_knowledge_navigator', assessmentData);
            console.log('Assessment saved to project successfully');
          } catch (error) {
            console.error('Error saving assessment to project:', error);
          }
          
          // Generate action items from assessment results
          console.log('Generating action items from AI Knowledge Navigator assessment...');
          try {
            const actionItems = await generateActionItemsFromAssessment(
              currentProject.id,
              'ai_knowledge_navigator',
              assessmentData
            );
            console.log(`Generated ${actionItems.length} action items`);
          } catch (error) {
            console.error('Error generating action items:', error);
          }
        }
      } else {
        // Continue with next question
        console.log('Setting next question:', response);
        console.log('New question index:', updatedAssessment.currentQuestionIndex);
        setCurrentQuestion(response); // The response itself is the next question object
        setAssessment(updatedAssessment);
      }

      // Save progress
      await assessmentAPI.saveAssessmentProgress(user.uid, 'ai_knowledge_navigator', updatedAssessment);
    } catch (error) {
      console.error('Error submitting response:', error);
      alert('Failed to submit response. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getMaturityLevelColor = (level) => {
    switch (level) {
      case 1: return 'bg-red-100 text-red-800';
      case 2: return 'bg-orange-100 text-orange-800';
      case 3: return 'bg-yellow-100 text-yellow-800';
      case 4: return 'bg-blue-100 text-blue-800';
      case 5: return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMaturityLevelText = (level) => {
    switch (level) {
      case 1: return 'Beginner';
      case 2: return 'Novice';
      case 3: return 'Intermediate';
      case 4: return 'Advanced';
      case 5: return 'Expert';
      default: return 'Unknown';
    }
  };

  const renderIntroduction = () => (
    <AssessmentIntro 
      colors={colors}
      maturityAreas={maturityAreas}
      onStartAssessment={startAssessment}
      isLoading={isLoading}
    />
  );

  const renderAssessment = () => (
    <AssessmentQuestion 
      colors={colors}
      currentQuestion={currentQuestion}
      userResponse={userResponse}
      setUserResponse={setUserResponse}
      onSubmitResponse={submitResponse}
      isLoading={isLoading}
      assessment={assessment}
      currentQuestionIndex={assessment.currentQuestionIndex}
    />
  );

  const renderResults = () => (
    <AssessmentResults 
      colors={colors}
      results={results}
      user={user}
      maturityAreas={maturityAreas}
      onNavigateToDashboard={() => navigate('/member-dashboard')}
      onViewLearningPlan={() => setCurrentStep('learning')}
      onRetakeAssessment={() => {
        setCurrentStep('intro');
        setAssessment({
          responses: [],
          currentQuestionIndex: 0,
          interactionHistory: [],
          maturityScores: {},
          overallScore: 0,
          confidence: 0,
          isComplete: false
        });
        setResults(null);
        setLearningPlan(null);
      }}
      onShowPremiumFeatures={() => setShowPremiumFeatures(true)}
      getMaturityLevelText={getMaturityLevelText}
      getMaturityLevelColor={getMaturityLevelColor}
    />
  );

  const renderStepIndicator = () => (
    <StepIndicator 
      currentStep={currentStep}
      colors={colors}
    />
  );

  const renderLearningPlan = () => {
    if (!learningPlan) {
      return (
        <div className="max-w-4xl mx-auto text-center py-12">
          <p className="text-lg" style={{ color: colors.khaki }}>Loading learning plan...</p>
        </div>
      );
    }

    return (
      <div className="max-w-4xl mx-auto space-y-6 px-4 sm:px-0">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold mb-4 font-serif" style={{ color: colors.charcoal }}>
            Your Personalized Learning Plan
          </h2>
          <p className="text-lg" style={{ color: colors.khaki }}>
            Based on your assessment results, here's your recommended learning path
          </p>
        </div>

        {/* Basic Recommendations - Always Available */}
        <div className="bg-white rounded-lg p-6 border" style={{ borderColor: colors.pearl }}>
          <h3 className="text-xl font-bold mb-4" style={{ color: colors.charcoal }}>Getting Started</h3>
          <div className="grid md:grid-cols-2 gap-4">
            {learningPlan.basicRecommendations?.map((rec, index) => (
              <div key={index} className="p-4 rounded-lg" style={{ backgroundColor: colors.bone }}>
                <h4 className="font-semibold mb-2" style={{ color: colors.charcoal }}>{rec.title}</h4>
                <p className="text-sm" style={{ color: colors.khaki }}>{rec.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Premium Learning Plan */}
        {user.isPremium && learningPlan.detailedPlan && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
            <h3 className="text-xl font-bold mb-4 text-blue-800">Detailed Learning Pathway</h3>
            <div className="space-y-4">
              {learningPlan.detailedPlan.map((phase, index) => (
                <div key={index} className="bg-white rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold" style={{ color: colors.charcoal }}>{phase.title}</h4>
                    <span className="text-sm text-blue-600">{phase.duration}</span>
                  </div>
                  <p className="text-sm mb-3" style={{ color: colors.khaki }}>Focus: {phase.focus}</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-2 text-sm">Objectives:</h5>
                      <ul className="text-xs space-y-1">
                        {phase.objectives.map((obj, objIndex) => (
                          <li key={objIndex} className="flex items-start">
                            <span className="w-1.5 h-1.5 rounded-full mr-2 mt-2 flex-shrink-0" style={{ backgroundColor: colors.chestnut }}></span>
                            {obj}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2 text-sm">Resources:</h5>
                      <ul className="text-xs space-y-1">
                        {phase.resources.map((resource, resIndex) => (
                          <li key={resIndex} className="flex items-start">
                            <span className="w-1.5 h-1.5 rounded-full mr-2 mt-2 flex-shrink-0" style={{ backgroundColor: colors.khaki }}></span>
                            {resource}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
          <button
            onClick={() => navigate('/member-dashboard')}
            className="px-6 py-3 rounded-lg font-medium text-white transition-colors"
            style={{ backgroundColor: colors.chestnut }}
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => setCurrentStep('results')}
            className="px-6 py-3 rounded-lg font-medium border transition-colors"
            style={{ 
              borderColor: colors.chestnut, 
              color: colors.chestnut,
              backgroundColor: 'transparent'
            }}
          >
            View Results Again
          </button>
        </div>
      </div>
    );
  };
  return (
    <ErrorBoundary level="component">
      <div className="min-h-screen" style={{ backgroundColor: colors.bone }}>
        <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
          {renderStepIndicator()}
          
          {currentStep === 'intro' && renderIntroduction()}
          {currentStep === 'assessment' && renderAssessment()}
          {currentStep === 'results' && renderResults()}
          {currentStep === 'learning' && renderLearningPlan()}
        </div>
        
        {/* Premium Paywall Modal */}
        {showPremiumFeatures && (
          <PremiumPaywall
            isOpen={showPremiumFeatures}
            onClose={() => setShowPremiumFeatures(false)}
            onUpgrade={handleUpgrade}
            guideTitle="AI Knowledge Navigator Premium Features"
            guideDescription="Unlock detailed insights, personalized learning paths, and progress tracking"
          />
        )}
      </div>
    </ErrorBoundary>
  );
};

export default AIKnowledgeNavigator;
