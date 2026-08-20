'use client';

import React, { useEffect, useState } from 'react';
import { getNotifications, markRead, clearNotifications, unreadCount, subscribeToPush, pushNotification, type AppNotification } from '../lib/ops/notificationCenter';

// ============================================================================
// 🔔 BİLDİRİM MERKEZİ WIDGET (Adım 05) — rozet, açılır liste, push aboneliği
// ============================================================================

export default function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>(() => getNotifications());
  const [pushState, setPushState] = useState('');

  useEffect(() => {
    // Demo başlatıcı: maç/karne/milestone bildirimleri (merkez boşsa)
    if (getNotifications().length === 0) {
      pushNotification('info', 'Hoş geldin!', 'Bugünkü formun canlı izleniyor.', '👋');
      pushNotification('milestone', 'Yeni Başarı: Elit RSI', 'Elit reaktif güç seviyesine ulaştın!', '🏅');
    }
    setItems(getNotifications());
  }, []);

  const badgeColor = (k: string) => (k === 'alert' ? '#dc2626' : k === 'milestone' ? '#7c3aed' : k === 'badge' ? '#d97706' : '#0284c7');

  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((v) => !v)}
        style={{ position: 'relative', fontSize: '16px', padding: '8px 11px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#e2e8f0', cursor: 'pointer' }}
        title="Bildirim Merkezi"
      >
        🔔
        {unreadCount() > 0 && (
          <span style={{ position: 'absolute', top: -5, right: -5, fontSize: '9px', fontWeight: 900, minWidth: 16, height: 16, borderRadius: 99, background: '#ef4444', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 4px' }}>{unreadCount()}</span>
        )}
      </button>

      {open && (
        <div style={{ position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 'min(320px, 90vw)', zIndex: 50, background: '#0f172a', border: '1px solid rgba(56,189,248,0.3)', borderRadius: '14px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '8px', boxShadow: '0 8px 30px rgba(0,0,0,0.5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#fff' }}>🔔 Bildirimler ({unreadCount()})</span>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={() => { subscribeToPush().then((r) => setPushState(r.message)); }} style={{ fontSize: '8.5px', fontWeight: 800, padding: '4px 8px', borderRadius: '8px', border: '1px solid rgba(56,189,248,0.4)', background: 'transparent', color: '#38bdf8', cursor: 'pointer' }}>🔔 Push Aç</button>
              <button onClick={() => { clearNotifications(); setItems([]); }} style={{ fontSize: '8.5px', fontWeight: 800, padding: '4px 8px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.2)', background: 'transparent', color: '#94a3b8', cursor: 'pointer' }}>Temizle</button>
            </div>
          </div>
          {pushState && <div style={{ fontSize: '8.5px', fontWeight: 700, color: '#38bdf8' }}>{pushState}</div>}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', maxHeight: 260, overflowY: 'auto' }}>
            {items.map((n) => (
              <button
                key={n.id}
                onClick={() => { markRead(n.id); setItems(getNotifications()); }}
                style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', textAlign: 'left', padding: '8px', borderRadius: '10px', border: `1px solid ${n.read ? 'rgba(255,255,255,0.08)' : 'rgba(56,189,248,0.35)'}`, background: n.read ? 'rgba(255,255,255,0.02)' : 'rgba(56,189,248,0.06)', cursor: 'pointer', width: '100%' }}
              >
                <span style={{ fontSize: '18px' }}>{n.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '10px', fontWeight: 800, color: n.read ? '#94a3b8' : '#fff' }}>{n.title}</div>
                  <div style={{ fontSize: '8.5px', color: '#64748b', lineHeight: '1.4' }}>{n.detail}</div>
                  <div style={{ fontSize: '8px', color: badgeColor(n.kind), fontWeight: 700, marginTop: 2 }}>{n.at} · {n.kind.toUpperCase()}</div>
                </div>
              </button>
            ))}
            {items.length === 0 && <div style={{ fontSize: '9px', color: '#64748b', textAlign: 'center', padding: '12px' }}>Bildirim yok — her şey sakin. 🎯</div>}
          </div>
        </div>
      )}
    </div>
  );
}
