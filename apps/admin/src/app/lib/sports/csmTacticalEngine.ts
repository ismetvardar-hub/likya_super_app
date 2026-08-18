// ============================================================================
// 🧠 CSM TAKTİK KARAR VE SORUMLULUK MOTORU (Competitive Systems Model)
// Identify → One Fix Adjustment → Assign Responsibility → Execution Feedback
// 5 kural yerine: bir sonraki hücum/savunma için TEK net düzeltme.
// Deterministik; Plan Z güvenli; Daze Hub Event Bus ile görev zincirine bağlanır.
// ============================================================================

import { staffTaskDispatched } from '../ops/dazeHubEventBus';

export type CsmPhase = 'hucum' | 'savunma' | 'gecis';

export interface TacticalIssue {
  id: string;
  phase: CsmPhase;
  title: string;
  detail: string;
  severity: 1 | 2 | 3 | 4 | 5;
}

export interface OneFixAdjustment {
  fix: string;                    // tek net düzeltme
  nextPossession: string;         // bir sonraki pozisyon için talimat
  avoidRuleCount: number;         // her zaman 1 (5 kural yerine)
  focusKeyword: string;
}

export interface Responsibility {
  commander: string;   // komutu veren
  adapter: string;     // uyarlayan (sahada düzelten)
  cover: string;       // kademeye giren / destek
}

export interface ExecutionFeedback {
  fixed: boolean;
  score: number; // 0-100 (çözümün tutma derecesi)
  verdict: 'TUTTU' | 'DENENMEDI' | 'DUSMEDI';
  feedback: string;
}

export interface CsmResolution {
  issue: TacticalIssue;
  fix: OneFixAdjustment;
  responsibility: Responsibility;
  feedback: ExecutionFeedback;
}

// ── IDENTIFY: Taktik veri → pozisyon hatası / rakip açığı ──────────────────
export function identifyTacticalIssue(input: {
  phase?: CsmPhase;
  opponentPressing?: boolean;   // rakip baskıda mı
  gapOnLeft?: boolean;          // sol kanat açığı
  spacingMeters?: number;       // oyuncu arası mesafe (çok dar < 4m)
  possessionSec?: number;       // topa sahip olma süresi
  lastCutFailed?: boolean;      // son kesme/şut denemesi başarısız
}): TacticalIssue {
  const phase = input.phase ?? 'hucum';

  if (input.opponentPressing) {
    return {
      id: `csm_${Date.now().toString(36)}`,
      phase,
      title: 'Rakip baskısı altında top kaybı riski',
      detail: 'Rakip yüksek baskı uyguluyor; ilk temas + pas güzergahı daralıyor.',
      severity: 4,
    };
  }
  if (input.spacingMeters !== undefined && input.spacingMeters < 4) {
    return {
      id: `csm_${Date.now().toString(36)}`,
      phase,
      title: 'Daralan mesafe — alan sıkışması',
      detail: `Oyuncu arası ${input.spacingMeters}m — pas kanalları kapanıyor; genişlik kaybı.`,
      severity: 3,
    };
  }
  if (input.gapOnLeft) {
    return {
      id: `csm_${Date.now().toString(36)}`,
      phase,
      title: 'Sol kanat açığı (rakip zafiyeti)',
      detail: 'Rakip sol savunma hattı geç dönüyor; içe kat + çapraz koşu için boşluk var.',
      severity: 3,
    };
  }
  if (input.possessionSec !== undefined && input.possessionSec > 8 && phase === 'hucum') {
    return {
      id: `csm_${Date.now().toString(36)}`,
      phase,
      title: 'Statik topa sahip olma — tempo kaybı',
      detail: `${input.possessionSec}s statik topla bekleme; ikinci pas (1-2) ritmi kurulmalı.`,
      severity: 2,
    };
  }
  if (input.lastCutFailed) {
    return {
      id: `csm_${Date.now().toString(36)}`,
      phase: 'hucum',
      title: 'Son vuruş öncesi pozisyon seçimi',
      detail: 'Son kesme denemesi başarısız; şut öncesi ayak açısı ve denge kontrolü gerekli.',
      severity: 2,
    };
  }
  return {
    id: `csm_${Date.now().toString(36)}`,
    phase,
    title: 'Pozisyon disiplini — referans düzen',
    detail: 'Yapısal hata tespit edilmedi; referans dizilim korunuyor.',
    severity: 1,
  };
}

