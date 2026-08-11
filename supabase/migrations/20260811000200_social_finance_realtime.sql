-- ============================================================================
-- LİKYA SOSYAL FİNANS & ETKİNLİK PAYLAŞIM - REALTIME ŞEMA
-- Split-Pay, P2P Jest, Hediye Token için Supabase Realtime tabloları
-- ============================================================================

-- ============================================================================
-- 1. ETKİNLİK KATILIMCILARI (event_participants)
-- ============================================================================
CREATE TABLE IF NOT EXISTS event_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL,
  user_id UUID NOT NULL,
  share_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  blocked_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  status VARCHAR(20) DEFAULT 'confirmed', -- 'confirmed' | 'pending' | 'cancelled'
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Katılımcılar kendi kayıtlarını görebilir
ALTER TABLE event_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY event_participants_read ON event_participants
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM events e WHERE e.id = event_participants.event_id AND e.organizer_id = auth.uid()
  ));

-- ============================================================================
-- 2. JEST OLAYLARI (gesture_events)
-- ============================================================================
CREATE TABLE IF NOT EXISTS gesture_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id UUID NOT NULL,
  giver_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  amount DECIMAL(15,2) NOT NULL,
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Jest olayları topluluk üyelerine açık
ALTER TABLE gesture_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY gesture_events_read ON gesture_events
  FOR SELECT TO authenticated
  USING (true);

-- ============================================================================
-- 3. TOKEN TRANSFERLERİ (token_transfers)
-- ============================================================================
CREATE TABLE IF NOT EXISTS token_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID NOT NULL,
  receiver_id UUID NOT NULL,
  amount INTEGER NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Token transferleri topluluk üyelerine açık
ALTER TABLE token_transfers ENABLE ROW LEVEL SECURITY;
CREATE POLICY token_transfers_read ON token_transfers
  FOR SELECT TO authenticated
  USING (true);

-- ============================================================================
-- 4. REALTIME KANALLARI
-- ============================================================================

-- split_pay_updates: Katılımcı değişimleri canlı yayınlanır
ALTER PUBLICATION supabase_realtime ADD TABLE event_participants;

-- gesture_events: Jest duyuruları canlı yayınlanır
ALTER PUBLICATION supabase_realtime ADD TABLE gesture_events;

-- token_transfers: Token transferleri canlı yayınlanır
ALTER PUBLICATION supabase_realtime ADD TABLE token_transfers;

-- ============================================================================
-- 5. İNDEKSLER
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_event_participants_event ON event_participants(event_id);
CREATE INDEX IF NOT EXISTS idx_event_participants_user ON event_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_gesture_events_event ON gesture_events(event_id);
CREATE INDEX IF NOT EXISTS idx_token_transfers_sender ON token_transfers(sender_id);
CREATE INDEX IF NOT EXISTS idx_token_transfers_receiver ON token_transfers(receiver_id);
