'use client';

import React, { useState } from 'react';
import {
  MATCH_FORMATS,
  matchFormatPreset,
  createMatchSession,
  advanceMatchSession,
  validateMatchSessionConfig,
  sessionElapsedHuman,
  sessionElapsedMs,
  MATCH_COURT_MIN,
  MATCH_COURT_MAX,
  type MatchFormatId,
  type MatchSession,
} from '../../app/lib/court/matchDaySessionEngine.ts';
import { PILOT_SQUAD_NAME, PILOT_SQUAD_ID } from '../../app/lib/onboarding/pilotOnboardingEngine.ts';

// ============================================================================
// 🏟️ MAÇ GÜNÜ HIZLI SEANS BAŞLATICI (Adım 106)
// 1-dokunuş kort kurulumu: kort (1-8) + pilot takım + format. Tek dokunuşla
// BLE tabanlık akışları (Sol/Sağ), Decathlon HRM beslemesi ve arka plan
// telemetri kaydı başlar. Motor: matchDaySessionEngine.ts
// ============================================================================

export default function MatchDaySessionStarter() {
  const [courtId, setCourtId] = useState(1);
  const [format, setFormat] = useState<MatchFormatId>('single_set');
  const [athleteId, setAthleteId] = useState('at_u14_01');
  const [session, setSession] = useState<MatchSession | null>(null);
  const [error, setError] = useState<string | null>(null);

  function start() {
    const config = { courtId, squadId: PILOT_SQUAD_ID, format, athleteId };
    const validation = validateMatchSessionConfig(config);
    if (!validation.valid) {
      setError(validation.issues.join(' · '));
      return;
    }
    setError(null);
    setSession(createMatchSession(config));
  }

  function act(action: 'set_break' | 'resume' | 'complete') {
    setSession((prev) => (prev ? advanceMatchSession(prev, action) : prev));
  }

  const preset = session ? matchFormatPreset(session.config.format) : matchFormatPreset(format);
  const elapsedHuman = session ? sessionElapsedHuman(sessionElapsedMs(session)) : '0dk 0sn';

  return (
    <div style={{ width: '100%', background: 'rgba(2,6,23,0.7)', borderRadius: 14, padding: 12 }}>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10, alignItems: 'center' }}>
        {/* Kort seçimi */}
        <label style={{ fontSize: 9, color: '#64748b' }}>
          Kort
          <select value={courtId} onChange={(e) => setCourtId(Number(e.target.value))} style={sel}>
            {Array.from({ length: MATCH_COURT_MAX - MATCH_COURT_MIN + 1 }, (_, i) => MATCH_COURT_MIN + i).map((c) => (
              <option key={c} value={c}>Kort {c}</option>
            ))}
          </select>
        </label>
        {/* Format seçimi */}
        <label style={{ fontSize: 9, color: '#64748b' }}>
          Format
          <select value={format} onChange={(e) => setFormat(e.target.value as MatchFormatId)} style={sel}>
            {MATCH_FORMATS.map((f) => (
              <option key={f.id} value={f.id}>{f.label}</option>
            ))}
          </select>
        </label>
        <label style={{ fontSize: 9, color: '#64748b' }}>
          Sporcu
          <select value={athleteId} onChange={(e) => setAthleteId(e.target.value)} style={sel}>
            {['at_u14_01', 'at_u14_02', 'at_u14_03', 'at_u14_04'].map((id) => (
              <option key={id} value={id}>{id}</option>
            ))}
          </select>
        </label>
      </div>

      <div style={{ fontSize: 9, color: '#94a3b8', marginBottom: 8 }}>
        Takım: <b style={{ color: '#00f2fe' }}>{PILOT_SQUAD_NAME}</b> · {preset.description} (beklenen {preset.expectedDurationMin} dk)
      </div>

      {error && <div style={{ fontSize: 9, color: '#F43F5E', marginBottom: 6 }}>⚠️ {error}</div>}

      {!session ? (
        <button onClick={start} style={primary}>⚡ Tek Dokunuşla Seansı Başlat</button>
      ) : (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, fontWeight: 800, color: session.state === 'completed' ? '#10B981' : '#00f2fe' }}>
              {session.state === 'running' ? '🟢 Seans Aktif' : session.state === 'set_break' ? '🟡 Set Molası' : '✅ Seans Bitti'}
            </span>
            <span style={{ fontSize: 9, color: '#64748b' }}>{elapsedHuman} · Set molası: {session.setBreakCount}</span>
          </div>
          <div style={{ fontSize: 9, color: '#94a3b8', marginBottom: 8 }}>
            Telemetri: {session.telemetry.streams.join(' + ')} @ {session.telemetry.sampleRateHz}Hz · Kayıt: {session.telemetry.logging ? 'AKTİF' : 'kapalı'}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {session.state === 'running' && <button onClick={() => act('set_break')} style={mini}>🟡 Set Molası (90sn)</button>}
            {session.state === 'set_break' && <button onClick={() => act('resume')} style={mini}>▶️ Devam Et</button>}
            {session.state !== 'completed' && <button onClick={() => act('complete')} style={danger}>🏁 Maçı Bitir</button>}
          </div>
        </div>
      )}
    </div>
  );
}

const primary: React.CSSProperties = { fontSize: 11, fontWeight: 800, padding: '10px 16px', borderRadius: 10, border: '1px solid #00f2fe', background: 'rgba(0,242,254,0.12)', color: '#00f2fe', cursor: 'pointer' };
const mini: React.CSSProperties = { fontSize: 9, fontWeight: 800, padding: '6px 10px', borderRadius: 8, border: '1px solid #334155', background: 'transparent', color: '#e2e8f0', cursor: 'pointer' };
const danger: React.CSSProperties = { fontSize: 9, fontWeight: 800, padding: '6px 10px', borderRadius: 8, border: '1px solid #F43F5E', background: 'transparent', color: '#F43F5E', cursor: 'pointer' };
const sel: React.CSSProperties = { marginLeft: 6, fontSize: 9, background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155', borderRadius: 6, padding: '5px 8px' };
