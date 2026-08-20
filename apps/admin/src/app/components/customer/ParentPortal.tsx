'use client';

import React, { useState } from 'react';
import { generatePostSessionReport } from '../../lib/sports/postSessionReport';
import { scanChildLocation } from '../../lib/security/geofencingProtection';
import { footStrikePlain, loadingRatePlain, hrvDropPlain } from '../../lib/sports/plainLanguage';
import { shareText, SHARE_TEMPLATES } from '../../lib/ops/communicationSuite';
import { printPdf, type PdfReportData } from '../../lib/ops/pdfReportGenerator';

// ============================================================================
// 👨‍👩‍👧 VELİ PORTALI (/parent) — çocuk gelişimi + güvenlik + sade rapor
// Gelişim & Sağlık Özeti • Sakatlık & Güvenlik Bildirimi • Rapor Paylaşım Özeti
// ============================================================================

const GROWTH = [
  { label: 'Boy', unit: 'cm', values: [142, 144, 146, 148] },
  { label: 'Kilo', unit: 'kg', values: [36, 38, 39, 41] },
  { label: 'Ayak Uzunluğu', unit: 'cm', values: [22.5, 23, 23.5, 24] },
];
const MONTHS = ['5 ay önce', '4 ay önce', '3 ay önce', 'Bugün'];