// ── ONE FIX: Tek net düzeltme (5 kural yerine 1) ───────────────────────────
const FIX_LIBRARY: Record<string, { fix: string; nextPossession: string; focusKeyword: string }> = {
  'Rakip baskısı altında top kaybı riski': {
    fix: 'İlk temasta topu kaleye uzak taraftaki açık ayağa al ve tek dokunuşla dikey pas dene.',
    nextPossession: 'Bir sonraki hücumda top kaybını 0 yap; baskı altında panik yok.',
    focusKeyword: 'acik-ayak-ilk-temas',
  },
  'Daralan mesafe — alan sıkışması': {
    fix: 'Dış kanat oyuncusu çizgiye yaslan; iç oyuncu 4m üstü aralıkla kademeli sür.',
    nextPossession: 'Bir sonraki pozisyonda minimum mesafe 4m olacak; genişlik korunacak.',
    focusKeyword: 'genislik-min-4m',
  },
  'Sol kanat açığı (rakip zafiyeti)': {
    fix: 'Sağ bekten sol açığa çapraz uzun pas + kanat forvetin içe kat koşusu.',
    nextPossession: 'Bir sonraki hücumda sol koridordan atak kurulacak (2 oyuncu bindirme).',
    focusKeyword: 'sol-koridor-bindirme',
  },
  'Statik topa sahip olma — tempo kaybı': {
    fix: 'Top taşıyıcı 3 saniye kuralı: taşı, geri ver, 1-2 al — döngü hızlandır.',
    nextPossession: 'Bir sonraki pozisyonda 8s üstü statik sahiplik olmayacak.',
    focusKeyword: '3sn-tasima-dongusu',
  },
  'Son vuruş öncesi pozisyon seçimi': {
    fix: 'Şut öncesi pivot ayağını kale çizgisine paralel yerleştir; gövde kaleye dönük.',
    nextPossession: 'Bir sonraki vuruş denemesinde denge + ayak açısı kontrolü.',
    focusKeyword: 'pivot-paralel-govde',
  },
  'Pozisyon disiplini — referans düzen': {
    fix: 'Referans dizilim korunacak; kişisel görev tanımına sadık kal.',
    nextPossession: 'Bir sonraki pozisyonda dizilim disiplinini sürdür.',
    focusKeyword: 'referans-dizilim',
  },
};

export function agreeOnOneFix(issue: TacticalIssue): OneFixAdjustment {
  const lib = FIX_LIBRARY[issue.title] ?? FIX_LIBRARY['Pozisyon disiplini — referans düzen'];
  return { fix: lib.fix, nextPossession: lib.nextPossession, avoidRuleCount: 1, focusKeyword: lib.focusKeyword };
}

// ── ASSIGN RESPONSIBILITY: Roller ───────────────────────────────────────────
export function assignResponsibility(issue: TacticalIssue, coach = 'Hoca E.', captain = 'Kaptan M.'): Responsibility {
  return {
    commander: coach,           // komutu veren (antrenör)
    adapter: captain,           // sahada düzelten (kaptan)
    cover: issue.phase === 'savunma' ? 'Son Stoper' : '8 Numaralı Orta Saha', // kademeye giren
  };
}

// ── EXECUTION FEEDBACK: Sonraki pozisyonda skorla ───────────────────────────
export function scoreExecution(issue: TacticalIssue, succeeded: boolean, attempted: boolean = true): ExecutionFeedback {
  const base = 100 - (issue.severity * 8);
  const score = attempted ? (succeeded ? Math.min(100, base + 15) : Math.max(0, base - 25)) : base;
  return {
    fixed: succeeded,
    score,
    verdict: !attempted ? 'DENENMEDI' : succeeded ? 'TUTTU' : 'DUSMEDI',
    feedback: succeeded
      ? `Düzeltme uygulandı ve sonraki pozisyonda sonuç üretti (${score} puan).`
      : `Düzeltme sonraki pozisyonda sonuç vermedi (${score} puan) — yeniden Identify döngüsü.`,
  };
}

// ── TEK TIKLA ORKESTRASYON ──────────────────────────────────────────────────
export function resolveTacticalProblem(input: {
  phase?: CsmPhase;
  opponentPressing?: boolean;
  gapOnLeft?: boolean;
  spacingMeters?: number;
  possessionSec?: number;
  lastCutFailed?: boolean;
  succeeded?: boolean;
  attempted?: boolean;
}): CsmResolution {
  const issue = identifyTacticalIssue(input);
  const fix = agreeOnOneFix(issue);
  const responsibility = assignResponsibility(issue);
  const feedback = scoreExecution(issue, input.succeeded ?? false, input.attempted);

  // Daze Hub Event Bus: taktik görevi personel zincirine düşür
  staffTaskDispatched(`CSM-${issue.id.slice(4, 8)}`, `${responsibility.adapter} (${responsibility.cover})`, 0, Math.round(feedback.score / 10));

  return { issue, fix, responsibility, feedback };
}

export function csmTacticalEngineStatus(): string {
  return 'CSM Taktik Motoru [Identify → One Fix → Sorumluluk → Geri Bildirim • 6 senaryo • 1-düzeltme kuralı]';
}

