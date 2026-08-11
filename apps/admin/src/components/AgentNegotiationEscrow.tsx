'use client';

import React, { useState } from 'react';

interface NegotiationSession {
  id: string;
  item: string;
  sellerAgent: string;
  buyerAgent: string;
  initialPrice: number;
  agreedPrice: number | null;
  status: 'negotiating' | 'escrow_locked' | 'dispatched' | 'completed';
  chatLogs: { agent: string; message: string; time: string }[];
}

export default function AgentNegotiationEscrow() {
  const [sessions, setSessions] = useState<NegotiationSession[]>([
    {
      id: 'NEG-801',
      item: 'Organik Toros Zeytinyağı 5L Teneke 🫒',
      sellerAgent: 'Aura-Merchant (Satıcı AI)',
      buyerAgent: 'Student-Bot (Alıcı AI)',
      initialPrice: 950,
      agreedPrice: 880,
      status: 'escrow_locked',
      chatLogs: [
        { agent: 'Alıcı AI', message: 'Merhaba, 5L zeytinyağı için 850 TL + 20 Likya Coin takas teklif ediyorum.', time: '14:20' },
        { agent: 'Satıcı AI', message: 'Ürün soğuk sıkım erken hasattır. En son 880 TL + 10 Likya Coin olarak anlaşabiliriz.', time: '14:21' },
        { agent: 'Alıcı AI', message: 'Teklif kabul edildi. Akıllı sözleşme emanet havuzuna (Escrow) 880 TL kilitlendi.', time: '14:21' },
        { agent: 'Likya Escrow Protokolü', message: '🔒 Güvenli Emanet Fonu Bloke Edildi. Kargo Rover #1 teslimata yönlendirildi.', time: '14:22' },
      ],
    },
    {
      id: 'NEG-802',
      item: 'Tamir Edilmiş ThinkPad T480 Anakart 💻',
      sellerAgent: 'Maker-Recycle AI',
      buyerAgent: 'Engineer-Buyer AI',
      initialPrice: 1200,
      agreedPrice: 1050,
      status: 'dispatched',
      chatLogs: [
        { agent: 'Alıcı AI', message: 'Anakart lehim kontrolleri ve BIOS testleri tamam mı?', time: '13:05' },
        { agent: 'Satıcı AI', message: 'Tüm test raporları cihaz üstü Edge AI ile doğrulandı. 1050 TL uygun.', time: '13:06' },
        { agent: 'Likya Escrow Protokolü', message: '📦 Ürün Akıllı Dolap Hub #3 gözüne bırakıldı.', time: '13:08' },
      ],
    },
  ]);

  const [activeSession, setActiveSession] = useState<NegotiationSession>(sessions[0]);

  const releaseEscrow = (id: string) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              status: 'completed',
              chatLogs: [
                ...s.chatLogs,
                { agent: 'Likya Escrow Protokolü', message: '✅ Alıcı teslimatı onayladı. Bakiye satıcı cüzdanına aktarıldı.', time: 'Şimdi' },
              ],
            }
          : s
      )
    );
    alert('Emanet havuzundaki bakiye serbest bırakıldı ve satıcıya aktarıldı!');
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', gap: '20px' }}>
      {/* Sol Liste */}
      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '18px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: 'white', marginBottom: '14px' }}>
          🤖 Otonom Takas & Pazarlıklar
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {sessions.map((s) => {
            const isSelected = activeSession.id === s.id;
            return (
              <div
                key={s.id}
                onClick={() => setActiveSession(s)}
                style={{
                  padding: '14px',
                  borderRadius: '14px',
                  background: isSelected ? 'rgba(0, 242, 254, 0.1)' : 'rgba(255, 255, 255, 0.03)',
                  border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid rgba(255, 255, 255, 0.06)',
                  cursor: 'pointer',
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'white' }}>{s.item}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '11px' }}>
                  <span style={{ color: 'var(--text-muted)' }}>{s.id}</span>
                  <span
                    style={{
                      color: s.status === 'completed' ? 'var(--accent-green)' : 'var(--accent-orange)',
                      fontWeight: 'bold',
                    }}
                  >
                    {s.status === 'completed' ? 'TAMAMLANDI ✅' : s.status === 'escrow_locked' ? 'ESCROW BLOKE 🔒' : 'YOLDA 🛸'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sağ Detay & Canlı Loglar */}
      <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', color: 'white' }}>{activeSession.item}</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                {activeSession.sellerAgent} ⚔️ {activeSession.buyerAgent}
              </p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Anlaşılan Tutar</div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--accent-green)' }}>₺{activeSession.agreedPrice}</div>
            </div>
          </div>

          {/* Chat / Pazarlık Logu */}
          <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '14px', padding: '16px', maxHeight: '280px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {activeSession.chatLogs.map((log, idx) => (
              <div key={idx} style={{ padding: '8px 12px', borderRadius: '10px', background: log.agent.includes('Escrow') ? 'rgba(72, 187, 120, 0.15)' : 'rgba(255,255,255,0.04)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: 'bold' }}>
                  <span>{log.agent}</span>
                  <span style={{ color: 'var(--text-muted)' }}>{log.time}</span>
                </div>
                <div style={{ fontSize: '13px', color: 'white', marginTop: '4px' }}>{log.message}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Aksiyon Barı */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '16px' }}>
          {activeSession.status !== 'completed' && (
            <button
              onClick={() => releaseEscrow(activeSession.id)}
              style={{
                background: 'linear-gradient(135deg, var(--primary-blue), var(--accent-green))',
                border: 'none',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '10px',
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              🔓 Emanet Fonunu Serbest Bırak (Escrow Release)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
