"use client";

import { Mic, MicOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface VoiceButtonProps {
  active?: boolean;
  onClick?: () => void;
  className?: string;
}

export function VoiceButton({ active, onClick, className }: VoiceButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full transition-colors cursor-pointer",
        active
          ? "bg-error text-white animate-pulse"
          : "bg-surface-hover text-muted hover:text-foreground",
        className
      )}
    >
      {active ? <MicOff size={18} /> : <Mic size={18} />}
    </button>
  );
}
