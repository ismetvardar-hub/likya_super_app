// ============================================================================
// 🚀 PİLOT FAZ 8 SMOKE TESTİ — TRACK 15 UÇTAN UCA (Adım 136-140)
// KNX komut payload + otomatik karartma • turnike QR TTL + feragat/üyelik
// kilitleri • akıllı dolap anahtar + master override • WBGT ısı alarmı +
// kayma riski • Track 15 bütünlüğü. Çalıştırma: node scripts/pilotPhase8SmokeTest.mts
// ============================================================================
import { existsSync } from 'node:fs';
import {
  KnxLightingGateway, buildKnxTelegram, knxCommandFromTelegram, KNX_ECO_STANDBY_DIM_PCT,
  SESSION_LIGHT_LEAD_MS, VACANT_ECO_DELAY_MS,
} from '../src/app/lib/facility/knxLightingGateway.ts';
import {
  TurnstileAccessEngine, verifyToken, generateQrToken, QR_TOKEN_TTL_MS,
  type AthleteAccessProfile,
} from '../src/app/lib/facility/turnstileAccessEngine.ts';
import { SmartLockerController } from '../src/app/lib/facility/smartLockerController.ts';
import {
  computeWbgt, computeAdjustments, adjustBallBounce, weatherAlert, WBGT_ALERT_THRESHOLD_C,
  type WeatherInput,
} from '../src/app/lib/environment/courtWeatherEngine.ts';

const results: { name: string; ok: boolean }[] = [];
function check(name: string, cond: boolean, detail = '') {
  results.push({ name, ok: cond });
  console.log((cond ? 'PASS' : 'FAIL') + ' - ' + name + (detail ? ` — ${detail}` : ''));
}

// ── ADIM 136: KNX AYDINLATMA GATEWAY ────────────────────────────────────────
const onPayload = buildKnxTelegram('ON');
const dimPayload = buildKnxTelegram('DIM_LUX', 80);
const parsedScene = knxCommandFromTelegram('KNX/1/1/1/SCENE_STANDBY_ECO');
check('136a. Komut payload: ON/OFF/DIM telegram + roundtrip', onPayload.telegram === 'KNX/1/1/1/ON' && dimPayload.telegram === 'KNX/1/1/1/DIM_LUX:80' && dimPayload.value === 80 && parsedScene?.command === 'SCENE_STANDBY_ECO' && knxCommandFromTelegram('bozuk') === null);
const gw = new KnxLightingGateway();
gw.applyCommand('SCENE_MATCH_HIGH_INTENSITY', 100, 1000);
gw.applyCommand('SCENE_STANDBY_ECO', KNX_ECO_STANDBY_DIM_PCT, 2000);
check('136b. Komut uygulama: MATCH %100 → ECO %15 (sahne geçişi)', gw.stateSnapshot().dimPct === 15 && gw.stateSnapshot().scene === 'ECO_STANDBY' && KNX_ECO_STANDBY_DIM_PCT === 15);
const preSession = gw.applySchedule([{ courtId: 1, startsAtMs: Date.now() + 3 * 60_000 }], Date.now(), false);
check('136c. Otomatik zamanlama: seans öncesi 5dk → TURN_ON (tam güç)', preSession.action === 'TURN_ON_PRE_SESSION' && preSession.state.dimPct === 100 && SESSION_LIGHT_LEAD_MS === 5 * 60_000);
const gw2 = new KnxLightingGateway();
gw2.applyCommand('ON', 0, 0);
const eco = gw2.applySchedule([], Date.now() + VACANT_ECO_DELAY_MS + 1000, false);
check('136d. Boşlukta otomatik ECO: 10dk boş kort → %15', eco.action === 'DIM_ECO_VACANT' && eco.state.dimPct === KNX_ECO_STANDBY_DIM_PCT && VACANT_ECO_DELAY_MS === 10 * 60_000);
// ── ADIM 137: TURNİKE QR/NFC ERİŞİM ─────────────────────────────────────────
const now = 1_000_000_000;
const turnstile = new TurnstileAccessEngine('secret-1');
const profile: AthleteAccessProfile = { athleteId: 'at-1', waiverValid: true, activeBooking: true, membershipTierPaid: true, membershipTier: 'Elite' };
const qr = turnstile.issueQr(profile, now);
check('137a. QR token: 60sn TTL + zaman kovalı imza + anlık doğrulama', qr.token.startsWith('QR.at-1.') && qr.kind === 'QR' && qr.ttlMs === QR_TOKEN_TTL_MS && QR_TOKEN_TTL_MS === 60_000 && verifyToken(qr.token, 'secret-1', now).valid === true);
check('137b. TTL rotasyonu: 61sn sonra EXPIRED_TOKEN', verifyToken(qr.token, 'secret-1', now + 61_000).valid === false && verifyToken(qr.token, 'secret-1', now + 61_000).reason === 'EXPIRED_TOKEN');
check('137c. Geçerli profil → GRANTED', turnstile.authorize(profile, { token: qr.token }, now).decision === 'GRANTED');
const noWaiver = turnstile.authorize({ ...profile, waiverValid: false }, { token: turnstile.issueQr({ ...profile, waiverValid: false }, now).token }, now);
const noBooking = turnstile.authorize({ ...profile, activeBooking: false }, { token: turnstile.issueQr({ ...profile, activeBooking: false }, now).token }, now);
const noMembership = turnstile.authorize({ ...profile, membershipTierPaid: false }, { token: turnstile.issueQr({ ...profile, membershipTierPaid: false }, now).token }, now);
check('137d. Kapı kilitleri: EXPIRED_WAIVER / NO_ACTIVE_BOOKING / UNPAID_MEMBERSHIP', noWaiver.decision === 'EXPIRED_WAIVER' && noBooking.decision === 'NO_ACTIVE_BOOKING' && noMembership.decision === 'UNPAID_MEMBERSHIP');
const nfc = turnstile.issueNfc('uid-42', profile, now);
check('137e. NFC kart: 24sa geçerli + authorize + INVALID_TOKEN reddi', nfc.kind === 'NFC' && verifyToken(nfc.token, 'secret-1', now).valid === true && turnstile.authorize(profile, { uid: 'uid-42' }, now).decision === 'GRANTED' && turnstile.authorize(profile, { token: 'bozuk' }, now).decision === 'INVALID_TOKEN');

