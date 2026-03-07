# Odaklio - Kompleks Tasklar icin Multi-Agent AI Yaklasimi Raporu

**Tarih:** 2026-03-07
**Kapsam:** Sitedeki yapay zekalarin kompleks sorularda birden fazla agent kullanarak daha dogru sonuc uretmesi

---

## 1. Mevcut Durum Analizi

### Mevcut Mimari
Odaklio su an **tekil agent** mimarisi kullaniyor:

- **AI Provider:** Google Gemini (`gemini-3-flash-preview`, `gemini-3.1-flash-lite-preview`)
- **API Endpointleri:**
  - `/api/chat` - Ana sohbet (streaming, mod bazli system prompt)
  - `/api/chat/title` - Baslik uretimi
  - `/api/chat/suggestions` - Takip sorusu onerisi
  - `/api/classify-subject` - Konu siniflandirma
  - `/api/quick-learn` - Hizli aciklama
  - `/api/daily-report` - Gunluk rapor (Supabase Edge Function)

- **Modlar:** standard, mindmap, flashcard, note, roadmap, roadmap_study, mentor_coach, mentor_psych, mentor_buddy, mentor_expert

### Mevcut Kisitlamalar
1. Tek bir model tek bir system prompt ile calisyor
2. Kompleks sorularda (ornegin cok adimli matematik, fen problemi) tek seferde yanit veriyor
3. Dogrulama/kontrol mekanizmasi yok
4. Farkli uzmanlik alanlarinin bir araya gelme imkani yok

---

## 2. Onerilen Multi-Agent Yaklasimi

### 2.1 Genel Mimari: "Orkestrator + Uzman Agentlar"

```
Kullanici Sorusu
       |
       v
  [Orkestrator Agent]  <-- Soruyu analiz eder, komplekslik belirler
       |
       +--> Basit soru? --> Tek agent ile dogrudan cevapla
       |
       +--> Kompleks soru? --> Multi-agent pipeline baslatir
                |
                v
        [Gorev Dagitici]
         /      |      \
        v       v       v
   [Agent 1] [Agent 2] [Agent 3]
   Arastirma  Cozum     Dogrulama
        \       |       /
         v      v      v
       [Sentezleyici Agent]
                |
                v
         Kullaniciya Yanit
```

### 2.2 Agent Rolleri

#### a) Orkestrator Agent (Yonetici)
- **Gorevi:** Gelen soruyu analiz eder, komplekslik seviyesini belirler
- **Karar:** Tek agent mi, multi-agent mi kullanilacak
- **Model:** `gemini-3-flash-preview` (hizli karar verme)
- **Prompt ornegi:**
```
Gelen soruyu analiz et ve komplekslik seviyesini belirle:
- "basit": Tek adimda cevaplanabilir (tanim, kisa aciklama)
- "orta": 2-3 adim gerektiren soru
- "kompleks": Cok adimli cozum, birden fazla konu bilgisi gerektiren soru
JSON olarak dondur: { "level": "...", "agents_needed": [...], "decomposition": [...] }
```

#### b) Arastirmaci Agent
- **Gorevi:** Konuyla ilgili temel bilgileri ve baglami toplar
- **Cikti:** Konunun temel kavramlari, ilgili formuller, onemli bilgiler
- **Kullanim:** Ozellikle konu arasi baglanti gerektiren sorularda

#### c) Cozucu Agent (Problem Solver)
- **Gorevi:** Adim adim cozum uretir
- **Cikti:** Detayli cozum adimlari
- **Ozellik:** Arastirmaci agent'in ciktisini girdi olarak alir

#### d) Dogrulayici Agent (Verifier)
- **Gorevi:** Cozucu agent'in yanitini kontrol eder
- **Cikti:** Dogrulama sonucu, hata varsa duzeltme onerisi
- **Onemli:** Farkli bir yaklasimla sonucu dogrulamaya calisir

#### e) Sentezleyici Agent (Synthesizer)
- **Gorevi:** Tum agentlarin ciktisini birlestirir, ogrenci seviyesine uygun hale getirir
- **Cikti:** Son kullaniciya gosterilecek yapilandirilmis yanit

---

## 3. Teknik Uygulama Plani

### 3.1 Yeni API Endpoint: `/api/chat/multi-agent`

```typescript
// app/api/chat/multi-agent/route.ts

interface AgentTask {
  agent: string;
  prompt: string;
  dependsOn?: string[];  // bagimli oldugu agentlar
}

interface OrchestrationPlan {
  level: "basit" | "orta" | "kompleks";
  agents: AgentTask[];
  parallel_groups: AgentTask[][]; // paralel calisabilecek agentlar
}
```

### 3.2 Paralel Calistirma Stratejisi

Agentlarin verimli calismasi icin bagimsiz tasklari paralel calistirmak kritik:

