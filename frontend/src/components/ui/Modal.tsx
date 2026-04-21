import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl';
}

export const Modal = ({ isOpen, onClose, title, subtitle, children, maxWidth = 'lg' }: ModalProps) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEsc);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-500"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className={`relative w-full ${maxWidthClasses[maxWidth]} bg-bg-surface rounded-3xl border border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-500 flex flex-col`} style={{ maxHeight: 'calc(100vh - 24px)' }}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02] flex justify-between items-center relative overflow-hidden flex-shrink-0">
          <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
          <div className="relative z-10">
            <h2 className="text-lg font-black text-text-main tracking-tight uppercase leading-none">{title}</h2>
            {subtitle && (
              <p className="text-[9px] text-blue-400 font-black uppercase tracking-[0.25em] mt-1 opacity-80">
                {subtitle}
              </p>
            )}
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-red-500/10 rounded-xl transition-all text-text-muted hover:text-red-400 group relative z-10"
          >
            <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* Body - scrollable */}
        <div className="p-6 overflow-y-auto flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};
