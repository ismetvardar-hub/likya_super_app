// ============================================================================
// 🧪 VIRTUAL BLE SENSOR LAB — fiziksel sensör olmadan uçtan uca test
// ESP32 çift-FSR basınç eğrileri (topuk basışı → önayak itişi) + GCT üretimi
// Decathlon HRM: HR eğrileri + RR interval'leri (HRV) • Wrist IMU stroke burst
// HR spike + HRV bozulması (yorgunluk profilleri) • BLE paket akışı
// start/stop kontrolü + sensorSyncEngine'e doğrudan besleme (feedToSync)
// Deterministik: aynı profile aynı seri (mulberry32 PRNG) — Mock-first
// ============================================================================
import { buildSyncedFrames, type RawSample, type SyncedFrame } from '../sensorSyncEngine.ts';

export type FatigueProfile = 'fresh' | 'normal' | 'fatigued';
export type ActivityKind = 'stance' | 'walk' | 'sprint' | 'jump';
export type StrokeKind = 'forehand' | 'backhand' | 'serve' | 'volley';

export interface SensorFrame {
  tMs: number;
  heelFsr: number;
  forefootFsr: number;
  hr: number;
  hrvMs: number;
  activity: ActivityKind;
  accelMag: number;
  gctMs: number;          // zemin temas süresi (150-300ms; stance=0)
}

export interface ImuFrame {
  tMs: number;
  accelX: number;
  accelY: number;
  accelZ: number;
  angularVelocity: number; // rad/s (gyro)
  jerk: number;
  stroke: StrokeKind;
}

export interface BlePacket {
  seq: number;
  tMs: number;
  payload: Uint8Array;  // 6 byte: [heel(2) | forefoot(2) | hr(1) | flags(1)]
  crcOk: boolean;
}

export interface SimulationSummary {
  packets: number;
  heelPeak: number;
  forefootPeak: number;
  hrMax: number;
  hrvMean: number;
  hrvDropPct: number;
  profile: FatigueProfile;
}

export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const PROFILE_CFG: Record<FatigueProfile, { hrBase: number; hrvBase: number; fatigueFactor: number; spikeChance: number }> = {
  fresh:    { hrBase: 62, hrvBase: 68, fatigueFactor: 0.0, spikeChance: 0.02 },
  normal:   { hrBase: 78, hrvBase: 52, fatigueFactor: 0.25, spikeChance: 0.08 },
  fatigued: { hrBase: 96, hrvBase: 34, fatigueFactor: 0.6, spikeChance: 0.22 },
};


export class VirtualBleSensorLab {
  private rand: () => number;
  private cfg: typeof PROFILE_CFG[FatigueProfile];
  private stepCount = 0;
  private readonly profile: FatigueProfile;

  constructor(profile: FatigueProfile = 'normal', seed = 42) {
    this.profile = profile;
    this.rand = mulberry32(seed);
    this.cfg = PROFILE_CFG[profile];
  }

