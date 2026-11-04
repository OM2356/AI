import React from 'react';
import { useApp } from '../context/AppContext.tsx';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export const Toast: React.FC = () => {
  const { toast } = useApp();

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-rose-500 flex-shrink-0" />,
    info: <Info className="w-4 h-4 text-blue-500 flex-shrink-0" />,
  };

  const borders = {
    success: 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/95 dark:bg-emerald-950/90 text-emerald-900 dark:text-emerald-100',
    error: 'border-rose-200 dark:border-rose-800 bg-rose-50/95 dark:bg-rose-950/90 text-rose-900 dark:text-rose-100',
    info: 'border-blue-200 dark:border-blue-800 bg-blue-50/95 dark:bg-blue-950/90 text-blue-900 dark:text-blue-100',
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div
        className={`flex items-center space-x-2.5 px-4 py-3 rounded-xl border shadow-lg backdrop-blur-md max-w-md ${borders[toast.type]}`}
      >
        {icons[toast.type]}
        <span className="text-xs font-medium leading-relaxed">{toast.message}</span>
      </div>
    </div>
  );
};
