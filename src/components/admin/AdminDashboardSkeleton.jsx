import React from 'react';
import {
  SkeletonStatsCard,
  SkeletonTableRow,
  SkeletonBase,
  SkeletonButton
} from '../common/Skeleton';

/**
 * Admin Dashboard Loading Skeleton
 */
const AdminDashboardSkeleton = () => {
  return (
    <div className="min-h-screen bg-bone pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <SkeletonBase className="h-10 w-64 mb-2" />
          <SkeletonBase className="h-4 w-96" />
        </div>

        {/* Tabs */}
        <div className="flex space-x-4 mb-8 border-b border-charcoal/10">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonBase key={i} className="h-10 w-32" />
          ))}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonStatsCard key={i} />
          ))}
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Search Bar */}
          <div className="p-4 border-b border-gray-200">
            <SkeletonBase className="h-10 w-full max-w-md rounded-lg" />
          </div>

          {/* Table Header */}
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {Array.from({ length: 5 }).map((_, i) => (
                  <th key={i} className="px-6 py-3">
                    <SkeletonBase className="h-4 w-full" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonTableRow key={i} columns={5} />
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="bg-gray-50 px-6 py-3 flex items-center justify-between">
            <SkeletonBase className="h-4 w-32" />
            <div className="flex space-x-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <SkeletonButton key={i} className="w-10 h-10" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardSkeleton;