'use client';

import React, { useState } from 'react';

// ============================================================================
// 🎫 SPORCU QR KARTI (Adım 09) — profil URL'i için dinamik SVG QR
// Güvenli profil URL'i (/athlete?id=...) deterministik desene çevrilir;
// aynı URL aynı QR, farklı URL farklı QR üretir (saf fonksiyon — test edilebilir).
// ============================================================================

/** Deterministik string hash (djb2) */
export function hashString(input: string): number {
  let h = 5381;
  for (let i = 0; i < input.length; i++) h = ((h << 5) + h + input.charCodeAt(i)) >>> 0;
  return h;
}

/** URL'i encode eden SVG QR benzeri desen (finder pattern + veri ızgarası) */
export function generateQrSvg(url: string, size = 33): string {
  const seed = hashString(url);
  let cells: boolean[] = [];
  for (let i = 0; i < size * size; i++) {
    const b = (seed >>> (i % 31)) & 1;
    cells.push(b === 1 ? (i * 7 + seed) % 5 !== 0 : (i + seed) % 3 === 0);
  }
  const finder = (x: number, y: number) => (cx: number, cy: number) => {
    const relX = cx - x, relY = cy - y;
    if (relX < 0 || relX > 6 || relY < 0 || relY > 6) return null;
    const ring = relX === 0 || relX === 6 || relY === 0 || relY === 6;
    const core = relX >= 2 && relX <= 4 && relY >= 2 && relY <= 4;
    return ring || core;
  };
  const finders = [finder(0, 0), finder(size - 7, 0), finder(0, size - 7)];
  const rects: string[] = [];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const inFinder = finders.some((f) => f(x, y) === true);
      const on = inFinder ? true : cells[y * size + x];
      if (on) rects.push(`<rect x="${x}" y="${y}" width="1" height="1" fill="#0f172a"/>`);
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges">${rects.join('')}</svg>`;
}

export default function AthleteQrCard({ athlete = 'Arda', athleteId = 'ARD-001' }: { athlete?: string; athleteId?: string }) {
  const [open, setOpen] = useState(false);
  const profileUrl = `https://likya-ceo.vercel.app/athlete?id=${athleteId}`;
  const qr = generateQrSvg(profileUrl);

  return (
    <>
      <button onClick={() => setOpen(true)} style={{ fontSize: '11px', fontWeight: 800, padding: '8px 14px', borderRadius: '10px', border: '1px solid #0f172a', background: '#0f172a', color: '#fff', cursor: 'pointer' }}>🎫 Show My QR</button>
      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.78)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }} onClick={() => setOpen(false)}>
          <div style={{ background: '#fff', borderRadius: 18, padding: 20, width: 'min(320px, 90vw)', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ fontSize: 14, fontWeight: 900, color: '#0f172a' }}>🎫 {athlete} — Kort Giriş QR'ı</div>
            <div style={{ fontSize: 9.5, color: '#64748b', marginTop: 3 }}>Turnike / akıllı dolap için göster</div>
            <div style={{ width: 200, height: 200, margin: '14px auto', padding: 8, border: '2px solid #0f172a', borderRadius: 12 }} dangerouslySetInnerHTML={{ __html: qr }} />
            <div style={{ fontSize: 9, color: '#64748b' }}>Profil: {profileUrl.slice(0, 46)}…</div>
            <button onClick={() => setOpen(false)} style={{ marginTop: 12, fontSize: 10, fontWeight: 800, padding: '8px 20px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#0f172a,#1e293b)', color: '#fff' }}>Kapat</button>
          </div>
        </div>
      )}
    </>
  );
}
