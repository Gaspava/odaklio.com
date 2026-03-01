"use client";

import { cn } from "@/lib/utils";

interface VoiceIndicatorProps {
  active: boolean;
  className?: string;
}

const barHeights = [12, 20, 8, 18, 14];

export function VoiceIndicator({ active, className }: VoiceIndicatorProps) {
  if (!active) return null;

  return (
    <div className={cn("flex items-center gap-1", className)}>
      {barHeights.map((h, i) => (
        <div
          key={i}
          className="w-1 bg-accent rounded-full animate-pulse"
          style={{
            height: `${h}px`,
            animationDelay: `${(i + 1) * 0.1}s`,
          }}
        />
      ))}
      <span className="text-xs text-muted ml-2">Dinleniyor...</span>
    </div>
  );
}
