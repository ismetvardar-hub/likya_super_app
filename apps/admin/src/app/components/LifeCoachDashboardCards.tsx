'use client';

import React, { useState } from 'react';
import { prescribeMentalReçete, runCrisisProtocol, pedagogicalCoachEngineStatus, type AnxietyPattern } from '../lib/coaching/pedagogicalCoachEngine';
import { translateGenZ, injectMasterStyle, dazeGenZDictionaryStatus } from '../lib/ai/dazeGenZDictionary';
import { generateSynonymQuiz, academicLexiconEngineStatus, type QuizQuestion } from '../lib/coaching/academicLexiconEngine';

// ============================================================================
// 🩺 DAZE VISION YAŞAM KOÇU — Günün Pedagojik Reçetesi + Gençlik Dili Tercümanı
// + Akademi Eş Anlamlı Pratik. HolisticChildDashboard (holistic view) yanında.
// Plan Z güvenli; deterministik.
// ============================================================================

const PATTERNS: { id: AnxietyPattern; icon: string; label: string }[] = [
  { id: 'fear-of-mistake', icon: '😰', label: 'Hata Korkusu' },
  { id: 'inadequacy', icon: '🌱', label: 'Yetersizlik' },
  { id: 'self-sufficient', icon: '🧠', label: 'Yalnız Hallederim' },
];

const CRISIS_KINDS = [
  { id: 'match-stress' as const, icon: '⚽', label: 'Maç Stresi' },
  { id: 'home-argument' as const, icon: '🏠', label: 'Ev İçi Gerginlik' },
  { id: 'training-fail' as const, icon: '🏋️', label: 'Antrenman Başarısızlığı' },
];

