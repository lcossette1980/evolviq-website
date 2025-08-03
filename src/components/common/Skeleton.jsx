import React from 'react';

/**
 * Skeleton Loading Components
 * Provides consistent loading states across the application
 */

// Base skeleton component with animation
export const SkeletonBase = ({ className = '', ...props }) => {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      {...props}
    />
  );
};

// Text skeleton
export const SkeletonText = ({ lines = 1, className = '' }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBase
          key={i}
          className={`h-4 ${i === lines - 1 ? 'w-3/4' : 'w-full'}`}
        />
      ))}
    </div>
  );
};

// Heading skeleton
export const SkeletonHeading = ({ className = '' }) => {
  return <SkeletonBase className={`h-8 w-3/4 ${className}`} />;
};

// Card skeleton
export const SkeletonCard = ({ className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      <SkeletonHeading className="mb-4" />
      <SkeletonText lines={3} />
    </div>
  );
};

// Table row skeleton
export const SkeletonTableRow = ({ columns = 4 }) => {
  return (
    <tr>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="px-6 py-4">
          <SkeletonBase className="h-4 w-full" />
        </td>
      ))}
    </tr>
  );
};

// Avatar skeleton
export const SkeletonAvatar = ({ size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <SkeletonBase className={`rounded-full ${sizes[size]} ${className}`} />
  );
};

// Button skeleton
export const SkeletonButton = ({ className = '' }) => {
  return (
    <SkeletonBase className={`h-10 w-24 rounded-lg ${className}`} />
  );
};

// Chart skeleton
export const SkeletonChart = ({ height = '300px', className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      <SkeletonHeading className="mb-4" />
      <SkeletonBase className="w-full" style={{ height }} />
    </div>
  );
};

// Form field skeleton
export const SkeletonFormField = ({ className = '' }) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <SkeletonBase className="h-4 w-24" />
      <SkeletonBase className="h-10 w-full rounded" />
    </div>
  );
};

// Stats card skeleton
export const SkeletonStatsCard = ({ className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <SkeletonBase className="h-4 w-24" />
        <SkeletonBase className="h-6 w-6 rounded" />
      </div>
      <SkeletonBase className="h-8 w-32 mb-1" />
      <SkeletonBase className="h-3 w-20" />
    </div>
  );
};

// List item skeleton
export const SkeletonListItem = ({ hasAvatar = false, className = '' }) => {
  return (
    <div className={`flex items-center space-x-4 p-4 ${className}`}>
      {hasAvatar && <SkeletonAvatar />}
      <div className="flex-1 space-y-2">
        <SkeletonBase className="h-4 w-1/3" />
        <SkeletonBase className="h-3 w-1/2" />
      </div>
    </div>
  );
};

export default SkeletonBase;