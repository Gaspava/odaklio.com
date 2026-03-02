"use client";

import { useState, useEffect, useCallback } from "react";
import { IconSearch, IconChat, IconX, IconGitBranch } from "../icons/Icons";
import { useAuth } from "@/app/providers/AuthProvider";
import { getUserConversations, type ConversationWithPreview } from "@/lib/db/conversations";
import { useConversation } from "@/app/providers/ConversationProvider";

interface ChatHistoryPageProps {
  onOpenConversation?: (id: string, type?: string) => void;
}

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

function groupByDate(convs: ConversationWithPreview[]): Record<string, ConversationWithPreview[]> {
  const groups: Record<string, ConversationWithPreview[]> = {};
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterday = new Date(today.getTime() - 86400000);
  const weekAgo = new Date(today.getTime() - 7 * 86400000);

  for (const conv of convs) {
    const d = new Date(conv.updated_at);
    let key: string;
    if (d >= today) key = "Bugün";
    else if (d >= yesterday) key = "Dün";
    else if (d >= weekAgo) key = "Bu Hafta";
    else key = "Daha Eski";

    if (!groups[key]) groups[key] = [];
    groups[key].push(conv);
  }
  return groups;
}

export default function ChatHistoryPage({ onOpenConversation }: ChatHistoryPageProps) {
  const { user } = useAuth();
  const { deleteConversation } = useConversation();
  const [conversations, setConversations] = useState<ConversationWithPreview[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadConversations = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await getUserConversations(user.id, 100);
      setConversations(data);
    } catch (err) {
      console.error("Failed to load conversations:", err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDeletingId(id);
    try {
      await deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Failed to delete:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const filteredChats = conversations.filter((chat) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      chat.title.toLowerCase().includes(q) ||
      (chat.messages?.[0]?.content || "").toLowerCase().includes(q)
    );
  });

  const grouped = groupByDate(filteredChats);
  const groupOrder = ["Bugün", "Dün", "Bu Hafta", "Daha Eski"];

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto p-4 sm:p-6 space-y-4">
        {/* Header */}
        <div className="space-y-1">
          <h1
            className="text-lg font-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Geçmiş Sohbetler
          </h1>
          <p
            className="text-xs"
            style={{ color: "var(--text-tertiary)" }}
          >
            Önceki öğrenme oturumlarına göz at ve devam et
          </p>
        </div>

        {/* Search */}
        <div className="relative">
          <div
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ color: "var(--text-tertiary)" }}
          >
            <IconSearch size={14} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Sohbet ara..."
            className="input"
            style={{ paddingLeft: 36, height: 40, fontSize: 13 }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--text-tertiary)" }}
            >
              <IconX size={14} />
            </button>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-12">
            <div className="auth-spinner" style={{ width: 28, height: 28 }} />
          </div>
        )}

        {/* Chat List Grouped */}
        {!loading && groupOrder.map((group) => {
          const items = grouped[group];
          if (!items || items.length === 0) return null;

          return (
            <div key={group}>
              <h2
                className="text-[11px] font-bold uppercase tracking-wider mb-2 mt-2"
                style={{ color: "var(--text-tertiary)" }}
              >
                {group}
              </h2>
              <div className="space-y-2">
                {items.map((chat, i) => (
                  <button
                    key={chat.id}
                    onClick={() => onOpenConversation?.(chat.id, chat.type)}
                    className="w-full text-left rounded-xl p-3.5 transition-all active:scale-[0.99] hover:shadow-md group"
                    style={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border-primary)",
                      animationDelay: `${i * 0.05}s`,
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg mt-0.5"
                        style={{
                          background: chat.type === "mindmap" ? "rgba(139, 92, 246, 0.12)" : "var(--accent-primary-light)",
                          color: chat.type === "mindmap" ? "var(--accent-purple)" : "var(--accent-primary)",
                        }}
                      >
                        {chat.type === "mindmap" ? <IconGitBranch size={16} /> : <IconChat size={16} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <h3
                              className="text-sm font-semibold truncate"
                              style={{ color: "var(--text-primary)" }}
                            >
                              {chat.title}
                            </h3>
                            {chat.type === "mindmap" && (
                              <span
                                className="flex-shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                                style={{
                                  background: "rgba(139, 92, 246, 0.12)",
                                  color: "var(--accent-purple)",
                                }}
                              >
                                Harita
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span
                              className="text-[10px] font-medium"
                              style={{ color: "var(--text-tertiary)" }}
                            >
                              {relativeTime(chat.updated_at)}
                            </span>
                            <button
                              onClick={(e) => handleDelete(chat.id, e)}
                              disabled={deletingId === chat.id}
                              className="opacity-0 group-hover:opacity-100 flex items-center justify-center w-6 h-6 rounded-md transition-all active:scale-90"
                              style={{
                                background: "var(--bg-tertiary)",
                                color: "var(--accent-danger)",
                              }}
                              title="Sohbeti sil"
                            >
                              {deletingId === chat.id ? (
                                <div className="auth-spinner" style={{ width: 10, height: 10 }} />
                              ) : (
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>
                        {chat.messages?.[0]?.content && (
                          <p
                            className="text-[11px] mt-0.5 truncate"
                            style={{ color: "var(--text-tertiary)" }}
                          >
                            {chat.messages[0].content.slice(0, 100)}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}

        {/* Empty State */}
        {!loading && filteredChats.length === 0 && (
          <div
            className="text-center py-12 rounded-xl"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
          >
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl mx-auto mb-3"
              style={{ background: "var(--bg-tertiary)", color: "var(--text-tertiary)" }}
            >
              {searchQuery ? <IconSearch size={20} /> : <IconChat size={20} />}
            </div>
            <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              {searchQuery ? "Sonuç bulunamadı" : "Henüz sohbet yok"}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
              {searchQuery
                ? "Farklı bir arama terimi deneyin"
                : "Odak sayfasından ilk sohbetini başlat"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
