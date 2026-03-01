"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { NAV_ITEMS, BOTTOM_NAV_ITEMS } from "@/lib/constants";
import { SidebarItem } from "./sidebar-item";

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { t } = useI18n();

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col h-screen bg-sidebar-bg border-r border-border transition-all duration-300 shrink-0",
        collapsed ? "w-[var(--sidebar-collapsed-width)]" : "w-[var(--sidebar-width)]"
      )}
    >
      <div className="flex items-center h-[var(--header-height)] px-4 border-b border-border">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-[var(--radius-md)] bg-accent flex items-center justify-center text-accent-foreground font-bold text-sm">
            O
          </div>
          {!collapsed && (
            <span className="text-lg font-bold text-foreground">Odaklio</span>
          )}
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {NAV_ITEMS.map((item) => (
          <SidebarItem key={item.href} item={item} collapsed={collapsed} />
        ))}
      </nav>

      <div className="p-3 space-y-1 border-t border-border">
        {BOTTOM_NAV_ITEMS.map((item) => (
          <SidebarItem key={item.href} item={item} collapsed={collapsed} />
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
