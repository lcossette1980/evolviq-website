import React from 'react';
import {
  SkeletonBase,
  SkeletonText,
  SkeletonButton,
  SkeletonCard
} from '../common/Skeleton';

/**
 * Tool Page Loading Skeleton
 * Used for all interactive tool pages during initial load
 */
const ToolPageSkeleton = () => {
  return (
    <div className="min-h-screen bg-bone">
      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar - Step Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <SkeletonBase className="h-6 w-32 mb-6" />
              <div className="space-y-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center space-x-3">
                    <SkeletonBase className="h-8 w-8 rounded-full" />
                    <div className="flex-1">
                      <SkeletonBase className="h-4 w-24 mb-1" />
                      <SkeletonBase className="h-3 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <SkeletonCard className="mb-6">
              <div className="mb-6">
                <SkeletonBase className="h-8 w-48 mb-2" />
                <SkeletonText lines={2} />
              </div>

              {/* Upload Area Skeleton */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12">
                <div className="text-center">
                  <SkeletonBase className="h-12 w-12 rounded-full mx-auto mb-4" />
                  <SkeletonBase className="h-6 w-48 mx-auto mb-2" />
                  <SkeletonText lines={2} className="max-w-md mx-auto" />
                  <div className="mt-6 flex justify-center space-x-4">
                    <SkeletonButton className="w-32" />
                    <SkeletonButton className="w-32" />
                  </div>
                </div>
              </div>
            </SkeletonCard>

            {/* Progress Bar */}
            <div className="mb-6">
              <SkeletonBase className="h-2 w-full rounded-full" />
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <SkeletonButton className="w-24" />
              <SkeletonButton className="w-24" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Tool Results Loading Skeleton
 * Used when processing or loading results
 */
export const ToolResultsSkeleton = () => {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <SkeletonCard key={i}>
            <div className="flex items-center justify-between mb-2">
              <SkeletonBase className="h-4 w-24" />
              <SkeletonBase className="h-8 w-8 rounded" />
            </div>
            <SkeletonBase className="h-6 w-32" />
          </SkeletonCard>
        ))}
      </div>

      {/* Chart Area */}
      <SkeletonCard>
        <div className="mb-4">
          <SkeletonBase className="h-6 w-32 mb-2" />
          <SkeletonText lines={1} className="w-64" />
        </div>
        <SkeletonBase className="h-64 w-full rounded" />
      </SkeletonCard>

      {/* Results Table */}
      <SkeletonCard>
        <div className="mb-4">
          <SkeletonBase className="h-6 w-48" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-between p-3 border rounded">
              <SkeletonText lines={1} className="w-1/3" />
              <SkeletonBase className="h-4 w-24" />
            </div>
          ))}
        </div>
      </SkeletonCard>
    </div>
  );
};

export default ToolPageSkeleton;