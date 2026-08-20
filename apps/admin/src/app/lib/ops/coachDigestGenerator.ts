// ============================================================================
// 📧 ANTRENÖR ÖZET E-POSTA/DIGEST ÜRETİCİ (Adım 07)
// Son 24s/7d içindeki antrenmanları toplar:
// - Squad istatistikleri: toplam TRIMP, sakatlık bayrağı, top performer
//   (en yüksek RSI, GCT iyileşmesi)
// - HTML e-posta şablonu + mailto: / backend dispatch JSON payload
// ============================================================================

import type { PostSessionReport } from '../sports/postSessionReport';

export interface DigestWindow { label: string; hours: number; }

export interface SquadDigest {
  window: DigestWindow;
  sessions: number;
  athletes: string[];
  totalTrimp: number;
  injuryFlags: number;
  topRsi: { athlete: string; value: number };
  topGctImprovement: { athlete: string; deltaMs: number };
  generatedAt: string;
}

// ---------------------------------------------------------------------------
// 1. Squad Digest Hesaplama — seans raporlarından
// ---------------------------------------------------------------------------
export function buildSquadDigest(reports: PostSessionReport[], hours = 24): SquadDigest {
  const window: DigestWindow = { label: hours === 24 ? 'Son 24 Saat' : 'Son 7 Gün', hours };
  const totalTrimp = reports.reduce((s, r) => s + r.header.trimp, 0);
  const injuryFlags = reports.filter((r) => r.injury.risk !== 'DÜŞÜK').length;
  const topRsi = reports.reduce(
    (best, r) => {
      const v = Number(r.performance[0].lines[1]?.match(/RSI[):\s]*([\d.]+)/)?.[1] ?? 0);
      return v > best.value ? { athlete: r.header.athlete, value: v } : best;
    },
    { athlete: '—', value: 0 },
  );
  const topGct = reports.reduce(
    (best, r) => {
      const m = r.trends[0];
      const delta = Math.abs(m?.deltaPct ?? 0);
      return m && m.deltaPct < 0 && delta > best.deltaMs ? { athlete: r.header.athlete, deltaMs: delta } : best;
    },
    { athlete: '—', deltaMs: 0 },
  );
  return {
    window,
    sessions: reports.length,
    athletes: Array.from(new Set(reports.map((r) => r.header.athlete))),
    totalTrimp,
    injuryFlags,
    topRsi,
    topGctImprovement: topGct,
    generatedAt: new Date().toLocaleString('tr-TR'),
  };
}

// ---------------------------------------------------------------------------
// 2. HTML E-posta Şablonu
// ---------------------------------------------------------------------------
export function buildDigestHtml(d: SquadDigest): string {
  return `<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"/><style>
  body { font-family: Arial, sans-serif; color: #0f172a; background: #f8fafc; padding: 20px; }
  .wrap { max-width: 600px; margin: auto; background: #fff; border-radius: 14px; padding: 24px; border: 1px solid #e2e8f0; }
  h1 { font-size: 18px; margin: 0 0 4px; color: #1e3a8a; }
  .stat { display: inline-block; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 10px; padding: 8px 14px; margin: 4px; font-size: 12px; }
  .stat b { display: block; font-size: 18px; color: #1d4ed8; }
  .flag { color: #dc2626; font-weight: 700; }
  .foot { color: #64748b; font-size: 10px; margin-top: 16px; text-align: center; }
</style></head><body><div class="wrap">
  <h1>📊 Antrenör Günlük Özet — ${d.window.label}</h1>
  <p style="color:#64748b;font-size:12px">${d.generatedAt} • ${d.sessions} seans • ${d.athletes.join(', ')}</p>
  <div>
    <div class="stat">Toplam Yük (TRIMP)<b>${d.totalTrimp}</b></div>
    <div class="stat">Sakatlık Bayrağı<b>${d.injuryFlags}</b></div>
    <div class="stat">En İyi RSI<b>${d.topRsi.athlete} (${d.topRsi.value})</b></div>
    <div class="stat">GCT İyileşme<b>${d.topGctImprovement.athlete} (${d.topGctImprovement.deltaMs}%)</b></div>
  </div>
  ${d.injuryFlags > 0 ? `<p class="flag">⚠️ ${d.injuryFlags} seans sakatlık riski işaretledi — bu sporculara mola önerilir.</p>` : '<p>💚 Tüm seanslar güvenli sınırlarda geçti.</p>'}
  <div class="foot">⚡ ExtremeS Spor Bilimi • Likya Kampüsü</div>
</div></body></html>`;
}

// ---------------------------------------------------------------------------
// 3. mailto + Backend Dispatch JSON
// ---------------------------------------------------------------------------
export function buildDigestMailto(d: SquadDigest, coachEmail: string): string {
  const subject = encodeURIComponent(`📊 Antrenör Özet — ${d.window.label}`);
  const body = encodeURIComponent(`Toplam TRIMP: ${d.totalTrimp}\nSakatlık Bayrağı: ${d.injuryFlags}\nEn İyi RSI: ${d.topRsi.athlete} (${d.topRsi.value})\nGCT İyileşme: ${d.topGctImprovement.athlete}`);
  return `mailto:${coachEmail}?subject=${subject}&body=${body}`;
}

export function buildDigestDispatchPayload(d: SquadDigest): { to: string; subject: string; html: string } {
  return { to: 'coach@likya-campus.com', subject: `Antrenör Özet — ${d.window.label}`, html: buildDigestHtml(d) };
}

export function coachDigestStatus(): string {
  return 'Antrenör Digest: 24s/7d • TRIMP • bayrak • RSI • GCT • HTML/mailto/JSON';
}
