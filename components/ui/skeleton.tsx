import { cn } from "@/lib/utils";

interface SkeletonProps {
  variant?: "text" | "circle" | "rect" | "card";
  className?: string;
}

export function Skeleton({ variant = "text", className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-surface-hover",
        variant === "text" && "h-4 w-full rounded-[var(--radius-sm)]",
        variant === "circle" && "h-10 w-10 rounded-full",
        variant === "rect" && "h-32 w-full rounded-[var(--radius-md)]",
        variant === "card" && "h-48 w-full rounded-[var(--radius-lg)]",
        className
      )}
    />
  );
}
