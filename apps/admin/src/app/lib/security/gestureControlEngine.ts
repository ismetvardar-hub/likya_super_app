// ============================================================================
// ✋ TEMASSIZ EL JESTİ KONTROLCÜSÜ (Gesture Synth — MediaPipe Hands şema uyumlu)
// Webcam üzerinden 3 temel temassız jest:
//   Swipe_Left_Right : sonraki/önceki kiosk ekranı
//   Pinch_Select     : ürün/seans onayla
//   Open_Palm_Stop   : seans/pişirme sayacını duraklat
// Webcam yoksa deterministik simülasyon (mock-first). Plan Z güvenli.
// ============================================================================

export type Gesture = 'Swipe_Left_Right' | 'Pinch_Select' | 'Open_Palm_Stop' | 'none';

export interface HandLandmarks {
  indexTip: { x: number; y: number };
  thumbTip: { x: number; y: number };
  wrist: { x: number; y: number };
  palmCenter: { x: number; y: number };
}

export interface GestureDecision {
  gesture: Gesture;
  confidence: number;      // 0-1
  action: string;
  touchless_mode: boolean; // temassız bayrak
}

function distance(a: { x: number; y: number }, b: { x: number; y: number }): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

/** El landmark'larından jest çıkarımı (deterministik). */
export function detectGesture(hand: HandLandmarks, prevX: number | null = null): GestureDecision {
  // Pinch: başparmak-işaret parmağı yakın (<0.04 normalize)
  if (distance(hand.thumbTip, hand.indexTip) < 0.04) {
    return { gesture: 'Pinch_Select', confidence: 0.94, action: 'Ürün/seans onaylandı', touchless_mode: true };
  }
  // Open Palm Stop: avuç merkezi ile bilek uzak + parmaklar açık
  const palmSpan = distance(hand.wrist, hand.palmCenter);
  if (palmSpan > 0.2) {
    return { gesture: 'Open_Palm_Stop', confidence: 0.9, action: 'Seans/sayaç duraklatıldı', touchless_mode: true };
  }
  // Swipe: el yatay hız (prevX referansı)
  if (prevX !== null && Math.abs(hand.wrist.x - prevX) > 0.18) {
    return { gesture: 'Swipe_Left_Right', confidence: 0.85, action: hand.wrist.x > prevX ? 'Sonraki ekran' : 'Önceki ekran', touchless_mode: true };
  }
  return { gesture: 'none', confidence: 0.5, action: 'Jest algılanmadı', touchless_mode: true };
}

/** Mock jest üretimi (webcam yoksa UI simülasyonu). */
export function mockGesture(kind: Gesture): GestureDecision {
  switch (kind) {
    case 'Swipe_Left_Right': return { gesture: kind, confidence: 0.88, action: 'Sonraki/önceki kiosk ekranı', touchless_mode: true };
    case 'Pinch_Select': return { gesture: kind, confidence: 0.95, action: 'Ürün/seans onaylandı', touchless_mode: true };
    case 'Open_Palm_Stop': return { gesture: kind, confidence: 0.91, action: 'Seans/sayaç duraklatıldı', touchless_mode: true };
    default: return { gesture: 'none', confidence: 0.5, action: '—', touchless_mode: true };
  }
}

/** Kiosk/mutfak ekranlarına temassız kontrol bayrağı. */
export function touchlessFlag(screen: 'kiosk' | 'kitchen' | 'coach'): { screen: string; touchless_mode: boolean; note: string } {
  return { screen, touchless_mode: true, note: 'Terli/ıslak elle ekrana dokunmadan havadan yönetim etkin' };
}

export function gestureControlEngineStatus(): string {
  return 'Gesture Synth [Swipe • Pinch • Open Palm • MediaPipe şema • touchless_mode]';
}
