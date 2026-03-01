"use client";

import { useI18n } from "@/lib/i18n";
import { SpeedControls } from "@/components/features/speed-reading/speed-controls";
import { ReadingDisplay } from "@/components/features/speed-reading/reading-display";

export default function SpeedReadingPage() {
  const { locale } = useI18n();

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {locale === "tr" ? "Hızlı Okuma" : "Speed Reading"}
        </h1>
        <p className="mt-1 text-muted">
          {locale === "tr"
            ? "Okuma hızınızı artırın ve metinleri daha verimli okuyun"
            : "Improve your reading speed and read texts more efficiently"}
        </p>
      </div>
      <ReadingDisplay />
      <SpeedControls />
    </div>
  );
}
