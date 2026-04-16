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
      primary: 'bg-gradient-to-tr from-blue-700 to-indigo-700 border border-blue-500/30 text-white hover:from-blue-600 hover:to-indigo-600 shadow-[0_0_15px_rgba(59,130,246,0.3)] active:scale-[0.98]',
      secondary: 'bg-bg-surface text-text-main border border-border-main hover:bg-border-main/50 hover:border-border-main shadow-xl shadow-black/20 active:scale-[0.98]',
      ghost: 'bg-transparent text-text-muted hover:text-text-main hover:bg-bg-surface border border-transparent active:scale-[0.98]',
      danger: 'bg-gradient-to-tr from-rose-950/30 to-red-950/30 border border-rose-500/30 text-rose-400 hover:from-rose-600 hover:to-red-600 hover:text-white shadow-lg shadow-rose-900/20 active:scale-[0.98]'
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
