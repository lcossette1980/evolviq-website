import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, PlayCircle, Target, TrendingUp, CheckCircle, AlertTriangle, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDashboardStore } from '../../../store/dashboardStore';
import { useProject } from '../../../contexts/ProjectContext';
import guidesAPI from '../../../services/guidesAPI';
import { colors } from '../../../utils/colors';

/**
 * Projects & Guides Tab Component
 * Displays available guides and learning resources
 */
const ProjectsTab = () => {
  const navigate = useNavigate();
  const { setActiveTab, hasCompletedCoreAssessments, getCoreAssessmentChecklist, setShowCreateProject, guideProgress } = useDashboardStore();
  const { projects, currentProject, updateGuideProgress, addGuideToProject } = useProject();
  const [registry, setRegistry] = useState([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const reg = await guidesAPI.getRegistry();
      if (mounted) setRegistry(reg);
    })();
    return () => { mounted = false; };
  }, []);

  // Core assessment gating
  const coreComplete = hasCompletedCoreAssessments();
  const checklist = getCoreAssessmentChecklist();

  // Fallback metadata when registry is not yet loaded
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

  const metaByClientKey = useMemo(() => {
    const map = {};
    (registry || []).forEach(g => {
      map[g.client_key] = {
        title: g.title,
        tags: g.tags,
        dimensions: g.dimensions,
        sections: g.sections,
        icon: guideCatalog[g.client_key]?.icon || BookOpen,
        color: guideCatalog[g.client_key]?.color || colors.charcoal,
        path: guideCatalog[g.client_key]?.path || `/guides/${g.guide_id}`
      };
    });
    return map;
  }, [registry]);

  const projectGuides = currentProject?.guides || {};
  const missingGuides = useMemo(() => {
    const existing = new Set(Object.keys(projectGuides));
    return (registry || []).filter(g => !existing.has(g.client_key));
  }, [registry, projectGuides]);

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
      {/* Top actions outside the guides card */}
      <div className="flex items-center justify-between">
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

      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-6" />
        {missingGuides.length > 0 && (
          <div className="mb-6">
            <div className="text-sm text-gray-700 mb-2">Available guides to add</div>
            <div className="flex flex-wrap gap-2">
              {missingGuides.map((g) => (
                <button
                  key={g.client_key}
                  className="px-3 py-1.5 border rounded-full text-xs hover:bg-gray-50"
                  onClick={() => addGuideToProject(currentProject.id, g.client_key, { title: g.title })}
                >
                  + {g.title}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(projectGuides).map(([guideKey, guide]) => {
            const meta = metaByClientKey[guideKey] || guideCatalog[guideKey] || {};
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
                  <div className="flex items-center gap-2">
                    {status === 'completed' && (
                      <span className="text-green-600 text-sm inline-flex items-center">
                        <CheckCircle className="w-4 h-4 mr-1" /> Completed
                      </span>
                    )}
                    {status !== 'completed' && (
                      <button
                        className="text-sm px-3 py-1.5 rounded bg-chestnut text-white hover:bg-chestnut/90"
                        onClick={(e) => { e.stopPropagation(); updateGuideProgress(currentProject.id, guideKey, { status: 'in_progress', progress: progress || 1 }); navigate(meta.path); }}
                      >
                        {progress > 0 ? 'Resume' : 'Start'}
                      </button>
                    )}
                  </div>
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
                {meta.dimensions && meta.dimensions.length > 0 && (
                  <div className="mt-4">
                    <div className="text-[11px] text-gray-500 mb-1">Dimensions covered</div>
                    <div className="flex flex-wrap gap-1">
                      {meta.dimensions.slice(0, 3).map((d) => (
                        <span key={d} className="px-2 py-0.5 rounded-full bg-gray-100 text-[11px] text-gray-700">{d}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Actions removed as requested */}
    </div>
  );
};

export default ProjectsTab;
