// ============================================================================
// 🦶 AKILLI TABANLIK + FÜZYON SMOKE TESTİ
// Çalıştırma: npx tsx scripts/insoleSmokeTest.mts
// ============================================================================
import { generateStepTelemetry, computeContactMetrics, classifyGait, gaitLabel, computeAsymmetry, insoleRiskRadar, simulatePressureMatrix, smartInsoleEngineStatus } from '../src/app/lib/sports/smartInsoleEngine';
import { fuseSensorStream, coachGuidance, type CameraObservation } from '../src/app/lib/sports/multimodalFusionBridge';
import { initMockBands } from '../src/app/lib/hardware/smartArmbandEngine';

initMockBands();

let pass = 0;
const check = (ok: boolean, label: string, detail = '') => {
  console.log(`${ok ? '✅' : '❌'} ${label}${detail ? ` — ${detail}` : ''}`);
  if (ok) pass++;
};

// 1) 6 nokta basınç matrisi
const m = simulatePressureMatrix(7, 'R');
check(m.heel > m.midfoot && m.met1 > 50, '6 nokta basınç matrisi üretildi', `Topuk ${m.heel}kPa • Met1 ${m.met1} • Met5 ${m.met5} • Kavsi ${m.midfoot}`);

// 2) GCT + RSI
const cm = computeContactMetrics(180, 240);
check(cm.rsi === 1.33 && !cm.fatigue && cm.band === 'Elit Seviye', 'GCT + RSI hesaplayıcı', `RSI ${cm.rsi} • ${cm.band}`);
const cmFat = computeContactMetrics(235, 200);
check(cmFat.fatigue && cmFat.band.includes('Yorgunluk'), 'GCT>220 yorgunluk tespiti', `GCT 235ms → ${cmFat.band}`);

// 3) Pronasyon sınıflandırıcı
check(classifyGait(6.2) === 'PRONATION' && gaitLabel(classifyGait(6.2)) === 'İçe Basma (Aşırı Pronasyon)', 'Pronasyon sınıflandırıcı', '6.2° → İçe Basma');
check(classifyGait(2.0) === 'NEUTRAL', 'Nötr basma', '2.0° → Nötr');
check(classifyGait(-3.1) === 'SUPINATION', 'Supinasyon', '-3.1° → Dışa Basma');

// 4) Asimetri + risk radarı
check(computeAsymmetry(1.0, 0.85) === 15.0, 'Asimetri hesabı', '%15 (sakınarak basma)');
const risky = generateStepTelemetry('R', 1.0, 0.85, 15);
const riskyAlerts = insoleRiskRadar(risky);
check(riskyAlerts.some((a) => a.code === 'ASYMMETRY'), 'Asimetri > %10 → RISK_ALERT', riskyAlerts.map((a) => a.code).join(', '));

// 5) 3'lü füzyon
const cam: CameraObservation = { trackingId: 'TRK-004', court: 'Padel Kort A', speedMps: 4.2, displacementM: 120 };
const snap = fuseSensorStream('Efe', cam, 'BLE-7C91-E2', initMockBands(), generateStepTelemetry('R', 1.0, 1.02, 3));
check(snap.armband.matched && snap.fusionScore > 50, 'Kamera+Pazu+Tabanlık füzyonu', `skor ${snap.fusionScore}/100 • zon ${snap.fatigueZone}`);
check(snap.summary.includes('Efe') && snap.summary.includes('GCT'), 'Füzyon özet raporu', snap.summary.slice(0, 72));

// 6) Koçluk kararı
const g = coachGuidance(snap.fatigueZone, snap.alerts);
check(g.length > 10, 'Zon ağırlıklı koçluk kararı', g.slice(0, 50));

// 7) Kritik senaryo: yüksek darbe + asimetri → RED zon
const critical = fuseSensorStream('Mert', cam, 'BLE-NONE', initMockBands(), generateStepTelemetry('L', 0.95, 0.7, 40));
check(critical.fatigueZone === 'RED' || critical.fatigueZone === 'YELLOW', 'Kritik senaryo zonu', `zon ${critical.fatigueZone} • ${coachGuidance(critical.fatigueZone, critical.alerts).slice(0, 40)}`);

console.log(`\n${'─'.repeat(48)}`);
console.log(`SMOKE TEST: ${pass}/12 geçti`);
console.log(smartInsoleEngineStatus());
process.exit(pass === 12 ? 0 : 1);
