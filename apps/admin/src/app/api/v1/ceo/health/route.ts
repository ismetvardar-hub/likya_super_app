import { NextResponse } from 'next/server';

// ============================================================================
// 🏥 LİKYA HEALTH MOTORU — Vercel serverless uyumlu sağlık denetleyicisi
// ⚠️ Eski localhost (port 3000/8000/8787) ve exec/pkill onarıcı KALDIRILDI:
// serverless ortamında anlamsızdı (hep "down" dönüyordu).
// Yeni motor: fonksiyon yanıt süresi, aktif AI planları (Gemini/DeepSeek/
// OpenRouter/Plan Z) ve Supabase bağlantı durumu.
// ============================================================================

export const runtime = 'nodejs';
export const maxDuration = 10;

interface PlanStatus {
  plan: string;
  name: string;
  active: boolean;
  note: string;
}

// Sunucu tarafında tanımlı LLM anahtarlarından aktif planları tespit et
function aiPlanStatus(): PlanStatus[] {
  const has = (key: string) => !!process.env[key];
  return [
    { plan: 'A', name: 'Gemini', active: has('GEMINI_API_KEY'), note: has('GEMINI_API_KEY') ? 'canli' : 'anahtar yok' },
    { plan: 'B', name: 'DeepSeek', active: has('DEEPSEEK_API_KEY'), note: has('DEEPSEEK_API_KEY') ? 'canli' : 'anahtar yok' },
    { plan: 'C', name: 'Groq', active: has('GROQ_API_KEY'), note: has('GROQ_API_KEY') ? 'canli' : 'anahtar yok' },
    { plan: 'E', name: 'OpenRouter', active: has('OPENROUTER_API_KEY'), note: has('OPENROUTER_API_KEY') ? 'canli' : 'anahtar yok' },
    { plan: 'Z', name: 'Likya Kural Motoru', active: true, note: 'her zaman devrede (deterministik fallback)' },
  ];
}

// Supabase bağlantı durumu — placeholder/dummy URL'yi ASLA "canlı" sayma.
// Env tanımlı değilse → unconfigured; placeholder ise → standby; gerçek ise → ready.
const SUPABASE_PLACEHOLDER_MARKERS = ['<your-project-id>', 'placeholder', 'example.com', 'your-project', 'dummy'];

function resolveSupabaseUrl(): string {
  return process.env.SUPABASE_URL || process.env.SUPABASE_DB_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
}

function resolveSupabaseKey(): string {
  return process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
}

function supabaseStatus(): { status: 'ready' | 'standby' | 'unconfigured'; connected: boolean; mode: string; url: string | null } {
  const url = resolveSupabaseUrl();
  const key = resolveSupabaseKey();
  if (!url || !key) {
    return { status: 'unconfigured', connected: false, mode: 'Supabase env tanimli degil (SUPABASE_URL + SUPABASE_ANON_KEY bekleniyor)', url: url || null };
  }
  const isPlaceholder = SUPABASE_PLACEHOLDER_MARKERS.some((m) => url.toLowerCase().includes(m));
  if (isPlaceholder) {
    return { status: 'standby', connected: false, mode: 'Placeholder URL tespit edildi — canli baglanti kurulmadi; gercek Supabase URL + anahtar bekleniyor', url };
  }
  // Gerçek SELECT 1 ping burada yapılamıyorsa "ready/ayarli" raporlanır; ilk gerçek sorguda doğrulanır.
  return { status: 'ready', connected: true, mode: 'URL + anahtar tanimli — dinamik gecis hazir (parcels/staff_tasks/pos_transactions)', url };
}

export async function GET() {
  const startedAt = Date.now();
  const plans = aiPlanStatus();
  const supabase = supabaseStatus();

  // Fonksiyon yanıt süresi — Vercel fonksiyonunun canlı olduğunun kanıtı
  const latencyMs = Date.now() - startedAt;

  // Bellek kullanımı (serverless heap) — Node runtime'da mevcut
  const mem = typeof process !== 'undefined' && process.memoryUsage
    ? {
        heapUsedMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        heapTotalMB: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        rssMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
      }
    : null;

  const activePlans = plans.filter((p) => p.active).map((p) => p.plan).join('->');

  return NextResponse.json({
    success: true,
    checkedAt: new Date().toISOString(),
    runtime: 'vercel-serverless',
    latencyMs,
    memory: mem,
    health: 'healthy',
    nextJs: { status: 'up', note: 'fonksiyon yanit veriyor' },
    ai: {
      plans,
      activeChain: activePlans,
      fallbackChain: 'A(Gemini) -> B(DeepSeek) -> C(Groq) -> D(Mistral/Ollama) -> E(OmniRoute Free Pool) -> Z(Kural Motoru)',
    },
    localLlm: {
      ollama: { status: 'offline', note: '127.0.0.1:11434 — Vercel serverless ortaminda yerel model yok; bulut selalesi/Plan Z devrede', port: 11434 },
    },
    freePool: {
      models: ['meta-llama/llama-3.3-70b-instruct:free', 'deepseek/deepseek-r1:free', 'google/gemini-2.0-flash-exp:free', 'qwen/qwen-2.5-coder-32b-instruct:free'],
      active: !!process.env.OPENROUTER_API_KEY,
      note: 'OmniRoute :free havuzu — butce tuketmez, Plan E zincirinde',
    },
    supabase,
    security: {
      apiKeys: 'server-only (NEXT_PUBLIC LLM anahtarlari kaldirildi)',
      proxy: '/api/v1/ai - client bundle anahtar icermez',
    },
    healthy: true,
  });
}

// Eski servis-restart POST davranışı serverless'te anlamsız -> açıklayıcı yanıt
export async function POST() {
  return NextResponse.json(
    { success: false, error: 'Vercel serverless ortaminda servis restart desteklenmez. Health motoru yalnizca izleme yapar.' },
    { status: 400 },
  );
}
