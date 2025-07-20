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
    <div className={`font-serif font-bold text-xl text-charcoal flex flex-col items-center ${className}`}>
      <div className="leading-none">E</div>
      <div className="border-t border-charcoal w-5 my-0.5"></div>
      <div className="text-chestnut leading-none">IQ</div>
    </div>
  );
};

export default Logo;