// ── ADIM 138: AKILLI DOLAP KONTROLÖRÜ ───────────────────────────────────────
const lockers = new SmartLockerController(5);
const claim = lockers.claimLocker('at-1', 1000);
check('138a. Otomatik dolap talebi: ephemeral BLE anahtar + OCCUPIED', claim.ok === true && claim.claim.ephemeral === true && claim.claim.unlockKey.startsWith('ble-') && lockers.locker(claim.claim.lockerId)?.status === 'OCCUPIED');
const release = lockers.releaseLocker(claim.claim.lockerId, 'at-1');
check('138b. Çıkış: sanitasyon PENDING (Adım 91) + denetim sonrası AVAILABLE', release.ok === true && release.release.sanitizationStatus === 'PENDING' && lockers.locker(claim.claim.lockerId)?.status === 'INSPECTION' && (lockers.inspectAndReturn(claim.claim.lockerId), lockers.locker(claim.claim.lockerId)?.status === 'AVAILABLE'));
const override = lockers.emergencyMasterUnlock(claim.claim.lockerId, 'coach-1');
check('138c. Koç master override: kilit açılır + gerekçe', override.unlocked === true && override.reason.includes('master override'));
const full = new SmartLockerController(1);
full.claimLocker('a', 0);
const noSlot = full.claimLocker('b', 0);
const wrongAthlete = new SmartLockerController(1);
const clWrong = wrongAthlete.claimLocker('x', 0);
const wrongRelease = wrongAthlete.releaseLocker(clWrong.claim.lockerId, 'y');
check('138d. Dolu havuz → NO_LOCKER_AVAILABLE + yanlış sporcu reddi', noSlot.ok === false && wrongRelease.ok === false);
// ── ADIM 139: ÇEVRESEL HAVA & ZEMİN TELAFİ ──────────────────────────────────
check('139a. WBGT hesabı: 30°C/%60 → 26.4 · 33°C/%70 → 30.0 (eşik 28)', computeWbgt(30, 60) === 26.4 && computeWbgt(33, 70) === 30 && WBGT_ALERT_THRESHOLD_C === 28);
const adj = computeAdjustments({ tempC: 24, humidityPct: 60, windKph: 12, surfaceWetnessPct: 50 });
check('139b. Zemin telafisi: zıplama -%8.4 · slip 0.42 · sürtünme 0.58', adj.ballBounceReductionPct === 8.4 && adj.slipRisk === 0.42 && adj.frictionCoefficient === 0.58);
const bounce = adjustBallBounce(0.95, { tempC: 24, humidityPct: 60, windKph: 12, surfaceWetnessPct: 50 });
check('139c. Top zıplama düzeltmesi: 0.95m → 0.87m (ıslaklık/nem)', bounce.adjustedM === 0.87 && bounce.reductionPct === 8.4);
const weatherHot: WeatherInput = { tempC: 33, humidityPct: 70, windKph: 5, surfaceWetnessPct: 0 };
const alertHot = weatherAlert(weatherHot);
check('139d. WBGT > 28 → SICAK ÇARPMASI hidrasyon molası (emergency)', alertHot.triggered === true && alertHot.severity === 'emergency' && alertHot.message.includes('SICAK ÇARPMASI') && alertHot.wbgtC === 30);
const alertSlip = weatherAlert({ tempC: 22, humidityPct: 50, windKph: 10, surfaceWetnessPct: 90 });
check('139e. Kaygan zemin → warning + normal koşul → tetiklenmez', alertSlip.triggered === true && alertSlip.severity === 'warning' && weatherAlert({ tempC: 20, humidityPct: 40, windKph: 8, surfaceWetnessPct: 0 }).triggered === false);

// ── ADIM 140: TRACK 15 UÇTAN UCA BÜTÜNLÜK ───────────────────────────────────
const track15Files = [
  'src/app/lib/facility/knxLightingGateway.ts',
  'src/app/lib/facility/turnstileAccessEngine.ts',
  'src/app/lib/facility/smartLockerController.ts',
  'src/app/lib/environment/courtWeatherEngine.ts',
  'src/modules/facility/KnxLightingControlView.tsx',
  'scripts/pilotPhase8SmokeTest.mts',
];
check('140a. Track 15 dosyaları: 4 motor + 1 komponent + smoke mevcut', track15Files.every((f) => existsSync(f)));
const cross = preSession.action === 'TURN_ON_PRE_SESSION' && turnstile.authorize(profile, { token: qr.token }, now).decision === 'GRANTED' && noMembership.decision === 'UNPAID_MEMBERSHIP' && claim.ok === true && alertHot.severity === 'emergency' && bounce.adjustedM === 0.87;
check('140b. Track 15 veri hattı: KNX + turnike + dolap + hava uçtan uca', cross === true);

const failed = results.filter((r) => !r.ok).length;
console.log(`\nSONUÇ: ${results.length - failed}/${results.length} test geçti`);
process.exit(failed > 0 ? 1 : 0);


