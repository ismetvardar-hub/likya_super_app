// ============================================================================
// 📦 DAZE BUILT-IN FREE TEMPLATES — 5 ÜCRETSİZ YERLEŞİK OTONOM ŞABLON
// Dış bağımlılık gerektirmez; n8n bağlı değilken mock-first çalışır.
// 1. SocialLeadConverter       : yorum → DM rezervasyon/indirim → CRM
// 2. VoiceToTaskOrchestrator  : ses → staff_tasks + mutfak eksik listesi
// 3. DocRagContractAssistant  : tüzük/sözleşme → pgvector → 7/24 RAG yanıtı
// 4. DailyExecutiveDigest     : 23:59 cron → tek sayfa CEO Markdown bülteni
// 5. ChurnRecoveryGift        : 14 gün gelmeyen → Daze-Gift QR + davet
// ============================================================================

import { generateN8nWorkflow, type N8nScenario, type N8nWorkflowJson } from './n8nAutonomousGenerator';
import { createWorkflow, activateWorkflow } from './n8nApiClient';

export interface BuiltinTemplate {
  id: string;
  icon: string;
  name: string;
  description: string;
  trigger: string;
  scenario: N8nScenario;
  steps: string[];
}

export const BUILTIN_TEMPLATES: BuiltinTemplate[] = [
  {
    id: 'social-lead-converter',
    icon: '📱',
    name: 'Social Lead Converter',
    description: 'Gönderi yorumlarında "KORT/MENÜ/REÇETE" anahtar kelimesi tetiklenir; DM üzerinden kişiselleştirilmiş indirim/rezervasyon linki gönderir ve CRM\'e kaydeder.',
    trigger: 'Instagram/Webhook — yorum',
    scenario: 'social-dm-lead',
    steps: ['Yorumu tara', 'Profil çek', 'DM linki fırlat', 'CRM kaydet'],
  },
  {
    id: 'voice-to-task',
    icon: '🎤',
    name: 'Voice to Task Orchestrator',
    description: 'WhatsApp/Telegram sesli notları Whisper/Gemini ile metne döker; staff_tasks ve mutfak eksik listesine görev olarak atar.',
    trigger: 'WhatsApp/Telegram — ses',
    scenario: 'voice-to-task',
    steps: ['Transkripsiyon', 'JSON çıkarımı', 'staff_tasks yaz', 'Mutfak eksik güncelle'],
  },
  {
    id: 'doc-rag-contract',
    icon: '📄',
    name: 'Doc RAG Contract Assistant',
    description: 'Tesis kuralları, kiralama sözleşmeleri ve aidat tüzüklerini vektör aramayla tarar; müşteri sorularını 7/24 sözleşmeden referansla yanıtlar.',
    trigger: 'PDF/MD upload',
    scenario: 'doc-rag',
    steps: ['Chunk + Embed', 'pgvector arama', 'Gemini RAG yanıtı'],
  },
  {
    id: 'daily-executive-digest',
    icon: '📊',
    name: 'Daily Executive Digest',
    description: 'Her gece 23:59\'da kümülatif ciro, kort doluluğu, stok atıkları ve bekleyen bakımları tek sayfalık Markdown bülteni olarak CEO\'ya iletir.',
    trigger: 'Cron — 23:59',
    scenario: 'executive-digest',
    steps: ['DB tara', 'LLM özetle', 'WhatsApp/Telegram rapor'],
  },
  {
    id: 'churn-recovery-gift',
    icon: '🧲',
    name: 'Churn Recovery + Daze-Gift',
    description: '14 gündür tesise gelmeyen üyeleri tespit eder; kişiye özel Daze-Gift ikram/kupon kodu üretir ve davet mesajı fırlatır.',
    trigger: 'Cron — 08:00',
    scenario: 'churn-recovery',
    steps: ['Risk sorgusu', 'Daze-Gift QR üret', 'Kişiye özel davet'],
  },
];

/** 5 yerleşik şablonu listele (katalog). */
export function getBuiltinTemplates(): BuiltinTemplate[] {
  return BUILTIN_TEMPLATES;
}

export function getBuiltinTemplate(id: string): BuiltinTemplate | null {
  return BUILTIN_TEMPLATES.find((t) => t.id === id) ?? null;
}

/**
 * Seçilen şablonu n8n REST proxy'sine fırlat ve aktif et.
 * n8n env yoksa proxy mock-first yanıtı döner — sıfır maliyet, asla çökme.
 */
export async function deployTemplateToN8n(templateId: string): Promise<{ ok: boolean; template: BuiltinTemplate | null; workflow: N8nWorkflowJson | null; workflowId: string; mode: 'live' | 'mock'; message: string }> {
  const template = getBuiltinTemplate(templateId);
  if (!template) return { ok: false, template: null, workflow: null, workflowId: '', mode: 'mock', message: 'Şablon bulunamadı' };

  const workflow = generateN8nWorkflow(template.scenario);
  const created = await createWorkflow(workflow);
  if (created.ok && created.mode === 'live') {
    await activateWorkflow(created.workflowId);
  }
  return {
    ok: created.ok,
    template,
    workflow,
    workflowId: created.workflowId,
    mode: created.mode,
    message: created.message,
  };
}

export function builtinTemplatesStatus(): string {
  return `Yerleşik Şablonlar [${BUILTIN_TEMPLATES.length} ücretsiz motor • mock-first • tek tıkla deploy]`;
}
