"use client";

export function TimerDisplay() {
  return (
    <div className="flex items-center justify-center">
      <div className="relative h-64 w-64 rounded-full border-4 border-accent/20 flex items-center justify-center">
        <div
          className="absolute inset-0 rounded-full border-4 border-accent border-t-transparent animate-spin"
          style={{ animationDuration: "60s", animationPlayState: "paused" }}
        />
        <div className="text-center">
          <span className="text-5xl font-bold text-foreground font-mono">25:00</span>
          <p className="text-sm text-muted mt-2">Odaklanma</p>
        </div>
      </div>
    </div>
  );
}
