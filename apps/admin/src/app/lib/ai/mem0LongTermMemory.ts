// ============================================================================
// 🧠 UZUN SÜRELİ HAFIZA MOTORU (Mem0 mimarisi)
// Üye tercihleri, antrenman geçmişi ve Daze Chef ikram alışkanlıkları uzun
// süreli saklanır. Deterministik; localStorage kalıcılığı. Plan Z güvenli.
// ============================================================================

export type MemoryKind = 'preference' | 'training' | 'diet' | 'contact';

export interface MemoryRecord {
  id: string;
  memberId: string;
  kind: MemoryKind;
  content: string;
  importance: number; // 0-100
  timestamp: string;
}

export interface MemoryState {
  records: MemoryRecord[];
}

const LS_KEY = 'likya_mem0_memory_v1';

// Deterministik örnek bellek
export function defaultMemory(): MemoryState {
  const now = new Date().toISOString();
  return {
    records: [
      { id: 'mem-1', memberId: 'm-1', kind: 'preference', content: 'Aylin padel kort 1 ve sabah 08:00 slotunu tercih eder', importance: 85, timestamp: now },
      { id: 'mem-2', memberId: 'm-1', kind: 'training', content: 'Aylin haftada 4 antrenman, forehand ağırlıklı (radar ort. 118 km/h)', importance: 78, timestamp: now },
      { id: 'mem-3', memberId: 'm-2', kind: 'diet', content: 'Mehmet glamping kahvaltıda laktozsuz süt ister', importance: 90, timestamp: now },
      { id: 'mem-4', memberId: 'm-3', kind: 'contact', content: 'Zeynep 18:00 sonrası antrenmana uygun', importance: 60, timestamp: now },
    ],
  };
}

export function loadMemory(): MemoryState {
  if (typeof window === 'undefined') return defaultMemory();
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (raw) { const p = JSON.parse(raw) as MemoryState; if (p.records) return p; }
  } catch { /* ignore */ }
  return defaultMemory();
}

export function saveMemory(state: MemoryState): void {
  try { if (typeof window !== 'undefined') window.localStorage.setItem(LS_KEY, JSON.stringify(state)); } catch { /* ignore */ }
}

// Yeni bellek kaydı ekle (önem skoruna göre öncelik)
export function addMemory(state: MemoryState, entry: Omit<MemoryRecord, 'id' | 'timestamp'>): MemoryState {
  const next: MemoryState = {
    records: [
      ...state.records,
      { ...entry, id: `mem_${Date.now().toString(36)}`, timestamp: new Date().toISOString() },
    ],
  };
  saveMemory(next);
  return next;
}

// Üyeye özel bağlam özeti (AI prompt'una eklenmek için)
export function memoryContextForMember(state: MemoryState, memberId: string): string {
  const recs = state.records.filter((r) => r.memberId === memberId).sort((a, b) => b.importance - a.importance);
  if (!recs.length) return 'Uzun süreli hafızada kayıt yok.';
  return recs.map((r) => `[${r.kind} • önem ${r.importance}] ${r.content}`).join('\n');
}

export function mem0Status(): string {
  const s = typeof window !== 'undefined' ? loadMemory() : defaultMemory();
  return `Mem0 Hafıza [${s.records.length} kayıt • tercih+antrenman+ikram • localStorage]`;
}
