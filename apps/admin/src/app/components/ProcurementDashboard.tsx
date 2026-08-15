'use client';

import React, { useState } from 'react';
import { Package, Scale, FileDown, CheckCircle2, Boxes, Send } from 'lucide-react';
import {
  HARDWARE_SPECS,
  CLOSED_BOX_SYSTEMS,
  SAMPLE_SUPPLIER_QUOTES,
  computeOpenHardwareROI,
  closedBoxTCO5Y,
  evaluateSupplierQuote,
  generatePurchaseRequisition,
  openHardwareBundleTL,
  openHardwareBundleUSD,
} from '../lib/sportVision/procurementSpecs';

const CATEGORY_LABEL: Record<string, string> = {
  OPTIK_KAMERA: '📹 Optik / Kamera',
  EDGE_AI: '🧠 Saha İçi Edge AI',
  BIYOMETRIK_SENSOR: '⌚ Biyometrik & Sensör',
  BIYOMETRIK_ISTASYON: '📏 Biyometrik İstasyon',
  AG_DEPOLAMA: '🌐 Ağ & Depolama',
};

const CATEGORY_COLOR: Record<string, string> = {
  OPTIK_KAMERA: '#00f2fe',
  EDGE_AI: '#a78bfa',
  BIYOMETRIK_SENSOR: '#4ade80',
  BIYOMETRIK_ISTASYON: '#fbbf24',
  AG_DEPOLAMA: '#f472b6',
};

// ============================================================================
// 📦 LİKYA DONANIM ŞARTNAME, TEDARİK & SATIN ALMA PANELİ
// Endüstriyel bileşen tedariki • Kapalı kutu kıyas • Resmi beyanname üretimi
// ============================================================================

