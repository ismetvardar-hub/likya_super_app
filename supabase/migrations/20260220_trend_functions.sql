-- ============================================================================
-- TARİHSEL TREND AGGREGASYON SQL FONKSİYONLARI (Adım 55)
-- get_athlete_weekly_rollup  → sporcu haftalık toplama (TRIMP, RSI, GCT, ACWR, tepe kuvvet)
-- get_squad_performance_summary → takım hazır olma dağılımı + yüksek risk sayısı
-- ============================================================================

-- ── Sporcu haftalık toplama ───────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_athlete_weekly_rollup(
  p_athlete uuid,
  p_start date,
  p_end date
)
RETURNS TABLE (
  week_start date,
  total_trimp numeric,
  avg_rsi numeric,
  avg_gct_ms numeric,
  avg_acwr numeric,
  peak_strike_force numeric,
  session_count bigint
)
LANGUAGE sql STABLE
AS $$
  SELECT
    date_trunc('week', s.session_date)::date AS week_start,
    ROUND(SUM(s.trimp), 1) AS total_trimp,
    ROUND(AVG(s.avg_rsi), 2) AS avg_rsi,
    ROUND(AVG(s.avg_gct_ms), 1) AS avg_gct_ms,
    ROUND(AVG(s.acwr), 2) AS avg_acwr,
    ROUND(MAX(t.peak_force), 1) AS peak_strike_force,
    COUNT(s.id) AS session_count
  FROM public.sessions s
  LEFT JOIN LATERAL (
    SELECT MAX(tf.toe_pressure + tf.heel_pressure) AS peak_force
    FROM public.telemetry_frames tf
    WHERE tf.session_id = s.id
  ) t ON true
  WHERE s.athlete_id = p_athlete
    AND s.session_date BETWEEN p_start AND p_end
  GROUP BY date_trunc('week', s.session_date)
  ORDER BY week_start
$$;

-- ── Takım performans özeti ─────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.get_squad_performance_summary(
  p_squad uuid,
  p_days_window integer DEFAULT 14
)
RETURNS TABLE (
  athlete_count bigint,
  ready_pct numeric,
  medium_risk_count bigint,
  high_risk_count bigint,
  avg_trimp numeric,
  avg_acwr numeric
)
LANGUAGE sql STABLE
AS $$
  SELECT
    COUNT(DISTINCT a.id) AS athlete_count,
    ROUND(
      100.0 * COUNT(DISTINCT a.id) FILTER (WHERE a.risk_level = 'low') / NULLIF(COUNT(DISTINCT a.id), 0),
      1
    ) AS ready_pct,
    COUNT(DISTINCT a.id) FILTER (WHERE a.risk_level = 'medium') AS medium_risk_count,
    COUNT(DISTINCT a.id) FILTER (WHERE a.risk_level = 'high') AS high_risk_count,
    ROUND(AVG(s.trimp), 1) AS avg_trimp,
    ROUND(AVG(s.acwr), 2) AS avg_acwr
  FROM public.athletes a
  LEFT JOIN public.sessions s
    ON s.athlete_id = a.id
    AND s.session_date >= CURRENT_DATE - (p_days_window || ' days')::interval
  LEFT JOIN LATERAL (
    SELECT ia.athlete_id, MAX(ia.severity) AS risk_level
    FROM public.injury_alerts ia
    WHERE ia.athlete_id = a.id
    GROUP BY ia.athlete_id
  ) r ON r.athlete_id = a.id
  WHERE a.squad_id = p_squad
$$;
