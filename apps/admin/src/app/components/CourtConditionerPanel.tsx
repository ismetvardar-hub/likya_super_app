'use client';

import React, { useState } from 'react';
import { CONDITIONER_SCALES, runCourtConditioner, athleticPrescription, ATHLETIC_MATRIX, type ConditionerScale, type CourtConditionerResult } from '../lib/sports/courtConditionerEngine';
import { staffTaskDispatched } from '../lib/ops/dazeHubEventBus';

// ============================================================================
// 📋 SPORTVISIONX DRILL KÜTÜPHANESİ — Antrenör paneli
// Tek tıkla "The 17s Testi" / "Alt Vücut Kuvvet Protokolü" / "Reaksiyon Matrisi"
// seçip sahaya/sporcuya atar; atama Daze Hub Event Bus'a personel görevi olarak
// düşer. Test simülasyonu deterministik skorlama ile canlı sonuç üretir.
// ============================================================================

interface DrillCard {
  id: string;
  icon: string;
  title: string;
  subtitle: string;
  meta: string;
  assign: (athlete: string) => CourtConditionerResult | { drill: string; athlete: string };
}

const ATHLETES = ['Efe K.', 'Deniz A.', 'Mert S.', 'Zeynep T.', 'Alp Y.'];

export default function CourtConditionerPanel() {
  const [athlete, setAthlete] = useState('Efe K.');
  const [lastResult, setLastResult] = useState<CourtConditionerResult | { drill: string; athlete: string } | null>(null);
  const [assigned, setAssigned] = useState<{ id: string; athlete: string; at: string }[]>([]);

  const cards: DrillCard[] = [
    {
      id: '17s-test',
      icon: '🏀',
      title: 'The 17s Court Conditioner',
      subtitle: '60 saniyelik saha içi kondisyon testi • Başlangıç 9-11 / Orta 13-15 / İleri 17 geçiş',
      meta: 'Nabız toparlanma + pivot biyomekanik kaydı',
      assign: (a) => {
        const r = runCourtConditioner({ athlete: a, ageGroup: 'U14', scale: 'orta', passes: 14 });
        staffTaskDispatched(`CC-${Date.now().toString(36).slice(-4).toUpperCase()}`, `${a} antrenmanı`, 0, r.passes);
        return r;
      },
    },
    {
      id: 'alt-vucut',
      icon: '🦵',
      title: 'Alt Vücut Kuvvet Protokolü',
      subtitle: 'Squat + CMJ + depth jump progresyonu • U12-U16',
      meta: '3 x 5 set • 90s dinlenme',
      assign: (a) => {
        const r = runCourtConditioner({ athlete: a, ageGroup: 'U16', scale: 'ileri', passes: 16 });
        staffTaskDispatched(`AV-${Date.now().toString(36).slice(-4).toUpperCase()}`, `${a} kuvvet protokolü`, 0, r.passes);
        return r;
      },
    },
    {
      id: 'reaksiyon',
      icon: '⚡',
      title: 'Reaksiyon Matrisi (U8-U16)',
      subtitle: 'Görsel/ses tepki + 5-0-5 çeviklik pencereleri',
      meta: '5 yaş bandı hazır reçete',
      assign: (a) => {
        const p = athleticPrescription('U12');
        staffTaskDispatched(`RK-${Date.now().toString(36).slice(-4).toUpperCase()}`, `${a} reaksiyon`, 0, 8);
        return { drill: p.reaction, athlete: a };
      },
    },
    {
      id: 'pivot',
      icon: '🔄',
      title: 'Ayak Dönüş & Denge Drilli',
      subtitle: 'Pivot biyomekaniği + ağırlık aktarımı (dominant/off foot)',
      meta: 'Balance kaybı < 3 hedef',
      assign: (a) => {
        const r = runCourtConditioner({ athlete: a, ageGroup: 'U14', scale: 'baslangic', passes: 10, pivot: { weightTransfer: 2, balanceLosses: 2, avgPivotDegrees: 95 } });
        staffTaskDispatched(`PV-${Date.now().toString(36).slice(-4).toUpperCase()}`, `${a} pivot drilli`, 0, r.pivot.totalPivots);
        return r;
      },
    },
  ];

  const handleAssign = (card: DrillCard) => {
    const res = card.assign(athlete);
    setLastResult(res);
    setAssigned((prev) => [{ id: card.id, athlete, at: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) }, ...prev].slice(0, 5));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', background: 'linear-gradient(160deg, rgba(15,23,42,0.92), rgba(13,19,34,0.96))', border: '1px solid rgba(0,242,254,0.3)', borderRadius: '16px', padding: '16px', boxShadow: '0 0 26px rgba(0,242,254,0.08)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
        <div>
          <div style={{ fontSize: '14px', fontWeight: 800, color: '#fff' }}>📋 SportVisionX — Drill Kütüphanesi</div>
          <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>17s Testi • Alt Vücut • Reaksiyon • Pivot — tek tıkla atama</div>
        </div>
        <select value={athlete} onChange={(e) => setAthlete(e.target.value)} style={{ fontSize: '11px', padding: '6px 10px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.06)', color: '#e2e8f0', cursor: 'pointer' }}>
          {ATHLETES.map((a) => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '10px' }}>
        {cards.map((c) => (
          <div key={c.id} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#fff' }}>{c.icon} {c.title}</div>
            <div style={{ fontSize: '10px', color: '#94a3b8', lineHeight: 1.45 }}>{c.subtitle}</div>
            <div style={{ fontSize: '9px', color: '#00f2fe' }}>{c.meta}</div>
            <button onClick={() => handleAssign(c)} style={{ marginTop: 'auto', fontSize: '10px', padding: '7px 10px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#00f2fe,#4facfe)', color: '#0d1322', fontWeight: 800 }}>
              ⚡ {athlete.split(' ')[0]} için ata
            </button>
          </div>
        ))}
      </div>

      {lastResult && (
        <div style={{ background: 'rgba(0,242,254,0.06)', border: '1px solid rgba(0,242,254,0.3)', borderRadius: '12px', padding: '10px 12px', fontSize: '11px', color: '#e2e8f0', lineHeight: 1.6 }}>
          {('drill' in lastResult) ? (
            <>✅ <b>{lastResult.athlete}</b> • {lastResult.drill} reçetesi atandı → Daze Hub Event Bus&apos;a görev düştü.</>
          ) : (
            <>
              ✅ <b>{(lastResult as CourtConditionerResult).athlete}</b> • 17s Testi ({scaleLabel((lastResult as CourtConditionerResult).scale)}):{' '}
              <b>{(lastResult as CourtConditionerResult).passes}</b> geçiş →{' '}
              <b style={{ color: (lastResult as CourtConditionerResult).verdict === 'PASS' ? '#4ade80' : '#f87171' }}>{(lastResult as CourtConditionerResult).verdict}</b> |
              Pivot {Math.round((lastResult as CourtConditionerResult).pivot.avgPivotDegrees)}° (ağırlık {3 - (lastResult as CourtConditionerResult).pivot.balanceLosses}/3) |
              Nabız {Math.round((lastResult as CourtConditionerResult).heart.recoveryRate)}% toparlanma | Sonraki: {scaleLabel((lastResult as CourtConditionerResult).nextScale)}
            </>
          )}
        </div>
      )}

      {assigned.length > 0 && (
        <div style={{ fontSize: '9px', color: '#64748b' }}>
          Son atamalar: {assigned.map((a) => `${a.athlete} • ${a.at}`).join('  |  ')}
        </div>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
        {CONDITIONER_SCALES.map((s) => (
          <span key={s.id} style={{ fontSize: '9px', padding: '4px 8px', borderRadius: '999px', border: '1px solid rgba(168,85,247,0.4)', color: '#f0abfc', background: 'rgba(168,85,247,0.1)' }}>
            {s.label}: {s.minPasses}-{s.maxPasses} geçiş • {s.restSec}s
          </span>
        ))}
        {ATHLETIC_MATRIX.map((p) => (
          <span key={p.ageGroup} style={{ fontSize: '9px', padding: '4px 8px', borderRadius: '999px', border: '1px solid rgba(56,189,248,0.4)', color: '#7dd3fc', background: 'rgba(56,189,248,0.08)' }}>
            {p.ageGroup}: {p.phase}
          </span>
        ))}
      </div>
    </div>
  );
}

function scaleLabel(s: ConditionerScale): string {
  return CONDITIONER_SCALES.find((c) => c.id === s)?.label ?? s;
}

