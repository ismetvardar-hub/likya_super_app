import { NextRequest, NextResponse } from 'next/server';
import { sendVipAlert } from '../../../../lib/notifications';

// ============================================================================
// 📲 LİKYA VIP BİLDİRİM API'si — Telegram / Discord webhook tetikleyicisi
// POST { message, channels? } → Patron'a anlık operasyonel bildirim
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    let body: { message?: string; channels?: ('telegram' | 'discord')[] };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Geçersiz JSON gövdesi' }, { status: 400 });
    }

    const message = String(body.message || '').trim();
    if (!message) {
      return NextResponse.json({ success: false, error: 'Mesaj boş olamaz' }, { status: 400 });
    }

    const defaultChannels: ('telegram' | 'discord')[] = ['telegram', 'discord'];
    const channels = Array.isArray(body.channels) && body.channels.length > 0 ? body.channels : defaultChannels;
    const results = await sendVipAlert(message, channels);
    const anyOk = results.some((r) => r.ok);

    return NextResponse.json({
      success: anyOk,
      message: anyOk
        ? '📲 VIP bildirim iletildi (en az bir kanal başarılı)'
        : '📲 VIP kanallar yapılandırılmamış — bildirim hazır durumda',
      results,
    }, { status: anyOk ? 200 : 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
