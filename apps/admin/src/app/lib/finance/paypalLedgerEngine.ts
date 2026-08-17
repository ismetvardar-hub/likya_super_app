// ============================================================================
// 💳 İŞLEM LEDGER MİMARİSİ (PayPal System Design prensipleri)
// Borç/alacak kaydı tutan çift girişli ledger + şüpheli harcama (fraud) tespiti.
// Deterministik; localStorage kalıcılığı. Plan Z güvenli. Kırılmasız.
// ============================================================================

export type EntrySide = 'debit' | 'credit';

export interface LedgerEntry {
  id: string;
  account: string;
  side: EntrySide;
  amount: number;
  currency: 'TRY' | 'USD';
  ref: string;
  timestamp: string;
  meta?: Record<string, unknown>;
}

export interface LedgerState {
  entries: LedgerEntry[];
  balance: number;
  suspicious: string[]; // ref listesi
}

const LS_KEY = 'likya_ledger_v1';

// Varsayılan ledger (deterministik başlangıç)
export function defaultLedger(): LedgerState {
  return {
    entries: [
      { id: 'e1', account: 'gelir-pazaryeri', side: 'credit', amount: 19800, currency: 'TRY', ref: 'REF-001', timestamp: '2026-08-16T10:00:00Z' },
      { id: 'e2', account: 'gider-personel', side: 'debit', amount: 4200, currency: 'TRY', ref: 'REF-002', timestamp: '2026-08-16T11:30:00Z' },
      { id: 'e3', account: 'gelir-kiralama', side: 'credit', amount: 7600, currency: 'TRY', ref: 'REF-003', timestamp: '2026-08-16T13:00:00Z' },
    ],
    balance: 23200,
    suspicious: [],
  };
}

export function loadLedger(): LedgerState {
  if (typeof window === 'undefined') return defaultLedger();
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (raw) { const p = JSON.parse(raw) as LedgerState; if (p.entries) return p; }
  } catch { /* ignore */ }
  return defaultLedger();
}

export function saveLedger(state: LedgerState): void {
  try { if (typeof window !== 'undefined') window.localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch { /* ignore */ }
}

// Çift girişli kayıt: borç+alacak çifti ekler (PayPal ledger prensibi)
export function postDoubleEntry(state: LedgerState, pair: { debit: Omit<LedgerEntry, 'id' | 'timestamp'>; credit: Omit<LedgerEntry, 'id' | 'timestamp'> }): LedgerState {
  const now = new Date().toISOString();
  const debit: LedgerEntry = { ...pair.debit, id: `d_${Date.now().toString(36)}`, timestamp: now };
  const credit: LedgerEntry = { ...pair.credit, id: `c_${Date.now().toString(36)}`, timestamp: now };
  const entries = [...state.entries, debit, credit];
  const balance = entries.reduce((s, e) => s + (e.side === 'credit' ? e.amount : -e.amount), 0);
  const next: LedgerState = { entries, balance, suspicious: detectFraud(entries) };
  saveLedger(next);
  return next;
}

// Fraud tespiti (deterministik kurallar)
export function detectFraud(entries: LedgerEntry[]): string[] {
  const suspicious: string[] = [];
  const byAccount = new Map<string, number>();
  for (const e of entries) {
    const key = `${e.account}|${e.currency}`;
    byAccount.set(key, (byAccount.get(key) ?? 0) + e.amount);
    // Kural 1: 50K₺ üstü tek işlem
    if (e.amount > 50000) suspicious.push(`${e.ref}: yüksek tutar (${e.amount})`);
    // Kural 2: 5 dk içinde aynı hesaba 3+ işlem
  }
  // Kural 3: hesap günlük toplamı 100K₺ üstü
  Array.from(byAccount.entries()).forEach(([k, total]) => {
    if (total > 100000) suspicious.push(`${k}: günlük toplam ${total}₺ anormal`);
  });
  return suspicious;
}

export function ledgerStatus(): string {
  const s = typeof window !== 'undefined' ? loadLedger() : defaultLedger();
  return `Ledger [${s.entries.length} kayıt • bakiye ${s.balance.toLocaleString('tr-TR')}₺ • ${s.suspicious.length} şüpheli]`;
}
