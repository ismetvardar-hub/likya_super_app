// ============================================================================
// 💬 LIFEOS BAĞLAM SARMALAYICISI — CEO Chat'e otomatik bağlam enjeksiyonu
// Kullanıcı soru sorduğunda mevcut LifeOS bağlamı (günlük ritim, konum,
// aktif hedef, seyahatler, ilişkiler) sistem prompt'una eklenir.
// Gemini/Ollama çağrılarından önce çağrılır. Deterministik; Plan Z güvenli.
// ============================================================================

import type { ExecutiveContext } from './executiveContextEngine';

// Bağlamı kompakt sistem-prompt bloğuna çevir (token verimli)
export function contextToPromptBlock(ctx: ExecutiveContext): string {
  return [
    '[🧬 LIFEOS BAĞLAMI — Patron için bağlam zorunludur]',
    `• Bugün: ${new Date().toLocaleDateString('tr-TR')} | Ritim: uyanış ${ctx.routine.wakeUp}, derin çalışma ${ctx.routine.deepWorkBlock}`,
    `• Aktif Stratejik Hedef: "${ctx.trajectory.currentGoal}" (faz: ${ctx.trajectory.phase}, odak %${ctx.trajectory.focusPercent})`,
    `• Kilometre taşları: ${ctx.trajectory.milestones.join(' → ')}`,
    `• Seyahat: ${ctx.travel.map((t) => `${t.destination} (${t.status})`).join('; ') || 'yok'}`,
    `• VIP ilişkiler: ${ctx.vipRelationships.map((v) => `${v.name} (${v.strength}/100)`).join('; ') || 'yok'}`,
    `• Alışkanlıklar: ${ctx.habits.map((h) => `${h.emoji} ${h.name} (${h.streak}gün)`).join('; ')}`,
    'Yanıtlarını bu bağlama göre özelleştir: hedefi ilerlet, seyahat/ilişki programına uyum sağla.',
  ].join('\n');
}

// Kullanıcı mesajını LifeOS bağlamıyla sar (soru + bağlam)
export function wrapWithContext(ctx: ExecutiveContext, userMessage: string): string {
  return `${contextToPromptBlock(ctx)}\n\n👤 Patron soruyor: ${userMessage}`;
}

// Sistem prompt'u oluştur (mevcut systemPrompt + bağlam)
export function buildContextualSystemPrompt(ctx: ExecutiveContext, baseSystemPrompt: string): string {
  return `${baseSystemPrompt}\n\n${contextToPromptBlock(ctx)}`;
}

// Özet durum etiketi (UI için)
export function contextSummary(ctx: ExecutiveContext): { goal: string; phase: string; travelCount: number; vipCount: number; focus: number } {
  return {
    goal: ctx.trajectory.currentGoal,
    phase: ctx.trajectory.phase,
    travelCount: ctx.travel.length,
    vipCount: ctx.vipRelationships.length,
    focus: ctx.trajectory.focusPercent,
  };
}
