import LegalPageLayout from "@/app/components/legal/LegalPageLayout";

export const metadata = {
  title: "Gizlilik Politikası | Odaklio",
  description: "Odaklio'nun kişisel verilerinizi nasıl topladığını, kullandığını ve koruduğunu öğrenin.",
};

const S = {
  h2: { fontSize: 20, fontWeight: 700, marginTop: 40, marginBottom: 12, color: "var(--text-primary)", letterSpacing: "-0.02em" } as React.CSSProperties,
  h3: { fontSize: 16, fontWeight: 600, marginTop: 24, marginBottom: 8, color: "var(--text-primary)" } as React.CSSProperties,
  p: { marginBottom: 14, color: "var(--text-secondary)", fontSize: 15 } as React.CSSProperties,
  ul: { paddingLeft: 20, marginBottom: 14, color: "var(--text-secondary)", fontSize: 15 } as React.CSSProperties,
  li: { marginBottom: 8, lineHeight: 1.7 } as React.CSSProperties,
  box: { background: "var(--accent-primary-muted)", border: "1px solid var(--accent-primary-light)", borderRadius: 12, padding: "16px 20px", marginBottom: 24 } as React.CSSProperties,
  infoBox: { background: "var(--accent-info-light)", border: "1px solid rgba(59,130,246,0.2)", borderRadius: 12, padding: "16px 20px", marginBottom: 24 } as React.CSSProperties,
  table: { width: "100%", borderCollapse: "collapse" as const, marginBottom: 24, fontSize: 14 },
  th: { background: "var(--bg-tertiary)", padding: "10px 14px", textAlign: "left" as const, fontWeight: 600, color: "var(--text-primary)", border: "1px solid var(--border-primary)" },
  td: { padding: "10px 14px", color: "var(--text-secondary)", border: "1px solid var(--border-secondary)", verticalAlign: "top" as const },
  divider: { borderTop: "1px solid var(--border-secondary)", margin: "32px 0" } as React.CSSProperties,
};

