import React, { useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useProject } from '../contexts/ProjectContext';
import { useDashboardStore } from '../store/dashboardStore';
import ErrorBoundary from '../components/common/ErrorBoundary';

// Layout Components
import DashboardHeader from '../components/dashboard/DashboardHeader';
import DashboardTabs from '../components/dashboard/DashboardTabs';
import CreateProjectModal from '../components/dashboard/CreateProjectModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import DashboardSkeleton from '../components/dashboard/DashboardSkeleton';

// Tab Content Components (lazy loaded for performance)
import OverviewTab from '../components/dashboard/tabs/OverviewTab';

// Lazy load heavy components for better performance
const AssessmentsTab = React.lazy(() => import('../components/dashboard/tabs/AssessmentsTab'));
const ProjectsTab = React.lazy(() => import('../components/dashboard/tabs/ProjectsTab'));
const InteractiveToolsTab = React.lazy(() => import('../components/dashboard/tabs/InteractiveToolsTab'));
const ActionItemsTab = React.lazy(() => import('../components/dashboard/tabs/ActionItemsTab'));

/**
 * Refactored Member Dashboard - Version 2.0
 * 
 * Improvements from expert review:
 * - Modular component architecture replacing 2,237-line monolith
 * - Centralized state management with Zustand replacing 10+ useState hooks
 * - Lazy loading for performance optimization
 * - Separation of concerns with focused components
 * - Better error boundaries and loading states
 * 
 * Architecture:
 * - State: Centralized in Zustand store (dashboardStore.js)
 * - Components: Modular, focused, reusable
 * - Data: Custom hooks for data fetching
 * - Utils: Shared utilities for common operations
 */
const MemberDashboard = () => {
  const { user, isPremium } = useAuth();
  const { projects, currentProject, loading: projectsLoading } = useProject();
  const { 
    activeTab, 
    isLoading, 
    loadDashboardData 
  } = useDashboardStore();

  // Load dashboard data when user or project changes
  useEffect(() => {
    if (user) {
      loadDashboardData(user, currentProject);
    }
  }, [user, currentProject, loadDashboardData]);

  // Show skeleton while data is loading
  if (projectsLoading || isLoading) {
    return <DashboardSkeleton />;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <ErrorBoundary level="component">
            <OverviewTab />
          </ErrorBoundary>
        );
      case 'assessments':
        return (
          <ErrorBoundary level="component">
            <React.Suspense fallback={<LoadingSpinner message="Loading Assessments..." />}>
              <AssessmentsTab />
            </React.Suspense>
          </ErrorBoundary>
        );
      case 'projects':
        return (
          <ErrorBoundary level="component">
            <React.Suspense fallback={<LoadingSpinner message="Loading Projects..." />}>
              <ProjectsTab />
            </React.Suspense>
          </ErrorBoundary>
        );
      case 'tools':
        return (
          <ErrorBoundary level="component">
            <React.Suspense fallback={<LoadingSpinner message="Loading Interactive Tools..." />}>
              <InteractiveToolsTab />
            </React.Suspense>
          </ErrorBoundary>
        );
      case 'actions':
        return (
          <ErrorBoundary level="component">
            <React.Suspense fallback={<LoadingSpinner message="Loading Action Items..." />}>
              <ActionItemsTab />
            </React.Suspense>
          </ErrorBoundary>
        );
      default:
        return (
          <ErrorBoundary level="component">
            <OverviewTab />
          </ErrorBoundary>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Section */}
        <DashboardHeader user={user} isPremium={isPremium} />
        
        {/* Navigation Tabs */}
        <DashboardTabs />
        
        {/* Tab Content */}
        <div className="mb-8">
          <React.Suspense fallback={<LoadingSpinner />}>
            {renderTabContent()}
          </React.Suspense>
        </div>
      </div>

      {/* Modals */}
      <CreateProjectModal />
    </div>
  );
};

export default MemberDashboard;
