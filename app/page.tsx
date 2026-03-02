"use client";

import { useAuth } from "@/app/providers/AuthProvider";
import LandingPage from "./components/landing/LandingPage";
import Dashboard from "./components/dashboard/Dashboard";

export default function Home() {
  const { isAuthenticated, logout } = useAuth();

  if (!isAuthenticated) {
    return <LandingPage />;
  }

  return <Dashboard onLogout={logout} />;
}
