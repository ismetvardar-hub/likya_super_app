'use client';

import React, { useEffect, useState } from 'react';
import { subscribe, emit, orderPlaced, dazeReminderTriggered } from '../lib/ops/dazeHubEventBus';

// ============================================================================
// 📱 DAZE VISION MÜŞTERİ SİPARİŞ TAKİP KARTI (Daze Hub)
// Müşterinin siparişini mutfak + servis aşamalarında canlı izler.
// 120s sayaç + Daze-Gift ikram kartı. ORDER_PLACED/KITCHEN_TIMER_TICK
// olaylarına abonedir; DAZE_REMINDER_TRIGGERED'ı 2dk aşımında üretir.
// ============================================================================

interface OrderTrack {
  id: string;
  item: string;
  amount: number;
  remainingSec: number;
  status: 'alındı' | 'mutfakta' | 'hazır';
}

export default function DazeVisionOrderTracker() {
  const [orders, setOrders] = useState<OrderTrack[]>([]);
  const [giftEligible, setGiftEligible] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setOrders((prev) => prev.map((o) => {
        if (o.status === 'hazır' || o.remainingSec <= 0) {
          if (o.remainingSec === 0) {
            // 120s bitti → Daze-Reminder + termal koruma bayrağı
            dazeReminderTriggered(o.id, 0, false);
            setTimeout(() => dazeReminderTriggered(o.id, 3, true), 120_000); // 2 dk aşımı → termal koruma
          }
          return { ...o, remainingSec: 0, status: 'hazır' as const };
        }
        return { ...o, remainingSec: o.remainingSec - 1 };
      }));
    }, 1000);

    const unsub1 = subscribe('ORDER_PLACED', (e) => {
      setOrders((prev) => [{ id: String(e.payload.orderId), item: String(e.payload.item), amount: Number(e.payload.amount), remainingSec: 120, status: 'alındı' as const }, ...prev].slice(0, 5));
    });
    const unsub2 = subscribe('DAZE_REMINDER_TRIGGERED', (e) => {
      if (e.payload.thermalGuard) setGiftEligible(true);
    });

    return () => { clearInterval(timer); unsub1(); unsub2(); };
  }, []);

  const placeDemo = () => orderPlaced(`O-${Date.now().toString().slice(-4)}`, 'Akdeniz Levrek Izgara', 240);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', background: 'linear-gradient(160deg, rgba(15,23,42,0.92), rgba(13,19,34,0.96))', border: '1px solid rgba(0,242,254,0.3)', borderRadius: '16px', padding: '16px', boxShadow: '0 0 26px rgba(0,242,254,0.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>📱 Daze Vision — Sipariş Takibi</div>
          <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>Mutfak 🍳 → Servis 👥 canlı izleme • Daze-Gift ikramı</div>
        </div>
        <button onClick={placeDemo} style={{ fontSize: '10px', padding: '6px 12px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#00f2fe,#4facfe)', color: '#0d1322', fontWeight: 800 }}>🛒 Örnek Sipariş</button>
      </div>

      {orders.length === 0 && <div style={{ fontSize: '11px', color: '#64748b', textAlign: 'center', padding: '12px' }}>Henüz sipariş yok — örnek sipariş ile 120s zinciri başlatın.</div>}

      {orders.map((o) => (
        <div key={o.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '10px 12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#e2e8f0' }}>{o.item} <span style={{ color: '#64748b', fontWeight: 400 }}>• {o.id}</span></div>
              <div style={{ fontSize: '9px', color: '#64748b', marginTop: '2px' }}>₺{o.amount} • Daze-Gift durumu: {giftEligible ? '🎁 İkram hakkı kazandı' : 'bekliyor'}</div>
            </div>
            <span style={{ fontSize: '15px', fontWeight: 900, color: o.remainingSec > 0 ? (o.remainingSec < 30 ? '#fbbf24' : '#4ade80') : '#38bdf8' }}>
              {o.remainingSec > 0 ? `${Math.floor(o.remainingSec / 60)}:${String(o.remainingSec % 60).padStart(2, '0')}` : '✓ HAZIR'}
            </span>
          </div>
          <div style={{ marginTop: '8px', display: 'flex', gap: '4px', alignItems: 'center' }}>
            <span style={{ fontSize: '8px', fontWeight: 800, padding: '3px 8px', borderRadius: '999px', color: '#f0abfc', background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.4)' }}>📱 VISION</span>
            <span style={{ fontSize: '8px', fontWeight: 800, padding: '3px 8px', borderRadius: '999px', color: '#38bdf8', background: 'rgba(56,189,248,0.12)', border: '1px solid rgba(56,189,248,0.4)' }}>🍳 CHEF</span>
            <span style={{ fontSize: '8px', fontWeight: 800, padding: '3px 8px', borderRadius: '999px', color: o.remainingSec <= 0 ? '#4ade80' : '#94a3b8', background: o.remainingSec <= 0 ? 'rgba(74,222,128,0.12)' : 'rgba(255,255,255,0.06)', border: `1px solid ${o.remainingSec <= 0 ? 'rgba(74,222,128,0.4)' : 'rgba(255,255,255,0.15)'}` }}>👥 CREW</span>
          </div>
          <div style={{ marginTop: '8px', height: '4px', borderRadius: '999px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
            <div style={{ height: '100%', borderRadius: '999px', width: `${(o.remainingSec / 120) * 100}%`, background: o.remainingSec > 30 ? 'linear-gradient(90deg,#00f2fe,#4ade80)' : 'linear-gradient(90deg,#fbbf24,#f87171)' }} />
          </div>
        </div>
      ))}
    </div>
  );
}
