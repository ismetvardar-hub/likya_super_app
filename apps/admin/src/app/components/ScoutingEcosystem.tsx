'use client';

import React, { useState, useMemo } from 'react';
import { Trophy, Globe, Database, Send, Target } from 'lucide-react';
import { calculateMirwaldOffset, determineGrowthPhase, calculateApeIndex, ageYears, type YouthAthlete } from '../lib/sportVision/youthDevelopmentEngine';
import { developmentIndex } from '../lib/sportVision/pedagogyEngine';

// ============================================================================
// 🎯 LİKYA SPORT VISION — SCOUTING & KÜRESEL REKABET EKOSİSTEMİ
// Rakiplere (Hudl, Catapult, HomeCourt, Kitman, Zone7) karşı konumlanma
// + Dünya kulüplerine tek tıkla yetenek ihracı (Scouting)
// + Doğrulanmış Hareket Kütüphanesi (Veri Üstünlüğü hedefi)
// ============================================================================

// Rekabet matrisi — 8 boyutta biz vs devler
const DIMENSIONS = [
  { name: 'Saha Video & Skor', us: 2, devs: 3 },
  { name: 'Biyomekanik & Açı', us: 3, devs: 3 },
  { name: 'Büyüme/PHV (Biyolojik Yaş)', us: 3, devs: 1 },
  { name: 'Çift Veli Pedagojisi', us: 3, devs: 0 },
  { name: 'Tahlil/OCR & Beslenme', us: 3, devs: 1 },
  { name: 'Okul/Akademik Yük', us: 3, devs: 0 },
  { name: 'Tribün & Saha Dışı', us: 3, devs: 0 },
  { name: 'Müzik/Besin Köprüsü', us: 3, devs: 0 },
];

// Scouting havuzu — sistemde takip edilen genç sporcular
const SCOUT_POOL: { id: string; ad: string; yas: number; branş: string; icon: string; dev: number; phv: number; ape: number; sosyal: number; takım: string }[] = [
  { id: 's1', ad: 'Kuzey', yas: 14, branş: 'Padel', icon: '🎾', dev: 68, phv: -1.0, ape: 1.026, sosyal: 72, takım: 'La Masia' },
  { id: 's2', ad: 'Elif', yas: 13, branş: 'Yüzme', icon: '🏊', dev: 81, phv: 0.4, ape: 1.05, sosyal: 85, takım: 'IMG Academy' },
  { id: 's3', ad: 'Deniz', yas: 15, branş: 'Tenis', icon: '🎾', dev: 74, phv: 0.9, ape: 1.04, sosyal: 64, takım: 'Ajax Akademi' },
];

// Doğrulanmış Hareket Kütüphanesi — veri üstünlüğü hedefi
const MOVEMENT_LIBRARY = [
  { id: 'm1', ad: 'İdeal Padel Smaç Açısı', icon: '🎾', deger: '38°', veriSayisi: 1240, guven: 94 },
  { id: 'm2', ad: 'Yüzücü Kol Çekme Verimi', icon: '🏊', deger: '82%', veriSayisi: 890, guven: 91 },
  { id: 'm3', ad: 'Koşu Kadans Optimizasyonu', icon: '🏃', deger: '178 adım/dk', veriSayisi: 2100, guven: 96 },
  { id: 'm4', ad: 'Çapraz Bağ Risk Eşiği (HRV)', icon: '🦵', deger: '>%15 asimetri', veriSayisi: 560, guven: 88 },
];

