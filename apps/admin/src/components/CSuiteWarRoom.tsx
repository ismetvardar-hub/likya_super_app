'use client';

import React, { useState } from 'react';

interface WarRoomDebate {
  id: string;
  topic: string;
  initiator: string;
  consensusScore: number;
  status: 'debating' | 'approved' | 'executed';
  statements: { agent: string; role: string; stance: 'support' | 'neutral' | 'caution'; statement: string; avatar: string }[];
}

export default function CSuiteWarRoom() {
  const [debates, setDebates] = useState<WarRoomDebate[]>([
    {
      id: 'WAR-101',
      topic: 'Kaş/Kalkan Eko-Kampüsüne 500 kW Yeni GES Santrali & 10 Kargo Dronu Yatırımı',
      initiator: 'CTO Helios-Tech & COO Vortex-Ops',
      consensusScore: 96.5,
      status: 'approved',
      statements: [
        { agent: 'Helios-Tech', role: 'CTO (Enerji)', stance: 'support', statement: 'Güneşlenme verileri yıllık %34 verim artışı öngörüyor. Mikro-şebeke bataryaları 140 kW/saat fazlayı depolayabilir.', avatar: '☀️' },
        { agent: 'Aura-Fin', role: 'CFO (Finans)', stance: 'support', statement: 'Hazine fonumuzda 180,000 LKY Coin likidite mevcut. Yatırımın kendini amorti süresi 11.4 ay.', avatar: '💎' },
        { agent: 'Gaia-Eco', role: 'CSO (Ekoloji)', stance: 'support', statement: 'Yılda ilave 18.2 Ton CO₂ önlenecek. Ekolojik etki analiz raporu sıfır karbon uyumlu.', avatar: '🌿' },
        { agent: 'Lyra-Creative', role: 'CMO (Kültür)', stance: 'support', statement: 'Doğa yürüyüşçüleri ve festival ziyaretçileri için kesintisiz yeşil enerji imajı holding değerini artırır.', avatar: '🎭' },
        { agent: 'Jarvis Core', role: 'Sovereign CEO Core', stance: 'support', statement: 'Çoklu imza (Multi-Sig) konsensüsü sağlandı. Yatırım direktifi otonom olarak yürürlüğe konuldu.', avatar: '🎙️' },
      ],
    },
  ]);

  const [activeDebate, setActiveDebate] = useState<WarRoomDebate>(debates[0]);

  const triggerNewWarRoomDebate = () => {
    alert('⚔️ Yeni C-Suite War Room müzakeresi başlatıldı. 6 yapay zeka ajanı eşzamanlı simülasyon yürütüyor!');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Üst Başlık */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(15, 76, 129, 0.4), rgba(0, 242, 254, 0.2))',
          border: '1px solid rgba(0, 242, 254, 0.4)',
          borderRadius: '20px',
          padding: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '28px' }}>⚔️</span>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'white' }}>
              LİKYA HOLDİNG C-SUITE AI WAR ROOM & ÇOKLU AJAN KONSENSÜSÜ
            </h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '6px' }}>
            6 C-Level yapay zeka liderinin (CFO, COO, CTO, CSO, CMO ve CEO Jarvis) holding kararlarını otonom tartıştığı savaş odası.
          </p>
        </div>

        <button
          onClick={triggerNewWarRoomDebate}
          style={{
            background: 'linear-gradient(135deg, var(--primary-blue), var(--accent-cyan))',
            border: 'none',
            color: 'white',
            padding: '12px 20px',
            borderRadius: '12px',
            fontWeight: 'bold',
            fontSize: '13px',
            cursor: 'pointer',
            boxShadow: '0 6px 18px rgba(0, 242, 254, 0.35)',
          }}
        >
          ⚔️ Yeni War Room Müzakeresi Başlat
        </button>
      </div>

      {/* Müzakere Başlığı ve Ajan Tartışma Akışı */}
      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '14px' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: 'bold' }}>{activeDebate.id} • BAŞLATAN: {activeDebate.initiator}</div>
            <h3 style={{ fontSize: '17px', fontWeight: 'bold', color: 'white', marginTop: '4px' }}>{activeDebate.topic}</h3>
          </div>
          <span
            style={{
              background: 'rgba(72, 187, 120, 0.2)',
              color: 'var(--accent-green)',
              padding: '6px 12px',
              borderRadius: '8px',
              fontWeight: 'bold',
              fontSize: '12px',
            }}
          >
            KONSENSÜS ONAYLANDI (%{activeDebate.consensusScore}) ✅
          </span>
        </div>

        {/* Ajan Beyanları Listesi */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {activeDebate.statements.map((stmt, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(0,0,0,0.25)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '14px',
                padding: '14px 18px',
                display: 'flex',
                gap: '14px',
                alignItems: 'flex-start',
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                }}
              >
                {stmt.avatar}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'white' }}>{stmt.agent}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>({stmt.role})</span>
                  </div>
                  <span style={{ fontSize: '11px', color: 'var(--accent-green)', fontWeight: 'bold' }}>[MUTABAKAT SAĞLANDI]</span>
                </div>
                <p style={{ fontSize: '13px', color: '#cbd5e1', marginTop: '6px', lineHeight: '1.5' }}>{stmt.statement}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
