"use client";

import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui";
import { Card } from "@/components/ui";
import { Network } from "lucide-react";

const sampleMaps = [
  { id: "1", title: "Fizik Kavramları", nodeCount: 12 },
  { id: "2", title: "Tarih Zaman Çizelgesi", nodeCount: 8 },
  { id: "3", title: "Matematik Formülleri", nodeCount: 15 },
];

export default function MindMapListPage() {
  const { locale } = useI18n();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {locale === "tr" ? "Zihin Haritası" : "Mind Map"}
          </h1>
          <p className="mt-1 text-muted">
            {locale === "tr"
              ? "Fikirlerinizi ve kavramlarınızı görsel olarak organize edin"
              : "Visually organize your ideas and concepts"}
          </p>
        </div>
        <Button>
          {locale === "tr" ? "Yeni Harita" : "New Map"}
        </Button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sampleMaps.map((map) => (
          <Card key={map.id} variant="interactive">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-accent-muted text-accent shrink-0">
                <Network size={20} />
              </div>
              <div>
                <h3 className="font-medium text-foreground">{map.title}</h3>
                <p className="text-sm text-muted mt-0.5">
                  {map.nodeCount} {locale === "tr" ? "düğüm" : "nodes"}
                </p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
