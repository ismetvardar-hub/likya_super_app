'use client';

import React, { useState } from 'react';
import { LANGUAGES, listTerms, dictionaryCompleteness, type Language, type DictCategory } from '../../app/lib/i18n/sportsDictionaryData.ts';

// ============================================================================
// 🌍 ÇOK DİLLİ SPOR BİLİMİ SÖZLÜĞÜ GÖRÜNÜMÜ (Adım 72)
// TR/EN/DE/FR dil değiştirici + arama + kategori filtreleri (Physio/Kinematic/Bio).
// Veri: sportsDictionaryData.ts
// ============================================================================

const CATEGORIES: Array<DictCategory | 'ALL'> = ['ALL', 'Physiological', 'Kinematic', 'Biomechanical'];

export default function SportsDictionaryView() {
  const [lang, setLang] = useState<Language>('TR');
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<DictCategory | 'ALL'>('ALL');
  const completeness = dictionaryCompleteness();

  const terms = listTerms(lang, category === 'ALL' ? undefined : category).filter(
    (t) => t.label.toLowerCase().includes(query.toLowerCase()) || t.key.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div style={{ width: '100%', background: 'rgba(2,6,23,0.7)', borderRadius: 14, padding: 12 }}>
      {/* Dil seçici + tamlık */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', marginBottom: 8 }}>
        {LANGUAGES.map((l) => (
          <button key={l} onClick={() => setLang(l)} style={{ fontSize: 10, fontWeight: 800, padding: '5px 10px', borderRadius: 8, border: lang === l ? '1px solid #00f2fe' : '1px solid #334155', background: lang === l ? 'rgba(0,242,254,0.1)' : 'transparent', color: '#e2e8f0', cursor: 'pointer' }}>{l}</button>
        ))}
        <span style={{ fontSize: 9, color: '#64748b', marginLeft: 'auto' }}>Çeviri tamlığı: {completeness.complete}/{completeness.total}</span>
      </div>

      {/* Arama + kategori */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Terim ara…" style={{ fontSize: 10, background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155', borderRadius: 8, padding: '6px 10px', flex: 1, minWidth: 140 }} />
        {CATEGORIES.map((c) => (
          <button key={c} onClick={() => setCategory(c)} style={{ fontSize: 9, padding: '4px 8px', borderRadius: 6, border: category === c ? '1px solid #facc15' : '1px solid #334155', background: 'transparent', color: '#e2e8f0', cursor: 'pointer' }}>{c}</button>
        ))}
      </div>

      {/* Terim listesi */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        {terms.map((t) => (
          <div key={t.key} style={{ padding: '8px 10px', borderRadius: 10, border: '1px solid rgba(0,242,254,0.12)', background: 'rgba(255,255,255,0.03)' }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: '#00f2fe' }}>{t.emoji} {t.label} <span style={{ color: '#64748b', fontWeight: 600 }}>({t.key} · {t.category})</span></div>
            <div style={{ fontSize: 10, color: '#94a3b8', marginTop: 2 }}>{t.definition}</div>
          </div>
        ))}
        {terms.length === 0 && <div style={{ fontSize: 10, color: '#64748b', padding: 10 }}>Sonuç bulunamadı.</div>}
      </div>
    </div>
  );
}
