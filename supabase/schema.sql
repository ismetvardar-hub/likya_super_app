-- ============================================================================
-- SPORTVISIONX SPOR BİLİMİ İLİŞKİSEL ŞEMASI (Adım 46)
-- athletes • sessions • telemetry_frames • growth_records • injury_alerts
-- + destek tabloları: squads, parent_links
-- FK bütünlüğü + performans indeksleri dahildir.
-- ============================================================================

-- ── Takımlar (squads) ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS squads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  coach_id uuid REFERENCES public.users(id),
  level text NOT NULL DEFAULT 'junior' CHECK (level IN ('junior', 'pro')),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- ── Sporcular ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS athletes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id),
  full_name text NOT NULL,
  birth_date date,
  gender text CHECK (gender IN ('M', 'F')),
  squad_id uuid REFERENCES squads(id),
  height_cm numeric(5, 1),
  weight_kg numeric(5, 1),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS athletes_squad_idx ON athletes (squad_id);

-- ── Seanslar ──────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  coach_id uuid REFERENCES public.users(id),
  session_date date NOT NULL,
  duration_sec integer,
  trimp numeric(6, 1),
  acwr numeric(4, 2),
  avg_hr numeric(5, 1),
  avg_gct_ms numeric(6, 1),
  avg_rsi numeric(4, 2),
  injury_risk_level text CHECK (injury_risk_level IN ('low', 'medium', 'high'))
);
CREATE INDEX IF NOT EXISTS sessions_athlete_date_idx ON sessions (athlete_id, session_date DESC);

-- ── Telemetri çerçeveleri (zaman serisi) ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS telemetry_frames (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  session_id uuid NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  timestamp_ms bigint NOT NULL,
  hr integer,
  gct_ms numeric(6, 1),
  rsi numeric(4, 2),
  toe_pressure integer,
  heel_pressure integer,
  arm_velocity numeric(5, 1),
  loading_rate numeric(5, 2)
);
CREATE INDEX IF NOT EXISTS telemetry_session_idx ON telemetry_frames (session_id, timestamp_ms);

-- ── Büyüme kayıtları ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS growth_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  athlete_id uuid NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  recorded_date date NOT NULL,
  height_cm numeric(5, 1),
  weight_kg numeric(5, 1),
  shoe_size numeric(4, 1),
  notes text
);
CREATE INDEX IF NOT EXISTS growth_athlete_idx ON growth_records (athlete_id, recorded_date DESC);

-- ── Veli-çocuk bağlantısı (RLS parent erişimi için) ──────────────────────────
CREATE TABLE IF NOT EXISTS parent_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_user_id uuid NOT NULL REFERENCES public.users(id),
  athlete_id uuid NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (parent_user_id, athlete_id)
);
CREATE INDEX IF NOT EXISTS parent_athlete_idx ON parent_links (athlete_id);

-- ── Sakatlık uyarıları ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS injury_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES sessions(id) ON DELETE SET NULL,
  athlete_id uuid NOT NULL REFERENCES athletes(id) ON DELETE CASCADE,
  alert_type text NOT NULL,
  severity text CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  trigger_metric text,
  is_acknowledged boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS injury_athlete_idx ON injury_alerts (athlete_id, created_at DESC);
