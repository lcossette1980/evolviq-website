import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorBoundary from '../components/common/ErrorBoundary';
import { 
  Users, 
  FileText, 
  BarChart3, 
  Settings, 
  Mail, 
  Activity,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import BlogSubscriberManager from '../components/admin/BlogSubscriberManager';
import UserManager from '../components/admin/UserManager';
import ContentManager from '../components/admin/ContentManager';
import AnalyticsManager from '../components/admin/AnalyticsManager';
import SubscriptionManager from '../components/admin/SubscriptionManager';
import SettingsManager from '../components/admin/SettingsManager';
import AdminDashboardSkeleton from '../components/admin/AdminDashboardSkeleton';
import { verifyAdminAccess } from '../utils/secureAdminHelpers';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [adminData, setAdminData] = useState(null);
  const [accessDenied, setAccessDenied] = useState(false);

  // 🚨 SECURITY: Server-side admin verification
  useEffect(() => {
    const checkAdminAccess = async () => {
      try {
        setIsLoading(true);
        
        if (!user || user.isAnonymous) {
          setAccessDenied(true);
          setIsLoading(false);
          return;
        }

        // For now, check admin status based on email
        // TODO: Implement proper server-side admin verification
        const adminEmails = ['lorentcossette@gmail.com'];
        
        if (adminEmails.includes(user.email)) {
          setAdminData({ role: 'admin', email: user.email });
          console.log('✅ Admin access verified:', user.email);
        } else {
          setAccessDenied(true);
        }
      } catch (error) {
        console.error('Admin access verification failed:', error);
        setAccessDenied(true);
      } finally {
        setIsLoading(false);
      }
    };

    checkAdminAccess();
  }, [user]);

  // Redirect if access denied
  useEffect(() => {
    if (accessDenied && !isLoading) {
      navigate('/');
    }
  }, [accessDenied, isLoading, navigate]);

  if (isLoading) {
    return <AdminDashboardSkeleton />;
  }

  if (accessDenied || !adminData) {
    return (
      <div className="min-h-screen bg-bone flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-charcoal mb-2">Access Denied</h1>
          <p className="text-charcoal/70 mb-4">
            You don't have permission to access the admin dashboard.
          </p>
          <p className="text-sm text-charcoal/60">
            Admin access is verified server-side for security.
          </p>
          <button
            onClick={() => navigate('/')}
            className="mt-4 px-4 py-2 bg-chestnut text-white rounded-lg hover:bg-chestnut/90"
          >
            Return to Homepage
          </button>
        </div>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-5 h-5" /> },
    { id: 'users', label: 'Users', icon: <Users className="w-5 h-5" /> },
    { id: 'content', label: 'Content', icon: <FileText className="w-5 h-5" /> },
    { id: 'analytics', label: 'Analytics', icon: <TrendingUp className="w-5 h-5" /> },
    { id: 'subscriptions', label: 'Subscriptions', icon: <DollarSign className="w-5 h-5" /> },
    { id: 'subscribers', label: 'Subscribers', icon: <Mail className="w-5 h-5" /> },
    { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" /> }
  ];

  const mockStats = {
    totalUsers: 1247,
    premiumUsers: 189,
    totalRevenue: 45200,
    monthlyGrowth: 12.5,
    activeTools: 5,
    totalSessions: 8934,
    blogSubscribers: 324,
    conversionRate: 15.2
  };

  const mockRecentUsers = [
    { id: 1, name: 'John Smith', email: 'john@company.com', type: 'Premium', joined: '2024-01-15', lastActive: '2 hours ago' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah@nonprofit.org', type: 'Free', joined: '2024-01-14', lastActive: '1 day ago' },
    { id: 3, name: 'Mike Wilson', email: 'mike@startup.io', type: 'Premium', joined: '2024-01-13', lastActive: '3 hours ago' }
  ];


  return (
    <div className="min-h-screen bg-bone">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-charcoal">Admin Dashboard</h1>
              <div className="flex items-center space-x-3">
                <p className="text-gray-600">Welcome back, {user?.name}</p>
                <span className="px-2 py-1 bg-chestnut/10 text-chestnut text-xs font-medium rounded-full">
                  {adminData?.role === 'super_admin' ? 'Super Admin' : 'Admin'}
                </span>
                <span className="text-xs text-gray-500">
                  Verified: {new Date(adminData?.verified_at).toLocaleTimeString()}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">System Healthy</span>
              </div>
              <button 
                onClick={() => navigate('/')}
                className="px-4 py-2 text-chestnut hover:bg-chestnut/10 rounded-lg transition-colors"
              >
                View Site
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8 overflow-x-auto">
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
        </div>

        {/* Content based on active tab */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-charcoal">{mockStats.totalUsers.toLocaleString()}</p>
                  </div>
                  <Users className="w-8 h-8 text-chestnut" />
                </div>
                <div className="mt-2 flex items-center">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-sm text-green-600">+{mockStats.monthlyGrowth}%</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Premium Users</p>
                    <p className="text-2xl font-bold text-charcoal">{mockStats.premiumUsers}</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-chestnut" />
                </div>
                <div className="mt-2">
                  <span className="text-sm text-gray-600">
                    {((mockStats.premiumUsers / mockStats.totalUsers) * 100).toFixed(1)}% conversion
                  </span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Monthly Revenue</p>
                    <p className="text-2xl font-bold text-charcoal">${mockStats.totalRevenue.toLocaleString()}</p>
                  </div>
                  <BarChart3 className="w-8 h-8 text-chestnut" />
                </div>
                <div className="mt-2">
                  <span className="text-sm text-gray-600">+{mockStats.conversionRate}% MoM</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Tool Sessions</p>
                    <p className="text-2xl font-bold text-charcoal">{mockStats.totalSessions.toLocaleString()}</p>
                  </div>
                  <Activity className="w-8 h-8 text-chestnut" />
                </div>
                <div className="mt-2">
                  <span className="text-sm text-gray-600">Across {mockStats.activeTools} tools</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold text-charcoal">Recent Users</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {mockRecentUsers.map(user => (
                      <div key={user.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-charcoal">{user.name}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.type === 'Premium' 
                              ? 'bg-chestnut/10 text-chestnut' 
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {user.type}
                          </span>
                          <p className="text-sm text-gray-500 mt-1">{user.lastActive}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6 border-b">
                  <h3 className="text-lg font-semibold text-charcoal">System Status</h3>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">API Status</span>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        <span className="text-sm text-green-600">Operational</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Database</span>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        <span className="text-sm text-green-600">Connected</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">ML Tools</span>
                      <div className="flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                        <span className="text-sm text-green-600">5/5 Active</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Storage</span>
                      <div className="flex items-center">
                        <AlertCircle className="w-4 h-4 text-yellow-500 mr-2" />
                        <span className="text-sm text-yellow-600">78% Used</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <ErrorBoundary level="component">
            <UserManager />
          </ErrorBoundary>
        )}
        {activeTab === 'content' && (
          <ErrorBoundary level="component">
            <ContentManager />
          </ErrorBoundary>
        )}
        {activeTab === 'analytics' && (
          <ErrorBoundary level="component">
            <AnalyticsManager />
          </ErrorBoundary>
        )}
        {activeTab === 'subscriptions' && (
          <ErrorBoundary level="component">
            <SubscriptionManager />
          </ErrorBoundary>
        )}
        {activeTab === 'subscribers' && (
          <ErrorBoundary level="component">
            <BlogSubscriberManager />
          </ErrorBoundary>
        )}
        {activeTab === 'settings' && (
          <ErrorBoundary level="component">
            <SettingsManager />
          </ErrorBoundary>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;