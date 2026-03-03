"use client";

import React from "react";
import { IconChat, IconGitBranch, IconFlashcard, IconEdit, IconRoadmap } from "../icons/Icons";
import { useConversation } from "@/app/providers/ConversationProvider";
import type { Conversation } from "@/lib/db/conversations";

/* ===== RELATIVE TIME ===== */
function relativeTime(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "Az önce";
  if (diffMin < 60) return `${diffMin} dk önce`;
  if (diffHour < 24) return `${diffHour} saat önce`;
  if (diffDay === 1) return "Dün";
  if (diffDay < 7) return `${diffDay} gün önce`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)} hafta önce`;
  return date.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
}

/* ===== CHAT HISTORY SIDEBAR ===== */
interface ChatHistorySidebarProps {
  onOpenConversation?: (id: string, type?: string) => void;
}

export default function ChatHistorySidebar({ onOpenConversation }: ChatHistorySidebarProps) {
  const { conversations, activeConversationId, startNewConversation } = useConversation();

  return (
    <div
      className="rounded-xl p-3 transition-all"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border-primary)",
      }}
    >
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <div
            className="flex h-5 w-5 items-center justify-center rounded-md"
            style={{ background: "var(--accent-primary-light)", color: "var(--accent-primary)" }}
          >
            <IconChat size={10} />
          </div>
          <h3
            className="text-[11px] font-bold uppercase tracking-wider"
            style={{ color: "var(--text-tertiary)" }}
          >
            Sohbetler
          </h3>
        </div>
        <button
          onClick={() => {
            startNewConversation();
            onOpenConversation?.("");
          }}
          className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-semibold transition-all active:scale-95"
          style={{
            background: "var(--accent-primary-light)",
            color: "var(--accent-primary)",
          }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          Yeni
        </button>
      </div>

      {conversations.length === 0 ? (
        <p className="text-[10px] text-center py-4" style={{ color: "var(--text-tertiary)" }}>
          Henüz sohbet yok
        </p>
      ) : (
        <div className="space-y-0.5 max-h-[280px] overflow-y-auto">
          {conversations.map((conv: Conversation) => {
            const isActive = activeConversationId === conv.id;
            const typeConfig: Record<string, { icon: React.ReactNode; color: string }> = {
              standard: { icon: <IconChat size={10} />, color: "var(--accent-primary)" },
              mindmap: { icon: <IconGitBranch size={10} />, color: "var(--accent-purple)" },
              flashcard: { icon: <IconFlashcard size={10} />, color: "#f59e0b" },
              note: { icon: <IconEdit size={10} />, color: "var(--accent-secondary)" },
              roadmap: { icon: <IconRoadmap size={10} />, color: "#ef4444" },
            };
            const config = typeConfig[conv.type] || typeConfig.standard;
            return (
              <button
                key={conv.id}
                onClick={() => onOpenConversation?.(conv.id, conv.type)}
                className="w-full text-left flex items-center gap-2 rounded-lg px-2 py-2 transition-all active:scale-[0.98]"
                style={{
                  background: isActive ? `${config.color}10` : "transparent",
                  color: isActive ? config.color : "var(--text-secondary)",
                }}
              >
                <div
                  className="flex h-5 w-5 items-center justify-center rounded-md flex-shrink-0"
                  style={{
                    background: isActive ? `${config.color}15` : `${config.color}12`,
                    color: config.color,
                  }}
                >
                  {config.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-medium truncate">{conv.title}</p>
                  <p className="text-[9px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                    {relativeTime(conv.updated_at)}
                  </p>
                </div>
                {isActive && (
                  <div
                    className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: config.color }}
                  />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
