'use client';

import React, { useState } from 'react';
import {
  FranchiseGovernanceEngine, calculateMonthlyRoyalty,
  type FranchiseBranch, type SeatKind,
} from '../../app/lib/enterprise/franchiseGovernanceEngine.ts';

// ============================================================================
// 🏢 FRANCHISE ŞUBE YÖNETİŞİM GÖRÜNÜMÜ (Adım 146)
// Master franchisor + çoklu şube lisansı, koltuk tahsisi ve aylık telif hesabı.
// Motor: franchiseGovernanceEngine.ts
// ============================================================================

function sampleBranches(): FranchiseBranch[] {
  const now = new Date();
  const expires = new Date(now.getTime() + 365 * 24 * 3600 * 1000).toISOString();
  return [
    { branchId: 'br-antalya', name: 'Antalya Central', city: 'Antalya', country: 'TR', status: 'ACTIVE', seatLimits: { coaches: 6, courts: 8, insolePairs: 12 }, seatUsage: { coaches: 5, courts: 7, insolePairs: 10 }, license: { licenseKey: 'LKY-TR-001', issuedAt: now.toISOString(), expiresAt: expires, royaltyModel: 'revenue_share', royaltyRatePct: 8, fixedFeeMonthlyUsd: 0 } },
    { branchId: 'br-istanbul', name: 'Istanbul Elite', city: 'İstanbul', country: 'TR', status: 'ACTIVE', seatLimits: { coaches: 4, courts: 5, insolePairs: 8 }, seatUsage: { coaches: 4, courts: 4, insolePairs: 8 }, license: { licenseKey: 'LKY-TR-002', issuedAt: now.toISOString(), expiresAt: expires, royaltyModel: 'fixed_fee', royaltyRatePct: 0, fixedFeeMonthlyUsd: 1500 } },
    { branchId: 'br-munich', name: 'Munich Performance', city: 'Münih', country: 'DE', status: 'ACTIVE', seatLimits: { coaches: 3, courts: 4, insolePairs: 6 }, seatUsage: { coaches: 2, courts: 3, insolePairs: 5 }, license: { licenseKey: 'LKY-DE-001', issuedAt: now.toISOString(), expiresAt: expires, royaltyModel: 'revenue_share', royaltyRatePct: 6, fixedFeeMonthlyUsd: 0 } },
  ];
}

const seatLabels: Record<SeatKind, string> = { coaches: 'Koç', courts: 'Kort', insolePairs: 'Tabanlık' };

export default function FranchiseGovernanceView() {
  const [engine] = useState<FranchiseGovernanceEngine>(() => {
    const e = new FranchiseGovernanceEngine();
    for (const b of sampleBranches()) e.addBranch(b);
    return e;
  });
  const [branches, setBranches] = useState<FranchiseBranch[]>(() => engine.branchesList());
  const [royalties, setRoyalties] = useState<Record<string, { month: string; revenueUsd: number; totalDueUsd: number; method: string }>>({});

  function allocate(branchId: string, kind: SeatKind, delta: number) {
    const result = engine.allocateSeat(branchId, kind, delta);
    setBranches(engine.branchesList());
    if (!result.ok) alert(result.issues.join(' · '));
  }

  function computeRoyalty(branchId: string, revenueUsd: number) {
    const royalty = calculateMonthlyRoyalty(engine.branch(branchId)!, '2026-08', revenueUsd);
    setRoyalties((prev) => ({ ...prev, [branchId]: { month: '2026-08', revenueUsd, totalDueUsd: royalty.totalDueUsd, method: royalty.method } }));
  }

  return (
    <div style={{ width: '100%', background: 'rgba(2,6,23,0.7)', borderRadius: 14, padding: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 800, color: '#8B5CF6', marginBottom: 8 }}>🏢 Franchise Şube Yönetişimi ({branches.length} şube)</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(230px, 1fr))', gap: 8 }}>
        {branches.map((b) => (
          <div key={b.branchId} style={{ border: '1px solid #1e293b', borderRadius: 10, padding: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <b style={{ fontSize: 11, color: '#e2e8f0' }}>{b.name}</b>
              <span style={{ fontSize: 8, color: '#10B981' }}>{b.status}</span>
            </div>
            <div style={{ fontSize: 8, color: '#64748b', marginBottom: 6 }}>{b.city}, {b.country} · {b.license.licenseKey}</div>
            {(['coaches', 'courts', 'insolePairs'] as SeatKind[]).map((kind) => (
              <div key={kind} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 9, color: '#94a3b8', marginBottom: 3 }}>
                <span style={{ width: 56 }}>{seatLabels[kind]}</span>
                <div style={{ flex: 1, height: 6, borderRadius: 3, background: '#1e293b', overflow: 'hidden' }}>
                  <div style={{ width: `${(b.seatUsage[kind] / b.seatLimits[kind]) * 100}%`, height: '100%', background: b.seatUsage[kind] >= b.seatLimits[kind] ? '#F43F5E' : '#00f2fe' }} />
                </div>
                <span>{b.seatUsage[kind]}/{b.seatLimits[kind]}</span>
                <button onClick={() => allocate(b.branchId, kind, 1)} style={tiny}>+</button>
                <button onClick={() => allocate(b.branchId, kind, -1)} style={tiny}>−</button>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
              <input type="number" defaultValue={25000} onChange={(e) => computeRoyalty(b.branchId, Number(e.target.value) || 0)} style={{ width: 70, fontSize: 8, background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155', borderRadius: 4, padding: '3px 6px' }} />
              <button onClick={() => computeRoyalty(b.branchId, 25000)} style={tiny}>Telif Hesapla</button>
            </div>
            {royalties[b.branchId] && (
              <div style={{ fontSize: 8, color: '#F27A1A', marginTop: 4 }}>
                {royalties[b.branchId].method === 'fixed_fee' ? 'Sabit ücret' : 'Ciro payı'}: {royalties[b.branchId].totalDueUsd} $/ay
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

const tiny: React.CSSProperties = { fontSize: 8, fontWeight: 800, padding: '3px 6px', borderRadius: 4, border: '1px solid #334155', background: 'transparent', color: '#94a3b8', cursor: 'pointer' };
