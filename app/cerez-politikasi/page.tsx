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
  badge: (color: string) => ({ display: "inline-block", padding: "2px 8px", borderRadius: 4, fontSize: 12, fontWeight: 600, background: `${color}20`, color }) as React.CSSProperties,
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
        Çerezler, web sitelerinin tarayıcınıza yerleştirdiği küçük metin dosyalarıdır. Bu dosyalar sayesinde web siteleri tercihlerinizi hatırlayabilir, oturumunuzu açık tutabilir ve size daha iyi bir deneyim sunabilir. Çerezler kişisel bilgilerinizi doğrudan içermez; ancak cihazınızı tanımlamak için kullanılabilirler.
      </p>

      <div style={S.divider} />

      <h2 style={S.h2}>2. Kullandığımız Çerez Türleri</h2>

      <h3 style={S.h3}>2.1 Zorunlu Çerezler</h3>
      <p style={S.p}>Bu çerezler platformun temel işlevselliği için zorunludur. Bu çerezler devre dışı bırakıldığında platform düzgün çalışmayabilir.</p>
      <table style={S.table}>
        <thead>
          <tr>
            <th style={S.th}>Çerez Adı</th>
            <th style={S.th}>Amaç</th>
            <th style={S.th}>Süre</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={S.td}><code>sb-access-token</code></td>
            <td style={S.td}>Supabase oturum erişim token'ı — kimlik doğrulama için kullanılır</td>
            <td style={S.td}>1 saat</td>
          </tr>
          <tr>
            <td style={S.td}><code>sb-refresh-token</code></td>
            <td style={S.td}>Oturum yenileme token'ı — oturumu aktif tutmak için kullanılır</td>
            <td style={S.td}>60 gün</td>
          </tr>
          <tr>
            <td style={S.td}><code>odaklio-theme</code></td>
            <td style={S.td}>Kullanıcının seçtiği tema tercihi (açık/koyu mod) kaydedilir</td>
            <td style={S.td}>1 yıl</td>
          </tr>
          <tr>
            <td style={S.td}><code>__Secure-next-auth.session-token</code></td>
            <td style={S.td}>Next.js güvenli oturum yönetimi</td>
            <td style={S.td}>Oturum</td>
          </tr>
        </tbody>
      </table>

      <h3 style={S.h3}>2.2 İşlevsel Çerezler</h3>
      <p style={S.p}>Bu çerezler platformu daha kullanışlı hale getiren özellikleri etkinleştirir.</p>
      <table style={S.table}>
        <thead>
          <tr>
            <th style={S.th}>Çerez Adı</th>
            <th style={S.th}>Amaç</th>
            <th style={S.th}>Süre</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={S.td}><code>odaklio-sidebar-state</code></td>
            <td style={S.td}>Sol panel açık/kapalı durumunun hatırlanması</td>
            <td style={S.td}>30 gün</td>
          </tr>
          <tr>
            <td style={S.td}><code>odaklio-last-mode</code></td>
            <td style={S.td}>Son kullanılan sohbet modunun hatırlanması</td>
            <td style={S.td}>30 gün</td>
          </tr>
        </tbody>
      </table>

      <h3 style={S.h3}>2.3 Analitik Çerezler (Opsiyonel)</h3>
      <p style={S.p}>Bu çerezler, platformun nasıl kullanıldığını anlamamıza ve hizmetleri geliştirmemize yardımcı olur. Bu çerezleri devre dışı bırakabilirsiniz.</p>
      <table style={S.table}>
        <thead>
          <tr>
            <th style={S.th}>Sağlayıcı</th>
            <th style={S.th}>Amaç</th>
            <th style={S.th}>Süre</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={S.td}>Vercel Analytics</td>
            <td style={S.td}>Sayfa görüntüleme ve performans metrikleri (anonim)</td>
            <td style={S.td}>90 gün</td>
          </tr>
        </tbody>
      </table>

      <div style={S.divider} />

      <h2 style={S.h2}>3. Üçüncü Taraf Çerezleri</h2>
      <p style={S.p}>
        Google ile giriş yap özelliği kullanıldığında, Google kendi çerezlerini yerleştirebilir. Bu çerezler Google'ın <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-primary)", textDecoration: "none" }}>Gizlilik Politikası</a>'na tabidir.
      </p>

      <div style={S.divider} />

      <h2 style={S.h2}>4. Çerez Tercihlerinizi Nasıl Yönetirsiniz?</h2>
      <h3 style={S.h3}>4.1 Tarayıcı Ayarları</h3>
      <p style={S.p}>Tüm modern tarayıcılar çerezleri yönetme imkânı sunar. Çerezleri tarayıcınızdan yönetmek için:</p>
      <ul style={S.ul}>
        <li style={S.li}><strong>Google Chrome:</strong> Ayarlar → Gizlilik ve Güvenlik → Çerezler ve diğer site verileri</li>
        <li style={S.li}><strong>Mozilla Firefox:</strong> Ayarlar → Gizlilik ve Güvenlik → Çerezler ve Site Verileri</li>
        <li style={S.li}><strong>Safari:</strong> Tercihler → Gizlilik → Çerezleri Engelle</li>
        <li style={S.li}><strong>Microsoft Edge:</strong> Ayarlar → Gizlilik, arama ve hizmetler → Çerezler</li>
      </ul>
      <p style={S.p}>
        <strong>Not:</strong> Zorunlu çerezleri devre dışı bırakırsanız, oturum yönetimi ve bazı temel özellikler çalışmayabilir.
      </p>

      <h3 style={S.h3}>4.2 Platform Üzerinden Tercih Yönetimi</h3>
      <p style={S.p}>
        Hesap ayarları bölümünden opsiyonel çerez tercihlerinizi güncelleyebilirsiniz. Bu değişiklik anında geçerli olur.
      </p>

      <div style={S.divider} />

      <h2 style={S.h2}>5. Yerel Depolama (localStorage)</h2>
      <p style={S.p}>
        Odaklio, çerezlere ek olarak tarayıcınızın yerel deposunu (localStorage) da kullanmaktadır. Yerel depolamada tutulan veriler:
      </p>
      <ul style={S.ul}>
        <li style={S.li}>Tema tercihi (açık/koyu mod)</li>
        <li style={S.li}>Arayüz ayarları ve panel durumları</li>
        <li style={S.li}>Geçici taslak içerikler</li>
      </ul>
      <p style={S.p}>
        Yerel depolama verilerini tarayıcınızın geliştirici araçlarından veya tarayıcı ayarlarından silebilirsiniz.
      </p>

      <div style={S.divider} />

      <h2 style={S.h2}>6. Politika Güncellemeleri</h2>
      <p style={S.p}>
        Bu Çerez Politikası, hizmetlerimizdeki değişiklikler veya yasal gereklilikler doğrultusunda güncellenebilir. Değişiklikler, platformda duyuru yapılarak kullanıcılara bildirilebilir.
      </p>

      <div style={S.divider} />

      <h2 style={S.h2}>7. İletişim</h2>
      <p style={S.p}>
        Çerez politikamıza ilişkin sorularınız için:<br />
        <strong>E-posta:</strong> destek@odaklio.com
      </p>
    </LegalPageLayout>
  );
}
