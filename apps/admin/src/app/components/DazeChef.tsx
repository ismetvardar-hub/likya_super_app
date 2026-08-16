'use client';

import React, { useEffect, useRef, useState } from 'react';

// ============================================================================
// 🍜 DAZE CHEF 120s — Otonom Mutfak Hazırlık Sayaçı & Multimodal Reçete
// Buzdolabı görseli (multimodal Gemini) → malzeme tespiti → reçete → 120s sayaç.
// Kırılmasız: görsel analizi başarısızsa deterministik reçete fallback'i devreye
// girer; localStorage son reçeteyi saklar.
// ============================================================================

interface RecipeSuggestion {
  name: string;
  emoji: string;
  time: string;
  difficulty: string;
  calories: number;
  ingredients: string[];
}

const FALLBACK_RECIPES: RecipeSuggestion[] = [
  {
    name: 'Akdeniz Levrek Tabağı', emoji: '🐟', time: '35 dk', difficulty: 'Orta', calories: 520,
    ingredients: ['Levrek', 'Zeytinyağı', 'Domates', 'Biber', 'Limon'],
  },
  {
    name: 'Odun Ateşinde Pizza', emoji: '🍕', time: '20 dk', difficulty: 'Kolay', calories: 780,
    ingredients: ['Hamur', 'Mozzarella', 'Sos', 'Biber', 'Kekik'],
  },
  {
    name: 'Vegan Protein Bowl', emoji: '🥗', time: '15 dk', difficulty: 'Kolay', calories: 410,
    ingredients: ['Nohut', 'Avokado', 'Domates', 'Salatalık', 'Tahin'],
  },
];

const LS_KEY = 'likya_daze_chef_v1';

