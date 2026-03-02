# Odaklio Backend Mimari Direktifi

Bu dosya, Odaklio projesinin backend mimarisini, kurallarını ve standartlarını tanımlar.
Tüm backend geliştirmeleri bu direktife uygun olarak yapılmalıdır.

---

## 1. Teknoloji Yığını

| Katman | Teknoloji | Versiyon |
|--------|-----------|----------|
| Framework | Next.js (App Router) | 16.x |
| Runtime | Node.js | 20+ |
| Dil | TypeScript (strict) | 5.x |
| Veritabanı | PostgreSQL (Supabase) | 15+ |
| Auth | Supabase Auth | 2.x |
| Validasyon | Zod | 3.x |
| AI | Google Gemini API | - |
| Realtime | Supabase Realtime | - |

---

## 2. Dizin Yapısı

```
lib/
├── supabase.ts              # Client-side Supabase istemcisi (tarayıcı)
├── supabase-server.ts       # Server-side Supabase istemcisi (API routes)
├── types/
│   └── database.ts          # Veritabanı tablo tipleri & enum'lar
├── validators/
│   └── chat.ts              # Chat ile ilgili Zod şemaları
├── middleware/
│   ├── auth.ts              # API route auth doğrulama
│   └── rate-limit.ts        # İstek hız sınırlama
└── db/
    ├── conversations.ts     # Konuşma CRUD işlemleri
    └── messages.ts          # Mesaj CRUD işlemleri

app/
├── api/
│   ├── chat/
│   │   └── route.ts         # AI sohbet (streaming)
│   ├── conversations/
│   │   ├── route.ts         # GET: listele, POST: oluştur
│   │   └── [id]/
│   │       ├── route.ts     # GET: detay, PATCH: güncelle, DELETE: sil
│   │       └── messages/
│   │           └── route.ts # GET: mesajları listele, POST: mesaj ekle
│   └── quick-learn/
│       └── route.ts         # Hızlı öğrenme API
└── ...

supabase/
└── migrations/
    └── 001_chat_history.sql # Veritabanı migration dosyası
```

---

## 3. Veritabanı Şeması

### 3.1 Tablolar

#### `profiles` — Kullanıcı Profilleri
Supabase Auth `auth.users` tablosuyla 1:1 ilişkili.
```sql
profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
)
```

#### `conversations` — Sohbet Konuşmaları
Her kullanıcının birden fazla konuşması olabilir.
```sql
conversations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title       TEXT NOT NULL DEFAULT 'Yeni Sohbet',
  is_archived BOOLEAN DEFAULT false,
  metadata    JSONB DEFAULT '{}',
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
)
```

`metadata` JSONB alanı esnek veri için kullanılır:
```json
{
  "tags": ["Fizik", "Mekanik"],
  "chat_style": "standard",
  "mentor_type": "coach"
}
```

#### `messages` — Mesajlar
Bir konuşmaya ait tüm mesajlar.
```sql
messages (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id  UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  role             TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content          TEXT NOT NULL,
  metadata         JSONB DEFAULT '{}',
  created_at       TIMESTAMPTZ DEFAULT now()
)
```

### 3.2 İndeksler
```sql
-- Performans için kritik indeksler
CREATE INDEX idx_conversations_user_id ON conversations(user_id);
CREATE INDEX idx_conversations_updated_at ON conversations(updated_at DESC);
CREATE INDEX idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
```

### 3.3 Row Level Security (RLS)
Her tablo için RLS politikaları **zorunludur**. Kullanıcılar SADECE kendi verilerine erişebilir.

```
- profiles:      SELECT/UPDATE yalnızca auth.uid() = id
- conversations: SELECT/INSERT/UPDATE/DELETE yalnızca auth.uid() = user_id
- messages:      SELECT/INSERT yalnızca kendi konuşmalarındaki mesajlar
```

---

## 4. API Route Kuralları

### 4.1 Genel Kurallar

1. **Her API route server-side Supabase client kullanmalıdır** (`lib/supabase-server.ts`)
2. **Her mutasyon (POST/PATCH/DELETE) öncesi auth kontrolü zorunludur**
3. **Her input Zod ile valide edilmelidir**
4. **Rate limiting uygulanmalıdır**
5. **Hata yanıtları tutarlı formatta döner**

### 4.2 Yanıt Formatı

Başarılı:
```json
{ "data": { ... } }
```

Liste:
```json
{ "data": [...], "count": 42 }
```

Hata:
```json
{ "error": "Hata mesajı", "code": "VALIDATION_ERROR" }
```

### 4.3 HTTP Durum Kodları

| Kod | Kullanım |
|-----|----------|
| 200 | Başarılı GET/PATCH |
| 201 | Başarılı POST (yeni kayıt) |
| 400 | Validasyon hatası |
| 401 | Kimlik doğrulanmamış |
| 403 | Yetkisiz erişim |
| 404 | Kayıt bulunamadı |
| 429 | Rate limit aşıldı |
| 500 | Sunucu hatası |

---

## 5. Güvenlik Kuralları

### 5.1 Zorunlu Güvenlik Kontrolleri

