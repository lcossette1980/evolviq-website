import React, { useState } from 'react';

/**
 * Image component with intelligent fallback
 * Shows icon placeholder if image fails to load
 */
const ImageWithFallback = ({ 
  src, 
  alt, 
  fallbackIcon: FallbackIcon, 
  fallbackText,
  className = '',
  containerClassName = '',
  ...props 
}) => {
  const [imageError, setImageError] = useState(false);

  return (
    <div className={`relative ${containerClassName}`}>
      {!imageError ? (
        <img 
          src={src}
          alt={alt}
          className={className}
          onError={() => setImageError(true)}
          {...props}
        />
      ) : (
        <div className={`${className} bg-gray-100 flex items-center justify-center`}>
          <div className="text-center">
            {FallbackIcon && <FallbackIcon className="w-12 h-12 text-gray-400 mx-auto mb-2" />}
            {fallbackText && <div className="text-gray-500 text-sm px-4">{fallbackText}</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageWithFallback;