import React from "react";
import { useUIStore } from "../stores/useUIStore";
import { X, CheckCircle, AlertTriangle, AlertCircle, Info } from "lucide-react";

export const Toast: React.FC = () => {
  const { toasts, removeToast } = useUIStore();

  if (toasts.length === 0) return null;

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    error: <AlertCircle className="w-5 h-5 text-rose-500" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500" />,
    info: <Info className="w-5 h-5 text-indigo-500" />,
  };

  const borderColors = {
    success: "border-emerald-100 bg-emerald-50/90",
    error: "border-rose-100 bg-rose-50/90",
    warning: "border-amber-100 bg-amber-50/90",
    info: "border-indigo-100 bg-indigo-50/90",
  };

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start gap-3 p-4 rounded-xl border shadow-xl backdrop-blur-md pointer-events-auto transition-all duration-300 animate-fade-in ${borderColors[toast.type]}`}
        >
          <div className="flex-shrink-0 mt-0.5">{icons[toast.type]}</div>
          <div className="flex-grow">
            <p className="text-sm font-semibold text-slate-800 leading-snug">
              {toast.message}
            </p>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded-lg hover:bg-slate-200/50"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
export default Toast;
