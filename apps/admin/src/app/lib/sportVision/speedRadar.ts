// ============================================================================
// 🚗 LİKYA RADAR & OPTİK HIZ ANALİZİ (Speed Radar) — apps/admin/src/app/lib/sportVision/speedRadar.ts
// Piksel/kare hareketinden deterministik km/s hız hesabı (sanal radar).
// 100% matematik — LLM YOK. Kamera kalibrasyonu (bilinen nesne boyu) ile
// piksel→metre dönüşümü yapılır; vuruş ve sprint analizi üretilir.
// ============================================================================

export interface RadarCalibration {
  referenceLengthM: number;   // bilinen nesnenin gerçek boyu (metre) — örn. kale 7.32m
  referenceLengthPx: number;  // o nesnenin görüntüdeki piksel boyu
  fps: number;                // kamera kare hızı
}

// Piksel başına metre dönüşüm oranı (ppm: pixels per meter)
export function pixelsPerMeter(cal: RadarCalibration): number {
  if (cal.referenceLengthM <= 0 || cal.referenceLengthPx <= 0) return 0;
  return cal.referenceLengthPx / cal.referenceLengthM;
}

export function pxToMeters(px: number, ppm: number): number {
  return ppm > 0 ? px / ppm : 0;
}

// İki nokta arası Öklid uzaklığı (piksel)
export function pixelDistance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.hypot(x2 - x1, y2 - y1);
}

// FPS ve kare farkından saniye hesabı
export function framesToSeconds(frames: number, fps: number): number {
  return fps > 0 ? frames / fps : 0;
}

// Piksel hareketi → km/s (m/s × 3.6)
export function speedFromPixels(
  pxStartX: number, pxStartY: number,
  pxEndX: number, pxEndY: number,
  frames: number,
  cal: RadarCalibration
): number {
  const ppm = pixelsPerMeter(cal);
  const meters = pxToMeters(pixelDistance(pxStartX, pxStartY, pxEndX, pxEndY), ppm);
  const seconds = framesToSeconds(frames, cal.fps);
  if (seconds <= 0 || meters <= 0) return 0;
  return (meters / seconds) * 3.6;
}

export interface ShotAnalysis {
  speedKmh: number;
  distanceM: number;
  timeMs: number;
  isValid: boolean;
}

// Vuruş (şut) analizi: topun iki kare arası hareketinden hız
export function analyzeShot(
  cal: RadarCalibration,
  ballStart: { x: number; y: number },
  ballEnd: { x: number; y: number },
  frames: number
): ShotAnalysis {
  const ppm = pixelsPerMeter(cal);
  const distanceM = pxToMeters(pixelDistance(ballStart.x, ballStart.y, ballEnd.x, ballEnd.y), ppm);
  const timeMs = framesToSeconds(frames, cal.fps) * 1000;
  const speedKmh = speedFromPixels(ballStart.x, ballStart.y, ballEnd.x, ballEnd.y, frames, cal);
  // Fizik sınırı: 250 km/s üzeri ölçüm hatası kabul edilir (süpersonik değil!)
  const isValid = speedKmh > 0 && speedKmh < 250 && timeMs > 1;
  return { speedKmh: Math.round(speedKmh * 10) / 10, distanceM: Math.round(distanceM * 100) / 100, timeMs: Math.round(timeMs), isValid };
}

export interface TrackPoint { frame: number; x: number; y: number; }

export interface SprintAnalysis {
  avgKmh: number;
  peakKmh: number;
  distanceM: number;
  timeSec: number;
  accelerationMS2: number;   // ortalama ivmelenme
  isValid: boolean;
}

// Sprint takibi: pozisyon dizisinden ortalama/zirve hız + mesafe + ivmelenme
export function analyzeSprint(cal: RadarCalibration, track: TrackPoint[]): SprintAnalysis {
  if (!track || track.length < 2) {
    return { avgKmh: 0, peakKmh: 0, distanceM: 0, timeSec: 0, accelerationMS2: 0, isValid: false };
  }
  const ppm = pixelsPerMeter(cal);
  let totalMeters = 0;
  let peakKmh = 0;
  let firstSpeedMS = 0;
  const segmentSpeeds: number[] = [];
  for (let i = 1; i < track.length; i++) {
    const segM = pxToMeters(pixelDistance(track[i - 1].x, track[i - 1].y, track[i].x, track[i].y), ppm);
    const frames = Math.max(1, track[i].frame - track[i - 1].frame);
    const segSec = framesToSeconds(frames, cal.fps);
    totalMeters += segM;
    if (segSec > 0) {
      const segMs = segM / segSec;
      segmentSpeeds.push(segMs);
      peakKmh = Math.max(peakKmh, segMs * 3.6);
    }
    if (i === 1) firstSpeedMS = segM / Math.max(0.001, framesToSeconds(frames, cal.fps));
  }
  const timeSec = framesToSeconds(track[track.length - 1].frame - track[0].frame, cal.fps);
  const avgMS = timeSec > 0 ? totalMeters / timeSec : 0;
  const accelerationMS2 = timeSec > 0 ? (avgMS - firstSpeedMS) / timeSec : 0;
  return {
    avgKmh: Math.round(avgMS * 3.6 * 10) / 10,
    peakKmh: Math.round(peakKmh * 10) / 10,
    distanceM: Math.round(totalMeters * 100) / 100,
    timeSec: Math.round(timeSec * 100) / 100,
    accelerationMS2: Math.round(accelerationMS2 * 10) / 10,
    isValid: timeSec > 0.1 && totalMeters > 0,
  };
}

// Hazır kalibrasyonlar
export const CALIBRATIONS = {
  // Kale genişliği 7.32m referanslı standart saha kamerası
  goalLine(fps: number, goalWidthPx: number): RadarCalibration {
    return { referenceLengthM: 7.32, referenceLengthPx: goalWidthPx, fps };
  },
  // 5.5m ceza sahası çizgisi referanslı
  penaltyBoxLine(fps: number, lineWidthPx: number): RadarCalibration {
    return { referenceLengthM: 5.5, referenceLengthPx: lineWidthPx, fps };
  },
};

// İnsan dostu etiket: hız bandı → oyun içi yorum
export function speedLabel(kmh: number): string {
  if (kmh <= 0) return 'ölçüm bekleniyor';
  if (kmh < 80) return '🐌 Yumuşak vuruş';
  if (kmh < 110) return '⚽ Orta sert vuruş';
  if (kmh < 140) return '💥 Sert şut';
  if (kmh < 170) return '🔥 Roket şut';
  return '⚡ Makine vuruşu';
}
