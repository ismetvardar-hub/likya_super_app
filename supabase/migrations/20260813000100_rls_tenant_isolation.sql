-- ============================================================================
-- LİKYA SUPER-APP: AŞAMA 1 — RLS (Row Level Security) & TENANT İZOLASYONU
-- Rol bazlı erişim: CEO (admin) tüm veriye erişir; Manager/Staff kendi
-- alanında; Customer yalnızca kendi kayıtlarına. Rol kaynağı: app_users.role.
-- Mevcut user-scoped politikalar KORUNUR; bu migration eksik rolleri ekler.
-- ============================================================================

-- 1. ROL YARDIMCI FONKSİYONLARI
CREATE OR REPLACE FUNCTION public.is_ceo()
RETURNS BOOLEAN LANGUAGE sql STABLE AS $$
  SELECT EXISTS (SELECT 1 FROM public.app_users WHERE id = auth.uid() AND role = 'admin');
$$;

CREATE OR REPLACE FUNCTION public.is_staff()
RETURNS BOOLEAN LANGUAGE sql STABLE AS $$
  SELECT EXISTS (SELECT 1 FROM public.app_users WHERE id = auth.uid() AND role IN ('admin','merchant','guide'));
$$;

-- 2. TENANT İZOLASYONU — app_users üzerinde rol bazlı okuma
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "app_users_ceo_read_all" ON public.app_users;
CREATE POLICY "app_users_ceo_read_all" ON public.app_users FOR SELECT USING (public.is_ceo());
DROP POLICY IF EXISTS "app_users_staff_read_own" ON public.app_users;
CREATE POLICY "app_users_staff_read_own" ON public.app_users FOR SELECT USING (auth.uid() = id OR public.is_staff());

-- 3. ÇEKİRDEK TABLOLAR — CEO tüm veri, kullanıcı kendi satırı (mevcut + genişletme)
-- Not: her tablo için "is_ceo bypass" politikası eklenir (tenant izolasyonu güvencesi).
DO $$
DECLARE
  t TEXT;
  tables TEXT[] := ARRAY['trail_pois','gpx_tracks','gpx_track_points','sos_alerts','bookings',
    'marketplace_orders','likya_pay_transactions','coupons','wallets','fair_products',
    'events','tickets','parcels','sports_facilities','pos_transactions','staff_tasks',
    'try_before_buy_bookings','upcycling_items','reservations','users','repair_donations',
    'memberships','facility_blocks','rental_contracts','inventory_items','ingredient_stock',
    'loyalty_cards','notifications','subscriptions','vault_knowledge','ceo_decisions',
    'audit_logs','campuses','campaign_coupons'];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', 'ceo_bypass_' || t, t);
    EXECUTE format('CREATE POLICY %I ON public.%I FOR SELECT USING (public.is_ceo())', 'ceo_bypass_' || t, t);
  END LOOP;
END $$;

-- 4. DOĞRULAMA
-- SELECT is_ceo(); -- auth yoksa false
-- ============================================================================