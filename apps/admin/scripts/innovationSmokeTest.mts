// ============================================================================
// 🚀 6 DEVRİMSEL MODÜL SMOKE TESTİ
// Reels • Fit-Gaming • VAR Light • IoT Kort Enerji • Ortopedi • Geofencing
// Çalıştırma: npx tsx scripts/innovationSmokeTest.mts
// ============================================================================
import { captureHighlight, getClips, viralClipEngineStatus } from '../src/app/lib/sports/viralClipEngine';
import { addFitXp, buildLeaderboards, generateDazeCoupon, leagueProgress, fitGamingStatus, type GamerProfile } from '../src/app/lib/sports/fitGamingEngine';
import { reviewLineDecision, simulateBallDrop, varLightStatus } from '../src/app/lib/sports/varLightEngine';
import { courtEntryOn, courtIdleTick, courtEnergyStatus } from '../src/app/lib/ops/courtEnergyAutomation';
import { runOrthopedicTest, orthopedicPrescription, orthopedicGaitStatus } from '../src/app/lib/sports/orthopedicGaitAnalysis';
import { scanChildLocation, clearGeofenceAlert, getGeofenceAlerts, geofencingStatus } from '../src/app/lib/security/geofencingProtection';

let pass = 0;
const check = (ok: boolean, label: string, detail = '') => {
  console.log(`${ok ? '✅' : '❌'} ${label}${detail ? ` — ${detail}` : ''}`);
  if (ok) pass++;
};

// 1) Viral Reels — eşik kontrolü
const fast = captureHighlight('Efe', 92, 4.2, 6);
const slow = captureHighlight('Deniz', 60, 2.0, 3);
check(fast !== null && fast.tier === 'VİRAL', 'Vuruş >85km/s → klip tetiklendi', `${fast!.overlay.speedLabel} • ${fast!.tier}`);
check(slow === null, 'Eşik altı vuruş kaydedilmez', '60 km/s → atlandı');
check(fast!.shareUrls.instagramStory.startsWith('https://instagram'), 'Instagram Story paylaş linki', fast!.shareUrls.whatsapp.slice(0, 34));

// 2) Fit-Gaming — XP + lig + rozet + liderlik + kupon
let p: GamerProfile = { athleteId: 'Efe', xp: 0, league: 'Bronz', badges: [], bestReactionMs: 9999, topSpeedKmh: 0 };
p = addFitXp(p, 350, 70, 92, 78);
check(p.league !== 'Bronz' || p.xp > 0, 'XP kazanıldı', `${p.xp} XP • ${p.league}`);
check(p.badges.some((b) => b.includes('Hızlı El')) && p.badges.some((b) => b.includes('Kovan')), 'Rozetler verildi', p.badges.join(' • '));
const prog = leagueProgress(p);
check(typeof prog.pct === 'number' && prog.pct >= 0, 'Lig ilerleme barı', `%${prog.pct} → ${prog.nextLeague}`);
const lbs = buildLeaderboards([p, { athleteId: 'Mert', xp: 1200, league: 'Altın', badges: [], bestReactionMs: 320, topSpeedKmh: 96 }]);
check(lbs.reaction[0].athleteId === 'Mert' && lbs.speed[0].athleteId === 'Mert', 'Hız Şampiyonu / Reaksiyon Kralı', `Reaksiyon: ${lbs.reaction[0].athleteId} (${lbs.reaction[0].value}ms)`);
const coupon = generateDazeCoupon('Efe', 'Smoothie');
check(coupon.code.startsWith('DAZE-'), 'Daze Chef ödül kuponu', `${coupon.reward} • ${coupon.code}`);

// 3) VAR Light — IN/OUT karar motoru
const out = reviewLineDecision('Baseline', -30, 12);
const inn = reviewLineDecision('Servis Çizgisi', 20, -8);
check(out.verdict === 'OUT' && out.message.includes('DIŞARIDA'), 'Dışarıda kararı', `${out.marginMm}mm`);
check(inn.verdict === 'IN' && inn.message.includes('İÇERİDE'), 'İçeride kararı', `${inn.marginMm}mm`);
const sim = simulateBallDrop('Baseline', 6);
check(sim.confidencePct >= 90, 'Mock top düşüşü (optik simülasyon)', `${sim.verdict} • %${sim.confidencePct}`);

// 4) IoT Kort Enerji — LIGHTS_ON → 2dk boşluk → ENERGY_SAVING
const on = courtEntryOn('Padel Kort A', 'Efe');
check(on.state === 'LIGHTS_ON' && on.floodlightsPct === 100, 'Kort girişi → LIGHTS_ON', `${on.powerKw} kW • ${on.triggeredBy}`);
let idle = on;
for (let i = 0; i < 121; i++) idle = courtIdleTick('Padel Kort A');
check(idle.state === 'ENERGY_SAVING', '2dk BLE boşluk → ENERGY_SAVING', `%${idle.floodlightsPct} • ${idle.powerKw} kW`);
check(courtEnergyStatus('Padel Kort A').includes('🌙'), 'Enerji durum göstergesi', courtEnergyStatus('Padel Kort A'));

// 5) Ortopedi — kavis çökmesi + tabanlık reçetesi
const ortho = runOrthopedicTest('Efe', 12);
check(ortho.archCollapseMm > 0 && ortho.spineBalancePct >= 85, '3dk basış testi raporu', `kavis ${ortho.archCollapseMm}mm • omurga %${ortho.spineBalancePct}`);
check(ortho.advice.length > 20, 'Sağlık tavsiyesi üretildi', ortho.advice.slice(0, 46));
check(orthopedicPrescription(ortho).includes('önerildi'), 'Ortopedik tabanlık yönlendirmesi', orthopedicPrescription(ortho).slice(0, 44));

// 6) Geofencing — çocuk koruma kalkanı
const safe = scanChildLocation('Efe', 'BLE-COURT-1');
check(safe.safe === true, 'Güvenli bölgede tespiti', `Kortlar perimeter 120m`);
const danger = scanChildLocation('Efe', 'BLE-OTOPARK-1', 'Otopark');
check(danger.safe === false && danger.alert?.message.includes('GEOFENCE_ALERT'), 'Güvenli alan dışı alarmı', danger.alert!.message.slice(0, 56));
const cleared = clearGeofenceAlert(danger.alert!.id);
check(cleared?.cleared === true, 'Resepsiyon uyarı temizleme', cleared.message.slice(0, 40));
check(getGeofenceAlerts().length >= 1, 'Alarm günlüğü', `${getGeofenceAlerts().length} kayıt`);

console.log(`\n${'─'.repeat(48)}`);
console.log(`SMOKE TEST: ${pass}/21 geçti`);
console.log(viralClipEngineStatus());
console.log(fitGamingStatus());
console.log(varLightStatus());
console.log(orthopedicGaitStatus());
console.log(geofencingStatus());
process.exit(pass === 21 ? 0 : 1);
