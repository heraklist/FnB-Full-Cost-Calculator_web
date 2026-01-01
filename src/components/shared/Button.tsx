import React from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'icon';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  children: React.ReactNode;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  icon?: React.ReactNode;
  className?: string;
  title?: string;
}

/**
 * Reusable Button component with variants and sizes
 * Supports primary, secondary, danger, success, and icon variants
 */
const variantClasses = {
  primary: 'btn-primary',
  secondary: 'btn-secondary',
  success: 'btn-success',
  warning: 'btn-warning',
  danger: 'btn-danger',
  info: 'btn-info',
  icon: 'btn-icon',
};

export default function Button({
  variant = 'primary',
  size = 'md',
  onClick,
  children,
  disabled = false,
  type = 'button',
  icon,
  className = '',
  title,
}: ButtonProps) {
  const variantClass = variantClasses[variant] || variantClasses.primary;
  const sizeClass = size !== 'md' ? `btn-${size}` : '';
  const classes = [
    variantClass,
    sizeClass,
    'flex items-center gap-2',
    disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer',
    'transition-all duration-150',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
      title={title}
    >
      {icon && <span>{icon}</span>}
      {children}
    </button>
  );
}
