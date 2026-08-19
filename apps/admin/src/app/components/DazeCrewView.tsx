'use client';

import React, { useEffect, useState } from 'react';
import { subscribe, emit, DazeEvent } from '../lib/ops/dazeHubEventBus';
import { buildAttendanceList, redFlagScan, type AttendanceRow, type RedFlag } from '../lib/sports/autonomousReportCard';

// ============================================================================
// 👥 DAZE CREW PERSONEL HUD (Daze Hub)
// Canlı görev kuyruğu + tamamlanan sipariş puanı + vardiya performans rozeti.
// Event Bus'tan STAFF_TASK_DISPATCHED/ORDER_PLACED olaylarını dinler.
// ============================================================================

interface CrewTask {
  id: string;
  staff: string;
  orderItem: string;
  pay: number;
  perfPoints: number;
  done: boolean;
  dispatchedAt: string;
}

export default function DazeCrewView() {
  const [tasks, setTasks] = useState<CrewTask[]>([]);
  const [pay, setPay] = useState(0);
  const [perf, setPerf] = useState(0);

  useEffect(() => {
    const unsub1 = subscribe('ORDER_PLACED', (e: DazeEvent) => {
      // Müşteri siparişi → personel görevine dönüşür
      const task: CrewTask = {
        id: String(e.payload.orderId),
        staff: 'Murat (Servis)',
        orderItem: String(e.payload.item),
        pay: Math.round(Number(e.payload.amount) * 0.1),
        perfPoints: 10,
        done: false,
        dispatchedAt: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
      };
      setTasks((t) => [...t.slice(-7), task]);
      emit('STAFF_TASK_DISPATCHED', { taskId: task.id, staff: task.staff, pay: task.pay, perfPoints: task.perfPoints });
    });
    const unsub2 = subscribe('DAZE_REMINDER_TRIGGERED', (e: DazeEvent) => {
      if (e.payload.thermalGuard) setTasks((t) => t.map((x) => (x.id === e.payload.orderId ? { ...x, done: true } : x)));
    });
    return () => { unsub1(); unsub2(); };
  }, []);

  const complete = (id: string) => {
    setTasks((t) => t.map((x) => (x.id === id ? { ...x, done: true } : x)));
    const task = tasks.find((x) => x.id === id);
    if (task) { setPay((p) => p + task.pay); setPerf((p) => p + task.perfPoints); }
  };

  const done = tasks.filter((t) => t.done).length;
  const badge = perf >= 50 ? '🏆 VIP Hizmet Yıldızı' : perf >= 20 ? '🥈 Kıdemli Servis' : '🎖️ Yeni Personel';

  // 🧑‍🏫 Antrenör paneli — BLE otomatik yoklama + red flag
  const [attendance, setAttendance] = useState<AttendanceRow[]>(() => buildAttendanceList(['Efe', 'Deniz', 'Mert', 'Ada'], ['Efe', 'Deniz']));
  const [flags, setFlags] = useState<RedFlag[]>(() => redFlagScan(['Efe', 'Deniz', 'Mert', 'Ada']));
  const [rollMsg, setRollMsg] = useState('');
  const presentCount = attendance.filter((a) => a.present).length;
  const riskCount = flags.filter((f) => f.redFlag).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'linear-gradient(160deg, rgba(15,23,42,0.92), rgba(13,19,34,0.96))', border: '1px solid rgba(168,85,247,0.35)', borderRadius: '16px', padding: '16px', boxShadow: '0 0 26px rgba(168,85,247,0.1)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>👥 Daze Crew — Personel HUD</div>
          <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>Görev kuyruğu • sipariş puanı • vardiya rozeti</div>
        </div>
        <span style={{ fontSize: '10px', fontWeight: 800, padding: '4px 10px', borderRadius: '999px', color: '#f0abfc', background: 'rgba(168,85,247,0.12)', border: '1px solid rgba(168,85,247,0.4)' }}>{badge}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(110px,1fr))', gap: '8px' }}>
        {[
          { label: 'Aktif Görev', value: tasks.filter((t) => !t.done).length, color: '#38bdf8' },
          { label: 'Tamamlanan', value: done, color: '#4ade80' },
          { label: 'Saatlik Kazanç', value: `₺${pay}`, color: '#fbbf24' },
          { label: 'Performans', value: `${perf} puan`, color: '#f0abfc' },
        ].map((m) => (
          <div key={m.label} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '10px', textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: 900, color: m.color }}>{m.value}</div>
            <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '2px' }}>{m.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '220px', overflowY: 'auto' }}>
        {tasks.length === 0 && <div style={{ fontSize: '11px', color: '#64748b', textAlign: 'center', padding: '12px' }}>Henüz görev yok — Vision tarafından sipariş gelince burada belirir.</div>}
        {tasks.map((t) => (
          <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', background: 'rgba(255,255,255,0.04)', border: `1px solid ${t.done ? 'rgba(74,222,128,0.35)' : 'rgba(255,255,255,0.1)'}`, borderRadius: '10px', padding: '8px 10px' }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{t.orderItem}</div>
              <div style={{ fontSize: '9px', color: '#64748b' }}>{t.staff} • {t.dispatchedAt} • {t.perfPoints} puan</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '10px', fontWeight: 800, color: '#fbbf24' }}>₺{t.pay}</span>
              {!t.done && <button onClick={() => complete(t.id)} style={{ fontSize: '9px', padding: '4px 8px', borderRadius: '8px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#4ade80,#22d3ee)', color: '#0d1322', fontWeight: 800 }}>✓ Tamamla</button>}
              {t.done && <span style={{ fontSize: '9px', color: '#4ade80' }}>✓</span>}
            </div>
          </div>
        ))}
      </div>

      {/* 🧑‍🏫 ANTRENÖR PANELİ — BLE toplu yoklama + sakatlık red flag */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px', padding: '12px', borderRadius: '14px', background: 'linear-gradient(160deg, rgba(34,211,238,0.06), rgba(168,85,247,0.05))', border: '1px solid rgba(34,211,238,0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
          <div style={{ fontSize: '12px', fontWeight: 800, color: '#fff' }}>🧑‍🏫 Antrenör Paneli — Toplu Yoklama & Risk Radarı</div>
          <span style={{ fontSize: '9px', fontWeight: 800, padding: '4px 10px', borderRadius: '999px', background: riskCount > 0 ? 'rgba(239,68,68,0.15)' : 'rgba(74,222,128,0.12)', border: `1px solid ${riskCount > 0 ? 'rgba(239,68,68,0.5)' : 'rgba(74,222,128,0.4)'}`, color: riskCount > 0 ? '#f87171' : '#4ade80' }}>
            {riskCount > 0 ? `🚩 ${riskCount} sakatlık riski` : '💚 Risk yok'}
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '6px' }}>
          {attendance.map((a) => {
            const flag = flags.find((f) => f.athleteId === a.athleteId);
            return (
              <div key={a.athleteId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px', padding: '8px 10px', borderRadius: '10px', background: a.present ? 'rgba(74,222,128,0.08)' : 'rgba(100,116,139,0.08)', border: `1px solid ${flag?.redFlag ? 'rgba(239,68,68,0.6)' : 'rgba(255,255,255,0.1)'}` }}>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#fff' }}>{a.athleteId} {flag?.redFlag && '🚩'}</div>
                  <div style={{ fontSize: '8px', color: '#64748b' }}>{a.present ? `✅ Sahada (${a.source})` : '❌ Yok'}</div>
                  {flag?.redFlag && <div style={{ fontSize: '8px', color: '#f87171', fontWeight: 700 }}>{flag.reason.slice(0, 32)}</div>}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button onClick={() => { setAttendance(buildAttendanceList(['Efe', 'Deniz', 'Mert', 'Ada'], ['Efe', 'Deniz'])); setRollMsg(`📋 Yoklama alındı: ${presentCount}/4 sahada (BLE otomatik)`); }} style={{ fontSize: '9.5px', fontWeight: 800, padding: '8px 12px', borderRadius: '10px', border: '1px solid rgba(74,222,128,0.4)', background: 'rgba(74,222,128,0.08)', color: '#4ade80', cursor: 'pointer' }}>📋 Tek Tıkla Yoklama Al</button>
          <button onClick={() => { setFlags(redFlagScan(['Efe', 'Deniz', 'Mert', 'Ada'])); setRollMsg(`🩺 Red flag taraması: ${riskCount} riskli sporcu`); }} style={{ fontSize: '9.5px', fontWeight: 800, padding: '8px 12px', borderRadius: '10px', border: '1px solid rgba(248,113,113,0.4)', background: 'rgba(248,113,113,0.08)', color: '#f87171', cursor: 'pointer' }}>🩺 ACWR Risk Taraması</button>
          {rollMsg && <span style={{ fontSize: '9.5px', fontWeight: 700, color: '#38bdf8' }}>{rollMsg}</span>}
        </div>
      </div>
    </div>
  );
}
