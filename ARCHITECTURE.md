# LİKYA SUPER-APP - ARCHITECTURE SPECIFICATION

## 1. Veritabanı Mimarisi (Supabase / PostgreSQL)

Sistem 5 ana tablo üzerinde kurgulanmıştır:

### 1.1. `users` Tablosu
`auth.users` tablosunu genişleten profil tablosu.
- `id` (UUID, Primary Key, References `auth.users(id)` ON DELETE CASCADE)
- `email` (TEXT, NOT NULL)
- `full_name` (TEXT)
- `phone` (TEXT)
- `role` (TEXT, DEFAULT 'user', CHECK `role IN ('user', 'seller', 'organizer', 'repairer', 'admin')`)
- `avatar_url` (TEXT)
- `created_at` (TIMESTAMPTZ, DEFAULT NOW())
- `updated_at` (TIMESTAMPTZ, DEFAULT NOW())

### 1.2. `fair_products` Tablosu
Adil Ticaret (Fair Trade) platformu ürünleri.
- `id` (UUID, Primary Key, DEFAULT gen_random_uuid())
- `seller_id` (UUID, NOT NULL, References `public.users(id)`)
- `name` (TEXT, NOT NULL)
- `description` (TEXT)
- `price` (NUMERIC(10,2), NOT NULL, CHECK price >= 0)
- `stock_quantity` (INTEGER, DEFAULT 0, CHECK stock_quantity >= 0)
- `category` (TEXT, NOT NULL)
- `status` (TEXT, DEFAULT 'active', CHECK status IN ('active', 'inactive', 'sold_out'))
- `image_url` (TEXT)
- `created_at` (TIMESTAMPTZ, DEFAULT NOW())
- `updated_at` (TIMESTAMPTZ, DEFAULT NOW())

### 1.3. `events` Tablosu
Yerel kültür, sanat ve topluluk etkinlikleri.
- `id` (UUID, Primary Key, DEFAULT gen_random_uuid())
- `organizer_id` (UUID, NOT NULL, References `public.users(id)`)
- `title` (TEXT, NOT NULL)
- `description` (TEXT)
- `location` (TEXT, NOT NULL)
- `start_time` (TIMESTAMPTZ, NOT NULL)
- `end_time` (TIMESTAMPTZ, NOT NULL)
- `total_capacity` (INTEGER, NOT NULL, CHECK total_capacity > 0)
- `available_capacity` (INTEGER, NOT NULL)
- `ticket_price` (NUMERIC(10,2), DEFAULT 0.00, CHECK ticket_price >= 0)
- `status` (TEXT, DEFAULT 'published', CHECK status IN ('draft', 'published', 'cancelled', 'completed'))
- `created_at` (TIMESTAMPTZ, DEFAULT NOW())
- `updated_at` (TIMESTAMPTZ, DEFAULT NOW())

### 1.4. `tickets` Tablosu
Etkinlik biletleri ve katılım QR kodları.
- `id` (UUID, Primary Key, DEFAULT gen_random_uuid())
- `event_id` (UUID, NOT NULL, References `public.events(id)` ON DELETE CASCADE)
- `user_id` (UUID, NOT NULL, References `public.users(id)` ON DELETE CASCADE)
- `status` (TEXT, DEFAULT 'valid', CHECK status IN ('valid', 'used', 'cancelled'))
- `qr_code` (TEXT, UNIQUE, NOT NULL)
- `created_at` (TIMESTAMPTZ, DEFAULT NOW())

### 1.5. `repair_donations` Tablosu
Sürdürülebilir yaşam için eşya onarım ve bağış takip sistemi.
- `id` (UUID, Primary Key, DEFAULT gen_random_uuid())
- `donor_id` (UUID, NOT NULL, References `public.users(id)`)
- `item_name` (TEXT, NOT NULL)
- `description` (TEXT)
- `category` (TEXT, NOT NULL)
- `repair_status` (TEXT, DEFAULT 'pending', CHECK repair_status IN ('pending', 'in_repair', 'repaired', 'donated', 'recycled'))
- `donation_amount` (NUMERIC(10,2), DEFAULT 0.00)
- `location` (TEXT)
- `created_at` (TIMESTAMPTZ, DEFAULT NOW())
- `updated_at` (TIMESTAMPTZ, DEFAULT NOW())

---

## 2. Row Level Security (RLS) Politikası Stratejisi

Tüm tablolarda `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;` şarttır.

### Güvenlik Kuralları:
1. **`users`**:
   - `SELECT`: Herkes kendi profilini veya admin tüm profilleri okur.
   - `INSERT`: Supabase auth trigger veya kullanıcının kendisi kayıt esnasında oluşturur.
   - `UPDATE`: Kullanıcı sadece kendi profilini günceller.
2. **`fair_products`**:
   - `SELECT`: Herkes (anon dahil) 'active' durumdaki ürünleri okur.
   - `INSERT`: Sadece 'seller' veya 'admin' rolündeki kullanıcılar kendi `seller_id` bilgileriyle ekleyebilir.
   - `UPDATE`/`DELETE`: Satıcı kendi ürününü, admin tüm ürünleri değiştirebilir/silebilir.
3. **`events`**:
   - `SELECT`: Herkes 'published' etkinlikleri okur.
   - `INSERT`/`UPDATE`: 'organizer' veya 'admin' kendi etkinliğini yönetebilir.
4. **`tickets`**:
   - `SELECT`: Kullanıcı kendi biletlerini okur. Organizatör/Admin ilgili etkinliğin biletlerini okur.
   - `INSERT`: Giriş yapmış kullanıcı bilet satın alabilir / oluşturabilir.
5. **`repair_donations`**:
   - `SELECT`: Bağışçı kendi kaydını, 'repairer' ve 'admin' tüm kayıtları okur.
   - `INSERT`: Giriş yapmış kullanıcı bağış/onarım talebi açabilir.
   - `UPDATE`: 'repairer' ve 'admin' durum güncellemesi yapabilir.

---

## 3. Mobil Uygulama Mimarisi (`apps/mobile`)

Clean Architecture + Feature-First yapısı:
```
apps/mobile/
├── pubspec.yaml
├── lib/
│   ├── main.dart
│   ├── core/
│   │   ├── config/
│   │   ├── services/
│   │   ├── theme/
│   │   └── utils/
│   └── features/
│       ├── auth/
│       ├── fair_products/
│       ├── events/
│       ├── tickets/
│       └── repair_donations/
└── test/
```
