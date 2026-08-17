'use client';

import React, { useState } from 'react';
import { chatwootBridgeStatus, normalizeWebhookPayload, routeInbound } from '../lib/support/chatwootBridge';

// ============================================================================
// 💬 CHATWOOT MÜŞTERİ DESTEK PANELİ (Faz 3)
// Açık kaynak Chatwoot widget/iframe entegrasyonu — token girilmediğinde şık
// "Canlı Destek Simülasyonu" sunar. Kırılmasız: bağımsız bileşen.
// ============================================================================

const CW_BASE_URL = process.env.NEXT_PUBLIC_CHATWOOT_URL || '';
const CW_WEBSITE_TOKEN = process.env.NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN || '';

interface SimMessage {
  sender: 'user' | 'agent';
  text: string;
  time: string;
}

const AUTO_REPLIES = [
  'Merhaba! 👋 Likya Destek ekibinden size nasıl yardımcı olabiliriz?',
  'Elbette, hemen ilgileniyoruz. Daze nezaket filtresiyle yanıtlıyoruz 😊',
  'Biletiniz oluşturuldu — destek ajanımız kısa süre içinde yanıt verecek.',
];

export default function ChatwootSupportPanel() {
  const [messages, setMessages] = useState<SimMessage[]>([
    { sender: 'agent', text: AUTO_REPLIES[0], time: 'şimdi' },
  ]);
  const [input, setInput] = useState('');
  const [replyIdx, setReplyIdx] = useState(1);

  const simulated = !CW_WEBSITE_TOKEN;

  const send = () => {
    if (!input.trim()) return;
    const userMsg: SimMessage = { sender: 'user', text: input, time: 'şimdi' };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    // Chatwoot webhook normalize + route (simülasyon bilgisi)
    const inbound = normalizeWebhookPayload({ message: { content: input, sender: { name: 'Mobil Kullanıcı' } }, conversation: { id: 1 } });
    if (inbound) routeInbound(inbound, { accountId: '1', inboxId: '1' });
    setTimeout(() => {
      const reply: SimMessage = { sender: 'agent', text: AUTO_REPLIES[replyIdx % AUTO_REPLIES.length], time: 'şimdi' };
      setMessages((m) => [...m, reply]);
      setReplyIdx((i) => i + 1);
    }, 900);
  };

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: '12px',
      background: 'linear-gradient(160deg, rgba(15,23,42,0.92), rgba(13,19,34,0.96))',
      border: '1px solid rgba(0,242,254,0.3)', borderRadius: '16px', padding: '16px',
      boxShadow: '0 0 26px rgba(0,242,254,0.08)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>💬 Müşteri Destek — Chatwoot</div>
          <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>{chatwootBridgeStatus({ apiToken: CW_WEBSITE_TOKEN, accountId: '1', inboxId: '1' })}</div>
        </div>
        <span style={{ fontSize: '9px', fontWeight: 800, padding: '3px 9px', borderRadius: '999px', color: simulated ? '#fbbf24' : '#4ade80', background: simulated ? 'rgba(245,158,11,0.1)' : 'rgba(34,197,94,0.1)', border: `1px solid ${simulated ? 'rgba(245,158,11,0.35)' : 'rgba(34,197,94,0.35)'}` }}>
          {simulated ? '🟡 CANLI DESTEK SİMÜLASYONU' : '🟢 CHATWOOT BAĞLI'}
        </span>
      </div>

      {/* Gerçek Chatwoot iframe (token varsa) */}
      {!simulated && CW_BASE_URL && (
        <iframe
          src={`${CW_BASE_URL}/widget?website_token=${CW_WEBSITE_TOKEN}`}
          title="Chatwoot Support"
          style={{ width: '100%', height: '380px', border: '1px solid rgba(0,242,254,0.2)', borderRadius: '12px', background: '#0d1322' }}
        />
      )}

      {/* Simülasyon sohbeti (token yoksa) */}
      {simulated && (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '260px', overflowY: 'auto', padding: '8px' }}>
            {messages.map((m, i) => (
              <div key={i} style={{ alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '3px' }}>{m.sender === 'user' ? 'Siz' : 'Likya Destek'} · {m.time}</div>
                <div style={{
                  padding: '8px 12px', borderRadius: '12px', fontSize: '12px', lineHeight: '1.5',
                  background: m.sender === 'user' ? 'linear-gradient(135deg, rgba(0,242,254,0.2), rgba(79,70,229,0.2))' : 'rgba(255,255,255,0.05)',
                  border: m.sender === 'user' ? '1px solid rgba(0,242,254,0.3)' : '1px solid rgba(255,255,255,0.1)',
                  color: '#e2e8f0',
                }}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') send(); }}
              placeholder="Nasıl yardımcı olabiliriz? (rezervasyon, üyelik, şikayet…)"
              style={{ flex: 1, padding: '9px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(0,0,0,0.3)', color: '#e2e8f0', fontSize: '12px' }}
            />
            <button onClick={send} style={{ padding: '9px 16px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#00f2fe,#4facfe)', color: '#0d1322', fontWeight: 800, fontSize: '12px' }}>
              Gönder
            </button>
          </div>
          <div style={{ fontSize: '10px', color: '#64748b', lineHeight: '1.6' }}>
            💡 Gerçek Chatwoot için `NEXT_PUBLIC_CHATWOOT_URL` + `NEXT_PUBLIC_CHATWOOT_WEBSITE_TOKEN` tanımlayın; iframe otomatik devreye girer.
          </div>
        </>
      )}
    </div>
  );
}
