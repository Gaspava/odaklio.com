"use client";

import { useState } from "react";
import { Focus, BookOpen, Pencil, Dumbbell, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { ModeCard } from "./mode-card";

const focusModes = [
  {
    id: "derin-odak",
    icon: Focus,
    label: { tr: "Derin Odak", en: "Deep Focus" },
    desc: { tr: "Tüm dikkat dağıtıcıları kaldır", en: "Remove all distractions" },
  },
  {
    id: "okuma",
    icon: BookOpen,
    label: { tr: "Okuma Modu", en: "Reading Mode" },
    desc: { tr: "Rahat bir okuma deneyimi", en: "Comfortable reading experience" },
  },
  {
    id: "yazma",
    icon: Pencil,
    label: { tr: "Yazma Modu", en: "Writing Mode" },
    desc: { tr: "Not alma ve yazma odaklı", en: "Focus on note-taking and writing" },
  },
  {
    id: "pratik",
    icon: Dumbbell,
    label: { tr: "Pratik Modu", en: "Practice Mode" },
    desc: { tr: "Alıştırma ve test çözme", en: "Exercises and tests" },
  },
  {
    id: "ozel",
    icon: Sparkles,
    label: { tr: "Özel Mod", en: "Custom Mode" },
    desc: { tr: "Kendi odak modunuzu oluşturun", en: "Create your own focus mode" },
  },
];

export function ModeSelector() {
  const [active, setActive] = useState<string | null>(null);
  const { locale } = useI18n();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {focusModes.map((mode) => (
        <ModeCard
          key={mode.id}
          icon={mode.icon}
          title={mode.label[locale]}
          description={mode.desc[locale]}
          active={active === mode.id}
          onClick={() => setActive(active === mode.id ? null : mode.id)}
        />
      ))}
    </div>
  );
}
