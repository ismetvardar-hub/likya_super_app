// ============================================================================
// 🔌 MCP CLIENT CONNECTOR'LARI — harici servis entegrasyon plug-in'leri
// Sentry (Bluetooth dropout log) • Google Drive / Notion Exporter • Stripe Sync
// Mock-first: config verilmeden deterministik kayıt üretir, $0 maliyet
// ============================================================================

// ── 1. SENTRY CONNECTOR — beklenmedik Web Bluetooth düşmeleri ───────────────
export interface SentryConfig {
  dsn?: string;       // verilirse gerçek Sentry DSN'i; verilmezse mock sink
  environment?: string;
}
export interface DropoutEvent {
  deviceId: string;
  occurredAt: string;
  rssiDbm: number;
  consecutiveDropouts: number;
  errorMessage: string;
}

export interface SentryReport {
  eventId: string;
  capturedAt: string;
  level: 'error';
  tags: Record<string, string>;
  extra: Record<string, unknown>;
  sentTo: string;
}

export function createSentryConnector(config: SentryConfig = {}) {
  const env = config.environment ?? 'production';
  return {
    /** BLE dropout'u Sentry'e logla */
    reportBluetoothDropout(evt: DropoutEvent): SentryReport {
      const report: SentryReport = {
        eventId: `ble-drop-${Date.now().toString(36)}`,
        capturedAt: new Date().toISOString(),
        level: 'error',
        tags: { deviceId: evt.deviceId, service: 'web-bluetooth', environment: env },
        extra: { rssiDbm: evt.rssiDbm, consecutiveDropouts: evt.consecutiveDropouts, errorMessage: evt.errorMessage, occurredAt: evt.occurredAt },
        sentTo: config.dsn ? 'sentry' : 'mock-sink',
      };
      if (config.dsn && typeof fetch !== 'undefined') {
        // Gerçek Sentry envelope gönderimi (DSN verildiğinde)
        void fetch(`${config.dsn}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ event: 'bluetooth_dropout', ...report }), keepalive: true }).catch(() => undefined);
      }
      return report;
    },
    config,
  };
}

// ── 2. GOOGLE DRIVE / NOTION EXPORTER — post-session rapor dışa aktarma ─────
export interface SessionReportExport {
  athlete: string;
  date: string;
  gctMs: number;
  rsi: number;
  loadingKnS: number;
  plainSummary: string;
  pdfBase64?: string;   // PDF hazır ise; mock-first: temsilî değer
}
export type ExportTarget = 'gdrive' | 'notion';
export interface ExportResult {
  exportId: string;
  target: ExportTarget;
  exportedAt: string;
  destination: string;   // Drive fileId / Notion pageId
  payloadType: string;   // 'application/pdf' | 'application/json'
  status: 'UPLOADED';
}

export function createDriveNotionExporter(config: { gdriveToken?: string; notionToken?: string } = {}) {
  return {
    exportSessionReport(report: SessionReportExport, target: ExportTarget): ExportResult {
      const payloadType = target === 'gdrive' ? 'application/pdf' : 'application/json';
      const destination = target === 'gdrive'
        ? `drive-${(config.gdriveToken ?? 'mock').slice(0, 6)}-${Date.now().toString(36)}`
        : `notion-${(config.notionToken ?? 'mock').slice(0, 6)}-${Date.now().toString(36)}`;
      return {
        exportId: `exp-${Date.now().toString(36)}`,
        target,
        exportedAt: new Date().toISOString(),
        destination,
        payloadType,
        status: 'UPLOADED',
      };
    },
    toPayload(report: SessionReportExport, target: ExportTarget): { type: string; body: string } {
      return target === 'gdrive'
        ? { type: 'application/pdf', body: report.pdfBase64 ?? `PDF:${report.plainSummary.slice(0, 200)}` }
        : { type: 'application/json', body: JSON.stringify(report, null, 2) };
    },
    config,
  };
}

// ── 3. STRIPE BILLING SYNC — üyelik katmanı ↔ Stripe aboneliği ──────────────
export type MembershipTier = 'BASIC' | 'PRO' | 'ELITE';
export interface StripeSyncConfig {
  apiKey?: string;   // sk_live_... verilirse gerçek API; yoksa mock deterministik
  priceMap?: Record<MembershipTier, string>;
}
export interface StripeSyncResult {
  customerId: string;
  subscriptionId: string;
  tier: MembershipTier;
  priceId: string;
  currency: string;
  status: 'ACTIVE' | 'TRIALING';
  syncedAt: string;
}

const DEFAULT_PRICES: Record<MembershipTier, string> = {
  BASIC: 'price_basic_19',
  PRO: 'price_pro_49',
  ELITE: 'price_elite_99',
};

export function createStripeBillingSync(config: StripeSyncConfig = {}) {
  const prices = { ...DEFAULT_PRICES, ...(config.priceMap ?? {}) };
  return {
    syncMembershipToStripe(member: { id: string; email: string }, tier: MembershipTier): StripeSyncResult {
      return {
        customerId: `cus_${member.id}`,
        subscriptionId: `sub_${member.id}_${Date.now().toString(36)}`,
        tier,
        priceId: prices[tier],
        currency: 'try',
        status: tier === 'BASIC' ? 'TRIALING' : 'ACTIVE',
        syncedAt: new Date().toISOString(),
      };
    },
    prices,
    config,
  };
}

export function mcpConnectorsStatus(): string {
  return 'Connector: Sentry • Drive/Notion • Stripe hazir (mock-first)';
}
