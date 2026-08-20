// ============================================================================
// 🧾 KURUMSAL KOLLATERAL DOĞRULAMA TESTİ (Deck / One-Pager / Demo / Whitepaper)
// Doküman tamlığı • slayt sayısı • metrik tutarlılığı • markdown biçimlendirme.
// Çalıştırma: node scripts/collateralVerificationTest.mts
// ============================================================================
import { existsSync, readFileSync } from 'node:fs';

const results: { name: string; ok: boolean; detail: string }[] = [];
function check(name: string, cond: boolean, detail = '') {
  results.push({ name, ok: cond, detail });
  console.log((cond ? 'PASS' : 'FAIL') + ' - ' + name + (detail ? ` — ${detail}` : ''));
}

const DOC_DIR = '../../docs';
const deckPath = `${DOC_DIR}/INVESTOR_DECK.md`;
const onepagerPath = `${DOC_DIR}/CLUB_SALES_ONEPAGER.md`;
const demoPath = `${DOC_DIR}/LIVE_DEMO_SCRIPT.md`;
const whitepaperPath = `${DOC_DIR}/TECHNICAL_WHITEPAPER.md`;

// ── 1. DOKÜMAN TAMLIK ────────────────────────────────────────────────────────
const deck = existsSync(deckPath) ? readFileSync(deckPath, 'utf8') : '';
const onepager = existsSync(onepagerPath) ? readFileSync(onepagerPath, 'utf8') : '';
const demo = existsSync(demoPath) ? readFileSync(demoPath, 'utf8') : '';
const whitepaper = existsSync(whitepaperPath) ? readFileSync(whitepaperPath, 'utf8') : '';
check('1a. 4 doküman mevcut (deck/onepager/demo/whitepaper)', deck.length > 0 && onepager.length > 0 && demo.length > 0 && whitepaper.length > 0);

// ── 2. SLAYT SAYISI (yatırımcı sunumu: 10 slayt) ─────────────────────────────
const slideCount = (deck.match(/^## \d+\./gm) ?? []).length;
check('2a. Investor deck: 10 slayt (## 1. Problem … ## 10. The Team & Ask)', slideCount === 10, `${slideCount} slayt`);
check('2b. Deck bölümleri: Problem/Solution/Moat/Traction/Model/Market/Advantage/Tech/Fin/Ask', ['Problem', 'Solution', 'Product Moat', 'Traction', 'Business Model', 'Market Opportunity', 'Competitive Advantage', 'Technology & Architecture', 'Financial Projections', 'The Team & Ask'].every((s) => deck.includes(s)));

// ── 3. ONE-PAGER BÖLÜMLERİ ───────────────────────────────────────────────────
check('3a. One-pager: Value Proposition + Turnkey Hardware + ROI Calculator', onepager.includes('Value Proposition') && onepager.includes('Turnkey Donanım Paketi') && onepager.includes('ROI Calculator'));
check('3b. One-pager: 8 insole çifti + 4 HRM + gateway + 35% tutma', onepager.includes('8') && onepager.includes('4') && onepager.includes('Kort Master Gateway') && onepager.includes('%35'));

// ── 4. CANLI DEMO 5 DAKİKA ───────────────────────────────────────────────────
check('4a. Demo: 4 zaman bloğu (0-1 / 1-3 / 3-4 / 4-5)', demo.includes('Dakika 0–1') && demo.includes('Dakika 1–3') && demo.includes('Dakika 3–4') && demo.includes('Dakika 4–5'));
check('4b. Demo: 1-Tap setup + kalibrasyon + ralli + mola kartı + veli özeti', demo.includes('Tek Dokunuşla Seansı Başlat') && demo.includes('Baseline kalibrasyonu') && demo.includes('Mola Taktik Kartı') && demo.includes('WhatsApp özeti'));

// ── 5. WHITEPAPER MATEMATİK FORMALİZMLERİ ────────────────────────────────────
check('5a. Whitepaper: ACWR + TRIMP formalizmleri', whitepaper.includes('ACWR') && whitepaper.includes('TRIMP') && whitepaper.includes('\\lambda_a') && whitepaper.includes('\\Delta HR'));
check('5b. Whitepaper: EKF + Attention formalizmleri', whitepaper.includes('K_k') && whitepaper.includes('P_{k|k-1}') && whitepaper.includes('softmax') && whitepaper.includes('d_k'));
check('5c. Whitepaper: CRDT + KVKK + bundle benchmark', whitepaper.includes('LWW') && whitepaper.includes('KVKK') && whitepaper.includes('144KB') && whitepaper.includes('FRA1'));

// ── 6. METRİK TUTARLILIĞI (≥2 dokümanda aynı metrik) ─────────────────────────
const docSet = [['deck', deck], ['onepager', onepager], ['demo', demo], ['whitepaper', whitepaper]] as const;
const countAcross = (needle: string): number => docSet.filter(([, body]) => body.includes(needle)).length;
check('6a. "150" (adım) ≥2 doküman', countAcross('150') >= 2, `${countAcross('150')}/4`);
check('6b. "100Hz" ≥2 doküman', countAcross('100Hz') >= 2, `${countAcross('100Hz')}/4`);
check('6c. "50MB" ≥2 doküman', countAcross('50MB') >= 2, `${countAcross('50MB')}/4`);
check('6d. "<300ms" / 300ms ≥2 doküman', countAcross('300ms') >= 2, `${countAcross('300ms')}/4`);
check('6e. "144KB" ≥2 doküman', countAcross('144KB') >= 2, `${countAcross('144KB')}/4`);
check('6f. "69/69" (master) ≥2 doküman', countAcross('69/69') >= 2, `${countAcross('69/69')}/4`);
check('6g. "12/12" (saha simülasyonu) ≥2 doküman', countAcross('12/12') >= 2, `${countAcross('12/12')}/4`);
check('6h. Pazar "$4.2B" deck\'te + tutma "%35" onepager\'da', deck.includes('$4.2B') && onepager.includes('%35'));

// ── 7. MARKDOWN BİÇİMLENDİRME ────────────────────────────────────────────────
const fenceCount = [deck, onepager, demo, whitepaper].reduce((acc, d) => acc + (d.match(/```/g) ?? []).length, 0);
check('7a. Kod blokları dengeli (çift ```)', fenceCount % 2 === 0, `${fenceCount} fence`);
const headerCount = [deck, onepager, demo, whitepaper].every((d) => /^## /m.test(d) || /^# /m.test(d));
check('7b. Başlıklar ## / # ile (markdown)', headerCount === true);
const noSentinel = [deck, onepager, demo, whitepaper].every((d) => !d.includes('PART2') && !d.includes('<<<'));
check('7c. Sentinel/placeholder kalıntısı yok', noSentinel === true);

const failed = results.filter((r) => !r.ok).length;
console.log(`\nSONUÇ: ${results.length - failed}/${results.length} test geçti`);
process.exit(failed > 0 ? 1 : 0);
