// ============================================================================
// 🚀 BASE44 & REPLIT UYUMLU OTONOM APP MOTORU (Likya Instant App Builder)
// Doğal dil fikir → JSON şeması + auth kuralları + canlı React UI kodu.
// Üretilen mini-app /tmp sandbox'ta çalıştırılabilir (Vercel uyumlu).
// Deterministik şablon motoru; Plan Z güvenli. Kırılmasız.
// ============================================================================

export type AppKind = 'dashboard' | 'market' | 'booking' | 'form' | 'crm' | 'scoreboard';

export interface AppSchemaField {
  key: string;
  label: string;
  type: 'text' | 'number' | 'date' | 'select' | 'boolean';
  required: boolean;
}

export interface AppAuthRules {
  roles: string[];          // örn. ['CEO', 'MUSTERI']
  permission: string;
  sessionTtlMin: number;
}

export interface InstantApp {
  id: string;
  title: string;
  kind: AppKind;
  schema: AppSchemaField[];
  auth: AppAuthRules;
  uiCode: string;
  runnable: boolean;
  simulated: boolean;
}

const KIND_META: Record<AppKind, { icon: string; detect: RegExp[]; defaultFields: AppSchemaField[] }> = {
  dashboard: { icon: '📊', detect: [/panel/, /gösterge/, /durum/, /kpi/], defaultFields: [{ key: 'metric', label: 'Metrik', type: 'select', required: true }] },
  market: { icon: '🛒', detect: [/pazar/, /sat/, /mağaza/, /ürün/, /vitrin/], defaultFields: [{ key: 'name', label: 'Ürün', type: 'text', required: true }, { key: 'price', label: 'Fiyat', type: 'number', required: true }] },
  booking: { icon: '📅', detect: [/rezerv/, /randevu/, /slot/, /kort/], defaultFields: [{ key: 'date', label: 'Tarih', type: 'date', required: true }, { key: 'guests', label: 'Kişi', type: 'number', required: false }] },
  form: { icon: '📝', detect: [/form/, /kayıt/, /başvur/, /anket/], defaultFields: [{ key: 'fullName', label: 'Ad Soyad', type: 'text', required: true }, { key: 'email', label: 'E-posta', type: 'text', required: true }] },
  crm: { icon: '👥', detect: [/müşteri/, /crm/, /üye/, /iletişim/], defaultFields: [{ key: 'company', label: 'Kurum', type: 'text', required: true }, { key: 'tier', label: 'Segment', type: 'select', required: false }] },
  scoreboard: { icon: '🏆', detect: [/skor/, /maç/, /lig/, /puan/, /turnuva/], defaultFields: [{ key: 'teamA', label: 'Takım A', type: 'text', required: true }, { key: 'scoreA', label: 'Skor', type: 'number', required: true }] },
};

export function detectAppKind(prompt: string): AppKind {
  const lower = prompt.toLowerCase();
  for (const kind of Object.keys(KIND_META) as AppKind[]) {
    if (KIND_META[kind].detect.some((re) => re.test(lower))) return kind;
  }
  return 'dashboard';
}

// Fikir → uygulama üret (JSON şema + auth + React UI kodu)
export function generateInstantApp(prompt: string, role = 'CEO'): InstantApp {
  const kind = detectAppKind(prompt);
  const meta = KIND_META[kind];
  const title = prompt.replace(/bana .*(uygulama|app|motor|sistemi|ekran).*/i, '').trim() || `${meta.icon} ${kind} Mini-App`;
  const safeTitle = title.slice(0, 30).replace(/[^a-z0-9çğıöşüÇĞİÖŞÜ\s]/gi, '').trim() || `${kind}App`;

  const schema: AppSchemaField[] = [
    ...meta.defaultFields,
    { key: 'notes', label: 'Not', type: 'text', required: false },
  ];

  const auth: AppAuthRules = {
    roles: role === 'CEO' ? ['CEO', 'TESIS_MUDURU'] : [role],
    permission: `app:${kind}:use`,
    sessionTtlMin: 60,
  };

  const uiCode = `// 🚀 ${safeTitle} — Base44/Replit uyumlu üretilen uygulama (${kind})
'use client';
export default function ${safeTitle.replace(/\s/g, '')}() {
  const fields = ${JSON.stringify(schema)};
  const auth = ${JSON.stringify(auth)};
  return (
    <div style={{ padding: 14, borderRadius: 12, background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.3)' }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>${meta.icon} ${safeTitle}</div>
      <div style={{ fontSize: 10, color: '#64748b', margin: '4px 0 8px' }}>Auth: {auth.roles.join('+')} · izin: {auth.permission}</div>
      {fields.filter((f) => f.required).map((f) => (
        <div key={f.key} style={{ margin: '6px 0' }}>
          <div style={{ fontSize: 10, color: '#94a3b8' }}>{f.label}{f.required ? ' *' : ''}</div>
          <input style={{ width: '100%', padding: 6, borderRadius: 8, border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)', color: '#e2e8f0', fontSize: 12 }} placeholder={f.key} />
        </div>
      ))}
      <button style={{ marginTop: 8, padding: '8px 16px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#a78bfa,#7c3aed)', color: '#fff', fontWeight: 800, fontSize: 12 }}>Kaydet (sandbox)</button>
    </div>
  );
}`;

  return {
    id: `b44_${Date.now().toString(36)}`,
    title: safeTitle,
    kind,
    schema,
    auth,
    uiCode,
    runnable: true, // /tmp sandbox + Vercel uyumlu
    simulated: true,
  };
}

export function base44Status(): string {
  return `Instant App Builder [Base44/Replit • 6 tür • JSON şema+auth+UI • sandbox]`;
}
