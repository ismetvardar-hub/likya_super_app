// ============================================================================
// 🎨 YÜKSEK KONTRast ATLETİK TEMA TOKEN'LARI (Adım 69)
// Modlar: Sunlight High-Contrast (dış kort parlaması) • Midnight Dark (OLED)
// • SportVision Cyber Neon. Canlı metrik uyarı renkleri (Danger/Caution/Optimal/Cyan)
// WCAG kontrast hesaplama + AAA kontrolü. Deterministik; sıfır bağımlılık.
// ============================================================================

export type ThemeMode = 'sunlight' | 'midnight' | 'cyber';

export interface ThemeTokens {
  mode: ThemeMode;
  background: string;
  surface: string;
  text: string;
  muted: string;
  danger: string;
  caution: string;
  optimal: string;
  accent: string;
}

export const THEMES: Record<ThemeMode, ThemeTokens> = {
  sunlight: {
    mode: 'sunlight',
    background: '#ffffff',
    surface: '#e8edf3',
    text: '#0f172a',
    muted: '#334155',
    danger: '#b91c1c',
    caution: '#b45309',
    optimal: '#047857',
    accent: '#0e7490',
  },
  midnight: {
    mode: 'midnight',
    background: '#000000',
    surface: '#0f172a',
    text: '#f1f5f9',
    muted: '#94a3b8',
    danger: '#fb7185',
    caution: '#fbbf24',
    optimal: '#34d399',
    accent: '#00f2fe',
  },
  cyber: {
    mode: 'cyber',
    background: '#020617',
    surface: '#0f172a',
    text: '#e2e8f0',
    muted: '#64748b',
    danger: '#F43F5E',
    caution: '#F27A1A',
    optimal: '#10B981',
    accent: '#00f2fe',
  },
};

export function resolveTheme(mode: ThemeMode): ThemeTokens {
  return THEMES[mode];
}

/** Hex → 0-1 relative luminance (WCAG). */
export function luminance(hex: string): number {
  const h = hex.replace('#', '');
  const parse = (i: number) => {
    const v = parseInt(h.slice(i, i + 2), 16) / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * parse(0) + 0.7152 * parse(2) + 0.0722 * parse(4);
}

/** WCAG kontrast oranı (1-21). */
export function contrastRatio(a: string, b: string): number {
  const l1 = luminance(a);
  const l2 = luminance(b);
  const [hi, lo] = l1 >= l2 ? [l1, l2] : [l2, l1];
  return Number(Math.min(21, (hi + 0.05) / (lo + 0.05)).toFixed(2));
}

export function isWcagAA(ratio: number): boolean {
  return ratio >= 4.5;
}

export function isWcagAAA(ratio: number): boolean {
  return ratio >= 7;
}

/** Mod için canlı uyarı rengi (Danger/Caution/Optimal). */
export function alertColor(mode: ThemeMode, level: 'danger' | 'caution' | 'optimal'): string {
  return resolveTheme(mode)[level];
}

/** Modun metin/bg kontrast raporu (UI testi). */
export function themeContrastReport(mode: ThemeMode): { textBgRatio: number; dangerBgRatio: number; aaa: boolean } {
  const t = resolveTheme(mode);
  const textBgRatio = contrastRatio(t.text, t.background);
  const dangerBgRatio = contrastRatio(t.danger, t.background);
  return { textBgRatio: Number(textBgRatio.toFixed(1)), dangerBgRatio: Number(dangerBgRatio.toFixed(1)), aaa: isWcagAAA(textBgRatio) };
}

export function themeTokensStatus(): string {
  return `Tema Tokenları: sunlight/midnight/cyber • WCAG AAA kontrast • uyarı renkleri`;
}
