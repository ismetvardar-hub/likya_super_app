// ============================================================================
// 🏋️ DRILL VAULT — antrenman drill kataloğu (Adım 39)
// AI reçete motorunun referans veritabanı: her drill bir hedeflenen metriğe
// bağlanır (GCT, RSI, asimetri, CDL, yükleme oranı, önayak itişi vb.).
// Deterministik; sıfır bağımlılık.
// ============================================================================

export type DrillCategory = 'plyometric' | 'agility' | 'unilateral' | 'recovery' | 'landing' | 'mobility' | 'force';

export interface Drill {
  id: string;
  name: string;
  category: DrillCategory;
  focus: string;          // hedeflenen metrik açıklaması
  setsReps: string;
  description: string;
  tags: string[];
}

export const DRILL_VAULT: Drill[] = [
  {
    id: 'drop-jumps',
    name: 'Depth Jumps (Plyometric)',
    category: 'plyometric',
    focus: 'GCT kısaltma + RSI artırma',
    setsReps: '4×5 · 3dk dinlenme',
    description: 'Bokstan inip kısa temas süresiyle patlayıcı yeniden sıçrama; temas <200ms hedefi.',
    tags: ['gct', 'rsi', 'plyometric'],
  },
  {
    id: 'fast-feet-ladder',
    name: 'Fast-feet Ladder',
    category: 'agility',
    focus: 'Ayak hızı + temas süresi',
    setsReps: '5×15sn · 60sn dinlenme',
    description: 'Merdiven üzerinde hızlı adım dizisi; zemin temasını kısaltır, ritmi geliştirir.',
    tags: ['gct', 'agility'],
  },
  {
    id: 'unilateral-balance',
    name: 'Unilateral Balance & Kuvvet',
    category: 'unilateral',
    focus: 'L/R asimetri azaltma',
    setsReps: '3×8 her bacak · 90sn',
    description: 'Tek bacak denge + split squat; dominant olmayan taraftaki yük dağılımını dengeler.',
    tags: ['asymmetry', 'unilateral'],
  },
  {
    id: 'active-recovery',
    name: 'Aktif Toparlanma Seansı',
    category: 'recovery',
    focus: 'CDL/fren yükü azaltma',
    setsReps: '20-30dk düşük yoğunluk',
    description: 'Hafif tempo + yürüyüş; birikmiş deselerasyon yükünden toparlanma sağlar.',
    tags: ['cdl', 'recovery'],
  },
  {
    id: 'low-impact-cycle',
    name: 'Düşük Etkili Bisiklet',
    category: 'recovery',
    focus: 'Eklem koruyucu kardiyo',
    setsReps: '15-20dk · orta tempo',
    description: 'Bisiklet/su koşusu — yüksek darbe freni sonrası eklemleri zorlamadan yük.',
    tags: ['cdl', 'recovery', 'low-impact'],
  },
  {
    id: 'soft-landings',
    name: 'Yumuşak İniş Serisi',
    category: 'landing',
    focus: 'Darbe yükleme oranı düşürme',
    setsReps: '3×6 · 90sn',
    description: 'Sessiz iniş + tempo koşusu; yükleme oranını (kN/s) düşürür, Aşil/kemik stresini azaltır.',
    tags: ['loading-rate', 'landing'],
  },
  {
    id: 'ankle-push',
    name: 'Önayak İtiş Drilleri',
    category: 'force',
    focus: 'Önayak itiş payı artırma',
    setsReps: '4×10 · 60sn',
    description: 'Ankraj + itiş tekrarı; önayak yüklenmesini artırır, patlayıcı kalkış geliştirir.',
    tags: ['forefoot', 'force'],
  },
  {
    id: 'hip-mobility',
    name: 'Kalça Mobilite Devresi',
    category: 'mobility',
    focus: 'Genel hareket kalitesi',
    setsReps: '2×10 · 60sn',
    description: 'Dinamik kalça açıcılar + derin squat tutuşu; bakım günleri için koruyucu devre.',
    tags: ['mobility', 'maintenance'],
  },
];

export function getDrill(id: string): Drill | undefined {
  return DRILL_VAULT.find((d) => d.id === id);
}

export function listDrills(category?: DrillCategory): Drill[] {
  return category ? DRILL_VAULT.filter((d) => d.category === category) : [...DRILL_VAULT];
}

export function drillVaultStatus(): string {
  return `Drill Vault: ${DRILL_VAULT.length} drill • plyometric/agility/unilateral/recovery/landing/force/mobility`;
}
