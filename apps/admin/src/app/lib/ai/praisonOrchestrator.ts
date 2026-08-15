// ============================================================================
// 🦾 LİKYA PRAISONAI ÇOKLU AJAN ORKESTRASYONU (praisonOrchestrator.ts)
// 3 Aşamalı otonom ajan zinciri: ResearchAgent → PlanAgent → ExecuteAgent
// Deterministik karar motoru — LLM zorunlu değildir (veri varsa şelale kullanır).
// ============================================================================

export type AgentTask =
  | 'STOK' | 'VARDİYA' | 'BİLDİRİM' | 'MÜZİK' | 'FİNANS' | 'SPORT' | 'TESİS' | 'GENEL';

export interface ResearchInput {
  task: AgentTask;
  command: string;
  snapshot: Record<string, number | string>;  // canlı metrikler
}

export interface ResearchResult {
  findings: string[];
  riskLevel: 'düşük' | 'orta' | 'yüksek';
  dataPoints: string[];
}

// 🧠 AŞAMA 1 — RESEARCH AGENT: veriyi analiz eder, bulgular çıkarır
export function researchAgent(input: ResearchInput): ResearchResult {
  const findings: string[] = [];
  const dataPoints: string[] = [];
  let riskPoints = 0;

  const num = (k: string) => Number(input.snapshot[k] ?? 0);

  switch (input.task) {
    case 'STOK': {
      const stok = num('stok');
      const reorder = num('reorderPoint');
      dataPoints.push(`stok=${stok}`, `reorderPoint=${reorder}`);
      if (stok <= reorder) { findings.push('Stok kritik eşiğin altında — yeniden sipariş gerekli'); riskPoints += 2; }
      else if (stok <= reorder * 1.5) { findings.push('Stok uyarı bandında — yakında sipariş planlanmalı'); riskPoints += 1; }
      else findings.push('Stok seviyesi sağlıklı');
      break;
    }
    case 'VARDİYA': {
      const yogunluk = num('yogunluk');
      const personel = num('personel');
      dataPoints.push(`yogunluk=${yogunluk}`, `personel=${personel}`);
      if (yogunluk > 75 && personel < 3) { findings.push('Yogunluk yuksek, personel yetersiz — takviye gerekli'); riskPoints += 2; }
      else if (yogunluk > 50) { findings.push('Orta yogunluk — normal akis yeterli'); riskPoints += 1; }
      else findings.push('Yogunluk dusuk — mevcut personel yeterli');
      break;
    }
    case 'BİLDİRİM': {
      const kritik = num('kritikOlay');
      dataPoints.push(`kritikOlay=${kritik}`);
      if (kritik > 0) { findings.push('Kritik olay tespit edildi — anlik bildirim zinciri onerilir'); riskPoints += 3; }
      else findings.push('Kritik olay yok — rutin bildirim yeterli');
      break;
    }
    case 'MÜZİK': {
      const bpm = num('bpm');
      const doluluk = num('doluluk');
      dataPoints.push(`bpm=${bpm}`, `doluluk=${doluluk}`);
      findings.push(doluluk > 70 ? 'Yuksek doluluk — enerji rampasi (120+ BPM) onerilir' : 'Normal doluluk — akustik atmosfer uygun');
      break;
    }
    case 'FİNANS': {
      const nakit = num('nakit');
      const yuk = num('yuk');
      dataPoints.push(`nakit=${nakit}`, `yuk=${yuk}`);
      if (nakit < yuk) { findings.push('Nakit akisi yukumluluklerin altinda — likidite riski'); riskPoints += 2; }
      else findings.push('Nakit akisi yukumlulukleri karsiliyor');
      break;
    }
    case 'SPORT': {
      const hiz = num('hizKmh');
      const form = num('formIndex');
      dataPoints.push(`hizKmh=${hiz}`, `formIndex=${form}`);
      findings.push(hiz > 140 ? 'Roket sut hizi — performans zirvesi' : 'Sut hizi normal bantta');
      if (form < 70) { findings.push('Form indeksi dusuk — yuk yonetimi onerisi'); riskPoints += 1; }
      break;
    }
    case 'TESİS': {
      const uptime = num('uptimePct');
      const offline = num('offlineCihaz');
      dataPoints.push(`uptimePct=${uptime}`, `offlineCihaz=${offline}`);
      if (offline > 0) { findings.push(`${offline} cihaz cevrimdisi — saha mudahalesi gerekli`); riskPoints += 2; }
      else findings.push(`Tesis uptime %${uptime} — saglikli`);
      break;
    }
    default: {
      dataPoints.push('komut', input.command.slice(0, 40));
      findings.push('Genel gorev algilandi — plan asamasina gecilio');
    }
  }

  const riskLevel: ResearchResult['riskLevel'] = riskPoints >= 3 ? 'yüksek' : riskPoints >= 1 ? 'orta' : 'düşük';
  return { findings, riskLevel, dataPoints };
}

