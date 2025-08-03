import React from 'react';
import {
  SkeletonBase,
  SkeletonText,
  SkeletonCard,
  SkeletonAvatar
} from '../common/Skeleton';

/**
 * Blog List Loading Skeleton
 */
export const BlogListSkeleton = () => {
  return (
    <div className="min-h-screen bg-bone py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <SkeletonBase className="h-12 w-64 mx-auto mb-4" />
          <SkeletonText lines={2} className="max-w-2xl mx-auto" />
        </div>

        {/* Featured Post */}
        <div className="mb-12">
          <SkeletonCard className="lg:flex">
            <SkeletonBase className="lg:w-1/2 h-64 rounded-l-lg" />
            <div className="lg:w-1/2 p-8">
              <SkeletonBase className="h-4 w-24 mb-3" />
              <SkeletonBase className="h-8 w-3/4 mb-4" />
              <SkeletonText lines={3} className="mb-4" />
              <div className="flex items-center space-x-4">
                <SkeletonAvatar size="sm" />
                <SkeletonBase className="h-4 w-32" />
              </div>
            </div>
          </SkeletonCard>
        </div>

        {/* Blog Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {Array.from({ length: 6 }).map((_, i) => (
            <BlogCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
};

/**
 * Individual Blog Card Skeleton
 */
export const BlogCardSkeleton = () => {
  return (
    <SkeletonCard className="overflow-hidden">
      <SkeletonBase className="h-48 w-full" />
      <div className="p-6">
        <SkeletonBase className="h-4 w-24 mb-3" />
        <SkeletonBase className="h-6 w-full mb-2" />
        <SkeletonBase className="h-6 w-3/4 mb-4" />
        <SkeletonText lines={3} className="mb-4" />
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <SkeletonAvatar size="sm" />
            <SkeletonBase className="h-3 w-24" />
          </div>
          <SkeletonBase className="h-3 w-16" />
        </div>
      </div>
    </SkeletonCard>
  );
};

/**
 * Blog Post Detail Skeleton
 */
export const BlogPostSkeleton = () => {
  return (
    <div className="min-h-screen bg-white">
      <article className="max-w-4xl mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <SkeletonBase className="h-4 w-32 mb-4" />
          <SkeletonBase className="h-12 w-full mb-2" />
          <SkeletonBase className="h-12 w-3/4 mb-6" />
          
          <div className="flex items-center space-x-4 py-4 border-y border-gray-200">
            <SkeletonAvatar size="md" />
            <div className="flex-1">
              <SkeletonBase className="h-5 w-32 mb-1" />
              <SkeletonBase className="h-4 w-48" />
            </div>
          </div>
        </div>

        {/* Featured Image */}
        <SkeletonBase className="h-96 w-full rounded-lg mb-8" />

        {/* Content */}
        <div className="prose prose-lg max-w-none">
          <SkeletonText lines={3} className="mb-6" />
          <SkeletonBase className="h-8 w-64 mb-4" />
          <SkeletonText lines={5} className="mb-6" />
          <SkeletonBase className="h-64 w-full rounded mb-6" />
          <SkeletonText lines={4} className="mb-6" />
          <SkeletonBase className="h-8 w-48 mb-4" />
          <SkeletonText lines={6} />
        </div>

        {/* Author Bio */}
        <div className="mt-12 p-6 bg-gray-50 rounded-lg">
          <div className="flex items-start space-x-4">
            <SkeletonAvatar size="lg" />
            <div className="flex-1">
              <SkeletonBase className="h-6 w-32 mb-2" />
              <SkeletonText lines={3} />
            </div>
          </div>
        </div>
      </article>
    </div>
  );
};

export default BlogListSkeleton;