import { cn } from "@/lib/utils";

interface BadgeProps {
  variant?: "default" | "accent" | "success" | "warning";
  children: React.ReactNode;
  className?: string;
}

export function Badge({ variant = "default", children, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-[var(--radius-full)] px-2 py-0.5 text-xs font-medium",
        variant === "default" && "bg-surface-hover text-foreground",
        variant === "accent" && "bg-accent-muted text-accent",
        variant === "success" && "bg-success/10 text-success",
        variant === "warning" && "bg-warning/10 text-warning",
        className
      )}
    >
      {children}
    </span>
  );
}
