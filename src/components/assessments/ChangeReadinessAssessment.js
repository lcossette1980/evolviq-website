import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Target, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  Building, 
  Lightbulb,
  Shield,
  RefreshCw,
  Download,
  ArrowRight,
  Award,
  BookOpen,
  MessageSquare,
  BarChart3,
  Settings,
  Zap,
  Eye,
  FileText,
  Home
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
        }
      }
    } catch (error) {
      console.error('Error loading previous assessment:', error);
    }
  };

  const startAssessment = async () => {
    setIsLoading(true);
    try {
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
      
      setCurrentAgent(mockAgent);
      setCurrentStep('assessment');
      setAssessment(prev => ({
        ...prev,
        responses: [],
        agentAnalysis: {},
        currentAgentIndex: 0,
        sessionData: { session_id: responseData.session_id }
      }));
    } catch (error) {
      console.error('Error starting assessment:', error);
    } finally {
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
      const response = await assessmentAPI.submitChangeReadinessResponse(
        user.uid,
        {
          questionId: currentAgent.questionId,
          answer: userResponse,
          sessionData: { 
            session_id: assessment.sessionData?.session_id || currentAgent.sessionId,
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

      if (response.isComplete || response.data?.is_complete || response.is_complete) {
        // Assessment is complete
        const results = response.results || response.data?.analysis || response.analysis;
        setResults(results);
        setCurrentStep('results');
        updatedAssessment.isComplete = true;
        updatedAssessment.results = results;
        
        // Track assessment completion in project
        if (currentProject) {
          const assessmentData = {
            readinessLevel: response.results?.readinessLevel || 'get_help',
            overallScore: response.results?.overallScore || 0,
            agentAnalysis: response.results?.agentAnalysis || {},
            recommendations: response.results?.recommendations || [],
            organizationData,
            projectData,
            completedAt: new Date().toISOString(),
            assessmentId: `change_readiness_${user.uid}_${Date.now()}`
          };
          
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
    } catch (error) {
      console.error('Error submitting response:', error);
      console.error('Error details:', error.message);
      // Still update the frontend state even if save fails
      setAssessment(updatedAssessment);
      setUserResponse('');
      
      // Continue with next question or completion even if save fails
      if (response.isComplete || response.data?.is_complete || response.is_complete) {
        const results = response.results || response.data?.analysis || response.analysis;
        setResults(results);
        setCurrentStep('results');
      } else {
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

  const renderIntroduction = () => (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Hero Section */}
      <div className="text-center py-12 px-8 rounded-xl" style={{ backgroundColor: colors.pearl }}>
        <Building className="w-20 h-20 mx-auto mb-6" style={{ color: colors.chestnut }} />
        <h1 className="text-4xl font-bold mb-4" style={{ color: colors.charcoal, fontFamily: 'Playfair Display' }}>
          Change Readiness Assessment
        </h1>
        <p className="text-xl mb-6" style={{ color: colors.charcoal }}>
          Multi-agent evaluation of your organization's readiness for AI transformation
        </p>
        <div className="flex justify-center">
          <span className="bg-chestnut text-white px-4 py-2 rounded-full text-sm font-medium">
            Premium Assessment
          </span>
        </div>
      </div>

      {/* How It Works */}
      <div className="bg-white rounded-xl p-8 shadow-sm">
        <h2 className="text-2xl font-bold mb-6" style={{ color: colors.charcoal, fontFamily: 'Playfair Display' }}>
          Multi-Agent Assessment Process
        </h2>
        <div className="grid md:grid-cols-5 gap-4">
          {agents.map((agent, index) => {
            const Icon = agent.icon;
            return (
              <div key={index} className="text-center">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${agent.color}`}>
                  <Icon className="w-8 h-8" />
                </div>
                <h3 className="font-semibold mb-2 text-sm">{agent.name}</h3>
                <p className="text-xs text-gray-600">{agent.role}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Assessment Areas */}
      <div className="bg-white rounded-xl p-8 shadow-sm">
        <h2 className="text-2xl font-bold mb-6" style={{ color: colors.charcoal, fontFamily: 'Playfair Display' }}>
          What We Evaluate
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Target className="w-6 h-6 text-blue-600 mt-1" />
              <div>
                <h3 className="font-semibold">Strategic Alignment</h3>
                <p className="text-sm text-gray-600">How well AI initiatives align with business objectives</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Users className="w-6 h-6 text-green-600 mt-1" />
              <div>
                <h3 className="font-semibold">Organizational Readiness</h3>
                <p className="text-sm text-gray-600">Culture, skills, and change management capabilities</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Shield className="w-6 h-6 text-red-600 mt-1" />
              <div>
                <h3 className="font-semibold">Risk Assessment</h3>
                <p className="text-sm text-gray-600">Potential challenges and mitigation strategies</p>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <Settings className="w-6 h-6 text-purple-600 mt-1" />
              <div>
                <h3 className="font-semibold">Technical Feasibility</h3>
                <p className="text-sm text-gray-600">Infrastructure, data, and technical requirements</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <TrendingUp className="w-6 h-6 text-orange-600 mt-1" />
              <div>
                <h3 className="font-semibold">Impact Evaluation</h3>
                <p className="text-sm text-gray-600">Expected outcomes and success metrics</p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <BookOpen className="w-6 h-6 text-indigo-600 mt-1" />
              <div>
                <h3 className="font-semibold">Implementation Roadmap</h3>
                <p className="text-sm text-gray-600">Step-by-step plan for successful deployment</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* What You Get */}
      <div className="bg-white rounded-xl p-8 shadow-sm">
        <h2 className="text-2xl font-bold mb-6" style={{ color: colors.charcoal, fontFamily: 'Playfair Display' }}>
          Comprehensive Assessment Report
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2">Readiness Score</h3>
            <p className="text-sm text-gray-600">Overall readiness level with detailed breakdown</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lightbulb className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-semibold mb-2">Recommendations</h3>
            <p className="text-sm text-gray-600">Actionable insights from each specialist agent</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-2">Implementation Plan</h3>
            <p className="text-sm text-gray-600">Detailed roadmap for your AI transformation</p>
          </div>
        </div>
      </div>

      {/* Start Button */}
      <div className="text-center">
        <button
          onClick={() => setCurrentStep('organization')}
          className="bg-chestnut text-white px-8 py-4 rounded-lg font-medium hover:bg-chestnut/90 transition-colors"
        >
          <ArrowRight className="w-5 h-5 inline mr-2" />
          Begin Assessment
        </button>
      </div>
    </div>
  );

  const renderOrganizationForm = () => (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="bg-white rounded-xl p-8 shadow-sm">
        <h2 className="text-2xl font-bold mb-6" style={{ color: colors.charcoal, fontFamily: 'Playfair Display' }}>
          Organization Information
        </h2>
        
        <div className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.charcoal }}>
                Organization Name *
              </label>
              <input
                type="text"
                value={organizationData.name}
                onChange={(e) => setOrganizationData({...organizationData, name: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chestnut focus:border-transparent"
                placeholder="Enter your organization name"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.charcoal }}>
                Organization Type *
              </label>
              <select
                value={organizationData.type}
                onChange={(e) => setOrganizationData({...organizationData, type: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chestnut focus:border-transparent"
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
              <label className="block text-sm font-medium mb-2" style={{ color: colors.charcoal }}>
                Industry *
              </label>
              <input
                type="text"
                value={organizationData.industry}
                onChange={(e) => setOrganizationData({...organizationData, industry: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chestnut focus:border-transparent"
                placeholder="e.g., Healthcare, Finance, Education"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: colors.charcoal }}>
                Organization Size *
              </label>
              <input
                type="number"
                value={organizationData.size}
                onChange={(e) => setOrganizationData({...organizationData, size: e.target.value})}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chestnut focus:border-transparent"
                placeholder="Number of employees"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: colors.charcoal }}>
              Current AI Maturity Level (1-5 scale)
            </label>
            <div className="flex items-center space-x-4">
              <input
                type="range"
                min="1"
                max="5"
                value={organizationData.aiMaturityScore || 1}
                onChange={(e) => setOrganizationData({...organizationData, aiMaturityScore: parseInt(e.target.value)})}
                className="flex-1"
              />
              <span className="text-sm font-medium" style={{ color: colors.chestnut }}>
                {organizationData.aiMaturityScore || 1}
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Beginner</span>
              <span>Expert</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-8">
          <button
            onClick={() => setCurrentStep('project')}
            disabled={!organizationData.name || !organizationData.type || !organizationData.industry || !organizationData.size}
            className="bg-chestnut text-white px-6 py-3 rounded-lg font-medium hover:bg-chestnut/90 transition-colors disabled:opacity-50"
          >
            Next: Project Details
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

      {/* Agent Recommendations */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold" style={{ color: colors.charcoal, fontFamily: 'Playfair Display' }}>
          Expert Recommendations
        </h2>
        
        {agents.map((agent, index) => {
          const analysis = assessment.agentAnalysis[agent.id];
          const Icon = agent.icon;
          
          if (!analysis) return null;
          
          return (
            <div key={agent.id} className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center mb-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${agent.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg" style={{ color: colors.charcoal }}>
                    {agent.name}
                  </h3>
                  <p className="text-sm" style={{ color: colors.khaki }}>
                    {agent.role}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Key Findings</h4>
                  <ul className="space-y-1 text-sm">
                    {analysis.findings?.map((finding, idx) => (
                      <li key={idx} className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2 mt-0.5" />
                        {finding}
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Recommendations</h4>
                  <ul className="space-y-1 text-sm">
                    {analysis.recommendations?.map((rec, idx) => (
                      <li key={idx} className="flex items-start">
                        <Lightbulb className="w-4 h-4 text-yellow-600 mr-2 mt-0.5" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Next Steps */}
      <div className="bg-white rounded-xl p-8 shadow-sm">
        <h3 className="text-2xl font-bold mb-6" style={{ color: colors.charcoal, fontFamily: 'Playfair Display' }}>
          Recommended Next Steps
        </h3>
        <div className="space-y-4">
          {results?.nextSteps?.map((step, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-chestnut rounded-full flex items-center justify-center text-white text-sm font-bold mt-1">
                {index + 1}
              </div>
              <div>
                <h4 className="font-medium mb-1">{step.title}</h4>
                <p className="text-sm text-gray-600">{step.description}</p>
                {step.timeline && (
                  <p className="text-xs text-gray-500 mt-1">Timeline: {step.timeline}</p>
                )}
              </div>
            </div>
          ))}
        </div>
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

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.bone }}>
      <div className="max-w-7xl mx-auto px-4 py-8">
        {renderStepIndicator()}
        
        {currentStep === 'intro' && renderIntroduction()}
        {currentStep === 'organization' && renderOrganizationForm()}
        {currentStep === 'project' && renderProjectForm()}
        {currentStep === 'assessment' && renderAssessment()}
        {currentStep === 'results' && renderResults()}
      </div>
    </div>
  );
};

export default ChangeReadinessAssessment;