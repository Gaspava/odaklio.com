"use client";

import { useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function SoundPlayer() {
  const [muted, setMuted] = useState(true);
  const { t } = useI18n();

  return (
    <div className="fixed bottom-4 right-4 z-20 hidden md:flex">
      <button
        onClick={() => setMuted(!muted)}
        className="flex h-10 items-center gap-2 px-3 rounded-[var(--radius-full)] bg-surface border border-border text-sm text-muted hover:text-foreground hover:bg-surface-hover transition-colors shadow-sm cursor-pointer"
        title={t("backgroundSounds")}
      >
        {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        <span className="text-xs">{t("backgroundSounds")}</span>
      </button>
    </div>
  );
}
