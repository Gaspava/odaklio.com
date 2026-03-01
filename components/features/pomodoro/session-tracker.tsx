"use client";

import { useI18n } from "@/lib/i18n";

export function SessionTracker() {
  const { t } = useI18n();
  const total = 4;
  const completed = 1;

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted">
        {t("sessions")}: {completed}/{total}
      </p>
      <div className="flex items-center justify-center gap-2">
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`h-3 w-3 rounded-full ${
              i < completed ? "bg-accent" : "bg-border"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