```
Grup 1 (Paralel):
  - Arastirmaci Agent
  - Baglam Agent (ogrenci profili, gecmis sohbetler)

Grup 2 (Siralama - Grup 1'e bagimli):
  - Cozucu Agent (Grup 1 ciktilarini kullanir)

Grup 3 (Siralama - Grup 2'ye bagimli):
  - Dogrulayici Agent

Grup 4 (Siralama - tum gruplara bagimli):
  - Sentezleyici Agent
```

### 3.3 Streaming ile Kullanici Deneyimi

Kullaniciya bekleme surecinde ilerleme gostermek icin **progresif streaming** yaklasimi:

```typescript
// Ornek SSE event akisi
data: {"type": "status", "phase": "analyzing", "message": "Soru analiz ediliyor..."}
data: {"type": "status", "phase": "researching", "message": "Konu arastiriliyor..."}
data: {"type": "agent_count", "total": 3, "completed": 0}
data: {"type": "status", "phase": "solving", "message": "Cozum uretiliyor..."}
data: {"type": "agent_count", "total": 3, "completed": 1}
data: {"type": "status", "phase": "verifying", "message": "Cozum dogrulaniyor..."}
data: {"type": "agent_count", "total": 3, "completed": 2}
data: {"type": "status", "phase": "synthesizing", "message": "Yanit hazirlaniyor..."}
data: {"type": "text", "text": "...final yapit..."}
data: [DONE]
```

### 3.4 Frontend Progress Komponenti

Ekran goruntusundeki gibi bir progress UI:

```
+--------------------------------------------------+
| Egzersiz cozuluyor...                     15s    |
| :::::::::: :::::::::: :::::::::: ::::::::::::     |
|                                                   |
| Cozum birden fazla yapay zeka agenti ile          |
| birlikte calisarak en dogru sonuca ulasmak        |
| icin isleniyor.                                   |
+--------------------------------------------------+
```

**Bilesenler:**
- Progress bar (animasyonlu dot matrix tarzinda)
- Sure sayaci
- Aktif fazin aciklamasi
- Agent sayisi gostergesi

---

## 4. Komplekslik Tespiti: Hangi Sorular Multi-Agent Gerektirir?

### Otomatik Tespit Kriterleri

| Kriter | Ornek | Komplekslik |
|--------|-------|-------------|
| Tek kavram sorusu | "Mitoz bolunme nedir?" | Basit |
| Hesaplama iceren | "Bu integral nasil cozulur?" | Orta |
| Cok adimli problem | "Bu fizik problemini coz ve..." | Kompleks |
| Konu arasi baglanti | "Kimyasal tepkimeler fizige nasil etki eder?" | Kompleks |
| Karsilastirma/analiz | "Osmanli ve Roma ekonomilerini karsilastir" | Kompleks |
| Uzun metin analizi | Gorsel + metin analizi birlikte | Kompleks |

### Orkestrator Prompt Tasarimi

```
Asagidaki ogrenci sorusunu analiz et.

Siniflandirma kriterleri:
1. Tek kavram/tanim -> "basit"
2. 1-2 adimli islem gerektiren -> "orta"
3. Su durumlardan biri varsa -> "kompleks":
   - 3+ adimli cozum gerektiren
   - Birden fazla konu/alan bilgisi gerektiren
   - Dogrulama/kontrol gerektiren (matematik, fizik problemleri)
   - Karsilastirma ve analiz gerektiren
   - Gorseldeki bilgiyi metinle birlestirmek gereken

JSON cikti: {
  "level": "basit|orta|kompleks",
  "reasoning": "neden bu seviye",
  "sub_tasks": ["alt gorev 1", "alt gorev 2"],
  "agents_needed": ["arastirmaci", "cozucu", "dogrulayici"]
}
```

---

## 5. Maliyet ve Performans Optimizasyonu

### 5.1 Model Secimi Stratejisi

| Agent | Model | Sebep |
|-------|-------|-------|
| Orkestrator | gemini-3.1-flash-lite | Hizli, ucuz, siniflandirma yeterli |
| Arastirmaci | gemini-3-flash | Orta karmasiklik, bilgi toplama |
| Cozucu | gemini-3-flash | Kaliteli cozum uretimi |
| Dogrulayici | gemini-3-flash | Bagimisiz dogrulama |
| Sentezleyici | gemini-3-flash | Son ciktinin kalitesi onemli |

### 5.2 Onbellekleme (Caching)

- **Soru Benzerlik Cache:** Benzer sorular icin onceki orkestrasyon planlarini yeniden kullan
- **Konu Bilgisi Cache:** Arastirmaci agentin sik kullanilan konu bilgilerini onbellekle
- **Profil Cache:** Ogrenci profilini her istekte degil, oturum bazinda yukle

### 5.3 Maliyet Tahmini

| Senaryo | Mevcut (tek agent) | Multi-agent |
|---------|-------------------|-------------|
| Basit soru | 1 API call | 1 API call (degisiklik yok) |
| Orta soru | 1 API call | 2-3 API call (~2x maliyet) |
| Kompleks soru | 1 API call | 4-5 API call (~4x maliyet) |

