// ============================================================================
// 🏆 TURNUVA + EŞLEŞME + TESLİMAT SMOKE TESTİ
// Çalıştırma: npx tsx scripts/tournamentSmokeTest.mts
// ============================================================================
import { mockTournamentPlayers, generateSingleElimBracket, recordBracketScore, generateRoundRobinGroup, roundRobinStandings, eloChange, buildLeaderboard, tournamentEngineStatus } from '../src/app/lib/sports/tournamentEngine';
import { initOpenMatches, findOpenMatches, joinOpenMatch, missingAnnouncement, openMatchEngineStatus } from '../src/app/lib/sports/openMatchEngine';
import { MARKET_ITEMS, DAZE_ITEMS, placeCourtDelivery, tickDelivery, markDelivered, getDeliveryOrders, courtDeliveryEngineStatus, type DeliveryItem } from '../src/app/lib/ops/courtDeliveryEngine';

let pass = 0;
const check = (ok: boolean, label: string, detail = '') => {
  console.log(`${ok ? '✅' : '❌'} ${label}${detail ? ` — ${detail}` : ''}`);
  if (ok) pass++;
};

// 1) Tek eleme braket
const players = mockTournamentPlayers();
const bracket = generateSingleElimBracket(players);
check(bracket.length === 7 && bracket.filter((m) => m.round === 1).length === 4, 'Tek eleme braket (8→7 maç)', `${bracket.length} maç • QF ${bracket.filter((m) => m.round === 1).length}`);

// 2) Skor → üst tura otomatik geçiş
const r = recordBracketScore(bracket, 'SE-R1-M1', 6, 3);
const sf = r.bracket.find((m) => m.id === 'SE-R2-M1');
check(r.advanced !== '' && sf?.playerA === r.advanced, 'Skor girilince üst tura geçiş', `${r.advanced} → Yarı Final`);

// 3) Round robin + puan tablosu
const rr = generateRoundRobinGroup(players.slice(0, 4));
const standings = roundRobinStandings(players.slice(0, 4), rr);
check(rr.length === 6 && standings.length === 4, 'Grup sistemi + puan tablosu', `${rr.length} grup maçı • lider ${standings[0].name}`);

// 4) ELO + leaderboard
const [w, l] = players;
const elo = eloChange(w, l);
const lb = buildLeaderboard(players);
check(elo.delta > 0 && lb[0].elo >= lb[lb.length - 1].elo, 'ELO güncelleme + leaderboard', `ELO ${w.elo}→${elo.winner.elo} • lider ${lb[0].name} (${lb[0].elo})`);

// 5) Açık maç radarı — seviye filtresi
initOpenMatches();
const found = findOpenMatches(3.2);
check(found.some((m) => m.id === 'OM-01') && !found.some((m) => m.id === 'OM-03'), 'Seviye filtresi (3.2 → padel 2.5-3.5)', found.map((m) => m.id).join(','));

// 6) Tek tıkla katılım + dolu kontrolü
const join = joinOpenMatch('OM-01', 'Ela', 3.0);
check(join.ok && join.match!.joined.length === 4, 'Tek tıkla katılım → maç dolar', `${join.message}`);
const joinFull = joinOpenMatch('OM-04', 'Kaan', 3.0);
check(!joinFull.ok && joinFull.message.includes('dolu'), 'Dolu maça katılım engellendi', joinFull.message);

// 7) "Eksik oyuncu aranıyor" bildirimi
const ann = missingAnnouncement(initOpenMatches()[1]);
check(ann.includes('Eksik'), 'Eksik oyuncu bildirimi', ann);

// 8) Kort teslimatı — 120s geri sayım
const item: DeliveryItem = MARKET_ITEMS[0];
const order = placeCourtDelivery(item, 'Padel Kort A', 1);
check(order.countdownLeft === 120 && order.status === 'PREPARING', 'Sipariş verildi (120s geri sayım)', `${order.id} • ${order.item} → ${order.destination} • ₺${order.priceTl}`);

// 9) Geri sayım → kurye yönlendirme
let ticked = order;
for (let i = 0; i < 120; i++) { const t = tickDelivery(order.id); if (t) ticked = t; }
check(ticked.status === 'OUT_FOR_DELIVERY', 'Geri sayım bitince kurye yönlendirme', `${ticked.courier} → ${ticked.destination}`);

// 10) Teslim
const done = markDelivered(order.id);
check(done?.status === 'DELIVERED' && getDeliveryOrders().length >= 1, 'Sipariş teslim edildi', `${getDeliveryOrders().length} sipariş kayıtlı`);

// 11) Daze Chef hattı
const daze = placeCourtDelivery(DAZE_ITEMS[1], 'Glamping 3', 2);
check(daze.category === 'DAZE_CHEF' && daze.priceTl === 360, 'Daze Chef → Glamping siparişi', `${daze.item} ×2 → ${daze.destination} ₺${daze.priceTl}`);

console.log(`\n${'─'.repeat(48)}`);
console.log(`SMOKE TEST: ${pass}/12 geçti`);
console.log(tournamentEngineStatus());
console.log(openMatchEngineStatus());
console.log(courtDeliveryEngineStatus());
process.exit(pass === 12 ? 0 : 1);