// 🧩 AŞAMA 2 — PLAN AGENT: araştırmadan aksiyon planı çıkarır
export interface PlanStep {
  order: number;
  action: string;
  target: AgentTask;
  priority: 'ACİL' | 'NORMAL' | 'DÜŞÜK';
}

export interface PlanResult {
  steps: PlanStep[];
  summary: string;
}

export function planAgent(research: ResearchResult, input: ResearchInput): PlanResult {
  const steps: PlanStep[] = [];
  const priority = research.riskLevel === 'yüksek' ? 'ACİL' : research.riskLevel === 'orta' ? 'NORMAL' : 'DÜŞÜK';

  steps.push({ order: 1, action: research.findings[0] || 'Durum gozlemlendi', target: input.task, priority });
  if (input.task === 'STOK') steps.push({ order: 2, action: 'Siparis formu hazirla ve tedarikciye ilet', target: input.task, priority });
  else if (input.task === 'VARDİYA') steps.push({ order: 2, action: 'Otonom ise davet motorunu tetikle', target: 'VARDİYA', priority });
  else if (input.task === 'BİLDİRİM') steps.push({ order: 2, action: 'VIP bildirim hattini (Telegram/WhatsApp) atesle', target: 'BİLDİRİM', priority });
  else if (input.task === 'MÜZİK') steps.push({ order: 2, action: 'Daze DJ tempo rampasini guncelle', target: 'MÜZİK', priority });
  else if (input.task === 'TESİS') steps.push({ order: 2, action: 'Sentinel bakim gorevini kuyruga al', target: 'TESİS', priority });
  else steps.push({ order: 2, action: 'Ilgili module otonom komut ilet', target: input.task, priority });
  steps.push({ order: 3, action: 'Sonucu CEO paneline raporla', target: 'GENEL', priority: 'DÜŞÜK' });

  return {
    steps,
    summary: `${steps.length} adimli plan (oncelik: ${priority}) — ${research.findings.join('; ')}`,
  };
}

// ⚙️ AŞAMA 3 — EXECUTE AGENT: ilgili modüle emri otonom uygular
export interface ExecuteResult {
  executed: boolean;
  module: AgentTask;
  command: string;
  effect: string;
  timestamp: string;
}

export function executeAgent(plan: PlanResult, input: ResearchInput, now = new Date().toISOString()): ExecuteResult {
  const primary = plan.steps.find((s) => s.order === 1);
  const commandByTask: Record<AgentTask, string> = {
    STOK: 'ERP → recete tuketimi & yeniden siparis emri olusturuldu',
    VARDİYA: 'HR → otonom ise davet motoru tetiklendi',
    BİLDİRİM: 'NOTIFY → VIP bildirim hatti ateslendi',
    MÜZİK: 'MUSIC → Daze DJ BPM rampasi guncellendi',
    FİNANS: 'FINANCE → nakit akisi uyarisi CFO paneline iletildi',
    SPORT: 'SPORT → performans raporu antrenor paneline iletildi',
    TESİS: 'SENTINEL → bakim gorevi kuyruga alindi',
    GENEL: 'CEO → gorev loglandi ve raporlandi',
  };
  return {
    executed: true,
    module: input.task,
    command: primary?.action ?? input.command,
    effect: commandByTask[input.task],
    timestamp: now,
  };
}


// 🏛️ BİRLEŞİK PRAISON ZİNCİRİ — Research → Plan → Execute
export interface PraisonChainResult {
  research: ResearchResult;
  plan: PlanResult;
  execute: ExecuteResult;
  log: string[];
}

export function runPraisonChain(input: ResearchInput, now?: string): PraisonChainResult {
  const log: string[] = [];
  const research = researchAgent(input);
  log.push(`🦾 ResearchAgent: ${research.findings.join(' | ')} (risk: ${research.riskLevel})`);
  const plan = planAgent(research, input);
  log.push(`🧩 PlanAgent: ${plan.summary}`);
  const execute = executeAgent(plan, input, now);
  log.push(`⚙️ ExecuteAgent: ${execute.effect}`);
  return { research, plan, execute, log };
}

// Hazır görev örnekleri
export function praisonStockCommand(stok: number, reorderPoint: number): PraisonChainResult {
  return runPraisonChain({ task: 'STOK', command: 'stok kontrolü', snapshot: { stok, reorderPoint } });
}
export function praisonShiftCommand(yogunluk: number, personel: number): PraisonChainResult {
  return runPraisonChain({ task: 'VARDİYA', command: 'vardiya dengeleme', snapshot: { yogunluk, personel } });
}
export function praisonFacilityCommand(offlineCihaz: number, uptimePct: number): PraisonChainResult {
  return runPraisonChain({ task: 'TESİS', command: 'tesis sağlık kontrolü', snapshot: { offlineCihaz, uptimePct } });
}

