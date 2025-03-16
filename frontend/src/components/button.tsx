import React from 'react';
import { ButtonProps } from '../interfaces/global';

const Button: React.FC<ButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  icon,
  className = '',
}) => {
  const baseClasses =
    'flex items-center justify-center gap-2 rounded-lg font-medium transition-colors';

  const variantClasses = {
    primary: 'bg-active text-white hover:bg-opacity-90 px-4 py-2',
    secondary: 'bg-inactive text-gray-700 hover:bg-gray-300 px-3 py-1.5',
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${className}`}
      onClick={onClick}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
