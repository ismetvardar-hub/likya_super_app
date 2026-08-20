// ============================================================================
// 🛠️ TRACK 5 — BATCH 14 SMOKE TESTİ (Adım 66-70)
// Dashboard Grid • Büyüme Hızı/PHV • Taktik Canvas • Tema Tokenları • Jestler
// Çalıştırma: node scripts/track5Batch14SmokeTest.mts
// ============================================================================
import {
  createDashboardLayout, toggleWidget, resizeWidget, reorderWidgets,
  serializeLayout, deserializeLayout, PRESET_LAYOUTS, type WidgetSize,
} from '../src/app/lib/ui/dashboardLayoutEngine.ts';
import { growthVelocity, detectPhv, PHV_THRESHOLD_CM_PER_YEAR, type GrowthMeasurement } from '../src/app/lib/analytics/growthVelocityEngine.ts';
import { createDrill, addElement, removeElement, drillToSvg, serializeDrill, deserializeDrill, courtTemplateDims } from '../src/app/lib/tactics/drillCanvasEngine.ts';
import { resolveTheme, contrastRatio, isWcagAA, isWcagAAA, themeContrastReport, alertColor } from '../src/app/lib/ui/themeTokens.ts';
import { detectSwipe, detectLongPress, detectPinch, recognizeGesture, type TouchPoint } from '../src/app/lib/ui/useTouchGestures.ts';

const results: { name: string; ok: boolean }[] = [];
function check(name: string, cond: boolean, detail = '') {
  results.push({ name, ok: cond });
  console.log((cond ? 'PASS' : 'FAIL') + ' - ' + name + (detail ? ` — ${detail}` : ''));
}

// ── ADIM 66: DASHBOARD WIDGET GRID ────────────────────────────────────────────
const coach = createDashboardLayout('COACH');
check('66a. Coach preset → 6 widget, hepsi görünür', coach.widgets.length === 6 && coach.widgets.every((w) => w.visible));
check('66b. Parent preset 4, CEO preset 4 widget', createDashboardLayout('PARENT').widgets.length === 4 && PRESET_LAYOUTS.CEO.widgets.length === 4);

const toggled = toggleWidget(coach, 'INJURY_ALERTS');
check('66c. Widget aç/kapat', toggled.widgets.find((w) => w.id === 'INJURY_ALERTS')?.visible === false);
const resized = resizeWidget(coach, 'XP_PROGRESS', '2x2' as WidgetSize);
check('66d. Boyut değişimi (1x1 → 2x2)', resized.widgets.find((w) => w.id === 'XP_PROGRESS')?.size === '2x2');
const reordered = reorderWidgets(coach, 0, 2);
check('66e. Sıralama değişimi', reordered.widgets[2].id === coach.widgets[0].id && reordered.widgets[0].id === coach.widgets[1].id);

const roundtrip = deserializeLayout(serializeLayout(coach));
check('66f. Serialize/deserialize yuvarlak geçiş', roundtrip !== null && roundtrip.widgets.length === 6 && roundtrip.id === coach.id);
check('66g. Bozuk JSON → null', deserializeLayout('{bozuk') === null);

// ── ADIM 67: BÜYÜME HIZI & PHV ────────────────────────────────────────────────
const growth: GrowthMeasurement[] = [
  { date: '2026-01-01', heightCm: 150 },
  { date: '2026-04-01', heightCm: 152.5 },
  { date: '2026-07-01', heightCm: 154 },
];
const velocities = growthVelocity(growth);
check('67a. Hız türevi: 2.5cm/90gün = 10.14 cm/yıl', velocities[0].velocityCmPerYear === 10.14 && velocities[1].velocityCmPerYear === 6.02);
const phv = detectPhv(growth);
check(`67b. PHV tespiti (≥${PHV_THRESHOLD_CM_PER_YEAR} cm/yıl) + tepe noktası`, phv.phvDetected === true && phv.peakVelocityCmPerYear === 10.14 && phv.phvDate !== null);
check('67c. PHV tepe bayrağı yalnızca maks', velocities[0].isPhvPeak === true && velocities[1].isPhvPeak === false);
const noPhv = detectPhv([{ date: '2026-01-01', heightCm: 150 }, { date: '2026-04-01', heightCm: 151.2 }]);
check('67d. Düşük hız → PHV yok', noPhv.phvDetected === false && noPhv.peakVelocityCmPerYear === 4.87);

