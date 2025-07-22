import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { 
  User, 
  CreditCard, 
  Archive, 
  Settings,
  ChevronRight,
  Check,
  AlertCircle,
  Loader,
  Bell,
  Eye,
  Shield
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
  const [showSuccess, setShowSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    company: '',
    role: '',
    phone: '',
    industry: '',
    teamSize: ''
  });
  const [preferences, setPreferences] = useState({
    emailNotifications: {
      assessmentReminders: true,
      projectUpdates: true,
      newFeatures: false,
      marketingEmails: false
    },
    displayPreferences: {
      showTooltips: true,
      compactMode: false
    }
  });
  const [subscriptionData, setSubscriptionData] = useState({
    plan: isPremium ? 'Premium' : 'Free',
    status: 'active',
    nextBilling: null,
    amount: null,
    assessmentsCompleted: 0,
    activeProjects: 0
  });

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
    { id: 'archives', label: 'Projects', icon: Archive },
    { id: 'preferences', label: 'Preferences', icon: Settings }
  ];

  // Load user data from Firestore
  useEffect(() => {
    const loadUserData = async () => {
      if (!user?.uid) return;
      
      setIsLoading(true);
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setProfileData({
            displayName: userData.displayName || user.displayName || '',
            email: user.email || '',
            company: userData.company || '',
            role: userData.role || '',
            phone: userData.phone || '',
            industry: userData.industry || '',
            teamSize: userData.teamSize || ''
          });
          
          setPreferences({
            emailNotifications: userData.emailNotifications || {
              assessmentReminders: true,
              projectUpdates: true,
              newFeatures: false,
              marketingEmails: false
            },
            displayPreferences: userData.displayPreferences || {
              showTooltips: true,
              compactMode: false
            }
          });
          
          setSubscriptionData({
            plan: userData.subscriptionPlan || (isPremium ? 'Premium' : 'Free'),
            status: userData.subscriptionStatus || 'active',
            nextBilling: userData.nextBilling || null,
            amount: userData.subscriptionAmount || (isPremium ? 47 : 0),
            assessmentsCompleted: userData.assessmentsCompleted || 0,
            activeProjects: userData.activeProjects || 0
          });
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserData();
  }, [user, isPremium]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!user?.uid) return;
    
    setIsLoading(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        displayName: profileData.displayName,
        company: profileData.company,
        role: profileData.role,
        phone: profileData.phone,
        industry: profileData.industry,
        teamSize: profileData.teamSize,
        updatedAt: new Date().toISOString()
      });
      
      setShowSuccess('Profile updated successfully!');
      setTimeout(() => setShowSuccess(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setShowSuccess('Error updating profile. Please try again.');
      setTimeout(() => setShowSuccess(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePreferencesUpdate = async (newPreferences) => {
    if (!user?.uid) return;
    
    setIsLoading(true);
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        emailNotifications: newPreferences.emailNotifications,
        displayPreferences: newPreferences.displayPreferences,
        updatedAt: new Date().toISOString()
      });
      
      setPreferences(newPreferences);
      setShowSuccess('Preferences updated successfully!');
      setTimeout(() => setShowSuccess(''), 3000);
    } catch (error) {
      console.error('Error updating preferences:', error);
      setShowSuccess('Error updating preferences. Please try again.');
      setTimeout(() => setShowSuccess(''), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-semibold" style={{ color: colors.charcoal }}>
                  Profile Information
                </h3>
                <p className="text-gray-600 mt-1">Update your personal and business information</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-chestnut to-khaki rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
            </div>
            
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Display Name *</label>
                  <input
                    type="text"
                    required
                    value={profileData.displayName}
                    onChange={(e) => setProfileData({ ...profileData, displayName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-chestnut/20 focus:border-chestnut transition-colors"
                    placeholder="Your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Email Address</label>
                  <input
                    type="email"
                    value={profileData.email}
                    disabled
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Company/Organization</label>
                  <input
                    type="text"
                    value={profileData.company}
                    onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-chestnut/20 focus:border-chestnut transition-colors"
                    placeholder="Your company name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Job Title/Role</label>
                  <input
                    type="text"
                    value={profileData.role}
                    onChange={(e) => setProfileData({ ...profileData, role: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-chestnut/20 focus:border-chestnut transition-colors"
                    placeholder="Your job title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Industry</label>
                  <select
                    value={profileData.industry}
                    onChange={(e) => setProfileData({ ...profileData, industry: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-chestnut/20 focus:border-chestnut transition-colors"
                  >
                    <option value="">Select Industry</option>
                    <option value="retail">Retail & E-commerce</option>
                    <option value="nonprofit">Non-Profit</option>
                    <option value="professional">Professional Services</option>
                    <option value="healthcare">Healthcare & Wellness</option>
                    <option value="foodservice">Food Service</option>
                    <option value="education">Education & Training</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2 text-gray-700">Team Size</label>
                  <select
                    value={profileData.teamSize}
                    onChange={(e) => setProfileData({ ...profileData, teamSize: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-chestnut/20 focus:border-chestnut transition-colors"
                  >
                    <option value="">Select Team Size</option>
                    <option value="1">Just me</option>
                    <option value="2-5">2-5 people</option>
                    <option value="6-10">6-10 people</option>
                    <option value="11-25">11-25 people</option>
                    <option value="26-50">26-50 people</option>
                    <option value="50+">50+ people</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end pt-4 border-t">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center px-8 py-3 rounded-lg text-white font-medium transition-all hover:shadow-lg disabled:opacity-50"
                  style={{ backgroundColor: colors.chestnut }}
                >
                  {isLoading ? (
                    <>
                      <Loader className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
            
            {showSuccess && (
              <div className={`mt-6 p-4 rounded-lg flex items-center ${
                showSuccess.includes('Error') 
                  ? 'bg-red-50 border border-red-200 text-red-700'
                  : 'bg-green-50 border border-green-200 text-green-700'
              }`}>
                {showSuccess.includes('Error') ? (
                  <AlertCircle className="w-5 h-5 mr-3" />
                ) : (
                  <Check className="w-5 h-5 mr-3" />
                )}
                {showSuccess}
              </div>
            )}
          </div>
        );

      case 'subscription':
        return (
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-semibold" style={{ color: colors.charcoal }}>
                  Subscription & Billing
                </h3>
                <p className="text-gray-600 mt-1">Manage your subscription and view usage statistics</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-chestnut to-khaki rounded-full flex items-center justify-center">
                <CreditCard className="w-8 h-8 text-white" />
              </div>
            </div>

            <div className="space-y-6">
              {/* Current Plan */}
              <div className="border-2 rounded-xl p-6" style={{ 
                borderColor: isPremium ? colors.chestnut : '#e5e7eb',
                backgroundColor: isPremium ? `${colors.chestnut}05` : 'white'
              }}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">Current Plan</h4>
                    <div className="flex items-center mt-2">
                      <p className="text-3xl font-bold mr-3" style={{ color: colors.chestnut }}>
                        {subscriptionData.plan}
                      </p>
                      {isPremium && (
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                          Active
                        </span>
                      )}
                    </div>
                  </div>
                  {isPremium && subscriptionData.amount && (
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">${subscriptionData.amount}</p>
                      <p className="text-sm text-gray-500">/month</p>
                    </div>
                  )}
                </div>

                {isPremium ? (
                  <div className="space-y-3">
                    {subscriptionData.nextBilling && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Next billing date:</span>
                        <span className="font-medium">{new Date(subscriptionData.nextBilling).toLocaleDateString()}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Status:</span>
                      <span className="font-medium capitalize">{subscriptionData.status}</span>
                    </div>
                    <div className="pt-3 border-t flex gap-3">
                      <button
                        onClick={() => navigate('/membership')}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
                      >
                        Change Plan
                      </button>
                      <button className="flex-1 px-4 py-2 text-red-600 border border-red-300 rounded-lg font-medium hover:bg-red-50 transition-colors">
                        Cancel Subscription
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p className="text-gray-600">
                      Unlock intelligent AI assessments, interactive tools, and personalized recommendations.
                    </p>
                    <div className="flex gap-3">
                      <button
                        onClick={() => navigate('/membership')}
                        className="flex-1 px-6 py-3 rounded-lg text-white font-medium transition-all hover:shadow-lg"
                        style={{ backgroundColor: colors.chestnut }}
                      >
                        Start 3-Day Free Trial
                      </button>
                      <button
                        onClick={() => navigate('/why-ai-now')}
                        className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                      >
                        Learn More
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Usage Statistics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">Assessments</h4>
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{subscriptionData.assessmentsCompleted}</p>
                  <p className="text-sm text-blue-700">Completed</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">Projects</h4>
                    <Archive className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-green-600">{subscriptionData.activeProjects}</p>
                  <p className="text-sm text-green-700">Active</p>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">Plan Limit</h4>
                    <Eye className="w-5 h-5 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-purple-600">
                    {isPremium ? '∞' : '5'}
                  </p>
                  <p className="text-sm text-purple-700">
                    {isPremium ? 'Unlimited' : 'Per month'}
                  </p>
                </div>
              </div>

              {/* Billing History */}
              {isPremium && (
                <div className="border rounded-lg p-6">
                  <h4 className="font-semibold text-gray-900 mb-4">Recent Billing History</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <div>
                        <p className="font-medium text-gray-900">Premium Subscription</p>
                        <p className="text-sm text-gray-500">Dec 15, 2024</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900">${subscriptionData.amount}</p>
                        <p className="text-sm text-green-600">Paid</p>
                      </div>
                    </div>
                    <div className="text-center pt-3">
                      <button className="text-sm text-gray-500 hover:text-gray-700 font-medium">
                        View All History
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 'archives':
        return (
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-semibold" style={{ color: colors.charcoal }}>
                  Your Projects
                </h3>
                <p className="text-gray-600 mt-1">View and manage your AI assessment projects</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-chestnut to-khaki rounded-full flex items-center justify-center">
                <Archive className="w-8 h-8 text-white" />
              </div>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:border-chestnut transition-colors">
                  <Archive className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h4 className="font-semibold text-gray-900 mb-2">No Projects Yet</h4>
                  <p className="text-gray-600 mb-4">
                    Complete an AI assessment to create your first project
                  </p>
                  <button
                    onClick={() => navigate('/tools/ai-knowledge-navigator')}
                    className="px-6 py-3 rounded-lg text-white font-medium transition-all hover:shadow-lg"
                    style={{ backgroundColor: colors.chestnut }}
                  >
                    Start Assessment
                  </button>
                </div>
                
                <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                  <h4 className="font-semibold text-gray-900 mb-4">What You'll Find Here</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-start">
                      <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      Assessment results and analyses
                    </li>
                    <li className="flex items-start">
                      <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      Generated action items and recommendations
                    </li>
                    <li className="flex items-start">
                      <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      Progress tracking and timeline
                    </li>
                    <li className="flex items-start">
                      <Check className="w-4 h-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                      Learning path and resources
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        );

      case 'preferences':
        return (
          <div className="bg-white rounded-lg shadow-sm border p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-semibold" style={{ color: colors.charcoal }}>
                  Account Preferences
                </h3>
                <p className="text-gray-600 mt-1">Customize your notifications and display settings</p>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-chestnut to-khaki rounded-full flex items-center justify-center">
                <Settings className="w-8 h-8 text-white" />
              </div>
            </div>

            <div className="space-y-8">
              {/* Email Notifications */}
              <div className="border rounded-lg p-6">
                <div className="flex items-center mb-6">
                  <Bell className="w-5 h-5 text-gray-600 mr-3" />
                  <h4 className="font-semibold text-gray-900">Email Notifications</h4>
                </div>
                <div className="space-y-4">
                  {[
                    { key: 'assessmentReminders', label: 'Assessment reminders and follow-ups', description: 'Get reminded to complete or review your assessments' },
                    { key: 'projectUpdates', label: 'Project updates and progress', description: 'Notifications about your AI implementation projects' },
                    { key: 'newFeatures', label: 'New features and updates', description: 'Be the first to know about new tools and capabilities' },
                    { key: 'marketingEmails', label: 'Tips, case studies, and newsletters', description: 'Educational content and success stories' }
                  ].map((item) => (
                    <div key={item.key} className="flex items-start space-x-3">
                      <label className="relative inline-flex items-center cursor-pointer mt-1">
                        <input
                          type="checkbox"
                          checked={preferences.emailNotifications[item.key]}
                          onChange={(e) => {
                            const newPreferences = {
                              ...preferences,
                              emailNotifications: {
                                ...preferences.emailNotifications,
                                [item.key]: e.target.checked
                              }
                            };
                            setPreferences(newPreferences);
                            handlePreferencesUpdate(newPreferences);
                          }}
                          className="sr-only"
                        />
                        <div className={`w-11 h-6 rounded-full transition-colors ${
                          preferences.emailNotifications[item.key] ? 'bg-chestnut' : 'bg-gray-200'
                        }`}>
                          <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                            preferences.emailNotifications[item.key] ? 'translate-x-5' : 'translate-x-0'
                          } mt-0.5 ml-0.5 shadow`}></div>
                        </div>
                      </label>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.label}</p>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Display Preferences */}
              <div className="border rounded-lg p-6">
                <div className="flex items-center mb-6">
                  <Eye className="w-5 h-5 text-gray-600 mr-3" />
                  <h4 className="font-semibold text-gray-900">Display Preferences</h4>
                </div>
                <div className="space-y-4">
                  {[
                    { key: 'showTooltips', label: 'Show helpful tooltips', description: 'Display contextual help throughout the application' },
                    { key: 'compactMode', label: 'Compact mode', description: 'Use a more condensed layout to fit more content' }
                  ].map((item) => (
                    <div key={item.key} className="flex items-start space-x-3">
                      <label className="relative inline-flex items-center cursor-pointer mt-1">
                        <input
                          type="checkbox"
                          checked={preferences.displayPreferences[item.key]}
                          onChange={(e) => {
                            const newPreferences = {
                              ...preferences,
                              displayPreferences: {
                                ...preferences.displayPreferences,
                                [item.key]: e.target.checked
                              }
                            };
                            setPreferences(newPreferences);
                            handlePreferencesUpdate(newPreferences);
                          }}
                          className="sr-only"
                        />
                        <div className={`w-11 h-6 rounded-full transition-colors ${
                          preferences.displayPreferences[item.key] ? 'bg-chestnut' : 'bg-gray-200'
                        }`}>
                          <div className={`w-5 h-5 rounded-full bg-white transition-transform ${
                            preferences.displayPreferences[item.key] ? 'translate-x-5' : 'translate-x-0'
                          } mt-0.5 ml-0.5 shadow`}></div>
                        </div>
                      </label>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.label}</p>
                        <p className="text-sm text-gray-600">{item.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Coming Soon:</strong> Dark mode, custom themes, and advanced display options
                  </p>
                </div>
              </div>

              {/* Account Security */}
              <div className="border rounded-lg p-6">
                <div className="flex items-center mb-6">
                  <Shield className="w-5 h-5 text-gray-600 mr-3" />
                  <h4 className="font-semibold text-gray-900">Account Security</h4>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Password</p>
                      <p className="text-sm text-gray-600">Last updated: Never</p>
                    </div>
                    <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                      Change Password
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                      <p className="text-sm text-gray-600">Add an extra layer of security</p>
                    </div>
                    <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                      Enable 2FA
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {showSuccess && (
              <div className={`mt-6 p-4 rounded-lg flex items-center ${
                showSuccess.includes('Error') 
                  ? 'bg-red-50 border border-red-200 text-red-700'
                  : 'bg-green-50 border border-green-200 text-green-700'
              }`}>
                {showSuccess.includes('Error') ? (
                  <AlertCircle className="w-5 h-5 mr-3" />
                ) : (
                  <Check className="w-5 h-5 mr-3" />
                )}
                {showSuccess}
              </div>
            )}
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