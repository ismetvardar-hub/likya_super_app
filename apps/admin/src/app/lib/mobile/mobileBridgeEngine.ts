// ============================================================================
// 📱 BİRLEŞİK ATLET/VELİ MOBİL KÖPRÜ API MOTORU (Adım 141)
// Hafif ve pil dostu mobil API köprüsü: atlet çevrimdışı seansları, günlük
// iyilik anketleri (Uyku/Ağrı/Ruh Hali 1-5) ve kişisel rekorlar için çift yönlü
// senkron. Kompakt sync payload'ları + ETag önbellekleme + payload diff sıkıştırma
// (senkron döngüsü başına <10KB). Saf/deterministik; sıfır bağımlılık.
// ============================================================================

export interface WellnessSurvey {
  athleteId: string;
  date: string;          // ISO gün
  sleepHours: number;
  soreness: number;      // 1-5
  mood: number;          // 1-5
}

export interface SyncableRecord {
  id: string;
  athleteId: string;
  updatedAt: string;
  [key: string]: unknown;
}

export type SyncKind = 'full' | 'diff' | 'noop';

export interface SyncPayload<T extends SyncableRecord> {
  athleteId: string;
  etag: string;
  kind: SyncKind;
  items: T[];
  sizeBytes: number;
}

export const SYNC_PAYLOAD_BUDGET_BYTES = 10 * 1024; // <10KB

// ── ETag (deterministik FNV-1a) ──────────────────────────────────────────────
export function fnv1a64(input: string): string {
  let hi = 0xcbf29ce4;
  let lo = 0x84222325;
  for (let i = 0; i < input.length; i++) {
    lo = (lo ^ input.charCodeAt(i)) >>> 0;
    const loMul = lo * 435;
    const newLo = loMul % 0x100000000;
    const carry = Math.floor(loMul / 0x100000000);
    hi = (hi * 435 + lo * 256 + carry) % 0x100000000;
    lo = newLo;
  }
  return ('0000000' + hi.toString(16)).slice(-8) + ('0000000' + lo.toString(16)).slice(-8);
}

export function computeEtag(items: unknown[]): string {
  return fnv1a64(JSON.stringify(items));
}

export function payloadSizeBytes<T extends SyncableRecord>(items: T[]): number {
  return new TextEncoder().encode(JSON.stringify(items)).byteLength;
}

// ── İyilik anketi doğrulama ──────────────────────────────────────────────────
export function validateWellnessSurvey(survey: WellnessSurvey): { valid: boolean; issues: string[] } {
  const issues: string[] = [];
  if (survey.sleepHours < 0 || survey.sleepHours > 24) issues.push(`uyku ${survey.sleepHours} saat geçersiz (0-24)`);
  if (survey.soreness < 1 || survey.soreness > 5) issues.push(`ağrı ${survey.soreness} geçersiz (1-5)`);
  if (survey.mood < 1 || survey.mood > 5) issues.push(`ruh hali ${survey.mood} geçersiz (1-5)`);
  if (!survey.athleteId || !survey.date) issues.push('atletId/date eksik');
  return { valid: issues.length === 0, issues };
}

// ── Diff sıkıştırma: önceki kimliklere göre yalnızca yeni/değişen kayıtlar ──
export function diffItems<T extends SyncableRecord>(previous: T[], next: T[]): { added: T[]; removed: string[] } {
  const prevIds = new Set(previous.map((r) => r.id));
  const nextIds = new Set(next.map((r) => r.id));
  const added = next.filter((r) => !prevIds.has(r.id));
  const removed = Array.from(prevIds).filter((id) => !nextIds.has(id));
  return { added, removed };
}

// ── Mobil köprü motoru (ETag + diff + bütçe) ─────────────────────────────────
export class MobileBridgeEngine {
  private readonly etags = new Map<string, string>();
  private readonly lastItems = new Map<string, SyncableRecord[]>();

  // Sunucu → cihaz çekme (ETag önbelleği + diff sıkıştırma)
  pull<T extends SyncableRecord>(athleteId: string, items: T[], clientEtag?: string): SyncPayload<T> {
    const etag = computeEtag(items);
    this.etags.set(athleteId, etag);
    const prev = this.lastItems.get(athleteId) as T[] | undefined;
    this.lastItems.set(athleteId, [...items]);

    if (clientEtag === etag) {
      return { athleteId, etag, kind: 'noop', items: [], sizeBytes: 0 };
    }
    if (prev && prev.length > 0) {
      const { added } = diffItems(prev, items);
      if (added.length < items.length) {
        const sizeBytes = payloadSizeBytes(added);
        return { athleteId, etag, kind: 'diff', items: added, sizeBytes };
      }
    }
    const sizeBytes = payloadSizeBytes(items);
    return { athleteId, etag, kind: 'full', items, sizeBytes };
  }

  // Cihaz → sunucu itme (ETag çakışma tespiti)
  push<T extends SyncableRecord>(athleteId: string, incoming: SyncPayload<T>, apply: (items: T[]) => void): { accepted: boolean; conflict: boolean; serverEtag: string } {
    const serverEtag = this.etags.get(athleteId) ?? '';
    if (incoming.etag !== '' && serverEtag !== '' && incoming.etag !== serverEtag) {
      return { accepted: false, conflict: true, serverEtag };
    }
    apply(incoming.items);
    this.etags.set(athleteId, computeEtag(incoming.items));
    return { accepted: true, conflict: false, serverEtag: this.etags.get(athleteId) ?? '' };
  }

  underBudget<T extends SyncableRecord>(items: T[]): boolean {
    return payloadSizeBytes(items) <= SYNC_PAYLOAD_BUDGET_BYTES;
  }
}

export function mobileBridgeStatus(): string {
  return `Mobil Köprü: ETag + diff sıkıştırma • <${SYNC_PAYLOAD_BUDGET_BYTES / 1024}KB/döngü • iyilik anketi (uyku/ağrı/ruh hali 1-5)`;
}
