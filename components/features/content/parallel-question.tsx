"use client";

import { useState } from "react";
import { MessageSquarePlus, X } from "lucide-react";
import { Card, Input, Button } from "@/components/ui";

interface ParallelQuestionProps {
  text: string;
}

export function ParallelQuestion({ text }: ParallelQuestionProps) {
  const [open, setOpen] = useState(false);

  return (
    <span className="relative inline">
      <span
        className="bg-accent-muted text-accent px-1 rounded cursor-pointer hover:bg-accent/20"
        onClick={() => setOpen(!open)}
      >
        {text}
        <MessageSquarePlus size={12} className="inline ml-1 mb-0.5" />
      </span>
      {open && (
        <div className="absolute top-full left-0 mt-2 z-20 w-72">
          <Card className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Soru Sor</span>
              <button onClick={() => setOpen(false)} className="text-muted hover:text-foreground cursor-pointer">
                <X size={14} />
              </button>
            </div>
            <p className="text-xs text-muted border-l-2 border-accent pl-2">&ldquo;{text}&rdquo;</p>
            <Input placeholder="Bu kısım hakkında sorunuz..." />
            <Button size="sm" className="w-full">Gönder</Button>
          </Card>
        </div>
      )}
    </span>
  );
}
