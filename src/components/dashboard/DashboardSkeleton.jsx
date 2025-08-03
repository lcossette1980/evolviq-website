import React from 'react';
import {
  SkeletonCard,
  SkeletonStatsCard,
  SkeletonChart,
  SkeletonListItem,
  SkeletonBase,
  SkeletonText,
  SkeletonButton
} from '../common/Skeleton';

/**
 * Dashboard Loading Skeleton
 * Provides a realistic loading state for the member dashboard
 */
const DashboardSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <SkeletonBase className="h-8 w-48 mb-2" />
              <SkeletonBase className="h-4 w-64" />
            </div>
            <SkeletonButton className="w-32" />
          </div>
        </div>

        {/* Project Selector Skeleton */}
        <div className="mb-6">
          <SkeletonBase className="h-10 w-64 rounded-lg" />
        </div>

        {/* Tabs Skeleton */}
        <div className="mb-6">
          <div className="flex space-x-4 border-b border-gray-200">
            {Array.from({ length: 5 }).map((_, i) => (
              <SkeletonBase key={i} className="h-10 w-24" />
            ))}
          </div>
        </div>

        {/* Overview Tab Content Skeleton */}
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <SkeletonStatsCard key={i} />
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SkeletonChart height="250px" />
            <SkeletonChart height="250px" />
          </div>

          {/* Recent Activity */}
          <SkeletonCard>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonListItem key={i} hasAvatar />
              ))}
            </div>
          </SkeletonCard>

          {/* Action Items */}
          <SkeletonCard>
            <div className="space-y-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1 space-y-2">
                    <SkeletonBase className="h-4 w-2/3" />
                    <SkeletonBase className="h-3 w-1/2" />
                  </div>
                  <SkeletonButton className="w-20" />
                </div>
              ))}
            </div>
          </SkeletonCard>
        </div>
      </div>
    </div>
  );
};

export default DashboardSkeleton;