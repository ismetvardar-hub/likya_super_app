'use client';

import React, { useState } from 'react';
import {
  createDrill, addElement, removeElement, drillToSvg, serializeDrill, courtTemplateDims,
  type CourtTemplate, type DrillDefinition,
} from '../../app/lib/tactics/drillCanvasEngine.ts';

// ============================================================================
// 🎯 ANTREÖR TAKTİK BEYAZ TAHTA & DRILL ÇİZİM CANVASI (Adım 68)
// Tenis/Basketbol/Çeviklik kort şablonları + oyuncu/vektör/pas/koni araçları
// JSON + SVG dışa aktarım. Motor: drillCanvasEngine.ts
// ============================================================================

type Tool = 'player-x' | 'player-o' | 'vector' | 'pass' | 'cone';

export default function TacticalWhiteboardCanvas() {
  const [template, setTemplate] = useState<CourtTemplate>('tennis');
  const [drill, setDrill] = useState<DrillDefinition>(() => createDrill('tennis', 'Yeni Drill'));
  const [tool, setTool] = useState<Tool>('player-x');
  const dims = courtTemplateDims(template);

  const onCanvasClick = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * dims.width;
    const y = ((e.clientY - rect.top) / rect.height) * dims.height;
    if (tool === 'player-x') setDrill(addElement(drill, { type: 'player', x, y, team: 'X', label: 'X' }));
    else if (tool === 'player-o') setDrill(addElement(drill, { type: 'player', x, y, team: 'O', label: 'O' }));
    else if (tool === 'vector') setDrill(addElement(drill, { type: 'vector', x, y, x2: x + 60, y2: y }));
    else if (tool === 'pass') setDrill(addElement(drill, { type: 'pass', x, y, x2: x + 80, y2: y - 30 }));
    else setDrill(addElement(drill, { type: 'cone', x, y }));
  };

  const lastEl = drill.elements[drill.elements.length - 1];

  return (
    <div style={{ width: '100%', background: 'rgba(2,6,23,0.7)', borderRadius: 14, padding: 10 }}>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8, alignItems: 'center' }}>
        {(['tennis', 'basketball-full', 'basketball-half', 'agility'] as CourtTemplate[]).map((t) => (
          <button key={t} onClick={() => { setTemplate(t); setDrill(createDrill(t, `Drill · ${t}`)); }} style={{ fontSize: 9, padding: '4px 8px', borderRadius: 6, border: template === t ? '1px solid #00f2fe' : '1px solid #334155', background: 'transparent', color: '#e2e8f0', cursor: 'pointer' }}>{t}</button>
        ))}
        {(['player-x', 'player-o', 'vector', 'pass', 'cone'] as Tool[]).map((t) => (
          <button key={t} onClick={() => setTool(t)} style={{ fontSize: 9, padding: '4px 8px', borderRadius: 6, border: tool === t ? '1px solid #facc15' : '1px solid #334155', background: 'transparent', color: '#e2e8f0', cursor: 'pointer' }}>{t}</button>
        ))}
        <input value={drill.title} onChange={(e) => setDrill({ ...drill, title: e.target.value })} style={{ fontSize: 10, background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155', borderRadius: 6, padding: '4px 8px' }} />
      </div>

      {/* Canlı çizim */}
      <div dangerouslySetInnerHTML={{ __html: drillToSvg(drill) }} style={{ borderRadius: 10, overflow: 'hidden' }} onClick={onCanvasClick} />

      {/* Dışa aktarım */}
      <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
        <button onClick={() => navigator.clipboard?.writeText(serializeDrill(drill))} style={{ fontSize: 9, padding: '5px 10px', borderRadius: 6, background: 'rgba(0,242,254,0.1)', border: '1px solid rgba(0,242,254,0.4)', color: '#00f2fe', cursor: 'pointer' }}>📋 JSON Kopyala</button>
        <button onClick={() => { if (lastEl) setDrill(removeElement(drill, lastEl.id)); }} style={{ fontSize: 9, padding: '5px 10px', borderRadius: 6, border: '1px solid #334155', background: 'transparent', color: '#e2e8f0', cursor: 'pointer' }}>↩ Son Öğeyi Sil</button>
        <span style={{ fontSize: 9, color: '#64748b' }}>{drill.elements.length} öğe · {dims.name}</span>
      </div>
    </div>
  );
}
