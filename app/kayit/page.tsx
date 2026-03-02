"use client";

import { useState } from "react";
import { useAuth } from "@/app/providers/AuthProvider";
import { useTheme } from "@/app/providers/ThemeProvider";
import { IconSun, IconMoon } from "@/app/components/icons/Icons";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function KayitPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { signup } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!agreed) {
      setError("Kullanım koşullarını kabul etmelisiniz.");
      return;
    }

    setLoading(true);

    const result = await signup(email, password, fullName);
    if (result.error) {
      setError(translateError(result.error));
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="auth-page">
        <div className="auth-bg-glow" />
        <div className="auth-bg-glow-2" />
        <div className="auth-topbar">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl text-white text-sm font-bold"
              style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow-sm)" }}
            >
              O
            </div>
            <span className="text-lg font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
              Odaklio
            </span>
          </Link>
        </div>
        <div className="auth-card-wrapper">
          <div className="auth-card" style={{ textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h1 className="auth-title">Hesabın Oluşturuldu!</h1>
            <p className="auth-subtitle" style={{ marginBottom: 24 }}>
              E-posta adresine bir doğrulama linki gönderdik. Gelen kutunu kontrol edip linke tıkla, ardından giriş yapabilirsin.
            </p>
            <Link href="/giris" className="auth-submit" style={{ textDecoration: "none", display: "inline-flex" }}>
              Giriş Sayfasına Git
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-bg-glow" />
      <div className="auth-bg-glow-2" />

      {/* Top bar */}
      <div className="auth-topbar">
        <Link href="/" className="flex items-center gap-2.5 no-underline">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl text-white text-sm font-bold"
            style={{ background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow-sm)" }}
          >
            O
          </div>
          <span className="text-lg font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
            Odaklio
          </span>
        </Link>
        <button
          onClick={toggleTheme}
          className="landing-theme-btn"
          style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}
        >
          {theme === "dark" ? <IconSun size={16} /> : <IconMoon size={16} />}
        </button>
      </div>

      {/* Auth card */}
      <div className="auth-card-wrapper">
        <div className="auth-card">
          <div className="auth-card-header">
            <h1 className="auth-title">Hesap Oluştur</h1>
            <p className="auth-subtitle">Ücretsiz hesabını oluştur ve öğrenmeye başla</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-field">
              <label className="auth-label">Ad Soyad</label>
              <div className="auth-input-wrapper">
                <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Adını ve soyadını gir"
                  className="auth-input"
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">E-posta</label>
              <div className="auth-input-wrapper">
                <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ornek@email.com"
                  className="auth-input"
                  required
                />
              </div>
            </div>

            <div className="auth-field">
              <label className="auth-label">Şifre</label>
              <div className="auth-input-wrapper">
                <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="En az 6 karakter"
                  className="auth-input"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="auth-input-toggle"
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                      <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Terms checkbox */}
            <label className="auth-checkbox-wrapper">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="auth-checkbox"
              />
              <span className="auth-checkbox-label">
                <span style={{ color: "var(--text-tertiary)" }}>
                  Kullanım koşullarını ve gizlilik politikasını kabul ediyorum.
                </span>
              </span>
            </label>

            {error && (
              <div className="auth-error">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? (
                <div className="auth-spinner" />
              ) : (
                <>
                  Hesap Oluştur
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="auth-footer">
            <span style={{ color: "var(--text-tertiary)" }}>Zaten hesabın var mı?</span>
            <Link href="/giris" className="auth-link">Giriş Yap</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function translateError(msg: string): string {
  if (msg.includes("already registered")) return "Bu e-posta adresi zaten kayıtlı. Giriş yapmayı dene.";
  if (msg.includes("valid email")) return "Geçerli bir e-posta adresi gir.";
  if (msg.includes("at least 6")) return "Şifre en az 6 karakter olmalı.";
  if (msg.includes("Too many requests")) return "Çok fazla deneme yaptın. Biraz bekleyip tekrar dene.";
  return msg;
}
