import React from 'react';

const Logo = ({ variant = 'full', className = '' }) => {
  if (variant === 'full') {
    return (
      <div className={`font-serif font-bold text-2xl text-charcoal ${className}`}>
        <span className="text-charcoal">Evolv</span><span className="text-chestnut">IQ</span>
        <div className="text-sm font-sans font-normal text-charcoal/70 mt-1">
          Adaptive Intelligence. Strategic Impact.
        </div>
      </div>
    );
  }

  return (
    <div className={`font-serif font-bold text-2xl text-charcoal ${className}`}>
      <div>E</div>
      <div className="border-t border-charcoal w-6 my-1"></div>
      <div className="text-chestnut">IQ</div>
    </div>
  );
};

export default Logo;