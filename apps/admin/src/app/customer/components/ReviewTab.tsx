'use client';

import React, { useState } from 'react';
import { Star, Send, CheckCircle2, Hotel, Car, Tent, Dumbbell, UtensilsCrossed } from 'lucide-react';

// ============================================================================
// LİKYA MÜŞTERİ ÇOKLU HİZMET YORUM & DEĞERLENDİRME MODÜLÜ
// Konaklama, Karavan, Çadır, Spor Parkurları, Yiyecek/İçecek
// ============================================================================

interface ServiceType {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
}

const SERVICES: ServiceType[] = [
  { id: 'konaklama', name: 'Konaklama', icon: <Hotel size={16} />, color: '#00f2fe' },
  { id: 'karavan', name: 'Karavan', icon: <Car size={16} />, color: '#34d399' },
  { id: 'cadir', name: 'Çadır', icon: <Tent size={16} />, color: '#fbbf24' },
  { id: 'spor', name: 'Spor Parkurları', icon: <Dumbbell size={16} />, color: '#f59e0b' },
  { id: 'yiyecek', name: 'Yiyecek/İçecek', icon: <UtensilsCrossed size={16} />, color: '#f87171' },
];

interface Review {
  serviceId: string;
  rating: number;
  comment: string;
  time: string;
}

export default function ReviewTab() {
  const [selectedService, setSelectedService] = useState<string>('konaklama');
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setIsSubmitting(true);

    // Supabase'e kaydet (reviews tablosu)
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
      if (supabaseUrl && supabasePublishableKey) {
        const { createClient } = await import('@supabase/supabase-js');
        const supabase = createClient(supabaseUrl, supabasePublishableKey);
        await supabase.from('reviews').insert([
          {
            service_type: selectedService,
            rating,
            comment,
            user_id: 'customer-001',
          },
        ]);
      }
    } catch (e) {
      // Supabase bağlantısı yoksa yerel kaydet
    }

    const newReview: Review = {
      serviceId: selectedService,
      rating,
      comment,
      time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }),
    };
    setReviews((prev) => [newReview, ...prev]);
    setRating(0);
    setComment('');
    setIsSubmitting(false);
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  const serviceName = (id: string) => SERVICES.find((s) => s.id === id)?.name || id;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Hizmet Seçimi */}
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', marginBottom: '12px' }}>
          ⭐ Hizmet Değerlendirmesi
        </h2>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {SERVICES.map((svc) => (
            <button
              key={svc.id}
              onClick={() => setSelectedService(svc.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '10px',
                border: selectedService === svc.id ? `1px solid ${svc.color}` : '1px solid rgba(255,255,255,0.1)',
                background: selectedService === svc.id ? `${svc.color}15` : 'rgba(255,255,255,0.03)',
                color: selectedService === svc.id ? svc.color : '#94a3b8',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: selectedService === svc.id ? '600' : '400',
              }}
            >
              {svc.icon}
              {svc.name}
            </button>
          ))}
        </div>
      </div>

      {/* Yorum Formu */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px' }}>
        <div style={{ fontSize: '13px', fontWeight: '600', color: '#e2e8f0', marginBottom: '12px' }}>
          {serviceName(selectedService)} hizmetinizi değerlendirin
        </div>

        {/* Yıldız Değerlendirme */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onClick={() => setRating(star)}
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <Star
                size={28}
                color={star <= rating ? '#f59e0b' : '#334155'}
                fill={star <= rating ? '#f59e0b' : 'none'}
              />
            </button>
          ))}
        </div>

        {/* Yorum Alanı */}
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Deneyiminizi yazın..."
          rows={3}
          style={{
            width: '100%',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '10px',
            padding: '12px',
            color: '#e2e8f0',
            fontSize: '13px',
            resize: 'none',
            outline: 'none',
            marginBottom: '12px',
          }}
        />

        {/* Gönder Butonu */}
        <button
          onClick={handleSubmit}
          disabled={rating === 0 || isSubmitting}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 20px',
            borderRadius: '10px',
            border: 'none',
            background: rating === 0 ? 'rgba(245,158,11,0.3)' : 'linear-gradient(135deg, #d97706, #f59e0b)',
            color: rating === 0 ? '#94a3b8' : '#000',
            fontSize: '13px',
            fontWeight: '600',
            cursor: rating === 0 ? 'not-allowed' : 'pointer',
          }}
        >
          {isSubmitting ? 'Gönderiliyor...' : <><Send size={14} /> Yorumu Gönder</>}
        </button>

        {submitted && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', padding: '10px', borderRadius: '8px', background: 'rgba(72,187,120,0.1)', border: '1px solid rgba(72,187,120,0.3)', color: '#48bb78', fontSize: '12px' }}>
            <CheckCircle2 size={16} /> Yorumunuz kaydedildi! Teşekkürler 🌟
          </div>
        )}
      </div>

      {/* Yapılan Yorumlar */}
      {reviews.length > 0 && (
        <div>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0', marginBottom: '12px' }}>
            📝 Yaptığınız Değerlendirmeler
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {reviews.map((r, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#e2e8f0' }}>
                    {serviceName(r.serviceId)}
                  </div>
                  <div style={{ fontSize: '11px', color: '#64748b' }}>{r.time}</div>
                </div>
                <div style={{ display: 'flex', gap: '2px', marginBottom: '6px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} size={14} color={star <= r.rating ? '#f59e0b' : '#334155'} fill={star <= r.rating ? '#f59e0b' : 'none'} />
                  ))}
                </div>
                {r.comment && (
                  <div style={{ fontSize: '12px', color: '#cbd5e1', lineHeight: '1.6' }}>{r.comment}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
