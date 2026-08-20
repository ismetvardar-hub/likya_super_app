// ============================================================================
// 📦 SUPABASE STORAGE MEDYA ADAPTÖRÜ (Adım 52)
// Supabase Storage bucket'ları: athlete-avatars, session-reports (PDF), drill-diagrams
// Yardımcılar: uploadReportPdf, getSignedReportUrl, uploadAvatar, uploadDrillDiagram
// Headless CI için bellek tabanlı mock provider yedeği (Supabase olmadan test).
// Deterministik; sıfır bağımlılık.
// ============================================================================

export interface StorageProvider {
  upload(bucket: string, path: string, data: Uint8Array, contentType?: string): Promise<{ path: string }>;
  getSignedUrl(path: string, expiresInSec: number): Promise<string>;
  list(bucket: string): Promise<string[]>;
}

export const STORAGE_BUCKETS = {
  avatars: 'athlete-avatars',
  reports: 'session-reports',
  drills: 'drill-diagrams',
} as const;

// ── Mock provider (headless CI / offline) ─────────────────────────────────────
export function createMockStorageProvider(): StorageProvider {
  const files = new Map<string, { data: Uint8Array; contentType: string }>();
  return {
    async upload(bucket, path, data, contentType = 'application/octet-stream') {
      files.set(`${bucket}/${path}`, { data, contentType });
      return { path };
    },
    async getSignedUrl(path, expiresInSec) {
      const exists = Array.from(files.keys()).some((k) => k.endsWith(path));
      if (!exists) throw new Error(`Dosya yok: ${path}`);
      return `https://mock.supabase.co/storage/v1/object/signed/${path}?expires=${expiresInSec}&token=mock`;
    },
    async list(bucket) {
      return Array.from(files.keys()).filter((k) => k.startsWith(`${bucket}/`)).map((k) => k.slice(bucket.length + 1));
    },
  };
}

// ── Supabase Storage provider (gerçek istemci — yapılandırılmadıysa null) ──────
export function createSupabaseStorageProvider(): StorageProvider | null {
  const url = typeof process !== 'undefined' ? process.env?.NEXT_PUBLIC_SUPABASE_URL : undefined;
  const anonKey = typeof process !== 'undefined' ? process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY : undefined;
  if (!url || !anonKey) return null;
  const base = `${url.replace(/\/$/, '')}/storage/v1`;
  return {
    async upload(bucket, path, data, contentType = 'application/octet-stream') {
      const res = await fetch(`${base}/object/${bucket}/${path}`, {
        method: 'POST',
        headers: { authorization: `Bearer ${anonKey}`, 'content-type': contentType, apikey: anonKey },
        body: data as unknown as BodyInit,
      });
      if (!res.ok) throw new Error(`Supabase upload hatası: ${res.status}`);
      return { path };
    },
    async getSignedUrl(path, expiresInSec) {
      const res = await fetch(`${base}/object/sign/${path}`, {
        method: 'POST',
        headers: { authorization: `Bearer ${anonKey}`, 'content-type': 'application/json', apikey: anonKey },
        body: JSON.stringify({ expiresIn: expiresInSec }),
      });
      if (!res.ok) throw new Error(`Signed URL hatası: ${res.status}`);
      const json = (await res.json()) as { signedURL: string };
      return `${url.replace(/\/$/, '')}${json.signedURL}`;
    },
    async list(bucket) {
      const res = await fetch(`${base}/object/list/${bucket}`, {
        method: 'POST',
        headers: { authorization: `Bearer ${anonKey}`, 'content-type': 'application/json', apikey: anonKey },
        body: JSON.stringify({ prefix: '', limit: 100 }),
      });
      if (!res.ok) return [];
      const json = (await res.json()) as Array<{ name: string }>;
      return json.map((o) => o.name);
    },
  };
}

// ── Yüksek seviye adaptör ─────────────────────────────────────────────────────
export class SupabaseStorageAdapter {
  private readonly provider: StorageProvider;

  constructor(provider?: StorageProvider) {
    this.provider = provider ?? createSupabaseStorageProvider() ?? createMockStorageProvider();
  }

  async uploadReportPdf(sessionId: string, buffer: Uint8Array): Promise<string> {
    const path = `sessions/${sessionId}/report_${Date.now().toString(36)}.pdf`;
    await this.provider.upload(STORAGE_BUCKETS.reports, path, buffer, 'application/pdf');
    return path;
  }

  async getSignedReportUrl(reportPath: string, expiresInSec = 3600): Promise<string> {
    return this.provider.getSignedUrl(reportPath, expiresInSec);
  }

  async uploadAvatar(athleteId: string, imageBuffer: Uint8Array): Promise<string> {
    const path = `athletes/${athleteId}/avatar.png`;
    await this.provider.upload(STORAGE_BUCKETS.avatars, path, imageBuffer, 'image/png');
    return path;
  }

  async uploadDrillDiagram(drillId: string, buffer: Uint8Array): Promise<string> {
    const path = `drills/${drillId}/diagram.svg`;
    await this.provider.upload(STORAGE_BUCKETS.drills, path, buffer, 'image/svg+xml');
    return path;
  }

  async listBucket(bucket: keyof typeof STORAGE_BUCKETS): Promise<string[]> {
    return this.provider.list(STORAGE_BUCKETS[bucket]);
  }
}

export function supabaseStorageStatus(): string {
  return "Supabase Storage: avatars/reports/drills bucket'lar • signed URL • mock CI yedeği";
}
