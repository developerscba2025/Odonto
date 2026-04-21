import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'surface' | 'glass' | 'inset';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

export const Card = ({ 
  className = '', 
  variant = 'surface', 
  padding = 'md', 
  children, 
  ...props 
}: CardProps) => {
  
  const variants = {
    surface: 'bg-bg-surface/95 dark:bg-bg-surface/90 backdrop-blur-sm border border-border-main shadow-xl shadow-primary/5 hover:shadow-primary/10',
    glass: 'bg-primary/5 dark:bg-white/5 backdrop-blur-md border border-primary/10 dark:border-white/10 shadow-2xl',
    inset: 'bg-primary/5 dark:bg-black/20 border border-primary/20 dark:border-white/5 shadow-inner'
  };

  const paddings = {
    none: 'p-0 rounded-2xl',
    sm: 'p-4 rounded-xl',
    md: 'p-6 lg:p-8 rounded-[2rem]',
    lg: 'p-10 lg:p-12 rounded-[3rem]'
  };

  return (
    <div
      className={`
        transition-all duration-300 relative overflow-hidden
        ${variants[variant]}
        ${paddings[padding]}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};
