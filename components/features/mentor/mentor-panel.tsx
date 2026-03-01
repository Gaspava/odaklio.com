"use client";

import { useState } from "react";
import { X, GraduationCap, Send } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { MentorMessage } from "./mentor-message";
import { MentorToggle } from "./mentor-toggle";

const sampleMessages = [
  { role: "mentor" as const, content: "Merhaba! Ben senin öğrenme mentorunum. Sana nasıl yardımcı olabilirim?" },
];

export function MentorPanel() {
  const [open, setOpen] = useState(false);
  const { t } = useI18n();

  return (
    <>
      {/* Desktop: side panel */}
      <aside
        className={cn(
          "hidden md:flex flex-col h-screen bg-sidebar-bg border-l border-border transition-all duration-300 shrink-0 overflow-hidden",
          open ? "w-80" : "w-0"
        )}
      >
        {open && (
          <>
            <div className="flex items-center justify-between h-[var(--header-height)] px-4 border-b border-border shrink-0">
              <div className="flex items-center gap-2">
                <GraduationCap size={20} className="text-accent" />
                <span className="font-semibold text-foreground text-sm">{t("mentor")}</span>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] text-muted hover:bg-surface-hover hover:text-foreground transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {sampleMessages.map((msg, i) => (
                <MentorMessage key={i} role={msg.role} content={msg.content} />
              ))}
            </div>

            <div className="p-3 border-t border-border shrink-0">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder={t("mentorPlaceholder")}
                  className="flex-1 h-9 px-3 rounded-[var(--radius-md)] bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
                <button className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-accent text-accent-foreground hover:bg-accent-hover transition-colors cursor-pointer">
                  <Send size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </aside>

      {/* Desktop toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "hidden md:flex fixed top-[calc(var(--header-height)+16px)] right-4 z-30 h-9 items-center gap-2 px-3 rounded-[var(--radius-md)] text-sm font-medium transition-colors cursor-pointer",
          open ? "bg-surface-hover text-foreground" : "bg-accent text-accent-foreground hover:bg-accent-hover"
        )}
      >
        <GraduationCap size={16} />
        {!open && <span>{t("mentor")}</span>}
      </button>

      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden" onClick={() => setOpen(false)} />
      )}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-sidebar-bg border-l border-border transform transition-transform duration-300 md:hidden flex flex-col",
          open ? "translate-x-0" : "translate-x-full"
        )}
      >
        <div className="flex items-center justify-between h-[var(--header-height)] px-4 border-b border-border">
          <div className="flex items-center gap-2">
            <GraduationCap size={20} className="text-accent" />
            <span className="font-semibold text-foreground text-sm">{t("mentor")}</span>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="flex h-7 w-7 items-center justify-center rounded-[var(--radius-sm)] text-muted hover:bg-surface-hover hover:text-foreground transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {sampleMessages.map((msg, i) => (
            <MentorMessage key={i} role={msg.role} content={msg.content} />
          ))}
        </div>
        <div className="p-3 border-t border-border">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder={t("mentorPlaceholder")}
              className="flex-1 h-9 px-3 rounded-[var(--radius-md)] bg-background border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
            <button className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] bg-accent text-accent-foreground hover:bg-accent-hover transition-colors cursor-pointer">
              <Send size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile FAB */}
      <MentorToggle open={open} onClick={() => setOpen(!open)} />
    </>
  );
}