export default function ProcurementDashboard() {
  const roi = computeOpenHardwareROI();
  const [approved, setApproved] = useState(false);
  const [log, setLog] = useState<string[]>([]);

  const downloadRequisition = () => {
    const doc = generatePurchaseRequisition({ requester: 'Patron / CEO', department: 'Holding Yönetimi' });
    const blob = new Blob(['\ufeff' + doc], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Likya_SatinAlma_Beyannamesi_${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
    setLog((l) => [`📄 Beyanname indirildi (${new Date().toLocaleTimeString('tr-TR')}) — arşive eklendi`, ...l]);
  };

  const sendToBoss = () => {
    if (approved) return;
    setApproved(true);
    setLog((l) => [
      '✅ Patron / CEO onayı verildi — LKY-PROC satın alma emri kapatıldı',
      `⚖️ Onay anındaki maliyet avantajı: %${roi.avgVideoSavingsPct}`,
      ...l,
    ]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Package size={18} color="#00f2fe" /> Donanım Teknik Şartname & Tedarik Motoru
          </h2>
          <p style={{ fontSize: '12px', color: '#94a3b8' }}>
            Spiideo / Veo / Pixellot / Bepro tekel sistemlerine lisans ödemek yerine — endüstriyel bileşen + yerli yazılım
          </p>
        </div>
        <div style={{ padding: '10px 16px', borderRadius: '14px', background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.4)', textAlign: 'center' }}>
          <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#4ade80' }}>%{roi.avgVideoSavingsPct}</div>
          <div style={{ fontSize: '9px', color: '#94a3b8' }}>5 Yıllık Ortalama Maliyet Avantajı</div>
        </div>
      </div>

      {/* ⚖️ Kapalı Kutu vs Açık Donanım — 5 yıllık TCO */}
      <div style={{ padding: '14px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(0,242,254,0.2)' }}>
        <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Scale size={14} color="#00f2fe" /> ⚖️ Hazır Sistemler vs Sport Vision Donanım — 5 Yıllık TCO Karşılaştırması
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {roi.perSystem.map((r) => {
            const isOurs = r.name === 'BİZİM SİSTEM';
            return (
              <div key={r.name} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px',
                padding: '9px 12px', borderRadius: '10px',
                background: isOurs ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isOurs ? 'rgba(74,222,128,0.5)' : 'rgba(255,255,255,0.07)'}`,
              }}>
                <div style={{ fontSize: '11px', color: isOurs ? '#4ade80' : '#e2e8f0', fontWeight: isOurs ? 800 : 600 }}>
                  {r.name}
                </div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <span style={{ fontSize: '10px', color: '#94a3b8' }}>
                    {r.closedTCO5Y.toLocaleString('tr-TR')} $ / 5 yıl
                  </span>
                  <span style={{ fontSize: '10px', fontWeight: '700', color: isOurs ? '#4ade80' : '#00f2fe' }}>
                    %{r.savingsPct} avantaj
                  </span>
                </div>
              </div>
            );
          })}
          {/* Bizim sistem satırı */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px',
            padding: '11px 12px', borderRadius: '10px',
            background: 'rgba(74,222,128,0.14)', border: '1px solid rgba(74,222,128,0.6)',
          }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#4ade80' }}>
              🏠 BİZİM SİSTEM (Açık Donanım + Yerli Yazılım) — tek seferlik, lisans yok
            </div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <span style={{ fontSize: '10px', color: '#a7f3d0', fontWeight: 700 }}>
                {roi.openTotalUSD.toLocaleString('tr-TR')} $ + 0 $/yıl yazılım
              </span>
            </div>
          </div>
        </div>
        <div style={{ fontSize: '9px', color: '#64748b', marginTop: '10px', lineHeight: '1.6' }}>
          Hesap: 5 yıllık toplam sahip olma maliyeti (donanım + zorunlu abonelik). Bizim paket: {openHardwareBundleUSD().toLocaleString('tr-TR')} USD tek seferlik (
          {openHardwareBundleTL().toLocaleString('tr-TR')} TL) — kamera, Edge AI, sensör, istasyon, ağ + %10 kurulum dahil. Yazılım bedeli: 0 (Sport Vision yerli).
        </div>
      </div>


      {/* 📦 Saha Donanım İhtiyaç Listesi */}
      <div style={{ padding: '14px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)' }}>
        <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Boxes size={14} color="#a78bfa" /> 📦 Saha Donanım İhtiyaç Listesi & Teknik Şartname
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '10px' }}>
          {HARDWARE_SPECS.map((s) => {
            const color = CATEGORY_COLOR[s.category];
            return (
              <div key={s.id} style={{ padding: '12px', borderRadius: '12px', background: 'rgba(0,0,0,0.3)', border: `1px solid ${color}33` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '16px' }}>{s.icon}</span> {s.name}
                  </div>
                  <span style={{ fontSize: '9px', fontWeight: 700, padding: '3px 8px', borderRadius: '10px', background: `${color}1a`, color, border: `1px solid ${color}44` }}>
                    ×{s.requiredCount}
                  </span>
                </div>
                <div style={{ fontSize: '9px', color: color, fontWeight: 600, marginBottom: '4px' }}>
                  {CATEGORY_LABEL[s.category]} • {s.unitPriceUSD}$/adet • teslim {s.leadTimeWeeks} hafta • {s.warrantyYears} yıl garanti
                </div>
                <div style={{ fontSize: '9px', color: '#94a3b8', marginBottom: '6px' }}>
                  ⚡ {s.rationale}
                </div>
                <div style={{ fontSize: '9px', color: '#64748b', marginBottom: '6px' }}>
                  🔁 Yerine geçer: <span style={{ color: '#f87171' }}>{s.replaces}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {s.criteria.map((c, i) => (
                    <div key={i} style={{ fontSize: '8px', color: '#a5b4c4', lineHeight: '1.5' }}>▸ {c}</div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>


      {/* 📄 Tedarikçi Teklif Değerlendirme */}
      <div style={{ padding: '14px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(167,139,250,0.25)' }}>
        <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CheckCircle2 size={14} color="#a78bfa" /> 📄 Tedarikçi Teklif Değerlendirme — evaluateSupplierQuote()
        </div>
        <div style={{ fontSize: '9px', color: '#64748b', marginBottom: '8px' }}>
          Ağırlıklar: Teknik Uyum %40 • Fiyat %30 • Teslimat %15 • Garanti %15 + güven bonusu (garanti ≥2 yıl, uyum ≥%90)
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {SAMPLE_SUPPLIER_QUOTES.map((q) => {
            const e = evaluateSupplierQuote(q);
            const color = e.verdict.includes('ONAY') ? '#4ade80' : e.verdict.includes('İNCELEME') ? '#fbbf24' : '#f87171';
            return (
              <div key={q.supplierId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', padding: '9px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <div style={{ flex: '1', minWidth: '160px' }}>
                  <div style={{ fontSize: '11px', fontWeight: 700, color: '#fff' }}>{q.supplierName}</div>
                  <div style={{ fontSize: '8px', color: '#64748b' }}>
                    {q.itemName} • {q.unitPriceUSD}$ • {q.deliveryWeeks} hafta • {q.warrantyYears} yıl garanti • uyum %{q.technicalCompliancePct} • 5y TCO {e.tco5yUSD.toLocaleString('tr-TR')}$
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    {['Fiyat', 'Teslim', 'Garanti', 'Uyum'].map((label, i) => {
                      const val = [e.priceScore, e.deliveryScore, e.warrantyScore, e.complianceScore][i];
                      return (
                        <div key={label} style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '7px', color: '#64748b' }}>{label}</div>
                          <div style={{ fontSize: '9px', fontWeight: 700, color: '#e2e8f0' }}>{val}</div>
                        </div>
                      );
                    })}
                  </div>
                  <div style={{ width: '42px', height: '42px', borderRadius: '50%', border: `2px solid ${color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color }}>
                    {e.weightedTotal}
                  </div>
                  <span style={{ fontSize: '10px', fontWeight: 800, color, padding: '4px 10px', borderRadius: '12px', background: `${color}1a`, border: `1px solid ${color}44` }}>{e.verdict}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 📜 Satın Alma Beyannamesi & Patron Onayı */}
      <div style={{ padding: '14px', borderRadius: '16px', background: approved ? 'rgba(74,222,128,0.06)' : 'rgba(245,158,11,0.05)', border: `1px solid ${approved ? 'rgba(74,222,128,0.45)' : 'rgba(245,158,11,0.35)'}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
            📜 Resmî Satın Alma Talebi & Beyanname Üreticisi
          </div>
          <span style={{ fontSize: '10px', fontWeight: 800, color: approved ? '#4ade80' : '#fbbf24', padding: '4px 12px', borderRadius: '12px', background: approved ? 'rgba(74,222,128,0.12)' : 'rgba(245,158,11,0.1)', border: `1px solid ${approved ? 'rgba(74,222,128,0.4)' : 'rgba(245,158,11,0.4)'}` }}>
            {approved ? '✅ PATRON / CEO ONAYLI' : '⏳ ONAY BEKLİYOR'}
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button onClick={downloadRequisition} style={{ padding: '10px 16px', borderRadius: '12px', cursor: 'pointer', border: '1px solid rgba(0,242,254,0.5)', background: 'rgba(0,242,254,0.08)', color: '#00f2fe', fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FileDown size={14} /> Beyannameyi & Şartnameyi İndir (.md)
          </button>
          <button onClick={sendToBoss} disabled={approved} style={{ padding: '10px 16px', borderRadius: '12px', cursor: approved ? 'default' : 'pointer', border: `1px solid ${approved ? 'rgba(74,222,128,0.3)' : 'rgba(74,222,128,0.6)'}`, background: approved ? 'rgba(74,222,128,0.06)' : 'rgba(74,222,128,0.14)', color: approved ? '#4ade80' : '#4ade80', fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Send size={14} /> {approved ? 'Onaylandı ✓' : '✍️ Patron / CEO Onayına Gönder'}
          </button>
        </div>
        <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '10px', fontFamily: 'monospace', lineHeight: '1.7' }}>
          {log.length === 0 ? 'Onay / indirme işlemi bekleniyor — beyanname şartname, bütçe ve tedarikçi listesiyle üretilir.' : log.map((l, i) => <div key={i}>{l}</div>)}
        </div>
        {approved && (
          <div style={{ marginTop: '10px', padding: '10px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px dashed rgba(74,222,128,0.4)', fontSize: '10px', color: '#a7f3d0', fontFamily: 'monospace' }}>
            ✒️ PATRON / CEO — LKY-PROC-{new Date().getFullYear()}-01  •  ONAY TARİHİ: {new Date().toLocaleDateString('tr-TR')}  •  İMZA: ✅ (dijital)
          </div>
        )}
      </div>
    </div>
  );
}

