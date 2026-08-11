'use client';

import React, { useState, useRef, useEffect } from 'react';

interface Message {
  id: number;
  sender: 'user' | 'ai';
  text: string;
}

// Likya AI Asistanı Bilgi Tabanı
const KNOWLEDGE_BASE: Array<{ keywords: string[]; answer: string }> = [
  {
    keywords: ['amfitiyatro', 'sahne', 'etkinlik', 'konser', 'gösteri', 'bugün ne var'],
    answer: '🎭 Bu akşam Amfitiyatro Sahnesi\'nde saat 20:00\'de "Olympos Gençlik Stand-Up" gösterisi var! 500 kişilik sahne, akustik hazır. Biletler QR turnikeden 15 saniyelik TOTP kod ile geçerli. Bilet fiyatı ₺150. 🎟️',
  },
  {
    keywords: ['e-bike', 'bisiklet', 'kiralama', 'kiralarım', 'fiyat'],
    answer: '🚲 E-Bike kiralama ₺3.5/dakika! Likya Outdoor & E-Bike dükkanından (D-02) alabilirsiniz. Kampüs içi 5 farklı istasyon mevcut. İlk 10 dakika ücretsiz deneme sürüşü dahil! ⚡',
  },
  {
    keywords: ['kahve', 'kafe', 'menü', 'fırın', 'bistro', 'yemek'],
    answer: '☕ En yakın kafe: Sedir Bistro (D-05)! Bugünün menüsü: Sedir Burger ₺185, Türk Kahvesi ₺45, Taze Simit ₺15. Fırın & Kafe (D-04) sabah 07:00\'den itibaren açık. 🥐',
  },
  {
    keywords: ['harita', 'yol', 'nerede', 'konum', 'kampüs'],
    answer: '📍 Kampüs 5 ana bölgeden oluşur: 1) Karavan & Tiny House Showroom, 2) Amfitiyatro Sahne, 3) Spor & Biyomekanik Kompleksi, 4) Ticari Yaşam Alanı (16 Dükkan), 5) Eco-Tech & Doğa Sistemleri. Ana girişten düz ilerleyin, tabelalar sizi yönlendirir! 🗺️',
  },
  {
    keywords: ['konaklama', 'çadır', 'karavan', 'bungalow', 'otopark', 'gece'],
    answer: '🏕️ Konaklama seçenekleri: Bungalow ₺1,500/gece, Çadır Alanı ₺350/gece, Karavan Parseli ₺600/gece (elektrik dahil), Otopark ₺150/gece. "Try Before Buy" ile karavan test konaklaması ₺1,200/gece! 🚐',
  },
  {
    keywords: ['spor', 'padel', 'tenis', 'sauna', 'ice bath', 'kort'],
    answer: '🎾 Spor Kompleksi: 2 Padel Kortu (₺400/saat), 1 Tenis Kortu (₺350/saat), Sauna & Ice Bath (₺250/kişi). 3D Biyomekanik kameralar vuruş analizi yapar! Kort rezervasyonu için Padel Pro Shop (D-03) ile iletişime geçin. 🏓',
  },
  {
    keywords: ['cüzdan', 'likya pay', 'ödeme', 'bakiye', 'para'],
    answer: '💳 Likya Pay cüzdanınızla kampüs içi tüm ödemeleri yapabilirsiniz! FAST ile anında para yükleme, karbon sertifikası kazanma ve QR ile ödeme. Cüzdan sekmesinden bakiyenizi görüntüleyebilirsiniz. 🌿',
  },
  {
    keywords: ['alışveriş', 'market', 'ürün', '0-km', 'sıfır'],
    answer: '🛒 Alışveriş sekmesinde 0-Km Doğa Marketi\'nden taze ürünler sipariş edebilirsiniz! Migros Kampüs Market (D-01) aynı gün teslimat yapar. Organik süt ₺42, köy yumurtası ₺95. 🥬',
  },
  {
    keywords: ['2.el', 'ikinci el', 'upcycling', 'sat', 'bağış'],
    answer: '♻️ 2.El Al-Sat sekmesinde ekipmanlarınızı satabilir veya bağışlayabilirsiniz! AI Vision fotoğraf tarama ile ürününüzün marka/modelini 5 saniyede tespit eder. Upcycling Lab\'de tamir edilen ürünler amatör spor kulübüne fon sağlar! 🛠️',
  },
  {
    keywords: ['bilet', 'qr', 'turnike', 'giriş'],
    answer: '🎟️ QR Bilet sekmesinden etkinlik biletlerinizi alabilirsiniz. Biletler 15 saniyede bir değişen TOTP güvenlik kodu ile korunur! Turnikede QR kodunuzu okutarak giriş yapın. ✅',
  },
  {
    keywords: ['merhaba', 'selam', 'hi', 'hello', 'günaydın'],
    answer: '🌲 Merhaba! Likya Kampüsü\'ne hoş geldiniz! Size nasıl yardımcı olabilirim? Etkinlikler, konaklama, spor, yemek veya kampüs haritası hakkında soru sorabilirsiniz. 😊',
  },
  {
    keywords: ['teşekkür', 'sağol', 'thanks'],
    answer: '🌿 Rica ederim! Likya Kampüsü\'nde keyifli vakit geçirmenizi dilerim. Başka bir sorunuz olursa buradayım! 😊',
  },
];

