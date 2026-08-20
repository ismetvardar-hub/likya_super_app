'use client';

import React, { useRef, useState } from 'react';
import { buildTacticalGraph, buildSeasonWorkflow, detectAnomalies, type CanvasNode, type CanvasEdge, type AthleteVitals, type WorkflowStep } from '../../lib/sports/tacticalCanvasEngine';

// ============================================================================
// 🎨 TAKTİK WORKFLOW CANVAS (Flowith/Neo tarzı) — sonsuz pan/zoom node ekranı
// Athlete • Drill • AI Insight node'lar + anomali→düzelt edge'leri
// "Otonom Sezon Raporu Oluştur" → 4 adımlı sub-task zinciri spawn eder
// Bağımlılıksız (SVG/HTML5 Canvas) — React Flow gerekmez.
// ============================================================================

export default function TacticalWorkflowCanvas() {
  const [vitals] = useState<AthleteVitals>({ athlete: 'Arda G.', gctMs: 208, rsi: 1.4, hr: 172, heelPct: 56, loadingKnS: 2.6 });
  const graph = buildTacticalGraph(vitals);
  const [nodes, setNodes] = useState<CanvasNode[]>(graph.nodes);
  const [edges] = useState<CanvasEdge[]>(graph.edges);
  const [view, setView] = useState({ x: 0, y: 0, scale: 1 });
  const [workflow, setWorkflow] = useState<WorkflowStep[] | null>(null);
  const [wfStatus, setWfStatus] = useState<Record<string, string>>({});
  const drag = useRef<{ startX: number; startY: number; vx: number; vy: number } | null>(null);

  const onWheel = (e: React.WheelEvent) => {
    const scale = Math.max(0.4, Math.min(2.5, view.scale * (e.deltaY < 0 ? 1.1 : 0.9)));
    setView((v) => ({ ...v, scale }));
  };
  const onMouseDown = (e: React.MouseEvent) => {
    drag.current = { startX: e.clientX, startY: e.clientY, vx: view.x, vy: view.y };
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!drag.current) return;
    setView((v) => ({ x: drag.current!.vx + (e.clientX - drag.current!.startX), y: drag.current!.vy + (e.clientY - drag.current!.startY), scale: v.scale }));
  };
  const onMouseUp = () => { drag.current = null; };

  const runAutonomousReport = () => {
    const steps = buildSeasonWorkflow();
    setWorkflow(steps);
    setWfStatus({});
    steps.forEach((s, i) => {
      setTimeout(() => {
        setWfStatus((prev) => ({ ...prev, [s.id]: 'running' }));
        setTimeout(() => setWfStatus((prev) => ({ ...prev, [s.id]: 'done' })), s.durationMs);
      }, i * (s.durationMs + 300));
    });
  };

  const anomalies = detectAnomalies(vitals);

  return (
    <div style={{ background: '#0f172a', border: '1px solid rgba(56,189,248,0.3)', borderRadius: 16, overflow: 'hidden' }}>
      {/* ÜST BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <div style={{ fontSize: 13, fontWeight: 900, color: '#fff' }}>🎨 Taktik Workflow Canvas</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <button onClick={runAutonomousReport} style={{ fontSize: 9.5, fontWeight: 800, padding: '7px 13px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#2563eb,#3b82f6)', color: '#fff' }}>🤖 Otonom Sezon Raporu Oluştur</button>
          <button onClick={() => setView({ x: 0, y: 0, scale: 1 })} style={{ fontSize: 9.5, fontWeight: 800, padding: '7px 13px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: '#94a3b8', cursor: 'pointer' }}>↺ Sıfırla</button>
        </div>
      </div>

      {/* CANVAS */}
      <div style={{ position: 'relative', height: 460, overflow: 'hidden', background: 'radial-gradient(circle at 30% 30%, #1e293b, #020617)', cursor: drag.current ? 'grabbing' : 'grab' }}
        onWheel={onWheel} onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}>
        <svg width="100%" height="100%" style={{ position: 'absolute', inset: 0 }}>
          <g transform={`translate(${view.x},${view.y}) scale(${view.scale})`}>
            {edges.map((e) => {
              const a = nodes.find((n) => n.id === e.from);
              const b = nodes.find((n) => n.id === e.to);
              if (!a || !b) return null;
              const ax = a.x + 130, ay = a.y + 40, bx = b.x, by = b.y + 40;
              return (
                <g key={e.id}>
                  <line x1={ax} y1={ay} x2={bx} y2={by} stroke={e.color ?? '#64748b'} strokeWidth={2} strokeDasharray={e.dashed ? '6 4' : undefined} />
                  {e.label && <text x={(ax + bx) / 2} y={(ay + by) / 2 - 6} fill={e.color ?? '#94a3b8'} fontSize={10} textAnchor="middle" fontWeight={700}>{e.label}</text>}
                </g>
              );
            })}
          </g>
        </svg>

        {/* NODE'LAR */}
        <div style={{ position: 'absolute', inset: 0, transform: `translate(${view.x}px,${view.y}px) scale(${view.scale})`, transformOrigin: '0 0' }}>
          {nodes.map((n) => (
            <div key={n.id} style={{ position: 'absolute', left: n.x, top: n.y, width: 260, padding: 12, borderRadius: 12, background: 'rgba(15,23,42,0.95)', border: `1.5px solid ${n.accent}55`, boxShadow: `0 0 16px ${n.accent}22` }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 20 }}>{n.emoji}</span>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 800, color: '#fff' }}>{n.title}</div>
                  <div style={{ fontSize: 9, color: '#94a3b8', lineHeight: 1.4, marginTop: 2 }}>{n.detail}</div>
                </div>
              </div>
              <div style={{ fontSize: 8, fontWeight: 700, color: n.accent, marginTop: 6 }}>{n.kind.toUpperCase()}</div>
            </div>
          ))}
        </div>

        <div style={{ position: 'absolute', bottom: 10, right: 10, fontSize: 10, fontWeight: 700, color: '#64748b', background: 'rgba(2,6,23,0.8)', padding: '4px 9px', borderRadius: 8 }}>🔍 %{Math.round(view.scale * 100)} • {anomalies.length} anomali</div>
      </div>

      {/* OTONOM WORKFLOW */}
      {workflow && (
        <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: '#38bdf8', marginBottom: 6 }}>🤖 Otonom Sezon Raporu — Çok Adımlı Analiz Ajanı</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {workflow.map((s, i) => {
              const st = wfStatus[s.id] ?? 'pending';
              return (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <div style={{ padding: '7px 11px', borderRadius: 10, background: st === 'done' ? 'rgba(74,222,128,0.12)' : st === 'running' ? 'rgba(56,189,248,0.12)' : 'rgba(255,255,255,0.04)', border: `1px solid ${st === 'done' ? '#4ade80' : st === 'running' ? '#38bdf8' : '#1e293b'}`, fontSize: 9, fontWeight: 700, color: st === 'done' ? '#4ade80' : st === 'running' ? '#38bdf8' : '#64748b' }}>
                    {st === 'done' ? '✅' : st === 'running' ? '⏳' : s.emoji} {s.title}
                  </div>
                  {i < workflow.length - 1 && <span style={{ color: '#334155', fontSize: 11 }}>→</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ANOMALİ ÖZETİ */}
      <div style={{ padding: '10px 14px', borderTop: '1px solid rgba(255,255,255,0.08)', fontSize: 9, color: '#64748b' }}>
        {anomalies.length === 0 ? '💚 Anomali yok — tüm vitaller normal.' : anomalies.map((a) => `${a.anomaly} (${a.metric}) → ${a.drill}`).join(' • ')}
      </div>
    </div>
  );
}

