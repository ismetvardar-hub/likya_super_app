'use client';

import { usePathname } from 'next/navigation';
import SciFiLockScreen from './SciFiLockScreen';
import PWARegister from './PWARegister';

// ============================================================================
// 🛡️ GLOBAL SHELL — CEO paneli çerçevesini /extremes ve /app rotalarından izole eder
// ExtremeS bağımsız mobil uygulamada lock screen / PWA kayıt / admin araçları
// KESİNLİKLE görünmez; admin panelinde davranış değişmez (non-breaking).
// ============================================================================

export default function GlobalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isExtremesApp = pathname?.startsWith('/extremes') || pathname?.startsWith('/app');

  if (isExtremesApp) {
    // Saf mobil uygulama — CEO çerçevesi / lock screen / PWA kayıt YOK
    return <>{children}</>;
  }

  return (
    <>
      <PWARegister />
      <SciFiLockScreen>
        <div className="dashboard-container">
          {children}
        </div>
      </SciFiLockScreen>
    </>
  );
}