export default function GizlilikPage() {
  return (
    <LegalPageLayout
      title="Gizlilik Politikası"
      subtitle="Kişisel verilerinizin güvenliği bizim için önceliktir. Bu politika, hangi verileri topladığımızı ve nasıl kullandığımızı açıklar."
      lastUpdated="1 Ocak 2025"
    >
      <div style={S.box}>
        <p style={{ margin: 0, fontSize: 14, color: "var(--accent-primary)", fontWeight: 500 }}>
          Odaklio olarak 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamındaki yükümlülüklerimizi eksiksiz yerine getirmeyi taahhüt ediyoruz.
        </p>
      </div>

      <h2 style={S.h2}>1. Veri Sorumlusu</h2>
      <p style={S.p}>
        6698 sayılı KVKK kapsamında veri sorumlusu sıfatını taşıyan Odaklio, kişisel verilerinizi bu politikada açıklanan amaçlar doğrultusunda işlemektedir.
      </p>
      <p style={S.p}><strong>İletişim:</strong> destek@odaklio.com</p>

      <div style={S.divider} />

      <h2 style={S.h2}>2. Toplanan Kişisel Veriler</h2>
      <h3 style={S.h3}>2.1 Doğrudan Sağladığınız Veriler</h3>
      <table style={S.table}>
        <thead>
          <tr>
            <th style={S.th}>Veri Türü</th>
            <th style={S.th}>Amaç</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={S.td}><strong>Ad Soyad</strong></td>
            <td style={S.td}>Hesap oluşturma ve kişiselleştirme</td>
          </tr>
          <tr>
            <td style={S.td}><strong>E-posta Adresi</strong></td>
            <td style={S.td}>Hesap girişi ve bildirimler</td>
          </tr>
          <tr>
            <td style={S.td}><strong>Telefon Numarası</strong></td>
            <td style={S.td}>SMS ile kimlik doğrulama (telefon kaydı tercih edilirse)</td>
          </tr>
        </tbody>
      </table>

      <h3 style={S.h3}>2.2 Otomatik Olarak Toplanan Veriler</h3>
      <table style={S.table}>
        <thead>
          <tr>
            <th style={S.th}>Veri Türü</th>
            <th style={S.th}>Açıklama</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={S.td}><strong>Kullanım Verileri</strong></td>
            <td style={S.td}>Hangi özelliklerin kullanıldığı, oturum süreleri</td>
          </tr>
          <tr>
            <td style={S.td}><strong>Sohbet İçerikleri</strong></td>
            <td style={S.td}>Yapay zeka ile gerçekleştirilen konuşmalar (şifreli olarak saklanır)</td>
          </tr>
          <tr>
            <td style={S.td}><strong>Cihaz Bilgileri</strong></td>
            <td style={S.td}>Tarayıcı türü, işletim sistemi</td>
          </tr>
          <tr>
            <td style={S.td}><strong>IP Adresi</strong></td>
            <td style={S.td}>Güvenlik amacıyla ve yasal zorunluluklar için</td>
          </tr>
          <tr>
            <td style={S.td}><strong>Öğrenme İçerikleri</strong></td>
            <td style={S.td}>Oluşturulan notlar, kartlar, yol haritaları ve çalışma verileri</td>
          </tr>
        </tbody>
      </table>

      <div style={S.divider} />

      <h2 style={S.h2}>3. Verilerin İşlenme Amaçları</h2>
      <ul style={S.ul}>
        <li style={S.li}><strong>Hizmet Sunumu:</strong> Hesap oluşturma, kimlik doğrulama ve platform hizmetlerinin sağlanması</li>
        <li style={S.li}><strong>Kişiselleştirme:</strong> Öğrenme geçmişinize göre kişiselleştirilmiş deneyim sunulması</li>
        <li style={S.li}><strong>Yapay Zeka Hizmeti:</strong> AI yanıtlarının üretilmesi amacıyla ilgili içeriklerin işlenmesi</li>
        <li style={S.li}><strong>İletişim:</strong> Hesap bildirimleri ve güvenlik uyarıları</li>
        <li style={S.li}><strong>Güvenlik:</strong> Yetkisiz erişim ve kötüye kullanımın önlenmesi</li>
        <li style={S.li}><strong>Yasal Yükümlülükler:</strong> Kanuni saklama sürelerine uyum</li>
      </ul>

      <div style={S.divider} />

      <h2 style={S.h2}>4. Yapay Zeka Hizmeti ve Veri Paylaşımı</h2>
      <div style={S.infoBox}>
        <p style={{ margin: 0, fontSize: 14, color: "var(--accent-secondary)", fontWeight: 500 }}>
          ℹ️ Yapay zeka ile paylaştığınız içerikler, hizmetin sunulabilmesi için üçüncü taraf bir yapay zeka sağlayıcısına iletilmektedir.
        </p>
      </div>
      <ul style={S.ul}>
        <li style={S.li}>Sohbet içerikleriniz yalnızca yapay zeka yanıtlarının üretilmesi amacıyla kullanılır.</li>
        <li style={S.li}>Bu veriler reklam veya pazarlama amacıyla kullanılmaz.</li>
        <li style={S.li}>Yapay zekaya TC kimlik numarası, sağlık verisi veya finansal bilgi gibi hassas kişisel verileri paylaşmaktan kaçınmanızı tavsiye ederiz.</li>
      </ul>

      <div style={S.divider} />

      <h2 style={S.h2}>5. Veri Saklama Süreleri</h2>
      <table style={S.table}>
        <thead>
          <tr>
            <th style={S.th}>Veri Kategorisi</th>
            <th style={S.th}>Saklama Süresi</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={S.td}>Hesap bilgileri</td>
            <td style={S.td}>Hesap silinene kadar + 90 gün</td>
          </tr>
          <tr>
            <td style={S.td}>Sohbet geçmişi</td>
            <td style={S.td}>Hesap silinene kadar; kullanıcı istediğinde silinebilir</td>
          </tr>
          <tr>
            <td style={S.td}>Erişim günlükleri</td>
            <td style={S.td}>90 gün</td>
          </tr>
          <tr>
            <td style={S.td}>Ödeme kayıtları</td>
            <td style={S.td}>10 yıl (Türk Ticaret Kanunu gereği)</td>
          </tr>
        </tbody>
      </table>

      <div style={S.divider} />

      <h2 style={S.h2}>6. Veri Güvenliği</h2>
      <p style={S.p}>
        Verilerinizin korunması için endüstri standardı güvenlik önlemleri uygulanmaktadır: aktarım sırasında şifreleme, şifreli depolama ve erişim kontrolü. Verileriniz güvenli bulut altyapısında saklanmaktadır.
      </p>

      <div style={S.divider} />

      <h2 style={S.h2}>7. Üçüncü Taraflarla Paylaşım</h2>
      <p style={S.p}>Verileriniz aşağıdaki durumlar dışında üçüncü taraflarla paylaşılmaz:</p>
      <ul style={S.ul}>
        <li style={S.li}><strong>Yapay Zeka Sağlayıcısı:</strong> Yalnızca AI yanıtlarının üretilmesi amacıyla sohbet içerikleri</li>
        <li style={S.li}><strong>Ödeme İşlemcileri:</strong> Ödeme bilgileri güvenli ödeme altyapısı aracılığıyla işlenir</li>
        <li style={S.li}><strong>Yasal Zorunluluklar:</strong> Mahkeme kararı veya yasal yükümlülük halinde yetkili mercilere</li>
      </ul>
      <p style={S.p}>Verileriniz hiçbir koşulda reklam amaçlı üçüncü taraflara satılmaz.</p>

      <div style={S.divider} />

      <h2 style={S.h2}>8. Kullanıcı Hakları</h2>
      <p style={S.p}>KVKK'nın 11. maddesi kapsamında şu haklara sahipsiniz:</p>
      <ul style={S.ul}>
        <li style={S.li}>Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
        <li style={S.li}>İşlenen verilere erişim talep etme</li>
        <li style={S.li}>Yanlış veya eksik verilerin düzeltilmesini isteme</li>
        <li style={S.li}>Yasal şartların oluşması halinde silme talebinde bulunma</li>
        <li style={S.li}>İşleme itiraz etme ve veri taşınabilirliği talep etme</li>
      </ul>
      <p style={S.p}>
        Haklarınızı kullanmak için <strong>destek@odaklio.com</strong> adresine yazabilirsiniz. Talepleriniz 30 gün içinde yanıtlanır.
      </p>

      <div style={S.divider} />

      <h2 style={S.h2}>9. Çerezler</h2>
      <p style={S.p}>
        Çerez kullanımına ilişkin ayrıntılı bilgi için <a href="/cerez-politikasi" style={{ color: "var(--accent-primary)", textDecoration: "none" }}>Çerez Politikamızı</a> inceleyiniz.
      </p>

      <div style={S.divider} />

      <h2 style={S.h2}>10. İletişim</h2>
      <p style={S.p}>
        <strong>Genel:</strong> destek@odaklio.com<br />
        <strong>KVKK Başvurusu:</strong> kvkk@odaklio.com
      </p>
    </LegalPageLayout>
  );
}
