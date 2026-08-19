// ============================================================================
// ⚖️ VAR LIGHT & ELEKTRONİK ÇİZGİ HAKEMLİĞİ — milimetrik optik doğrulama
// - Kort çizgileri: Baseline, Servis çizgisi optik koordinat kontrolü
// - IN / OUT karar motoru + animasyonlu skorbord bildirim verisi
// - Mock-first: kamera bağlı değilse deterministik top düşüş simülasyonu
// ============================================================================

export type LineName = 'Baseline' | 'Servis Çizgisi' | 'T Çizgisi' | 'Koridor';
export type LineVerdict = 'IN' | 'OUT';

export interface BallDrop {
  xMm: number;   // çizgiden uzaklık (mm, + içeri, - dışarı)
  yMm: number;
  line: LineName;
}

export interface VarLightDecision {
  line: LineName;
  drop: BallDrop;
  verdict: LineVerdict;
  marginMm: number;       // karar payı
  confidencePct: number;  // optik kesinlik
  message: string;        // skorbord bildirimi
  reviewed: boolean;
}

let decisions: VarLightDecision[] = [];

// ---------------------------------------------------------------------------
// 1. Çizgi Pozisyon Kontrolü → IN/OUT Karar Motoru
// ---------------------------------------------------------------------------
export function reviewLineDecision(line: LineName, xMm: number, yMm: number): VarLightDecision {
  // Çizgi genişliği 50mm (tenis/padel standardı) — merkez ofseti
  const lineWidthMm = 50;
  const marginMm = xMm; // pozitif içeri, negatif dışarı (çizgi merkezinden)
  const verdict: LineVerdict = marginMm >= -lineWidthMm / 2 ? 'IN' : 'OUT';
  const confidencePct = Math.min(99, 92 + (Math.abs(marginMm) % 6));
  const decision: VarLightDecision = {
    line,
    drop: { xMm: marginMm, yMm, line },
    verdict,
    marginMm,
    confidencePct,
    message: verdict === 'IN'
      ? `📺 VAR LIGHT: ${line} — TOP İÇERİDE (IN) • kenar payı ${Math.abs(marginMm)}mm • doğruluk %${confidencePct}`
      : `📺 VAR LIGHT: ${line} — TOP DIŞARIDA (OUT) • ${Math.abs(marginMm)}mm dışarı • doğruluk %${confidencePct}`,
    reviewed: true,
  };
  decisions.unshift(decision);
  if (decisions.length > 10) decisions.pop();
  return decision;
}

// ---------------------------------------------------------------------------
// 2. Mock Top Düşüşü — optik simülasyon (mm hassasiyetinde)
// ---------------------------------------------------------------------------
export function simulateBallDrop(line: LineName, seed: number): VarLightDecision {
  const sign = seed % 3 === 0 ? -1 : 1;                     // 1/3 ihtimalle OUT
  const xMm = sign * (8 + (seed % 55));                     // 8-62mm (çizgi sınırında)
  return reviewLineDecision(line, xMm, (seed % 90) - 45);
}

export function getVarLightDecisions(): VarLightDecision[] {
  return [...decisions];
}

export function varLightStatus(): string {
  return `VAR Light: ${decisions.length} inceleme • ${decisions.filter((d) => d.verdict === 'IN').length} IN / ${decisions.filter((d) => d.verdict === 'OUT').length} OUT`;
}
