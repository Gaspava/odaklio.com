"use client";

import AuthGuard from "../components/auth/AuthGuard";
import ProfilePage from "../components/pages/ProfilePage";

export default function ProfilRoute() {
  return (
    <AuthGuard>
      <ProfilePage />
    </AuthGuard>
  );
}
