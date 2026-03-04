"use client";

import { useState } from "react";
import { useAuth } from "@/app/providers/AuthProvider";
import { useTheme } from "@/app/providers/ThemeProvider";
import { IconSun, IconMoon } from "@/app/components/icons/Icons";
import Link from "next/link";
import { useRouter } from "next/navigation";

type AuthTab = "email" | "phone";

export default function KayitPage() {
  const [tab, setTab] = useState<AuthTab>("email");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { signup, loginWithGoogle, sendPhoneOtp, verifyPhoneOtp } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!agreed) {
      setError("Kullanim kosullarini kabul etmelisiniz.");
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

  const handleGoogleSignup = async () => {
    setError("");
    setLoading(true);
    const result = await loginWithGoogle();
    if (result.error) {
      setError(translateError(result.error));
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!agreed) {
      setError("Kullanim kosullarini kabul etmelisiniz.");
      return;
    }

    if (!phone.trim()) {
      setError("Telefon numarasini gir.");
      return;
    }

    setLoading(true);
    const result = await sendPhoneOtp(phone);
    if (result.error) {
      setError(translateError(result.error));
      setLoading(false);
    } else {
      setOtpSent(true);
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await verifyPhoneOtp(phone, otpCode);
    if (result.error) {
      setError(translateError(result.error));
      setLoading(false);
    } else {
      router.push("/odak");
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
            <h1 className="auth-title">Hesabin Olusturuldu!</h1>
            <p className="auth-subtitle" style={{ marginBottom: 24 }}>
              E-posta adresine bir dogrulama linki gonderdik. Gelen kutunu kontrol edip linke tikla, ardindan giris yapabilirsin.
            </p>
            <Link href="/giris" className="auth-submit" style={{ textDecoration: "none", display: "inline-flex" }}>
              Giris Sayfasina Git
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
            <h1 className="auth-title">Hesap Olustur</h1>
            <p className="auth-subtitle">Ucretsiz hesabini olustur ve ogrenmeye basla</p>
          </div>

          {/* Google button */}
          <button
            type="button"
            className="auth-social-btn"
            onClick={handleGoogleSignup}
            disabled={loading}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A11.96 11.96 0 0 0 1 12c0 1.94.46 3.77 1.18 5.07l3.66-2.84z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Google ile Uye Ol
          </button>

          {/* Divider */}
          <div className="auth-divider">
            <span className="auth-divider-line" />
            <span className="auth-divider-text">veya</span>
            <span className="auth-divider-line" />
          </div>

          {/* Tabs: Email / Phone */}
          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab ${tab === "email" ? "auth-tab-active" : ""}`}
              onClick={() => { setTab("email"); setError(""); }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              E-posta
            </button>
            <button
              type="button"
              className={`auth-tab ${tab === "phone" ? "auth-tab-active" : ""}`}
              onClick={() => { setTab("phone"); setError(""); setOtpSent(false); setOtpCode(""); }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                <line x1="12" y1="18" x2="12.01" y2="18" />
              </svg>
              Telefon
            </button>
          </div>

          {/* Email tab */}
          {tab === "email" && (
            <form onSubmit={handleEmailSubmit} className="auth-form">
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
                    placeholder="Adini ve soyadini gir"
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
                <label className="auth-label">Sifre</label>
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
                    Kullanim kosullarini ve gizlilik politikasini kabul ediyorum.
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
                    Hesap Olustur
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Phone tab */}
          {tab === "phone" && !otpSent && (
            <form onSubmit={handleSendOtp} className="auth-form">
              <div className="auth-field">
                <label className="auth-label">Telefon Numarasi</label>
                <div className="auth-input-wrapper">
                  <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                    <line x1="12" y1="18" x2="12.01" y2="18" />
                  </svg>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+90 5XX XXX XX XX"
                    className="auth-input"
                    required
                    autoFocus
                  />
                </div>
                <span className="auth-hint">Ulke kodu ile birlikte gir (ornek: +905551234567)</span>
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
                    Kullanim kosullarini ve gizlilik politikasini kabul ediyorum.
                  </span>
                </span>
              </label>

              {error && (
                <div className="auth-error">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                  {error}
                </div>
              )}

              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? (
                  <div className="auth-spinner" />
                ) : (
                  <>
                    Dogrulama Kodu Gonder
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          )}

          {/* OTP verification */}
          {tab === "phone" && otpSent && (
            <form onSubmit={handleVerifyOtp} className="auth-form">
              <div className="auth-otp-info">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                </svg>
                <span><strong>{phone}</strong> numarasina kod gonderildi</span>
              </div>

              <div className="auth-field">
                <label className="auth-label">Dogrulama Kodu</label>
                <div className="auth-input-wrapper">
                  <svg className="auth-input-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                    placeholder="6 haneli kod"
                    className="auth-input"
                    required
                    autoFocus
                    maxLength={6}
                  />
                </div>
              </div>

              {error && (
                <div className="auth-error">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" /><line x1="15" y1="9" x2="9" y2="15" /><line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                  {error}
                </div>
              )}

              <button type="submit" className="auth-submit" disabled={loading}>
                {loading ? (
                  <div className="auth-spinner" />
                ) : (
                  <>
                    Dogrula ve Uye Ol
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
                    </svg>
                  </>
                )}
              </button>

              <button
                type="button"
                className="auth-back-btn"
                onClick={() => { setOtpSent(false); setOtpCode(""); setError(""); }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
                </svg>
                Numarayi degistir
              </button>
            </form>
          )}

          <div className="auth-footer">
            <span style={{ color: "var(--text-tertiary)" }}>Zaten hesabin var mi?</span>
            <Link href="/giris" className="auth-link">Giris Yap</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function translateError(msg: string): string {
  if (msg.includes("already registered")) return "Bu e-posta adresi zaten kayitli. Giris yapmayi dene.";
  if (msg.includes("valid email")) return "Gecerli bir e-posta adresi gir.";
  if (msg.includes("at least 6")) return "Sifre en az 6 karakter olmali.";
  if (msg.includes("Too many requests")) return "Cok fazla deneme yaptin. Biraz bekleyip tekrar dene.";
  if (msg.includes("Phone") && msg.includes("invalid")) return "Gecerli bir telefon numarasi gir.";
  if (msg.includes("Token has expired")) return "Dogrulama kodunun suresi dolmus. Yeni kod iste.";
  if (msg.includes("Invalid otp") || msg.includes("invalid otp")) return "Dogrulama kodu yanlis. Tekrar dene.";
  return msg;
}
