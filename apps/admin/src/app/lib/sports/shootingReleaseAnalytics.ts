// ============================================================================
// 🏀 ŞUT RELEASE ANALİTİĞİ — Load-Lift-Roll-Hold Kartı
// Basketbol şut mekaniğinde parmak ucu temas ve el takibi:
//   Load (yükleme) → Lift (kaldırma) → Roll (parmak ucu) → Hold (takip).
// Puanlama kartı SportVisionX'e bağlanır. Deterministik; Plan Z güvenli.
// ============================================================================

export type ReleasePhase = 'Load' | 'Lift' | 'Roll' | 'Hold';

export interface ReleaseInput {
  loadQuality: number;      // 0-1 (dip pozisyon, diz dirsek hazır)
  liftLinearity: number;    // 0-1 (dikey yol, yan sapma yok)
  fingertipContact: number; // 0-1 (parmak ucuyla çıkış)
  holdFollowThrough: number;// 0-1 (takip, el yukarıda kalır)
}

export interface ReleaseReport {
  scores: { phase: ReleasePhase; score: number; advice: string }[];
  total: number;            // 0-100
  verdict: 'ELİT' | 'İYİ' | 'GELİŞİYOR' | 'YENİDEN KUR';
  note: string;
}

export function scoreShootingRelease(input: ReleaseInput): ReleaseReport {
  const clamp = (n: number) => Math.max(0, Math.min(1, n));
  const scores: ReleaseReport['scores'] = [
    { phase: 'Load', score: Math.round(clamp(input.loadQuality) * 100), advice: clamp(input.loadQuality) >= 0.8 ? 'Dip pozisyon sağlam' : 'Diz-dirsek senkronu: top diz hizasında, dirsekler 90°' },
    { phase: 'Lift', score: Math.round(clamp(input.liftLinearity) * 100), advice: clamp(input.liftLinearity) >= 0.8 ? 'Dikey yol temiz' : 'Lift düzlemini koru — dirsek yana açılmasın' },
    { phase: 'Roll', score: Math.round(clamp(input.fingertipContact) * 100), advice: clamp(input.fingertipContact) >= 0.8 ? 'Parmak ucu çıkışı mükemmel (backspin)' : 'Top avuçtan çıkıyor — parmak ucu teması geliştir' },
    { phase: 'Hold', score: Math.round(clamp(input.holdFollowThrough) * 100), advice: clamp(input.holdFollowThrough) >= 0.8 ? 'Takip yukarıda — atış güveni yüksek' : 'Takip kısa kesiliyor — eli potaya doğru uzat' },
  ];
  const total = Math.round(scores.reduce((a, s) => a + s.score, 0) / 4);
  const verdict: ReleaseReport['verdict'] = total >= 85 ? 'ELİT' : total >= 70 ? 'İYİ' : total >= 50 ? 'GELİŞİYOR' : 'YENİDEN KUR';
  const note = verdict === 'ELİT' ? 'El takibi ve parmak ucu senkronu tam — Load→Lift→Roll→Hold zinciri temiz.' : verdict === 'İYİ' ? 'İyi mekanik — en zayıf fazı tekrarlarla güçlendir.' : 'Zincirde kopukluk var — faz faz drill çalış (form shooting).';
  return { scores, total, verdict, note };
}

export function shootingReleaseStatus(): string {
  return 'Şut Release [Load → Lift → Roll → Hold • parmak ucu + el takibi • 0-100]';
}
