import React from 'react';

export const Spinner = ({ size = 'md', className = '' }) => {
  const sizeStyles = {
    sm: 'h-4 w-4 border-2',
    md: 'h-8 w-8 border-3',
    lg: 'h-12 w-12 border-4',
  };

  return (
    <div className="flex items-center justify-center p-4">
      <div
        className={`animate-spin rounded-full border-indigo-500 border-t-transparent ${sizeStyles[size]} ${className}`}
      />
    </div>
  );
};

export default Spinner;
