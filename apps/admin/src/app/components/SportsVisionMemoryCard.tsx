'use client';

import React, { useState } from 'react';
import { simulateRadarFrame, analyzeRadarSession, simulateVehicleEvents } from '../lib/vision/sportsVisionRadar';
import { loadMemory, memoryContextForMember, addMemory } from '../lib/ai/mem0LongTermMemory';
import { sendGotifyPush, dazeChefReadyReminder, courtTimeReminder, gotifyStatus } from '../lib/notifications/gotifyPushBridge';

// ============================================================================
// 🎛️ SPORTS VISION & MEMORY HUD (koyu neon)
// Sekme 1: Sports Speed Radar • Sekme 2: Long-Term Member Context • 3: Gotify
// Kırılmasız: bağımsız bileşen; deterministik simülasyon + localStorage.
// ============================================================================

type TabId = 'radar' | 'memory' | 'push';

export default function SportsVisionMemoryCard() {
  const [tab, setTab] = useState<TabId>('radar');
  const [frames, setFrames] = useState(() => Array.from({ length: 8 }, (_, i) => simulateRadarFrame(i)));
  const [memory, setMemory] = useState(loadMemory);
  const [pushLog, setPushLog] = useState<string[]>([]);

  const analysis = analyzeRadarSession(frames);
  const vehicles = simulateVehicleEvents(3);

  const refreshRadar = () => setFrames(Array.from({ length: 8 }, (_, i) => simulateRadarFrame(Date.now() % 97 + i)));

  const sendReady = async () => {
    const res = await sendGotifyPush(dazeChefReadyReminder('Akdeniz Levrek'));
    setPushLog((l) => [res.message, ...l].slice(0, 5));
  };
  const sendCourt = async () => {
    const res = await sendGotifyPush(courtTimeReminder('Aylin', 'Padel Kort 1', '18:00'));
    setPushLog((l) => [res.message, ...l].slice(0, 5));
  };
  const savePref = () => {
    setMemory(addMemory(memory, { memberId: 'm-1', kind: 'preference', content: 'Aylin kort 1 ve sabah slotunu tercih eder (radar HUD ile güncellendi)', importance: 92 }));
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: '12px',
      background: 'linear-gradient(160deg, rgba(15,23,42,0.92), rgba(13,19,34,0.96))',
      border: '1px solid rgba(0,242,254,0.3)', borderRadius: '16px', padding: '16px',
      boxShadow: '0 0 26px rgba(0,242,254,0.08)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>👁️ Sports Vision & Memory HUD</div>
          <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>{gotifyStatus()}</div>
        </div>
      </div>

      {/* Sekmeler */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {([['radar', '⚡ Speed Radar'], ['memory', '🧠 Long-Term Memory'], ['push', '🔔 Gotify Push']] as [TabId, string][]).map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{
              padding: '6px 13px', borderRadius: '999px', cursor: 'pointer', fontSize: '11px', fontWeight: 700,
              border: tab === id ? '1px solid #00f2fe' : '1px solid rgba(255,255,255,0.12)',
              background: tab === id ? 'rgba(0,242,254,0.12)' : 'rgba(255,255,255,0.03)',
              color: tab === id ? '#67e8f9' : '#94a3b8',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Sekme 1: Radar */}
      {tab === 'radar' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '8px' }}>
            <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,242,254,0.25)' }}>
              <div style={{ fontSize: '9px', color: '#64748b' }}>ORT. TOP HIZI</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#00f2fe' }}>{analysis.avgSpeed} <span style={{ fontSize: '10px' }}>km/h</span></div>
            </div>
            <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(245,158,11,0.3)' }}>
              <div style={{ fontSize: '9px', color: '#64748b' }}>MAKS. HIZ</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#fbbf24' }}>{analysis.maxSpeed} <span style={{ fontSize: '10px' }}>km/h</span></div>
            </div>
            <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(167,139,250,0.3)' }}>
              <div style={{ fontSize: '9px', color: '#64748b' }}>REAKSİYON</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#a78bfa' }}>{analysis.avgReaction} <span style={{ fontSize: '10px' }}>ms</span></div>
            </div>
            <div style={{ padding: '10px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(34,197,94,0.3)' }}>
              <div style={{ fontSize: '9px', color: '#64748b' }}>PERF. SKOR</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: '#4ade80' }}>{analysis.score}/100</div>
            </div>
          </div>
          <div style={{ fontSize: '11px', color: '#cbd5e1' }}>Baskın vuruş: <b>{analysis.dominantShot}</b> · {frames.length} kare analiz edildi</div>
          <div style={{ fontSize: '10px', color: '#64748b' }}>
            🚗 Araç radarı: {vehicles.map((v) => `${v.plate} (${v.direction})`).join(' · ')}
          </div>
          <button onClick={refreshRadar} style={{ padding: '9px 0', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#00f2fe,#4facfe)', color: '#0d1322', fontWeight: 800, fontSize: '12px' }}>
            🔄 Yeni Radar Okuması
          </button>
        </div>
      )}

      {/* Sekme 2: Memory */}
      {tab === 'memory' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ fontSize: '10px', fontWeight: 700, color: '#94a3b8', letterSpacing: '0.4px' }}>ÜYE BAĞLAMI (MEM0)</div>
          <pre style={{ margin: 0, fontSize: '10px', color: '#a5f3fc', background: 'rgba(0,0,0,0.35)', borderRadius: '10px', padding: '10px', whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
            {memoryContextForMember(memory, 'm-1')}
          </pre>
          <button onClick={savePref} style={{ padding: '8px 0', borderRadius: '10px', border: '1px solid rgba(0,242,254,0.4)', cursor: 'pointer', background: 'rgba(0,242,254,0.08)', color: '#67e8f9', fontWeight: 800, fontSize: '12px' }}>
            💾 Radar tercihini hafızaya kaydet
          </button>
          <div style={{ fontSize: '10px', color: '#64748b' }}>Toplam kayıt: {memory.records.length} · localStorage kalıcı</div>
        </div>
      )}

      {/* Sekme 3: Gotify */}
      {tab === 'push' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={sendReady} style={{ flex: 1, padding: '10px 0', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#f59e0b,#ea580c)', color: '#fff', fontWeight: 800, fontSize: '12px' }}>
              🍜 Daze Chef Hazır
            </button>
            <button onClick={sendCourt} style={{ flex: 1, padding: '10px 0', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#00f2fe,#4facfe)', color: '#0d1322', fontWeight: 800, fontSize: '12px' }}>
              🎾 Kort Saati
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {pushLog.length === 0 && <div style={{ fontSize: '11px', color: '#64748b' }}>Henüz bildirim gönderilmedi.</div>}
            {pushLog.map((m, i) => (
              <div key={i} style={{ fontSize: '11px', color: '#cbd5e1', padding: '7px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                {m}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

