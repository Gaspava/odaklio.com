"use client";

import { useAuth } from "@/app/providers/AuthProvider";
import AuthGuard from "@/app/components/auth/AuthGuard";
import Dashboard from "@/app/components/dashboard/Dashboard";

export default function HizliOkumaPage() {
  const { logout } = useAuth();

  return (
    <AuthGuard>
      <Dashboard onLogout={logout} initialPage="speedread" />
    </AuthGuard>
  );
}
