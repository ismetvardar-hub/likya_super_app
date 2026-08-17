// ============================================================================
// 🛡️ STRIX GÜVENLİK & ANAHTAR TARAYICISI (Snyk AI yaklaşımı)
// İstemciye sızabilecek hassas anahtarları (NEXT_PUBLIC_ kaçakları, hardcoded
// tokenlar) denetler. Deterministik; Plan Z güvenli. Kırılmasız.
// ============================================================================

export interface StrixFinding {
  severity: 'kritik' | 'yuksek' | 'orta' | 'bilgi';
  category: 'api-key' | 'secret' | 'jwt' | 'private-key' | 'hardcoded';
  match: string;      // kısaltılmış eşleşme
  location: string;   // dosya/satır ipucu
  recommendation: string;
}

export interface StrixAuditResult {
  findings: StrixFinding[];
  score: number;        // 0-100 güvenlik skoru
  scannedFiles: number;
  clean: boolean;
}

// Hassas kalıplar
const PATTERNS: { category: StrixFinding['category']; re: RegExp; severity: StrixFinding['severity'] }[] = [
  { category: 'api-key', re: /\b(AIza[0-9A-Za-z_-]{30,}|sk-[0-9a-zA-Z]{20,})\b/g, severity: 'kritik' },
  { category: 'jwt', re: /\beyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{10,}\b/g, severity: 'kritik' },
  { category: 'private-key', re: /\b-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/g, severity: 'kritik' },
  { category: 'secret', re: /\b(supabase|service_role|admin|access_token|client_secret)['":=\s]+[A-Za-z0-9_-]{20,}/gi, severity: 'yuksek' },
  { category: 'hardcoded', re: /\b(?:NEXT_PUBLIC_[A-Z0-9_]+)\s*[:=]\s*['"][^'"]{8,}['"]/g, severity: 'yuksek' },
];

// Dosya içeriğini tara (deterministik)
export function scanFileContent(content: string, fileName: string): StrixFinding[] {
  const findings: StrixFinding[] = [];
  PATTERNS.forEach(({ category, re, severity }, pi) => {
    const matches = content.match(re);
    if (matches) {
      matches.slice(0, 3).forEach((m) => {
        findings.push({
          severity,
          category,
          match: `${m.slice(0, 12)}…`,
          location: `${fileName} (kalıp #${pi + 1})`,
          recommendation: category === 'hardcoded'
            ? 'NEXT_PUBLIC_ anahtarlar client bundle\'a sızar — server-only env kullanın'
            : 'Anahtar env değişkenine taşınmalı ve döndürülmeli',
        });
      });
    }
  });
  return findings;
}

// Birden çok dosya taraması + skor
export function runStrixAudit(files: { name: string; content: string }[]): StrixAuditResult {
  const findings: StrixFinding[] = [];
  files.forEach((f) => findings.push(...scanFileContent(f.content, f.name)));

  const critical = findings.filter((f) => f.severity === 'kritik').length;
  const high = findings.filter((f) => f.severity === 'yuksek').length;
  const score = Math.max(0, Math.min(100, 100 - critical * 25 - high * 8));
  return { findings, score, scannedFiles: files.length, clean: critical === 0 };
}

export function strixStatus(): string {
  return `Strix Tarayıcı [${PATTERNS.length} kalıp • API key/JWT/private/hardcoded • Snyk yaklaşımı]`;
}
