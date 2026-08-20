/** @type {import('next').NextConfig} */
const nextConfig = {
  // Cloud Run / Docker (mevcut Dockerfile) için bağımsız sunucu çıktısı.
  // Vercel'de native olarak da çalışır (standalone otomatik kullanılır).
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  // Telemetri ve gizlilik: dış analitik çağrısı yok
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
  // ⚡ Adım 99 — Bundle optimizasyonu:
  // Ağır görselleştirmeler (FootPressureHeatmap3D, SlowMotionBiomechanicalPlayer,
  // TacticalWhiteboardCanvas) bileşenlerde `next/dynamic` ile lazy-load edilir;
  // böylece başlangıç JS yükü <200KB hedefinin altında kalır.
  // Denetim: src/app/lib/ui/bundleOptimizationReport.ts (bundleOptimizationStatus)
};

module.exports = nextConfig;
