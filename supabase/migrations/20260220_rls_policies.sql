-- ============================================================================
-- ÇOK ROLLÜ ROW LEVEL SECURITY POLİTİKALARI (Adım 47)
-- Spor bilimi şeması (schema.sql) için katı rol bazlı erişim:
--   • ceo / manager  → tüm akademi verisinde SELECT, INSERT, UPDATE, DELETE
--   • coach          → kendi takımındaki sporcularda SELECT, INSERT, UPDATE
--   • parent         → bağlı çocukları için yalnızca SELECT
--   • athlete        → yalnızca kendi telemetri ve seanslarında SELECT
-- ============================================================================

-- ── Yardımcı fonksiyonlar ─────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.auth_user_role()
RETURNS text
LANGUAGE sql STABLE
AS $$
  SELECT role FROM public.users WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION public.is_ceo_or_manager()
RETURNS boolean
LANGUAGE sql STABLE
AS $$
  SELECT COALESCE(public.auth_user_role() IN ('ceo', 'manager'), false)
$$;

CREATE OR REPLACE FUNCTION public.is_coach_of_squad(p_squad_id uuid)
RETURNS boolean
LANGUAGE sql STABLE
AS $$
  SELECT EXISTS (SELECT 1 FROM public.squads s WHERE s.id = p_squad_id AND s.coach_id = auth.uid())
$$;

CREATE OR REPLACE FUNCTION public.is_parent_of(p_athlete_id uuid)
RETURNS boolean
LANGUAGE sql STABLE
AS $$
  SELECT EXISTS (SELECT 1 FROM public.parent_links pl WHERE pl.athlete_id = p_athlete_id AND pl.parent_user_id = auth.uid())
$$;

-- ════════════════════════════════════════════════════════════════════════════
-- ATHLETES
-- ════════════════════════════════════════════════════════════════════════════
ALTER TABLE public.athletes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ceo_manager_full_athletes" ON public.athletes;
CREATE POLICY "ceo_manager_full_athletes" ON public.athletes
  FOR ALL TO authenticated USING (public.is_ceo_or_manager()) WITH CHECK (public.is_ceo_or_manager());

DROP POLICY IF EXISTS "coach_squad_athletes" ON public.athletes;
CREATE POLICY "coach_squad_athletes" ON public.athletes
  FOR ALL TO authenticated
  USING (public.is_coach_of_squad(squad_id)) WITH CHECK (public.is_coach_of_squad(squad_id));

DROP POLICY IF EXISTS "athlete_self_read" ON public.athletes;
CREATE POLICY "athlete_self_read" ON public.athletes
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "parent_children_read" ON public.athletes;
CREATE POLICY "parent_children_read" ON public.athletes
  FOR SELECT TO authenticated USING (public.is_parent_of(id));

-- ════════════════════════════════════════════════════════════════════════════
-- SESSIONS
-- ════════════════════════════════════════════════════════════════════════════
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ceo_manager_full_sessions" ON public.sessions;
CREATE POLICY "ceo_manager_full_sessions" ON public.sessions
  FOR ALL TO authenticated USING (public.is_ceo_or_manager()) WITH CHECK (public.is_ceo_or_manager());

DROP POLICY IF EXISTS "coach_squad_sessions" ON public.sessions;
CREATE POLICY "coach_squad_sessions" ON public.sessions
  FOR ALL TO authenticated
  USING (public.is_coach_of_squad((SELECT squad_id FROM public.athletes a WHERE a.id = athlete_id)))
  WITH CHECK (public.is_coach_of_squad((SELECT squad_id FROM public.athletes a WHERE a.id = athlete_id)));

DROP POLICY IF EXISTS "athlete_own_sessions_read" ON public.sessions;
CREATE POLICY "athlete_own_sessions_read" ON public.sessions
  FOR SELECT TO authenticated
  USING ((SELECT user_id FROM public.athletes a WHERE a.id = athlete_id) = auth.uid());

DROP POLICY IF EXISTS "parent_children_sessions_read" ON public.sessions;
CREATE POLICY "parent_children_sessions_read" ON public.sessions
  FOR SELECT TO authenticated USING (public.is_parent_of(athlete_id));

-- ════════════════════════════════════════════════════════════════════════════
-- TELEMETRY_FRAMES (seans üzerinden sahiplik)
-- ════════════════════════════════════════════════════════════════════════════
ALTER TABLE public.telemetry_frames ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ceo_manager_full_telemetry" ON public.telemetry_frames;
CREATE POLICY "ceo_manager_full_telemetry" ON public.telemetry_frames
  FOR ALL TO authenticated USING (public.is_ceo_or_manager()) WITH CHECK (public.is_ceo_or_manager());

