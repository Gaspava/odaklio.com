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
    id: "hizli-okuma",
    label: { tr: "Hızlı Okuma", en: "Speed Reading" },
    icon: BookOpen,
    description: { tr: "Hızlı okuma aracı", en: "Speed reading tool" },
  },
  {
    id: "sohbet",
    label: { tr: "AI Sohbet", en: "AI Chat" },
    icon: MessageCircle,
    description: { tr: "Yapay zeka sohbet asistanı", en: "AI chat assistant" },
    badge: "Beta",
  },
  {
    id: "pomodoro",
    label: { tr: "Pomodoro", en: "Pomodoro" },
    icon: Timer,
    description: { tr: "Pomodoro zamanlayıcı", en: "Pomodoro timer" },
  },
  {
    id: "kartlar",
    label: { tr: "Kartlar", en: "Flashcards" },
    icon: Layers,
    description: { tr: "Bilgi kartları", en: "Flashcards" },
  },
  {
    id: "odak-modu",
    label: { tr: "Odak Modu", en: "Focus Mode" },
    icon: Focus,
    description: { tr: "Çalışma odak modları", en: "Study focus modes" },
  },
  {
    id: "metin-gorsel",
    label: { tr: "Görsel Metin", en: "Visual Text" },
    icon: Eye,
    description: { tr: "Görselleştirilmiş metinler", en: "Visualized texts" },
  },
  {
    id: "zihin-haritasi",
    label: { tr: "Zihin Haritası", en: "Mind Map" },
    icon: Network,
    description: { tr: "Zihin haritası oluşturucu", en: "Mind map builder" },
  },
  {
    id: "arama",
    label: { tr: "Arama", en: "Search" },
    icon: Search,
    description: { tr: "Arama geçmişi ve öneriler", en: "Search history & recommendations" },
  },
];

export const BOTTOM_NAV_ITEMS: NavItem[] = [
  {
    id: "ayarlar",
    label: { tr: "Ayarlar", en: "Settings" },
    icon: Settings,
    description: { tr: "Platform ayarları", en: "Platform settings" },
  },
];
