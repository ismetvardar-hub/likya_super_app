'use client';

import React, { useState, useEffect } from 'react';
import { ShieldCheck, ShoppingCart, Gift, Timer } from 'lucide-react';
import {
  MEDIA_CATALOG,
  redeemWithPoints,
  purchaseWithCash,
  type MediaProduct,
} from '../lib/sportVision/mediaStoreEngine';
import {
  generateGuardianConsentTemplate,
  autoPurgeTimer,
  formatCountdown,
  isMinor,
  type ConsentStatus,
} from '../lib/legal/complianceEngine';

// ============================================================================
// 🎬 LİKYA SPORT MEDIA COMMERCE — Hukuk + Satış + Sadakat Kataloğu
// KVKK izin kartı • Filigranlı önizleme • Çift kanallı satın alma • 48s imha
// ============================================================================

const CLIP_PREVIEWS: Record<string, string> = {
  reels: '🎬 15sn Reels • 114 km/s 💥 • ⏪ 0.25x',
  biomech: '🧬 Ghost Avatar • 38° vs 50° açı farkı',
  photos: '📸 8/10 kare 4K • Smaç anı yakalandı',
  archive: '🏟️ Geniş açı • 3. set • taktik kayıt',
};

export default function SportMediaCommerceDashboard() {
  const [athleteName, setAthleteName] = useState('Kuzey');
  const [birthDate, setBirthDate] = useState('2012-04-15');
  const [guardianName, setGuardianName] = useState('Ahmet');
  const [consent, setConsent] = useState<ConsentStatus>('veli_gerekli');
  const [xp, setXp] = useState(2450);
  const [token, setToken] = useState(18.5);
  const [log, setLog] = useState<string[]>([]);
  const [nowTick, setNowTick] = useState(Date.now());

  // ⏳ canlı geri sayım
  useEffect(() => {
    const i = setInterval(() => setNowTick(Date.now()), 1000);
    return () => clearInterval(i);
  }, []);

  const minor = isMinor(birthDate);
  const mediaCreatedAt = new Date(Date.now() - 26 * 3600 * 1000).toISOString(); // 26 saat önce üretildi
  const purge = autoPurgeTimer('klip-001', mediaCreatedAt, nowTick);

  const approveConsent = () => {
    if (minor && !guardianName.trim()) {
      setLog((p) => ['⚠️ 18 yaş altı için VELİ MUVAFAKATNAME zorunlu!', ...p].slice(0, 6));
      return;
    }
    setConsent('onaylandi');
    setLog((p) => [
      minor
        ? `👨‍👩‍👦 Veli muvafakatnamesi onaylandı: ${guardianName} — ${generateGuardianConsentTemplate(athleteName, guardianName)}`
        : `✅ ${athleteName} açık rıza onaylandı (KVKK md.5/1-a)`,
      ...p,
    ].slice(0, 6));
  };

  const buy = (p: MediaProduct) => {
    if (consent !== 'onaylandi') {
      setLog((p2) => ['🔒 Önce KVKK açık rızasını onaylayın!', ...p2].slice(0, 6));
      return;
    }
    const r = purchaseWithCash(p, 'card');
    setLog((l) => [r.message, ...l].slice(0, 6));
  };

  const redeem = (p: MediaProduct) => {
    if (consent !== 'onaylandi') {
      setLog((l) => ['🔒 Önce KVKK açık rızasını onaylayın!', ...l].slice(0, 6));
      return;
    }
    const r = redeemWithPoints(p, xp);
    if (r.success) setXp(r.remainingXP);
    setLog((l) => [r.message, ...l].slice(0, 6));
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🎬 Sport Media Commerce — Hukuk + Satış + Sadakat
        </h2>
        <p style={{ fontSize: '12px', color: '#94a3b8' }}>KVKK uyumlu medya üretimi • 4K klip satışı • Daze-Gift XP kataloğu</p>
      </div>

      {/* 🛡️ KVKK izin ve veli onay kartı */}
      <div style={{ padding: '14px', borderRadius: '16px', background: consent === 'onaylandi' ? 'rgba(74,222,128,0.05)' : 'rgba(245,158,11,0.05)', border: `1px solid ${consent === 'onaylandi' ? 'rgba(74,222,128,0.4)' : 'rgba(245,158,11,0.4)'}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: consent === 'onaylandi' ? '#4ade80' : '#fbbf24', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={14} /> KVKK İzin & Veli Onay Durumu: {consent === 'onaylandi' ? '✅ ONAYLANDI' : consent === 'veli_gerekli' ? '👨‍👩‍👦 VELİ MUVAFAKATNAME GEREKLİ' : '⏳ BEKLİYOR'}
          </div>
          <div style={{ fontSize: '9px', color: '#64748b' }}>{minor ? `18 yaş altı (${guardianName || 'veli gerekli'})` : 'Reşit — açık rıza yeterli'}</div>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <input value={athleteName} onChange={(e) => setAthleteName(e.target.value)} style={{ width: '100px', padding: '8px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: '#e2e8f0', fontSize: '11px', outline: 'none' }} />
          <input type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} style={{ padding: '8px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: '#e2e8f0', fontSize: '11px', outline: 'none' }} />
          {minor && (
            <input value={guardianName} onChange={(e) => setGuardianName(e.target.value)} placeholder="Veli/Vasi adı" style={{ width: '120px', padding: '8px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: '#e2e8f0', fontSize: '11px', outline: 'none' }} />
          )}
          <button onClick={approveConsent} style={{ padding: '9px 16px', borderRadius: '20px', cursor: 'pointer', border: '1px solid rgba(74,222,128,0.5)', background: 'rgba(74,222,128,0.1)', color: '#4ade80', fontSize: '10px', fontWeight: '700' }}>
            {minor ? '👨‍👩‍👦 Veli Muvafakatnamesini Onayla' : '✅ Açık Rızayı Onayla'}
          </button>
        </div>
        <div style={{ fontSize: '8px', color: '#475569', marginTop: '8px' }}>
          🧬 Anonimleştirme: rızası olmayan üçüncü kişilerin yüzleri AI ile otomatik bulanıklaştırılır (Face/Background Blur)
        </div>
      </div>


      {/* ⏳ 48 saat imha sayacı */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderRadius: '14px', background: 'rgba(248,113,113,0.05)', border: `1px solid ${purge.phase === 'SILINECEK' ? 'rgba(248,113,113,0.5)' : 'rgba(248,113,113,0.25)'}` }}>
        <Timer size={18} color={purge.phase === 'SILINECEK' ? '#f87171' : '#fbbf24'} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: purge.phase === 'SILINECEK' ? '#f87171' : '#fbbf24' }}>
            ⏳ 48 Saatlik Otonom İmha {purge.phase === 'SILINDI' ? '— İMHA EDİLDİ' : `— ${formatCountdown(purge)}`}
          </div>
          <div style={{ fontSize: '9px', color: '#64748b', marginTop: '2px' }}>
            Satın alınmayan ham/önizleme video 48 saat sonra diskten kalıcı silinir (KVKK saklama riski = 0)
          </div>
        </div>
        <div style={{ fontSize: '9px', fontWeight: '700', color: '#64748b' }}>Klip-001</div>
      </div>

      {/* 🎬 ürün kasası */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
        {MEDIA_CATALOG.map((p) => (
          <div key={p.id} style={{ padding: '12px', borderRadius: '14px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(0,242,254,0.2)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ height: '80px', borderRadius: '10px', background: 'linear-gradient(135deg, rgba(0,242,254,0.15), rgba(0,0,0,0.6))', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
              <span style={{ fontSize: '28px' }}>{p.icon}</span>
              <span style={{ position: 'absolute', top: '6px', left: '8px', fontSize: '8px', fontWeight: '700', color: '#fff', background: 'rgba(0,0,0,0.5)', padding: '2px 6px', borderRadius: '6px' }}>{CLIP_PREVIEWS[p.id]}</span>
              <span style={{ position: 'absolute', bottom: '6px', right: '8px', fontSize: '8px', fontWeight: '700', color: 'rgba(255,255,255,0.6)' }}>💧 LİKYA FILIGRAN</span>
            </div>
            <div style={{ fontSize: '12px', fontWeight: '700', color: '#fff' }}>{p.icon} {p.name}</div>
            <div style={{ fontSize: '9px', color: '#64748b', lineHeight: '1.5' }}>{p.description} • {p.duration}</div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#f59e0b' }}>{p.priceTL} TL</span>
              <span style={{ fontSize: '10px', color: '#64748b' }}>({p.priceUSD}$)</span>
              <span style={{ fontSize: '9px', color: '#a78bfa' }}>veya {p.pointsXP} XP</span>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button onClick={() => buy(p)} style={{ flex: 1, padding: '8px', borderRadius: '10px', cursor: 'pointer', border: '1px solid rgba(245,158,11,0.5)', background: 'rgba(245,158,11,0.1)', color: '#f59e0b', fontSize: '10px', fontWeight: '700' }}>
                <ShoppingCart size={11} style={{ display: 'inline', marginRight: 4 }} /> Satın Al
              </button>
              <button onClick={() => redeem(p)} style={{ flex: 1, padding: '8px', borderRadius: '10px', cursor: 'pointer', border: '1px solid rgba(74,222,128,0.5)', background: 'rgba(74,222,128,0.08)', color: '#4ade80', fontSize: '10px', fontWeight: '700' }}>
                <Gift size={11} style={{ display: 'inline', marginRight: 4 }} /> XP ile Al
              </button>
            </div>
          </div>
        ))}
      </div>


      {/* cüzdan + işlem akışı */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ flex: '1', minWidth: '200px', padding: '14px', borderRadius: '14px', background: 'rgba(167,139,250,0.05)', border: '1px solid rgba(167,139,250,0.25)' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#a78bfa', marginBottom: '6px' }}>👛 {athleteName} Cüzdanı</div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '10px', color: '#94a3b8' }}>⚡ XP: <b style={{ color: '#f59e0b' }}>{xp.toLocaleString('tr-TR')}</b></span>
            <span style={{ fontSize: '10px', color: '#94a3b8' }}>📈 Token: <b style={{ color: '#00f2fe' }}>{token.toFixed(1)}</b></span>
            <span style={{ fontSize: '10px', color: '#94a3b8' }}>💳 Bakiye: <b style={{ color: '#4ade80' }}>₺1.250</b></span>
          </div>
        </div>
        <div style={{ flex: '1', minWidth: '240px', padding: '14px', borderRadius: '14px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#fff', marginBottom: '6px' }}>📲 İşlem Akışı</div>
          {log.length === 0 && <div style={{ fontSize: '9px', color: '#64748b' }}>Satın alma / talep bekleniyor...</div>}
          {log.map((l, i) => (
            <div key={i} style={{ fontSize: '9px', color: '#94a3b8', lineHeight: '1.6', fontFamily: 'monospace' }}>{l}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

