"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { useI18n } from "@/lib/i18n";
import { Badge } from "@/components/ui/badge";
import type { NavItem } from "@/types/navigation";

interface SidebarItemProps {
  item: NavItem;
  collapsed: boolean;
}

export function SidebarItem({ item, collapsed }: SidebarItemProps) {
  const pathname = usePathname();
  const { locale } = useI18n();
  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      title={collapsed ? item.label[locale] : undefined}
      className={cn(
        "flex items-center gap-3 rounded-[var(--radius-md)] px-3 py-2.5 text-sm font-medium transition-colors",
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
    </Link>
  );
}
