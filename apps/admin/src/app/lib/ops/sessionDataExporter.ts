// ============================================================================
// 🎓 AKADEMİK & ARAŞTIRMA SEANS EXPORT MOTORU (Adım 13)
// CSV + JSON zaman serisi: Timestamp, HR (BPM), GCT (ms), RSI,
// Toe Pressure (%), Heel Pressure (%), Arm Velocity (km/h),
// Loading Rate (kN/s), TRIMP.
// ============================================================================

export interface SessionSample {
  timestamp: string;
  hr: number;
  gctMs: number;
  rsi: number;
  toePct: number;
  heelPct: number;
  armKmh: number;
  loadingKnS: number;
  trimp: number;
}

export const SESSION_COLUMNS = ['timestamp', 'hr_bpm', 'gct_ms', 'rsi', 'toe_pct', 'heel_pct', 'arm_kmh', 'loading_kns', 'trimp'];

// ---------------------------------------------------------------------------
// 1. CSV Üretimi
// ---------------------------------------------------------------------------
export function samplesToCsv(samples: SessionSample[]): string {
  const header = SESSION_COLUMNS.join(',');
  const rows = samples.map((s) =>
    [s.timestamp, s.hr, s.gctMs, s.rsi, s.toePct, s.heelPct, s.armKmh, s.loadingKnS, s.trimp].join(','),
  );
  return [header, ...rows].join('\n');
}

// ---------------------------------------------------------------------------
// 2. JSON Üretimi (meta + zaman serisi)
// ---------------------------------------------------------------------------
export function samplesToJson(samples: SessionSample[], meta?: Record<string, string>): string {
  return JSON.stringify({ meta: meta ?? {}, columns: SESSION_COLUMNS, samples }, null, 2);
}

// ---------------------------------------------------------------------------
// 3. Tarayıcı İndirme Yardımcıları
// ---------------------------------------------------------------------------
export function downloadSessionExport(content: string, fileName: string, mime: string): void {
  if (typeof window === 'undefined') return;
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadSessionCsv(samples: SessionSample[]): void {
  downloadSessionExport(samplesToCsv(samples), `extremes-session-${Date.now()}.csv`, 'text/csv;charset=utf-8');
}

export function downloadSessionJson(samples: SessionSample[]): void {
  downloadSessionExport(samplesToJson(samples), `extremes-session-${Date.now()}.json`, 'application/json;charset=utf-8');
}

// ---------------------------------------------------------------------------
// 4. Demo Serisi (deterministik — testler için)
// ---------------------------------------------------------------------------
export function buildDemoSessionSamples(count = 8): SessionSample[] {
  return Array.from({ length: count }, (_, i) => ({
    timestamp: `2026-08-19T18:0${i}:00Z`,
    hr: 158 + (i % 7) * 4,
    gctMs: 182 + (i % 5) * 5,
    rsi: Number((1.9 + (i % 4) * 0.1).toFixed(2)),
    toePct: 74 + (i % 5) * 2,
    heelPct: 26 - (i % 3),
    armKmh: 92 + (i % 5) * 2,
    loadingKnS: Number((1.7 + (i % 3) * 0.1).toFixed(1)),
    trimp: 20 + i * 3,
  }));
}

export function sessionExporterStatus(): string {
  return `Seans Export: ${SESSION_COLUMNS.length} sütun • CSV + JSON • indirme hazır`;
}
