import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Settings, 
  Crown, 
  BookOpen, 
  Target,
  TrendingUp, 
  Clock, 
  Calendar, 
  Award, 
  BarChart3,
  FileText,
  Eye,
  CheckCircle,
  Activity,
  Users,
  Briefcase,
  ChevronDown,
  ChevronRight,
  Filter,
  Search,
  MoreHorizontal,
  Archive,
  Edit3,
  PlayCircle,
  AlertCircle,
  Zap,
  PieChart,
  Layers,
  Shield,
  Brain
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useProject } from '../contexts/ProjectContext';
import { useNavigate } from 'react-router-dom';
import guidesAPI from '../services/guidesAPI';
import assessmentAPI from '../services/assessmentAPI';

const colors = {
  charcoal: '#2A2A2A',
  chestnut: '#A44A3F',
  khaki: '#A59E8C',
  pearl: '#D7CEB2',
  bone: '#F5F2EA',
  navy: '#2C3E50'
};

const MemberDashboard = () => {
  const { user, logout, isPremium } = useAuth();
  const { 
    projects, 
    currentProject, 
    loading: projectsLoading,
    createProject,
    switchProject,
    updateProject,
    trackActionItemCompletion,
    loadProjects
  } = useProject();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [guidesSummary, setGuidesSummary] = useState([]);
  const [actionItems, setActionItems] = useState([]);
  const [actionItemAnalytics, setActionItemAnalytics] = useState(null);
  const [userAssessments, setUserAssessments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateProject, setShowCreateProject] = useState(false);
  const [showProjectSelector, setShowProjectSelector] = useState(false);
  const [newProjectData, setNewProjectData] = useState({
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
  });

  useEffect(() => {
    const loadDashboardData = async () => {
      if (!user) return;
      
      try {
        // Load guides data
        const guides = await guidesAPI.getGuidesSummary(user.uid);
        setGuidesSummary(guides);
        
        // Load action items (all for user, filtered by project if selected)
        const projectId = currentProject?.id || null;
        const items = await assessmentAPI.getActionItems(user.uid, projectId);
        setActionItems(items);
        
        const analytics = await assessmentAPI.getActionItemAnalytics(user.uid, projectId);
        setActionItemAnalytics(analytics);
        
        // Load user assessments from Firebase
        const assessments = await assessmentAPI.getUserAssessments(user.uid);
        setUserAssessments(assessments);
        
        console.log('Dashboard data loaded:', {
          guides: guides.length,
          actionItems: items.length,
          assessments: assessments.length,
          completedAssessments: assessments.filter(a => a.isComplete).length,
          analytics,
          currentProject: currentProject?.id
        });
        
        // Debug assessment data structure
        if (assessments.length > 0) {
          console.log('Sample assessment:', assessments[0]);
        }
        
        // Debug action items
        if (items.length > 0) {
          console.log('Sample action item:', items[0]);
        }
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, [user, currentProject]);

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await createProject(newProjectData);
      setShowCreateProject(false);
      setNewProjectData({
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
      });
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const guides = [
    {
      id: 'ai-implementation-playbook',
      title: 'AI Implementation Playbook',
      description: 'Step-by-step guide for implementing AI solutions',
      path: '/guides/AIImplementationPlaybook',
      icon: PlayCircle,
      color: colors.chestnut
    },
    {
      id: 'ai-readiness-assessment',
      title: 'AI Readiness Assessment',
      description: 'Evaluate your organization\'s AI readiness',
      path: '/guides/AIReadinessAssessment',
      icon: Target,
      color: colors.chestnut
    },
    {
      id: 'ai-use-case-roi-toolkit',
      title: 'AI Use Case ROI Toolkit',
      description: 'Calculate ROI for AI use cases',
      path: '/guides/AIUseCaseROIToolkit',
      icon: TrendingUp,
      color: colors.khaki
    },
    {
      id: 'ai-strategy-starter-kit',
      title: 'AI Strategy Starter Kit',
      description: 'Build your AI strategy framework',
      path: '/guides/AIStrategyStarterKit',
      icon: Briefcase,
      color: colors.navy
    }
  ];

  const assessments = [
    {
      id: 'ai-knowledge-navigator',
      title: 'AI Knowledge Navigator',
      description: 'Assess your AI knowledge and get personalized learning paths',
      path: '/tools/ai-knowledge-navigator',
      icon: BookOpen,
      color: colors.chestnut,
      premium: false
    },
    {
      id: 'change-readiness-assessment',
      title: 'Change Readiness Assessment',
      description: 'Evaluate organizational readiness for AI transformation',
      path: '/tools/change-readiness-assessment',
      icon: Users,
      color: colors.chestnut,
      premium: true
    }
  ];

  const getProjectStatusColor = (status) => {
    switch (status) {
      case 'active': return colors.chestnut;
      case 'completed': return colors.khaki;
      case 'on_hold': return colors.pearl;
      case 'archived': return colors.charcoal;
      default: return colors.chestnut;
    }
  };

  const getReadinessLevelColor = (level) => {
    switch (level) {
      case 'start_now': return colors.chestnut;
      case 'prepare_first': return colors.khaki;
      case 'get_help': return colors.pearl;
      default: return colors.charcoal;
    }
  };

  const renderProjectSelector = () => (
    <div className="relative">
      <button
        onClick={() => setShowProjectSelector(!showProjectSelector)}
        className="flex items-center justify-between w-full px-4 py-3 bg-white rounded-lg shadow-sm border hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center">
          <div 
            className="w-3 h-3 rounded-full mr-3"
            style={{ backgroundColor: currentProject ? getProjectStatusColor(currentProject.status) : colors.charcoal }}
          />
          <div className="text-left">
            <h3 className="font-semibold text-gray-900">
              {currentProject ? currentProject.name : 'Select Project'}
            </h3>
            {currentProject && (
              <p className="text-sm text-gray-500">
                {currentProject.stage} • {currentProject.organization?.name || 'No organization'}
              </p>
            )}
          </div>
        </div>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {showProjectSelector && (
        <div className="absolute top-full mt-2 w-full bg-white rounded-lg shadow-lg border z-10">
          <div className="p-2 border-b">
            <button
              onClick={() => {
                setShowCreateProject(true);
                setShowProjectSelector(false);
              }}
              className="flex items-center w-full px-3 py-2 text-left hover:bg-gray-50 rounded-md"
            >
              <Plus className="w-4 h-4 mr-2" style={{ color: colors.chestnut }} />
              <span className="text-sm font-medium">Create New Project</span>
            </button>
          </div>
          <div className="max-h-64 overflow-y-auto">
            {projects.map((project) => (
              <button
                key={project.id}
                onClick={() => {
                  switchProject(project.id);
                  setShowProjectSelector(false);
                }}
                className={`flex items-center w-full px-3 py-2 text-left hover:bg-gray-50 ${
                  currentProject?.id === project.id ? 'bg-teal-50' : ''
                }`}
              >
                <div 
                  className="w-2 h-2 rounded-full mr-3"
                  style={{ backgroundColor: getProjectStatusColor(project.status) }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{project.name}</p>
                  <p className="text-xs text-gray-500 truncate">
                    {project.stage} • {new Date(project.lastUpdated?.seconds * 1000 || Date.now()).toLocaleDateString()}
                  </p>
                </div>
                {currentProject?.id === project.id && (
                  <CheckCircle className="w-4 h-4" style={{ color: colors.chestnut }} />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderCreateProjectModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold" style={{ color: colors.charcoal }}>
            Create New Project
          </h2>
          <p className="text-gray-600 mt-1">
            Set up a new AI implementation project to track your journey
          </p>
        </div>
        
        <form onSubmit={handleCreateProject} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Project Name *</label>
              <input
                type="text"
                required
                value={newProjectData.name}
                onChange={(e) => setNewProjectData({...newProjectData, name: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="Customer Service AI Implementation"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Organization Name</label>
              <input
                type="text"
                value={newProjectData.organizationName}
                onChange={(e) => setNewProjectData({...newProjectData, organizationName: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                placeholder="Your Company Name"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={newProjectData.description}
              onChange={(e) => setNewProjectData({...newProjectData, description: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
              rows="2"
              placeholder="Brief description of your AI project goals"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Industry</label>
              <select
                value={newProjectData.industry}
                onChange={(e) => setNewProjectData({...newProjectData, industry: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Select Industry</option>
                <option value="technology">Technology</option>
                <option value="healthcare">Healthcare</option>
                <option value="finance">Finance</option>
                <option value="retail">Retail</option>
                <option value="manufacturing">Manufacturing</option>
                <option value="education">Education</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Organization Size</label>
              <select
                value={newProjectData.organizationSize}
                onChange={(e) => setNewProjectData({...newProjectData, organizationSize: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Select Size</option>
                <option value="1-10">1-10 employees</option>
                <option value="11-50">11-50 employees</option>
                <option value="51-200">51-200 employees</option>
                <option value="201-500">201-500 employees</option>
                <option value="500+">500+ employees</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Project Objective</label>
            <textarea
              value={newProjectData.objective}
              onChange={(e) => setNewProjectData({...newProjectData, objective: e.target.value})}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
              rows="2"
              placeholder="What specific business problem are you solving with AI?"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Stage</label>
              <select
                value={newProjectData.stage}
                onChange={(e) => setNewProjectData({...newProjectData, stage: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                <option value="exploring">Exploring</option>
                <option value="planning">Planning</option>
                <option value="implementing">Implementing</option>
                <option value="optimizing">Optimizing</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Budget Range</label>
              <select
                value={newProjectData.budget}
                onChange={(e) => setNewProjectData({...newProjectData, budget: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                <option value="under_10k">Under $10k</option>
                <option value="10k_50k">$10k - $50k</option>
                <option value="50k_100k">$50k - $100k</option>
                <option value="100k_500k">$100k - $500k</option>
                <option value="over_500k">Over $500k</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Timeline</label>
              <select
                value={newProjectData.timeline}
                onChange={(e) => setNewProjectData({...newProjectData, timeline: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                <option value="1_month">1 Month</option>
                <option value="3_months">3 Months</option>
                <option value="6_months">6 Months</option>
                <option value="12_months">12 Months</option>
                <option value="ongoing">Ongoing</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => setShowCreateProject(false)}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 rounded-full text-white font-medium"
              style={{ backgroundColor: colors.chestnut }}
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Project Overview */}
      {currentProject && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold" style={{ color: colors.charcoal }}>
              Project Overview
            </h3>
            <button
              onClick={() => navigate('/account')}
              className="text-gray-400 hover:text-gray-600"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: colors.chestnut }}>
                {currentProject.stage}
              </div>
              <div className="text-sm text-gray-500">Current Stage</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: colors.chestnut }}>
                {userAssessments.filter(a => a.isComplete).length}
              </div>
              <div className="text-sm text-gray-500">Assessments</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: colors.khaki }}>
                {Object.keys(currentProject.guides || {}).length}
              </div>
              <div className="text-sm text-gray-500">Guides Started</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: colors.navy }}>
                {actionItems.filter(item => item.status === 'pending').length}
              </div>
              <div className="text-sm text-gray-500">Pending Actions</div>
            </div>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: colors.charcoal }}>
          Recent Activity
        </h3>
        {(() => {
          // Combine project timeline with assessment completions
          const projectActivity = currentProject?.timeline || [];
          const assessmentActivity = userAssessments
            .filter(a => a.isComplete)
            .slice(0, 3)
            .map(assessment => ({
              id: assessment.id,
              type: 'assessment_completed',
              assessmentType: assessment.assessmentType,
              date: assessment.lastUpdated?.seconds ? new Date(assessment.lastUpdated.seconds * 1000).toISOString() : assessment.lastUpdated,
              title: `Completed ${assessment.assessmentType.replace('_', ' ')} assessment`,
              data: {
                score: assessment.results?.overallScore,
                level: assessment.results?.overallMaturityLevel || assessment.results?.readinessLevel
              }
            }));
          
          const allActivity = [...projectActivity, ...assessmentActivity]
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 5);
          
          const getActivityIcon = (type) => {
            switch (type) {
              case 'assessment_completed':
                return <Target className="w-4 h-4" style={{ color: colors.chestnut }} />;
              case 'guide_accessed':
                return <BookOpen className="w-4 h-4" style={{ color: colors.khaki }} />;
              case 'action_completed':
                return <CheckCircle className="w-4 h-4" style={{ color: colors.chestnut }} />;
              default:
                return <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colors.chestnut }} />;
            }
          };
          
          return allActivity.length > 0 ? (
            <div className="space-y-3">
              {allActivity.map((event, index) => (
                <div key={event.id || index} className="flex items-center space-x-3">
                  {getActivityIcon(event.type)}
                  <div className="flex-1">
                    <p className="text-sm font-medium">{event.title}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(event.date).toLocaleDateString()}
                    </p>
                    {event.data?.score && (
                      <p className="text-xs text-gray-400">
                        Score: {event.data.score} {event.data.level && `• Level: ${event.data.level}`}
                      </p>
                    )}
                    {event.assessmentType && (
                      <p className="text-xs text-gray-400">
                        {event.assessmentType.replace('_', ' ')}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Activity className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No recent activity. Start by taking an assessment or exploring guides.</p>
            </div>
          );
        })()}
      </div>

      {/* Member Resources Carousel */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-semibold" style={{ color: colors.charcoal }}>
              Interactive Learning Resources
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Hands-on tools, codebooks, and training materials to accelerate your AI journey
            </p>
          </div>
          <div className="flex space-x-2">
            <button 
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              onClick={() => {
                const container = document.getElementById('resources-carousel');
                container.scrollBy({ left: -300, behavior: 'smooth' });
              }}
            >
              <ChevronRight className="w-4 h-4 transform rotate-180 text-gray-600" />
            </button>
            <button 
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              onClick={() => {
                const container = document.getElementById('resources-carousel');
                container.scrollBy({ left: 300, behavior: 'smooth' });
              }}
            >
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </button>
          </div>
        </div>
        
        <div 
          id="resources-carousel"
          className="flex space-x-4 overflow-x-auto scrollbar-hide pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {/* Linear Regression Tool */}
          <div className="flex-shrink-0 w-80 border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer">
            <div className="aspect-video bg-gradient-to-br from-chestnut/10 to-khaki/10 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
              <img 
                src="/images/resources/lin-reg.jpg" 
                alt="Linear Regression Tool" 
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-1 bg-chestnut/10 text-chestnut text-xs font-medium rounded">
                  Interactive Tool
                </span>
                <PlayCircle className="w-4 h-4 text-gray-400" />
              </div>
              <h4 className="font-semibold text-charcoal">Linear Regression Playground</h4>
              <p className="text-sm text-gray-600">
                Upload your data, train models, and explore regression analysis with our interactive tool
              </p>
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>🎯 Easy to Use</span>
                  <span>⏱️ 15-30 min</span>
                </div>
                <button
                  onClick={() => navigate('/tools/linear-regression')}
                  className="px-3 py-1 bg-chestnut text-white text-sm rounded-lg hover:bg-chestnut/90 transition-colors"
                >
                  Launch Tool
                </button>
              </div>
            </div>
          </div>

          {/* EDA Explorer */}
          <div className="flex-shrink-0 w-80 border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer">
            <div className="aspect-video bg-gradient-to-br from-chestnut/10 to-khaki/10 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
              <img 
                src="/images/resources/eda.jpg" 
                alt="EDA Explorer Tool" 
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-1 bg-chestnut/10 text-chestnut text-xs font-medium rounded">
                  Interactive Tool
                </span>
                <PlayCircle className="w-4 h-4 text-gray-400" />
              </div>
              <h4 className="font-semibold text-charcoal">EDA Explorer</h4>
              <p className="text-sm text-gray-600">
                Comprehensive exploratory data analysis with real-time insights and visualizations
              </p>
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>🔍 Data Analysis</span>
                  <span>⏱️ 20-35 min</span>
                </div>
                <button
                  onClick={() => navigate('/tools/eda-explorer')}
                  className="px-3 py-1 bg-chestnut text-white text-sm rounded-lg hover:bg-chestnut/90 transition-colors"
                >
                  Launch Tool
                </button>
              </div>
            </div>
          </div>

          {/* Classification Explorer */}
          <div className="flex-shrink-0 w-80 border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer">
            <div className="aspect-video bg-gradient-to-br from-chestnut/10 to-khaki/10 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
              <img 
                src="/images/resources/classification.jpg" 
                alt="Classification Explorer Tool" 
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-1 bg-chestnut/10 text-chestnut text-xs font-medium rounded">
                  Interactive Tool
                </span>
                <PlayCircle className="w-4 h-4 text-gray-400" />
              </div>
              <h4 className="font-semibold text-charcoal">Classification Explorer</h4>
              <p className="text-sm text-gray-600">
                Machine learning classification with 9 algorithms and comprehensive evaluation
              </p>
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>🤖 ML Models</span>
                  <span>⏱️ 25-40 min</span>
                </div>
                <button
                  onClick={() => navigate('/tools/classification-explorer')}
                  className="px-3 py-1 bg-chestnut text-white text-sm rounded-lg hover:bg-chestnut/90 transition-colors"
                >
                  Launch Tool
                </button>
              </div>
            </div>
          </div>

          {/* Clustering Explorer */}
          <div className="flex-shrink-0 w-80 border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer">
            <div className="aspect-video bg-gradient-to-br from-chestnut/10 to-khaki/10 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
              <img 
                src="/images/resources/clustering.jpg" 
                alt="Clustering Explorer Tool" 
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-1 bg-chestnut/10 text-chestnut text-xs font-medium rounded">
                  Interactive Tool
                </span>
                <PlayCircle className="w-4 h-4 text-gray-400" />
              </div>
              <h4 className="font-semibold text-charcoal">Clustering Explorer</h4>
              <p className="text-sm text-gray-600">
                Unsupervised learning with 8 clustering algorithms and optimization techniques
              </p>
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>🔗 Clustering</span>
                  <span>⏱️ 20-35 min</span>
                </div>
                <button
                  onClick={() => navigate('/tools/clustering-explorer')}
                  className="px-3 py-1 bg-chestnut text-white text-sm rounded-lg hover:bg-chestnut/90 transition-colors"
                >
                  Launch Tool
                </button>
              </div>
            </div>
          </div>

          {/* NLP Explorer */}
          <div className="flex-shrink-0 w-80 border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer">
            <div className="aspect-video bg-gradient-to-br from-chestnut/10 to-khaki/10 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
              <img 
                src="/images/resources/nlp.jpg" 
                alt="NLP Explorer Tool" 
                className="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-1 bg-chestnut/10 text-chestnut text-xs font-medium rounded">
                  Interactive Tool
                </span>
                <PlayCircle className="w-4 h-4 text-gray-400" />
              </div>
              <h4 className="font-semibold text-charcoal">NLP Explorer</h4>
              <p className="text-sm text-gray-600">
                Natural language processing with sentiment analysis, classification, and topic modeling
              </p>
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>📝 Text Analysis</span>
                  <span>⏱️ 30-45 min</span>
                </div>
                <button
                  onClick={() => navigate('/tools/nlp-explorer')}
                  className="px-3 py-1 bg-chestnut text-white text-sm rounded-lg hover:bg-chestnut/90 transition-colors"
                >
                  Launch Tool
                </button>
              </div>
            </div>
          </div>

          {/* Python Data Science Codebook - Coming Soon */}
          <div className="flex-shrink-0 w-80 border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer opacity-75">
            <div className="aspect-video bg-gradient-to-br from-navy/10 to-pearl/10 rounded-lg mb-4 flex items-center justify-center">
              <FileText className="w-12 h-12" style={{ color: colors.navy }} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-1 bg-navy/10 text-navy text-xs font-medium rounded">
                  Codebook
                </span>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded">
                  Coming Soon
                </span>
              </div>
              <h4 className="font-semibold text-charcoal">Python Data Science Essentials</h4>
              <p className="text-sm text-gray-600">
                Interactive Jupyter notebook covering pandas, visualization, and ML fundamentals
              </p>
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>🐍 Python</span>
                  <span>⏱️ 2-3 hours</span>
                </div>
                <button
                  disabled
                  className="px-3 py-1 bg-gray-300 text-gray-500 text-sm rounded-lg cursor-not-allowed"
                >
                  Notify Me
                </button>
              </div>
            </div>
          </div>

          {/* AI Strategy Template */}
          <div className="flex-shrink-0 w-80 border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer">
            <div className="aspect-video bg-gradient-to-br from-khaki/10 to-chestnut/10 rounded-lg mb-4 flex items-center justify-center">
              <Briefcase className="w-12 h-12" style={{ color: colors.khaki }} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-1 bg-khaki/10 text-khaki text-xs font-medium rounded">
                  Template
                </span>
                <Crown className="w-4 h-4 text-yellow-500" />
              </div>
              <h4 className="font-semibold text-charcoal">AI Strategy Canvas</h4>
              <p className="text-sm text-gray-600">
                Downloadable template to map your organization's AI transformation strategy
              </p>
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>📋 PDF Template</span>
                  <span>⏱️ 1 hour</span>
                </div>
                <button
                  onClick={() => isPremium ? 
                    window.open('/templates/ai-strategy-canvas.pdf', '_blank') : 
                    navigate('/membership')
                  }
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    isPremium 
                      ? 'bg-khaki text-white hover:bg-khaki/90' 
                      : 'bg-gray-300 text-gray-500'
                  }`}
                >
                  {isPremium ? 'Download' : 'Premium'}
                </button>
              </div>
            </div>
          </div>

          {/* ROI Calculator */}
          <div className="flex-shrink-0 w-80 border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer opacity-75">
            <div className="aspect-video bg-gradient-to-br from-chestnut/10 to-navy/10 rounded-lg mb-4 flex items-center justify-center">
              <PieChart className="w-12 h-12" style={{ color: colors.chestnut }} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-1 bg-chestnut/10 text-chestnut text-xs font-medium rounded">
                  Calculator
                </span>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded">
                  Coming Soon
                </span>
              </div>
              <h4 className="font-semibold text-charcoal">AI ROI Calculator</h4>
              <p className="text-sm text-gray-600">
                Interactive tool to calculate potential return on investment for AI initiatives
              </p>
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>💰 ROI Analysis</span>
                  <span>⏱️ 10-15 min</span>
                </div>
                <button
                  disabled
                  className="px-3 py-1 bg-gray-300 text-gray-500 text-sm rounded-lg cursor-not-allowed"
                >
                  Notify Me
                </button>
              </div>
            </div>
          </div>

          {/* Video Series */}
          <div className="flex-shrink-0 w-80 border rounded-lg p-4 hover:shadow-md transition-all cursor-pointer opacity-75">
            <div className="aspect-video bg-gradient-to-br from-pearl/10 to-khaki/10 rounded-lg mb-4 flex items-center justify-center">
              <PlayCircle className="w-12 h-12" style={{ color: colors.khaki }} />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-1 bg-khaki/10 text-khaki text-xs font-medium rounded">
                  Video Series
                </span>
                <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-medium rounded">
                  Coming Soon
                </span>
              </div>
              <h4 className="font-semibold text-charcoal">AI Implementation Masterclass</h4>
              <p className="text-sm text-gray-600">
                Step-by-step video series covering real-world AI implementation scenarios
              </p>
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>🎥 5 Episodes</span>
                  <span>⏱️ 20 min each</span>
                </div>
                <button
                  disabled
                  className="px-3 py-1 bg-gray-300 text-gray-500 text-sm rounded-lg cursor-not-allowed"
                >
                  Notify Me
                </button>
              </div>
            </div>
          </div>
        </div>
        
      </div>

    </div>
  );

  const renderAIJourney = () => {
    const hasKnowledgeAssessment = userAssessments.some(a => a.assessmentType === 'ai_knowledge_navigator' && a.isComplete);
    const hasChangeReadinessAssessment = userAssessments.some(a => a.assessmentType === 'change_readiness' && a.isComplete);
    
    return (
      <div className="space-y-6">
        {/* Journey Steps */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-6" style={{ color: colors.charcoal }}>
            Your AI Transformation Journey
          </h3>
          <div className="space-y-4">
            {/* Step 1: Knowledge Assessment */}
            <div className="flex items-center p-4 border rounded-lg">
              <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-4" 
                   style={{ backgroundColor: hasKnowledgeAssessment ? colors.chestnut : colors.pearl }}>
                <span className="text-white font-bold">1</span>
              </div>
              <div className="flex-1">
                <h4 className="font-medium" style={{ color: colors.charcoal }}>
                  AI Knowledge Navigator
                </h4>
                <p className="text-sm text-gray-600">
                  {hasKnowledgeAssessment ? 'Completed - Great start!' : 'Start here to assess your AI knowledge and readiness'}
                </p>
              </div>
              <button
                onClick={() => navigate('/tools/ai-knowledge-navigator')}
                className="px-4 py-2 text-sm font-medium text-white rounded-lg w-28"
                style={{ backgroundColor: hasKnowledgeAssessment ? colors.khaki : colors.chestnut }}
              >
                {hasKnowledgeAssessment ? 'View Results' : 'Start Assessment'}
              </button>
            </div>

            {/* Step 2: Change Readiness Assessment */}
            <div className={`flex items-center p-4 border rounded-lg ${!hasKnowledgeAssessment ? 'opacity-50' : ''}`}>
              <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-4" 
                   style={{ backgroundColor: hasChangeReadinessAssessment ? colors.chestnut : colors.pearl }}>
                <span className="text-white font-bold">2</span>
              </div>
              <div className="flex-1">
                <h4 className="font-medium" style={{ color: colors.charcoal }}>
                  Change Readiness Assessment
                </h4>
                <p className="text-sm text-gray-600">
                  {hasChangeReadinessAssessment ? 'Completed - Ready for transformation!' : 
                   hasKnowledgeAssessment ? 'Assess your organization\'s readiness for AI transformation' : 
                   'Complete Knowledge Assessment first'}
                </p>
              </div>
              <button
                onClick={() => navigate('/tools/change-readiness-assessment')}
                className="px-4 py-2 text-sm font-medium text-white rounded-lg w-28"
                style={{ backgroundColor: hasChangeReadinessAssessment ? colors.khaki : colors.chestnut }}
                disabled={!hasKnowledgeAssessment}
              >
                {hasChangeReadinessAssessment ? 'View Results' : 'Start Assessment'}
              </button>
            </div>

            {/* Step 3: Implementation Guidance */}
            <div className={`flex items-center p-4 border rounded-lg ${!hasChangeReadinessAssessment ? 'opacity-50' : ''}`}>
              <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center mr-4" 
                   style={{ backgroundColor: hasChangeReadinessAssessment ? colors.chestnut : colors.pearl }}>
                <span className="text-white font-bold">3</span>
              </div>
              <div className="flex-1">
                <h4 className="font-medium" style={{ color: colors.charcoal }}>
                  Implementation Guides
                </h4>
                <p className="text-sm text-gray-600">
                  {hasChangeReadinessAssessment ? 'Access your personalized implementation guides' : 
                   'Complete both assessments to unlock implementation guides'}
                </p>
              </div>
              <button
                onClick={() => setActiveTab('projects')}
                className="px-4 py-2 text-sm font-medium text-white rounded-lg w-28"
                style={{ backgroundColor: hasChangeReadinessAssessment ? colors.chestnut : colors.pearl }}
                disabled={!hasChangeReadinessAssessment}
              >
                {hasChangeReadinessAssessment ? 'View Guides' : 'Locked'}
              </button>
            </div>
          </div>
        </div>

        {/* Assessment Results */}
        {userAssessments.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4" style={{ color: colors.charcoal }}>
              Your Assessment Results
            </h3>
            <div className="space-y-4">
              {userAssessments
                .filter(assessment => assessment.isComplete)
                .slice(0, 3)
                .map((assessment, index) => (
                  <div key={assessment.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        {assessment.assessmentType === 'ai_knowledge_navigator' && <BookOpen className="w-5 h-5 mr-2" style={{ color: colors.chestnut }} />}
                        {assessment.assessmentType === 'change_readiness' && <Users className="w-5 h-5 mr-2" style={{ color: colors.chestnut }} />}
                        <h4 className="font-medium">{assessment.assessmentType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</h4>
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(assessment.lastUpdated?.seconds * 1000 || assessment.lastUpdated || Date.now()).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      {assessment.results?.overallScore && (
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <div className="font-semibold" style={{ color: colors.chestnut }}>
                            {assessment.results.overallScore}
                          </div>
                          <div className="text-gray-500">Score</div>
                        </div>
                      )}
                      {assessment.results?.overallMaturityLevel && (
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <div className="font-semibold" style={{ color: colors.khaki }}>
                            Level {assessment.results.overallMaturityLevel}
                          </div>
                          <div className="text-gray-500">Maturity</div>
                        </div>
                      )}
                      {assessment.results?.readinessLevel && (
                        <div className="text-center p-2 bg-gray-50 rounded">
                          <div className="font-semibold" style={{ color: colors.chestnut }}>
                            {assessment.results.readinessLevel}
                          </div>
                          <div className="text-gray-500">Readiness</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderAssessments = () => (
    <div className="space-y-6">
      {/* Assessment Results */}
      {userAssessments.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color: colors.charcoal }}>
            Recent Assessment Results
          </h3>
          <div className="space-y-4">
            {userAssessments
              .filter(assessment => assessment.isComplete)
              .slice(0, 3)
              .map((assessment, index) => (
                <div key={assessment.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      {assessment.assessmentType === 'ai_knowledge_navigator' && <BookOpen className="w-5 h-5 mr-2" style={{ color: colors.chestnut }} />}
                      {assessment.assessmentType === 'change_readiness' && <Users className="w-5 h-5 mr-2" style={{ color: colors.chestnut }} />}
                      <h4 className="font-medium">{assessment.assessmentType.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</h4>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(assessment.lastUpdated?.seconds * 1000 || assessment.lastUpdated || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    {assessment.results?.overallScore && (
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-semibold" style={{ color: colors.chestnut }}>
                          {assessment.results.overallScore}
                        </div>
                        <div className="text-gray-500">Score</div>
                      </div>
                    )}
                    {assessment.results?.overallMaturityLevel && (
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div className="font-semibold" style={{ color: colors.khaki }}>
                          Level {assessment.results.overallMaturityLevel}
                        </div>
                        <div className="text-gray-500">Maturity</div>
                      </div>
                    )}
                    {assessment.results?.readinessLevel && (
                      <div className="text-center p-2 bg-gray-50 rounded">
                        <div 
                          className="font-semibold"
                          style={{ color: getReadinessLevelColor(assessment.results.readinessLevel) }}
                        >
                          {assessment.results.readinessLevel.replace('_', ' ')}
                        </div>
                        <div className="text-gray-500">Readiness</div>
                      </div>
                    )}
                  </div>
                  
                  {/* Enhanced CrewAI Analysis Display */}
                  {renderCrewAIAnalysis(assessment)}
                </div>
              ))}
          </div>
          
          {userAssessments.filter(a => a.isComplete).length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <Target className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No completed assessments yet</p>
              <p className="text-sm mt-1">Take an assessment to see your results here</p>
            </div>
          )}
        </div>
      )}

      {/* Available Assessments */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: colors.charcoal }}>
          Available Assessments
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assessments.map((assessment) => {
            const Icon = assessment.icon;
            return (
              <div key={assessment.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <Icon className="w-6 h-6" style={{ color: assessment.color }} />
                  {assessment.premium && !isPremium && (
                    <Crown className="w-4 h-4 text-yellow-500" />
                  )}
                </div>
                <h4 className="font-medium mb-2">{assessment.title}</h4>
                <p className="text-sm text-gray-600 mb-3">{assessment.description}</p>
                <button
                  onClick={() => navigate(assessment.path)}
                  className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                    assessment.premium && !isPremium
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : 'text-white'
                  }`}
                  style={{ 
                    backgroundColor: assessment.premium && !isPremium 
                      ? undefined 
                      : assessment.color 
                  }}
                  disabled={assessment.premium && !isPremium}
                >
                  {assessment.premium && !isPremium ? 'Premium Required' : 'Start Assessment'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Enhanced CrewAI Analysis Display Component
  const renderCrewAIAnalysis = (assessment) => {
    if (!assessment.results) {
      console.log('❌ DASHBOARD: No assessment results available');
      return null;
    }

    const results = assessment.results;
    const isAIKnowledge = assessment.assessmentType === 'ai_knowledge_navigator';
    const isChangeReadiness = assessment.assessmentType === 'change_readiness';

    console.log('🎯 DASHBOARD: Rendering assessment analysis:', {
      assessmentType: assessment.assessmentType,
      hasResults: !!results,
      resultsKeys: results ? Object.keys(results) : 'none',
      hasBusinessRecs: !!(results.business_recommendations),
      businessRecsCount: results.business_recommendations?.length || 0,
      hasLearningPath: !!(results.learning_path),
      hasScoringBreakdown: !!(results.scoring_breakdown)
    });

    return (
      <div className="mt-4 space-y-4">
        {/* Strategic Business Recommendations */}
        {results.business_recommendations && results.business_recommendations.length > 0 && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border">
            <div className="flex items-center mb-2">
              <Brain className="w-4 h-4 mr-2" style={{ color: colors.chestnut }} />
              <h4 className="font-semibold text-sm" style={{ color: colors.charcoal }}>
                AI-Generated Strategic Insights
              </h4>
            </div>
            <div className="space-y-2">
              {results.business_recommendations.slice(0, 2).map((rec, index) => (
                <div key={index} className="bg-white p-3 rounded border-l-4 border-blue-400">
                  <div className="text-sm font-medium" style={{ color: colors.charcoal }}>
                    {rec.title || rec.recommendation || `Strategic Initiative ${index + 1}`}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {rec.description || rec.details || rec.rationale || (typeof rec === 'string' ? rec : 'Strategic recommendation')}
                  </div>
                  {rec.expected_impact && (
                    <div className="text-xs text-blue-600 mt-1 font-medium">
                      Impact: {rec.expected_impact}
                    </div>
                  )}
                  {rec.implementation_timeline && (
                    <div className="text-xs text-blue-600 mt-1 font-medium">
                      Timeline: {rec.implementation_timeline}
                    </div>
                  )}
                </div>
              ))}
              {results.business_recommendations.length > 2 && (
                <div className="text-xs text-blue-600 font-medium">
                  +{results.business_recommendations.length - 2} more strategic recommendations in full report
                </div>
              )}
            </div>
          </div>
        )}

        {/* Learning Path Insights */}
        {results.learning_path && (
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border">
            <div className="flex items-center mb-2">
              <Target className="w-4 h-4 mr-2" style={{ color: colors.khaki }} />
              <h4 className="font-semibold text-sm" style={{ color: colors.charcoal }}>
                Personalized Learning Path
              </h4>
            </div>
            
            {results.learning_path.priority_areas && (
              <div className="mb-3">
                <div className="text-xs text-gray-600 mb-1">Priority Focus Areas:</div>
                <div className="flex flex-wrap gap-1">
                  {results.learning_path.priority_areas.slice(0, 4).map((area, index) => (
                    <span 
                      key={index}
                      className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700"
                    >
                      {area.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {results.learning_path.recommended_courses && (
              <div className="mb-3">
                <div className="text-xs text-gray-600 mb-1">Recommended Learning:</div>
                <div className="space-y-1">
                  {results.learning_path.recommended_courses.slice(0, 2).map((course, index) => (
                    <div key={index} className="bg-white p-2 rounded text-xs">
                      <div className="font-medium">{course.title || course}</div>
                      {course.estimated_duration && (
                        <div className="text-green-600">Duration: {course.estimated_duration}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {results.learning_path.estimated_timeline && (
              <div className="text-xs text-green-600 font-medium">
                Learning Timeline: {results.learning_path.estimated_timeline}
              </div>
            )}
          </div>
        )}

        {/* Implementation Roadmap Preview */}
        {results.implementation_roadmap && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border">
            <div className="flex items-center mb-2">
              <Layers className="w-4 h-4 mr-2" style={{ color: colors.chestnut }} />
              <h4 className="font-semibold text-sm" style={{ color: colors.charcoal }}>
                Implementation Roadmap
              </h4>
            </div>
            
            {results.implementation_roadmap.phases && (
              <div className="space-y-2">
                {results.implementation_roadmap.phases.slice(0, 2).map((phase, index) => (
                  <div key={index} className="bg-white p-2 rounded border-l-2 border-purple-400">
                    <div className="text-xs font-medium" style={{ color: colors.charcoal }}>
                      Phase {index + 1}: {phase.name || phase.title || `Implementation Phase`}
                    </div>
                    {phase.duration && (
                      <div className="text-xs text-purple-600">Duration: {phase.duration}</div>
                    )}
                  </div>
                ))}
                {results.implementation_roadmap.phases.length > 2 && (
                  <div className="text-xs text-purple-600 font-medium">
                    +{results.implementation_roadmap.phases.length - 2} more phases in detailed plan
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Confidence Assessment for AI Knowledge */}
        {isAIKnowledge && results.confidence_assessment && (
          <div className="bg-gradient-to-r from-amber-50 to-yellow-50 p-4 rounded-lg border">
            <div className="flex items-center mb-2">
              <Shield className="w-4 h-4 mr-2" style={{ color: colors.chestnut }} />
              <h4 className="font-semibold text-sm" style={{ color: colors.charcoal }}>
                AI Readiness Assessment
              </h4>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <div className="text-gray-600">Confidence Level</div>
                <div className="font-semibold" style={{ color: colors.chestnut }}>
                  {Math.round((results.confidence_assessment.overall_confidence || 0.7) * 100)}%
                </div>
              </div>
              <div>
                <div className="text-gray-600">Implementation Readiness</div>
                <div className="font-semibold capitalize" style={{ color: colors.khaki }}>
                  {results.overall_readiness_level?.replace(/_/g, ' ') || 'Ready to Learn'}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Change Readiness Breakdown */}
        {isChangeReadiness && results.scoring_breakdown && (
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg border">
            <div className="flex items-center mb-2">
              <BarChart3 className="w-4 h-4 mr-2" style={{ color: colors.chestnut }} />
              <h4 className="font-semibold text-sm" style={{ color: colors.charcoal }}>
                Organizational Readiness Analysis
              </h4>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {Object.entries(results.scoring_breakdown)
                .filter(([key]) => key !== 'overall_score' && key !== 'dimension_scores')
                .slice(0, 4)
                .map(([area, score]) => (
                <div key={area}>
                  <div className="text-gray-600 capitalize">
                    {area.replace(/_/g, ' ').replace('readiness', '')}
                  </div>
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-1.5 mr-2">
                      <div 
                        className="h-1.5 rounded-full" 
                        style={{ 
                          backgroundColor: score >= 70 ? colors.khaki : score >= 50 ? '#FBD38D' : '#FEB2B2',
                          width: `${Math.min(score, 100)}%` 
                        }}
                      />
                    </div>
                    <span className="font-semibold text-xs">{score}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Next Steps Preview */}
        {results.next_steps && results.next_steps.length > 0 && (
          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-4 rounded-lg border">
            <div className="flex items-center mb-2">
              <Zap className="w-4 h-4 mr-2" style={{ color: colors.chestnut }} />
              <h4 className="font-semibold text-sm" style={{ color: colors.charcoal }}>
                Immediate Next Steps
              </h4>
            </div>
            <div className="space-y-1">
              {results.next_steps.slice(0, 3).map((step, index) => (
                <div key={index} className="text-xs text-gray-700 flex items-start">
                  <span className="w-4 h-4 rounded-full bg-teal-100 text-teal-700 text-center text-xs mr-2 mt-0.5 flex-shrink-0 flex items-center justify-center font-semibold">
                    {index + 1}
                  </span>
                  <span>
                    {typeof step === 'object' ? (step.title || step.action || step.description || step) : step}
                  </span>
                </div>
              ))}
              {results.next_steps.length > 3 && (
                <div className="text-xs text-teal-600 font-medium">
                  +{results.next_steps.length - 3} more steps in detailed plan
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderProjectsAndGuides = () => {
    const guides = [
      {
        id: 'AIUseCaseROIToolkit',
        title: 'AI Use Case & ROI Toolkit',
        description: 'Identify and evaluate AI opportunities with ROI analysis',
        icon: TrendingUp,
        route: '/guides/AIUseCaseROIToolkit'
      },
      {
        id: 'AIImplementationPlaybook',
        title: 'AI Implementation Playbook',
        description: 'Step-by-step guide for implementing AI solutions',
        icon: BookOpen,
        route: '/guides/AIImplementationPlaybook'
      },
      {
        id: 'AIReadinessAssessment',
        title: 'AI Readiness Assessment',
        description: 'Comprehensive organizational readiness evaluation',
        icon: Target,
        route: '/guides/AIReadinessAssessment'
      },
      {
        id: 'AIEthicsGovernance',
        title: 'AI Ethics & Governance',
        description: 'Establish ethical AI practices and governance frameworks',
        icon: Shield,
        route: '/guides/AIEthicsGovernance'
      }
    ];

    const hasCompletedAssessments = userAssessments.some(a => a.assessmentType === 'ai_knowledge_navigator' && a.isComplete) &&
                                   userAssessments.some(a => a.assessmentType === 'change_readiness' && a.isComplete);

    return (
      <div className="space-y-6">
        {/* Projects Section */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold" style={{ color: colors.charcoal }}>
              Your AI Projects
            </h3>
            <button
              onClick={() => setShowCreateProject(true)}
              className="flex items-center px-4 py-2 text-sm font-medium text-white rounded-lg"
              style={{ backgroundColor: colors.chestnut }}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </button>
          </div>

          {projects.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-600 mb-4">No projects yet</p>
              <p className="text-sm text-gray-500">Create your first project to organize your AI implementation guides</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {projects.map((project) => (
                <div key={project.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium" style={{ color: colors.charcoal }}>{project.name}</h4>
                    <div className="flex items-center space-x-2">
                      {project.id === currentProject?.id && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full text-white" style={{ backgroundColor: colors.chestnut }}>
                          Active
                        </span>
                      )}
                      <button
                        onClick={() => switchProject(project.id)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        {project.id === currentProject?.id ? 'Current' : 'Switch'}
                      </button>
                    </div>
                  </div>
                  {project.description && (
                    <p className="text-sm text-gray-600 mb-3">{project.description}</p>
                  )}
                  
                  {/* Project Guides */}
                  {project.id === currentProject?.id && (
                    <div className="mt-4 pt-4 border-t">
                      <h5 className="font-medium mb-3" style={{ color: colors.charcoal }}>Implementation Guides</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {guides.map((guide) => {
                          const hasStarted = currentProject?.guides?.[guide.id];
                          const Icon = guide.icon;
                          
                          return (
                            <div key={guide.id} className="flex items-center p-3 border rounded-lg hover:bg-gray-50">
                              <Icon className="w-5 h-5 mr-3" style={{ color: colors.chestnut }} />
                              <div className="flex-1">
                                <h6 className="font-medium text-sm">{guide.title}</h6>
                                <p className="text-xs text-gray-500">{guide.description}</p>
                              </div>
                              <button
                                onClick={() => {
                                  if (hasCompletedAssessments) {
                                    navigate(guide.route);
                                  } else {
                                    setActiveTab('journey');
                                  }
                                }}
                                className="px-3 py-1 text-xs font-medium text-white rounded"
                                style={{ backgroundColor: hasCompletedAssessments ? colors.chestnut : colors.pearl }}
                                disabled={!hasCompletedAssessments}
                              >
                                {hasCompletedAssessments ? (hasStarted ? 'Continue' : 'Start') : 'Locked'}
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Guide Access Notice */}
        {!hasCompletedAssessments && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-blue-600 mr-2" />
              <div>
                <h4 className="font-medium text-blue-900">Complete Your Assessments First</h4>
                <p className="text-sm text-blue-700">
                  Complete both the AI Knowledge Navigator and Change Readiness Assessment to unlock your implementation guides.
                </p>
                <button
                  onClick={() => setActiveTab('journey')}
                  className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  Start Your Journey →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderGuides = () => (
    <div className="space-y-6">
      {/* Guide Progress */}
      {currentProject?.guides && Object.keys(currentProject.guides).length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color: colors.charcoal }}>
            Your Progress
          </h3>
          <div className="space-y-4">
            {Object.entries(currentProject.guides).map(([guideId, progress]) => {
              const guide = guides.find(g => g.id === guideId);
              if (!guide) return null;
              
              const Icon = guide.icon;
              return (
                <div key={guideId} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <Icon className="w-5 h-5 mr-2" style={{ color: guide.color }} />
                      <h4 className="font-medium">{guide.title}</h4>
                    </div>
                    <span className="text-sm text-gray-500">
                      {progress.progress || 0}% complete
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${progress.progress || 0}%`,
                        backgroundColor: guide.color
                      }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    Last accessed: {new Date(progress.lastAccessed).toLocaleDateString()}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Available Guides */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: colors.charcoal }}>
          Implementation Guides
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {guides.map((guide) => {
            const Icon = guide.icon;
            const hasStarted = currentProject?.guides?.[guide.id];
            
            return (
              <div key={guide.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-2">
                  <Icon className="w-6 h-6" style={{ color: guide.color }} />
                  {hasStarted && (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  )}
                </div>
                <h4 className="font-medium mb-2">{guide.title}</h4>
                <p className="text-sm text-gray-600 mb-3">{guide.description}</p>
                <button
                  onClick={() => navigate(guide.path)}
                  className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${
                    !isPremium
                      ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      : 'text-white'
                  }`}
                  style={{ 
                    backgroundColor: !isPremium ? undefined : guide.color
                  }}
                  disabled={!isPremium}
                >
                  {!isPremium ? 'Premium Required' : hasStarted ? 'Continue' : 'Start Guide'}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const handleActionItemToggle = async (actionItemId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'completed' ? 'pending' : 'completed';
      
      // Use the project context method for proper tracking
      await trackActionItemCompletion(currentProject.id, actionItemId, newStatus);
      
      // Refresh action items and analytics
      const items = await assessmentAPI.getActionItems(user.uid, currentProject.id);
      setActionItems(items);
      
      const analytics = await assessmentAPI.getActionItemAnalytics(user.uid, currentProject.id);
      setActionItemAnalytics(analytics);
      
      // Reload project data to update timeline
      await loadProjects();
    } catch (error) {
      console.error('Error updating action item:', error);
    }
  };

  const renderActionItems = () => (
    <div className="space-y-6">
      {/* Action Item Analytics */}
      {actionItemAnalytics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold" style={{ color: colors.chestnut }}>
              {actionItemAnalytics.totalItems}
            </div>
            <div className="text-sm text-gray-500">Total Items</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold" style={{ color: colors.khaki }}>
              {actionItemAnalytics.byStatus.pending || 0}
            </div>
            <div className="text-sm text-gray-500">Pending</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold" style={{ color: colors.chestnut }}>
              {actionItemAnalytics.completionRate}%
            </div>
            <div className="text-sm text-gray-500">Complete</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <div className="text-2xl font-bold" style={{ color: colors.navy }}>
              {actionItemAnalytics.byPriority.high || 0}
            </div>
            <div className="text-sm text-gray-500">High Priority</div>
          </div>
        </div>
      )}

      {/* Action Items by Category */}
      {actionItems.length > 0 ? (
        <div className="space-y-6">
          {['learning', 'organizational', 'technical', 'process'].map(category => {
            const categoryItems = actionItems.filter(item => item.category === category);
            if (categoryItems.length === 0) return null;
            
            return (
              <div key={category} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold capitalize" style={{ color: colors.charcoal }}>
                    {category} Action Items
                  </h3>
                  <span className="text-sm text-gray-500">
                    {categoryItems.filter(item => item.status === 'completed').length}/{categoryItems.length} complete
                  </span>
                </div>
                
                <div className="space-y-3">
                  {categoryItems.map((item) => (
                    <div key={item.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-start">
                          <input
                            type="checkbox"
                            checked={item.status === 'completed'}
                            onChange={() => handleActionItemToggle(item.id, item.status)}
                            className="mr-3 mt-1"
                          />
                          <div className="flex-1">
                            <span className={`font-medium ${item.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                              {item.title}
                            </span>
                            {item.description && (
                              <p className="text-sm text-gray-600 mt-1">
                                {typeof item.description === 'string' 
                                  ? item.description 
                                  : typeof item.description === 'object' && item.description.title
                                    ? `${item.description.title}${item.description.cost ? ` (${item.description.cost})` : ''}${item.description.duration ? ` - ${item.description.duration}` : ''}`
                                    : JSON.stringify(item.description)
                                }
                              </p>
                            )}
                            
                            {/* Enhanced Metadata with CrewAI Intelligence */}
                            {item.generatedBy === 'crewai_agent' && (
                              <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-400 rounded-r">
                                <div className="flex items-center mb-2">
                                  <Brain className="w-4 h-4 mr-2 text-blue-600" />
                                  <span className="text-xs font-semibold text-blue-700">AI-Generated Strategic Initiative</span>
                                </div>
                                
                                {item.metadata && (
                                  <div className="grid grid-cols-2 gap-2 text-xs">
                                    {item.metadata.phase && (
                                      <div>
                                        <span className="text-gray-600">Phase:</span>
                                        <span className="ml-1 font-medium text-blue-700">{item.metadata.phase}</span>
                                      </div>
                                    )}
                                    {item.metadata.timeline && (
                                      <div>
                                        <span className="text-gray-600">Timeline:</span>
                                        <span className="ml-1 font-medium text-purple-700">{item.metadata.timeline}</span>
                                      </div>
                                    )}
                                  </div>
                                )}
                                
                                {item.tags && item.tags.includes('strategic-initiative') && (
                                  <div className="mt-2">
                                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                                      Strategic Initiative
                                    </span>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Standard Metadata */}
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              {item.estimatedHours && (
                                <span className="flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {item.estimatedHours}h
                                </span>
                              )}
                              {item.source && (
                                <span className="flex items-center">
                                  <FileText className="w-3 h-3 mr-1" />
                                  {item.source.replace('_', ' ')}
                                </span>
                              )}
                              {item.generatedBy && item.generatedBy !== 'crewai_agent' && (
                                <span className="flex items-center">
                                  <Activity className="w-3 h-3 mr-1" />
                                  {item.generatedBy.replace('_', ' ')}
                                </span>
                              )}
                              {item.tags && item.tags.length > 0 && !item.tags.includes('strategic-initiative') && (
                                <span className="flex items-center">
                                  <div className="flex flex-wrap gap-1">
                                    {item.tags.slice(0, 2).map((tag, index) => (
                                      <span key={index} className="px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded-full text-xs">
                                        {tag.replace(/-/g, ' ')}
                                      </span>
                                    ))}
                                  </div>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end space-y-1">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            item.priority === 'high' ? 'bg-red-100 text-red-800' :
                            item.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {item.priority}
                          </span>
                          
                          {item.dueDate && (
                            <span className={`text-xs ${
                              new Date(item.dueDate) < new Date() && item.status !== 'completed' 
                                ? 'text-red-600' : 'text-gray-500'
                            }`}>
                              Due: {new Date(item.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-8 text-gray-500">
            <AlertCircle className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p className="text-lg mb-2">No action items yet</p>
            <p className="text-sm">Complete assessments to get personalized recommendations that will help your organization succeed with AI.</p>
            <div className="mt-4 space-x-4">
              <button
                onClick={() => navigate('/tools/ai-knowledge-navigator')}
                className="px-4 py-2 text-white rounded-lg text-sm transition-colors"
                style={{ backgroundColor: colors.chestnut }}
              >
                Take AI Knowledge Assessment
              </button>
              <button
                onClick={() => navigate('/tools/change-readiness-assessment')}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors"
              >
                Assess Change Readiness
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'journey', label: 'AI Journey', icon: Target },
    { id: 'projects', label: 'Projects & Guides', icon: BookOpen },
    { id: 'actions', label: 'Action Items', icon: CheckCircle }
  ];

  if (projectsLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderBottomColor: colors.chestnut }}></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: colors.charcoal }}>
              Welcome back, {user?.name || 'Member'}
            </h1>
            <p className="text-gray-600">Track your AI implementation journey</p>
          </div>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <div className="flex items-center space-x-2">
              {isPremium && <Crown className="w-5 h-5 text-yellow-500" />}
              <span className="text-sm font-medium">
                {isPremium ? 'Premium' : 'Free'} Member
              </span>
            </div>
            <button
              onClick={() => navigate('/account')}
              className="p-2 rounded-full hover:bg-gray-100"
            >
              <Settings className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        </div>

        {/* Project Selector */}
        <div className="mb-8">
          {renderProjectSelector()}
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'text-chestnut'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                    style={activeTab === tab.id ? { borderBottomColor: colors.chestnut } : {}}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'journey' && renderAIJourney()}
          {activeTab === 'projects' && renderProjectsAndGuides()}
          {activeTab === 'actions' && renderActionItems()}
        </div>
      </div>

      {/* Create Project Modal */}
      {showCreateProject && renderCreateProjectModal()}
    </div>
  );
};

export default MemberDashboard;