"use client";

import { useState } from "react";
import { Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui";
import { useI18n } from "@/lib/i18n";

export function SpeedControls() {
  const [wpm, setWpm] = useState(250);
  const { t } = useI18n();

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex items-center gap-4">
        <span className="text-sm text-muted">{t("speed")}</span>
        <input
          type="range"
          min={100}
          max={1000}
          step={50}
          value={wpm}
          onChange={(e) => setWpm(Number(e.target.value))}
          className="w-48 accent-accent"
        />
        <span className="text-sm font-medium text-foreground w-20">
          {wpm} {t("wpm")}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="secondary" size="sm">
          <RotateCcw size={16} className="mr-1" />
          {t("reset")}
        </Button>
        <Button size="sm">
          <Play size={16} className="mr-1" />
          {t("play")}
        </Button>
        <Button variant="secondary" size="sm">
          <Pause size={16} className="mr-1" />
          {t("pause")}
        </Button>
      </div>
    </div>
  );
}
