// Supabase Edge Function: verify-ticket
// Verifies QR code and marks ticket as used at event entrance

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { qr_code, event_id } = await req.json();

    if (!qr_code || !event_id) {
      return new Response(
        JSON.stringify({ valid: false, message: "qr_code ve event_id zorunludur." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 1. Bilet sorgula
    const { data: ticket, error: fetchError } = await supabase
      .from("tickets")
      .select("id, status, user_id, event_id")
      .eq("qr_code", qr_code)
      .eq("event_id", event_id)
      .single();

    if (fetchError || !ticket) {
      return new Response(
        JSON.stringify({ valid: false, message: "Geçersiz Bilet: Bilet kaydı bulunamadı." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (ticket.status === "used") {
      return new Response(
        JSON.stringify({ valid: false, message: "Dikkat! Bu bilet daha önce kullanılmıştır." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (ticket.status === "cancelled") {
      return new Response(
        JSON.stringify({ valid: false, message: "İptal Edilmiş Bilet." }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Bileti 'used' olarak işaretle
    const { error: updateError } = await supabase
      .from("tickets")
      .update({ status: "used" })
      .eq("id", ticket.id);

    if (updateError) {
      return new Response(
        JSON.stringify({ valid: false, message: "Bilet güncellenirken sunucu hatası oluştu." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        valid: true,
        message: "Giriş Başarılı! İyi eğlenceler dileriz.",
        ticket_id: ticket.id,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ valid: false, message: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
