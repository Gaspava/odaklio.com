"use client";

import { Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui";
import { useI18n } from "@/lib/i18n";

export function TimerControls() {
  const { t } = useI18n();

  return (
    <div className="flex items-center justify-center gap-3">
      <Button variant="secondary" size="lg">
        <RotateCcw size={18} className="mr-2" />
        {t("reset")}
      </Button>
      <Button size="lg">
        <Play size={18} className="mr-2" />
        {t("start")}
      </Button>
      <Button variant="secondary" size="lg">
        <Pause size={18} className="mr-2" />
        {t("pause")}
      </Button>
    </div>
  );
}
