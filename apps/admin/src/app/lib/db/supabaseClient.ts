// ============================================================================
// 🗄️ LİKYA DAYANIKLI SUPABASE CLIENT — kırılmasız veri katmanı
// SUPABASE_DB_URL / NEXT_PUBLIC_SUPABASE_URL + anahtar EKSİK olsa bile uygulama
// ASLA çökmez: queryLiveTable() mock-data fallback (simulated) döner.
// Gerçek bağlantı: SUPABASE_DB_URL + SUPABASE_SERVICE_ROLE_KEY eklendiğinde
// aynı fonksiyon canlı tablolara (parcels, sports_facilities, pos_transactions,
// staff_tasks) dinamik sorgu atar — kod değişikliği GEREKMEZ.
// ============================================================================

export const LIVE_TABLES = ['parcels', 'sports_facilities', 'pos_transactions', 'staff_tasks'] as const;
export type LiveTable = (typeof LIVE_TABLES)[number];

export interface SupabaseQueryResult<T = Record<string, unknown>> {
  data: T[];
  error: string | null;
  simulated: boolean;
  table: string;
  latencyMs: number;
}

// Env hazır mı? (sunucu + istemci anahtarları)
export function supabaseEnvReady(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_DB_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  return !!(url && key);
}

export type SafeSupabaseClient = ReturnType<typeof createSupabaseFromModule>;

// Dinamik createClient — @supabase/supabase-js yalnızca env hazırken yüklenir
function createSupabaseFromModule(module: { createClient: (url: string, key: string) => unknown }) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_DB_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  return module.createClient(url, key) as unknown as {
    from: (table: string) => {
      select: (cols?: string) => { limit?: (n: number) => { order?: (col: string, opts?: { ascending?: boolean }) => Promise<{ data: unknown; error: unknown }> } };
    };
  };
}

let cachedClient: SafeSupabaseClient | null = null;

export async function getSafeSupabaseClient(): Promise<SafeSupabaseClient | null> {
  if (cachedClient) return cachedClient;
  if (!supabaseEnvReady()) return null;
  try {
    const mod = await import('@supabase/supabase-js');
    cachedClient = createSupabaseFromModule(mod);
    return cachedClient;
  } catch {
    return null; // kurulum/import hatası → fallback
  }
}

// ── Mock veri fallback (deterministik) — env yoksa arayüz asla boş kalmaz ──
function mockRowsFor(table: string): Record<string, unknown>[] {
  switch (table) {
    case 'parcels':
      return [
        { id: 'p-1', name: 'Parsel A-1', area_m2: 120, status: 'boş', hourly_rate: 25 },
        { id: 'p-2', name: 'Parsel B-2', area_m2: 90, status: 'dolu', hourly_rate: 30 },
        { id: 'p-3', name: 'Karavan Alanı C', area_m2: 200, status: 'boş', hourly_rate: 40 },
      ];
    case 'sports_facilities':
      return [
        { id: 'sf-1', name: 'Padel Kort 1', type: 'padel', capacity: 4, occupancy_pct: 85 },
        { id: 'sf-2', name: 'Tenis Kort 2', type: 'tennis', capacity: 4, occupancy_pct: 40 },
        { id: 'sf-3', name: 'Futbol Sahası', type: 'football', capacity: 22, occupancy_pct: 60 },
      ];
    case 'pos_transactions':
      return [
        { id: 't-1', item: 'Daze Latte', amount: 120, qty: 2, created_at: '10:15' },
        { id: 't-2', item: 'Akdeniz Tabağı', amount: 340, qty: 1, created_at: '12:40' },
        { id: 't-3', item: 'Protein Bar', amount: 60, qty: 3, created_at: '14:05' },
      ];
    case 'staff_tasks':
      return [
        { id: 'st-1', task: 'Kort 1 bakım', assignee: 'Daze Crew', priority: 'yüksek', status: 'açık' },
        { id: 'st-2', task: 'Mutfak envanteri', assignee: 'Şef', priority: 'orta', status: 'devam' },
        { id: 'st-3', task: 'Turnike kontrol', assignee: 'Güvenlik', priority: 'düşük', status: 'tamam' },
      ];
    default:
      return [];
  }
}

// ── Canlı sorgu + graceful fallback ──
export async function queryLiveTable<T = Record<string, unknown>>(
  table: LiveTable,
  opts: { select?: string; limit?: number; orderBy?: string; ascending?: boolean } = {},
): Promise<SupabaseQueryResult<T>> {
  const startedAt = Date.now();
  const client = await getSafeSupabaseClient();

  if (!client) {
    // env yok → deterministik mock fallback (asla çökme)
    const data = mockRowsFor(table) as T[];
    return { data, error: 'Supabase env eksik — mock fallback aktif', simulated: true, table, latencyMs: Date.now() - startedAt };
  }

  try {
    let query: unknown = client.from(table).select(opts.select ?? '*');
    if (opts.limit) query = (query as { limit: (n: number) => unknown }).limit(opts.limit);
    if (opts.orderBy) query = (query as { order?: (c: string, o?: { ascending?: boolean }) => unknown }).order?.(opts.orderBy, { ascending: opts.ascending ?? true });
    const { data, error } = (await query) as { data: unknown; error: unknown };
    if (error) throw new Error(String(error));
    return { data: (data ?? []) as T[], error: null, simulated: false, table, latencyMs: Date.now() - startedAt };
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return { data: [], error: message, simulated: true, table, latencyMs: Date.now() - startedAt };
  }
}

// Tablo durum rozeti (UI için)
export function supabaseStatusLabel(): string {
  return supabaseEnvReady() ? 'Supabase: canlı bağlantı hazır' : 'Supabase: mock fallback (env bekleniyor)';
}
