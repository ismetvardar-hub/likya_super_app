'use client';

import React, { useState } from 'react';
import { backOfficeHealthMatrix, growthFunnel, backOffice200Status, type DomainHealth } from '../lib/ops/backOffice200Engine';
import { parseVoiceCommand, voiceprintVerify, callSentiment, voiceCommandEngineStatus, type VoiceCommand } from '../lib/ai/voiceCommandEngine';
import { startFocusSession, tickSession, movementBreakAlert, weeklyCuriosityScore, mentalLoadIndex, curiosityGamificationStatus, type SessionState } from '../lib/coaching/curiosityGamificationEngine';
import { accrueMonthlyDues, attendanceRate, coachAlertBadges, membershipDuesEngineStatus, type StudentMember } from '../lib/sports/membershipDuesEngine';
import { conveyorQualityControl, chefWarning, kitchenQualitySimulatorStatus, type PlateItem } from '../lib/ops/kitchenQualitySimulator';

// ============================================================================
// 🏢 İLERİ KURUMSAL MODÜLLER — 200-Sistem • Sesli Komut • Gamification • Aidat
// Monitor görünümüne bağlı kapsamlı hub. Deterministik; Plan Z güvenli.
// ============================================================================

const DOMAIN_STATES: Partial<Record<string, DomainHealth>> = { Finance: 'RED', HR: 'YELLOW', Kitchen: 'YELLOW', Lead: 'GREEN', Sales: 'GREEN', Operations: 'GREEN', Inventory: 'GREEN', Support: 'GREEN', Data: 'GREEN', Payments: 'GREEN' };

