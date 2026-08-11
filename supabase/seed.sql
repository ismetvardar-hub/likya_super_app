-- ============================================================================
-- LİKYA SUPER-APP: COMPREHENSIVE SEED DATA
-- File: supabase/seed.sql
-- Description: Authentic sample dataset for demonstration and local testing.
-- ============================================================================

-- 1. AUTH USERS (auth.users tablosuna önce kayıt ekle - public.users FK constraint'i için)
INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at, aud, role)
VALUES
    ('00000000-0000-0000-0000-000000000001', 'admin@likya.org', crypt('likya123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Likya CEO & Kurucu Yönetim","role":"admin"}', NOW(), NOW(), 'authenticated', 'authenticated'),
    ('00000000-0000-0000-0000-000000000002', 'ayse.kaya@toros.org', crypt('likya123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Ayşe Kaya (Toros Üretici)","role":"seller"}', NOW(), NOW(), 'authenticated', 'authenticated'),
    ('00000000-0000-0000-0000-000000000003', 'mert.demir@likyasanat.org', crypt('likya123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Mert Demir (Kültür Kulübü)","role":"organizer"}', NOW(), NOW(), 'authenticated', 'authenticated'),
    ('00000000-0000-0000-0000-000000000004', 'kemal.usta@onarim.org', crypt('likya123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Kemal Usta (Onarım Atölyesi)","role":"repairer"}', NOW(), NOW(), 'authenticated', 'authenticated'),
    ('00000000-0000-0000-0000-000000000005', 'ahmet.yilmaz@ogrenci.likya.edu.tr', crypt('likya123', gen_salt('bf')), NOW(), '{"provider":"email","providers":["email"]}', '{"full_name":"Ahmet Yılmaz (Öğrenci)","role":"user"}', NOW(), NOW(), 'authenticated', 'authenticated')
ON CONFLICT (id) DO NOTHING;

-- 2. USERS (public.users - auth.users'a referans verir)
INSERT INTO public.users (id, email, full_name, role, phone)
VALUES
    ('00000000-0000-0000-0000-000000000001', 'admin@likya.org', 'Likya CEO & Kurucu Yönetim', 'admin', '+905550000001'),
    ('00000000-0000-0000-0000-000000000002', 'ayse.kaya@toros.org', 'Ayşe Kaya (Toros Üretici)', 'seller', '+905550000002'),
    ('00000000-0000-0000-0000-000000000003', 'mert.demir@likyasanat.org', 'Mert Demir (Kültür Kulübü)', 'organizer', '+905550000003'),
    ('00000000-0000-0000-0000-000000000004', 'kemal.usta@onarim.org', 'Kemal Usta (Onarım Atölyesi)', 'repairer', '+905550000004'),
    ('00000000-0000-0000-0000-000000000005', 'ahmet.yilmaz@ogrenci.likya.edu.tr', 'Ahmet Yılmaz (Öğrenci)', 'user', '+905550000005')
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role;


-- 2. FAIR PRODUCTS (Adil Masa Ürünleri)
INSERT INTO public.fair_products (id, seller_id, name, description, price, stock_quantity, category, status)
VALUES
    ('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'Soğuk Sıkım Sızma Zeytinyağı (1 L)', 'Toros dağları eteklerinde geleneksel yöntemle üretilmiş, asitsiz organik sızma zeytinyağı.', 180.00, 25, 'Gıda & Organik', 'active'),
    ('10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'Kekik & Çam Ham Balı (850g)', 'Likya yaylalarından katkısız saf ham bal.', 240.00, 15, 'Gıda & Organik', 'active'),
    ('10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'El Yapımı Toprak Güveç & Kupa Seti', 'Geleneksel ocaklarda pişirilmiş doğal seramik yemek takımı.', 120.00, 8, 'El Sanatları', 'active'),
    ('10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', 'Doğal Pamuk Dokuma Likya Şalı', 'Bitkisel kök boya ile renklendirilmiş el dokuması pamuklu kumaş.', 150.00, 12, 'Tekstil', 'active')
ON CONFLICT (id) DO NOTHING;

-- 3. EVENTS (Topluluk Etkinlikleri)
INSERT INTO public.events (id, organizer_id, title, description, location, start_time, end_time, total_capacity, available_capacity, ticket_price, status)
VALUES
    ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', 'Likya Bahar Şenliği & Akustik Konser', 'Açık hava amfi tiyatroda genç sanatçıların akustik konseri.', 'Kampüs Ana Amfi Tiyatro', '2026-08-15 19:00:00+03', '2026-08-15 23:00:00+03', 500, 320, 0.00, 'published'),
    ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000003', 'Permakültür & Kompost Atölyesi', 'Gıda atıklarını gübreye dönüştürme ve balkon tarımı eğitimi.', 'Kampüs Ekoloji Serası', '2026-08-18 14:00:00+03', '2026-08-18 17:00:00+03', 30, 12, 30.00, 'published'),
    ('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'Otonom AI & Robotik Hackathonu', 'Döngüsel şehir sistemleri geliştiren 24 saatlik maraton.', 'Mühendislik Konferans Salonu', '2026-08-22 09:00:00+03', '2026-08-23 18:00:00+03', 100, 45, 0.00, 'published')
ON CONFLICT (id) DO NOTHING;

-- 4. TICKETS (Biletler)
INSERT INTO public.tickets (id, event_id, user_id, status, qr_code)
VALUES
    ('30000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000005', 'valid', 'LIKYA-TICKET-2026-EVENT-001-USER-777'),
    ('30000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000005', 'valid', 'LIKYA-TICKET-2026-EVENT-002-USER-777')
ON CONFLICT (id) DO NOTHING;

-- 5. REPAIR DONATIONS (Onarım & Bağış Talepleri)
INSERT INTO public.repair_donations (id, donor_id, item_name, description, category, repair_status, donation_amount, location)
VALUES
    ('40000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000005', 'Asus Laptop Batarya & Klavye Onarımı', 'Cihaz şarj tutmuyor ve 2 tuşu eksik. Onarılıp kütüphaneye bağışlanabilir.', 'Elektronik', 'in_repair', 0.00, 'Öğrenci Yurdu 3. Blok'),
    ('40000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000005', 'Ahşap Çalışma Masası', 'Yüzeyi zımparalanıp verniklenirse kulüp odalarında kullanılabilir.', 'Mobilya', 'repaired', 0.00, 'Merkez Kampüs Kulüpler Binası')
ON CONFLICT (id) DO NOTHING;
