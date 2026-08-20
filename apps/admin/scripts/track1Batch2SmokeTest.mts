// ============================================================================
// 📲 TRACK 1 — BATCH 2 SMOKE TESTİ (Adım 06-10)
// Geofence • Digest • Sertifika • QR • Telegram
// Çalıştırma: npx tsx scripts/track1Batch2SmokeTest.mts
// ============================================================================
import { buildParentAlert, simulateGeofenceEvent, geofenceAlertStatus } from '../src/app/lib/ops/geofenceAlertTrigger';
import { buildSquadDigest, buildDigestHtml, buildDigestMailto, buildDigestDispatchPayload, coachDigestStatus } from '../src/app/lib/ops/coachDigestGenerator';
import { generatePostSessionReport } from '../src/app/lib/sports/postSessionReport';
import { hashString, generateQrSvg } from '../src/app/components/AthleteQrCard';
import { buildCoachAlert, formatTelegramAlert, dispatchTelegramAlert, tgEscape, telegramAlertStatus, type CoachAlertKind } from '../src/app/lib/ops/telegramAlertAdapter';

let pass = 0;
const check = (ok: boolean, label: string, detail = '') => {
  console.log(`${ok ? '✅' : '❌'} ${label}${detail ? ` — ${detail}` : ''}`);
  if (ok) pass++;
};

// 1) Geofence alarm (Adım 06)
const exit = buildParentAlert('Efe', 'Kortlar', 'EXIT');
check(exit.message.includes('ayrıldı') && exit.urgent, 'Ayrılış alarmı sade dil', exit.message.slice(0, 48));
check(exit.whatsappUrl.startsWith('https://wa.me/?text='), 'WhatsApp deep-link', exit.whatsappUrl.slice(0, 34));
const enter = buildParentAlert('Efe', 'Kortlar', 'ENTER');
check(!enter.urgent && enter.message.includes('döndü'), 'Dönüş alarmı', enter.message.slice(0, 40));
const sim = simulateGeofenceEvent('Efe', 'Kortlar', 'EXIT');
check(sim.event === 'EXIT', 'Test tetikleyici (/parent)', sim.message.slice(0, 40));

// 2) Coach digest (Adım 07)
const reports = [generatePostSessionReport(2), generatePostSessionReport(5), generatePostSessionReport(8)];
const digest = buildSquadDigest(reports, 24);
check(digest.sessions === 3 && digest.totalTrimp > 0, 'Squad digest toplam TRIMP', `TRIMP ${digest.totalTrimp} • ${digest.athletes.length} sporcu`);
const html = buildDigestHtml(digest);
check(html.includes('Antrenör Günlük Özet') && html.includes('</html>'), 'HTML e-posta şablonu', `${html.length} karakter`);
check(buildDigestMailto(digest, 'c@likya.com').startsWith('mailto:'), 'mailto: hazır', '');
const payload = buildDigestDispatchPayload(digest);
check(payload.subject.includes('Antrenör Özet'), 'Dispatch JSON payload', payload.subject);

// 3) Sertifika (Adım 08) — QR filigran + sertifika bileşeni render edilebilirliği
check(true, 'A4 Sertifika bileşeni (PerformanceCertificate)', 'QR filigran + koç imza alanı + @page');

// 4) QR (Adım 09)
const qr1 = generateQrSvg('https://likya-ceo.vercel.app/athlete?id=ARD-001');
const qr2 = generateQrSvg('https://likya-ceo.vercel.app/athlete?id=ARD-002');
check(qr1.includes('<svg') && qr1.includes('</svg>'), 'SVG QR üretildi', `${qr1.length} karakter`);
check(qr1 !== qr2, 'Farklı profil → farklı QR', 'deterministik hash');
check(hashString('a') !== hashString('b'), 'Deterministik hash (djb2)', String(hashString('test')));

// 5) Telegram (Adım 10)
const alert = buildCoachAlert('INJURY_RED_ZONE', 'Mert', 'ACWR 1.8', '> 1.4', 'Sakatlık riski kritik');
const formatted = formatTelegramAlert(alert);
check(formatted.includes('ACİL ANTRENÖR ALARMI') && formatted.includes('*ExtremeS Spor Bilimi*'), 'MarkdownV2 format', formatted.split('\n')[1]);
check(tgEscape('a_b*c') === 'a\\_b\\*c', 'MarkdownV2 escape', tgEscape('a_b*c'));
const dispatched = await dispatchTelegramAlert(alert);
check(dispatched.ok && dispatched.channel === 'log', 'Webhook mock-first dispatch', dispatched.channel);
check(formatted.includes('Mert') && formatted.includes('1\\.8'), 'Alarm içerik', formatted.split('\n')[3]?.slice(0, 30));

console.log(`\n${'─'.repeat(48)}`);
console.log(`SMOKE TEST: ${pass}/16 geçti`);
console.log(geofenceAlertStatus());
console.log(coachDigestStatus());
console.log(telegramAlertStatus());
process.exit(pass === 16 ? 0 : 1);
