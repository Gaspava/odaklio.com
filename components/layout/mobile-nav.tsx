"use client";

import { X, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { NAV_ITEMS, BOTTOM_NAV_ITEMS } from "@/lib/constants";
import { SidebarItem } from "./sidebar-item";
import type { FeatureId } from "@/types/navigation";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
  activeId: FeatureId;
  onSelect: (id: FeatureId) => void;
}

export function MobileNav({ open, onClose, activeId, onSelect }: MobileNavProps) {
  const { locale } = useI18n();

  const handleSelect = (id: FeatureId) => {
    onSelect(id);
    onClose();
  };

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={onClose}
        />
      )}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-[var(--sidebar-width)] bg-sidebar-bg border-r border-border transform transition-transform duration-300 md:hidden flex flex-col",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between h-[var(--header-height)] px-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-[var(--radius-md)] bg-accent flex items-center justify-center text-accent-foreground font-bold text-sm">
              O
            </div>
            <span className="text-lg font-bold text-foreground">Odaklio</span>
          </div>
          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-[var(--radius-md)] text-muted hover:bg-surface-hover hover:text-foreground transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          <button
            onClick={() => handleSelect("dashboard")}
            className={cn(
              "flex items-center gap-3 w-full rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer",
              activeId === "dashboard"
                ? "bg-sidebar-item-active text-sidebar-item-active-text"
                : "text-muted hover:bg-sidebar-item-hover hover:text-foreground"
            )}
          >
            <Home size={20} className="shrink-0" />
            <span>{locale === "tr" ? "Ana Sayfa" : "Dashboard"}</span>
          </button>
          {NAV_ITEMS.map((item) => (
            <SidebarItem key={item.id} item={item} collapsed={false} activeId={activeId} onSelect={handleSelect} />
          ))}
        </nav>

        <div className="p-3 space-y-1 border-t border-border">
          {BOTTOM_NAV_ITEMS.map((item) => (
            <SidebarItem key={item.id} item={item} collapsed={false} activeId={activeId} onSelect={handleSelect} />
          ))}
        </div>
      </div>
    </>
  );
}
