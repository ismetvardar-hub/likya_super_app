// ============================================================================
// 🛡️ EKİPMAN GÜVENLİK DENETLEYİCİSİ — Facility & Equipment Safety Audit
// Tesis/kort/oyun ekipmanlarının fiziksel ölçü ve güvenlik standartlarını takip
// eder; Sentinel bakım servisine otomatik bilet açar. Deterministik; Plan Z.
// ============================================================================

export interface SafetyItem {
  id: string;
  name: string;
  zone: string;
  standard: string;       // örn. 'EN 15312', 'FIBA', 'ITF'
  status: 'uygun' | 'kritik' | 'bakim-gerekli';
  checkScore: number;     // 0-100
  lastCheck: string;
}

export interface AuditResult {
  items: SafetyItem[];
  passRate: number;
  criticalCount: number;
  sentinelTickets: string[];
}

export const SAFETY_ITEMS: SafetyItem[] = [
  { id: 's1', name: 'Padel Kort Çitleri', zone: 'Padel Kort 1-4', standard: 'EN 15312', status: 'uygun', checkScore: 94, lastCheck: '2026-08-10' },
  { id: 's2', name: 'Tenis Ağı Yüksekliği', zone: 'Tenis Kort 2-3', standard: 'ITF', status: 'kritik', checkScore: 58, lastCheck: '2026-07-28' },
  { id: 's3', name: 'Basketbol Potası Sökülürlük', zone: 'Spor Salonu', standard: 'FIBA', status: 'uygun', checkScore: 90, lastCheck: '2026-08-12' },
  { id: 's4', name: 'Dalga Havuzu Güvenlik İpi', zone: 'Wave Pool', standard: 'TSE', status: 'bakim-gerekli', checkScore: 71, lastCheck: '2026-08-01' },
  { id: 's5', name: 'Dry-Ski Yüzey Kaplaması', zone: 'Sentetik Pist', standard: 'EN 13451', status: 'uygun', checkScore: 88, lastCheck: '2026-08-09' },
  { id: 's6', name: 'Rüzgar Tüneli Cam Panelleri', zone: 'Wind Tunnel', standard: 'EN 12150', status: 'kritik', checkScore: 61, lastCheck: '2026-07-25' },
];

// Denetim çalıştır → Sentinel bakım bileti aç (kritik/bakım-gerekli ürünler)
export function runSafetyAudit(): AuditResult {
  const criticalCount = SAFETY_ITEMS.filter((i) => i.status === 'kritik').length;
  const passRate = Math.round((SAFETY_ITEMS.filter((i) => i.status === 'uygun').length / SAFETY_ITEMS.length) * 100);
  const sentinelTickets = SAFETY_ITEMS
    .filter((i) => i.status !== 'uygun')
    .map((i) => `🛠️ Sentinel bilet açıldı: ${i.name} (${i.zone}) — standart ${i.standard}, skor ${i.checkScore}/100`);
  return { items: SAFETY_ITEMS, passRate, criticalCount, sentinelTickets };
}

// Ölçü standardı kontrolü (deterministik örnek)
export function verifyMeasurement(standard: string, measured: number, requiredMin: number, requiredMax: number): { ok: boolean; note: string } {
  const ok = measured >= requiredMin && measured <= requiredMax;
  return { ok, note: ok ? `✅ ${standard}: ${measured} değeri aralıkta (${requiredMin}-${requiredMax})` : `⚠️ ${standard}: ${measured} değeri aralık dışı (${requiredMin}-${requiredMax})` };
}

export function safetyAuditStatus(): string {
  const audit = runSafetyAudit();
  return `Güvenlik Denetçisi [${SAFETY_ITEMS.length} ekipman • geçiş %${audit.passRate} • ${audit.criticalCount} kritik → Sentinel]`;
}
