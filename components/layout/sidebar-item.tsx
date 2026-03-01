"use client";

import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import type { NavItem, FeatureId } from "@/types/navigation";

interface SidebarItemProps {
  item: NavItem;
  collapsed: boolean;
  activeId: FeatureId;
  onSelect: (id: FeatureId) => void;
}

export function SidebarItem({ item, collapsed, activeId, onSelect }: SidebarItemProps) {
  const { locale } = useI18n();
  const isActive = activeId === item.id;
  const Icon = item.icon;

  return (
    <button
      onClick={() => onSelect(item.id)}
      title={collapsed ? item.label[locale] : undefined}
      className={cn(
        "flex items-center gap-3 w-full rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer",
        isActive
          ? "bg-sidebar-item-active text-sidebar-item-active-text"
          : "text-muted hover:bg-sidebar-item-hover hover:text-foreground"
      )}
    >
      <Icon size={20} className="shrink-0" />
      {!collapsed && (
        <>
          <span className="truncate">{item.label[locale]}</span>
          {item.badge && (
            <Badge variant="accent" className="ml-auto">
              {item.badge}
            </Badge>
          )}
        </>
      )}
    </button>
  );
}
