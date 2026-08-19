// ============================================================================
// 🔍 AI ANAHTAR SAĞLIK TARAMASI — çevresel + masaüstü anahtarlarını test eder
// Anahtarlar: failover-manager.js (Desktop) + .env.local'dan parse edilir;
// KONSOLA ASLA AÇIK METİN BASILMAZ (maskeleme: nvapi-***).
// Sonuçlar: 🟢 VALID / 🔴 INVALID / 🟡 RATE_LIMITED / ⚫ NOT_FOUND
// ============================================================================

import { readFileSync, existsSync } from 'fs';
import { homedir } from 'os';
import { join } from 'path';

type Masked = { provider: string; key: string; mask: string };

function mask(key: string): string {
  if (!key) return '';
  return `${key.slice(0, 10)}***${key.slice(-4)}`;
}

/** Anahtar toplama: failover-manager.js (Desktop) + .env.local */
function collectKeys(): Masked[] {
  const keys: Masked[] = [];
  const seen = new Set<string>();

  const add = (provider: string, key: string) => {
    const clean = key.trim().replace(/["';,\s]/g, '');
    if (clean.length > 12 && !seen.has(clean)) {
      seen.add(clean);
      keys.push({ provider, key: clean, mask: mask(clean) });
    }
  };

  // 1) Desktop failover-manager.js
  const fmPath = join(homedir(), 'Desktop/nexta-hub/nexta-hub-workflow/failover-manager.js');
  if (existsSync(fmPath)) {
    const src = readFileSync(fmPath, 'utf-8');
    const re = /(AIza[0-9A-Za-z_-]{20,}|gsk_[0-9A-Za-z]{20,}|sk-or-v1-[0-9A-Za-z]{20,}|csk-[0-9A-Za-z]{20,}|[a-zA-Z0-9]{32})/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(src)) !== null) {
      const v = m[1];
      if (v.startsWith('AIza')) add('Gemini', v);
      else if (v.startsWith('gsk_')) add('Groq', v);
      else if (v.startsWith('sk-or')) add('OpenRouter', v);
      else if (v.startsWith('csk-')) add('Cerebras', v);
    }
  }

  // 2) .env.local (NVIDIA + diğerleri)
  const envPath = join(process.cwd(), '.env.local');
  if (existsSync(envPath)) {
    const lines = readFileSync(envPath, 'utf-8').split('\n');
    for (const line of lines) {
      const m = line.match(/^(\w+)\s*=\s*(.+)$/);
      if (!m) continue;
      const [, name, value] = m;
      const v = value.trim();
      if (name.startsWith('NVIDIA_') && v.includes('Nvapi')) add('NVIDIA', v);
      if (name.startsWith('DEEPSEEK_') && v.length > 20) add('DeepSeek', v);
      if (name.startsWith('GEMINI_') || name.startsWith('GOOGLE_')) add('Gemini', v);
      if (name.startsWith('GROQ_') && v.startsWith('gsk_')) add('Groq', v);
      if (name.startsWith('OPENROUTER_')) add('OpenRouter', v);
      if (name.startsWith('CEREBRAS_')) add('Cerebras', v);
    }
  }

  return keys;
}

type Verdict = 'VALID' | 'INVALID' | 'RATE_LIMITED' | 'ERROR';

async function ping(provider: string, key: string, url: string, headers: Record<string, string> = {}): Promise<{ verdict: Verdict; status: number; note: string }> {
  const started = Date.now();
  try {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${key}`, ...headers }, signal: AbortSignal.timeout(9000) });
    const latency = Date.now() - started;
    if (res.ok) return { verdict: 'VALID', status: res.status, note: `${latency}ms` };
    // Gemini çift-fallback: klasik ?key= 401/403 verirse OpenAI uyumlu endpoint'i dene
    // (project-scoped / yeni nesil AQ. anahtarları destekler)
    if (provider === 'Gemini' && (res.status === 401 || res.status === 403)) {
      const alt = await fetch('https://generativelanguage.googleapis.com/v1beta/openai/models', { headers: { Authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(9000) });
      if (alt.ok) return { verdict: 'VALID', status: alt.status, note: `openai-uyumlu ${Date.now() - started}ms` };
      return { verdict: 'INVALID', status: res.status, note: `yetki reddedildi (her iki endpoint, ${latency}ms)` };
    }
    if (res.status === 401 || res.status === 403) return { verdict: 'INVALID', status: res.status, note: `yetki reddedildi (${latency}ms)` };
    if (res.status === 429) return { verdict: 'RATE_LIMITED', status: res.status, note: 'kota aşımı' };
    return { verdict: 'ERROR', status: res.status, note: `HTTP ${res.status}` };
  } catch (err) {
    return { verdict: 'ERROR', status: 0, note: (err as Error).message.slice(0, 60) };
  }
}

const PROVIDER_ENDPOINTS: Record<string, (k: string) => { url: string; headers?: Record<string, string> }> = {
  NVIDIA: (k) => ({ url: 'https://integrate.api.nvidia.com/v1/models', headers: { 'Content-Type': 'application/json' } }),
  Gemini: (k) => ({ url: `https://generativelanguage.googleapis.com/v1beta/models?key=${k}`, headers: {} }),
  Groq: (k) => ({ url: 'https://api.groq.com/openai/v1/models' }),
  OpenRouter: (k) => ({ url: 'https://openrouter.ai/api/v1/auth/key' }),
  Cerebras: (k) => ({ url: 'https://api.cerebras.ai/v1/models' }),
  DeepSeek: (k) => ({ url: 'https://api.deepseek.com/models' }),
};

async function main() {
  const keys = collectKeys();
  console.log(`\n🔍 ${keys.length} anahtar bulundu — canlı sağlık testi başlıyor...\n`);
  const rows: { provider: string; mask: string; verdict: Verdict; note: string }[] = [];

  for (const k of keys) {
    const ep = PROVIDER_ENDPOINTS[k.provider];
    if (!ep) { rows.push({ provider: k.provider, mask: k.mask, verdict: 'ERROR', note: 'endpoint yok' }); continue; }
    const { url, headers } = ep(k.key);
    const r = await ping(k.provider, k.key, url, headers);
    rows.push({ provider: k.provider, mask: k.mask, verdict: r.verdict, note: r.note });
    console.log(`${r.verdict === 'VALID' ? '🟢' : r.verdict === 'INVALID' ? '🔴' : r.verdict === 'RATE_LIMITED' ? '🟡' : '⚫'} ${k.provider.padEnd(11)} ${k.mask.padEnd(24)} ${r.note}`);
  }

  console.log(`\n${'─'.repeat(52)}`);
  console.log('📊 ÖZET');
  const valid = rows.filter((r) => r.verdict === 'VALID');
  const invalid = rows.filter((r) => r.verdict === 'INVALID');
  const limited = rows.filter((r) => r.verdict === 'RATE_LIMITED');
  console.log(`🟢 ÇALIŞAN (${valid.length}): ${valid.map((v) => `${v.provider}(${v.mask})`).join(', ') || '—'}`);
  console.log(`🔴 GEÇERSİZ (${invalid.length}): ${invalid.map((v) => `${v.provider}(${v.mask})`).join(', ') || '—'}`);
  console.log(`🟡 KOTA (${limited.length}): ${limited.map((v) => `${v.provider}(${v.mask})`).join(', ') || '—'}`);
  console.log(`⚫ HATA (${rows.length - valid.length - invalid.length - limited.length})`);
}

void main();
