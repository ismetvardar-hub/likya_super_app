// ============================================================================
// 🎯 OTONOM B2B LEAD AJANI (Gojiberry Modeli)
// İşletme adaylarını skorlar, segmentlere ayırır ve takip planı üretir.
// Deterministik; Plan Z güvenli. Kırılmasız.
// ============================================================================

export interface Lead {
  id: string;
  company: string;
  sector: string;
  annualRevenue: number;
  employees: number;
  engagementScore: number; // 0-100
}

export interface LeadReport {
  lead: Lead;
  score: number;          // 0-100 öncelik
  segment: 'VIP' | 'Büyüme' | 'Beklemede' | 'Sıcak' | 'Soğuk';
  nextAction: string;
}

// Lead skorlama (deterministik)
export function scoreLead(l: Lead): number {
  const revenueScore = Math.min(30, Math.round(l.annualRevenue / 200_000));
  const sizeScore = Math.min(20, Math.round(l.employees / 25));
  const engagement = Math.round(l.engagementScore * 0.5);
  return Math.min(100, revenueScore + sizeScore + engagement);
}

// Segment & aksiyon planı
export function analyzeLead(l: Lead): LeadReport {
  const score = scoreLead(l);
  let segment: LeadReport['segment'];
  let nextAction: string;
  if (score >= 85) { segment = 'VIP'; nextAction = 'CEO görüşmesi planla + özel teklif hazırla'; }
  else if (score >= 65) { segment = 'Sıcak'; nextAction = 'Demo daveti gönder (48 saat)'; }
  else if (score >= 45) { segment = 'Büyüme'; nextAction = 'Bülten + vaka çalışması takibi (7 gün)'; }
  else if (score >= 25) { segment = 'Beklemede'; nextAction = 'Aylık otomatik takip sırasına ekle'; }
  else { segment = 'Soğuk'; nextAction = 'Bekleme havuzuna al, çeyreklik gözden geçir'; }
  return { lead: l, score, segment, nextAction };
}

// Örnek lead listesi
export function sampleLeads(): Lead[] {
  return [
    { id: 'l1', company: 'Akdeniz Holding', sector: 'Turizm', annualRevenue: 1_800_000, employees: 120, engagementScore: 82 },
    { id: 'l2', company: 'Padel Plus', sector: 'Spor', annualRevenue: 900_000, employees: 35, engagementScore: 74 },
    { id: 'l3', company: 'Yerel Yatırım', sector: 'Gayrimenkul', annualRevenue: 4_500_000, employees: 200, engagementScore: 90 },
    { id: 'l4', company: 'Mini Kafe Zinciri', sector: 'F&B', annualRevenue: 350_000, employees: 18, engagementScore: 40 },
  ];
}

export function b2bLeadStatus(): string {
  return `B2B Lead Ajanı [Gojiberry modeli • skorlama → VIP/Sıcak/Soğuk segment]`;
}
