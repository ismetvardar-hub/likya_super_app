// ============================================================================
// 📺 SEYİRCİ & BÜYÜK EKRAN KORT YAYIN GÖRÜNÜMÜ KONFİGÜRASYONU (Adım 81)
// TV/stadyum yayın modu: yüksek kontrast tipografi, sponsor logo overlay,
// turnuva aşaması etiketi + canlı telemetri banner'ı (servis hızı, ralli, HR zonu).
// Deterministik; sıfır bağımlılık; node-runnable.
// ============================================================================

export interface BroadcastTelemetry {
  serveVelocityKmh: number;
  rallyShots: number;
  heartZone: string;
}

export interface BroadcastConfig {
  stage: string;            // 'Quarterfinals' | 'Final' ...
  court: string;            // 'Court 1'
  sponsor: string | null;
  showTelemetry: boolean;
  scoreboardMode: 'big' | 'compact';
  accentColor: string;
}

export function createBroadcastConfig(opts: Partial<BroadcastConfig> = {}): BroadcastConfig {
  return {
    stage: opts.stage ?? 'Quarterfinals',
    court: opts.court ?? 'Court 1',
    sponsor: opts.sponsor ?? null,
    showTelemetry: opts.showTelemetry ?? true,
    scoreboardMode: opts.scoreboardMode ?? 'big',
    accentColor: opts.accentColor ?? '#00f2fe',
  };
}

/** Aşama + kort etiketi: "Quarterfinals · Court 1". */
export function stageIdentifier(config: BroadcastConfig): string {
  return `${config.stage} · ${config.court}`;
}

/** Sponsor banner metni (logo yoksa null). */
export function sponsorBanner(config: BroadcastConfig): string | null {
  return config.sponsor ? `${config.sponsor} present by · ile` : null;
}

/** Canlı telemetri banner metni. */
export function telemetryBanner(config: BroadcastConfig, telemetry: BroadcastTelemetry): string | null {
  if (!config.showTelemetry) return null;
  return `🎾 ${telemetry.serveVelocityKmh} km/h · Ralli ${telemetry.rallyShots} · ${telemetry.heartZone}`;
}

export function serializeBroadcastConfig(config: BroadcastConfig): string {
  return JSON.stringify(config);
}

export function deserializeBroadcastConfig(json: string): BroadcastConfig | null {
  try {
    const parsed = JSON.parse(json) as BroadcastConfig;
    if (!parsed.stage || !parsed.court) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Büyük ekran tipografi ölçeği (projektör/izleyici). */
export function broadcastTypography(mode: BroadcastConfig['scoreboardMode']): { scoreFont: number; labelFont: number; accent: string } {
  return mode === 'big'
    ? { scoreFont: 72, labelFont: 16, accent: '#00f2fe' }
    : { scoreFont: 40, labelFont: 11, accent: '#00f2fe' };
}

export function broadcastDisplayStatus(): string {
  return 'Yayın Görünümü: aşama+kort • sponsor banner • telemetri • büyük ekran tipografi';
}