**Optimizasyon:** Kompleks sorularin toplam soru icindeki orani genellikle %10-20 arasinda oldugundan, ortalama maliyet artisi ~%30-50 olacaktir. Bunun karsiliginda kalite onemli olcude artar.

---

## 6. Uygulama Fazlari

### Faz 1: Temel Altyapi (1. hafta)
- [ ] Orkestrator agent endpointi olusturma
- [ ] Komplekslik tespit mekanizmasi
- [ ] Basit multi-agent pipeline (cozucu + dogrulayici)
- [ ] SSE ile ilerleme bildirimi

### Faz 2: Frontend Entegrasyonu (2. hafta)
- [ ] Progress UI komponenti (dot matrix animasyon)
- [ ] Fazlarin kullaniciya gosterilmesi
- [ ] Mevcut chat akisiyla entegrasyon
- [ ] Multi-agent sonuclarinin mevcut renderer ile gosterimi

### Faz 3: Gelismis Agentlar (3. hafta)
- [ ] Arastirmaci agent eklenmesi
- [ ] Ogrenci profili bazli kisisellestirilmis sentezleme
- [ ] Paralel agent calistirma optimizasyonu
- [ ] Hata/retry mekanizmalari

### Faz 4: Izleme ve Iyilestirme (4. hafta)
- [ ] Agent performans metrikleri (sure, token kullanimi)
- [ ] Kullanici memnuniyet geri bildirimi (thumbs up/down per agent response)
- [ ] A/B testi: tek agent vs multi-agent kalite karsilastirmasi
- [ ] Maliyet optimizasyonu ve model secimi fine-tuning

---

## 7. Ornek Kullanim Senaryolari

### Senaryo 1: Matematik Problemi
```
Ogrenci: "Bir topun atilis hizini bulmak icin kinematik denklemleri kullanarak
          45 derece aciyla atilan topun 100m uzaga dustugunu biliyoruz.
          Atis hizini ve maksimum yuksekligi bul."

Orkestrator: kompleks (fizik + matematik, cok adimli)

Agent 1 (Arastirmaci): Mermicik hareketi formulleri, kinematik denklemler
Agent 2 (Cozucu): Adim adim cozum uret
Agent 3 (Dogrulayici): Sonucu farkli yontemle dogrula
Agent 4 (Sentezleyici): Ogrenci profiline uygun aciklama
```

### Senaryo 2: Tarih Analizi
```
Ogrenci: "Osmanli Imparatorlugu'nun cokus nedenlerini ekonomik, askeri ve
          sosyal acilardan karsilastirmali olarak analiz et."

Orkestrator: kompleks (coklu perspektif, karsilastirma)

Agent 1 (Ekonomi Uzmani): Ekonomik faktorleri analiz et
Agent 2 (Askeri Uzman): Askeri faktorleri analiz et
Agent 3 (Sosyal Uzman): Sosyal faktorleri analiz et
Agent 4 (Sentezleyici): Uc perspektifi birlestir, karsilastirmali tablo olustur
```

---

## 8. Alternatif Yaklasimlar

### 8.1 Chain-of-Thought + Self-Verification (Daha Basit)
Tek model kullanarak ama iki asamali:
1. Ilk asama: Cozum uret
2. Ikinci asama: Ayni modelden cozumu dogrulamasini iste

**Avantaj:** Daha az API call, basit uygulama
**Dezavantaj:** Ayni modelin kendi hatasini bulmasi zor

### 8.2 Debate Yaklasimi
Iki agent farkli yaklasimlarla cozum uretir, ucuncu agent en iyisini secer.

**Avantaj:** Daha yuksek dogruluk
**Dezavantaj:** En pahali yontem (3x API call minimum)

### 8.3 Hibrit Yaklasim (Onerilen)
- Basit sorular: Tek agent (mevcut sistem)
- Orta sorular: Chain-of-Thought + dogrulama (2 call)
- Kompleks sorular: Full multi-agent pipeline (4-5 call)

Bu yaklasim maliyet/kalite dengesini en iyi sekilde saglar.

---

## 9. Sonuc ve Oneri

**Onerilen strateji: Hibrit Yaklasim (8.3)**

1. **Oncelik 1:** Orkestrator agent ile komplekslik tespiti ekle
2. **Oncelik 2:** Kompleks sorular icin cozucu + dogrulayici pipeline kur
3. **Oncelik 3:** Frontend progress UI ekle (ekran goruntusundeki gibi)
4. **Oncelik 4:** Tam multi-agent sisteme gec

Bu yaklasim:
- Basit sorularda mevcut hiz ve maliyeti korur
- Kompleks sorularda onemli olcude daha dogru sonuclar uretir
- Kullaniciya seffaf ilerleme gosterir ("AI'lar birlikte calisiyor" hissi)
- Kademeli olarak uygulanabilir, ani buyuk degisiklik gerektirmez