export default function AdvancedEnterpriseModules() {
  const health = backOfficeHealthMatrix(DOMAIN_STATES);
  const funnel = growthFunnel({ Attract: 1000, Convert: 320, Deliver: 280, Optimize: 210, Grow: 140 });
  const [voiceText, setVoiceText] = useState('Yangın tatbikatı başlat');
  const [voiceResult, setVoiceResult] = useState<VoiceCommand | null>(null);
  const [session, setSession] = useState<SessionState>({ mode: 'idle', remainingSec: 0, cyclesCompleted: 0, score: 0, level: 1 });
  const [members] = useState<StudentMember[]>([
    { id: 'M1', name: 'Efe K.', monthlyDuesTl: 1500, siblingDiscountPct: 0.2, scholarshipPct: 0 },
    { id: 'M2', name: 'Deniz A.', monthlyDuesTl: 1500, siblingDiscountPct: 0, scholarshipPct: 0.5 },
  ]);
  const [plates] = useState<PlateItem[]>([
    { id: 'p1', name: 'Levrek Izgara', tempC: 74, weightG: 210, expectedG: 200, visualScore: 0.9 },
    { id: 'p2', name: 'Köfte Ezmeli Pide', tempC: 58, weightG: 220, expectedG: 200, visualScore: 0.8 },
  ]);
  const qc = conveyorQualityControl(plates);
  const dues = accrueMonthlyDues(members, '2026-08');
  const focus = weeklyCuriosityScore([80, 95, 60, 110, 90, 120, 100]);
  const mental = mentalLoadIndex(85, 70, 2);

  const runVoice = () => setVoiceResult(parseVoiceCommand(voiceText));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', background: 'linear-gradient(160deg, rgba(15,23,42,0.92), rgba(13,19,34,0.96))', border: '1px solid rgba(129,140,248,0.35)', borderRadius: '16px', padding: '16px', boxShadow: '0 0 26px rgba(129,140,248,0.1)' }}>
      <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>🏢 İleri Kurumsal Modüller</div>
      <div style={{ fontSize: '10px', color: '#64748b' }}>{backOffice200Status()} • {voiceCommandEngineStatus()} • {curiosityGamificationStatus()} • {membershipDuesEngineStatus()} • {kitchenQualitySimulatorStatus()}</div>

      {/* 200-SYSTEM HEALTH MATRIX */}
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '12px' }}>
        <div style={{ fontSize: '10px', fontWeight: 800, color: '#a5b4fc' }}>🏢 200-SYSTEMS BACK-OFFICE HEALTH</div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginTop: '6px' }}>
          <span style={{ color: '#4ade80' }}>🟢 {health.green}</span>
          <span style={{ color: '#fbbf24' }}>🟡 {health.yellow}</span>
          <span style={{ color: '#f87171' }}>🔴 {health.red}</span>
          <b style={{ color: health.overall === 'HEALTHY' ? '#4ade80' : health.overall === 'DEGRADED' ? '#fbbf24' : '#f87171' }}>{health.overall}</b>
          <span style={{ color: '#64748b', fontSize: '10px' }}>• Huni: Attract {funnel.stages[0].count} → Grow {funnel.stages[4].count} (%{funnel.overallPct})</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '8px' }}>
          {health.matrix.map((m) => (
            <span key={m.domain} style={{ fontSize: '8px', padding: '3px 8px', borderRadius: '999px', border: `1px solid ${m.health === 'GREEN' ? 'rgba(74,222,128,0.4)' : m.health === 'YELLOW' ? 'rgba(251,191,36,0.4)' : 'rgba(239,68,68,0.5)'}`, color: m.health === 'GREEN' ? '#4ade80' : m.health === 'YELLOW' ? '#fbbf24' : '#f87171', background: m.health === 'RED' ? 'rgba(239,68,68,0.1)' : 'transparent' }}>
              {m.health === 'GREEN' ? '🟢' : m.health === 'YELLOW' ? '🟡' : '🔴'} {m.domain}
            </span>
          ))}
        </div>
      </div>


      {/* SESLİ KOMUT */}
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ fontSize: '10px', fontWeight: 800, color: '#a5b4fc' }}>🎙️ DESKTOP VOICE CONTROLLER</div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <input value={voiceText} onChange={(e) => setVoiceText(e.target.value)} style={{ flex: 1, fontSize: '11px', padding: '8px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)', color: '#e2e8f0' }} />
          <button onClick={runVoice} style={{ fontSize: '10px', fontWeight: 800, padding: '8px 14px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#818cf8,#a78bfa)', color: '#fff' }}>🎤 Çalıştır</button>
        </div>
        {voiceResult && (
          <div style={{ fontSize: '11px', color: '#e2e8f0', lineHeight: 1.6 }}>
            Intent: <b style={{ color: '#a5b4fc' }}>{voiceResult.intent}</b> • {voiceResult.action}
            <div style={{ fontSize: '9px', color: '#64748b' }}>Voiceprint: {voiceprintVerify(voiceText, voiceText, 0.8).verified ? '✅ onaylandı' : '❌ reddedildi'} • Duygu: {callSentiment(voiceText).verdict}</div>
          </div>
        )}
      </div>


      {/* GAMIFICATION SEANSI */}
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ fontSize: '10px', fontWeight: 800, color: '#fbbf24' }}>🎮 MERAK ODAKLI ÇALIŞMA BLOĞU (Gamification)</div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          {session.mode === 'idle' && <button onClick={() => setSession(startFocusSession(session))} style={{ fontSize: '11px', fontWeight: 800, padding: '8px 14px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#fbbf24,#f97316)', color: '#0d1322' }}>▶ 25 dk Odak Başlat</button>}
          {session.mode !== 'idle' && (
            <button onClick={() => setSession(tickSession(session, 60))} style={{ fontSize: '11px', fontWeight: 800, padding: '8px 14px', borderRadius: '10px', border: '1px solid rgba(251,191,36,0.4)', background: 'rgba(251,191,36,0.08)', color: '#fbbf24', cursor: 'pointer' }}>⏱ +1dk ({session.remainingSec}s)</button>
          )}
          <span style={{ fontSize: '11px', color: '#e2e8f0' }}>Puan: <b style={{ color: '#4ade80' }}>{session.score}</b> • Seviye {session.level} • Döngü {session.cyclesCompleted}</span>
        </div>
        <div style={{ fontSize: '10px', color: '#94a3b8', lineHeight: 1.6 }}>
          {session.mode !== 'idle' && <b style={{ color: '#fbbf24' }}>{session.mode.toUpperCase()}:</b>} {movementBreakAlert().message}
          <div style={{ marginTop: '4px' }}>Haftalık odak: <b style={{ color: '#a5b4fc' }}>{focus.score}/100</b> ({focus.avgMin} dk/gün) • Mental: yorgunluk <b style={{ color: mental.fatigue > 70 ? '#f87171' : '#4ade80' }}>{mental.fatigue}</b> / motivasyon <b style={{ color: mental.motivation < 40 ? '#f87171' : '#4ade80' }}>{mental.motivation}</b></div>
        </div>
      </div>

      {/* AİDAT + MUTFAK QC */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '10px' }}>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '12px' }}>
          <div style={{ fontSize: '10px', fontWeight: 800, color: '#7dd3fc' }}>💳 AKADEMİ AİDAT & YOKLAMA</div>
          <div style={{ fontSize: '11px', color: '#e2e8f0', marginTop: '6px', lineHeight: 1.7 }}>
            {dues.month} tahakkuk: <b style={{ color: '#4ade80' }}>₺{dues.totalDueTl}</b><br />
            {dues.memberBills.map((b) => <span key={b.memberId}>• {b.name}: ₺{b.netTl}<br /></span>)}
            {coachAlertBadges([{ id: 'M1', name: 'Efe K.', paid: true, absentStreak: 1 }, { id: 'M2', name: 'Deniz A.', paid: false, absentStreak: 3 }]).filter((a) => a.type !== 'ok').map((a) => <span key={a.memberId} style={{ color: '#f87171' }}>⚠️ {a.note}<br /></span>)}
            Katılım: {attendanceRate([{ date: '1', present: true }, { date: '2', present: true }, { date: '3', present: false }], 4)}%
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '12px' }}>
          <div style={{ fontSize: '10px', fontWeight: 800, color: '#7dd3fc' }}>🏭 MUTFAK KONVEYÖR QC</div>
          <div style={{ fontSize: '11px', color: '#e2e8f0', marginTop: '6px', lineHeight: 1.7 }}>
            Sayım: {qc.counted} • Geçen: <b style={{ color: '#4ade80' }}>{qc.passed}</b> • QC: %{qc.qcPct}<br />
            <span style={{ color: qc.warnChef ? '#f87171' : '#4ade80' }}>{chefWarning(qc.rejected)}</span>
            {qc.stampRef && <span style={{ color: '#7dd3fc' }}>🏷️ {qc.stampRef}</span>}
          </div>
        </div>
      </div>
    </div>
  );
}

