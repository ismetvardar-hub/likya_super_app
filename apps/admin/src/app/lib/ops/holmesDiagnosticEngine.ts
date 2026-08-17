// ============================================================================
// 🔍 OTOMATİK KÖK NEDEN ANALİZİ & SRE MOTORU (HolmesGPT mantığı)
// /api/health ve sistem loglarındaki hataları (500, timeout, db fail) yakalar,
// nedenini ve çözüm önerisini CEO'ya döner. Deterministik; Plan Z güvenli.
// ============================================================================

export type IncidentType = 'http-500' | 'timeout' | 'db-fail' | 'memory' | 'api-key' | 'unknown';

export interface Incident {
  type: IncidentType;
  raw: string;
  timestamp: string;
}

export interface RcaResult {
  incident: Incident;
  rootCause: string;
  confidence: number;
  fix: string;
  severity: 'dusuk' | 'orta' | 'yuksek' | 'kritik';
  autoRemediable: boolean;
}

const INCIDENT_PATTERNS: { type: IncidentType; detect: RegExp[]; rootCause: string; fix: string; severity: RcaResult['severity']; autoRemediable: boolean }[] = [
  { type: 'http-500', detect: [/500/, /internal server error/, /error: fetch/, /failed to compile/], rootCause: 'Serverless fonksiyon çalışma zamanı hatası veya derlenemeyen kod', fix: 'Son commit geri alınmalı / tsc+build doğrulanmalı; Vercel deploy log kontrol edilmeli', severity: 'yuksek', autoRemediable: true },
  { type: 'timeout', detect: [/timeout/, /timed out/, /abort/i, /gateway timeout/], rootCause: 'Yavaş LLM çağrısı veya 60s sunucu eşiği aşıldı', fix: 'Model şelalesinde Plan B/C fallback aktifleştir; timeout değeri artırılabilir', severity: 'orta', autoRemediable: true },
  { type: 'db-fail', detect: [/db connection/, /supabase/, /postgres/, /connection failed/, /fetch failed/], rootCause: 'Supabase bağlantı hatası veya secret eksik (SUPABASE_DB_URL)', fix: 'SUPABASE_DB_URL + SERVICE_ROLE_KEY env kontrolü; mock fallback devreye girdi', severity: 'kritik', autoRemediable: true },
  { type: 'memory', detect: [/memory/, /heap/, /out of memory/, /v8::internal/], rootCause: 'Serverless bellek sınırı aşıldı (büyük payload/JSON)', fix: 'İstek boyutu küçültülmeli; maxDuration/dosya işleme optimize edilmeli', severity: 'yuksek', autoRemediable: false },
  { type: 'api-key', detect: [/401/, /403/, /unauthorized/, /api key/, /permission denied/], rootCause: 'API anahtarı geçersiz/eksik veya kota aşıldı', fix: 'Env anahtarlarını yenile; Plan E free havuzuna geç', severity: 'kritik', autoRemediable: true },
  { type: 'unknown', detect: [], rootCause: 'Bilinmeyen olay — log detayı gerekiyor', fix: 'Detaylı log toplanmalı; sentinel bilet açılmalı', severity: 'dusuk', autoRemediable: false },
];

// Olayı sınıflandır (deterministik)
export function classifyIncident(raw: string): Incident {
  const lower = raw.toLowerCase();
  for (const p of INCIDENT_PATTERNS) {
    if (p.detect.some((re) => re.test(lower))) {
      return { type: p.type, raw, timestamp: new Date().toISOString() };
    }
  }
  return { type: 'unknown', raw, timestamp: new Date().toISOString() };
}

// Kök neden analizi (HolmesGPT mantığı)
export function diagnose(raw: string): RcaResult {
  const incident = classifyIncident(raw);
  const pattern = INCIDENT_PATTERNS.find((p) => p.type === incident.type) ?? INCIDENT_PATTERNS[5];
  return {
    incident,
    rootCause: pattern.rootCause,
    confidence: incident.type === 'unknown' ? 0.4 : 0.85,
    fix: pattern.fix,
    severity: pattern.severity,
    autoRemediable: pattern.autoRemediable,
  };
}

// Sağlık yanıtından incident tarama (canlı /api/health + log besleme)
export function scanHealthLogs(healthJson: string, extraLogs: string[] = []): RcaResult[] {
  const sources = [healthJson, ...extraLogs];
  return sources
    .filter((s) => /error|fail|500|timeout|401|403|memory/i.test(s))
    .map((s) => diagnose(s));
}

// Otomatik iyileştirme emülasyonu (auto-remediable ise)
export function autoRemediate(result: RcaResult): { ok: boolean; action: string } {
  if (!result.autoRemediable) return { ok: false, action: 'Otomatik iyileştirme uygun değil — insan onayı gerekli' };
  return { ok: true, action: `🔧 Auto-Remediate: ${result.fix} (SRE kuralı tetiklendi)` };
}

export function holmesStatus(): string {
  return `Holmes RCA [${INCIDENT_PATTERNS.length} kalıp • 500/timeout/db/key • auto-remediate]`;
}
