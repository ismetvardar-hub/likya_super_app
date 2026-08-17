// ============================================================================
// ⚡ BOLT.DIY MİNİ-APP MOTORU — tarayıcı içi kod üretimi
// "Bana X uygulamasını kodla" → anında çalışan React bileşen şablonu + önizleme
// verisi. Deterministik şablon motoru; Plan Z güvenli. Kırılmasız.
// ============================================================================

export type AppTemplateKind = 'dashboard' | 'form' | 'list' | 'market' | 'booking' | 'scoreboard';

export interface BoltAppSpec {
  id: string;
  kind: AppTemplateKind;
  title: string;
  description: string;
  code: string;          // React bileşen kodu (önizleme için)
  previewData: string[]; // önizleme satırları
  simulated: boolean;
}

const KIND_TEMPLATE: Record<AppTemplateKind, { icon: string; detect: RegExp[] }> = {
  dashboard: { icon: '📊', detect: [/panel/, /gösterge/, /durum/] },
  form: { icon: '📝', detect: [/form/, /kayıt/, /başvur/] },
  list: { icon: '📋', detect: [/liste/, /katalog/, /takip/] },
  market: { icon: '🛒', detect: [/pazar/, /sat/, /mağaza/, /ürün/] },
  booking: { icon: '📅', detect: [/rezerv/, /randevu/, /slot/] },
  scoreboard: { icon: '🏆', detect: [/skor/, /maç/, /lig/, /puan/] },
};

// İstekten uygulama türü tespiti (deterministik)
export function detectAppKind(prompt: string): AppTemplateKind {
  const lower = prompt.toLowerCase();
  for (const kind of Object.keys(KIND_TEMPLATE) as AppTemplateKind[]) {
    if (KIND_TEMPLATE[kind].detect.some((re) => re.test(lower))) return kind;
  }
  return 'dashboard';
}

// React bileşen kodu üret (kırılmasız şablon — önizlemede sanal çalışır)
export function generateApp(prompt: string): BoltAppSpec {
  const kind = detectAppKind(prompt);
  const meta = KIND_TEMPLATE[kind];
  const title = prompt.replace(/bana .* (uygulaması|uygulama|app|ekran).*/i, '').trim() || `${meta.icon} ${kind} Mini-App`;
  const safeName = 'BoltMiniApp';
  const previewData = [
    `${meta.icon} "${prompt.slice(0, 60)}" talebinden üretildi`,
    `Tür: ${kind} · şablon: bolt.diy mimarisi`,
    'Önizleme: bileşen render edildi (client-side)',
  ];

  const code = `// ⚡ ${safeName} — bolt.diy tarzı üretilen bileşen (${kind})
'use client';
export default function ${safeName}() {
  const items = ${JSON.stringify(previewData)};
  return (
    <div style={{ padding: 12, borderRadius: 12, background: 'rgba(0,242,254,0.06)', border: '1px solid rgba(0,242,254,0.3)' }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>${meta.icon} ${title}</div>
      {items.map((it) => <div key={it} style={{ fontSize: 11, color: '#cbd5e1', padding: '4px 0' }}>{it}</div>)}
    </div>
  );
}`;

  return { id: `bolt_${Date.now().toString(36)}`, kind, title, description: `"${prompt.slice(0, 60)}" talebinden bolt.diy motoruyla üretildi.`, code, previewData, simulated: true };
}

export function boltEngineStatus(): string {
  return `Bolt Engine [6 uygulama şablonu • talep→React kodu→önizleme • deterministik]`;
}
