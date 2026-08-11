'use client';

import React, { useState, useEffect } from 'react';
import { Users, Calendar, Plus, Heart, Share2, MapPin, Clock, Gift, Wallet, Shield, TrendingUp } from 'lucide-react';

// ============================================================================
// LİKYA MÜŞTERİ - SOSYAL FİNANS & ETKİNLİK PAYLAŞIM MİMARİSİ
// Split-Pay (Dinamik Harcama Bölüştürme) + P2P Jest & Hediye Token
// ============================================================================

interface Community {
  id: string;
  name: string;
  description: string;
  members: number;
  category: string;
  color: string;
  isMember: boolean;
}

interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  attendees: number;
  organizer: string;
  isJoined: boolean;
  hourlyRate: number;
  durationHours: number;
  totalCost: number;
  sharePerPerson: number;
  blockedAmount: number;
}

interface Notification {
  id: string;
  text: string;
  type: 'gesture' | 'token' | 'payment' | 'system';
  time: string;
}

export default function CommunityEventsTab() {
  const [communities, setCommunities] = useState<Community[]>([
    { id: '1', name: 'Basketbol Topluluğu', description: '3x3 turnuvalar ve antrenmanlar', members: 45, category: 'Spor', color: '#f87171', isMember: true },
    { id: '2', name: 'Padel Tutkunları', description: 'Padel kortu turnuvaları ve antrenman grupları', members: 28, category: 'Spor', color: '#00f2fe', isMember: false },
    { id: '3', name: 'Karavan Yaşam Topluluğu', description: 'Karavan deneyimleri paylaşımı ve buluşmalar', members: 62, category: 'Karavan', color: '#fbbf24', isMember: false },
    { id: '4', name: 'Upcycling Atölye Grubu', description: 'Eski eşyaları yeniden değerlendirme atölyeleri', members: 19, category: 'Atölye', color: '#a78bfa', isMember: true },
  ]);

  const [events, setEvents] = useState<Event[]>([
    { id: '1', title: '3x3 Tek Pota Turnuvası', description: 'Basketbol topluluğu 3x3 turnuvası', date: '20 Ağustos', time: '10:00', location: 'Spor Kompleksi', attendees: 30, organizer: 'Basketbol Topluluğu', isJoined: true, hourlyRate: 4000, durationHours: 5, totalCost: 20000, sharePerPerson: 666.67, blockedAmount: 666.67 },
    { id: '2', title: 'Padel Mini Turnuvası', description: 'Çiftler kategorisinde mini padel turnuvası', date: '17 Ağustos', time: '10:00', location: 'Spor Kompleksi', attendees: 16, organizer: 'Padel Tutkunları', isJoined: false, hourlyRate: 3000, durationHours: 4, totalCost: 12000, sharePerPerson: 750, blockedAmount: 750 },
    { id: '3', title: 'Karavan Buluşması & Barbekü', description: 'Karavan sahipleri buluşması ve akşam barbeküsü', date: '20 Ağustos', time: '19:00', location: 'Karavan & Tiny House', attendees: 35, organizer: 'Karavan Yaşam Topluluğu', isJoined: false, hourlyRate: 2500, durationHours: 6, totalCost: 15000, sharePerPerson: 428.57, blockedAmount: 428.57 },
  ]);

  const [notifications, setNotifications] = useState<Notification[]>([
    { id: '1', text: 'Ahmet, Mehmet\'in turnuva katılım ücretini üstlendi 🏀', type: 'gesture', time: '2 dk önce' },
    { id: '2', text: 'Ayşe, Zeynep\'e 100 Jest Token gönderdi 🎁', type: 'token', time: '15 dk önce' },
    { id: '3', text: '3x3 Turnuvası için 30 kişi onaylandı, pay: 666,67 TL', type: 'payment', time: '1 saat önce' },
  ]);

  const [showCreateCommunity, setShowCreateCommunity] = useState(false);
  const [showCreateEvent, setShowCreateEvent] = useState(false);
  const [newCommunity, setNewCommunity] = useState({ name: '', description: '', category: 'Spor' });
  const [newEvent, setNewEvent] = useState({ title: '', description: '', date: '', time: '', location: '', hourlyRate: '', durationHours: '' });
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [tokenBalance, setTokenBalance] = useState(250);
  const [gestureTarget, setGestureTarget] = useState<string | null>(null);
  const [realtimeConnected, setRealtimeConnected] = useState(false);

  // Supabase Realtime aboneliği (WebSocket canlı akış)
  useEffect(() => {
    let channels: any[] = [];
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      if (supabaseUrl && supabaseAnonKey) {
        import('@supabase/supabase-js').then(({ createClient }) => {
          const supabase = createClient(supabaseUrl, supabaseAnonKey);

          // split_pay_updates: Katılımcı değişimleri canlı
          const splitPayChannel = supabase
            .channel('split_pay_updates')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'event_participants' }, (payload: any) => {
              if (payload.new) {
                const p = payload.new as any;
                setNotifications((prev) => [
                  { id: String(Date.now()), text: `Katılımcı güncellendi: pay ${p.share_amount} TL 💳`, type: 'payment', time: 'Canlı' },
                  ...prev,
                ]);
              }
            })
            .subscribe((status: string) => {
              if (status === 'SUBSCRIBED') setRealtimeConnected(true);
            });
          channels.push(splitPayChannel);

          // gesture_events: Jest duyuruları canlı
          const gestureChannel = supabase
            .channel('gesture_events')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'gesture_events' }, (payload: any) => {
              if (payload.new) {
                const g = payload.new as any;
                setNotifications((prev) => [
                  { id: String(Date.now()), text: `Bir kullanıcı bir arkadaşının payını üstlendi 🏀`, type: 'gesture', time: 'Canlı' },
                  ...prev,
                ]);
              }
            })
            .subscribe();
          channels.push(gestureChannel);

          // token_transfers: Token transferleri canlı
          const tokenChannel = supabase
            .channel('token_transfers')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'token_transfers' }, (payload: any) => {
              if (payload.new) {
                const t = payload.new as any;
                setNotifications((prev) => [
                  { id: String(Date.now()), text: `Bir kullanıcı ${t.amount} Jest Token gönderdi 🎁`, type: 'token', time: 'Canlı' },
                  ...prev,
                ]);
              }
            })
            .subscribe();
          channels.push(tokenChannel);
        }).catch(() => {});
      }
    } catch (e) {}

    return () => {
      channels.forEach((ch) => { try { ch.unsubscribe(); } catch (e) {} });
    };
  }, []);

  const toggleCommunity = (id: string) => {
    setCommunities((prev) =>
      prev.map((c) => (c.id === id ? { ...c, isMember: !c.isMember, members: c.isMember ? c.members - 1 : c.members + 1 } : c))
    );
  };

  const toggleEvent = (id: string) => {
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id !== id) return e;
        const newAttendees = e.isJoined ? e.attendees - 1 : e.attendees + 1;
        const newShare = newAttendees > 0 ? e.totalCost / newAttendees : 0;
        return { ...e, isJoined: !e.isJoined, attendees: newAttendees, sharePerPerson: newShare, blockedAmount: newShare };
      })
    );
  };

  const createCommunity = () => {
    if (!newCommunity.name.trim()) return;
    const colors = ['#f87171', '#00f2fe', '#fbbf24', '#a78bfa', '#34d399'];
    setCommunities((prev) => [
      ...prev,
      { id: String(Date.now()), name: newCommunity.name, description: newCommunity.description || 'Yeni topluluk', members: 1, category: newCommunity.category, color: colors[prev.length % colors.length], isMember: true },
    ]);
    setNewCommunity({ name: '', description: '', category: 'Spor' });
    setShowCreateCommunity(false);
  };

  const createEvent = () => {
    if (!newEvent.title.trim()) return;
    const hourlyRate = parseFloat(newEvent.hourlyRate) || 4000;
    const durationHours = parseFloat(newEvent.durationHours) || 5;
    const totalCost = hourlyRate * durationHours;
    const attendees = 1;
    setEvents((prev) => [
      ...prev,
      { id: String(Date.now()), title: newEvent.title, description: newEvent.description || 'Yeni etkinlik', date: newEvent.date || 'Yakında', time: newEvent.time || '—', location: newEvent.location || 'Kampüs', attendees, organizer: 'Ben', isJoined: true, hourlyRate, durationHours, totalCost, sharePerPerson: totalCost / attendees, blockedAmount: totalCost / attendees },
    ]);
    setNewEvent({ title: '', description: '', date: '', time: '', location: '', hourlyRate: '', durationHours: '' });
    setShowCreateEvent(false);
  };

  // P2P Jest: "Senin Payını Ben Ödedim"
  const makeGesture = (eventId: string, targetName: string) => {
    setEvents((prev) =>
      prev.map((e) => {
        if (e.id !== eventId) return e;
        // Jest yapan kişi hedefin payını üstlenir
        return { ...e, attendees: e.attendees - 1, sharePerPerson: e.attendees > 1 ? e.totalCost / (e.attendees - 1) : e.totalCost };
      })
    );
    setNotifications((prev) => [
      { id: String(Date.now()), text: `Sen, ${targetName}'in katılım ücretini üstlendin 🏀`, type: 'gesture', time: 'Şimdi' },
      ...prev,
    ]);
    setGestureTarget(null);
  };

  // Hediye Token Gönderimi
  const sendToken = (targetName: string, amount: number) => {
    if (tokenBalance < amount) return;
    setTokenBalance((prev) => prev - amount);
    setNotifications((prev) => [
      { id: String(Date.now()), text: `Sen, ${targetName}'e ${amount} Jest Token gönderdin 🎁`, type: 'token', time: 'Şimdi' },
      ...prev,
    ]);
  };

  const formatTL = (n: number) => n.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '20px', marginTop: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '20px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={20} color="#00f2fe" />
            Topluluk & Etkinlik Paylaşımı
          </h2>
          <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>Split-Pay • P2P Jest • Hediye Token</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <div style={{ background: 'rgba(167,139,250,0.1)', border: '1px solid rgba(167,139,250,0.3)', borderRadius: '10px', padding: '6px 12px', fontSize: '12px', color: '#a78bfa', fontWeight: '600' }}>
            🎁 {tokenBalance} Token
          <div style={{ background: realtimeConnected ? 'rgba(52,211,153,0.1)' : 'rgba(148,163,184,0.1)', border: `1px solid ${realtimeConnected ? 'rgba(52,211,153,0.3)' : 'rgba(148,163,184,0.3)'}`, borderRadius: '10px', padding: '6px 12px', fontSize: '12px', color: realtimeConnected ? '#34d399' : '#94a3b8', fontWeight: '600' }}>
            {realtimeConnected ? '🟢 Canlı' : '⚪ Bağlı Değil'}
          </div>
          </div>
          <button
            onClick={() => setShowCreateCommunity(!showCreateCommunity)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', border: '1px solid #00f2fe', background: 'rgba(0,242,254,0.1)', color: '#00f2fe', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
          >
            <Plus size={14} /> Topluluk
          </button>
          <button
            onClick={() => setShowCreateEvent(!showCreateEvent)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '10px', border: '1px solid #a78bfa', background: 'rgba(167,139,250,0.1)', color: '#a78bfa', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
          >
            <Calendar size={14} /> Etkinlik
          </button>
        </div>
      </div>

      {/* Create Community Form */}
      {showCreateCommunity && (
        <div style={{ marginBottom: '20px', padding: '16px', background: 'rgba(0,242,254,0.05)', border: '1px solid rgba(0,242,254,0.2)', borderRadius: '12px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#00f2fe', marginBottom: '12px' }}>➕ Yeni Topluluk Oluştur</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input type="text" placeholder="Topluluk adı" value={newCommunity.name} onChange={(e) => setNewCommunity({ ...newCommunity, name: e.target.value })} style={{ padding: '10px 12px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '13px' }} />
            <input type="text" placeholder="Açıklama" value={newCommunity.description} onChange={(e) => setNewCommunity({ ...newCommunity, description: e.target.value })} style={{ padding: '10px 12px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '13px' }} />
            <select value={newCommunity.category} onChange={(e) => setNewCommunity({ ...newCommunity, category: e.target.value })} style={{ padding: '10px 12px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '13px' }}>
              <option value="Spor">Spor</option>
              <option value="Doğa">Doğa</option>
              <option value="Karavan">Karavan</option>
              <option value="Atölye">Atölye</option>
              <option value="Müzik">Müzik</option>
              <option value="Sanat">Sanat</option>
            </select>
            <button onClick={createCommunity} style={{ padding: '10px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #0f4c81, #00f2fe)', color: '#fff', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>
              Topluluğu Oluştur
            </button>
          </div>
        </div>
      )}

      {/* Create Event Form */}
      {showCreateEvent && (
        <div style={{ marginBottom: '20px', padding: '16px', background: 'rgba(167,139,250,0.05)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: '12px' }}>
          <div style={{ fontWeight: 'bold', fontSize: '14px', color: '#a78bfa', marginBottom: '12px' }}>📅 Yeni Etkinlik Oluştur (Split-Pay)</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input type="text" placeholder="Etkinlik başlığı" value={newEvent.title} onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })} style={{ padding: '10px 12px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '13px' }} />
            <input type="text" placeholder="Açıklama" value={newEvent.description} onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })} style={{ padding: '10px 12px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '13px' }} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <input type="text" placeholder="Tarih" value={newEvent.date} onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })} style={{ flex: 1, padding: '10px 12px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '13px' }} />
              <input type="text" placeholder="Saat" value={newEvent.time} onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })} style={{ flex: 1, padding: '10px 12px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '13px' }} />
            </div>
            <input type="text" placeholder="Konum" value={newEvent.location} onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })} style={{ padding: '10px 12px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '13px' }} />
            <div style={{ display: 'flex', gap: '10px' }}>
              <input type="number" placeholder="Saatlik Ücret (₺)" value={newEvent.hourlyRate} onChange={(e) => setNewEvent({ ...newEvent, hourlyRate: e.target.value })} style={{ flex: 1, padding: '10px 12px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '13px' }} />
              <input type="number" placeholder="Süre (saat)" value={newEvent.durationHours} onChange={(e) => setNewEvent({ ...newEvent, durationHours: e.target.value })} style={{ flex: 1, padding: '10px 12px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '13px' }} />
            </div>
            <button onClick={createEvent} style={{ padding: '10px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #6d28d9, #a78bfa)', color: '#fff', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>
              Etkinliği Oluştur
            </button>
          </div>
        </div>
      )}

      {/* Social Notifications Feed */}
      <div style={{ marginBottom: '24px', padding: '16px', background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: '12px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0', marginBottom: '12px' }}>🔔 Sosyal Akış</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {notifications.map((n) => (
            <div key={n.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#cbd5e1', padding: '8px', background: 'rgba(15,23,42,0.6)', borderRadius: '8px' }}>
              <span style={{ fontSize: '16px' }}>{n.type === 'gesture' ? '🏀' : n.type === 'token' ? '🎁' : n.type === 'payment' ? '💳' : '⚙️'}</span>
              <span style={{ flex: 1 }}>{n.text}</span>
              <span style={{ fontSize: '10px', color: '#64748b' }}>{n.time}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Communities */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0', marginBottom: '12px' }}>👥 Topluluklar</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
          {communities.map((c) => (
            <div key={c.id} style={{ background: 'rgba(30,41,59,0.6)', border: `1px solid ${c.color}`, borderRadius: '12px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '14px', color: '#f1f5f9' }}>{c.name}</div>
                  <div style={{ fontSize: '11px', color: c.color, marginTop: '2px' }}>{c.category}</div>
                </div>
                <span style={{ fontSize: '11px', color: '#94a3b8' }}>{c.members} üye</span>
              </div>
              <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '12px' }}>{c.description}</div>
              <button
                onClick={() => toggleCommunity(c.id)}
                style={{ width: '100%', padding: '8px', borderRadius: '8px', border: 'none', background: c.isMember ? 'rgba(52,211,153,0.2)' : 'rgba(0,242,254,0.1)', color: c.isMember ? '#34d399' : '#00f2fe', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
              >
                {c.isMember ? '✓ Üyesiniz' : 'Katıl'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Events with Split-Pay */}
      <div>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0', marginBottom: '12px' }}>📅 Etkinlikler (Split-Pay)</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {events.map((e) => (
            <div key={e.id} style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: '12px', padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', fontSize: '14px', color: '#f1f5f9' }}>{e.title}</div>
                  <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>{e.description}</div>
                  <div style={{ display: 'flex', gap: '16px', marginTop: '8px', fontSize: '11px', color: '#94a3b8', flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Calendar size={12} /> {e.date} • {e.time}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><MapPin size={12} /> {e.location}</span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {e.durationHours} saat</span>
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>Düzenleyen: {e.organizer} • {e.attendees} katılımcı</div>

                  {/* Split-Pay Hesaplama */}
                  <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(0,242,254,0.05)', border: '1px solid rgba(0,242,254,0.15)', borderRadius: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>
                      <span>Saatlik Ücret: {formatTL(e.hourlyRate)} ₺</span>
                      <span>Süre: {e.durationHours} saat</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#94a3b8', marginBottom: '8px' }}>
                      <span>Toplam Maliyet: <strong style={{ color: '#e2e8f0' }}>{formatTL(e.totalCost)} ₺</strong></span>
                      <span>Katılımcı: {e.attendees}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '13px', color: '#00f2fe', fontWeight: '700' }}>Kişi Başı Pay: {formatTL(e.sharePerPerson)} ₺</span>
                      <span style={{ fontSize: '10px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}><Shield size={12} /> Bloke: {formatTL(e.blockedAmount)} ₺</span>
                    </div>
                  </div>

                  {/* P2P Jest Butonu */}
                  <div style={{ marginTop: '8px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => setGestureTarget(gestureTarget === e.id ? null : e.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '8px', border: '1px solid #f87171', background: 'rgba(248,113,113,0.1)', color: '#f87171', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}
                    >
                      <Heart size={12} /> Jest Yap
                    </button>
                    <button
                      onClick={() => sendToken('Arkadaş', 100)}
                      style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '6px 12px', borderRadius: '8px', border: '1px solid #a78bfa', background: 'rgba(167,139,250,0.1)', color: '#a78bfa', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}
                    >
                      <Gift size={12} /> Token Gönder
                    </button>
                    <button
                      onClick={() => toggleEvent(e.id)}
                      style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: e.isJoined ? 'rgba(52,211,153,0.2)' : 'rgba(0,242,254,0.1)', color: e.isJoined ? '#34d399' : '#00f2fe', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}
                    >
                      {e.isJoined ? '✓ Katıldınız' : 'Katıl'}
                    </button>
                  </div>

                  {/* Jest Hedef Seçimi */}
                  {gestureTarget === e.id && (
                    <div style={{ marginTop: '8px', padding: '10px', background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '8px' }}>
                      <div style={{ fontSize: '11px', color: '#f87171', marginBottom: '8px' }}>Kimin payını üstlenmek istiyorsun?</div>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {['Mehmet', 'Ayşe', 'Zeynep', 'Ali'].map((name) => (
                          <button
                            key={name}
                            onClick={() => makeGesture(e.id, name)}
                            style={{ padding: '6px 10px', borderRadius: '8px', border: '1px solid rgba(248,113,113,0.3)', background: 'rgba(248,113,113,0.1)', color: '#f87171', fontSize: '11px', cursor: 'pointer' }}
                          >
                            {name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
