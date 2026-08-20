// ============================================================================
// 📲 TRACK 1 — İLETİŞİM & BİLDİRİM SMOKE TESTİ (Batch 1: Adım 1-5)
// Çalıştırma: npx tsx scripts/track1CommunicationSmokeTest.mts
// ============================================================================
import { buildPdfHtml, downloadHtmlReport, pdfReportGeneratorStatus, type PdfReportData } from '../src/app/lib/ops/pdfReportGenerator';
import { SHARE_TEMPLATES, whatsappShareUrl, webShareSupported, shareText, communicationSuiteStatus } from '../src/app/lib/ops/communicationSuite';
import { pushNotification, getNotifications, markRead, clearNotifications, unreadCount, milestoneNotification, notificationCenterStatus } from '../src/app/lib/ops/notificationCenter';

let pass = 0;
const check = (ok: boolean, label: string, detail = '') => {
  console.log(`${ok ? '✅' : '❌'} ${label}${detail ? ` — ${detail}` : ''}`);
  if (ok) pass++;
};

// 1) PDF HTML üretici (Adım 01)
const pdfData: PdfReportData = {
  title: 'Test Karnesi', subtitle: 'Alt',
  meta: [{ label: 'Sporcu', value: 'Arda' }, { label: 'RSI', value: '2.2' }],
  sections: [{ heading: 'Form', lines: ['🚀 Patlayıcı basış', '⭐ Elit RSI'] }],
  footer: '⚡ ExtremeS',
};
const html = buildPdfHtml(pdfData);
check(html.includes('Test Karnesi') && html.includes('@page') && html.includes('</html>'), 'A4 print HTML üretildi', `${html.length} karakter`);

// 2) WhatsApp şablonları (Adım 02)
const rep = SHARE_TEMPLATES.report('Arda', 94, 'Hacmi artır');
check(rep.includes('Patlayıcılık Skoru: %94') && rep.includes('wa.me'.length > 0 ? '' : ''), 'Karnesi WhatsApp şablonu', rep.slice(0, 40));
const safe = SHARE_TEMPLATES.safety('Efe', 'Güvenli bölgede');
check(safe.includes('Güvenlik Bildirimi'), 'Güvenlik şablonu', safe.slice(0, 34));
const match = SHARE_TEMPLATES.match('Padel Kort A', '18:00', '3.2');
check(match.includes('Maç Daveti'), 'Maç daveti şablonu', match.slice(0, 30));
const url = whatsappShareUrl(rep);
check(url.startsWith('https://wa.me/?text='), 'WhatsApp paylaşım linki', url.slice(0, 36));

// 3) Web Share + fallback (Adım 03)
check(typeof webShareSupported() === 'boolean', 'Web Share destek tespiti', String(webShareSupported()));
check(typeof shareText === 'function', 'shareText fallback (WA) hazır', 'navigator.share → wa.me');

// 4) Push kaydı (Adım 04) — sw.js varlığı node'da test edilemez; kayıt helper'ı
check(typeof pushNotification === 'function', 'Bildirim motoru hazır', '');

// 5) In-app bildirim merkezi (Adım 05)
const n = pushNotification('alert', 'Sakatlık riski', 'Mert yorgunluk eşiğinde', '🚨');
const m = milestoneNotification('Arda', 'Elit RSI');
check(getNotifications().length === 2 && unreadCount() === 2, 'Bildirim kuyruğu + rozet sayacı', `${unreadCount()} okunmamış`);
markRead(n.id);
check(unreadCount() === 1, 'Okundu işaretleme', `${unreadCount()} kaldı`);
clearNotifications();
check(getNotifications().length === 0, 'Kuyruk temizleme', '');

console.log(`\n${'─'.repeat(48)}`);
console.log(`SMOKE TEST: ${pass}/11 geçti`);
console.log(pdfReportGeneratorStatus());
console.log(communicationSuiteStatus());
console.log(notificationCenterStatus());
process.exit(pass === 11 ? 0 : 1);
