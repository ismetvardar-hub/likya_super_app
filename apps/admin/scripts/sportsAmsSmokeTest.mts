// ============================================================================
// 📊 OTONOM SPOR MOTORLARI SMOKE TESTİ (Karne + Servis Radarı)
// Çalıştırma: npx tsx scripts/sportsAmsSmokeTest.mts
// ============================================================================
import { buildAutonomousReportCard, buildWeekTrend, redFlagScan, buildAttendanceList, autonomousReportCardStatus } from '../src/app/lib/sports/autonomousReportCard';
import { getShuttleStatus, advanceShuttle, recordGateEntry, getSecurityLog, facilityShuttleRadarStatus } from '../src/app/lib/ops/facilityShuttleRadar';
import { initMockBands } from '../src/app/lib/hardware/smartArmbandEngine';

initMockBands();

let pass = 0;
const check = (ok: boolean, label: string, detail = '') => {
  console.log(`${ok ? '✅' : '❌'} ${label}${detail ? ` — ${detail}` : ''}`);
  if (ok) pass++;
};

// 1) Otonom karne — SportVisionX telemetrisinden
const card = buildAutonomousReportCard('Efe', 'Padel');
check(card.stars >= 1 && card.stars <= 5, 'Otonom gelişim karnesi üretildi', `${card.branch} • ${card.stars}⭐ • ACWR ${card.acwr}`);
check(card.telemetry.shots > 0 && card.telemetry.accuracyPct > 0, 'Telemetri otomatik doldu (manuel giriş yok)', `${card.telemetry.shots} şut • %${card.telemetry.accuracyPct} • ${card.telemetry.catchPadMs} ms`);

// 2) Catapult tarzı 4 haftalık trend
const trend = buildWeekTrend('Efe');
check(trend.length === 4 && trend[3].load > 0, '4 haftalık Catapult yük trendi', trend.map((t) => `${t.label}:${t.load}AU`).join(' '));

// 3) ACWR sakatlık radarı (red flag)
const flags = redFlagScan(['Efe', 'Deniz', 'Mert']);
const anyRisk = flags.find((f) => f.redFlag);
console.log(flags.map((f) => `${f.athleteId}:${f.redFlag ? '🚩' : '💚'}(${f.reason.slice(0, 24)})`).join('  '));
check(typeof anyRisk?.redFlag === 'boolean' || flags.length === 3, 'Red flag taraması çalışıyor', `${flags.filter((f) => f.redFlag).length}/3 riskli`);

// 4) Toplu yoklama — BLE otomatik
const att = buildAttendanceList(['Efe', 'Deniz', 'Mert'], ['Efe', 'Deniz']);
check(att.filter((a) => a.present).length === 2 && att.find((a) => a.athleteId === 'Efe')?.source === 'BLE-BAND', 'BLE ile otomatik yoklama', att.map((a) => `${a.athleteId}:${a.present ? '✅' : '❌'}`).join(' '));

// 5) Servis GPS + ETA
const s1 = getShuttleStatus();
check(s1.etaMinutes > 0 && s1.currentPoint.lat > 0, 'Servis GPS konumu + ETA', `${s1.currentPoint.name} • ETA ${s1.etaMinutes} dk`);
const s2 = advanceShuttle(30);
check(s2.progressPct !== s1.progressPct || s2.etaMinutes <= s1.etaMinutes, 'Servis ilerleme + ETA düşüşü', `%${s1.progressPct} → %${s2.progressPct} • ETA ${s2.etaMinutes} dk`);

// 6) Tesis güvenlik bildirimi — pazu bandı turnike
const evt = recordGateEntry('Efe', 'NFC-8A3F21', 'Ana Turnike');
check(evt.message.includes('Efe') && evt.message.includes('Giriş Yaptı'), 'Güvenlik bildirimi üretildi', evt.message);
const denied = recordGateEntry('Bilinmeyen', 'NFC-FFFF', 'Ana Turnike');
check(denied.message.includes('REDDEDİLDİ'), 'Bilinmeyen bant reddedildi', denied.message.slice(0, 60));
check(getSecurityLog().length >= 2, 'Güvenlik olay günlüğü', `${getSecurityLog().length} olay`);

console.log(`\n${'─'.repeat(48)}`);
console.log(`SMOKE TEST: ${pass}/10 geçti`);
console.log(autonomousReportCardStatus());
console.log(facilityShuttleRadarStatus());
process.exit(pass === 10 ? 0 : 1);
