import { cn } from "@/lib/utils";
import type { MessageRole } from "@/types/chat";

interface MentorMessageProps {
  role: MessageRole;
  content: string;
}

export function MentorMessage({ role, content }: MentorMessageProps) {
  return (
    <div
      className={cn(
        "flex",
        role === "user" ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "max-w-[85%] rounded-[var(--radius-md)] px-3 py-2 text-sm",
          role === "user"
            ? "bg-accent text-accent-foreground"
            : "bg-surface-hover text-foreground"
        )}
      >
        {content}
      </div>
    </div>
  );
}
