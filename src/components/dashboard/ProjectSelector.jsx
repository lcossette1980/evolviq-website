import React from 'react';
import { Plus, ChevronDown, CheckCircle } from 'lucide-react';
import { useProject } from '../../contexts/ProjectContext';
import { useDashboardStore } from '../../store/dashboardStore';
import { getProjectStatusColor, formatDate } from '../../utils/projectUtils';
import { colors } from '../../utils/colors';

/**
 * Project Selector Component
 * Allows users to switch between projects and create new ones
 */
const ProjectSelector = () => {
  const { projects, currentProject, switchProject } = useProject();
  const { 
    showProjectSelector, 
    setShowProjectSelector, 
    setShowCreateProject 
  } = useDashboardStore();

  const handleCreateProject = () => {
    setShowCreateProject(true);
    setShowProjectSelector(false);
  };

  const handleProjectSelect = (projectId) => {
    switchProject(projectId);
    setShowProjectSelector(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowProjectSelector(!showProjectSelector)}
        className="flex items-center justify-between w-full px-4 py-3 bg-white rounded-lg shadow-sm border hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center">
          <div 
            className="w-3 h-3 rounded-full mr-3"
            style={{ 
              backgroundColor: currentProject 
                ? getProjectStatusColor(currentProject.status) 
                : colors.charcoal 
            }}
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
              onClick={handleCreateProject}
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
                onClick={() => handleProjectSelect(project.id)}
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
                    {project.stage} • {formatDate(project.lastUpdated)}
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
};

export default ProjectSelector;