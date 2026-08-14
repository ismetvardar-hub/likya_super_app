'use client';

import React, { useEffect, useState } from 'react';
import { Globe, DollarSign, FileText } from 'lucide-react';

// ============================================================================
// LİKYA GLOBAL SAAS & USD FATURA KÖPRÜSÜ
// Global Stripe / ABD LLC gelir kartı, USD ciro, global fatura durumu
// ve uluslararası lisanslama grafiği
// ============================================================================

interface LicenseRow {
  country: string;
  license: string;
  revenue: number;
  status: 'aktif' | 'onay bekliyor';
  color: string;
}

const LICENSES: LicenseRow[] = [
  { country: '🇺🇸 ABD', license: 'Delaware LLC', revenue: 42, status: 'aktif', color: '#00f2fe' },
  { country: '🇬🇧 İngiltere', license: 'UK Ltd', revenue: 28, status: 'aktif', color: '#34d399' },
  { country: '🇩🇪 Almanya', license: 'GmbH', revenue: 19, status: 'aktif', color: '#f59e0b' },
  { country: '🇦🇪 BAE', license: 'Free Zone', revenue: 11, status: 'onay bekliyor', color: '#a78bfa' },
];

const INVOICES = [
  { no: 'INV-2026-0142', client: 'Lycia Retreats GmbH', country: '🇩🇪', amount: '$8.400', status: 'Ödendi' },
  { no: 'INV-2026-0141', client: 'Anatolia Travel LLC', country: '🇺🇸', amount: '$12.000', status: 'Ödendi' },
  { no: 'INV-2026-0140', client: 'Mediterranean Escapes Ltd', country: '🇬🇧', amount: '$5.200', status: 'Beklemede' },
  { no: 'INV-2026-0139', client: 'Gulf Luxe Tours FZ', country: '🇦🇪', amount: '$9.800', status: 'Ödendi' },
];

export default function GlobalSaaSFatura() {
  const [usdRevenue, setUsdRevenue] = useState(184_320);

  // Canlı USD ciro simülasyonu
  useEffect(() => {
    const id = setInterval(() => {
      setUsdRevenue((r) => r + Math.floor(Math.random() * 90));
    }, 3000);
    return () => clearInterval(id);
  }, []);

  const maxRev = Math.max(...LICENSES.map((l) => l.revenue));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Globe size={20} color="#34d399" />
            Global SaaS &amp; USD Fatura Köprüsü
          </h2>
          <p style={{ fontSize: '12px', color: '#94a3b8' }}>Stripe • ABD LLC • Uluslararası Lisanslama</p>
        </div>
        <span style={{ padding: '6px 12px', background: 'rgba(52,211,153,0.15)', color: '#34d399', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold', border: '1px solid rgba(52,211,153,0.3)' }}>
          <DollarSign size={12} style={{ display: 'inline' }} /> {usdRevenue.toLocaleString('en-US')} USD Ciro
        </span>
      </div>

      {/* Üst sayaçlar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '12px' }}>
        <div style={{ background: 'rgba(52,211,153,0.06)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: '14px', padding: '16px' }}>
          <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>USD Ciro (Canlı)</div>
          <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#fff', marginTop: '6px' }}>${usdRevenue.toLocaleString('en-US')}</div>
          <div style={{ fontSize: '10px', color: '#34d399', marginTop: '4px' }}>▲ +%14.2 bu çeyrek</div>
        </div>
        <div style={{ background: 'rgba(0,242,254,0.06)', border: '1px solid rgba(0,242,254,0.2)', borderRadius: '14px', padding: '16px' }}>
          <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Global Fatura</div>
          <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#fff', marginTop: '6px' }}>34 adet</div>
          <div style={{ fontSize: '10px', color: '#00f2fe', marginTop: '4px' }}>4 ülkede kesiliyor</div>
        </div>
        <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: '14px', padding: '16px' }}>
          <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Döviz Kuru Ort.</div>
          <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#fff', marginTop: '6px' }}>₺ 34.8</div>
          <div style={{ fontSize: '10px', color: '#f59e0b', marginTop: '4px' }}>otomatik hedge aktif</div>
        </div>
        <div style={{ background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: '14px', padding: '16px' }}>
          <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Stripe Komisyon</div>
          <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#fff', marginTop: '6px' }}>%2.9</div>
          <div style={{ fontSize: '10px', color: '#a78bfa', marginTop: '4px' }}>+ 30¢ işlem</div>
        </div>
      </div>
      {/* Uluslararası Lisanslama Grafiği */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '14px',
        padding: '16px',
      }}>
        <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold', marginBottom: '12px' }}>
          🌍 Uluslararası Lisanslama &amp; Gelir Dağılımı
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {LICENSES.map((l) => (
            <div key={l.country} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ width: '110px', fontSize: '11px', color: '#e2e8f0', fontWeight: '600' }}>{l.country}</div>
              <div style={{ flex: 1, height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', overflow: 'hidden' }}>
                <div style={{
                  width: `${(l.revenue / maxRev) * 100}%`,
                  height: '100%',
                  background: `linear-gradient(90deg, ${l.color}, ${l.color}66)`,
                  borderRadius: '6px',
                  boxShadow: `0 0 10px ${l.color}40`,
                  transition: 'width 0.6s ease',
                }} />
              </div>
              <div style={{ width: '100px', fontSize: '11px', color: '#fff', fontWeight: 'bold' }}>${l.revenue}K</div>
              <div style={{ width: '70px', textAlign: 'right' }}>
                <span style={{
                  fontSize: '9px', fontWeight: '700', padding: '3px 8px', borderRadius: '8px', textTransform: 'uppercase',
                  background: l.status === 'aktif' ? 'rgba(72,187,120,0.15)' : 'rgba(245,158,11,0.15)',
                  color: l.status === 'aktif' ? '#48bb78' : '#f59e0b',
                  border: `1px solid ${l.status === 'aktif' ? 'rgba(72,187,120,0.3)' : 'rgba(245,158,11,0.3)'}`,
                }}>
                  {l.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Global Fatura Listesi */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '14px',
        overflow: 'hidden',
      }}>
        <div style={{ padding: '12px 16px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileText size={14} /> Global Fatura Defteri
          <span style={{ marginLeft: 'auto', fontSize: '10px', color: '#34d399' }}>Stripe ile otomatik kesim</span>
        </div>
        {INVOICES.map((inv, i) => (
          <div key={i} style={{
            display: 'grid',
            gridTemplateColumns: '120px 1fr 50px 100px 90px',
            gap: '8px',
            padding: '11px 16px',
            fontSize: '11px',
            color: '#94a3b8',
            borderBottom: i < INVOICES.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
            alignItems: 'center',
          }}>
            <span style={{ color: '#00f2fe', fontWeight: '600' }}>{inv.no}</span>
            <span style={{ color: '#e2e8f0' }}>{inv.country} {inv.client}</span>
            <span style={{ color: '#64748b' }}>USD</span>
            <span style={{ color: '#fff', fontWeight: 'bold' }}>{inv.amount}</span>
            <span style={{
              color: inv.status === 'Ödendi' ? '#48bb78' : '#f59e0b',
              fontWeight: '700', fontSize: '10px',
            }}>
              {inv.status === 'Ödendi' ? '✓ Ödendi' : '⏳ Beklemede'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

