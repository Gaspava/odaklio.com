import LegalPageLayout from "@/app/components/legal/LegalPageLayout";

export const metadata = {
  title: "KVKK Aydınlatma Metni | Odaklio",
  description: "6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında Odaklio'nun veri işleme faaliyetlerine ilişkin aydınlatma metni.",
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

export default function KVKKPage() {
  return (
    <LegalPageLayout
      title="KVKK Aydınlatma Metni"
      subtitle="6698 sayılı Kişisel Verilerin Korunması Kanunu'nun 10. maddesi gereğince hazırlanmış aydınlatma metnidir."
      lastUpdated="1 Ocak 2025"
    >
      <div style={S.box}>
        <p style={{ margin: 0, fontSize: 14, color: "var(--accent-primary)", fontWeight: 500 }}>
          Bu metin, 6698 sayılı Kişisel Verilerin Korunması Kanunu'nun ("KVKK") 10. maddesi ve Aydınlatma Yükümlülüğünün Yerine Getirilmesinde Uyulacak Usul ve Esaslar Hakkında Tebliğ kapsamında hazırlanmıştır.
        </p>
      </div>

      <h2 style={S.h2}>1. Veri Sorumlusunun Kimliği</h2>
      <p style={S.p}>
        KVKK kapsamında <strong>veri sorumlusu</strong> sıfatını haiz Odaklio ("Şirket"), kişisel verilerinizi aşağıda açıklanan amaçlar ve hukuki sebepler doğrultusunda işlemektedir.
      </p>
      <p style={S.p}>
        <strong>Veri Sorumlusu İletişim:</strong> destek@odaklio.com / kvkk@odaklio.com
      </p>

      <div style={S.divider} />

      <h2 style={S.h2}>2. İşlenen Kişisel Veriler</h2>
      <p style={S.p}>Odaklio tarafından işlenen kişisel veri kategorileri şunlardır:</p>
      <table style={S.table}>
        <thead>
          <tr>
            <th style={S.th}>Kategori</th>
            <th style={S.th}>Veriler</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={S.td}><strong>Kimlik Verileri</strong></td>
            <td style={S.td}>Ad, soyad</td>
          </tr>
          <tr>
            <td style={S.td}><strong>İletişim Verileri</strong></td>
            <td style={S.td}>E-posta adresi, telefon numarası</td>
          </tr>
          <tr>
            <td style={S.td}><strong>Hesap ve Güvenlik Verileri</strong></td>
            <td style={S.td}>Şifreli parola, oturum token'ları, son giriş zamanı</td>
          </tr>
          <tr>
            <td style={S.td}><strong>İşlem Verileri</strong></td>
            <td style={S.td}>Yapay zeka sohbet geçmişi, oluşturulan içerikler (notlar, flashcard'lar, yol haritaları)</td>
          </tr>
          <tr>
            <td style={S.td}><strong>Kullanım Verileri</strong></td>
            <td style={S.td}>Pomodoro seansları, özellik kullanım istatistikleri, oturum süreleri</td>
          </tr>
          <tr>
            <td style={S.td}><strong>Teknik Veriler</strong></td>
            <td style={S.td}>IP adresi, tarayıcı türü, cihaz bilgisi, çerezler</td>
          </tr>
        </tbody>
      </table>

      <div style={S.divider} />

      <h2 style={S.h2}>3. Kişisel Verilerin İşlenme Amaçları</h2>
      <p style={S.p}>Kişisel verileriniz aşağıdaki amaçlarla işlenmektedir:</p>
      <ul style={S.ul}>
        <li style={S.li}>Üyelik işlemlerinin gerçekleştirilmesi ve hesabın yönetilmesi</li>
        <li style={S.li}>Platformun sunduğu yapay zeka destekli öğrenme hizmetlerinin sağlanması</li>
        <li style={S.li}>Kullanıcı kimliğinin doğrulanması ve hesap güvenliğinin sağlanması</li>
        <li style={S.li}>Kişiselleştirilmiş hizmet sunumu ve kullanıcı deneyiminin iyileştirilmesi</li>
        <li style={S.li}>Yasal yükümlülüklerin yerine getirilmesi</li>
        <li style={S.li}>Müşteri hizmetleri ve destek taleplerinin karşılanması</li>
        <li style={S.li}>Güvenlik ihlallerinin tespiti ve önlenmesi</li>
        <li style={S.li}>Platform hizmetlerinin geliştirilmesi amacıyla anonim analiz yapılması</li>
      </ul>

      <div style={S.divider} />

      <h2 style={S.h2}>4. Kişisel Verilerin İşlenmesinin Hukuki Sebepleri</h2>
      <p style={S.p}>Kişisel verileriniz KVKK'nın 5. ve 6. maddeleri kapsamında aşağıdaki hukuki sebeplere dayanılarak işlenmektedir:</p>
      <table style={S.table}>
        <thead>
          <tr>
            <th style={S.th}>Hukuki Dayanak</th>
            <th style={S.th}>Açıklama</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={S.td}><strong>Sözleşmenin Kurulması ve İfası (m.5/2-c)</strong></td>
            <td style={S.td}>Kullanıcı Sözleşmesi'nin kurulması ve hizmetlerin sunulması için zorunlu işlemeler</td>
          </tr>
          <tr>
            <td style={S.td}><strong>Hukuki Yükümlülüğün Yerine Getirilmesi (m.5/2-ç)</strong></td>
            <td style={S.td}>Vergi, muhasebe ve diğer yasal kayıt tutma yükümlülükleri</td>
          </tr>
          <tr>
            <td style={S.td}><strong>Meşru Menfaat (m.5/2-f)</strong></td>
            <td style={S.td}>Güvenlik, dolandırıcılık önleme ve platform geliştirme faaliyetleri</td>
          </tr>
          <tr>
            <td style={S.td}><strong>Açık Rıza (m.5/1)</strong></td>
            <td style={S.td}>Pazarlama iletişimleri ve opsiyonel kişiselleştirme özellikleri</td>
          </tr>
        </tbody>
      </table>

      <div style={S.divider} />

      <h2 style={S.h2}>5. Kişisel Verilerin Aktarılması</h2>
      <h3 style={S.h3}>5.1 Yurt İçi Aktarım</h3>
      <p style={S.p}>
        Yetkili kamu kurum ve kuruluşlarının yasal talebi halinde, mahkeme kararıyla veya yasal zorunluluk kapsamında ilgili mercilere aktarım yapılabilir.
      </p>
      <h3 style={S.h3}>5.2 Yurt Dışı Aktarım</h3>
      <p style={S.p}>
        Kişisel verileriniz aşağıdaki yurt dışı hizmet sağlayıcılara aktarılmaktadır:
      </p>
      <table style={S.table}>
        <thead>
          <tr>
            <th style={S.th}>Hizmet Sağlayıcı</th>
            <th style={S.th}>Ülke</th>
            <th style={S.th}>Amaç</th>
            <th style={S.th}>Güvence</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={S.td}><strong>Supabase</strong></td>
            <td style={S.td}>ABD</td>
            <td style={S.td}>Veritabanı, kimlik doğrulama, dosya depolama</td>
            <td style={S.td}>SCCs, SOC 2 Type II</td>
          </tr>
          <tr>
            <td style={S.td}><strong>Google LLC (Gemini API)</strong></td>
            <td style={S.td}>ABD</td>
            <td style={S.td}>Yapay zeka yanıtlarının üretilmesi</td>
            <td style={S.td}>SCCs, Google API Data Processing Terms</td>
          </tr>
          <tr>
            <td style={S.td}><strong>Google LLC (OAuth)</strong></td>
            <td style={S.td}>ABD</td>
            <td style={S.td}>Google ile giriş yap kimlik doğrulama</td>
            <td style={S.td}>SCCs</td>
          </tr>
        </tbody>
      </table>
      <p style={S.p}>
        Yurt dışı aktarımlar, KVKK'nın 9. maddesi kapsamında gerekli güvencelerin sağlanması kaydıyla gerçekleştirilmektedir.
      </p>

      <div style={S.divider} />

      <h2 style={S.h2}>6. Kişisel Verilerin Toplanma Yöntemi</h2>
      <p style={S.p}>Kişisel verileriniz aşağıdaki yöntemlerle toplanmaktadır:</p>
      <ul style={S.ul}>
        <li style={S.li}><strong>Kayıt Formu:</strong> Üyelik oluşturma sırasında form aracılığıyla</li>
        <li style={S.li}><strong>OAuth:</strong> Google hesabıyla giriş yapıldığında Google API aracılığıyla</li>
        <li style={S.li}><strong>Platform Kullanımı:</strong> Hizmetlerin kullanımı sırasında otomatik olarak</li>
        <li style={S.li}><strong>Çerezler:</strong> Tarayıcıya yerleştirilen çerezler aracılığıyla</li>
        <li style={S.li}><strong>İletişim:</strong> Destek talebi veya geri bildirim gönderilmesi yoluyla</li>
      </ul>

      <div style={S.divider} />

      <h2 style={S.h2}>7. İlgili Kişinin Hakları (KVKK Madde 11)</h2>
      <p style={S.p}>KVKK'nın 11. maddesi kapsamında aşağıdaki haklara sahipsiniz:</p>
      <ul style={S.ul}>
        <li style={S.li}><strong>Bilgi Edinme:</strong> Kişisel verilerinizin işlenip işlenmediğini öğrenme (m.11/1-a)</li>
        <li style={S.li}><strong>Erişim:</strong> İşlenen kişisel verilerinize erişim talebinde bulunma (m.11/1-b)</li>
        <li style={S.li}><strong>Düzeltme:</strong> Yanlış veya eksik verilerin düzeltilmesini isteme (m.11/1-c)</li>
        <li style={S.li}><strong>Silme/Yok Etme:</strong> Kanunda öngörülen şartların oluşması halinde silinmesini veya yok edilmesini talep etme (m.11/1-ç)</li>
        <li style={S.li}><strong>Aktarım Bildirimi:</strong> Düzeltme/silme işlemlerinin aktarılan üçüncü kişilere bildirilmesini isteme (m.11/1-d)</li>
        <li style={S.li}><strong>İtiraz:</strong> İşlenen verilerin otomatik sistemler aracılığıyla analiz edilmesi suretiyle aleyhinize çıkan sonuca itiraz etme (m.11/1-e)</li>
        <li style={S.li}><strong>Tazminat:</strong> Kişisel verilerin kanuna aykırı işlenmesi nedeniyle uğranılan zararın giderilmesini talep etme (m.11/1-f)</li>
      </ul>

      <div style={S.divider} />

      <h2 style={S.h2}>8. Başvuru Usulü</h2>
      <p style={S.p}>
        Yukarıda belirtilen haklarınızı kullanmak için aşağıdaki yollardan başvurabilirsiniz:
      </p>
      <ul style={S.ul}>
        <li style={S.li}><strong>E-posta:</strong> kvkk@odaklio.com adresine "KVKK Başvurusu" konu başlığıyla</li>
        <li style={S.li}><strong>Kimlik Doğrulama:</strong> Başvurunuzda kimliğinizi doğrulayan bilgiler bulunmalıdır</li>
      </ul>
      <p style={S.p}>
        Başvurunuz, niteliğine göre en kısa sürede ve her halükarda <strong>30 gün</strong> içinde yanıtlanacaktır. Talebin reddedilmesi halinde gerekçe bildirilecektir. Yanıttan memnun olunmaması durumunda, KVKK'nın 14. maddesi kapsamında <strong>Kişisel Verileri Koruma Kurulu</strong>'na şikâyette bulunulabilir.
      </p>

      <div style={S.divider} />

      <h2 style={S.h2}>9. Çerezler ve İzleme Teknolojileri</h2>
      <p style={S.p}>
        Odaklio'nun çerez kullanımına ilişkin ayrıntılı bilgi için <a href="/cerez-politikasi" style={{ color: "var(--accent-primary)", textDecoration: "none" }}>Çerez Politikamızı</a> inceleyiniz.
      </p>

      <div style={S.divider} />

      <h2 style={S.h2}>10. Güncellemeler</h2>
      <p style={S.p}>
        Bu Aydınlatma Metni, yasal değişiklikler veya veri işleme faaliyetlerindeki değişiklikler doğrultusunda güncellenebilir. Güncel metne her zaman <strong>odaklio.com/kvkk</strong> adresinden ulaşabilirsiniz.
      </p>
    </LegalPageLayout>
  );
}
