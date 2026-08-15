// ============================================================================
// ⚡ LİKYA ASENKRON EVENT BUS — Non-blocking olay kuyruğu
// Örnek akış: Maç bitişi ➔ Daze Chef içecek emri + Veli WhatsApp raporu
// + arka plan loglama. emit() asla çağıranı bloklamaz; olaylar mikro-görev
// kuyruğunda FIFO sırayla, her biri kendi try/catch'iyle işlenir.
// ============================================================================

export type EventHandler<T = unknown> = (payload: T) => void | Promise<void>;

export interface Unsubscribe {
  (): void;
}

export interface EventBus {
  on<T>(event: string, handler: EventHandler<T>): Unsubscribe;
  once<T>(event: string, handler: EventHandler<T>): Unsubscribe;
  emit<T>(event: string, payload: T): void;
  removeAllListeners(event?: string): void;
  listenerCount(event: string): number;
  drain(): Promise<void>;   // bekleyen kuyruğu boşalt (testler için)
}

interface HandlerEntry {
  id: number;
  handler: EventHandler<unknown>;
  once: boolean;
}

export function createEventBus(): EventBus {
  const listeners = new Map<string, HandlerEntry[]>();
  const queue: { event: string; payload: unknown }[] = [];
  let draining = false;
  let nextId = 1;

  const scheduleDrain = () => {
    if (draining) return;
    draining = true;
    // Mikro-görevde kuyruğu boşalt — çağıran asla bloklanmaz
    Promise.resolve().then(async () => {
      while (queue.length > 0) {
        const item = queue.shift();
        if (!item) continue;
        const entries = (listeners.get(item.event) ?? []).slice();
        for (const entry of entries) {
          try {
            await entry.handler(item.payload);
          } catch (err) {
            // Tek olaydaki hata diğerlerini asla etkilemez (arka plan log)
            console.error(`[EventBus] "${item.event}" işleyici hatası:`, err instanceof Error ? err.message : err);
          }
          if (entry.once) {
            const current = listeners.get(item.event);
            if (current) listeners.set(item.event, current.filter((e) => e.id !== entry.id));
          }
        }
      }
      draining = false;
    });
  };

  return {
    on<T>(event: string, handler: EventHandler<T>): Unsubscribe {
      const id = nextId++;
      const entry: HandlerEntry = { id, handler: handler as EventHandler<unknown>, once: false };
      listeners.set(event, [...(listeners.get(event) ?? []), entry]);
      return () => {
        const current = listeners.get(event);
        if (current) listeners.set(event, current.filter((e) => e.id !== id));
      };
    },
    once<T>(event: string, handler: EventHandler<T>): Unsubscribe {
      const id = nextId++;
      const entry: HandlerEntry = { id, handler: handler as EventHandler<unknown>, once: true };
      listeners.set(event, [...(listeners.get(event) ?? []), entry]);
      return () => {
        const current = listeners.get(event);
        if (current) listeners.set(event, current.filter((e) => e.id !== id));
      };
    },
    emit<T>(event: string, payload: T): void {
      queue.push({ event, payload });
      scheduleDrain();
    },
    removeAllListeners(event?: string): void {
      if (event) listeners.delete(event);
      else listeners.clear();
    },
    listenerCount(event: string): number {
      return (listeners.get(event) ?? []).length;
    },
    async drain(): Promise<void> {
      while (queue.length > 0) {
        await Promise.resolve();
      }
    },
  };
}

// ----------------------------------------------------------------------------
// DAZE OTONOM İŞ AKIŞLARI — Maç bitişi → Chef + WhatsApp + Log
// ----------------------------------------------------------------------------
export interface MatchFinishedEvent {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  homeScore: number;
  awayScore: number;
  attendance: number;
  temperatureC: number;
}

export interface ChefOrder {
  orderId: string;
  item: string;
  qty: number;
  target: 'Daze Mutfak';
  note: string;
}

export interface ParentReport {
  phone: string;
  message: string;
}

// 1) Daze Chef içecek emri (skor+katılım bazlı deterministik)
export function chefDrinkOrderFor(match: MatchFinishedEvent): ChefOrder {
  const baseQty = Math.ceil(match.attendance / 12);
  const hot = match.temperatureC < 18;
  return {
    orderId: `CHEF-${match.matchId}`,
    item: hot ? 'Sıcak Çay & Limonata' : 'Soğuk Limonata & Meyve Suyu',
    qty: baseQty,
    target: 'Daze Mutfak',
    note: `${match.homeTeam} ${match.homeScore}-${match.awayScore} ${match.awayTeam} sonrası ${hot ? 'sıcak' : 'soğuk'} ikram — ${match.attendance} seyirci`,
  };
}

// 2) Veli WhatsApp raporu (içerik şablonu)
export function parentReportFor(match: MatchFinishedEvent, athleteName: string, phone: string): ParentReport {
  return {
    phone,
    message: `📋 Likya Rapor: ${athleteName} — ${match.homeTeam} ${match.homeScore}-${match.awayScore} ${match.awayTeam} maçı tamamlandı. Katılım ${match.attendance}. Detaylı klip satışı için Medya Kasası uygulamasını kullanın.`,
  };
}

// 3) Arka plan loglama
export function backgroundLog(event: string, payload: unknown): Promise<void> {
  return Promise.resolve().then(() => {
    console.log(`[EventBus/Log] ${new Date().toISOString()} — ${event}`, JSON.stringify(payload).slice(0, 200));
  });
}

// Demo: bus'a üç iş akışını kaydet ve maç bitişini tetikle
export function setupDazeWorkflows(bus: EventBus, athleteName: string, parentPhone: string) {
  bus.on<MatchFinishedEvent>('match.finished', (m) => {
    void backgroundLog('match.finished', m);
  });
  bus.on<MatchFinishedEvent>('match.finished', (m) => {
    void Promise.resolve(chefDrinkOrderFor(m)).then((order) => backgroundLog('chef.order', order));
  });
  bus.on<MatchFinishedEvent>('match.finished', (m) => {
    const report = parentReportFor(m, athleteName, parentPhone);
    void backgroundLog('parent.whatsapp', report);
  });
}

export function triggerMatchFinished(bus: EventBus, match: MatchFinishedEvent): void {
  bus.emit('match.finished', match);
}

