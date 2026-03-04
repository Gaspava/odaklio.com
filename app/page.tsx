"use client";

import { useAuth } from "@/app/providers/AuthProvider";
import LandingPage from "./components/landing/LandingPage";
import AuthGuard from "./components/auth/AuthGuard";
import Dashboard from "./components/dashboard/Dashboard";

export default function Home() {
  const { isAuthenticated, loading, logout } = useAuth();

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

  return (
    <AuthGuard>
      <Dashboard onLogout={logout} initialPage="focus" />
    </AuthGuard>
  );
}
