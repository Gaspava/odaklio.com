"use client";

import { useI18n } from "@/lib/i18n";
import { VisualizedText } from "@/components/features/content/visualized-text";

export default function VisualTextPage() {
  const { locale } = useI18n();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {locale === "tr" ? "Görsel Metinler" : "Visual Texts"}
        </h1>
        <p className="mt-1 text-muted">
          {locale === "tr"
            ? "Metinleri görselleştirilmiş ve etkileşimli şekilde inceleyin"
            : "Explore texts in a visualized and interactive way"}
        </p>
      </div>
      <VisualizedText />
    </div>
  );
}
