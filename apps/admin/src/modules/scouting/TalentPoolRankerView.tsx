'use client';

import React, { useState } from 'react';
import { rankTalentPool, type JuniorProfile } from '../../app/lib/scouting/tidPoolRankingEngine.ts';

// ============================================================================
// 🧠 OTOMATİK TID HAVUZ SIRALAMA GÖRÜNÜMÜ (Adım 114)
// Akademiler arası genç sporcu profillerini PHV ofsetine göre normalize eder
// ve otomatik talent tier sıralaması üretir (Top 5% / Tier 1 / Upside / Tier 2).
// Motor: tidPoolRankingEngine.ts
// ============================================================================

function sampleProfiles(): JuniorProfile[] {
  const base = {
    cognitiveReactionMs: 245,
    brakeEfficiencyPct: 76,
    injuryResiliencePct: 80,
  };
  return [
    { ...base, athleteId: 'at-u14-01', academy: 'Antalya', age: 13, heightCm: 162, weightKg: 48, phvOffsetMonths: -3, reactivePowerVelocity: 1.05, rawUpside: 74 },
    { ...base, athleteId: 'at-u14-02', academy: 'Antalya', age: 12, heightCm: 158, weightKg: 45, phvOffsetMonths: -6, reactivePowerVelocity: 0.95, cognitiveReactionMs: 238, rawUpside: 86 },
    { ...base, athleteId: 'lr-u14-01', academy: 'Lara', age: 13, heightCm: 168, weightKg: 55, phvOffsetMonths: 4, reactivePowerVelocity: 1.18, cognitiveReactionMs: 258, rawUpside: 82 },
    { ...base, athleteId: 'lr-u14-02', academy: 'Lara', age: 14, heightCm: 174, weightKg: 60, phvOffsetMonths: 9, reactivePowerVelocity: 1.22, brakeEfficiencyPct: 84, rawUpside: 78 },
    { ...base, athleteId: 'bk-u14-01', academy: 'Belek', age: 12, heightCm: 150, weightKg: 41, phvOffsetMonths: -9, reactivePowerVelocity: 0.88, cognitiveReactionMs: 232, brakeEfficiencyPct: 70, rawUpside: 88 },
    { ...base, athleteId: 'bk-u14-02', academy: 'Belek', age: 13, heightCm: 165, weightKg: 51, phvOffsetMonths: 0, reactivePowerVelocity: 1.0, cognitiveReactionMs: 250, rawUpside: 70 },
  ];
}

const tierColor: Record<string, string> = {
  'Top 5% Elite National Prospect': '#10B981',
  'Developmental Tier 1': '#00f2fe',
  'High Upside Raw Athlete': '#8B5CF6',
  'Developmental Tier 2': '#64748b',
};

export default function TalentPoolRankerView() {
  const [profiles] = useState<JuniorProfile[]>(sampleProfiles);
  const ranked = rankTalentPool(profiles);

  return (
    <div style={{ width: '100%', background: 'rgba(2,6,23,0.7)', borderRadius: 14, padding: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 800, color: '#8B5CF6', marginBottom: 8 }}>🧠 Otomatik TID Havuz Sıralaması</div>
      <div style={{ fontSize: 8, color: '#64748b', marginBottom: 8 }}>
        PHV ofsetine göre normalize edilmiş TID skoru — erken olgunlaşma fiziksel avantajı kaldırılır, geç olgunlaşan projeksiyon boyuyla değerlendirilir.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 6 }}>
        {ranked.map((r) => (
          <div key={r.athleteId} style={{ border: '1px solid #1e293b', borderRadius: 8, padding: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <b style={{ fontSize: 10, color: '#e2e8f0' }}>#{r.rank} {r.athleteId}</b>
              <span style={{ fontSize: 11, fontWeight: 900, color: '#00f2fe' }}>{r.tidScore}</span>
            </div>
            <div style={{ fontSize: 8, color: '#64748b', marginTop: 2 }}>
              {r.academy} · {r.age} yaş · PHV {r.phvOffsetMonths > 0 ? `+${r.phvOffsetMonths}` : r.phvOffsetMonths}ay · %{r.percentile}
            </div>
            <div style={{ fontSize: 8, color: '#94a3b8' }}>Proj. boy: {r.normalizedHeightCm}cm</div>
            <div style={{ fontSize: 8, fontWeight: 800, color: tierColor[r.tier], marginTop: 3 }}>{r.tier}</div>
            <div style={{ fontSize: 7, color: '#64748b', marginTop: 2 }}>{r.note}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
