// ============================================================================
// 🎯 TAKTİK BEYAZ TAHTA & DRILL CANVAS MOTORU (Adım 68)
// Kort şablonları: tenis tam kort • basketbol tam/yarı • çeviklik ızgarası
// Çizim öğeleri: oyuncu (X/O), hareket vektörü, pas çizgisi, koni
// Yapılandırılmış JSON tanımı + SVG dışa aktarımı. Deterministik; sıfır bağımlılık.
// ============================================================================

export type CourtTemplate = 'tennis' | 'basketball-full' | 'basketball-half' | 'agility';

export interface CourtTemplateDef {
  id: CourtTemplate;
  name: string;
  width: number; // SVG birim
  height: number;
}

export const COURT_TEMPLATES: CourtTemplateDef[] = [
  { id: 'tennis', name: 'Tenis Tam Kort', width: 1000, height: 520 },
  { id: 'basketball-full', name: 'Basketbol Tam', width: 940, height: 500 },
  { id: 'basketball-half', name: 'Basketbol Yarı', width: 470, height: 500 },
  { id: 'agility', name: 'Çeviklik Izgarası', width: 600, height: 600 },
];

export function courtTemplateDims(template: CourtTemplate): CourtTemplateDef {
  return COURT_TEMPLATES.find((t) => t.id === template) ?? COURT_TEMPLATES[0];
}

export type CanvasElementType = 'player' | 'vector' | 'pass' | 'cone';

export interface CanvasElement {
  id: string;
  type: CanvasElementType;
  x: number;
  y: number;
  x2?: number;
  y2?: number;
  team?: 'X' | 'O';
  label?: string;
  color?: string;
}

export interface DrillDefinition {
  title: string;
  template: CourtTemplate;
  elements: CanvasElement[];
  updatedAt: string;
}

let elementSeq = 0;
export function createDrill(template: CourtTemplate, title: string): DrillDefinition {
  return { title, template, elements: [], updatedAt: new Date().toISOString() };
}

export function addElement(drill: DrillDefinition, el: Omit<CanvasElement, 'id'>): DrillDefinition {
  const element: CanvasElement = { ...el, id: `${el.type}_${elementSeq++}` };
  return { ...drill, elements: [...drill.elements, element], updatedAt: new Date().toISOString() };
}

export function removeElement(drill: DrillDefinition, id: string): DrillDefinition {
  return { ...drill, elements: drill.elements.filter((e) => e.id !== id), updatedAt: new Date().toISOString() };
}

export function serializeDrill(drill: DrillDefinition): string {
  return JSON.stringify(drill, null, 2);
}

export function deserializeDrill(json: string): DrillDefinition | null {
  try {
    const parsed = JSON.parse(json) as DrillDefinition;
    if (!Array.isArray(parsed.elements) || !parsed.template) return null;
    return parsed;
  } catch {
    return null;
  }
}

const esc = (s: string): string => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Drill düzenini SVG string'ine dönüştürür (dışa aktarılabilir). */
export function drillToSvg(drill: DrillDefinition): string {
  const dims = courtTemplateDims(drill.template);
  const parts: string[] = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${dims.width} ${dims.height}" width="${dims.width}" height="${dims.height}">`,
    `<rect width="${dims.width}" height="${dims.height}" fill="#0f172a"/>`,
    `<text x="10" y="24" font-size="16" font-weight="700" fill="#00f2fe">${esc(drill.title)}</text>`,
  ];
  for (const e of drill.elements) {
    if (e.type === 'cone') {
      parts.push(`<polygon points="${e.x},${e.y - 10} ${e.x - 8},${e.y} ${e.x + 8},${e.y}" fill="${e.color ?? '#F27A1A'}"/>`);
    } else if (e.type === 'player') {
      const color = e.color ?? (e.team === 'O' ? '#8B5CF6' : '#00f2fe');
      parts.push(`<circle cx="${e.x}" cy="${e.y}" r="14" fill="none" stroke="${color}" stroke-width="3"/>`);
      if (e.label) parts.push(`<text x="${e.x}" y="${e.y + 4}" font-size="13" font-weight="800" text-anchor="middle" fill="${color}">${esc(e.label)}</text>`);
    } else {
      const [x1, y1, x2, y2] = [e.x, e.y, e.x2 ?? e.x + 40, e.y2 ?? e.y];
      if (e.type === 'pass') {
        parts.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#e2e8f0" stroke-width="2.5" stroke-dasharray="8 5"/>`);
      } else {
        parts.push(`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${e.color ?? '#10B981'}" stroke-width="2.5" marker-end="url(#arrow)"/>`);
      }
    }
  }
  parts.push('<defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#10B981"/></marker></defs>');
  parts.push('</svg>');
  return parts.join('\n');
}

export function drillCanvasStatus(): string {
  return `Taktik Canvas: ${COURT_TEMPLATES.length} kort • oyuncu/vektör/pas/koni • JSON+SVG export`;
}
