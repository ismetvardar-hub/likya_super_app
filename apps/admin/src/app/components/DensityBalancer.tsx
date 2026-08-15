'use client';

import React, { useState, useEffect } from 'react';
import { Scale, Brain, Zap, Activity, Users, Megaphone, Sparkles, TrendingUp, TrendingDown } from 'lucide-react';

// ============================================================================
// ⚖️ LİKYA YOĞUNLUK DENGELEME & HOMOJEN DAĞILIM MOTORU
// Otonom karar motoru — 5 tamamlayıcı strateji:
//   1. Dinamik Fiyat / Flash İkram   (tenha bölgeyi canlandır)
//   2. Akustik Çekim / BPM Köprüsü   (müzikle doğal yönlendirme)
//   3. Pop-Up Etkinlik                (atıl alanları tetikle)
//   4. Personel Rotasyonu             (servis yükünü dengele)
//   5. Sessiz Vaha Rotası             (sessizlik arayanı tenha bölgeye çek)
// Her karar zaman damgalı kayıt altına alınır (denetlenebilir).
// ============================================================================

interface BalanceZone {
  id: string;
  name: string;
  icon: string;
  density: number; // 0-100 doluluk
  staff: number;   // aktif personel
  color: string;
  bpm: number;     // anlık müzik temposu
}

const BALANCE_ZONES: BalanceZone[] = [
  { id: 'yoga', name: 'Yoga & Spa', icon: '🧘', density: 15, staff: 1, color: '#34d399', bpm: 60 },
  { id: 'pool', name: 'Ana Havuz & Sunset Bar', icon: '🏊', density: 85, staff: 4, color: '#f59e0b', bpm: 122 },
  { id: 'restaurant', name: 'Gurme Restoran', icon: '🍽️', density: 35, staff: 3, color: '#ecc94b', bpm: 84 },
  { id: 'villas', name: 'Villalar Bahçesi', icon: '🏡', density: 20, staff: 1, color: '#a78bfa', bpm: 68 },
  { id: 'padel', name: 'Padel & Spor', icon: '🎾', density: 60, staff: 2, color: '#f87171', bpm: 130 },
];

type StrategyKey = 'pricing' | 'acoustic' | 'popup' | 'staff' | 'routing';

const STRATEGY_META: Record<StrategyKey, { label: string; icon: string; color: string; goal: string }> = {
  pricing: { label: 'Dinamik Fiyat / Flash İkram', icon: '🏷️', color: '#34d399', goal: 'Doğrudan Satış Artışı' },
  acoustic: { label: 'Akustik Çekim (BPM Köprüsü)', icon: '🎷', color: '#00f2fe', goal: 'Dolaylı Tüketim' },
  popup: { label: 'Pop-Up Etkinlik', icon: '🎪', color: '#f59e0b', goal: 'Hızlı Tüketim Patlaması' },
  staff: { label: 'Personel Rotasyonu', icon: '👥', color: '#a78bfa', goal: 'Kayıp Satışları Önleme' },
  routing: { label: 'Sessiz Vaha Rotası', icon: '🧭', color: '#48bb78', goal: 'Misafir Memnuniyeti' },
};

interface BalancingAction {
  id: string;
  zoneId: string;
  strategy: StrategyKey;
  title: string;
  notification: string;
  impact: string;
  priority: 'high' | 'medium' | 'low';
  time: string;
  auto: boolean;
}

const nowTime = () => new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
const uid = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

// Doluluk durumu etiketi
const densityStatus = (d: number): { label: string; color: string } =>
  d < 30
    ? { label: 'Tenha', color: '#00f2fe' }
    : d > 75
      ? { label: 'Yoğun', color: '#f87171' }
      : { label: 'Dengeli', color: '#4ade80' };
