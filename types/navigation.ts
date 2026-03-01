import type { LucideIcon } from "lucide-react";

export interface NavItem {
  label: { tr: string; en: string };
  href: string;
  icon: LucideIcon;
  description: { tr: string; en: string };
  badge?: string;
}
