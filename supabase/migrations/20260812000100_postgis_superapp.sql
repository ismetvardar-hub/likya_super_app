-- ============================================================================
-- LİKYA SUPER-APP: POSTGIS SUPERPAPP MIGRATION (Trail GPS, SOS, Booking, Market, Pay)
-- File: supabase/migrations/20260812000100_postgis_superapp.sql
-- Date: 2026-08-12
-- Description: PostGIS coğrafi katmanı + trail_pois, gpx_tracks, sos_alerts,
--              bookings, marketplace_orders, likya_pay_transactions, coupons
--              (RLS politikaları ile). Mevcut tablolar korunur (non-breaking).
-- ============================================================================

-- 1. POSTGIS EKLENTİSİ (coğrafi sorgular: ST_DWithin, ST_MakePoint, ST_DistanceSphere)
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================================================
-- 2. TRAIL & DOĞA (Likya Yolu GPS / Harita)
-- ============================================================================

-- 2.1 POI: su / kamp / tarih / manzara noktaları
CREATE TABLE IF NOT EXISTS public.trail_pois (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name        TEXT NOT NULL,
    category    TEXT NOT NULL CHECK (category IN ('su','kamp','tarih','manzara','yemek')),
    description TEXT DEFAULT '',
    geom        geometry(Point, 4326) NOT NULL,
    features    JSONB DEFAULT '{}'::jsonb,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_trail_pois_geom ON public.trail_pois USING GIST (geom);

ALTER TABLE public.trail_pois ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pois_read_all" ON public.trail_pois;
CREATE POLICY "pois_read_all" ON public.trail_pois FOR SELECT USING (true);

-- 2.2 GPX parkur başlığı (offline indirme için XML saklanır)
CREATE TABLE IF NOT EXISTS public.gpx_tracks (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title       TEXT NOT NULL,
    difficulty  TEXT NOT NULL CHECK (difficulty IN ('kolay','orta','zor')),
    distance_km REAL NOT NULL DEFAULT 0,
    gpx_xml     TEXT NOT NULL DEFAULT '',
    created_by  UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.gpx_tracks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "tracks_read_all" ON public.gpx_tracks;
CREATE POLICY "tracks_read_all" ON public.gpx_tracks FOR SELECT USING (true);
DROP POLICY IF EXISTS "tracks_insert_own" ON public.gpx_tracks;
CREATE POLICY "tracks_insert_own" ON public.gpx_tracks FOR INSERT WITH CHECK (auth.uid() = created_by);

-- 2.3 GPX iz noktaları (PostGIS geometri + yükseklik)
CREATE TABLE IF NOT EXISTS public.gpx_track_points (
    id        BIGSERIAL PRIMARY KEY,
    track_id  UUID NOT NULL REFERENCES public.gpx_tracks(id) ON DELETE CASCADE,
    seq       INTEGER NOT NULL,
    geom      geometry(Point, 4326) NOT NULL,
    ele       REAL DEFAULT 0,
    ts        TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_gpx_track_points_track ON public.gpx_track_points (track_id);

ALTER TABLE public.gpx_track_points ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "points_read_all" ON public.gpx_track_points;
CREATE POLICY "points_read_all" ON public.gpx_track_points FOR SELECT USING (true);

-- 2.4 SOS acil durum butonu (koordinat + mesaj + durum)
CREATE TABLE IF NOT EXISTS public.sos_alerts (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    geom       geometry(Point, 4326) NOT NULL,
    message    TEXT DEFAULT '',
    status     TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open','dispatched','resolved')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_sos_alerts_status ON public.sos_alerts (status);

ALTER TABLE public.sos_alerts ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "sos_insert_own" ON public.sos_alerts;
CREATE POLICY "sos_insert_own" ON public.sos_alerts FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "sos_read_own" ON public.sos_alerts;
CREATE POLICY "sos_read_own" ON public.sos_alerts FOR SELECT USING (auth.uid() = user_id);

-- ============================================================================
-- 3. BOOKING (Keşif & Etkinlik: tur / tekne / yamaç paraşütü)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.bookings (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type       TEXT NOT NULL CHECK (type IN ('tur','tekne','parasut','etkinlik')),
    service_id TEXT NOT NULL,
    slot_ts    TIMESTAMPTZ NOT NULL,
    party_size INTEGER NOT NULL DEFAULT 1 CHECK (party_size > 0),
    total      NUMERIC(10,2) NOT NULL DEFAULT 0,
    status     TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','confirmed','cancelled','completed')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON public.bookings (user_id);
CREATE INDEX IF NOT EXISTS idx_bookings_type ON public.bookings (type);

ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "bookings_insert_own" ON public.bookings;
CREATE POLICY "bookings_insert_own" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "bookings_read_own" ON public.bookings;
CREATE POLICY "bookings_read_own" ON public.bookings FOR SELECT USING (auth.uid() = user_id);

-- ============================================================================
-- 4. MARKETPLACE (Pazar & Yerel Esnaf)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.marketplace_orders (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL,
    qty        INTEGER NOT NULL DEFAULT 1 CHECK (qty > 0),
    total      NUMERIC(10,2) NOT NULL DEFAULT 0,
    address    TEXT DEFAULT '',
    status     TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','preparing','ready','delivered','cancelled')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_marketplace_orders_user ON public.marketplace_orders (user_id);

ALTER TABLE public.marketplace_orders ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "mkt_orders_insert_own" ON public.marketplace_orders;
CREATE POLICY "mkt_orders_insert_own" ON public.marketplace_orders FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "mkt_orders_read_own" ON public.marketplace_orders;
CREATE POLICY "mkt_orders_read_own" ON public.marketplace_orders FOR SELECT USING (auth.uid() = user_id);

-- ============================================================================
-- 5. LİKYA PAY CÜZDANI (bakiye işlemleri + kupon)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.likya_pay_transactions (
    id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    kind       TEXT NOT NULL CHECK (kind IN ('credit','debit','refund')),
    amount     NUMERIC(10,2) NOT NULL CHECK (amount > 0),
    ref_type   TEXT DEFAULT '',
    ref_id     TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_likya_pay_user ON public.likya_pay_transactions (user_id);

ALTER TABLE public.likya_pay_transactions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "pay_insert_own" ON public.likya_pay_transactions;
CREATE POLICY "pay_insert_own" ON public.likya_pay_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "pay_read_own" ON public.likya_pay_transactions;
CREATE POLICY "pay_read_own" ON public.likya_pay_transactions FOR SELECT USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.coupons (
    id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code         TEXT NOT NULL UNIQUE,
    user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    discount     NUMERIC(10,2) NOT NULL DEFAULT 0,
    valid_until  TIMESTAMPTZ NOT NULL,
    used_at      TIMESTAMPTZ,
    created_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "coupons_read_own" ON public.coupons;
CREATE POLICY "coupons_read_own" ON public.coupons FOR SELECT USING (auth.uid() = user_id);
DROP POLICY IF EXISTS "coupons_update_own" ON public.coupons;
CREATE POLICY "coupons_update_own" ON public.coupons FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================================
-- 6. BACKEND AUTH (NestJS) — app_users + auth_credentials
--    Supabase auth.users'tan bağımsız modüler monolit kimliği (JWT RBAC).
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.app_users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email       TEXT NOT NULL UNIQUE,
    full_name   TEXT NOT NULL DEFAULT '',
    role        TEXT NOT NULL DEFAULT 'tourist' CHECK (role IN ('tourist','merchant','guide','admin')),
    created_at  TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "app_users_read_own" ON public.app_users;
CREATE POLICY "app_users_read_own" ON public.app_users FOR SELECT USING (auth.uid() = id);

CREATE TABLE IF NOT EXISTS public.auth_credentials (
    user_id       UUID PRIMARY KEY REFERENCES public.app_users(id) ON DELETE CASCADE,
    password_hash TEXT NOT NULL,
    created_at    TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.auth_credentials ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "auth_creds_no_read" ON public.auth_credentials;
CREATE POLICY "auth_creds_no_read" ON public.auth_credentials FOR SELECT USING (false);

-- ============================================================================
-- 7. DOĞRULAMA SORGULARI (CI sonrası elle de çalıştırılabilir)
-- SELECT count(*) FROM trail_pois;
-- SELECT ST_DistanceSphere(
--   (SELECT geom FROM trail_pois LIMIT 1),
--   ST_SetSRID(ST_MakePoint(29.9, 36.2), 4326)) AS dist_m;
-- ============================================================================
