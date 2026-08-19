// ============================================================================
// 👁️ DAZE SENTINEL — BİLGİSAYARLI GÖRÜ & GÜVENLİK MOTORU
// YOLOv11 & AI Box mantığı: yüz/vücut tanıma, gece bölge ihlali (Bounding Box),
// İSG kask/yelek denetimi, 4 kanallı sanal kamera matrisi. Deterministik;
// Plan Z güvenli; asla throw etmez.
// ============================================================================

export interface BoundingBox {
  x1: number; y1: number; x2: number; y2: number;
}

// ── 1. TURNİKE YÜZ/VÜCUT TANIMA ─────────────────────────────────────────────
export interface FaceGateAccess {
  id: string;
  subjectId: string;
  subjectName: string;
  matchScore: number;       // 0-1 yüz eşleşme skoru
  accessLevel: 'staff' | 'vip' | 'guest' | 'denied';
  gateId: string;
  ts: string;
  allowed: boolean;
}

export function createFaceGateAccess(input: { subjectId: string; subjectName: string; matchScore: number; accessLevel?: FaceGateAccess['accessLevel']; gateId?: string }): FaceGateAccess {
  const matchScore = Math.max(0, Math.min(1, input.matchScore));
  const allowed = matchScore >= 0.82 && input.accessLevel !== 'denied';
  return {
    id: `FG-${Date.now().toString(36)}`,
    subjectId: input.subjectId,
    subjectName: input.subjectName,
    matchScore,
    accessLevel: input.accessLevel ?? (allowed ? 'staff' : 'denied'),
    gateId: input.gateId ?? 'GATE-A',
    ts: new Date().toISOString(),
    allowed,
  };
}

// ── 2. GECE BÖLGE İHLALİ (YOLO İNSAN TESPİTİ) ───────────────────────────────
export interface HumanIntrusionAlert {
  id: string;
  zone: string;
  bbox: BoundingBox;
  confidence: number;       // 0-1 (YOLOv11)
  cameraId: string;
  ts: string;
  severity: 'low' | 'medium' | 'critical';
  resolved: boolean;
}

export function createIntrusionAlert(input: { zone: string; bbox: BoundingBox; confidence?: number; cameraId?: string; severity?: HumanIntrusionAlert['severity'] }): HumanIntrusionAlert {
  const confidence = Math.max(0, Math.min(1, input.confidence ?? 0.94));
  return {
    id: `INT-${Date.now().toString(36)}`,
    zone: input.zone,
    bbox: input.bbox,
    confidence,
    cameraId: input.cameraId ?? 'CAM-N',
    ts: new Date().toISOString(),
    severity: input.severity ?? (confidence >= 0.9 ? 'critical' : confidence >= 0.7 ? 'medium' : 'low'),
    resolved: false,
  };
}

// ── 3. İSG KASK/YELEK DENETİMİ ──────────────────────────────────────────────
export interface PPESafetyCompliance {
  id: string;
  workerId: string;
  helmetDetected: boolean;
  vestDetected: boolean;
  confidence: number;
  status: 'Compliant' | 'Violation';
  cameraId: string;
  ts: string;
  violationType: string | null;
}

export function createPpeCheck(input: { workerId: string; helmetDetected: boolean; vestDetected: boolean; confidence?: number; cameraId?: string }): PPESafetyCompliance {
  const compliant = input.helmetDetected && input.vestDetected;
  return {
    id: `PPE-${Date.now().toString(36)}`,
    workerId: input.workerId,
    helmetDetected: input.helmetDetected,
    vestDetected: input.vestDetected,
    confidence: Math.max(0, Math.min(1, input.confidence ?? 0.93)),
    status: compliant ? 'Compliant' : 'Violation',
    cameraId: input.cameraId ?? 'CAM-SAFETY',
    ts: new Date().toISOString(),
    violationType: !compliant ? (input.helmetDetected ? 'YELEK-YOK' : input.vestDetected ? 'KASK-YOK' : 'KASK-YELEK-YOK') : null,
  };
}

// ── 4. 4 KANALLI SANAL KAMERA MATRİSİ ───────────────────────────────────────
export type CamChannel = 'CAM-1' | 'CAM-2' | 'CAM-3' | 'CAM-4';
export type CamState = 'STREAMING' | 'NOISE' | 'OFFLINE';

export interface MultiCamStreamMatrix {
  channels: { channel: CamChannel; name: string; state: CamState; fps: number; lastEvent: string }[];
  overall: 'NOMINAL' | 'DEGRADED' | 'CRITICAL';
}

export function buildCameraMatrix(channelStates: Partial<Record<CamChannel, CamState>> = {}): MultiCamStreamMatrix {
  const defaults: Record<CamChannel, { name: string; fps: number }> = {
    'CAM-1': { name: 'Kuzey Giriş', fps: 24 },
    'CAM-2': { name: 'Kort Zonu', fps: 24 },
    'CAM-3': { name: 'Depo / Ekipman', fps: 30 },
    'CAM-4': { name: 'Glamping Hattı', fps: 18 },
  };
  const channels = (['CAM-1', 'CAM-2', 'CAM-3', 'CAM-4'] as CamChannel[]).map((ch) => ({
    channel: ch,
    name: defaults[ch].name,
    state: channelStates[ch] ?? 'STREAMING',
    fps: channelStates[ch] === 'OFFLINE' ? 0 : defaults[ch].fps,
    lastEvent: channelStates[ch] === 'NOISE' ? 'parazit: sinyal kesintili' : channelStates[ch] === 'OFFLINE' ? 'bağlantı koptu' : 'nominal akış',
  }));
  const offline = channels.filter((c) => c.state === 'OFFLINE').length;
  const noisy = channels.filter((c) => c.state === 'NOISE').length;
  const overall: MultiCamStreamMatrix['overall'] = offline > 1 ? 'CRITICAL' : offline > 0 || noisy > 0 ? 'DEGRADED' : 'NOMINAL';
  return { channels, overall };
}

export function sentinelVisionEngineStatus(): string {
  return 'Sentinel Vision [YOLOv11 bbox • FaceGate • İSG denetimi • 4-kanal kamera matrisi]';
}
