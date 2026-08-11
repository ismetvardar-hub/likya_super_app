'use client';

import React, { useState } from 'react';
import { Activity, Heart, Shield, Mic, TrendingUp, AlertTriangle, Users, Camera, Trophy, Bed, Zap, Scale, BookOpen, Brain, Watch } from 'lucide-react';

// ============================================================================
// LİKYA ATHLETE AI & BIOMETRIC PERFORMANCE SYSTEM (4 KATMANLI MİMARİ)
// Katman 1: Akademik Literatür | Katman 2: Computer Vision
// Katman 3: Hibrit İnsan-AI | Katman 4: Wearable Veri Köprüsü
// ============================================================================

interface Athlete {
  id: string;
  name: string;
  sport: string;
  hr: number;
  hrv: number;
  vo2max: number;
  fatigue: number;
  injuryRisk: number;
  biomechScore: number;
  acwr: number;
  readiness: number;
  asymmetry: number;
  distance: number;
  xp: number;
  status: 'active' | 'rest' | 'warning';
}

interface Drill {
  id: string;
  name: string;
  sport: string;
  intensity: 'low' | 'medium' | 'high';
  duration: string;
  description: string;
}

interface CoachProgram {
  id: string;
  coach: string;
  goal: string;
  drill: string;
  status: 'planned' | 'active' | 'completed';
}

