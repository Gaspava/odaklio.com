"use client";

import { Card } from "@/components/ui";
import { HoverExplain } from "./hover-explain";
import { LatexRenderer } from "./latex-renderer";

export function VisualizedText() {
  return (
    <Card className="space-y-6">
      <div className="prose prose-sm max-w-none">
        <h3 className="text-lg font-semibold text-foreground">Newton&apos;un Hareket Yasaları</h3>

        <p className="text-foreground leading-relaxed">
          <HoverExplain text="Eylemsizlik yasası" /> olarak bilinen birinci yasa, bir cisme
          dış kuvvet uygulanmadığı sürece cismin durgun kalacağını veya sabit hızla hareket
          edeceğini belirtir.
        </p>

        <p className="text-foreground leading-relaxed">
          İkinci yasa, kuvvet ile ivme arasındaki ilişkiyi tanımlar:
        </p>

        <LatexRenderer expression="F = m × a" block />

        <p className="text-foreground leading-relaxed">
          Burada <LatexRenderer expression="F" /> kuvveti (Newton),{" "}
          <LatexRenderer expression="m" /> kütleyi (kg) ve{" "}
          <LatexRenderer expression="a" /> ivmeyi (m/s²) temsil eder.
        </p>
      </div>
    </Card>
  );
}
