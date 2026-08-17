// ============================================================================
// 🧬 EXECUTIVE CONTEXT ENGINE (LifeOS Modeli) — Kişisel & Kurumsal Bağlam
// CEO günlük ritmi (routine/cadence), stratejik hedefler (trajectory), kampüs
// seyahatleri ve ilişkiler tek bir yerel bağlam nesnesinde (JSON/LocalStorage).
// Deterministik; localStorage kapalıysa bellek state'i yeterli. Plan Z güvenli.
// ============================================================================

export interface LifeHabit {
  id: string;
  name: string;
  emoji: string;
  streak: number;
  target: string;
}

export interface TravelEntry {
  id: string;
  destination: string;
  purpose: string;
  date: string;
  status: 'planlandi' | 'aktif' | 'tamamlandi';
}

export interface VipRelationship {
  id: string;
  name: string;
  role: string;
  touchpoint: string;
  strength: number; // 0-100
}

export interface ExecutiveContext {
  version: number;
  routine: {
    wakeUp: string;
    deepWorkBlock: string;
    focusBlocks: string[];
    cadence: string;
  };
  trajectory: {
    currentGoal: string;
    phase: string;
    milestones: string[];
    focusPercent: number;
  };
  travel: TravelEntry[];
  vipRelationships: VipRelationship[];
  habits: LifeHabit[];
  updatedAt: string;
}

const LS_KEY = 'likya_lifeos_context_v1';

// Varsayılan bağlam (deterministik başlangıç)
export function defaultContext(): ExecutiveContext {
  return {
    version: 1,
    routine: {
      wakeUp: '06:30',
      deepWorkBlock: '08:00 - 10:30',
      focusBlocks: ['10:30 - 12:00 (finans)', '14:00 - 15:30 (spor operasyon)', '16:00 - 17:00 (pazaryeri)'],
      cadence: 'haftalik-strateji + gunluk-scan',
    },
    trajectory: {
      currentGoal: 'Likya Kampüsü aylık MRR 250K₺ eşiğine ulaşsın',
      phase: 'olcekleme',
      milestones: ['Padel +%30 doluluk', 'Glamping gece sayısı 120+', 'Vault ürün lansmanı'],
      focusPercent: 68,
    },
    travel: [
      { id: 't1', destination: 'Antalya — Yatırımcı buluşması', purpose: 'sponsorluk', date: '2026-08-20', status: 'planlandi' },
      { id: 't2', destination: 'İstanbul — Franchise görüşmesi', purpose: 'buyume', date: '2026-09-03', status: 'planlandi' },
    ],
    vipRelationships: [
      { id: 'v1', name: 'Can Yılmaz (Spor Toto)', role: 'sponsor', touchpoint: 'aylik toplanti', strength: 88 },
      { id: 'v2', name: 'Aylin Kaya', role: 'vip uye', touchpoint: 'sezonluk', strength: 75 },
    ],
    habits: [
      { id: 'h1', name: 'Sabah yürüyüşü + kahve', emoji: '☕', streak: 21, target: 'gunluk' },
      { id: 'h2', name: 'Derin çalışma bloğu', emoji: '🧠', streak: 14, target: 'gunluk 2.5 saat' },
      { id: 'h3', name: 'Ajan panosu incelemesi', emoji: '📊', streak: 30, target: 'gunluk' },
    ],
    updatedAt: new Date().toISOString(),
  };
}

// Bağlamı localStorage'dan yükle (yoksa varsayılan)
export function loadContext(): ExecutiveContext {
  if (typeof window === 'undefined') return defaultContext();
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ExecutiveContext;
      if (parsed && parsed.version) return parsed;
    }
  } catch { /* bozuk veri → varsayılan */ }
  return defaultContext();
}

// Bağlamı kalıcı yaz (localStorage kapalıysa sessizce geç)
export function saveContext(ctx: ExecutiveContext): void {
  try {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(LS_KEY, JSON.stringify({ ...ctx, updatedAt: new Date().toISOString() }));
    }
  } catch { /* ignore */ }
}

// Hedef güncelle + kalıcılık
export function updateGoal(ctx: ExecutiveContext, goal: string, focusPercent?: number): ExecutiveContext {
  const next: ExecutiveContext = {
    ...ctx,
    trajectory: { ...ctx.trajectory, currentGoal: goal, focusPercent: focusPercent ?? ctx.trajectory.focusPercent },
  };
  saveContext(next);
  return next;
}

// Yeni seyahat ekle
export function addTravel(ctx: ExecutiveContext, entry: Omit<TravelEntry, 'id'>): ExecutiveContext {
  const next: ExecutiveContext = {
    ...ctx,
    travel: [...ctx.travel, { ...entry, id: `t${Date.now().toString(36)}` }],
  };
  saveContext(next);
  return next;
}

export function lifeosStatus(): string {
  const ctx = typeof window !== 'undefined' ? loadContext() : defaultContext();
  return `LifeOS [${ctx.habits.length} habit • ${ctx.travel.length} seyahat • hedef: ${ctx.trajectory.currentGoal.slice(0, 28)}…]`;
}
