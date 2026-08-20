-- ============================================================================
-- OTOMATİK VERİ SAKLAMA & AYIKLAMA POLİTİKASI (Adım 56)
-- Ham 100Hz telemetri: 30 gün sıkıştırılmadan → sıkıştır/özetle → 90 gün hard prune
-- Özet seanslar & sakatlık uyarıları: kalıcı (ömür boyu arşiv)
-- pg_cron benzeri zamanlayıcı için çağrılabilir fonksiyon.
-- ============================================================================

CREATE OR REPLACE FUNCTION public.prune_expired_telemetry(p_older_than_days integer DEFAULT 90)
RETURNS bigint
LANGUAGE plpgsql
AS $$
DECLARE
  v_pruned bigint := 0;
BEGIN
  -- 90 günden eski ham telemetri çerçevelerini sil (hard prune)
  DELETE FROM public.telemetry_frames tf
  USING public.sessions s
  WHERE tf.session_id = s.id
    AND s.session_date < CURRENT_DATE - (p_older_than_days || ' days')::interval;
  GET DIAGNOSTICS v_pruned = ROW_COUNT;
  RETURN v_pruned;
END;
$$;

-- Zamanlayıcı (pg_cron varsa) — günlük 03:00 çalıştır:
-- SELECT cron.schedule('prune-telemetry-daily', '0 3 * * *', 'SELECT public.prune_expired_telemetry();');
