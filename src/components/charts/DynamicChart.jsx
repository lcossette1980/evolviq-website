import React, { lazy, Suspense } from 'react';
import LoadingSpinner from '../common/LoadingSpinner';

// Lazy load recharts components only when needed
const LazyBarChart = lazy(() => 
  import('recharts').then(module => ({ default: module.BarChart }))
);
const LazyLineChart = lazy(() => 
  import('recharts').then(module => ({ default: module.LineChart }))
);
const LazyPieChart = lazy(() => 
  import('recharts').then(module => ({ default: module.PieChart }))
);
const LazyAreaChart = lazy(() => 
  import('recharts').then(module => ({ default: module.AreaChart }))
);
const LazyRadarChart = lazy(() => 
  import('recharts').then(module => ({ default: module.RadarChart }))
);

// Common recharts components
const LazyResponsiveContainer = lazy(() => 
  import('recharts').then(module => ({ default: module.ResponsiveContainer }))
);

/**
 * Dynamic Chart Component
 * Lazy loads chart components only when rendered
 * Significantly reduces initial bundle size
 */
const DynamicChart = ({ type, children, ...props }) => {
  const ChartComponent = {
    bar: LazyBarChart,
    line: LazyLineChart,
    pie: LazyPieChart,
    area: LazyAreaChart,
    radar: LazyRadarChart
  }[type];

  if (!ChartComponent) {
    console.error(`Unknown chart type: ${type}`);
    return null;
  }

  return (
    <Suspense 
      fallback={
        <div className="flex items-center justify-center h-full">
          <LoadingSpinner size="sm" />
        </div>
      }
    >
      <LazyResponsiveContainer {...props}>
        <ChartComponent {...props}>
          {children}
        </ChartComponent>
      </LazyResponsiveContainer>
    </Suspense>
  );
};

// Export individual chart components for direct use
export const DynamicBarChart = (props) => <DynamicChart type="bar" {...props} />;
export const DynamicLineChart = (props) => <DynamicChart type="line" {...props} />;
export const DynamicPieChart = (props) => <DynamicChart type="pie" {...props} />;
export const DynamicAreaChart = (props) => <DynamicChart type="area" {...props} />;
export const DynamicRadarChart = (props) => <DynamicChart type="radar" {...props} />;

export default DynamicChart;