"use client";

import { Card } from "@/components/ui";

export function ReadingDisplay() {
  return (
    <Card className="flex items-center justify-center min-h-[300px]">
      <div className="text-center space-y-4">
        <p className="text-4xl font-bold text-foreground tracking-wide">Odaklio</p>
        <p className="text-sm text-muted">
          Metin burada kelime kelime gösterilecek
        </p>
      </div>
    </Card>
  );
}
