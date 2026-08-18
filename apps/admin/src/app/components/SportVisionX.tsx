'use client';

import React, { useState } from 'react';
import { Send } from 'lucide-react';
import CourtConditionerPanel from './CourtConditionerPanel';
import CsmTacticalPanel from './CsmTacticalPanel';

// ============================================================================
// 🩻 LİKYA SPORT VISION X — 5 DEVRİMSEL MODÜL
// 1. Ghost Avatar (3D Dijital İkiz)   2. Akustik Ritim Kitleme
// 3. Viral Klip Fabrikası             4. Termal Sakatlık Radarı
// 5. Metabolik Bar Köprüsü
// ============================================================================

type XTab = 'ghost' | 'acoustic' | 'clip' | 'thermal' | 'metabolic';

const TABS: { id: XTab; icon: string; label: string }[] = [
  { id: 'ghost', icon: '🩻', label: 'Ghost Avatar' },
  { id: 'acoustic', icon: '⚡', label: 'Ritim Kitleme' },
  { id: 'clip', icon: '🎬', label: 'Klip Fabrikası' },
  { id: 'thermal', icon: '🧯', label: 'Termal Radar' },
  { id: 'metabolic', icon: '🥗', label: 'Metabolik Bar' },
];

export default function SportVisionX() {
  const [tab, setTab] = useState<XTab>('ghost');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🩻 Sport Vision X — Devrimsel Modüller
        </h2>
        <p style={{ fontSize: '12px', color: '#94a3b8' }}>3D İkiz • Akustik Kitleme • Viral Klip • Termal Radar • Metabolik Köprü</p>
      </div>

      {/* Modül seçici */}
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

      {tab === 'ghost' && <GhostAvatarModule />}
      {tab === 'acoustic' && <AcousticLockModule />}
      {tab === 'clip' && <ClipFactoryModule />}
      {tab === 'thermal' && <ThermalRadarModule />}
      {tab === 'metabolic' && <MetabolicBridgeModule />}

      {/* 📋 Drill Kütüphanesi — tüm sekmelerde erişilebilir (17s + U8-U16 matris) */}
      <CourtConditionerPanel />

      {/* 🧠 CSM Taktik Problem Çözücü + Frenleme Biyomekaniği + Taktik Drill Suiti */}
      <CsmTacticalPanel />
    </div>
  );
}

