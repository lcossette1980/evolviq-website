import React from 'react';
import { ChevronRight, ChevronDown, CheckCircle, Circle, Plus, Trash2 } from 'lucide-react';

// Progress indicator component
export const ProgressIndicator = ({ completed, total }) => (
  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
    <div className="w-32 bg-gray-200 rounded-full h-2">
      <div 
        className="h-2 rounded-full transition-all duration-300"
        style={{ 
          width: `${(completed / total) * 100}%`,
          backgroundColor: '#A44A3F'
        }}
      />
    </div>
    <span className="font-medium">{completed}/{total} sections completed</span>
  </div>
);

// Section header component
export const SectionHeader = ({ title, description, isCompleted, onToggleComplete, children }) => (
  <div className="border-b border-gray-200 pb-4 mb-6">
    <div className="flex items-center justify-between mb-2">
      <h2 className="text-3xl font-bold text-gray-800" style={{ fontFamily: 'Playfair Display' }}>
        {title}
      </h2>
      <button
        onClick={onToggleComplete}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
          isCompleted 
            ? 'bg-green-100 text-green-800 border border-green-300' 
            : 'bg-gray-100 text-gray-600 border border-gray-300'
        }`}
      >
        {isCompleted ? <CheckCircle size={16} /> : <Circle size={16} />}
        <span className="text-sm font-medium">
          {isCompleted ? 'Completed' : 'Mark Complete'}
        </span>
      </button>
    </div>
    <p className="text-gray-600 mb-4">{description}</p>
    {children}
  </div>
);

// Form field component
export const FormField = ({ label, type = 'text', value, onChange, placeholder, required = false, rows = 3 }) => {
  const handleKeyDown = (e) => {
    // Prevent spacebar from scrolling the page when focused on input
    if (e.key === ' ' && e.target.tagName.toLowerCase() === 'input') {
      e.stopPropagation();
    }
  };

  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {type === 'textarea' ? (
        <textarea
          rows={rows}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          onKeyDown={handleKeyDown}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 focus:border-transparent resize-vertical"
          style={{ 
            focusRingColor: '#A44A3F',
            '--tw-ring-color': '#A44A3F'
          }}
        />
      ) : (
        <input
          type={type}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          onKeyDown={handleKeyDown}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-opacity-50 focus:border-transparent"
          style={{ 
            focusRingColor: '#A44A3F',
            '--tw-ring-color': '#A44A3F'
          }}
        />
      )}
    </div>
  );
};

// Collapsible section component
export const CollapsibleSection = ({ title, children, defaultOpen = false, sectionId, expandedSections, toggleSection }) => {
  const isOpen = expandedSections.has(sectionId) || defaultOpen;
  
  const handleToggle = () => {
    toggleSection(sectionId);
  };
  
  return (
    <div className="border border-gray-200 rounded-lg mb-4">
      <button
        onClick={handleToggle}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <h3 className="font-semibold text-gray-800">{title}</h3>
        {isOpen ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
      </button>
      {isOpen && (
        <div className="p-4 border-t border-gray-200">
          {children}
        </div>
      )}
    </div>
  );
};

// Array input component for managing lists
export const ArrayInput = ({ items, onAdd, onRemove, onUpdate, placeholder, addButtonText = "Add Item" }) => {
  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div key={index} className="flex items-center space-x-2">
          <input
            value={item}
            onChange={(e) => onUpdate(index, e.target.value)}
            className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-opacity-50 focus:border-transparent"
            style={{ 
              focusRingColor: '#A44A3F',
              '--tw-ring-color': '#A44A3F'
            }}
            placeholder={placeholder}
          />
          <button
            onClick={() => onRemove(index)}
            className="p-2 text-red-600 hover:bg-red-50 rounded"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ))}
      <button
        onClick={onAdd}
        className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
      >
        <Plus size={16} />
        <span>{addButtonText}</span>
      </button>
    </div>
  );
};

// Info box component
export const InfoBox = ({ type = 'info', title, children, className = '' }) => {
  const typeClasses = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    success: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    purple: 'bg-purple-50 border-purple-200 text-purple-800'
  };

  const contentClasses = {
    info: 'text-blue-700',
    success: 'text-green-700',
    warning: 'text-amber-700',
    error: 'text-red-700',
    purple: 'text-purple-700'
  };

  return (
    <div className={`border rounded-lg p-4 ${typeClasses[type]} ${className}`}>
      {title && (
        <h4 className="font-semibold mb-2">{title}</h4>
      )}
      <div className={contentClasses[type]}>
        {children}
      </div>
    </div>
  );
};

// Image placeholder component
export const ImagePlaceholder = ({ text, className = "w-full h-48" }) => (
  <div className={`bg-gray-200 rounded-lg flex items-center justify-center text-gray-500 ${className}`}>
    {text}
  </div>
);

// Step indicator component
export const StepIndicator = ({ steps, currentStep }) => (
  <div className="flex justify-between items-center mb-8">
    {steps.map((step, index) => (
      <div key={index} className="flex items-center">
        <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
          index <= currentStep 
            ? 'border-chestnut bg-chestnut text-white' 
            : 'border-gray-300 bg-white text-gray-400'
        }`}>
          {index + 1}
        </div>
        {index < steps.length - 1 && (
          <div className={`w-20 h-0.5 mx-2 ${
            index < currentStep ? 'bg-chestnut' : 'bg-gray-300'
          }`} />
        )}
      </div>
    ))}
  </div>
);

// Grid layout component
export const GridLayout = ({ children, cols = 2, gap = 6 }) => (
  <div className={`grid md:grid-cols-${cols} gap-${gap}`}>
    {children}
  </div>
);

// Card component
export const Card = ({ children, className = '', padding = 'p-6' }) => (
  <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${padding} ${className}`}>
    {children}
  </div>
);

// Button component
export const Button = ({ 
  children, 
  onClick, 
  type = 'primary', 
  size = 'md', 
  disabled = false, 
  className = '' 
}) => {
  const typeClasses = {
    primary: 'bg-chestnut hover:bg-chestnut-dark text-white',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
    outline: 'border border-gray-300 hover:bg-gray-50 text-gray-700'
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        ${typeClasses[type]} 
        ${sizeClasses[size]} 
        rounded-lg font-medium transition-colors 
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
      style={type === 'primary' ? { backgroundColor: '#A44A3F' } : {}}
    >
      {children}
    </button>
  );
};

// Checklist component
export const Checklist = ({ items, title, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {title && <h4 className="font-medium mb-3">{title}</h4>}
    {items.map((item, index) => (
      <div key={index} className="flex items-start space-x-2">
        <Circle size={12} className="mt-1 flex-shrink-0 text-gray-400" />
        <span className="text-sm text-gray-600">{item}</span>
      </div>
    ))}
  </div>
);

// Table component
export const Table = ({ headers, rows, className = '' }) => (
  <div className={`overflow-x-auto ${className}`}>
    <table className="w-full border-collapse">
      <thead>
        <tr className="border-b border-gray-200">
          {headers.map((header, index) => (
            <th key={index} className="text-left py-3 px-4 font-medium text-gray-700">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={rowIndex} className="border-b border-gray-100">
            {row.map((cell, cellIndex) => (
              <td key={cellIndex} className="py-3 px-4 text-sm text-gray-600">
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);