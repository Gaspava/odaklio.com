"use client";

import Link from "next/link";
import { useTheme } from "@/app/providers/ThemeProvider";
import { IconSun, IconMoon } from "@/app/components/icons/Icons";

interface LegalPageLayoutProps {
  title: string;
  subtitle: string;
  lastUpdated: string;
  children: React.ReactNode;
}

export default function LegalPageLayout({ title, subtitle, lastUpdated, children }: LegalPageLayoutProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-primary)", color: "var(--text-primary)" }}>
      {/* Top bar */}
      <div style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        borderBottom: "1px solid var(--border-secondary)",
        background: "var(--bg-glass-heavy)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
              background: "var(--gradient-primary)", boxShadow: "var(--shadow-glow-sm)", color: "white", fontWeight: 700, fontSize: 14,
            }}>O</div>
            <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.02em", color: "var(--text-primary)" }}>Odaklio</span>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={toggleTheme} style={{
              width: 36, height: 36, borderRadius: 8, border: "1px solid var(--border-primary)",
              background: "var(--bg-tertiary)", color: "var(--text-secondary)", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {theme === "dark" ? <IconSun size={16} /> : <IconMoon size={16} />}
            </button>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div style={{ background: "var(--gradient-surface)", borderBottom: "1px solid var(--border-secondary)", padding: "48px 24px 40px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--text-tertiary)", textDecoration: "none", fontSize: 13, marginBottom: 20, transition: "color 0.15s" }}
            onMouseEnter={e => (e.currentTarget.style.color = "var(--accent-primary)")}
            onMouseLeave={e => (e.currentTarget.style.color = "var(--text-tertiary)")}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" /><path d="M12 19l-7-7 7-7" />
            </svg>
            Ana Sayfaya Dön
          </Link>
          <h1 style={{ fontSize: "clamp(28px, 5vw, 40px)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 12, lineHeight: 1.2 }}>{title}</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: 16, marginBottom: 16 }}>{subtitle}</p>
          <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--text-tertiary)", fontSize: 13 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            Son güncelleme: {lastUpdated}
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px 80px" }}>
        <div style={{ lineHeight: 1.8 }}>
          {children}
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: "1px solid var(--border-secondary)", padding: "32px 24px", background: "var(--bg-secondary)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px 32px", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: "var(--gradient-primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontSize: 12, fontWeight: 700 }}>O</div>
              <span style={{ fontWeight: 600, fontSize: 15, color: "var(--text-primary)" }}>Odaklio</span>
              <span style={{ color: "var(--text-tertiary)", fontSize: 13 }}>© 2025 Tüm hakları saklıdır.</span>
            </div>
            <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
              {[
                { href: "/hakkimizda", label: "Hakkımızda" },
                { href: "/kullanici-sozlesmesi", label: "Kullanıcı Sözleşmesi" },
                { href: "/gizlilik", label: "Gizlilik Politikası" },
                { href: "/kvkk", label: "KVKK" },
                { href: "/cerez-politikasi", label: "Çerez Politikası" },
              ].map(link => (
                <Link key={link.href} href={link.href} style={{ color: "var(--text-tertiary)", textDecoration: "none", fontSize: 13, transition: "color 0.15s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "var(--accent-primary)")}
                  onMouseLeave={e => (e.currentTarget.style.color = "var(--text-tertiary)")}>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
