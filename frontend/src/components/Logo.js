import React from 'react';

const Logo = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10', 
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className={`${sizeClasses[size]} bg-gradient-to-r from-gray-900 to-gray-700 rounded-lg flex items-center justify-center ${className}`}>
      {/* Logo P estilizado */}
      <svg viewBox="0 0 24 24" className="w-3/5 h-3/5 text-white fill-current">
        <path d="M6 2C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H11C13.8 22 16 19.8 16 17C16 15.4 15.2 14 14 13.2C15.2 12.4 16 10.6 16 9C16 6.2 13.8 4 11 4H6V2ZM6 6H11C12.7 6 14 7.3 14 9S12.7 12 11 12H6V6ZM6 14H11C12.7 14 14 15.3 14 17S12.7 20 11 20H6V14Z" />
      </svg>
    </div>
  );
};

export default Logo;