# LİKYA SUPER-APP — MİMARİ PLAN (v2: PostGIS + NestJS Backend Katmanı)

> Kapsam: Likya bölgesi turizm, doğa sporları (Likya Yolu GPS), yerel hizmetler,
> etkinlikler, rezervasyon ve esnaf/pazar ekosistemini birleştiren modüler Super App.
> Bu doküman; modül sınırlarını, veritabanı şemasını ve API yüzeyini tanımlar.

---

## 1. Teknoloji Yığını (Seçim & Gerekçe)

| Katman | Seçim | Gerekçe |
|---|---|---|
| Mobil | **Flutter** (Cross-platform, mevcut `apps/mobile` 108 Dart dosyası) | Tek kod tabanı iOS+Android, yüksek performanslı harita/OFFLINE parkur |
| Backend | **Node.js + NestJS (TypeScript strict)** `apps/backend` | Modüler monolit → ihtiyaçta mikroservise bölünebilir; Decorator-RBAC, Guard hattı hazır |
| Veritabanı | **PostgreSQL + PostGIS** (Supabase üstü) | Coğrafi sorgular (`ST_DWithin` yakınlık, GPX iz noktaları), mevcut 34 tablo korunur |
| Önbellek | **Redis** (ioredis) | Oturum/refresh blacklist, bölge POI önbelleği, sayaçlar (müşteri/dk) |
| Harita & Rota | **Mapbox / OpenStreetMap + GPX** | Offline parkur takibi, `.gpx` parse + kayıt, su/kamp noktaları |
| Auth | **Role-based JWT** | `TOURIST` · `MERCHANT` · `GUIDE` · `ADMIN` roller + Guard/Decorator RBAC |

## 2. Monorepo Yapısı

```
likya_super_app/
├── apps/
│   ├── admin/        → CEO Command Center (Next.js 43 görünüm, OmniRoute, Faz 1-3)
│   ├── mobile/       → Flutter Super-App (Daze Vision/Chef/Crew, 108 Dart dosyası)
│   └── backend/      → 🆕 NestJS API Gateway + Modüler Monolit (bu plan)
├── supabase/migrations/  → SQL şemaları (PostGIS eklentisi bu planla gelir)
├── docs/             → Mimari dokümanlar
└── docker-compose.yml    → admin + postgis + redis yerel ortam
```

## 3. Modül Sınırları (Clean Architecture)

```
apps/backend/src/
├── core/
│   ├── config/      → env okuma/doğrulama (zod benzeri, sade)
│   ├── database/    → pg Pool + PostGIS yardımcıları (ST_* sorguları)
│   ├── redis/       → ioredis önbellek/kuyruk servisi
│   ├── auth/        → JWT strateji, RolesGuard, LoginGuard, refresh döngüsü
│   └── router/      → API Gateway: /v1/{modül} önek yönlendirme + loglama
└── modules/         → Bağımsız feature modülleri (tek sorumluluk)
    ├── trail/       → GPS/Harita: GPX, POI yakınlık, SOS
    ├── booking/     → Tur/tekne/yamaç paraşütü rezervasyon
    ├── marketplace/ → Esnaf ürün siparişi + restoran
    └── wallet/      → Likya Pay: bakiye, QR ödeme, kupon
```

**Modül bağımsızlık kuralı:** Bir modül yalnızca `core/*`'a bağımlıdır; diğer modüllere doğrudan import yok
(ör. `wallet` yalnızca DB/Redis üzerinden `marketplace` ile konuşur → finansal izolasyon).

## 4. Veritabanı Şeması (PostGIS Genişletmesi — yeni migration)

```
postgis eklentisi
trail_pois(id, name, category[su|kamp|tarih|manzara], geom geometry(Point,4326), features)
gpx_tracks(id, title, difficulty, distance_km, gpx_xml, created_by)
gpx_track_points(track_id FK, seq, geom geometry(Point,4326), ele, ts)
sos_alerts(id, user_id FK, geom geometry(Point,4326), message, status, created_at)
bookings(id, user_id FK, type[tur|tekne|parasut], service_id, slot_ts, party_size, total, status)
marketplace_orders(id, user_id FK, product_id, qty, total, address, status)
likya_pay_transactions(id, user_id FK, kind[credit|debit|refund], amount, ref_type, ref_id, created_at)
coupons(id, code, user_id FK NULL, discount, valid_until, used_at)
```

Mevcut `users`, `wallets`, `events`, `tickets`, `fair_products` tabloları **korunur** (non-breaking);
yeni tablolar RLS ile `auth.uid()` bağlıdır. PostGIS fonksiyonları: `ST_SetSRID`, `ST_MakePoint`,
`ST_DWithin`, `ST_DistanceSphere`.

## 5. API Yüzeyi (API Gateway)

| Yöntem | Rota | Rol | Modül |
|---|---|---|---|
| POST | `/v1/auth/register` | public | Auth |
| POST | `/v1/auth/login` | public | Auth |
| POST | `/v1/auth/refresh` | public | Auth |
| GET  | `/v1/auth/me` | TOURIST+ | Auth |
| GET  | `/v1/trail/pois/nearby?lat&lng&radius` | TOURIST+ | Trail |
| POST | `/v1/trail/gpx` | TOURIST+ | Trail (GPX yükle) |
| GET  | `/v1/trail/tracks/:id` | TOURIST+ | Trail |
| POST | `/v1/trail/sos` | TOURIST+ | Trail (SOS) |
| GET  | `/v1/booking/available?type&date` | TOURIST+ | Booking |
| POST | `/v1/booking` | TOURIST+ | Booking |
| GET  | `/v1/marketplace/products` | public | Marketplace |
| POST | `/v1/marketplace/orders` | TOURIST+ | Marketplace |
| GET  | `/v1/wallet/balance` | TOURIST+ | Wallet |
| POST | `/v1/wallet/pay` | TOURIST+ | Wallet (QR) |
| POST | `/v1/wallet/coupons/redeem` | TOURIST+ | Wallet |

## 6. Güvenlik Modeli

1. **JWT Access (15 dk) + Refresh (7 gün)** — refresh Redis'e kayıtlı, iptal edilebilir (blacklist).
2. **RBAC:** `@Roles(Role.TOURIST)` dekoratörü + `RolesGuard`; `JwtAuthGuard` zincirin ilk halkası.
3. **Rate limit:** Redis sayacı (IP/route) — kamu rotalarında brute-force koruması.
4. **Veri doğrulama:** class-validator DTO'ları global `ValidationPipe` (whitelist, transform).
5. **Hata sözleşmesi:** Global `HttpExceptionFilter` → `{ error, message, statusCode, path, ts }` JSON.
