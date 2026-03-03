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
        KVKK kapsamında <strong>veri sorumlusu</strong> sıfatını haiz Odaklio, kişisel verilerinizi aşağıda açıklanan amaçlar ve hukuki sebepler doğrultusunda işlemektedir.
      </p>
      <p style={S.p}><strong>İletişim:</strong> destek@odaklio.com / kvkk@odaklio.com</p>

      <div style={S.divider} />

      <h2 style={S.h2}>2. İşlenen Kişisel Veriler</h2>
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
            <td style={S.td}>Şifreli parola, oturum bilgileri</td>
          </tr>
          <tr>
            <td style={S.td}><strong>İşlem Verileri</strong></td>
            <td style={S.td}>Yapay zeka sohbet geçmişi, oluşturulan içerikler</td>
          </tr>
          <tr>
            <td style={S.td}><strong>Kullanım Verileri</strong></td>
            <td style={S.td}>Çalışma seansları, özellik kullanım istatistikleri</td>
          </tr>
          <tr>
            <td style={S.td}><strong>Teknik Veriler</strong></td>
            <td style={S.td}>IP adresi, tarayıcı türü, çerezler</td>
          </tr>
        </tbody>
      </table>

      <div style={S.divider} />

      <h2 style={S.h2}>3. Kişisel Verilerin İşlenme Amaçları</h2>
      <ul style={S.ul}>
        <li style={S.li}>Üyelik işlemlerinin gerçekleştirilmesi ve hesabın yönetilmesi</li>
        <li style={S.li}>Yapay zeka destekli öğrenme hizmetlerinin sağlanması</li>
        <li style={S.li}>Kullanıcı kimliğinin doğrulanması ve hesap güvenliğinin korunması</li>
        <li style={S.li}>Kişiselleştirilmiş hizmet sunumu ve deneyimin iyileştirilmesi</li>
        <li style={S.li}>Yasal yükümlülüklerin yerine getirilmesi</li>
        <li style={S.li}>Müşteri destek taleplerinin karşılanması</li>
      </ul>

      <div style={S.divider} />

      <h2 style={S.h2}>4. Kişisel Verilerin İşlenmesinin Hukuki Sebepleri</h2>
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
            <td style={S.td}>Hizmetlerin sunulması için zorunlu işlemeler</td>
          </tr>
          <tr>
            <td style={S.td}><strong>Hukuki Yükümlülüğün Yerine Getirilmesi (m.5/2-ç)</strong></td>
            <td style={S.td}>Yasal kayıt tutma yükümlülükleri</td>
          </tr>
          <tr>
            <td style={S.td}><strong>Meşru Menfaat (m.5/2-f)</strong></td>
            <td style={S.td}>Güvenlik ve platform geliştirme faaliyetleri</td>
          </tr>
          <tr>
            <td style={S.td}><strong>Açık Rıza (m.5/1)</strong></td>
            <td style={S.td}>Opsiyonel pazarlama ve kişiselleştirme özellikleri</td>
          </tr>
        </tbody>
      </table>

      <div style={S.divider} />

      <h2 style={S.h2}>5. Kişisel Verilerin Aktarılması</h2>
      <h3 style={S.h3}>5.1 Yurt İçi Aktarım</h3>
      <p style={S.p}>
        Mahkeme kararı veya yasal yükümlülük kapsamında yetkili kamu kurum ve kuruluşlarına aktarım yapılabilir.
      </p>
      <h3 style={S.h3}>5.2 Yurt Dışı Aktarım</h3>
      <p style={S.p}>
        Platform hizmetlerinin sunulabilmesi için kişisel verileriniz yurt dışındaki güvenli bulut altyapısı ve yapay zeka hizmet sağlayıcısına aktarılmaktadır. Bu aktarımlar KVKK'nın 9. maddesi kapsamında gerekli güvencelerin sağlanması kaydıyla gerçekleştirilmektedir.
      </p>

      <div style={S.divider} />

      <h2 style={S.h2}>6. Kişisel Verilerin Toplanma Yöntemi</h2>
      <ul style={S.ul}>
        <li style={S.li}><strong>Kayıt Formu:</strong> Üyelik oluşturma sırasında</li>
        <li style={S.li}><strong>Sosyal Giriş:</strong> Üçüncü taraf kimlik sağlayıcısı aracılığıyla</li>
        <li style={S.li}><strong>Platform Kullanımı:</strong> Hizmetlerin kullanımı sırasında otomatik olarak</li>
        <li style={S.li}><strong>İletişim:</strong> Destek talebi veya geri bildirim yoluyla</li>
      </ul>

      <div style={S.divider} />

      <h2 style={S.h2}>7. İlgili Kişinin Hakları (KVKK Madde 11)</h2>
      <ul style={S.ul}>
        <li style={S.li}><strong>Bilgi Edinme:</strong> Kişisel verilerinizin işlenip işlenmediğini öğrenme</li>
        <li style={S.li}><strong>Erişim:</strong> İşlenen kişisel verilerinize erişim talebinde bulunma</li>
        <li style={S.li}><strong>Düzeltme:</strong> Yanlış veya eksik verilerin düzeltilmesini isteme</li>
        <li style={S.li}><strong>Silme/Yok Etme:</strong> Kanunda öngörülen şartların oluşması halinde silme talebinde bulunma</li>
        <li style={S.li}><strong>İtiraz:</strong> Otomatik sistemler aracılığıyla aleyhinize çıkan sonuçlara itiraz etme</li>
        <li style={S.li}><strong>Tazminat:</strong> Kanuna aykırı veri işleme nedeniyle uğranılan zararın giderilmesini talep etme</li>
      </ul>

      <div style={S.divider} />

      <h2 style={S.h2}>8. Başvuru Usulü</h2>
      <p style={S.p}>
        Yukarıda belirtilen haklarınızı kullanmak için <strong>kvkk@odaklio.com</strong> adresine "KVKK Başvurusu" konu başlığıyla e-posta gönderebilirsiniz. Başvurular en geç <strong>30 takvim günü</strong> içinde yanıtlanacaktır.
      </p>
      <p style={S.p}>
        Yanıttan memnun olunmaması durumunda <strong>Kişisel Verileri Koruma Kurulu</strong>'na şikâyette bulunulabilir.
      </p>

      <div style={S.divider} />

      <h2 style={S.h2}>9. Güncellemeler</h2>
      <p style={S.p}>
        Bu Aydınlatma Metni, yasal değişiklikler doğrultusunda güncellenebilir. Güncel metne <strong>odaklio.com/kvkk</strong> adresinden ulaşabilirsiniz.
      </p>
    </LegalPageLayout>
  );
}
