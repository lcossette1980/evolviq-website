import React from 'react';
import { components } from '../../styles/theme';

/**
 * Centralized Button component using theme tokens
 * Replaces inconsistent button styling across the app
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  className = '',
  icon: Icon,
  iconPosition = 'left',
  ...props
}) => {
  const getButtonClasses = () => {
    let baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation';
    
    // Size variations
    if (size === 'small') {
      baseClasses += ' px-4 py-2 text-sm rounded-md min-h-[36px]';
    } else if (size === 'large') {
      baseClasses += ' px-8 py-4 text-lg rounded-lg min-h-[52px]';
    } else {
      baseClasses += ' px-6 py-3 rounded-lg min-h-[44px]';
    }

    // Variant styles
    switch (variant) {
      case 'primary':
        baseClasses += ' bg-chestnut text-white hover:bg-chestnut/90 shadow-sm hover:shadow-md';
        break;
      case 'secondary':
        baseClasses += ' border-2 border-chestnut text-chestnut hover:bg-chestnut hover:text-white';
        break;
      case 'tertiary':
        baseClasses += ' text-chestnut hover:bg-chestnut/5';
        break;
      case 'danger':
        baseClasses += ' bg-red-500 text-white hover:bg-red-600 shadow-sm hover:shadow-md';
        break;
      case 'ghost':
        baseClasses += ' text-gray-700 hover:bg-gray-100';
        break;
      default:
        baseClasses += ' bg-chestnut text-white hover:bg-chestnut/90 shadow-sm hover:shadow-md';
    }

    return `${baseClasses} ${className}`;
  };

  return (
    <button
      className={getButtonClasses()}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      
      {Icon && iconPosition === 'left' && !loading && (
        <Icon className="w-4 h-4 mr-2" />
      )}
      
      {children}
      
      {Icon && iconPosition === 'right' && !loading && (
        <Icon className="w-4 h-4 ml-2" />
      )}
    </button>
  );
};

export default Button;