export default function AthletePerformanceAI() {
  const [activeTab, setActiveTab] = useState<'athlete' | 'coach' | 'assistant' | 'gamification' | 'architecture'>('athlete');

  const [athletes, setAthletes] = useState<Athlete[]>([
    { id: '1', name: 'Ahmet Yılmaz', sport: 'Basketbol', hr: 185, hrv: 42, vo2max: 48, fatigue: 72, injuryRisk: 85, biomechScore: 78, acwr: 1.8, readiness: 45, asymmetry: 18, distance: 8.2, xp: 1250, status: 'warning' },
    { id: '2', name: 'Ayşe Kaya', sport: 'Tırmanış', hr: 145, hrv: 58, vo2max: 52, fatigue: 45, injuryRisk: 30, biomechScore: 88, acwr: 1.1, readiness: 78, asymmetry: 6, distance: 4.5, xp: 980, status: 'active' },
    { id: '3', name: 'Mehmet Demir', sport: 'Fitness', hr: 160, hrv: 50, vo2max: 50, fatigue: 55, injuryRisk: 40, biomechScore: 82, acwr: 1.3, readiness: 65, asymmetry: 10, distance: 6.1, xp: 1100, status: 'active' },
    { id: '4', name: 'Zeynep Şahin', sport: 'Tenis', hr: 150, hrv: 55, vo2max: 49, fatigue: 38, injuryRisk: 25, biomechScore: 90, acwr: 0.9, readiness: 85, asymmetry: 4, distance: 5.3, xp: 1450, status: 'rest' },
  ]);

  const [drills, setDrills] = useState<Drill[]>([
    { id: '1', name: 'Serbest Atış Açı Optimizasyonu', sport: 'Basketbol', intensity: 'medium', duration: '20 dk', description: 'NSCA protokolü — dirsek açısı 90° + diz gücü aktarımı' },
    { id: '2', name: 'Tırmanış Postür Dengeleme', sport: 'Tırmanış', intensity: 'high', duration: '30 dk', description: 'OpenSim biyomekanik model — ağırlık merkezi kalçaya aktarım' },
    { id: '3', name: 'Sprint Interval (Zone 4-5)', sport: 'Fitness', intensity: 'high', duration: '25 dk', description: 'ACSM protokolü — 50m sprint %100 güç, HRV 85+ şart' },
    { id: '4', name: 'Tenis Reaksiyon Drili', sport: 'Tenis', intensity: 'medium', duration: '15 dk', description: 'ITF kondisyon — savunma reaksiyon idmanı' },
  ]);

  const [coachPrograms, setCoachPrograms] = useState<CoachProgram[]>([
    { id: '1', coach: 'Başantrenör Kemal', goal: 'Savunma reaksiyon idmanı', drill: '3. set sonrası reaksiyon drili', status: 'active' },
    { id: '2', coach: 'Kondisyoner Elif', goal: 'Yüzme sprint seti', drill: '50m sprint %100 güç (HRV 85+)', status: 'planned' },
  ]);

  const [feedbacks, setFeedbacks] = useState<string[]>([
    '💡 "Harika bir deneme! Ancak topu fırlatırken bileğin biraz erken büküldü. Şutta dizlerinden biraz daha güç alırsan o top mışıl mışıl fileden geçecek! 🏀"',
    '💡 "Sol ayağının basma açısı harikaydı fakat sağ omzuna biraz fazla yük bindi. Bir sonraki hamlede ağırlığını kalçana verirsen kolların hiç yorulmayacak! 🧗"',
    '🌟 "Bugün ciğerlerin adeta bir orman gibi taze! Nabız toparlanma hızın geçen haftaya göre %12 arttı! 🌲"',
  ]);

  const [coachAlerts, setCoachAlerts] = useState<string[]>([
    '⚠️ Oyuncu #8 (Ahmet) şut atarken sağ dizine binen yük tehlikeli sınıra ulaştı. Nabzı 185 bpm. AI Tavsiyesi: 5 dakika dinlendirilmeli.',
    '🔴 #10 Numaralı Oyuncunun laktat seviyesi 4. bölgeyi geçti, 3 dakika kenara almalısın.',
    '🟡 #4 Numaralı Oyuncunun serbest atışlarda diz esnetme açısı bozuldu, yorgunluğa bağlı teknik kayıp başladı.',
  ]);

  const [assistantMessages, setAssistantMessages] = useState<string[]>([
    '🎧 "Ahmet, harika gidiyorsun! Nabzın biraz yükseldi, 30 saniye nefes alıp toparlan. Sonra o şutu mışıl mışıl atacaksın!"',
    '🎧 "Ayşe, bugün akciğerlerin tam bir fırtına! Geçen haftaya göre depar atma hızın %8 arttı, tebrikler!"',
  ]);

  const getStatusColor = (a: Athlete) => {
    if (a.injuryRisk > 70) return '#f87171';
    if (a.fatigue > 60) return '#fbbf24';
    return '#34d399';
  };

  const getACWRColor = (acwr: number) => {
    if (acwr > 1.5) return '#f87171';
    if (acwr > 1.2) return '#fbbf24';
    return '#34d399';
  };

  const getIntensityColor = (i: Drill['intensity']) => {
    switch (i) {
      case 'high': return '#f87171';
      case 'medium': return '#fbbf24';
      case 'low': return '#34d399';
    }
  };

  return (
    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px', color: '#fff', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', marginTop: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #1e293b' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={20} color="#00f2fe" />
            Athlete AI & Biometric Performance System (4 Katmanlı)
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>Akademik Literatür • Computer Vision • Hibrit İnsan-AI • Wearable</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: '10px', padding: '6px 12px', fontSize: '12px', color: '#34d399', fontWeight: '600' }}>
            🎥 {athletes.length} Sporcu İzleniyor
          </div>
          <div style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: '10px', padding: '6px 12px', fontSize: '12px', color: '#fbbf24', fontWeight: '600' }}>
            🛡️ KVKK Uyumlu
          </div>
        </div>
      </div>

      {/* Tab Anahtarı */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button onClick={() => setActiveTab('athlete')} style={{ padding: '10px 16px', borderRadius: '10px', border: activeTab === 'athlete' ? '1px solid #00f2fe' : '1px solid rgba(255,255,255,0.15)', background: activeTab === 'athlete' ? 'rgba(0,242,254,0.1)' : 'rgba(255,255,255,0.05)', color: activeTab === 'athlete' ? '#00f2fe' : '#94a3b8', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
          🏃 Sporcu
        </button>
        <button onClick={() => setActiveTab('coach')} style={{ padding: '10px 16px', borderRadius: '10px', border: activeTab === 'coach' ? '1px solid #fbbf24' : '1px solid rgba(255,255,255,0.15)', background: activeTab === 'coach' ? 'rgba(251,191,36,0.1)' : 'rgba(255,255,255,0.05)', color: activeTab === 'coach' ? '#fbbf24' : '#94a3b8', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
          📋 Antrenör
        </button>
        <button onClick={() => setActiveTab('assistant')} style={{ padding: '10px 16px', borderRadius: '10px', border: activeTab === 'assistant' ? '1px solid #a78bfa' : '1px solid rgba(255,255,255,0.15)', background: activeTab === 'assistant' ? 'rgba(167,139,250,0.1)' : 'rgba(255,255,255,0.05)', color: activeTab === 'assistant' ? '#a78bfa' : '#94a3b8', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
          🎧 AI Asistan
        </button>
        <button onClick={() => setActiveTab('gamification')} style={{ padding: '10px 16px', borderRadius: '10px', border: activeTab === 'gamification' ? '1px solid #34d399' : '1px solid rgba(255,255,255,0.15)', background: activeTab === 'gamification' ? 'rgba(52,211,153,0.1)' : 'rgba(255,255,255,0.05)', color: activeTab === 'gamification' ? '#34d399' : '#94a3b8', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
          🏆 Oyunlaştırma
        </button>
        <button onClick={() => setActiveTab('architecture')} style={{ padding: '10px 16px', borderRadius: '10px', border: activeTab === 'architecture' ? '1px solid #fbbf24' : '1px solid rgba(255,255,255,0.15)', background: activeTab === 'architecture' ? 'rgba(251,191,36,0.1)' : 'rgba(255,255,255,0.05)', color: activeTab === 'architecture' ? '#fbbf24' : '#94a3b8', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
          🧠 4 Katmanlı Mimari
        </button>
      </div>

      {/* Tab 1: Sporcu */}
      {activeTab === 'athlete' && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0', marginBottom: '12px' }}>🏃 Sporcu Biyometrik Verileri</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {athletes.map((a) => (
              <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(30,41,59,0.6)', border: `1px solid ${getStatusColor(a)}`, borderRadius: '10px', padding: '12px 16px' }}>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '13px', color: '#f1f5f9' }}>{a.name} • {a.sport}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                    ❤️ Nabız: {a.hr} bpm • HRV: {a.hrv} ms • VO2 Max: {a.vo2max}
                  </div>
                  <div style={{ fontSize: '11px', color: '#00f2fe', marginTop: '4px' }}>
                    🎯 Biyomekanik: {a.biomechScore}/100 • 📏 Asimetri: %{a.asymmetry} • 🏃 {a.distance} km
                  </div>
                  <div style={{ fontSize: '11px', color: getACWRColor(a.acwr), marginTop: '4px' }}>
                    ⚖️ ACWR: {a.acwr.toFixed(1)} • 😴 Readiness: %{a.readiness}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '20px', background: a.injuryRisk > 70 ? 'rgba(248,113,113,0.2)' : 'rgba(52,211,153,0.2)', color: a.injuryRisk > 70 ? '#f87171' : '#34d399', border: `1px solid ${a.injuryRisk > 70 ? 'rgba(248,113,113,0.3)' : 'rgba(52,211,153,0.3)'}` }}>
                    {a.injuryRisk > 70 ? '⚠️ Sakatlık Riski' : '✅ Güvende'}
                  </span>
                  <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '20px', background: a.fatigue > 60 ? 'rgba(251,191,36,0.2)' : 'rgba(52,211,153,0.2)', color: a.fatigue > 60 ? '#fbbf24' : '#34d399', border: `1px solid ${a.fatigue > 60 ? 'rgba(251,191,36,0.3)' : 'rgba(52,211,153,0.3)'}` }}>
                    Yorgunluk: %{a.fatigue}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0', margin: '20px 0 12px' }}>💬 Naif Teknik Düzeltmeler</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {feedbacks.map((f, i) => (
              <div key={i} style={{ padding: '12px', background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '10px', fontSize: '12px', color: '#cbd5e1' }}>
                {f}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Antrenör */}
      {activeTab === 'coach' && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0', marginBottom: '12px' }}>📋 Antrenör Paneli — Canlı Yorgunluk Haritası</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {athletes.map((a) => (
              <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: '10px', padding: '12px 16px' }}>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '13px', color: '#f1f5f9' }}>{a.name}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>{a.sport} • Nabız: {a.hr} bpm • Koşu: {a.distance} km</div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{ width: '100px', height: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${a.fatigue}%`, height: '100%', background: getStatusColor(a), borderRadius: '4px' }}></div>
                  </div>
                  <span style={{ fontSize: '11px', color: getStatusColor(a), fontWeight: '600' }}>%{a.fatigue}</span>
                </div>
              </div>
            ))}
          </div>

          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0', margin: '20px 0 12px' }}>🤖 "Şimdi Bunu Yap" AI Teklifleri</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {coachAlerts.map((alert, i) => (
              <div key={i} style={{ padding: '12px', background: 'rgba(248,113,113,0.05)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: '10px', fontSize: '12px', color: '#cbd5e1' }}>
                {alert}
              </div>
            ))}
          </div>

          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0', margin: '20px 0 12px' }}>📚 Kulübe Özel Driller (Hibrit İnsan-AI)</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {coachPrograms.map((p) => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: '10px', padding: '12px 16px' }}>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '13px', color: '#f1f5f9' }}>{p.coach}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>🎯 {p.goal} • 📋 {p.drill}</div>
                </div>
                <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '20px', background: p.status === 'active' ? 'rgba(0,242,254,0.2)' : 'rgba(148,163,184,0.2)', color: p.status === 'active' ? '#00f2fe' : '#94a3b8', border: `1px solid ${p.status === 'active' ? 'rgba(0,242,254,0.3)' : 'rgba(148,163,184,0.3)'}` }}>
                  {p.status === 'active' ? '🔄 Aktif' : '📋 Planlandı'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: AI Asistan */}
      {activeTab === 'assistant' && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0', marginBottom: '12px' }}>🎧 AI Sesli/Yazılı Asistan (D&D Nezaket Standardı)</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {assistantMessages.map((m, i) => (
              <div key={i} style={{ padding: '12px', background: 'rgba(167,139,250,0.05)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: '10px', fontSize: '12px', color: '#cbd5e1' }}>
                {m}
              </div>
            ))}
          </div>
          <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: '10px' }}>
            <div style={{ fontSize: '11px', color: '#34d399', fontWeight: '600', marginBottom: '4px' }}>🛡️ KVKK / Kişisel Veri Güvenliği</div>
            <div style={{ fontSize: '12px', color: '#cbd5e1' }}>
              • Açık Rıza: "Sporcu Biyometrik Veri ve Görüntü İşleme İzin Metni" onayı zorunlu
              • Anonimleştirme: Tesis dışı yayınlarda yüzler ve biyometrik veriler anonimleştirilir
              • Veri Mülkiyeti: Veriler sadece sporcuya ve izin verdiği antrenöre özeldir
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Oyunlaştırma */}
      {activeTab === 'gamification' && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0', marginBottom: '12px' }}>🏆 Atletik Performans XP & Skorboard</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[...athletes].sort((a, b) => b.xp - a.xp).map((a, idx) => (
              <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: '10px', padding: '12px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '18px' }}>{idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `${idx + 1}.`}</span>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '13px', color: '#f1f5f9' }}>{a.name}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{a.sport}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '12px', color: '#34d399', fontWeight: '700' }}>🏆 {a.xp} XP</span>
                  <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '20px', background: a.xp > 1300 ? 'rgba(251,191,36,0.2)' : 'rgba(52,211,153,0.2)', color: a.xp > 1300 ? '#fbbf24' : '#34d399', border: `1px solid ${a.xp > 1300 ? 'rgba(251,191,36,0.3)' : 'rgba(52,211,153,0.3)'}` }}>
                    {a.xp > 1300 ? '👑 İlk 11 Adayı' : '✅ Gelişiyor'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: 4 Katmanlı Mimari */}
      {activeTab === 'architecture' && (
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0', marginBottom: '12px' }}>🧠 4 Katmanlı Veri & Algoritma Mimarisi</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ padding: '16px', background: 'rgba(0,242,254,0.05)', border: '1px solid rgba(0,242,254,0.2)', borderRadius: '12px' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#00f2fe', marginBottom: '8px' }}>📚 Katman 1: Dünya Spor Literatürü & Akademik Veritabanları</div>
              <div style={{ fontSize: '12px', color: '#cbd5e1' }}>
                • NSCA / ACSM / FIFA / FIBA / ITF kondisyon protokolleri
                • OpenSim & BiomechDB insan-kinematik veritabanları
                • 10.000+ mikro ve makro idman drili kütüphanesi
              </div>
            </div>
            <div style={{ padding: '16px', background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: '12px' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#34d399', marginBottom: '8px' }}>🎥 Katman 2: Computer Vision & Yerinde Oyun</div>
              <div style={{ fontSize: '12px', color: '#cbd5e1' }}>
                • Pose Estimation (3D Eklem Takibi) — milisaniyelik açı taraması
                • Açı Farkı = Düzeltme Notu (ideal açı vs mevcut açı)
                • Teknik Kayıp Tespiti (laktat artışı / Zone 4-5)
              </div>
            </div>
            <div style={{ padding: '16px', background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '12px' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#fbbf24', marginBottom: '8px' }}>🤝 Katman 3: Hibrit İnsan-Yapay Zeka (Human-in-the-Loop)</div>
              <div style={{ fontSize: '12px', color: '#cbd5e1' }}>
                • Antrenör kendi metodolojisini yükler: "Bugün 3. set sonrası savunma reaksiyon idmanı"
                • AI, Readiness (HRV) puanına göre idman şiddetini kişiselleştirir
              </div>
            </div>
            <div style={{ padding: '16px', background: 'rgba(167,139,250,0.05)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: '12px' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', color: '#a78bfa', marginBottom: '8px' }}>⌚ Katman 4: Giyilebilir Cihaz & Biyometrik Veri Köprüsü</div>
              <div style={{ fontSize: '12px', color: '#cbd5e1' }}>
                • Apple HealthKit / Garmin Connect / Strava / BLE entegrasyonu
                • Canlı nabız, kalori, VO2 Max, uyku verileri
                • Antrenman programının o günkü şiddetini anlık belirler
              </div>
            </div>
          </div>

          {/* Dril Kütüphanesi */}
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0', margin: '20px 0 12px' }}>📋 Branş Bazlı Antrenman Kütüphanesi</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {drills.map((d) => (
              <div key={d.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: '10px', padding: '12px 16px' }}>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '13px', color: '#f1f5f9' }}>{d.name} • {d.sport}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>{d.description}</div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '20px', background: 'rgba(255,255,255,0.1)', color: getIntensityColor(d.intensity), border: `1px solid ${getIntensityColor(d.intensity)}` }}>
                    {d.intensity === 'high' ? '🔴 Yüksek' : d.intensity === 'medium' ? '🟡 Orta' : '🟢 Düşük'}
                  </span>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>⏰ {d.duration}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
