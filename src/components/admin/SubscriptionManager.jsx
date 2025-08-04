import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  Users,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  XCircle,
  Calendar,
  Crown,
  Target,
  BarChart3
} from 'lucide-react';
import AdminTable from './AdminTable';
import AdminModal from './AdminModal';
import StatsCard from './StatsCard';
import { formatDate, exportToCSV } from '../../utils/secureAdminHelpers';

/**
 * Subscription Management Module
 * Manages premium subscriptions, billing, and revenue analytics
 */
const SubscriptionManager = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [subscriptions, setSubscriptions] = useState([]);
  const [filteredSubscriptions, setFilteredSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [showSubscriptionDetail, setShowSubscriptionDetail] = useState(false);
  const [sortKey, setSortKey] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'subscriptions', label: 'Subscriptions', icon: <Users className="w-4 h-4" /> },
    { id: 'billing', label: 'Billing Issues', icon: <AlertCircle className="w-4 h-4" /> },
    { id: 'revenue', label: 'Revenue', icon: <DollarSign className="w-4 h-4" /> }
  ];

  useEffect(() => {
    loadSubscriptions();
  }, []);

  useEffect(() => {
    filterSubscriptions();
  }, [subscriptions, searchTerm, statusFilter, planFilter]);

  const loadSubscriptions = async () => {
    setLoading(true);
    try {
      // Simulate API call - in production, this would call your subscription service
      await new Promise(resolve => setTimeout(resolve, 1000));
      const subscriptionData = generateDemoSubscriptions();
      setSubscriptions(subscriptionData);
    } catch (error) {
      console.error('Error loading subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateDemoSubscriptions = () => {
    const plans = ['Basic', 'Professional', 'Enterprise'];
    const statuses = ['active', 'canceled', 'past_due', 'trialing'];
    
    return Array.from({ length: 25 }, (_, i) => {
      const plan = plans[Math.floor(Math.random() * plans.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const createdDate = new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000);
      
      return {
        id: `sub_${i + 1}`,
        userId: `user_${i + 1}`,
        userEmail: `user${i + 1}@example.com`,
        userName: `User ${i + 1}`,
        plan: plan,
        status: status,
        amount: plan === 'Basic' ? 29 : plan === 'Professional' ? 79 : 149,
        currency: 'USD',
        interval: 'month',
        createdAt: createdDate.toISOString(),
        currentPeriodStart: createdDate.toISOString(),
        currentPeriodEnd: new Date(createdDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        nextBillingDate: new Date(createdDate.getTime() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        paymentMethod: 'card',
        lastPaymentStatus: status === 'past_due' ? 'failed' : 'succeeded',
        totalRevenue: (plan === 'Basic' ? 29 : plan === 'Professional' ? 79 : 149) * Math.floor(Math.random() * 12 + 1)
      };
    });
  };

  const filterSubscriptions = () => {
    let filtered = [...subscriptions];

    if (searchTerm) {
      filtered = filtered.filter(sub =>
        sub.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.plan.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(sub => sub.status === statusFilter);
    }

    if (planFilter !== 'all') {
      filtered = filtered.filter(sub => sub.plan === planFilter);
    }

    // Sort
    filtered.sort((a, b) => {
      let aVal = sortKey.split('.').reduce((obj, key) => obj?.[key], a);
      let bVal = sortKey.split('.').reduce((obj, key) => obj?.[key], b);

      if (sortKey.includes('At') || sortKey.includes('Date')) {
        aVal = new Date(aVal || 0).getTime();
        bVal = new Date(bVal || 0).getTime();
      }

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setFilteredSubscriptions(filtered);
  };

  const handleSort = (key, direction) => {
    setSortKey(key);
    setSortDirection(direction);
  };

  const calculateStats = () => {
    const active = subscriptions.filter(s => s.status === 'active');
    const canceled = subscriptions.filter(s => s.status === 'canceled');
    const pastDue = subscriptions.filter(s => s.status === 'past_due');
    const trialing = subscriptions.filter(s => s.status === 'trialing');

    const monthlyRevenue = active.reduce((sum, sub) => sum + sub.amount, 0);
    const totalRevenue = subscriptions.reduce((sum, sub) => sum + sub.totalRevenue, 0);
    const churnRate = subscriptions.length > 0 ? (canceled.length / subscriptions.length) * 100 : 0;

    return {
      totalSubscriptions: subscriptions.length,
      activeSubscriptions: active.length,
      canceledSubscriptions: canceled.length,
      pastDueSubscriptions: pastDue.length,
      trialingSubscriptions: trialing.length,
      monthlyRevenue,
      totalRevenue,
      churnRate: Math.round(churnRate * 10) / 10,
      averageRevenue: active.length > 0 ? Math.round(monthlyRevenue / active.length) : 0
    };
  };

  return (
    <div className="space-y-6">
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
      {activeTab === 'overview' && (
        <SubscriptionOverview 
          subscriptions={subscriptions} 
          stats={calculateStats()} 
          loading={loading} 
        />
      )}
      {activeTab === 'subscriptions' && (
        <SubscriptionsTable
          subscriptions={filteredSubscriptions}
          loading={loading}
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          statusFilter={statusFilter}
          onStatusFilter={setStatusFilter}
          planFilter={planFilter}
          onPlanFilter={setPlanFilter}
          sortKey={sortKey}
          sortDirection={sortDirection}
          onSort={handleSort}
          onViewSubscription={(sub) => {
            setSelectedSubscription(sub);
            setShowSubscriptionDetail(true);
          }}
        />
      )}
      {activeTab === 'billing' && <BillingIssues subscriptions={subscriptions} loading={loading} />}
      {activeTab === 'revenue' && <RevenueAnalytics subscriptions={subscriptions} loading={loading} />}

      {/* Subscription Detail Modal */}
      <AdminModal
        isOpen={showSubscriptionDetail}
        onClose={() => setShowSubscriptionDetail(false)}
        title={selectedSubscription ? `${selectedSubscription.userName} - Subscription Details` : 'Subscription Details'}
        size="large"
      >
        {selectedSubscription && <SubscriptionDetailView subscription={selectedSubscription} />}
      </AdminModal>
    </div>
  );
};

// Subscription Overview Component
const SubscriptionOverview = ({ subscriptions, stats, loading }) => {
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Subscriptions"
          value={stats.totalSubscriptions}
          icon={Users}
          color="chestnut"
          loading={loading}
        />
        <StatsCard
          title="Active Subscriptions"
          value={stats.activeSubscriptions}
          icon={CheckCircle}
          color="green"
          loading={loading}
        />
        <StatsCard
          title="Monthly Revenue"
          value={`$${stats.monthlyRevenue?.toLocaleString()}`}
          icon={DollarSign}
          color="blue"
          loading={loading}
        />
        <StatsCard
          title="Churn Rate"
          value={`${stats.churnRate}%`}
          icon={TrendingUp}
          color="red"
          loading={loading}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatsCard
          title="Past Due"
          value={stats.pastDueSubscriptions}
          icon={AlertCircle}
          color="yellow"
          loading={loading}
        />
        <StatsCard
          title="Trialing"
          value={stats.trialingSubscriptions}
          icon={Calendar}
          color="purple"
          loading={loading}
        />
        <StatsCard
          title="Avg Revenue Per User"
          value={`$${stats.averageRevenue}`}
          icon={Target}
          color="green"
          loading={loading}
        />
      </div>

      {/* Revenue Breakdown */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-charcoal mb-4">Revenue Breakdown by Plan</h3>
        <RevenueBreakdown subscriptions={subscriptions} />
      </div>
    </div>
  );
};

// Revenue Breakdown Component
const RevenueBreakdown = ({ subscriptions }) => {
  const planBreakdown = subscriptions
    .filter(sub => sub.status === 'active')
    .reduce((acc, sub) => {
      if (!acc[sub.plan]) {
        acc[sub.plan] = { count: 0, revenue: 0 };
      }
      acc[sub.plan].count += 1;
      acc[sub.plan].revenue += sub.amount;
      return acc;
    }, {});

  return (
    <div className="space-y-4">
      {Object.entries(planBreakdown).map(([plan, data]) => (
        <div key={plan} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center">
            <Crown className="w-5 h-5 text-chestnut mr-3" />
            <div>
              <div className="font-medium text-charcoal">{plan}</div>
              <div className="text-sm text-gray-500">{data.count} subscribers</div>
            </div>
          </div>
          <div className="text-right">
            <div className="font-bold text-charcoal">${data.revenue.toLocaleString()}</div>
            <div className="text-sm text-gray-500">monthly</div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Subscriptions Table Component
const SubscriptionsTable = ({ 
  subscriptions, 
  loading, 
  searchTerm, 
  onSearch, 
  statusFilter, 
  onStatusFilter,
  planFilter,
  onPlanFilter,
  sortKey,
  sortDirection,
  onSort,
  onViewSubscription
}) => {
  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'canceled': return <XCircle className="w-4 h-4 text-red-600" />;
      case 'past_due': return <AlertCircle className="w-4 h-4 text-yellow-600" />;
      case 'trialing': return <Calendar className="w-4 h-4 text-blue-600" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'canceled': return 'bg-red-100 text-red-800';
      case 'past_due': return 'bg-yellow-100 text-yellow-800';
      case 'trialing': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const tableColumns = [
    {
      key: 'userName',
      title: 'User',
      sortable: true,
      render: (sub) => (
        <div>
          <div className="font-medium text-charcoal">{sub.userName}</div>
          <div className="text-sm text-gray-500">{sub.userEmail}</div>
        </div>
      )
    },
    {
      key: 'plan',
      title: 'Plan',
      sortable: true,
      render: (sub) => (
        <span className="px-2 py-1 bg-chestnut/10 text-chestnut rounded text-sm font-medium">
          {sub.plan}
        </span>
      )
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (sub) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center w-fit ${getStatusColor(sub.status)}`}>
          {getStatusIcon(sub.status)}
          <span className="ml-1 capitalize">{sub.status.replace('_', ' ')}</span>
        </span>
      )
    },
    {
      key: 'amount',
      title: 'Amount',
      sortable: true,
      render: (sub) => `$${sub.amount}/${sub.interval}`
    },
    {
      key: 'nextBillingDate',
      title: 'Next Billing',
      sortable: true,
      render: (sub) => formatDate(sub.nextBillingDate)
    },
    {
      key: 'totalRevenue',
      title: 'Total Revenue',
      sortable: true,
      render: (sub) => `$${sub.totalRevenue.toLocaleString()}`
    },
    {
      key: 'createdAt',
      title: 'Created',
      sortable: true,
      render: (sub) => formatDate(sub.createdAt)
    }
  ];

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <select
              value={statusFilter}
              onChange={(e) => onStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chestnut focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="canceled">Canceled</option>
              <option value="past_due">Past Due</option>
              <option value="trialing">Trialing</option>
            </select>
            <select
              value={planFilter}
              onChange={(e) => onPlanFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chestnut focus:border-transparent"
            >
              <option value="all">All Plans</option>
              <option value="Basic">Basic</option>
              <option value="Professional">Professional</option>
              <option value="Enterprise">Enterprise</option>
            </select>
          </div>
          <button
            onClick={() => exportToCSV(subscriptions, 'subscriptions')}
            className="px-4 py-2 border border-chestnut text-chestnut rounded-lg hover:bg-chestnut/10 transition-colors"
          >
            Export Subscriptions
          </button>
        </div>
      </div>

      {/* Subscriptions Table */}
      <AdminTable
        columns={tableColumns}
        data={subscriptions}
        loading={loading}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSort={onSort}
        searchTerm={searchTerm}
        onSearch={onSearch}
        searchPlaceholder="Search by user name, email, or plan..."
        emptyStateTitle="No subscriptions found"
        emptyStateDescription="No subscriptions match your current filters"
        emptyStateIcon={Users}
        onRowClick={onViewSubscription}
      />
    </div>
  );
};

// Billing Issues Component
const BillingIssues = ({ subscriptions, loading }) => {
  const billingIssues = subscriptions.filter(sub => 
    sub.status === 'past_due' || sub.lastPaymentStatus === 'failed'
  );

  const tableColumns = [
    {
      key: 'userName',
      title: 'User',
      render: (sub) => (
        <div>
          <div className="font-medium text-charcoal">{sub.userName}</div>
          <div className="text-sm text-gray-500">{sub.userEmail}</div>
        </div>
      )
    },
    {
      key: 'plan',
      title: 'Plan',
      render: (sub) => sub.plan
    },
    {
      key: 'amount',
      title: 'Amount',
      render: (sub) => `$${sub.amount}`
    },
    {
      key: 'issue',
      title: 'Issue',
      render: (sub) => (
        <span className="px-2 py-1 bg-red-100 text-red-800 rounded text-sm">
          {sub.status === 'past_due' ? 'Payment Past Due' : 'Payment Failed'}
        </span>
      )
    },
    {
      key: 'nextBillingDate',
      title: 'Next Attempt',
      render: (sub) => formatDate(sub.nextBillingDate)
    }
  ];

  return (
    <div className="space-y-6">
      <StatsCard
        title="Billing Issues"
        value={billingIssues.length}
        icon={AlertCircle}
        color="red"
        subtitle="Requires attention"
        loading={loading}
      />

      <AdminTable
        columns={tableColumns}
        data={billingIssues}
        loading={loading}
        emptyStateTitle="No billing issues"
        emptyStateDescription="All subscriptions are up to date"
        emptyStateIcon={CheckCircle}
      />
    </div>
  );
};

// Revenue Analytics Component
const RevenueAnalytics = ({ subscriptions, loading }) => {
  const calculateRevenueMetrics = () => {
    const active = subscriptions.filter(s => s.status === 'active');
    const monthlyRevenue = active.reduce((sum, sub) => sum + sub.amount, 0);
    const annualRevenue = monthlyRevenue * 12;
    const totalLifetimeRevenue = subscriptions.reduce((sum, sub) => sum + sub.totalRevenue, 0);
    
    return {
      monthlyRevenue,
      annualRevenue,
      totalLifetimeRevenue,
      averageRevenue: active.length > 0 ? Math.round(monthlyRevenue / active.length) : 0
    };
  };

  const metrics = calculateRevenueMetrics();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Monthly Revenue"
          value={`$${metrics.monthlyRevenue?.toLocaleString()}`}
          icon={DollarSign}
          color="green"
          loading={loading}
        />
        <StatsCard
          title="Annual Revenue"
          value={`$${metrics.annualRevenue?.toLocaleString()}`}
          icon={TrendingUp}
          color="blue"
          loading={loading}
        />
        <StatsCard
          title="Lifetime Revenue"
          value={`$${metrics.totalLifetimeRevenue?.toLocaleString()}`}
          icon={BarChart3}
          color="purple"
          loading={loading}
        />
        <StatsCard
          title="Average Revenue"
          value={`$${metrics.averageRevenue}`}
          icon={Target}
          color="chestnut"
          subtitle="per user"
          loading={loading}
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-charcoal mb-4">Revenue Trends</h3>
        <div className="text-center py-12 text-gray-500">
          <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
          <p>Revenue analytics and forecasting</p>
          <p className="text-sm">Track MRR growth, revenue forecasts, and subscription trends</p>
        </div>
      </div>
    </div>
  );
};

// Subscription Detail View Component
const SubscriptionDetailView = ({ subscription }) => {
  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-semibold text-charcoal">Subscription Details</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Plan:</span>
              <span className="font-medium">{subscription.plan}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(subscription.status)}`}>
                {subscription.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Amount:</span>
              <span className="font-medium">${subscription.amount}/{subscription.interval}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Created:</span>
              <span className="font-medium">{formatDate(subscription.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Next Billing:</span>
              <span className="font-medium">{formatDate(subscription.nextBillingDate)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-charcoal">Billing Information</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Method:</span>
              <span className="font-medium capitalize">{subscription.paymentMethod}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Last Payment:</span>
              <span className={`font-medium ${
                subscription.lastPaymentStatus === 'succeeded' ? 'text-green-600' : 'text-red-600'
              }`}>
                {subscription.lastPaymentStatus}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total Revenue:</span>
              <span className="font-medium">${subscription.totalRevenue.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const getStatusColor = (status) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800';
    case 'canceled': return 'bg-red-100 text-red-800';
    case 'past_due': return 'bg-yellow-100 text-yellow-800';
    case 'trialing': return 'bg-blue-100 text-blue-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

export default SubscriptionManager;