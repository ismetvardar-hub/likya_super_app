// ============================================================================
// 🦶 AYAK BASINÇ SHADER & GEOMETRİ KONFİGÜRASYONU (Adım 65)
// 3D foot sole heatmap için saf matematik: basınç → termal renk gradyanı
// (Mavi → Yeşil → Kırmızı), prosedürel mesh ızgarası ve dikey deformasyon.
// Three.js/WebGL renderına hazır; bileşen: modules/three/FootPressureHeatmap3D.tsx
// Deterministik; sıfır bağımlılık; node-runnable (test edilebilir).
// ============================================================================

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

/** Basınç (0-100) → termal renk: Mavi(0) → Yeşil(50) → Kırmızı(100). */
export function pressureToColor(p: number): Rgb {
  const v = Math.max(0, Math.min(100, p));
  if (v <= 50) {
    const t = v / 50; // 0 → mavi, 50 → yeşil
    return { r: Math.round(0 + t * 40), g: Math.round(100 + t * 155), b: Math.round(255 - t * 155) };
  }
  const t = (v - 50) / 50; // 50 → yeşil, 100 → kırmızı
  return { r: Math.round(40 + t * 215), g: Math.round(255 - t * 205), b: Math.round(100 - t * 100) };
}

/** Izgara basınç değerlerini renk dizisine çevirir. */
export function pressureMapToColors(pressures: number[]): Rgb[] {
  return pressures.map(pressureToColor);
}

/** Basınç değerini CSS rengine dönüştürür (canvas/SVG doku için). */
export function pressureToCss(p: number): string {
  const c = pressureToColor(p);
  return `rgb(${c.r},${c.g},${c.b})`;
}

export interface FootMeshConfig {
  segmentsX: number;
  segmentsY: number;
  width: number;   // mm
  length: number;  // mm
  depthScale: number; // basınç → dikey deformasyon (mm/birim)
}

/** Prosedürel ayak tabanı mesh konfigürasyonu (ayak ortalama 100×250mm). */
export function footMeshConfig(width = 100, length = 250, segmentsX = 12, segmentsY = 24): FootMeshConfig {
  return { segmentsX, segmentsY, width, length, depthScale: 6 };
}

/**
 * Basınç ızgarasını dikey (Z) deformasyona çevirir — vertex shader girişi.
 * Yüksek basınç bölgeleri yüzeyden kabarır (doku derinliği).
 */
export function footVertexHeights(pressureGrid: number[][], depthScale = 6): number[][] {
  return pressureGrid.map((row) => row.map((p) => Number(((p / 100) * depthScale).toFixed(2))));
}

export interface FootHeatmapFrame {
  cells: Array<{ x: number; y: number; pressure: number; color: Rgb }>;
  gridCols: number;
  gridRows: number;
}

/** Izgarayı şekillendirilmiş ayak tabanına göre üretir (kenar hücreleri elenir). */
export function buildFootHeatmapFrame(pressureGrid: number[][], cfg: FootMeshConfig = footMeshConfig()): FootHeatmapFrame {
  const cells = [];
  const rows = pressureGrid.length;
  const cols = pressureGrid[0]?.length ?? 0;
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      // Ayak silueti: kenarlara doğru süzülen eliptik maske
      const nx = (x / Math.max(1, cols - 1)) * 2 - 1;
      const ny = (y / Math.max(1, rows - 1)) * 2 - 1;
      const inside = nx * nx * 1.15 + ny * ny <= 1.15;
      if (!inside) continue;
      const pressure = pressureGrid[y][x];
      cells.push({ x, y, pressure, color: pressureToColor(pressure) });
    }
  }
  return { cells, gridCols: cols, gridRows: rows };
}

export function footPressureShaderStatus(): string {
  return 'Foot Pressure Shader: Mavi→Yeşil→Kırmızı • eliptik ayak maskesi • Z deformasyon';
}
