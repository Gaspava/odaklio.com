"use client";

import { useState, useEffect } from "react";
import { useTheme } from "@/app/providers/ThemeProvider";
import { IconSun, IconMoon } from "../icons/Icons";
import Link from "next/link";

const features = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <path d="M8 10h.01" /><path d="M12 10h.01" /><path d="M16 10h.01" />
      </svg>
    ),
    title: "AI Sohbet",
    desc: "Gemini destekli akıllı asistan ile her konuda derinlemesine sohbet et. Sorularını sor, anında detaylı cevaplar al.",
    color: "#3b82f6",
    gradient: "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </svg>
    ),
    title: "Pomodoro Zamanlayıcı",
    desc: "Verimli çalışma seansları oluştur. Odaklanma sürelerini takip et, molaları planla ve üretkenliğini artır.",
    color: "var(--accent-danger)",
    gradient: "var(--gradient-warm)",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    title: "Zihin Haritası",
    desc: "Konuları görsel olarak keşfet. Bağımsız sohbet düğümleriyle paralel konuşmalar yürüt, fikirleri bağla.",
    color: "var(--accent-purple)",
    gradient: "var(--gradient-accent)",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        <path d="M8 7h8" /><path d="M8 11h6" />
      </svg>
    ),
    title: "Hızlı Okuma",
    desc: "Okuma hızını kat kat artır. Kelime kelime veya cümle cümle hızlı okuma alıştırmaları yap.",
    color: "var(--accent-secondary)",
    gradient: "var(--gradient-secondary)",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <path d="M8 21h8" /><path d="M12 17v4" />
        <path d="M7 8l3 3-3 3" /><path d="M13 12h4" />
      </svg>
    ),
    title: "Flashcard'lar",
    desc: "Tekrar kartlarıyla öğrendiklerini pekiştir. Aktif geri çağırma yöntemiyle kalıcı öğrenme sağla.",
    color: "var(--accent-warning)",
    gradient: "var(--gradient-warm)",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
    title: "AI Mentor",
    desc: "4 farklı kişilik: Ders Koçu, Psikolog, Kanka ve Uzman. Duruma göre en uygun mentoru seç.",
    color: "var(--accent-cyan)",
    gradient: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)",
  },
];

const stats = [
  { value: "10K+", label: "Aktif Kullanıcı" },
  { value: "500K+", label: "Sohbet Mesajı" },
  { value: "50K+", label: "Pomodoro Seansı" },
  { value: "4.9", label: "Kullanıcı Puanı" },
];

const testimonials = [
  {
    name: "Elif Yılmaz",
    role: "Tıp Öğrencisi",
    text: "Odaklio sayesinde sınav çalışma sürecim tamamen değişti. AI mentor özelliği ile zor konuları kolayca anlıyorum.",
    avatar: "EY",
  },
  {
    name: "Ahmet Kaya",
    role: "Yazılım Mühendisi",
    text: "Pomodoro ve zihin haritası birlikte kullanınca üretkenliğim inanılmaz arttı. Tek platformda her şey var.",
    avatar: "AK",
  },
  {
    name: "Zeynep Demir",
    role: "Üniversite Öğrencisi",
    text: "Hızlı okuma özelliği muhteşem! Kitap okuma hızım 2 katına çıktı. Flashcard'lar ile sınavlara hazırlanıyorum.",
    avatar: "ZD",
  },
];

