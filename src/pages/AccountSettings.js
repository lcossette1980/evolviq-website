import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  CreditCard, 
  Users, 
  Archive, 
  Download, 
  Settings,
  ChevronRight,
  Check,
  AlertCircle
} from 'lucide-react';

const colors = {
  charcoal: '#2A2A2A',
  chestnut: '#A44A3F',
  khaki: '#A59E8C',
  pearl: '#D7CEB2',
  bone: '#F5F2EA'
};

const AccountSettings = () => {
  const { user, isPremium } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [showSuccess, setShowSuccess] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    company: '',
    role: '',
    phone: ''
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
    { id: 'team', label: 'Team Management', icon: Users },
    { id: 'archives', label: 'Project Archives', icon: Archive },
    { id: 'data', label: 'Data Export', icon: Download },
    { id: 'preferences', label: 'Preferences', icon: Settings }
  ];

  const handleProfileUpdate = (e) => {
    e.preventDefault();
    // Implement profile update logic
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-6" style={{ color: colors.charcoal }}>
              Profile Information
            </h3>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Display Name</label>
                  <input
                    type="text"
                    value={profileData.displayName}
                    onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={profileData.email}
                    disabled
                    className="w-full px-3 py-2 border rounded-lg bg-gray-50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Company</label>
                  <input
                    type="text"
                    value={profileData.company}
                    onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <input
                    type="text"
                    value={profileData.role}
                    onChange={(e) => setProfileData({ ...profileData, role: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2 rounded-full text-white font-medium transition-transform hover:scale-105"
                  style={{ backgroundColor: colors.chestnut }}
                >
                  Save Changes
                </button>
              </div>
            </form>
            {showSuccess && (
              <div className="mt-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center">
                <Check className="w-4 h-4 mr-2" />
                Profile updated successfully!
              </div>
            )}
          </div>
        );

      case 'subscription':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-6" style={{ color: colors.charcoal }}>
              Subscription Details
            </h3>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold">Current Plan</h4>
                    <p className="text-2xl font-bold" style={{ color: colors.chestnut }}>
                      {isPremium ? 'Premium' : 'Free'}
                    </p>
                  </div>
                  {isPremium && (
                    <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                      Active
                    </span>
                  )}
                </div>
                {isPremium ? (
                  <div className="mt-4 space-y-2 text-sm text-gray-600">
                    <p>Next billing date: January 15, 2025</p>
                    <p>Amount: $99/month</p>
                  </div>
                ) : (
                  <div className="mt-4">
                    <p className="text-sm text-gray-600 mb-3">
                      Upgrade to Premium to access all features
                    </p>
                    <button
                      onClick={() => navigate('/membership')}
                      className="px-4 py-2 rounded-full text-white text-sm font-medium"
                      style={{ backgroundColor: colors.chestnut }}
                    >
                      Upgrade Now
                    </button>
                  </div>
                )}
              </div>
              
              {isPremium && (
                <div className="p-4 border rounded-lg">
                  <h4 className="font-semibold mb-3">Usage Statistics</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Assessments Completed</span>
                      <span className="font-medium">12</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Projects</span>
                      <span className="font-medium">3</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Team Members</span>
                      <span className="font-medium">1</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'team':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-6" style={{ color: colors.charcoal }}>
              Team Management
            </h3>
            {isPremium ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <p className="text-gray-600">Manage your team members and their access</p>
                  <button
                    className="px-4 py-2 rounded-full text-white text-sm font-medium"
                    style={{ backgroundColor: colors.chestnut }}
                  >
                    Invite Member
                  </button>
                </div>
                <div className="border rounded-lg p-4">
                  <p className="text-center text-gray-500 py-8">
                    No team members yet. Invite your first team member to collaborate!
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-600 mb-4">Team features are available for Premium members</p>
                <button
                  onClick={() => navigate('/membership')}
                  className="px-4 py-2 rounded-full text-white text-sm font-medium"
                  style={{ backgroundColor: colors.coral }}
                >
                  Upgrade to Premium
                </button>
              </div>
            )}
          </div>
        );

      case 'archives':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-6" style={{ color: colors.charcoal }}>
              Archived Projects
            </h3>
            <div className="border rounded-lg p-8">
              <p className="text-center text-gray-500">
                No archived projects. Archived projects will appear here.
              </p>
            </div>
          </div>
        );

      case 'data':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-6" style={{ color: colors.charcoal }}>
              Data Export
            </h3>
            <div className="space-y-4">
              <p className="text-gray-600">
                Export your data for backup or analysis purposes
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Assessment History</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Download all your assessment results and analyses
                  </p>
                  <button
                    className="px-4 py-2 rounded-full text-white text-sm font-medium w-full"
                    style={{ backgroundColor: colors.chestnut }}
                  >
                    Export CSV
                  </button>
                </div>
                <div className="border rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Project Data</h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Download complete project data including timelines
                  </p>
                  <button
                    className="px-4 py-2 rounded-full text-white text-sm font-medium w-full"
                    style={{ backgroundColor: colors.chestnut }}
                  >
                    Export JSON
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'preferences':
        return (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-xl font-semibold mb-6" style={{ color: colors.charcoal }}>
              Preferences
            </h3>
            <div className="space-y-6">
              <div>
                <h4 className="font-semibold mb-3">Email Notifications</h4>
                <div className="space-y-2">
                  {['Assessment reminders', 'Project updates', 'New features', 'Marketing emails'].map((item) => (
                    <label key={item} className="flex items-center">
                      <input type="checkbox" className="mr-3" defaultChecked />
                      <span className="text-sm">{item}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold mb-3">Display Preferences</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-3" />
                    <span className="text-sm">Use dark mode (coming soon)</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-3" defaultChecked />
                    <span className="text-sm">Show tooltips</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: colors.charcoal }}>
            Account Settings
          </h1>
          <p className="text-gray-600">Manage your account, subscription, and preferences</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <nav className="bg-white rounded-lg shadow p-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'text-chestnut'
                        : 'hover:bg-gray-50'
                    }`}
                    style={activeTab === tab.id ? { backgroundColor: `${colors.chestnut}10`, color: colors.chestnut } : {}}
                  >
                    <div className="flex items-center">
                      <Icon className="w-4 h-4 mr-3" />
                      <span className="text-sm font-medium">{tab.label}</span>
                    </div>
                    {activeTab === tab.id && <ChevronRight className="w-4 h-4" />}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="md:col-span-3">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;