// ============================================================================
// 🩻 MODÜL 1 — GHOST AVATAR (3D Dijital İkiz & Holografik Kıyaslama)
// Sporcunun kol açısı ile "şampiyon hayaletinin" ideal açısı canlı karşılaştırılır.
// ============================================================================
function GhostAvatarModule() {
  const [athleteAngle, setAthleteAngle] = useState(50); // sporcunun canlı açısı
  const CHAMPION_ANGLE = 38; // ideal (şampiyon) açı
  const diff = Math.abs(athleteAngle - CHAMPION_ANGLE);

  // SVG: omuz pivotundan iki kol — sporcu (dolu) + hayalet (şeffaf)
  const shoulderX = 90;
  const shoulderY = 130;
  const armLen = 80;
  const rad = (a: number) => ((90 - a) * Math.PI) / 180; // yataydan yukarı açı
  const armEnd = (a: number) => ({
    x: shoulderX + armLen * Math.cos(rad(a)),
    y: shoulderY - armLen * Math.sin(rad(a)),
  });
  const athleteEnd = armEnd(athleteAngle);
  const champEnd = armEnd(CHAMPION_ANGLE);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'stretch' }}>
        {/* SVG görselleştirme */}
        <div style={{ flex: '1', minWidth: '260px', borderRadius: '16px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,242,254,0.25)', padding: '12px', display: 'flex', justifyContent: 'center' }}>
          <svg viewBox="0 0 220 180" width="100%" style={{ maxWidth: '280px' }}>
            {/* hedef yay */}
            <path
              d={`M ${shoulderX + armLen * 1.15 * Math.cos(rad(60))} ${shoulderY - armLen * 1.15 * Math.sin(rad(60))} A 92 92 0 0 0 ${shoulderX + armLen * 1.15 * Math.cos(rad(15))} ${shoulderY - armLen * 1.15 * Math.sin(rad(15))}`}
              stroke="rgba(148,163,184,0.2)" strokeWidth="1" fill="none" strokeDasharray="4 3"
            />
            {/* şampiyon hayalet kolu (şeffaf) */}
            <line x1={shoulderX} y1={shoulderY} x2={champEnd.x} y2={champEnd.y} stroke="rgba(0,242,254,0.35)" strokeWidth="10" strokeLinecap="round" style={{ animation: 'pulse 2s infinite' }} />
            <line x1={shoulderX} y1={shoulderY} x2={champEnd.x} y2={champEnd.y} stroke="#00f2fe" strokeWidth="2" strokeLinecap="round" strokeDasharray="6 4" />
            <text x={champEnd.x + 6} y={champEnd.y - 6} fill="#00f2fe" fontSize="9">👻 İdeal {CHAMPION_ANGLE}°</text>
            {/* sporcu kolu (dolu) */}
            <line x1={shoulderX} y1={shoulderY} x2={athleteEnd.x} y2={athleteEnd.y} stroke="#f59e0b" strokeWidth="7" strokeLinecap="round" />
            <circle cx={athleteEnd.x} cy={athleteEnd.y} r="6" fill="#f59e0b" />
            <text x={athleteEnd.x - 8} y={athleteEnd.y + 20} fill="#f59e0b" fontSize="9">Sporcu {athleteAngle}°</text>
            {/* omuz */}
            <circle cx={shoulderX} cy={shoulderY} r="7" fill="#fff" />
            {/* açı farkı oku */}
            <text x={shoulderX + 14} y={shoulderY + 34} fill={diff > 8 ? '#f87171' : '#4ade80'} fontSize="11" fontWeight="bold">
              Fark: {diff}°
            </text>
          </svg>
        </div>

        {/* kontrol */}
        <div style={{ flex: '1', minWidth: '240px', display: 'flex', flexDirection: 'column', gap: '10px', padding: '14px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#fff' }}>🩻 Canlı Holografik Kıyaslama</div>
          <div style={{ fontSize: '10px', color: '#94a3b8', lineHeight: '1.6' }}>
            Kamerada sporcu vuruş yaparken, arkasında <b style={{ color: '#00f2fe' }}>dünya şampiyonunun şeffaf hayaleti</b> aynı anda ideal vuruşu yapar. Kol açısı farkını anında görür.
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#64748b', marginBottom: '4px' }}>
              <span>Sporcu Kol Açısı (°)</span>
              <span style={{ color: '#f59e0b', fontWeight: '700' }}>{athleteAngle}°</span>
            </div>
            <input type="range" min={15} max={75} value={athleteAngle} onChange={(e) => setAthleteAngle(Number(e.target.value))} style={{ width: '100%', cursor: 'pointer', accentColor: '#f59e0b', height: '4px' }} />
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '10px', fontWeight: '700', padding: '4px 10px', borderRadius: '10px', background: 'rgba(0,242,254,0.1)', color: '#00f2fe' }}>👻 Şampiyon: 38°</span>
            <span style={{ fontSize: '10px', fontWeight: '700', padding: '4px 10px', borderRadius: '10px', background: 'rgba(245,158,11,0.1)', color: '#f59e0b' }}>🎾 Sporcu: {athleteAngle}°</span>
          </div>
          <div style={{ fontSize: '10px', color: diff > 8 ? '#f87171' : '#4ade80', lineHeight: '1.6', padding: '8px 10px', borderRadius: '10px', background: diff > 8 ? 'rgba(248,113,113,0.08)' : 'rgba(74,222,128,0.08)' }}>
            {diff > 8
              ? `⚠️ Kol açısında ${diff}° sapma — şampiyon hayaletine hizala. Dirseği 10 cm yukarı kaldır ve gövde rotasyonunu artır.`
              : `✅ Açı farkı sadece ${diff}° — hareket şampiyon kalıbına çok yakın!`}
          </div>
        </div>
      </div>
      <div style={{ fontSize: '9px', color: '#475569' }}>
        💡 Gerçek dünyada: kamera + pose-estimation modeli sporcunun iskeletini çıkarır; şampiyonun 3D hayaleti (mesh) aynı koordinata bindirilir.
      </div>
    </div>
  );
}


