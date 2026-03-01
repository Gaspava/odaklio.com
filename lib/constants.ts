import {
  BookOpen,
  MessageCircle,
  Timer,
  Layers,
  Focus,
  Eye,
  Network,
  Search,
  Settings,
} from "lucide-react";
import type { NavItem } from "@/types/navigation";

export const NAV_ITEMS: NavItem[] = [
  {
    label: { tr: "Hızlı Okuma", en: "Speed Reading" },
    href: "/hizli-okuma",
    icon: BookOpen,
    description: { tr: "Hızlı okuma aracı", en: "Speed reading tool" },
  },
  {
    label: { tr: "AI Sohbet", en: "AI Chat" },
    href: "/sohbet",
    icon: MessageCircle,
    description: { tr: "Yapay zeka sohbet asistanı", en: "AI chat assistant" },
    badge: "Beta",
  },
  {
    label: { tr: "Pomodoro", en: "Pomodoro" },
    href: "/pomodoro",
    icon: Timer,
    description: { tr: "Pomodoro zamanlayıcı", en: "Pomodoro timer" },
  },
  {
    label: { tr: "Kartlar", en: "Flashcards" },
    href: "/kartlar",
    icon: Layers,
    description: { tr: "Bilgi kartları", en: "Flashcards" },
  },
  {
    label: { tr: "Odak Modu", en: "Focus Mode" },
    href: "/odak-modu",
    icon: Focus,
    description: { tr: "Çalışma odak modları", en: "Study focus modes" },
  },
  {
    label: { tr: "Görsel Metin", en: "Visual Text" },
    href: "/metin-gorsel",
    icon: Eye,
    description: { tr: "Görselleştirilmiş metinler", en: "Visualized texts" },
  },
  {
    label: { tr: "Zihin Haritası", en: "Mind Map" },
    href: "/zihin-haritasi",
    icon: Network,
    description: { tr: "Zihin haritası oluşturucu", en: "Mind map builder" },
  },
  {
    label: { tr: "Arama", en: "Search" },
    href: "/arama",
    icon: Search,
    description: { tr: "Arama geçmişi ve öneriler", en: "Search history & recommendations" },
  },
];

export const BOTTOM_NAV_ITEMS: NavItem[] = [
  {
    label: { tr: "Ayarlar", en: "Settings" },
    href: "/ayarlar",
    icon: Settings,
    description: { tr: "Platform ayarları", en: "Platform settings" },
  },
];
