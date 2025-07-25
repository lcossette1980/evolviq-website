import React from 'react';
import { X } from 'lucide-react';

/**
 * Reusable admin modal component
 * Provides consistent modal styling and behavior across admin modules
 */
const AdminModal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'medium',
  loading = false,
  primaryAction,
  secondaryAction,
  showCloseButton = true,
  closeOnOverlayClick = true
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    small: 'max-w-md',
    medium: 'max-w-lg',
    large: 'max-w-2xl',
    xlarge: 'max-w-4xl'
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && closeOnOverlayClick) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
    >
      <div className={`bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]} max-h-[90vh] flex flex-col`}>
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            {title && (
              <h3 className="text-lg font-semibold text-charcoal">{title}</h3>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={loading}
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {children}
        </div>

        {/* Footer Actions */}
        {(primaryAction || secondaryAction) && (
          <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
            {secondaryAction && (
              <button
                onClick={secondaryAction.onClick}
                disabled={loading}
                className={`px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50 ${
                  secondaryAction.className || ''
                }`}
              >
                {secondaryAction.label}
              </button>
            )}
            {primaryAction && (
              <button
                onClick={primaryAction.onClick}
                disabled={loading || primaryAction.disabled}
                className={`px-4 py-2 rounded-lg transition-colors disabled:opacity-50 flex items-center ${
                  primaryAction.variant === 'danger' 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-chestnut hover:bg-chestnut/90 text-white'
                } ${primaryAction.className || ''}`}
              >
                {loading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                )}
                {primaryAction.label}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminModal;