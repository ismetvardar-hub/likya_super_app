// ============================================================================
// 🎬 ZERO-COST AI & MULTIMEDIA SMOKE TESTİ
// Klip Fabrikası • TTS Sesli Koç • Sunum Deck • Araştırma Adaptörü
// Çalıştırma: npx tsx scripts/multimediaAiSmokeTest.mts
// ============================================================================
import { detectHighPowerMoments, buildClipTimestamps, formatVerticalClips, buildBrowserClipPlan, buildClipWebhookPayload, clipFactoryStatus } from '../src/app/lib/sports/video/clipFactoryEngine';
import { VOICE_CUES, cueForTelemetry, playTtsCue, edgeTtsFallbackUrl, speechFeedbackStatus } from '../src/app/lib/sports/audio/speechFeedbackEngine';
import { buildDeckMarkdown, buildDeckHtml, buildInvestorDeck, buildScoutDeck, presentationDeckStatus } from '../src/modules/reports/presentationDeckGenerator';
import { formatCitedAnswer, suggestDrillForWeakZone, omniRouteResearchStatus, type CitedAnswer } from '../src/app/lib/ai/routing/omniRouteResearchAdapter';

let pass = 0;
const check = (ok: boolean, label: string, detail = '') => {
  console.log(`${ok ? '✅' : '❌'} ${label}${detail ? ` — ${detail}` : ''}`);
  if (ok) pass++;
};

// ── A. Klip Fabrikası ──
const telemetry = [
  { tSec: 10, rsi: 1.2, speedKmh: 12, hr: 140 },
  { tSec: 30, rsi: 2.3, speedKmh: 18, hr: 152 },   // RSI elit
  { tSec: 42, rsi: 1.8, speedKmh: 23.5, hr: 168 }, // sprint
  { tSec: 55, rsi: 1.5, speedKmh: 15, hr: 178 },   // HR spike
  { tSec: 80, rsi: 1.1, speedKmh: 14, hr: 145 },
];
const hot = detectHighPowerMoments(telemetry);
check(hot.length === 3, 'Yüksek güç anı tespiti (RSI/sprint/HR)', hot.map((h) => h.tSec).join('s,') + 's');
const clips = buildClipTimestamps(telemetry);
check(clips.length === 3 && clips[0].reason.includes('RSI'), 'Klip timestamp üretici', clips.map((c) => `${c.startSec}-${c.endSec}`).join(', '));
const vertical = formatVerticalClips(clips);
check(vertical[0].includes('9:16 Reels'), '9:16 Reels format', vertical[0]);
const plan = buildBrowserClipPlan(clips[0]);
check(plan.canvas.width === 1080 && plan.canvas.height === 1920, 'Dikey Canvas planı (1080x1920)', `${plan.canvas.width}x${plan.canvas.height}`);
const wh = buildClipWebhookPayload(clips[0], '2short', 'video.mp4');
const ff = buildClipWebhookPayload(clips[0], 'ffmpeg', 'video.mp4');
check(wh.url.includes('2short') && String(ff.body.filter).startsWith('scale=1080:1920'), 'Açık webhook adaptörleri', '2short + ffmpeg');

// ── B. TTS Sesli Koç ──
check(VOICE_CUES.GOOD_SERVE.includes('servis hızı'), 'Türkçe sesli cümle', VOICE_CUES.GOOD_SERVE);
check(cueForTelemetry(2.1, 30, 18, 160, 20) === VOICE_CUES.ELITE_RSI, 'RSI eşiği → Elit cümle', cueForTelemetry(2.1, 30, 18, 160, 20));
check(cueForTelemetry(1.2, 60, 12, 150, 20) === VOICE_CUES.HEEL_STRIKE, 'Topuk >%50 → uyarı cümle', cueForTelemetry(1.2, 60, 12, 150, 20));
const cue = playTtsCue({ key: 'SPRINT' });
check(edgeTtsFallbackUrl('test').includes('tr-TR'), 'Edge TTS fallback URL', 'sıfır maliyet');
check(typeof cue.spoken === 'boolean', 'Web Speech trigger', cue.spoken ? 'tarayıcıda sesli' : 'fallback');

// ── C. Sunum Deck ──
const investor = buildInvestorDeck({ clubName: 'ExtremeS', coach: 'Caner', season: '2026', athleteCount: 24, totalTrimp: 12400, injuryFlags: 2, topAthlete: 'Arda', topRsi: 2.2, commercial: [{ metric: 'Üyelik', value: '₺1.2M' }] });
const md = buildDeckMarkdown(investor);
check(md.split('---').length >= 5, 'Markdown slayt üretici', `${md.split('---').length} slayt`);
const html = buildDeckHtml(investor);
check(html.includes('<section>') && html.includes('</html>'), 'Reveal tarzı HTML deck', `${html.length} karakter`);
const scout = buildScoutDeck('Arda', [{ metric: 'RSI', value: '2.2' }]);
check(scout[1].bullets[0].includes('RSI'), 'Scout deck metrikleri', scout[1].bullets[0]);

// ── D. Araştırma Adaptörü ──
const cited: CitedAnswer = { answer: 'ACWR 1.4 üstü risk', sources: [{ title: 'JSCR', url: 'https://jscr.com' }], engine: 'test', latencyMs: 40 };
check(formatCitedAnswer(cited).includes('**Kaynaklar**') && formatCitedAnswer(cited).includes('JSCR'), 'Alıntı formatı', formatCitedAnswer(cited).split('\n')[0]);
const drill = suggestDrillForWeakZone('foot_strike');
check(drill.drill.includes('Forefoot') && drill.source.includes('Frontiers'), 'Zayıf bölge → drill önerisi', drill.drill);
check(omniRouteResearchStatus().includes('OmniRoute'), 'Araştırma adaptörü durumu', '');

console.log(`\n${'─'.repeat(48)}`);
console.log(`SMOKE TEST: ${pass}/16 geçti`);
console.log(clipFactoryStatus());
console.log(speechFeedbackStatus());
console.log(presentationDeckStatus());
console.log(omniRouteResearchStatus());
process.exit(pass === 16 ? 0 : 1);