export default function DensityBalancer() {
  const [zones, setZones] = useState<BalanceZone[]>(BALANCE_ZONES);
  const [autoMode, setAutoMode] = useState(true);
  const [activeStrategies, setActiveStrategies] = useState<Record<StrategyKey, boolean>>({
    pricing: true,
    acoustic: true,
    popup: true,
    staff: true,
    routing: true,
  });
  const [actions, setActions] = useState<BalancingAction[]>([]);
  const [scans, setScans] = useState(0);
  const [notifyStatus, setNotifyStatus] = useState('');

  // 📲 VIP Bildirim — kritik kararları Patron'a Telegram/Discord üzerinden ilet
  const sendVipNotify = async (message: string) => {
    try {
      const res = await fetch('/api/v1/ceo/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });
      const data = await res.json();
      setNotifyStatus(data.message || (data.success ? '✅ İletildi' : '⚠️ Kanal yapılandırılmadı'));
    } catch {
      setNotifyStatus('⚠️ Bildirim servisine ulaşılamadı');
    }
  };

  // ⚖️ KURAL MOTORU — her bölgeyi strateji setine göre değerlendirir
  const evaluate = (zonesNow: BalanceZone[]): BalancingAction[] => {
    const found: BalancingAction[] = [];
    const t = nowTime();
    zonesNow.forEach((zone) => {
      const low = zone.density < 30;
      const high = zone.density > 75;

      if (low) {
        // 🏷️ 1. Dinamik Fiyat / Flash İkram — tenha bölgeyi canlandır
        if (activeStrategies.pricing) {
          found.push({
            id: uid(), zoneId: zone.id, strategy: 'pricing', priority: 'high', time: t, auto: true,
            title: `${zone.icon} "${zone.name}" için Flash Happy Hour başlat (%30, 20 dk)`,
            notification: `${zone.icon} ${zone.name} gün batımına özel Likya Kokteyli — 20 dakika boyunca %30 avantajlı! Yerinizi ayırtın.`,
            impact: 'Doğrudan satış artışı',
          });
        }
        // 🎷 2. Akustik Çekim — sakin bölgede BPM'i kademeli yükselt
        if (activeStrategies.acoustic) {
          found.push({
            id: uid(), zoneId: zone.id, strategy: 'acoustic', priority: 'medium', time: t, auto: true,
            title: `${zone.icon} "${zone.name}" BPM'i yükselt (${zone.bpm}→${Math.min(zone.bpm + 30, 130)})`,
            notification: `${zone.icon} Canlı Akdeniz gitarı & saksafon solosu başlıyor — merakla gelin!`,
            impact: 'Dolaylı tüketim',
          });
        }
        // 🎪 3. Pop-Up Etkinlik — atıl alanı tetikle
        if (activeStrategies.popup) {
          found.push({
            id: uid(), zoneId: zone.id, strategy: 'popup', priority: 'medium', time: t, auto: true,
            title: `${zone.icon} "${zone.name}" yanında mini şov / ödüllü servis yarışması planla`,
            notification: `${zone.icon} 10 dakika sonra ${zone.name} yanında ödüllü mini şov!`,
            impact: 'Hızlı tüketim patlaması',
          });
        }
        // 🧭 5. Sessiz Vaha — sessizlik arayana bu bölgeyi öner (tenha = huzurlu)
        if (activeStrategies.routing) {
          found.push({
            id: uid(), zoneId: zone.id, strategy: 'routing', priority: 'low', time: t, auto: true,
            title: `${zone.icon} "${zone.name}" Sessiz Vaha rotası olarak öner`,
            notification: `${zone.icon} ${zone.name} şu an tam bir huzur sessizliğinde — kahvenizi orada yudumlamak ister misiniz?`,
            impact: 'Misafir memnuniyeti',
          });
        }
      } else if (high) {
        // 🎷 2b. Aşırı kalabalıkta müziği dinlendirici moda al (doğal dağılım)
        if (activeStrategies.acoustic) {
          found.push({
            id: uid(), zoneId: zone.id, strategy: 'acoustic', priority: 'high', time: t, auto: true,
            title: `${zone.icon} "${zone.name}" müziğini dinlendirici moda al (${zone.bpm}→${Math.max(zone.bpm - 25, 70)})`,
            notification: `${zone.icon} ${zone.name} şu an dolu — misafirler tenha bölgelere doğal olarak yönlendiriliyor.`,
            impact: 'Dolaylı tüketim / rahatlama',
          });
        }
        // 👥 4. Personel Rotasyonu — yükü dengeli bölgelere aktar
        if (activeStrategies.staff) {
          found.push({
            id: uid(), zoneId: zone.id, strategy: 'staff', priority: 'high', time: t, auto: true,
            title: `${zone.icon} "${zone.name}" personelini tenha bölgelere yönlendir`,
            notification: `👥 Daze Crew: ${zone.name}'dan 1 servis personeli canlanan bölgeye geçiyor.`,
            impact: 'Kayıp satışları önleme',
          });
        }
      } else {
        // 🧭 Dengeli bölge — sessizlik arayana tenha alternatif sun (kalabalık yok)
        if (activeStrategies.routing && zone.density < 55) {
          found.push({
            id: uid(), zoneId: zone.id, strategy: 'routing', priority: 'low', time: t, auto: true,
            title: `${zone.icon} "${zone.name}" huzur rotası olarak izleniyor`,
            notification: `${zone.icon} ${zone.name} sakin bir atmosferde — dinlenmek isteyenler için ideal.`,
            impact: 'Misafir memnuniyeti',
          });
        }
      }
    });
    return found;
  };

  // 🧠 Otonom tarama: auto mod açıkken her 6 sn'de kural motoru çalışır
  useEffect(() => {
    if (!autoMode) return;
    const scan = () => {
      const fresh = evaluate(zones);
      setActions((prev) => [...fresh, ...prev].slice(0, 20));
      setScans((s) => s + 1);
    };
    scan();
    const interval = setInterval(scan, 6000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoMode, activeStrategies, zones]);

  // ⚖️ Homojenlik puanı (0-100): doluluk dağılımının dengeliliği
  const densities = zones.map((z) => z.density);
  const avg = densities.reduce((a, b) => a + b, 0) / densities.length;
  const variance = densities.reduce((a, b) => a + (b - avg) ** 2, 0) / densities.length;
  const homogeneity = Math.max(0, Math.min(100, Math.round(100 - Math.sqrt(variance) * 1.6)));
  const lowCount = zones.filter((z) => z.density < 30).length;
  const highCount = zones.filter((z) => z.density > 75).length;
  const activeActionCount = actions.filter((a) => a.priority === 'high').length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            ⚖️ Yoğunluk Dengeleme & Homojen Dağılım Motoru
          </h2>
          <p style={{ fontSize: '12px', color: '#94a3b8' }}>Otonom karar motoru — tenha alanları canlandır, yoğun alanları doğal yolla dağıt</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '10px', color: '#64748b' }}>Tarama: {scans}</span>
          <button
            onClick={() => setAutoMode(!autoMode)}
            style={{
              padding: '8px 16px', borderRadius: '20px', cursor: 'pointer',
              border: autoMode ? '1px solid rgba(52,211,153,0.5)' : '1px solid rgba(255,255,255,0.2)',
              background: autoMode ? 'rgba(52,211,153,0.12)' : 'rgba(255,255,255,0.04)',
              color: autoMode ? '#4ade80' : '#94a3b8', fontSize: '11px', fontWeight: '700',
            }}
          >
            <Brain size={13} style={{ display: 'inline', marginRight: 4 }} />
            {autoMode ? '🧠 Otonom Mod AKTİF' : '⏸ Otonom Mod Kapalı'}
          </button>
        </div>
      </div>

      {/* KPI paneli */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
        <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(0,242,254,0.05)', border: '1px solid rgba(0,242,254,0.2)' }}>
          <div style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Homojenlik Puanı</div>
          <div style={{ fontSize: '22px', fontWeight: 'bold', color: homogeneity > 70 ? '#4ade80' : homogeneity > 45 ? '#fbbf24' : '#f87171' }}>%{homogeneity}</div>
          <div style={{ height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', marginTop: '6px', overflow: 'hidden' }}>
            <div style={{ width: `${homogeneity}%`, height: '100%', background: `linear-gradient(90deg, ${homogeneity > 70 ? '#4ade80' : homogeneity > 45 ? '#fbbf24' : '#f87171'}, #00f2fe)`, borderRadius: '4px', transition: 'width 0.6s ease' }} />
          </div>
        </div>
        <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(0,242,254,0.05)', border: '1px solid rgba(0,242,254,0.2)' }}>
          <div style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Tenha Bölge</div>
          <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#00f2fe' }}>{lowCount}</div>
          <div style={{ fontSize: '9px', color: '#64748b', marginTop: '4px' }}>Canlandırma hedefi</div>
        </div>
        <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.2)' }}>
          <div style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Yoğun Bölge</div>
          <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#f87171' }}>{highCount}</div>
          <div style={{ fontSize: '9px', color: '#64748b', marginTop: '4px' }}>Dağılım hedefi</div>
        </div>
        <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(167,139,250,0.05)', border: '1px solid rgba(167,139,250,0.2)' }}>
          <div style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Aktif Yüksek Öncelikli Karar</div>
          <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#a78bfa' }}>{activeActionCount}</div>
          <div style={{ fontSize: '9px', color: '#64748b', marginTop: '4px' }}>Motorun otonom hamlesi</div>
        </div>
      </div>

      {/* Strateji seçiciler — hangi stratejilerin otonom çalışacağı */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {(Object.keys(STRATEGY_META) as StrategyKey[]).map((key) => {
          const meta = STRATEGY_META[key];
          const active = activeStrategies[key];
          return (
            <button
              key={key}
              onClick={() => setActiveStrategies((prev) => ({ ...prev, [key]: !prev[key] }))}
              title={meta.goal}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 12px', borderRadius: '20px', cursor: 'pointer',
                border: active ? `1px solid ${meta.color}55` : '1px solid rgba(255,255,255,0.12)',
                background: active ? `${meta.color}12` : 'rgba(255,255,255,0.02)',
                color: active ? meta.color : '#64748b', fontSize: '10px', fontWeight: '700',
                opacity: active ? 1 : 0.5,
              }}
            >
              {meta.icon} {meta.label}
              <span style={{ fontSize: '8px', opacity: 0.7 }}>• {meta.goal}</span>
            </button>
          );
        })}
      </div>

      {/* 📲 VIP Bildirim Hattı — Telegram / Discord */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
        padding: '12px 14px', borderRadius: '14px',
        background: 'linear-gradient(135deg, rgba(0,136,204,0.08), rgba(88,101,242,0.06))',
        border: '1px solid rgba(0,136,204,0.3)',
      }}>
        <span style={{ fontSize: '20px' }}>📲</span>
        <div style={{ flex: 1, minWidth: '200px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#fff' }}>Otonom Patron Bildirimleri (VIP Hattı)</div>
          <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '2px' }}>
            Kritik arıza, ciro rekoru, hibe hatırlatması → Telegram Bot / Discord Webhook ile anında telefonunuza
          </div>
        </div>
        <button
          onClick={() => void sendVipNotify('🧪 *Likya VIP Hattı Testi* — Bağlantı başarılı. Patron, emrinizdeyim! 🎩')}
          style={{
            padding: '8px 14px', borderRadius: '16px', cursor: 'pointer',
            border: '1px solid rgba(0,136,204,0.5)', background: 'rgba(0,136,204,0.1)',
            color: '#00a8e8', fontSize: '10px', fontWeight: '700',
          }}
        >
          📨 Test Bildirimi Gönder
        </button>
        {notifyStatus && (
          <span style={{ fontSize: '9px', color: notifyStatus.startsWith('✅') || notifyStatus.startsWith('📲') ? '#4ade80' : '#fbbf24', flexBasis: '100%' }}>
            {notifyStatus}
          </span>
        )}
      </div>

      {/* Bölge kartları */}
      {/* Bölge kartları */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px, 1fr))', gap: '10px' }}>
        {zones.map((zone) => {
          const st = densityStatus(zone.density);
          return (
            <div key={zone.id} style={{
              padding: '12px', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '8px',
              background: `${zone.color}08`, border: `1px solid ${st.label === 'Yoğun' ? 'rgba(248,113,113,0.35)' : st.label === 'Tenha' ? 'rgba(0,242,254,0.35)' : 'rgba(255,255,255,0.08)'}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '16px' }}>{zone.icon}</span>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#fff' }}>{zone.name}</span>
                </div>
                <span style={{ fontSize: '9px', fontWeight: '700', padding: '3px 8px', borderRadius: '8px', background: `${st.color}15`, color: st.color }}>
                  {st.label}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '9px', color: '#64748b' }}>Doluluk</span>
                <input
                  type="range" min={0} max={100} value={zone.density}
                  onChange={(e) => setZones((prev) => prev.map((z) => (z.id === zone.id ? { ...z, density: Number(e.target.value) } : z)))}
                  style={{ flex: 1, cursor: 'pointer', accentColor: zone.color, height: '4px' }}
                />
                <span style={{ fontSize: '11px', fontWeight: '700', color: st.color, minWidth: '30px', textAlign: 'right' }}>%{zone.density}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#64748b' }}>
                <span>BPM: {zone.bpm}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Users size={10} /> Personel:
                  <button onClick={() => setZones((prev) => prev.map((z) => (z.id === zone.id ? { ...z, staff: Math.max(0, z.staff - 1) } : z)))} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '12px', padding: '0 2px' }}>−</button>
                  <b style={{ color: '#e2e8f0' }}>{zone.staff}</b>
                  <button onClick={() => setZones((prev) => prev.map((z) => (z.id === zone.id ? { ...z, staff: z.staff + 1 } : z)))} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: '12px', padding: '0 2px' }}>+</button>
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Otonom karar akışı (denetim kaydı) */}
      <div style={{ padding: '14px', borderRadius: '14px', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#fff' }}>
            🧠 Otonom Karar Akışı (Denetim Kaydı)
          </div>
          <button
            onClick={() => {
              const fresh = evaluate(zones);
              setActions((prev) => [...fresh, ...prev].slice(0, 20));
              setScans((s) => s + 1);
              // 📲 Kritik denge kararları varsa Patron'a anlık bildirim
              const critical = fresh.filter((a) => a.priority === 'high');
              if (critical.length > 0) {
                const summary = critical
                  .map((a) => `${a.title}`)
                  .slice(0, 3)
                  .join(' • ');
                void sendVipNotify(`⚖️ *Likya Yoğunluk Dengeleme*\n${summary}\n(Toplam ${critical.length} kritik karar)`);
              }
            }}
            style={{ padding: '6px 12px', borderRadius: '16px', cursor: 'pointer', border: '1px solid rgba(0,242,254,0.4)', background: 'rgba(0,242,254,0.08)', color: '#00f2fe', fontSize: '10px', fontWeight: '700' }}
          >
            <Zap size={11} style={{ display: 'inline', marginRight: 3 }} /> Şimdi Analiz Et
          </button>
        </div>
        {actions.length === 0 && (
          <div style={{ fontSize: '10px', color: '#64748b' }}>⚙️ Motor bekliyor... Bölge doluluklarını değiştirin veya otonom modu açın.</div>
        )}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '260px', overflowY: 'auto' }}>
          {actions.slice(0, 14).map((a, i) => {
            const zone = zones.find((z) => z.id === a.zoneId);
            const meta = STRATEGY_META[a.strategy];
            return (
              <div key={`${a.id}-${i}`} style={{
                display: 'flex', alignItems: 'flex-start', gap: '8px', padding: '8px 10px', borderRadius: '10px',
                background: 'rgba(255,255,255,0.02)', border: `1px solid ${a.priority === 'high' ? `${meta.color}40` : 'rgba(255,255,255,0.06)'}`,
              }}>
                <span style={{ fontSize: '14px' }}>{meta.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '10px', fontWeight: '600', color: '#e2e8f0', lineHeight: '1.4' }}>{a.title}</div>
                  <div style={{ fontSize: '9px', color: '#64748b', marginTop: '3px', lineHeight: '1.4' }}>📲 {a.notification}</div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '8px', color: meta.color }}>{meta.icon} {meta.label}</span>
                    <span style={{ fontSize: '8px', color: '#64748b' }}>🎯 {a.impact}</span>
                    <span style={{ fontSize: '8px', color: a.auto ? '#4ade80' : '#fbbf24' }}>{a.auto ? '🤖 Otonom' : '🧑‍💼 Onaylı'}</span>
                    <span style={{ fontSize: '8px', color: '#475569' }}>{zone?.icon} {zone?.name}</span>
                    <span style={{ fontSize: '8px', color: '#475569' }}>{a.time}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

