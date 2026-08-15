'use client';

import React, { useState } from 'react';
import { Wrench, Users, Shield, Play, FileImage, FileText } from 'lucide-react';
import { computeBMI, compressImage, renderReportToCanvas, downloadBlob, printReport } from '../lib/tools/clientSideEngine';
import { withIdempotency, getOrCreateBreaker, circuitBreakerRegistry } from '../lib/core/resilienceEngine';
import { orchestrateTask, STAGE_LABELS, type AgentStepLog } from '../lib/agents/graphOrchestrator';

// ============================================================================
// 🛠️ LİKYA HIZLI İSTEMCİ ARAÇLARI & AJAN GÖREV HATTI
// Client-Side motoru + Dayanıklılık zırhı + 6 aşamalı Graph ajanları
// ============================================================================

export default function ToolsAndAgentsDashboard() {
  // İstemci araçları
  const [height, setHeight] = useState(168);
  const [weight, setWeight] = useState(62);
  const [imgInfo, setImgInfo] = useState('');
  const [reportPreview, setReportPreview] = useState('');

  // Ajan hattı
  const [agentTask, setAgentTask] = useState('padel kulübü için yeni antrenman modülü yaz');
  const [agentSteps, setAgentSteps] = useState<AgentStepLog[]>([]);
  const [agentRunning, setAgentRunning] = useState(false);
  const [agentOutput, setAgentOutput] = useState('');

  // Dayanıklılık
  const [idemLog, setIdemLog] = useState<string[]>([]);
  const [breakerStates, setBreakerStates] = useState<Record<string, string>>({});

  const bmi = computeBMI(height, weight);

  // 📤 Resim sıkıştır (tamamen istemci içinde)
  const handleImage = async (file: File) => {
    try {
      const originalKB = file.size / 1024;
      const compressed = await compressImage(file);
      setImgInfo(
        `📉 ${file.name}: ${originalKB.toFixed(0)} KB → ${(compressed.size / 1024).toFixed(0)} KB ` +
        `(%${Math.max(0, Math.round(100 - (compressed.size / file.size) * 100))} kazanç) — veri cihazdan çıkmadı`
      );
      downloadBlob(compressed, `likya_${file.name.replace(/\.[^.]+$/, '')}_sikistirilmis.jpg`);
    } catch (e) {
      setImgInfo(`⚠️ Hata: ${e instanceof Error ? e.message : 'bilinmeyen'}`);
    }
  };

  // 📄 Tahlil raporu (canvas → yazdır/indir)
  const generateReport = () => {
    const canvas = renderReportToCanvas({
      title: '🩺 LİKYA TAHLİL RAPORU',
      athlete: 'Kuzey • 14 yaş',
      date: new Date().toLocaleDateString('tr-TR'),
      rows: [
        { param: 'Ferritin (Demir)', value: '22 ng/mL', ref: '30-300', status: 'low' },
        { param: 'D Vitamini', value: '14 ng/mL', ref: '20-50', status: 'low' },
        { param: 'B12', value: '380 pg/mL', ref: '200-900', status: 'ok' },
        { param: 'Kalsiyum', value: '9.2 mg/dL', ref: '8.5-10.5', status: 'ok' },
        { param: 'Magnezyum', value: '1.9 mg/dL', ref: '1.7-2.2', status: 'ok' },
      ],
      notes: ['Demir + D vitamini düşük — antrenman yükü %30 azaltıldı', 'Daze Chef: demir & D3 zengini menü önerildi'],
    });
    setReportPreview(canvas.toDataURL('image/jpeg', 0.8));
    downloadBlob(blobFromCanvas(canvas), 'likya_tahlil_raporu.jpg');
  };

  // 🧑‍💼 Ajan hattını çalıştır
  const runAgents = async () => {
    setAgentRunning(true);
    setAgentSteps([]);
    setAgentOutput('');
    const result = await orchestrateTask(agentTask, (step) => {
      setAgentSteps((prev) => [...prev, step]);
    });
    setAgentOutput(result.finalOutput);
    setAgentRunning(false);
  };

  // 🔐 Idempotency demo
  const runPayment = async () => {
    const res = await withIdempotency(`ödeme-${Date.now()}-demo`, async () => '✅ 1.250 TL ödeme başarılı (tek sefer)');
    setIdemLog((prev) => [...prev, `[${new Date().toLocaleTimeString('tr-TR')}] ${res.success ? (res.duplicate ? '🔒 MÜKERRER ENGELLENDİ' : res.result) : res.error}`].slice(0, 6));
  };

  // ⚡ Circuit breaker demo
  const callExternalService = async (service: string) => {
    const breaker = getOrCreateBreaker(service);
    const { result, usedFallback, state } = await breaker.call(
      async () => {
        throw new Error(`${service} dış servisi yanıt vermedi`);
      },
      async () => '⚡ Yerel yedek (fallback) devrede — sistem çalışıyor'
    );
    setBreakerStates((prev) => ({ ...prev, [service]: state }));
    setIdemLog((prev) => [...prev, `[${new Date().toLocaleTimeString('tr-TR')}] ${service}: ${result} (${usedFallback ? 'fallback' : 'normal'}, devre: ${state})`].slice(0, 6));
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🛠️ Hızlı İstemci Araçları & Ajan Görev Hattı
        </h2>
        <p style={{ fontSize: '12px', color: '#94a3b8' }}>Sıfır sunucu yükü • %100 KVKK (veri cihazdan çıkmaz) • Kurşun geçirmez dayanıklılık</p>
      </div>

      {/* 🛠️ İstemci Araçları */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px' }}>
        {/* BMI */}
        <div style={{ flex: '1', minWidth: '220px', padding: '14px', borderRadius: '16px', background: 'rgba(0,242,254,0.04)', border: '1px solid rgba(0,242,254,0.2)' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#00f2fe', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FileText size={13} /> 🩺 BMI Hesaplayıcı
          </div>
          <SliderT label="Boy (cm)" value={height} min={100} max={210} onChange={setHeight} color="#00f2fe" />
          <SliderT label="Kilo (kg)" value={weight} min={20} max={130} onChange={setWeight} color="#00f2fe" />
          <div style={{ fontSize: '22px', fontWeight: 'bold', color: bmi.color, margin: '6px 0' }}>
            {bmi.bmi} <span style={{ fontSize: '11px' }}>{bmi.category}</span>
          </div>
          <div style={{ fontSize: '8px', color: '#475569' }}>📲 Cihaz içinde hesaplandı — sunucuya istek yok</div>
        </div>

        {/* Resim sıkıştırma */}
        <div style={{ flex: '1', minWidth: '220px', padding: '14px', borderRadius: '16px', background: 'rgba(52,211,153,0.04)', border: '1px solid rgba(52,211,153,0.2)' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#4ade80', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FileImage size={13} /> 🖼️ Fotoğraf Sıkıştırma
          </div>
          <label style={{ display: 'block', padding: '14px', borderRadius: '10px', border: '1px dashed rgba(52,211,153,0.4)', textAlign: 'center', cursor: 'pointer', background: 'rgba(52,211,153,0.05)', fontSize: '10px', color: '#4ade80' }}>
            📤 Görsel Seç (tarayıcı içinde sıkıştırılır)
            <input type="file" accept="image/*" style={{ display: 'none' }} onChange={(e) => { const f = e.target.files?.[0]; if (f) void handleImage(f); }} />
          </label>
          {imgInfo && <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '8px', lineHeight: '1.5' }}>{imgInfo}</div>}
        </div>

        {/* Rapor üretici */}
        <div style={{ flex: '1', minWidth: '220px', padding: '14px', borderRadius: '16px', background: 'rgba(245,158,11,0.04)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#f59e0b', marginBottom: '8px' }}>📄 Tahlil Raporu (Canvas → JPG/PDF)</div>
          <button onClick={generateReport} style={{ width: '100%', padding: '10px', borderRadius: '10px', cursor: 'pointer', border: '1px solid rgba(245,158,11,0.5)', background: 'rgba(245,158,11,0.1)', color: '#f59e0b', fontSize: '10px', fontWeight: '700' }}>
            🖨️ Rapor Oluştur & İndir
          </button>
          <button onClick={() => { const c = renderReportToCanvas({ title: '🩺 LİKYA TAHLİL RAPORU', athlete: 'Kuzey • 14', date: new Date().toLocaleDateString('tr-TR'), rows: [{ param: 'Ferritin', value: '22', ref: '30-300', status: 'low' }, { param: 'D Vitamini', value: '14', ref: '20-50', status: 'low' }, { param: 'B12', value: '380', ref: '200-900', status: 'ok' }, { param: 'Kalsiyum', value: '9.2', ref: '8.5-10.5', status: 'ok' }, { param: 'Magnezyum', value: '1.9', ref: '1.7-2.2', status: 'ok' }], notes: ['Demir + D vitamini düşük — yük %30 azaltıldı', 'Daze Chef: demir & D3 menüsü'] }); printReport(c); }} style={{ width: '100%', padding: '10px', borderRadius: '10px', cursor: 'pointer', border: '1px solid rgba(0,242,254,0.4)', background: 'rgba(0,242,254,0.06)', color: '#00f2fe', fontSize: '10px', fontWeight: '700', marginTop: '6px' }}>
            🖨️ PDF Olarak Yazdır
          </button>
          <div style={{ fontSize: '8px', color: '#475569', marginTop: '8px' }}>🔒 KVKK: veri hiçbir sunucuya gitmedi</div>
        </div>
      </div>


      {/* 👥 Ajan Görev Hattı (Graph Status) */}
      <div style={{ padding: '14px', borderRadius: '16px', background: 'rgba(167,139,250,0.04)', border: '1px solid rgba(167,139,250,0.2)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#a78bfa', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Users size={14} /> 👥 6'lı Ajan Görev Hattı
          </div>
          <button onClick={() => void runAgents()} disabled={agentRunning} style={{ padding: '9px 16px', borderRadius: '20px', cursor: agentRunning ? 'default' : 'pointer', border: '1px solid rgba(167,139,250,0.5)', background: 'rgba(167,139,250,0.1)', color: '#a78bfa', fontSize: '11px', fontWeight: '700' }}>
            <Play size={11} style={{ display: 'inline', marginRight: 4 }} /> {agentRunning ? 'Çalışıyor...' : 'Hattı Çalıştır'}
          </button>
        </div>
        <input value={agentTask} onChange={(e) => setAgentTask(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: '#e2e8f0', fontSize: '12px', outline: 'none', marginBottom: '12px' }} />

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
          {Object.entries(STAGE_LABELS).map(([stage, label]) => {
            const step = agentSteps.find((s) => s.stage === stage);
            const active = agentRunning && !step;
            const done = step?.status === 'tamam';
            const err = step?.status === 'hata';
            return (
              <span key={stage} style={{ fontSize: '9px', fontWeight: '700', padding: '5px 10px', borderRadius: '10px', border: `1px solid ${err ? 'rgba(248,113,113,0.6)' : done ? 'rgba(74,222,128,0.4)' : active ? 'rgba(167,139,250,0.5)' : 'rgba(255,255,255,0.1)'}`, background: err ? 'rgba(248,113,113,0.1)' : done ? 'rgba(74,222,128,0.1)' : active ? 'rgba(167,139,250,0.1)' : 'rgba(255,255,255,0.02)', color: err ? '#f87171' : done ? '#4ade80' : active ? '#a78bfa' : '#64748b' }}>
                {done ? '✅' : err ? '⛔' : active ? '⏳' : '○'} {label}
              </span>
            );
          })}
        </div>

        {agentSteps.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '9px', color: '#94a3b8', fontFamily: 'monospace', maxHeight: '150px', overflowY: 'auto' }}>
            {agentSteps.map((s, i) => (
              <div key={i} style={{ color: s.status === 'hata' ? '#f87171' : s.status === 'tamam' ? '#4ade80' : '#a78bfa' }}>
                [{s.time}] {STAGE_LABELS[s.stage]}: {s.detail}
              </div>
            ))}
          </div>
        )}
        {agentOutput && <div style={{ fontSize: '10px', color: '#e2e8f0', marginTop: '8px', padding: '8px', borderRadius: '8px', background: 'rgba(74,222,128,0.06)' }}>{agentOutput}</div>}
      </div>


      {/* 🛡️ Dayanıklılık Zırhı */}
      <div style={{ padding: '14px', borderRadius: '16px', background: 'rgba(248,113,113,0.03)', border: '1px solid rgba(248,113,113,0.2)' }}>
        <div style={{ fontSize: '12px', fontWeight: '700', color: '#f87171', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Shield size={14} /> 🛡️ Mikroservis Dayanıklılık Zırhı
        </div>
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => void runPayment()} style={{ padding: '9px 14px', borderRadius: '12px', cursor: 'pointer', border: '1px solid rgba(248,113,113,0.5)', background: 'rgba(248,113,113,0.1)', color: '#f87171', fontSize: '10px', fontWeight: '700' }}>
            🔐 Idempotency Testi (Ödeme İşle)
          </button>
          <button onClick={() => void callExternalService('hava-durumu-api')} style={{ padding: '9px 14px', borderRadius: '12px', cursor: 'pointer', border: '1px solid rgba(0,242,254,0.5)', background: 'rgba(0,242,254,0.08)', color: '#00f2fe', fontSize: '10px', fontWeight: '700' }}>
            ⚡ Circuit Breaker (Dış Servis Çağır)
          </button>
        </div>
        {idemLog.length > 0 && (
          <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '9px', fontFamily: 'monospace', color: '#94a3b8' }}>
            {idemLog.map((l, i) => <div key={i}>{l}</div>)}
          </div>
        )}
        <div style={{ fontSize: '8px', color: '#475569', marginTop: '8px' }}>
          Devre durumları: {Object.keys(circuitBreakerRegistry).map((k) => `${k}: ${circuitBreakerRegistry[k].getState()}`).join(' • ') || 'henüz çağrı yok'}
        </div>
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------------
// Yardımcılar
// ----------------------------------------------------------------------------
function blobFromCanvas(canvas: HTMLCanvasElement): Blob {
  const data = canvas.toDataURL('image/jpeg', 0.82);
  const arr = data.split(',')[1];
  const bin = atob(arr);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new Blob([bytes], { type: 'image/jpeg' });
}

function SliderT({ label, value, min, max, onChange, color }: { label: string; value: number; min: number; max: number; onChange: (v: number) => void; color: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
      <span style={{ fontSize: '9px', color: '#64748b', minWidth: '52px' }}>{label}</span>
      <input type="range" min={min} max={max} value={value} onChange={(e) => onChange(Number(e.target.value))} style={{ flex: 1, cursor: 'pointer', accentColor: color, height: '3px' }} />
      <span style={{ fontSize: '10px', fontWeight: '700', color, minWidth: '32px', textAlign: 'right' }}>{value}</span>
    </div>
  );
}

