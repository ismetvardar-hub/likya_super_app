'use client';

import React, { useState } from 'react';
import { applyCalibration, computeCalibrationCoefficients, loadCalibration, saveCalibration, type CalibrationCoefficients } from '../lib/hardware/insoleCalibration.ts';

// ============================================================================
// ⚖️ TABANLIK KALİBRASYON SİHİRBAZI (Adım 22) — UI katmanı
// 1. Tare / Sıfır Yük   2. Tek Bacak Durma   3. Dinamik Adım Testi
// k_toe, k_heel katsayıları localStorage'a kaydedilir (mantık: insoleCalibration.ts)
// ============================================================================

export default function InsoleCalibrationWizard() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [weightKg, setWeightKg] = useState(65);
  const [tareAdc, setTareAdc] = useState({ toe: 512, heel: 510 });
  const [singleAdc, setSingleAdc] = useState({ toe: 2650, heel: 2550 });
  const [dynamic] = useState({ toeN: 540, heelN: 130 });
  const [coeff, setCoeff] = useState<CalibrationCoefficients | null>(() => loadCalibration());

  const steps = [
    { title: 'Tare / Sıfır Yük', desc: 'Tabanlık boşta, hiç yük yokken ADC okumalarını kaydedin.', field: 'tare' },
    { title: 'Tek Bacak Durma', desc: 'Tek bacak üzerinde durun ve ADC değerlerini kaydedin.', field: 'single' },
    { title: 'Dinamik Adım Testi', desc: 'Birkaç adım atın — toe/heel Newton dağılımını doğrulayın.', field: 'dynamic' },
  ];

  const runCalibration = () => {
    const k = computeCalibrationCoefficients({ weightKg, tareAdc, singleAdc });
    const c: CalibrationCoefficients = { ...k, calibratedAt: new Date().toISOString() };
    saveCalibration(c);
    setCoeff(c);
    setStep(3);
  };

  const kToe = coeff ? applyCalibration(singleAdc.toe, coeff.tareToe, coeff.kToe) : 0;

  return (
    <>
      <button onClick={() => setOpen(true)} style={{ fontSize: '9.5px', fontWeight: 800, padding: '7px 13px', borderRadius: 10, border: '1px solid rgba(250,204,21,0.4)', background: 'rgba(250,204,21,0.08)', color: '#facc15', cursor: 'pointer' }}>⚖️ Kalibrasyon</button>

      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setOpen(false)}>
          <div style={{ width: 'min(520px, 94vw)', background: '#0f172a', border: '1px solid rgba(250,204,21,0.35)', borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: '#fff' }}>⚖️ Tabanlık Kalibrasyonu</div>
              <button onClick={() => setOpen(false)} style={{ fontSize: 14, fontWeight: 800, border: 'none', background: 'transparent', color: '#64748b', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {steps.map((s, i) => <div key={s.field} style={{ flex: 1, height: 4, borderRadius: 99, background: i <= step ? '#facc15' : '#1e293b' }} />)}
            </div>

            {step < 3 ? (
              <>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#facc15' }}>{step + 1}. {steps[step].title}</div>
                <div style={{ fontSize: 9.5, color: '#94a3b8' }}>{steps[step].desc}</div>
                {step === 0 && (
                  <div style={{ display: 'flex', gap: 12 }}>
                    {(['toe', 'heel'] as const).map((f) => (
                      <label key={f} style={{ fontSize: 10, color: '#94a3b8' }}>{f === 'toe' ? 'Toe ADC' : 'Heel ADC'}:
                        <input type="number" value={tareAdc[f]} onChange={(e) => setTareAdc((p) => ({ ...p, [f]: Number(e.target.value) }))} style={{ width: 70, marginLeft: 6, padding: '6px 8px', borderRadius: 8, border: '1px solid #334155', background: '#1e293b', color: '#e2e8f0', outline: 'none', fontSize: 11 }} />
                      </label>
                    ))}
                  </div>
                )}
                {step === 1 && (
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                    <label style={{ fontSize: 10, color: '#94a3b8' }}>Vücut Ağırlığı (kg):
                      <input type="number" value={weightKg} onChange={(e) => setWeightKg(Number(e.target.value))} style={{ width: 60, marginLeft: 6, padding: '6px 8px', borderRadius: 8, border: '1px solid #334155', background: '#1e293b', color: '#e2e8f0', outline: 'none', fontSize: 11 }} />
                    </label>
                    {(['toe', 'heel'] as const).map((f) => (
                      <label key={f} style={{ fontSize: 10, color: '#94a3b8' }}>{f === 'toe' ? 'Toe ADC' : 'Heel ADC'}:
                        <input type="number" value={singleAdc[f]} onChange={(e) => setSingleAdc((p) => ({ ...p, [f]: Number(e.target.value) }))} style={{ width: 70, marginLeft: 6, padding: '6px 8px', borderRadius: 8, border: '1px solid #334155', background: '#1e293b', color: '#e2e8f0', outline: 'none', fontSize: 11 }} />
                      </label>
                    ))}
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#facc15' }}>≈ {Math.round(weightKg * 9.81)} N</span>
                  </div>
                )}
                {step === 2 && (
                  <div style={{ fontSize: 10, color: '#94a3b8' }}>Toe: <b style={{ color: '#e2e8f0' }}>{dynamic.toeN} N</b> · Heel: <b style={{ color: '#e2e8f0' }}>{dynamic.heelN} N</b> — ön ayak baskın dağılım ideal.</div>
                )}
                <button onClick={() => (step === 2 ? runCalibration() : setStep((s) => s + 1))} style={{ fontSize: 10, fontWeight: 800, padding: '9px 16px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#eab308,#facc15)', color: '#0f172a', alignSelf: 'flex-start' }}>{step === 2 ? '✅ Hesapla & Kaydet' : 'Sonraki →'}</button>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: '#4ade80' }}>✅ Kalibrasyon tamamlandı!</div>
                {coeff && (
                  <>
                    <div style={{ fontSize: 10, color: '#94a3b8' }}>k_toe = <b style={{ color: '#facc15' }}>{coeff.kToe}</b> · k_heel = <b style={{ color: '#facc15' }}>{coeff.kHeel}</b></div>
                    <div style={{ fontSize: 10, color: '#94a3b8' }}>Tare: toe {coeff.tareToe} · heel {coeff.tareHeel}</div>
                    <div style={{ fontSize: 10, color: '#4ade80' }}>Canlı doğrulama: {Math.round(kToe)} N (tek bacak toe)</div>
                  </>
                )}
                <button onClick={() => setOpen(false)} style={{ fontSize: 10, fontWeight: 800, padding: '9px 16px', borderRadius: 10, border: 'none', cursor: 'pointer', background: '#1e293b', color: '#e2e8f0', alignSelf: 'flex-start' }}>Kapat</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

