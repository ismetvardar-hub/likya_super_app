'use client';

import React, { useState } from 'react';
import { Users, GraduationCap, Calendar, FileText, Star, Award, Sparkles, MessageCircle, Shield } from 'lucide-react';

// ============================================================================
// LİKYA CREW - DİNAMİK PERSONEL OPERASYON MODÜLÜ
// 5 Aşamalı: Onboarding → Akademi → Vardiya → SGK → Performans
// ============================================================================

interface CrewMember {
  id: string;
  name: string;
  skills: string[];
  xp: number;
  fieldScore: number;
  availability: string[];
  status: 'available' | 'shift' | 'training' | 'manager_candidate';
  avatar: string;
}

interface Shift {
  id: string;
  zone: string;
  date: string;
  time: string;
  requiredSkill: string;
  assignedTo: string | null;
  status: 'open' | 'assigned' | 'completed';
}

export default function LikyaCrew() {
  const [members, setMembers] = useState<CrewMember[]>([
    { id: '1', name: 'Ayşe Yılmaz', skills: ['Tırmanış', 'Çocuk İletişimi'], xp: 850, fieldScore: 4.8, availability: ['Cmt', 'Paz'], status: 'available', avatar: '👩' },
    { id: '2', name: 'Mehmet Demir', skills: ['Tiyatro', 'Müzik'], xp: 720, fieldScore: 4.5, availability: ['Cmt', 'Paz'], status: 'available', avatar: '👨' },
    { id: '3', name: 'Zeynep Kaya', skills: ['Bilim Atölyesi', 'Yazılım'], xp: 980, fieldScore: 4.9, availability: ['Cmt', 'Paz', 'Cuma'], status: 'manager_candidate', avatar: '👩' },
    { id: '4', name: 'Ali Şahin', skills: ['Spor', 'Güvenlik'], xp: 450, fieldScore: 4.2, availability: ['Cmt'], status: 'training', avatar: '👨' },
  ]);

  const [shifts, setShifts] = useState<Shift[]>([
    { id: '1', zone: 'Tırmanış Duvarı', date: 'Cumartesi', time: '14:00 - 18:00', requiredSkill: 'Tırmanış', assignedTo: null, status: 'open' },
    { id: '2', zone: 'Çocuk Parkı', date: 'Pazar', time: '10:00 - 14:00', requiredSkill: 'Çocuk İletişimi', assignedTo: null, status: 'open' },
    { id: '3', zone: 'Tiyatro Sahnesi', date: 'Cumartesi', time: '18:00 - 22:00', requiredSkill: 'Tiyatro', assignedTo: null, status: 'open' },
  ]);

  const [notifications, setNotifications] = useState<string[]>([
    'Selam! Cumartesi 14:00 - 18:00 saatleri arasındaki Tırmanış Duvarı vardiyası için harika performansınla ilk sırada sen varsın. Görevi kabul edip harika işler çıkararak Likya ailesine güç katmaya var mısın? 🧗',
  ]);

  const [activeStage, setActiveStage] = useState(1);

  // AŞAMA 3: Akıllı Vardiya Eşleştirmesi
  const matchShift = (shiftId: string) => {
    const shift = shifts.find((s) => s.id === shiftId);
    if (!shift) return;

    // En yüksek puana sahip uygun adayı bul
    const candidate = members
      .filter((m) => m.skills.includes(shift.requiredSkill) && m.status === 'available')
      .sort((a, b) => b.xp - a.xp)[0];

    if (candidate) {
      setShifts((prev) =>
        prev.map((s) => (s.id === shiftId ? { ...s, assignedTo: candidate.name, status: 'assigned' } : s))
      );
      setNotifications((prev) => [
        `🎯 ${candidate.name}, ${shift.zone} vardiyasına atandı! (${shift.date} ${shift.time})`,
        ...prev,
      ]);
    }
  };

  // AŞAMA 5: Performans Puanı
  const completeShift = (shiftId: string) => {
    const shift = shifts.find((s) => s.id === shiftId);
    if (!shift || !shift.assignedTo) return;

    setShifts((prev) =>
      prev.map((s) => (s.id === shiftId ? { ...s, status: 'completed' } : s))
    );

    // Çalışanın XP'sini artır
    setMembers((prev) =>
      prev.map((m) => (m.name === shift.assignedTo ? { ...m, xp: m.xp + 100, fieldScore: Math.min(5, m.fieldScore + 0.1) } : m))
    );

    setNotifications((prev) => [
      `✅ ${shift.assignedTo}, ${shift.zone} vardiyasını tamamladı! +100 XP kazandı. Müşteri memnuniyeti: 4.9 ⭐`,
      ...prev,
    ]);
  };

  const stages = [
    { id: 1, icon: '👋', name: 'Onboarding & AI Mülakat', desc: 'Dinamik CV oluşturma' },
    { id: 2, icon: '🎓', name: 'Likya Akademi', desc: 'XP & Oyunlaştırma' },
    { id: 3, icon: '📅', name: 'Akıllı Vardiya', desc: 'AI Eşleştirme' },
    { id: 4, icon: '📄', name: 'SGK & Sözleşme', desc: 'Yasal Uyum' },
    { id: 5, icon: '⭐', name: 'Performans', desc: 'Adil Ödüllendirme' },
  ];

  return (
    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px', color: '#fff', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', marginTop: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #1e293b' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={20} color="#00f2fe" />
            Likya Crew — Dinamik Personel Operasyonu
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>Adil, liyakat esaslı ve oyunlaştırılmış performans ekonomisi</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: '10px', padding: '6px 12px', fontSize: '12px', color: '#34d399', fontWeight: '600' }}>
            {members.length} Personel
          </div>
          <div style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: '10px', padding: '6px 12px', fontSize: '12px', color: '#fbbf24', fontWeight: '600' }}>
            {shifts.filter((s) => s.status === 'open').length} Açık Vardiya
          </div>
        </div>
      </div>

      {/* 5 Aşamalı Döngü */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {stages.map((s) => (
          <button
            key={s.id}
            onClick={() => setActiveStage(s.id)}
            style={{ padding: '10px 14px', borderRadius: '10px', border: activeStage === s.id ? '1px solid #00f2fe' : '1px solid rgba(255,255,255,0.15)', background: activeStage === s.id ? 'rgba(0,242,254,0.1)' : 'rgba(255,255,255,0.05)', color: activeStage === s.id ? '#00f2fe' : '#94a3b8', fontSize: '11px', fontWeight: '600', cursor: 'pointer', textAlign: 'left' }}
          >
            <div style={{ fontSize: '16px' }}>{s.icon}</div>
            <div style={{ marginTop: '4px' }}>{s.name}</div>
            <div style={{ fontSize: '9px', color: '#64748b' }}>{s.desc}</div>
          </button>
        ))}
      </div>

      {/* AŞAMA 1: Onboarding & AI Mülakat */}
      {activeStage === 1 && (
        <div style={{ marginBottom: '24px', padding: '16px', background: 'rgba(0,242,254,0.05)', border: '1px solid rgba(0,242,254,0.2)', borderRadius: '12px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#00f2fe', marginBottom: '12px' }}>👋 AŞAMA 1: Onboarding & AI Mülakat</h3>
          <div style={{ fontSize: '12px', color: '#cbd5e1', marginBottom: '12px' }}>
            "Çalışmak İstiyorum" seçeneğiyle üye olan kullanıcıları sıcak, naif ve samimi bir dille karşıla. AI mülakatı ile ilgi alanlarını ve yeteneklerini öğren, dinamik CV oluştur.
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <input type="text" placeholder="Yeni personel adı" style={{ flex: 1, minWidth: '150px', padding: '10px 12px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '13px' }} />
            <select style={{ padding: '10px 12px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '13px' }}>
              <option>İlgi Alanı Seç</option>
              <option>Spor</option>
              <option>Tırmanış</option>
              <option>Tiyatro</option>
              <option>Çocuk İletişimi</option>
              <option>Yazılım</option>
              <option>Bilim Atölyesi</option>
            </select>
            <button style={{ padding: '10px 16px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #0f4c81, #00f2fe)', color: '#fff', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>
              <Sparkles size={14} style={{ display: 'inline', marginRight: '4px' }} /> AI Mülakatı Başlat
            </button>
          </div>
        </div>
      )}

      {/* AŞAMA 2: Likya Akademi */}
      {activeStage === 2 && (
        <div style={{ marginBottom: '24px', padding: '16px', background: 'rgba(167,139,250,0.05)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: '12px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#a78bfa', marginBottom: '12px' }}>🎓 AŞAMA 2: Likya Akademi & Oyunlaştırma</h3>
          <div style={{ fontSize: '12px', color: '#cbd5e1', marginBottom: '12px' }}>
            Mikro eğitimler, İSG ve müşteri ağırlama testleri. Tamamlanan her eğitim için XP kazanılır.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {members.map((m) => (
              <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: '10px', padding: '12px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '20px' }}>{m.avatar}</span>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '13px', color: '#f1f5f9' }}>{m.name}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{m.skills.join(', ')}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '12px', color: '#a78bfa', fontWeight: '700' }}>🎓 {m.xp} XP</span>
                  <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '20px', background: m.status === 'manager_candidate' ? 'rgba(251,191,36,0.2)' : 'rgba(52,211,153,0.2)', color: m.status === 'manager_candidate' ? '#fbbf24' : '#34d399', border: `1px solid ${m.status === 'manager_candidate' ? 'rgba(251,191,36,0.3)' : 'rgba(52,211,153,0.3)'}` }}>
                    {m.status === 'manager_candidate' ? '👑 Aday Yönetici' : m.status === 'training' ? '🎓 Eğitimde' : '✅ Hazır'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AŞAMA 3: Akıllı Vardiya */}
      {activeStage === 3 && (
        <div style={{ marginBottom: '24px', padding: '16px', background: 'rgba(251,191,36,0.05)', border: '1px solid rgba(251,191,36,0.2)', borderRadius: '12px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#fbbf24', marginBottom: '12px' }}>📅 AŞAMA 3: Akıllı Vardiya Eşleştirmesi</h3>
          <div style={{ fontSize: '12px', color: '#cbd5e1', marginBottom: '12px' }}>
            İhtiyaç analizi → Skorboard sorgusu → Otomatik davet gönderimi
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {shifts.map((s) => (
              <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: '10px', padding: '12px 16px' }}>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '13px', color: '#f1f5f9' }}>{s.zone}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>{s.date} • {s.time} • Gerekli: {s.requiredSkill}</div>
                  {s.assignedTo && <div style={{ fontSize: '11px', color: '#34d399', marginTop: '4px' }}>👤 {s.assignedTo}</div>}
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '20px', background: s.status === 'open' ? 'rgba(251,191,36,0.2)' : s.status === 'assigned' ? 'rgba(0,242,254,0.2)' : 'rgba(52,211,153,0.2)', color: s.status === 'open' ? '#fbbf24' : s.status === 'assigned' ? '#00f2fe' : '#34d399', border: `1px solid ${s.status === 'open' ? 'rgba(251,191,36,0.3)' : s.status === 'assigned' ? 'rgba(0,242,254,0.3)' : 'rgba(52,211,153,0.3)'}` }}>
                    {s.status === 'open' ? 'Açık' : s.status === 'assigned' ? 'Atandı' : 'Tamamlandı'}
                  </span>
                  {s.status === 'open' && (
                    <button onClick={() => matchShift(s.id)} style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #d97706, #fbbf24)', color: '#000', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>
                      AI Eşleştir
                    </button>
                  )}
                  {s.status === 'assigned' && (
                    <button onClick={() => completeShift(s.id)} style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #10B981, #48bb78)', color: '#fff', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>
                      ✓ Tamamla
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AŞAMA 4: SGK & Sözleşme */}
      {activeStage === 4 && (
        <div style={{ marginBottom: '24px', padding: '16px', background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.2)', borderRadius: '12px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#34d399', marginBottom: '12px' }}>📄 AŞAMA 4: Yasal Mevzuat & Otomatik SGK</h3>
          <div style={{ fontSize: '12px', color: '#cbd5e1', marginBottom: '12px' }}>
            4857 Sayılı İş Kanunu Madde 13'e uygun "Kısmi Süreli / Çağrı Üzerine Çalışma Sözleşmesi" dijital imzayla onaylanır. SGK bildirimi otomatik oluşturulur.
          </div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '200px', padding: '12px', background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: '10px' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '8px' }}>📋 Dijital Sözleşme</div>
              <div style={{ fontSize: '12px', color: '#cbd5e1' }}>Kısmi Süreli Çalışma Sözleşmesi (Madde 13)</div>
              <button style={{ marginTop: '8px', padding: '6px 12px', borderRadius: '8px', border: '1px solid #34d399', background: 'rgba(52,211,153,0.1)', color: '#34d399', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>
                ✍️ Dijital İmzala
              </button>
            </div>
            <div style={{ flex: 1, minWidth: '200px', padding: '12px', background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: '10px' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '8px' }}>🏛️ SGK Bildirimi</div>
              <div style={{ fontSize: '12px', color: '#cbd5e1' }}>Saatlik bordrolama otomatik oluşturulur</div>
              <button style={{ marginTop: '8px', padding: '6px 12px', borderRadius: '8px', border: '1px solid #00f2fe', background: 'rgba(0,242,254,0.1)', color: '#00f2fe', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>
                📊 Bordro Oluştur
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AŞAMA 5: Performans */}
      {activeStage === 5 && (
        <div style={{ marginBottom: '24px', padding: '16px', background: 'rgba(224,122,95,0.05)', border: '1px solid rgba(224,122,95,0.2)', borderRadius: '12px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#e07a5f', marginBottom: '12px' }}>⭐ AŞAMA 5: Saha Performansı & Adil Ödüllendirme</h3>
          <div style={{ fontSize: '12px', color: '#cbd5e1', marginBottom: '12px' }}>
            QR müşteri memnuniyeti + vardiya amiri notları → Saha Performans Puanı. Yüksek puanlı çalışanlara öncelik.
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {members.map((m) => (
              <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: '10px', padding: '12px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '20px' }}>{m.avatar}</span>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '13px', color: '#f1f5f9' }}>{m.name}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>{m.skills.join(', ')}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '12px', color: '#e07a5f', fontWeight: '700' }}>⭐ {m.fieldScore.toFixed(1)}</span>
                  <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '20px', background: m.fieldScore >= 4.8 ? 'rgba(251,191,36,0.2)' : 'rgba(52,211,153,0.2)', color: m.fieldScore >= 4.8 ? '#fbbf24' : '#34d399', border: `1px solid ${m.fieldScore >= 4.8 ? 'rgba(251,191,36,0.3)' : 'rgba(52,211,153,0.3)'}` }}>
                    {m.fieldScore >= 4.8 ? '👑 Öncelikli' : '✅ İyi'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bildirimler */}
      <div style={{ padding: '16px', background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: '12px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0', marginBottom: '12px' }}>🔔 Likya Crew Bildirimleri</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {notifications.map((n, i) => (
            <div key={i} style={{ fontSize: '12px', color: '#cbd5e1', padding: '8px', background: 'rgba(15,23,42,0.6)', borderRadius: '8px' }}>
              {n}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
