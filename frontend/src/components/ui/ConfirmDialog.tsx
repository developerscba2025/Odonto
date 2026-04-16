import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './Button';

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: 'danger' | 'warning';
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirmar',
  cancelLabel = 'Cancelar',
  onConfirm,
  onCancel,
  variant = 'danger'
}) => {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-bg-main/70 backdrop-blur-sm z-50 animate-in fade-in"
        onClick={onCancel}
      />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm animate-in fade-in zoom-in-95">
        <div className="bg-bg-surface border border-border-main rounded-3xl shadow-2xl p-8 flex flex-col gap-5">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
            variant === 'danger' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'
          }`}>
            <AlertTriangle className="w-6 h-6" />
          </div>
          
          <div>
            <h3 className="text-lg font-black text-text-main tracking-tight">{title}</h3>
            <p className="text-sm text-text-muted mt-1 font-medium leading-relaxed">{message}</p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="ghost" size="sm" className="flex-1" onClick={onCancel}>
              {cancelLabel}
            </Button>
            <Button variant="danger" size="sm" className="flex-1" onClick={onConfirm}>
              {confirmLabel}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};
