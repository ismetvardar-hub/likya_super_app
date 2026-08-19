// ============================================================================
// ⚖️ AI CANLI HAKEM SMOKE TESTİ — skor akışı + tüm kural ihlalleri
// Çalıştırma: npx tsx scripts/umpireSmokeTest.mts
// ============================================================================
import { pointScored, callViolation, resolveChallenge, scoreLabel, aiUmpireStatus, getUmpireDecisions, type UmpireScore } from '../src/app/lib/sports/aiLiveUmpireEngine';

let pass = 0;
const check = (ok: boolean, label: string, detail = '') => {
  console.log(`${ok ? '✅' : '❌'} ${label}${detail ? ` — ${detail}` : ''}`);
  if (ok) pass++;
};

const fresh = (): UmpireScore => ({ pointsA: 0, pointsB: 0, gamesA: 0, gamesB: 0, setsA: 0, setsB: 0, tieBreak: false, completed: false });

// 1) Klasik puan akışı: 15-Love → 30-15 → 40-30 → Game
let s = fresh();
let r = pointScored(s, 'A', 'Efe', 'Mert');
check(r.announcement.text === '15 - Love', 'İlk sayı → 15 - Love anonsu', r.announcement.text);
s = r.score;
r = pointScored(s, 'B', 'Efe', 'Mert');
check(r.announcement.text === '15 - 15', 'Karşılık → 15 - 15', r.announcement.text);
s = r.score;
r = pointScored(s, 'A', 'Efe', 'Mert');
r = pointScored(r.score, 'A', 'Efe', 'Mert');
s = r.score;
check(scoreLabel(s).points === '40 - 15', '40 - 15 durumu', scoreLabel(s).points);
r = pointScored(s, 'A', 'Efe', 'Mert');
check(r.announcement.text === 'Oyun: Efe' && r.score.gamesA === 1, 'Oyun kazanıldı + anons', r.announcement.text);

// 2) Deuce + Advantage
s = { ...fresh(), pointsA: 3, pointsB: 3 };
r = pointScored(s, 'A', 'Efe', 'Mert');
check(r.announcement.text === 'Advantage A', 'Deuce üstü → Advantage', r.announcement.text);
s = r.score;
r = pointScored(s, 'A', 'Efe', 'Mert');
check(r.announcement.text === 'Oyun: Efe', 'Advantage sonrası oyun', r.announcement.text);

// 3) Set akışı: 6-4
let setScore: UmpireScore = { ...fresh(), gamesA: 5, gamesB: 4 };
let lastR = pointScored(setScore, 'A', 'Efe', 'Mert');
for (let i = 0; i < 4; i++) { lastR = pointScored(setScore, 'A', 'Efe', 'Mert'); setScore = lastR.score; }
check(lastR.announcement.highlight === 'set' && setScore.setsA === 1, 'Set kazanıldı', lastR.announcement.text);

// 4) Tie-break akışı
let tb: UmpireScore = { ...fresh(), gamesA: 6, gamesB: 6, tieBreak: true, pointsA: 6, pointsB: 5 };
r = pointScored(tb, 'A', 'Efe', 'Mert');
check(r.announcement.text.includes('Tie-break 7-5'), 'Tie-break seti', r.announcement.text);

// 5) Maç sonu (2 set)
let match: UmpireScore = { ...fresh(), setsA: 1, gamesA: 5, gamesB: 3 };
lastR = pointScored(match, 'A', 'Efe', 'Mert');
for (let i = 0; i < 8; i++) {
  lastR = pointScored(match, 'A', 'Efe', 'Mert');
  match = lastR.score;
  if (lastR.announcement.kind === 'MATCH') break;
}
check(lastR.announcement.kind === 'MATCH' && lastR.announcement.text.includes('🏆'), 'Oyun, Set, Maç anonsu', lastR.announcement.text.slice(0, 48));

// 6) Tüm kural ihlalleri
const viols: [string, string][] = [
  ['OUT', 'OUT!'],
  ['FAULT', 'FAULT!'],
  ['DOUBLE_BOUNCE', 'ÇİFT SEKME!'],
  ['NET_TOUCH', 'FİLEYE TEMAS!'],
  ['FOOT_FAULT', 'AYAK ÇİZGİ İHLALİ!'],
];
let violOk = 0;
for (const [v, expect] of viols) {
  const a = callViolation(v as Parameters<typeof callViolation>[0]);
  if (a.text.includes(expect)) violOk++;
}
check(violOk === 5, '5 kural ihlali sesli anonsu', `${violOk}/5`);

// 7) VAR Challenge — itiraz kabul (kenar payı <8mm) + red
const upheld = resolveChallenge('OUT', 4);
check(upheld.upheld && upheld.announcement.text.includes('İTİRAZ KABUL'), 'İtiraz kabul (VAR 3D inceleme)', upheld.announcement.text.slice(0, 40));
const rejected = resolveChallenge('OUT', 42);
check(!rejected.upheld, 'İtiraz reddedildi', rejected.announcement.text.slice(0, 44));
check(getUmpireDecisions().length >= 2, 'Hakem karar günlüğü', `${getUmpireDecisions().length} karar`);

console.log(`\n${'─'.repeat(48)}`);
console.log(`SMOKE TEST: ${pass}/13 geçti`);
console.log(aiUmpireStatus());
process.exit(pass === 13 ? 0 : 1);
