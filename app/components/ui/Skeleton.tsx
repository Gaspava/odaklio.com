"use client";

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ className = "", style }: SkeletonProps) {
  return (
    <div
      className={`rounded-lg animate-pulse ${className}`}
      style={{ background: "var(--bg-tertiary)", ...style }}
    />
  );
}

export function ChatHistorySkeleton() {
  return (
    <div className="space-y-4">
      {["Bugün", "Bu Hafta"].map((group) => (
        <div key={group}>
          <Skeleton className="w-16 h-3 mb-3" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-xl p-3.5"
                style={{
                  background: "var(--bg-card)",
                  border: "1px solid var(--border-primary)",
                }}
              >
                <div className="flex items-start gap-3">
                  <Skeleton className="h-9 w-9 rounded-lg flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="flex justify-between">
                      <Skeleton className="h-3.5 w-2/3" />
                      <Skeleton className="h-3 w-12" />
                    </div>
                    <Skeleton className="h-3 w-4/5" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function ToolsPageSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl p-4 space-y-3"
            style={{
              background: "var(--bg-card)",
              border: "1px solid var(--border-primary)",
            }}
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-11 w-11 rounded-xl" />
              <Skeleton className="h-5 w-12 rounded-full" />
            </div>
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
          </div>
        ))}
      </div>
      <div
        className="rounded-xl p-4 space-y-3"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border-primary)",
        }}
      >
        <Skeleton className="h-4 w-32" />
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg p-3 flex items-center gap-3" style={{ background: "var(--bg-tertiary)" }}>
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-1/2" />
              <Skeleton className="h-3 w-2/3" />
            </div>
            <Skeleton className="h-7 w-16 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function MessageSkeleton() {
  return (
    <div className="space-y-5">
      <div className="flex justify-end">
        <Skeleton className="h-10 w-48 rounded-2xl" />
      </div>
      <div className="flex gap-2.5">
        <Skeleton className="h-7 w-7 rounded-lg flex-shrink-0 mt-1" />
        <div className="space-y-2 flex-1 max-w-[88%]">
          <Skeleton className="h-4 w-full rounded-xl" />
          <Skeleton className="h-4 w-5/6 rounded-xl" />
          <Skeleton className="h-4 w-4/6 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
