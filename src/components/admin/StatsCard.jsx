import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

/**
 * Reusable stats card component
 * Provides consistent metric display across admin modules
 */
const StatsCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendLabel,
  subtitle,
  color = 'chestnut',
  loading = false,
  className = ''
}) => {
  const colorClasses = {
    chestnut: 'text-chestnut',
    blue: 'text-blue-600',
    green: 'text-green-600',
    yellow: 'text-yellow-600',
    red: 'text-red-600',
    purple: 'text-purple-600'
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    
    if (trend > 0) {
      return <TrendingUp className="w-4 h-4 text-green-500" />;
    } else if (trend < 0) {
      return <TrendingDown className="w-4 h-4 text-red-500" />;
    } else {
      return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  const getTrendColor = () => {
    if (!trend) return 'text-gray-600';
    return trend > 0 ? 'text-green-600' : trend < 0 ? 'text-red-600' : 'text-gray-600';
  };

  const formatValue = (val) => {
    if (loading) return '-';
    if (typeof val === 'number') {
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`;
      } else if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}k`;
      }
      return val.toLocaleString();
    }
    return val;
  };

  return (
    <div className={`bg-white p-6 rounded-lg shadow-sm ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          {loading ? (
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-20 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-16"></div>
            </div>
          ) : (
            <>
              <p className="text-2xl font-bold text-charcoal mb-1">
                {formatValue(value)}
              </p>
              {subtitle && (
                <p className="text-sm text-gray-500">{subtitle}</p>
              )}
            </>
          )}
        </div>
        {Icon && (
          <div className="ml-4">
            <Icon className={`w-8 h-8 ${colorClasses[color] || colorClasses.chestnut}`} />
          </div>
        )}
      </div>
      
      {(trend !== undefined || trendLabel) && !loading && (
        <div className="mt-4 flex items-center">
          {getTrendIcon()}
          <span className={`text-sm font-medium ml-1 ${getTrendColor()}`}>
            {trend !== undefined && `${trend > 0 ? '+' : ''}${trend}%`}
            {trendLabel && ` ${trendLabel}`}
          </span>
        </div>
      )}
    </div>
  );
};

export default StatsCard;