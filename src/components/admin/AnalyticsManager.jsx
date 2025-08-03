import React, { useState, useEffect, useCallback } from 'react';
import {
  BarChart3,
  TrendingUp,
  Users,
  Activity,
  DollarSign,
  BookOpen,
  Target,
  Download,
  RefreshCw
} from 'lucide-react';
import StatsCard from './StatsCard';
import AdminTable from './AdminTable';
import { exportToCSV } from '../../utils/adminHelpers';

/**
 * Analytics Management Module
 * Comprehensive analytics dashboard for business insights
 */
const AnalyticsManager = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('30d');
  const [loading, setLoading] = useState(false);
  const [analyticsData, setAnalyticsData] = useState(null);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'users', label: 'User Analytics', icon: <Users className="w-4 h-4" /> },
    { id: 'content', label: 'Content Performance', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'revenue', label: 'Revenue Analytics', icon: <DollarSign className="w-4 h-4" /> }
  ];

  const dateRangeOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' }
  ];

  const loadAnalyticsData = useCallback(async () => {
    setLoading(true);
    try {
      // Simulate API call - replace with actual analytics service
      await new Promise(resolve => setTimeout(resolve, 1000));
      setAnalyticsData(generateAnalyticsData());
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData]);

  const generateAnalyticsData = () => {
    return {
      overview: {
        totalUsers: 1247,
        activeUsers: 834,
        premiumUsers: 189,
        totalRevenue: 45200,
        monthlyGrowth: 12.5,
        conversionRate: 15.2,
        averageEngagement: 78,
        totalSessions: 8934
      },
      userMetrics: {
        newUsers: generateTimeSeriesData(30, 10, 50),
        activeUsers: generateTimeSeriesData(30, 300, 900),
        retentionRate: 68,
        averageSessionDuration: '8m 42s',
        bounceRate: 23.4
      },
      contentMetrics: {
        totalViews: 24580,
        completionRate: 73.2,
        averageRating: 4.6,
        topContent: [
          { id: 1, title: 'AI Readiness Assessment', views: 5240, completions: 324, rating: 4.7 },
          { id: 2, title: 'AI Strategy Starter Kit', views: 3890, completions: 156, rating: 4.5 },
          { id: 3, title: 'AI Use Case ROI Toolkit', views: 2340, completions: 89, rating: 4.3 }
        ]
      },
      revenueMetrics: {
        mrr: 12400,
        churnRate: 5.2,
        averageRevenuePerUser: 89,
        subscriptionGrowth: 18.7,
        totalSubscriptions: 189,
        subscriptionsByPlan: [
          { plan: 'Basic', count: 67, revenue: 3350 },
          { plan: 'Professional', count: 89, revenue: 7120 },
          { plan: 'Enterprise', count: 33, revenue: 4950 }
        ]
      }
    };
  };

  const generateTimeSeriesData = (days, min, max) => {
    return Array.from({ length: days }, (_, i) => ({
      date: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      value: Math.floor(Math.random() * (max - min) + min)
    }));
  };

  const handleRefreshData = () => {
    loadAnalyticsData();
  };

  const handleExportData = () => {
    if (!analyticsData) return;
    
    const exportData = {
      overview: analyticsData.overview,
      dateRange: dateRange,
      exportedAt: new Date().toISOString()
    };
    
    exportToCSV([exportData], `analytics_${dateRange}`);
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chestnut focus:border-transparent"
          >
            {dateRangeOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            onClick={handleRefreshData}
            disabled={loading}
            className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleExportData}
            className="px-4 py-2 border border-chestnut text-chestnut rounded-lg hover:bg-chestnut/10 transition-colors"
          >
            <Download className="w-4 h-4 mr-2 inline" />
            Export Data
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-chestnut text-chestnut'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && <OverviewAnalytics data={analyticsData?.overview} loading={loading} />}
      {activeTab === 'users' && <UserAnalytics data={analyticsData?.userMetrics} loading={loading} />}
      {activeTab === 'content' && <ContentAnalytics data={analyticsData?.contentMetrics} loading={loading} />}
      {activeTab === 'revenue' && <RevenueAnalytics data={analyticsData?.revenueMetrics} loading={loading} />}
    </div>
  );
};

