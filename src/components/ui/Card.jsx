import React from 'react';
import { components } from '../../styles/theme';

/**
 * Centralized Card component using theme tokens
 * Provides consistent card styling across the app
 */
const Card = ({
  children,
  variant = 'base',
  padding = 'default',
  className = '',
  onClick,
  ...props
}) => {
  const getCardClasses = () => {
    let baseClasses = 'bg-white rounded-xl border border-gray-200';
    
    // Variant styles
    switch (variant) {
      case 'interactive':
        baseClasses += ' shadow-sm hover:shadow-md transition-shadow cursor-pointer';
        break;
      case 'elevated':
        baseClasses += ' shadow-lg';
        break;
      default:
        baseClasses += ' shadow-sm';
    }

    // Padding variations
    switch (padding) {
      case 'none':
        // No padding
        break;
      case 'small':
        baseClasses += ' p-4';
        break;
      case 'large':
        baseClasses += ' p-8';
        break;
      default:
        baseClasses += ' p-6';
    }

    return `${baseClasses} ${className}`;
  };

  const CardComponent = onClick ? 'button' : 'div';

  return (
    <CardComponent
      className={getCardClasses()}
      onClick={onClick}
      {...props}
    >
      {children}
    </CardComponent>
  );
};

// Card sub-components for better composition
Card.Header = ({ children, className = '', ...props }) => (
  <div className={`border-b border-gray-200 pb-4 mb-4 ${className}`} {...props}>
    {children}
  </div>
);

Card.Body = ({ children, className = '', ...props }) => (
  <div className={className} {...props}>
    {children}
  </div>
);

Card.Footer = ({ children, className = '', ...props }) => (
  <div className={`border-t border-gray-200 pt-4 mt-4 ${className}`} {...props}>
    {children}
  </div>
);

export default Card;