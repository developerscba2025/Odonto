import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'blue' | 'emerald' | 'orange' | 'red' | 'purple' | 'slate' | 'warning' | 'success';
  size?: 'xs' | 'sm' | 'md';
  className?: string;
}

export const Badge = ({ children, variant = 'slate', size = 'sm', className = '' }: BadgeProps) => {
  const variants = {
    blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    orange: 'bg-orange-500/10 text-orange-500 border-orange-500/20',
    red: 'bg-red-500/10 text-red-500 border-red-500/20',
    purple: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    slate: 'bg-bg-main text-text-muted border-border-main',
    warning: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
    success: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
  };

  const sizes = {
    xs: 'px-2 py-0.5 text-[8px]',
    sm: 'px-2.5 py-1 text-[10px]',
    md: 'px-3 py-1.5 text-xs'
  };

  return (
    <span className={`
      font-black uppercase tracking-tight rounded-full border
      ${variants[variant]}
      ${sizes[size]}
      ${className}
    `}>
      {children}
    </span>
  );
};
