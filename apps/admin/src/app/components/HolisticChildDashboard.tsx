'use client';

import React, { useState, useMemo } from 'react';
import {
  METRIC_LABELS,
  interpretLab,
  socialDevelopmentIndex,
  standGuidance,
  developmentIndex,
  buildParentReportCard,
  buildNutritionLabReport,
  type PedagogyMetric,
  type QuarterlyScores,
  type ChildPedagogyProfile,
  type LabValues,
  type SocialObservation,
  type StandObservation,
} from '../lib/sportVision/pedagogyEngine';

// ============================================================================
// 🧒 LİKYA 360° HOLİSTİK ÇOCUK GELİŞİM PANELİ
// Çift Veli Anketi (Q1-Q4) • Medikal Vault • Akademik Yük • Sosyal/Tribün
// ============================================================================

const METRICS = Object.keys(METRIC_LABELS) as PedagogyMetric[];

function baseQ(v = 3): QuarterlyScores {
  return { ozguven: v, akran: v, motivasyon: v, yenilgi: v, uyku: v };
}

const DEFAULT_PROFILE: ChildPedagogyProfile = {
  name: 'Kuzey',
  surveys: [
    {
      parent: 'anne',
      q1: { ozguven: 3, akran: 4, motivasyon: 3, yenilgi: 2, uyku: 4 },
      q2: { ozguven: 3, akran: 4, motivasyon: 4, yenilgi: 3, uyku: 4 },
      q3: { ozguven: 4, akran: 4, motivasyon: 4, yenilgi: 3, uyku: 4 },
      q4: { ozguven: 4, akran: 5, motivasyon: 4, yenilgi: 4, uyku: 4 },
    },
    {
      parent: 'baba',
      q1: { ozguven: 2, akran: 3, motivasyon: 4, yenilgi: 2, uyku: 3 },
      q2: { ozguven: 3, akran: 3, motivasyon: 4, yenilgi: 2, uyku: 3 },
      q3: { ozguven: 3, akran: 4, motivasyon: 4, yenilgi: 3, uyku: 4 },
      q4: { ozguven: 4, akran: 4, motivasyon: 5, yenilgi: 3, uyku: 4 },
    },
  ],
};

