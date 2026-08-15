// ============================================================================
// 🏅 LİKYA SPORT VISION — BRANŞ AJANLARI VERİ TABANI
// Her branşa özel "Uzman Gözlemci Ajan" profili:
// Persona, Biyomekanik Odakları, Sakatlık Risk Noktaları, İdeal BPM & Ritim
// ============================================================================

export type SportBranchId = 'padel' | 'tennis' | 'swimming' | 'fitness' | 'yoga' | 'running' | 'football';

export interface ObserverAgentProfile {
  branchId: SportBranchId;
  name: string;
  icon: string;
  persona: string;               // gözlemci ajan kişiliği
  biomechanicalFocus: string[];  // biyomekanik odak alanları
  injuryRiskPoints: string[];    // sakatlık risk noktaları
  idealBpm: number;              // ideal ritim (BPM)
  rhythm: string;                // antrenman ritim dili
  met: number;                   // metabolik eşdeğer (kalori hesabı için)
}

export const BRANCH_AGENTS: ObserverAgentProfile[] = [
  {
    branchId: 'padel',
    name: 'Padel & Tenis Ajanı',
    icon: '🎾',
    persona: 'Agresif ama ölçülü bir raket bilimcisi: vuruş açısı, gövde rotasyonu ve bilek stabilitesini izler.',
    biomechanicalFocus: ['Vuruş açısı (°)', 'Gövde rotasyonu', 'Bilek stabilitesi', 'Adım genişliği'],
    injuryRiskPoints: ['Dirsek tendonu (epikondilit)', 'Omuz rotator manşet', 'Bilek zorlanması'],
    idealBpm: 140,
    rhythm: 'Hızlı ve keskin',
    met: 6.0,
  },
  {
    branchId: 'tennis',
    name: 'Tenis Ajanı',
    icon: '🎾',
    persona: 'Kort zekası odaklı: servis hızı, forehand rotasyonu ve saha kapsaması analizi.',
    biomechanicalFocus: ['Servis hızı (km/s)', 'Forehand rotasyonu', 'Saha kapsama alanı', 'Ace isabeti'],
    injuryRiskPoints: ['Omuz', 'Dirsek', 'Ayak bileği'],
    idealBpm: 150,
    rhythm: 'Patlayıcı ve ritmik',
    met: 7.3,
  },
  {
    branchId: 'swimming',
    name: 'Yüzme & Su Sporları Ajanı',
    icon: '🏊',
    persona: 'Su dinamikleri uzmanı: kol çekme verimi, gövde rotasyonu ve nefes ritmi takibi.',
    biomechanicalFocus: ['Kol çekme verimi', 'Gövde rotasyonu', 'Nefes ritmi', 'Kulaç sayısı'],
    injuryRiskPoints: ['Omuz (yüzücü omzu)', 'Boyun', 'Diz'],
    idealBpm: 120,
    rhythm: 'Akıcı ve ritmik',
    met: 8.0,
  },
  {
    branchId: 'fitness',
    name: 'Fonksiyonel Fitness Ajanı',
    icon: '🏋️',
    persona: 'Kuvvet & kondisyon bilimcisi: kaldırma mekaniği, güç çıkışı ve yük yönetimi.',
    biomechanicalFocus: ['Kaldırma mekaniği', 'Güç çıkışı (W)', 'Eklem yükü', 'Kadans'],
    injuryRiskPoints: ['Bel (lomber)', 'Diz', 'Omuz'],
    idealBpm: 130,
    rhythm: 'Ağır ve kontrollü',
    met: 6.0,
  },
  {
    branchId: 'yoga',
    name: 'Yoga & Pilates Ajanı',
    icon: '🧘',
    persona: 'Denge & esneklik bilgesi: duruş asimetrisi, denge ve nefes-derinlik takibi.',
    biomechanicalFocus: ['Duruş asimetrisi', 'Denge skoru', 'Esneklik açısı', 'Nefes derinliği'],
    injuryRiskPoints: ['Diz', 'Kalça', 'Bel'],
    idealBpm: 70,
    rhythm: 'Sakin ve derin',
    met: 3.0,
  },
  {
    branchId: 'running',
    name: 'Koşu & Atletizm Ajanı',
    icon: '🏃',
    persona: 'Biyomekanik koşu analisti: kadans, adım uzunluğu, dikey salınım ve VO2Max.',
    biomechanicalFocus: ['Kadans (adım/dk)', 'Adım uzunluğu', 'Dikey salınım', 'Yere basma süresi'],
    injuryRiskPoints: ['Şin splint', 'Diz (koşucu dizi)', 'Aşil tendonu'],
    idealBpm: 160,
    rhythm: 'Hızlı ve sabit',
    met: 9.8,
  },
  {
    branchId: 'football',
    name: 'Futbol & Takım Sporları Ajanı',
    icon: '⚽',
    persona: 'Takım fizyoloğu: sprint patlaması, şut hızı, pas isabeti ve koşu mesafesi.',
    biomechanicalFocus: ['Sprint patlaması', 'Şut hızı', 'Pas isabeti', 'Koşu mesafesi'],
    injuryRiskPoints: ['Kasık', 'Diz (çapraz bağ)', 'Ayak bileği'],
    idealBpm: 155,
    rhythm: 'Patlayıcı ve değişken',
    met: 7.0,
  },
];

export function getBranchAgent(branchId: SportBranchId): ObserverAgentProfile {
  return BRANCH_AGENTS.find((a) => a.branchId === branchId) || BRANCH_AGENTS[0];
}
