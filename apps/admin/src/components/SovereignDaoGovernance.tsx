'use client';

import React, { useState } from 'react';

interface DaoProposal {
  id: string;
  title: string;
  category: 'ecology' | 'infrastructure' | 'culture';
  requestedBudget: string;
  votesFor: number;
  votesAgainst: number;
  status: 'active' | 'passed' | 'executing';
  description: string;
  voted?: boolean;
}

export default function SovereignDaoGovernance() {
  const [proposals, setProposals] = useState<DaoProposal[]>([
    {
      id: 'LKY-DAO-01',
      title: 'Toros Sedir Ormanına 5,000 Yeni Fidan Dikimi 🌲',
      category: 'ecology',
      requestedBudget: '50,000 LKY Coin (CSO Fonundan)',
      votesFor: 1240,
      votesAgainst: 42,
      status: 'passed',
      description: 'Ekoloji kulübü ve yerel halkla birlikte Phaselis ve Olympos arasındaki koruma kuşağına sedir ve defne ağaçları dikilsin.',
    },
    {
      id: 'LKY-DAO-02',
      title: 'Kaş / Kalkan Eko-Kampüsüne 10 Adet Yeni Solar E-Bisiklet Şarj İstasyonu ⚡🚲',
      category: 'infrastructure',
      requestedBudget: '35,000 LKY Coin (CTO Fonundan)',
      votesFor: 890,
      votesAgainst: 110,
      status: 'active',
      description: 'Öğrenci ve doğa yürüyüşçülerinin ücretsiz kullanabileceği %100 güneş enerjili mikro-şarj durakları kurulsun.',
    },
  ]);

  const castVote = (id: string, isYes: boolean) => {
    setProposals((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              votesFor: isYes ? p.votesFor + 10 : p.votesFor,
              votesAgainst: !isYes ? p.votesAgainst + 10 : p.votesAgainst,
              voted: true,
            }
          : p
      )
    );
    alert('🗳️ W3C DID Eko-Vatandaşlık Kimliğinizle oyunuz blokzincire işlendi! (+10 Oy Gücü)');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Üst Başlık & Hazine Durumu */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(72, 187, 120, 0.2), rgba(15, 76, 129, 0.4))',
          border: '1px solid rgba(72, 187, 120, 0.4)',
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
            <span style={{ fontSize: '28px' }}>🗳️</span>
            <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'white' }}>
              LİKYA SOVEREIGN TOPLULUK EKO-DAO YÖNETİŞİM MERKEZİ
            </h2>
          </div>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '6px' }}>
            Vatandaşların Likya Coin ve W3C DID kimlikleriyle holding hazine bütçesini doğrudan oyladığı merkeziyetsiz demokrasi.
          </p>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Topluluk DAO Hazine Havuzu</div>
          <div style={{ fontSize: '22px', fontWeight: 'bold', color: 'var(--accent-green)' }}>240,000 LKY Coin 💎</div>
        </div>
      </div>

      {/* Teklif Kartları */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {proposals.map((prop) => {
          const totalVotes = prop.votesFor + prop.votesAgainst;
          const yesPercent = Math.round((prop.votesFor / totalVotes) * 100);
          return (
            <div
              key={prop.id}
              style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '18px',
                padding: '22px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--accent-cyan)', fontWeight: 'bold' }}>{prop.id}</span>
                  <span style={{ fontWeight: 'bold', color: 'white', fontSize: '16px' }}>{prop.title}</span>
                </div>
                <span
                  style={{
                    background: prop.status === 'passed' ? 'rgba(72, 187, 120, 0.2)' : 'rgba(0, 242, 254, 0.2)',
                    color: prop.status === 'passed' ? 'var(--accent-green)' : 'var(--accent-cyan)',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                  }}
                >
                  {prop.status === 'passed' ? 'KABUL EDİLDİ & FONLANDI ✅' : 'OYLAMA AÇIK 🗳️'}
                </span>
              </div>

              <p style={{ fontSize: '13px', color: '#cbd5e1' }}>{prop.description}</p>
              <div style={{ fontSize: '12px', color: 'var(--accent-orange)', fontWeight: 'bold' }}>
                💰 Talep Edilen Fon: {prop.requestedBudget}
              </div>

              {/* Oy İlerleme Çubuğu */}
              <div style={{ marginTop: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  <span>EVET: %{yesPercent} ({prop.votesFor} Oy)</span>
                  <span>HAYIR: %{100 - yesPercent} ({prop.votesAgainst} Oy)</span>
                </div>
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${yesPercent}%`, height: '100%', background: 'linear-gradient(90deg, var(--primary-blue), var(--accent-green))' }} />
                </div>
              </div>

              {/* Aksiyonlar */}
              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button
                  onClick={() => castVote(prop.id, true)}
                  disabled={prop.voted || prop.status === 'passed'}
                  style={{
                    flex: 1,
                    background: prop.voted ? 'rgba(255,255,255,0.06)' : 'rgba(72, 187, 120, 0.2)',
                    border: '1px solid var(--accent-green)',
                    color: 'var(--accent-green)',
                    padding: '10px',
                    borderRadius: '10px',
                    fontWeight: 'bold',
                    fontSize: '12px',
                    cursor: prop.voted || prop.status === 'passed' ? 'not-allowed' : 'pointer',
                  }}
                >
                  👍 Evet Oyu Ver (+10 LKY Oy Gücü)
                </button>
                <button
                  onClick={() => castVote(prop.id, false)}
                  disabled={prop.voted || prop.status === 'passed'}
                  style={{
                    flex: 1,
                    background: prop.voted ? 'rgba(255,255,255,0.06)' : 'rgba(255, 77, 79, 0.2)',
                    border: '1px solid #ff4d4f',
                    color: '#ff4d4f',
                    padding: '10px',
                    borderRadius: '10px',
                    fontWeight: 'bold',
                    fontSize: '12px',
                    cursor: prop.voted || prop.status === 'passed' ? 'not-allowed' : 'pointer',
                  }}
                >
                  👎 Hayır Oyu Ver
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
