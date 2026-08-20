// ============================================================================
// 🏢 KULÜP YÖNETİCİ MESAJ & BİLDİRİM ŞABLONLARI (Adım 14)
// Vars değişkenler: {athleteName} {courtNumber} {time} {coachName} {date}
// 4 şablon: Hava/kort iptali • Turnuva daveti • Tıbbi hatırlatma • Daze kuponu
// ============================================================================

export interface MessageVariables {
  athleteName?: string;
  courtNumber?: string;
  time?: string;
  coachName?: string;
  date?: string;
  clubName?: string;
  reward?: string;
  code?: string;
}

export type ClubTemplateKey = 'WEATHER_CANCEL' | 'TOURNAMENT_INVITE' | 'MEDICAL_REMINDER' | 'DAZE_VOUCHER';

export const CLUB_TEMPLATES: Record<ClubTemplateKey, { title: string; body: string; emoji: string }> = {
  WEATHER_CANCEL: {
    emoji: '🌧️',
    title: 'Kort İptali Bildirimi',
    body: 'Sayın {athleteName}, kötü hava koşulları nedeniyle {courtNumber} numaralı kort {time} itibarıyla kapatılmıştır. Antrenmanınız yeniden planlandı — {coachName} ile iletişime geçin.',
  },
  TOURNAMENT_INVITE: {
    emoji: '🏆',
    title: 'Turnuva Daveti & Program',
    body: '{athleteName}, {date} tarihinde başlayacak turnuvaya davetlisiniz! {time} kura çekimi yapılacak. Hazırlık için {coachName} ile görüşebilirsiniz.',
  },
  MEDICAL_REMINDER: {
    emoji: '🩺',
    title: 'Sezonluk Sağlık Kontrolü Hatırlatması',
    body: 'Sayın {athleteName}, sezonluk fiziksel kontrolünüz {date} tarihinde {time} saatinde yapılacaktır. Sporcu dosyanızın güncel kalması için katılımınız önemlidir.',
  },
  DAZE_VOUCHER: {
    emoji: '🎟️',
    title: 'Daze Ödül Kredisi Bildirimi',
    body: 'Tebrikler {athleteName}! {reward} ödülünüz hazır. Kodunuz: {code} — Daze Cafe\'de geçerlidir.',
  },
};

// ---------------------------------------------------------------------------
// 1. Şablon Doldurma — placeholder değişkenleri
// ---------------------------------------------------------------------------
export function renderClubTemplate(key: ClubTemplateKey, vars: MessageVariables = {}): { title: string; body: string } {
  const t = CLUB_TEMPLATES[key];
  const def: Record<string, string> = {
    '{athleteName}': vars.athleteName ?? 'Sporcu',
    '{courtNumber}': vars.courtNumber ?? 'A',
    '{time}': vars.time ?? '18:00',
    '{coachName}': vars.coachName ?? 'Antrenör',
    '{date}': vars.date ?? new Date().toLocaleDateString('tr-TR'),
    '{reward}': vars.reward ?? 'Smoothie',
    '{code}': vars.code ?? 'DAZE-XXXX',
  };
  let body = t.body;
  Object.entries(def).forEach(([k, v]) => { body = body.split(k).join(v); });
  return { title: t.title, body };
}

// ---------------------------------------------------------------------------
// 2. WhatsApp Paylaşımı + SMS metni
// ---------------------------------------------------------------------------
export function clubTemplateWhatsApp(key: ClubTemplateKey, vars?: MessageVariables): string {
  const r = renderClubTemplate(key, vars);
  return `https://wa.me/?text=${encodeURIComponent(`${CLUB_TEMPLATES[key].emoji} *${r.title}*\n\n${r.body}`)}`;
}

export function clubTemplateSms(key: ClubTemplateKey, vars?: MessageVariables): string {
  const r = renderClubTemplate(key, vars);
  return `${CLUB_TEMPLATES[key].emoji} ${r.title}: ${r.body}`;
}

export function clubMessageTemplatesStatus(): string {
  return `Kulüp Şablonları: ${Object.keys(CLUB_TEMPLATES).length} hazır • {değişken} yer tutucular • WA/SMS`;
}
