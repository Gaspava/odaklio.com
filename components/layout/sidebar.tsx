"use client";

import { useState } from "react";
import { ChevronsLeft, ChevronsRight, Home } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { NAV_ITEMS, BOTTOM_NAV_ITEMS } from "@/lib/constants";
import { SidebarItem } from "./sidebar-item";
import type { FeatureId } from "@/types/navigation";

interface SidebarProps {
  activeId: FeatureId;
  onSelect: (id: FeatureId) => void;
}

export function Sidebar({ activeId, onSelect }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { locale, t } = useI18n();

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col h-screen bg-sidebar-bg border-r border-border transition-all duration-300 shrink-0",
        collapsed ? "w-[var(--sidebar-collapsed-width)]" : "w-[var(--sidebar-width)]"
      )}
    >
      <div className="flex items-center h-[var(--header-height)] px-4 border-b border-border">
        <button
          onClick={() => onSelect("dashboard")}
          className="flex items-center gap-2 cursor-pointer"
        >
          <div className="h-8 w-8 rounded-[var(--radius-md)] bg-accent flex items-center justify-center text-accent-foreground font-bold text-sm">
            O
          </div>
          {!collapsed && (
            <span className="text-lg font-bold text-foreground">Odaklio</span>
          )}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        <button
          onClick={() => onSelect("dashboard")}
          title={collapsed ? (locale === "tr" ? "Ana Sayfa" : "Dashboard") : undefined}
          className={cn(
            "flex items-center gap-3 w-full rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer",
            activeId === "dashboard"
              ? "bg-sidebar-item-active text-sidebar-item-active-text"
              : "text-muted hover:bg-sidebar-item-hover hover:text-foreground"
          )}
        >
          <Home size={20} className="shrink-0" />
          {!collapsed && <span>{locale === "tr" ? "Ana Sayfa" : "Dashboard"}</span>}
        </button>
        {NAV_ITEMS.map((item) => (
          <SidebarItem key={item.id} item={item} collapsed={collapsed} activeId={activeId} onSelect={onSelect} />
        ))}
      </nav>

      <div className="p-3 space-y-1 border-t border-border">
        {BOTTOM_NAV_ITEMS.map((item) => (
          <SidebarItem key={item.id} item={item} collapsed={collapsed} activeId={activeId} onSelect={onSelect} />
        ))}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="flex items-center gap-3 w-full rounded-[var(--radius-md)] px-3 py-2.5 text-sm text-muted hover:bg-surface-hover hover:text-foreground transition-colors cursor-pointer"
        >
          {collapsed ? <ChevronsRight size={20} /> : <ChevronsLeft size={20} />}
          {!collapsed && <span>{t("collapse")}</span>}
        </button>
      </div>
    </aside>
  );
}
