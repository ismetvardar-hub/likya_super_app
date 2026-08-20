'use client';

import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { resolveTheme, THEMES, type ThemeMode, type ThemeTokens } from '../../app/lib/ui/themeTokens.ts';

// ============================================================================
// 🎨 YÜKSEK KONTRast TEMA SAĞLAYICI (Adım 69)
// Sunlight / Midnight (OLED) / Cyber Neon modları — CSS değişkenleri + context.
// Token'lar: themeTokens.ts
// ============================================================================

export interface ThemeContextValue {
  mode: ThemeMode;
  theme: ThemeTokens;
  setMode: (m: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ initialMode = 'cyber', children }: { initialMode?: ThemeMode; children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(initialMode);
  const theme = resolveTheme(mode);

  const cssVars: Record<string, string> = {
    '--likya-bg': theme.background,
    '--likya-surface': theme.surface,
    '--likya-text': theme.text,
    '--likya-muted': theme.muted,
    '--likya-danger': theme.danger,
    '--likya-caution': theme.caution,
    '--likya-optimal': theme.optimal,
    '--likya-accent': theme.accent,
  };

  return (
    <ThemeContext.Provider value={{ mode, theme, setMode }}>
      <div style={{ ...cssVars, color: theme.text, background: theme.background, minHeight: '100%' }} data-theme={mode}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme, ThemeProvider içinde kullanılmalı');
  return ctx;
}

export function themeModes(): ThemeMode[] {
  return Object.keys(THEMES) as ThemeMode[];
}

export default ThemeProvider;
