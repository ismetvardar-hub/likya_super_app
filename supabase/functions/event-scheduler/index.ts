// ============================================================================
// LİKYA OTOMATİK ETKİNLİK ZAMANLAYICISI - Edge Function (Cron)
// Etkinlik süresi bittiğinde otomatik provizyon kapama (capture)
// ============================================================================

import { createClient } from 'npm:@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const IYZICO_API_KEY = Deno.env.get('IYZICO_API_KEY') || '';
const IYZICO_SECRET_KEY = Deno.env.get('IYZICO_SECRET_KEY') || '';
const IYZICO_BASE_URL = Deno.env.get('IYZICO_BASE_URL') || 'https://api.iyzipay.com';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============================================================================
// PROVİZYON KAPAMA (Capture)
// ============================================================================
async function capturePayment(paymentId: string, finalAmount: number) {
  const payload = {
    locale: 'tr',
    conversationId: `CAPTURE-${paymentId}`,
    paymentId,
    price: finalAmount.toFixed(2),
    paidPrice: finalAmount.toFixed(2),
    currency: 'TRY',
  };

  const response = await fetch(`${IYZICO_BASE_URL}/payment/iyzipos/capture`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `IYZWS ${IYZICO_API_KEY}:${IYZICO_SECRET_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();
  return { success: result.status === 'success', result };
}

// ============================================================================
// TOPLU PROVİZYON İPTALİ (Bulk CancelPreAuth)
// Etkinlik iptal edildiğinde tüm katılımcıların blokajını kaldırır
// ============================================================================
async function bulkCancelPreAuth(eventId: string) {
  const { data: participants } = await supabase
    .from('event_participants')
    .select('*')
    .eq('event_id', eventId)
    .eq('status', 'pre_authorized');

  if (!participants) return { success: true, cancelled: 0 };

  let cancelled = 0;
  for (const p of participants) {
    if (p.payment_id) {
      const payload = {
        locale: 'tr',
        conversationId: `CANCEL-${p.payment_id}`,
        paymentId: p.payment_id,
      };
      const response = await fetch(`${IYZICO_BASE_URL}/payment/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `IYZWS ${IYZICO_API_KEY}:${IYZICO_SECRET_KEY}`,
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (result.status === 'success') {
        await supabase
          .from('event_participants')
          .update({ blocked_amount: 0, status: 'cancelled' })
          .eq('id', p.id);
        cancelled++;
      }
    }
  }

  return { success: true, cancelled };
}

// ============================================================================
// ANA HANDLER - Cron tetikleyicisi
// ============================================================================
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, eventId } = await req.json();

    let result;
    switch (action) {
      case 'auto_capture':
        // Etkinlik süresi bitti, tüm aktif katılımcıların provizyonunu kapat
        const { data: events } = await supabase
          .from('events')
          .select('*')
          .eq('id', eventId)
          .single();

        if (!events) {
          result = { success: false, error: 'Etkinlik bulunamadı' };
          break;
        }

        const { data: participants } = await supabase
          .from('event_participants')
          .select('*')
          .eq('event_id', eventId)
          .eq('status', 'pre_authorized');

        let captured = 0;
        if (participants) {
          for (const p of participants) {
            if (p.payment_id) {
              const cap = await capturePayment(p.payment_id, p.share_amount);
              if (cap.success) {
                await supabase
                  .from('event_participants')
                  .update({ status: 'captured' })
                  .eq('id', p.id);
                captured++;
              }
            }
          }
        }

        result = { success: true, captured, total: participants?.length || 0 };
        break;

      case 'bulk_cancel':
        // Etkinlik iptal edildi, tüm blokajları kaldır
        result = await bulkCancelPreAuth(eventId);
        break;

      default:
        result = { success: false, error: 'Bilinmeyen aksiyon' };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
