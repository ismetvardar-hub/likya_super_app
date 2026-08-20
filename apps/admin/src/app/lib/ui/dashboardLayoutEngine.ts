// ============================================================================
// 🧩 DASHBOARD WIDGET GRID MOTORU (Adım 66)
// Widget katalogu: LIVE_BLE_FEED • FATIGUE_CURVE • RSI_RADAR • INJURY_ALERTS
// • XP_PROGRESS • ACTIVE_DRILL — aç/kapat, sırala, boyutlandır (1x1/2x1/2x2)
// Coach/Parent/CEO hazır şablonlar + localStorage kalıcılığı.
// Deterministik; sıfır bağımlılık; node-runnable.
// ============================================================================

export type WidgetId = 'LIVE_BLE_FEED' | 'FATIGUE_CURVE' | 'RSI_RADAR' | 'INJURY_ALERTS' | 'XP_PROGRESS' | 'ACTIVE_DRILL';
export type WidgetSize = '1x1' | '2x1' | '2x2';

export interface DashboardWidget {
  id: WidgetId;
  title: string;
  size: WidgetSize;
  visible: boolean;
}

export interface DashboardLayout {
  id: string;
  name: string;
  widgets: DashboardWidget[];
  version: number;
}

export const WIDGET_CATALOG: Record<WidgetId, { title: string; defaultSize: WidgetSize }> = {
  LIVE_BLE_FEED: { title: 'Canlı BLE Akışı', defaultSize: '2x1' },
  FATIGUE_CURVE: { title: 'Yorgunluk Eğrisi', defaultSize: '1x1' },
  RSI_RADAR: { title: 'RSI Radar', defaultSize: '2x2' },
  INJURY_ALERTS: { title: 'Sakatlık Uyarıları', defaultSize: '1x1' },
  XP_PROGRESS: { title: 'XP İlerlemesi', defaultSize: '1x1' },
  ACTIVE_DRILL: { title: 'Aktif Drill', defaultSize: '2x1' },
};

const ALL_WIDGETS = Object.entries(WIDGET_CATALOG).map(([id, cfg]) => ({ id: id as WidgetId, title: cfg.title, size: cfg.defaultSize, visible: true }));

export const PRESET_LAYOUTS: Record<'COACH' | 'PARENT' | 'CEO', DashboardLayout> = {
  COACH: { id: 'preset-coach', name: 'Antrenör', widgets: [...ALL_WIDGETS], version: 1 },
  PARENT: {
    id: 'preset-parent',
    name: 'Veli',
    widgets: ALL_WIDGETS.filter((w) => ['FATIGUE_CURVE', 'RSI_RADAR', 'INJURY_ALERTS', 'XP_PROGRESS'].includes(w.id)).map((w) => ({ ...w, size: w.id === 'RSI_RADAR' ? '2x2' : '1x1' as WidgetSize })),
    version: 1,
  },
  CEO: {
    id: 'preset-ceo',
    name: 'CEO Komuta',
    widgets: ALL_WIDGETS.filter((w) => ['LIVE_BLE_FEED', 'INJURY_ALERTS', 'RSI_RADAR', 'FATIGUE_CURVE'].includes(w.id)).map((w) => ({ ...w, size: w.id === 'RSI_RADAR' ? '2x2' : '2x1' as WidgetSize })),
    version: 1,
  },
};

export function createDashboardLayout(preset: keyof typeof PRESET_LAYOUTS = 'COACH'): DashboardLayout {
  return JSON.parse(JSON.stringify(PRESET_LAYOUTS[preset])) as DashboardLayout;
}

/** Widget görünürlüğünü açar/kapatır. */
export function toggleWidget(layout: DashboardLayout, id: WidgetId): DashboardLayout {
  const widgets = layout.widgets.map((w) => (w.id === id ? { ...w, visible: !w.visible } : w));
  return { ...layout, widgets };
}

/** Widget boyutunu değiştirir (1x1 → 2x1 → 2x2). */
export function resizeWidget(layout: DashboardLayout, id: WidgetId, size: WidgetSize): DashboardLayout {
  const widgets = layout.widgets.map((w) => (w.id === id ? { ...w, size } : w));
  return { ...layout, widgets };
}

/** Widget sırasını değiştirir (from → to). */
export function reorderWidgets(layout: DashboardLayout, from: number, to: number): DashboardLayout {
  const widgets = [...layout.widgets];
  const [moved] = widgets.splice(from, 1);
  widgets.splice(to, 0, moved);
  return { ...layout, widgets };
}

export function serializeLayout(layout: DashboardLayout): string {
  return JSON.stringify(layout);
}

export function deserializeLayout(json: string): DashboardLayout | null {
  try {
    const parsed = JSON.parse(json) as DashboardLayout;
    if (!Array.isArray(parsed.widgets)) return null;
    return parsed;
  } catch {
    return null;
  }
}

const LS_KEY = 'likya_dashboard_layout_v1';

/** Düzeni localStorage'a kaydeder (node'da no-op). */
export function persistLayout(layout: DashboardLayout): void {
  if (typeof window === 'undefined') return;
  try { window.localStorage.setItem(LS_KEY, serializeLayout(layout)); } catch { /* ignore */ }
}

/** Kayıtlı düzeni yükler; yoksa preset döndürür. */
export function loadLayout(preset: keyof typeof PRESET_LAYOUTS = 'COACH'): DashboardLayout {
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(LS_KEY);
      const parsed = raw ? deserializeLayout(raw) : null;
      if (parsed) return parsed;
    } catch { /* ignore */ }
  }
  return createDashboardLayout(preset);
}

export function dashboardLayoutStatus(): string {
  return `Dashboard: ${Object.keys(WIDGET_CATALOG).length} widget • 3 preset • localStorage kalıcılık`;
}
