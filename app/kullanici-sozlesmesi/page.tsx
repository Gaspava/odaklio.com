import LegalPageLayout from "@/app/components/legal/LegalPageLayout";

export const metadata = {
  title: "Kullanıcı Sözleşmesi | Odaklio",
  description: "Odaklio platformunu kullanmadan önce lütfen kullanıcı sözleşmesini dikkatlice okuyun.",
};

const S = {
  h2: { fontSize: 20, fontWeight: 700, marginTop: 40, marginBottom: 12, color: "var(--text-primary)", letterSpacing: "-0.02em" } as React.CSSProperties,
  h3: { fontSize: 16, fontWeight: 600, marginTop: 24, marginBottom: 8, color: "var(--text-primary)" } as React.CSSProperties,
  p: { marginBottom: 14, color: "var(--text-secondary)", fontSize: 15 } as React.CSSProperties,
  ul: { paddingLeft: 20, marginBottom: 14, color: "var(--text-secondary)", fontSize: 15 } as React.CSSProperties,
  li: { marginBottom: 8, lineHeight: 1.7 } as React.CSSProperties,
  box: { background: "var(--accent-primary-muted)", border: "1px solid var(--accent-primary-light)", borderRadius: 12, padding: "16px 20px", marginBottom: 24 } as React.CSSProperties,
  warnBox: { background: "var(--accent-warning-light)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 12, padding: "16px 20px", marginBottom: 24 } as React.CSSProperties,
  divider: { borderTop: "1px solid var(--border-secondary)", margin: "32px 0" } as React.CSSProperties,
};

export default function KullaniiciSozlesmesiPage() {
  return (
    <LegalPageLayout
      title="Kullanıcı Sözleşmesi"
      subtitle="Odaklio platformunu kullanarak aşağıdaki koşulları kabul etmiş sayılırsınız. Lütfen dikkatlice okuyunuz."
      lastUpdated="1 Ocak 2025"
    >
      <div style={S.box}>
        <p style={{ margin: 0, fontSize: 14, color: "var(--accent-primary)", fontWeight: 500 }}>
          Platforma kayıt olarak veya hizmetleri kullanarak bu sözleşmenin tüm şartlarını okuduğunuzu, anladığınızı ve kabul ettiğinizi beyan etmiş olursunuz.
        </p>
      </div>

      <h2 style={S.h2}>1. Taraflar ve Kapsam</h2>
      <p style={S.p}>
        Bu Kullanıcı Sözleşmesi, Odaklio ("Platform", "Biz", "Şirket") ile platforma kayıt olan veya hizmetleri kullanan gerçek kişiler ("Kullanıcı", "Siz") arasında akdedilmektedir. Odaklio, yapay zeka teknolojisini kullanarak öğrenmeyi ve kişisel gelişimi destekleyen bir platformdur.
      </p>

      <div style={S.divider} />

      <h2 style={S.h2}>2. Üyelik Şartları</h2>
      <ul style={S.ul}>
        <li style={S.li}>Platforma üye olabilmek için 13 yaşını doldurmuş olmanız gerekmektedir. 13-18 yaş arasındaki kullanıcıların ebeveyn veya yasal vasi onayı alması zorunludur.</li>
        <li style={S.li}>Kayıt formunda sağladığınız bilgilerin doğru, güncel ve eksiksiz olması zorunludur.</li>
        <li style={S.li}>Her kişi yalnızca bir hesap oluşturabilir.</li>
        <li style={S.li}>Hesabınızın güvenliğinden tamamen siz sorumlusunuz.</li>
      </ul>

      <div style={S.divider} />

      <h2 style={S.h2}>3. Yapay Zeka Hizmetleri</h2>
      <div style={S.warnBox}>
        <p style={{ margin: 0, fontSize: 14, color: "var(--accent-warning)", fontWeight: 500 }}>
          ⚠️ Odaklio, üçüncü taraf yapay zeka altyapısı kullanmaktadır. Yapay zeka ile paylaştığınız içerikler bu sağlayıcının kullanım politikalarına tabidir.
        </p>
      </div>
      <p style={S.p}>Odaklio'nun sunduğu yapay zeka destekli hizmetler bilgilendirme ve öğrenme amaçlıdır. Yapay zeka tarafından üretilen içerikler:</p>
      <ul style={S.ul}>
        <li style={S.li}>Tıbbi teşhis veya tedavi tavsiyesi niteliği taşımaz.</li>
        <li style={S.li}>Hukuki tavsiye niteliği taşımaz.</li>
        <li style={S.li}>Finansal yatırım tavsiyesi niteliği taşımaz.</li>
        <li style={S.li}>Her zaman %100 doğru veya güncel olmayabilir; kritik konularda uzman görüşü almanız önerilir.</li>
      </ul>

      <div style={S.divider} />

      <h2 style={S.h2}>4. Yasaklı Faaliyetler</h2>
      <ul style={S.ul}>
        <li style={S.li}>Yasadışı, zararlı, tehditkar veya müstehcen içerik üretmek ya da paylaşmak</li>
        <li style={S.li}>Başkalarının kişisel verilerini izinsiz toplamak veya paylaşmak</li>
        <li style={S.li}>Nefret söylemi, ayrımcılık veya şiddeti teşvik eden içerikler oluşturmak</li>
        <li style={S.li}>Telif hakkı veya fikri mülkiyet haklarını ihlal etmek</li>
        <li style={S.li}>Yapay zekayı manipüle etmeye yönelik girişimlerde bulunmak</li>
        <li style={S.li}>Platformun normal işleyişini engelleyecek girişimlerde bulunmak</li>
      </ul>

      <div style={S.divider} />

      <h2 style={S.h2}>5. Fikri Mülkiyet</h2>
      <p style={S.p}>
        Platform tasarımı, logosu ve özgün içerikleri Odaklio'nun mülkiyetindedir; izinsiz kopyalanamaz veya ticari amaçla kullanılamaz. Platformda oluşturduğunuz içerikler (notlar, kartlar vb.) size aittir.
      </p>

      <div style={S.divider} />

      <h2 style={S.h2}>6. Abonelik ve Ödeme</h2>
      <ul style={S.ul}>
        <li style={S.li}>Abonelik ücretleri seçilen plana göre belirlenir ve önceden bildirilir.</li>
        <li style={S.li}>Abonelik iptali mevcut faturalama dönemi sonunda geçerli olur; kalan süre için ücret iadesi yapılmaz.</li>
        <li style={S.li}>Fiyat değişiklikleri 30 gün önceden bildirilir.</li>
      </ul>

      <div style={S.divider} />

      <h2 style={S.h2}>7. Sorumluluk Sınırlaması</h2>
      <p style={S.p}>Odaklio aşağıdaki konularda sorumluluk kabul etmez:</p>
      <ul style={S.ul}>
        <li style={S.li}>Yapay zeka tarafından üretilen içeriklerin doğruluğu veya güncelliği</li>
        <li style={S.li}>Kullanıcının yapay zeka önerilerine dayanarak aldığı kararların sonuçları</li>
        <li style={S.li}>İnternet bağlantısından kaynaklanan kesintiler</li>
        <li style={S.li}>Mücbir sebepler nedeniyle oluşan hizmet kesintileri</li>
      </ul>

      <div style={S.divider} />

      <h2 style={S.h2}>8. Gizlilik</h2>
      <p style={S.p}>
        Kişisel verilerinizin işlenmesine ilişkin ayrıntılı bilgi için <a href="/gizlilik" style={{ color: "var(--accent-primary)", textDecoration: "none" }}>Gizlilik Politikamızı</a> ve <a href="/kvkk" style={{ color: "var(--accent-primary)", textDecoration: "none" }}>KVKK Aydınlatma Metnimizi</a> inceleyiniz.
      </p>

      <div style={S.divider} />

      <h2 style={S.h2}>9. Sözleşme Değişiklikleri ve Hukuk</h2>
      <p style={S.p}>
        Odaklio bu Sözleşmeyi önceden bildirmek suretiyle değiştirme hakkını saklı tutar. Bu Sözleşme Türkiye Cumhuriyeti hukukuna tabidir; uyuşmazlıklarda İstanbul Mahkemeleri yetkilidir.
      </p>

      <div style={S.divider} />

      <h2 style={S.h2}>10. İletişim</h2>
      <p style={S.p}>
        <strong>E-posta:</strong> destek@odaklio.com
      </p>
    </LegalPageLayout>
  );
}