// ── ADIM 68: TAKTİK CANVAS (seri + export) ─────────────────────────────────────
const drill = createDrill('tennis', 'Servis Drili');
let d = addElement(drill, { type: 'player', x: 100, y: 100, team: 'X', label: 'X' });
d = addElement(d, { type: 'vector', x: 100, y: 100, x2: 200, y2: 150 });
d = addElement(d, { type: 'cone', x: 300, y: 200 });
check('68a. Öğe ekleme (oyuncu/vektör/koni)', d.elements.length === 3);
d = removeElement(d, d.elements[1].id);
check('68b. Öğe silme', d.elements.length === 2);

const json = serializeDrill(d);
const restored = deserializeDrill(json);
check('68c. JSON serileştirme yuvarlak geçiş', restored !== null && restored.template === 'tennis' && restored.elements.length === 2);

const svg = drillToSvg(d);
check('68d. SVG dışa aktarım (svg+başlık+oyuncu dairesi)', svg.includes('<svg') && svg.includes('Servis Drili') && svg.includes('<circle'));
check('68e. Kort şablon boyutları (tenis 1000×520)', courtTemplateDims('tennis').width === 1000 && courtTemplateDims('tennis').height === 520);

// ── ADIM 69: TEMA TOKEN KONTRASTI ─────────────────────────────────────────────
check('69a. Mod çözümleme (sunlight beyaz bg)', resolveTheme('sunlight').background === '#ffffff' && resolveTheme('midnight').background === '#000000');
check('69b. Siyah/beyaz kontrast = 21', contrastRatio('#000000', '#ffffff') === 21);
check('69c. Sunlight metin/bg → AAA (≥7)', contrastRatio('#0f172a', '#ffffff') >= 7 && isWcagAAA(contrastRatio('#0f172a', '#ffffff')) === true);
check('69d. Uyarı renkleri moda göre', alertColor('midnight', 'optimal') === '#34d399' && alertColor('cyber', 'danger') === '#F43F5E');
const report = themeContrastReport('sunlight');
check('69e. Kontrast raporu: AAA + danger eşiği AA', report.aaa === true && isWcagAA(report.dangerBgRatio) === true);

// ── ADIM 70: JEST TANIMA ──────────────────────────────────────────────────────
check('70a. Swipe yönleri', detectSwipe(-80, 10) === 'left' && detectSwipe(80, 10) === 'right' && detectSwipe(10, -80) === 'up' && detectSwipe(10, 80) === 'down');
check('70b. Çapraz hareket → null', detectSwipe(40, 40) === null && detectSwipe(20, 20) === null);
check('70c. Uzun basış eşiği (600ms)', detectLongPress(800) === true && detectLongPress(300) === false);
check('70d. Pinch in/out + eşik altı', detectPinch(100, 80) === 'in' && detectPinch(100, 120) === 'out' && detectPinch(100, 105) === null);

const start: TouchPoint = { x: 100, y: 100, tMs: 0 };
const swipeEnd: TouchPoint = { x: 30, y: 110, tMs: 200 };
check('70e. Tam tanıma: swipe-left', recognizeGesture(start, swipeEnd)?.kind === 'swipe' && recognizeGesture(start, swipeEnd)?.direction === 'left');
const longEnd: TouchPoint = { x: 102, y: 103, tMs: 800 };
check('70f. Tam tanıma: uzun basış', recognizeGesture(start, longEnd)?.kind === 'long-press');
const tapEnd: TouchPoint = { x: 105, y: 105, tMs: 100 };
check('70g. Tam tanıma: tap', recognizeGesture(start, tapEnd)?.kind === 'tap');

const failed = results.filter((r) => !r.ok).length;
console.log(`\nSONUÇ: ${results.length - failed}/${results.length} test geçti`);
process.exit(failed > 0 ? 1 : 0);

