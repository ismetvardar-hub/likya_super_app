-- ============================================================================
-- LİKYA ESPİRİLİ İKRAM / HEDİYE MEKANİZMASI
-- Fiziksel mağaza / alt kiracı entegrasyonu
-- ============================================================================

-- ============================================================================
-- 1. HEDİYE KATALOĞU (gift_catalog)
-- ============================================================================
CREATE TABLE IF NOT EXISTS gift_catalog (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  token_cashback_rate DECIMAL(5,2) NOT NULL DEFAULT 10.00, -- %10
  icon VARCHAR(10) NOT NULL,
  description TEXT,
  tenant_store_id UUID, -- Alt kiracı (kafeterya/restoran)
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Hediye kataloğu herkese açık
ALTER TABLE gift_catalog ENABLE ROW LEVEL SECURITY;
CREATE POLICY gift_catalog_read ON gift_catalog
  FOR SELECT TO authenticated
  USING (true);

-- ============================================================================
-- 2. HEDİYE TALEPLERİ (gift_claims)
-- ============================================================================
CREATE TABLE IF NOT EXISTS gift_claims (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  gift_id UUID REFERENCES gift_catalog(id),
  qr_code VARCHAR(50) NOT NULL UNIQUE,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending' | 'redeemed' | 'expired'
  tenant_store_id UUID,
  redeemed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Gönderen ve alıcı kendi hediyelerini görebilir
ALTER TABLE gift_claims ENABLE ROW LEVEL SECURITY;
CREATE POLICY gift_claims_read ON gift_claims
  FOR SELECT TO authenticated
  USING (sender_id = auth.uid() OR receiver_id = auth.uid());

-- ============================================================================
-- 3. REALTIME
-- ============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE gift_claims;

-- ============================================================================
-- 4. İNDEKSLER
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_gift_claims_sender ON gift_claims(sender_id);
CREATE INDEX IF NOT EXISTS idx_gift_claims_receiver ON gift_claims(receiver_id);
CREATE INDEX IF NOT EXISTS idx_gift_claims_qr ON gift_claims(qr_code);
CREATE INDEX IF NOT EXISTS idx_gift_catalog_active ON gift_catalog(is_active);

-- ============================================================================
-- 5. ÖRNEK HEDİYE KATALOĞU VERİLERİ
-- ============================================================================
INSERT INTO gift_catalog (name, price, token_cashback_rate, icon, description) VALUES
  ('Maç Sonu Soğuk Su', 20.00, 10.00, '🧊', 'Maç sonrası serinletici soğuk su'),
  ('Teselli Kahvesi', 80.00, 10.00, '☕', 'Kaybeden takıma sıcak teselli kahvesi'),
  ('Şampiyonluk Yemeği', 250.00, 10.00, '🍕', 'Turnuva şampiyonuna kral yemeği'),
  ('Centilmenlik Çayı', 40.00, 10.00, '🍵', 'Centilmenlik ruhuna uygun sıcak çay'),
  ('Kupa Günü Limonata', 30.00, 10.00, '🍋', 'Kupa günü ferahlatıcı limonata')
ON CONFLICT DO NOTHING;
