// ============================================================================
// 🗄️ LİKYA DAYANIKLI SUPABASE CLIENT — kırılmasız + dinamik canlı geçiş katmanı
// SUPABASE_URL / SUPABASE_DB_URL / NEXT_PUBLIC_SUPABASE_URL + anahtar EKSİK olsa
// bile uygulama ASLA çökmez: queryLiveTable() mock-data fallback (simulated) döner.
// 🔄 CANLI GEÇİŞ: SUPABASE_URL + SUPABASE_ANON_KEY (veya SUPABASE_DB_URL +
// SERVICE_ROLE_KEY / NEXT_PUBLIC çifti) tanımlanır tanımlanmaz aynı fonksiyon
// sıfır kod değişikliğiyle canlı tablolara (parcels, staff_tasks,
// pos_transactions) dinamik sorgu atar. Placeholder URL'ler sayılmaz.
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

// Placeholder/dummy URL tespiti — gerçek canlı bağlantı sayılmaz
const SUPABASE_PLACEHOLDER_MARKERS = ['<your-project-id>', 'placeholder', 'example.com', 'your-project', 'dummy', 'localhost'];

export function resolveSupabaseUrl(): string {
  return process.env.SUPABASE_URL || process.env.SUPABASE_DB_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
}

export function resolveSupabaseKey(): string {
  return process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
}

// Env hazır mı? (gerçek URL + anahtar — placeholder sayılmaz)
export function supabaseEnvReady(): boolean {
  const url = resolveSupabaseUrl();
  const key = resolveSupabaseKey();
  if (!url || !key) return false;
  return !SUPABASE_PLACEHOLDER_MARKERS.some((m) => url.toLowerCase().includes(m));
}

// Dinamik geçiş durumu (UI/health için dürüst rapor)
export function supabaseSwitchStatus(): { status: 'ready' | 'standby' | 'unconfigured'; mode: string } {
  const url = resolveSupabaseUrl();
  const key = resolveSupabaseKey();
  if (!url || !key) return { status: 'unconfigured', mode: 'Supabase env tanimli degil (SUPABASE_URL + SUPABASE_ANON_KEY bekleniyor)' };
  if (SUPABASE_PLACEHOLDER_MARKERS.some((m) => url.toLowerCase().includes(m))) return { status: 'standby', mode: 'Placeholder URL — canli gecis bekleniyor' };
  return { status: 'ready', mode: 'Canli gecis hazir — parcels/staff_tasks/pos_transactions dinamik sorgu aktif' };
}

export type SafeSupabaseClient = ReturnType<typeof createSupabaseFromModule>;

// Dinamik createClient — @supabase/supabase-js yalnızca env hazırken yüklenir
function createSupabaseFromModule(module: { createClient: (url: string, key: string) => unknown }) {
  const url = resolveSupabaseUrl();
  const key = resolveSupabaseKey();
  return module.createClient(url, key) as unknown as {
    from: (table: string) => {
      select: (cols?: string) => { limit?: (n: number) => { order?: (col: string, opts?: { ascending?: boolean }) => Promise<{ data: unknown; error: unknown }> } };
      insert: (rows: Record<string, unknown> | Record<string, unknown>[], opts?: { returning?: string }) => Promise<{ data: unknown; error: unknown }>;
      update: (patch: Record<string, unknown>) => { eq: (col: string, val: unknown) => Promise<{ data: unknown; error: unknown }> };
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

// ── CANLI YAZMA KÖPRÜLERİ (insert/update) — env yoksa mock fallback ──

export interface WriteResult {
  ok: boolean;
  simulated: boolean;
  rowId: string | null;
  error: string | null;
  table: string;
}

// Satır ekle (canlı Supabase → insert; env yoksa deterministik simülasyon)
export async function insertLiveRow(table: string, row: Record<string, unknown>): Promise<WriteResult> {
  const client = await getSafeSupabaseClient();
  const rowId = `id_${Date.now().toString(36)}_${Math.floor(Math.random() * 1e4)}`;
  if (!client) {
    // Env yok → mock fallback (asla çökme)
    try { if (typeof window !== 'undefined') { const key = `likya_write_${table}_v1`; const raw = window.localStorage.getItem(key); const list = raw ? (JSON.parse(raw) as unknown[]) : []; window.localStorage.setItem(key, JSON.stringify([...list, { ...row, id: rowId }])); } } catch { /* ignore */ }
    return { ok: true, simulated: true, rowId, error: null, table };
  }
  try {
    const { error } = await client.from(table).insert(row);
    if (error) throw new Error(String(error));
    return { ok: true, simulated: false, rowId, error: null, table };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, simulated: true, rowId: null, error: msg, table };
  }
}

// Satır güncelle (canlı Supabase → update + eq; env yoksa mock fallback)
export async function updateLiveRow(table: string, matchCol: string, matchVal: unknown, patch: Record<string, unknown>): Promise<WriteResult> {
  const client = await getSafeSupabaseClient();
  const rowId = `upd_${Date.now().toString(36)}`;
  if (!client) {
    return { ok: true, simulated: true, rowId, error: null, table };
  }
  try {
    const { error } = await client.from(table).update(patch).eq(matchCol, matchVal);
    if (error) throw new Error(String(error));
    return { ok: true, simulated: false, rowId, error: null, table };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, simulated: true, rowId: null, error: msg, table };
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