DROP POLICY IF EXISTS "coach_squad_telemetry" ON public.telemetry_frames;
CREATE POLICY "coach_squad_telemetry" ON public.telemetry_frames
  FOR SELECT TO authenticated
  USING (public.is_coach_of_squad((SELECT a.squad_id FROM public.sessions s JOIN public.athletes a ON a.id = s.athlete_id WHERE s.id = session_id)));

DROP POLICY IF EXISTS "athlete_own_telemetry_read" ON public.telemetry_frames;
CREATE POLICY "athlete_own_telemetry_read" ON public.telemetry_frames
  FOR SELECT TO authenticated
  USING ((SELECT a.user_id FROM public.sessions s JOIN public.athletes a ON a.id = s.athlete_id WHERE s.id = session_id) = auth.uid());

-- ════════════════════════════════════════════════════════════════════════════
-- GROWTH_RECORDS
-- ════════════════════════════════════════════════════════════════════════════
ALTER TABLE public.growth_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ceo_manager_full_growth" ON public.growth_records;
CREATE POLICY "ceo_manager_full_growth" ON public.growth_records
  FOR ALL TO authenticated USING (public.is_ceo_or_manager()) WITH CHECK (public.is_ceo_or_manager());

DROP POLICY IF EXISTS "coach_squad_growth" ON public.growth_records;
CREATE POLICY "coach_squad_growth" ON public.growth_records
  FOR ALL TO authenticated
  USING (public.is_coach_of_squad((SELECT squad_id FROM public.athletes a WHERE a.id = athlete_id)))
  WITH CHECK (public.is_coach_of_squad((SELECT squad_id FROM public.athletes a WHERE a.id = athlete_id)));

DROP POLICY IF EXISTS "parent_children_growth_read" ON public.growth_records;
CREATE POLICY "parent_children_growth_read" ON public.growth_records
  FOR SELECT TO authenticated USING (public.is_parent_of(athlete_id));

-- ════════════════════════════════════════════════════════════════════════════
-- INJURY_ALERTS
-- ════════════════════════════════════════════════════════════════════════════
ALTER TABLE public.injury_alerts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ceo_manager_full_injuries" ON public.injury_alerts;
CREATE POLICY "ceo_manager_full_injuries" ON public.injury_alerts
  FOR ALL TO authenticated USING (public.is_ceo_or_manager()) WITH CHECK (public.is_ceo_or_manager());

DROP POLICY IF EXISTS "coach_squad_injuries" ON public.injury_alerts;
CREATE POLICY "coach_squad_injuries" ON public.injury_alerts
  FOR ALL TO authenticated
  USING (public.is_coach_of_squad((SELECT squad_id FROM public.athletes a WHERE a.id = athlete_id)))
  WITH CHECK (public.is_coach_of_squad((SELECT squad_id FROM public.athletes a WHERE a.id = athlete_id)));

DROP POLICY IF EXISTS "athlete_own_injuries_read" ON public.injury_alerts;
CREATE POLICY "athlete_own_injuries_read" ON public.injury_alerts
  FOR SELECT TO authenticated
  USING ((SELECT user_id FROM public.athletes a WHERE a.id = athlete_id) = auth.uid());

DROP POLICY IF EXISTS "parent_children_injuries_read" ON public.injury_alerts;
CREATE POLICY "parent_children_injuries_read" ON public.injury_alerts
  FOR SELECT TO authenticated USING (public.is_parent_of(athlete_id));

-- ════════════════════════════════════════════════════════════════════════════
-- SQUADS
-- ════════════════════════════════════════════════════════════════════════════
ALTER TABLE public.squads ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ceo_manager_full_squads" ON public.squads;
CREATE POLICY "ceo_manager_full_squads" ON public.squads
  FOR ALL TO authenticated USING (public.is_ceo_or_manager()) WITH CHECK (public.is_ceo_or_manager());

DROP POLICY IF EXISTS "coach_own_squad" ON public.squads;
CREATE POLICY "coach_own_squad" ON public.squads
  FOR ALL TO authenticated USING (coach_id = auth.uid()) WITH CHECK (coach_id = auth.uid());

DROP POLICY IF EXISTS "squads_read_all_authenticated" ON public.squads;
CREATE POLICY "squads_read_all_authenticated" ON public.squads
  FOR SELECT TO authenticated USING (true);