export default function LifeCoachDashboardCards() {
  const [prescription, setPrescription] = useState(() => prescribeMentalReçete('fear-of-mistake'));
  const [crisisKind, setCrisisKind] = useState<'match-stress' | 'home-argument' | 'training-fail'>('match-stress');
  const [genzInput, setGenzInput] = useState("Bu maçta vibe çok iyiydi, takımı hype'ladık!");
  const [genzResult, setGenzResult] = useState(() => translateGenZ("Bu maçta vibe çok iyiydi, takımı hype'ladık!"));
  const [quiz, setQuiz] = useState<QuizQuestion[]>([]);
  const [quizIdx, setQuizIdx] = useState(0);
  const [quizScore, setQuizScore] = useState(0);

  const crisis = runCrisisProtocol(crisisKind);

  const startQuiz = () => { setQuiz(generateSynonymQuiz(4)); setQuizIdx(0); setQuizScore(0); };
  const answer = (opt: string) => { if (quiz.length === 0) return; if (opt === quiz[quizIdx].answer) setQuizScore((s) => s + 1); setQuizIdx((i) => i + 1); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', background: 'linear-gradient(160deg, rgba(15,23,42,0.92), rgba(13,19,34,0.96))', border: '1px solid rgba(74,222,128,0.3)', borderRadius: '16px', padding: '16px', boxShadow: '0 0 26px rgba(74,222,128,0.08)' }}>
      <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>🩺 Daze Vision Yaşam Koçu</div>
      <div style={{ fontSize: '10px', color: '#64748b' }}>{pedagogicalCoachEngineStatus()} • {dazeGenZDictionaryStatus()} • {academicLexiconEngineStatus()}</div>

      {/* 1. GÜNÜN PEDAGOJİK REÇETESİ */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {PATTERNS.map((p) => (
            <button key={p.id} onClick={() => setPrescription(prescribeMentalReçete(p.id))} style={{ fontSize: '10px', fontWeight: 800, padding: '8px 12px', borderRadius: '10px', cursor: 'pointer', border: '1px solid rgba(74,222,128,0.4)', background: prescription.pattern === p.id ? 'rgba(74,222,128,0.15)' : 'rgba(74,222,128,0.06)', color: '#4ade80' }}>
              {p.icon} {p.label}
            </button>
          ))}
        </div>
        <div style={{ background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.3)', borderRadius: '12px', padding: '12px', fontSize: '11px', color: '#e2e8f0', lineHeight: 1.7 }}>
          <b style={{ color: '#4ade80' }}>🩺 TEŞHİS:</b> {prescription.diagnosis}<br />
          <b style={{ color: '#7dd3fc' }}>🔄 YENİ BAKIŞ:</b> {prescription.reframe}
          <div style={{ marginTop: '6px' }}>{prescription.steps.map((s, i) => <span key={i}>• {s}<br /></span>)}</div>
          <b style={{ color: '#f0abfc' }}>💬 Onay: </b>{prescription.affirmation}
        </div>
      </div>

      {/* 2. KRİZ İLETİŞİM PROTOKOLÜ (8 ADIM) */}
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
        <div style={{ fontSize: '10px', fontWeight: 800, color: '#7dd3fc' }}>🚨 8 ADIMLI KRİZ YATIŞTIRMA PROTOKOLÜ</div>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {CRISIS_KINDS.map((k) => (
            <button key={k.id} onClick={() => setCrisisKind(k.id)} style={{ fontSize: '9px', padding: '6px 10px', borderRadius: '8px', border: '1px solid rgba(56,189,248,0.4)', background: crisisKind === k.id ? 'rgba(56,189,248,0.15)' : 'rgba(56,189,248,0.08)', color: '#7dd3fc', cursor: 'pointer' }}>
              {k.icon} {k.label}
            </button>
          ))}
        </div>
        <div style={{ fontSize: '10px', color: '#e2e8f0', lineHeight: 1.6 }}>
          <b style={{ color: '#fbbf24' }}>Açılış: </b>{crisis.opening}
          {crisis.steps.map((s) => <div key={s.order} style={{ marginTop: '2px' }}><b>{s.order}.</b> {s.title}: <i>{s.script}</i></div>)}
        </div>
      </div>

      {/* 3. GENÇLİK DİLİ TERCÜMANI */}
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ fontSize: '10px', fontWeight: 800, color: '#f0abfc' }}>💬 GENÇLİK DİLİ TERCÜMANI</div>
        <input value={genzInput} onChange={(e) => setGenzInput(e.target.value)} style={{ fontSize: '11px', padding: '8px 12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)', color: '#e2e8f0' }} />
        <button onClick={() => setGenzResult(translateGenZ(genzInput))} style={{ fontSize: '10px', fontWeight: 800, padding: '8px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#f0abfc,#818cf8)', color: '#0d1322' }}>🔎 Tercüme Et</button>
        <div style={{ fontSize: '11px', color: '#e2e8f0', lineHeight: 1.6 }}>
          <b style={{ color: '#f0abfc' }}>Anlam:</b> {genzResult.translated}<br />
          <b style={{ color: '#4ade80' }}>🎩 Master üslup:</b> {injectMasterStyle(genzResult.masterReply, 'noble')}
        </div>
      </div>

      {/* 4. AKADEMİ EŞ ANLAMLILAR PRATİĞİ */}
      <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ fontSize: '10px', fontWeight: 800, color: '#fbbf24' }}>📚 AKADEMİ — EŞ ANLAMLILAR MİKRO PRATİK (LGS/YKS)</div>
        {quiz.length === 0 ? (
          <button onClick={startQuiz} style={{ fontSize: '11px', fontWeight: 800, padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#fbbf24,#f97316)', color: '#0d1322' }}>🎯 Testi Başlat (4 soru)</button>
        ) : quizIdx < quiz.length ? (
          <>
            <div style={{ fontSize: '11px', color: '#e2e8f0', fontWeight: 700 }}>{quiz[quizIdx].question}</div>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {quiz[quizIdx].options.map((o) => (
                <button key={o} onClick={() => answer(o)} style={{ fontSize: '10px', padding: '8px 14px', borderRadius: '10px', border: '1px solid rgba(251,191,36,0.4)', background: 'rgba(251,191,36,0.08)', color: '#fbbf24', cursor: 'pointer' }}>{o}</button>
              ))}
            </div>
            <div style={{ fontSize: '9px', color: '#64748b' }}>Soru {quizIdx + 1}/{quiz.length}</div>
          </>
        ) : (
          <div style={{ fontSize: '12px', color: '#e2e8f0' }}>
            ✅ Test bitti — Skor: <b style={{ color: '#4ade80' }}>{quizScore}/{quiz.length}</b>
            <button onClick={startQuiz} style={{ marginLeft: '10px', fontSize: '9px', padding: '6px 10px', borderRadius: '8px', border: '1px solid rgba(74,222,128,0.4)', background: 'transparent', color: '#4ade80', cursor: 'pointer' }}>Tekrar</button>
          </div>
        )}
      </div>
    </div>
  );
}

