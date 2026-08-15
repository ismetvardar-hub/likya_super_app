// ============================================================================
// 🏛️ SONSUZ KURUMSAL HAFIZA & ARŞİV MOTORU
// Infinite Memory & Enterprise Vault — TTL'siz kalıcı kurumsal depolama
//
// Depolama önceliği:
//   1) node:sqlite (Node yerleşik) → data/infinite_memory.sqlite
//   2) Bağımlılıksız JSON dosya deposu → data/infinite_memory.json
//
// Şema:
//   - decisions: id, timestamp, category, decision_text, status('APPROVED'), approved_by('Patron')
//   - enterprise_vault: id, timestamp, document_type, metadata, content, tags
// ============================================================================

import fs from 'fs';
import path from 'path';

// Veri dizini: monorepo kökü altında /data
const ROOT = path.resolve(process.cwd(), process.cwd().endsWith('apps/admin') ? '../..' : '.');
const DATA_DIR = path.join(ROOT, 'data');
const SQLITE_PATH = path.join(DATA_DIR, 'infinite_memory.sqlite');
const JSON_PATH = path.join(DATA_DIR, 'infinite_memory.json');

export type VaultDocType = 'INVOICE' | 'LEGAL' | 'CUSTOMER' | 'TRANSACTION' | 'DOCUMENT';

export interface DecisionRecord {
  id: string;
  timestamp: string; // ISO 8601
  category: string;
  decision_text: string;
  status: 'APPROVED';
  approved_by: 'Patron';
}

export interface VaultEntry {
  id: string;
  timestamp: string;
  document_type: VaultDocType;
  metadata: Record<string, string>;
  content: string;
  tags: string[];
}

// ----------------------------------------------------------------------------
// node:sqlite (yerleşik) — webpack statik çözümlemesini atlamak için eval(require)
// ----------------------------------------------------------------------------
interface SqliteDb {
  exec(sql: string): void;
  prepare(sql: string): {
    run(...params: unknown[]): { lastInsertRowid: number | bigint };
    get(...params: unknown[]): Record<string, unknown> | undefined;
    all(...params: unknown[]): Record<string, unknown>[];
  };
  close(): void;
}
interface SqliteModule {
  DatabaseSync: new (file: string) => SqliteDb;
}

function loadSqlite(): SqliteModule | null {
  try {
    // eslint-disable-next-line no-eval
    const req = eval('require') as (m: string) => unknown;
    const mod = req('node:sqlite') as SqliteModule;
    if (mod && typeof mod.DatabaseSync === 'function') return mod;
    return null;
  } catch {
    return null;
  }
}

// ----------------------------------------------------------------------------
// JSON dosya deposu (yedek)
// ----------------------------------------------------------------------------
interface JsonDb {
  decisions: DecisionRecord[];
  vault: VaultEntry[];
}

function loadJson(): JsonDb {
  try {
    const raw = fs.readFileSync(JSON_PATH, 'utf-8');
    const parsed = JSON.parse(raw);
    return {
      decisions: Array.isArray(parsed?.decisions) ? parsed.decisions : [],
      vault: Array.isArray(parsed?.vault) ? parsed.vault : [],
    };
  } catch {
    return { decisions: [], vault: [] };
  }
}

