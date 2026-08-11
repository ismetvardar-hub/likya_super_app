'use client';

import React, { useState } from 'react';

export default function PolyglotTranslatorCore() {
  const [translations] = useState([
    {
      id: 'TRANS-01',
      languages: 'Türkçe ⇄ İngilizce, Almanca, Rusça, Eski Yunanca & Likyaca 🌐',
      mode: 'Çift Yönlü Canlı Ses & Altyazı Eşzamanlılığı',
      latencyMs: '45ms Sıfır Gecikme',
      status: 'Konser & Konferanslarda Canlı Çeviri Aktif',
    },
  ]);

  return (
    <div style={{ background: 'var(--card-bg)', border: '1px solid var(--border-color)', borderRadius: '20px', padding: '24px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: '800', color: 'white', marginBottom: '12px' }}>
        🌐 ÇOK DİLLİ ANLIK ÇEVİRİ VE ANTİK LEHÇE AI TERCÜMANI (FAZ 46)
      </h2>
      <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginBottom: '16px' }}>
        Tüm yabancı turistler ve araştırmacılar için anında sesli ve metin çeviri sağlayan çok dilli AI motoru.
      </p>
      {translations.map((t) => (
        <div key={t.id} style={{ background: 'rgba(159, 122, 234, 0.1)', border: '1px solid #9f7aea', padding: '16px', borderRadius: '14px' }}>
          <h3 style={{ color: 'white', fontSize: '15px' }}>{t.languages}</h3>
          <div style={{ fontSize: '12px', color: 'white', marginTop: '6px' }}>🎙️ {t.mode} • ⚡ {t.latencyMs}</div>
          <div style={{ fontSize: '11px', color: 'var(--accent-green)', marginTop: '4px' }}>✅ {t.status}</div>
        </div>
      ))}
    </div>
  );
}
