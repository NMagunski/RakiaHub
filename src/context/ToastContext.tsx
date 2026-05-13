"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

type Toast = { id: number; message: string; type: "success" | "error" | "info" };

type ToastCtx = { show: (message: string, type?: Toast["type"]) => void };

const ToastContext = createContext<ToastCtx>({ show: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);

  const show = useCallback((message: string, type: Toast["type"] = "success") => {
    const id = ++counter.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 2500);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-24 left-0 right-0 z-[60] flex flex-col items-center gap-2 px-4 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`animate-slide-up rounded-2xl px-4 py-3 text-sm font-medium shadow-lg ${
              t.type === "error"
                ? "bg-red-600 text-white"
                : t.type === "info"
                ? "bg-oak text-cream"
                : "bg-walnut text-cream"
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
