"use client";

import { HelpCircle } from "lucide-react";

interface HoverExplainProps {
  text: string;
  onExplain?: (text: string) => void;
}

export function HoverExplain({ text, onExplain }: HoverExplainProps) {
  return (
    <span className="relative group inline">
      <span className="border-b border-dashed border-muted-foreground cursor-help">
        {text}
      </span>
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] bg-surface border border-border shadow-md text-xs text-muted whitespace-nowrap z-10">
        <HelpCircle size={12} />
        <button
          onClick={() => onExplain?.(text)}
          className="text-accent hover:underline cursor-pointer"
        >
          Anlamadım
        </button>
      </span>
    </span>
  );
}
