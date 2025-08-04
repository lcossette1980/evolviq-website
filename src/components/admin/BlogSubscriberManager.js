import React, { useState, useEffect, useCallback } from 'react';
import { 
  Mail, 
  Plus, 
  Search, 
  Download, 
  Edit3, 
  Trash2, 
  X,
  Check,
  AlertCircle,
  Users
} from 'lucide-react';
import { 
  getStoredData, 
  setStoredData, 
  addToStoredData, 
  removeFromStoredData, 
  updateStoredData,
  exportToCSV,
  validateEmail,
  formatDate
} from '../../utils/secureAdminHelpers';

const BlogSubscriberManager = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [filteredSubscribers, setFilteredSubscribers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingSubscriber, setEditingSubscriber] = useState(null);
  const [newSubscriber, setNewSubscriber] = useState({ email: '', source: 'manual' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    loadSubscribers();
  }, []);

  useEffect(() => {
    filterSubscribers();
  }, [subscribers, searchTerm, statusFilter]);

  const loadSubscribers = () => {
    const stored = getStoredData('blog_subscribers');
    
    // Add some demo data if none exists
    if (stored.length === 0) {
      const demoSubscribers = [
        {
          id: '1',
          email: 'john.doe@company.com',
          status: 'active',
          source: 'website',
          subscribedAt: '2024-01-15T10:30:00Z',
          lastEmailSent: '2024-01-20T09:00:00Z',
          engagementScore: 85
        },
        {
          id: '2',
          email: 'sarah.wilson@nonprofit.org',
          status: 'active',
          source: 'newsletter_signup',
          subscribedAt: '2024-01-14T14:22:00Z',
          lastEmailSent: '2024-01-20T09:00:00Z',
          engagementScore: 92
        },
        {
          id: '3',
          email: 'mike.johnson@startup.io',
          status: 'unsubscribed',
          source: 'website',
          subscribedAt: '2024-01-13T16:45:00Z',
          unsubscribedAt: '2024-01-18T11:30:00Z',
          engagementScore: 45
        }
      ];
      setStoredData('blog_subscribers', demoSubscribers);
      setSubscribers(demoSubscribers);
    } else {
      setSubscribers(stored);
    }
  };

  const filterSubscribers = useCallback(() => {
    let filtered = subscribers;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(sub => 
        sub.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.source.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(sub => sub.status === statusFilter);
    }

    setFilteredSubscribers(filtered);
  }, [subscribers, searchTerm, statusFilter]);

  const handleAddSubscriber = async () => {
    if (!validateEmail(newSubscriber.email)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' });
      return;
    }

    // Check if email already exists
    const exists = subscribers.some(sub => sub.email.toLowerCase() === newSubscriber.email.toLowerCase());
    if (exists) {
      setMessage({ type: 'error', text: 'This email is already subscribed' });
      return;
    }

    setLoading(true);
    
    const subscriberData = {
      email: newSubscriber.email,
      status: 'active',
      source: newSubscriber.source,
      subscribedAt: new Date().toISOString(),
      engagementScore: 0
    };

    const success = addToStoredData('blog_subscribers', subscriberData);
    
    if (success) {
      loadSubscribers();
      setIsAddModalOpen(false);
      setNewSubscriber({ email: '', source: 'manual' });
      setMessage({ type: 'success', text: 'Subscriber added successfully' });
    } else {
      setMessage({ type: 'error', text: 'Failed to add subscriber' });
    }
    
    setLoading(false);
  };

  const handleEditSubscriber = async () => {
    if (!editingSubscriber || !validateEmail(editingSubscriber.email)) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' });
      return;
    }

    setLoading(true);
    
    const success = updateStoredData('blog_subscribers', editingSubscriber.id, {
      email: editingSubscriber.email,
      status: editingSubscriber.status,
      source: editingSubscriber.source
    });

    if (success) {
      loadSubscribers();
      setIsEditModalOpen(false);
      setEditingSubscriber(null);
      setMessage({ type: 'success', text: 'Subscriber updated successfully' });
    } else {
      setMessage({ type: 'error', text: 'Failed to update subscriber' });
    }
    
    setLoading(false);
  };

  const handleDeleteSubscriber = (subscriberId) => {
    if (window.confirm('Are you sure you want to delete this subscriber?')) {
      const success = removeFromStoredData('blog_subscribers', subscriberId);
      
      if (success) {
        loadSubscribers();
        setMessage({ type: 'success', text: 'Subscriber deleted successfully' });
      } else {
        setMessage({ type: 'error', text: 'Failed to delete subscriber' });
      }
    }
  };

  const handleExport = () => {
    if (filteredSubscribers.length === 0) {
      setMessage({ type: 'error', text: 'No subscribers to export' });
      return;
    }

    const exportData = filteredSubscribers.map(sub => ({
      email: sub.email,
      status: sub.status,
      source: sub.source,
      subscribedAt: formatDate(sub.subscribedAt),
      engagementScore: sub.engagementScore || 0
    }));

    exportToCSV(exportData, 'blog_subscribers');
    setMessage({ type: 'success', text: 'Subscribers exported successfully' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'unsubscribed': return 'bg-red-100 text-red-800';
      case 'bounced': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const stats = {
    total: subscribers.length,
    active: subscribers.filter(s => s.status === 'active').length,
    unsubscribed: subscribers.filter(s => s.status === 'unsubscribed').length,
    averageEngagement: subscribers.length > 0 
      ? Math.round(subscribers.reduce((sum, s) => sum + (s.engagementScore || 0), 0) / subscribers.length)
      : 0
  };

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-chestnut mr-3" />
            <div>
              <p className="text-sm text-gray-600">Total Subscribers</p>
              <p className="text-2xl font-bold text-charcoal">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <Check className="w-8 h-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-charcoal">{stats.active}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <X className="w-8 h-8 text-red-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Unsubscribed</p>
              <p className="text-2xl font-bold text-charcoal">{stats.unsubscribed}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center">
            <Mail className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Avg. Engagement</p>
              <p className="text-2xl font-bold text-charcoal">{stats.averageEngagement}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Message Display */}
      {message.text && (
        <div className={`p-4 rounded-lg flex items-center ${
          message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {message.type === 'success' ? 
            <Check className="w-5 h-5 mr-2" /> : 
            <AlertCircle className="w-5 h-5 mr-2" />
          }
          {message.text}
          <button 
            onClick={() => setMessage({ type: '', text: '' })}
            className="ml-auto"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Controls */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search subscribers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chestnut focus:border-transparent"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chestnut focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="unsubscribed">Unsubscribed</option>
              <option value="bounced">Bounced</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleExport}
              className="px-4 py-2 border border-chestnut text-chestnut rounded-lg hover:bg-chestnut/10 transition-colors flex items-center"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-chestnut text-white rounded-lg hover:bg-chestnut/90 transition-colors flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Subscriber
            </button>
          </div>
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subscribed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Engagement
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSubscribers.map((subscriber) => (
                <tr key={subscriber.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-charcoal">{subscriber.email}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(subscriber.status)}`}>
                      {subscriber.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{subscriber.source}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{formatDate(subscriber.subscribedAt)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600">{subscriber.engagementScore || 0}%</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => {
                          setEditingSubscriber(subscriber);
                          setIsEditModalOpen(true);
                        }}
                        className="text-chestnut hover:text-chestnut/80"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteSubscriber(subscriber.id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSubscribers.length === 0 && (
          <div className="text-center py-12">
            <Mail className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No subscribers found</h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by adding your first subscriber'
              }
            </p>
          </div>
        )}
      </div>

      {/* Add Subscriber Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-charcoal mb-4">Add New Subscriber</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={newSubscriber.email}
                  onChange={(e) => setNewSubscriber({...newSubscriber, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chestnut focus:border-transparent"
                  placeholder="subscriber@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                <select
                  value={newSubscriber.source}
                  onChange={(e) => setNewSubscriber({...newSubscriber, source: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chestnut focus:border-transparent"
                >
                  <option value="manual">Manual Entry</option>
                  <option value="website">Website</option>
                  <option value="newsletter_signup">Newsletter Signup</option>
                  <option value="event">Event</option>
                  <option value="referral">Referral</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setNewSubscriber({ email: '', source: 'manual' });
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSubscriber}
                disabled={loading}
                className="px-4 py-2 bg-chestnut text-white rounded-lg hover:bg-chestnut/90 transition-colors disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Subscriber'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Subscriber Modal */}
      {isEditModalOpen && editingSubscriber && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-charcoal mb-4">Edit Subscriber</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={editingSubscriber.email}
                  onChange={(e) => setEditingSubscriber({...editingSubscriber, email: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chestnut focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={editingSubscriber.status}
                  onChange={(e) => setEditingSubscriber({...editingSubscriber, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chestnut focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="unsubscribed">Unsubscribed</option>
                  <option value="bounced">Bounced</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
                <select
                  value={editingSubscriber.source}
                  onChange={(e) => setEditingSubscriber({...editingSubscriber, source: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-chestnut focus:border-transparent"
                >
                  <option value="manual">Manual Entry</option>
                  <option value="website">Website</option>
                  <option value="newsletter_signup">Newsletter Signup</option>
                  <option value="event">Event</option>
                  <option value="referral">Referral</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingSubscriber(null);
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleEditSubscriber}
                disabled={loading}
                className="px-4 py-2 bg-chestnut text-white rounded-lg hover:bg-chestnut/90 transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BlogSubscriberManager;