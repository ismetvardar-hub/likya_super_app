// ============================================================================
// 🏛️ ÇOK BRANŞLI EVRENSEL AI HAKEM SMOKE TESTİ — 5 branş
// Çalıştırma: npx tsx scripts/multiSportSmokeTest.mts
// ============================================================================
import { initMultiSportMatch, scoreEvent, callMultiViolation, multiSportRefereeStatus, type MultiSportRefereeState } from '../src/app/lib/sports/multiSportRefereeEngine';

let pass = 0;
const check = (ok: boolean, label: string, detail = '') => {
  console.log(`${ok ? '✅' : '❌'} ${label}${detail ? ` — ${detail}` : ''}`);
  if (ok) pass++;
};

// 1) FUTBOL — gol + GLT + ofsayt + kart
let fb = initMultiSportMatch('FOOTBALL', 'Likya', 'Rakip');
fb = scoreEvent(fb, 'GOAL_HOME').state;
fb = scoreEvent(fb, 'MINUTE_TICK').state;
let r = scoreEvent(fb, 'GLT_CHECK');
check(fb.football!.homeGoals === 1 && r.announcement.text.includes('GOAL'), 'Futbol gol + GLT', r.announcement.text.slice(0, 42));
r = scoreEvent(fb, 'OFFSIDE_CALL');
check(r.announcement.text.includes('OFSAYT'), 'Yarı-otomatik ofsayt', r.announcement.text.slice(0, 38));
r = scoreEvent(fb, 'RED_CARD');
check(fb.football!.redCards === 1 || r.announcement.text.includes('Kırmızı'), 'Kırmızı kart', r.announcement.text.slice(0, 34));

// 2) BASKETBOL — 2P/3P + şut saati + steps + bonus faul
let bb = initMultiSportMatch('BASKETBALL', 'Likya', 'Rakip');
bb = scoreEvent(bb, 'TWO_PT_HOME').state;
bb = scoreEvent(bb, 'THREE_PT_HOME').state;
bb = scoreEvent(bb, 'SHOT_CLOCK_14').state;
check(bb.basketball!.homePts === 5 && bb.basketball!.shotClock === 14, 'Basketbol 2P+3P + şut saati 14s', `${bb.basketball!.homePts} sayı • ${bb.basketball!.shotClock}s`);
r = scoreEvent(bb, 'STEPS_CALL');
check(r.announcement.text.includes('YÜRÜME'), 'Hatalı yürüme (steps)', r.announcement.text.slice(0, 30));
let foulState = bb;
for (let i = 0; i < 5; i++) foulState = scoreEvent(foulState, 'FOUL_CALL').state;
check(foulState.basketball!.bonusFoul === true, '5. faul → BONUS', `${foulState.basketball!.fouls} faul`);

// 3) VOLEYBOL — 25 puan set akışı
let vb = initMultiSportMatch('VOLLEYBALL', 'Likya', 'Rakip');
for (let i = 0; i < 24; i++) vb = scoreEvent(vb, 'POINT_HOME').state;
check(vb.volleyball!.homePts === 24 && vb.volleyball!.homeSets === 0, 'Voleybol 24-0 durumu', `${vb.volleyball!.homePts}-${vb.volleyball!.awayPts}`);
r = scoreEvent(vb, 'POINT_HOME');
check(r.announcement.kind === 'SET' && r.state.volleyball!.homeSets === 1, '25. puan → SET', r.announcement.text.slice(0, 30));
r = callMultiViolation('VOLLEYBALL', 'DOUBLE_TOUCH');
check(r.text.includes('ÇİFT VURUŞ'), 'Voleybol çift vuruş', r.text);
r = callMultiViolation('VOLLEYBALL', 'NET_TOUCH');
check(r.text.includes('FİLEYE'), 'Voleybol file teması', r.text.slice(0, 26));

// 4) TENİS / PADEL — racket akışı
let tk = initMultiSportMatch('PADEL', 'Efe', 'Mert');
tk = scoreEvent(tk, 'RACKET_HOME').state;
tk = scoreEvent(tk, 'RACKET_AWAY').state;
check(tk.racket!.pointsA === 1 && tk.racket!.pointsB === 1, 'Padel 15-15', `${tk.racket!.pointsA}-${tk.racket!.pointsB}`);
tk = scoreEvent(tk, 'RACKET_HOME').state;
tk = scoreEvent(tk, 'RACKET_HOME').state;
r = scoreEvent(tk, 'RACKET_HOME');
check(r.announcement.text === 'Oyun: Efe' && r.state.racket!.gamesA === 1, 'Padel oyun kazanma', r.announcement.text);

// 5) Branş geçişi + çok dilli anons metni
const switched = initMultiSportMatch('FOOTBALL');
const switchOk = switched.sport === 'FOOTBALL' && switched.football !== undefined;
check(switchOk, 'Branş seçici (Futbol → durum şeması)', `${switched.sport} • ${multiSportRefereeStatus(switched.sport).slice(0, 40)}`);

console.log(`\n${'─'.repeat(48)}`);
console.log(`SMOKE TEST: ${pass}/13 geçti`);
process.exit(pass === 13 ? 0 : 1);
