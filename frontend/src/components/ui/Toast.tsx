import React from 'react';
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react';
import { useToast } from '../../store/ToastContext';

export const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  return (
    <div className="fixed bottom-8 right-8 z-[1000] flex flex-col gap-3">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

const ToastItem = ({ toast, onClose }: { toast: any; onClose: () => void }) => {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    error: <XCircle className="w-5 h-5 text-red-500" />,
    warning: <AlertCircle className="w-5 h-5 text-orange-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />,
  };

  const colors = {
    success: 'border-emerald-500/50 bg-emerald-500/10',
    error: 'border-red-500/50 bg-red-500/10',
    warning: 'border-orange-500/50 bg-orange-500/10',
    info: 'border-blue-500/50 bg-blue-500/10',
  };

  return (
    <div className={`
      flex items-center gap-4 min-w-[300px] p-5 rounded-[1.5rem] border-2 backdrop-blur-xl shadow-2xl animate-in slide-in-from-right-4 duration-300
      ${colors[toast.type as keyof typeof colors]}
    `}>
      <div className="flex-shrink-0 animate-bounce">
        {icons[toast.type as keyof typeof icons]}
      </div>
      <div className="flex-1">
        <p className="text-sm font-black text-text-main tracking-tight leading-tight">
          {toast.message}
        </p>
      </div>
      <button 
        onClick={onClose}
        className="text-text-muted hover:text-text-main transition-colors p-1"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
