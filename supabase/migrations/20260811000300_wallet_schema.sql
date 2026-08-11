-- ============================================================================
-- LİKYA CÜZDAN & ÖDEME ALTYAPISI
-- Token cüzdanı, bloke tutar yönetimi
-- ============================================================================

-- ============================================================================
-- 1. CÜZDAN TABLOSU (wallets)
-- ============================================================================
CREATE TABLE IF NOT EXISTS wallets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  token_balance INTEGER NOT NULL DEFAULT 0,
  fiat_balance DECIMAL(15,2) NOT NULL DEFAULT 0,
  blocked_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS: Kullanıcılar sadece kendi cüzdanlarını görebilir
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
CREATE POLICY wallets_read ON wallets
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY wallets_update ON wallets
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid());

-- ============================================================================
-- 2. TOKEN ARTIRMA/AZALTMA FONKSİYONLARI
-- ============================================================================
CREATE OR REPLACE FUNCTION increment_token_balance(user_id UUID, amount INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE wallets SET token_balance = token_balance + amount, updated_at = NOW()
  WHERE wallets.user_id = increment_token_balance.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrement_token_balance(user_id UUID, amount INTEGER)
RETURNS void AS $$
BEGIN
  UPDATE wallets SET token_balance = token_balance - amount, updated_at = NOW()
  WHERE wallets.user_id = decrement_token_balance.user_id
  AND token_balance >= amount;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 3. BLOKE TUTAR YÖNETİMİ
-- ============================================================================
CREATE OR REPLACE FUNCTION block_amount(user_id UUID, amount DECIMAL)
RETURNS void AS $$
BEGIN
  UPDATE wallets SET blocked_amount = blocked_amount + amount, updated_at = NOW()
  WHERE wallets.user_id = block_amount.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION release_blocked_amount(user_id UUID, amount DECIMAL)
RETURNS void AS $$
BEGIN
  UPDATE wallets SET blocked_amount = GREATEST(0, blocked_amount - amount), updated_at = NOW()
  WHERE wallets.user_id = release_blocked_amount.user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 4. REALTIME
-- ============================================================================
ALTER PUBLICATION supabase_realtime ADD TABLE wallets;

-- ============================================================================
-- 5. İNDEKS
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_wallets_user ON wallets(user_id);
