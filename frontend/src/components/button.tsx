import React from 'react';
import { ButtonProps } from '../interfaces/global';

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  icon,
  className = '',
  type = 'button',
  iconPosition = 'left',
}) => {
  const baseClasses =
    'flex items-center justify-center gap-2 rounded-4xl font-medium transition-colors';

  const variantClasses = {
    primary: 'bg-gray-900 text-gray-300 hover:bg-opacity-90 px-4 py-2',
    secondary: 'bg-inactive text-gray-700 hover:bg-gray-300 px-3 py-1.5',
  };

  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      onClick={onClick}
    >
      {icon && iconPosition === 'left' && <span>{icon}</span>}
      {children}
      {icon && iconPosition === 'right' && <span>{icon}</span>}
    </button>
  );
};

export default Button;
