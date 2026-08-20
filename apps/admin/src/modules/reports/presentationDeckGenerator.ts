// ============================================================================
// 🎯 SUNUM DECK ÜRETİCİ (AI Presentation Engine) — sıfır maliyetli
// Kulüp direktörleri ve scout sunumları için tek tık Markdown/HTML slayt
// üretici (Gamma/Reveal tarzı). Canva Pro / Tome AI gerektirmez.
// ============================================================================

export interface DeckSlide {
  title: string;
  emoji: string;
  bullets: string[];
  accent?: string;
}

export interface SquadDeckData {
  clubName: string;
  coach: string;
  season: string;
  athleteCount: number;
  totalTrimp: number;
  injuryFlags: number;
  topAthlete: string;
  topRsi: number;
  commercial: { metric: string; value: string }[];
}

// ---------------------------------------------------------------------------
// 1. Markdown Slayt Üretici (Reveal/Marp uyumlu, `---` ayraçlı)
// ---------------------------------------------------------------------------
export function buildDeckMarkdown(slides: DeckSlide[]): string {
  return slides
    .map((s) => {
      const lines = [`# ${s.emoji} ${s.title}`];
      s.bullets.forEach((b) => lines.push(`- ${b}`));
      return lines.join('\n');
    })
    .join('\n\n---\n\n');
}

// ---------------------------------------------------------------------------
// 2. HTML Slayt (Reveal tarzı — bağımsız, çalıştırılabilir)
// ---------------------------------------------------------------------------
export function buildDeckHtml(slides: DeckSlide[], title = 'ExtremeS Sunum'): string {
  const body = slides
    .map(
      (s) => `<section><h1>${s.emoji} ${s.title}</h1><ul>${s.bullets.map((b) => `<li>${b}</li>`).join('')}</ul></section>`,
    )
    .join('');
  return `<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"/><title>${title}</title>
<style>body{margin:0;background:#0f172a;color:#f8fafc;font-family:'Segoe UI',sans-serif}section{min-height:100vh;display:flex;flex-direction:column;justify-content:center;padding:8vh 12vw}h1{font-size:2.2rem;margin:0 0 24px;color:#38bdf8}li{font-size:1.1rem;line-height:1.9;color:#e2e8f0}ul{padding-left:1.2rem}</style></head><body>${body}</body></html>`;
}

// ---------------------------------------------------------------------------
// 3. Kulüp / Yatırımcı Deck Şablonu
// ---------------------------------------------------------------------------
export function buildInvestorDeck(data: SquadDeckData): DeckSlide[] {
  const commercial = data.commercial.map((c) => `${c.metric}: ${c.value}`).join(' • ');
  return [
    { title: `${data.clubName} — Spor Bilimi Özeti`, emoji: '🏆', bullets: [`Sezon: ${data.season}`, `Antrenör: ${data.coach}`, 'SportVisionX AI destekli performans sistemi'], accent: '#38bdf8' },
    { title: 'Squad İstatistikleri', emoji: '📊', bullets: [`Sporcu: ${data.athleteCount}`, `Toplam yük (TRIMP): ${data.totalTrimp}`, `Sakatlık bayrağı: ${data.injuryFlags}`], accent: '#4ade80' },
    { title: 'En İyi Performans', emoji: '⭐', bullets: [`Lider sporcu: ${data.topAthlete}`, `RSI: ${data.topRsi} (elit seviye)`], accent: '#fbbf24' },
    { title: 'Ticari Metrikler', emoji: '💼', bullets: commercial.length ? commercial.split(' • ') : ['Veri bekleniyor'], accent: '#f472b6' },
    { title: 'Öneriler', emoji: '🚀', bullets: ['Yüksek yoğunluklu drill programı', 'Sakatlık riski takibi ile devamlılık', 'Veli raporlama ile bağlılık'], accent: '#a78bfa' },
  ];
}

export function buildScoutDeck(athlete: string, stats: { metric: string; value: string }[]): DeckSlide[] {
  return [
    { title: `${athlete} — Scout Raporu`, emoji: '🎯', bullets: ['SportVisionX biyomekanik analizi', '4 haftalık trend verisi'], accent: '#38bdf8' },
    { title: 'Metrikler', emoji: '📈', bullets: stats.map((s) => `${s.metric}: ${s.value}`), accent: '#4ade80' },
    { title: 'Potansiyel', emoji: '💎', bullets: ['Elit RSI / hız profili', 'Gelişim eğrisi pozitif'], accent: '#fbbf24' },
  ];
}

export function presentationDeckStatus(): string {
  return 'Deck Üretici: Markdown + Reveal HTML • yatırımcı + scout şablonları • $0/mo';
}
