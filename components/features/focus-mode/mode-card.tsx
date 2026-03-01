"use client";

import { cn } from "@/lib/utils";
import { Card } from "@/components/ui";
import type { LucideIcon } from "lucide-react";

interface ModeCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  active?: boolean;
  onClick?: () => void;
}

export function ModeCard({ icon: Icon, title, description, active, onClick }: ModeCardProps) {
  return (
    <Card
      variant="interactive"
      className={cn(active && "border-accent bg-accent-muted")}
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className={cn(
          "flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] shrink-0",
          active ? "bg-accent text-accent-foreground" : "bg-surface-hover text-muted"
        )}>
          <Icon size={20} />
        </div>
        <div>
          <h3 className="font-medium text-foreground">{title}</h3>
          <p className="text-sm text-muted mt-0.5">{description}</p>
        </div>
      </div>
    </Card>
  );
}
