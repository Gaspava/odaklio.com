"use client";

import { useEffect, use } from "react";
import { useAuth } from "@/app/providers/AuthProvider";
import { useConversation } from "@/app/providers/ConversationProvider";
import AuthGuard from "@/app/components/auth/AuthGuard";
import Dashboard from "@/app/components/dashboard/Dashboard";

export default function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { logout } = useAuth();
  const { isAuthenticated } = useAuth();
  const { loadConversation, activeConversationId } = useConversation();

  useEffect(() => {
    if (isAuthenticated && id && activeConversationId !== id) {
      loadConversation(id);
    }
  }, [isAuthenticated, id]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <AuthGuard>
      <Dashboard onLogout={logout} initialPage="focus" />
    </AuthGuard>
  );
}
