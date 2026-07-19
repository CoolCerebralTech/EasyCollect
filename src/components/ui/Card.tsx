// =====================================================
// components/ui/Card.tsx
// Design-system compliant card shell.
// rounded-3xl + border-slate-100 + shadow-sm = premium trifecta.
// Hover: lift + shadow-md (the universal premium interaction).
// =====================================================

import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  hover = false,
  ...props
}) => {
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  // Hover: lift 4px + shadow upgrade + emerald border tint.
  // This is the Stripe/Linear card hover pattern.
  const hoverStyles = hover
    ? 'hover:shadow-lg hover:-translate-y-1 hover:border-emerald-200/60 transition-all duration-300 ease-out cursor-pointer'
    : '';

  return (
    <div
      className={`bg-white border border-slate-100 rounded-3xl shadow-sm ${paddingStyles[padding]} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