// Overview Analytics Component
const OverviewAnalytics = ({ data, loading }) => {
  if (!data && !loading) return null;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Users"
          value={data?.totalUsers}
          icon={Users}
          color="chestnut"
          trend={data?.monthlyGrowth}
          trendLabel="this month"
          loading={loading}
        />
        <StatsCard
          title="Active Users"
          value={data?.activeUsers}
          icon={Activity}
          color="green"
          subtitle="Last 30 days"
          loading={loading}
        />
        <StatsCard
          title="Premium Users"
          value={data?.premiumUsers}
          icon={Target}
          color="yellow"
          subtitle={`${data?.conversionRate}% conversion`}
          loading={loading}
        />
        <StatsCard
          title="Monthly Revenue"
          value={data?.totalRevenue ? `$${data.totalRevenue.toLocaleString()}` : undefined}
          icon={DollarSign}
          color="blue"
          loading={loading}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Avg. Engagement"
          value={data?.averageEngagement ? `${data.averageEngagement}%` : undefined}
          icon={TrendingUp}
          color="purple"
          loading={loading}
        />
        <StatsCard
          title="Total Sessions"
          value={data?.totalSessions}
          icon={Activity}
          color="blue"
          loading={loading}
        />
        <StatsCard
          title="Conversion Rate"
          value={data?.conversionRate ? `${data.conversionRate}%` : undefined}
          icon={Target}
          color="green"
          loading={loading}
        />
      </div>

      {/* Performance Overview */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-charcoal mb-4">Performance Overview</h3>
        <div className="text-center py-12 text-gray-500">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>Performance charts and trends</p>
          <p className="text-sm">Visual analytics dashboard coming soon</p>
        </div>
      </div>
    </div>
  );
};