  /** adım periyodunda çift-FSR eğrisi + HR/HRV üret */
  nextFrame(tMs: number, activity: ActivityKind = 'stance'): SensorFrame {
    const { hrBase, hrvBase, fatigueFactor, spikeChance } = this.cfg;
    this.stepCount++;
    const cycle = this.stepCount % 100;

    let heel = 0, forefoot = 0;
    if (activity !== 'stance') {
      if (cycle < 30) heel = 95 * Math.sin((cycle / 30) * Math.PI);
      else if (cycle < 65) forefoot = 98 * Math.sin(((cycle - 30) / 35) * Math.PI);
      else { heel = 20 * this.rand(); forefoot = 15 * this.rand(); }
      if (activity === 'sprint') { heel *= 0.35; forefoot = Math.min(100, forefoot * 1.25); }
      if (activity === 'jump') { heel = 100; forefoot = 60; }
    }
    heel = Math.round(Math.min(100, heel + this.rand() * 4));
    forefoot = Math.round(Math.min(100, forefoot + this.rand() * 4));

    const activityBoost = activity === 'sprint' ? 55 : activity === 'walk' ? 12 : activity === 'jump' ? 40 : 0;
    const spike = this.rand() < spikeChance ? 18 * (1 + fatigueFactor) : 0;
    const hr = Math.round(hrBase + activityBoost * (1 + fatigueFactor * 0.5) + spike);

    const fatigueDecay = fatigueFactor * 0.55;
    // Zamansal yorgunluk: oturum ilerledikçe HRV daha fazla bozulur
    const timeFatigue = Math.min(1, tMs / 20000);
    const hrv = Math.round(hrvBase * (1 - fatigueDecay) * (1 - timeFatigue * 0.35) + this.rand() * 6 - 3);

    // GCT üretimi (150-300ms; stance'te temas yok)
    const gctMs = activity === 'sprint' ? 120 + Math.round(this.rand() * 30)
      : activity === 'jump' ? 250 + Math.round(this.rand() * 50)
      : activity === 'walk' ? 190 + Math.round(this.rand() * 30)
      : 0;

    return { tMs, heelFsr: heel, forefootFsr: forefoot, hr, hrvMs: Math.max(8, hrv), activity, accelMag: Math.round((activity === 'sprint' ? 16 : activity === 'jump' ? 18 : activity === 'walk' ? 3 : 0.4) * 10) / 10, gctMs };
  }

  /** 6 byte BLE paketine çevir (heel|forefoot 2'er byte + HR 1 + flags 1) */
  toBlePacket(frame: SensorFrame, seq: number): BlePacket {
    const payload = new Uint8Array(6);
    payload[0] = frame.heelFsr;
    payload[1] = (frame.heelFsr * 256) & 0xff;
    payload[2] = frame.forefootFsr;
    payload[3] = (frame.forefootFsr >> 8) & 0xff;
    payload[4] = Math.min(255, frame.hr);
    payload[5] = frame.activity === 'sprint' ? 0x01 : frame.activity === 'jump' ? 0x02 : 0x00;
    return { seq, tMs: frame.tMs, payload, crcOk: true };
  }

  /** Eşit aralıklı paket akışı üret */
  streamPackets(durationMs: number, intervalMs = 50): SensorFrame[] {
    const frames: SensorFrame[] = [];
    const n = Math.floor(durationMs / intervalMs);
    for (let i = 0; i < n; i++) {
      const t = i * intervalMs;
      const act: ActivityKind = i % 200 < 120 ? 'sprint' : i % 200 < 160 ? 'jump' : i % 200 < 190 ? 'walk' : 'stance';
      frames.push(this.nextFrame(t, act));
    }
    return frames;
  }

