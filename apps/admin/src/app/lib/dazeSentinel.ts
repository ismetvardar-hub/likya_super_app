// ============================================================================
// ⚙️ DAZE SENTINEL SAHA OTOMASYONU (dazeSentinel)
// Turnike/IoT Uptime monitörü + meteoroloji senkronizasyonu + otomatik
// yedekleme yöneticisi. 100% deterministik — saha gözcüsü hiç uyumaz.
// ============================================================================

// ----------------------------------------------------------------------------
// 1) TURNİKE / IOT UPTIME MONİTÖRÜ
// ----------------------------------------------------------------------------
export type DeviceStatusKind = 'online' | 'offline' | 'bilinmiyor';

export interface DeviceState {
  deviceId: string;
  lastSeenMs: number;
  timeoutMs: number;
}

export interface DeviceStatus extends DeviceState {
  status: DeviceStatusKind;
  lastSeenAgeSec: number;
  offlineSec: number;
}

export function checkDevice(device: DeviceState, nowMs: number): DeviceStatus {
  const lastSeenAgeSec = Math.max(0, (nowMs - device.lastSeenMs) / 1000);
  const offlineSec = Math.max(0, lastSeenAgeSec - device.timeoutMs / 1000);
  const status: DeviceStatusKind = lastSeenAgeSec <= device.timeoutMs / 1000 ? 'online' : 'offline';
  return { ...device, status, lastSeenAgeSec: Math.round(lastSeenAgeSec), offlineSec: Math.round(offlineSec) };
}

export interface FleetReport {
  online: DeviceState[];
  offline: DeviceState[];
  uptimePct: number;
  summary: string;
}

export function monitorFleet(devices: DeviceState[], nowMs: number): FleetReport {
  const statuses = devices.map((d) => checkDevice(d, nowMs));
  const online = statuses.filter((s) => s.status === 'online');
  const offline = statuses.filter((s) => s.status === 'offline');
  const uptimePct = devices.length > 0 ? Math.round((online.length / devices.length) * 100) : 0;
  return {
    online,
    offline,
    uptimePct,
    summary:
      offline.length === 0
        ? `✅ Tüm cihazlar çevrimiçi (${online.length} adet, uptime %${uptimePct})`
        : `⚠️ ${offline.length} cihaz çevrimdışı: ${offline.map((d) => d.deviceId).join(', ')}`,
  };
}

// ----------------------------------------------------------------------------
// 2) METEOROLOJİ SENKRONİZASYONU — saha koşulu + Daze DJ tempo köprüsü
// ----------------------------------------------------------------------------
export interface WeatherSnapshot {
  tempC: number;
  condition: string;
  windKmh: number;
  rainMmPerHr: number;
  isNight: boolean;
}

export interface FieldWeatherAssessment {
  risk: 'düşük' | 'orta' | 'yüksek';
  recommendation: string;
  tempoBpm: number;          // Daze Müzik istasyonu için önerilen BPM
  pitchSafe: boolean;
}

export function syncWeather(w: WeatherSnapshot): FieldWeatherAssessment {
  let risk: 'düşük' | 'orta' | 'yüksek' = 'düşük';
  const reasons: string[] = [];

  if (w.tempC > 34) { risk = 'orta'; reasons.push('aşırı sıcak (>34°C)'); }
  if (w.tempC < 2) { risk = 'orta'; reasons.push('dondurucu soğuk (<2°C)'); }
  if (w.windKmh > 40) { risk = 'orta'; reasons.push(`fırtına rüzgarı (${Math.round(w.windKmh)} km/s)`); }
  if (w.rainMmPerHr > 15) { risk = 'yüksek'; reasons.push('sağanak yağış'); }
  if (w.rainMmPerHr > 40) { risk = 'yüksek'; reasons.push('sel riski'); }

  // Daze DJ tempo köprüsü: soğuk/gece → enerjik, sıcak → rahat
  const tempoBpm = w.isNight ? (w.tempC < 18 ? 128 : 118) : w.tempC > 30 ? 112 : 122;
  const pitchSafe = risk !== 'yüksek';

  const recommendation =
    risk === 'düşük'
      ? `✅ Saha oyuna uygun (${Math.round(w.tempC)}°C, ${w.windKmh.toFixed(0)} km/s rüzgar).`
      : `⚠️ Dikkat: ${reasons.join(', ')}. Antrenman yükü düşürülmeli.`;

  return { risk, recommendation, tempoBpm, pitchSafe };
}

// ----------------------------------------------------------------------------
// 3) OTOMATİK YEDEKLEME YÖNETİCİSİ
// ----------------------------------------------------------------------------
export interface BackupJob {
  id: string;
  source: string;
  target: string;
  lastBackupMs: number;
  intervalMs: number;
  retentionDays: number;
}

export interface BackupDecision {
  due: boolean;
  nextBackupAtMs: number;
  etaSec: number;
}

export function nextBackupDecision(job: BackupJob, nowMs: number): BackupDecision {
  const nextBackupAtMs = job.lastBackupMs + job.intervalMs;
  const due = nowMs >= nextBackupAtMs;
  return { due, nextBackupAtMs, etaSec: due ? 0 : Math.max(0, Math.ceil((nextBackupAtMs - nowMs) / 1000)) };
}

// Saklama politikası: retentionDays'den eski yedekleri sil
export function enforceRetention(backupTimestampsMs: number[], retentionDays: number, nowMs: number): { toDelete: number[]; keep: number[] } {
  const cutoff = nowMs - retentionDays * 86400000;
  const toDelete = backupTimestampsMs.filter((t) => t < cutoff);
  const keep = backupTimestampsMs.filter((t) => t >= cutoff);
  return { toDelete, keep };
}

// ----------------------------------------------------------------------------
// SENTINEL BİRLEŞİK GÖZLEM
// ----------------------------------------------------------------------------
export interface SentinelSnapshot {
  fleet: FleetReport;
  weather: FieldWeatherAssessment;
  backups: { decisions: Record<string, BackupDecision>; staleCount: number };
}

export interface SentinelConfig {
  devices: DeviceState[];
  weather: WeatherSnapshot;
  backupJobs: BackupJob[];
  retentionDays: number;
}

export function sentinelInspect(cfg: SentinelConfig, nowMs: number): SentinelSnapshot {
  const fleet = monitorFleet(cfg.devices, nowMs);
  const weather = syncWeather(cfg.weather);
  const decisions: Record<string, BackupDecision> = {};
  let staleCount = 0;
  for (const job of cfg.backupJobs) {
    const d = nextBackupDecision(job, nowMs);
    decisions[job.id] = d;
    if (d.due) staleCount += 1;
  }
  return { fleet, weather, backups: { decisions, staleCount } };
}
