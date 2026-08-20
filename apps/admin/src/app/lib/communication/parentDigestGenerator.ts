// ============================================================================
// 📬 OTOMATİK HAFTALIK VELİ BÜLTENİ & AKADEMİ HABER ÜRETİCİ (Adım 94)
// Haftalık özet: seans sayısı, toplam TRIMP, RSI gelişimi, önümüzdeki hafta programı.
// Mobil uyumlu HTML + düz metin, kişiselleştirme etiketleriyle pozitif geri bildirim.
// Deterministik; sıfır bağımlılık.
// ============================================================================

export interface WeekSession {
  date: string;
  durationMin: number;
  trimp: number;
  rsi: number;
  gctMs: number;
}

export interface ParentDigestInput {
  athleteName: string;
  parentName: string;
  weekStart: string;            // ISO gün
  sessions: WeekSession[];
  nextWeekSchedule: string[];
  highlights: string[];
}

export interface DigestData {
  sessionCount: number;
  totalTrimp: number;
  totalMinutes: number;
  avgRsi: number;
  rsiBest: number;
  rsiPreviousBest: number;
}

/** Haftalık özet istatistiklerini hesaplar. */
export function digestStats(sessions: WeekSession[], previousBestRsi = 0): DigestData {
  return {
    sessionCount: sessions.length,
    totalTrimp: Math.round(sessions.reduce((a, s) => a + s.trimp, 0)),
    totalMinutes: sessions.reduce((a, s) => a + s.durationMin, 0),
    avgRsi: sessions.length > 0 ? Math.round((sessions.reduce((a, s) => a + s.rsi, 0) / sessions.length) * 100) / 100 : 0,
    rsiBest: sessions.length > 0 ? Math.max(...sessions.map((s) => s.rsi)) : 0,
    rsiPreviousBest: previousBestRsi,
  };
}

/** Kişiselleştirme etiketlerini değiştirir ({{athleteName}} vb.). */
export function personalizeText(template: string, data: DigestData, input: ParentDigestInput): string {
  return template
    .replaceAll('{{athleteName}}', input.athleteName)
    .replaceAll('{{parentName}}', input.parentName)
    .replaceAll('{{sessionCount}}', String(data.sessionCount))
    .replaceAll('{{totalTrimp}}', String(data.totalTrimp))
    .replaceAll('{{rsiBest}}', String(data.rsiBest))
    .replaceAll('{{highlights}}', input.highlights.join('; '));
}

/** Düz metin bülten. */
export function buildPlainDigest(input: ParentDigestInput, previousBestRsi = 0): string {
  const data = digestStats(input.sessions, previousBestRsi);
  const rsiNote = data.rsiBest > data.rsiPreviousBest ? ` 🎉 Yeni RSI rekoru: ${data.rsiBest}!` : '';
  const lines = [
    `Sevgili ${input.parentName},`,
    `${input.athleteName}'ın haftalık antrenman özeti (${input.weekStart}):`,
    `- Seans: ${data.sessionCount} · Toplam ${data.totalMinutes} dk`,
    `- Toplam yük (TRIMP): ${data.totalTrimp}${rsiNote}`,
    `- Önümüzdeki hafta: ${input.nextWeekSchedule.join(', ') || 'planlanmadı'}`,
    input.highlights.length > 0 ? `✨ Öne çıkanlar: ${input.highlights.join(' · ')}` : '',
  ];
  return lines.filter(Boolean).join('\n');
}

/** Mobil uyumlu HTML bülten. */
export function buildHtmlDigest(input: ParentDigestInput, previousBestRsi = 0): string {
  const data = digestStats(input.sessions, previousBestRsi);
  const rsiBadge = data.rsiBest > data.rsiPreviousBest ? `<span style="color:#facc15">🎉 Yeni RSI rekoru ${data.rsiBest}!</span>` : `${data.rsiBest}`;
  const schedule = input.nextWeekSchedule.map((s) => `<li>${s}</li>`).join('');
  return `<div style="font-family:sans-serif;max-width:600px;background:#020617;color:#e2e8f0;border-radius:14px;padding:20px">
  <h2 style="color:#00f2fe">🏸 ${input.athleteName} Haftalık Özet</h2>
  <p>Sevgili <b>${input.parentName}</b>,</p>
  <div style="display:flex;gap:10px;flex-wrap:wrap">
    <div style="flex:1;min-width:120px;background:#0f172a;border-radius:10px;padding:12px"><b style="color:#00f2fe">${data.sessionCount}</b><br/><small>Seans</small></div>
    <div style="flex:1;min-width:120px;background:#0f172a;border-radius:10px;padding:12px"><b style="color:#10B981">${data.totalTrimp}</b><br/><small>TRIMP</small></div>
    <div style="flex:1;min-width:120px;background:#0f172a;border-radius:10px;padding:12px"><b style="color:#8B5CF6">${rsiBadge}</b><br/><small>En iyi RSI</small></div>
  </div>
  ${input.highlights.length ? `<p>✨ <b>Öne çıkanlar:</b> ${input.highlights.join(' · ')}</p>` : ''}
  <p><b>Önümüzdeki hafta:</b></p><ul>${schedule || '<li>Planlanmadı</li>'}</ul>
  <p style="color:#64748b;font-size:12px">Likya Akademi · Otomatik veli bülteni</p>
</div>`;
}

/** Bülten özet metni (WhatsApp kısa). */
export function digestSummary(input: ParentDigestInput, previousBestRsi = 0): string {
  const data = digestStats(input.sessions, previousBestRsi);
  return `${input.athleteName}: ${data.sessionCount} seans · ${data.totalTrimp} TRIMP · ${input.highlights.length} öne çıkan`;
}

export function parentDigestStatus(): string {
  return 'Veli Bülteni: haftalık özet • TRIMP/RSI • HTML+metin • {{etiket}} kişiselleştirme';
}
