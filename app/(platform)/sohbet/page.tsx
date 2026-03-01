"use client";

import { useI18n } from "@/lib/i18n";
import { ChatWindow } from "@/components/features/chatbot/chat-window";
import { ChatInput } from "@/components/features/chatbot/chat-input";

export default function ChatPage() {
  const { locale } = useI18n();

  return (
    <div className="flex flex-col h-[calc(100vh-var(--header-height)-48px)]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-foreground">
          {locale === "tr" ? "AI Sohbet" : "AI Chat"}
        </h1>
        <p className="mt-1 text-muted">
          {locale === "tr"
            ? "Yapay zeka ile sohbet edin ve sorularınıza yanıt alın"
            : "Chat with AI and get answers to your questions"}
        </p>
      </div>
      <ChatWindow />
      <ChatInput />
    </div>
  );
}
