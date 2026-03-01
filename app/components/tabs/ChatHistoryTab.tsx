"use client";

import { useState } from "react";
import { IconChat, IconSearch, IconClock } from "../icons/Icons";

interface ChatItem {
  id: string;
  title: string;
  preview: string;
  date: string;
  messageCount: number;
}

const mockChats: ChatItem[] = [
  {
    id: "1",
    title: "Newton Yasalari",
    preview: "Newton'un hareket yasalarini detayli olarak acikla...",
    date: "Bugun",
    messageCount: 12,
  },
  {
    id: "2",
    title: "Integral Hesaplama",
    preview: "Belirsiz integral nasil hesaplanir...",
    date: "Dun",
    messageCount: 8,
  },
  {
    id: "3",
    title: "Hucre Bolunmesi",
    preview: "Mitoz ve mayoz arasindaki farklar nelerdir...",
    date: "2 gun once",
    messageCount: 15,
  },
  {
    id: "4",
    title: "Osmanli Tarihi",
    preview: "Osmanli Imparatorlugu'nun kurulusu hakkinda...",
    date: "3 gun once",
    messageCount: 6,
  },
  {
    id: "5",
    title: "Python Programlama",
    preview: "Python'da liste ve sozluk veri yapilari...",
    date: "1 hafta once",
    messageCount: 20,
  },
];

export default function ChatHistoryTab() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChat, setSelectedChat] = useState<string | null>(null);

  const filteredChats = mockChats.filter(
    (chat) =>
      chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.preview.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-4 sm:p-6 flex-shrink-0">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{
                background: "var(--accent-primary-light)",
                color: "var(--accent-primary)",
              }}
            >
              <IconClock size={20} />
            </div>
            <div>
              <h2
                className="text-base font-bold"
                style={{ color: "var(--text-primary)" }}
              >
                Gecmis Sohbetlerim
              </h2>
              <p
                className="text-xs"
                style={{ color: "var(--text-tertiary)" }}
              >
                {mockChats.length} sohbet kaydi
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2"
              style={{ color: "var(--text-tertiary)" }}
            >
              <IconSearch size={14} />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Sohbetlerde ara..."
              className="input"
              style={{
                paddingLeft: 36,
                height: 40,
                fontSize: 13,
              }}
            />
          </div>
        </div>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 pb-6">
        <div className="max-w-2xl mx-auto space-y-2">
          {filteredChats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => setSelectedChat(chat.id)}
              className="w-full rounded-xl p-3.5 text-left transition-all active:scale-[0.99]"
              style={{
                background:
                  selectedChat === chat.id
                    ? "var(--accent-primary-light)"
                    : "var(--bg-card)",
                border:
                  selectedChat === chat.id
                    ? "1px solid rgba(16, 185, 129, 0.2)"
                    : "1px solid var(--border-primary)",
                boxShadow:
                  selectedChat === chat.id
                    ? "var(--shadow-glow-sm)"
                    : "var(--shadow-card)",
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg mt-0.5"
                  style={{
                    background:
                      selectedChat === chat.id
                        ? "rgba(16, 185, 129, 0.15)"
                        : "var(--bg-tertiary)",
                    color:
                      selectedChat === chat.id
                        ? "var(--accent-primary)"
                        : "var(--text-tertiary)",
                  }}
                >
                  <IconChat size={15} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h3
                      className="text-sm font-semibold truncate"
                      style={{ color: "var(--text-primary)" }}
                    >
                      {chat.title}
                    </h3>
                    <span
                      className="text-[10px] font-medium flex-shrink-0"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      {chat.date}
                    </span>
                  </div>
                  <p
                    className="text-xs truncate leading-relaxed"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {chat.preview}
                  </p>
                  <span
                    className="inline-flex items-center gap-1 mt-1.5 text-[10px] font-medium"
                    style={{ color: "var(--text-tertiary)" }}
                  >
                    {chat.messageCount} mesaj
                  </span>
                </div>
              </div>
            </button>
          ))}

          {filteredChats.length === 0 && (
            <div className="text-center py-12">
              <p
                className="text-sm"
                style={{ color: "var(--text-tertiary)" }}
              >
                Sonuc bulunamadi
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