  /** Uçtan uca otomatik test için özet istatistik */
  simulateSession(durationMs: number, intervalMs = 50): SimulationSummary {
    const frames = this.streamPackets(durationMs, intervalMs);
    const third = Math.floor(frames.length / 3);
    const first = frames.slice(0, Math.max(1, third));
    const last = frames.slice(Math.max(0, frames.length - third));
    const mean = (arr: SensorFrame[], k: (f: SensorFrame) => number) => arr.reduce((a, f) => a + k(f), 0) / arr.length;
    const hrvDropPct = first.length && last.length ? Math.round((1 - mean(last, (f) => f.hrvMs) / mean(first, (f) => f.hrvMs)) * 100) : 0;
    return {
      packets: frames.length,
      heelPeak: Math.max(...frames.map((f) => f.heelFsr)),
      forefootPeak: Math.max(...frames.map((f) => f.forefootFsr)),
      hrMax: Math.max(...frames.map((f) => f.hr)),
      hrvMean: Math.round(mean(frames, (f) => f.hrvMs)),
      hrvDropPct,
      profile: this.profile,
    };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 2. WRIST IMU — dinamik stroke burst eğrileri (gerçekçi ivme + gyro)
  // ══════════════════════════════════════════════════════════════════════════
  /** Stroke burst üret: sinüs zarfı içinde ivme vektörü + açısal hız eğrisi */
  nextImuFrame(tMs: number, stroke: StrokeKind): ImuFrame {
    const PROFILES: Record<StrokeKind, { angVelPk: number; accelPk: number; jerkPk: number }> = {
      forehand: { angVelPk: 8, accelPk: 9, jerkPk: 130 },
      backhand: { angVelPk: -7, accelPk: 8.5, jerkPk: 112 },
      serve: { angVelPk: 14, accelPk: 12, jerkPk: 180 },
      volley: { angVelPk: 5, accelPk: 6, jerkPk: 70 },
    };
    const p = PROFILES[stroke];
    this.stepCount++;
    const phase = this.stepCount % 40;
    const envelope = Math.sin((phase / 40) * Math.PI);      // 0→1→0 burst
    const noise = 1 + (this.rand() - 0.5) * 0.2;            // ±10% gürültü
    const mag = p.accelPk * envelope * noise;
    const ax = mag * 0.85;
    const ay = mag * 0.35;
    const az = mag * (stroke === 'serve' ? 0.5 : stroke === 'backhand' ? 0.35 : 0.3);
    return {
      tMs,
      accelX: Math.round(ax * 10) / 10,
      accelY: Math.round(ay * 10) / 10,
      accelZ: Math.round(az * 10) / 10,
      angularVelocity: Math.round(p.angVelPk * envelope * 10) / 10,
      jerk: Math.round(p.jerkPk * (phase < 20 ? envelope : envelope * 0.7)),
      stroke,
    };
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 3. DECATHLON HRM — RR interval üretimi (HRV için)
  // ══════════════════════════════════════════════════════════════════════════
  /** HR'den RR interval dizisi üret (ms): varyans HRV ile orantılı */
  rrIntervals(count = 10, hrOverride?: number): number[] {
    const { hrBase, hrvBase } = this.cfg;
    const hr = hrOverride ?? hrBase;
    const meanRR = 60000 / hr;
    const out: number[] = [];
    for (let i = 0; i < count; i++) {
      const jitter = (this.rand() - 0.5) * hrvBase * 2;    // yüksek HRV → yüksek varyans
      out.push(Math.round(meanRR + jitter));
    }
    return out;
  }

  // ══════════════════════════════════════════════════════════════════════════
  // 4. START/STOP KONTROLÜ + sensorSyncEngine'e besleme
  // ══════════════════════════════════════════════════════════════════════════
  private running = false;
  private simTMs = 0;
  private currentActivity: ActivityKind = 'walk';
  private currentStroke: StrokeKind = 'forehand';

  start(): this { this.running = true; return this; }
  stop(): this { this.running = false; return this; }
  get isRunning(): boolean { return this.running; }

  /** Çalışıyorsa yeni senkron telemetri tick'i üret */
  tick(intervalMs = 50): SensorFrame | null {
    if (!this.running) return null;
    const frame = this.nextFrame(this.simTMs, this.currentActivity);
    this.simTMs += intervalMs;
    if (this.simTMs % 800 < 400) this.currentActivity = 'sprint';
    else if (this.simTMs % 800 < 560) this.currentActivity = 'jump';
    else this.currentActivity = 'walk';
    this.currentStroke = (['forehand', 'backhand', 'serve', 'volley'] as StrokeKind[])[Math.floor(this.simTMs / 1600) % 4];
    return frame;
  }

  /** Sahte telemetriyi RawSample'lerle sensorSyncEngine'e besle → 100ms senkron çerçeveler */
  feedToSync(durationMs: number): SyncedFrame[] {
    const raw: RawSample[] = [];
    const insole = this.streamPackets(durationMs, 100);       // 10Hz insole
    const hrm = this.streamPackets(durationMs, 1000);         // 1Hz HRM
    for (const f of insole) {
      raw.push({ source: 'INSOLE', tMs: f.tMs, value: f.forefootFsr });
      raw.push({ source: 'IMU', tMs: f.tMs, value: f.accelMag });
      if (f.gctMs > 0) raw.push({ source: 'INSOLE', tMs: f.tMs + 1, value: f.gctMs / 2 });
    }
    for (const f of hrm) raw.push({ source: 'HRM', tMs: f.tMs, value: f.hr });
    return buildSyncedFrames(raw, 0, durationMs);
  }
}


export function virtualBleSensorLabStatus(): string {
  return 'Virtual BLE Lab: cift-FSR + HR/HRV profilleri, deterministik PRNG';
}

// ══════════════════════════════════════════════════════════════════════════
// 5. POWER MODEL — Hardware Kits: pil & gecikme kısıtlamaları (Harvard MLSys)
// ══════════════════════════════════════════════════════════════════════════
export interface PowerEstimate {
  activeMah: number;        // seans boyunca harcanan şarj
  activePct: number;        // pilin yüzde kaçı tüketildi
  currentMa: number;        // ortalama akım (örnekleme hızına bağlı)
  capacityMah: number;
  hoursUntilEmpty: number;  // sürekli aktif kullanımda pil ömrü
}

/**
 * Örnekleme hızına bağlı güç modeli: 100Hz ≈ 18mA, 10Hz ≈ 6mA, 1Hz ≈ 1.2mA
 * (ESP32 + BLE tx yaklaşımı). Dinamik örnekleme = pil tasarrufu göstergesi.
 */
export function estimateBatteryDrain(input: { activeMs: number; sampleRateHz?: number; mahCapacity?: number }): PowerEstimate {
  const { activeMs, sampleRateHz = 100, mahCapacity = 120 } = input;
  const activeH = activeMs / 3_600_000;
  const currentMa = 1.2 + (sampleRateHz / 100) * 16.8; // 100Hz → 18mA
  const activeMah = Number((activeH * currentMa).toFixed(2));
  return {
    activeMah,
    activePct: Number(((activeMah / mahCapacity) * 100).toFixed(2)),
    currentMa: Number(currentMa.toFixed(1)),
    capacityMah: mahCapacity,
    hoursUntilEmpty: Number((mahCapacity / currentMa).toFixed(1)),
  };
}

// ══════════════════════════════════════════════════════════════════════════
// 6. KANAL SİMÜLASYONU — BLE gecikmesi + paket kaybı (deterministik)
// ══════════════════════════════════════════════════════════════════════════
export interface ChannelOptions {
  packetLossPct?: number; // 0-100 düşen paket oranı
  latencyMs?: number;     // baz gecikme
  seed?: number;
}

export interface ChannelResult {
  frames: SensorFrame[];
  dropped: number;
  lossPct: number;
  latenciesMs: number[]; // kabul edilen paketlerin gecikmeleri
}

/** Gerçek dünya BLE kısıtlamalarını simüle eder: kayıp + jitter'li gecikme. */
export function simulateChannel(frames: SensorFrame[], opts: ChannelOptions = {}): ChannelResult {
  const rand = mulberry32(opts.seed ?? 42);
  const lossPct = opts.packetLossPct ?? 0;
  const latency = opts.latencyMs ?? 0;
  const out: SensorFrame[] = [];
  const latenciesMs: number[] = [];
  let dropped = 0;
  for (const f of frames) {
    if (rand() * 100 < lossPct) {
      dropped++;
      continue;
    }
    out.push(f);
    latenciesMs.push(latency > 0 ? Math.round(latency * (0.7 + rand() * 0.6)) : 0);
  }
  return { frames: out, dropped, lossPct, latenciesMs };
}

// ══════════════════════════════════════════════════════════════════════════
// 7. OTURUM DIŞA AKTARIMI — offline replay / CI fikstürü (portable JSON)
// ══════════════════════════════════════════════════════════════════════════
export function sessionToJson(frames: SensorFrame[], meta: Record<string, unknown> = {}): string {
  return JSON.stringify({ version: 1, meta, frames }, null, 2);
}

