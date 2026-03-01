"use client";

import Link from "next/link";
import { Layers } from "lucide-react";
import { Card, Badge } from "@/components/ui";
import { useI18n } from "@/lib/i18n";

const sampleDecks = [
  { id: "1", title: "Fizik Terimleri", cardCount: 24, tags: ["fizik", "bilim"] },
  { id: "2", title: "İngilizce Kelimeler", cardCount: 50, tags: ["dil", "ingilizce"] },
  { id: "3", title: "Tarih Olayları", cardCount: 18, tags: ["tarih"] },
];

export function DeckList() {
  const { locale } = useI18n();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {sampleDecks.map((deck) => (
        <Link key={deck.id} href={`/kartlar/${deck.id}`}>
          <Card variant="interactive">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-accent-muted text-accent shrink-0">
                <Layers size={20} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground truncate">{deck.title}</h3>
                <p className="text-sm text-muted mt-0.5">
                  {deck.cardCount} {locale === "tr" ? "kart" : "cards"}
                </p>
                <div className="flex gap-1.5 mt-2">
                  {deck.tags.map((tag) => (
                    <Badge key={tag}>{tag}</Badge>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        </Link>
      ))}
    </div>
  );
}
