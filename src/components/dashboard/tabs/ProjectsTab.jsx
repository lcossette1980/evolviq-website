import React from 'react';
import { BookOpen, PlayCircle, Target, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useDashboardStore } from '../../../store/dashboardStore';
import { colors } from '../../../utils/colors';

/**
 * Projects & Guides Tab Component
 * Displays available guides and learning resources
 */
const ProjectsTab = () => {
  const navigate = useNavigate();
  const { guideProgress } = useDashboardStore();

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
      description: 'Build comprehensive AI strategies',
      path: '/guides/AIStrategyStarterKit',
      icon: BookOpen,
      color: colors.navy
    }
  ];

  const getGuideProgress = (guideId) => {
    const progressKey = guideId.replace(/-/g, '').replace(/^ai/, 'AI');
    return guideProgress[progressKey] || null;
  };

  return (
    <div className="space-y-6">
      {/* Guides Grid */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold" style={{ color: colors.charcoal }}>
            Implementation Guides
          </h3>
          <span className="text-sm text-gray-500">
            {Object.keys(guideProgress).length} of {guides.length} started
          </span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {guides.map((guide) => {
            const Icon = guide.icon;
            const progress = getGuideProgress(guide.id);
            
            return (
              <div
                key={guide.id}
                className="border rounded-lg p-6 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => navigate(guide.path)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center">
                    <div
                      className="w-12 h-12 rounded-lg flex items-center justify-center mr-4"
                      style={{ backgroundColor: `${guide.color}20` }}
                    >
                      <Icon className="w-6 h-6" style={{ color: guide.color }} />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{guide.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">{guide.description}</p>
                    </div>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500">
                      {progress ? 'In Progress' : 'Not Started'}
                    </span>
                    <span className="text-xs font-medium">
                      {progress?.progress || 0}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${progress?.progress || 0}%`,
                        backgroundColor: guide.color
                      }}
                    />
                  </div>
                  {progress && (
                    <div className="text-xs text-gray-500 mt-1">
                      Last accessed: {new Date(progress.lastAccessed).toLocaleDateString()}
                    </div>
                  )}
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
            onClick={() => navigate('/assessments/ai-knowledge')}
            className="p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center mb-2">
              <Target className="w-5 h-5 mr-2" style={{ color: colors.chestnut }} />
              <span className="font-medium">Take Assessment</span>
            </div>
            <p className="text-sm text-gray-600">
              Evaluate your AI knowledge and readiness
            </p>
          </button>
          
          <button
            onClick={() => navigate('/tools')}
            className="p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center mb-2">
              <BookOpen className="w-5 h-5 mr-2" style={{ color: colors.khaki }} />
              <span className="font-medium">Explore Tools</span>
            </div>
            <p className="text-sm text-gray-600">
              Access AI implementation tools and resources
            </p>
          </button>
          
          <button
            onClick={() => navigate('/account')}
            className="p-4 text-left border rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center mb-2">
              <PlayCircle className="w-5 h-5 mr-2" style={{ color: colors.navy }} />
              <span className="font-medium">Create Project</span>
            </div>
            <p className="text-sm text-gray-600">
              Start a new AI implementation project
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProjectsTab;