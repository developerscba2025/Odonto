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
    surface: 'bg-bg-surface border border-border-main shadow-xl shadow-black/5',
    glass: 'bg-black/20 backdrop-blur-xl border border-white/5 shadow-2xl',
    inset: 'bg-black/10 border border-white/5 inset-shadow inner-shadow shadow-inner'
  };

  const paddings = {
    none: 'p-0',
    sm: 'p-4 rounded-2xl',
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
