import { cn } from "@/lib/utils";
import type { MessageRole } from "@/types/chat";

interface ChatMessageProps {
  role: MessageRole;
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  return (
    <div className={cn("flex", role === "user" ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[70%] rounded-[var(--radius-lg)] px-4 py-3 text-sm",
          role === "user"
            ? "bg-accent text-accent-foreground"
            : "bg-surface border border-border text-foreground"
        )}
      >
        {content}
      </div>
    </div>
  );
}