export default function DazeChef() {
  const [countdown, setCountdown] = useState(0);
  const [running, setRunning] = useState(false);
  const [recipe, setRecipe] = useState<RecipeSuggestion | null>(null);
  const [status, setStatus] = useState('Hazır — buzdolabı görseli yükleyin veya 120s sayacı başlatın.');
  const [imageData, setImageData] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // localStorage'dan son reçete
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(LS_KEY);
      if (saved) setRecipe(JSON.parse(saved) as RecipeSuggestion);
    } catch { /* ignore */ }
  }, []);

  // 120s geri sayım
  const startCountdown = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setCountdown(120);
    setRunning(true);
    setStatus('⏱️ 120 saniyelik mutfak hazırlık sayacı başladı!');
    timerRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setRunning(false);
          setStatus('✅ Hazırlık tamamlandı — servis edin, Patron!');
          return 0;
        }
        return c - 1;

      });
    }, 1000);
  };

  const resetCountdown = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setRunning(false);
    setCountdown(0);
    setStatus('Hazır.');
  };


  // Buzdolabı görselini multimodal analiz et → reçete
  const analyzeFridge = (dataUrl: string) => {
    setImageData(dataUrl);
    setStatus('👁️ Buzdolabı görseli Gemini\'ye gönderiliyor…');
    const base64 = dataUrl.split(',')[1] ?? dataUrl;
    fetch('/api/v1/ceo/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        command: 'Buzdolabındaki malzemelerden Daze Chef için reçete öner: ### Malzemeler / ### Yemek Önerisi',
        image: { name: 'fridge.jpg', mimeType: 'image/jpeg', data: base64 },
      }),
    })
      .then((r) => r.json())
      .then((res) => {
        if (res.success && res.answer) {
          setStatus('✅ Gemini reçete üretti!');
          const suggested: RecipeSuggestion = {
            name: 'Gemini Reçetesi', emoji: '🍳', time: '25 dk', difficulty: 'Otomatik', calories: 480,
            ingredients: ['Görselden tespit edilen malzemeler', ...(res.answer.split('\n').filter((l: string) => /^[-•]|^- /.test(l.trim())).slice(0, 4))],
          };
          setRecipe(suggested);
          try { window.localStorage.setItem(LS_KEY, JSON.stringify(suggested)); } catch { /* ignore */ }
        } else {
          fallbackRecipe();
        }
      })
      .catch(() => fallbackRecipe());
  };

  const fallbackRecipe = () => {
    const pick = FALLBACK_RECIPES[Math.floor(Math.random() * FALLBACK_RECIPES.length)];
    setRecipe(pick);
    setStatus('⚙️ Gemini erişilemedi — deterministik reçete fallback devrede.');
    try { window.localStorage.setItem(LS_KEY, JSON.stringify(pick)); } catch { /* ignore */ }
  };

  const mm = `${Math.floor(countdown / 60)}:${String(countdown % 60).padStart(2, '0')}`;


  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: '12px',
      background: 'linear-gradient(160deg, rgba(15,23,42,0.9), rgba(13,19,34,0.95))',
      border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '16px', marginTop: '16px',
    }}>
      <div style={{ fontSize: '15px', fontWeight: 800, color: '#fff' }}>
        🍜 Daze Chef 120s — Otonom Mutfak Motoru
      </div>

      {/* 120s sayaç */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
        <div style={{
          fontSize: '34px', fontWeight: 800, fontVariantNumeric: 'tabular-nums',
          color: running ? (countdown <= 30 ? '#f87171' : '#00f2fe') : '#64748b',
          minWidth: '110px', textAlign: 'center',
          background: 'rgba(0,0,0,0.3)', borderRadius: '12px', padding: '8px 14px',
          border: running ? '1px solid rgba(0,242,254,0.4)' : '1px solid rgba(255,255,255,0.1)',
        }}>
          {countdown > 0 ? mm : '120s'}
        </div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button onClick={startCountdown} disabled={running} style={{ padding: '8px 14px', borderRadius: '10px', border: 'none', cursor: running ? 'default' : 'pointer', background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', fontWeight: 700, fontSize: '12px' }}>
            ▶️ 120s Başlat
          </button>
          <button onClick={resetCountdown} style={{ padding: '8px 14px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', cursor: 'pointer', background: 'rgba(255,255,255,0.05)', color: '#e2e8f0', fontWeight: 700, fontSize: '12px' }}>
            Sıfırla
          </button>
          <button onClick={() => fileInputRef.current?.click()} style={{ padding: '8px 14px', borderRadius: '10px', border: '1px solid rgba(0,242,254,0.5)', cursor: 'pointer', background: 'rgba(0,242,254,0.1)', color: '#67e8f9', fontWeight: 700, fontSize: '12px' }}>
            📸 Buzdolabı Görseli
          </button>
        </div>
        <input
          ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => { if (typeof reader.result === 'string') analyzeFridge(reader.result); };
            reader.readAsDataURL(file);
            e.target.value = '';
          }}
        />
      </div>

      {/* Görsel önizleme */}
      {imageData && (
        <img src={imageData} alt="Buzdolabı" style={{ maxHeight: '120px', borderRadius: '10px', objectFit: 'cover', width: '100%' }} />
      )}

      {/* Durum */}
      <div style={{ fontSize: '12px', color: '#94a3b8', padding: '8px 10px', borderRadius: '8px', background: 'rgba(255,255,255,0.04)' }}>
        {status}
      </div>

      {/* Reçete kartı */}
      {recipe && (
        <div style={{ border: '1px solid rgba(245,158,11,0.3)', borderRadius: '12px', padding: '12px', background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(0,242,254,0.05))' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#fff' }}>{recipe.emoji} {recipe.name}</div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <span style={{ fontSize: '10px', color: '#fbbf24', background: 'rgba(245,158,11,0.12)', padding: '2px 8px', borderRadius: '999px' }}>⏱️ {recipe.time}</span>
              <span style={{ fontSize: '10px', color: '#67e8f9', background: 'rgba(0,242,254,0.1)', padding: '2px 8px', borderRadius: '999px' }}>🔥 {recipe.calories} kcal</span>
              <span style={{ fontSize: '10px', color: '#a5b4fc', background: 'rgba(79,70,229,0.12)', padding: '2px 8px', borderRadius: '999px' }}>{recipe.difficulty}</span>
            </div>
          </div>
          <div style={{ marginTop: '8px', fontSize: '11px', color: '#cbd5e1', display: 'flex', flexDirection: 'column', gap: '3px' }}>
            {recipe.ingredients.map((i) => (
              <div key={i} style={{ display: 'flex', gap: '6px' }}><span style={{ color: '#00f2fe' }}>•</span>{i}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

