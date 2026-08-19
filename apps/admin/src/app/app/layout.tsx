import type { Metadata, Viewport } from 'next';

// /app rotası → ExtremeS mobil uygulama (CEO metadata'sı yok)
export const metadata: Metadata = {
  title: 'ExtremeS — Müşteri Portalı',
  applicationName: 'ExtremeS',
  manifest: '/extremes/manifest.webmanifest',
  appleWebApp: { capable: true, title: 'ExtremeS', statusBarStyle: 'default' },
  other: { 'mobile-web-app-capable': 'yes', 'apple-mobile-web-app-title': 'ExtremeS' },
};

export const viewport: Viewport = { themeColor: '#4f46e5', width: 'device-width', initialScale: 1, viewportFit: 'cover', maximumScale: 1 };

export default function AppAliasLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
