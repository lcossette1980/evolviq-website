import React, { useState, useEffect } from 'react';
import {
  Users,
  Crown,
  Activity,
  TrendingUp,
  Eye,
  Edit3,
  Mail,
  Ban,
  UserCheck,
  Calendar,
  Star,
  Target,
  Award
} from 'lucide-react';
import { collection, getDocs, query, orderBy, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import AdminTable from './AdminTable';
import AdminModal from './AdminModal';
import StatsCard from './StatsCard';
import { formatDate, formatDateTime, exportToCSV } from '../../utils/adminHelpers';

/**
 * Users Management Module
 * Comprehensive user management with analytics and admin actions
 */
const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserDetail, setShowUserDetail] = useState(false);
  const [showEditUser, setShowEditUser] = useState(false);
  const [sortKey, setSortKey] = useState('lastLoginAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [stats, setStats] = useState({
    total: 0,
    premium: 0,
    free: 0,
    active: 0,
    averageEngagement: 0,
    newThisMonth: 0
  });

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
    calculateStats();
  }, [users, searchTerm, statusFilter, typeFilter]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      // Load users from Firebase Auth collection (if you have one) or create mock data
      const usersData = await loadUsersFromFirebase();
      setUsers(usersData);
    } catch (error) {
      console.error('Error loading users:', error);
      // Fallback to demo data for development
      setUsers(generateDemoUsers());
    } finally {
      setLoading(false);
    }
  };

  const loadUsersFromFirebase = async () => {
    try {
      // Try to load real user data from projects and assessments
      const projectsRef = collection(db, 'projects');
      const assessmentsRef = collection(db, 'assessments');
      
      const [projectsSnapshot, assessmentsSnapshot] = await Promise.all([
        getDocs(query(projectsRef, orderBy('created', 'desc'))),
        getDocs(assessmentsRef)
      ]);

      const userMap = new Map();

      // Process projects data
      projectsSnapshot.docs.forEach(doc => {
        const project = doc.data();
        if (!userMap.has(project.userId)) {
          userMap.set(project.userId, {
            id: project.userId,
            email: `user${project.userId.slice(-4)}@example.com`,
            name: `User ${project.userId.slice(-4)}`,
            isPremium: false,
            isAnonymous: false,
            createdAt: project.created?.toDate?.()?.toISOString() || new Date().toISOString(),
            lastLoginAt: project.lastUpdated?.toDate?.()?.toISOString() || new Date().toISOString(),
            projects: [],
            assessments: [],
            engagementScore: 0
          });
        }
        userMap.get(project.userId).projects.push(project);
      });

      // Process assessments data
      assessmentsSnapshot.docs.forEach(doc => {
        const assessment = doc.data();
        const userId = doc.id.split('_')[0];
        if (userMap.has(userId)) {
          userMap.get(userId).assessments.push(assessment);
        }
      });

      // Calculate engagement scores
      userMap.forEach(user => {
        user.engagementScore = calculateEngagementScore(user);
        user.status = user.lastLoginAt && 
          new Date(user.lastLoginAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) 
          ? 'active' : 'inactive';
      });

      return Array.from(userMap.values());
    } catch (error) {
      console.error('Error loading from Firebase:', error);
      throw error;
    }
  };

  const generateDemoUsers = () => {
    return [
      {
        id: 'user_001',
        email: 'john.smith@company.com',
        name: 'John Smith',
        isPremium: true,
        isAnonymous: false,
        status: 'active',
        createdAt: '2024-01-15T10:30:00Z',
        lastLoginAt: '2024-01-22T14:22:00Z',
        engagementScore: 92,
        projects: 3,
        assessments: 2,
        lastAssessment: 'AI Knowledge Navigator',
        source: 'website'
      },
      {
        id: 'user_002',
        email: 'sarah.wilson@nonprofit.org',
        name: 'Sarah Wilson',
        isPremium: false,
        isAnonymous: false,
        status: 'active',
        createdAt: '2024-01-18T16:45:00Z',
        lastLoginAt: '2024-01-21T09:15:00Z',
        engagementScore: 78,
        projects: 1,
        assessments: 1,
        lastAssessment: 'Change Readiness',
        source: 'referral'
      },
      {
        id: 'user_003',
        email: 'mike.johnson@startup.io',
        name: 'Mike Johnson',
        isPremium: false,
        isAnonymous: false,
        status: 'inactive',
        createdAt: '2024-01-10T12:20:00Z',
        lastLoginAt: '2024-01-14T11:30:00Z',
        engagementScore: 45,
        projects: 0,
        assessments: 1,
        lastAssessment: 'AI Knowledge Navigator',
        source: 'social_media'
      },
      {
        id: 'user_004',
        email: 'lisa.chen@enterprise.com',
        name: 'Lisa Chen',
        isPremium: true,
        isAnonymous: false,
        status: 'active',
        createdAt: '2024-01-12T08:15:00Z',
        lastLoginAt: '2024-01-22T16:45:00Z',
        engagementScore: 95,
        projects: 5,
        assessments: 3,
        lastAssessment: 'AI Knowledge Navigator',
        source: 'website'
      }
    ];
  };

  const calculateEngagementScore = (user) => {
    let score = 0;
    
    // Base score for registration
    score += 20;
    
    // Project creation bonus
    score += (user.projects?.length || 0) * 15;
    
    // Assessment completion bonus
    score += (user.assessments?.length || 0) * 20;
    
    // Recent activity bonus
    const daysSinceLastLogin = user.lastLoginAt ? 
      (Date.now() - new Date(user.lastLoginAt).getTime()) / (1000 * 60 * 60 * 24) : 999;
    
    if (daysSinceLastLogin < 7) score += 20;
    else if (daysSinceLastLogin < 30) score += 10;
    
    // Premium user bonus
    if (user.isPremium) score += 25;
    
    return Math.min(100, Math.max(0, score));
  };

  const filterUsers = () => {
    let filtered = [...users];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    // Type filter
    if (typeFilter !== 'all') {
      if (typeFilter === 'premium') {
        filtered = filtered.filter(user => user.isPremium);
      } else if (typeFilter === 'free') {
        filtered = filtered.filter(user => !user.isPremium);
      }
    }

    // Sorting
    filtered.sort((a, b) => {
      let aVal = sortKey.split('.').reduce((obj, key) => obj?.[key], a);
      let bVal = sortKey.split('.').reduce((obj, key) => obj?.[key], b);

      if (sortKey.includes('At')) {
        aVal = new Date(aVal || 0).getTime();
        bVal = new Date(bVal || 0).getTime();
      }

      if (sortDirection === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setFilteredUsers(filtered);
  };

  const calculateStats = () => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const newStats = {
      total: users.length,
      premium: users.filter(u => u.isPremium).length,
      free: users.filter(u => !u.isPremium).length,
      active: users.filter(u => u.status === 'active').length,
      averageEngagement: users.length > 0 ? 
        Math.round(users.reduce((sum, u) => sum + (u.engagementScore || 0), 0) / users.length) : 0,
      newThisMonth: users.filter(u => 
        u.createdAt && new Date(u.createdAt) >= thirtyDaysAgo
      ).length
    };

    setStats(newStats);
  };

  const handleSort = (key, direction) => {
    setSortKey(key);
    setSortDirection(direction);
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setShowUserDetail(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setShowEditUser(true);
  };

  const handleExportUsers = () => {
    const exportData = filteredUsers.map(user => ({
      name: user.name,
      email: user.email,
      type: user.isPremium ? 'Premium' : 'Free',
      status: user.status,
      engagementScore: user.engagementScore,
      projects: user.projects?.length || 0,
      assessments: user.assessments?.length || 0,
      createdAt: formatDate(user.createdAt),
      lastLoginAt: formatDate(user.lastLoginAt)
    }));

    exportToCSV(exportData, 'users');
  };

  const tableColumns = [
    {
      key: 'name',
      title: 'Name',
      sortable: true,
      render: (user) => (
        <div className="flex items-center">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium mr-3 ${
            user.isPremium ? 'bg-chestnut' : 'bg-gray-400'
          }`}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="font-medium text-charcoal">{user.name}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
          </div>
        </div>
      )
    },
    {
      key: 'isPremium',
      title: 'Type',
      render: (user) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center w-fit ${
          user.isPremium 
            ? 'bg-chestnut/10 text-chestnut' 
            : 'bg-gray-100 text-gray-600'
        }`}>
          {user.isPremium && <Crown className="w-3 h-3 mr-1" />}
          {user.isPremium ? 'Premium' : 'Free'}
        </span>
      )
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (user) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          user.status === 'active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-600'
        }`}>
          {user.status}
        </span>
      )
    },
    {
      key: 'engagementScore',
      title: 'Engagement',
      sortable: true,
      render: (user) => (
        <div className="flex items-center">
          <div className="flex-1 bg-gray-200 rounded-full h-2 mr-2">
            <div 
              className="bg-chestnut h-2 rounded-full transition-all duration-300"
              style={{ width: `${user.engagementScore || 0}%` }}
            />
          </div>
          <span className="text-sm font-medium">{user.engagementScore || 0}%</span>
        </div>
      )
    },
    {
      key: 'projects',
      title: 'Projects',
      sortable: true,
      render: (user) => user.projects?.length || 0
    },
    {
      key: 'assessments',
      title: 'Assessments',
      sortable: true,
      render: (user) => user.assessments?.length || 0
    },
    {
      key: 'lastLoginAt',
      title: 'Last Login',
      sortable: true,
      render: (user) => formatDate(user.lastLoginAt)
    }
  ];

  const tableActions = [
    {
      icon: <Eye className="w-4 h-4" />,
      title: 'View Details',
      onClick: handleViewUser,
      className: 'text-blue-600 hover:text-blue-800'
    },
    {
      icon: <Edit3 className="w-4 h-4" />,
      title: 'Edit User',
      onClick: handleEditUser,
      className: 'text-chestnut hover:text-chestnut/80'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Users"
          value={stats.total}
          icon={Users}
          color="chestnut"
          loading={loading}
        />
        <StatsCard
          title="Premium Users"
          value={stats.premium}
          icon={Crown}
          color="yellow"
          subtitle={`${stats.total > 0 ? ((stats.premium / stats.total) * 100).toFixed(1) : 0}% conversion`}
          loading={loading}
        />
        <StatsCard
          title="Active Users"
          value={stats.active}
          icon={Activity}
          color="green"
          subtitle="Last 7 days"
          loading={loading}
        />
        <StatsCard
          title="Avg. Engagement"
          value={`${stats.averageEngagement}%`}
          icon={TrendingUp}
          color="blue"
          loading={loading}
        />
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chestnut focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chestnut focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="premium">Premium</option>
              <option value="free">Free</option>
            </select>
          </div>
          <button
            onClick={handleExportUsers}
            className="px-4 py-2 border border-chestnut text-chestnut rounded-lg hover:bg-chestnut/10 transition-colors"
          >
            Export Users
          </button>
        </div>
      </div>

      {/* Users Table */}
      <AdminTable
        columns={tableColumns}
        data={filteredUsers}
        loading={loading}
        sortKey={sortKey}
        sortDirection={sortDirection}
        onSort={handleSort}
        searchTerm={searchTerm}
        onSearch={setSearchTerm}
        searchPlaceholder="Search users by name or email..."
        emptyStateTitle="No users found"
        emptyStateDescription="No users match your current filters"
        emptyStateIcon={Users}
        actions={tableActions}
        onRowClick={handleViewUser}
      />

      {/* User Detail Modal */}
      <AdminModal
        isOpen={showUserDetail}
        onClose={() => setShowUserDetail(false)}
        title={selectedUser ? `${selectedUser.name} - User Details` : 'User Details'}
        size="large"
      >
        {selectedUser && <UserDetailView user={selectedUser} />}
      </AdminModal>

      {/* Edit User Modal */}
      <AdminModal
        isOpen={showEditUser}
        onClose={() => setShowEditUser(false)}
        title={selectedUser ? `Edit ${selectedUser.name}` : 'Edit User'}
        size="medium"
      >
        {selectedUser && (
          <EditUserForm 
            user={selectedUser} 
            onSave={(updatedUser) => {
              // Update user in state
              setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
              setShowEditUser(false);
            }}
          />
        )}
      </AdminModal>
    </div>
  );
};

// User Detail View Component
const UserDetailView = ({ user }) => {
  return (
    <div className="space-y-6">
      {/* User Overview */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-semibold text-charcoal">Account Information</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-medium">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Account Type:</span>
              <span className={`font-medium ${user.isPremium ? 'text-chestnut' : 'text-gray-600'}`}>
                {user.isPremium ? 'Premium' : 'Free'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Status:</span>
              <span className={`font-medium ${user.status === 'active' ? 'text-green-600' : 'text-gray-600'}`}>
                {user.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Joined:</span>
              <span className="font-medium">{formatDate(user.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Last Login:</span>
              <span className="font-medium">{formatDate(user.lastLoginAt)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-semibold text-charcoal">Activity Metrics</h4>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Engagement Score:</span>
              <span className="font-medium">{user.engagementScore}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Projects Created:</span>
              <span className="font-medium">{user.projects?.length || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Assessments Taken:</span>
              <span className="font-medium">{user.assessments?.length || 0}</span>
            </div>
            {user.lastAssessment && (
              <div className="flex justify-between">
                <span className="text-gray-600">Last Assessment:</span>
                <span className="font-medium">{user.lastAssessment}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Activity Timeline would go here */}
      <div className="border-t pt-6">
        <h4 className="font-semibold text-charcoal mb-4">Recent Activity</h4>
        <div className="text-center py-8 text-gray-500">
          <Activity className="w-12 h-12 mx-auto mb-2 text-gray-300" />
          <p>Activity timeline coming soon</p>
        </div>
      </div>
    </div>
  );
};

// Edit User Form Component
const EditUserForm = ({ user, onSave }) => {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    isPremium: user.isPremium,
    status: user.status
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...user, ...formData });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chestnut focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chestnut focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
        <select
          value={formData.isPremium}
          onChange={(e) => setFormData({ ...formData, isPremium: e.target.value === 'true' })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chestnut focus:border-transparent"
        >
          <option value="false">Free</option>
          <option value="true">Premium</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select
          value={formData.status}
          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chestnut focus:border-transparent"
        >
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>
      <div className="flex justify-end">
        <button
          type="submit"
          className="px-4 py-2 bg-chestnut text-white rounded-lg hover:bg-chestnut/90 transition-colors"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
};

export default UserManager;