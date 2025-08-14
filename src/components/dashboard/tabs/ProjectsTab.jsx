import React from 'react';
import { PlayCircle, CheckCircle, AlertTriangle, Plus, Briefcase } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDashboardStore } from '../../../store/dashboardStore';
import { useProject } from '../../../contexts/ProjectContext';
import { colors } from '../../../utils/colors';

/**
 * Projects Tab Component
 * Simplified to show projects and single master implementation guide
 */
const ProjectsTab = () => {
  const navigate = useNavigate();
  const { setActiveTab, hasCompletedCoreAssessments, getCoreAssessmentChecklist, setShowCreateProject } = useDashboardStore();
  const { projects, currentProject } = useProject();

  // Core assessment gating
  const coreComplete = hasCompletedCoreAssessments();
  const checklist = getCoreAssessmentChecklist();

  // Not ready: show assessment requirements
  if (!coreComplete) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <AlertTriangle className="w-6 h-6 text-yellow-500 mr-3" />
            <h3 className="text-lg font-semibold" style={{ color: colors.charcoal }}>
              Complete Core Assessments First
            </h3>
          </div>
          <p className="text-gray-600 mb-4">
            Projects and implementation guides require completing core assessments to provide personalized recommendations.
          </p>
          <div className="space-y-3">
            {Object.entries(checklist).map(([key, { completed, label }]) => (
              <div key={key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  {completed ? (
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                  ) : (
                    <div className="w-5 h-5 border-2 border-gray-300 rounded-full mr-3" />
                  )}
                  <span className={completed ? 'text-gray-600 line-through' : 'text-gray-900'}>
                    {label}
                  </span>
                </div>
                {!completed && (
                  <button
                    onClick={() => setActiveTab('assessments')}
                    className="text-sm px-3 py-1 rounded bg-chestnut text-white hover:bg-chestnut/90"
                  >
                    Take Assessment
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // No projects: prompt to create one
  if (projects.length === 0) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <h3 className="text-xl font-semibold mb-4" style={{ color: colors.charcoal }}>
            Create Your First AI Project
          </h3>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Each project gets its own tailored implementation guide based on your assessments, organization details, and specific objectives.
          </p>
          <button
            onClick={() => setShowCreateProject(true)}
            className="px-6 py-3 rounded-lg bg-chestnut text-white inline-flex items-center hover:bg-chestnut/90"
          >
            <Plus className="w-5 h-5 mr-2" /> Create First Project
          </button>
        </div>
      </div>
    );
  }

  // Show projects list with master guide access
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold" style={{ color: colors.charcoal }}>
          Your AI Projects
        </h3>
        <button
          onClick={() => setShowCreateProject(true)}
          className="px-4 py-2 rounded-lg bg-chestnut text-white inline-flex items-center hover:bg-chestnut/90"
        >
          <Plus className="w-4 h-4 mr-2" /> New Project
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projects.map(project => {
          const org = project.organization || {};
          const isCurrentProject = currentProject?.id === project.id;
          
          // Tool progress badges
          const tools = project.tools || {};
          const guide = tools.interactiveGuide || {};
          const totalPhases = (guide.phases || []).length || 7;
          const donePhases = (guide.completed || []).length || 0;
          const roi = tools.roiCalculator;

          return (
            <div 
              key={project.id} 
              className={`border rounded-lg p-6 bg-white hover:shadow-md transition-shadow ${
                isCurrentProject ? 'ring-2 ring-chestnut' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-lg flex items-center justify-center mr-4" style={{ backgroundColor: `${colors.chestnut}20` }}>
                    <Briefcase className="w-6 h-6" style={{ color: colors.chestnut }} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{project.name}</h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {org.name || '—'}
                      {org.industry ? ` • ${org.industry}` : ''}
                      {org.size ? ` • ${org.size}` : ''}
                    </p>
                  </div>
                </div>
                <span className="text-xs px-2 py-1 rounded bg-gray-100 text-gray-700 capitalize">
                  {project.stage || 'exploring'}
                </span>
              </div>

              {project.objective && (
                <p className="text-sm text-gray-700 mb-3">
                  <span className="font-medium">Objective:</span> {project.objective}
                </p>
              )}

              <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 mb-2">
                <div>Type: <span className="font-medium">{project.type || 'general'}</span></div>
                <div>Timeline: <span className="font-medium">{project.timeline || '6 months'}</span></div>
                <div>Budget: <span className="font-medium">{project.budget || '$10k-50k'}</span></div>
                <div>Updated: <span className="font-medium">
                  {project.lastUpdated ? new Date(project.lastUpdated).toLocaleDateString() : '—'}
                </span></div>
              </div>
              <div className="flex items-center gap-2 text-xs mb-4">
                <span className="px-2 py-1 rounded bg-bone border">Guide {donePhases}/{totalPhases}</span>
                {roi && <span className="px-2 py-1 rounded bg-bone border">ROI saved</span>}
              </div>

              <div className="flex justify-end gap-2">
                <button
                  className="px-4 py-2 rounded bg-chestnut text-white hover:bg-chestnut/90 text-sm inline-flex items-center"
                  onClick={() => navigate(`/projects/${encodeURIComponent(project.id)}/guide`)}
                >
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Interactive Implementation Guide
                </button>
                <button
                  className="px-4 py-2 rounded bg-gray-800 text-white hover:bg-gray-700 text-sm inline-flex items-center"
                  onClick={() => navigate(`/projects/${encodeURIComponent(project.id)}/roi`)}
                >
                  <PlayCircle className="w-4 h-4 mr-2" />
                  ROI Calculator
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Removed Master Guide card; replaced by per-project tools above */}
    </div>
  );
};

export default ProjectsTab;
