export interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  icon?: React.ReactNode;
  className?: string;
  type?: 'button' | 'submit';
  iconPosition?: 'left' | 'right';
}
