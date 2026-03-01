"use client";

import { Lightbulb, HelpCircle, BookMarked } from "lucide-react";
import { Card, Badge } from "@/components/ui";
import { useI18n } from "@/lib/i18n";

const sampleRecommendations = [
  {
    id: "1",
    title: "Diferansiyel Denklem Türleri",
    description: "Adi ve kısmi diferansiyel denklemlerin farkları",
    type: "konu" as const,
  },
  {
    id: "2",
    title: "F = ma nasıl uygulanır?",
    description: "Newton'un ikinci yasasının pratik uygulamaları",
    type: "soru" as const,
  },
  {
    id: "3",
    title: "Fizik Formülleri Rehberi",
    description: "Sıkça kullanılan fizik formüllerinin derlemesi",
    type: "kaynak" as const,
  },
];

const typeConfig = {
  konu: { icon: BookMarked, badge: "Konu" },
  soru: { icon: HelpCircle, badge: "Soru" },
  kaynak: { icon: Lightbulb, badge: "Kaynak" },
};

export function RecommendationCards() {
  const { locale } = useI18n();
  void locale;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {sampleRecommendations.map((rec) => {
        const config = typeConfig[rec.type];
        const Icon = config.icon;
        return (
          <Card key={rec.id} variant="interactive">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Icon size={18} className="text-accent" />
                <Badge variant="accent">{config.badge}</Badge>
              </div>
              <h3 className="font-medium text-foreground text-sm">{rec.title}</h3>
              <p className="text-xs text-muted">{rec.description}</p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
