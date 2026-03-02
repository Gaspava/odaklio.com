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
          Odaklio olarak 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) ve Genel Veri Koruma Tüzüğü (GDPR) kapsamındaki yükümlülüklerimizi eksiksiz yerine getirmeyi taahhüt ediyoruz.
        </p>
      </div>

      <h2 style={S.h2}>1. Veri Sorumlusu</h2>
      <p style={S.p}>
        6698 sayılı KVKK kapsamında veri sorumlusu sıfatını taşıyan Odaklio, kişisel verilerinizi bu politikada açıklanan amaçlar doğrultusunda işlemektedir.
      </p>
      <p style={S.p}>
        <strong>İletişim:</strong> destek@odaklio.com | <strong>Web:</strong> odaklio.com
      </p>

      <div style={S.divider} />

      <h2 style={S.h2}>2. Toplanan Kişisel Veriler</h2>
      <h3 style={S.h3}>2.1 Doğrudan Sağladığınız Veriler</h3>
      <table style={S.table}>
        <thead>
          <tr>
            <th style={S.th}>Veri Türü</th>
            <th style={S.th}>Açıklama</th>
            <th style={S.th}>Zorunluluk</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={S.td}><strong>Ad Soyad</strong></td>
            <td style={S.td}>Kayıt sırasında girilen isim bilgisi</td>
            <td style={S.td}>Zorunlu</td>
          </tr>
          <tr>
            <td style={S.td}><strong>E-posta Adresi</strong></td>
            <td style={S.td}>Hesap girişi ve iletişim için kullanılır</td>
            <td style={S.td}>Zorunlu (e-posta kaydı)</td>
          </tr>
          <tr>
            <td style={S.td}><strong>Telefon Numarası</strong></td>
            <td style={S.td}>SMS doğrulama için kullanılır</td>
            <td style={S.td}>Zorunlu (telefon kaydı)</td>
          </tr>
          <tr>
            <td style={S.td}><strong>Şifre</strong></td>
            <td style={S.td}>bcrypt ile şifrelenmiş olarak saklanır; düz metin olarak hiçbir zaman saklanmaz</td>
            <td style={S.td}>Zorunlu</td>
          </tr>
          <tr>
            <td style={S.td}><strong>Google Hesap Bilgileri</strong></td>
            <td style={S.td}>Google ile giriş yapıldığında Google'dan iletilen profil bilgileri</td>
            <td style={S.td}>Opsiyonel (Google kaydı)</td>
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
            <td style={S.td}>Hangi özelliklerin kullanıldığı, oturum süreleri, tıklama davranışları</td>
          </tr>
          <tr>
            <td style={S.td}><strong>Sohbet İçerikleri</strong></td>
            <td style={S.td}>Yapay zeka ile gerçekleştirilen konuşmalar (şifreli olarak saklanır)</td>
          </tr>
          <tr>
            <td style={S.td}><strong>Cihaz Bilgileri</strong></td>
            <td style={S.td}>Tarayıcı türü, işletim sistemi, ekran çözünürlüğü</td>
          </tr>
          <tr>
            <td style={S.td}><strong>IP Adresi</strong></td>
            <td style={S.td}>Güvenlik amacıyla ve yasal zorunluluklar için tutulur</td>
          </tr>
          <tr>
            <td style={S.td}><strong>Pomodoro Verileri</strong></td>
            <td style={S.td}>Çalışma seansları, odaklanma süreleri, mola bilgileri</td>
          </tr>
          <tr>
            <td style={S.td}><strong>Öğrenme İçerikleri</strong></td>
            <td style={S.td}>Oluşturulan flashcard'lar, notlar, yol haritaları ve zihin haritaları</td>
          </tr>
        </tbody>
      </table>

      <div style={S.divider} />

      <h2 style={S.h2}>3. Verilerin İşlenme Amaçları</h2>
      <p style={S.p}>Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:</p>
      <ul style={S.ul}>
        <li style={S.li}><strong>Hizmet Sunumu:</strong> Hesap oluşturma, kimlik doğrulama ve platform hizmetlerinin sağlanması</li>
        <li style={S.li}><strong>Kişiselleştirme:</strong> Öğrenme geçmişinize göre kişiselleştirilmiş içerik ve önerilerin sunulması</li>
        <li style={S.li}><strong>Yapay Zeka Hizmeti:</strong> Google Gemini API'ye sohbet içeriklerinin iletilmesi yoluyla AI yanıtlarının üretilmesi</li>
        <li style={S.li}><strong>İletişim:</strong> Hesap bildirimleri, güvenlik uyarıları ve hizmet güncellemelerinin iletilmesi</li>
        <li style={S.li}><strong>Güvenlik:</strong> Yetkisiz erişim, dolandırıcılık ve kötüye kullanımın önlenmesi</li>
        <li style={S.li}><strong>Analitik:</strong> Platform performansının ölçülmesi ve hizmetin geliştirilmesi (anonim/toplu veriler)</li>
        <li style={S.li}><strong>Yasal Yükümlülükler:</strong> Kanuni saklama sürelerine uyum ve yetkili makam taleplerine yanıt verilmesi</li>
      </ul>

      <div style={S.divider} />

      <h2 style={S.h2}>4. Google Gemini Yapay Zeka Entegrasyonu</h2>
      <div style={S.infoBox}>
        <p style={{ margin: 0, fontSize: 14, color: "var(--accent-secondary)", fontWeight: 500 }}>
          ℹ️ Yapay zeka ile paylaştığınız içerikler Google'ın altyapısında işlenmektedir. Bu entegrasyona ilişkin Google'ın veri işleme politikasını da incelemenizi öneririz.
        </p>
      </div>
      <p style={S.p}>
        Odaklio, yapay zeka yanıtları üretmek için Google Gemini API'yi kullanmaktadır. Bu entegrasyon kapsamında:
      </p>
      <ul style={S.ul}>
        <li style={S.li}>Sohbet mesajlarınız Google Gemini API'ye iletilmektedir.</li>
        <li style={S.li}>Google, API üzerinden iletilen verileri kendi <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "var(--accent-primary)", textDecoration: "none" }}>Gizlilik Politikası</a> ve Gemini API kullanım koşullarına göre işlemektedir.</li>
        <li style={S.li}>Odaklio, verilerinizin Google ile paylaşılmasını yalnızca hizmetin sunulması amacıyla sınırlı tutar.</li>
        <li style={S.li}>Yapay zekaya hassas kişisel bilgiler (TC kimlik no, finansal bilgiler, sağlık bilgileri) paylaşmamanızı tavsiye ederiz.</li>
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
            <td style={S.td}>Hesap bilgileri (ad, e-posta)</td>
            <td style={S.td}>Hesap silinene kadar + 90 gün</td>
          </tr>
          <tr>
            <td style={S.td}>Sohbet geçmişi</td>
            <td style={S.td}>Hesap silinene kadar; isteğe bağlı olarak kullanıcı tarafından silinebilir</td>
          </tr>
          <tr>
            <td style={S.td}>Günlük/log kayıtları</td>
            <td style={S.td}>90 gün</td>
          </tr>
          <tr>
            <td style={S.td}>Ödeme kayıtları</td>
            <td style={S.td}>10 yıl (Türk Ticaret Kanunu gereği)</td>
          </tr>
          <tr>
            <td style={S.td}>Pomodoro ve öğrenme verileri</td>
            <td style={S.td}>Hesap silinene kadar</td>
          </tr>
        </tbody>
      </table>

      <div style={S.divider} />

      <h2 style={S.h2}>6. Veri Güvenliği</h2>
      <p style={S.p}>Verilerinizin güvenliği için aşağıdaki teknik ve idari tedbirler alınmaktadır:</p>
      <ul style={S.ul}>
        <li style={S.li}><strong>Şifreleme:</strong> Tüm veriler aktarım sırasında TLS/SSL ile, depolama sırasında AES-256 ile şifrelenmektedir.</li>
        <li style={S.li}><strong>Şifre Güvenliği:</strong> Şifreler bcrypt algoritmasıyla hash'lenerek saklanır; düz metin olarak hiçbir zaman tutulmaz.</li>
        <li style={S.li}><strong>Erişim Kontrolü:</strong> Verilerinize yalnızca yetkili personel erişebilir; erişimler kayıt altına alınır.</li>
        <li style={S.li}><strong>Güvenlik Denetimleri:</strong> Düzenli güvenlik açığı taramaları ve penetrasyon testleri yapılmaktadır.</li>
        <li style={S.li}><strong>Supabase Altyapısı:</strong> Verileriniz SOC 2 Type II sertifikalı Supabase altyapısında saklanmaktadır.</li>
      </ul>

      <div style={S.divider} />

      <h2 style={S.h2}>7. Üçüncü Taraflarla Veri Paylaşımı</h2>
      <p style={S.p}>Verileriniz aşağıdaki durumlar dışında üçüncü taraflarla paylaşılmaz:</p>
      <ul style={S.ul}>
        <li style={S.li}><strong>Hizmet Sağlayıcılar:</strong> Supabase (veritabanı ve kimlik doğrulama), Google (Gemini AI ve OAuth)</li>
        <li style={S.li}><strong>Ödeme İşlemcileri:</strong> Ödeme bilgileri güvenli ödeme altyapısı sağlayıcılarıyla işlenir</li>
        <li style={S.li}><strong>Yasal Zorunluluklar:</strong> Mahkeme kararı, savcılık talebi veya yasal yükümlülük halinde</li>
        <li style={S.li}><strong>Şirket Devri:</strong> Birleşme, satın alma veya varlık satışı durumunda kullanıcılar önceden bilgilendirilir</li>
      </ul>
      <p style={S.p}>Verileriniz hiçbir koşulda reklam amaçlı üçüncü taraflara satılmaz veya kiralanmaz.</p>

      <div style={S.divider} />

      <h2 style={S.h2}>8. Kullanıcı Hakları</h2>
      <p style={S.p}>KVKK'nın 11. maddesi kapsamında aşağıdaki haklara sahipsiniz:</p>
      <ul style={S.ul}>
        <li style={S.li}><strong>Bilgi Edinme Hakkı:</strong> Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
        <li style={S.li}><strong>Erişim Hakkı:</strong> İşlenen kişisel verilerinize erişim talep etme</li>
        <li style={S.li}><strong>Düzeltme Hakkı:</strong> Yanlış veya eksik verilerin düzeltilmesini isteme</li>
        <li style={S.li}><strong>Silme Hakkı:</strong> Yasal saklama süresi dolduğunda verilerin silinmesini talep etme</li>
        <li style={S.li}><strong>İtiraz Hakkı:</strong> Kişisel verilerinizin işlenmesine itiraz etme</li>
        <li style={S.li}><strong>Veri Taşınabilirliği:</strong> Verilerinizin yapılandırılmış, makine tarafından okunabilir formatta alınması</li>
      </ul>
      <p style={S.p}>
        Haklarınızı kullanmak için <strong>destek@odaklio.com</strong> adresine yazabilirsiniz. Talepleriniz 30 gün içinde yanıtlanır.
      </p>

      <div style={S.divider} />

      <h2 style={S.h2}>9. Çerezler</h2>
      <p style={S.p}>
        Odaklio, oturum yönetimi ve hizmet kalitesinin artırılması için çerezler kullanmaktadır. Çerezlere ilişkin ayrıntılı bilgi için <a href="/cerez-politikasi" style={{ color: "var(--accent-primary)", textDecoration: "none" }}>Çerez Politikamızı</a> inceleyiniz.
      </p>

      <div style={S.divider} />

      <h2 style={S.h2}>10. Çocukların Gizliliği</h2>
      <p style={S.p}>
        Platform, 13 yaşın altındaki çocuklara yönelik değildir ve bu kişilere ait kişisel verileri bilerek toplamaz. 13-18 yaş arası kullanıcıların ebeveyn onayıyla platformu kullanabileceğini hatırlatırız. Bu yaş grubuna ait verilerin ebeveyn talebiyle silinebileceğini belirtiriz.
      </p>

      <div style={S.divider} />

      <h2 style={S.h2}>11. Politika Güncellemeleri</h2>
      <p style={S.p}>
        Bu Gizlilik Politikası periyodik olarak güncellenebilir. Önemli değişiklikler için kayıtlı e-posta adresinize bildirim gönderilecektir. Güncel versiyona her zaman <strong>odaklio.com/gizlilik</strong> adresinden ulaşabilirsiniz.
      </p>

      <div style={S.divider} />

      <h2 style={S.h2}>12. İletişim</h2>
      <p style={S.p}>
        Gizlilik politikamıza ilişkin sorularınız veya talepleriniz için:<br />
        <strong>E-posta:</strong> destek@odaklio.com<br />
        <strong>KVKK Başvurusu:</strong> kvkk@odaklio.com<br />
        <strong>Yanıt süresi:</strong> En geç 30 takvim günü
      </p>
    </LegalPageLayout>
  );
}
