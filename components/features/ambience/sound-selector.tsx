"use client";

import { CloudRain, Wind, Coffee, Radio } from "lucide-react";
import { Card } from "@/components/ui";
import { useI18n } from "@/lib/i18n";

const soundCategories = [
  { id: "yagmur", icon: CloudRain, label: { tr: "Yağmur", en: "Rain" } },
  { id: "ruzgar", icon: Wind, label: { tr: "Rüzgar", en: "Wind" } },
  { id: "kafe", icon: Coffee, label: { tr: "Kafe", en: "Café" } },
  { id: "beyaz", icon: Radio, label: { tr: "Beyaz Gürültü", en: "White Noise" } },
];

export function SoundSelector() {
  const { locale } = useI18n();

  return (
    <div className="grid grid-cols-2 gap-3">
      {soundCategories.map((sound) => {
        const Icon = sound.icon;
        return (
          <Card key={sound.id} variant="interactive" className="p-4">
            <div className="flex flex-col items-center gap-2 text-center">
              <Icon size={24} className="text-muted" />
              <span className="text-xs font-medium text-foreground">{sound.label[locale]}</span>
              <input
                type="range"
                min={0}
                max={100}
                defaultValue={0}
                className="w-full h-1 accent-accent"
              />
            </div>
          </Card>
        );
      })}
    </div>
  );
}
