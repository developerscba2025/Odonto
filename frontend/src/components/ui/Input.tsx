import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: LucideIcon;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, icon: Icon, error, ...props }, ref) => {
    return (
      <div className="space-y-2 w-full">
        {label && (
          <label className="text-[10px] font-black text-text-muted uppercase tracking-wider ml-1">
            {label}
          </label>
        ) }
        <div className="relative group">
          {Icon && (
            <Icon className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-blue-500 transition-colors" />
          )}
          <input
            ref={ref}
            className={`
              w-full bg-bg-main/50 border border-border-main rounded-2xl text-sm text-text-main placeholder:text-text-muted/30 outline-none transition-all
              px-5 py-4 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/5
              ${Icon ? 'pl-11' : ''}
              ${error ? 'border-red-500/50' : ''}
              ${className}
            `}
            {...props}
          />
        </div>
        {error && <p className="text-[10px] font-bold text-red-500 ml-1 uppercase">{error}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
