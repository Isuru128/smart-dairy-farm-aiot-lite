import React from 'react';

const LoadingSpinner = ({ size = 'md', text = 'Loading data...' }) => {
  const sizeMap = {
    sm: 'w-5 h-5',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 gap-3">
      <div className={`${sizeMap[size] || sizeMap.md} animate-spin rounded-full border-2 border-slate-700 border-t-emerald-500`} />
      {text && <span className="text-xs font-medium text-slate-400">{text}</span>}
    </div>
  );
};

export default LoadingSpinner;
