// ============================================================================
// 🧪 VIRTUAL BLE SENSOR LAB — fiziksel sensör olmadan uçtan uca test
// ESP32 çift-FSR basınç eğrileri (topuk basışı → önayak itişi)
// HR spike + HRV bozulması (yorgunluk profilleri) • BLE paket akışı
// Deterministik: aynı profile aynı seri (mulberry32 PRNG) — Mock-first
// ============================================================================

export type FatigueProfile = 'fresh' | 'normal' | 'fatigued';
export type ActivityKind = 'stance' | 'walk' | 'sprint' | 'jump';

export interface SensorFrame {
  tMs: number;
  heelFsr: number;
  forefootFsr: number;
  hr: number;
  hrvMs: number;
  activity: ActivityKind;
  accelMag: number;
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

  constructor(private readonly profile: FatigueProfile = 'normal', seed = 42) {
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

    return { tMs, heelFsr: heel, forefootFsr: forefoot, hr, hrvMs: Math.max(8, hrv), activity, accelMag: Math.round((activity === 'sprint' ? 16 : activity === 'jump' ? 18 : activity === 'walk' ? 3 : 0.4) * 10) / 10 };
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
}

export function virtualBleSensorLabStatus(): string {
  return 'Virtual BLE Lab: cift-FSR + HR/HRV profilleri, deterministik PRNG';
}
