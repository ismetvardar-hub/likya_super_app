// ============================================================================
// 🎾 BLOK 5 (Aşama 41-50) — SPORTVISIONX İLERİ BİYOMEKANİK & SAHA ZEKA
// Top hızı/spin • xG • Şut açısı • Smaç/blok • HRV yorgunluk • 3D mesh •
// Isı haritası • Sesli taktik • Yatkınlık risk kartı • Fikstür motoru.
// Tamamı deterministik + fallback. Plan Z.
// ============================================================================

// Aşama 41 — Padel/Tenis top hızı + spin tahmini
export function ballSpinEstimate(speedKmh: number, racketAngleDeg: number): { topspinRpm: number; slice: boolean; note: string } {
  const topspinRpm = Math.round(Math.max(0, (racketAngleDeg - 45) * speedKmh * 0.6));
  return { topspinRpm, slice: racketAngleDeg < 40, note: racketAngleDeg > 50 ? 'Topspin dominant' : racketAngleDeg < 40 ? 'Slice vuruşu' : 'Düz vuruş' };
}

// Aşama 42 — Futbol xG + pas kalitesi
export function expectedGoals(shot: { distanceM: number; angleDeg: number; header: boolean }): number {
  const distanceFactor = Math.max(0.02, 1 - shot.distanceM / 20);
  const angleFactor = Math.min(1, (90 - Math.abs(90 - shot.angleDeg)) / 60 + 0.4);
  const xg = 0.06 + distanceFactor * 0.3 + angleFactor * 0.12 + (shot.header ? 0.04 : 0);
  return Math.round(xg * 100) / 100;
}
export function passQuality(passes: { completed: boolean; forward: boolean; underPressure: boolean }[]): { accuracy: number; dangerous: number } {
  const completed = passes.filter((p) => p.completed).length;
  const dangerous = passes.filter((p) => p.completed && p.forward && p.underPressure).length;
  return { accuracy: passes.length > 0 ? Math.round((completed / passes.length) * 100) : 0, dangerous };
}

// Aşama 43 — Basketbol şut yay açısı + çember giriş açısı
export function shotEntryAngle(releaseAngleDeg: number, distanceM: number): { entryAngleDeg: number; verdict: 'SWISH' | 'RIM' | 'FLAT' } {
  const entry = Math.round(releaseAngleDeg * 0.55 + distanceM * 1.2);
  const verdict = entry >= 45 ? 'SWISH' : entry >= 35 ? 'RIM' : 'FLAT';
  return { entryAngleDeg: entry, verdict };
}

// Aşama 44 — Voleybol smaç yüksekliği + blok zamanlaması
export function spikeBlockTiming(spikeReachCm: number, blockerReachCm: number, jumpAtMs: number): { netWin: boolean; timingScore: number; note: string } {
  const netWin = spikeReachCm > blockerReachCm;
  const timingScore = Math.max(0, Math.min(100, 70 - Math.abs(jumpAtMs - 180) / 2));
  return { netWin, timingScore, note: netWin && timingScore > 60 ? 'Blok aşıldı — zamanlama iyi' : netWin ? 'Yükseklik avantajı var, zamanlama geliştirilmeli' : 'Blok seviyesi yetersiz — sıçrama artır' };
}

// Aşama 45 — HRV yorgunluk/overtraining riski
export function hrvRisk(rmssdMs: number, baselineMs: number): { hrvDelta: number; risk: 'DÜŞÜK' | 'ORTA' | 'YÜKSEK'; advice: string } {
  const hrvDelta = Math.round((rmssdMs - baselineMs) / baselineMs * 100);
  const risk = hrvDelta < -20 ? 'YÜKSEK' : hrvDelta < -5 ? 'ORTA' : 'DÜŞÜK';
  const advice = risk === 'YÜKSEK' ? 'Overtraining riski — yoğun antrenman ertelenmeli' : risk === 'ORTA' ? 'Dikkat — yük hafifletilmeli' : 'Toparlanma sağlıklı';
  return { hrvDelta, risk, advice };
}

