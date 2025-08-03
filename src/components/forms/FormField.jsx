/**
 * Form Field Component with Validation Error Display
 * Provides consistent error handling and visual feedback
 */

import React from 'react';
import { AlertCircle } from 'lucide-react';

const FormField = ({ 
  label, 
  name, 
  type = 'text', 
  value, 
  onChange, 
  error, 
  required = false, 
  placeholder = '', 
  children,
  className = ''
}) => {
  const hasError = !!error;
  
  const inputClasses = `
    w-full px-3 py-2 border rounded-lg transition-colors
    focus:ring-2 focus:ring-chestnut focus:border-transparent
    ${hasError 
      ? 'border-red-500 bg-red-50 focus:ring-red-500' 
      : 'border-gray-300 hover:border-gray-400'
    }
    ${className}
  `;

  return (
    <div className="space-y-1">
      {label && (
        <label 
          htmlFor={name} 
          className={`block text-sm font-medium ${hasError ? 'text-red-700' : 'text-charcoal'}`}
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      {children ? (
        // Custom input (like select or textarea)
        React.cloneElement(children, {
          name,
          value,
          onChange,
          className: inputClasses,
          'aria-invalid': hasError,
          'aria-describedby': hasError ? `${name}-error` : undefined
        })
      ) : (
        // Standard input
        <input
          type={type}
          name={name}
          id={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={inputClasses}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${name}-error` : undefined}
        />
      )}
      
      {hasError && (
        <div 
          id={`${name}-error`}
          className="flex items-center space-x-1 text-red-600 text-sm"
          role="alert"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

export default FormField;