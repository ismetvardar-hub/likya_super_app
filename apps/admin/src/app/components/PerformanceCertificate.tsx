'use client';

import React from 'react';

// ============================================================================
// 🏆 A4 PERFORMANS SERTİFİKASI (Adım 08) — yazdırma dostu @page
// Sporcu adı • Başarı seviyesi • Tarih • QR doğrulama filigranı • Koç imzası
// ============================================================================

export interface CertificateProps {
  athlete: string;
  achievement: string;
  date: string;
  coachName: string;
  verifyCode: string;
  tierColor?: string;
}

export default function PerformanceCertificate({ athlete, achievement, date, coachName, verifyCode, tierColor = '#1d4ed8' }: CertificateProps) {
  return (
    <div id="extreme-cert" style={{ background: '#fff', borderRadius: 14, border: '3px solid #c7d2fe', overflow: 'hidden' }}>
      {/* A4 çerçeve (print'te @page A4) */}
      <div style={{ border: '6px double #c7d2fe', borderRadius: 10, padding: 22, textAlign: 'center', color: '#0f172a', background: 'linear-gradient(160deg,#ffffff,#f5f3ff)' }}>
        <div style={{ fontSize: 12, letterSpacing: 4, color: '#64748b', fontWeight: 700 }}>EXTREMES SPOR BİLİMİ SİSTEMİ</div>
        <div style={{ fontSize: 26, fontWeight: 900, marginTop: 6, color: tierColor }}>🏅 PERFORMANS SERTİFİKASI</div>
        <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>Bu sertifika aşağıdaki başarıyı resmen belgeler</div>

        <div style={{ fontSize: 30, fontWeight: 900, marginTop: 18, color: '#0f172a' }}>{athlete}</div>
        <div style={{ fontSize: 15, fontWeight: 800, marginTop: 6, padding: '6px 18px', borderRadius: 99, display: 'inline-block', background: '#eef2ff', color: tierColor, border: `2px solid ${tierColor}55` }}>{achievement}</div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 26 }}>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: 10, color: '#64748b' }}>Tarih</div>
            <div style={{ fontSize: 13, fontWeight: 800, borderTop: '1px solid #cbd5e1', paddingTop: 6, marginTop: 6 }}>{date}</div>
          </div>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <svg viewBox="0 0 41 41" width="52" height="52">
              <rect width="41" height="41" fill="#0f172a" />
              {[0, 1, 2].map((r) => [0, 1, 2].map((c) => (
                <rect key={`${r}-${c}`} x={r * 14} y={c * 14} width="7" height="7" fill={((r + c) % 2 === 0 ? '#fff' : '#0f172a')} />
              )))}
              {Array.from({ length: 49 }, (_, i) => {
                const x = (i % 7) * 5 + 3, y = Math.floor(i / 7) * 5 + 3;
                const on = (i * 31 + verifyCode.length) % 3 === 0;
                return on ? <rect key={i} x={x} y={y} width="3" height="3" fill="#fff" /> : null;
              })}
            </svg>
            <div style={{ fontSize: 8, color: '#94a3b8', marginTop: 4 }}>QR · {verifyCode}</div>
          </div>
          <div style={{ textAlign: 'center', flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 800, borderTop: '1px solid #cbd5e1', paddingTop: 6, marginTop: 6 }}>{coachName}</div>
            <div style={{ fontSize: 10, color: '#64748b' }}>Antrenör İmzası</div>
          </div>
        </div>

        <div style={{ fontSize: 9, color: '#94a3b8', marginTop: 18 }}>Doğrulama: https://likya-ceo.vercel.app/athlete?id={verifyCode} • ⚡ ExtremeS</div>
      </div>
    </div>
  );
}

export function certificatePrintStyles(): string {
  return '@media print { #extreme-cert { border: none !important; } body { margin: 0; } }';
}
