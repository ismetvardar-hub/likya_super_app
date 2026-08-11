-- ============================================================================
-- LİKYA KAMPÜSÜ FAZ 1 ŞEMA GENİŞLETMESİ
-- GEMINI_GELISIM_PLANI.md'de belirlenen yeni tablolar ve RLS politikaları
-- ============================================================================

-- ============================================================================
-- 1. GELİR OPTİMİZASYONU
-- ============================================================================

-- Gelir Tahminleme
CREATE TABLE IF NOT EXISTS revenue_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period DATE NOT NULL,
  predicted_revenue DECIMAL(15,2),
  actual_revenue DECIMAL(15,2),
  confidence_score DECIMAL(5,2),
  factors JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Doluluk Yönetimi
CREATE TABLE IF NOT EXISTS occupancy_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parcel_id UUID REFERENCES parcels(id),
  date_range DATERANGE,
  dynamic_price DECIMAL(10,2),
  demand_score INTEGER,
  optimization_suggestions JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tedarikçi Yönetimi
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255),
  category VARCHAR(100),
  contract_terms JSONB,
  performance_metrics JSONB,
  reliability_score DECIMAL(3,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sadakat Programı
CREATE TABLE IF NOT EXISTS loyalty_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_name VARCHAR(50),
  min_points INTEGER,
  benefits JSONB,
  multiplier DECIMAL(3,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Dinamik Fiyatlandırma Logları
CREATE TABLE IF NOT EXISTS pricing_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type VARCHAR(50), -- 'parcel' | 'ticket' | 'shop'
  entity_id UUID,
  old_price DECIMAL(10,2),
  new_price DECIMAL(10,2),
  reason VARCHAR(200),
  ai_model VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 2. İLİŞKİ GENİŞLETME
-- ============================================================================

-- Mevcut tablolara yeni kolonlar
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS dynamic_price_id UUID REFERENCES pricing_logs(id);
ALTER TABLE financial_transactions ADD COLUMN IF NOT EXISTS forecast_id UUID REFERENCES revenue_forecasts(id);
ALTER TABLE shop_sales ADD COLUMN IF NOT EXISTS loyalty_points_earned INTEGER DEFAULT 0;

-- ============================================================================
-- 3. RLS POLİTİKALARI
-- ============================================================================

-- revenue_forecasts RLS
ALTER TABLE revenue_forecasts ENABLE ROW LEVEL SECURITY;
CREATE POLICY revenue_forecasts_admin ON revenue_forecasts
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' IN ('admin', 'patron'));

-- occupancy_plans RLS
ALTER TABLE occupancy_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY occupancy_plans_admin ON occupancy_plans
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' IN ('admin', 'patron', 'staff'));

-- suppliers RLS
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY suppliers_admin ON suppliers
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' IN ('admin', 'patron'));

-- loyalty_tiers RLS
ALTER TABLE loyalty_tiers ENABLE ROW LEVEL SECURITY;
CREATE POLICY loyalty_tiers_read ON loyalty_tiers
  FOR SELECT TO authenticated
  USING (true);

-- pricing_logs RLS
ALTER TABLE pricing_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY pricing_logs_admin ON pricing_logs
  FOR ALL TO authenticated
  USING (auth.jwt() ->> 'role' IN ('admin', 'patron'));

-- ============================================================================
-- 4. İNDEKS STRATEJİLERİ
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_transactions_date ON financial_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_parcel ON bookings(parcel_id, date_range);
CREATE INDEX IF NOT EXISTS idx_sensor_data_time ON sensor_readings(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_revenue_forecasts_period ON revenue_forecasts(period DESC);
CREATE INDEX IF NOT EXISTS idx_pricing_logs_entity ON pricing_logs(entity_type, entity_id);

-- ============================================================================
-- 5. VIEW'LAR
-- ============================================================================

-- Gelir Dashboard View
CREATE OR REPLACE VIEW revenue_dashboard AS
SELECT 
  date_trunc('day', created_at) as day,
  SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
  SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense,
  SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as net
FROM financial_transactions
GROUP BY 1;

-- Doluluk Raporu View
CREATE OR REPLACE VIEW occupancy_report AS
SELECT 
  parcel_id,
  COUNT(*) as total_bookings,
  SUM(CASE WHEN date_range @> CURRENT_DATE THEN 1 ELSE 0 END) as current_occupied,
  AVG(dynamic_price) as avg_dynamic_price
FROM occupancy_plans
GROUP BY parcel_id;

-- ============================================================================
-- 6. REALTIME OPTİMİZASYONU
-- ============================================================================

ALTER PUBLICATION supabase_realtime ADD TABLE occupancy_plans;
ALTER PUBLICATION supabase_realtime ADD TABLE revenue_forecasts;
