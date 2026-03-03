# Dashboard Redesign - Tasarim Dokumani

## Tarih: 2026-03-03

## Amac
Giris yaptiktan sonraki dashboard temasini referans goruntudeki modern, temiz tasarima donusturmek. Kademeli donusum yaklasimi ile mevcut altyapi (auth, conversation, theme providers) korunarak gorsel katman guncellenir.

---

## Genel Layout

```
+-------------------------------------------------------------+
| [Logo SVG]  [Gecmis] [Araclar] [Odak] [Mentor] [Analiz]    |  <- Header (56px)
|                                    [Avatar] [Ad] [Ayar] [!] |
+----+----------------------------------------+---------------+
| Cop|                                        |   Chat Map    |
|    |     Ana Icerik Alani                   |   ---------   |
| Ses|     (Chat / Sayfa icerigi)             |   "ozet 1"   |
| Pom|                                        |   "ozet 2"   |
|    |                                        |   "ozet 3"   |
| +  |                                        |               |
|    |   +----------------------------+       |               |
|    |   | Mesaj yaz...        [Gonder]|       |               |
|    |   +----------------------------+       |               |
+----+----------------------------------------+---------------+
 48px              ~60%                           ~300px
```

---

## Bilesenlerin Detaylari

### 1. Header (Ust Bar)
- Yukseklik: 56px
- backdrop-blur efekti, alt border
- Sol: Odaklio SVG logosu (32px) - `/public` icindeki logo kullanilacak
- Orta: Pill-sekilli nav butonlari
  - Aktif sekme: yesil dolgulu (emerald), beyaz yazi
  - Pasif sekmeler: seffaf, hover'da hafif arka plan
  - Sekmeler: Gecmis, Araclar, Odak, Mentor, Analiz
- Sag: Avatar (36px yuvarlak) + kullanici adi + ayarlar ikonu + bildirim ikonu
- Light: Beyaz zemin | Dark: mevcut koyu zemin

### 2. Sol Mini-Bar (48px)
- Dikey bar, sabit sol kenarda, header altindan baslayarak tam yukseklik
- Butonlar: Yuvarlak ikonlar (40px), hover'da tooltip gosterir
- Sira (alttan uste):
  - [+] Yeni Chat: Tiklaninca chat modu secim popup acilir
  - [Pomodoro] Timer: Tiklaninca kucuk popup ile timer acilir
  - [Ses] Arka Plan Sesi: Tiklaninca popup ile ses kontrolleri
  - [Cop] Temizle: Tiklaninca onay dialogu

#### '+' Popup - Yeni Chat Modu Secimi
- 4 kart: Standart Sohbet, Mindmap, Flashcard, Roadmap
- Her kart: ikon + baslik + kisa aciklama
- Hover'da scale animasyonu
- Secim yapilinca yeni sohbet olusturulur

#### Pomodoro Timer Popup
- Kucuk floating popup (250x300px)
- Timer gosterimi (daire seklinde countdown)
- Baslat/Duraklat/Sifirla butonlari
- Calisirken: sol bar'daki ikonda kucuk geri sayim gosterimi
- Mola/calisma suresi ayari

#### Arka Plan Sesi Popup
- Kucuk floating popup (250x200px)
- Ses turleri listesi (placeholder, icerikler sonra eklenecek)
- Ses seviyesi slider
- Calisirken: sol bar'daki ikonda ses animasyonu (dalga efekti)

### 3. Sag Panel - Chat Map (300px)
- Baslik: "Chat Map" + kucultme/genisletme ikonu
- Collapsible (kapatilabilir)
- Standart sohbette:
  - Kullanici mesajlarinin ilk ~40 karakteri listelenir
  - Her oge tiklanabilir -> o mesaja smooth scroll
  - Aktif gorunen mesaj vurgulanir (yesil sol border)
- Mindmap'te: Node listesi
- Flashcard'da: Kart listesi
- Roadmap'ta: Adim listesi
- Diger sohbet turlerinde kendine has uyumlu gorunum

### 4. Ana Icerik Alani
- Mevcut chat bilesenlerini korur (MainChat, MindmapChat, FlashcardChat, RoadmapChat)
- Gorsel guncellemeler:
  - Mesaj baloncuklari: referans resimdeki gibi temiz, yuvarlak koseli
  - AI mesajlari: sol tarafta logo ikonu ile
  - Kullanici mesajlari: sag tarafta avatar ile
  - Her mesajin altinda: Kopyala, Begeni/Begenme ikonlari
- Chat input: Yuvarlak koseli, placeholder "Bir sey sor..."
  - Sag: Yesil daire gonder butonu
  - Responsive genislik

### 5. Tema Sistemi
- **Light tema:** Referans resimdeki gibi
  - Arka plan: #ffffff / #f8fafb
  - Kartlar: beyaz, hafif golge
  - Vurgu: emerald yesil (#10b981)
  - Yazi: koyu gri/siyah tonlari
- **Dark tema:** Mevcut koyu tonlar korunur
  - Arka plan: #0a0a0c / #0e0e11
  - Kartlar: #111114
  - Vurgu: ayni emerald yesil

---

## Mobil Tasarim (< 768px)

```
+---------------------------+
| [Menu]  [Logo]  [ikon] [P]|  <- Ust bar (48px)
+---------------------------+
|                           |
|   Ana Icerik Alani        |
|   (Chat / Sayfa)          |
|                           |
+---------------------------+
| Mesaj yaz...       [>]   |  <- Input (sabit alt)
+---------------------------+
| [Gc] [Ar] [Od] [Me] [An] |  <- Bottom nav (56px)
+---------------------------+
```

- Ust bar: Hamburger menu (sol panel toggle) -> Logo -> Pomodoro/Ses mini ikonlari -> Profil
- Sol panel: Swipe ile acilir (overlay), chat gecmisi + yeni chat butonu + temizle
- Sag panel: Swipe ile acilir (overlay), Chat Map
- Bottom nav: Mevcut 5 sekme korunur, gorsel guncellenir
- Pomodoro/Ses: Ust bar ikonlarina tiklaninca bottom sheet popup acilir
- '+' butonu: Odak sekmesinde veya floating action button olarak

---

## Animasyonlar
- Panel acilis/kapanis: slide-in/out (300ms ease)
- Popup acilis: scale(0.95 -> 1) + opacity(0 -> 1) (200ms)
- Nav sekme degisimi: smooth underline/pill gecisi
- Mesaj girisi: fade-in + slide-up (150ms)
- Pomodoro ikonu: calisirken pulse animasyonu
- Ses ikonu: calisirken dalga animasyonu
- Hover efektleri: subtle scale(1.02) + shadow artisi
- Sayfa gecisleri: fade gecis (250ms)

---

## Teknik Notlar
- Mevcut providers korunur (AuthProvider, ConversationProvider, ThemeProvider)
- Yeni bilesenler: MiniSidebar, PomodoroPopup, AmbientSoundPopup, ChatMap
- Mevcut bilesenler guncellenir: Header, Dashboard, LeftPanel -> MiniSidebar, RightPanel -> ChatMap
- CSS degiskenleri guncellenir (light tema ayarlari)
- Tum animasyonlar CSS transitions/keyframes ile (JS animasyon kutuphanesi yok)
- Mobil breakpoint: 768px (mevcut ile ayni)
