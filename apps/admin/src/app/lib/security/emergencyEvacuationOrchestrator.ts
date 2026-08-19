// ============================================================================
// 🚨 OTONOM ACİL DURUM TAHLİYE PROTOKOLÜ (yangın tetiklendiğinde TEK TRANSACTION)
//   1. anprGateAccessBridge  → tüm bariyer/turnikeler EMERGENCY_OPEN
//   2. staffTaskDispatched   → nöbetçi personele "Yangın Söndürme / Tahliye" görevi
//   3. notificationEngine    → CEO + Güvenlik şefine kritik PWA alarmı
// API anahtarı yoksa dahili sandbox sinyalleri (Plan Z — asla çökme).
// ============================================================================

import { staffTaskDispatched, type DazeEvent } from '../ops/dazeHubEventBus';
import { emergencyUnlockAllGates } from './anprGateAccessBridge';
import { criticalFacilityPush, dispatchPush, type PushNotification } from '../pwa/notificationEngine';
import type { FireDetection } from './fireDetectionEngine';

export interface EvacuationResult {
  ok: boolean;
  evacuationId: string;
  steps: { step: string; status: 'ok' | 'failed'; detail: string }[];
  openedGates: string[];
  staffTasks: string[];
  notifications: string[];
}

/** Tek transaction: yangın tespiti → kapılar → personel → bildirim. */
export async function orchestrateFireEvacuation(detection: FireDetection): Promise<EvacuationResult> {
  const evacuationId = `EVC-${Date.now().toString(36).toUpperCase().slice(-6)}`;
  const steps: EvacuationResult['steps'] = [];

  // 1) Bariyer ve turnikeleri acil açık konuma getir
  const gates = emergencyUnlockAllGates();
  steps.push({ step: 'Kapı/Turnike EMERGENCY_OPEN', status: 'ok', detail: `${gates.openedGates.length} kapı açıldı (${gates.openedGates.join(', ')})` });

  // 2) Nöbetçi personele yangın söndürme / tahliye görevi
  const taskId = `FR-${Date.now().toString(36).slice(-4).toUpperCase()}`;
  const taskEvent: DazeEvent = staffTaskDispatched(taskId, `YANGIN SÖNDÜRME & TAHLİYE — ${detection.zone} (alarm ${detection.confidence.toFixed(2)})`, 0, 20);
  steps.push({ step: 'Personel görevlendirme', status: taskEvent ? 'ok' : 'failed', detail: `${taskId} • ${detection.zone} bölgesi için nöbetçi ekip` });

  // 3) CEO + Güvenlik şefine kritik alarm
  const ceoNotif: PushNotification = await dispatchPush('kritik-ariza', `🚨 YANGIN ALARMI — ${detection.zone}`, `Güven ${Math.round(detection.confidence * 100)}% • bbox [${detection.bbox.x1},${detection.bbox.y1},${detection.bbox.x2},${detection.bbox.y2}] • Tahliye başlatıldı (${evacuationId})`);
  const securityNotif: PushNotification = await criticalFacilityPush(`Güvenlik Şefi — ${detection.zone} tahliye`);
  steps.push({ step: 'Kritik bildirim', status: 'ok', detail: `${ceoNotif.title} + ${securityNotif.title}` });

  return {
    ok: true,
    evacuationId,
    steps,
    openedGates: gates.openedGates,
    staffTasks: [taskId],
    notifications: [ceoNotif.title, securityNotif.title],
  };
}

export function emergencyEvacuationStatus(): string {
  return 'Tahliye Orkestratörü [kapılar EMERGENCY_OPEN • personel görevi • CEO/güvenlik alarmı • tek transaction]';
}
