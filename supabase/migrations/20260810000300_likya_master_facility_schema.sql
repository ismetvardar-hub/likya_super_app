-- ==============================================================================
-- LİKYA AÇIKHAVA İNOVASYON, KAMP & YAŞAM KAMPÜSÜ - MASTER SUPABASE SCHEMA
-- Mimari: Rol Bazlı Erişim (RBAC), Try Before Buy, Biletleme, IoT & Upcycling
-- ==============================================================================

-- 1. KULLANICI ROLLERİ VE PROFİLLER (RBAC)
CREATE TYPE user_role AS ENUM ('customer', 'tenant', 'staff', 'patron');

CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    role user_role DEFAULT 'customer',
    wallet_balance_try NUMERIC(12, 2) DEFAULT 0.00,
    eco_points INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. FUAR & "TRY BEFORE BUY" KARAVAN / TINY HOUSE PARSELLERİ
CREATE TABLE IF NOT EXISTS parcels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parcel_number VARCHAR(20) UNIQUE NOT NULL, -- Örn: PARSEL-01
    zone VARCHAR(50) NOT NULL, -- Örn: Karavan Showroom, Tiny House Glamping
    electricity_meter_id TEXT,
    water_meter_id TEXT,
    is_occupied BOOLEAN DEFAULT FALSE,
    daily_price_try NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS showroom_vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    manufacturer_name TEXT NOT NULL, -- Üretici Marka (Sponsor)
    model_name TEXT NOT NULL, -- Örn: Hymer Grand Canyon S
    category TEXT NOT NULL, -- Karavan, Tiny House, E-Bike, Ahşap Sauna
    parcel_id UUID REFERENCES parcels(id) ON DELETE SET NULL,
    sale_price_try NUMERIC(12, 2) NOT NULL, -- Satış Fiyatı
    commission_rate NUMERIC(5, 2) DEFAULT 8.00, -- Satıştan Kampüse Kalacak % Komisyon (3% - 15%)
    qr_code_hash TEXT UNIQUE NOT NULL,
    specs JSONB, -- Yalıtım, Akü, Güneş Paneli vb. teknik detaylar
    is_available_for_trial BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS try_before_buy_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    vehicle_id UUID REFERENCES showroom_vehicles(id) ON DELETE CASCADE,
    parcel_id UUID REFERENCES parcels(id) ON DELETE CASCADE,
    check_in_date DATE NOT NULL,
    check_out_date DATE NOT NULL,
    total_nights INTEGER NOT NULL,
    total_paid_try NUMERIC(10, 2) NOT NULL,
    status VARCHAR(30) DEFAULT 'confirmed', -- confirmed, active, completed, converted_to_sale
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS sales_commissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES try_before_buy_bookings(id),
    vehicle_id UUID REFERENCES showroom_vehicles(id),
    sale_price_try NUMERIC(12, 2) NOT NULL,
    commission_earned_try NUMERIC(12, 2) NOT NULL,
    manufacturer_payout_try NUMERIC(12, 2) NOT NULL,
    status VARCHAR(30) DEFAULT 'settled',
    settled_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. KÜLTÜR, SANAT & SAHNE (AMATÖR BİLETLEME & AMFİTİYATRO)
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organizer_id UUID REFERENCES profiles(id),
    title TEXT NOT NULL,
    category TEXT NOT NULL, -- Tiyatro, Canlı Müzik, Stand-Up, Açık Hava Sineması, Atölye
    description TEXT,
    event_date TIMESTAMPTZ NOT NULL,
    location TEXT DEFAULT 'Merkez Amfitiyatro',
    total_seats INTEGER DEFAULT 500,
    ticket_price_try NUMERIC(10, 2) DEFAULT 0.00, -- 0 ise ücretsiz halk etkinliği
    wear_tear_fee_try NUMERIC(10, 2) DEFAULT 0.00, -- Malzeme yıpranma payı
    commission_rate NUMERIC(5, 2) DEFAULT 12.00, -- Bilet Komisyonu (%10 - %15)
    is_approved BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    seat_number VARCHAR(20),
    paid_amount_try NUMERIC(10, 2) NOT NULL,
    totp_qr_secret TEXT NOT NULL, -- 15 saniyede bir dönen dinamik QR
    is_scanned BOOLEAN DEFAULT FALSE,
    scanned_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SPOR, BİYOMEKANİK & SAĞLIK KOMPLEKSİ
