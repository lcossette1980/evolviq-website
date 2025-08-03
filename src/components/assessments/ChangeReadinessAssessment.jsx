import React, { useState, useEffect } from 'react';
import { scrollToTop } from '../../utils/scrollUtils';
import { 
  Users, 
  Target, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Building, 
  Lightbulb,
  Shield,
  RefreshCw,
  Download,
  ArrowRight,
  BookOpen,
  MessageSquare,
  BarChart3,
  Settings,
  Zap,
  FileText,
  Home,
  Brain,
  PieChart
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useProject } from '../../contexts/ProjectContext';
import { useNavigate } from 'react-router-dom';
import assessmentAPI from '../../services/assessmentAPI';

const ChangeReadinessAssessment = () => {
  const { user } = useAuth();
  const { currentProject, addAssessmentToProject, generateActionItemsFromAssessment } = useProject();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState('intro');
  const [organizationData, setOrganizationData] = useState({
    name: '',
    type: '',
    industry: '',
    size: '',
    aiMaturityScore: 0
  });
  const [projectData, setProjectData] = useState({
    name: '',
    objective: '',
    stage: '',
    budgetRange: '',
    timeline: ''
  });
  const [assessment, setAssessment] = useState({
    responses: [],
    agentAnalysis: {},
    recommendations: [],
    readinessLevel: null,
    isComplete: false
  });
  const [currentAgent, setCurrentAgent] = useState(null);
  const [userResponse, setUserResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [currentWorkingAgent, setCurrentWorkingAgent] = useState(null);
  const [results, setResults] = useState(null);

  // Color palette
  const colors = {
    charcoal: '#2A2A2A',
    chestnut: '#A44A3F',
    khaki: '#A59E8C',
    pearl: '#D7CEB2',
    bone: '#F5F2EA'
  };

  const assessmentSteps = [
    { id: 'intro', title: 'Introduction', icon: Building },
    { id: 'organization', title: 'Organization', icon: Users },
    { id: 'project', title: 'Project Details', icon: Target },
    { id: 'assessment', title: 'Assessment', icon: MessageSquare },
    { id: 'results', title: 'Results', icon: BarChart3 }
  ];

  const organizationTypes = [
    { value: 'nonprofit', label: 'Nonprofit Organization' },
    { value: 'small_business', label: 'Small Business' },
    { value: 'service_org', label: 'Service Organization' },
    { value: 'startup', label: 'Startup' },
    { value: 'other', label: 'Other' }
  ];

  const projectStages = [
    { value: 'exploring', label: 'Exploring AI Options' },
    { value: 'preparing', label: 'Preparing for Implementation' },
    { value: 'implementing', label: 'Currently Implementing' },
    { value: 'scaling', label: 'Scaling Existing AI' },
    { value: 'optimizing', label: 'Optimizing AI Systems' }
  ];

  const budgetRanges = [
    { value: 'under_10k', label: 'Under $10,000' },
    { value: '10k_50k', label: '$10,000 - $50,000' },
    { value: '50k_100k', label: '$50,000 - $100,000' },
    { value: '100k_500k', label: '$100,000 - $500,000' },
    { value: 'over_500k', label: 'Over $500,000' }
  ];

  const agents = [
    {
      id: 'strategic_analyst',
      name: 'Strategic Analyst',
      role: 'Evaluates strategic alignment and business case',
      icon: Target,
      color: 'bg-blue-100 text-blue-800'
    },
    {
      id: 'change_manager',
      name: 'Change Manager',
      role: 'Assesses organizational readiness for transformation',
      icon: Users,
      color: 'bg-green-100 text-green-800'
    },
    {
      id: 'risk_assessor',
      name: 'Risk Assessor',
      role: 'Identifies potential risks and mitigation strategies',
      icon: Shield,
      color: 'bg-red-100 text-red-800'
    },
    {
      id: 'technical_advisor',
      name: 'Technical Advisor',
      role: 'Evaluates technical feasibility and requirements',
      icon: Settings,
      color: 'bg-purple-100 text-purple-800'
    },
    {
      id: 'impact_evaluator',
      name: 'Impact Evaluator',
      role: 'Measures potential impact and success metrics',
      icon: TrendingUp,
      color: 'bg-orange-100 text-orange-800'
    }
  ];

  useEffect(() => {
    if (user) {
      loadPreviousAssessment();
    }
  }, [user]);

  const loadPreviousAssessment = async () => {
    try {
      const previousAssessment = await assessmentAPI.getAssessment(user.uid, 'change_readiness');
      if (previousAssessment) {
        setAssessment(previousAssessment);
        setOrganizationData(previousAssessment.organizationData || {});
        setProjectData(previousAssessment.projectData || {});
        if (previousAssessment.isComplete) {
          setCurrentStep('results');
          setResults(previousAssessment.results);
          // Scroll to top when showing cached results
          setTimeout(() => scrollToTop('smooth'), 100);
        }
      }
    } catch (error) {
      console.error('Error loading previous assessment:', error);
    }
  };

  const startAssessment = async () => {
    setIsLoading(true);
    setCurrentStep('loading');
    
    try {
      // Start the AI agents simulation immediately
      simulateAgentWork();
      
      // Call backend to start assessment in parallel
      const response = await assessmentAPI.startChangeReadinessAssessment(
        user.uid,
        organizationData,
        projectData
      );
      
      // Transform the backend response to match frontend expectations
      const responseData = response.data || response;
      
      const mockAgent = {
        id: responseData.section || 'leadership_support',
        name: getSectionName(responseData.section || 'leadership_support'),
        role: getSectionRole(responseData.section || 'leadership_support'),
        question: responseData.question,
        context: responseData.rationale,
        sessionId: responseData.session_id,
        questionId: responseData.question_id
      };
      
      // Wait for AI simulation to complete before showing questions
      setTimeout(() => {
        setCurrentAgent(mockAgent);
        setCurrentStep('assessment');
        setAssessment(prev => ({
          ...prev,
          responses: [],
          agentAnalysis: {},
          currentAgentIndex: 0,
          sessionData: { session_id: responseData.session_id }
        }));
        setIsLoading(false);
      }, 12000); // Total simulation time
      
    } catch (error) {
      console.error('Error starting assessment:', error);
      setIsLoading(false);
    }
  };

  // Helper functions to get section display names and roles
  const getSectionName = (section) => {
    const names = {
      leadership_support: 'Executive Sponsor',
      team_capability: 'Team Readiness Expert',
      change_history: 'Change Management Specialist',
      resource_allocation: 'Resource Planning Analyst',
      communication_culture: 'Communication Strategist'
    };
    return names[section] || 'Assessment Agent';
  };

  const getSectionRole = (section) => {
    const roles = {
      leadership_support: 'Evaluating leadership commitment and executive sponsorship',
      team_capability: 'Assessing team skills and readiness for change',
      change_history: 'Analyzing past change management experience',
      resource_allocation: 'Reviewing available resources and capacity',
      communication_culture: 'Examining communication and stakeholder engagement'
    };
    return roles[section] || 'Conducting change readiness assessment';
  };

  const submitResponse = async () => {
    if (!userResponse.trim()) return;

    setIsLoading(true);
    try {
      const sessionId = assessment.sessionData?.session_id || currentAgent.sessionId;
      
      if (!sessionId) {
        throw new Error('No session ID available. Assessment session may have been lost.');
      }

      const response = await assessmentAPI.submitChangeReadinessResponse(
        user.uid,
        {
          questionId: currentAgent.questionId,
          answer: userResponse,
          sessionData: { 
            session_id: sessionId,
            organizationData,
            projectData
          }
        }
      );

      const updatedAssessment = {
        ...assessment,
        responses: [...assessment.responses, {
          agent: currentAgent,
          response: userResponse,
          timestamp: new Date().toISOString()
        }],
        agentAnalysis: {
          ...assessment.agentAnalysis,
          [currentAgent.id]: response.analysis?.[currentAgent.id] || response.analysis || null
        }
      };

      setAssessment(updatedAssessment);
      setUserResponse('');

      // Enhanced Debug Logging - Add RIGHT AFTER backend response
      console.log('🔍 FULL BACKEND RESPONSE:', {
        response,
        responseKeys: response ? Object.keys(response) : 'null',
        responseData: response?.data,
        responseDataKeys: response?.data ? Object.keys(response.data) : 'null',
        responseResults: response?.results,
        responseResultsKeys: response?.results ? Object.keys(response.results) : 'null',
        responseAnalysis: response?.analysis,
        responseAnalysisKeys: response?.analysis ? Object.keys(response.analysis) : 'null'
      });

      if (response.completed || response.isComplete || response.data?.is_complete || response.is_complete) {
        // Assessment is complete  
        let results = response.results || response.data?.analysis || response.analysis;
        
        console.log('🎯 DETECTED COMPLETION - Raw Results Analysis:', {
          hasResults: !!results,
          resultsType: typeof results,
          resultsKeys: results ? Object.keys(results) : 'null',
          hasBusinessRecommendations: !!(results?.business_recommendations),
          businessRecsCount: results?.business_recommendations?.length || 0,
          hasLearningPath: !!(results?.learning_path),
          hasScoringBreakdown: !!(results?.scoring_breakdown),
          hasNextSteps: !!(results?.next_steps),
          nextStepsCount: results?.next_steps?.length || 0,
          hasImplementationRoadmap: !!(results?.implementation_roadmap),
          rawResultsSample: results ? JSON.stringify(results).substring(0, 500) + '...' : 'null'
        });
        
        // FIXED: Map actual CrewAI field names to display components
        if (results) {
          const mappedResults = {
            // Preserve original CrewAI data structure
            ...results,
            
            // Map display fields for UI compatibility
            readinessScore: Math.round((results.scoring_breakdown?.overall_score || 
                           results.visual_analytics?.readiness_score || 
                           results.overall_score || 0) * 10),
            
            scores: {
              strategic: results.scoring_breakdown?.leadership_readiness || 0,
              organizational: results.scoring_breakdown?.culture_readiness || 0,
              technical: results.scoring_breakdown?.technology_readiness || 0
            },
            
            // Map CrewAI 'recommendations' to 'business_recommendations' for display
            business_recommendations: results.recommendations ? results.recommendations.map((rec, index) => ({
              title: `Strategic Recommendation ${index + 1}`,
              description: rec,
              expected_impact: "Organizational transformation",
              implementation_timeline: "2-6 months"
            })) : [],
            
            // Map 'portfolio_guidance' to 'learning_path' for display
            learning_path: results.portfolio_guidance ? {
              priority_areas: ['change_management', 'ai_implementation', 'organizational_readiness'],
              recommended_courses: results.portfolio_guidance.priority_initiatives ? 
                results.portfolio_guidance.priority_initiatives.map(initiative => ({
                  title: initiative,
                  estimated_duration: "4-6 weeks"
                })) : 
                [{ title: typeof results.portfolio_guidance === 'object' ? JSON.stringify(results.portfolio_guidance) : results.portfolio_guidance, estimated_duration: "4-6 weeks" }],
              estimated_timeline: results.timeline_estimate || "3-6 months"
            } : null,
            
            // Map 'risk_assessment' to 'implementation_roadmap' for display
            implementation_roadmap: results.risk_assessment ? {
              phases: [
                {
                  name: "Risk Mitigation Phase",
                  description: "Address identified risks and prepare for implementation",
                  duration: "4-6 weeks",
                  key_activities: results.risk_assessment.high_risks || []
                },
                {
                  name: "Implementation Phase", 
                  description: "Begin AI implementation with identified strategies",
                  duration: "8-12 weeks",
                  key_activities: results.recommendations || []
                }
              ]
            } : null,
            
            // Enhanced next steps with CrewAI intelligence
            nextSteps: results.next_steps ? results.next_steps.map((step, index) => ({
              title: `Action ${index + 1}`,
              description: step,
              timeline: "2-4 weeks",
              priority: index < 2 ? 'high' : 'medium',
              category: 'organizational'
            })) : [],
            
            // Enhanced recommendations with CrewAI structure
            displayRecommendations: results.recommendations || [],
            
            // Map readiness level
            readinessLevel: results.readiness_level || 
                           results.overall_readiness_level || 
                           (results.scoring_breakdown?.overall_score > 3.5 ? 'start_now' : 
                            results.scoring_breakdown?.overall_score > 2.5 ? 'prepare_first' : 'get_help')
          };
          
          console.log('🎯 FIXED MAPPING: Mapped results structure:', {
            hasOriginalData: !!results,
            originalRecommendations: results.recommendations?.length || 0,
            mappedBusinessRecs: mappedResults.business_recommendations?.length || 0,
            hasPortfolioGuidance: !!results.portfolio_guidance,
            mappedLearningPath: !!mappedResults.learning_path,
            hasRiskAssessment: !!results.risk_assessment,
            mappedImplementationRoadmap: !!mappedResults.implementation_roadmap,
            readinessScore: mappedResults.readinessScore,
            nextStepsCount: mappedResults.nextSteps?.length || 0,
            originalKeys: Object.keys(results),
            mappedKeys: Object.keys(mappedResults)
          });
          
          results = mappedResults;
        }
        
        setResults(results);
        setCurrentStep('results');
        // Scroll to top to show results clearly
        setTimeout(() => scrollToTop('smooth'), 100);
        updatedAssessment.isComplete = true;
        updatedAssessment.results = results;
        
        // Track assessment completion in project
        if (currentProject) {
          // ENHANCED: Preserve full CrewAI results data for intelligent parsing
          const originalResults = response.results || response.data?.analysis || response.analysis;
          
          const assessmentData = {
            readinessLevel: response.results?.readinessLevel || 'get_help',
            overallScore: response.results?.overallScore || 0,
            agentAnalysis: response.results?.agentAnalysis || {},
            recommendations: response.results?.recommendations || [],
            organizationData,
            projectData,
            completedAt: new Date().toISOString(),
            assessmentId: `change_readiness_${user.uid}_${Date.now()}`,
            // CRITICAL: Include full original results with raw CrewAI output
            results: originalResults
          };
          
          console.log('🚀 ENHANCED: AssessmentData with full results:', {
            hasResults: !!assessmentData.results,
            hasRawCrewAI: !!(assessmentData.results?.raw_crewai_output),
            resultKeys: assessmentData.results ? Object.keys(assessmentData.results) : 'none'
          });
          
          await addAssessmentToProject(currentProject.id, 'change_readiness', assessmentData);
          
          // Generate action items from assessment results
          console.log('Generating action items from Change Readiness assessment...');
          const actionItems = await generateActionItemsFromAssessment(
            currentProject.id,
            'change_readiness',
            assessmentData
          );
          console.log(`Generated ${actionItems.length} action items`);
        }
      } else {
        // Continue with next agent - transform backend response like in startAssessment
        const responseData = response.data || response;
        const nextAgent = {
          id: responseData.section || 'leadership_support',
          name: getSectionName(responseData.section || 'leadership_support'),
          role: getSectionRole(responseData.section || 'leadership_support'),
          question: responseData.question,
          context: responseData.rationale,
          sessionId: responseData.session_id,
          questionId: responseData.question_id
        };
        setCurrentAgent(nextAgent);
      }

      // Save progress - only save essential data to prevent Firestore errors
      try {
        await assessmentAPI.saveAssessmentProgress(
          user.uid, 
          'change_readiness', 
          {
            isStarted: updatedAssessment.isStarted,
            isComplete: updatedAssessment.isComplete,
            currentAgentIndex: updatedAssessment.currentAgentIndex,
            responses: updatedAssessment.responses?.map(r => ({
              agentId: r.agent?.id || 'unknown',
              agentName: r.agent?.name || 'unknown',
              response: r.response,
              timestamp: r.timestamp
            })) || [],
            agentAnalysis: updatedAssessment.agentAnalysis || {},
            sessionData: updatedAssessment.sessionData || {},
            organizationData,
            projectData,
            results: updatedAssessment.results || null
          }
        );
      } catch (saveError) {
        console.error('Error saving assessment progress:', saveError);
        console.error('Continuing assessment despite save error...');
        // Continue with the assessment even if save fails
      }
    } catch (error) {
      console.error('Error submitting response:', error);
      // Don't reset the current agent or step on error
      // This prevents the screen from reverting to the first question
      alert('There was an error processing your response. The AI agents are taking longer than expected. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getReadinessLevelColor = (level) => {
    switch (level) {
      case 'start_now': return 'bg-green-100 text-green-800';
      case 'prepare_first': return 'bg-yellow-100 text-yellow-800';
      case 'get_help': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getReadinessLevelText = (level) => {
    switch (level) {
      case 'start_now': return 'Ready to Start';
      case 'prepare_first': return 'Prepare First';
      case 'get_help': return 'Get Professional Help';
      default: return 'Unknown';
    }
  };

  const convertMarkdownToHTML = (markdown) => {
    if (!markdown || typeof markdown !== 'string') return '';
    
    let html = markdown
      // Headers
      .replace(/^\*\*([^*]+)\*\*$/gim, '<h3 class="text-lg font-bold mb-3 text-gray-800 border-b border-gray-200 pb-2">$1</h3>')
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-bold mb-3 text-gray-800">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-bold mb-4 text-gray-900">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4 text-gray-900">$1</h1>')
      
      // Bold text
      .replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-gray-800">$1</strong>')
      
      // Phase headers (special case for implementation phases)
      .replace(/^- \*\*(Phase \d+:[^*]+)\*\*/gim, '<div class="bg-blue-50 p-3 rounded-lg mt-4 mb-2"><h4 class="font-bold text-blue-800">$1</h4></div>')
      
      // Bullet points with sub-items
      .replace(/^  - (.*)$/gim, '<li class="ml-6 mb-1 text-gray-600 list-disc">$1</li>')
      .replace(/^- (.*)$/gim, '<li class="mb-2 text-gray-700 list-disc ml-4">$1</li>')
      
      // Tables (basic support)
      .replace(/\|(.+)\|/g, (match, content) => {
        const cells = content.split('|').map(cell => cell.trim());
        if (cells.every(cell => cell.includes('-'))) {
          return ''; // Skip separator rows
        }
        const cellHtml = cells.map(cell => `<td class="px-3 py-2 border border-gray-200 bg-white">${cell}</td>`).join('');
        return `<tr>${cellHtml}</tr>`;
      })
      
      // Line breaks and paragraphs
      .replace(/\n\n/g, '</div><div class="mb-4">')
      .replace(/\n/g, '<br/>');
      
    // Wrap in sections
    html = '<div class="space-y-4">' + 
           '<div class="mb-4">' + html + '</div>' +
           '</div>';
           
    // Fix table wrapping
    html = html.replace(/(<tr>.*?<\/tr>)+/gs, (match) => `<table class="w-full mb-4 border-collapse shadow-sm rounded-lg overflow-hidden">${match}</table>`);
    
    // Wrap lists
    html = html.replace(/(<li.*?<\/li>)+/gs, (match) => `<ul class="space-y-1 mb-4">${match}</ul>`);
    
    return html;
  };

  const simulateAgentWork = () => {
    setLoadingProgress(0);
    setCurrentWorkingAgent(agents[0]);
    
    // Simulate agents working in sequence
    const agentWorkSequence = [
      { agent: agents[0], duration: 2000, message: "Analyzing strategic alignment..." },
      { agent: agents[1], duration: 2500, message: "Evaluating organizational culture..." },
      { agent: agents[2], duration: 2000, message: "Assessing technical readiness..." },
      { agent: agents[3], duration: 3000, message: "Conducting risk analysis..." },
      { agent: agents[4], duration: 2500, message: "Synthesizing insights..." }
    ];

    let currentIndex = 0;
    let totalProgress = 0;

    const processNextAgent = () => {
      if (currentIndex < agentWorkSequence.length) {
        const currentWork = agentWorkSequence[currentIndex];
        setCurrentWorkingAgent({ ...currentWork.agent, message: currentWork.message });
        
        const progressIncrement = 100 / agentWorkSequence.length;
        const startProgress = totalProgress;
        const endProgress = totalProgress + progressIncrement;
        
        // Animate progress for current agent
        const progressInterval = setInterval(() => {
          totalProgress += 2;
          setLoadingProgress(Math.min(totalProgress, endProgress));
          
          if (totalProgress >= endProgress) {
            clearInterval(progressInterval);
            totalProgress = endProgress;
            currentIndex++;
            setTimeout(processNextAgent, 300);
          }
        }, currentWork.duration / (progressIncrement / 2));
      }
    };

    processNextAgent();
  };

  const renderAIAgentsLoading = () => (
    <div className="max-w-4xl mx-auto">
      {/* Clean Loading Header */}
      <div className="text-center mb-12">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: colors.chestnut }}>
          <Brain className="w-10 h-10 text-white" />
        </div>
        
        <h2 className="text-3xl font-bold mb-4" style={{ color: colors.charcoal, fontFamily: 'Playfair Display' }}>
          AI Agents at Work
        </h2>
        <p className="text-lg mb-8" style={{ color: colors.charcoal, fontFamily: 'Lato' }}>
          Our AI team is analyzing your organization's change readiness
        </p>
        
        {/* Simple Progress Bar */}
        <div className="max-w-md mx-auto mb-8">
          <div className="bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500"
              style={{ 
                backgroundColor: colors.chestnut,
                width: `${loadingProgress}%` 
              }}
            />
          </div>
          <div className="flex justify-between text-sm mt-2" style={{ color: colors.khaki, fontFamily: 'Lato' }}>
            <span>0%</span>
            <span className="font-medium">{Math.round(loadingProgress)}%</span>
            <span>100%</span>
          </div>
        </div>
      </div>

      {/* Current Working Agent */}
      {currentWorkingAgent && (
        <div className="bg-white rounded-lg p-8 shadow-sm mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center ${currentWorkingAgent.color}`}>
              {React.createElement(currentWorkingAgent.icon, { className: "w-10 h-10 text-white" })}
            </div>
          </div>
          
          <div className="text-center">
            <h3 className="text-xl font-bold mb-2" style={{ color: colors.charcoal, fontFamily: 'Lato' }}>
              {currentWorkingAgent.name}
            </h3>
            <p className="mb-4" style={{ color: colors.khaki, fontFamily: 'Lato' }}>
              {currentWorkingAgent.role}
            </p>
            <div className="inline-flex items-center px-4 py-2 rounded-full" style={{ backgroundColor: colors.pearl }}>
              <div className="w-2 h-2 rounded-full mr-3" style={{ backgroundColor: colors.chestnut }}></div>
              <span className="text-sm font-medium" style={{ color: colors.charcoal, fontFamily: 'Lato' }}>
                {currentWorkingAgent.message || "Working..."}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Agent Grid with Status */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {agents.map((agent, index) => {
          const Icon = agent.icon;
          const isCompleted = loadingProgress > (index * 20);
          const isCurrent = currentWorkingAgent?.id === agent.id;
          
          return (
            <div key={agent.id} className="text-center">
              <div className={`relative w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                isCompleted ? 'bg-green-100' : 
                isCurrent ? agent.color : 
                'bg-gray-100'
              }`}>
                {isCompleted && (
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-white" />
                  </div>
                )}
                <Icon className={`w-8 h-8 ${
                  isCompleted ? 'text-green-600' : 
                  isCurrent ? 'text-white' : 
                  'text-gray-400'
                }`} />
              </div>
              <h4 className={`font-medium text-sm mb-1 ${
                isCompleted ? 'text-green-700' : 
                isCurrent ? colors.charcoal : 
                'text-gray-400'
              }`} style={{ fontFamily: 'Lato' }}>
                {agent.name}
              </h4>
              <p className={`text-xs ${
                isCompleted ? 'text-green-600' : 
                isCurrent ? colors.khaki : 
                'text-gray-400'
              }`} style={{ fontFamily: 'Lato' }}>
                {isCompleted ? 'Complete' : 
                 isCurrent ? 'Working...' : 
                 'Waiting'}
              </p>
            </div>
          );
        })}
      </div>

      {/* Estimated Time */}
      <div className="text-center mt-12">
        <div className="inline-flex items-center px-6 py-3 rounded-full" style={{ backgroundColor: colors.pearl }}>
          <Clock className="w-5 h-5 mr-2" style={{ color: colors.chestnut }} />
          <span className="text-sm font-medium" style={{ color: colors.charcoal, fontFamily: 'Lato' }}>
            Estimated completion: 2-3 minutes
          </span>
        </div>
      </div>
    </div>
  );

  const renderIntroduction = () => (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Clean Hero Section */}
      <div className="text-center py-12 px-8" style={{ backgroundColor: colors.pearl }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: colors.chestnut }}>
          <Building className="w-8 h-8 text-white" />
        </div>
        
        <h1 className="text-4xl font-bold mb-4" style={{ color: colors.charcoal, fontFamily: 'Playfair Display' }}>
          Change Readiness Assessment
        </h1>
        
        <p className="text-lg mb-6" style={{ color: colors.charcoal, fontFamily: 'Lato' }}>
          Multi-agent AI evaluation of your organization's readiness for change
        </p>
        
        <div className="inline-block px-4 py-2 rounded text-sm font-medium text-white" style={{ backgroundColor: colors.chestnut }}>
          Premium Assessment
        </div>
      </div>

      {/* AI Assessment Process */}
      <div className="bg-white rounded-lg p-8 shadow-sm">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-4" style={{ color: colors.charcoal, fontFamily: 'Playfair Display' }}>
            Assessment Process
          </h2>
          <p className="text-base" style={{ color: colors.charcoal, fontFamily: 'Lato' }}>
            Five specialized AI agents will evaluate your organization from different perspectives
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {agents.map((agent, index) => {
            const Icon = agent.icon;
            return (
              <div key={index} className="text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${agent.color}`}>
                  <Icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-medium mb-2 text-sm" style={{ color: colors.charcoal, fontFamily: 'Lato' }}>
                  {agent.name}
                </h3>
                <p className="text-xs" style={{ color: colors.khaki, fontFamily: 'Lato' }}>
                  {agent.role}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* What We Evaluate */}
      <div className="bg-white rounded-lg p-8 shadow-sm">
        <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: colors.charcoal, fontFamily: 'Playfair Display' }}>
          What We Evaluate
        </h2>
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: colors.chestnut }}>
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold mb-2" style={{ color: colors.charcoal, fontFamily: 'Lato' }}>Strategic Alignment</h3>
                <p className="text-sm" style={{ color: colors.khaki, fontFamily: 'Lato' }}>How well initiatives align with business objectives</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: colors.chestnut }}>
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold mb-2" style={{ color: colors.charcoal, fontFamily: 'Lato' }}>Organizational Readiness</h3>
                <p className="text-sm" style={{ color: colors.khaki, fontFamily: 'Lato' }}>Culture, skills, and change management capabilities</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: colors.chestnut }}>
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold mb-2" style={{ color: colors.charcoal, fontFamily: 'Lato' }}>Risk Assessment</h3>
                <p className="text-sm" style={{ color: colors.khaki, fontFamily: 'Lato' }}>Potential challenges and mitigation strategies</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: colors.chestnut }}>
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold mb-2" style={{ color: colors.charcoal, fontFamily: 'Lato' }}>Technical Feasibility</h3>
                <p className="text-sm" style={{ color: colors.khaki, fontFamily: 'Lato' }}>Infrastructure, data, and technical requirements</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: colors.chestnut }}>
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold mb-2" style={{ color: colors.charcoal, fontFamily: 'Lato' }}>Impact Evaluation</h3>
                <p className="text-sm" style={{ color: colors.khaki, fontFamily: 'Lato' }}>Expected outcomes and success metrics</p>
              </div>
            </div>
            
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: colors.chestnut }}>
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-bold mb-2" style={{ color: colors.charcoal, fontFamily: 'Lato' }}>Implementation Roadmap</h3>
                <p className="text-sm" style={{ color: colors.khaki, fontFamily: 'Lato' }}>Step-by-step plan for successful deployment</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assessment Report */}
      <div className="bg-white rounded-lg p-8 shadow-sm">
        <h2 className="text-2xl font-bold mb-6 text-center" style={{ color: colors.charcoal, fontFamily: 'Playfair Display' }}>
          Comprehensive Assessment Report
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: colors.pearl }}>
              <BarChart3 className="w-8 h-8" style={{ color: colors.chestnut }} />
            </div>
            <h3 className="font-bold mb-2" style={{ color: colors.charcoal, fontFamily: 'Lato' }}>Readiness Score</h3>
            <p className="text-sm" style={{ color: colors.khaki, fontFamily: 'Lato' }}>Overall readiness level with detailed breakdown</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: colors.pearl }}>
              <Lightbulb className="w-8 h-8" style={{ color: colors.chestnut }} />
            </div>
            <h3 className="font-bold mb-2" style={{ color: colors.charcoal, fontFamily: 'Lato' }}>Strategic Insights</h3>
            <p className="text-sm" style={{ color: colors.khaki, fontFamily: 'Lato' }}>Actionable recommendations from each agent</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: colors.pearl }}>
              <FileText className="w-8 h-8" style={{ color: colors.chestnut }} />
            </div>
            <h3 className="font-bold mb-2" style={{ color: colors.charcoal, fontFamily: 'Lato' }}>Implementation Plan</h3>
            <p className="text-sm" style={{ color: colors.khaki, fontFamily: 'Lato' }}>Detailed roadmap for your transformation</p>
          </div>
        </div>
      </div>

      {/* Start Button */}
      <div className="text-center">
        <button
          onClick={() => setCurrentStep('organization')}
          className="text-white px-8 py-4 rounded-lg font-medium hover:opacity-90 transition-opacity" 
          style={{ backgroundColor: colors.chestnut, fontFamily: 'Lato' }}
        >
          Begin Assessment
          <ArrowRight className="w-5 h-5 inline ml-2" />
        </button>
        
        <div className="mt-4 text-sm" style={{ color: colors.khaki, fontFamily: 'Lato' }}>
          Takes 15-20 minutes to complete
        </div>
      </div>
    </div>
  );

  const renderOrganizationForm = () => (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Step Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center px-4 py-2 rounded-full mb-4" style={{ backgroundColor: colors.pearl }}>
          <div className="w-8 h-8 rounded-full flex items-center justify-center mr-3" style={{ backgroundColor: colors.chestnut }}>
            <span className="text-white text-sm font-bold">1</span>
          </div>
          <span className="text-sm font-medium" style={{ color: colors.charcoal, fontFamily: 'Lato' }}>Organization Information</span>
        </div>
        <h2 className="text-3xl font-bold" style={{ color: colors.charcoal, fontFamily: 'Playfair Display' }}>
          Tell us about your organization
        </h2>
        <p style={{ color: colors.khaki, fontFamily: 'Lato' }} className="mt-2">
          This information helps our AI agents provide targeted analysis
        </p>
      </div>

      {/* Form Card */}
      <div className="bg-white rounded-lg p-8 shadow-sm">
        <div className="space-y-6">
          {/* Organization Basics */}
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.charcoal, fontFamily: 'Lato' }}>
                Organization Name *
              </label>
              <input
                type="text"
                value={organizationData.name}
                onChange={(e) => setOrganizationData({...organizationData, name: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': colors.chestnut }}
                placeholder="Enter your organization name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.charcoal, fontFamily: 'Lato' }}>
                Organization Type *
              </label>
              <select
                value={organizationData.type}
                onChange={(e) => setOrganizationData({...organizationData, type: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': colors.chestnut }}
                required
              >
                <option value="">Select type...</option>
                {organizationTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.charcoal, fontFamily: 'Lato' }}>
                Industry *
              </label>
              <input
                type="text"
                value={organizationData.industry}
                onChange={(e) => setOrganizationData({...organizationData, industry: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': colors.chestnut }}
                placeholder="e.g., Healthcare, Finance, Technology"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.charcoal, fontFamily: 'Lato' }}>
                Organization Size *
              </label>
              <input
                type="number"
                value={organizationData.size}
                onChange={(e) => setOrganizationData({...organizationData, size: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent"
                style={{ '--tw-ring-color': colors.chestnut }}
                placeholder="Number of employees"
                required
              />
            </div>
          </div>

          {/* AI Maturity Slider */}
          <div className="p-6 rounded-lg" style={{ backgroundColor: colors.pearl }}>
            <label className="block text-sm font-medium mb-4" style={{ color: colors.charcoal, fontFamily: 'Lato' }}>
              Current AI Maturity Level
            </label>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={organizationData.aiMaturityScore || 1}
                  onChange={(e) => setOrganizationData({...organizationData, aiMaturityScore: parseInt(e.target.value)})}
                  className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
                  style={{ backgroundColor: colors.khaki }}
                />
                <div className="w-12 h-8 rounded flex items-center justify-center text-white font-bold" style={{ backgroundColor: colors.chestnut }}>
                  {organizationData.aiMaturityScore || 1}
                </div>
              </div>
              <div className="flex justify-between text-xs" style={{ color: colors.khaki, fontFamily: 'Lato' }}>
                <span>Beginner</span>
                <span>Expert</span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
          <div className="text-sm" style={{ color: colors.khaki, fontFamily: 'Lato' }}>
            Step 1 of 3
          </div>
          <button
            onClick={() => setCurrentStep('project')}
            disabled={!organizationData.name || !organizationData.type || !organizationData.industry || !organizationData.size}
            className="text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ backgroundColor: colors.chestnut, fontFamily: 'Lato' }}
          >
            Continue to Project Details
            <ArrowRight className="w-5 h-5 inline ml-2" />
          </button>
        </div>
      </div>
    </div>
  );

  const renderProjectForm = () => (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="bg-white rounded-xl p-8 shadow-sm">
        <h2 className="text-2xl font-bold mb-6" style={{ color: colors.charcoal, fontFamily: 'Playfair Display' }}>
          Project Details
        </h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.charcoal }}>
              Project Name *
            </label>
            <input
              type="text"
              value={projectData.name}
              onChange={(e) => setProjectData({...projectData, name: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chestnut focus:border-transparent"
              placeholder="Enter your AI project name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.charcoal }}>
              Project Objective *
            </label>
            <textarea
              value={projectData.objective}
              onChange={(e) => setProjectData({...projectData, objective: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chestnut focus:border-transparent"
              rows={3}
              placeholder="Describe what you want to achieve with AI..."
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.charcoal }}>
                Project Stage *
              </label>
              <select
                value={projectData.stage}
                onChange={(e) => setProjectData({...projectData, stage: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chestnut focus:border-transparent"
                required
              >
                <option value="">Select stage...</option>
                {projectStages.map(stage => (
                  <option key={stage.value} value={stage.value}>{stage.label}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.charcoal }}>
                Budget Range *
              </label>
              <select
                value={projectData.budgetRange}
                onChange={(e) => setProjectData({...projectData, budgetRange: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chestnut focus:border-transparent"
                required
              >
                <option value="">Select budget range...</option>
                {budgetRanges.map(budget => (
                  <option key={budget.value} value={budget.value}>{budget.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.charcoal }}>
              Timeline *
            </label>
            <input
              type="text"
              value={projectData.timeline}
              onChange={(e) => setProjectData({...projectData, timeline: e.target.value})}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chestnut focus:border-transparent"
              placeholder="e.g., 6 months, Q1 2024, ASAP"
              required
            />
          </div>
        </div>

        <div className="flex justify-between mt-8">
          <button
            onClick={() => setCurrentStep('organization')}
            className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          <button
            onClick={startAssessment}
            disabled={!projectData.name || !projectData.objective || !projectData.stage || !projectData.budgetRange || !projectData.timeline || isLoading}
            className="bg-chestnut text-white px-6 py-3 rounded-lg font-medium hover:bg-chestnut/90 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin inline mr-2" />
                Starting Assessment...
              </>
            ) : (
              <>
                Start Assessment
                <ArrowRight className="w-5 h-5 inline ml-2" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );

  const renderAssessment = () => (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Current Agent */}
      {currentAgent && (
        <div className="bg-white rounded-xl p-6 shadow-sm">
          <div className="flex items-center mb-6">
            <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${
              agents.find(a => a.id === currentAgent.id)?.color || 'bg-gray-100'
            }`}>
              {React.createElement(
                agents.find(a => a.id === currentAgent.id)?.icon || MessageSquare,
                { className: "w-6 h-6" }
              )}
            </div>
            <div>
              <h3 className="text-xl font-bold" style={{ color: colors.charcoal }}>
                {currentAgent.name}
              </h3>
              <p className="text-sm" style={{ color: colors.khaki }}>
                {currentAgent.role}
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-medium mb-2" style={{ color: colors.charcoal }}>
                {currentAgent.question}
              </h4>
              {currentAgent.context && (
                <p className="text-sm text-gray-600 mb-3">
                  {currentAgent.context}
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
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chestnut focus:border-transparent"
                rows={4}
                placeholder="Provide detailed information to help our agents understand your situation..."
              />
              
              <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                  Be specific - detailed responses lead to better recommendations
                </div>
                <button
                  onClick={submitResponse}
                  disabled={!userResponse.trim() || isLoading}
                  className="bg-chestnut text-white px-6 py-2 rounded-lg font-medium hover:bg-chestnut/90 transition-colors disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin inline mr-2" />
                      Analyzing...
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
        </div>
      )}

      {/* Progress Indicator */}
      <div className="bg-white rounded-xl p-6 shadow-sm">
        <h3 className="font-bold mb-4" style={{ color: colors.charcoal }}>
          Assessment Progress
        </h3>
        <div className="grid grid-cols-5 gap-2">
          {agents.map((agent, index) => {
            const isCompleted = assessment.agentAnalysis[agent.id];
            const isCurrent = currentAgent && currentAgent.id === agent.id;
            const Icon = agent.icon;
            
            return (
              <div key={agent.id} className="text-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mx-auto mb-2 ${
                  isCurrent ? 'bg-chestnut text-white' :
                  isCompleted ? 'bg-green-100 text-green-600' :
                  'bg-gray-100 text-gray-400'
                }`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className={`text-xs ${
                  isCurrent ? 'text-chestnut font-medium' :
                  isCompleted ? 'text-green-600' :
                  'text-gray-400'
                }`}>
                  {agent.name}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderResults = () => (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Overall Readiness */}
      <div className="bg-white rounded-xl p-8 shadow-sm">
        <div className="text-center mb-8">
          <div className="w-32 h-32 mx-auto mb-4 relative">
            <div className={`w-full h-full rounded-full flex items-center justify-center ${
              getReadinessLevelColor(results?.readinessLevel)
            }`}>
              <div className="text-2xl font-bold">
                {results?.readinessScore || 0}%
              </div>
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: colors.charcoal }}>
            Change Readiness Assessment
          </h2>
          <p className="text-lg">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              getReadinessLevelColor(results?.readinessLevel)
            }`}>
              {getReadinessLevelText(results?.readinessLevel)}
            </span>
          </p>
        </div>

        {/* Key Insights */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-bold mb-2">Strategic Alignment</h3>
            <p className="text-2xl font-bold" style={{ color: colors.chestnut }}>
              {results?.scores?.strategic || 0}%
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-bold mb-2">Organizational Readiness</h3>
            <p className="text-2xl font-bold" style={{ color: colors.chestnut }}>
              {results?.scores?.organizational || 0}%
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Settings className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="font-bold mb-2">Technical Feasibility</h3>
            <p className="text-2xl font-bold" style={{ color: colors.chestnut }}>
              {results?.scores?.technical || 0}%
            </p>
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold" style={{ color: colors.charcoal, fontFamily: 'Playfair Display' }}>
          Expert Recommendations
        </h2>
        
        {/* Enhanced CrewAI Analysis Display - Always prioritize rich CrewAI insights */}
        {results ? renderEnhancedCrewAIResults(results) : (
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <RefreshCw className="w-8 h-8 text-blue-500 mx-auto mb-3 animate-spin" />
                <h3 className="text-lg font-semibold mb-2" style={{ color: colors.charcoal }}>
                  Generating Strategic Analysis
                </h3>
                <p className="text-gray-600">
                  Our AI agents are analyzing your responses to create personalized recommendations...
                </p>
              </div>
            </div>
          </div>
        )}
      </div>


      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-chestnut text-white px-6 py-3 rounded-lg font-medium hover:bg-chestnut/90 transition-colors flex items-center justify-center"
        >
          <Home className="w-4 h-4 mr-2" />
          Back to Dashboard
        </button>
        <button
          onClick={() => {
            // Download report functionality
            console.log('Download report');
          }}
          className="bg-white border border-chestnut text-chestnut px-6 py-3 rounded-lg font-medium hover:bg-chestnut/10 transition-colors flex items-center justify-center"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Report
        </button>
        <button
          onClick={() => {
            setCurrentStep('intro');
            setAssessment({
              responses: [],
              agentAnalysis: {},
              recommendations: [],
              readinessLevel: null,
              isComplete: false
            });
            setResults(null);
          }}
          className="border border-gray-300 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
        >
          Start New Assessment
        </button>
      </div>
    </div>
  );

  const renderStepIndicator = () => (
    <div className="flex justify-center mb-8">
      <div className="flex items-center space-x-2">
        {assessmentSteps.map((step, index) => {
          const Icon = step.icon;
          const isActive = step.id === currentStep;
          const isCompleted = assessmentSteps.findIndex(s => s.id === currentStep) > index;
          
          return (
            <div key={step.id} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                isActive ? 'bg-chestnut text-white' : 
                isCompleted ? 'bg-green-100 text-green-600' : 
                'bg-gray-100 text-gray-400'
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="ml-2 mr-4">
                <div className={`text-sm font-medium ${
                  isActive ? 'text-chestnut' : 
                  isCompleted ? 'text-green-600' : 
                  'text-gray-400'
                }`}>
                  {step.title}
                </div>
              </div>
              {index < assessmentSteps.length - 1 && (
                <div className={`w-8 h-0.5 ${
                  isCompleted ? 'bg-green-300' : 'bg-gray-200'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  // Enhanced CrewAI Results Display Component
  const renderEnhancedCrewAIResults = (results) => {
    if (!results) {
      console.log('❌ No results data available for display');
      return null;
    }

    console.log('🎯 DISPLAY: Rendering results with structure:', {
      // Check for mapped fields
      hasBusinessRecs: !!(results.business_recommendations),
      hasLearningPath: !!(results.learning_path),
      hasImplementationRoadmap: !!(results.implementation_roadmap),
      
      // Check for original CrewAI fields
      hasRecommendations: !!(results.recommendations),
      hasPortfolioGuidance: !!(results.portfolio_guidance),
      hasRiskAssessment: !!(results.risk_assessment),
      hasScoringBreakdown: !!(results.scoring_breakdown),
      hasNextSteps: !!(results.next_steps),
      
      allKeys: Object.keys(results)
    });

    return (
      <div className="space-y-6">
        {/* Strategic Recommendations - Check both mapped and original fields */}
        {((results.business_recommendations && results.business_recommendations.length > 0) || 
          (results.recommendations && results.recommendations.length > 0)) && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border">
            <div className="flex items-center mb-4">
              <Brain className="w-5 h-5 mr-3" style={{ color: colors.chestnut }} />
              <h4 className="font-bold text-lg" style={{ color: colors.charcoal }}>
                Strategic AI Implementation Recommendations
              </h4>
            </div>
            <div className="space-y-4">
              {/* Use mapped business_recommendations if available, otherwise use original recommendations */}
              {(results.business_recommendations || 
                (results.recommendations && results.recommendations.map((rec, index) => ({
                  title: `Strategic Recommendation ${index + 1}`,
                  description: rec,
                  expected_impact: "Organizational improvement",
                  implementation_timeline: "2-6 months"
                })))
              ).map((rec, index) => (
                <div key={index} className="bg-white p-4 rounded-lg border-l-4 border-blue-400">
                  <div className="font-semibold mb-2" style={{ color: colors.charcoal }}>
                    {rec.title || `Strategic Initiative ${index + 1}`}
                  </div>
                  <div className="text-gray-700 mb-2">
                    {rec.description || rec}
                  </div>
                  {rec.expected_impact && (
                    <div className="text-blue-600 font-medium text-sm">
                      Expected Impact: {rec.expected_impact}
                    </div>
                  )}
                  {rec.implementation_timeline && (
                    <div className="text-blue-600 font-medium text-sm">
                      Timeline: {rec.implementation_timeline}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Portfolio Guidance as Learning Path */}
        {(results.learning_path || results.portfolio_guidance) && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border">
            <div className="flex items-center mb-4">
              <Target className="w-5 h-5 mr-3" style={{ color: colors.khaki }} />
              <h4 className="font-bold text-lg" style={{ color: colors.charcoal }}>
                Portfolio & Implementation Guidance
              </h4>
            </div>
            
            {/* Display portfolio guidance */}
            {results.portfolio_guidance && (
              <div className="mb-4">
                <div className="text-gray-600 mb-2 font-medium">Expert Portfolio Guidance:</div>
                <div className="space-y-2">
                  {results.portfolio_guidance.priority_initiatives ? 
                    results.portfolio_guidance.priority_initiatives.map((initiative, index) => (
                      <div key={index} className="bg-white p-3 rounded border-l-4 border-green-400">
                        <div className="text-sm font-medium text-gray-900">{initiative}</div>
                      </div>
                    )) : 
                    typeof results.portfolio_guidance === 'object' ? (
                      <div className="bg-white p-3 rounded border-l-4 border-green-400">
                        <div className="text-sm font-medium text-gray-900">
                          Timeline: {results.portfolio_guidance.timeline || 'Strategic implementation plan available'}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-white p-3 rounded border-l-4 border-green-400">
                        <div className="text-sm font-medium text-gray-900">{results.portfolio_guidance}</div>
                      </div>
                    )
                  }
                </div>
              </div>
            )}
            
            {/* Display mapped learning path if available */}
            {results.learning_path && results.learning_path.priority_areas && (
              <div className="mb-4">
                <div className="text-gray-600 mb-2 font-medium">Priority Focus Areas:</div>
                <div className="flex flex-wrap gap-2">
                  {results.learning_path.priority_areas.map((area, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-700 font-medium"
                    >
                      {area.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {results.timeline_estimate && (
              <div className="text-green-600 font-medium">
                Estimated Timeline: {results.timeline_estimate}
              </div>
            )}
          </div>
        )}

        {/* Risk Assessment as Implementation Roadmap */}
        {(results.implementation_roadmap || results.risk_assessment) && (
          <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-xl border">
            <div className="flex items-center mb-4">
              <Shield className="w-5 h-5 mr-3" style={{ color: colors.chestnut }} />
              <h4 className="font-bold text-lg" style={{ color: colors.charcoal }}>
                Risk Assessment & Mitigation Strategy
              </h4>
            </div>
            
            {/* Display risk assessment */}
            {results.risk_assessment && (
              <div className="space-y-3">
                {results.risk_assessment.high_risks && (
                  <div>
                    <div className="font-semibold mb-2 text-red-800">High Priority Risks:</div>
                    <div className="space-y-2">
                      {results.risk_assessment.high_risks.map((risk, index) => (
                        <div key={index} className="bg-white p-3 rounded border-l-4 border-red-400">
                          <div className="text-sm font-medium text-gray-900">{risk}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {results.risk_assessment.mitigation_strategies && (
                  <div>
                    <div className="font-semibold mb-2 text-green-800">Mitigation Strategies:</div>
                    <div className="space-y-2">
                      {results.risk_assessment.mitigation_strategies.map((strategy, index) => (
                        <div key={index} className="bg-white p-3 rounded border-l-4 border-green-400">
                          <div className="text-sm font-medium text-gray-900">{strategy}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Display mapped implementation roadmap if available */}
            {results.implementation_roadmap && results.implementation_roadmap.phases && (
              <div className="space-y-3">
                {results.implementation_roadmap.phases.map((phase, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg border-l-4 border-purple-400">
                    <div className="font-semibold mb-1" style={{ color: colors.charcoal }}>
                      {phase.name || `Phase ${index + 1}`}
                    </div>
                    <div className="text-gray-700 text-sm mb-2">
                      {phase.description}
                    </div>
                    {phase.duration && (
                      <div className="text-purple-600 text-xs font-medium">
                        Duration: {phase.duration}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Visual Analytics */}
        {results.visual_analytics && (
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-xl border">
            <div className="flex items-center mb-4">
              <BarChart3 className="w-5 h-5 mr-3" style={{ color: colors.chestnut }} />
              <h4 className="font-bold text-lg" style={{ color: colors.charcoal }}>
                Assessment Analytics
              </h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(results.visual_analytics).map(([key, value]) => (
                <div key={key} className="bg-white p-3 rounded-lg">
                  <div className="text-gray-600 capitalize mb-1 font-medium">
                    {key.replace(/_/g, ' ')}
                  </div>
                  <div className="text-lg font-semibold" style={{ color: colors.chestnut }}>
                    {typeof value === 'number' ? `${Math.round(value * 10)}%` : value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Enhanced Scoring Breakdown */}
        {results.scoring_breakdown && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-xl border">
            <div className="flex items-center mb-4">
              <PieChart className="w-5 h-5 mr-3" style={{ color: colors.chestnut }} />
              <h4 className="font-bold text-lg" style={{ color: colors.charcoal }}>
                Detailed Readiness Scoring
              </h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(results.scoring_breakdown)
                .filter(([key]) => key !== 'overall_score')
                .map(([area, score]) => (
                  <div key={area} className="bg-white p-3 rounded-lg">
                    <div className="text-gray-600 capitalize mb-2 font-medium">
                      {area.replace(/_/g, ' ').replace('readiness', 'Readiness')}
                    </div>
                    <div className="flex items-center">
                      <div className="flex-1 bg-gray-200 rounded-full h-3 mr-3">
                        <div 
                          className="h-3 rounded-full transition-all duration-300" 
                          style={{ 
                            backgroundColor: score >= 3.5 ? colors.khaki : score >= 2.5 ? '#FBD38D' : '#FEB2B2',
                            width: `${Math.min((score / 5) * 100, 100)}%` 
                          }}
                        />
                      </div>
                      <span className="font-semibold w-12">{score}/5</span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Enhanced Next Steps */}
        {results.next_steps && results.next_steps.length > 0 && (
          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-6 rounded-xl border">
            <div className="flex items-center mb-4">
              <Zap className="w-5 h-5 mr-3" style={{ color: colors.chestnut }} />
              <h4 className="font-bold text-lg" style={{ color: colors.charcoal }}>
                Immediate Action Plan
              </h4>
            </div>
            <div className="space-y-3">
              {results.next_steps.map((step, index) => (
                <div key={index} className="flex items-start bg-white p-4 rounded-lg">
                  <span className="w-8 h-8 rounded-full bg-teal-100 text-teal-700 text-center text-sm mr-3 mt-0.5 flex-shrink-0 flex items-center justify-center font-semibold">
                    {index + 1}
                  </span>
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      {typeof step === 'object' ? (step.title || step.action || step.description || step) : step}
                    </div>
                    {typeof step === 'object' && step.timeline && (
                      <div className="text-xs text-teal-600 mt-1 font-medium">⏱️ {step.timeline}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Enhanced CrewAI Agent Analysis */}
        {results.raw_crewai_output && (
          <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-6 rounded-xl border">
            <div className="flex items-center mb-4">
              <Brain className="w-5 h-5 mr-3" style={{ color: colors.chestnut }} />
              <h4 className="font-bold text-lg" style={{ color: colors.charcoal }}>
                Strategic AI Implementation Analysis
              </h4>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div 
                className="text-sm leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: convertMarkdownToHTML(
                    typeof results.raw_crewai_output === 'string' 
                      ? results.raw_crewai_output
                      : results.raw_crewai_output.crewai_results?.raw || 
                        JSON.stringify(results.raw_crewai_output, null, 2)
                  )
                }}
              />
            </div>
          </div>
        )}
      </div>
    );
  };
  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.bone }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {renderStepIndicator()}
        
        {currentStep === 'intro' && renderIntroduction()}
        {currentStep === 'organization' && renderOrganizationForm()}
        {currentStep === 'project' && renderProjectForm()}
        {currentStep === 'loading' && renderAIAgentsLoading()}
        {currentStep === 'assessment' && renderAssessment()}
        {currentStep === 'results' && renderResults()}
      </div>
    </div>
  );
};

export default ChangeReadinessAssessment;