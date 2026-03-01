"use client";

import { useState } from "react";
import { Menu, Search, Globe } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { ThemeToggle } from "./theme-toggle";
import { MobileNav } from "./mobile-nav";
import type { FeatureId } from "@/types/navigation";

interface HeaderProps {
  activeId: FeatureId;
  onSelect: (id: FeatureId) => void;
}

export function Header({ activeId, onSelect }: HeaderProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const { locale, setLocale, t } = useI18n();

  return (
    <>
      <header className="flex items-center h-[var(--header-height)] px-4 border-b border-border bg-background shrink-0">
        <button
          onClick={() => setMobileNavOpen(true)}
          className="md:hidden flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] text-muted hover:bg-surface-hover hover:text-foreground transition-colors cursor-pointer mr-2"
        >
          <Menu size={20} />
        </button>

        <div className="flex-1 max-w-md">
          <div className="flex items-center gap-2 h-9 px-3 rounded-[var(--radius-md)] bg-surface border border-border text-sm text-muted">
            <Search size={16} />
            <span>{t("search")}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 ml-auto">
          <button
            onClick={() => setLocale(locale === "tr" ? "en" : "tr")}
            className="flex h-9 items-center gap-1.5 px-2 rounded-[var(--radius-md)] text-sm text-muted hover:bg-surface-hover hover:text-foreground transition-colors cursor-pointer"
          >
            <Globe size={16} />
            <span className="uppercase text-xs font-medium">{locale}</span>
          </button>
          <ThemeToggle />
          <div className="h-8 w-8 rounded-full bg-accent/20 flex items-center justify-center text-accent text-sm font-medium ml-1">
            U
          </div>
        </div>
      </header>

      <MobileNav
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        activeId={activeId}
        onSelect={onSelect}
      />
    </>
  );
}
