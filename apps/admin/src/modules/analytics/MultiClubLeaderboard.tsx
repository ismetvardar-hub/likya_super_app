'use client';

import React, { useState } from 'react';
import {
  PILOT_ACADEMIES,
  ACADEMY_LABELS,
  buildLeaderboard,
  verifyPrivacyIsolation,
  aggregateAcademy,
  type AthleteTelemetryProfile,
} from '../../app/lib/analytics/multiClubLeaderboardEngine.ts';

// ============================================================================
// 🏆 ÇOKLU AKADEMİ CANLI LİDERLİK TABLOSU (Adım 111)
// Bağlı pilot tesislerin (Antalya/Lara/Belek) anonim kohort performansını
// Academy Power Index (API) ile sıralar. Gizlilik filtresi: rakip akademiler
// yalnızca kohort ortalamalarını görür — sporcu kimliği asla yayınlanmaz.
// Motor: multiClubLeaderboardEngine.ts
// ============================================================================

// Örnek (simüle) pilot profilleri — canlıda BLE telemetrisinden beslenir
function sampleProfiles(): AthleteTelemetryProfile[] {
  const rows: [string, AthleteTelemetryProfile['academy'], number, number, number][] = [
    ['at-a1', 'antalya', 82, 3250, 8],
    ['at-a2', 'antalya', 76, 3400, 6],
    ['at-a3', 'antalya', 88, 3180, 9],
    ['at-a4', 'antalya', 71, 3520, 4],
    ['lr-1', 'lara', 79, 3340, 7],
    ['lr-2', 'lara', 84, 3290, 5],
    ['lr-3', 'lara', 68, 3580, 3],
    ['bk-1', 'belek', 74, 3410, 6],
    ['bk-2', 'belek', 90, 3110, 10],
    ['bk-3', 'belek', 81, 3300, 7],
  ];
  return rows.map(([athleteId, academy, rsi, sprintQuicknessMs, consistencyStreak]) => ({ athleteId, academy, rsi, sprintQuicknessMs, consistencyStreak }));
}

export default function MultiClubLeaderboard() {
  const [profiles] = useState<AthleteTelemetryProfile[]>(sampleProfiles);
  const leaderboard = buildLeaderboard(profiles);
  const [privacyNote, setPrivacyNote] = useState<string | null>(null);

  function checkPrivacy() {
    const results = PILOT_ACADEMIES.map((a) => {
      const v = verifyPrivacyIsolation(profiles, a);
      return `${ACADEMY_LABELS[a]}: ${v.isolated ? 'izole ✓' : `SIZINTI ${v.athleteIdsLeaked.join(',')}`}`;
    });
    setPrivacyNote(results.join(' · '));
  }

  return (
    <div style={{ width: '100%', background: 'rgba(2,6,23,0.7)', borderRadius: 14, padding: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 800, color: '#00f2fe', marginBottom: 8 }}>🏆 Çoklu Akademi Canlı Karşılaştırma</div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 6, marginBottom: 10 }}>
        {leaderboard.map((row) => (
          <div key={row.academy} style={{ border: '1px solid #1e293b', borderRadius: 8, padding: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <b style={{ fontSize: 10, color: '#e2e8f0' }}>#{row.rank} {row.label}</b>
              <span style={{ fontSize: 12, fontWeight: 900, color: row.rank === 1 ? '#10B981' : '#00f2fe' }}>{row.powerIndex}</span>
            </div>
            <div style={{ fontSize: 8, color: '#64748b', marginTop: 3 }}>
              API · RSI {row.avgRsi} · Çeviklik {(row.avgSprintQuicknessMs / 1000).toFixed(2)}s · Seri {row.avgConsistencyStreak}
            </div>
            <div style={{ fontSize: 8, color: '#8B5CF6' }}>{row.athleteCount} sporcu · {row.cohortOnly ? 'anonim kohort' : 'detay'}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <button onClick={checkPrivacy} style={mini}>🔒 Gizlilik İzolasyonunu Doğrula</button>
        <span style={{ fontSize: 8, color: '#94a3b8' }}>
          API = RSI %40 + Çeviklik %35 + Tutarlılık %25 · {aggregateAcademy(profiles, 'antalya').athleteCount} Antalya sporcusu
        </span>
      </div>
      {privacyNote && <div style={{ fontSize: 8, color: '#10B981', marginBottom: 4 }}>{privacyNote}</div>}
      <div style={{ fontSize: 8, color: '#64748b' }}>Rakip akademiler yalnızca anonimleştirilmiş kohort ortalamalarını görebilir — sporcu kimliği filtrelenir.</div>
    </div>
  );
}

const mini: React.CSSProperties = { fontSize: 9, fontWeight: 800, padding: '6px 10px', borderRadius: 8, border: '1px solid #334155', background: 'transparent', color: '#e2e8f0', cursor: 'pointer' };
