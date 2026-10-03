import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import React, { useEffect } from 'react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error';
  text: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 3500);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 transition-all transform duration-200">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-sm ${
          toast.type === 'success'
            ? 'bg-white border-[#4eafde]/70 text-[#223749]'
            : 'bg-white border-red-200 text-red-900'
        }`}
      >
        {toast.type === 'success' ? (
          <div className="w-8 h-8 rounded-lg bg-[#e8f5fb] text-[#4eafde] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <AlertCircle className="w-4 h-4" />
          </div>
        )}
        <div className="text-sm font-medium pr-2">{toast.text}</div>
        <button
          onClick={onClose}
          className="text-[#71808F] hover:text-[#263746] transition-colors p-1"
          aria-label="Tutup notifikasi"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
