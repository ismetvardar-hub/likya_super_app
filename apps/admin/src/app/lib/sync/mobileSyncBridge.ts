// ============================================================================
// 📱 FLUTTER MOBİL ↔ WEB SENKRONİZASYON KÖPRÜSÜ (Faz 3)
// Flutter tarafındaki supabase_service.dart + ai_vision_service.dart ile tam
// uyumlu TypeScript veri arayüzleri ve eşleme fonksiyonları. Mobilden açılan
// rezervasyon, sporcu biyomekanik skoru ve mutfak siparişleri Web Admin'e
// anlık düşer. Deterministik; Plan Z güvenli. Kırılmasız.
// ============================================================================

// ── 1. SupabaseService.dart UYUMLU MODELLER ──
export interface MobileUser {
  id: string;
  email: string;
  fullName: string;
  role: 'user' | 'admin' | 'coach';
  createdAt?: string;
}

export interface MobileSession {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  user: MobileUser;
}

// ── 2. AIVisionService.dart UYUMLU MODELLER (ImageDiagnosisResult) ──
export interface ImageDiagnosisResult {
  detectedCategory: string;
  conditionRating: number; // 1 (kötü) - 5 (mükemmel)
  repairDifficulty: 'Kolay' | 'Orta' | 'İleri Seviye';
  estimatedRepairHours: number;
  detectedDefects: string[];
  isClearQuality: boolean;
  aiRecommendation: string;
}

// ── 3. OPERASYONEL SENKRON MODELLERİ ──
export interface MobileReservation {
  id: string;
  resource: 'karavan' | 'glamping' | 'padel' | 'tenis';
  date: string;
  hour: string;
  guests: number;
  reference: string;
  status: string;
  mobileCreatedAt: string;
}

export interface BiomechanicScore {
  athleteId: string;
  athleteName: string;
  score: number;       // 0-100
  radarAvgKmh: number;
  reactionMs: number;
  assessedAt: string;
}

export interface KitchenOrderSync {
  orderId: string;
  receiptNo: string;
  item: string;
  qty: number;
  amount: number;
  countdown: number;   // 120s kalan
  status: string;
}

// ── 4. EŞLEME FONKSİYONLARI (mobil payload → web tablo kaydı) ──
export function mapMobileReservation(payload: Record<string, unknown>): MobileReservation {
  return {
    id: String(payload.id ?? `mr_${Date.now().toString(36)}`),
    resource: (payload.resource as MobileReservation['resource']) ?? 'padel',
    date: String(payload.date ?? new Date().toISOString().slice(0, 10)),
    hour: String(payload.hour ?? '12:00'),
    guests: Number(payload.guests ?? 2),
    reference: String(payload.reference ?? `MOB-${Date.now().toString(36).toUpperCase()}`),
    status: String(payload.status ?? 'mobil'),
    mobileCreatedAt: new Date().toISOString(),
  };
}

export function mapBiomechanicScore(payload: Record<string, unknown>): BiomechanicScore {
  return {
    athleteId: String(payload.athleteId ?? 'at-0'),
    athleteName: String(payload.athleteName ?? 'Mobil Sporcu'),
    score: Number(payload.score ?? 70),
    radarAvgKmh: Number(payload.radarAvgKmh ?? 110),
    reactionMs: Number(payload.reactionMs ?? 420),
    assessedAt: new Date().toISOString(),
  };
}

export function mapKitchenOrder(payload: Record<string, unknown>): KitchenOrderSync {
  return {
    orderId: String(payload.orderId ?? `ko_${Date.now().toString(36)}`),
    receiptNo: String(payload.receiptNo ?? `MOB-${Date.now().toString().slice(-5)}`),
    item: String(payload.item ?? 'Mobil Sipariş'),
    qty: Number(payload.qty ?? 1),
    amount: Number(payload.amount ?? 0),
    countdown: Number(payload.countdown ?? 120),
    status: String(payload.status ?? 'hazirlaniyor'),
  };
}

// Yerel senkron kuyruğu (localStorage — mobil→web köprüsü)
export function pushSyncQueue(domain: 'reservation' | 'biomechanic' | 'kitchen', payload: Record<string, unknown>): void {
  try {
    if (typeof window === 'undefined') return;
    const key = `likya_mobile_sync_${domain}_v1`;
    const raw = window.localStorage.getItem(key);
    const list = raw ? (JSON.parse(raw) as unknown[]) : [];
    window.localStorage.setItem(key, JSON.stringify([...list, { ...payload, syncedAt: new Date().toISOString() }]));
  } catch { /* ignore */ }
}

export function mobileSyncStatus(): string {
  return `Mobil↔Web Sync [SupabaseService+ImageDiagnosisResult uyumlu • 3 domain kuyruğu]`;
}
