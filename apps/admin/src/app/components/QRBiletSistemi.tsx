'use client';

import { useState } from 'react';

// ============================================================================
// LİKYA QR BİLET SİSTEMİ
// Faz 1: QR üretim + doğrulama + turnike entegrasyonu
// ============================================================================

type TicketStatus = 'valid' | 'used' | 'expired' | 'invalid';

export default function QRBiletSistemi() {
  const [ticketCode, setTicketCode] = useState('');
  const [ticketStatus, setTicketStatus] = useState<TicketStatus | null>(null);
  const [generatedCode, setGeneratedCode] = useState('');
  const [eventName, setEventName] = useState('Olympos Gençlik Stand-Up');
  const [price, setPrice] = useState('150');

  // QR kod üretimi (simüle)
  const generateTicket = () => {
    const code = `LIKYA-TICKET-2026-${Math.floor(1000 + Math.random() * 9000)}-USER-${Math.floor(100 + Math.random() * 900)}`;
    setGeneratedCode(code);
    setTicketCode(code);
    setTicketStatus('valid');
  };

  // QR doğrulama (simüle)
  const verifyTicket = () => {
    if (!ticketCode.trim()) {
      setTicketStatus('invalid');
      return;
    }
    if (ticketCode.startsWith('LIKYA-TICKET')) {
      setTicketStatus('valid');
    } else {
      setTicketStatus('invalid');
    }
  };

  const statusColors: Record<TicketStatus, { color: string; bg: string; label: string }> = {
    valid: { color: '#48bb78', bg: 'rgba(72,187,120,0.1)', label: '✅ Geçerli Bilet' },
    used: { color: '#ecc94b', bg: 'rgba(236,201,75,0.1)', label: '⚠️ Kullanılmış Bilet' },
    expired: { color: '#e07a5f', bg: 'rgba(224,122,95,0.1)', label: '⏰ Süresi Dolmuş Bilet' },
    invalid: { color: '#e07a5f', bg: 'rgba(224,122,95,0.1)', label: '❌ Geçersiz Bilet' },
  };

  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '20px', marginTop: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <span style={{ fontSize: '24px' }}>🎟️</span>
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#e2e8f0' }}>QR Bilet Sistemi</div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>QR üretim + doğrulama + turnike entegrasyonu — Faz 1</div>
        </div>
      </div>

      {/* Bilet Üretimi */}
      <div style={{ background: 'rgba(0,242,254,0.05)', border: '1px solid rgba(0,242,254,0.15)', borderRadius: '12px', padding: '14px', marginBottom: '16px' }}>
        <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#00f2fe', marginBottom: '10px' }}>🎫 Bilet Üret</div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '10px' }}>
          <input
            type="text"
            value={eventName}
            onChange={(e) => setEventName(e.target.value)}
            placeholder="Etkinlik Adı"
            style={{
              flex: 1,
              minWidth: '150px',
              padding: '10px 12px',
              borderRadius: '10px',
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff',
              fontSize: '13px',
            }}
          />
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Fiyat (₺)"
            style={{
              width: '100px',
              padding: '10px 12px',
              borderRadius: '10px',
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff',
              fontSize: '13px',
            }}
          />
          <button
            onClick={generateTicket}
            style={{
              padding: '10px 16px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #0f4c81, #00f2fe)',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            🎫 Bilet Üret
          </button>
        </div>

        {generatedCode && (
          <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(0,242,254,0.3)', textAlign: 'center' }}>
            {/* Simüle QR kodu */}
            <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '6px' }}>QR KOD (Simüle)</div>
            <div style={{
              width: '80px',
              height: '80px',
              margin: '0 auto',
              background: '#fff',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '8px',
              color: '#000',
              fontFamily: 'monospace',
              padding: '4px',
              wordBreak: 'break-all',
            }}>
              {generatedCode}
            </div>
            <div style={{ fontSize: '12px', color: '#00f2fe', marginTop: '8px', fontWeight: 'bold' }}>{generatedCode}</div>
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
              {eventName} • {price} ₺
            </div>
          </div>
        )}
      </div>

      {/* Bilet Doğrulama */}
      <div style={{ background: 'rgba(72,187,120,0.05)', border: '1px solid rgba(72,187,120,0.15)', borderRadius: '12px', padding: '14px' }}>
        <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#48bb78', marginBottom: '10px' }}>🔍 Bilet Doğrula (Turnike)</div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            value={ticketCode}
            onChange={(e) => setTicketCode(e.target.value)}
            placeholder="QR kodu tarayın veya yapıştırın..."
            style={{
              flex: 1,
              padding: '10px 12px',
              borderRadius: '10px',
              background: 'rgba(0,0,0,0.3)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#fff',
              fontSize: '13px',
            }}
          />
          <button
            onClick={verifyTicket}
            style={{
              padding: '10px 16px',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #10B981, #48bb78)',
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            📷 Doğrula
          </button>
        </div>

        {ticketStatus && (
          <div style={{
            marginTop: '12px',
            padding: '12px',
            borderRadius: '10px',
            background: statusColors[ticketStatus].bg,
            border: `1px solid ${statusColors[ticketStatus].color}`,
            color: statusColors[ticketStatus].color,
            fontSize: '13px',
            fontWeight: 'bold',
            textAlign: 'center',
          }}>
            {statusColors[ticketStatus].label}
          </div>
        )}
      </div>
    </div>
  );
}
