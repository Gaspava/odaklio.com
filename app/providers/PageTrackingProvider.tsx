"use client";

import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useRef,
  ReactNode,
} from "react";
import { useAuth } from "./AuthProvider";
import {
  createPageTrackingRecord,
  finalizePageTracking,
  batchInsertInteractions,
  InteractionType,
} from "@/lib/db/tracking";

interface PageTrackingContextType {
  trackPageChange: (
    pageName: string,
    conversationId?: string | null,
    contentTitle?: string | null,
    contentSubject?: string | null
  ) => void;
  trackInteraction: (
    type: InteractionType,
    conversationId?: string | null,
    subject?: string | null,
    metadata?: Record<string, unknown>
  ) => void;
}

const PageTrackingContext = createContext<PageTrackingContextType>({
  trackPageChange: () => {},
  trackInteraction: () => {},
});

export function usePageTracking() {
  return useContext(PageTrackingContext);
}

export default function PageTrackingProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { user } = useAuth();
  const currentRecordIdRef = useRef<string | null>(null);
  const pageStartRef = useRef<number>(Date.now());
  const currentPageRef = useRef<string>("");
  const pausedAtRef = useRef<number | null>(null);
  const totalPausedRef = useRef(0);
  const userRef = useRef(user);

  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Interaction batching
  const pendingInteractionsRef = useRef<
    {
      user_id: string;
      interaction_type: InteractionType;
      conversation_id?: string | null;
      subject?: string | null;
      metadata?: Record<string, unknown>;
    }[]
  >([]);

  const flushInteractions = useCallback(async () => {
    if (pendingInteractionsRef.current.length === 0) return;
    const batch = [...pendingInteractionsRef.current];
    pendingInteractionsRef.current = [];
    try {
      await batchInsertInteractions(batch);
    } catch (e) {
      console.error("Failed to flush interactions:", e);
      pendingInteractionsRef.current.unshift(...batch);
    }
  }, []);

  const finalizeCurrentPage = useCallback(async () => {
    if (!currentRecordIdRef.current) return;
    const elapsed = Math.round(
      (Date.now() - pageStartRef.current - totalPausedRef.current) / 1000
    );
    if (elapsed < 2) {
      currentRecordIdRef.current = null;
      return;
    }
    try {
      await finalizePageTracking(currentRecordIdRef.current, elapsed);
    } catch (e) {
      console.error("Failed to finalize page tracking:", e);
    }
    currentRecordIdRef.current = null;
  }, []);

  const trackPageChange = useCallback(
    async (
      pageName: string,
      conversationId?: string | null,
      contentTitle?: string | null,
      contentSubject?: string | null
    ) => {
      const currentUser = userRef.current;
      if (!currentUser) return;
      if (pageName === currentPageRef.current) return;

      await finalizeCurrentPage();
      await flushInteractions();

      currentPageRef.current = pageName;
      pageStartRef.current = Date.now();
      totalPausedRef.current = 0;

      try {
        const record = await createPageTrackingRecord(
          currentUser.id,
          pageName,
          conversationId,
          contentTitle,
          contentSubject
        );
        currentRecordIdRef.current = record.id;
      } catch (e) {
        console.error("Failed to create page tracking record:", e);
      }
    },
    [finalizeCurrentPage, flushInteractions]
  );

  const trackInteraction = useCallback(
    (
      type: InteractionType,
      conversationId?: string | null,
      subject?: string | null,
      metadata?: Record<string, unknown>
    ) => {
      const currentUser = userRef.current;
      if (!currentUser) return;
      pendingInteractionsRef.current.push({
        user_id: currentUser.id,
        interaction_type: type,
        conversation_id: conversationId,
        subject,
        metadata,
      });
    },
    []
  );

  // Flush interactions every 30 seconds
  useEffect(() => {
    const interval = setInterval(flushInteractions, 30000);
    return () => clearInterval(interval);
  }, [flushInteractions]);

  // Visibility change handler
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        pausedAtRef.current = Date.now();
      } else {
        if (pausedAtRef.current) {
          totalPausedRef.current += Date.now() - pausedAtRef.current;
          pausedAtRef.current = null;
        }
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);
    return () =>
      document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  // Flush on page unload
  useEffect(() => {
    const handleUnload = () => {
      finalizeCurrentPage();
      flushInteractions();
    };
    window.addEventListener("beforeunload", handleUnload);
    return () => window.removeEventListener("beforeunload", handleUnload);
  }, [finalizeCurrentPage, flushInteractions]);

  return (
    <PageTrackingContext.Provider value={{ trackPageChange, trackInteraction }}>
      {children}
    </PageTrackingContext.Provider>
  );
}
