// ============================================================================
// 🔄 DAZE HUB EVENT BUS & STATE MOTORU (Faz: Daze Ekosistemi)
// Vision ➔ Chef ➔ Crew olay zinciri + LocalStorage state dağıtıcısı.
// ORDER_PLACED → KITCHEN_TIMER_TICK → STAFF_TASK_DISPATCHED →
// DAZE_REMINDER_TRIGGERED (2 dk aşımında termal koruma). Plan Z güvenli.
// ============================================================================

export type DazeEventType =
  | 'ORDER_PLACED'
  | 'KITCHEN_TIMER_TICK'
  | 'STAFF_TASK_DISPATCHED'
  | 'DAZE_REMINDER_TRIGGERED'
  | 'FIRE_EMERGENCY_TRIGGERED'
  | 'COURT_DELIVERY_PLACED'
  | 'DELIVERY_DISPATCHED'
  | 'GEOFENCE_EXIT'
  | 'GEOFENCE_ENTER';

export interface DazeEvent {
  type: DazeEventType;
  payload: Record<string, unknown>;
  timestamp: string;
  id: string;
}

type Listener = (event: DazeEvent) => void;

const LS_KEY = 'likya_daze_event_bus_v1';
let listeners: Record<DazeEventType, Listener[]> = {
  ORDER_PLACED: [],
  KITCHEN_TIMER_TICK: [],
  STAFF_TASK_DISPATCHED: [],
  DAZE_REMINDER_TRIGGERED: [],
  FIRE_EMERGENCY_TRIGGERED: [],
  COURT_DELIVERY_PLACED: [],
  DELIVERY_DISPATCHED: [],
  GEOFENCE_EXIT: [],
  GEOFENCE_ENTER: [],
};
let history: DazeEvent[] = [];

// LocalStorage'dan geçmişi yükle (SSR güvenli)
function loadHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    if (raw) history = JSON.parse(raw) as DazeEvent[];
  } catch { history = []; }
}
loadHistory();

export function subscribe(type: DazeEventType, fn: Listener): () => void {
  listeners[type].push(fn);
  return () => { listeners[type] = listeners[type].filter((l) => l !== fn); };
}

export function emit(type: DazeEventType, payload: Record<string, unknown>): DazeEvent {
  const event: DazeEvent = { type, payload, timestamp: new Date().toISOString(), id: `evt_${Date.now().toString(36)}` };
  history.push(event);
  try { if (typeof window !== 'undefined') window.localStorage.setItem(LS_KEY, JSON.stringify(history.slice(-40))); } catch { /* ignore */ }
  listeners[type].forEach((l) => l(event));
  return event;
}

export function eventHistory(type?: DazeEventType): DazeEvent[] {
  return type ? history.filter((e) => e.type === type) : history;
}

// ── HAZIR OLAY ÜRETİCİLERİ ──
export const orderPlaced = (orderId: string, item: string, amount: number) =>
  emit('ORDER_PLACED', { orderId, item, amount, source: 'daze-vision' });

export const kitchenTimerTick = (orderId: string, remainingSec: number) =>
  emit('KITCHEN_TIMER_TICK', { orderId, remainingSec, source: 'daze-chef' });

export const staffTaskDispatched = (taskId: string, staff: string, pay: number, perfPoints: number) =>
  emit('STAFF_TASK_DISPATCHED', { taskId, staff, pay, perfPoints, source: 'daze-crew' });

export const dazeReminderTriggered = (orderId: string, overdueMin: number, thermalGuard: boolean) =>
  emit('DAZE_REMINDER_TRIGGERED', { orderId, overdueMin, thermalGuard: overdueMin > 2 ? true : thermalGuard, source: 'daze-reminder' });

export const fireEmergencyTriggered = (zone: string, confidence: number, bbox: { x1: number; y1: number; x2: number; y2: number }) =>
  emit('FIRE_EMERGENCY_TRIGGERED', { zone, confidence, bbox, source: 'sentinel-vision', severity: 'critical' });

// ── DURUM PANOSU (UI için) ──
export interface DazeHubState {
  orders: { id: string; item: string; amount: number; status: string; remainingSec: number; overdueMin: number }[];
  tasks: { id: string; staff: string; pay: number; perfPoints: number }[];
  thermalGuards: number;
}

export function buildHubState(): DazeHubState {
  const orders: DazeHubState['orders'] = [];
  const tasks: DazeHubState['tasks'] = [];
  let thermalGuards = 0;

  history.forEach((e) => {
    if (e.type === 'ORDER_PLACED') orders.push({ id: String(e.payload.orderId), item: String(e.payload.item), amount: Number(e.payload.amount), status: 'alındı', remainingSec: 120, overdueMin: 0 });
    if (e.type === 'KITCHEN_TIMER_TICK') {
      const o = orders.find((x) => x.id === String(e.payload.orderId));
      if (o) { o.remainingSec = Number(e.payload.remainingSec); o.status = o.remainingSec <= 0 ? 'hazır' : 'mutfakta'; }
    }
    if (e.type === 'STAFF_TASK_DISPATCHED') tasks.push({ id: String(e.payload.taskId), staff: String(e.payload.staff), pay: Number(e.payload.pay), perfPoints: Number(e.payload.perfPoints) });
    if (e.type === 'DAZE_REMINDER_TRIGGERED') {
      const o = orders.find((x) => x.id === String(e.payload.orderId));
      if (o) { o.overdueMin = Number(e.payload.overdueMin); if (e.payload.thermalGuard) thermalGuards++; }
    }
  });

  return { orders: orders.slice(-8), tasks: tasks.slice(-8), thermalGuards };
}

export function dazeHubStatus(): string {
  const s = buildHubState();
  return `Daze Hub Bus [${history.length} olay • ${s.orders.length} sipariş • ${s.tasks.length} görev • ${s.thermalGuards} termal koruma]`;
}
