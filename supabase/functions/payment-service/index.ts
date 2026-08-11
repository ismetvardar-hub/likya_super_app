// ============================================================================
// LİKYA ÖDEME SERVİSİ - Edge Function
// Ön Provizyon (PreAuth), Provizyon Kapama (PostAuth), Jest (CancelPreAuth),
// Token Cüzdanı (Top-up & Transfer) - İyzico entegrasyonu
// ============================================================================

import { createClient } from 'npm:@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// İyzico API anahtarları
const IYZICO_API_KEY = Deno.env.get('IYZICO_API_KEY') || '';
const IYZICO_SECRET_KEY = Deno.env.get('IYZICO_SECRET_KEY') || '';
const IYZICO_BASE_URL = Deno.env.get('IYZICO_BASE_URL') || 'https://api.iyzipay.com';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// ============================================================================
// 1. ÖN PROVİZYON (PreAuth)
// Katılım anında karttan tutarı bloke eder (tahsilat yapmaz)
// ============================================================================
async function preAuthorize(eventId: string, userId: string, amount: number) {
  const payload = {
    locale: 'tr',
    conversationId: `PREAUTH-${eventId}-${userId}`,
    price: amount.toFixed(2),
    paidPrice: amount.toFixed(2),
    currency: 'TRY',
    installment: 1,
    basketId: `EVENT-${eventId}`,
    paymentGroup: 'PRODUCT',
    callbackUrl: `${supabaseUrl}/functions/v1/payment-service/callback`,
    paymentSource: 'PRE_AUTHORIZATION',
  };

  const response = await fetch(`${IYZICO_BASE_URL}/payment/preauth`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `IYZWS ${IYZICO_API_KEY}:${IYZICO_SECRET_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (result.status === 'success') {
    const { error } = await supabase
      .from('event_participants')
      .update({ blocked_amount: amount, status: 'pre_authorized' })
      .eq('event_id', eventId)
      .eq('user_id', userId);

    if (error) throw error;
    return { success: true, paymentId: result.paymentId, blockedAmount: amount };
  }

  return { success: false, error: result.errorMessage };
}

// ============================================================================
// 2. PROVİZYON KAPAMA (PostAuth / Capture)
// Etkinlik bitiminde nihai tutarı çeker, fazla blokeyi serbest bırakır
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
// 3. PROVİZYON İPTALİ (CancelPreAuth)
// Jest yapıldığında hedef kişinin blokajını iptal eder, limiti serbest bırakır
// ============================================================================
async function cancelPreAuth(paymentId: string) {
  const payload = {
    locale: 'tr',
    conversationId: `CANCEL-${paymentId}`,
    paymentId,
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
  return { success: result.status === 'success', result };
}

// ============================================================================
// 4. JEST TAHSİLATI (P2P Overwrite)
// Jest yapan kişinin kartından çekim yapıp hedefin blokajını iptal eder
// ============================================================================
async function processGesture(eventId: string, giverId: string, receiverId: string, amount: number) {
  // 1. Jest yapan kişinin ön provizyonu
  const preauth = await preAuthorize(eventId, giverId, amount);

  if (!preauth.success) {
    return { success: false, error: 'Jest ön provizyonu başarısız' };
  }

  // 2. Hedef kişinin ön provizyonunu iptal et (CancelPreAuth)
  const { data: receiverParticipant } = await supabase
    .from('event_participants')
    .select('payment_id')
    .eq('event_id', eventId)
    .eq('user_id', receiverId)
    .single();

  if (receiverParticipant?.payment_id) {
    await cancelPreAuth(receiverParticipant.payment_id);
  }

  // 3. Hedef kişinin blokajını iptal et, durumu güncelle
  const { error: releaseError } = await supabase
    .from('event_participants')
    .update({ blocked_amount: 0, status: 'gesture_covered' })
    .eq('event_id', eventId)
    .eq('user_id', receiverId);

  if (releaseError) throw releaseError;

  // 4. Jest olayını kaydet
  const { error: gestureError } = await supabase
    .from('gesture_events')
    .insert({ event_id: eventId, giver_id: giverId, receiver_id: receiverId, amount });

  if (gestureError) throw gestureError;

  return { success: true, message: 'Jest başarıyla işlendi, hedef blokajı iptal edildi' };
}

// ============================================================================
// 5. CÜZDAN BAKİYE YÜKLEME (Top-up via İyzico)
// ============================================================================
async function walletTopUp(userId: string, amount: number) {
  // İyzico ile ödeme al
  const payload = {
    locale: 'tr',
    conversationId: `TOPUP-${userId}`,
    price: amount.toFixed(2),
    paidPrice: amount.toFixed(2),
    currency: 'TRY',
    installment: 1,
    basketId: `WALLET-${userId}`,
    paymentGroup: 'PRODUCT',
  };

  const response = await fetch(`${IYZICO_BASE_URL}/payment/auth`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `IYZWS ${IYZICO_API_KEY}:${IYZICO_SECRET_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  const result = await response.json();

  if (result.status === 'success') {
    // Cüzdan bakiyesini artır
    const { error } = await supabase.rpc('increment_token_balance', {
      user_id: userId,
      amount: Math.floor(amount), // 1 TL = 1 token
    });
    if (error) throw error;
    return { success: true, message: `${amount} TL yüklendi, ${Math.floor(amount)} token eklendi` };
  }

  return { success: false, error: result.errorMessage };
}

// ============================================================================
// 6. TOKEN TRANSFERİ (Atomik ACID)
// ============================================================================
async function tokenTransfer(senderId: string, receiverId: string, amount: number) {
  // Atomik işlem: gönderenin bakiyesini düş, alıcının bakiyesini artır
  const { error: deductError } = await supabase.rpc('decrement_token_balance', {
    user_id: senderId,
    amount,
  });
  if (deductError) throw deductError;

  const { error: addError } = await supabase.rpc('increment_token_balance', {
    user_id: receiverId,
    amount,
  });
  if (addError) throw addError;

  // Transferi kaydet
  const { error: transferError } = await supabase
    .from('token_transfers')
    .insert({ sender_id: senderId, receiver_id: receiverId, amount });
  if (transferError) throw transferError;

  return { success: true, message: `${amount} token transfer edildi` };
}

// ============================================================================
// ANA HANDLER
// ============================================================================
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { action, eventId, userId, giverId, receiverId, amount, paymentId, finalAmount } = await req.json();

    let result;
    switch (action) {
      case 'pre_authorize':
        result = await preAuthorize(eventId, userId, amount);
        break;
      case 'capture':
        result = await capturePayment(paymentId, finalAmount);
        break;
      case 'cancel_preauth':
        result = await cancelPreAuth(paymentId);
        break;
      case 'gesture':
        result = await processGesture(eventId, giverId, receiverId, amount);
        break;
      case 'wallet_topup':
        result = await walletTopUp(userId, amount);
        break;
      case 'token_transfer':
        result = await tokenTransfer(giverId, receiverId, amount);
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
