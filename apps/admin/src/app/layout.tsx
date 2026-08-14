import './globals.css';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'Likya Super-App | CEO Command Center',
  description: 'Likya Yönetici ve Genel Durum Takip Paneli',
};

// Mobil/Tablet native app deneyimi: tam genişlik + iOS güvenli alanları
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>
        <div className="dashboard-container">
          {children}
        </div>
      </body>
    </html>
  );
}