const QUICK_QUESTIONS = [
  { icon: '📍', label: 'Kampüs Haritası' },
  { icon: '🚲', label: 'Bisiklet Fiyatı' },
  { icon: '☕', label: 'Kafe Menüsü' },
  { icon: '🎭', label: 'Bugün Ne Var?' },
];

export default function AIChatModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, sender: 'ai', text: '🌲 Merhaba! Ben Likya AI Rehberiniz. Kampüs hakkında her şeyi sorabilirsiniz!' },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const getAIResponse = (question: string): string => {
    const lower = question.toLowerCase();
    const match = KNOWLEDGE_BASE.find(k => k.keywords.some(kw => lower.includes(kw)));
    if (match) return match.answer;
    return '🤔 Bu soru hakkında henüz bilgim yok ama kampüs personelimiz size yardımcı olabilir! Ana girişteki bilgi masasına uğrayabilir veya 0 (242) 000 00 00 numarasını arayabilirsiniz. 📞';
  };

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { id: Date.now(), sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const aiMsg: Message = { id: Date.now() + 1, sender: 'ai', text: getAIResponse(text) };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 900);
  };

  const handleQuickQuestion = (label: string) => {
    sendMessage(label);
  };

  return (
    <>
      {/* Yüzen AI Rehber Butonu */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #0f4c81, #00f2fe)',
          border: '2px solid rgba(0, 242, 254, 0.5)',
          color: '#fff',
          fontSize: '28px',
          cursor: 'pointer',
          boxShadow: '0 8px 32px rgba(0, 242, 254, 0.4)',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'transform 0.2s ease',
        }}
        title="AI Rehber"
      >
        {isOpen ? '✕' : '🤖'}
      </button>

      {/* Sohbet Penceresi */}
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            bottom: '100px',
            right: '24px',
            width: '380px',
            maxWidth: 'calc(100vw - 48px)',
            height: '520px',
            maxHeight: 'calc(100vh - 140px)',
            background: 'rgba(13, 19, 34, 0.95)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            border: '1px solid rgba(0, 242, 254, 0.3)',
            borderRadius: '24px',
            boxShadow: '0 30px 80px rgba(0, 0, 0, 0.6), 0 0 40px rgba(0, 242, 254, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            zIndex: 1001,
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          {/* Başlık */}
          <div style={{ padding: '16px 18px', background: 'linear-gradient(135deg, rgba(15, 76, 129, 0.8), rgba(0, 242, 254, 0.3))', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '50%', background: 'linear-gradient(135deg, #0f4c81, #00f2fe)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>🤖</div>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>Likya AI Rehber</div>
                <div style={{ fontSize: '11px', color: '#48bb78', fontWeight: 'bold' }}>🟢 Çevrimiçi • Anında Yanıt</div>
              </div>
            </div>
          </div>

          {/* Mesajlar */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {messages.map((msg) => (
              <div
                key={msg.id}
                style={{
                  alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  padding: '10px 14px',
                  borderRadius: msg.sender === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  background: msg.sender === 'user' ? 'linear-gradient(135deg, #0f4c81, #00f2fe)' : 'rgba(255,255,255,0.08)',
                  border: msg.sender === 'user' ? 'none' : '1px solid rgba(255,255,255,0.1)',
                  color: '#fff',
                  fontSize: '13px',
                  lineHeight: '1.5',
                }}
              >
                {msg.text}
              </div>
            ))}
            {isTyping && (
              <div style={{ alignSelf: 'flex-start', padding: '10px 14px', borderRadius: '16px 16px 16px 4px', background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8', fontSize: '13px' }}>
                <span style={{ display: 'inline-block', animation: 'pulse 1s infinite' }}>🤖 Yazıyor...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Hızlı Soru Butonları */}
          <div style={{ padding: '10px 14px', display: 'flex', gap: '8px', flexWrap: 'wrap', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            {QUICK_QUESTIONS.map((q) => (
              <button
                key={q.label}
                onClick={() => handleQuickQuestion(q.label)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  background: 'rgba(0, 242, 254, 0.1)',
                  border: '1px solid rgba(0, 242, 254, 0.3)',
                  color: '#00f2fe',
                  fontSize: '11px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {q.icon} {q.label}
              </button>
            ))}
          </div>

          {/* Giriş Alanı */}
          <div style={{ padding: '12px 14px', borderTop: '1px solid rgba(255,255,255,0.08)', display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.2)' }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage(input)}
              placeholder="Sorunuzu yazın..."
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff',
                fontSize: '13px',
                outline: 'none',
              }}
            />
            <button
              onClick={() => sendMessage(input)}
              style={{
                padding: '10px 16px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #0f4c81, #00f2fe)',
                border: 'none',
                color: '#fff',
                fontWeight: 'bold',
                fontSize: '13px',
                cursor: 'pointer',
              }}
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </>
  );
}
