"use client";

import { useI18n } from "@/lib/i18n";
import { ModeSelector } from "@/components/features/focus-mode/mode-selector";

export default function FocusModePage() {
  const { locale } = useI18n();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {locale === "tr" ? "Odak Modu" : "Focus Mode"}
        </h1>
        <p className="mt-1 text-muted">
          {locale === "tr"
            ? "Çalışma tarzınıza uygun odak modunu seçin"
            : "Choose the focus mode that suits your study style"}
        </p>
      </div>
      <ModeSelector />
    </div>
  );
}
