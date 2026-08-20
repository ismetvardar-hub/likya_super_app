// ============================================================================
// 📲 MAÇ SONU VELİ ANLIK WHATSAPP ÖZET DAĞITICI (Adım 109)
// Seans tamamlandıktan sonra 60 saniye içinde tetiklenir; kompakt ve pozitif
// bir WhatsApp mesajı üretir: maç süresi, TRIMP skoru, varsa rekor (PB) ve
// toparlanma önerisi. Payload derleme tamamen deterministik şablon motoruyla
// yapılır — dış ücretli API bağımlılığı gerekmez.
// ============================================================================

export const PARENT_DISPATCH_WINDOW_MS = 60_000;

export interface ParentSummaryInput {
  athleteName: string;
  parentName: string;
  durationMin: number;
  trimp: number;
  highlightPb: string | null;     // örn. "Yeni servis hızı rekoru: 178 km/s" — yoksa null
  avgHr?: number;
  recoveryHours?: number;
}

export interface ParentSummaryData {
  durationMin: number;
  trimp: number;
  trimpLabel: string;
  highlightPb: string | null;
  recoveryHours: number;
}

// TRIMP kategori → toparlanma önerisi (sade + pozitif dil)
export function recoveryRecommendation(trimp: number): { recoveryHours: number; text: string } {
  if (trimp > 250) return { recoveryHours: 72, text: 'Bu seans çok yoğundu; 72 saat hafif tempoda kalın ve bol uyku alın' };
  if (trimp >= 120) return { recoveryHours: 48, text: 'Verimli bir yüklenme oldu; 48 saat aktif toparlanma (yüzme/hafif bisiklet) önerilir' };
  if (trimp >= 50) return { recoveryHours: 24, text: 'Güzel bir kondisyon seansı; 24 saat içinde hafif esneme ve sıvı dengesi yeterli' };
  return { recoveryHours: 12, text: 'Hafif ve keyifli bir antrenmandı; yarın kaldığınız yerden devam edebilirsiniz' };
}

export function buildParentSummaryData(input: ParentSummaryInput): ParentSummaryData {
  const rec = recoveryRecommendation(input.trimp);
  return {
    durationMin: Math.max(0, Math.round(input.durationMin)),
    trimp: Math.max(0, Math.round(input.trimp)),
    trimpLabel: rec.text.split(';')[0],
    highlightPb: input.highlightPb && input.highlightPb.trim().length > 0 ? input.highlightPb.trim() : null,
    recoveryHours: input.recoveryHours ?? rec.recoveryHours,
  };
}

// Deterministik şablon motoru: {{etiket}} değişimi — dış bağımlılık yok
export function compileParentWhatsAppSummary(input: ParentSummaryInput): string {
  const d = buildParentSummaryData(input);
  const pbLine = d.highlightPb ? `🎉 ${d.highlightPb}` : null;
  const lines = [
    `🎾 ${input.athleteName} bugünkü maçını tamamladı!`,
    `⏱️ Süre: ${d.durationMin} dk · Yük (TRIMP): ${d.trimp}`,
    pbLine ? `⭐ ${pbLine}` : null,
    `💚 Toparlanma: ${recoveryRecommendation(input.trimp).text}.`,
    `İyi çalıştı — ${input.parentName}, detaylı rapor uygulamada hazır.`,
  ];
  return lines.filter((l): l is string => !!l).join('\n');
}

// ── 60 saniye içinde tetikleme penceresi ──────────────────────────────────────
export function shouldDispatchNow(sessionEndedAt: string, now: Date = new Date(), windowMs = PARENT_DISPATCH_WINDOW_MS): boolean {
  const ended = new Date(sessionEndedAt).getTime();
  const elapsed = now.getTime() - ended;
  return elapsed >= 0 && elapsed <= windowMs;
}

export function secondsUntilDeadline(sessionEndedAt: string, now: Date = new Date(), windowMs = PARENT_DISPATCH_WINDOW_MS): number {
  const ended = new Date(sessionEndedAt).getTime();
  return Math.max(0, Math.round((ended + windowMs - now.getTime()) / 1000));
}

export function parentInstantSummaryStatus(): string {
  return `Veli Anlık Özet: ${PARENT_DISPATCH_WINDOW_MS / 1000}sn pencerede WhatsApp • TRIMP + PB + toparlanma (şablon motoru)`;
}
