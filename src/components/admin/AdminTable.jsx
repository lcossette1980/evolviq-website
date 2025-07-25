import React from 'react';
import { ChevronUp, ChevronDown, MoreHorizontal, Search } from 'lucide-react';

/**
 * Reusable admin table component with sorting, filtering, and pagination
 * Provides consistent table styling and behavior across admin modules
 */
const AdminTable = ({
  columns,
  data,
  loading = false,
  sortKey,
  sortDirection,
  onSort,
  searchTerm,
  onSearch,
  searchPlaceholder = "Search...",
  emptyStateTitle = "No data found",
  emptyStateDescription = "No data matches your current filters",
  emptyStateIcon: EmptyIcon,
  actions = [],
  onRowClick,
  className = ""
}) => {
  const handleSort = (key) => {
    if (onSort) {
      const newDirection = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
      onSort(key, newDirection);
    }
  };

  const renderSortIcon = (columnKey) => {
    if (sortKey !== columnKey) return null;
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4 ml-1" /> : 
      <ChevronDown className="w-4 h-4 ml-1" />;
  };

  const renderCell = (column, item, index) => {
    if (column.render) {
      return column.render(item, index);
    }
    
    const value = column.key.split('.').reduce((obj, key) => obj?.[key], item);
    return value || '-';
  };

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm ${className}`}>
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-chestnut mx-auto mb-4"></div>
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm overflow-hidden ${className}`}>
      {/* Search Header */}
      {onSearch && (
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchTerm}
              onChange={(e) => onSearch(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-chestnut focus:border-transparent"
            />
          </div>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                  onClick={column.sortable ? () => handleSort(column.key) : undefined}
                >
                  <div className="flex items-center">
                    {column.title}
                    {column.sortable && renderSortIcon(column.key)}
                  </div>
                </th>
              ))}
              {actions.length > 0 && (
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((item, index) => (
              <tr 
                key={item.id || index} 
                className={`hover:bg-gray-50 ${onRowClick ? 'cursor-pointer' : ''}`}
                onClick={() => onRowClick && onRowClick(item)}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap">
                    {renderCell(column, item, index)}
                  </td>
                ))}
                {actions.length > 0 && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end space-x-2">
                      {actions.map((action, actionIndex) => (
                        <button
                          key={actionIndex}
                          onClick={(e) => {
                            e.stopPropagation();
                            action.onClick(item);
                          }}
                          className={`p-1 rounded hover:bg-gray-100 ${action.className || ''}`}
                          title={action.title}
                        >
                          {action.icon}
                        </button>
                      ))}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Empty State */}
      {data.length === 0 && (
        <div className="text-center py-12">
          {EmptyIcon && <EmptyIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />}
          <h3 className="text-lg font-medium text-gray-900 mb-2">{emptyStateTitle}</h3>
          <p className="text-gray-600">{emptyStateDescription}</p>
        </div>
      )}
    </div>
  );
};

export default AdminTable;