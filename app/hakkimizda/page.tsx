import LegalPageLayout from "@/app/components/legal/LegalPageLayout";
import Link from "next/link";

export const metadata = {
  title: "Hakkımızda | Odaklio",
  description: "Odaklio'nun misyonu, teknolojisi ve ekibi hakkında bilgi edinin.",
};

const S = {
  h2: { fontSize: 20, fontWeight: 700, marginTop: 40, marginBottom: 12, color: "var(--text-primary)", letterSpacing: "-0.02em" } as React.CSSProperties,
  h3: { fontSize: 16, fontWeight: 600, marginTop: 24, marginBottom: 8, color: "var(--text-primary)" } as React.CSSProperties,
  p: { marginBottom: 14, color: "var(--text-secondary)", fontSize: 15 } as React.CSSProperties,
  ul: { paddingLeft: 20, marginBottom: 14, color: "var(--text-secondary)", fontSize: 15 } as React.CSSProperties,
  li: { marginBottom: 8, lineHeight: 1.7 } as React.CSSProperties,
  divider: { borderTop: "1px solid var(--border-secondary)", margin: "32px 0" } as React.CSSProperties,
};

const stats = [
  { value: "10.000+", label: "Aktif Kullanıcı" },
  { value: "500.000+", label: "AI Mesajı" },
  { value: "50.000+", label: "Pomodoro Seansı" },
  { value: "4.9/5", label: "Kullanıcı Puanı" },
];

const features = [
  {
    icon: "💬",
    title: "AI Sohbet",
    desc: "Google Gemini destekli yapay zeka asistanı ile her konuyu derinlemesine keşfet.",
  },
  {
    icon: "🧠",
    title: "Zihin Haritası",
    desc: "Paralel konuşma düğümleriyle konuları görsel olarak bağla ve keşfet.",
  },
  {
    icon: "🃏",
    title: "Flashcard'lar",
    desc: "Aktif geri çağırma yöntemiyle öğrendiklerini kalıcı hale getir.",
  },
  {
    icon: "🗺️",
    title: "Yol Haritası",
    desc: "Herhangi bir konuyu öğrenmek için adım adım kişiselleştirilmiş planlar oluştur.",
  },
  {
    icon: "⏱️",
    title: "Pomodoro",
    desc: "Kanıtlanmış Pomodoro tekniğiyle verimliliğini artır ve çalışmalarını takip et.",
  },
  {
    icon: "🤝",
    title: "AI Mentor",
    desc: "Ders Koçu, Psikolog, Kanka veya Uzman; duruma göre doğru mentoru seç.",
  },
];