function saveJson(db: JsonDb): void {
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
    const tmp = `${JSON_PATH}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(db, null, 2), 'utf-8');
    fs.renameSync(tmp, JSON_PATH); // atomik yazım
  } catch (e) {
    console.error('[InfinityMemory] JSON kayıt hatası:', e);
  }
}

function uid(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

function safeJson<T>(raw: unknown, fallback: T): T {
  try {
    const v = typeof raw === 'string' ? JSON.parse(raw) : raw;
    return (v ?? fallback) as T;
  } catch {
    return fallback;
  }
}

// ----------------------------------------------------------------------------
// Çekirdek başlatma
// ----------------------------------------------------------------------------
let backend: 'sqlite' | 'json' | null = null;
let cachedSqlite: { db: SqliteDb } | null = null;
let cachedJson: JsonDb | null = null;

function init(): void {
  if (backend) return;
  try {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  } catch {
    /* dizin oluşturulamazsa JSON yazımında tekrar denenir */
  }

  const sqliteMod = loadSqlite();
  if (sqliteMod) {
    try {
      const db = new sqliteMod.DatabaseSync(SQLITE_PATH);
      db.exec(`
        CREATE TABLE IF NOT EXISTS decisions (
          id TEXT PRIMARY KEY,
          timestamp TEXT NOT NULL,
          category TEXT NOT NULL,
          decision_text TEXT NOT NULL,
          status TEXT NOT NULL DEFAULT 'APPROVED',
          approved_by TEXT NOT NULL DEFAULT 'Patron'
        );
        CREATE TABLE IF NOT EXISTS enterprise_vault (
          id TEXT PRIMARY KEY,
          timestamp TEXT NOT NULL,
          document_type TEXT NOT NULL,
          metadata TEXT NOT NULL,
          content TEXT NOT NULL,
          tags TEXT NOT NULL
        );
      `);
      cachedSqlite = { db };
      backend = 'sqlite';
      console.log('[InfinityMemory] SQLite deposu aktif →', SQLITE_PATH);
      return;
    } catch (e) {
      console.warn('[InfinityMemory] SQLite açılamadı, JSON deposuna düşülüyor:', e);
    }
  }

  backend = 'json';
  cachedJson = loadJson();
  console.log('[InfinityMemory] JSON deposu aktif →', JSON_PATH);
}

// ----------------------------------------------------------------------------
// KARARLAR (decisions) — ömür boyu mühürlenen onaylı stratejik kararlar
// ----------------------------------------------------------------------------
export function addDecision(category: string, decisionText: string): DecisionRecord {
  init();
  const record: DecisionRecord = {
    id: uid(),
    timestamp: new Date().toISOString(),
    category,
    decision_text: decisionText,
    status: 'APPROVED',
    approved_by: 'Patron',
  };

  if (backend === 'sqlite' && cachedSqlite) {
    cachedSqlite.db
      .prepare('INSERT INTO decisions (id, timestamp, category, decision_text, status, approved_by) VALUES (?, ?, ?, ?, ?, ?)')
      .run(record.id, record.timestamp, record.category, record.decision_text, record.status, record.approved_by);
  } else if (cachedJson) {
    cachedJson.decisions.push(record);
    saveJson(cachedJson);
  }
  return record;
}

export function getDecisions(): DecisionRecord[] {
  init();
  if (backend === 'sqlite' && cachedSqlite) {
    const rows = cachedSqlite.db
      .prepare('SELECT id, timestamp, category, decision_text, status, approved_by FROM decisions ORDER BY timestamp DESC')
      .all();
    return rows.map((r) => ({
      id: String(r.id),
      timestamp: String(r.timestamp),
      category: String(r.category),
      decision_text: String(r.decision_text),
      status: 'APPROVED' as const,
      approved_by: 'Patron' as const,
    }));
  }
  return cachedJson ? [...cachedJson.decisions].sort((a, b) => b.timestamp.localeCompare(a.timestamp)) : [];
}
// ----------------------------------------------------------------------------
// KURUMSAL ARŞİV (enterprise_vault) — fatura, sözleşme, müşteri, işlem, belge
// ----------------------------------------------------------------------------
export function addVaultEntry(
  documentType: VaultDocType,
  metadata: Record<string, string>,
  content: string,
  tags: string[]
): VaultEntry {
  init();
  const entry: VaultEntry = {
    id: uid(),
    timestamp: new Date().toISOString(),
    document_type: documentType,
    metadata,
    content,
    tags,
  };

  if (backend === 'sqlite' && cachedSqlite) {
    cachedSqlite.db
      .prepare('INSERT INTO enterprise_vault (id, timestamp, document_type, metadata, content, tags) VALUES (?, ?, ?, ?, ?, ?)')
      .run(entry.id, entry.timestamp, entry.document_type, JSON.stringify(entry.metadata), entry.content, JSON.stringify(entry.tags));
  } else if (cachedJson) {
    cachedJson.vault.push(entry);
    saveJson(cachedJson);
  }
  return entry;
}

export function searchVault(query: string, docType?: VaultDocType): VaultEntry[] {
  init();
  const q = (query || '').toLowerCase().trim();
  const filter = (e: VaultEntry): boolean => {
    if (docType && e.document_type !== docType) return false;
    if (!q) return true;
    const haystack = [
      e.content,
      e.metadata?.name || '',
      e.metadata?.invoice_no || '',
      e.metadata?.party || '',
      e.metadata?.subject || '',
      ...(e.tags || []),
    ]
      .join(' ')
      .toLowerCase();
    return q.split(/\s+/).every((w) => haystack.includes(w));
  };

  if (backend === 'sqlite' && cachedSqlite) {
    const rows = cachedSqlite.db
      .prepare('SELECT id, timestamp, document_type, metadata, content, tags FROM enterprise_vault ORDER BY timestamp DESC')
      .all();
    return rows
      .map((r) => ({
        id: String(r.id),
        timestamp: String(r.timestamp),
        document_type: String(r.document_type) as VaultDocType,
        metadata: safeJson<Record<string, string>>(r.metadata, {}),
        content: String(r.content),
        tags: safeJson<string[]>(r.tags, []),
      }))
      .filter(filter)
      .slice(0, 50);
  }
  return cachedJson
    ? [...cachedJson.vault]
        .sort((a, b) => b.timestamp.localeCompare(a.timestamp))
        .filter(filter)
        .slice(0, 50)
    : [];
}

// ----------------------------------------------------------------------------
// ÇEKİRDEK BELLEK ÖZETİ — system prompt'a enjekte edilecek onaylı kararlar
// ----------------------------------------------------------------------------
export function getEnterpriseMemorySummary(limit = 30): string {
  const decisions = getDecisions();
  if (decisions.length === 0) return '';
  const lines = decisions
    .slice(0, limit)
    .map((d, i) => `${i + 1}. [${d.category}] ${d.decision_text} (${d.timestamp.slice(0, 10)})`);
  return `KURUMSAL HAFIZA — PATRON'UN ONAYLI SONSUZ KARARLARI:\n${lines.join('\n')}`;
}

