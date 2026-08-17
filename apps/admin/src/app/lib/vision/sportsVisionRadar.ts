// ============================================================================
// 👁️ SPORTS VISION HIZ RADARI ADAPTÖRÜ — Computer Vision stub
// Kort/tesis kamera verilerinden top hızı (km/h), oyuncu reaksiyon süresi ve
// araç giriş/çıkışlarını simüle ve analiz eder. Deterministik; Plan Z güvenli.
// ============================================================================

export interface RadarFrame {
  ballSpeedKmh: number;
  reactionMs: number;
  shotType: 'forehand' | 'backhand' | 'serve' | 'smash';
  confidence: number;
}

export interface VehicleEvent {
  id: string;
  plate: string;
  direction: 'giris' | 'cikis';
  timestamp: string;
  lane: number;
}

// Deterministik örnek radar okuması (simülasyon)
export function simulateRadarFrame(seed = 0): RadarFrame {
  const base = 96 + ((seed * 37) % 54); // 96-149 km/h
  return {
    ballSpeedKmh: base,
    reactionMs: 380 + ((seed * 53) % 320),
    shotType: (['forehand', 'backhand', 'serve', 'smash'] as const)[seed % 4],
    confidence: 0.82 + ((seed % 10) / 50),
  };
}

// Çoklu kare analizi → performans özeti (deterministik)
export function analyzeRadarSession(frames: RadarFrame[]): { avgSpeed: number; maxSpeed: number; avgReaction: number; dominantShot: string; score: number } {
  if (!frames.length) return { avgSpeed: 0, maxSpeed: 0, avgReaction: 0, dominantShot: 'none', score: 0 };
  const avgSpeed = Math.round(frames.reduce((s, f) => s + f.ballSpeedKmh, 0) / frames.length);
  const maxSpeed = Math.max(...frames.map((f) => f.ballSpeedKmh));
  const avgReaction = Math.round(frames.reduce((s, f) => s + f.reactionMs, 0) / frames.length);
  const counts = new Map<string, number>();
  frames.forEach((f) => counts.set(f.shotType, (counts.get(f.shotType) ?? 0) + 1));
  const dominantShot = Array.from(counts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'none';
  const score = Math.min(100, Math.round(avgSpeed / 1.8 + (350 - avgReaction) / 4));
  return { avgSpeed, maxSpeed, avgReaction, dominantShot, score };
}

// Araç giriş/çıkış olayları (tesis otopark radarı)
export function simulateVehicleEvents(count = 3): VehicleEvent[] {
  const out: VehicleEvent[] = [];
  for (let i = 0; i < count; i++) {
    out.push({
      id: `veh_${Date.now().toString(36)}_${i}`,
      plate: `06 LKY ${String(100 + i * 37).padStart(3, '0')}`,
      direction: i % 2 === 0 ? 'giris' : 'cikis',
      timestamp: new Date(Date.now() - i * 180000).toISOString(),
      lane: (i % 2) + 1,
    });
  }
  return out;
}

export function sportsVisionStatus(): string {
  return `Sports Vision Radar [top hızı km/h • reaksiyon ms • araç giriş/çıkış • CV stub]`;
}