export default function HakkimizdaPage() {
  return (
    <LegalPageLayout
      title="Hakkımızda"
      subtitle="Odaklio, yapay zekanın gücünü öğrenmeyle buluşturan modern bir öğrenme platformudur."
      lastUpdated="1 Ocak 2025"
    >
      {/* Mission */}
      <div style={{
        background: "var(--gradient-surface)",
        border: "1px solid var(--border-secondary)",
        borderRadius: 16,
        padding: "32px 28px",
        marginBottom: 32,
      }}>
        <p style={{ margin: 0, fontSize: 18, lineHeight: 1.7, color: "var(--text-primary)", fontWeight: 400 }}>
          <strong style={{ color: "var(--accent-primary)" }}>Misyonumuz;</strong> her öğrenciye, her seviyede ve her konuda kişiselleştirilmiş, etkili ve erişilebilir bir öğrenme deneyimi sunmaktır. Yapay zekanın sonsuz kapasitesini Türkçe öğrencilerin hizmetine sunarak eğitimde fırsat eşitliğini destekliyoruz.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 16, marginBottom: 40 }}>
        {stats.map(stat => (
          <div key={stat.value} style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-secondary)",
            borderRadius: 12,
            padding: "20px 16px",
            textAlign: "center",
            boxShadow: "var(--shadow-card)",
          }}>
            <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em", color: "var(--accent-primary)", marginBottom: 4 }}>{stat.value}</div>
            <div style={{ fontSize: 13, color: "var(--text-tertiary)" }}>{stat.label}</div>
          </div>
        ))}
      </div>

      <div style={S.divider} />

      <h2 style={S.h2}>Neden Odaklio?</h2>
      <p style={S.p}>
        Geleneksel öğrenme yöntemleri tek yönlü, pasif ve motivasyon kırıcı olabiliyor. Odaklio, yapay zeka teknolojisini pedagojik ilkelerle birleştirerek öğrenmeyi aktif, kişisel ve eğlenceli hale getiriyor.
      </p>

      {/* Features grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 16, marginBottom: 32 }}>
        {features.map(f => (
          <div key={f.title} style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border-secondary)",
            borderRadius: 12,
            padding: "20px",
            boxShadow: "var(--shadow-card)",
          }}>
            <div style={{ fontSize: 28, marginBottom: 10 }}>{f.icon}</div>
            <div style={{ fontWeight: 700, fontSize: 15, color: "var(--text-primary)", marginBottom: 6 }}>{f.title}</div>
            <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{f.desc}</div>
          </div>
        ))}
      </div>

      <div style={S.divider} />

      <h2 style={S.h2}>Teknoloji Altyapımız</h2>
      <p style={S.p}>
        Odaklio, güvenilirlik ve performans için en güncel teknolojileri kullanmaktadır:
      </p>
      <ul style={S.ul}>
        <li style={S.li}><strong>Yapay Zeka:</strong> Google Gemini — dünyanın en gelişmiş çok modlu yapay zeka modellerinden biri</li>
        <li style={S.li}><strong>Frontend:</strong> Next.js 15 ve React 19 ile sunucu taraflı rendering ve optimal performans</li>
        <li style={S.li}><strong>Veritabanı ve Auth:</strong> Supabase — PostgreSQL tabanlı, SOC 2 sertifikalı güvenli altyapı</li>
        <li style={S.li}><strong>Barındırma:</strong> Vercel Edge Network — küresel dağıtım ile düşük gecikme süresi</li>
        <li style={S.li}><strong>Güvenlik:</strong> TLS/SSL şifreleme, bcrypt parola hashleme, Row Level Security (RLS)</li>
      </ul>

      <div style={S.divider} />

      <h2 style={S.h2}>Yapay Zeka ile Gizlilik Dengesi</h2>
      <p style={S.p}>
        Yapay zeka hizmetleri sunarken gizliliğinizi korumayı öncelik kabul ediyoruz. Sohbet içerikleriniz hizmetin çalışması için Google Gemini API'ye iletilmektedir; ancak bu verileri pazarlama, reklam veya satış amacıyla kullanmıyoruz. Yapay zeka ile hassas kişisel bilgi paylaşmaktan kaçınmanızı öneririz.
      </p>
      <p style={S.p}>
        Veri işleme pratiklerimiz hakkında daha fazla bilgi için:
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
        {[
          { href: "/gizlilik", label: "Gizlilik Politikası" },
          { href: "/kvkk", label: "KVKK Aydınlatma Metni" },
          { href: "/kullanici-sozlesmesi", label: "Kullanıcı Sözleşmesi" },
          { href: "/cerez-politikasi", label: "Çerez Politikası" },
        ].map(link => (
          <Link key={link.href} href={link.href} style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 14px",
            background: "var(--accent-primary-muted)",
            border: "1px solid var(--accent-primary-light)",
            borderRadius: 8,
            color: "var(--accent-primary)",
            textDecoration: "none",
            fontSize: 14,
            fontWeight: 500,
          }}>
            {link.label}
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" /><path d="M12 5l7 7-7 7" />
            </svg>
          </Link>
        ))}
      </div>

      <div style={S.divider} />

      <h2 style={S.h2}>İletişim</h2>
      <p style={S.p}>
        Sorularınız, önerileriniz veya iş birliği teklifleriniz için bizimle iletişime geçebilirsiniz:
      </p>
      <ul style={S.ul}>
        <li style={S.li}><strong>Genel:</strong> destek@odaklio.com</li>
        <li style={S.li}><strong>KVKK / Gizlilik:</strong> kvkk@odaklio.com</li>
        <li style={S.li}><strong>Web:</strong> odaklio.com</li>
      </ul>
      <p style={S.p}>
        Destek talepleriniz iş günleri içinde 5 gün içinde yanıtlanmaktadır.
      </p>
    </LegalPageLayout>
  );
}