export default function HolisticChildDashboard() {
  const [profile, setProfile] = useState<ChildPedagogyProfile>(DEFAULT_PROFILE);
  const [quarter, setQuarter] = useState<1 | 2 | 3 | 4>(4);
  const [lab, setLab] = useState<LabValues>({ ferritin: 22, vitaminD: 14, b12: 380, calcium: 9.2, magnesium: 1.9 });
  const [documents, setDocuments] = useState<{ id: string; type: string; name: string; time: string; found: string[] }[]>([
    { id: 'd1', type: '🩸 Kan Tahlili', name: 'tahlil_q1.jpg', time: '12 Oca', found: ['Ferritin 22', 'D Vit 14'] },
    { id: 'd2', type: '📝 Karne', name: 'karne_donem1.png', time: '28 Oca', found: ['Mat 85', 'Fen 90'] },
  ]);
  const [social, setSocial] = useState<SocialObservation>({ sosyallik: 72, liderlik: 58, izolasyon: 25 });
  const [stand, setStand] = useState<StandObservation>({ tutum: 'baskici', not: '' });
  const [mentalLoad, setMentalLoad] = useState(60);
  const [physicalLoad, setPhysicalLoad] = useState(75);
  const [parentReport, setParentReport] = useState('');
  const [labReport, setLabReport] = useState('');

  const labAnalysis = useMemo(() => interpretLab(lab), [lab]);
  const socialIdx = socialDevelopmentIndex(social);
  const devIdx = developmentIndex(mentalLoad, physicalLoad, socialIdx);

  const setMetric = (parent: 'anne' | 'baba', metric: PedagogyMetric, value: number) => {
    setProfile((prev) => ({
      ...prev,
      surveys: prev.surveys.map((s) => {
        if (s.parent !== parent) return s;
        const qKey = `q${quarter}` as 'q1' | 'q2' | 'q3' | 'q4';
        return { ...s, [qKey]: { ...s[qKey], [metric]: value } };
      }),
    }));
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🧒 360° Holistik Çocuk Gelişim Paneli
        </h2>
        <p style={{ fontSize: '12px', color: '#94a3b8' }}>Pediatrik Biyopsikososyal Takip — spor + okul + aile + sağlık tek akılda</p>
      </div>

      {/* 360° gelişim indeksi + kısa durum */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <div style={{ flex: '1', minWidth: '180px', padding: '14px', borderRadius: '16px', background: 'rgba(0,242,254,0.05)', border: '1px solid rgba(0,242,254,0.25)', textAlign: 'center' }}>
          <div style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>360° Gelişim İndeksi</div>
          <div style={{ fontSize: '30px', fontWeight: 'bold', color: devIdx > 75 ? '#4ade80' : devIdx > 50 ? '#fbbf24' : '#f87171' }}>%{devIdx}</div>
          <div style={{ fontSize: '9px', color: '#64748b', marginTop: '4px' }}>Zihinsel + Fiziksel + Sosyal</div>
        </div>
        <div style={{ flex: '1', minWidth: '180px', padding: '14px', borderRadius: '16px', background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.25)', textAlign: 'center' }}>
          <div style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Sosyal Gelişim</div>
          <div style={{ fontSize: '30px', fontWeight: 'bold', color: '#34d399' }}>%{socialIdx}</div>
          <div style={{ fontSize: '9px', color: '#64748b', marginTop: '4px' }}>Tesis içi etkileşim & liderlik</div>
        </div>
        <div style={{ flex: '1', minWidth: '180px', padding: '14px', borderRadius: '16px', background: 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.25)', textAlign: 'center' }}>
          <div style={{ fontSize: '9px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px' }}>Yüklenen Evrak</div>
          <div style={{ fontSize: '30px', fontWeight: 'bold', color: '#f59e0b' }}>{documents.length}</div>
          <div style={{ fontSize: '9px', color: '#64748b', marginTop: '4px' }}>Tahlil + akademik rapor</div>
        </div>
      </div>

      {/* 🎯 4 Çeyrek radar grafiği (Anne vs Baba) */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ flex: '1', minWidth: '280px', padding: '14px', borderRadius: '16px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#fff', marginBottom: '4px' }}>📋 Pedagojik Radar — Q{quarter} (Anne vs Baba)</div>
          <div style={{ display: 'flex', gap: '6px', marginBottom: '10px' }}>
            {([1, 2, 3, 4] as const).map((q) => (
              <button key={q} onClick={() => setQuarter(q)} style={{ padding: '5px 12px', borderRadius: '10px', cursor: 'pointer', fontSize: '10px', fontWeight: '700', border: quarter === q ? '1px solid rgba(0,242,254,0.5)' : '1px solid rgba(255,255,255,0.15)', background: quarter === q ? 'rgba(0,242,254,0.1)' : 'transparent', color: quarter === q ? '#00f2fe' : '#64748b' }}>Q{q}</button>
            ))}
          </div>
          <RadarChart
            anne={profile.surveys.find((s) => s.parent === 'anne')![`q${quarter}` as keyof typeof profile.surveys[0]] as QuarterlyScores}
            baba={profile.surveys.find((s) => s.parent === 'baba')![`q${quarter}` as keyof typeof profile.surveys[0]] as QuarterlyScores}
          />
        </div>

        {/* Çeyrek skor düzenleme */}
        <div style={{ flex: '1', minWidth: '260px', padding: '14px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#fff', marginBottom: '10px' }}>🎚️ Q{quarter} Skorları (1-5)</div>
          {(['anne', 'baba'] as const).map((parent) => (
            <div key={parent} style={{ marginBottom: '12px', padding: '8px', borderRadius: '10px', background: parent === 'anne' ? 'rgba(0,242,254,0.04)' : 'rgba(167,139,250,0.04)' }}>
              <div style={{ fontSize: '10px', fontWeight: '700', color: parent === 'anne' ? '#00f2fe' : '#a78bfa', marginBottom: '6px' }}>
                {parent === 'anne' ? '👩 Anne' : '👨 Baba'}
              </div>
              {METRICS.map((m) => (
                <div key={m} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                  <span style={{ fontSize: '8px', color: '#64748b', minWidth: '86px' }}>{METRIC_LABELS[m]}</span>
                  <input type="range" min={1} max={5} value={profile.surveys.find((s) => s.parent === parent)![`q${quarter}` as keyof typeof profile.surveys[0]][m]} onChange={(e) => setMetric(parent, m, Number(e.target.value))} style={{ flex: 1, cursor: 'pointer', accentColor: parent === 'anne' ? '#00f2fe' : '#a78bfa', height: '3px' }} />
                  <span style={{ fontSize: '9px', fontWeight: '700', color: parent === 'anne' ? '#00f2fe' : '#a78bfa', minWidth: '14px', textAlign: 'right' }}>{profile.surveys.find((s) => s.parent === parent)![`q${quarter}` as keyof typeof profile.surveys[0]][m]}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>


      {/* 🩺 Medikal Vault — tahlil değerleri + yüklenen evraklar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ flex: '1', minWidth: '280px', padding: '14px', borderRadius: '16px', background: 'rgba(248,113,113,0.03)', border: '1px solid rgba(248,113,113,0.2)' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#f87171', marginBottom: '10px' }}>🩺 Medikal & Biyokimyasal Vault (OCR)</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '11px' }}>
            <span style={{ color: '#94a3b8' }}>Ferritin (Demir)</span>
            <input type="number" value={lab.ferritin} onChange={(e) => setLab({ ...lab, ferritin: Number(e.target.value) })} style={{ width: '70px', padding: '4px 8px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: '#e2e8f0', fontSize: '11px', outline: 'none' }} />
            <span style={{ color: '#94a3b8' }}>D Vitamini</span>
            <input type="number" value={lab.vitaminD} onChange={(e) => setLab({ ...lab, vitaminD: Number(e.target.value) })} style={{ width: '70px', padding: '4px 8px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: '#e2e8f0', fontSize: '11px', outline: 'none' }} />
            <span style={{ color: '#94a3b8' }}>B12</span>
            <input type="number" value={lab.b12} onChange={(e) => setLab({ ...lab, b12: Number(e.target.value) })} style={{ width: '70px', padding: '4px 8px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: '#e2e8f0', fontSize: '11px', outline: 'none' }} />
            <span style={{ color: '#94a3b8' }}>Kalsiyum</span>
            <input type="number" step={0.1} value={lab.calcium} onChange={(e) => setLab({ ...lab, calcium: Number(e.target.value) })} style={{ width: '70px', padding: '4px 8px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: '#e2e8f0', fontSize: '11px', outline: 'none' }} />
            <span style={{ color: '#94a3b8' }}>Magnezyum</span>
            <input type="number" step={0.1} value={lab.magnesium} onChange={(e) => setLab({ ...lab, magnesium: Number(e.target.value) })} style={{ width: '70px', padding: '4px 8px', borderRadius: '8px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: '#e2e8f0', fontSize: '11px', outline: 'none' }} />
          </div>
          <div style={{ marginTop: '10px', fontSize: '9px', color: '#94a3b8', lineHeight: '1.6' }}>
            {labAnalysis.warnings.map((w, i) => (
              <div key={i} style={{ color: w.level === 'DUSUK' ? '#f87171' : w.level === 'YUKSEK' ? '#fbbf24' : '#4ade80' }}>
                {w.level === 'DUSUK' ? '🔻' : w.level === 'YUKSEK' ? '🔺' : '✅'} {w.param}: {w.value} (ref {w.ref})
              </div>
            ))}
            <div style={{ marginTop: '6px', color: '#e2e8f0', fontWeight: '600' }}>🏋️ {labAnalysis.trainingAdvisory}</div>
          </div>
        </div>

        <div style={{ flex: '1', minWidth: '260px', padding: '14px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#fff', marginBottom: '10px' }}>📁 Yüklenen Evraklar (OCR Geçmişi)</div>
          {documents.map((d) => (
            <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', marginBottom: '6px' }}>
              <span style={{ fontSize: '16px' }}>{d.type}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '10px', color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{d.name}</div>
                <div style={{ fontSize: '8px', color: '#64748b' }}>{d.time} • Yakalanan: {d.found.join(', ')}</div>
              </div>
              <span style={{ fontSize: '8px', color: '#4ade80', fontWeight: '700' }}>OCR ✓</span>
            </div>
          ))}
          <button
            onClick={() => setDocuments((prev) => [{ id: `d${prev.length + 1}`, type: '🩸 Kan Tahlili', name: 'tahlil_q2.jpg', time: 'Şimdi', found: [`Ferritin ${lab.ferritin}`, `D Vit ${lab.vitaminD}`] }, ...prev].slice(0, 6))}
            style={{ marginTop: '6px', padding: '8px 14px', borderRadius: '12px', cursor: 'pointer', border: '1px dashed rgba(0,242,254,0.5)', background: 'rgba(0,242,254,0.05)', color: '#00f2fe', fontSize: '10px', fontWeight: '700' }}
          >
            📤 Fotoğraf Yükle (OCR tara)
          </button>
        </div>
      </div>


      {/* 👁️ Sosyal + Tribün + Yük */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ flex: '1', minWidth: '220px', padding: '14px', borderRadius: '16px', background: 'rgba(52,211,153,0.03)', border: '1px solid rgba(52,211,153,0.2)' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#4ade80', marginBottom: '8px' }}>👁️ Tesis İçi Sosyal Takip</div>
          {(['sosyallik', 'liderlik', 'izolasyon'] as const).map((k) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
              <span style={{ fontSize: '8px', color: '#64748b', minWidth: '70px' }}>{k === 'sosyallik' ? 'Sosyallik' : k === 'liderlik' ? 'Liderlik' : 'İzolasyon (düşük iyi)'}</span>
              <input type="range" min={0} max={100} value={social[k]} onChange={(e) => setSocial({ ...social, [k]: Number(e.target.value) })} style={{ flex: 1, cursor: 'pointer', accentColor: '#4ade80', height: '3px' }} />
              <span style={{ fontSize: '9px', fontWeight: '700', color: '#4ade80', minWidth: '28px', textAlign: 'right' }}>{social[k]}</span>
            </div>
          ))}
        </div>

        <div style={{ flex: '1', minWidth: '220px', padding: '14px', borderRadius: '16px', background: 'rgba(167,139,250,0.03)', border: '1px solid rgba(167,139,250,0.2)' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#a78bfa', marginBottom: '8px' }}>🎪 Tribün Davranış Analizi</div>
          <select value={stand.tutum} onChange={(e) => setStand({ ...stand, tutum: e.target.value as StandObservation['tutum'] })} style={{ width: '100%', padding: '8px 10px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: '#e2e8f0', fontSize: '11px', outline: 'none', marginBottom: '8px' }}>
            <option value="destekleyici">👏 Destekleyici</option>
            <option value="baskici">📢 Baskıcı / Müdahaleci</option>
            <option value="ilgisiz">🪑 İlgisiz</option>
          </select>
          <div style={{ fontSize: '9px', color: '#94a3b8', lineHeight: '1.6' }}>{standGuidance(stand)}</div>
        </div>

        <div style={{ flex: '1', minWidth: '220px', padding: '14px', borderRadius: '16px', background: 'rgba(245,158,11,0.03)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#f59e0b', marginBottom: '8px' }}>🏫 Zihinsel & Fiziksel Yük</div>
          <SliderK label="🧠 Akademik/Zihinsel Yük" value={mentalLoad} onChange={setMentalLoad} color="#f59e0b" />
          <SliderK label="🏋️ Antrenman Yükü" value={physicalLoad} onChange={setPhysicalLoad} color="#00f2fe" />
          <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '6px', lineHeight: '1.6' }}>
            {mentalLoad > 75 ? '⚠️ Sınav haftası — antrenmanı "zihinsel deşarj ve oyun odaklı" formata çekin.' : '✅ Zihinsel yük dengeli.'}
          </div>
        </div>
      </div>

      {/* Aksiyon butonları */}
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <button
          onClick={() => setParentReport(buildParentReportCard(profile, social, stand))}
          style={{ padding: '10px 18px', borderRadius: '20px', cursor: 'pointer', border: '1px solid rgba(74,222,128,0.5)', background: 'rgba(74,222,128,0.1)', color: '#4ade80', fontSize: '11px', fontWeight: '700' }}
        >
          🏅 Pedagojik Veli Rehberi Oluştur
        </button>
        <button
          onClick={() => setLabReport(buildNutritionLabReport(lab))}
          style={{ padding: '10px 18px', borderRadius: '20px', cursor: 'pointer', border: '1px solid rgba(248,113,113,0.5)', background: 'rgba(248,113,113,0.1)', color: '#f87171', fontSize: '11px', fontWeight: '700' }}
        >
          🩺 Beslenme & Tahlil Uyarı Raporu Çıkar
        </button>
      </div>

      {(parentReport || labReport) && (
        <div style={{ whiteSpace: 'pre-wrap', fontSize: '10px', lineHeight: '1.7', padding: '12px', borderRadius: '12px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1' }}>
          {parentReport && <>{parentReport}</>}
          {parentReport && labReport && '\n\n━━━━━━━━━━━━━━━━\n\n'}
          {labReport && <>{labReport}</>}
        </div>
      )}
    </div>
  );
}


// ----------------------------------------------------------------------------
// Yardımcı bileşenler
// ----------------------------------------------------------------------------
function RadarChart({ anne, baba }: { anne: QuarterlyScores; baba: QuarterlyScores }) {
  const W = 260;
  const H = 240;
  const cx = W / 2;
  const cy = H / 2 - 10;
  const R = 80;
  const N = METRICS.length;

  const pt = (i: number, v: number) => {
    const angle = -Math.PI / 2 + (i * 2 * Math.PI) / N;
    const r = (v / 5) * R;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  };
  const poly = (vals: QuarterlyScores) =>
    METRICS.map((m, i) => { const p = pt(i, vals[m]); return `${p.x.toFixed(1)},${p.y.toFixed(1)}`; }).join(' ');

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ maxWidth: '300px' }}>
      {/* ızgara halkaları */}
      {[1, 2, 3, 4, 5].map((lv) => (
        <polygon
          key={lv}
          points={METRICS.map((_, i) => { const p = pt(i, lv); return `${p.x.toFixed(1)},${p.y.toFixed(1)}`; }).join(' ')}
          fill="rgba(255,255,255,0.02)"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth="1"
        />
      ))}
      {/* eksen çizgileri */}
      {METRICS.map((m, i) => {
        const p = pt(i, 5);
        return (
          <g key={m}>
            <line x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
            <text x={p.x * 1.12} y={p.y * 1.12 + 3} fill="#64748b" fontSize="8" textAnchor="middle">{METRIC_LABELS[m]}</text>
          </g>
        );
      })}
      {/* Anne (cyan) */}
      <polygon points={poly(anne)} fill="rgba(0,242,254,0.12)" stroke="#00f2fe" strokeWidth="2" strokeLinejoin="round" />
      {/* Baba (mor) */}
      <polygon points={poly(baba)} fill="rgba(167,139,250,0.12)" stroke="#a78bfa" strokeWidth="2" strokeLinejoin="round" />
      {/* lejant */}
      <rect x={cx - 55} y={H - 20} width="12" height="12" fill="#00f2fe" opacity="0.7" rx="2" />
      <text x={cx - 38} y={H - 10} fill="#94a3b8" fontSize="9">👩 Anne</text>
      <rect x={cx + 5} y={H - 20} width="12" height="12" fill="#a78bfa" opacity="0.7" rx="2" />
      <text x={cx + 22} y={H - 10} fill="#94a3b8" fontSize="9">👨 Baba</text>
    </svg>
  );
}

function SliderK({ label, value, onChange, color }: { label: string; value: number; onChange: (v: number) => void; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
      <span style={{ fontSize: '8px', color: '#64748b', minWidth: '96px' }}>{label}</span>
      <input type="range" min={0} max={100} value={value} onChange={(e) => onChange(Number(e.target.value))} style={{ flex: 1, cursor: 'pointer', accentColor: color, height: '3px' }} />
      <span style={{ fontSize: '9px', fontWeight: '700', color, minWidth: '28px', textAlign: 'right' }}>{value}</span>
    </div>
  );
}

