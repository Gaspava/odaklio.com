"use client";

import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { NAV_ITEMS, BOTTOM_NAV_ITEMS } from "@/lib/constants";
import { SidebarItem } from "./sidebar-item";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export function MobileNav({ open, onClose }: MobileNavProps) {
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
          "fixed inset-y-0 left-0 z-50 w-[var(--sidebar-width)] bg-sidebar-bg border-r border-border transform transition-transform duration-300 md:hidden",
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

        <nav className="flex-1 overflow-y-auto p-3 space-y-1" onClick={onClose}>
          {NAV_ITEMS.map((item) => (
            <SidebarItem key={item.href} item={item} collapsed={false} />
          ))}
        </nav>

        <div className="p-3 space-y-1 border-t border-border" onClick={onClose}>
          {BOTTOM_NAV_ITEMS.map((item) => (
            <SidebarItem key={item.href} item={item} collapsed={false} />
          ))}
        </div>
      </div>
    </>
  );
}
