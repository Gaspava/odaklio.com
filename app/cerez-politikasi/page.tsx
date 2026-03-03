import LegalPageLayout from "@/app/components/legal/LegalPageLayout";

export const metadata = {
  title: "Çerez Politikası | Odaklio",
  description: "Odaklio'nun çerez kullanımı hakkında detaylı bilgi edinin.",
};

const S = {
  h2: { fontSize: 20, fontWeight: 700, marginTop: 40, marginBottom: 12, color: "var(--text-primary)", letterSpacing: "-0.02em" } as React.CSSProperties,
  h3: { fontSize: 16, fontWeight: 600, marginTop: 24, marginBottom: 8, color: "var(--text-primary)" } as React.CSSProperties,
  p: { marginBottom: 14, color: "var(--text-secondary)", fontSize: 15 } as React.CSSProperties,
  ul: { paddingLeft: 20, marginBottom: 14, color: "var(--text-secondary)", fontSize: 15 } as React.CSSProperties,
  li: { marginBottom: 8, lineHeight: 1.7 } as React.CSSProperties,
  box: { background: "var(--accent-primary-muted)", border: "1px solid var(--accent-primary-light)", borderRadius: 12, padding: "16px 20px", marginBottom: 24 } as React.CSSProperties,
  table: { width: "100%", borderCollapse: "collapse" as const, marginBottom: 24, fontSize: 14 },
  th: { background: "var(--bg-tertiary)", padding: "10px 14px", textAlign: "left" as const, fontWeight: 600, color: "var(--text-primary)", border: "1px solid var(--border-primary)" },
  td: { padding: "10px 14px", color: "var(--text-secondary)", border: "1px solid var(--border-secondary)", verticalAlign: "top" as const },
  divider: { borderTop: "1px solid var(--border-secondary)", margin: "32px 0" } as React.CSSProperties,
};

export default function CerezPolitikasiPage() {
  return (
    <LegalPageLayout
      title="Çerez Politikası"
      subtitle="Odaklio'nun çerez kullanımı ve tercihlerinizi nasıl yönetebileceğiniz hakkında bilgi edinin."
      lastUpdated="1 Ocak 2025"
    >
      <div style={S.box}>
        <p style={{ margin: 0, fontSize: 14, color: "var(--accent-primary)", fontWeight: 500 }}>
          Odaklio, platformun çalışması için zorunlu çerezleri kullanmaktadır. Opsiyonel çerezler için tercihlerinizi istediğiniz zaman güncelleyebilirsiniz.
        </p>
      </div>

      <h2 style={S.h2}>1. Çerez Nedir?</h2>
      <p style={S.p}>
        Çerezler, web sitelerinin tarayıcınıza yerleştirdiği küçük metin dosyalarıdır. Bu dosyalar sayesinde web siteleri tercihlerinizi hatırlayabilir ve oturumunuzu açık tutabilir. Çerezler kişisel bilgilerinizi doğrudan içermez.
      </p>

      <div style={S.divider} />

      <h2 style={S.h2}>2. Kullandığımız Çerez Türleri</h2>

      <h3 style={S.h3}>2.1 Zorunlu Çerezler</h3>
      <p style={S.p}>Platformun temel işlevselliği için zorunludur; devre dışı bırakılamaz.</p>
      <table style={S.table}>
        <thead>
          <tr>
            <th style={S.th}>Çerez</th>
            <th style={S.th}>Amaç</th>
            <th style={S.th}>Süre</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={S.td}>Oturum çerezi</td>
            <td style={S.td}>Giriş yapıldıktan sonra kimliğinizi doğrulayarak oturumu açık tutar</td>
            <td style={S.td}>Oturum bitene kadar / 60 gün</td>
          </tr>
          <tr>
            <td style={S.td}>Tema çerezi</td>
            <td style={S.td}>Seçtiğiniz açık/koyu mod tercihini kaydeder</td>
            <td style={S.td}>1 yıl</td>
          </tr>
        </tbody>
      </table>

      <h3 style={S.h3}>2.2 İşlevsel Çerezler</h3>
      <p style={S.p}>Platformu daha kullanışlı hale getiren tercihleri hatırlar.</p>
      <table style={S.table}>
        <thead>
          <tr>
            <th style={S.th}>Çerez</th>
            <th style={S.th}>Amaç</th>
            <th style={S.th}>Süre</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={S.td}>Arayüz tercih çerezi</td>
            <td style={S.td}>Panel durumu ve son kullanılan modun hatırlanması</td>
            <td style={S.td}>30 gün</td>
          </tr>
        </tbody>
      </table>

      <h3 style={S.h3}>2.3 Analitik Çerezler (Opsiyonel)</h3>
      <p style={S.p}>Platformun nasıl kullanıldığını anlamamıza yardımcı olur; devre dışı bırakılabilir.</p>
      <table style={S.table}>
        <thead>
          <tr>
            <th style={S.th}>Amaç</th>
            <th style={S.th}>Süre</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={S.td}>Sayfa görüntüleme ve performans metrikleri (anonim)</td>
            <td style={S.td}>90 gün</td>
          </tr>
        </tbody>
      </table>

      <div style={S.divider} />

      <h2 style={S.h2}>3. Üçüncü Taraf Çerezleri</h2>
      <p style={S.p}>
        Google ile giriş yapma özelliği kullanıldığında Google kendi çerezlerini yerleştirebilir. Bu çerezler Google'ın gizlilik politikasına tabidir.
      </p>

      <div style={S.divider} />

      <h2 style={S.h2}>4. Çerez Tercihlerinizi Yönetme</h2>
      <p style={S.p}>Tüm modern tarayıcılar çerezleri yönetme imkânı sunar:</p>
      <ul style={S.ul}>
        <li style={S.li}><strong>Google Chrome:</strong> Ayarlar → Gizlilik ve Güvenlik → Çerezler ve diğer site verileri</li>
        <li style={S.li}><strong>Mozilla Firefox:</strong> Ayarlar → Gizlilik ve Güvenlik → Çerezler ve Site Verileri</li>
        <li style={S.li}><strong>Safari:</strong> Tercihler → Gizlilik → Çerezleri Engelle</li>
        <li style={S.li}><strong>Microsoft Edge:</strong> Ayarlar → Gizlilik, arama ve hizmetler → Çerezler</li>
      </ul>
      <p style={S.p}>
        <strong>Not:</strong> Zorunlu çerezleri devre dışı bırakırsanız oturum yönetimi ve temel özellikler düzgün çalışmayabilir.
      </p>

      <div style={S.divider} />

      <h2 style={S.h2}>5. İletişim</h2>
      <p style={S.p}>
        <strong>E-posta:</strong> destek@odaklio.com
      </p>
    </LegalPageLayout>
  );
}