// User Analytics Component
const UserAnalytics = ({ data, loading }) => {
  if (!data && !loading) return null;

  return (
    <div className="space-y-6">
      {/* User Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Retention Rate"
          value={data?.retentionRate ? `${data.retentionRate}%` : undefined}
          icon={Users}
          color="green"
          loading={loading}
        />
        <StatsCard
          title="Session Duration"
          value={data?.averageSessionDuration}
          icon={Activity}
          color="blue"
          loading={loading}
        />
        <StatsCard
          title="Bounce Rate"
          value={data?.bounceRate ? `${data.bounceRate}%` : undefined}
          icon={TrendingUp}
          color="red"
          loading={loading}
        />
        <StatsCard
          title="New Users"
          value={data?.newUsers?.reduce((sum, d) => sum + d.value, 0)}
          icon={Users}
          color="chestnut"
          subtitle="This period"
          loading={loading}
        />
      </div>

      {/* User Acquisition Chart */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-charcoal mb-4">User Acquisition Trends</h3>
        <div className="text-center py-12 text-gray-500">
          <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>User acquisition and retention charts</p>
          <p className="text-sm">Track user growth and engagement patterns</p>
        </div>
      </div>

      {/* User Segments */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-charcoal mb-4">User Segments</h3>
        <div className="text-center py-12 text-gray-500">
          <Target className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>User segmentation analysis</p>
          <p className="text-sm">Breakdown by user type, engagement level, and behavior</p>
        </div>
      </div>
    </div>
  );
};

// Content Analytics Component
const ContentAnalytics = ({ data, loading }) => {
  if (!data && !loading) return null;

  const tableColumns = [
    {
      key: 'title',
      title: 'Content',
      render: (item) => (
        <div className="font-medium text-charcoal">{item.title}</div>
      )
    },
    {
      key: 'views',
      title: 'Views',
      sortable: true,
      render: (item) => item.views.toLocaleString()
    },
    {
      key: 'completions',
      title: 'Completions',
      sortable: true,
      render: (item) => item.completions
    },
    {
      key: 'completionRate',
      title: 'Completion Rate',
      render: (item) => `${((item.completions / item.views) * 100).toFixed(1)}%`
    },
    {
      key: 'rating',
      title: 'Rating',
      sortable: true,
      render: (item) => `★ ${item.rating}`
    }
  ];

  return (
    <div className="space-y-6">
      {/* Content Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Total Views"
          value={data?.totalViews}
          icon={BookOpen}
          color="blue"
          loading={loading}
        />
        <StatsCard
          title="Completion Rate"
          value={data?.completionRate ? `${data.completionRate}%` : undefined}
          icon={Target}
          color="green"
          loading={loading}
        />
        <StatsCard
          title="Average Rating"
          value={data?.averageRating ? `★ ${data.averageRating}` : undefined}
          icon={TrendingUp}
          color="yellow"
          loading={loading}
        />
      </div>

      {/* Top Content */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-charcoal">Top Performing Content</h3>
        </div>
        <AdminTable
          columns={tableColumns}
          data={data?.topContent || []}
          loading={loading}
          emptyStateTitle="No content data available"
          emptyStateIcon={BookOpen}
        />
      </div>

      {/* Content Performance Chart */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-charcoal mb-4">Content Performance Trends</h3>
        <div className="text-center py-12 text-gray-500">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>Content performance analytics</p>
          <p className="text-sm">Track content views, engagement, and user feedback over time</p>
        </div>
      </div>
    </div>
  );
};

// Revenue Analytics Component
const RevenueAnalytics = ({ data, loading }) => {
  if (!data && !loading) return null;

  const planColumns = [
    {
      key: 'plan',
      title: 'Plan',
      render: (item) => (
        <div className="font-medium text-charcoal">{item.plan}</div>
      )
    },
    {
      key: 'count',
      title: 'Subscribers',
      sortable: true,
      render: (item) => item.count
    },
    {
      key: 'revenue',
      title: 'Revenue',
      sortable: true,
      render: (item) => `$${item.revenue.toLocaleString()}`
    },
    {
      key: 'averageRevenue',
      title: 'Avg. Revenue',
      render: (item) => `$${Math.round(item.revenue / item.count)}`
    }
  ];

  return (
    <div className="space-y-6">
      {/* Revenue Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Monthly Recurring Revenue"
          value={data?.mrr ? `$${data.mrr.toLocaleString()}` : undefined}
          icon={DollarSign}
          color="green"
          trend={data?.subscriptionGrowth}
          trendLabel="growth"
          loading={loading}
        />
        <StatsCard
          title="Total Subscriptions"
          value={data?.totalSubscriptions}
          icon={Users}
          color="chestnut"
          loading={loading}
        />
        <StatsCard
          title="Churn Rate"
          value={data?.churnRate ? `${data.churnRate}%` : undefined}
          icon={TrendingUp}
          color="red"
          loading={loading}
        />
        <StatsCard
          title="ARPU"
          value={data?.averageRevenuePerUser ? `$${data.averageRevenuePerUser}` : undefined}
          icon={Target}
          color="blue"
          subtitle="Average Revenue Per User"
          loading={loading}
        />
      </div>

      {/* Revenue by Plan */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-charcoal">Revenue by Subscription Plan</h3>
        </div>
        <AdminTable
          columns={planColumns}
          data={data?.subscriptionsByPlan || []}
          loading={loading}
          emptyStateTitle="No subscription data available"
          emptyStateIcon={DollarSign}
        />
      </div>

      {/* Revenue Trends */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-charcoal mb-4">Revenue Trends</h3>
        <div className="text-center py-12 text-gray-500">
          <DollarSign className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>Revenue analytics and forecasting</p>
          <p className="text-sm">Track MRR growth, churn patterns, and subscription trends</p>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsManager;