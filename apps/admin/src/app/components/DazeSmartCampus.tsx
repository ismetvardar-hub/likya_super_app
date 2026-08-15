'use client';

import React, { useState } from 'react';
import { Zap, Trophy, ShieldAlert, Wrench, Globe, Send, MapPin, Bell } from 'lucide-react';

// ============================================================================
// 🏛️ LİKYA DAZE AKILLI TESİS OPERASYONLARI (Smart Campus)
// 1. Eko-Enerji & Akıllı Işık   2. Tesis İçi Şampiyonlar Ligi
// 3. Çocuk Güvenlik Radarı      4. Kestirimci Bakım Radarı
// 5. Çok Dilli VIP Concierge
// ============================================================================

type CampusTab = 'energy' | 'league' | 'safety' | 'maintenance' | 'concierge';

const TABS: { id: CampusTab; icon: string; label: string }[] = [
  { id: 'energy', icon: '⚡', label: 'Eko-Enerji' },
  { id: 'league', icon: '🎮', label: 'Şampiyonlar Ligi' },
  { id: 'safety', icon: '📡', label: 'Güvenlik Radarı' },
  { id: 'maintenance', icon: '🔧', label: 'Bakım Radarı' },
  { id: 'concierge', icon: '🌐', label: 'VIP Concierge' },
];

export default function DazeSmartCampus() {
  const [tab, setTab] = useState<CampusTab>('energy');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🏛️ Daze Akıllı Tesis Operasyonları
        </h2>
        <p style={{ fontSize: '12px', color: '#94a3b8' }}>Enerji • Eğlence • Güvenlik • Bakım • Çok Dilli Karşılama — tek akılda</p>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '20px', cursor: 'pointer',
              border: tab === t.id ? '1px solid rgba(0,242,254,0.5)' : '1px solid rgba(255,255,255,0.15)',
              background: tab === t.id ? 'rgba(0,242,254,0.1)' : 'rgba(255,255,255,0.03)',
              color: tab === t.id ? '#00f2fe' : '#94a3b8', fontSize: '11px', fontWeight: '700',
            }}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab === 'energy' && <EnergyTab />}
      {tab === 'league' && <LeagueTab />}
      {tab === 'safety' && <SafetyTab />}
      {tab === 'maintenance' && <MaintenanceTab />}
      {tab === 'concierge' && <ConciergeTab />}
    </div>
  );
}

// ============================================================================
// ⚡ 1. EKO-ENERJİ & AKILLI IŞIK (Smart Grid AI)
// Doluluk + hava durumu → eko-mod, aydınlatma & sulama zamanlaması, tasarruf
// ============================================================================
function EnergyTab() {
  const [zones, setZones] = useState({ padel: 85, restoran: 30, yoga: 10, villalar: 40 });
  const [night, setNight] = useState(true);
  const [temp, setTemp] = useState(28);

  const ECO_THRESHOLD = 40;
  const ecoZones = Object.entries(zones).filter(([, v]) => v < ECO_THRESHOLD);
  const ecoCount = ecoZones.length;

  // Enerji tasarrufu hesabı: eko bölge başına %20 ışık + %15 iklimlendirme
  const energyBaseline = 100;
  const ecoSavings = ecoZones.reduce((s, [name, v]) => {
    const factor = 1 - v / 100; // boşluk oranı
    return s + factor * (night ? 0.2 : 0.1);
  }, 0);
  const savingsPct = Math.round(ecoSavings * 100);
  const waterSavings = Math.round((night ? 6 : 2) + ecoZones.length * 1.5); // % su tasarrufu

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', minWidth: '150px', padding: '14px', borderRadius: '16px', background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.25)', textAlign: 'center' }}>
          <div style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Elektrik Tasarrufu</div>
          <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#4ade80' }}>~%{savingsPct}</div>
        </div>
        <div style={{ flex: '1', minWidth: '150px', padding: '14px', borderRadius: '16px', background: 'rgba(0,242,254,0.05)', border: '1px solid rgba(0,242,254,0.25)', textAlign: 'center' }}>
          <div style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Su Tasarrufu</div>
          <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#00f2fe' }}>~%{waterSavings}</div>
        </div>
        <div style={{ flex: '1', minWidth: '150px', padding: '14px', borderRadius: '16px', background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.25)', textAlign: 'center' }}>
          <div style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Eko Modda</div>
          <div style={{ fontSize: '26px', fontWeight: 'bold', color: '#f59e0b' }}>{ecoCount}/4</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button onClick={() => setNight(!night)} style={{ padding: '8px 14px', borderRadius: '16px', cursor: 'pointer', border: '1px solid rgba(167,139,250,0.4)', background: night ? 'rgba(167,139,250,0.15)' : 'rgba(255,255,255,0.04)', color: night ? '#a78bfa' : '#64748b', fontSize: '10px', fontWeight: '700' }}>
          {night ? '🌙 Gece (gün batımı)' : '☀️ Gündüz'}
        </button>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', color: '#94a3b8' }}>
          🌡️ Sıcaklık:
          <input type="range" min={15} max={40} value={temp} onChange={(e) => setTemp(Number(e.target.value))} style={{ width: '120px', cursor: 'pointer', accentColor: '#f59e0b' }} />
          {temp}°C
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
        {(Object.entries(zones) as [string, number][]).map(([name, val]) => {
          const eco = val < ECO_THRESHOLD;
          return (
            <div key={name} style={{ padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${eco ? 'rgba(52,211,153,0.4)' : 'rgba(255,255,255,0.08)'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#fff', textTransform: 'capitalize' }}>{name}</span>
                <span style={{ fontSize: '9px', fontWeight: '700', padding: '3px 8px', borderRadius: '8px', background: eco ? 'rgba(52,211,153,0.12)' : 'rgba(255,255,255,0.04)', color: eco ? '#4ade80' : '#64748b' }}>
                  {eco ? '🌱 EKO MOD' : 'Normal'}
                </span>
              </div>
              <input type="range" min={0} max={100} value={val} onChange={(e) => setZones((prev) => ({ ...prev, [name]: Number(e.target.value) }))} style={{ width: '100%', cursor: 'pointer', accentColor: eco ? '#4ade80' : '#f59e0b', height: '4px' }} />
              <div style={{ fontSize: '9px', color: '#64748b', marginTop: '4px' }}>Doluluk: %{val}</div>
              {eco && <div style={{ fontSize: '8px', color: '#4ade80', marginTop: '2px' }}>💡 Işık %20 • ❄️ Klima %15 düşürüldü</div>}
            </div>
          );
        })}
      </div>

      <div style={{ fontSize: '9px', color: '#94a3b8', padding: '10px', borderRadius: '10px', background: 'rgba(0,242,254,0.04)', border: '1px solid rgba(0,242,254,0.15)' }}>
        🌅 Sulama zamanlaması: {night ? 'Gece 23:00-04:00 (buharlaşma en düşük — su tasarrufu maksimum)' : 'Öneri: gün batımı sonrası 19:30 sulama (buharlaşma %35 azalır)'}
        {' • '}Aydınlatma: {night ? `doluluk < %${ECO_THRESHOLD} → %20 eko ışık` : 'gündüz ışık gerekmez, sensörler aktif'} • Sıcaklık {temp}°C
      </div>
    </div>
  );
}


// ============================================================================
// 🎮 2. TESİS İÇİ ŞAMPİYONLAR LİGİ (Daze Vision — XP + Borsa Token)
// ============================================================================
function LeagueTab() {
  const [league] = useState([
    { ad: 'Kuzey', icon: '🎾', xp: 2450, aktivite: 'Padel 4 seans', token: 18.5 },
    { ad: 'Elif', icon: '🏊', xp: 2320, aktivite: 'Yüzme + fitness', token: 22.1 },
    { ad: 'Deniz', icon: '🏃', xp: 1980, aktivite: 'Koşu + antrenman', token: 15.8 },
    { ad: 'Aylin', icon: '🧘', xp: 1450, aktivite: 'Yoga + pilates', token: 12.4 },
  ]);
  const [giftLog, setGiftLog] = useState('');

  const convertToGift = (ad: string, token: number) => {
    const meal = Math.round(token * 12);
    setGiftLog(`🎁 ${ad} — ${token} token → 🍜 Daze Chef'te ${meal} TL değerinde ücretsiz ikram!`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ fontSize: '12px', fontWeight: '700', color: '#f59e0b' }}>🏆 Haftalık Tesis İçi Şampiyonlar Ligi</div>
        <span style={{ fontSize: '9px', color: '#64748b' }}>Likya XP + Dinamik Borsa Tokenları • Daze Vision canlı skor tahtası</span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {league.map((p, i) => (
          <div key={p.ad} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', borderRadius: '12px', background: i === 0 ? 'rgba(245,158,11,0.08)' : 'rgba(255,255,255,0.02)', border: `1px solid ${i === 0 ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.08)'}` }}>
            <span style={{ fontSize: '16px', fontWeight: 'bold', color: i === 0 ? '#f59e0b' : '#64748b', minWidth: '24px' }}>{['🥇', '🥈', '🥉', '4.'][i]}</span>
            <span style={{ fontSize: '18px' }}>{p.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#fff' }}>{p.ad}</div>
              <div style={{ fontSize: '9px', color: '#64748b' }}>{p.aktivite}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#f59e0b' }}>{p.xp.toLocaleString('tr-TR')} XP</div>
              <div style={{ fontSize: '9px', color: '#00f2fe' }}>📈 {p.token.toFixed(1)} token</div>
            </div>
            <button onClick={() => convertToGift(p.ad, p.token)} style={{ padding: '7px 12px', borderRadius: '16px', cursor: 'pointer', border: '1px solid rgba(74,222,128,0.5)', background: 'rgba(74,222,128,0.1)', color: '#4ade80', fontSize: '9px', fontWeight: '700' }}>
              🎁 İkrama Çevir
            </button>
          </div>
        ))}
      </div>
      {giftLog && <div style={{ fontSize: '10px', color: '#4ade80', padding: '10px', borderRadius: '10px', background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.2)' }}>{giftLog}</div>}
    </div>
  );
}


// ============================================================================
// 📡 3. ÇOCUK GÜVENLİK RADARI (Geofencing & Kayıp Kalkanı)
// ============================================================================
function SafetyTab() {
  const [zone, setZone] = useState<'park' | 'yuzme' | 'dolu' | 'otopark' | 'dis'>('dolu');
  const [alerts, setAlerts] = useState<string[]>(['[09:12] Kuzey bilekliği tesis içinde (Yoga bahçesi) — güvende']);

  const ZONE_INFO: Record<'park' | 'yuzme' | 'dolu' | 'otopark' | 'dis', { label: string; danger: boolean; color: string }> = {
    park: { label: '🎾 Padel Kortu (güvenli)', danger: false, color: '#4ade80' },
    yuzme: { label: '🏊 Havuz DERİN ALAN', danger: true, color: '#f87171' },
    dolu: { label: '🎾 Tesis içi (güvenli)', danger: false, color: '#4ade80' },
    otopark: { label: '🚗 OTOPARK (riskli)', danger: true, color: '#f87171' },
    dis: { label: '⚠️ TESİS DIŞI SINIR', danger: true, color: '#f87171' },
  };

  const checkZone = (z: keyof typeof ZONE_INFO) => {
    setZone(z);
    const info = ZONE_INFO[z];
    const time = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    if (info.danger) {
      setAlerts((prev) => [`[${time}] 🚨 Kuzey ${info.label} bölgesine yaklaştı → Veli telefonuna + Daze Crew görevlisine titreşimli uyarı gönderildi!`, ...prev].slice(0, 6));
    } else {
      setAlerts((prev) => [`[${time}] ✅ Kuzey ${info.label} — güvende`, ...prev].slice(0, 6));
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ fontSize: '12px', fontWeight: '700', color: '#f87171', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <ShieldAlert size={14} /> Çocuk Güvenlik Radarı — BLE/NFC Bileklik Geofencing
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ flex: '1', minWidth: '200px', padding: '12px', borderRadius: '16px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(248,113,113,0.2)' }}>
          <div style={{ fontSize: '9px', color: '#64748b', marginBottom: '8px' }}>🗺️ Tesis Haritası (30-35 dönüm)</div>
          {(['dolu', 'park', 'yuzme', 'otopark', 'dis'] as const).map((z) => (
            <button key={z} onClick={() => checkZone(z)} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 10px', borderRadius: '10px', cursor: 'pointer', marginBottom: '4px', border: zone === z ? `1px solid ${ZONE_INFO[z].color}` : '1px solid rgba(255,255,255,0.1)', background: zone === z ? `${ZONE_INFO[z].color}15` : 'rgba(255,255,255,0.02)', color: zone === z ? ZONE_INFO[z].color : '#94a3b8', fontSize: '10px', fontWeight: '600' }}>
              {ZONE_INFO[z].label}
              {zone === z && ' ◉'}
            </button>
          ))}
          <div style={{ fontSize: '9px', color: '#00f2fe', marginTop: '6px' }}>⌚ Kuzey bilekliği: {ZONE_INFO[zone].label}</div>
        </div>

        <div style={{ flex: '1', minWidth: '220px', padding: '12px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '9px', color: '#64748b', marginBottom: '8px' }}>📲 Veli & Daze Crew Uyarı Akışı</div>
          {alerts.map((a, i) => (
            <div key={i} style={{ fontSize: '9px', color: a.includes('🚨') ? '#f87171' : '#4ade80', lineHeight: '1.6', fontFamily: 'monospace' }}>{a}</div>
          ))}
          <div style={{ fontSize: '8px', color: '#475569', marginTop: '8px' }}>🔔 Bileklik: hafif titreşim • Veli: anlık bildirim • En yakın görevli: konum uyarısı</div>
        </div>
      </div>
    </div>
  );
}


// ============================================================================
// 🔧 4. KESTİRİMCİ DONANIM BAKIM RADARI (Predictive IoT Health)
// ============================================================================
function MaintenanceTab() {
  const [equip, setEquip] = useState([
    { id: 't2', ad: 'Kort 2 Turnikesi', icon: '🚪', saglik: 62, durum: '⚠️ Yağlama gerekli (48s)' },
    { id: 'k1', ad: 'Kort 1 Işık Sistemi', icon: '💡', saglik: 88, durum: '✅ Sağlıklı' },
    { id: 'ss', ad: 'Sunset Bar Ses', icon: '🔊', saglik: 74, durum: '🟡 Hoparlör sinyali zayıf' },
    { id: 'sm', ad: 'Sulama Su Motoru', icon: '💧', saglik: 93, durum: '✅ Sağlıklı' },
    { id: 'kp', ad: 'Havuz Sirkülasyon', icon: '🌊', saglik: 55, durum: '🚨 Akım dalgalanması (24s bakım)' },
  ]);

  const degrade = (id: string) => {
    setEquip((prev) => prev.map((e) => (e.id === id ? { ...e, saglik: Math.max(20, e.saglik - 9), durum: e.saglik - 9 < 40 ? '🚨 Arıza yaklaşıyor (bakım iş emri açıldı)' : '🟡 Bakım öneriliyor' } : e)));
  };

  const workOrder = (e: typeof equip[0]) => `${e.icon} Daze Crew iş emri açıldı: "${e.ad}" ${e.durum}. Teknisyen 2 saat içinde atandı.`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div style={{ fontSize: '12px', fontWeight: '700', color: '#a78bfa' }}>🔧 Kestirimci Donanım Bakım Radarı</div>
        <span style={{ fontSize: '9px', color: '#64748b' }}>Turnike • Işık • Ses • Motor — arızalanmadan önce bakım (sıfır duruş)</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
        {equip.map((e) => {
          const risk = e.saglik < 60 ? '#f87171' : e.saglik < 85 ? '#fbbf24' : '#4ade80';
          return (
            <div key={e.id} style={{ padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${risk}40` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#fff' }}>{e.icon} {e.ad}</span>
                <span style={{ fontSize: '10px', fontWeight: 'bold', color: risk }}>%{e.saglik}</span>
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden', marginBottom: '6px' }}>
                <div style={{ width: `${e.saglik}%`, height: '100%', background: risk, borderRadius: '4px', transition: 'width 0.4s' }} />
              </div>
              <div style={{ fontSize: '9px', color: risk, marginBottom: '6px' }}>{e.durum}</div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={() => degrade(e.id)} style={{ padding: '6px 10px', borderRadius: '10px', cursor: 'pointer', border: '1px solid rgba(248,113,113,0.4)', background: 'rgba(248,113,113,0.08)', color: '#f87171', fontSize: '8px', fontWeight: '700' }}>
                  ⚡ Aşınma Simüle Et
                </button>
                <button onClick={() => alert(workOrder(e))} style={{ padding: '6px 10px', borderRadius: '10px', cursor: 'pointer', border: '1px solid rgba(0,242,254,0.4)', background: 'rgba(0,242,254,0.08)', color: '#00f2fe', fontSize: '8px', fontWeight: '700' }}>
                  🔧 İş Emri Aç
                </button>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ fontSize: '9px', color: '#94a3b8', padding: '10px', borderRadius: '10px', background: 'rgba(0,242,254,0.04)' }}>
        📊 IoT telemetri: milisaniyelik geçiş gecikmesi + akım dalgalanması izlenir; eşik aşıldığında Daze Crew ekranına kestirimci iş emri düşer — arıza olmadan bakım.
      </div>
    </div>
  );
}


// ============================================================================
// 🌐 5. ÇOK DİLLİ AI VIP CONCIERGE (Multimodal Ajan)
// ============================================================================
function ConciergeTab() {
  const LANGS: Record<string, { label: string; hi: string; reply: (q: string) => string }> = {
    TR: {
      label: '🇹🇷 Türkçe', hi: 'Merhaba! Size nasıl yardımcı olabilirim?',
      reply: () => `Efendim, canlı tesis durumu:\n🍜 Daze Chef menüsü: Akdeniz levrek, odun ateşinde pizza\n🎾 Padel doluluk: %85 (1 saat sonra boşluk)\n🎧 Likya Müzik DJ: Akdeniz Lounge 92 BPM akıyor\n🎫 VIP öneri: Sunset Bar kokteyl saati 19:30'da!`,
    },
    EN: {
      label: '🇬🇧 English', hi: 'Hello! How can I assist you?',
      reply: () => `Certainly, here is the live venue status:\n🍜 Daze Chef menu: Mediterranean sea bass, wood-fired pizza\n🎾 Padel courts: 85% occupied (slot in 1 hour)\n🎧 Likya Music DJ: Mediterranean Lounge at 92 BPM\n🎫 VIP tip: Sunset Bar cocktail hour starts at 7:30 PM!`,
    },
    RU: {
      label: '🇷🇺 Русский', hi: 'Здравствуйте! Чем могу помочь?',
      reply: () => `Конечно, текущий статус:\n🍜 Меню Daze Chef: средиземноморский сибас, пицца на дровах\n🎾 Падель-корты: 85% занято (освободится через час)\n🎧 Музыка DJ: Mediterranean Lounge 92 BPM\n🎫 VIP: коктейльный час в Sunset Bar в 19:30!`,
    },
    DE: {
      label: '🇩🇪 Deutsch', hi: 'Hallo! Wie kann ich helfen?',
      reply: () => `Gerne, hier der aktuelle Status:\n🍜 Daze Chef Menü: Mittelmeer-Seebarsch, Holzofenpizza\n🎾 Padel-Plätze: 85% belegt (frei in 1 Std)\n🎧 Musik-DJ: Mediterranean Lounge mit 92 BPM\n🎫 VIP-Tipp: Cocktail-Stunde im Sunset Bar um 19:30!`,
    },
    AR: {
      label: '🇸🇦 العربية', hi: 'مرحباً! كيف يمكنني مساعدتك؟',
      reply: () => `بالطبع، حالة المنشأة الحالية:\n🍜 قائمة Daze Chef: قاروص متوسطي، بيتزا بالحطب\n🎾 ملاعب البادل: 85% مشغولة (متاح خلال ساعة)\n🎧 موسيقى DJ: Mediterranean Lounge 92 BPM\n🎫 نصيحة VIP: ساعة الكوكتيل في Sunset Bar الساعة 19:30!`,
    },
  };

  const [lang, setLang] = useState<keyof typeof LANGS>('EN');
  const [q, setQ] = useState('');
  const [chat, setChat] = useState<{ u: string; a: string }[]>([]);

  const send = () => {
    if (!q.trim()) return;
    setChat((prev) => [{ u: q, a: LANGS[lang].reply(q) }, ...prev].slice(0, 6));
    setQ('');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ fontSize: '12px', fontWeight: '700', color: '#34d399', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <Globe size={14} /> Çok Dilli AI VIP Concierge — {LANGS[lang].hi}
      </div>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
        {(Object.keys(LANGS) as (keyof typeof LANGS)[]).map((l) => (
          <button key={l} onClick={() => setLang(l)} style={{ padding: '7px 12px', borderRadius: '16px', cursor: 'pointer', border: lang === l ? '1px solid rgba(52,211,153,0.5)' : '1px solid rgba(255,255,255,0.15)', background: lang === l ? 'rgba(52,211,153,0.1)' : 'transparent', color: lang === l ? '#34d399' : '#64748b', fontSize: '10px', fontWeight: '700' }}>
            {LANGS[l].label}
          </button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') send(); }} placeholder={lang === 'TR' ? 'Canlı menü ve kort durumunu sorun...' : 'Ask about live menu and court status...'} style={{ flex: 1, padding: '10px 14px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(52,211,153,0.3)', color: '#e2e8f0', fontSize: '12px', outline: 'none' }} />
        <button onClick={send} style={{ padding: '10px 16px', borderRadius: '12px', cursor: 'pointer', border: 'none', background: 'linear-gradient(135deg, #34d399, #00f2fe)', color: '#0d1322', fontSize: '12px', fontWeight: '700' }}>
          <Send size={13} style={{ display: 'inline', marginRight: 4 }} /> Gönder
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {chat.map((c, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ alignSelf: 'flex-end', padding: '8px 12px', borderRadius: '12px', background: 'rgba(0,242,254,0.1)', color: '#e2e8f0', fontSize: '10px', maxWidth: '80%' }}>🧑 {c.u}</div>
            <div style={{ alignSelf: 'flex-start', whiteSpace: 'pre-wrap', padding: '8px 12px', borderRadius: '12px', background: 'rgba(52,211,153,0.1)', color: '#cbd5e1', fontSize: '10px', maxWidth: '85%' }}>🤖 {c.a}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

