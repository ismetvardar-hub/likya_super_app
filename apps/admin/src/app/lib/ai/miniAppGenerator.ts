// ============================================================================
// 🧩 DİNAMİK MİNİ-APP ÜRETİCİ STUB (Emergent Model)
// Kullanıcı isteğinden mini-app şablonu üretir (emergent davranış stub'ı):
// deterministik şablon seçimi → işlevsel mini-app yapısı. Plan Z güvenli.
// ============================================================================

export type MiniAppKind = 'dashboard' | 'form' | 'list' | 'chart' | 'chat' | 'market' | 'ticket';

export interface MiniAppSpec {
  name: string;
  kind: MiniAppKind;
  description: string;
  fields?: string[];
  actions?: string[];
  dataSource: string;
  simulated: boolean;
}

const KIND_DETECT: Record<MiniAppKind, RegExp[]> = {
  dashboard: [/panel/, /gösterge/, /kontrol/],
  form: [/kayıt/, /form/, /doldur/, /başvur/],
  list: [/liste/, /katalog/, /envanter/],
  chart: [/grafik/, /rapor/, /analiz/],
  chat: [/sohbet/, /mesaj/, /destek/],
  market: [/sat/, /ürün/, /mağaza/, /kiralama/],
  ticket: [/bilet/, /rezervasyon/, /etkinlik/],
};

// İstekten mini-app türü tespit et (deterministik)
export function detectMiniAppKind(prompt: string): MiniAppKind {
  const lower = prompt.toLowerCase();
  for (const kind of Object.keys(KIND_DETECT) as MiniAppKind[]) {
    if (KIND_DETECT[kind].some((re) => re.test(lower))) return kind;
  }
  return 'dashboard';
}

// Mini-app spec üret (emergent stub)
export function generateMiniApp(prompt: string): MiniAppSpec {
  const kind = detectMiniAppKind(prompt);
  const base: Record<MiniAppKind, Partial<MiniAppSpec>> = {
    dashboard: { fields: ['KPI kartları'], actions: ['Yenile', 'Dışa aktar'] },
    form: { fields: ['Ad', 'Telefon', 'Tercih'], actions: ['Kaydet'] },
    list: { fields: ['Başlık', 'Durum'], actions: ['Filtrele'] },
    chart: { fields: ['Zaman aralığı'], actions: ['Çiz'] },
    chat: { fields: ['Mesaj'], actions: ['Gönder'] },
    market: { fields: ['Ürün', 'Fiyat'], actions: ['Satın Al'] },
    ticket: { fields: ['Tarih', 'Adet'], actions: ['Rezerve Et'] },
  };
  return {
    name: `${kind.charAt(0).toUpperCase() + kind.slice(1)} Mini-App`,
    kind,
    description: `"${prompt.slice(0, 60)}" talebinden emergent mini-app üretildi.`,
    ...base[kind],
    dataSource: 'localStorage + Plan Z deterministik veri',
    simulated: true,
  };
}

export function miniAppStatus(): string {
  return `Mini-App Üretici [emergent stub • 7 tür tespiti • Plan Z veri]`;
}
