"use client";

import { useEffect, use } from "react";
import { useAuth } from "@/app/providers/AuthProvider";
import { useConversation } from "@/app/providers/ConversationProvider";
import LandingPage from "@/app/components/landing/LandingPage";
import Dashboard from "@/app/components/dashboard/Dashboard";

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { isAuthenticated, loading, logout } = useAuth();
  const { loadConversation, activeConversationId } = useConversation();

  useEffect(() => {
    if (isAuthenticated && id && activeConversationId !== id) {
      loadConversation(id);
    }
  }, [isAuthenticated, id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div style={{ background: "var(--bg-primary)", height: "100dvh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="auth-spinner" style={{ width: 32, height: 32 }} />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  return <Dashboard onLogout={logout} initialPage="focus" />;
}