export default function ScoutingEcosystem() {
  const [selectedAthlete, setSelectedAthlete] = useState(SCOUT_POOL[0]);
  const [sentClubs, setSentClubs] = useState<string[]>([]);

  // Scout karnesi — holistik bileşenlerin deterministik ağırlığı
  const scoutReadiness = useMemo(() => {
    const r = Math.round(selectedAthlete.dev * 0.4 + selectedAthlete.sosyal * 0.3 + (selectedAthlete.phv < 0.5 ? 80 : 65) * 0.3);
    return r;
  }, [selectedAthlete]);

  const sendToClub = (club: string) => {
    const text = encodeURIComponent(
      `🎯 LİKYA SCOUT DOSYASI — ${selectedAthlete.ad}\n${selectedAthlete.icon} ${selectedAthlete.branş} • ${selectedAthlete.yas} yaş\n🧬 Holistik Gelişim: %${selectedAthlete.dev} • Sosyal: %${selectedAthlete.sosyal}\n🚀 PHV Offset: ${selectedAthlete.phv} yıl • Scout Hazırlığı: %${scoutReadiness}\n(Tam dosya: Sport Vision Ekosistemi)`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
    setSentClubs((prev) => (prev.includes(club) ? prev : [...prev, club]));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🎯 Scouting & Küresel Rekabet Ekosistemi
        </h2>
        <p style={{ fontSize: '12px', color: '#94a3b8' }}>
          Hudl • Catapult • HomeCourt • Kitman • Zone7 ile konumlanma + dünya kulüplerine yetenek ihracı
        </p>
      </div>

      {/* 🏆 Rekabet Zekası Matrisi */}
      <div style={{ padding: '14px', borderRadius: '16px', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(0,242,254,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Globe size={14} color="#00f2fe" /> Küresel Rekabet Zekası
          </div>
          <span style={{ fontSize: '9px', color: '#64748b' }}>8 boyutta • biz vs küresel devler</span>
        </div>
        {DIMENSIONS.map((d) => {
          const diff = d.us - d.devs;
          return (
            <div key={d.name} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '5px' }}>
              <span style={{ fontSize: '9px', color: '#94a3b8', minWidth: '150px' }}>{d.name}</span>
              <div style={{ flex: 1, display: 'flex', gap: '2px' }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{ flex: 1, height: '8px', borderRadius: '3px', background: i < d.us ? '#00f2fe' : 'rgba(255,255,255,0.05)' }} />
                ))}
              </div>
              <span style={{ fontSize: '8px', color: '#00f2fe', minWidth: '20px', textAlign: 'center', fontWeight: '700' }}>{d.us}</span>
              <div style={{ flex: 1, display: 'flex', gap: '2px' }}>
                {[0, 1, 2].map((i) => (
                  <div key={i} style={{ flex: 1, height: '8px', borderRadius: '3px', background: i < d.devs ? '#64748b' : 'rgba(255,255,255,0.05)' }} />
                ))}
              </div>
              <span style={{ fontSize: '8px', color: '#64748b', minWidth: '20px', textAlign: 'center' }}>{d.devs}</span>
              <span style={{ fontSize: '8px', fontWeight: '700', color: diff > 0 ? '#4ade80' : diff < 0 ? '#f87171' : '#fbbf24', minWidth: '34px', textAlign: 'right' }}>
                {diff > 0 ? `+${diff}` : diff < 0 ? `${diff}` : '='}
              </span>
            </div>
          );
        })}
        <div style={{ display: 'flex', gap: '12px', marginTop: '8px', fontSize: '8px', color: '#64748b' }}>
          <span><span style={{ color: '#00f2fe' }}>■</span> Biz (Sport Vision)</span>
          <span><span style={{ color: '#64748b' }}>■</span> Küresel Devler</span>
          <span style={{ marginLeft: 'auto', color: '#4ade80', fontWeight: '700' }}>🏆 Bütüncül fark: Veli + Okul + Tahlil + Müzik — rakiplerde YOK</span>
        </div>
      </div>

      {/* 🎽 Scouting havuzu */}
      <div style={{ padding: '14px', borderRadius: '16px', background: 'rgba(52,211,153,0.03)', border: '1px solid rgba(52,211,153,0.2)' }}>
        <div style={{ fontSize: '12px', fontWeight: '700', color: '#4ade80', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Target size={14} /> Yetenek Havuzu & Kulüp İhracı
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', marginBottom: '12px' }}>
          {SCOUT_POOL.map((a) => (
            <button
              key={a.id}
              onClick={() => setSelectedAthlete(a)}
              style={{
                textAlign: 'left', cursor: 'pointer', padding: '10px', borderRadius: '12px',
                border: selectedAthlete.id === a.id ? '1px solid rgba(74,222,128,0.5)' : '1px solid rgba(255,255,255,0.1)',
                background: selectedAthlete.id === a.id ? 'rgba(74,222,128,0.1)' : 'rgba(255,255,255,0.02)',
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: '700', color: '#fff' }}>{a.icon} {a.ad} <span style={{ fontSize: '9px', color: '#64748b' }}>{a.yas} yaş • {a.branş}</span></div>
              <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '4px' }}>🧬 Holistik %{a.dev} • 🚀 PHV {a.phv} yıl • 👥 Sosyal %{a.sosyal}</div>
            </button>
          ))}
        </div>


        {/* seçili sporcu scout karnesi */}
        <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(74,222,128,0.25)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center', marginBottom: '10px' }}>
            <span style={{ fontSize: '20px' }}>{selectedAthlete.icon}</span>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>{selectedAthlete.ad} — Scout Karnesi</div>
              <div style={{ fontSize: '9px', color: '#94a3b8' }}>{selectedAthlete.branş} • {selectedAthlete.yas} yaş</div>
            </div>
            <div style={{ marginLeft: 'auto', textAlign: 'center' }}>
              <div style={{ fontSize: '24px', fontWeight: 'bold', color: scoutReadiness > 75 ? '#4ade80' : scoutReadiness > 60 ? '#fbbf24' : '#f87171' }}>%{scoutReadiness}</div>
              <div style={{ fontSize: '8px', color: '#64748b' }}>Scout Hazırlığı</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '9px', color: '#94a3b8' }}>
            <div>🧬 Holistik Gelişim: %{selectedAthlete.dev} • Sosyal: %{selectedAthlete.sosyal} • Ape: {selectedAthlete.ape}</div>
            <div>🚀 PHV Offset: {selectedAthlete.phv} yıl → {determineGrowthPhase(selectedAthlete.phv).label}</div>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
            {['La Masia', 'Ajax Akademi', 'IMG Academy', 'Galatasaray Altyapı'].map((club) => (
              <button
                key={club}
                onClick={() => sendToClub(club)}
                style={{
                  padding: '8px 14px', borderRadius: '20px', cursor: 'pointer', fontSize: '10px', fontWeight: '700',
                  border: sentClubs.includes(club) ? '1px solid rgba(74,222,128,0.5)' : '1px solid rgba(37,211,102,0.4)',
                  background: sentClubs.includes(club) ? 'rgba(74,222,128,0.12)' : 'rgba(37,211,102,0.08)',
                  color: sentClubs.includes(club) ? '#4ade80' : '#25d366',
                }}
              >
                <Send size={10} style={{ display: 'inline', marginRight: 4 }} />
                {sentClubs.includes(club) ? `✓ ${club}` : `Scout → ${club}`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 📚 Doğrulanmış Hareket Kütüphanesi */}
      <div style={{ padding: '14px', borderRadius: '16px', background: 'rgba(167,139,250,0.03)', border: '1px solid rgba(167,139,250,0.2)' }}>
        <div style={{ fontSize: '12px', fontWeight: '700', color: '#a78bfa', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Database size={14} /> Doğrulanmış Hareket Kütüphanesi (Veri Üstünlüğü Hedefi)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '8px' }}>
          {MOVEMENT_LIBRARY.map((m) => (
            <div key={m.id} style={{ padding: '10px', borderRadius: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '10px', fontWeight: '700', color: '#fff' }}>{m.icon} {m.ad}</div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#a78bfa', margin: '4px 0' }}>{m.deger}</div>
              <div style={{ fontSize: '8px', color: '#64748b' }}>{m.veriSayisi} doğrulanmış örnek</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '6px' }}>
                <div style={{ flex: 1, height: '5px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ width: `${m.guven}%`, height: '100%', background: 'linear-gradient(90deg, #a78bfa, #00f2fe)', borderRadius: '3px' }} />
                </div>
                <span style={{ fontSize: '8px', color: '#4ade80', fontWeight: '700' }}>%{m.guven} güven</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Benzersiz fark */}
      <div style={{ padding: '14px', borderRadius: '16px', background: 'linear-gradient(135deg, rgba(0,242,254,0.06), rgba(245,158,11,0.05))', border: '1px solid rgba(0,242,254,0.3)' }}>
        <div style={{ fontSize: '12px', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
          🏆 Benzersiz Pazar Farkı — {selectedAthlete.ad} örneği üzerinden
        </div>
        <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '8px', lineHeight: '1.7' }}>
          Rakipler sporu sadece <b style={{ color: '#64748b' }}>"atletik performans ve skor"</b> olarak görür. Biz; <b style={{ color: '#00f2fe' }}>biyolojik yaş</b> (PHV {selectedAthlete.phv} yıl),
          <b style={{ color: '#4ade80' }}> veli pedagojisi</b> (Q1-Q4), <b style={{ color: '#f59e0b' }}> okul karnesi</b>, <b style={{ color: '#f87171' }}> kan tahlili</b> ve
          <b style={{ color: '#a78bfa' }}> tesis müzik/beslenme ritmini</b> tek potada eriten dünyadaki ilk <b style={{ color: '#fff' }}>Bütüncül Genç Sporcu Gelişim Fabrikası</b>.
        </div>
      </div>
    </div>
  );
}

