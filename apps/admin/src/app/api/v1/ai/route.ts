import { NextRequest, NextResponse } from 'next/server';
import { generateWithWaterfall } from '../../../lib/ai/modelMatrix';

// ============================================================================
// 🔐 LİKYA GÜVENLİ AI PROXY — client tarafından çağrılan tek LLM kapısı
// Tüm LLM anahtarları (GEMINI_API_KEY / DEEPSEEK_API_KEY / OPENROUTER_API_KEY)
// SADECE sunucu tarafında okunur; client bundle'a asla sızmaz.
// Akış: client → /api/v1/ai → generateWithWaterfall (A→B→C→D→Z şelale)
// ============================================================================

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { prompt?: string; systemPrompt?: string; reasoning?: boolean };
    const prompt = (body.prompt || '').trim();
    if (!prompt) {
      return NextResponse.json({ success: false, message: 'Prompt boş olamaz' }, { status: 400 });
    }

    const startedAt = Date.now();
    // Reasoning isteği R1 öncelikli kod moduna; normal istek araştırma moduna gider
    const mode = body.reasoning === true ? ('code' as const) : ('research' as const);
    const matrix = await generateWithWaterfall(prompt, mode);

    if (!matrix.ok) {
      return NextResponse.json(
        { success: false, message: matrix.error || 'Tüm modeller başarısız', fallbackLog: matrix.fallbackLog },
        { status: 503 },
      );
    }

    return NextResponse.json({
      success: true,
      provider: matrix.provider,
      plan: matrix.plan,
      badge: matrix.badge,
      content: matrix.content,
      latencyMs: Date.now() - startedAt,
      fallbackLog: matrix.fallbackLog,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ success: false, message }, { status: 500 });
  }
}

// Sunucudaki aktif AI planlarını raporlar (client sağlık kontrolü için)
export async function GET() {
  const gemini = !!process.env.GEMINI_API_KEY;
  const deepseek = !!process.env.DEEPSEEK_API_KEY;
  const openrouter = !!process.env.OPENROUTER_API_KEY;

  return NextResponse.json({
    success: true,
    checkedAt: new Date().toISOString(),
    plans: [
      { plan: 'A', name: 'Gemini', active: gemini },
      { plan: 'B', name: 'DeepSeek', active: deepseek },
      { plan: 'E', name: 'OpenRouter', active: openrouter },
      { plan: 'Z', name: 'Kural Motoru', active: true }, // Plan Z her zaman devrede
    ],
    fallbackChain: 'A(Gemini) → B(DeepSeek) → C(Groq) → D(Mistral/Ollama) → E(OpenRouter) → Z(Kural)',
  });
}
