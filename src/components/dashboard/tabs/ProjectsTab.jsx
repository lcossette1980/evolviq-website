import React from 'react';
import { BookOpen, PlayCircle, Target, TrendingUp, CheckCircle, AlertTriangle, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDashboardStore } from '../../../store/dashboardStore';
import { useProject } from '../../../contexts/ProjectContext';
import { colors } from '../../../utils/colors';

/**
 * Projects & Guides Tab Component
 * Displays available guides and learning resources
 */
const ProjectsTab = () => {
  const navigate = useNavigate();
  const { setActiveTab, hasCompletedCoreAssessments, getCoreAssessmentChecklist, setShowCreateProject, guideProgress } = useDashboardStore();
  const { projects, currentProject } = useProject();

  // Core assessment gating
  const coreComplete = hasCompletedCoreAssessments();
  const checklist = getCoreAssessmentChecklist();

  // Project-scoped guides mapping
  const guideCatalog = {
    implementation_playbook: {
      title: 'AI Implementation Playbook',
      path: '/guides/AIImplementationPlaybook',
      icon: PlayCircle,
      color: colors.chestnut
    },
    ai_readiness_assessment: {
      title: 'AI Readiness Assessment',
      path: '/guides/AIReadinessAssessment',
      icon: Target,
      color: colors.chestnut
    },
    ai_use_case_roi_toolkit: {
      title: 'AI Use Case ROI Toolkit',
      path: '/guides/AIUseCaseROIToolkit',
      icon: TrendingUp,
      color: colors.khaki
    },
    ai_strategy_starter_kit: {
      title: 'AI Strategy Starter Kit',
      path: '/guides/AIStrategyStarterKit',
      icon: BookOpen,
      color: colors.navy
    }
  };

  const projectGuides = currentProject?.guides || {};

  // Gated flow: require assessments first
  if (!coreComplete) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-start mb-4">
            <AlertTriangle className="w-6 h-6 mr-2" style={{ color: colors.chestnut }} />
            <div>
              <h3 className="text-lg font-semibold" style={{ color: colors.charcoal }}>
                Complete your baseline assessments first
              </h3>
              <p className="text-sm text-gray-600">Take these two assessments to unlock projects and implementation guides.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* AI Knowledge */}
            <div className="border rounded-lg p-4 flex items-center justify-between">
              <div>
                <div className="font-medium">AI Knowledge Assessment</div>
                <div className="text-xs text-gray-500">
                  {checklist.aiKnowledge.completed ? `Completed on ${new Date(checklist.aiKnowledge.lastCompleted).toLocaleDateString()}` : 'Not started'}
                </div>
              </div>
              <button
                className={`px-3 py-2 rounded-lg text-sm ${checklist.aiKnowledge.completed ? 'bg-green-50 text-green-700' : 'bg-chestnut text-white'}`}
                onClick={() => navigate('/dashboard/assessments/ai-knowledge')}
              >
                {checklist.aiKnowledge.completed ? 'View' : 'Start'}
              </button>
            </div>
            {/* Org Readiness */}
            <div className="border rounded-lg p-4 flex items-center justify-between">
              <div>
                <div className="font-medium">Organizational AI Readiness</div>
                <div className="text-xs text-gray-500">
                  {checklist.orgReadiness.completed ? `Completed on ${new Date(checklist.orgReadiness.lastCompleted).toLocaleDateString()}` : 'Not started'}
                </div>
              </div>
              <button
                className={`px-3 py-2 rounded-lg text-sm ${checklist.orgReadiness.completed ? 'bg-green-50 text-green-700' : 'bg-chestnut text-white'}`}
                onClick={() => navigate('/dashboard/assessments/org-readiness')}
              >
                {checklist.orgReadiness.completed ? 'View' : 'Start'}
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold" style={{ color: colors.charcoal }}>
                Projects are locked
              </h3>
              <p className="text-sm text-gray-600">Finish both assessments to create your first project and unlock project-specific guides.</p>
            </div>
            <button disabled className="px-4 py-2 rounded-lg bg-gray-200 text-gray-500 cursor-not-allowed flex items-center">
              <Plus className="w-4 h-4 mr-2" /> Create Project
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No project yet: nudge to create first project
  if (coreComplete && projects.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-8 text-center">
        <h3 className="text-xl font-semibold mb-2" style={{ color: colors.charcoal }}>
          Create your first project
        </h3>
        <p className="text-gray-600 mb-6">We’ll attach a dedicated set of implementation guides to each project.</p>
        <button
          onClick={() => setShowCreateProject(true)}
          className="px-5 py-3 rounded-lg bg-chestnut text-white inline-flex items-center hover:bg-chestnut/90"
        >
          <Plus className="w-4 h-4 mr-2" /> New Project
        </button>
      </div>
    );
  }

  // Project selected: show project-scoped guides
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold" style={{ color: colors.charcoal }}>
            {currentProject ? `${currentProject.name}: Implementation Guides` : 'Implementation Guides'}
          </h3>
          <button
            onClick={() => setShowCreateProject(true)}
            className="px-4 py-2 rounded-lg bg-chestnut text-white inline-flex items-center hover:bg-chestnut/90"
          >
            <Plus className="w-4 h-4 mr-2" /> New Project
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(projectGuides).map(([guideKey, guide]) => {
            const meta = guideCatalog[guideKey] || {};
            const Icon = meta.icon || BookOpen;
            const color = meta.color || colors.charcoal;
            // Fallback to user-level guide progress until full project integration
            const fallbackKeyMap = {
              implementation_playbook: 'AIImplementationPlaybook',
              ai_readiness_assessment: 'AIReadinessAssessment',
              ai_use_case_roi_toolkit: 'AIUseCaseROIToolkit',
              ai_strategy_starter_kit: 'AIStrategyStarterKit'
            };
            const fallback = guideProgress[fallbackKeyMap[guideKey] || ''] || null;
            const progress = typeof guide.progress === 'number' && guide.progress > 0 ? guide.progress : (fallback?.progress || 0);
            const status = guide.status || 'not_started';
            return (
              <div
                key={guideKey}
                className="border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(meta.path)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center mr-4"
                      style={{ backgroundColor: `${color}20` }}
                    >
                      <Icon className="w-6 h-6" style={{ color }} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{meta.title || guide.title}</h4>
                      <p className="text-xs text-gray-500 mt-1 capitalize">{status.replace('_', ' ')}</p>
                    </div>
                  </div>
                  {status === 'completed' && (
                    <span className="text-green-600 text-sm inline-flex items-center">
                      <CheckCircle className="w-4 h-4 mr-1" /> Completed
                    </span>
                  )}
                </div>
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500">
                      {progress > 0 ? 'In Progress' : 'Not Started'}
                    </span>
                    <span className="text-xs font-medium">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{ width: `${progress}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4" style={{ color: colors.charcoal }}>
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/dashboard/assessments/ai-knowledge')}
            className="p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center mb-2">
              <Target className="w-5 h-5 mr-2" style={{ color: colors.chestnut }} />
              <span className="font-medium">Retake AI Knowledge</span>
            </div>
            <p className="text-sm text-gray-600">Update your skills baseline</p>
          </button>
          <button
            onClick={() => setActiveTab('tools')}
            className="p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center mb-2">
              <BookOpen className="w-5 h-5 mr-2" style={{ color: colors.khaki }} />
              <span className="font-medium">Explore Tools</span>
            </div>
            <p className="text-sm text-gray-600">Standalone interactive tools</p>
          </button>
          <button
            onClick={() => setShowCreateProject(true)}
            className="p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center mb-2">
              <PlayCircle className="w-5 h-5 mr-2" style={{ color: colors.navy }} />
              <span className="font-medium">New Project</span>
            </div>
            <p className="text-sm text-gray-600">Start a new implementation</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectsTab;
