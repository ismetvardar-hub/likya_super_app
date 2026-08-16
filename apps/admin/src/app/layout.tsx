import './globals.css';
import '../styles/form-validation.css';
import type { Metadata, Viewport } from 'next';
import SciFiLockScreen from './components/SciFiLockScreen';
import PWARegister from './components/PWARegister';

export const metadata: Metadata = {
  title: 'Likya Command CEO',
  description: 'Likya Kampüsü Yönetici & Genel Durum Takip Paneli — 7/24 kesintisiz komuta merkezi',
  applicationName: 'Likya Command CEO',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'Likya CEO',
    statusBarStyle: 'black-translucent',
    startupImage: [
      { url: '/icons/icon-512.png', media: '(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)' },
    ],
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-192.png', sizes: '192x192' },
      { url: '/icons/icon-512.png', sizes: '512x512' },
    ],
  },
  other: {
    'theme-color': '#0f172a',
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-title': 'Likya CEO',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
  },
};

// Mobil/Tablet native app deneyimi: tam genişlik + iOS güvenli alanları
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#0f172a',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <head>
        {/* PWA kurulum ipucu (iOS Ana Ekran) */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body>
        <PWARegister />
        <SciFiLockScreen>
          <div className="dashboard-container">
            {children}
          </div>
        </SciFiLockScreen>
      </body>
    </html>
  );
}