CREATE TABLE IF NOT EXISTS sports_facilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL, -- Padel Kortu #1, Tenis Kortu, Plaj Voleybolu, Ahşap Sauna & Ice Bath
    facility_type VARCHAR(50) NOT NULL,
    hourly_rate_try NUMERIC(10, 2) DEFAULT 0.00,
    has_cv_cameras BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS biomechanic_athlete_cards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    athlete_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    sport_type VARCHAR(50) NOT NULL, -- Padel, Tenis, Tırmanış, Koşu
    forehand_accuracy_pct NUMERIC(5, 2), -- Vuruş / Hareket Doğruluğu
    reaction_time_ms INTEGER, -- Reaksiyon Süresi
    joint_stress_score NUMERIC(4, 2), -- Eklem Yük Analizi
    ai_coach_notes TEXT, -- AI Bilgisayarlı Görü Gelişim Tavsiyesi
    analyzed_video_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TİCARİ YAŞAM ALANI (16 DÜKKAN & ALT KİRACI SİSTEMİ)
CREATE TABLE IF NOT EXISTS commercial_shops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID REFERENCES profiles(id),
    shop_number VARCHAR(20) UNIQUE NOT NULL, -- DÜKKAN-01 ... DÜKKAN-16
    name TEXT NOT NULL, -- Doğa Marketi, Outdoor Kiralama, Cafe/Bistro, Pod-Ofis
    category TEXT NOT NULL,
    monthly_base_rent_try NUMERIC(10, 2) DEFAULT 0.00,
    revenue_share_pct NUMERIC(5, 2) DEFAULT 10.00, -- Ciro Payı Yüzdesi
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pos_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shop_id UUID REFERENCES commercial_shops(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    total_amount_try NUMERIC(10, 2) NOT NULL,
    campus_share_amount_try NUMERIC(10, 2) NOT NULL,
    tenant_payout_try NUMERIC(10, 2) NOT NULL,
    payment_method VARCHAR(30) DEFAULT 'likya_wallet', -- wallet, credit_card, cash
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. SOSYAL SORUMLULUK & TAMİR ATÖLYESİ (UPCYCLING LAB -> AMATÖR SPOR KULÜBÜ)
CREATE TABLE IF NOT EXISTS upcycling_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    item_title TEXT NOT NULL, -- Örn: Kırık Tenis Raketi, Hasarlı Gitar, Dağ Bisikleti
    category VARCHAR(50) NOT NULL, -- Spor Aleti, Müzik Enstrümanı, Elektronik, Ahşap
    condition_description TEXT,
    repair_status VARCHAR(30) DEFAULT 'in_repair', -- received, in_repair, restored, sold_for_charity
    restoration_cost_try NUMERIC(10, 2) DEFAULT 0.00,
    sale_price_try NUMERIC(10, 2), -- 2. El Satış Fiyatı
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS amateur_sports_club_funds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    upcycling_item_id UUID REFERENCES upcycling_items(id),
    amount_transferred_try NUMERIC(10, 2) NOT NULL,
    description TEXT NOT NULL, -- Örn: Tamir edilen bisiklet satışından altyapı genç takımına krampon desteği
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. IOT, AKILLI SAYAÇLAR & KAPI OTOMASYONU
CREATE TABLE IF NOT EXISTS iot_meters_and_gates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_name TEXT NOT NULL, -- Parsel-04 Elektrik Sayacı, Kuzey Ana Giriş ANPR Bariyeri
    device_type VARCHAR(50) NOT NULL, -- electricity_meter, water_meter, anpr_gate, turnstile_relay
    mqtt_topic TEXT NOT NULL,
    current_value NUMERIC(12, 2) DEFAULT 0.00,
    unit VARCHAR(20) DEFAULT 'kWh', -- kWh, Litre, Status
    is_online BOOLEAN DEFAULT TRUE,
    last_ping TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gate_access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gate_id UUID REFERENCES iot_meters_and_gates(id),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    plate_number VARCHAR(30), -- ANPR Plaka
    access_granted BOOLEAN DEFAULT TRUE,
    trigger_method VARCHAR(30) DEFAULT 'anpr', -- anpr, dynamic_qr, ble, manual_staff
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ÇALIŞAN OTONOM SAHA GÖREVLERİ & VARDİYA
CREATE TABLE IF NOT EXISTS staff_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    staff_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    task_title TEXT NOT NULL, -- Örn: Parsel-08 Karavan Çıkış Temizlik Kontrolü, GES Panel Toz Kontrolü
    zone TEXT NOT NULL,
    priority VARCHAR(20) DEFAULT 'normal', -- low, normal, urgent
    status VARCHAR(30) DEFAULT 'pending', -- pending, in_progress, qr_verified_done
    qr_checkpoint_code TEXT NOT NULL, -- Çalışanın sahada fiziken okutması gereken QR
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. AI COMPUTER VISION 2. EL PAZARYERİ TANIMA
CREATE TABLE IF NOT EXISTS cv_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id),
    image_url TEXT NOT NULL,
    detected_brand TEXT, -- Örn: Quechua, Shimano, Fender
    detected_model TEXT, -- Arpenaz 4.1 Çadır
    confidence_score NUMERIC(5, 2), -- %98.4 Doğruluk
    estimated_resale_value_try NUMERIC(10, 2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
