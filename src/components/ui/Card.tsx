// =====================================================
// components/ui/Card.tsx
// Reusable card container component
// =====================================================

import React from 'react';

// Extend HTMLAttributes to allow onClick, id, style, etc.
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
  ...props // Spread remaining props like onClick
}) => {
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const hoverStyles = hover ? 'hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300 ease-out' : '';

  return (
    <div 
      className={`bg-white dark:bg-background-card border border-border-DEFAULT dark:border-border-dark rounded-xl shadow-card ${paddingStyles[padding]} ${hoverStyles} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};