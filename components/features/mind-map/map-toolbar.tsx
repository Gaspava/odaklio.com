"use client";

import { Plus, Link2, ZoomIn, ZoomOut, Download } from "lucide-react";
import { Button } from "@/components/ui";

export function MapToolbar() {
  return (
    <div className="flex items-center gap-1">
      <Button variant="ghost" size="sm" title="Düğüm Ekle">
        <Plus size={16} />
      </Button>
      <Button variant="ghost" size="sm" title="Bağlantı Ekle">
        <Link2 size={16} />
      </Button>
      <div className="w-px h-6 bg-border mx-1" />
      <Button variant="ghost" size="sm" title="Yakınlaştır">
        <ZoomIn size={16} />
      </Button>
      <Button variant="ghost" size="sm" title="Uzaklaştır">
        <ZoomOut size={16} />
      </Button>
      <div className="w-px h-6 bg-border mx-1" />
      <Button variant="ghost" size="sm" title="İndir">
        <Download size={16} />
      </Button>
    </div>
  );
}
