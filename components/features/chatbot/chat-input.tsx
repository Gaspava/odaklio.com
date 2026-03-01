"use client";

import { Send, Mic } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function ChatInput() {
  const { t } = useI18n();

  return (
    <div className="flex items-center gap-2 pt-4 border-t border-border shrink-0">
      <button className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] text-muted hover:bg-surface-hover hover:text-foreground transition-colors cursor-pointer shrink-0">
        <Mic size={18} />
      </button>
      <input
        type="text"
        placeholder={t("typeMessage")}
        className="flex-1 h-10 px-4 rounded-[var(--radius-md)] bg-surface border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
      />
      <button className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-accent text-accent-foreground hover:bg-accent-hover transition-colors cursor-pointer shrink-0">
        <Send size={18} />
      </button>
    </div>
  );
}
