"use client";

import { Card, Input, Button } from "@/components/ui";
import { useI18n } from "@/lib/i18n";

export function CardEditor() {
  const { locale } = useI18n();

  return (
    <Card className="space-y-4">
      <h3 className="font-semibold text-foreground">
        {locale === "tr" ? "Yeni Kart Oluştur" : "Create New Card"}
      </h3>
      <Input
        label={locale === "tr" ? "Ön Yüz (Soru)" : "Front (Question)"}
        placeholder={locale === "tr" ? "Soruyu yazın..." : "Write the question..."}
      />
      <Input
        label={locale === "tr" ? "Arka Yüz (Cevap)" : "Back (Answer)"}
        placeholder={locale === "tr" ? "Cevabı yazın..." : "Write the answer..."}
      />
      <Button>{locale === "tr" ? "Kaydet" : "Save"}</Button>
    </Card>
  );
}
