'use client';

import React, { useState } from 'react';
import { Star, Gift, Shield, Check, Sparkles, Send } from 'lucide-react';
import { saveLead } from '../../services/leadService';

// ============================================================================
// LİKYA B2B SAAS LANDING PAGE
// Hero + Canlı Demo + Fiyatlandırma + No-Brainer Garanti + Leads Formu
// ============================================================================

export default function LandingPage() {
  const [demoRating, setDemoRating] = useState(0);
  const [demoComment, setDemoComment] = useState('');
  const [demoResult, setDemoResult] = useState<{ message: string; giftCode: string } | null>(null);

  const [form, setForm] = useState({ business_name: '', owner_name: '', whatsapp: '', sector: 'restoran' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const runDemo = () => {
    if (demoRating === 0) return;
    if (demoRating >= 4) {
      setDemoResult({
        message: 'Harika deneyiminizi Google\'da paylaşarak bize destek olmak ister misiniz? 🌟',
        giftCode: '',
      });
    } else {
      setDemoResult({
        message: 'Ağzınızın tadını kaçırdıysak gerçekten mahcubuz! 😔 Gönlünüzü almak için bir sonraki ziyaretinizde geçerli ikram kuponunuz tanımlandı.',
        giftCode: `DAZE-RECOVERY-${Math.floor(1000 + Math.random() * 9000)}`,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const ok = await saveLead(form);
    setIsSubmitting(false);
    setSubmitted(ok);
  };

  return (
    <div style={{ background: '#0f172a', color: '#fff', minHeight: '100vh' }}>
      {/* HERO SECTION */}
      <div style={{ textAlign: 'center', padding: '80px 24px 60px', background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)' }}>
        <div style={{ display: 'inline-block', padding: '8px 16px', borderRadius: '20px', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', color: '#f59e0b', fontSize: '13px', fontWeight: '600', marginBottom: '24px' }}>
          🎩 Centilmen Müşteri İlişkileri Asistanı
        </div>
        <h1 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: '800', lineHeight: '1.2', maxWidth: '800px', margin: '0 auto 16px' }}>
          Google Yorumlarınızdaki Olumsuz Tecrübeleri Masadayken <span style={{ color: '#f59e0b' }}>%80 Oranında Çözen</span> Centilmen AI Asistan
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '18px', maxWidth: '600px', margin: '0 auto 32px' }}>
          Olumsuz yorumlar kamusal alana yansımadan önce sistem devreye girer, müşterinin gönlü alınır, sadık bir dost kazanırsınız.
        </p>
        <button
          onClick={() => document.getElementById('lead-form')?.scrollIntoView({ behavior: 'smooth' })}
          style={{ padding: '16px 32px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #d97706, #f59e0b)', color: '#000', fontSize: '16px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 8px 30px rgba(245,158,11,0.3)' }}
        >
          🚀 7 Gün Ücretsiz Denemeyi Başlat
        </button>
      </div>

      {/* CANLI DEMO */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', textAlign: 'center', marginBottom: '8px' }}>Canlı Demo — Kriz Çözücüyü Test Edin</h2>
        <p style={{ color: '#94a3b8', textAlign: 'center', marginBottom: '24px' }}>Bir müşteri gibi puan verin, sistemin nasıl tepki verdiğini görün</p>

        <div style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid #334155', borderRadius: '16px', padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} onClick={() => setDemoRating(star)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <Star size={32} color={star <= demoRating ? '#f59e0b' : '#334155'} fill={star <= demoRating ? '#f59e0b' : 'none'} />
              </button>
            ))}
          </div>
          <input
            value={demoComment}
            onChange={(e) => setDemoComment(e.target.value)}
            placeholder="Yorumunuzu yazın (örn: Siparişim gecikti)"
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: '#1e293b', color: '#fff', marginBottom: '16px' }}
          />
          <button
            onClick={runDemo}
            disabled={demoRating === 0}
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', background: demoRating === 0 ? 'rgba(245,158,11,0.3)' : 'linear-gradient(135deg, #d97706, #f59e0b)', color: '#000', fontWeight: '600', cursor: demoRating === 0 ? 'not-allowed' : 'pointer' }}
          >
            ✨ Kriz Çözücüyü Test Et
          </button>

          {demoResult && (
            <div style={{ marginTop: '16px', padding: '16px', borderRadius: '12px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontWeight: '600', marginBottom: '8px' }}>
                <Sparkles size={16} /> Centilmen Yanıt
              </div>
              <p style={{ color: '#e2e8f0', fontSize: '14px', lineHeight: '1.6' }}>{demoResult.message}</p>
              {demoResult.giftCode && (
                <div style={{ marginTop: '12px', padding: '12px', borderRadius: '8px', background: 'rgba(245,158,11,0.15)', border: '1px solid #f59e0b' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b', fontWeight: '600', marginBottom: '4px' }}>
                    <Gift size={16} /> Daze-Gift Kuponunuz
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: '800', color: '#fff' }}>{demoResult.giftCode}</div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* FİYATLANDIRMA */}
      <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '40px 24px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', textAlign: 'center', marginBottom: '32px' }}>Fiyatlandırma</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
          {/* Starter */}
          <div style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid #334155', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>Daze Gentleman Starter</h3>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#f59e0b', marginBottom: '16px' }}>990 TL<span style={{ fontSize: '14px', color: '#94a3b8' }}>/ay</span></div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li style={{ display: 'flex', gap: '8px', color: '#e2e8f0', fontSize: '14px' }}><Check size={16} color="#34d399" /> QR Değerlendirme & Kriz Çözücü</li>
              <li style={{ display: 'flex', gap: '8px', color: '#e2e8f0', fontSize: '14px' }}><Check size={16} color="#34d399" /> Google Maps Otomatik Yönlendirme</li>
              <li style={{ display: 'flex', gap: '8px', color: '#e2e8f0', fontSize: '14px' }}><Check size={16} color="#34d399" /> Aylık 100 Daze-Gift İkram Kuponu</li>
              <li style={{ display: 'flex', gap: '8px', color: '#e2e8f0', fontSize: '14px' }}><Check size={16} color="#34d399" /> WhatsApp Destek Entegrasyonu</li>
            </ul>
          </div>

          {/* Pro (En Popüler) */}
          <div style={{ background: 'rgba(245,158,11,0.1)', border: '2px solid #f59e0b', borderRadius: '16px', padding: '24px', position: 'relative' }}>
            <div style={{ position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)', padding: '4px 16px', borderRadius: '20px', background: '#f59e0b', color: '#000', fontSize: '12px', fontWeight: '700' }}>
              ⭐ EN POPÜLER
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>Daze Pro Business</h3>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#f59e0b', marginBottom: '16px' }}>2.490 TL<span style={{ fontSize: '14px', color: '#94a3b8' }}>/ay</span></div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li style={{ display: 'flex', gap: '8px', color: '#e2e8f0', fontSize: '14px' }}><Check size={16} color="#34d399" /> Tüm Starter Özellikleri</li>
              <li style={{ display: 'flex', gap: '8px', color: '#e2e8f0', fontSize: '14px' }}><Check size={16} color="#34d399" /> CEO Mindset ile Kişiselleştirilmiş AI Üslubu</li>
              <li style={{ display: 'flex', gap: '8px', color: '#e2e8f0', fontSize: '14px' }}><Check size={16} color="#34d399" /> Sınırsız Daze-Gift İkramı</li>
              <li style={{ display: 'flex', gap: '8px', color: '#e2e8f0', fontSize: '14px' }}><Check size={16} color="#34d399" /> Next.js Canlı Yönetici Paneli & Analitik</li>
              <li style={{ display: 'flex', gap: '8px', color: '#e2e8f0', fontSize: '14px' }}><Check size={16} color="#34d399" /> Auto-Marketing Agent</li>
            </ul>
          </div>

          {/* Enterprise */}
          <div style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid #334155', borderRadius: '16px', padding: '24px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>Likya Enterprise Super App</h3>
            <div style={{ fontSize: '28px', fontWeight: '800', color: '#a78bfa', marginBottom: '16px' }}>Özel<span style={{ fontSize: '14px', color: '#94a3b8' }}> Fiyatlandırma</span></div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <li style={{ display: 'flex', gap: '8px', color: '#e2e8f0', fontSize: '14px' }}><Check size={16} color="#a78bfa" /> Tüm Pro Özellikleri</li>
              <li style={{ display: 'flex', gap: '8px', color: '#e2e8f0', fontSize: '14px' }}><Check size={16} color="#a78bfa" /> Flutter Mobil App Entegrasyonu</li>
              <li style={{ display: 'flex', gap: '8px', color: '#e2e8f0', fontSize: '14px' }}><Check size={16} color="#a78bfa" /> IoT/Turnike/Sensör Isı Haritası</li>
              <li style={{ display: 'flex', gap: '8px', color: '#e2e8f0', fontSize: '14px' }}><Check size={16} color="#a78bfa" /> Özel Modeller (Fine-Tuned LLM)</li>
              <li style={{ display: 'flex', gap: '8px', color: '#e2e8f0', fontSize: '14px' }}><Check size={16} color="#a78bfa" /> 7/24 Özel AI Destek Ajanı</li>
            </ul>
          </div>
        </div>
      </div>

      {/* NO-BRAINER GARANTİ */}
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '40px 24px' }}>
        <div style={{ background: 'rgba(16,185,129,0.1)', border: '2px solid #34d399', borderRadius: '16px', padding: '32px', textAlign: 'center' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
            <Shield size={48} color="#34d399" />
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: '700', marginBottom: '12px' }}>🛡️ "No-Brainer" Garanti Teklifi</h2>
          <p style={{ color: '#e2e8f0', fontSize: '16px', lineHeight: '1.6' }}>
            Sistemimiz işletmenizde <strong>7 gün boyunca tamamen ücretsiz</strong> çalışacak. Eğer 7 gün içinde en az <strong>3 olumsuz müşteri yorumunu</strong> masadayken çözüp Google Maps 1 yıldızından kurtaramazsak, <strong>tek kuruş ödemezsiniz.</strong>
          </p>
        </div>
      </div>

      {/* LEADS FORM */}
      <div id="lead-form" style={{ maxWidth: '600px', margin: '0 auto', padding: '40px 24px 80px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: '700', textAlign: 'center', marginBottom: '8px' }}>7 Günlük Ücretsiz Denemeyi Başlatın</h2>
        <p style={{ color: '#94a3b8', textAlign: 'center', marginBottom: '24px' }}>Formu doldurun, 24 saat içinde kurulum için sizi arayalım</p>

        {submitted ? (
          <div style={{ padding: '32px', borderRadius: '16px', background: 'rgba(16,185,129,0.1)', border: '1px solid #34d399', textAlign: 'center' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎉</div>
            <h3 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>Başvurunuz Alındı!</h3>
            <p style={{ color: '#94a3b8' }}>24 saat içinde WhatsApp üzerinden sizinle iletişime geçeceğiz.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <input
              required
              value={form.business_name}
              onChange={(e) => setForm({ ...form, business_name: e.target.value })}
              placeholder="İşletme Adı"
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: '#1e293b', color: '#fff' }}
            />
            <input
              required
              value={form.owner_name}
              onChange={(e) => setForm({ ...form, owner_name: e.target.value })}
              placeholder="Sahibi / Yetkili Adı"
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: '#1e293b', color: '#fff' }}
            />
            <input
              required
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
              placeholder="WhatsApp Numarası"
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: '#1e293b', color: '#fff' }}
            />
            <select
              value={form.sector}
              onChange={(e) => setForm({ ...form, sector: e.target.value })}
              style={{ padding: '12px', borderRadius: '8px', border: '1px solid #334155', background: '#1e293b', color: '#fff' }}
            >
              <option value="restoran">Restoran</option>
              <option value="kafe">Kafe</option>
              <option value="otel">Otel</option>
              <option value="klinik">Klinik</option>
              <option value="diger">Diğer</option>
            </select>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{ padding: '16px', borderRadius: '12px', border: 'none', background: isSubmitting ? 'rgba(245,158,11,0.5)' : 'linear-gradient(135deg, #d97706, #f59e0b)', color: '#000', fontSize: '16px', fontWeight: '700', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
            >
              {isSubmitting ? 'Gönderiliyor...' : '🚀 Ücretsiz Denemeyi Başlat'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
