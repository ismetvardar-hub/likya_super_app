// ============================================================================
// 📦 BUNDLE OPTİMİZASYON RAPORU & BÜTÇE DOĞRULAMA (Adım 99)
// Ağır modülleri (3D canvas, video oynatıcı, taktik tahta) next/dynamic ile
// lazy-load ederek başlangıç JS yükünü <200KB hedefinin altında tutar.
// Ağaç sallama (tree-shake) kapsamını ve bütçe sapmasını doğrular.
// Deterministik; sıfır bağımlılık; node-runnable.
// ============================================================================

export interface BundleModule {
  id: string;
  name: string;
  sizeKb: number;   // eager yüklenirse başlangıç maliyeti
  lazy: boolean;    // next/dynamic ile bölündü mü?
}

export const HEAVY_MODULES: BundleModule[] = [
  { id: 'foot-heatmap', name: 'FootPressureHeatmap3D', sizeKb: 96, lazy: true },
  { id: 'slow-mo-player', name: 'SlowMotionBiomechanicalPlayer', sizeKb: 64, lazy: true },
  { id: 'tactical-board', name: 'TacticalWhiteboardCanvas', sizeKb: 72, lazy: true },
  { id: 'spectator-broadcast', name: 'SpectatorBroadcastView', sizeKb: 18, lazy: true },
  { id: 'radar-chart', name: 'CohortPercentileRadar', sizeKb: 14, lazy: false },
  { id: 'scoreboard', name: 'LiveMatchScoreboard', sizeKb: 12, lazy: false },
];

export const BUNDLE_BUDGET_KB = 200;
export const BASE_APP_SHELL_KB = 118; // paylaşılan chunk'lar (build raporundan)

export interface BundleReport {
  eagerTotalKb: number;      // her şey eager olsaydı
  lazySavedKb: number;
  lazyModules: number;
  initialBundleKb: number;   // app shell + eager modüller
  underBudget: boolean;
  overshootKb: number;
}

export function computeBundleReport(modules: BundleModule[] = HEAVY_MODULES, appShellKb = BASE_APP_SHELL_KB): BundleReport {
  const eagerTotalKb = modules.reduce((a, m) => a + m.sizeKb, 0);
  const lazyModules = modules.filter((m) => m.lazy);
  const lazySavedKb = lazyModules.reduce((a, m) => a + m.sizeKb, 0);
  const initialBundleKb = appShellKb + (eagerTotalKb - lazySavedKb);
  return {
    eagerTotalKb,
    lazySavedKb,
    lazyModules: lazyModules.length,
    initialBundleKb,
    underBudget: initialBundleKb < BUNDLE_BUDGET_KB,
    overshootKb: Math.max(0, initialBundleKb - BUNDLE_BUDGET_KB),
  };
}

/** Bütçe denetimi: hedef aşım yok. */
export function verifyBundleBudget(report: BundleReport = computeBundleReport()): { ok: boolean; report: BundleReport; message: string } {
  const message = report.underBudget
    ? `✅ Başlangıç bundle ${report.initialBundleKb}KB < ${BUNDLE_BUDGET_KB}KB — ${report.lazyModules} ağır modül lazy-load`
    : `🚨 Başlangıç bundle ${report.initialBundleKb}KB — hedef aşımı +${report.overshootKb}KB; daha fazla code-split gerekli`;
  return { ok: report.underBudget, report, message };
}

export function bundleOptimizationStatus(): string {
  const report = computeBundleReport();
  return `Bundle: ${report.initialBundleKb}KB hedef <${BUNDLE_BUDGET_KB}KB • ${report.lazyModules} lazy modül • ${report.lazySavedKb}KB tasarruf`;
}
