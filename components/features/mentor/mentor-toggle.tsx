"use client";

import { GraduationCap } from "lucide-react";
import { cn } from "@/lib/utils";

interface MentorToggleProps {
  open: boolean;
  onClick: () => void;
}

export function MentorToggle({ open, onClick }: MentorToggleProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "fixed bottom-6 right-6 z-30 flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-colors cursor-pointer md:hidden",
        open ? "bg-surface-hover text-foreground" : "bg-accent text-accent-foreground"
      )}
      title="Mentor"
    >
      <GraduationCap size={22} />
    </button>
  );
}