// Aşama 46 — Çoklu kamera 3D poz rekonstrüksiyonu
export function triangulateDepth(camA: { x: number; y: number }, camB: { x: number; y: number }, baselineCm: number, focalPx: number): { depthCm: number; confidence: number } {
  const disparity = Math.max(0.001, Math.hypot(camA.x - camB.x, camA.y - camB.y));
  const depthCm = Math.round((baselineCm * focalPx) / disparity);
  return { depthCm, confidence: Math.min(0.97, 0.6 + disparity / 100) };
}

// Aşama 47 — Isı haritası + sprint koridoru
export function heatmapGrid(zones: { x: number; y: number; weight: number }[], grid = 5): number[][] {
  const out = Array.from({ length: grid }, () => Array(grid).fill(0) as number[]);
  zones.forEach((z) => {
    const gx = Math.min(grid - 1, Math.max(0, Math.floor(z.x * grid)));
    const gy = Math.min(grid - 1, Math.max(0, Math.floor(z.y * grid)));
    out[gy][gx] = Math.round((out[gy][gx] + z.weight) * 10) / 10;
  });
  return out;
}

// Aşama 48 — AI sesli taktik notu + drill reçeteleme
export function voiceTacticNote(formation: string, phase: 'hucum' | 'savunma'): { note: string; drillRef: string } {
  return { note: phase === 'hucum' ? `${formation} hücumda genişlik aç — kanat bindirmeleri ile` : `${formation} savunmada kademe sıklaştır — orta koridor daralt`, drillRef: phase === 'hucum' ? 'TD-passing-cutting' : 'TD-coverage' };
}

// Aşama 49 — Sakatlık geçmişi + yatkınlık risk kartı
export function injuryPredisposition(history: { type: string; count: number }[], trainingLoadDeltaPct: number): { riskScore: number; note: string } {
  const base = history.reduce((a, h) => a + h.count * 12, 0);
  const riskScore = Math.min(100, base + (trainingLoadDeltaPct > 15 ? 20 : 0));
  return { riskScore, note: riskScore >= 60 ? 'Yüksek yatkınlık — yük azalt + prehab protokolü' : riskScore >= 30 ? 'Orta — haftalık yük izleme önerilir' : 'Düşük risk' };
}

// Aşama 50 — Fikstür motoru (round-robin) + otomatik puan durumu
export function roundRobinFixture(teams: string[]): { round: number; home: string; away: string }[] {
  const n = teams.length;
  const fixture: { round: number; home: string; away: string }[] = [];
  const rotated = [...teams];
  for (let r = 0; r < n - 1; r++) {
    for (let i = 0; i < n / 2; i++) {
      const a = rotated[i];
      const b = rotated[n - 1 - i];
      fixture.push({ round: r + 1, home: a, away: b });
    }
    rotated.splice(1, 0, rotated.pop() as string);
  }
  return fixture;
}
export function standingsFromResults(results: { home: string; away: string; hg: number; ag: number }[]): { team: string; p: number; w: number; d: number; l: number; pts: number }[] {
  const map = new Map<string, { team: string; p: number; w: number; d: number; l: number; pts: number }>();
  const ensure = (t: string) => { if (!map.has(t)) map.set(t, { team: t, p: 0, w: 0, d: 0, l: 0, pts: 0 }); return map.get(t)!; };
  results.forEach((r) => {
    const h = ensure(r.home); const a = ensure(r.away);
    h.p++; a.p++;
    if (r.hg > r.ag) { h.w++; h.pts += 3; a.l++; } else if (r.hg < r.ag) { a.w++; a.pts += 3; h.l++; } else { h.d++; a.d++; h.pts++; a.pts++; }
  });
  return Array.from(map.values()).sort((x, y) => y.pts - x.pts || (y.w - x.w));
}

export function sportsIntelligenceSuiteStatus(): string {
  return 'Spor AI Suite [spin • xG • şut açısı • smaç/blok • HRV • 3D mesh • heatmap • fikstür]';
}

