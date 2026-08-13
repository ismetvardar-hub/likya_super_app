// ============================================================================
// LİKYA LEADS SERVİSİ - B2B Müşteri Kayıt Formu
// Supabase leads tablosuna veya FastAPI endpoint'ine kayıt
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface LeadPayload {
  business_name: string;
  owner_name: string;
  whatsapp: string;
  sector: string;
}

// Supabase'e lead kaydet
export async function saveLeadToSupabase(payload: LeadPayload): Promise<boolean> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
    if (!supabaseUrl || !supabasePublishableKey) return false;

    const { createClient } = await import('@supabase/supabase-js');
    const supabase = createClient(supabaseUrl, supabasePublishableKey);
    const { error } = await supabase.from('leads').insert([payload]);
    return !error;
  } catch {
    return false;
  }
}

// FastAPI'ye lead kaydet (fallback)
export async function saveLeadToApi(payload: LeadPayload): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/v1/autonomous/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        source: 'landing',
        user_id: 'lead-' + Date.now(),
        event_type: 'LEAD_CAPTURE',
        content: `${payload.business_name} | ${payload.owner_name} | ${payload.whatsapp} | ${payload.sector}`,
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// Ana kayıt fonksiyonu
export async function saveLead(payload: LeadPayload): Promise<boolean> {
  const supabaseOk = await saveLeadToSupabase(payload);
  if (supabaseOk) return true;
  return saveLeadToApi(payload);
}
