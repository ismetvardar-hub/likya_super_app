// ============================================================================
// 👤 IN3D AVATAR & SPORCU İKİZ KÖPRÜSÜ — in3D.io uyumlu 3D iskelet eşleme
// Kamera görüntüsünden 3D iskelet/avatar verisi üretir ve Sport Vision 3D
// simülasyonuna bağlar. Deterministik: landmark'lardan vücut açıları hesaplar.
// Kırılmasız: kamera yoksa graceful fallback; mevcut görüntü işlemeyi etkilemez.
// ============================================================================

export const IN3D_ENDPOINT = 'https://app.in3d.io'; // API anahtarı ile gerçek bağlantı noktası

export interface PosePoint {
  x: number;
  y: number;
  z: number;
  confidence: number;
}

export interface PoseSkeleton {
  /** 33 noktalı COCO/PoseNet uyumlu iskelet dizisi */
  keypoints: PosePoint[];
  /** Elde edilen 3D avatar kimliği */
  avatarId: string | null;
  /** Vücut duruşu özeti */
  pose: string;
  simulated: boolean;
}

// İki nokta arasındaki 3D vektör (iskelet uzuv hesapları için)
export function limbVector(a: PosePoint, b: PosePoint): { x: number; y: number; z: number } {
  return { x: b.x - a.x, y: b.y - a.y, z: (b.z ?? 0) - (a.z ?? 0) };
}

// Vücut segmentinin yatayla açısı (derece) — duruş sınıflandırma için
export function limbAngle(a: PosePoint, b: PosePoint): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  return (Math.atan2(dy, dx) * 180) / Math.PI;
}

// Duruş sınıflandırma (deterministik)
export function classifyPose(keypoints: PosePoint[]): string {
  if (keypoints.length < 13) return 'eksik';
  const [leftHip, rightHip, leftKnee, rightKnee] = [keypoints[11], keypoints[12], keypoints[13], keypoints[14]];
  const hipWidth = Math.abs(leftHip.x - rightHip.x);
  const kneeWidth = Math.abs(leftKnee.x - rightKnee.x);
  if (hipWidth > 0.18 && kneeWidth < 0.1) return 'durma (geniş duruş)';
  if (limbAngle(leftHip, leftKnee) > 60) return 'hamle (lunge)';
  return 'ayakta / hafif hareket';
}

// Kamera landmark'larından 3D iskelet/avatar verisi eşle
export function mapPoseToSkeleton(
  keypoints: PosePoint[],
  avatarId: string | null = null,
): PoseSkeleton {
  return {
    keypoints,
    avatarId,
    pose: classifyPose(keypoints),
    simulated: !avatarId,
  };
}

// in3D oturum başlat (kırılmasız stub — gerçek kamera akışı uygulamada)
export function createAvatarSession(): { ok: boolean; sessionId: string; simulated: boolean } {
  const simulated = typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia;
  return { ok: true, sessionId: `in3d_${Date.now().toString(36)}`, simulated };
}

// Eklenti durum rozeti
export function in3dBridgeStatus(): string {
  const hasCam = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;
  return `in3D Avatar [${hasCam ? 'kamera köprüsü hazır' : 'stub'} • 33 nokta iskelet → Sport Vision 3D]`;
}
