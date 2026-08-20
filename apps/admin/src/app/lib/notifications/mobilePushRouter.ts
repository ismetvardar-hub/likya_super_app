// ============================================================================
// 📲 APNS & FCM MOBİL PUSH ALERT YÖNLENDİRİCİ (Adım 143)
// Akıllı mobil bildirim dağıtıcı: INJURY_RISK_ALERT / TRAINING_REMINDER /
// NEW_PB_BADGE / COURT_CHANGE / WEATHER_CANCELLATION kategorileri. Veli sessiz
// saatleri (22:00-07:00, kritik olmayan bildirimler bastırılır). Profil tercihine
// göre çok dilli push payload'ları (TR, EN, DE, FR). Saf/deterministik.
// ============================================================================

export type PushCategory = 'INJURY_RISK_ALERT' | 'TRAINING_REMINDER' | 'NEW_PB_BADGE' | 'COURT_CHANGE' | 'WEATHER_CANCELLATION';
export type PushLocale = 'TR' | 'EN' | 'DE' | 'FR';
export type PushPlatform = 'APNS' | 'FCM';
export type DeviceOs = 'ios' | 'android';

export const CATEGORY_CRITICAL: Record<PushCategory, boolean> = {
  INJURY_RISK_ALERT: true,   // kritik — sessiz saatlerde de iletilir
  TRAINING_REMINDER: false,
  NEW_PB_BADGE: false,
  COURT_CHANGE: false,
  WEATHER_CANCELLATION: false,
};

export const QUIET_HOUR_START = 22;
export const QUIET_HOUR_END = 7;

export function isQuietHour(now: Date, startHour = QUIET_HOUR_START, endHour = QUIET_HOUR_END): boolean {
  const hour = now.getHours();
  return hour >= startHour || hour < endHour; // 22:00 → 07:00 (gece yarısını aşar)
}

export function shouldDeliver(category: PushCategory, now: Date, quietHoursEnabled = true): boolean {
  if (!quietHoursEnabled) return true;
  if (CATEGORY_CRITICAL[category]) return true;
  return !isQuietHour(now);
}

export function pushPlatform(os: DeviceOs): PushPlatform {
  return os === 'ios' ? 'APNS' : 'FCM';
}

// ── Çok dilli mesaj tablosu ──────────────────────────────────────────────────
export interface LocalizedPush {
  title: string;
  body: string;
}

const MESSAGES: Record<PushCategory, Record<PushLocale, LocalizedPush>> = {
  INJURY_RISK_ALERT: {
    TR: { title: '⚠️ Sakatlık Riski', body: 'Yüksek sakatlık riski tespit edildi — seansı kısalt' },
    EN: { title: '⚠️ Injury Risk', body: 'Elevated injury risk detected — shorten the session' },
    DE: { title: '⚠️ Verletzungsrisiko', body: 'Erhöhtes Verletzungsrisiko erkannt — Training kürzen' },
    FR: { title: '⚠️ Risque de blessure', body: 'Risque de blessure élevé — écourter la séance' },
  },
  TRAINING_REMINDER: {
    TR: { title: '🏋️ Antrenman Hatırlatması', body: 'Bugünkü seans 30 dk sonra başlıyor' },
    EN: { title: '🏋️ Training Reminder', body: 'Your session starts in 30 minutes' },
    DE: { title: '🏋️ Trainingserinnerung', body: 'Deine Einheit beginnt in 30 Minuten' },
    FR: { title: '🏋️ Rappel d’entraînement', body: 'Votre séance commence dans 30 min' },
  },
  NEW_PB_BADGE: {
    TR: { title: '🏅 Yeni Rekor!', body: 'Tebrikler — yeni kişisel rekor kırdın' },
    EN: { title: '🏅 New PB!', body: 'Congratulations — new personal best achieved' },
    DE: { title: '🏅 Neuer Rekord!', body: 'Glückwunsch — neue persönliche Bestleistung' },
    FR: { title: '🏅 Nouveau record !', body: 'Félicitations — nouveau record personnel' },
  },
  COURT_CHANGE: {
    TR: { title: '🎾 Kort Değişikliği', body: 'Seansınız Kort 3\u00a0→ Kort 5 olarak güncellendi' },
    EN: { title: '🎾 Court Change', body: 'Your session moved from Court 3 to Court 5' },
    DE: { title: '🎾 Platzwechsel', body: 'Ihre Einheit: Platz 3 → Platz 5' },
    FR: { title: '🎾 Changement de terrain', body: 'Votre séance passe du terrain 3 au 5' },
  },
  WEATHER_CANCELLATION: {
    TR: { title: '🌦️ Seans İptali', body: 'Hava koşulları nedeniyle seans iptal edildi' },
    EN: { title: '🌦️ Session Cancelled', body: 'Session cancelled due to weather conditions' },
    DE: { title: '🌦️ Einheit abgesagt', body: 'Einheit wegen Wetter abgesagt' },
    FR: { title: '🌦️ Séance annulée', body: 'Séance annulée en raison de la météo' },
  },
};

export function localizeMessage(category: PushCategory, locale: PushLocale): LocalizedPush {
  return MESSAGES[category][locale];
}

export interface PushPayload {
  platform: PushPlatform;
  title: string;
  body: string;
  data: Record<string, string | number | boolean>;
  locale: PushLocale;
  category: PushCategory;
}

export function buildPushPayload(category: PushCategory, locale: PushLocale, os: DeviceOs, data: Record<string, string | number | boolean> = {}): PushPayload {
  const { title, body } = localizeMessage(category, locale);
  return {
    platform: pushPlatform(os),
    title,
    body,
    data: { category, ...data },
    locale,
    category,
  };
}

export function mobilePushStatus(): string {
  return `Push Router: ${Object.keys(CATEGORY_CRITICAL).length} kategori • sessiz saat ${QUIET_HOUR_START}:00-0${QUIET_HOUR_END}:00 • TR/EN/DE/FR`;
}
