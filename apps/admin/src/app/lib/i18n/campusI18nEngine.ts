// ============================================================================
// 🌍 AŞAMA 19 — ÇOKLU DİL (i18n TR/EN/DE/RU) & ÇOKLU KAMPÜS VERİ ŞEMASI
// Dil çevirileri + birden fazla kampüs/şube bağlamı yönetimi.
// Deterministik; Plan Z güvenli — bilinmeyen anahtar/bağlam → fallback.
// ============================================================================

export type AppLocale = 'tr' | 'en' | 'de' | 'ru';
export type AppContextKey = 'kiosk' | 'checkout' | 'sports' | 'security' | 'finance' | 'common';

export interface Campus {
  id: string;
  name: string;
  city: string;
  timezone: string;
  currency: 'TRY' | 'EUR';
  locale: AppLocale;
}

const DICTIONARY: Record<AppContextKey, Record<AppLocale, Record<string, string>>> = {
  common: {
    tr: { order: 'Sipariş', pay: 'Öde', ready: 'Hazır', welcome: 'Hoş geldiniz', cancel: 'İptal' },
    en: { order: 'Order', pay: 'Pay', ready: 'Ready', welcome: 'Welcome', cancel: 'Cancel' },
    de: { order: 'Bestellung', pay: 'Bezahlen', ready: 'Fertig', welcome: 'Willkommen', cancel: 'Abbrechen' },
    ru: { order: 'Заказ', pay: 'Оплатить', ready: 'Готово', welcome: 'Добро пожаловать', cancel: 'Отмена' },
  },
  kiosk: {
    tr: { title: 'Kiosk Menü', scan: 'QR ile Öde', ticket: 'Fiş' },
    en: { title: 'Kiosk Menu', scan: 'Pay by QR', ticket: 'Receipt' },
    de: { title: 'Kiosk Menü', scan: 'Mit QR zahlen', ticket: 'Quittung' },
    ru: { title: 'Меню киоска', scan: 'Оплата по QR', ticket: 'Чек' },
  },
  checkout: {
    tr: { deposit: 'Depozito', tbyb: 'Deneme Ödemesi', success: 'Ödeme Başarılı' },
    en: { deposit: 'Deposit', tbyb: 'Trial Payment', success: 'Payment Successful' },
    de: { deposit: 'Kaution', tbyb: 'Probezahlung', success: 'Zahlung erfolgreich' },
    ru: { deposit: 'Депозит', tbyb: 'Пробный платёж', success: 'Платёж успешен' },
  },
  sports: {
    tr: { sprint: 'Sprint', shot: 'Şut', balance: 'Denge' },
    en: { sprint: 'Sprint', shot: 'Shot', balance: 'Balance' },
    de: { sprint: 'Sprint', shot: 'Wurf', balance: 'Balance' },
    ru: { sprint: 'Спринт', shot: 'Бросок', balance: 'Баланс' },
  },
  security: {
    tr: { denied: 'Erişim Reddedildi', allowed: 'Erişim İzni', scan: 'Tarama' },
    en: { denied: 'Access Denied', allowed: 'Access Allowed', scan: 'Scan' },
    de: { denied: 'Zugriff verweigert', allowed: 'Zugriff erlaubt', scan: 'Scannen' },
    ru: { denied: 'Доступ запрещён', allowed: 'Доступ разрешён', scan: 'Сканировать' },
  },
  finance: {
    tr: { balance: 'Bakiye', pnl: 'Net PnL', receipt: 'Fiş' },
    en: { balance: 'Balance', pnl: 'Net PnL', receipt: 'Receipt' },
    de: { balance: 'Saldo', pnl: 'Netto PnL', receipt: 'Quittung' },
    ru: { balance: 'Баланс', pnl: 'Чистый PnL', receipt: 'Чек' },
  },
};

export class CampusI18nEngine {
  private campuses: Campus[] = [];
  private activeCampusId = 'likya-kas';

  constructor() {
    this.campuses = [
      { id: 'likya-kas', name: 'Likya Kampüsü Kaş', city: 'Antalya', timezone: 'Europe/Istanbul', currency: 'TRY', locale: 'tr' },
      { id: 'likya-fethiye', name: 'Likya Kampüsü Fethiye', city: 'Muğla', timezone: 'Europe/Istanbul', currency: 'TRY', locale: 'tr' },
    ];
  }

  setActiveCampus(id: string): boolean {
    if (this.campuses.some((c) => c.id === id)) { this.activeCampusId = id; return true; }
    return false;
  }

  activeCampus(): Campus {
    return this.campuses.find((c) => c.id === this.activeCampusId) ?? this.campuses[0];
  }

  registerCampus(campus: Campus): void {
    if (!this.campuses.some((c) => c.id === campus.id)) this.campuses.push(campus);
  }

  /** Aktif kampüsün lokaline göre çeviri (fallback: tr → anahtar). */
  t(context: AppContextKey, key: string, localeOverride?: AppLocale): string {
    const locale = localeOverride ?? this.activeCampus().locale;
    const dict = DICTIONARY[context]?.[locale];
    if (dict && dict[key]) return dict[key];
    const tr = DICTIONARY[context]?.tr;
    return tr?.[key] ?? key;
  }

  /** Kampüs listesi + her kampüsün para birimi (çoklu şube yönetimi). */
  campusList(): { id: string; name: string; city: string; currency: Campus['currency'] }[] {
    return this.campuses.map((c) => ({ id: c.id, name: c.name, city: c.city, currency: c.currency }));
  }
}

export function campusI18nEngineStatus(): string {
  return 'i18n & Kampüs Motoru [TR/EN/DE/RU • 6 bağlam • çoklu kampüs/para birimi]';
}
