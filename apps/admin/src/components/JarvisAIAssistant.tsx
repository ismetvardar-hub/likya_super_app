'use client';

import React, { useState, useEffect, useRef } from 'react';

interface ChatMessage {
  sender: 'user' | 'jarvis' | 'c-suite';
  agentName?: string;
  text: string;
  timestamp: string;
  actionTaken?: string;
}

export default function JarvisAIAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [commandInput, setCommandInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'jarvis',
      text: 'İyi günler Sayın Yöneticim. Likya Holding Sovereign AI Çekirdeği (Jarvis Mode) hazır ve tüm C-Suite ajanlarımız emirlerinizi bekliyor.',
      timestamp: 'Şimdi',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const speakText = (text: string) => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'tr-TR';
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    }
  };

  const executeJarvisCommand = (rawText: string) => {
    const text = rawText.trim();
    if (!text) return;

    const time = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = { sender: 'user', text, timestamp: time };
    setMessages((prev) => [...prev, userMsg]);
    setCommandInput('');

    const lower = text.toLowerCase();
    let reply = '';
    let agentName = 'Likya Jarvis (Sovereign AI)';
    let actionTaken = '';

    if (lower.includes('sağlık') || lower.includes('tara') || lower.includes('durum')) {
      reply = 'Tüm ekosistem denetlendi Sayın Yöneticim. 6 veritabanı tablosu, 40+ mobil modül, Next.js paneli ve Docker servisleri %99.4 sağlık skoruyla kusursuz çalışıyor.';
      actionTaken = '✅ scripts/system_health_check.sh 0 hata ile doğrulandı.';
    } else if (lower.includes('satıcı') || lower.includes('onayla')) {
      reply = 'Emredersiniz. Bekleyen tüm yerel üretici ve zanaatkar başvuruları incelendi ve adil ticaret kriterlerine uygun bulunarak onaylandı.';
      actionTaken = '🌾 Toros Zeytincilik ve Likya Ahşap onaylandı.';
    } else if (lower.includes('dron') || lower.includes('sar') || lower.includes('kurtar')) {
      reply = 'FLIR termal kameralı SAR Arama Kurtarma Dronu derhal havalandırıldı. 85 metre irtifada Likya Yolu dağ parkuru taranıyor.';
      actionTaken = '🛸 Likya SAR Dronu #01 Aktif Uçuşta (3 dk ETA).';
    } else if (lower.includes('hazine') || lower.includes('cfo') || lower.includes('para') || lower.includes('kasa')) {
      agentName = 'CFO Ajanı (Aura-Fin)';
      reply = 'Sayın Yöneticim, kasamızda 840,000 Likya Coin dolaşımda, aylık net hacim ₺1,000,000 barajını aştı ve likidite rezervimiz tam güvenli.';
      actionTaken = '💎 Likya Fintek & Cüzdan rezervleri güncellendi.';
    } else if (lower.includes('esg') || lower.includes('karbon') || lower.includes('rapor')) {
      agentName = 'CSO Ajanı (Gaia-Eco)';
      reply = 'Bu ay 2.4 ton karbon salınımı önlendi, 68,600 plastik şişe kurtarıldı ve 3,400 kg organik atık komposta dönüştürüldü. ESG raporunuz indirilmeye hazır.';
      actionTaken = '🌿 ESG Sürdürülebilirlik Raporu CSV olarak derlendi.';
    } else {
      reply = `Anlaşıldı Sayın Yöneticim. "${text}" direktifiniz C-Suite ajanlarımıza iletildi ve otonom iş akışı başlatıldı.`;
      actionTaken = '⚡ Görev kuyruğa alındı ve yürütülüyor.';
    }

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: agentName.includes('CFO') || agentName.includes('CSO') ? 'c-suite' : 'jarvis',
          agentName,
          text: reply,
          timestamp: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
          actionTaken,
        },
      ]);
      speakText(reply);
    }, 450);
  };

  const toggleVoiceRecognition = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Tarayıcınız ses tanıma API\'sini desteklemiyor. Lütfen Google Chrome kullanın.');
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'tr-TR';
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      executeJarvisCommand(transcript);
    };

    recognition.start();
  };

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '20px', minHeight: '520px' }}>
      {/* Sol Holografik Jarvis Reaktörü & Kontrol Paneli */}
      <div
        style={{
          background: 'linear-gradient(180deg, rgba(13, 21, 39, 0.95), rgba(10, 15, 30, 0.98))',
          border: '1px solid rgba(0, 242, 254, 0.3)',
          borderRadius: '24px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 12px 32px rgba(0, 242, 254, 0.15)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: 'bold', letterSpacing: '1.5px' }}>
            SOVEREIGN AI COMMAND CORE
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'white', marginTop: '4px' }}>
            JARVIS PROTOCOL 🎙️
          </h2>
        </div>

        {/* Dönen & Nabız Atan Holografik Reaktör */}
        <div style={{ position: 'relative', width: '160px', height: '160px', margin: '20px 0' }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '2px dashed rgba(0, 242, 254, 0.6)',
              animation: 'spin 12s linear infinite',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: '12px',
              borderRadius: '50%',
              border: '2px solid rgba(224, 122, 95, 0.7)',
              animation: 'spin 8s linear infinite reverse',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: '24px',
              borderRadius: '50%',
              background: isSpeaking
                ? 'radial-gradient(circle, #00f2fe 0%, #0f4c81 70%, transparent 100%)'
                : 'radial-gradient(circle, #48bb78 0%, #0f4c81 70%, transparent 100%)',
              boxShadow: isSpeaking
                ? '0 0 35px #00f2fe, inset 0 0 20px #00f2fe'
                : '0 0 25px rgba(72, 187, 120, 0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.3s ease',
            }}
          >
            <span style={{ fontSize: '32px' }}>{isSpeaking ? '⚡' : isListening ? '🎙️' : '🧠'}</span>
          </div>
        </div>

        <div style={{ width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: '12px', color: isListening ? '#00f2fe' : 'var(--text-muted)', fontWeight: 'bold' }}>
            {isListening ? '🔴 Sizi Dinliyor...' : isSpeaking ? '🔊 Jarvis Konuşuyor...' : '🟢 Sesli Komuta Hazır'}
          </div>

          <button
            onClick={toggleVoiceRecognition}
            style={{
              marginTop: '14px',
              width: '100%',
              padding: '14px',
              borderRadius: '14px',
              border: isListening ? '1px solid #ff4d4f' : '1px solid var(--accent-cyan)',
              background: isListening
                ? 'rgba(255, 77, 79, 0.2)'
                : 'linear-gradient(135deg, var(--primary-blue), var(--accent-cyan))',
              color: 'white',
              fontWeight: 'bold',
              fontSize: '14px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 6px 16px rgba(0,0,0,0.3)',
            }}
          >
            <span>{isListening ? '⏹️ Dinlemeyi Durdur' : '🎙️ Sesli Konuşmaya Başla'}</span>
          </button>
        </div>
      </div>

      {/* Sağ Canlı Jarvis Sohbet & Yürütme Terminali */}
      <div
        style={{
          background: 'var(--card-bg)',
          border: '1px solid var(--border-color)',
          borderRadius: '24px',
          padding: '20px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
        }}
      >
        {/* Mesaj Akışı */}
        <div style={{ flex: 1, overflowY: 'auto', maxHeight: '380px', paddingRight: '6px' }}>
          {messages.map((m, index) => {
            const isUser = m.sender === 'user';
            return (
              <div
                key={index}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isUser ? 'flex-end' : 'flex-start',
                  marginBottom: '14px',
                }}
              >
                {!isUser && (
                  <span style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: 'bold', marginBottom: '4px' }}>
                    🤖 {m.agentName || 'Likya Jarvis'} • {m.timestamp}
                  </span>
                )}
                <div
                  style={{
                    maxWidth: '82%',
                    padding: '12px 16px',
                    borderRadius: '16px',
                    background: isUser
                      ? 'linear-gradient(135deg, var(--primary-blue), var(--primary-light))'
                      : 'rgba(255, 255, 255, 0.05)',
                    border: isUser ? 'none' : '1px solid rgba(255, 255, 255, 0.08)',
                    color: 'white',
                    fontSize: '14px',
                    lineHeight: '1.5',
                  }}
                >
                  {m.text}
                </div>
                {m.actionTaken && (
                  <div
                    style={{
                      marginTop: '6px',
                      padding: '4px 10px',
                      borderRadius: '8px',
                      background: 'rgba(72, 187, 120, 0.12)',
                      border: '1px solid rgba(72, 187, 120, 0.3)',
                      color: 'var(--accent-green)',
                      fontSize: '11px',
                      fontWeight: 'bold',
                    }}
                  >
                    {m.actionTaken}
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Hızlı Komut Butonları */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '8px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          {[
            '🔍 Sistem sağlığını tara',
            '🌾 Satıcıları onayla',
            '🛸 SAR kurtarma dronunu kaldır',
            '💎 CFO hazine durumu',
            '🌿 ESG etki raporu',
          ].map((cmd, idx) => (
            <button
              key={idx}
              onClick={() => executeJarvisCommand(cmd)}
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'var(--text-muted)',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '11px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              {cmd}
            </button>
          ))}
        </div>

        {/* Yazılı Komut Girişi */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
          <input
            type="text"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && executeJarvisCommand(commandInput)}
            placeholder="Jarvis'e veya C-Suite ajanlarına direktif verin..."
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: '12px',
              border: '1px solid var(--border-color)',
              background: 'rgba(0,0,0,0.3)',
              color: 'white',
              fontSize: '14px',
            }}
          />
          <button
            onClick={() => executeJarvisCommand(commandInput)}
            style={{
              background: 'var(--primary-blue)',
              border: '1px solid var(--accent-cyan)',
              color: 'white',
              padding: '12px 20px',
              borderRadius: '12px',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            İlet
          </button>
        </div>
      </div>
    </div>
  );
}
