// ============================================================================
// LİKYA API CLIENT - Python FastAPI Backend Bağlantısı
// getCeoMindset, executeAutonomousEvent, sendFeedback
// ============================================================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface CeoMindset {
  vision: string;
  principles: string[];
  decision_criteria: string[];
  style: Record<string, string>;
  categories: Record<string, string[]>;
  master_prompt: string;
}

interface AutonomousEventPayload {
  source: string;
  user_id: string;
  event_type: string;
  content: string;
}

interface AutonomousEventResponse {
  source: string;
  user_id: string;
  event_type: string;
  intent: string;
  fast_response: string;
  latency_ms: number;
  from_cache: boolean;
}

interface FeedbackPayload {
  user_id: string;
  rating: number;
  comment: string;
  branch_id: string;
}

interface FeedbackResponse {
  action: string;
  daze_gift_code?: string;
  message: string;
  notify_staff: boolean;
  google_maps_url?: string;
}

// CEO Mindset'i çek
export async function getCeoMindset(): Promise<CeoMindset> {
  const res = await fetch(`${API_BASE_URL}/api/v1/ceo/mindset`);
  if (!res.ok) throw new Error('CEO mindset alınamadı');
  return res.json();
}

// Otonom olay tetikle
export async function executeAutonomousEvent(payload: AutonomousEventPayload): Promise<AutonomousEventResponse> {
  const res = await fetch(`${API_BASE_URL}/api/v1/autonomous/execute`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Otonom olay tetiklenemedi');
  return res.json();
}

// Kriz/geri bildirim gönder
export async function sendFeedback(payload: FeedbackPayload): Promise<FeedbackResponse> {
  const res = await fetch(`${API_BASE_URL}/api/v1/autonomous/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Geri bildirim gönderilemedi');
  return res.json();
}