export default function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="landing-page" style={{ background: "var(--bg-primary)", color: "var(--text-primary)" }}>
      {/* ===== NAVBAR ===== */}
      <nav
        className={`landing-nav ${scrolled ? "landing-nav-scrolled" : ""}`}
        style={{
          background: scrolled ? "var(--bg-glass-heavy)" : "transparent",
          borderBottom: scrolled ? "1px solid var(--border-primary)" : "1px solid transparent",
        }}
      >
        <div className="landing-nav-inner">
          <div className="flex items-center gap-3">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl text-white text-sm font-bold"
              style={{ background: "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)", boxShadow: "var(--shadow-glow-sm)" }}
            >
              O
            </div>
            <span className="text-lg font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
              Odaklio
            </span>
          </div>

          {/* Desktop nav */}
          <div className="landing-nav-links">
            <a href="#features" className="landing-nav-link">Özellikler</a>
            <a href="#how-it-works" className="landing-nav-link">Nasıl Çalışır</a>
            <a href="#testimonials" className="landing-nav-link">Yorumlar</a>
          </div>

          <div className="landing-nav-actions">
            <button onClick={toggleTheme} className="landing-theme-btn" style={{ background: "var(--bg-tertiary)", color: "var(--text-secondary)" }}>
              {theme === "dark" ? <IconSun size={16} /> : <IconMoon size={16} />}
            </button>
            <Link href="/giris" className="landing-btn-ghost">Giriş Yap</Link>
            <Link href="/kayit" className="landing-btn-primary">
              Ücretsiz Başla
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button className="landing-hamburger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18" /><path d="M6 6l12 12" /></svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 12h18" /><path d="M3 6h18" /><path d="M3 18h18" /></svg>
            )}
          </button>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="landing-mobile-menu" style={{ background: "var(--bg-secondary)", borderTop: "1px solid var(--border-primary)" }}>
            <a href="#features" className="landing-mobile-link" onClick={() => setMobileMenuOpen(false)}>Özellikler</a>
            <a href="#how-it-works" className="landing-mobile-link" onClick={() => setMobileMenuOpen(false)}>Nasıl Çalışır</a>
            <a href="#testimonials" className="landing-mobile-link" onClick={() => setMobileMenuOpen(false)}>Yorumlar</a>
            <div className="landing-mobile-actions">
              <Link href="/giris" className="landing-btn-ghost" style={{ width: "100%", justifyContent: "center" }}>Giriş Yap</Link>
              <Link href="/kayit" className="landing-btn-primary" style={{ width: "100%", justifyContent: "center" }}>Ücretsiz Başla</Link>
            </div>
          </div>
        )}
      </nav>

      {/* ===== HERO ===== */}
      <section className="landing-hero">
        <div className="landing-hero-glow" />
        <div className="landing-hero-glow-2" />
        <div className="landing-container" style={{ position: "relative", zIndex: 1 }}>
          <div className="landing-hero-content">
            <div className="landing-badge">
              <span className="landing-badge-dot" />
              AI Destekli Öğrenme Platformu
            </div>
            <h1 className="landing-hero-title">
              Öğrenmeyi{" "}
              <span className="gradient-text-hero">Dönüştür</span>
              ,<br />
              Odaklanmayı{" "}
              <span className="gradient-text-hero">Güçlendir</span>
            </h1>
            <p className="landing-hero-desc">
              Yapay zeka destekli sohbet, hızlı okuma, zihin haritaları, pomodoro zamanlayıcı
              ve kişiselleştirilmiş mentor ile öğrenme deneyimini bir üst seviyeye taşı.
            </p>
            <div className="landing-hero-actions">
              <Link href="/kayit" className="landing-btn-primary landing-btn-lg">
                Hemen Başla — Ücretsiz
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
                </svg>
              </Link>
              <a href="#features" className="landing-btn-secondary landing-btn-lg">
                Keşfet
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </a>
            </div>
          </div>

          {/* Hero visual */}
          <div className="landing-hero-visual">
            <div className="landing-hero-mockup">
              <div className="landing-mockup-header">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: "#ef4444" }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: "#f59e0b" }} />
                  <div className="w-3 h-3 rounded-full" style={{ background: "#22c55e" }} />
                </div>
                <span style={{ color: "var(--text-tertiary)", fontSize: 11 }}>Odaklio AI Chat</span>
              </div>
              <div className="landing-mockup-body">
                <div className="landing-mockup-msg landing-mockup-msg-user">
                  Kuantum fiziğini basit bir şekilde açıklar mısın?
                </div>
                <div className="landing-mockup-msg landing-mockup-msg-ai">
                  <div className="landing-mockup-typing">
                    <span /><span /><span />
                  </div>
                  Tabii ki! Kuantum fiziği, atomaltı parçacıkların davranışlarını inceleyen bir fizik dalıdır. Günlük hayattan farklı olarak, bu küçük parçacıklar aynı anda birden fazla durumda bulunabilir...
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== STATS ===== */}
      <section className="landing-stats">
        <div className="landing-container">
          <div className="landing-stats-grid">
            {stats.map((stat, i) => (
              <div key={i} className="landing-stat-item">
                <span className="landing-stat-value gradient-text-hero">{stat.value}</span>
                <span className="landing-stat-label">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="landing-features">
        <div className="landing-container">
          <div className="landing-section-header">
            <span className="landing-section-badge" style={{ background: "var(--accent-primary-light)", color: "var(--accent-primary)" }}>
              Özellikler
            </span>
            <h2 className="landing-section-title">
              Öğrenme için ihtiyacın olan{" "}
              <span className="gradient-text-hero">her şey</span>
            </h2>
            <p className="landing-section-desc">
              Tek platformda yapay zeka, verimlilik araçları ve kişiselleştirilmiş öğrenme deneyimi.
            </p>
          </div>
          <div className="landing-features-grid">
            {features.map((f, i) => (
              <div key={i} className="landing-feature-card" style={{ animationDelay: `${i * 0.08}s` }}>
                <div className="landing-feature-icon" style={{ background: `${f.color}15`, color: f.color }}>
                  {f.icon}
                </div>
                <h3 className="landing-feature-title">{f.title}</h3>
                <p className="landing-feature-desc">{f.desc}</p>
                <div className="landing-feature-line" style={{ background: f.gradient }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" className="landing-how">
        <div className="landing-container">
          <div className="landing-section-header">
            <span className="landing-section-badge" style={{ background: "var(--accent-secondary-light)", color: "var(--accent-secondary)" }}>
              Nasıl Çalışır
            </span>
            <h2 className="landing-section-title">
              3 adımda{" "}
              <span className="gradient-text-hero">öğrenmeye başla</span>
            </h2>
          </div>
          <div className="landing-steps">
            <div className="landing-step">
              <div className="landing-step-number" style={{ background: "var(--gradient-primary)" }}>1</div>
              <h3 className="landing-step-title">Hesap Oluştur</h3>
              <p className="landing-step-desc">Ücretsiz hesabını saniyeler içinde oluştur ve platforma giriş yap.</p>
            </div>
            <div className="landing-step-connector">
              <svg width="40" height="2" viewBox="0 0 40 2"><line x1="0" y1="1" x2="40" y2="1" stroke="var(--border-primary)" strokeWidth="2" strokeDasharray="4 4" /></svg>
            </div>
            <div className="landing-step">
              <div className="landing-step-number" style={{ background: "var(--gradient-secondary)" }}>2</div>
              <h3 className="landing-step-title">Araçlarını Seç</h3>
              <p className="landing-step-desc">AI sohbet, pomodoro, zihin haritası veya mentor — ihtiyacına uygun aracı kullan.</p>
            </div>
            <div className="landing-step-connector">
              <svg width="40" height="2" viewBox="0 0 40 2"><line x1="0" y1="1" x2="40" y2="1" stroke="var(--border-primary)" strokeWidth="2" strokeDasharray="4 4" /></svg>
            </div>
            <div className="landing-step">
              <div className="landing-step-number" style={{ background: "var(--gradient-accent)" }}>3</div>
              <h3 className="landing-step-title">Öğrenmeye Başla</h3>
              <p className="landing-step-desc">Yapay zeka destekli öğrenme deneyiminin keyfini çıkar, gelişimini takip et.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TESTIMONIALS ===== */}
      <section id="testimonials" className="landing-testimonials">
        <div className="landing-container">
          <div className="landing-section-header">
            <span className="landing-section-badge" style={{ background: "var(--accent-purple-light)", color: "var(--accent-purple)" }}>
              Kullanıcı Yorumları
            </span>
            <h2 className="landing-section-title">
              Binlerce öğrenci{" "}
              <span className="gradient-text-hero">Odaklio&apos;yu seviyor</span>
            </h2>
          </div>
          <div className="landing-testimonials-grid">
            {testimonials.map((t, i) => (
              <div key={i} className="landing-testimonial-card">
                <div className="landing-testimonial-stars">
                  {[...Array(5)].map((_, j) => (
                    <svg key={j} width="16" height="16" viewBox="0 0 24 24" fill="var(--accent-warning)" stroke="none">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
                <p className="landing-testimonial-text">&ldquo;{t.text}&rdquo;</p>
                <div className="landing-testimonial-author">
                  <div className="landing-testimonial-avatar" style={{ background: "var(--gradient-primary)" }}>
                    {t.avatar}
                  </div>
                  <div>
                    <div className="landing-testimonial-name">{t.name}</div>
                    <div className="landing-testimonial-role">{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="landing-cta">
        <div className="landing-container">
          <div className="landing-cta-card">
            <div className="landing-cta-glow" />
            <h2 className="landing-cta-title">
              Öğrenme yolculuğuna{" "}
              <span className="gradient-text-hero">bugün başla</span>
            </h2>
            <p className="landing-cta-desc">
              Ücretsiz hesabını oluştur ve yapay zeka destekli öğrenme platformunun tüm özelliklerini keşfet.
            </p>
            <div className="landing-hero-actions" style={{ justifyContent: "center" }}>
              <Link href="/kayit" className="landing-btn-primary landing-btn-lg">
                Ücretsiz Hesap Oluştur
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="landing-footer">
        <div className="landing-container">
          <div className="landing-footer-inner">
            <div className="flex items-center gap-3">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-xl text-white text-xs font-bold"
                style={{ background: "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)", boxShadow: "var(--shadow-glow-sm)" }}
              >
                O
              </div>
              <span className="text-sm font-bold" style={{ color: "var(--text-primary)" }}>Odaklio</span>
            </div>
            <p style={{ color: "var(--text-tertiary)", fontSize: 13 }}>
              &copy; 2025 Odaklio. Tüm hakları saklıdır.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
