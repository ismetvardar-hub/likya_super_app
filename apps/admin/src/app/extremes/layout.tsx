import type { Metadata, Viewport } from 'next';

// ============================================================================
// ⚡ EXTREMES — BAĞIMSIZ MOBİL UYGULAMA LAYOUT'U
// CEO paneli metadata'sını ezer: ExtremeS marka, tam ekran PWA (standalone),
// ana ekrana ekleme (Add to Home Screen) tam uygulama hissi.
// Sidebar/header yok — GlobalShell (root layout) bunu garanti eder.
// ============================================================================

export const metadata: Metadata = {
  title: 'ExtremeS — Müşteri Portalı',
  description: 'ExtremeS müşteri süper uygulaması — aile indirimi, ders kredisi, 10x referans ve ebeveyn onayı',
  applicationName: 'ExtremeS',
  manifest: '/extremes/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    title: 'ExtremeS',
    statusBarStyle: 'default',
  },
  formatDetection: { telephone: false },
  icons: {
    icon: [{ url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' }],
    apple: [{ url: '/icons/icon-192.png', sizes: '192x192' }],
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-title': 'ExtremeS',
  },
};

export const viewport: Viewport = {
  themeColor: '#4f46e5',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  maximumScale: 1,
};

export default function ExtremeSLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