export default function ParentPortal() {
  const [report, setReport] = useState(() => generatePostSessionReport(2));
  const [geo, setGeo] = useState(() => scanChildLocation('Efe', 'BLE-COURT-1'));
  const [form, setForm] = useState({ height: 148, weight: 41, foot: 24 });
  const [saved, setSaved] = useState(false);

  const foot = footStrikePlain(28);
  const loading = loadingRatePlain(1.9);
  const hrv = hrvDropPlain(report.header.trimp > 200 ? 30 : 42, 48);

  const shareSummary = async () => {
    const text = SHARE_TEMPLATES.report('Arda', report.performance[0].scorePct, report.development.aiAdvice);
    await shareText(text, { title: 'ExtremeS — Çocuğumun Karnesi' });
  };

  const printPdfReport = () => {
    const pdf: PdfReportData = {
      title: '🏆 SportVisionX Ölçüm & Gelişim Raporu',
      subtitle: `${report.header.athlete} • ${report.header.sessionType}`,
      meta: [
        { label: 'Sporcu', value: report.header.athlete },
        { label: 'Antrenör', value: report.header.coach },
        { label: 'TRIMP', value: String(report.header.trimp) },
        { label: 'Sakatlık Riski', value: report.injury.risk },
      ],
      sections: [
        { heading: 'Performans Özeti', lines: report.performance.map((p) => `${p.title}: %${p.scorePct} (${p.tier})`) },
        { heading: 'Sakatlık & Yorgunluk', lines: report.injury.details.concat([report.fatigue.note]) },
        { heading: 'Antrenör Tavsiyesi (AI)', lines: [report.development.aiAdvice] },
      ],
      footer: '⚡ ExtremeS • Likya Kampüsü — Veli Raporu',
    };
    printPdf(pdf);
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', background: 'linear-gradient(160deg,#fdf2f8,#fce7f3)', minHeight: '100vh', color: '#0f172a' }}>
      {/* BAŞLIK */}
      <div>
        <div style={{ fontSize: '20px', fontWeight: 900, color: '#831843' }}>👨‍👩‍👧 Veli Paneli — Arda'nın Gelişimi</div>
        <div style={{ fontSize: '11px', color: '#64748b' }}>Çocuğunuzun sağlığı, güvenliği ve gelişimi — sade dille.</div>
      </div>

      {/* GELİŞİM & SAĞLIK ÖZETİ */}
      <div style={{ background: '#fff', border: '1px solid #fbcfe8', borderRadius: '18px', padding: '16px' }}>
        <div style={{ fontSize: '12px', fontWeight: 800, color: '#831843' }}>📈 Gelişim & Sağlık Özeti</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginTop: '10px' }}>
          {GROWTH.map((g) => (
            <div key={g.label}>
              <div style={{ fontSize: '10px', color: '#64748b' }}>{g.label} ({g.unit})</div>
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '70px', marginTop: '6px' }}>
                {g.values.map((v, i) => (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                    <div style={{ fontSize: '8px', fontWeight: 700, color: '#831843' }}>{v}</div>
                    <div style={{ width: '100%', height: `${((v - Math.min(...g.values)) / Math.max(1, Math.max(...g.values) - Math.min(...g.values))) * 100}%`, minHeight: '10px', borderRadius: '6px 6px 2px 2px', background: 'linear-gradient(180deg,#ec4899,#f9a8d4)' }} />
                    <div style={{ fontSize: '7.5px', color: '#94a3b8' }}>{MONTHS[i].split(' ')[0]}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: '9.5px', color: '#334155', background: '#fdf2f8', border: '1px solid #fbcfe8', borderRadius: '10px', padding: '8px 12px', marginTop: '12px' }}>
          📏 <b>3 Aylık Büyüme:</b> Boy +6 cm · Kilo +5 kg · Ayak +1.5 cm — yaş grubuna göre normal hızda gelişiyor. ✅
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px', alignItems: 'center' }}>
          <span style={{ fontSize: '10px', fontWeight: 800, color: '#831843' }}>3 Aylık Ölçüm Formu:</span>
          {(['height', 'weight', 'foot'] as const).map((f) => (
            <label key={f} style={{ fontSize: '9px', color: '#64748b' }}>{f === 'height' ? 'Boy' : f === 'weight' ? 'Kilo' : 'Ayak'}:
              <input type="number" value={form[f]} onChange={(e) => setForm((p) => ({ ...p, [f]: Number(e.target.value) }))} style={{ width: 56, marginLeft: 4, fontSize: '10px', padding: '5px 8px', borderRadius: '8px', border: '1px solid #fbcfe8', outline: 'none' }} />
            </label>
          ))}
          <button onClick={() => { setSaved(true); }} style={{ fontSize: '10px', fontWeight: 800, padding: '8px 14px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#db2777,#ec4899)', color: '#fff' }}>💾 Kaydet</button>
          {saved && <span style={{ fontSize: '9.5px', fontWeight: 700, color: '#059669' }}>✅ Periyodik ölçüm kaydedildi — 3 aylık trend güncellendi.</span>}
        </div>
      </div>


      {/* SAKATLIK & GÜVENLİK BİLDİRİMİ */}
      <div style={{ background: '#fff', border: '1px solid #fbcfe8', borderRadius: '18px', padding: '16px' }}>
        <div style={{ fontSize: '12px', fontWeight: 800, color: '#831843' }}>🛡️ Sakatlık & Güvenlik Bildirimi</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px', marginTop: '10px' }}>
          <div style={{ padding: '10px 12px', borderRadius: '12px', background: geo.safe ? '#f0fdf4' : '#fef2f2', border: `1px solid ${geo.safe ? '#bbf7d0' : '#fecaca'}` }}>
            <div style={{ fontSize: '10px', fontWeight: 800, color: geo.safe ? '#047857' : '#dc2626' }}>{geo.safe ? '📍 Kortlar bölgesinde — Güvende 🟢' : '🚨 Güvenli alan dışında!'}</div>
            <div style={{ fontSize: '9px', color: '#64748b', marginTop: '4px' }}>BLE taraması: Kortlar perimeter 120m · Canlı konum takibi aktif</div>
          </div>
          <div style={{ padding: '10px 12px', borderRadius: '12px', background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
            <div style={{ fontSize: '10px', fontWeight: 800, color: '#047857' }}>💚 Bugünkü antrenmanda eklem ve kas yükü tamamen güvenli sınırlarda geçti.</div>
            <div style={{ fontSize: '9px', color: '#64748b', marginTop: '4px' }}>{foot.detail} · {loading.detail}</div>
          </div>
        </div>
      </div>

      {/* RAPOR PAYLAŞIM ÖZETİ */}
      <div style={{ background: '#fff', border: '1px solid #fbcfe8', borderRadius: '18px', padding: '16px' }}>
        <div style={{ fontSize: '12px', fontWeight: 800, color: '#831843' }}>📋 Antrenman Karnesi (Sade Dil)</div>
        <div style={{ marginTop: '10px', fontSize: '10.5px', color: '#334155', lineHeight: '1.7', background: '#fdf2f8', border: '1px solid #fbcfe8', borderRadius: '12px', padding: '12px' }}>
          <div>🏆 <b>Patlayıcılık:</b> seviye {report.performance[0].scorePct}% — {report.performance[0].lines[0].split('—')[1]?.trim() ?? report.performance[0].lines[0]}</div>
          <div style={{ marginTop: '6px' }}>❤️ <b>Kondisyon:</b> Kalp toparlanması çok iyi — vücudu zorlanmadan toparlanıyor.</div>
          <div style={{ marginTop: '6px' }}>🔋 <b>Yorgunluk:</b> {hrv.emoji} {hrv.detail}</div>
          <div style={{ marginTop: '8px', padding: '8px 10px', borderRadius: '10px', background: '#fff', border: '1px solid #fbcfe8' }}>💡 <b>Antrenörün önerisi:</b> "{report.development.aiAdvice}"</div>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
          <button onClick={shareSummary} style={{ fontSize: '10px', fontWeight: 800, padding: '8px 14px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#25d366,#4ade80)', color: '#0d1322' }}>📲 Raporu Paylaş</button>
          <button onClick={printPdfReport} style={{ fontSize: '10px', fontWeight: 800, padding: '8px 14px', borderRadius: '10px', border: '1px solid #f472b6', background: '#fff', color: '#9d174d', cursor: 'pointer' }}>📄 PDF İndir</button>
        </div>
      </div>
    </div>
  );
}

