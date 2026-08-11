// ============================================================================
// LİKYA İYZİCO WEBHOOK DİNLEYİCİSİ - Edge Function
// Asenkron ödeme doğrulama, iptal ve anlaşmazlık (dispute) yönetimi
// ============================================================================

import { createClient } from 'npm:@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const IYZICO_SECRET_KEY = Deno.env.get('IYZICO_SECRET_KEY') || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============================================================================
// WEBHOOK İMZA DOĞRULAMA
// ============================================================================
function verifySignature(body: string, signature: string): boolean {
  // İyzico webhook imzası: HMAC-SHA256(secret_key + body)
  const crypto = new Crypto();
  const key = new TextEncoder().encode(IYZICO_SECRET_KEY);
  const data = new TextEncoder().encode(body);
  return crypto.subtle.importKey('raw', key, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
    .then((cryptoKey) => crypto.subtle.sign('HMAC', cryptoKey, data))
    .then((sig) => {
      const hex = Array.from(new Uint8Array(sig)).map((b) => b.toString(16).padStart(2, '0')).join('');
      return hex === signature;
    })
    .catch(() => false);
}

// ============================================================================
// ÖDEME DURUMU GÜNCELLEME
// ============================================================================
async function updatePaymentStatus(paymentId: string, status: string) {
  const { error } = await supabase
    .from('event_participants')
    .update({ status })
    .eq('payment_id', paymentId);
  if (error) throw error;
}

// ============================================================================
// İPTAL / İADE (Refund) YÖNETİMİ
// ============================================================================
async function processRefund(paymentId: string, amount: number) {
  // İyzico iade isteği
  const payload = {
    locale: 'tr',
    conversationId: `REFUND-${paymentId}`,
    paymentId,
    price: amount.toFixed(2),
    paidPrice: amount.toFixed(2),
    currency: 'TRY',
  };

  const response = await fetch('https://api.iyzipay.com/payment/refund', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `IYZWS ${IYZICO_SECRET_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();
  if (result.status === 'success') {
    await updatePaymentStatus(paymentId, 'refunded');
  }
  return { success: result.status === 'success', result };
}

// ============================================================================
// JEST / TOKEN GERİ ALMA (Rollback)
// ============================================================================
async function rollbackGesture(gestureId: string) {
  const { data: gesture } = await supabase
    .from('gesture_events')
    .select('*')
    .eq('id', gestureId)
    .single();

  if (!gesture) return { success: false, error: 'Jest bulunamadı' };

  // Jest iptal edildi: hedef kişinin blokajını geri yükle
  const { error } = await supabase
    .from('event_participants')
    .update({ blocked_amount: gesture.amount, status: 'pre_authorized' })
    .eq('event_id', gesture.event_id)
    .eq('user_id', gesture.receiver_id);

  if (error) throw error;

  // Jest olayını iptal olarak işaretle
  await supabase
    .from('gesture_events')
    .update({ status: 'rolled_back' })
    .eq('id', gestureId);

  return { success: true, message: 'Jest geri alındı, hedef blokajı geri yüklendi' };
}

async function rollbackTokenTransfer(transferId: string) {
  const { data: transfer } = await supabase
    .from('token_transfers')
    .select('*')
    .eq('id', transferId)
    .single();

  if (!transfer) return { success: false, error: 'Transfer bulunamadı' };

  // Transferi geri al: gönderenin bakiyesini artır, alıcının bakiyesini düş
  await supabase.rpc('increment_token_balance', {
    user_id: transfer.sender_id,
    amount: transfer.amount,
  });
  await supabase.rpc('decrement_token_balance', {
    user_id: transfer.receiver_id,
    amount: transfer.amount,
  });

  // Transferi iptal olarak işaretle
  await supabase
    .from('token_transfers')
    .update({ status: 'rolled_back' })
    .eq('id', transferId);

  return { success: true, message: 'Token transferi geri alındı' };
}

// ============================================================================
// ANA HANDLER - Webhook dinleyicisi
// ============================================================================
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.text();
    const signature = req.headers.get('x-iyzico-signature') || '';

    // İmza doğrula (üretimde zorunlu)
    // const isValid = await verifySignature(body, signature);
    // if (!isValid) {
    //   return new Response(JSON.stringify({ success: false, error: 'Geçersiz imza' }), {
    //     headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    //     status: 401,
    //   });
    // }

    const event = JSON.parse(body);
    const { action, paymentId, gestureId, transferId, amount } = event;

    let result;
    switch (action) {
      case 'payment_success':
        // Ödeme başarılı, durumu güncelle
        await updatePaymentStatus(paymentId, 'paid');
        result = { success: true, message: 'Ödeme doğrulandı' };
        break;

      case 'payment_failed':
        // Ödeme başarısız, durumu güncelle
        await updatePaymentStatus(paymentId, 'failed');
        result = { success: true, message: 'Ödeme başarısız olarak işaretlendi' };
        break;

      case 'refund':
        // İade işlemi
        result = await processRefund(paymentId, amount);
        break;

      case 'rollback_gesture':
        // Jest geri alma
        result = await rollbackGesture(gestureId);
        break;

      case 'rollback_token':
        // Token transferi geri alma
        result = await rollbackTokenTransfer(transferId);
        break;

      default:
        result = { success: false, error: 'Bilinmeyen webhook olayı' };
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
