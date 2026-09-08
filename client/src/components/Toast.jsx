import React, { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, AlertTriangle, XCircle, X } from "lucide-react";

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const push = useCallback((message, type = "success") => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4500);
  }, []);

  return (
    <ToastContext.Provider value={{ push }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 w-80">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`card p-3 flex items-start gap-2 shadow-lg border-l-4 ${
              t.type === "error"
                ? "border-l-red-500"
                : t.type === "warning"
                ? "border-l-amber-500"
                : "border-l-emerald-500"
            }`}
          >
            {t.type === "error" ? (
              <XCircle size={18} className="text-red-500 mt-0.5 shrink-0" />
            ) : t.type === "warning" ? (
              <AlertTriangle size={18} className="text-amber-500 mt-0.5 shrink-0" />
            ) : (
              <CheckCircle2 size={18} className="text-emerald-500 mt-0.5 shrink-0" />
            )}
            <p className="text-sm text-slate-200 flex-1">{t.message}</p>
            <button onClick={() => setToasts((ts) => ts.filter((x) => x.id !== t.id))}>
              <X size={14} className="text-slate-400" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
