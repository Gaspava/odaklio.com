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
          Bu sözleşme, Odaklio hizmetlerini kullanan tüm kişiler için geçerlidir. Platforma kayıt olarak veya hizmetleri kullanarak bu sözleşmenin tüm şartlarını okuduğunuzu, anladığınızı ve kabul ettiğinizi beyan etmiş olursunuz.
        </p>
      </div>

      <h2 style={S.h2}>1. Taraflar ve Kapsam</h2>
      <p style={S.p}>
        Bu Kullanıcı Sözleşmesi ("Sözleşme"), Odaklio ("Platform", "Biz", "Şirket") ile Odaklio'ya kayıt olan veya hizmetleri kullanan gerçek kişiler ("Kullanıcı", "Siz") arasında akdedilmektedir. Bu Sözleşme; <strong>odaklio.com</strong> alan adı ve bağlantılı tüm alt domainler, mobil uygulamalar ve API hizmetlerini kapsamaktadır.
      </p>
      <p style={S.p}>
        Odaklio, Google Gemini yapay zeka teknolojisini kullanan, öğrenme ve kişisel gelişimi destekleyen bir yapay zeka destekli öğrenme platformudur.
      </p>

      <div style={S.divider} />

      <h2 style={S.h2}>2. Üyelik ve Hesap Oluşturma</h2>
      <h3 style={S.h3}>2.1 Üyelik Şartları</h3>
      <ul style={S.ul}>
        <li style={S.li}>Platforma üye olabilmek için 13 yaşını doldurmuş olmanız gerekmektedir. 13-18 yaş arasındaki kullanıcıların ebeveyn veya yasal vasi onayı alması zorunludur.</li>
        <li style={S.li}>Türkiye Cumhuriyeti sınırları içinde hizmet alan kullanıcılar, Türk hukukuna tabi olduklarını kabul eder.</li>
        <li style={S.li}>Kayıt formunda sağladığınız bilgilerin doğru, güncel ve eksiksiz olması zorunludur.</li>
        <li style={S.li}>Her kişi yalnızca bir hesap oluşturabilir; birden fazla hesap oluşturmak yasaktır.</li>
      </ul>
      <h3 style={S.h3}>2.2 Hesap Güvenliği</h3>
      <p style={S.p}>
        Hesabınızın güvenliğinden tamamen siz sorumlusunuz. Şifrenizi gizli tutmak, yetkisiz erişimleri derhal bildirmek ve güçlü bir şifre kullanmak yükümlülükleriniz arasındadır. Hesabınız üzerinden gerçekleştirilen tüm işlemler size aittir.
      </p>

      <div style={S.divider} />

      <h2 style={S.h2}>3. Yapay Zeka Hizmetleri ve Kullanım Koşulları</h2>
      <div style={S.warnBox}>
        <p style={{ margin: 0, fontSize: 14, color: "var(--accent-warning)", fontWeight: 500 }}>
          ⚠️ Önemli: Odaklio, Google Gemini yapay zeka modelini kullanmaktadır. Yapay zeka ile paylaştığınız içerikler, Google'ın Gemini API Kullanım Politikası'na tabidir.
        </p>
      </div>
      <h3 style={S.h3}>3.1 Yapay Zeka Hizmetinin Niteliği</h3>
      <p style={S.p}>
        Odaklio'nun sunduğu yapay zeka destekli sohbet, zihin haritası, flashcard, yol haritası ve mentorluk hizmetleri, bilgilendirme ve öğrenme amaçlıdır. Yapay zeka tarafından üretilen içerikler:
      </p>
      <ul style={S.ul}>
        <li style={S.li}>Tıbbi teşhis, tedavi veya reçete niteliği taşımaz; sağlık profesyonelinin görüşünün yerine geçemez.</li>
        <li style={S.li}>Hukuki tavsiye niteliği taşımaz; avukat veya hukuk uzmanı görüşünün yerine geçemez.</li>
        <li style={S.li}>Finansal yatırım tavsiyesi niteliği taşımaz; yatırım kararlarınızda belirleyici olamaz.</li>
        <li style={S.li}>Her zaman %100 doğru veya güncel olmayabilir; kritik konularda uzman görüşü almanız tavsiye edilir.</li>
      </ul>
      <h3 style={S.h3}>3.2 Yapay Zeka ile Sohbet Verileri</h3>
      <p style={S.p}>
        Yapay zeka ile gerçekleştirdiğiniz konuşmalar, hizmetin sunulabilmesi için Google Gemini API'ye iletilmektedir. Bu süreçte:
      </p>
      <ul style={S.ul}>
        <li style={S.li}>Sohbet içerikleriniz, Odaklio'nun Supabase veritabanında şifreli olarak saklanmaktadır.</li>
        <li style={S.li}>Yapay zeka yanıtlarının kalitesini artırmak amacıyla anonim kullanım verileri analiz edilebilir.</li>
        <li style={S.li}>Kişisel sağlık, finansal veya hassas bilgilerinizi yapay zeka ile paylaşmaktan kaçınmanızı tavsiye ederiz.</li>
      </ul>

      <div style={S.divider} />

      <h2 style={S.h2}>4. Kullanıcı Yükümlülükleri ve Yasaklı Faaliyetler</h2>
      <p style={S.p}>Platform'u kullanırken aşağıdaki faaliyetler kesinlikle yasaktır:</p>
      <h3 style={S.h3}>4.1 İçerik Kısıtlamaları</h3>
      <ul style={S.ul}>
        <li style={S.li}>Yasadışı, zararlı, tehditkar, taciz edici, iftira niteliği taşıyan veya müstehcen içerik üretmek veya paylaşmak</li>
        <li style={S.li}>Başkalarının kişisel verilerini izinsiz toplamak, işlemek veya paylaşmak</li>
        <li style={S.li}>Nefret söylemi, ayrımcılık veya şiddeti teşvik eden içerikler oluşturmak</li>
        <li style={S.li}>Telif hakkı, marka veya fikri mülkiyet haklarını ihlal eden içerikler paylaşmak</li>
        <li style={S.li}>Yapay zekayı kandırmaya, manipüle etmeye veya kötüye kullanmaya yönelik girişimlerde bulunmak ("jailbreak" dahil)</li>
      </ul>
      <h3 style={S.h3}>4.2 Teknik Kısıtlamalar</h3>
      <ul style={S.ul}>
        <li style={S.li}>Platform altyapısına zarar vermeye yönelik saldırılar, bot kullanımı veya otomatik sorgular göndermek</li>
        <li style={S.li}>Platformun kaynak kodunu tersine mühendislik yoluyla çözmeye çalışmak</li>
        <li style={S.li}>API'ye yetkisiz erişim sağlamaya çalışmak</li>
        <li style={S.li}>Platformun normal işleyişini engelleyen aşırı istek göndermek (DoS/DDoS)</li>
      </ul>

      <div style={S.divider} />

      <h2 style={S.h2}>5. Fikri Mülkiyet Hakları</h2>
      <h3 style={S.h3}>5.1 Platform İçeriği</h3>
      <p style={S.p}>
        Odaklio platformunun tasarımı, yazılımı, logosu, grafikleri ve diğer tüm özgün içerikler Odaklio'nun fikri mülkiyetidir. Bu içerikler izinsiz kopyalanamaz, çoğaltılamaz, dağıtılamaz veya ticari amaçla kullanılamaz.
      </p>
      <h3 style={S.h3}>5.2 Kullanıcı İçeriği</h3>
      <p style={S.p}>
        Platformda oluşturduğunuz notlar, flashcard'lar, yol haritaları ve diğer içerikler size aittir. Odaklio, bu içeriklere yalnızca hizmetin sunulması için gereken ölçüde erişim hakkına sahiptir. Hizmet kalitesinin artırılması amacıyla anonim ve toplu veriler kullanılabilir.
      </p>

      <div style={S.divider} />

      <h2 style={S.h2}>6. Abonelik ve Ödeme</h2>
      <p style={S.p}>
        Odaklio, ücretsiz ve premium plan seçenekleri sunmaktadır. Premium planlara ilişkin koşullar:
      </p>
      <ul style={S.ul}>
        <li style={S.li}>Abonelik ücretleri, seçilen plana ve faturalama dönemine göre belirlenir ve önceden bildirim yapılır.</li>
        <li style={S.li}>Abonelik iptali, mevcut faturalama dönemi sonunda geçerli olur; kalan süre için ücret iadesi yapılmaz.</li>
        <li style={S.li}>Ödeme bilgileri güvenli ödeme altyapısı üzerinden işlenir; Odaklio kart bilgilerinizi saklamamaktadır.</li>
        <li style={S.li}>Fiyat değişiklikleri 30 gün önceden bildirilir.</li>
      </ul>

      <div style={S.divider} />

      <h2 style={S.h2}>7. Hizmetin Sınırlandırılması ve Hesap Kapatma</h2>
      <p style={S.p}>
        Odaklio, aşağıdaki durumlarda hizmet vermeyi geçici veya kalıcı olarak durdurma hakkını saklı tutar:
      </p>
      <ul style={S.ul}>
        <li style={S.li}>Bu Sözleşme'nin ihlal edilmesi</li>
        <li style={S.li}>Yanlış veya yanıltıcı bilgi sağlanması</li>
        <li style={S.li}>Platforma veya diğer kullanıcılara zarar verilmesi</li>
        <li style={S.li}>Yetkili makamların talebi veya yasal zorunluluk</li>
      </ul>
      <p style={S.p}>
        Hesabınızı silmek istediğinizde <strong>destek@odaklio.com</strong> adresine e-posta gönderebilirsiniz. Hesabınız silindiğinde kişisel verileriniz Gizlilik Politikası'nda belirtilen süreler dahilinde imha edilir.
      </p>

      <div style={S.divider} />

      <h2 style={S.h2}>8. Sorumluluk Sınırlaması</h2>
      <p style={S.p}>
        Odaklio, aşağıdaki konularda sorumluluk kabul etmez:
      </p>
      <ul style={S.ul}>
        <li style={S.li}>Yapay zeka tarafından üretilen içeriklerin doğruluğu, tamlığı veya güncelliği</li>
        <li style={S.li}>Kullanıcının yapay zeka önerilerine dayanarak aldığı kararların sonuçları</li>
        <li style={S.li}>İnternet bağlantısından kaynaklanan kesintiler veya gecikmeler</li>
        <li style={S.li}>Üçüncü taraf hizmetlerden (Google Gemini, Supabase) kaynaklanan aksaklıklar</li>
        <li style={S.li}>Mücbir sebepler (deprem, sel, savaş, salgın vb.) nedeniyle hizmet kesintileri</li>
      </ul>

      <div style={S.divider} />

      <h2 style={S.h2}>9. Gizlilik ve Kişisel Verilerin Korunması</h2>
      <p style={S.p}>
        Kişisel verilerinizin işlenmesine ilişkin detaylı bilgi için lütfen <a href="/gizlilik" style={{ color: "var(--accent-primary)", textDecoration: "none" }}>Gizlilik Politikamızı</a> ve <a href="/kvkk" style={{ color: "var(--accent-primary)", textDecoration: "none" }}>KVKK Aydınlatma Metnimizi</a> inceleyiniz. Kişisel verileriniz, 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında işlenmektedir.
      </p>

      <div style={S.divider} />

      <h2 style={S.h2}>10. Sözleşme Değişiklikleri</h2>
      <p style={S.p}>
        Odaklio, bu Sözleşmeyi önceden bildirmek suretiyle değiştirme hakkını saklı tutar. Önemli değişiklikler için kayıtlı e-posta adresinize bildirim gönderilecektir. Değişiklik bildiriminden sonra platformu kullanmaya devam etmeniz, güncellenmiş Sözleşmeyi kabul ettiğiniz anlamına gelir.
      </p>

      <div style={S.divider} />

      <h2 style={S.h2}>11. Uygulanacak Hukuk ve Uyuşmazlık Çözümü</h2>
      <p style={S.p}>
        Bu Sözleşme, Türkiye Cumhuriyeti hukukuna göre yorumlanır ve uygulanır. Taraflar arasında doğabilecek uyuşmazlıklarda öncelikle müzakere yoluyla çözüm aranır. Müzakere yoluyla çözülemeyen uyuşmazlıklarda İstanbul Mahkemeleri ve İcra Daireleri yetkilidir.
      </p>

      <div style={S.divider} />

      <h2 style={S.h2}>12. İletişim</h2>
      <p style={S.p}>
        Bu Sözleşmeye ilişkin sorularınız için:<br />
        <strong>E-posta:</strong> destek@odaklio.com<br />
        <strong>Web:</strong> odaklio.com<br />
        <strong>Yanıt süresi:</strong> İş günleri içinde 5 gün
      </p>
    </LegalPageLayout>
  );
}
