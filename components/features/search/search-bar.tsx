"use client";

import { Search } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function SearchBar() {
  const { t } = useI18n();

  return (
    <div className="relative">
      <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
      <input
        type="text"
        placeholder={t("search")}
        className="w-full h-12 pl-11 pr-4 rounded-[var(--radius-lg)] bg-surface border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
      />
    </div>
  );
}
