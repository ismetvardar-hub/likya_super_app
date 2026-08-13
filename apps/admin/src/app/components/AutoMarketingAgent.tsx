'use client';

import React, { useState } from 'react';
import { Megaphone, PenLine, Image as ImageIcon, Sparkles, Copy, Check } from 'lucide-react';

// ============================================================================
// LİKYA OTONOM PAZARLAMA AJANI (Auto-Marketing Agent)
// Reklam metni + Sosyal medya görseli + Kampanya duyurusu üretici
// ============================================================================

interface MarketingContent {
  adText: string;
  socialPost: string;
  campaignTitle: string;
  campaignBody: string;
}

export default function AutoMarketingAgent() {
  const [businessType, setBusinessType] = useState('restoran');
  const [businessName, setBusinessName] = useState('Likya Kafe');
  const [isGenerating, setIsGenerating] = useState(false);
  const [content, setContent] = useState<MarketingContent | null>(null);
  const [copied, setCopied] = useState(false);

  const generateContent = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const name = businessName || 'İşletmeniz';
      const type = businessType;

      const adText = `"Google yorumlarınızdaki krizleri %80 oranında masadayken çözen Centilmen Asistan! ${name} artık müşteri memnuniyetsizliğini anında sadakate dönüştürüyor. Olumsuz yorumlar kamusal alana yansımadan önce sistem devreye girer, müşterinin gönlü alınır. ${type === 'restoran' ? 'Sipariş gecikti mi? Bir sonraki kahve bizden ☕' : type === 'otel' ? 'Oda sorunu mu? Bir sonraki gece indirimli 🏨' : 'Hizmet memnuniyetsizliği mi? Özel ikram tanımlanır 🎁'} 7 gün ücretsiz deneyin!"`;

      const socialPost = `🎩 ${name} artık "Centilmen Müşteri İlişkileri" ile hizmet veriyor!\n\n✨ Olumsuz yorumlar masadayken çözülür\n✨ Müşteri memnuniyeti %80 artar\n✨ Google puanınız yükselir\n\n📱 QR kod ile 120 saniyede sıcak temas\n🎁 Daze-Gift ile anında ikram\n\n#CentilmenAsistan #MüşteriMemnuniyeti #${type === 'restoran' ? 'Restoran' : type === 'otel' ? 'Otel' : 'Kafe'}`;

      const campaignTitle = `"${name} — Sıradan Değil, Centilmen!"`;
      const campaignBody = `Bu ay ${name} müşterilerine özel: Olumsuz deneyim yaşayan her müşteriye otomatik Daze-Gift ikramı! QR kodunu okut, deneyimini paylaş, gönlünü alalım. 🌟`;

      setContent({ adText, socialPost, campaignTitle, campaignBody });
      setIsGenerating(false);
    }, 800);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px', color: '#fff', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', marginTop: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #1e293b' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Megaphone size={20} color="#f59e0b" />
            Otonom Pazarlama Ajanı
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>Reklam metni + Sosyal medya görseli + Kampanya duyurusu üretici</p>
        </div>
      </div>

      {/* Girdi Alanları */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div>
          <label style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '8px', display: 'block' }}>İşletme Türü</label>
          <select
            value={businessType}
            onChange={(e) => setBusinessType(e.target.value)}
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #334155', background: '#1e293b', color: '#fff', fontSize: '14px' }}
          >
            <option value="restoran">Restoran</option>
            <option value="kafe">Kafe</option>
            <option value="otel">Otel</option>
            <option value="klinik">Klinik</option>
            <option value="boutique">Boutique Mağaza</option>
          </select>
        </div>
        <div>
          <label style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '8px', display: 'block' }}>İşletme Adı</label>
          <input
            value={businessName}
            onChange={(e) => setBusinessName(e.target.value)}
            placeholder="İşletme adı"
            style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #334155', background: '#1e293b', color: '#fff', fontSize: '14px' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <button
            onClick={generateContent}
            disabled={isGenerating}
            style={{ width: '100%', padding: '10px 16px', borderRadius: '8px', border: 'none', background: isGenerating ? 'rgba(245,158,11,0.5)' : 'linear-gradient(135deg, #d97706, #f59e0b)', color: '#000', fontSize: '14px', fontWeight: '600', cursor: isGenerating ? 'not-allowed' : 'pointer' }}
          >
            {isGenerating ? 'Üretiliyor...' : '✨ İçerik Üret'}
          </button>
        </div>
      </div>

      {/* Üretilen İçerik */}
      {content && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Reklam Metni */}
          <div style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontSize: '13px', fontWeight: '600' }}>
                <PenLine size={16} /> Reklam Metni
              </div>
              <button onClick={() => copyToClipboard(content.adText)} style={{ background: 'none', border: 'none', color: copied ? '#34d399' : '#94a3b8', cursor: 'pointer' }}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
            <p style={{ color: '#e2e8f0', fontSize: '13px', lineHeight: '1.6' }}>{content.adText}</p>
          </div>

          {/* Sosyal Medya Görseli */}
          <div style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#a78bfa', fontSize: '13px', fontWeight: '600' }}>
                <ImageIcon size={16} /> Sosyal Medya Gönderisi
              </div>
              <button onClick={() => copyToClipboard(content.socialPost)} style={{ background: 'none', border: 'none', color: copied ? '#34d399' : '#94a3b8', cursor: 'pointer' }}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
            <pre style={{ color: '#e2e8f0', fontSize: '13px', lineHeight: '1.6', whiteSpace: 'pre-wrap', fontFamily: 'inherit', margin: 0 }}>{content.socialPost}</pre>
          </div>

          {/* Kampanya Duyurusu */}
          <div style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', fontSize: '13px', fontWeight: '600' }}>
                <Sparkles size={16} /> Kampanya Duyurusu
              </div>
              <button onClick={() => copyToClipboard(content.campaignTitle + '\n' + content.campaignBody)} style={{ background: 'none', border: 'none', color: copied ? '#34d399' : '#94a3b8', cursor: 'pointer' }}>
                {copied ? <Check size={16} /> : <Copy size={16} />}
              </button>
            </div>
            <div style={{ color: '#34d399', fontSize: '15px', fontWeight: 'bold', marginBottom: '4px' }}>{content.campaignTitle}</div>
            <p style={{ color: '#e2e8f0', fontSize: '13px', lineHeight: '1.6' }}>{content.campaignBody}</p>
          </div>
        </div>
      )}
    </div>
  );
}
