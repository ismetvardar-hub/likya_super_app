'use client';

import React, { useEffect, useState } from 'react';
import { generateLiveHubSnapshot, livePerformanceHubStatus, type LivePerformanceHubSnapshot } from '../lib/sports/livePerformanceHub';
import { requestHeartRateConnection, requestInsoleConnection, requestMiBandConnection, webBluetoothSupported, webBluetoothBridgeStatus, browserBluetoothAdvice, computeRmssd } from '../lib/hardware/webBluetoothBridge';

// ============================================================================
// 🏆 SPORTVISIONX LIVE PERFORMANCE HUB — 6 bölgeli canlı ekran
// 1. Kinetik & Patlayıcılık  2. Biyomekanik & Tabanlık  3. Fizyolojik & İç Yük
// 4. Anlık Kıyas & Sapma      5. Koordinasyon & Kol      6. Canlı Yorgunluk
// ============================================================================

export default function ExtremeSLivePerformanceHub() {
  const [snap, setSnap] = useState<LivePerformanceHubSnapshot>(() => generateLiveHubSnapshot(1));
  const [live, setLive] = useState(true);
  const [bleOpen, setBleOpen] = useState(false);
  const [bleMsg, setBleMsg] = useState('');
  const [bleConnected, setBleConnected] = useState<Record<string, boolean>>({});
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    if (!live) return;
    const id = setInterval(() => setSnap(generateLiveHubSnapshot()), 3000);
    return () => clearInterval(id);
  }, [live]);

  const f = snap.physiology;
  const c = snap.comparison;
  const k = snap.kinetic;
  const co = snap.coordination;
  const fa = snap.fatigue;

  const connectSensor = async (kind: 'HEART_RATE' | 'INSOLE' | 'MI_BAND') => {
    setBleOpen(false);
    if (!webBluetoothSupported()) {
      setBleMsg('⚠️ Bu tarayıcı Web Bluetooth desteklemiyor — Chrome/Edge + https/localhost gerekli');
      return;
    }
    try {
      if (kind === 'HEART_RATE') {
        const st = await requestHeartRateConnection(
          (bpm) => {
            setSnap((prev) => ({
              ...prev,
              physiology: {
                ...prev.physiology,
                heartRate: bpm,
                avgHeartRate: Math.round((prev.physiology.avgHeartRate + bpm) / 2),
                heartZone: bpm >= 160 ? 'Zon 4' : bpm >= 140 ? 'Zon 3' : 'Zon 2',
              },
            }));
          },
          (rr) => {
            const hrv = computeRmssd(rr);
            if (hrv !== null) {
              setSnap((prev) => ({ ...prev, physiology: { ...prev.physiology, hrvRmssd: hrv } }));
            }
          },
        );
        setBleConnected((x) => ({ ...x, HEART_RATE: true }));
        setBleMsg(st.message ?? '❤️ Kalp Kemeri bağlandı');
      } else if (kind === 'INSOLE') {
        const st = await requestInsoleConnection(undefined, (d) => {
          setSnap((prev) => ({
            ...prev,
            insole: { forefootPct: d.forefootPct, heelPct: d.heelPct },
            comparison: d.gctMs > 0 ? { ...prev.comparison, gctMs: d.gctMs } : prev.comparison,
          }));
        });
        setBleConnected((x) => ({ ...x, INSOLE: true }));
        setBleMsg(st.message ?? '👟 Tabanlık bağlandı');
      } else {
        const st = await requestMiBandConnection(() => {});
        setBleConnected((x) => ({ ...x, MI_BAND: true }));
        setBleMsg(st.message ?? '⌚ Mi Band bağlandı');
      }
    } catch (e) {
      setBleMsg(`⚠️ ${(e as Error).message ?? 'Bağlantı iptal edildi'}`);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'linear-gradient(160deg,#0f172a,#1e1b4b)', border: '1px solid rgba(56,189,248,0.3)', borderRadius: '20px', padding: '16px', color: '#f8fafc' }}>
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
        <div style={{ fontSize: '15px', fontWeight: 900, color: '#fff' }}>🏆 SportVisionX Live Performance Hub</div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button onClick={() => setBleOpen((v) => !v)} style={{ fontSize: '9.5px', fontWeight: 800, padding: '7px 14px', borderRadius: '10px', border: '1px solid rgba(74,222,128,0.5)', background: 'rgba(74,222,128,0.1)', color: '#4ade80', cursor: 'pointer', boxShadow: '0 0 12px rgba(74,222,128,0.15)' }}>📡 Sensörleri Bağla (BLE)</button>
          <span style={{ fontSize: '10px', fontWeight: 800, color: live ? '#f87171' : '#64748b' }}>{live ? '🔴 LIVE' : '⏸️ DURAKLATILDI'}</span>
          <button onClick={() => setLive((v) => !v)} style={{ fontSize: '9px', fontWeight: 800, padding: '6px 12px', borderRadius: '10px', border: '1px solid rgba(56,189,248,0.4)', background: 'rgba(56,189,248,0.08)', color: '#38bdf8', cursor: 'pointer' }}>{live ? '⏸️' : '▶️'}</button>
        </div>
      </div>
      {/* BAĞLI SENSÖR ROZETLERİ */}
      {Object.keys(bleConnected).length > 0 && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {bleConnected.HEART_RATE && <span style={{ fontSize: '9px', fontWeight: 800, padding: '4px 10px', borderRadius: '999px', color: '#f87171', background: 'rgba(248,113,113,0.12)', border: '1px solid rgba(248,113,113,0.4)' }}>❤️ HRM Bağlı — canlı</span>}
          {bleConnected.INSOLE && <span style={{ fontSize: '9px', fontWeight: 800, padding: '4px 10px', borderRadius: '999px', color: '#38bdf8', background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.4)' }}>👟 Tabanlık Bağlı — canlı</span>}
          {bleConnected.MI_BAND && <span style={{ fontSize: '9px', fontWeight: 800, padding: '4px 10px', borderRadius: '999px', color: '#c4b5fd', background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.4)' }}>⌚ MiBand Bağlı — canlı</span>}
          {demoMode && <span style={{ fontSize: '9px', fontWeight: 800, padding: '4px 10px', borderRadius: '999px', color: '#94a3b8', background: 'rgba(148,163,184,0.12)', border: '1px solid rgba(148,163,184,0.4)' }}>🧪 Demo / Simülasyon</span>}
        </div>
      )}
      {/* BLE EŞLEŞTİRME MODALI */}
      {bleOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.78)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={() => setBleOpen(false)}>
          <div style={{ background: 'linear-gradient(160deg,#0f172a,#1e1b4b)', border: '1px solid rgba(74,222,128,0.4)', borderRadius: '18px', padding: '18px', width: 'min(430px, 94vw)', display: 'flex', flexDirection: 'column', gap: '10px', boxShadow: '0 0 40px rgba(74,222,128,0.15)' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '13px', fontWeight: 900, color: '#fff' }}>📡 Sensör Eşleştirme</div>
              <button onClick={() => setBleOpen(false)} style={{ fontSize: '12px', fontWeight: 800, border: 'none', background: 'transparent', color: '#64748b', cursor: 'pointer' }}>✕</button>
            </div>
            {browserBluetoothAdvice() && (
              <div style={{ fontSize: '9.5px', fontWeight: 700, color: '#fb7185', background: 'rgba(251,113,133,0.1)', border: '1px solid rgba(251,113,133,0.4)', borderRadius: '10px', padding: '8px 10px' }}>{browserBluetoothAdvice()}</div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { kind: 'HEART_RATE' as const, icon: '❤️', name: 'Kalp Kemeri (Decathlon HRM)', detail: '0x180D • anlık BPM + RR/HRV', color: '#f87171', connected: !!bleConnected.HEART_RATE },
                { kind: 'INSOLE' as const, icon: '👟', name: 'Akıllı Tabanlık (ESP32 FSR)', detail: 'toe/heel basınç + GCT → ısı haritası', color: '#38bdf8', connected: !!bleConnected.INSOLE },
                { kind: 'MI_BAND' as const, icon: '⚡', name: 'Kol IMU / Bileklik', detail: 'ivmeölçer + savrulma → kinetik', color: '#c4b5fd', connected: !!bleConnected.MI_BAND },
              ].map((d) => (
                <div key={d.kind} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', padding: '10px 12px', borderRadius: '12px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)' }}>
                  <div>
                    <div style={{ fontSize: '11px', fontWeight: 800, color: '#fff' }}>{d.icon} {d.name} {d.connected && <span style={{ color: '#4ade80', fontSize: '9px' }}>✓ Bağlı</span>}</div>
                    <div style={{ fontSize: '8.5px', color: '#64748b' }}>{d.detail}</div>
                  </div>
                  <button onClick={() => connectSensor(d.kind)} style={{ fontSize: '9px', fontWeight: 800, padding: '7px 13px', borderRadius: '9px', border: `1px solid ${d.color}55`, background: `${d.color}18`, color: d.color, cursor: 'pointer', whiteSpace: 'nowrap' }}>{d.connected ? '🔄 Yeniden' : '🔗 Eşleştir'}</button>
                </div>
              ))}
            </div>
            <button onClick={() => { setBleOpen(false); setDemoMode(true); setBleMsg('🧪 Demo modu aktif — simülasyon verisi akıyor (fiziksel cihaz bağlanana kadar)'); }} style={{ fontSize: '9.5px', fontWeight: 800, padding: '9px 14px', borderRadius: '10px', border: '1px solid rgba(148,163,184,0.4)', background: 'rgba(148,163,184,0.1)', color: '#94a3b8', cursor: 'pointer' }}>🧪 Demo / Simülasyon Verisini Kullan</button>
            {bleMsg && <div style={{ fontSize: '9px', fontWeight: 700, color: bleMsg.startsWith('⚠️') ? '#fb7185' : '#4ade80' }}>{bleMsg}</div>}
            <div style={{ fontSize: '8px', color: '#475569' }}>{webBluetoothBridgeStatus()}</div>
          </div>
        </div>
      )}
      {/* SPORCU BİLGİSİ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '10px 14px' }}>
        <span style={{ fontSize: '12px', fontWeight: 800, color: '#fff' }}>🧑‍🚀 Sporcu: {snap.athlete.name}</span>
        <span style={{ fontSize: '10px', color: '#94a3b8' }}>🗓️ {snap.athlete.date} {snap.athlete.time} • {snap.athlete.sessionType}</span>
        <span style={{ fontSize: '14px', fontWeight: 900, color: '#38bdf8', fontVariantNumeric: 'tabular-nums' }}>⏱️ {snap.elapsed.h}:{snap.elapsed.m}:{snap.elapsed.s}</span>
      </div>

      {/* 6 BÖLGE GRİD */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
        {/* 1. KİNETİK & PATLAYICILIK */}
        <div style={{ background: 'rgba(30,41,59,0.9)', border: '1px solid rgba(51,65,85,0.8)', borderRadius: '14px', padding: '12px' }}>
          <div style={{ fontSize: '9px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700 }}>🏎️ Kinetik & Patlayıcılık</div>
          <div style={{ fontSize: '22px', fontWeight: 900, color: '#4ade80', marginTop: '6px' }}>{k.speedKmh} <span style={{ fontSize: '11px' }}>km/h</span></div>
          <div style={{ fontSize: '9.5px', color: '#64748b' }}>Top Hızı: {k.topSpeedKmh} km/h</div>
          <hr style={{ border: 0, borderTop: '1px solid #334155', margin: '10px 0' }} />
          <div style={{ fontSize: '10px', color: '#e2e8f0' }}>🚀 İvmelenme (0-5m): <b style={{ color: '#38bdf8' }}>{k.accelerationMps2} m/s²</b></div>
          <div style={{ fontSize: '10px', color: '#e2e8f0' }}>⬆️ Sıçrama: <b style={{ color: '#a78bfa' }}>{k.jumpCm} cm</b> ({k.flightMs} ms)</div>
        </div>

        {/* 2. BİYOMEKANİK & TABANLIK */}
        <div style={{ background: 'rgba(30,41,59,0.9)', border: '1px solid rgba(51,65,85,0.8)', borderRadius: '14px', padding: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '9px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700 }}>👟 Biyomekanik & Tabanlık</div>
          <div style={{ width: '90px', height: '160px', border: '3px solid #475569', borderRadius: '45px 45px 30px 30px', margin: '10px auto', position: 'relative', background: '#0f172a' }}>
            <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', top: '16px', width: '52px', height: '52px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 800, color: '#fff', background: snap.insole.forefootPct > 70 ? 'rgba(239,68,68,0.9)' : 'rgba(250,204,21,0.9)', boxShadow: snap.insole.forefootPct > 70 ? '0 0 14px rgba(239,68,68,0.5)' : '0 0 14px rgba(250,204,21,0.5)' }}>
              ÖN: %{snap.insole.forefootPct}
            </div>
            <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', bottom: '12px', width: '44px', height: '44px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', fontWeight: 800, color: '#fff', background: 'rgba(34,197,94,0.9)', boxShadow: '0 0 14px rgba(34,197,94,0.5)' }}>
              TOPUK: %{snap.insole.heelPct}
            </div>
          </div>
        </div>


        {/* 3. FİZYOLOJİK & İÇ YÜK */}
        <div style={{ background: 'rgba(30,41,59,0.9)', border: '1px solid rgba(51,65,85,0.8)', borderRadius: '14px', padding: '12px' }}>
          <div style={{ fontSize: '9px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700 }}>❤️ Fizyolojik & İç Yük</div>
          <div style={{ fontSize: '22px', fontWeight: 900, color: '#f87171', marginTop: '6px' }}>{f.heartRate} <span style={{ fontSize: '11px' }}>bpm</span> <span style={{ fontSize: '10px', color: '#fbbf24', fontWeight: 800 }}>({f.heartZone})</span></div>
          <div style={{ fontSize: '9.5px', color: '#64748b' }}>Ort. Nabız: {f.avgHeartRate} bpm</div>
          <div style={{ fontSize: '10px', color: '#e2e8f0', marginTop: '8px' }}>🔋 Enerji / Pil (Fatigue):</div>
          <div style={{ height: '8px', borderRadius: '99px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden', marginTop: '4px' }}>
            <div style={{ height: '100%', width: `${f.energyPct}%`, borderRadius: '99px', background: f.energyPct > 70 ? 'linear-gradient(90deg,#4ade80,#22d3ee)' : 'linear-gradient(90deg,#fbbf24,#f59e0b)' }} />
          </div>
          <div style={{ fontSize: '9px', color: '#64748b', marginTop: '4px' }}>%{f.energyPct} kaldı • HRV (rMSSD): <b style={{ color: '#a78bfa' }}>{f.hrvRmssd} ms</b> (Stabil)</div>
        </div>

        {/* 4. ANLIK KIYAS VE SAPMA */}
        <div style={{ background: 'rgba(30,41,59,0.9)', border: '1px solid rgba(51,65,85,0.8)', borderRadius: '14px', padding: '12px' }}>
          <div style={{ fontSize: '9px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700 }}>📊 Anlık Kıyas & Sapma</div>
          <div style={{ fontSize: '11px', color: '#e2e8f0', marginTop: '8px' }}>👟 Temas (GCT): <b style={{ color: '#38bdf8', fontSize: '16px' }}>{c.gctMs} ms</b> <span style={{ fontSize: '9px', color: '#64748b' }}>(Hedef &lt;{c.gctTargetMs}ms)</span> <span style={{ color: c.gctMs < c.gctTargetMs ? '#4ade80' : '#fbbf24', fontWeight: 800 }}>{c.gctMs < c.gctTargetMs ? '✅' : '⚠️'}</span></div>
          <div style={{ fontSize: '11px', color: '#e2e8f0', marginTop: '8px' }}>🦵 Reaktif Güç (RSI): <b style={{ color: '#a78bfa', fontSize: '16px' }}>{c.rsi}</b> <span style={{ fontSize: '9px', color: '#64748b' }}>(Sınıf: {c.rsiClass})</span> <span style={{ color: '#fbbf24' }}>⭐</span></div>
        </div>


        {/* 5. KOORDİNASYON & KOL */}
        <div style={{ background: 'rgba(30,41,59,0.9)', border: '1px solid rgba(51,65,85,0.8)', borderRadius: '14px', padding: '12px' }}>
          <div style={{ fontSize: '9px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700 }}>☄️ Koordinasyon & Kol</div>
          <div style={{ fontSize: '20px', fontWeight: 900, color: '#fbbf24', marginTop: '6px' }}>{co.armSpeedKmh} <span style={{ fontSize: '11px' }}>km/h</span></div>
          <div style={{ fontSize: '9.5px', color: '#64748b' }}>Raket Açısı: {co.racketAngleDeg}°</div>
          <div style={{ fontSize: '10px', color: '#e2e8f0', marginTop: '8px' }}>🏸 Vuruş: <b>{co.shots}</b></div>
          <div style={{ fontSize: '9px', color: '#64748b' }}>Servis: {co.serves} | Forehand: {co.forehands}</div>
        </div>

        {/* 6. CANLI YORGUNLUK ANALİZİ */}
        <div style={{ background: 'rgba(30,41,59,0.9)', border: '1px solid rgba(51,65,85,0.8)', borderRadius: '14px', padding: '12px' }}>
          <div style={{ fontSize: '9px', textTransform: 'uppercase', color: '#94a3b8', fontWeight: 700 }}>🔋 Canlı Yorgunluk Analizi</div>
          <div style={{ marginTop: '8px' }}>
            <span style={{ fontSize: '10px', fontWeight: 800, padding: '5px 11px', borderRadius: '999px', color: fa.riskSafe ? '#4ade80' : '#fbbf24', background: fa.riskSafe ? 'rgba(74,222,128,0.12)' : 'rgba(250,204,21,0.12)', border: `1px solid ${fa.riskSafe ? 'rgba(74,222,128,0.4)' : 'rgba(250,204,21,0.4)'}` }}>
              🛡️ Sakatlık Riski: {fa.injuryRisk} {fa.riskSafe ? '🟢 Güvenli' : '🟡 Dikkat'}
            </span>
          </div>
          <div style={{ fontSize: '10px', color: '#e2e8f0', marginTop: '8px' }}>📉 Performans Düşüşü: <b style={{ color: fa.performanceDropPct > 6 ? '#fb7185' : '#4ade80' }}>%{fa.performanceDropPct}</b> <span style={{ fontSize: '9px', color: '#64748b' }}>(GCT %{fa.gctLengthenPct} uzadı)</span> {fa.gctLengthenPct > 10 ? '⚠️' : '✅'}</div>
        </div>
      </div>

      <div style={{ fontSize: '9px', color: '#475569' }}>{livePerformanceHubStatus()}</div>
    </div>
  );
}

