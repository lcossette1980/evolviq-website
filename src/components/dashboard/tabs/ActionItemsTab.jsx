import React from 'react';
import { CheckCircle, Clock, Filter, Search, MoreHorizontal } from 'lucide-react';
import { useDashboardStore } from '../../../store/dashboardStore';
import { colors } from '../../../utils/colors';

/**
 * Action Items Tab Component
 * Displays and manages user action items from assessments
 */
const ActionItemsTab = () => {
  const { 
    actionItems, 
    actionItemAnalytics,
    expandedActionItems,
    toggleExpandedActionItem,
    getPendingActionItems,
    getInProgressActionItems
  } = useDashboardStore();

  const pendingItems = getPendingActionItems();
  const inProgressItems = getInProgressActionItems();
  const completedItems = actionItems.filter(item => item.status === 'completed');

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const renderActionItem = (item) => {
    const isExpanded = expandedActionItems.has(item.id);
    
    return (
      <div key={item.id} className="border rounded-lg p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <h4 className="font-medium text-gray-900">{item.title}</h4>
              <span className={`px-2 py-1 text-xs rounded-full ${getPriorityColor(item.priority)}`}>
                {item.priority}
              </span>
              <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(item.status)}`}>
                {item.status.replace('_', ' ')}
              </span>
            </div>
            
            <p className="text-sm text-gray-600 mb-2">{item.description}</p>
            
            <div className="flex items-center space-x-4 text-xs text-gray-500">
              <span>Category: {item.category}</span>
              <span>Source: {item.source}</span>
              {item.estimatedTime && <span>Est. Time: {item.estimatedTime}</span>}
            </div>
            
            {isExpanded && item.resources && item.resources.length > 0 && (
              <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                <h5 className="text-sm font-medium mb-2">Resources:</h5>
                <ul className="text-sm text-gray-600 space-y-1">
                  {item.resources.map((resource, index) => (
                    <li key={index}>• {resource}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2 ml-4">
            <button
              onClick={() => toggleExpandedActionItem(item.id)}
              className="p-1 text-gray-400 hover:text-gray-600"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Analytics Overview */}
      {actionItemAnalytics && (
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold mb-4" style={{ color: colors.charcoal }}>
            Action Items Overview
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: colors.chestnut }}>
                {actionItems.length}
              </div>
              <div className="text-sm text-gray-500">Total Items</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: colors.navy }}>
                {pendingItems.length}
              </div>
              <div className="text-sm text-gray-500">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: colors.khaki }}>
                {inProgressItems.length}
              </div>
              <div className="text-sm text-gray-500">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {completedItems.length}
              </div>
              <div className="text-sm text-gray-500">Completed</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold" style={{ color: colors.charcoal }}>
            Action Items
          </h3>
          <div className="flex items-center space-x-2">
            <button className="flex items-center px-3 py-2 text-sm border rounded-lg hover:bg-gray-50">
              <Filter className="w-4 h-4 mr-2" />
              Filter
            </button>
            <button className="flex items-center px-3 py-2 text-sm border rounded-lg hover:bg-gray-50">
              <Search className="w-4 h-4 mr-2" />
              Search
            </button>
          </div>
        </div>
        
        {actionItems.length > 0 ? (
          <div className="space-y-4">
            {/* High Priority Items */}
            {pendingItems.filter(item => item.priority === 'high').length > 0 && (
              <div>
                <h4 className="font-medium text-red-700 mb-3 flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  High Priority ({pendingItems.filter(item => item.priority === 'high').length})
                </h4>
                <div className="space-y-3">
                  {pendingItems
                    .filter(item => item.priority === 'high')
                    .map(renderActionItem)}
                </div>
              </div>
            )}
            
            {/* In Progress Items */}
            {inProgressItems.length > 0 && (
              <div>
                <h4 className="font-medium text-blue-700 mb-3 flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  In Progress ({inProgressItems.length})
                </h4>
                <div className="space-y-3">
                  {inProgressItems.map(renderActionItem)}
                </div>
              </div>
            )}
            
            {/* Other Pending Items */}
            {pendingItems.filter(item => item.priority !== 'high').length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-3 flex items-center">
                  <Clock className="w-4 h-4 mr-2" />
                  Other Pending ({pendingItems.filter(item => item.priority !== 'high').length})
                </h4>
                <div className="space-y-3">
                  {pendingItems
                    .filter(item => item.priority !== 'high')
                    .map(renderActionItem)}
                </div>
              </div>
            )}
            
            {/* Completed Items */}
            {completedItems.length > 0 && (
              <div>
                <h4 className="font-medium text-green-700 mb-3 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Completed ({completedItems.length})
                </h4>
                <div className="space-y-3">
                  {completedItems.slice(0, 5).map(renderActionItem)}
                </div>
                {completedItems.length > 5 && (
                  <button className="text-sm text-gray-500 hover:text-gray-700 mt-2">
                    Show {completedItems.length - 5} more completed items
                  </button>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500">No action items yet.</p>
            <p className="text-sm text-gray-400 mt-1">
              Complete an assessment to generate personalized action items.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActionItemsTab;