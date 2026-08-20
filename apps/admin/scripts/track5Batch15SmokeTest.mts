// ============================================================================
// 🛠️ TRACK 5 — BATCH 15 SMOKE TESTİ (Adım 71-75) + TRACK 5 BÜTÜNLÜK
// PB Tespiti • Çok Dilli Sözlük • Ses/Haptik • Alt Navigasyon • Adım 61-75
// Çalıştırma: node scripts/track5Batch15SmokeTest.mts
// ============================================================================
import { detectPersonalBest, evaluateSessionPbs, pbMilestoneCard, PB_METRIC_META, type PbHistory } from '../src/app/lib/gamification/pbDetectionEngine.ts';
import { lookupTerm, listTerms, isTermComplete, dictionaryCompleteness, LANGUAGES, type Language } from '../src/app/lib/i18n/sportsDictionaryData.ts';
import { tonePreset, hapticPattern, playCue } from '../src/app/lib/audio/courtAudioCueEngine.ts';
import { BOTTOM_ACTIONS, createDefaultActionState, serializeActionState, deserializeActionState } from '../src/app/lib/ui/courtActionBarConfig.ts';
// Track 5 bütünlük (Adım 61-75)
import { levelForXp } from '../src/app/lib/gamification/athleteXpEngine.ts';
import { evaluateBadges } from '../src/app/lib/gamification/badgeRegistry.ts';
import { computeStreak, type StreakDay } from '../src/app/lib/gamification/streakTracker.ts';
import { buildCohortRadar, type RadarInput } from '../src/app/lib/analytics/cohortRadarEngine.ts';
import { pressureToColor } from '../src/app/lib/three/footPressureShader.ts';
import { createDashboardLayout } from '../src/app/lib/ui/dashboardLayoutEngine.ts';
import { detectPhv, type GrowthMeasurement } from '../src/app/lib/analytics/growthVelocityEngine.ts';
import { contrastRatio } from '../src/app/lib/ui/themeTokens.ts';
import { detectSwipe } from '../src/app/lib/ui/useTouchGestures.ts';

const results: { name: string; ok: boolean }[] = [];
function check(name: string, cond: boolean, detail = '') {
  results.push({ name, ok: cond });
  console.log((cond ? 'PASS' : 'FAIL') + ' - ' + name + (detail ? ` — ${detail}` : ''));
}

// ── ADIM 71: PB TESPİTİ ────────────────────────────────────────────────────────
const rsiPb = detectPersonalBest('MAX_RSI', 2.5, 2.0);
check('71a. MAX_RSI yeni PB (+%25)', rsiPb !== null && rsiPb.improvedPct === 25 && rsiPb.newValue === 2.5);
check('71b. Düşük RSI → PB değil', detectPersonalBest('MAX_RSI', 1.5, 2.0) === null);
const gctPb = detectPersonalBest('MIN_GCT', 180, 200);
check('71c. MIN_GCT düşük = daha iyi (+%10)', gctPb?.improvedPct === 10 && gctPb?.unit === 'ms');
check('71d. Yüksek GCT → PB değil', detectPersonalBest('MIN_GCT', 220, 200) === null);

const history: PbHistory = { maxRsi: 2.0, minGctMs: 200, peakSprintKmh: 30, maxServeKmh: 170 };
const pbs = evaluateSessionPbs({ maxRsi: 2.5, minGctMs: 180, peakSprintKmh: 32 }, history);
check('71e. Seans 3 PB üretir', pbs.length === 3 && pbs.every((p) => p.previousBest !== null));
check('71f. PB olmayan seans → boş', evaluateSessionPbs({ maxRsi: 1.9, minGctMs: 210 }, history).length === 0);
const card = pbMilestoneCard(rsiPb as NonNullable<typeof rsiPb>);
check('71g. Milestone kartı içerik', card.includes('Maks RSI') && card.toLowerCase().includes('pb') && card.includes('Sporcu'));
check('71h. Metrik meta 4 kayıt', Object.keys(PB_METRIC_META).length === 4);

// ── ADIM 72: ÇOK DİLLİ SÖZLÜK ─────────────────────────────────────────────────
check('72a. lookupTerm TR/EN', lookupTerm('RSI', 'TR')?.label === 'Reaktif Güç İndeksi' && lookupTerm('RSI', 'EN')?.label === 'Reactive Strength Index');
check('72b. Bilinmeyen terim → null', lookupTerm('XYZ', 'TR') === null);
check('72c. Almanca biomekanik 3 terim', listTerms('DE', 'Biomechanical').length === 3);
check('72d. Fransızca tanım dolu', (lookupTerm('EPOC', 'FR')?.definition.length ?? 0) > 20);
check('72e. Çeviri tamlığı 8/8 + tüm diller', dictionaryCompleteness().complete === 8 && dictionaryCompleteness().total === 8 && LANGUAGES.length === 4 && LANGUAGES.every((l: Language) => isTermComplete('GRF') && lookupTerm('GRF', l) !== null));

// ── ADIM 73: SESLİ İŞARET & HAPTİK ─────────────────────────────────────────────
check('73a. DRILL_START yüksek bip (1100Hz)', tonePreset('DRILL_START')[0].freq === 1100);
check('73b. DRILL_STOP çift zil (2 ton)', tonePreset('DRILL_STOP').length === 2);
check('73c. INJURY_ALARM düşük vızıltı (220Hz)', tonePreset('INJURY_ALARM')[0].freq === 220 && tonePreset('INJURY_ALARM')[0].type === 'sawtooth');
const fanfare = tonePreset('PB_ACHIEVED');
check('73d. PB yükselen üçlü (523→659→784Hz)', fanfare.length === 3 && fanfare[0].freq < fanfare[1].freq && fanfare[1].freq < fanfare[2].freq);
check('73e. Haptik desenler (countdown 100-50-100 / kritik 500)', JSON.stringify(hapticPattern('countdown')) === JSON.stringify([100, 50, 100]) && JSON.stringify(hapticPattern('critical-asymmetry')) === JSON.stringify([500]));
const cue = playCue('DRILL_START', 'countdown');
check('73f. Güvenli fallback (node/Web Audio yok)', cue.ok === true && (cue.usedWebAudio || cue.fallback));

// ── ADIM 74: ALT NAVİGASYON AKSİYONLARI ───────────────────────────────────────
check('74a. 5 aksiyon tanımlı', BOTTOM_ACTIONS.length === 5 && ['start-stop-drill', 'switch-athlete', 'record-voice', 'injury-stop', 'diagnostics-hud'].every((id) => BOTTOM_ACTIONS.some((a) => a.id === id)));
const state = createDefaultActionState();
check('74b. Varsayılan durum: 5 aksiyon aktif', state.actions.length === 5 && state.actions.every((a) => a.enabled));
const serialized = serializeActionState({ ...state, drillActive: true, orientation: 'landscape', currentAthleteIndex: 2 });
const restored = deserializeActionState(serialized);
check('74c. Durum serileştirme yuvarlak geçiş', restored !== null && restored.drillActive === true && restored.orientation === 'landscape' && restored.currentAthleteIndex === 2);
check('74d. Bozuk JSON → null', deserializeActionState('bozuk') === null);

// ── TRACK 5 BÜTÜNLÜK (Adım 61-75) ──────────────────────────────────────────────
check('61. XP: 100 → L2', levelForXp(100) === 2);
check('62. Rozet: IRON_STAMINA eşiği', evaluateBadges({ trimp: 200 }).some((b) => b.id === 'IRON_STAMINA'));
const streakDays: StreakDay[] = [
  { date: '2026-08-01', attended: true }, { date: '2026-08-02', attended: true },
  { date: '2026-08-03', attended: false }, { date: '2026-08-04', attended: true },
];
check('63. Streak dondurma koruması', computeStreak(streakDays, true).currentStreak === 3);
const radarInput: RadarInput = { athlete: { sprintSpeed: 7, rsi: 2, gct: 190, trimp: 120, symmetry: 5 }, cohort: { sprintSpeed: [6, 7, 8], rsi: [1, 2, 3], gct: [200, 220, 240], trimp: [50, 100, 150], symmetry: [3, 5, 8] } };
check('64. Kohort radar 5 eksen', buildCohortRadar(radarInput).length === 5);
check('65. Shader kırmızı tepesi', pressureToColor(100).r === 255);
check('66. Dashboard preset 6 widget', createDashboardLayout('COACH').widgets.length === 6);
check('67. PHV tespiti', detectPhv([{ date: '2026-01-01', heightCm: 150 }, { date: '2026-04-01', heightCm: 152.5 }] as GrowthMeasurement[]).phvDetected === true);
check('69. Sunlight AAA kontrast', contrastRatio('#0f172a', '#ffffff') >= 7);
check('70. Swipe sol', detectSwipe(-80, 10) === 'left');

const failed = results.filter((r) => !r.ok).length;
console.log(`\nSONUÇ: ${results.length - failed}/${results.length} test geçti`);
process.exit(failed > 0 ? 1 : 0);

