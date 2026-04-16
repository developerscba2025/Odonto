import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', icon: Icon, isLoading, children, disabled, ...props }, ref) => {
    
    const variants = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/20 active:scale-[0.98]',
      secondary: 'bg-[#1e293b] text-text-main border border-white/5 hover:bg-[#334155] active:scale-[0.98]',
      ghost: 'bg-transparent text-text-muted hover:text-text-main hover:bg-white/5',
      danger: 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white border border-red-500/20 active:scale-[0.98]'
    };

    const sizes = {
      sm: 'px-4 py-2 text-xs rounded-xl',
      md: 'px-6 py-2.5 text-sm rounded-xl',
      lg: 'px-8 py-4 text-sm rounded-2xl'
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={`
          flex items-center justify-center gap-2 font-black transition-all duration-300 outline-none disabled:opacity-50 disabled:grayscale
          ${variants[variant]}
          ${sizes[size]}
          ${className}
        `}
        {...props}
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : Icon && (
          <Icon className={`${size === 'sm' ? 'w-3.5 h-3.5' : 'w-4 h-4'}`} />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
