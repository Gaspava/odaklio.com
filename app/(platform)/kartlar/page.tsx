"use client";

import { useI18n } from "@/lib/i18n";
import { DeckList } from "@/components/features/flashcards/deck-list";
import { Button } from "@/components/ui";

export default function FlashcardsPage() {
  const { locale, t } = useI18n();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {locale === "tr" ? "Kartlar" : "Flashcards"}
          </h1>
          <p className="mt-1 text-muted">
            {locale === "tr"
              ? "Bilgi kartlarıyla öğrenmenizi pekiştirin"
              : "Reinforce your learning with flashcards"}
          </p>
        </div>
        <Button>{t("newDeck")}</Button>
      </div>
      <DeckList />
    </div>
  );
}
