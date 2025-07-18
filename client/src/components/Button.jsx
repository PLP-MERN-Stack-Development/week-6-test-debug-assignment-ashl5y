import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false, 
  onClick, 
  className = '',
  ...props 
}) => {
  const baseClasses = 'font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 btn-primary',
    secondary: 'bg-gray-600 text-white hover:bg-gray-700 focus:ring-gray-500 btn-secondary',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 btn-danger'
  };
  
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm btn-sm',
    md: 'px-4 py-2 text-base btn-md',
    lg: 'px-6 py-3 text-lg btn-lg'
  };
  
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed btn-disabled' : 'cursor-pointer';
  
  const buttonClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`.trim();
  
  const handleClick = (e) => {
    if (!disabled && onClick) {
      onClick(e);
    }
  };
  
  return (
    <button
      className={buttonClasses}
      disabled={disabled}
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;