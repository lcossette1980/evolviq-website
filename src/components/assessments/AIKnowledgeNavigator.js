import React, { useState, useEffect } from 'react';
import { 
  Brain, 
  Target, 
  CheckCircle, 
  Clock, 
  BookOpen, 
  Users, 
  Award, 
  TrendingUp, 
  AlertCircle,
  Lock,
  Star,
  Play,
  RefreshCw,
  Download,
  ArrowRight,
  Lightbulb,
  MessageSquare,
  Home
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useProject } from '../../contexts/ProjectContext';
import { useNavigate } from 'react-router-dom';
import assessmentAPI from '../../services/assessmentAPI';

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

  // Color palette
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
          setLearningPlan(previousAssessment.learningPlan);
        }
      }
    } catch (error) {
      console.error('Error loading previous assessment:', error);
    }
  };

  const startAssessment = async () => {
    setIsLoading(true);
    try {
      const response = await assessmentAPI.startAIKnowledgeAssessment(user.uid);
      console.log('Start assessment response:', response);
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
      
      console.log('Assessment response received:', response);

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
        // Assessment is complete
        setCurrentStep('results');
        updatedAssessment.isComplete = true;
        updatedAssessment.results = {
          totalQuestions: response.total_questions,
          sessionId: response.session_id,
          message: response.message
        };
        setAssessment(updatedAssessment);
        
        // Track assessment completion in project
        if (currentProject) {
          const assessmentData = {
            overallScore: response.results?.overallScore || 0,
            maturityLevel: response.results?.overallMaturityLevel || 1,
            maturityScores: response.results?.maturityScores || {},
            learningPlan: response.learningPlan,
            completedAt: new Date().toISOString(),
            assessmentId: `ai_knowledge_${user.uid}_${Date.now()}`
          };
          
          await addAssessmentToProject(currentProject.id, 'ai_knowledge_navigator', assessmentData);
          
          // Generate action items from assessment results
          console.log('Generating action items from AI Knowledge Navigator assessment...');
          const actionItems = await generateActionItemsFromAssessment(
            currentProject.id,
            'ai_knowledge_navigator',
            assessmentData
          );
          console.log(`Generated ${actionItems.length} action items`);
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
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 px-4 sm:px-0">
      {/* Hero Section */}
      <div className="text-center py-8 sm:py-12 px-4 sm:px-8 rounded-xl" style={{ backgroundColor: colors.pearl }}>
        <Brain className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6" style={{ color: colors.chestnut }} />
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4" style={{ color: colors.charcoal, fontFamily: 'Playfair Display' }}>
          AI Knowledge Navigator
        </h1>
        <p className="text-lg sm:text-xl mb-6" style={{ color: colors.charcoal }}>
          Discover your AI knowledge level and get a personalized learning pathway
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium">
            Free Basic Assessment
          </span>
          <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-sm font-medium">
            Premium Learning Plans
          </span>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white rounded-xl p-4 sm:p-6 md:p-8 shadow-sm">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6" style={{ color: colors.charcoal, fontFamily: 'Playfair Display' }}>
          How It Works
        </h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
          <div className="text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2 text-sm sm:text-base">Interactive Assessment</h3>
            <p className="text-xs sm:text-sm text-gray-600">Answer questions about AI concepts, tools, and applications through an adaptive conversation</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Target className="w-6 h-6 sm:w-8 sm:h-8 text-green-600" />
            </div>
            <h3 className="font-semibold mb-2 text-sm sm:text-base">Knowledge Mapping</h3>
            <p className="text-xs sm:text-sm text-gray-600">Get detailed insights into your strengths and areas for improvement across 6 AI domains</p>
          </div>
          <div className="text-center sm:col-span-2 md:col-span-1">
            <div className="w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-2 text-sm sm:text-base">Personalized Learning</h3>
            <p className="text-xs sm:text-sm text-gray-600">Receive curated lessons, resources, and a step-by-step learning plan tailored to your level</p>
          </div>
        </div>
      </div>

      {/* Assessment Areas */}
      <div className="bg-white rounded-xl p-4 sm:p-6 md:p-8 shadow-sm">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6" style={{ color: colors.charcoal, fontFamily: 'Playfair Display' }}>
          Assessment Areas
        </h2>
        <div className="grid sm:grid-cols-2 gap-3 sm:gap-4">
          {maturityAreas.map((area, index) => (
            <div key={index} className="flex items-start space-x-3 p-3 sm:p-4 rounded-lg" style={{ backgroundColor: colors.bone }}>
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white rounded-full flex items-center justify-center flex-shrink-0 mt-1 sm:mt-0">
                <span className="text-xs sm:text-sm font-medium" style={{ color: colors.chestnut }}>{index + 1}</span>
              </div>
              <div className="min-w-0">
                <h3 className="font-medium text-sm sm:text-base" style={{ color: colors.charcoal }}>{area.title}</h3>
                <p className="text-xs sm:text-sm" style={{ color: colors.khaki }}>{area.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Free vs Premium */}
      <div className="bg-white rounded-xl p-4 sm:p-6 md:p-8 shadow-sm">
        <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6" style={{ color: colors.charcoal, fontFamily: 'Playfair Display' }}>
          What You Get
        </h2>
        <div className="grid md:grid-cols-2 gap-4 sm:gap-6">
          <div className="border rounded-lg p-4 sm:p-6">
            <div className="flex items-center mb-3 sm:mb-4">
              <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 mr-2" />
              <h3 className="font-bold text-base sm:text-lg">Free Assessment</h3>
            </div>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li className="flex items-start"><CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />Complete AI knowledge assessment</li>
              <li className="flex items-start"><CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />Overall maturity score</li>
              <li className="flex items-start"><CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />Basic strengths and weaknesses</li>
              <li className="flex items-start"><CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" />General learning recommendations</li>
            </ul>
          </div>
          <div className="border rounded-lg p-4 sm:p-6 relative">
            <div className="absolute top-2 right-2">
              <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600" />
            </div>
            <div className="flex items-center mb-3 sm:mb-4">
              <Star className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 mr-2" />
              <h3 className="font-bold text-base sm:text-lg">Premium Features</h3>
            </div>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li className="flex items-start"><Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />Detailed domain-specific scores</li>
              <li className="flex items-start"><Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />Personalized learning pathway</li>
              <li className="flex items-start"><Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />Curated lesson plans</li>
              <li className="flex items-start"><Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />Progress tracking</li>
              <li className="flex items-start"><Star className="w-3 h-3 sm:w-4 sm:h-4 text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />Resource recommendations</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Start Button */}
      <div className="text-center">
        <button
          onClick={startAssessment}
          disabled={isLoading}
          className="bg-chestnut text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-medium hover:bg-chestnut/90 transition-colors disabled:opacity-50 touch-manipulation min-h-[44px] text-sm sm:text-base"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-5 h-5 animate-spin inline mr-2" />
              Starting Assessment...
            </>
          ) : (
            <>
              <Play className="w-5 h-5 inline mr-2" />
              Start Assessment
            </>
          )}
        </button>
      </div>
    </div>
  );

  const renderAssessment = () => (
    <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6 px-4 sm:px-0">
      {/* Progress */}
      <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 space-y-2 sm:space-y-0">
          <h2 className="text-lg sm:text-xl font-bold" style={{ color: colors.charcoal }}>
            AI Knowledge Assessment
          </h2>
          <div className="text-sm" style={{ color: colors.khaki }}>
            Question {assessment.currentQuestionIndex + 1}
          </div>
        </div>
        
        {/* Current Question */}
        {currentQuestion && (
          <div className="space-y-3 sm:space-y-4">
            <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
              <h3 className="font-medium mb-2 text-sm sm:text-base" style={{ color: colors.charcoal }}>
                {currentQuestion.question}
              </h3>
              {currentQuestion.context && (
                <p className="text-sm text-gray-600 mb-3">
                  {currentQuestion.context}
                </p>
              )}
            </div>
            
            <div className="space-y-3">
              <label className="block text-sm font-medium" style={{ color: colors.charcoal }}>
                Your Response:
              </label>
              <textarea
                value={userResponse}
                onChange={(e) => setUserResponse(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chestnut focus:border-transparent text-sm sm:text-base"
                rows={3}
                placeholder="Share your thoughts, experience, or knowledge about this topic..."
              />
              
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-3 sm:space-y-0">
                <div className="text-xs sm:text-sm text-gray-500">
                  Be as detailed as possible - this helps us understand your knowledge level
                </div>
                <button
                  onClick={submitResponse}
                  disabled={!userResponse.trim() || isLoading}
                  className="bg-chestnut text-white px-4 sm:px-6 py-3 rounded-lg font-medium hover:bg-chestnut/90 transition-colors disabled:opacity-50 touch-manipulation min-h-[44px] text-sm sm:text-base"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin inline mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      Submit Response
                      <ArrowRight className="w-4 h-4 inline ml-2" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Assessment History */}
      {assessment.responses.length > 0 && (
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm">
          <h3 className="font-bold mb-3 sm:mb-4 text-sm sm:text-base" style={{ color: colors.charcoal }}>
            Previous Responses
          </h3>
          <div className="space-y-2 sm:space-y-3 max-h-48 sm:max-h-64 overflow-y-auto">
            {assessment.responses.map((response, index) => (
              <div key={index} className="border-l-4 border-blue-200 pl-3 sm:pl-4">
                <div className="text-xs sm:text-sm font-medium text-gray-800 mb-1">
                  Q{index + 1}: {response.question.question}
                </div>
                <div className="text-xs sm:text-sm text-gray-600">
                  {response.response}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderResults = () => (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 px-4 sm:px-0">
      {/* Overall Score */}
      <div className="bg-white rounded-xl p-4 sm:p-6 md:p-8 shadow-sm">
        <div className="text-center mb-6 sm:mb-8">
          <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4 relative">
            <div className="w-full h-full bg-gray-200 rounded-full flex items-center justify-center">
              <div className="text-2xl sm:text-3xl font-bold" style={{ color: colors.chestnut }}>
                {results?.overallScore || 0}
              </div>
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold mb-2" style={{ color: colors.charcoal }}>
            Your AI Knowledge Level
          </h2>
          <p className="text-base sm:text-lg" style={{ color: colors.khaki }}>
            {getMaturityLevelText(results?.overallMaturityLevel || 1)}
          </p>
        </div>

        {/* Basic Results - Always Visible */}
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
          <div className="space-y-3 sm:space-y-4">
            <h3 className="font-bold text-base sm:text-lg" style={{ color: colors.charcoal }}>Strengths</h3>
            <ul className="space-y-2">
              {results?.basicInsights?.strengths?.map((strength, index) => (
                <li key={index} className="flex items-start">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-xs sm:text-sm">{strength}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="space-y-3 sm:space-y-4">
            <h3 className="font-bold text-base sm:text-lg" style={{ color: colors.charcoal }}>Areas for Growth</h3>
            <ul className="space-y-2">
              {results?.basicInsights?.growthAreas?.map((area, index) => (
                <li key={index} className="flex items-start">
                  <Target className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-xs sm:text-sm">{area}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Premium Features Preview */}
      {!user.isPremium && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-8 shadow-sm border border-yellow-200">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-2xl font-bold mb-2" style={{ color: colors.charcoal }}>
                Unlock Your Full Potential
              </h3>
              <p className="text-lg text-gray-600">
                Get detailed insights and personalized learning plans
              </p>
            </div>
            <Lock className="w-12 h-12 text-yellow-600" />
          </div>
          
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4">
              <Star className="w-8 h-8 text-yellow-600 mb-2" />
              <h4 className="font-semibold mb-1">Detailed Scores</h4>
              <p className="text-sm text-gray-600">See your level in each AI domain</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <BookOpen className="w-8 h-8 text-blue-600 mb-2" />
              <h4 className="font-semibold mb-1">Learning Pathway</h4>
              <p className="text-sm text-gray-600">Step-by-step learning plan</p>
            </div>
            <div className="bg-white rounded-lg p-4">
              <TrendingUp className="w-8 h-8 text-green-600 mb-2" />
              <h4 className="font-semibold mb-1">Progress Tracking</h4>
              <p className="text-sm text-gray-600">Monitor your advancement</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowPremiumFeatures(true)}
            className="bg-yellow-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-yellow-700 transition-colors"
          >
            Upgrade to Premium
          </button>
        </div>
      )}

      {/* Premium Results - Only for Premium Users */}
      {user.isPremium && results?.detailedScores && (
        <div className="bg-white rounded-xl p-8 shadow-sm">
          <h3 className="text-2xl font-bold mb-6" style={{ color: colors.charcoal }}>
            Detailed Knowledge Assessment
          </h3>
          <div className="grid md:grid-cols-2 gap-6">
            {maturityAreas.map((area, index) => {
              const score = results.detailedScores[area.id] || 1;
              return (
                <div key={index} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">{area.title}</h4>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getMaturityLevelColor(score)}`}>
                      {getMaturityLevelText(score)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{area.description}</p>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-chestnut h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(score / 5) * 100}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-chestnut text-white px-6 py-3 rounded-lg font-medium hover:bg-chestnut/90 transition-colors touch-manipulation min-h-[44px] text-sm sm:text-base flex items-center justify-center"
        >
          <Home className="w-4 h-4 mr-2" />
          Back to Dashboard
        </button>
        <button
          onClick={() => setCurrentStep('learning')}
          className="bg-white border border-chestnut text-chestnut px-6 py-3 rounded-lg font-medium hover:bg-chestnut/10 transition-colors touch-manipulation min-h-[44px] text-sm sm:text-base"
        >
          View Learning Plan
        </button>
        <button
          onClick={() => {
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
          }}
          className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors touch-manipulation min-h-[44px] text-sm sm:text-base"
        >
          Retake Assessment
        </button>
      </div>
    </div>
  );

  const renderLearningPlan = () => (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center mb-8">
        <BookOpen className="w-16 h-16 mx-auto mb-4" style={{ color: colors.chestnut }} />
        <h2 className="text-3xl font-bold mb-2" style={{ color: colors.charcoal }}>
          Your Personalized Learning Plan
        </h2>
        <p className="text-lg" style={{ color: colors.khaki }}>
          Based on your assessment results
        </p>
      </div>

      {/* Basic Learning Plan - Always Visible */}
      <div className="bg-white rounded-xl p-8 shadow-sm">
        <h3 className="text-2xl font-bold mb-6" style={{ color: colors.charcoal }}>
          General Recommendations
        </h3>
        <div className="space-y-4">
          {learningPlan?.basicRecommendations?.map((recommendation, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mt-1">
                <span className="text-sm font-medium text-blue-600">{index + 1}</span>
              </div>
              <div>
                <h4 className="font-medium mb-1">{recommendation.title}</h4>
                <p className="text-sm text-gray-600">{recommendation.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Premium Learning Plan */}
      {user.isPremium && learningPlan?.detailedPlan ? (
        <div className="space-y-6">
          {learningPlan.detailedPlan.map((phase, index) => (
            <div key={index} className="bg-white rounded-xl p-8 shadow-sm">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-chestnut rounded-full flex items-center justify-center mr-4">
                  <span className="text-white font-bold">{index + 1}</span>
                </div>
                <div>
                  <h3 className="text-xl font-bold" style={{ color: colors.charcoal }}>
                    {phase.title}
                  </h3>
                  <p className="text-sm" style={{ color: colors.khaki }}>
                    {phase.duration} • {phase.focus}
                  </p>
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Learning Objectives</h4>
                  <ul className="space-y-2">
                    {phase.objectives?.map((objective, objIndex) => (
                      <li key={objIndex} className="flex items-start">
                        <Target className="w-4 h-4 text-blue-600 mr-2 mt-1" />
                        <span className="text-sm">{objective}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-3">Resources</h4>
                  <ul className="space-y-2">
                    {phase.resources?.map((resource, resIndex) => (
                      <li key={resIndex} className="flex items-start">
                        <BookOpen className="w-4 h-4 text-green-600 mr-2 mt-1" />
                        <span className="text-sm">{resource}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : !user.isPremium && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-8 shadow-sm border border-yellow-200">
          <div className="text-center">
            <Lock className="w-16 h-16 mx-auto mb-4 text-yellow-600" />
            <h3 className="text-2xl font-bold mb-4" style={{ color: colors.charcoal }}>
              Unlock Your Detailed Learning Plan
            </h3>
            <p className="text-lg mb-6 text-gray-600">
              Get step-by-step lessons, curated resources, and progress tracking
            </p>
            <button
              onClick={() => setShowPremiumFeatures(true)}
              className="bg-yellow-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-yellow-700 transition-colors"
            >
              Upgrade to Premium
            </button>
          </div>
        </div>
      )}

      {/* Action Button for Learning Plan */}
      <div className="flex justify-center mt-8">
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-chestnut text-white px-8 py-3 rounded-lg font-medium hover:bg-chestnut/90 transition-colors touch-manipulation min-h-[44px] flex items-center justify-center"
        >
          <Home className="w-4 h-4 mr-2" />
          Back to Dashboard
        </button>
      </div>
    </div>
  );

  const renderStepIndicator = () => (
    <div className="flex justify-center mb-6 sm:mb-8 px-4">
      <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto max-w-full">
        {assessmentSteps.map((step, index) => {
          const Icon = step.icon;
          const isActive = step.id === currentStep;
          const isCompleted = assessmentSteps.findIndex(s => s.id === currentStep) > index;
          
          return (
            <div key={step.id} className="flex items-center flex-shrink-0">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
                isActive ? 'bg-chestnut text-white' : 
                isCompleted ? 'bg-green-100 text-green-600' : 
                'bg-gray-100 text-gray-400'
              }`}>
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="ml-1 sm:ml-2 mr-2 sm:mr-4">
                <div className={`text-xs sm:text-sm font-medium ${
                  isActive ? 'text-chestnut' : 
                  isCompleted ? 'text-green-600' : 
                  'text-gray-400'
                }`}>
                  {step.title}
                </div>
              </div>
              {index < assessmentSteps.length - 1 && (
                <div className={`w-4 sm:w-8 h-0.5 ${
                  isCompleted ? 'bg-green-300' : 'bg-gray-200'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.bone }}>
      <div className="max-w-7xl mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {renderStepIndicator()}
        
        {currentStep === 'intro' && renderIntroduction()}
        {currentStep === 'assessment' && renderAssessment()}
        {currentStep === 'results' && renderResults()}
        {currentStep === 'learning' && renderLearningPlan()}
      </div>
    </div>
  );
};

export default AIKnowledgeNavigator;