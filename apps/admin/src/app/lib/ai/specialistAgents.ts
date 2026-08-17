// ============================================================================
// 👥 AGENCY-AGENTS UZMAN ROL DAĞILIMI
// Genel model yanıtı yerine göreve göre uzman ajan çağıran yönlendirici:
// SupportAgent • BookingAgent • ScoutingAgent • OpsSentinel.
// Deterministik; Plan Z güvenli. Kırılmasız.
// ============================================================================

import { createBooking } from './bookingAgent';

export type SpecialistAgentId = 'support' | 'booking' | 'scouting' | 'ops';

export interface SpecialistAgent {
  id: SpecialistAgentId;
  name: string;
  emoji: string;
  expertise: string;
  handle: (task: string) => string;
}

// Uzman ajanlar
export const SPECIALIST_AGENTS: SpecialistAgent[] = [
  {
    id: 'support',
    name: 'SupportAgent',
    emoji: '🛎️',
    expertise: 'Misafir & Chatwoot iletişimi',
    handle: (t) => `🛎️ SupportAgent: "${t.slice(0, 50)}" → müşteri destek biletine dönüştürüldü; nezaket filtresi uygulandı, 5 dk içinde yanıt hedeflenir.`,
  },
  {
    id: 'booking',
    name: 'BookingAgent',
    emoji: '🏨',
    expertise: 'Tesis & Konaklama satışı',
    handle: (t) => {
      const r = createBooking(t);
      return `🏨 BookingAgent: ${r.message}`;
    },
  },
  {
    id: 'scouting',
    name: 'ScoutingAgent',
    emoji: '🎯',
    expertise: 'Sporcu performans & transfer',
    handle: (t) => `🎯 ScoutingAgent: "${t.slice(0, 50)}" → biyomekanik kartlar taranıyor; 85+ skor adaylar transfer listesine alınır.`,
  },
  {
    id: 'ops',
    name: 'OpsSentinel',
    emoji: '🔋',
    expertise: 'Enerji & IoT izleme',
    handle: (t) => `🔋 OpsSentinel: "${t.slice(0, 50)}" → IoT sensörleri ve enerji tüketimi izleniyor; anomali tespit edilirse bakım bileti açılır.`,
  },
];

// Görevi uzman ajana yönlendir (deterministik keyword)
export function routeToSpecialist(task: string): SpecialistAgent {
  const lower = task.toLowerCase();
  if (/(rezerv|kayıt|konaklama|karavan|glamping|çadır|padel|tenis|slot|saat|kişi)/.test(lower)) {
    return SPECIALIST_AGENTS.find((a) => a.id === 'booking')!;
  }
  if (/(sporcu|performans|transfer|scout|oyuncu|antrenman|gol|maç)/.test(lower)) {
    return SPECIALIST_AGENTS.find((a) => a.id === 'scouting')!;
  }
  if (/(enerji|iot|sensör|bakım|elektrik|ısıtma|arıza|turnike)/.test(lower)) {
    return SPECIALIST_AGENTS.find((a) => a.id === 'ops')!;
  }
  // varsayılan: destek (misafir iletişimi)
  return SPECIALIST_AGENTS.find((a) => a.id === 'support')!;
}

// Yönlendir + icra et
export function dispatchSpecialist(task: string): { agent: SpecialistAgent; output: string } {
  const agent = routeToSpecialist(task);
  return { agent, output: agent.handle(task) };
}

export function specialistMeshStatus(): string {
  return `Agency-Agents [${SPECIALIST_AGENTS.length} uzman • Support/Booking/Scouting/Ops • rol yönlendirme]`;
}
