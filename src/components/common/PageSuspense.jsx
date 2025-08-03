import React, { Suspense } from 'react';
import LoadingSpinner from './LoadingSpinner';

/**
 * Page-level Suspense wrapper for lazy-loaded routes
 * Provides consistent loading experience across all code-split pages
 */
const PageSuspense = ({ children }) => {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen bg-bone flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner size="lg" />
            <p className="mt-4 text-charcoal/60">Loading page...</p>
          </div>
        </div>
      }
    >
      {children}
    </Suspense>
  );
};

export default PageSuspense;