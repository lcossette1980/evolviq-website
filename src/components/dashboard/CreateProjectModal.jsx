import React, { useEffect, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useProject } from '../../contexts/ProjectContext';
import { useDashboardStore } from '../../store/dashboardStore';
import { useAuth } from '../../contexts/AuthContext';
import { colors } from '../../utils/colors';

/**
 * Create Project Modal Component
 * Allows users to create new projects
 */
const CreateProjectModal = () => {
  const { createProject, projects } = useProject();
  const { showCreateProject, setShowCreateProject, newProjectData, updateNewProjectData, resetNewProjectData } = useDashboardStore();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Prefill org fields from last project or user profile when modal opens
  useEffect(() => {
    if (!showCreateProject) return;
    const alreadyFilled = newProjectData.organizationName || newProjectData.industry || newProjectData.organizationSize;
    if (alreadyFilled) return;

    // Prefer last project org details
    const lastProject = projects && projects.length > 0 ? projects[0] : null;
    if (lastProject?.organization) {
      updateNewProjectData({
        organizationName: lastProject.organization.name || '',
        organizationSize: lastProject.organization.size || '',
        industry: lastProject.organization.industry || ''
      });
      return;
    }

    // Fallback: try user profile fields if available
    if (user) {
      updateNewProjectData({
        organizationName: user.organizationName || '',
        organizationSize: user.organizationSize || '',
        industry: user.industry || ''
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCreateProject]);

  const handleClose = () => {
    setShowCreateProject(false);
    resetNewProjectData();
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const projectData = {
        ...newProjectData,
        status: 'active',
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };

      await createProject(projectData);
      handleClose();
    } catch (err) {
      console.error('Error creating project:', err);
      setError('Failed to create project. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!showCreateProject) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold" style={{ color: colors.charcoal }}>
            Create New Project
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isSubmitting}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
              {error}
            </div>
          )}

          {/* Project Basics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Name *
              </label>
              <input
                type="text"
                required
                value={newProjectData.name}
                onChange={(e) => updateNewProjectData({ name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter project name"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Project Type
              </label>
              <select
                value={newProjectData.type}
                onChange={(e) => updateNewProjectData({ type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
              >
                <option value="genai_implementation">GenAI Implementation</option>
                <option value="ai_strategy">AI Strategy</option>
                <option value="automation">Automation Project</option>
                <option value="data_science">Data Science</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Description
            </label>
            <textarea
              value={newProjectData.description}
              onChange={(e) => updateNewProjectData({ description: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Describe your project goals and objectives"
              disabled={isSubmitting}
            />
          </div>

          {/* Organization Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organization Name
              </label>
              <input
                type="text"
                value={newProjectData.organizationName}
                onChange={(e) => updateNewProjectData({ organizationName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your organization name"
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Organization Size
              </label>
              <select
                value={newProjectData.organizationSize}
                onChange={(e) => updateNewProjectData({ organizationSize: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
              >
                <option value="">Select size</option>
                <option value="startup">Startup (1-10 employees)</option>
                <option value="small">Small (11-50 employees)</option>
                <option value="medium">Medium (51-200 employees)</option>
                <option value="large">Large (201-1000 employees)</option>
                <option value="enterprise">Enterprise (1000+ employees)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Industry
            </label>
            <input
              type="text"
              value={newProjectData.industry}
              onChange={(e) => updateNewProjectData({ industry: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Healthcare, Finance, Retail, Technology"
              disabled={isSubmitting}
            />
          </div>

          {/* Project Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Stage
              </label>
              <select
                value={newProjectData.stage}
                onChange={(e) => updateNewProjectData({ stage: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
              >
                <option value="exploring">Exploring</option>
                <option value="planning">Planning</option>
                <option value="implementing">Implementing</option>
                <option value="optimizing">Optimizing</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Timeline
              </label>
              <select
                value={newProjectData.timeline}
                onChange={(e) => updateNewProjectData({ timeline: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
              >
                <option value="3_months">3 months</option>
                <option value="6_months">6 months</option>
                <option value="12_months">12 months</option>
                <option value="18_months">18+ months</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget Range
              </label>
              <select
                value={newProjectData.budget}
                onChange={(e) => updateNewProjectData({ budget: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={isSubmitting}
              >
                <option value="under_10k">Under $10K</option>
                <option value="10k_50k">$10K - $50K</option>
                <option value="50k_100k">$50K - $100K</option>
                <option value="100k_500k">$100K - $500K</option>
                <option value="over_500k">Over $500K</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Objective
              </label>
              <input
                type="text"
                value={newProjectData.objective}
                onChange={(e) => updateNewProjectData({ objective: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., Improve efficiency, Reduce costs, Enhance customer experience"
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !newProjectData.name.trim()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateProjectModal;
