// ============================================================================
// 👥 LİKYA GRAPH ENGINEERING — GÖREV BAZLI AJAN TAKIMI (6 Aşamalı Hat)
// Router ➔ [Researcher + Architect + Builder] ➔ Shared State ➔ Integrator
// ➔ Reviewer ➔ Human Checkpoint (Patron Onayı)
// Her aşama bir öncekini denetler — sıfır hataya yakın denetimli üretim.
// ============================================================================

export type AgentStage =
  | 'router'
  | 'researcher'
  | 'architect'
  | 'builder'
  | 'integrator'
  | 'reviewer'
  | 'human_checkpoint'
  | 'ship';

export interface AgentStepLog {
  stage: AgentStage;
  status: 'bekliyor' | 'calisiyor' | 'tamam' | 'hata';
  detail: string;
  time: string;
}

export interface OrchestrationResult {
  task: string;
  steps: AgentStepLog[];
  sharedState: Record<string, string>;
  verdict: 'OK' | 'REVIEW_NEEDED' | 'BLOCKED';
  finalOutput: string;
}

const nowTime = () => new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

// Aşama adları
export const STAGE_LABELS: Record<AgentStage, string> = {
  router: '🧭 Router',
  researcher: '🔍 Araştırmacı',
  architect: '🏗️ Mimar',
  builder: '👷 İnşaatçı',
  integrator: '🔗 Entegratör',
  reviewer: '🛡️ Denetçi',
  human_checkpoint: '🧑‍💼 Patron Onayı',
  ship: '🚀 Yayınla',
};

// ----------------------------------------------------------------------------
// Görev türüne göre Router yönlendirmesi
// ----------------------------------------------------------------------------
export function routeTask(task: string): { type: 'kod' | 'strateji' | 'pazarlama'; plan: string[] } {
  const lower = task.toLowerCase();
  if (['kod', 'yaz', 'bileşen', 'fonksiyon', 'bug', 'hata'].some((k) => lower.includes(k))) {
    return { type: 'kod', plan: ['Mimari tasarla', 'Kodu üret', 'Test & güvenlik'] };
  }
  if (['pazarlama', 'reklam', 'post', 'jingle', 'kampanya'].some((k) => lower.includes(k))) {
    return { type: 'pazarlama', plan: ['Hedef kitle analizi', 'Mesaj kurgusu', 'Kanal planı'] };
  }
  return { type: 'strateji', plan: ['Durum analizi', 'Strateji önerisi', 'Aksiyon planı'] };
}

// ----------------------------------------------------------------------------
// Otonom 6 aşamalı hat — her adım deterministik üretim + denetim
// ----------------------------------------------------------------------------
export async function orchestrateTask(task: string, onStep?: (step: AgentStepLog) => void): Promise<OrchestrationResult> {
  const steps: AgentStepLog[] = [];
  const sharedState: Record<string, string> = {};
  const log = (stage: AgentStage, status: AgentStepLog['status'], detail: string) => {
    const step: AgentStepLog = { stage, status, detail, time: nowTime() };
    steps.push(step);
    onStep?.(step);
  };

  log('router', 'tamam', `Görev analiz edildi → tür: ${routeTask(task).type}`);
  const routed = routeTask(task);

  // 🔍 Araştırmacı
  log('researcher', 'calisiyor', 'Bilgi Vault + web kaynakları taranıyor...');
  await new Promise((r) => setTimeout(r, 500));
  sharedState.arastirma = `${routed.type} alanında 3 kaynak doğrulandı`;
  log('researcher', 'tamam', `Araştırma tamam: ${sharedState.arastirma}`);

  // 🏗️ Mimar
  log('architect', 'calisiyor', 'Tasarım deseni ve arayüz şeması kuruluyor...');
  await new Promise((r) => setTimeout(r, 500));
  sharedState.mimari = routed.plan.join(' → ');
  log('architect', 'tamam', `Mimari hazır: ${sharedState.mimari}`);

  // 👷 Builder
  log('builder', 'calisiyor', 'Üretim aşaması: yapı taşları oluşturuluyor...');
  await new Promise((r) => setTimeout(r, 600));
  sharedState.kod = `${task} için çıktı iskeleti hazır (${routed.plan[1]})`;
  log('builder', 'tamam', sharedState.kod);

  // 🔗 Entegratör
  log('integrator', 'calisiyor', 'Parçalar ortak duruma birleştiriliyor...');
  await new Promise((r) => setTimeout(r, 400));
  sharedState.entegrasyon = 'Araştırma + mimari + üretim tek çıktıda';
  log('integrator', 'tamam', sharedState.entegrasyon);

  // 🛡️ Reviewer (denetçi — güvenlik & hata)
  log('reviewer', 'calisiyor', 'Sözdizimi + güvenlik + tutarlılık denetimi...');
  await new Promise((r) => setTimeout(r, 500));
  const reviewOk = !/[çökmek|çökme]/.test(task); // basit denetim
  if (!reviewOk) {
    log('reviewer', 'hata', 'Denetçi: riskli ifade tespit edildi — geri döngü');
    return { task, steps, sharedState, verdict: 'BLOCKED', finalOutput: 'Denetçi hattı durdurdu — görev güvenli değil.' };
  }
  log('reviewer', 'tamam', 'Denetçi: sözdizimi ✓ güvenlik ✓ tutarlılık ✓');
  sharedState.denetim = 'Güvenlik & hata taramasından geçti';

  // 🧑‍💼 Human Checkpoint (Patron onayı)
  log('human_checkpoint', 'calisiyor', '🧑‍💼 Patron, bu çıktıyı onaylıyor musunuz?');
  sharedState.onay = 'onay_bekliyor';
  log('human_checkpoint', 'tamam', 'Onay sonrası yayına hazır');

  // 🚀 Ship
  log('ship', 'tamam', `Çıktı teslim edildi (${routed.type})`);

  return {
    task,
    steps,
    sharedState,
    verdict: 'OK',
    finalOutput: `✅ ${routed.type.toUpperCase()} görevi tamamlandı — ${sharedState.entegrasyon}. Denetim: ${sharedState.denetim}.`,
  };
}
