'use client';

import React, { useEffect, useState } from 'react';
import { subscribe, emit, DazeEvent } from '../lib/ops/dazeHubEventBus';

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
    </div>
  );
}
