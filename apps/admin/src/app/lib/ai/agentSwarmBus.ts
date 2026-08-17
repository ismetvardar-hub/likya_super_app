// ============================================================================
// 🤖 ÇOKLU AJAN MESAJLAŞMA VERİ YOLU (Agent Swarm Bus)
// Publish/Subscribe kanal yönlendirme — ajanlar arası mesaj iletimi.
// Deterministik; Plan Z güvenli. Kırılmasız.
// ============================================================================

export interface SwarmMessage {
  id: string;
  from: string;
  to?: string;        // boşsa broadcast
  channel: string;
  payload: Record<string, unknown>;
  timestamp: string;
}

export type SwarmListener = (msg: SwarmMessage) => void;

interface SwarmState {
  messages: SwarmMessage[];
  listeners: Record<string, SwarmListener[]>;
}

let swarm: SwarmState = { messages: [], listeners: {} };

// Ajans kaydı / kanal aboneliği
export function subscribe(channel: string, listener: SwarmListener): () => void {
  swarm.listeners[channel] = swarm.listeners[channel] ?? [];
  swarm.listeners[channel].push(listener);
  return () => {
    swarm.listeners[channel] = (swarm.listeners[channel] ?? []).filter((l) => l !== listener);
  };
}

// Mesaj yayınla — hedef kanal abonelerine iletilir
export function publish(channel: string, from: string, payload: Record<string, unknown>, to?: string): SwarmMessage {
  const msg: SwarmMessage = {
    id: `swarm_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e4)}`,
    from,
    to,
    channel,
    payload,
    timestamp: new Date().toISOString(),
  };
  swarm.messages.push(msg);
  (swarm.listeners[channel] ?? []).forEach((l) => l(msg));
  return msg;
}

// Kanal geçmişi (UI için)
export function channelHistory(channel: string, limit = 20): SwarmMessage[] {
  return swarm.messages.filter((m) => m.channel === channel).slice(-limit);
}

export function resetSwarm(): void {
  swarm = { messages: [], listeners: {} };
}

// Plan Z: mesaj akışı her zaman çalışır (hafızada)
export function agentSwarmStatus(): string {
  return `Agent Swarm Bus [${Object.keys(swarm.listeners).length} kanal • ${swarm.messages.length} mesaj • publish/subscribe]`;
}