1. **RLS her zaman aktif**: Hiçbir tablo RLS'siz bırakılamaz
2. **Server-side auth**: API route'larda `getUser()` ile doğrulama (JWT token çözümleme)
3. **Input validasyonu**: Tüm kullanıcı girdileri Zod ile valide edilir
4. **Rate limiting**: API route'larına istek sınırı uygulanır
5. **SQL Injection koruması**: Supabase client otomatik parametreleme yapar, asla raw SQL yazılmaz
6. **XSS koruması**: Kullanıcı içerikleri render sırasında sanitize edilir
7. **CORS**: Next.js varsayılan same-origin politikası kullanılır

### 5.2 Ortam Değişkenleri

```
# Tarayıcıda erişilebilir (NEXT_PUBLIC_ prefix)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

# SADECE sunucuda erişilebilir (prefix yok)
SUPABASE_SERVICE_ROLE_KEY=    # Sadece migration/admin işlemleri için
GEMINI_API_KEY=
```

**Kural**: `SUPABASE_SERVICE_ROLE_KEY` asla client-side kodda kullanılmaz.

---

## 6. Performans Kuralları

### 6.1 Veritabanı

1. **İndeksler**: Sorgulanan her FK ve filtrelenen sütunda indeks olmalı
2. **Pagination**: Liste endpoint'leri her zaman `limit` ve `offset` desteklemeli (varsayılan: limit=50)
3. **Select optimizasyonu**: Sadece ihtiyaç duyulan sütunlar seçilmeli (`select('id, title, updated_at')`)
4. **Count stratejisi**: Liste yanıtlarında `count: 'exact'` yerine `count: 'estimated'` tercih et (büyük tablolarda)

### 6.2 API

1. **Streaming**: AI yanıtları her zaman SSE stream ile döner
2. **Caching**: Değişmeyen veriler için `Cache-Control` header'ı kullan
3. **Debounce**: Client-side auto-save 2 saniye debounce ile yapılır

---

## 7. Sohbet Geçmişi Akışı

### 7.1 Yeni Sohbet Başlatma
```
1. Kullanıcı ilk mesajı yazar
2. Client → POST /api/conversations (yeni konuşma oluştur)
3. Server → conversations tablosuna kaydet, id döndür
4. Client → POST /api/chat (AI yanıtı al, streaming)
5. Stream tamamlanınca → POST /api/conversations/[id]/messages (user + assistant mesajlarını kaydet)
```

### 7.2 Mevcut Sohbete Devam
```
1. Kullanıcı geçmişten bir sohbet seçer
2. Client → GET /api/conversations/[id]/messages (tüm mesajları yükle)
3. Kullanıcı yeni mesaj yazar
4. Client → POST /api/chat (AI yanıtı al, geçmiş mesajlarla birlikte)
5. Stream tamamlanınca → POST /api/conversations/[id]/messages (yeni mesajları kaydet)
6. Client → PATCH /api/conversations/[id] (title & updated_at güncelle)
```

### 7.3 Otomatik Başlık Oluşturma
İlk mesaj gönderildiğinde, konuşma başlığı otomatik olarak kullanıcının ilk mesajından türetilir:
- İlk 60 karakter alınır
- Cümle sonu noktalanır
- Boş ise "Yeni Sohbet" kullanılır

---

## 8. Yeni Özellik Ekleme Rehberi

Yeni bir backend özelliği eklerken şu sırayı takip et:

1. **Tip tanımla**: `lib/types/database.ts` içinde TypeScript tipi ekle
2. **Migration yaz**: `supabase/migrations/` altına SQL dosyası ekle
3. **RLS politikası ekle**: Migration içinde RLS kurallarını tanımla
4. **Validasyon şeması yaz**: `lib/validators/` altında Zod şeması oluştur
5. **DB servis fonksiyonu yaz**: `lib/db/` altında CRUD fonksiyonları oluştur
6. **API route oluştur**: `app/api/` altında route handler yaz
7. **Frontend entegre et**: Component'ten API'yi çağır

---

## 9. Hata Yönetimi

### 9.1 API Route'larda

```typescript
// Standart hata yakalama pattern'i
try {
  // İş mantığı
} catch (error) {
  console.error('[API_NAME]', error);
  return Response.json(
    { error: 'Bir hata oluştu', code: 'INTERNAL_ERROR' },
    { status: 500 }
  );
}
```

### 9.2 Hata Kodları

| Kod | Açıklama |
|-----|----------|
| `VALIDATION_ERROR` | Giriş verisi geçersiz |
| `AUTH_REQUIRED` | Giriş yapılmamış |
| `FORBIDDEN` | Yetkisiz erişim |
| `NOT_FOUND` | Kayıt bulunamadı |
| `RATE_LIMITED` | Çok fazla istek |
| `INTERNAL_ERROR` | Sunucu hatası |

---

## 10. İleriki Özellikler İçin Hazırlık

Mimari, aşağıdaki özelliklerin eklenmesine hazır olacak şekilde tasarlanmıştır:

- **Flashcard sistemi**: `flashcard_decks` ve `flashcards` tabloları
- **Pomodoro istatistikleri**: `pomodoro_sessions` tablosu
- **Mentor tercihleri**: `user_preferences` tablosu
- **Bildirimler**: `notifications` tablosu
- **Dosya yükleme**: Supabase Storage entegrasyonu
- **Analitik**: `learning_analytics` tablosu
- **Arama**: PostgreSQL full-text search

Her yeni özellik bu direktifteki kurallara uyarak eklenmelidir.
