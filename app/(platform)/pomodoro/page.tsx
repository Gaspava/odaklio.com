"use client";

import { useI18n } from "@/lib/i18n";
import { TimerDisplay } from "@/components/features/pomodoro/timer-display";
import { TimerControls } from "@/components/features/pomodoro/timer-controls";
import { SessionTracker } from "@/components/features/pomodoro/session-tracker";

export default function PomodoroPage() {
  const { locale } = useI18n();

  return (
    <div className="mx-auto max-w-md space-y-8 text-center">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Pomodoro</h1>
        <p className="mt-1 text-muted">
          {locale === "tr"
            ? "Odaklı çalışma seanslarınızı yönetin"
            : "Manage your focused study sessions"}
        </p>
      </div>
      <TimerDisplay />
      <TimerControls />
      <SessionTracker />
    </div>
  );
}
