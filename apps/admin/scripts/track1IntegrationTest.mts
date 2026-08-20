// ============================================================================
// 🧪 TRACK 1 UÇTAN UCA ENTEGRASYON TESTİ (Adım 15)
// Akış: Tercih kaydet → Eşik alarm tetikle → Duyusal geri bildirim sevk →
//       Paylaş/Export çıktısı doğrula
// Çalıştırma: npx tsx scripts/track1IntegrationTest.mts
// ============================================================================
import { DEFAULT_PREFS, type NotificationPreferences } from '../src/app/components/NotificationPreferences';
import { simulateGeofenceEvent } from '../src/app/lib/ops/geofenceAlertTrigger';
import { buildCoachAlert, formatTelegramAlert, dispatchTelegramAlert } from '../src/app/lib/ops/telegramAlertAdapter';
import { playFeedback, sensoryForThreshold, TONE_PATTERNS, HAPTIC_PATTERNS } from '../src/app/lib/ops/sensoryFeedbackEngine';
import { samplesToCsv, samplesToJson, buildDemoSessionSamples } from '../src/app/lib/ops/sessionDataExporter';
import { SHARE_TEMPLATES, whatsappShareUrl } from '../src/app/lib/ops/communicationSuite';
import { renderClubTemplate } from '../src/app/lib/ops/clubMessageTemplates';

let pass = 0;
const check = (ok: boolean, label: string, detail = '') => {
  console.log(`${ok ? '✅' : '❌'} ${label}${detail ? ` — ${detail}` : ''}`);
  if (ok) pass++;
};

// ── 1. Tercih kaydet (Adım 11) ──
const prefs: NotificationPreferences = { ...DEFAULT_PREFS, sessionDigest: true };
check(prefs.geofenceAlerts && prefs.sessionDigest, 'Tercih modeli + varsayılanlar', 'geofence/injury/milestone açık + digest eklendi');

// ── 2. Eşik alarm tetikle (Adım 06 + 10) ──
const geo = simulateGeofenceEvent('Efe', 'Kortlar', 'EXIT');
check(geo.urgent && geo.whatsappUrl.startsWith('https://wa.me/'), 'Geofence EXIT → veli WhatsApp', geo.message.slice(0, 40));
const alert = buildCoachAlert('INJURY_RED_ZONE', 'Mert', 'ACWR 1.8', '> 1.4', 'Sakatlık riski kritik');
const tg = formatTelegramAlert(alert);
check(tg.includes('ACİL ANTRENÖR ALARMI') && tg.includes('Mert'), 'Kırmızı-zon → Telegram MarkdownV2', tg.split('\n')[1]);
const dispatch = await dispatchTelegramAlert(alert);
check(dispatch.ok, 'Webhook dispatch (mock-first)', dispatch.channel);

// ── 3. Duyusal geri bildirim sevk (Adım 12) ──
const kind = sensoryForThreshold(225, 1.4, 65);
check(kind === 'WARNING', 'Eşik → WARNING kararı', `GCT 225ms + risk %65 → ${kind}`);
check(TONE_PATTERNS.SUCCESS.length === 2 && TONE_PATTERNS.WARNING.length === 3, 'Tone desenleri (çift chime / pulsating buzzer)', 'SUCCESS 2 adım • WARNING 3 adım');
check(HAPTIC_PATTERNS.WARNING.length === 5, 'Haptik desen (mobil vibrate)', '120-60-120-60-240');
check(typeof playFeedback === 'function', 'playFeedback hazır (Web Audio + vibrate)', '');

// ── 4. Paylaş & Export doğrulama (Adım 02/13/14) ──
const reportText = SHARE_TEMPLATES.report('Arda', 94, 'Hacmi artır');
check(whatsappShareUrl(reportText).startsWith('https://wa.me/'), 'Karnesi paylaşım linki', '');
const samples = buildDemoSessionSamples(8);
const csv = samplesToCsv(samples);
check(csv.startsWith('timestamp,hr_bpm') && csv.split('\n').length === 9, 'CSV export (header + 8 örnek)', `${csv.split('\n').length} satır`);
const json = samplesToJson(samples, { athlete: 'Arda' });
check(json.includes('"samples"') && json.includes('"athlete": "Arda"'), 'JSON export (meta + seri)', `${json.length} karakter`);
const club = renderClubTemplate('WEATHER_CANCEL', { athleteName: 'Efe', courtNumber: 'A', time: '18:00', coachName: 'Caner' });
check(club.body.includes('Efe') && club.body.includes('A numaralı kort') && club.body.includes('Caner'), 'Kulüp şablonu placeholder doldurma', club.body.slice(0, 40));

// ── 5. Uçtan uca zincir özeti ──
const lifecycleOk = prefs.geofenceAlerts && geo.urgent && dispatch.ok && kind === 'WARNING' && csv.includes('rsi');
check(lifecycleOk, 'UÇTAN UCA: tercih→alarm→duyusal→export zinciri OK', 'Track 1 yaşam döngüsü doğrulandı');

console.log(`\n${'─'.repeat(48)}`);
console.log(`TRACK 1 INTEGRATION: ${pass}/13 geçti`);
process.exit(pass === 13 ? 0 : 1);
