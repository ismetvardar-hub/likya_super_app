// ============================================================================
// 🧠 SIFIR-TOKEN SEMANTİK SORGULAMA & TELEMETRİ ÖNBELLEĞİ (Sereniy konsepti)
// Aynı metrik profilini taşıyan telemetri analiz isteklerini hash'leyerek
// tarihsel yorumları geri döndürür → tekrar eden LLM çağrısı yok, $0 token.
// Bellek: in-memory Map + isteğe bağlı IndexedDB kalıcılığı (node'da no-op).
// Deterministik FNV-1a 64-bit parmak izi; sıfır bağımlılık.
// ============================================================================

// ── FNV-1a 64-bit (string) — deterministik parmak izi ─────────────────────────
export function fnv1a64(input: string): string {
  let hi = 0xcbf29ce4;
  let lo = 0x84222325;
  for (let i = 0; i < input.length; i++) {
    lo = (lo ^ input.charCodeAt(i)) >>> 0;
    const loMul = lo * 435;
    const newLo = loMul % 0x100000000;
    const carry = Math.floor(loMul / 0x100000000);
    hi = (hi * 435 + lo * 256 + carry) % 0x100000000;
    lo = newLo;
  }
  const hiHex = ('0000000' + hi.toString(16)).slice(-8);
  const loHex = ('0000000' + lo.toString(16)).slice(-8);
  return hiHex + loHex;
}

export interface TelemetryProfile {
  athleteId: string;
  metrics: Record<string, number | string | boolean>;
  version?: number; // şema sürümü — değişirse önbellek geçersiz
}

export interface CachedInterpretation {
  key: string;
  interpretation: string;
  insight: string;
  generatedAt: string;
  tokensSaved: number;
}

export interface CacheStats {
  hits: number;
  misses: number;
  hitRatePct: number;
  tokensSaved: number;
  entries: number;
}

export interface CachePersistence {
  save(key: string, value: CachedInterpretation): Promise<void>;
  load(key: string): Promise<CachedInterpretation | null>;
}

// ── IndexedDB kalıcılık adaptörü (test/node ortamında no-op) ─────────────────
export function createIndexedDbPersistence(storeName = 'semantic_query_cache'): CachePersistence | null {
  if (typeof indexedDB === 'undefined') return null;
  const dbName = 'likya_semantic_cache';
  const open = (): Promise<IDBDatabase> =>
    new Promise((resolve, reject) => {
      const req = indexedDB.open(dbName, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(storeName)) db.createObjectStore(storeName);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  return {
    async save(key, value) {
      try {
        const db = await open();
        await new Promise<void>((res, rej) => {
          const tx = db.transaction(storeName, 'readwrite');
          tx.objectStore(storeName).put(value, key);
          tx.oncomplete = () => res();
          tx.onerror = () => rej(tx.error);
        });
        db.close();
      } catch {
        /* kalıcılık hatası önbelleği bozmaz */
      }
    },
    async load(key) {
      try {
        const db = await open();
        const value = await new Promise<CachedInterpretation | null>((res, rej) => {
          const tx = db.transaction(storeName, 'readonly');
          const req = tx.objectStore(storeName).get(key);
          req.onsuccess = () => res((req.result as CachedInterpretation) ?? null);
          req.onerror = () => rej(req.error);
        });
        db.close();
        return value;
      } catch {
        return null;
      }
    },
  };
}

// ── Semantik önbellek ─────────────────────────────────────────────────────────
export class SemanticQueryCache {
  private store = new Map<string, CachedInterpretation>();
  private hits = 0;
  private misses = 0;
  private tokensSaved = 0;
  private readonly persistence: CachePersistence | null;

  constructor(persistence?: CachePersistence | null) {
    this.persistence = persistence ?? null;
  }

  /** Metrik profilini normaller ve deterministik parmak izi üretir. */
  fingerprint(profile: TelemetryProfile): string {
    const normalized = Object.keys(profile.metrics)
      .sort()
      .map((k) => {
        const v = profile.metrics[k];
        const norm = typeof v === 'number' ? Math.round(v * 100) / 100 : String(v);
        return `${k}=${norm}`;
      })
      .join('|');
    return fnv1a64(`${profile.athleteId}#${profile.version ?? 1}#${normalized}`);
  }

  async get(key: string): Promise<CachedInterpretation | null> {
    const mem = this.store.get(key);
    if (mem) {
      this.hits++;
      this.tokensSaved += mem.tokensSaved;
      return mem;
    }
    if (this.persistence) {
      const persisted = await this.persistence.load(key);
      if (persisted) {
        this.store.set(key, persisted);
        this.hits++;
        this.tokensSaved += persisted.tokensSaved;
        return persisted;
      }
    }
    this.misses++;
    return null;
  }

  async set(key: string, value: CachedInterpretation): Promise<void> {
    this.store.set(key, value);
    if (this.persistence) await this.persistence.save(key, value);
  }

  stats(): CacheStats {
    const total = this.hits + this.misses;
    return {
      hits: this.hits,
      misses: this.misses,
      hitRatePct: total > 0 ? Math.round((this.hits / total) * 100) : 0,
      tokensSaved: this.tokensSaved,
      entries: this.store.size,
    };
  }

  /**
   * Önbellek bilinçli analiz: profil eşleşirse yorumu döndürür (hit),
   * yoksa analyzer'ı çalıştırıp saklar. Token israfı yalnızca miss'te.
   */
  async analyzeCached(
    profile: TelemetryProfile,
    analyzer: (p: TelemetryProfile) => { interpretation: string; insight: string; tokens: number },
  ): Promise<{ result: CachedInterpretation; hit: boolean; key: string }> {
    const key = this.fingerprint(profile);
    const cached = await this.get(key);
    if (cached) return { result: cached, hit: true, key };

    const generated = analyzer(profile);
    const entry: CachedInterpretation = {
      key,
      interpretation: generated.interpretation,
      insight: generated.insight,
      generatedAt: new Date().toISOString(),
      tokensSaved: generated.tokens,
    };
    await this.set(key, entry);
    return { result: entry, hit: false, key };
  }
}

export function semanticQueryCacheStatus(): string {
  return 'Semantik Önbellek: FNV-1a profil parmak izi • hit/miss • IndexedDB kalıcılık • $0 token';
}

