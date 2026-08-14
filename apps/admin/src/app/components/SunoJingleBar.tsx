'use client';

import React, { useState } from 'react';
import { Music, Play, Pause, Trophy, Sparkles, CheckCircle2 } from 'lucide-react';

// ============================================================================
// LİKYA SUNO AI DİNAMİK JINGLE & ATMOSFER / GAMIFICATION
// Mağaza doluluk oranına göre fon müziği seçimi + mini macera görev motoru
// ============================================================================

interface TrackOption {
  id: string;
  name: string;
  mood: string;
  fillRange: [number, number];
  color: string;
}

const TRACKS: TrackOption[] = [
  { id: 'zen', name: 'Sunset Zen Dalgası', mood: 'sakin / boş kampüs', fillRange: [0, 25], color: '#00f2fe' },
  { id: 'chill', name: 'Akdeniz Lounge', mood: 'rahat / orta doluluk', fillRange: [25, 55], color: '#34d399' },
  { id: 'vibes', name: 'Neon Kampüs Groove', mood: 'enerjik / yoğun saat', fillRange: [55, 80], color: '#f59e0b' },
  { id: 'party', name: 'Likya Sunset Party Mix', mood: 'maksimum / etkinlik', fillRange: [80, 101], color: '#f87171' },
];

interface Quest {
  id: string;
  title: string;
  xp: number;
  reward: string;
  done: boolean;
  color: string;
}

const QUESTS: Quest[] = [
  { id: 'q1', title: '3 farklı dükkanda alışveriş yap', xp: 150, reward: '🎟️ Kort Ücretsiz', done: true, color: '#48bb78' },
  { id: 'q2', title: 'Upcycling atölyesine eski ekipman bağışla', xp: 200, reward: '🍜 Chef Masası', done: false, color: '#f59e0b' },
  { id: 'q3', title: 'Sabah yüzme turuna katıl', xp: 120, reward: '☕ Termal Kahve', done: false, color: '#00f2fe' },
  { id: 'q4', title: '3 yıldızlı müşteri yorumu bırak', xp: 80, reward: '💎 50 Likya Puanı', done: false, color: '#a78bfa' },
];

export default function SunoJingleBar() {
  const [fill, setFill] = useState(42);
  const [playing, setPlaying] = useState(false);
  const [playerXp, setPlayerXp] = useState(1_240);

  const activeTrack = TRACKS.find((t) => fill >= t.fillRange[0] && fill < t.fillRange[1]) || TRACKS[TRACKS.length - 1];
  const totalXp = QUESTS.reduce((s, q) => s + q.xp, 0);
  const earnedXp = QUESTS.filter((q) => q.done).reduce((s, q) => s + q.xp, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Music size={20} color="#ecc94b" />
            Suno AI Dinamik Jingle &amp; Atmosfer
          </h2>
          <p style={{ fontSize: '12px', color: '#94a3b8' }}>Mağaza Doluluk Oranına Göre Fon Müziği + Mini Macera Motoru</p>
        </div>
        <span style={{ padding: '6px 12px', background: 'rgba(167,139,250,0.15)', color: '#a78bfa', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' }}>
          <Trophy size={12} style={{ display: 'inline' }} /> {playerXp.toLocaleString('tr-TR')} XP
        </span>
      </div>

      {/* Jingle Bar */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(236,201,75,0.1), rgba(0,242,254,0.06))',
        border: '1px solid rgba(236,201,75,0.25)',
        borderRadius: '16px',
        padding: '18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Play/Pause */}
            <button
              onClick={() => setPlaying(!playing)}
              style={{
                width: '44px', height: '44px', borderRadius: '50%', cursor: 'pointer',
                border: `1px solid ${activeTrack.color}`,
                background: `${activeTrack.color}20`,
                color: activeTrack.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: playing ? `0 0 20px ${activeTrack.color}40` : 'none',
              }}
            >
              {playing ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {playing ? '▶' : '⏸'} {activeTrack.name}
                <span style={{ fontSize: '10px', color: activeTrack.color, padding: '3px 8px', borderRadius: '8px', background: `${activeTrack.color}15` }}>
                  Suno AI imzalı
                </span>
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                Atmosfer: {activeTrack.mood} • {playing ? 'çalıyor' : 'duraklatıldı'}
              </div>
            </div>
          </div>
          <div style={{ fontSize: '12px', color: '#e2e8f0', fontWeight: '600' }}>
            Doluluk: <span style={{ color: activeTrack.color }}>%{fill}</span>
          </div>
        </div>

        {/* Doluluk Slider */}
        <input
          type="range"
          min={0}
          max={100}
          value={fill}
          onChange={(e) => setFill(Number(e.target.value))}
          style={{ width: '100%', cursor: 'pointer', accentColor: activeTrack.color }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b' }}>
          <span>🌅 Boş (%0-25) → Zen</span>
          <span>🍹 Orta (%25-55) → Lounge</span>
          <span>⚡ Yoğun (%55-80) → Groove</span>
          <span>🎉 Etkinlik (%80+) → Party</span>
        </div>
      </div>
      {/* Gamification: Mini Macera Görev Motoru */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '14px',
        padding: '16px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>
            🎮 Mini Macera Görev Motoru
          </div>
          <div style={{ fontSize: '11px', color: '#a78bfa', fontWeight: '600' }}>
            {earnedXp}/{totalXp} XP tamamlandı
          </div>
        </div>

        {/* XP ilerleme çubuğu */}
        <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', overflow: 'hidden', marginBottom: '14px' }}>
          <div style={{
            width: `${(earnedXp / totalXp) * 100}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #a78bfa, #00f2fe)',
            borderRadius: '6px',
            boxShadow: '0 0 10px rgba(167,139,250,0.5)',
            transition: 'width 0.6s ease',
          }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
          {QUESTS.map((q) => (
            <div key={q.id} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              background: q.done ? `${q.color}10` : 'rgba(255,255,255,0.02)',
              border: `1px solid ${q.done ? `${q.color}40` : 'rgba(255,255,255,0.08)'}`,
              borderRadius: '12px', padding: '12px',
            }}>
              {q.done
                ? <CheckCircle2 size={18} color="#48bb78" />
                : <Sparkles size={18} color={q.color} />}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#fff' }}>{q.title}</div>
                <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                  +{q.xp} XP • Ödül: {q.reward}
                </div>
              </div>
              <span style={{
                fontSize: '9px', fontWeight: '700', padding: '3px 8px', borderRadius: '8px', textTransform: 'uppercase',
                color: q.done ? '#48bb78' : '#64748b',
                background: q.done ? 'rgba(72,187,120,0.12)' : 'rgba(255,255,255,0.04)',
              }}>
                {q.done ? 'Tamam' : 'Aktif'}
              </span>
            </div>
          ))}
        </div>

        {/* Rozetler */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
          {[
            { icon: '🔥', label: '5 Gün Seri' },
            { icon: '⚡', label: 'Hızlı Turist' },
            { icon: '🍽️', label: 'Lezzet Avcısı' },
            { icon: '🌊', label: 'Sahil Ruhu' },
            { icon: '💎', label: '1.240 XP Toplayıcı' },
          ].map((b) => (
            <span key={b.label} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 12px', borderRadius: '20px', fontSize: '10px', fontWeight: '600',
              background: 'rgba(236,201,75,0.1)', color: '#ecc94b',
              border: '1px solid rgba(236,201,75,0.25)',
            }}>
              {b.icon} {b.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

