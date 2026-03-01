import type { LucideIcon } from "lucide-react";

export type FeatureId =
  | "dashboard"
  | "hizli-okuma"
  | "sohbet"
  | "pomodoro"
  | "kartlar"
  | "odak-modu"
  | "metin-gorsel"
  | "zihin-haritasi"
  | "arama"
  | "ayarlar";

export interface NavItem {
  id: FeatureId;
  label: { tr: string; en: string };
  icon: LucideIcon;
  description: { tr: string; en: string };
  badge?: string;
}