// ============================================================================
// ⚡ MODÜL 2 — AKUSTİK RİTİM KİTLEME (Binaural Pacing)
// Sporcunun kadansı düştüğünde Likya Müzik BPM'i hedef ritme kilitler.
// ============================================================================
function AcousticLockModule() {
  const [cadence, setCadence] = useState(118); // sporcu adım/dk
  const TARGET_BPM = 128;

  const locked = cadence < TARGET_BPM; // kadans düştü → müzik kilitle
  const gap = TARGET_BPM - cadence;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
        {/* BPM göstergesi */}
        <div style={{ flex: '1', minWidth: '240px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', padding: '18px', borderRadius: '16px', background: 'rgba(0,0,0,0.3)', border: locked ? '1px solid rgba(0,242,254,0.5)' : '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Hedef Ritim</div>
          <div style={{ position: 'relative', width: '120px', height: '120px', borderRadius: '50%', border: `6px solid ${locked ? '#00f2fe' : '#334155'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: locked ? '0 0 30px rgba(0,242,254,0.4)' : 'none' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '26px', fontWeight: 'bold', color: locked ? '#00f2fe' : '#64748b' }}>{TARGET_BPM}</div>
              <div style={{ fontSize: '9px', color: '#64748b' }}>BPM</div>
            </div>
            {locked && <span style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '18px' }}>🔒</span>}
          </div>
          <div style={{ fontSize: '11px', fontWeight: '700', color: locked ? '#4ade80' : '#64748b' }}>
            {locked ? '🎵 Akustik Pacing AKTİF — müzik tempoya kilitlendi' : '⚪ Müzik serbest — kadans hedefte'}
          </div>
        </div>

        {/* kontrol */}
        <div style={{ flex: '1', minWidth: '240px', display: 'flex', flexDirection: 'column', gap: '10px', padding: '14px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#fff' }}>⚡ Nöro-Sportif Akustik Eşleme</div>
          <div style={{ fontSize: '10px', color: '#94a3b8', lineHeight: '1.6' }}>
            Sport Vision, nabız ve kadansı anlık izler; düştüğünde <b style={{ color: '#00f2fe' }}>Likya Müzik DJ'ine fısıldar</b> ve müzik BPM'ini hedef ritme kilitler — sporcu fark etmeden tempoya girer.
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#64748b', marginBottom: '4px' }}>
              <span>🏃 Sporcu Kadansı (adım/dk)</span>
              <span style={{ color: cadence < TARGET_BPM ? '#f87171' : '#4ade80', fontWeight: '700' }}>{cadence}</span>
            </div>
            <input type="range" min={90} max={170} value={cadence} onChange={(e) => setCadence(Number(e.target.value))} style={{ width: '100%', cursor: 'pointer', accentColor: cadence < TARGET_BPM ? '#00f2fe' : '#4ade80', height: '4px' }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8' }}>
              <span>📡 Sport Vision gözlemi</span>
              <span style={{ color: cadence < TARGET_BPM ? '#f87171' : '#4ade80' }}>{cadence < TARGET_BPM ? `kadans düştü (${gap} eksik)` : 'kadans stabil'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8' }}>
              <span>🎧 Likya Müzik yanıtı</span>
              <span style={{ color: locked ? '#00f2fe' : '#64748b' }}>{locked ? `BPM → ${TARGET_BPM} kilitlendi 🔒` : 'BPM serbest akış'}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8' }}>
              <span>🎯 Sporcunun hissi</span>
              <span style={{ color: locked ? '#4ade80' : '#64748b' }}>{locked ? 'müzik onu yorulmadan uçuruyor' : 'doğal ritimde'}</span>
            </div>
          </div>
        </div>
      </div>
      <div style={{ fontSize: '9px', color: '#475569' }}>
        💡 Binaural teknik: iki kulağa hafif farklı frekanslar verilerek beyinde "isochronic" nabız oluşturulur; kadansın müzikle senkronu koşu ekonomisini artırır.
      </div>
    </div>
  );
}


// ============================================================================
// 🎬 MODÜL 3 — OTONOM VAR & VİRAL KLİP FABRİKASI (Showtime AI)
// ============================================================================
const CLIPS = [
  { id: 'c1', title: 'Smaç Kralı', desc: 'Çapraz smaç — file önü', speed: 114, moment: '🔥 En estetik sayı', color: '#f87171' },
  { id: 'c2', title: 'Mükemmel Geri Vuruş', desc: 'Arka hat bandına', speed: 96, moment: '⚡ Yüksek risk & ödül', color: '#f59e0b' },
  { id: 'c3', title: 'Kurtarış Şovu', desc: 'Uçarak plase savunması', speed: 88, moment: '🛡️ Maçın anı', color: '#00f2fe' },
];

function ClipFactoryModule() {
  const [sent, setSent] = useState<string[]>([]);

  const sendWhatsApp = (clip: typeof CLIPS[number]) => {
    const text = encodeURIComponent(
      `🎬 LİKYA SHOWTIME — ${clip.title}!\n${clip.moment} • ${clip.speed} km/s 💥\nMaçtan 15 sn'lik viral klip hazır: Likya Kampüsü`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
    setSent((prev) => (prev.includes(clip.id) ? prev : [...prev, clip.id]));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ fontSize: '12px', fontWeight: '700', color: '#fff' }}>🎬 Showtime AI — Maç Biter Bitmez Hazır Reels/TikTok</div>
      <div style={{ fontSize: '10px', color: '#94a3b8' }}>
        Kameralar maçı kaydeder; yapay zeka en estetik 3 anı seçer → ağır çekim + hız göstergesi + Likya logosu + heyecanlı müzik → 15 sn'lik klip sporcunun WhatsApp'ına düşer.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px' }}>
        {CLIPS.map((clip) => (
          <div key={clip.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '12px', borderRadius: '14px', background: 'rgba(0,0,0,0.3)', border: `1px solid ${clip.color}40` }}>
            <div style={{ height: '90px', borderRadius: '10px', background: `linear-gradient(135deg, ${clip.color}25, rgba(0,0,0,0.6))`, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
              <span style={{ fontSize: '34px' }}>🎾</span>
              <span style={{ position: 'absolute', top: '6px', left: '8px', fontSize: '8px', fontWeight: '700', color: '#fff', background: 'rgba(0,0,0,0.5)', padding: '2px 6px', borderRadius: '6px' }}>▶ 15 sn • Reels</span>
              <span style={{ position: 'absolute', top: '6px', right: '8px', fontSize: '8px', fontWeight: '700', color: clip.color }}>{clip.speed} km/s 💥</span>
              <span style={{ position: 'absolute', bottom: '6px', left: '8px', fontSize: '8px', fontWeight: '700', color: '#fff' }}>LİKYA 🏛️</span>
              <span style={{ position: 'absolute', bottom: '6px', right: '8px', fontSize: '8px', color: '#fbbf24' }}>⏪ 0.25x</span>
            </div>
            <div style={{ fontSize: '11px', fontWeight: '700', color: '#fff' }}>{clip.title}</div>
            <div style={{ fontSize: '9px', color: '#64748b' }}>{clip.desc} • {clip.moment}</div>
            <button
              onClick={() => sendWhatsApp(clip)}
              style={{
                padding: '8px', borderRadius: '12px', cursor: 'pointer', fontSize: '10px', fontWeight: '700',
                border: sent.includes(clip.id) ? '1px solid rgba(74,222,128,0.5)' : '1px solid rgba(37,211,102,0.5)',
                background: sent.includes(clip.id) ? 'rgba(74,222,128,0.12)' : 'rgba(37,211,102,0.1)',
                color: sent.includes(clip.id) ? '#4ade80' : '#25d366',
              }}
            >
              <Send size={11} style={{ display: 'inline', marginRight: 4 }} /> {sent.includes(clip.id) ? 'WhatsApp\'a Gönderildi ✓' : 'WhatsApp\'a Gönder'}
            </button>
          </div>
        ))}
      </div>
      <div style={{ fontSize: '9px', color: '#475569' }}>
        💡 Gerçek dünyada: kort kamerası + otomatik an-tespiti + ffmpeg render hattı + WhatsApp Business API.
      </div>
    </div>
  );
}


// ============================================================================
// 🧯 MODÜL 4 — TERMAL KAMERA İLE SAKATLIK ÖNCEDEN SEZME
// ============================================================================
function ThermalRadarModule() {
  const [heatDelta, setHeatDelta] = useState(1.8); // sağ omuz lokal ısı artışı (°C)
  const risk = heatDelta > 2.5 ? 'YÜKSEK' : heatDelta > 1.2 ? 'ORTA' : 'DÜŞÜK';
  const riskColor = risk === 'YÜKSEK' ? '#f87171' : risk === 'ORTA' ? '#fbbf24' : '#4ade80';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ fontSize: '12px', fontWeight: '700', color: '#fff' }}>🧯 Termal Sakatlık Radarı — Kriyoterapi Yönlendirmesi</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
        {/* vücut haritası */}
        <div style={{ flex: '1', minWidth: '200px', display: 'flex', justifyContent: 'center', padding: '12px', borderRadius: '16px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(248,113,113,0.2)' }}>
          <svg viewBox="0 0 140 260" width="150">
            <ellipse cx="70" cy="40" rx="18" ry="24" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
            <rect x="56" y="62" width="28" height="70" rx="12" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" />
            <line x1="70" y1="75" x2="30" y2="100" stroke="rgba(255,255,255,0.3)" strokeWidth="4" strokeLinecap="round" />
            <line x1="70" y1="75" x2="110" y2="100" stroke="rgba(255,255,255,0.3)" strokeWidth="4" strokeLinecap="round" />
            <circle cx="110" cy="96" r={18 + heatDelta * 4} fill={`rgba(248,113,113,${Math.min(0.7, 0.2 + heatDelta * 0.2)})`} style={{ animation: 'pulse 1.5s infinite' }} />
            <circle cx="110" cy="96" r="6" fill="#f87171" />
            <text x="118" y="80" fill="#f87171" fontSize="9" fontWeight="bold">+{heatDelta.toFixed(1)}°C</text>
            <text x="98" y="120" fill="#64748b" fontSize="8">sağ omuz</text>
            <line x1="70" y1="135" x2="35" y2="200" stroke="rgba(255,255,255,0.3)" strokeWidth="5" strokeLinecap="round" />
            <line x1="70" y1="135" x2="105" y2="200" stroke="rgba(255,255,255,0.3)" strokeWidth="5" strokeLinecap="round" />
            <line x1="35" y1="200" x2="25" y2="250" stroke="rgba(255,255,255,0.3)" strokeWidth="5" strokeLinecap="round" />
            <line x1="105" y1="200" x2="115" y2="250" stroke="rgba(255,255,255,0.3)" strokeWidth="5" strokeLinecap="round" />
          </svg>
        </div>

        {/* kontrol + uyarı */}
        <div style={{ flex: '1', minWidth: '240px', display: 'flex', flexDirection: 'column', gap: '10px', padding: '14px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '9px', color: '#64748b', marginBottom: '4px' }}>
              <span>🌡️ Lokal Isı Artışı (sağ omuz °C)</span>
              <span style={{ color: riskColor, fontWeight: '700' }}>+{heatDelta.toFixed(1)}°C</span>
            </div>
            <input type="range" min={0} max={4} step={0.1} value={heatDelta} onChange={(e) => setHeatDelta(Number(e.target.value))} style={{ width: '100%', cursor: 'pointer', accentColor: riskColor, height: '4px' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '10px', fontWeight: '700', padding: '4px 10px', borderRadius: '10px', background: `${riskColor}15`, color: riskColor, border: `1px solid ${riskColor}40` }}>
              Risk: {risk}
            </span>
            <span style={{ fontSize: '9px', color: '#64748b' }}>mikro yırtık / ödem başlangıcı?</span>
          </div>
          <div style={{ fontSize: '10px', lineHeight: '1.6', padding: '10px', borderRadius: '10px', background: risk === 'YÜKSEK' ? 'rgba(248,113,113,0.1)' : 'rgba(255,255,255,0.04)', border: `1px solid ${riskColor}30`, color: '#e2e8f0' }}>
            📢 <b>Antrenöre fısılda:</b> "Sporcunun sağ omuz rotatör bölgesinde +{heatDelta.toFixed(1)}°C lokal ısı artışı var. Seti 5 dakika erken bitirip <b style={{ color: '#00f2fe' }}>buz / kriyo havuzuna</b> yönlendirin."
          </div>
          <button
            onClick={() => setHeatDelta(0.4)}
            style={{ padding: '8px 14px', borderRadius: '12px', cursor: 'pointer', border: '1px solid rgba(0,242,254,0.4)', background: 'rgba(0,242,254,0.08)', color: '#00f2fe', fontSize: '10px', fontWeight: '700', alignSelf: 'flex-start' }}
          >
            🧊 Kriyo Protokolü Uygulandı (ısı düştü)
          </button>
        </div>
      </div>
      <div style={{ fontSize: '9px', color: '#475569' }}>
        💡 Gerçek dünyada: termal/RGB optik sensör kas mikro-enflamasyonunu sakatlık olmadan önce yakalar; antrenör + fizyoterapist uyarılır.
      </div>
    </div>
  );
}


// ============================================================================
// 🥗 MODÜL 5 — MUTFAK & BAR İLE CANLI METABOLİK ENTEGRASYON (Daze Chef Köprüsü)
// ============================================================================
function MetabolicBridgeModule() {
  const [minutesLeft, setMinutesLeft] = useState(5); // maçın bitişine kalan dk
  const calories = Math.round(6.0 * 72 * (minutesLeft > 0 ? minutesLeft / 60 : 0.1) + 320); // seans toplamı
  const electrolytes = (calories * 0.018).toFixed(1); // mg elektrolit kaybı
  const preparing = minutesLeft <= 5 && minutesLeft > 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
      <div style={{ fontSize: '12px', fontWeight: '700', color: '#fff' }}>🥗 Daze Chef Köprüsü — Antrenman Biter Bitmez Besin Hazır</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
        {/* canlı metabolik veri */}
        <div style={{ flex: '1', minWidth: '240px', display: 'flex', flexDirection: 'column', gap: '10px', padding: '14px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#fff' }}>📡 Canlı Metabolik İstihbarat</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8' }}>
            <span>⏱️ Seans bitimine</span>
            <span style={{ color: '#f59e0b', fontWeight: '700' }}>{minutesLeft} dk</span>
          </div>
          <input type="range" min={0} max={15} value={minutesLeft} onChange={(e) => setMinutesLeft(Number(e.target.value))} style={{ width: '100%', cursor: 'pointer', accentColor: '#34d399', height: '4px' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8' }}>
            <span>🔥 Yakılan kalori (tahmini)</span>
            <span style={{ color: '#f59e0b', fontWeight: '700' }}>{calories} kcal</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8' }}>
            <span>💧 Elektrolit kaybı</span>
            <span style={{ color: '#00f2fe', fontWeight: '700' }}>~{electrolytes} mg</span>
          </div>
          <div style={{ fontSize: '10px', padding: '8px 10px', borderRadius: '10px', background: 'rgba(52,211,153,0.08)', border: '1px solid rgba(52,211,153,0.25)', color: '#4ade80', fontWeight: '600' }}>
            🍳 Daze Chef paneli: {preparing ? 'smoothie hazırlanıyor...' : 'hazır bekliyor ✓'}
          </div>
        </div>

        {/* hazır içecek kartı */}
        <div style={{ flex: '1', minWidth: '220px', display: 'flex', flexDirection: 'column', gap: '8px', padding: '14px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(52,211,153,0.08), rgba(0,242,254,0.05))', border: '1px solid rgba(52,211,153,0.35)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '34px' }}>🥤</span>
            <div>
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#fff' }}>Protein-Elektrolit Smoothie</div>
              <div style={{ fontSize: '9px', color: '#64748b' }}>Daze Chef özel — adına hazır</div>
            </div>
          </div>
          <div style={{ fontSize: '10px', color: '#94a3b8', lineHeight: '1.6' }}>
            🥛 30g whey protein • 🍌 muz • 🥥 hindistan cevizi suyu • 🧂 elektrolit takviyesi • 🧊 soğuk servis
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '9px', fontWeight: '700', padding: '4px 10px', borderRadius: '10px', background: 'rgba(74,222,128,0.12)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.35)' }}>
              ✅ Bar tezgahında bekliyor
            </span>
            <span style={{ fontSize: '9px', fontWeight: '700', padding: '4px 10px', borderRadius: '10px', background: 'rgba(0,242,254,0.1)', color: '#00f2fe' }}>
              🏷️ {preparing ? `~${minutesLeft} dk sonra hazır` : 'Hemen hazır'}
            </span>
          </div>
        </div>
      </div>
      <div style={{ fontSize: '9px', color: '#475569' }}>
        💡 Gerçek dünyada: Sport Vision yakılan kalori + elektrolit kaybını maçın son 5 dakikasında Daze Chef ekranına düşürür; sporcu sahadan çıktığında içeceği hazırdır.
      </div>
    </div>
  );
}

