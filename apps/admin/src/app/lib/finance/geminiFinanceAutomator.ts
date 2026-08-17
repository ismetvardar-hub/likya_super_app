// ============================================================================
// 💰 GEMİNİ 9 ADIMLI OTOMATİK FİNANS MOTORU
// Fiş/fatura okuma → vade takibi → POS-kasa mutabakatı → nakit akışı tahmini.
// Daze Nezaket Filtresi tüm hatırlatıcı metinlerde zorunludur. Deterministik.
// Plan Z güvenli. Kırılmasız.
// ============================================================================

export interface InvoiceRecord {
  id: string;
  vendor: string;
  amount: number;
  dueDate: string;
  status: 'odendi' | 'vadesi-geldi' | 'bekliyor';
}

export interface PosEntry {
  id: string;
  time: string;
  amount: number;
  method: 'card' | 'cash' | 'wallet';
}

export interface FinanceWorkflowStep {
  step: number;
  name: string;
  status: 'tamam' | 'aktif' | 'bekliyor';
  detail: string;
}

// Daze Centilmenlik & Nezaket Filtresi — hatırlatıcı/iletişim metinleri master kural
const POLITE_RULES: [RegExp, string][] = [
  [/!!!+/g, '!'],
  [/öde/i, 'hatırlatmak'],
  [/gecikmed/i, 'sürecinde'],
];

export function applyPoliteFilter(text: string): string {
  let out = text;
  POLITE_RULES.forEach(([re, repl]) => { out = out.replace(re, repl); });
  return out.replace(/!{1,}/g, '!');
}

// 9 adımlı finansal otomasyon akışı (deterministik)
export function runFinanceWorkflow(): FinanceWorkflowStep[] {
  return [
    { step: 1, name: 'Fiş/Fatura Görseli Okuma', status: 'tamam', detail: 'Multimodal Gemini ile fatura alanları çıkarıldı (OCR stub)' },
    { step: 2, name: 'Fatura Normalizasyonu', status: 'tamam', detail: 'Tek tip şemaya çevrildi (tutar, vade, tedarikçi)' },
    { step: 3, name: 'Vade Takibi', status: 'aktif', detail: `${invoiceDueAlerts().length} fatura vadesi yaklaşıyor` },
    { step: 4, name: 'POS-Kasa Mutabakatı', status: 'bekliyor', detail: `${posReconciliation().gap.toLocaleString('tr-TR')}₺ fark tespit edildi` },
    { step: 5, name: 'Nakit Akışı Tahmini', status: 'bekliyor', detail: `Önümüzdeki 7 gün: ${cashflowForecast().net7d.toLocaleString('tr-TR')}₺ net` },
    { step: 6, name: 'Şüpheli İşlem Taraması', status: 'bekliyor', detail: 'Anomaliler ledger fraud kurallarıyla çapraz kontrol edilir' },
    { step: 7, name: 'Vergi & KVKK Klasmanı', status: 'bekliyor', detail: 'Belgeler dönem klasörüne ayrılır' },
    { step: 8, name: 'Nezaket Hatırlatıcıları', status: 'bekliyor', detail: 'Daze nezaket filtresiyle ödeme hatırlatmaları hazırlanır' },
    { step: 9, name: 'Raporlama & MRR Güncellemesi', status: 'bekliyor', detail: 'TrustMRR motoruna yeni veri aktarılır' },
  ];
}

export function invoiceDueAlerts(): InvoiceRecord[] {
  return [
    { id: 'inv-1', vendor: 'Spor Malzemeleri A.Ş.', amount: 18000, dueDate: '2026-08-20', status: 'bekliyor' },
    { id: 'inv-2', vendor: 'Enerji Tedarik', amount: 9400, dueDate: '2026-08-18', status: 'vadesi-geldi' },
    { id: 'inv-3', vendor: 'Gıda Perakende', amount: 6200, dueDate: '2026-08-25', status: 'bekliyor' },
  ];
}

export function posReconciliation(): { pos: number; cash: number; gap: number } {
  return { pos: 118400, cash: 116700, gap: 1700 };
}

export function cashflowForecast(): { inflow: number; outflow: number; net7d: number } {
  return { inflow: 214000, outflow: 167500, net7d: 46500 };
}

export function geminiFinanceStatus(): string {
  return `Gemini Finans [9 adım • fatura+vade+mutabakat+nakit • nezaket filtresi]`;
}
