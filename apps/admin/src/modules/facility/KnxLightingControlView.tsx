'use client';

import React, { useState } from 'react';
import {
  KnxLightingGateway,
  buildKnxTelegram,
  knxCommandFromTelegram,
  KNX_ECO_STANDBY_DIM_PCT,
  SESSION_LIGHT_LEAD_MS,
  type KnxCommand,
  type KnxLightingState,
} from '../../app/lib/facility/knxLightingGateway.ts';

// ============================================================================
// 💡 GVS KNX KORT AYDINLATMA KONTROL GÖRÜNÜMÜ (Adım 136)
// Floodlight komutları (ON/OFF/DIM/SCENE) + otomatik zamanlama (seans öncesi
// 5dk aç · 10dk boşlukta ECO %15) + bellek-içi simülasyon driver.
// Motor: knxLightingGateway.ts
// ============================================================================

export default function KnxLightingControlView() {
  const [gateway] = useState<KnxLightingGateway>(() => new KnxLightingGateway());
  const [state, setState] = useState<KnxLightingState>(gateway.stateSnapshot());
  const [dim, setDim] = useState(80);
  const [occupied, setOccupied] = useState(true);
  const [scheduleNote, setScheduleNote] = useState('Zamanlama bekleniyor');
  const [sessionStartInMs] = useState(() => Date.now() + 3 * 60_000); // 3 dk sonra seans

  function apply(command: KnxCommand, value = 0) {
    const next = gateway.applyCommand(command, value);
    setState(next);
    const payload = buildKnxTelegram(command, value);
    setScheduleNote(`Telegram: ${payload.telegram}`);
  }

  function runSchedule() {
    const result = gateway.applySchedule([{ courtId: 1, startsAtMs: sessionStartInMs }], Date.now(), occupied);
    setState(result.state);
    setScheduleNote(`[${result.action}] ${result.reason}`);
  }

  const sceneLabel = state.power ? (state.scene === 'ECO_STANDBY' ? 'ECO STANDBY (%15)' : `${state.scene} %${state.dimPct}`) : 'KAPALI';

  return (
    <div style={{ width: '100%', background: 'rgba(2,6,23,0.7)', borderRadius: 14, padding: 12 }}>
      <div style={{ fontSize: 12, fontWeight: 800, color: '#F27A1A', marginBottom: 8 }}>💡 GVS KNX Kort Aydınlatma</div>

      {/* Durum */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', fontSize: 10, color: '#94a3b8' }}>
        <span>Güç: <b style={{ color: state.power ? '#10B981' : '#64748b' }}>{state.power ? 'AÇIK' : 'KAPALI'}</b></span>
        <span>Sahne: <b style={{ color: '#00f2fe' }}>{sceneLabel}</b></span>
        <span>Son komut: <code style={{ color: '#8B5CF6' }}>{state.lastCommand ?? '—'}</code></span>
      </div>

      {/* Komutlar */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
        <button onClick={() => apply('ON')} style={btn}>ON</button>
        <button onClick={() => apply('OFF')} style={{ ...btn, borderColor: '#64748b', color: '#64748b' }}>OFF</button>
        <button onClick={() => apply('SCENE_MATCH_HIGH_INTENSITY')} style={{ ...btn, borderColor: '#F27A1A', color: '#F27A1A' }}>🎾 MATCH %100</button>
        <button onClick={() => apply('SCENE_STANDBY_ECO')} style={{ ...btn, borderColor: '#10B981', color: '#10B981' }}>🌙 ECO %15</button>
      </div>

      {/* DIM slider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 9, color: '#94a3b8' }}>
        <span>DIM_LUX</span>
        <input type="range" min={0} max={100} value={dim} onChange={(e) => setDim(Number(e.target.value))} style={{ flex: 1 }} />
        <b style={{ color: '#e2e8f0' }}>%{dim}</b>
        <button onClick={() => apply('DIM_LUX', dim)} style={btn}>Uygula</button>
      </div>

      {/* Otomatik zamanlama */}
      <div style={{ border: '1px solid #1e293b', borderRadius: 8, padding: 8, marginBottom: 8, fontSize: 9, color: '#94a3b8' }}>
        <div style={{ marginBottom: 4 }}>
          Kort dolu: <button onClick={() => setOccupied((o) => !o)} style={btn}>{occupied ? '✅ EVET' : '❌ HAYIR'}</button>
          <span style={{ marginLeft: 8 }}>Seans {Math.ceil(SESSION_LIGHT_LEAD_MS / 60000)} dk öncesinde otomatik açılır · {KNX_ECO_STANDBY_DIM_PCT}% ECO 10 dk boşlukta</span>
        </div>
        <button onClick={runSchedule} style={{ ...btn, borderColor: '#00f2fe', color: '#00f2fe' }}>⏱ Zamanlamayı Çalıştır</button>
      </div>

      <div style={{ fontSize: 8, color: '#8B5CF6' }}>{scheduleNote}</div>
      <div style={{ fontSize: 8, color: '#64748b', marginTop: 4 }}>Simülasyon driver (headless CI / offline demo) — gerçek KNX bağlantısı için telegram'lar gönderilir.</div>
    </div>
  );
}

const btn: React.CSSProperties = { fontSize: 9, fontWeight: 800, padding: '6px 10px', borderRadius: 8, border: '1px solid #334155', background: 'transparent', color: '#e2e8f0', cursor: 'pointer' };
