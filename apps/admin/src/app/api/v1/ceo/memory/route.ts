import { NextRequest, NextResponse } from 'next/server';
import {
  addDecision,
  getDecisions,
  addVaultEntry,
  searchVault,
  getEnterpriseMemorySummary,
  type VaultDocType,
} from '../../../../lib/db/infiniteMemory';
import { createRateLimiter, injectionShield } from '../../../../lib/securityAudit';

// 🛡️ STRIX kalkanı: rate-limit + injection denetimi (Bölüm 2 / Modül 5)
const limiter = createRateLimiter();

// ============================================================================
// 🏛️ SONSUZ KURUMSAL HAFIZA API'si
// actions:
//   - approve    : { category, decision_text } → kararı ömür boyu mühürle
//   - list       : onaylı tüm kararları getir
//   - summary    : system prompt için çekirdek bellek özeti
//   - add_vault  : { document_type, metadata, content, tags } → arşive belge ekle
//   - search     : { query, docType? } → arşivi derinlemesine tara
// ============================================================================

const VALID_DOC_TYPES: VaultDocType[] = ['INVOICE', 'LEGAL', 'CUSTOMER', 'TRANSACTION', 'DOCUMENT'];

export async function POST(request: NextRequest) {
  try {
    // 🛡️ STRIX: rate-limit (IP başına 20 istek/dakika)
    const clientKey = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'bilinmeyen';
    const rate = limiter.check(`memory:${clientKey}`, 20, 60000);
    if (!rate.allowed) {
      return NextResponse.json(
        { success: false, error: `Çok fazla istek — ${rate.retryAfterSec} sn sonra tekrar deneyin`, rate },
        { status: 429 }
      );
    }

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Geçersiz JSON gövdesi' }, { status: 400 });
    }

    // 🛡️ STRIX: injection kalkanı (tüm metin alanları)
    const rawProbe = JSON.stringify(body);
    const injection = injectionShield(rawProbe);
    if (!injection.safe) {
      return NextResponse.json(
        { success: false, error: `Enjeksiyon girişimi engellendi: ${injection.flagged.join(', ')}`, shield: true },
        { status: 400 }
      );
    }

    const action = String(body.action || '').toLowerCase();

    // --- KARARI MÜHÜRLE (Patron onayı) ---
    if (action === 'approve') {
      const decisionText = String(body.decision_text || '').trim();
      const category = String(body.category || 'strateji').trim();
      if (!decisionText) {
        return NextResponse.json({ success: false, error: 'Karar metni boş olamaz' }, { status: 400 });
      }
      const record = addDecision(category, decisionText);
      return NextResponse.json({
        success: true,
        action: 'approved',
        memory: record,
        message: `🏛️ Efendim, bu stratejik karar ömür boyu kalıcı hafızaya mühürlendi. (${record.timestamp.slice(0, 10)})`,
      });
    }

    // --- TÜM ONAYLI KARARLAR ---
    if (action === 'list') {
      const decisions = getDecisions();
      return NextResponse.json({ success: true, action: 'list', decisions });
    }

    // --- ÇEKİRDEK BELLEK ÖZETİ (system prompt enjeksiyonu için) ---
    if (action === 'summary') {
      return NextResponse.json({ success: true, action: 'summary', summary: getEnterpriseMemorySummary() });
    }

    // --- ARŞİVE BELGE EKLE ---
    if (action === 'add_vault') {
      const docType = String(body.document_type || 'DOCUMENT').toUpperCase() as VaultDocType;
      if (!VALID_DOC_TYPES.includes(docType)) {
        return NextResponse.json({ success: false, error: `Geçersiz belge türü: ${docType}` }, { status: 400 });
      }
      const content = String(body.content || '').trim();
      if (!content) {
        return NextResponse.json({ success: false, error: 'Belge içeriği boş olamaz' }, { status: 400 });
      }
      const metadata = (body.metadata && typeof body.metadata === 'object' ? body.metadata : {}) as Record<string, string>;
      const tags = Array.isArray(body.tags) ? body.tags.map(String) : [];
      const entry = addVaultEntry(docType, metadata, content, tags);
      return NextResponse.json({
        success: true,
        action: 'vaulted',
        entry: { ...entry, metadata },
        message: `📦 Arşive kaydedildi: ${docType} (${entry.timestamp.slice(0, 10)})`,
      });
    }

    // --- DERİN ARŞİV ARAMA ---
    if (action === 'search') {
      const query = String(body.query || '').trim();
      const rawType = String(body.docType || '').toUpperCase();
      const docType = VALID_DOC_TYPES.includes(rawType as VaultDocType) ? (rawType as VaultDocType) : undefined;
      const results = searchVault(query, docType);
      return NextResponse.json({
        success: true,
        action: 'search',
        query,
        count: results.length,
        results,
      });
    }

    return NextResponse.json({ success: false, error: `Bilinmeyen eylem: ${action}` }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
