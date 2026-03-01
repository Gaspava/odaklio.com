"use client";

import { useI18n } from "@/lib/i18n";
import { CardViewer } from "@/components/features/flashcards/card-viewer";

export default function DeckPage() {
  const { locale } = useI18n();

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          {locale === "tr" ? "Kart Destesi" : "Card Deck"}
        </h1>
        <p className="mt-1 text-muted">
          {locale === "tr"
            ? "Kartları çalışın ve bilginizi test edin"
            : "Study cards and test your knowledge"}
        </p>
      </div>
      <CardViewer />
    </div>
  );
}
