"use client";

import { createContext, useContext, useState, useCallback, useRef } from "react";

export type ToastType = "success" | "error" | "info" | "warning" | "achievement";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  emoji?: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (toast: Omit<Toast, "id">) => void;
  showSuccess: (title: string, message?: string) => void;
  showError: (title: string, message?: string) => void;
  showAchievement: (emoji: string, title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

const typeConfig: Record<ToastType, { bg: string; border: string; icon: string }> = {
  success: {
    bg: "rgba(16, 185, 129, 0.1)",
    border: "rgba(16, 185, 129, 0.25)",
    icon: "✓",
  },
  error: {
    bg: "rgba(239, 68, 68, 0.1)",
    border: "rgba(239, 68, 68, 0.25)",
    icon: "✕",
  },
  info: {
    bg: "rgba(59, 130, 246, 0.1)",
    border: "rgba(59, 130, 246, 0.25)",
    icon: "ℹ",
  },
  warning: {
    bg: "rgba(245, 158, 11, 0.1)",
    border: "rgba(245, 158, 11, 0.25)",
    icon: "⚠",
  },
  achievement: {
    bg: "rgba(139, 92, 246, 0.12)",
    border: "rgba(139, 92, 246, 0.3)",
    icon: "🏆",
  },
};

const typeTextColor: Record<ToastType, string> = {
  success: "var(--accent-success)",
  error: "var(--accent-danger)",
  info: "var(--accent-info)",
  warning: "var(--accent-warning)",
  achievement: "var(--accent-purple)",
};

function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const cfg = typeConfig[toast.type];
  const textColor = typeTextColor[toast.type];

  return (
    <div
      className="flex items-start gap-3 rounded-2xl px-4 py-3.5 shadow-xl animate-msg-in"
      style={{
        background: "var(--bg-card)",
        border: `1px solid ${cfg.border}`,
        boxShadow: "var(--shadow-xl)",
        minWidth: 280,
        maxWidth: 360,
      }}
    >
      <div
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold"
        style={{ background: cfg.bg, color: textColor }}
      >
        {toast.emoji || cfg.icon}
      </div>
      <div className="flex-1 min-w-0 pt-0.5">
        <p className="text-sm font-semibold leading-tight" style={{ color: "var(--text-primary)" }}>
          {toast.title}
        </p>
        {toast.message && (
          <p className="text-xs mt-0.5 leading-relaxed" style={{ color: "var(--text-tertiary)" }}>
            {toast.message}
          </p>
        )}
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        className="flex-shrink-0 mt-0.5 transition-opacity hover:opacity-60"
        style={{ color: "var(--text-tertiary)", fontSize: 14 }}
      >
        ✕
      </button>
    </div>
  );
}

export default function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const showToast = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev.slice(-3), { ...toast, id }]);

      const duration = toast.duration ?? (toast.type === "achievement" ? 5000 : 3000);
      const timer = setTimeout(() => removeToast(id), duration);
      timers.current.set(id, timer);
    },
    [removeToast]
  );

  const showSuccess = useCallback(
    (title: string, message?: string) => showToast({ type: "success", title, message }),
    [showToast]
  );

  const showError = useCallback(
    (title: string, message?: string) => showToast({ type: "error", title, message }),
    [showToast]
  );

  const showAchievement = useCallback(
    (emoji: string, title: string, message?: string) =>
      showToast({ type: "achievement", title, message, emoji, duration: 5000 }),
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, showSuccess, showError, showAchievement }}>
      {children}
      {toasts.length > 0 && (
        <div
          className="fixed z-[9999] flex flex-col gap-2"
          style={{ bottom: 24, right: 24 }}
        >
          {toasts.map((t) => (
            <ToastItem key={t.id} toast={t} onRemove={removeToast} />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}
