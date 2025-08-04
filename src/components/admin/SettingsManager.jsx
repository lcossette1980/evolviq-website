import React, { useState, useEffect } from 'react';
import {
  Settings,
  Database,
  Shield,
  Bell,
  Server,
  Zap,
  AlertCircle,
  CheckCircle,
  Save,
  RefreshCw,
  Eye,
  EyeOff,
  Download
} from 'lucide-react';
import StatsCard from './StatsCard';
import { 
  getStoredData, 
  setStoredData, 
  formatDateTime 
} from '../../utils/secureAdminHelpers';

/**
 * Settings Management Module
 * System configuration, API management, and admin tools
 */
const SettingsManager = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const tabs = [
    { id: 'general', label: 'General', icon: <Settings className="w-4 h-4" /> },
    { id: 'integrations', label: 'Integrations', icon: <Zap className="w-4 h-4" /> },
    { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
    { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> },
    { id: 'maintenance', label: 'Maintenance', icon: <Database className="w-4 h-4" /> }
  ];

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = () => {
    setLoading(true);
    try {
      const storedSettings = getStoredData('admin_settings');
      const defaultSettings = {
        general: {
          siteName: 'EvolvIQ',
          siteDescription: 'AI Transformation Platform',
          supportEmail: 'support@evolviq.com',
          maintenanceMode: false,
          allowRegistration: true,
          requireEmailVerification: true
        },
        integrations: {
          stripePublishableKey: '',
          stripeSecretKey: '',
          openaiApiKey: '',
          emailServiceProvider: 'sendgrid',
          emailApiKey: '',
          analyticsId: '',
          chatbotEnabled: true
        },
        notifications: {
          emailNotifications: true,
          userRegistration: true,
          paymentAlerts: true,
          systemAlerts: true,
          weeklyReports: true,
          adminEmailFrequency: 'daily'
        },
        security: {
          twoFactorAuth: false,
          sessionTimeout: 30,
          passwordComplexity: 'medium',
          rateLimiting: true,
          ipWhitelist: [],
          failedLoginAttempts: 5
        },
        maintenance: {
          backupFrequency: 'daily',
          lastBackup: null,
          databaseOptimization: 'weekly',
          logRetention: 30,
          cacheClearing: 'auto'
        }
      };

      const mergedSettings = {
        ...defaultSettings,
        ...storedSettings
      };

      setSettings(mergedSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
      setMessage({ type: 'error', text: 'Failed to load settings' });
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (section, updatedSettings) => {
    setSaving(true);
    try {
      const newSettings = {
        ...settings,
        [section]: updatedSettings
      };
      
      const success = setStoredData('admin_settings', newSettings);
      
      if (success) {
        setSettings(newSettings);
        setMessage({ type: 'success', text: 'Settings saved successfully' });
      } else {
        setMessage({ type: 'error', text: 'Failed to save settings' });
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Message Display */}
      {message.text && (
        <div className={`p-4 rounded-lg flex items-center ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.type === 'success' ? 
            <CheckCircle className="w-5 h-5 mr-2" /> : 
            <AlertCircle className="w-5 h-5 mr-2" />
          }
          {message.text}
          <button 
            onClick={() => setMessage({ type: '', text: '' })}
            className="ml-auto"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      )}

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
      {activeTab === 'general' && (
        <GeneralSettings 
          settings={settings.general || {}} 
          onSave={(newSettings) => saveSettings('general', newSettings)}
          loading={loading}
          saving={saving}
        />
      )}
      {activeTab === 'integrations' && (
        <IntegrationsSettings 
          settings={settings.integrations || {}} 
          onSave={(newSettings) => saveSettings('integrations', newSettings)}
          loading={loading}
          saving={saving}
        />
      )}
      {activeTab === 'notifications' && (
        <NotificationsSettings 
          settings={settings.notifications || {}} 
          onSave={(newSettings) => saveSettings('notifications', newSettings)}
          loading={loading}
          saving={saving}
        />
      )}
      {activeTab === 'security' && (
        <SecuritySettings 
          settings={settings.security || {}} 
          onSave={(newSettings) => saveSettings('security', newSettings)}
          loading={loading}
          saving={saving}
        />
      )}
      {activeTab === 'maintenance' && (
        <MaintenanceSettings 
          settings={settings.maintenance || {}} 
          onSave={(newSettings) => saveSettings('maintenance', newSettings)}
          loading={loading}
          saving={saving}
        />
      )}
    </div>
  );
};

// General Settings Component
const GeneralSettings = ({ settings, onSave, loading, saving }) => {
  const [formData, setFormData] = useState(settings);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (loading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      <div className="h-10 bg-gray-200 rounded"></div>
    </div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-charcoal mb-4">Site Configuration</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Site Name</label>
            <input
              type="text"
              value={formData.siteName || ''}
              onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chestnut focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Site Description</label>
            <textarea
              value={formData.siteDescription || ''}
              onChange={(e) => setFormData({ ...formData, siteDescription: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chestnut focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Support Email</label>
            <input
              type="email"
              value={formData.supportEmail || ''}
              onChange={(e) => setFormData({ ...formData, supportEmail: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chestnut focus:border-transparent"
            />
          </div>

          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.maintenanceMode || false}
                onChange={(e) => setFormData({ ...formData, maintenanceMode: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Maintenance Mode</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.allowRegistration !== false}
                onChange={(e) => setFormData({ ...formData, allowRegistration: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Allow User Registration</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={formData.requireEmailVerification !== false}
                onChange={(e) => setFormData({ ...formData, requireEmailVerification: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Require Email Verification</span>
            </label>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-chestnut text-white rounded-lg hover:bg-chestnut/90 transition-colors disabled:opacity-50 flex items-center"
          >
            {saving && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </button>
        </div>
      </div>
    </form>
  );
};

// Integrations Settings Component
const IntegrationsSettings = ({ settings, onSave, loading, saving }) => {
  const [formData, setFormData] = useState(settings);
  const [showKeys, setShowKeys] = useState({});

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const toggleKeyVisibility = (key) => {
    setShowKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const maskValue = (value, show) => {
    if (!value) return '';
    return show ? value : '*'.repeat(Math.min(value.length, 20));
  };

  if (loading) {
    return <div className="animate-pulse space-y-4">
      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
      <div className="h-10 bg-gray-200 rounded"></div>
    </div>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-charcoal mb-4">API Integrations</h3>
        
        <div className="space-y-6">
          {/* Stripe */}
          <div className="border-b pb-4">
            <h4 className="font-medium text-charcoal mb-3">Stripe (Payments)</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Publishable Key</label>
                <div className="relative">
                  <input
                    type={showKeys.stripePublishable ? 'text' : 'password'}
                    value={maskValue(formData.stripePublishableKey, showKeys.stripePublishable)}
                    onChange={(e) => setFormData({ ...formData, stripePublishableKey: e.target.value })}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chestnut focus:border-transparent"
                    placeholder="pk_test_..."
                  />
                  <button
                    type="button"
                    onClick={() => toggleKeyVisibility('stripePublishable')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showKeys.stripePublishable ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Secret Key</label>
                <div className="relative">
                  <input
                    type={showKeys.stripeSecret ? 'text' : 'password'}
                    value={maskValue(formData.stripeSecretKey, showKeys.stripeSecret)}
                    onChange={(e) => setFormData({ ...formData, stripeSecretKey: e.target.value })}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chestnut focus:border-transparent"
                    placeholder="sk_test_..."
                  />
                  <button
                    type="button"
                    onClick={() => toggleKeyVisibility('stripeSecret')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showKeys.stripeSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* OpenAI */}
          <div className="border-b pb-4">
            <h4 className="font-medium text-charcoal mb-3">OpenAI (AI Services)</h4>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
              <div className="relative">
                <input
                  type={showKeys.openai ? 'text' : 'password'}
                  value={maskValue(formData.openaiApiKey, showKeys.openai)}
                  onChange={(e) => setFormData({ ...formData, openaiApiKey: e.target.value })}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chestnut focus:border-transparent"
                  placeholder="sk-..."
                />
                <button
                  type="button"
                  onClick={() => toggleKeyVisibility('openai')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  {showKeys.openai ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Email Service */}
          <div className="border-b pb-4">
            <h4 className="font-medium text-charcoal mb-3">Email Service</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                <select
                  value={formData.emailServiceProvider || 'sendgrid'}
                  onChange={(e) => setFormData({ ...formData, emailServiceProvider: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chestnut focus:border-transparent"
                >
                  <option value="sendgrid">SendGrid</option>
                  <option value="mailgun">Mailgun</option>
                  <option value="ses">Amazon SES</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
                <div className="relative">
                  <input
                    type={showKeys.email ? 'text' : 'password'}
                    value={maskValue(formData.emailApiKey, showKeys.email)}
                    onChange={(e) => setFormData({ ...formData, emailApiKey: e.target.value })}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chestnut focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => toggleKeyVisibility('email')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2"
                  >
                    {showKeys.email ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Other Settings */}
          <div>
            <h4 className="font-medium text-charcoal mb-3">Other Integrations</h4>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Analytics ID</label>
                <input
                  type="text"
                  value={formData.analyticsId || ''}
                  onChange={(e) => setFormData({ ...formData, analyticsId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chestnut focus:border-transparent"
                  placeholder="GA4 Measurement ID"
                />
              </div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.chatbotEnabled !== false}
                  onChange={(e) => setFormData({ ...formData, chatbotEnabled: e.target.checked })}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Enable AI Chatbot</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-chestnut text-white rounded-lg hover:bg-chestnut/90 transition-colors disabled:opacity-50 flex items-center"
          >
            {saving && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
            <Save className="w-4 h-4 mr-2" />
            Save Integrations
          </button>
        </div>
      </div>
    </form>
  );
};

// Notifications Settings Component
const NotificationsSettings = ({ settings, onSave, loading, saving }) => {
  const [formData, setFormData] = useState(settings);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (loading) return <div className="animate-pulse h-40 bg-gray-200 rounded"></div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-charcoal mb-4">Notification Preferences</h3>
        
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Email Notifications</span>
            <input
              type="checkbox"
              checked={formData.emailNotifications !== false}
              onChange={(e) => setFormData({ ...formData, emailNotifications: e.target.checked })}
              className="ml-2"
            />
          </label>

          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-700">User Registration Alerts</span>
            <input
              type="checkbox"
              checked={formData.userRegistration !== false}
              onChange={(e) => setFormData({ ...formData, userRegistration: e.target.checked })}
              className="ml-2"
            />
          </label>

          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Payment Alerts</span>
            <input
              type="checkbox"
              checked={formData.paymentAlerts !== false}
              onChange={(e) => setFormData({ ...formData, paymentAlerts: e.target.checked })}
              className="ml-2"
            />
          </label>

          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-700">System Alerts</span>
            <input
              type="checkbox"
              checked={formData.systemAlerts !== false}
              onChange={(e) => setFormData({ ...formData, systemAlerts: e.target.checked })}
              className="ml-2"
            />
          </label>

          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Weekly Reports</span>
            <input
              type="checkbox"
              checked={formData.weeklyReports !== false}
              onChange={(e) => setFormData({ ...formData, weeklyReports: e.target.checked })}
              className="ml-2"
            />
          </label>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email Frequency</label>
            <select
              value={formData.adminEmailFrequency || 'daily'}
              onChange={(e) => setFormData({ ...formData, adminEmailFrequency: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chestnut focus:border-transparent"
            >
              <option value="immediate">Immediate</option>
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-chestnut text-white rounded-lg hover:bg-chestnut/90 transition-colors disabled:opacity-50 flex items-center"
          >
            {saving && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
            <Save className="w-4 h-4 mr-2" />
            Save Notifications
          </button>
        </div>
      </div>
    </form>
  );
};

// Security Settings Component
const SecuritySettings = ({ settings, onSave, loading, saving }) => {
  const [formData, setFormData] = useState(settings);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  if (loading) return <div className="animate-pulse h-40 bg-gray-200 rounded"></div>;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-charcoal mb-4">Security Configuration</h3>
        
        <div className="space-y-4">
          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Two-Factor Authentication</span>
            <input
              type="checkbox"
              checked={formData.twoFactorAuth || false}
              onChange={(e) => setFormData({ ...formData, twoFactorAuth: e.target.checked })}
              className="ml-2"
            />
          </label>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Session Timeout (minutes)</label>
            <input
              type="number"
              value={formData.sessionTimeout || 30}
              onChange={(e) => setFormData({ ...formData, sessionTimeout: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chestnut focus:border-transparent"
              min="5"
              max="1440"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password Complexity</label>
            <select
              value={formData.passwordComplexity || 'medium'}
              onChange={(e) => setFormData({ ...formData, passwordComplexity: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chestnut focus:border-transparent"
            >
              <option value="low">Low (8+ characters)</option>
              <option value="medium">Medium (8+ chars, mixed case)</option>
              <option value="high">High (12+ chars, mixed case, numbers, symbols)</option>
            </select>
          </div>

          <label className="flex items-center justify-between">
            <span className="text-sm text-gray-700">Rate Limiting</span>
            <input
              type="checkbox"
              checked={formData.rateLimiting !== false}
              onChange={(e) => setFormData({ ...formData, rateLimiting: e.target.checked })}
              className="ml-2"
            />
          </label>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Failed Login Attempts Limit</label>
            <input
              type="number"
              value={formData.failedLoginAttempts || 5}
              onChange={(e) => setFormData({ ...formData, failedLoginAttempts: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chestnut focus:border-transparent"
              min="3"
              max="20"
            />
          </div>
        </div>

        <div className="flex justify-end mt-6">
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-chestnut text-white rounded-lg hover:bg-chestnut/90 transition-colors disabled:opacity-50 flex items-center"
          >
            {saving && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
            <Save className="w-4 h-4 mr-2" />
            Save Security Settings
          </button>
        </div>
      </div>
    </form>
  );
};

// Maintenance Settings Component
const MaintenanceSettings = ({ settings, onSave, loading, saving }) => {
  const [formData, setFormData] = useState(settings);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleBackupNow = () => {
    // Simulate backup process
    const newSettings = {
      ...formData,
      lastBackup: new Date().toISOString()
    };
    setFormData(newSettings);
    onSave(newSettings);
  };

  if (loading) return <div className="animate-pulse h-40 bg-gray-200 rounded"></div>;

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit}>
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-lg font-semibold text-charcoal mb-4">Maintenance Configuration</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Backup Frequency</label>
              <select
                value={formData.backupFrequency || 'daily'}
                onChange={(e) => setFormData({ ...formData, backupFrequency: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chestnut focus:border-transparent"
              >
                <option value="hourly">Hourly</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Database Optimization</label>
              <select
                value={formData.databaseOptimization || 'weekly'}
                onChange={(e) => setFormData({ ...formData, databaseOptimization: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chestnut focus:border-transparent"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Log Retention (days)</label>
              <input
                type="number"
                value={formData.logRetention || 30}
                onChange={(e) => setFormData({ ...formData, logRetention: parseInt(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chestnut focus:border-transparent"
                min="7"
                max="365"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cache Clearing</label>
              <select
                value={formData.cacheClearing || 'auto'}
                onChange={(e) => setFormData({ ...formData, cacheClearing: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chestnut focus:border-transparent"
              >
                <option value="auto">Automatic</option>
                <option value="manual">Manual Only</option>
                <option value="scheduled">Scheduled</option>
              </select>
            </div>

            {formData.lastBackup && (
              <div className="text-sm text-gray-600">
                Last backup: {formatDateTime(formData.lastBackup)}
              </div>
            )}
          </div>

          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={handleBackupNow}
              className="px-4 py-2 border border-chestnut text-chestnut rounded-lg hover:bg-chestnut/10 transition-colors flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Backup Now
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-chestnut text-white rounded-lg hover:bg-chestnut/90 transition-colors disabled:opacity-50 flex items-center"
            >
              {saving && <RefreshCw className="w-4 h-4 mr-2 animate-spin" />}
              <Save className="w-4 h-4 mr-2" />
              Save Maintenance Settings
            </button>
          </div>
        </div>
      </form>

      {/* System Status */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-charcoal mb-4">System Status</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <StatsCard
            title="Server Status"
            value="Online"
            icon={Server}
            color="green"
          />
          <StatsCard
            title="Database Status"
            value="Connected"
            icon={Database}
            color="green"
          />
          <StatsCard
            title="Cache Status"
            value="Active"
            icon={Zap}
            color="blue"
          />
        </div>
      </div>
    </div>
  );
};

export default SettingsManager;