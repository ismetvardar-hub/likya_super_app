-- ============================================================================
-- TIBBİ & BİYOMETRİK VERİ DENETİM GÜNLÜĞÜ (Adım 57) — KVKK/GDPR uyumu
-- Ekle-yalnızca (append-only), değiştirilemez denetim izi:
-- PROFILE_VIEW • BIOMETRIC_UPDATE • INJURY_FLAG_OVERRIDE • PARENT_ACCESS
-- UPDATE/DELETE engellendi (RLS + trigger) → kurcalamaya karşı koruma.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id uuid REFERENCES public.users(id),
  actor_role text NOT NULL,
  target_athlete_id uuid REFERENCES public.athletes(id) ON DELETE SET NULL,
  action text NOT NULL CHECK (action IN ('PROFILE_VIEW', 'BIOMETRIC_UPDATE', 'INJURY_FLAG_OVERRIDE', 'PARENT_ACCESS')),
  ip_address text,
  metadata_json jsonb NOT NULL DEFAULT '{}',
  timestamp timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS audit_athlete_idx ON public.audit_logs (target_athlete_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS audit_action_idx ON public.audit_logs (action);

-- RLS: yalnızca INSERT (append-only); UPDATE/DELETE politikası tanımlanmaz → reddedilir
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "audit_append_only_insert" ON public.audit_logs;
CREATE POLICY "audit_append_only_insert" ON public.audit_logs
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "audit_read_ceo_manager" ON public.audit_logs;
CREATE POLICY "audit_read_ceo_manager" ON public.audit_logs
  FOR SELECT TO authenticated USING (public.is_ceo_or_manager());

-- Kurcalamayı engelleyen trigger: değişiklik/silme denemesi reddedilir
CREATE OR REPLACE FUNCTION public.deny_audit_mutation()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'Audit log immutable: güncelleme/silme yasak (KVKK/GDPR)';
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_no_update ON public.audit_logs;
CREATE TRIGGER trg_audit_no_update
  BEFORE UPDATE OR DELETE ON public.audit_logs
  FOR EACH ROW EXECUTE FUNCTION public.deny_audit_mutation();
