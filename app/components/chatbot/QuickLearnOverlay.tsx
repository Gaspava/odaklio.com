"use client";

import { useState, useEffect, useCallback } from "react";
import { IconX, IconBrain } from "../icons/Icons";

interface QuickLearnOverlayProps {
  text: string;
  onClose: () => void;
}

export default function QuickLearnOverlay({
  text,
  onClose,
}: QuickLearnOverlayProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/quick-learn", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || `Hata: ${res.status}`);
      }

      const data = await res.json();
      setSummary(data.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bir hata oluştu");
    } finally {
      setIsLoading(false);
    }
  }, [text]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Truncate display text
  const displayText =
    text.length > 80 ? text.slice(0, 80) + "..." : text;

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center animate-fade-in p-4"
      style={{ background: "var(--bg-overlay)", backdropFilter: "blur(12px)" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="relative w-full max-w-md rounded-2xl overflow-hidden"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-primary)",
          boxShadow: "var(--shadow-xl)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-4"
          style={{ borderBottom: "1px solid var(--border-primary)" }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg"
              style={{
                background: "var(--accent-warning-light)",
                color: "var(--accent-warning)",
              }}
            >
              <IconBrain size={16} />
            </div>
            <div>
              <h2
                className="text-sm font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                Hızlı Öğren
              </h2>
              <p
                className="text-[11px] mt-0.5"
                style={{ color: "var(--text-tertiary)" }}
              >
                Kısa özet
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors"
            style={{
              background: "var(--bg-tertiary)",
              color: "var(--text-tertiary)",
            }}
          >
            <IconX size={16} />
          </button>
        </div>

        {/* Selected Text */}
        <div className="px-4 pt-3 sm:px-5 sm:pt-4">
          <div
            className="rounded-lg px-3 py-2 text-xs leading-relaxed"
            style={{
              background: "var(--bg-tertiary)",
              color: "var(--text-secondary)",
              borderLeft: "3px solid var(--accent-warning)",
            }}
          >
            &ldquo;{displayText}&rdquo;
          </div>
        </div>

        {/* Summary */}
        <div className="px-4 py-4 sm:px-5 sm:py-5">
          {isLoading && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                <div
                  className="typing-dot w-2 h-2 rounded-full"
                  style={{ background: "var(--accent-warning)" }}
                />
                <div
                  className="typing-dot w-2 h-2 rounded-full"
                  style={{ background: "var(--accent-warning)" }}
                />
                <div
                  className="typing-dot w-2 h-2 rounded-full"
                  style={{ background: "var(--accent-warning)" }}
                />
              </div>
              <span
                className="text-xs"
                style={{ color: "var(--text-tertiary)" }}
              >
                Özetleniyor...
              </span>
            </div>
          )}

          {error && (
            <p className="text-xs" style={{ color: "var(--accent-danger)" }}>
              {error}
            </p>
          )}

          {summary && !isLoading && (
            <p
              className="text-[13px] leading-relaxed"
              style={{ color: "var(--text-primary)" }}
            >
              {summary}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
