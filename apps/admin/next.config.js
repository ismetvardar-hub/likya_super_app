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
};

module.exports = nextConfig;
