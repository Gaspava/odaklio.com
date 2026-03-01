"use client";

import { useI18n } from "@/lib/i18n";
import { MapCanvas } from "@/components/features/mind-map/map-canvas";
import { MapToolbar } from "@/components/features/mind-map/map-toolbar";

export default function MindMapEditorPage() {
  const { locale } = useI18n();

  return (
    <div className="flex flex-col h-[calc(100vh-var(--header-height)-48px)]">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-foreground">
          {locale === "tr" ? "Zihin Haritası Editörü" : "Mind Map Editor"}
        </h1>
        <MapToolbar />
      </div>
      <MapCanvas />
    </div>
  );
}
