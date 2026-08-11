import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Likya Super-App | CEO Command Center',
  description: 'Likya Yönetici ve Genel Durum Takip Paneli',
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
