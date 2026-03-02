"use client";

import { useState, useEffect, useCallback } from "react";
import { IconSearch, IconChat, IconX } from "../icons/Icons";
import { useAuth } from "@/app/providers/AuthProvider";
import type { ConversationListItem, ConversationMetadata } from "@/lib/types/database";

const tagColors: Record<string, string> = {
  Fizik: "var(--accent-primary)",
  Mekanik: "var(--accent-cyan)",
  Matematik: "var(--accent-secondary)",
  Biyoloji: "var(--accent-success)",
  Tarih: "var(--accent-warning)",
  Kimya: "var(--accent-danger)",
  İngilizce: "var(--accent-purple)",
  Programlama: "var(--accent-info)",
  Optik: "var(--accent-cyan)",
};

function getTagColor(tag: string): string {
  return tagColors[tag] || "var(--accent-primary)";
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const time = date.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });

  if (diffDays === 0) return `Bugün, ${time}`;
  if (diffDays === 1) return `Dün, ${time}`;
  if (diffDays < 7) return `${diffDays} gün önce`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} hafta önce`;
  return date.toLocaleDateString("tr-TR");
}

interface ChatHistoryPageProps {
  onOpenConversation?: (conversationId: string) => void;
}

export default function ChatHistoryPage({ onOpenConversation }: ChatHistoryPageProps) {
  const { isAuthenticated } = useAuth();
  const [conversations, setConversations] = useState<ConversationListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  const fetchConversations = useCallback(async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      const params = new URLSearchParams({ limit: "50", offset: "0" });
      if (searchQuery) params.set("search", searchQuery);

      const res = await fetch(`/api/conversations?${params}`);
      if (!res.ok) {
        setLoading(false);
        return;
      }

      const { data } = await res.json();
      setConversations(data || []);
    } catch {
      // Hata durumunda boş bırak
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, searchQuery]);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Arama debounce
  const [debouncedSearch, setDebouncedSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (debouncedSearch !== undefined) {
      fetchConversations();
    }
  }, [debouncedSearch, fetchConversations]);

  const allTags = Array.from(
    new Set(
      conversations.flatMap((c) => (c.metadata as ConversationMetadata)?.tags || [])
    )
  );

  const filteredChats = conversations.filter((chat) => {
    if (!selectedFilter) return true;
    const tags = (chat.metadata as ConversationMetadata)?.tags || [];
    return tags.includes(selectedFilter);
  });

  const handleDelete = async (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/conversations/${conversationId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setConversations((prev) => prev.filter((c) => c.id !== conversationId));
      }
    } catch {
      // Silme hatası
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="h-full overflow-y-auto">
        <div className="max-w-2xl mx-auto p-4 sm:p-6">
          <div
            className="text-center py-12 rounded-xl"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
          >
            <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              Giriş yaparak sohbet geçmişinize erişin
            </p>
          </div>
        </div>
      </div>
    );
  }

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

        {/* Tag Filters */}
        {allTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedFilter(selectedFilter === tag ? null : tag)}
                className="px-2.5 py-1 rounded-full text-[10px] font-semibold transition-all active:scale-95"
                style={{
                  background: selectedFilter === tag ? `${getTagColor(tag)}20` : "var(--bg-tertiary)",
                  color: selectedFilter === tag ? getTagColor(tag) : "var(--text-tertiary)",
                  border: selectedFilter === tag ? `1px solid ${getTagColor(tag)}30` : "1px solid transparent",
                }}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-xl p-3.5 animate-pulse"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
              >
                <div className="flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg" style={{ background: "var(--bg-tertiary)" }} />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 rounded w-2/3" style={{ background: "var(--bg-tertiary)" }} />
                    <div className="h-3 rounded w-full" style={{ background: "var(--bg-tertiary)" }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Chat List */}
        {!loading && (
          <div className="space-y-2">
            {filteredChats.map((chat, i) => {
              const tags = (chat.metadata as ConversationMetadata)?.tags || [];
              return (
                <button
                  key={chat.id}
                  onClick={() => onOpenConversation?.(chat.id)}
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
                        background: `${tags[0] ? getTagColor(tags[0]) : "var(--accent-primary)"}15`,
                        color: tags[0] ? getTagColor(tags[0]) : "var(--accent-primary)",
                      }}
                    >
                      <IconChat size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h3
                          className="text-sm font-semibold truncate"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {chat.title}
                        </h3>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <span
                            className="text-[10px] font-medium"
                            style={{ color: "var(--text-tertiary)" }}
                          >
                            {formatDate(chat.updated_at)}
                          </span>
                          <button
                            onClick={(e) => handleDelete(e, chat.id)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-md hover:bg-red-50"
                            style={{ color: "var(--accent-danger)" }}
                            title="Sohbeti sil"
                          >
                            <IconX size={12} />
                          </button>
                        </div>
                      </div>
                      {chat.last_message_preview && (
                        <p
                          className="text-[11px] mt-0.5 truncate"
                          style={{ color: "var(--text-tertiary)" }}
                        >
                          {chat.last_message_preview}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        {tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-full text-[9px] font-semibold"
                            style={{
                              background: `${getTagColor(tag)}15`,
                              color: getTagColor(tag),
                            }}
                          >
                            {tag}
                          </span>
                        ))}
                        <span
                          className="text-[9px] font-medium ml-auto"
                          style={{ color: "var(--text-tertiary)" }}
                        >
                          {chat.message_count} mesaj
                        </span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {!loading && filteredChats.length === 0 && (
          <div
            className="text-center py-12 rounded-xl"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-primary)" }}
          >
            <div
              className="flex h-12 w-12 items-center justify-center rounded-xl mx-auto mb-3"
              style={{ background: "var(--bg-tertiary)", color: "var(--text-tertiary)" }}
            >
              <IconSearch size={20} />
            </div>
            <p className="text-sm font-medium" style={{ color: "var(--text-secondary)" }}>
              {conversations.length === 0 ? "Henüz sohbet yok" : "Sonuç bulunamadı"}
            </p>
            <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
              {conversations.length === 0
                ? "Yeni bir sohbet başlatarak öğrenmeye başla"
                : "Farklı bir arama terimi deneyin"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
