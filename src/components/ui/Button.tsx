// =====================================================
// components/ui/Button.tsx
// Reusable button component with variants
// Tailwind v4-compatible — uses native color tokens, not v3 named scales.
// =====================================================

import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  disabled,
  icon,
  className = '',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none';

  const variants = {
    // Emerald — the money/trust color. Colored shadow = designed, not generic.
    primary:
      'bg-emerald-600 text-white hover:bg-emerald-700 focus-visible:ring-emerald-500 shadow-sm hover:shadow-md hover:shadow-emerald-200/50',
    // Neutral white-on-dark for secondary actions.
    secondary:
      'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 focus-visible:ring-slate-400 shadow-sm',
    danger:
      'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 shadow-sm',
    // Ghost — no background, subtle hover. Used for dismissals and tertiary actions.
    ghost:
      'bg-transparent text-slate-600 hover:bg-slate-100 focus-visible:ring-slate-300',
    success:
      'bg-green-600 text-white hover:bg-green-700 focus-visible:ring-green-500 shadow-sm',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm min-h-[36px]',
    md: 'px-5 py-2.5 text-base min-h-[48px]',
    lg: 'px-7 py-3.5 text-lg min-h-[56px]',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      type="button"
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthClass} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {icon && !loading && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};
