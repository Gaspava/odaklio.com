"use client";

import { ChatMessage } from "./chat-message";

const sampleMessages = [
  { role: "assistant" as const, content: "Merhaba! Size nasıl yardımcı olabilirim?" },
  { role: "user" as const, content: "Diferansiyel denklemler hakkında bilgi verir misin?" },
  { role: "assistant" as const, content: "Tabii! Diferansiyel denklemler, bilinmeyen bir fonksiyon ile onun türevleri arasındaki ilişkiyi ifade eden matematiksel denklemlerdir. Fizik, mühendislik ve birçok bilim dalında yaygın olarak kullanılır." },
];

export function ChatWindow() {
  return (
    <div className="flex-1 overflow-y-auto space-y-4 pb-4">
      {sampleMessages.map((msg, i) => (
        <ChatMessage key={i} role={msg.role} content={msg.content} />
      ))}
    </div>
  );
}
