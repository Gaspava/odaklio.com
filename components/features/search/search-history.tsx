"use client";

import { Clock, X } from "lucide-react";

const sampleHistory = [
  { id: "1", query: "Diferansiyel denklemler", timestamp: "2 saat önce" },
  { id: "2", query: "Newton yasaları", timestamp: "Dün" },
  { id: "3", query: "Organik kimya", timestamp: "3 gün önce" },
];

export function SearchHistory() {
  return (
    <div className="space-y-2">
      {sampleHistory.map((item) => (
        <div
          key={item.id}
          className="flex items-center justify-between px-4 py-3 rounded-[var(--radius-md)] bg-surface border border-border hover:bg-surface-hover transition-colors"
        >
          <div className="flex items-center gap-3">
            <Clock size={16} className="text-muted shrink-0" />
            <span className="text-sm text-foreground">{item.query}</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted">{item.timestamp}</span>
            <button className="text-muted hover:text-foreground transition-colors cursor-pointer">
              <X size={14} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
