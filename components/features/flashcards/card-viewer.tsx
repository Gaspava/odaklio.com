"use client";

import { useState } from "react";
import { Card, Button } from "@/components/ui";
import { useI18n } from "@/lib/i18n";

export function CardViewer() {
  const [flipped, setFlipped] = useState(false);
  const { t } = useI18n();

  return (
    <div className="space-y-6">
      <div
        onClick={() => setFlipped(!flipped)}
        className="cursor-pointer"
      >
        <Card className="min-h-[250px] flex items-center justify-center transition-all">
          <div className="text-center space-y-2">
            <p className="text-xs text-muted uppercase tracking-wider">
              {flipped ? (t("flip") + " - Cevap") : (t("flip") + " - Soru")}
            </p>
            <p className="text-xl font-medium text-foreground">
              {flipped
                ? "Newton'un ikinci hareket yasası: F = ma"
                : "Kuvvet, kütle ve ivme arasındaki ilişki nedir?"}
            </p>
          </div>
        </Card>
      </div>
      <div className="flex items-center justify-center gap-3">
        <Button variant="secondary" size="sm">
          {t("easy")}
        </Button>
        <Button variant="secondary" size="sm">
          {t("medium")}
        </Button>
        <Button variant="secondary" size="sm">
          {t("hard")}
        </Button>
      </div>
    </div>
  );
}
