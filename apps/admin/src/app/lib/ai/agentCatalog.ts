// ============================================================================
// 🤖 150 AJANLIK SEKTÖREL KATALOG — deterministik ajan dizini
// 15 sektör × 10 uzman ajan = 150 ajan. Her ajan: yetenek, skor, kaynak.
// Plan Z güvenli; UI/rota yönlendirme için. Kırılmasız.
// ============================================================================

export interface CatalogAgent {
  id: string;
  name: string;
  sector: string;
  emoji: string;
  capability: string;
  skillScore: number; // 0-100
  source: 'otonom' | 'motorsuz';
}

const SECTORS = [
  { name: 'Finans', emoji: '💰', caps: ['borsa-analizi', 'nakit-akisi', 'muhasebe', 'bordro', 'bütçe', 'kredi-risk', 'vergi', 'yatırım', 'sigorta', 'raporlama'] },
  { name: 'Spor', emoji: '🎾', caps: ['hiz-radari', 'biyomekanik', 'scouting', 'antrenman', 'maç-analizi', 'kondisyon', 'fizyoterapi', 'beslenme', 'genç-gelişim', 'espor'] },
  { name: 'Tesis', emoji: '🏕️', caps: ['rezervasyon', 'iot-sensor', 'turnike', 'bakım', 'enerji', 'temizlik', 'otopark', 'güvenlik', 'konaklama', 'akıllı-bina'] },
  { name: 'Pazaryeri', emoji: '🛒', caps: ['stok', 'sipariş', '2el-dogrulama', 'kiralama', 'tbyb', 'iade', 'fiyatlandırma', 'tedarikçi', 'lojistik', 'müşteri-hizmet'] },
  { name: 'Müzik', emoji: '🎵', caps: ['bpm-ritim', 'dj-otomasyon', 'sahne', 'bilet', 'festival', 'playlist', 'atmosfer', 'sanatçı', 'lisan', 'reklam-müzik'] },
  { name: 'Mutfak', emoji: '🍜', caps: ['reçete', 'stok-mutfak', '120s-sayaç', 'ikram-alışkanlık', 'menü', 'sipariş-öncelik', 'hijyen', 'tedarik-mutfak', 'lezzet-skor', 'atık'] },
  { name: 'İK', emoji: '👥', caps: ['vardiya', 'personel', 'onboarding', 'performans', 'eğitim', 'maaş', 'devamsızlık', 'yetenek', 'kültür', 'mevzuat'] },
  { name: 'Pazarlama', emoji: '📣', caps: ['kampanya', 'içerik', 'seo', 'sosyal', 'e-posta', 'reklam', 'influencer', 'marka', 'etkinlik', 'anket'] },
  { name: 'Müşteri', emoji: '🛎️', caps: ['destek', 'şikayet', 'sadakat', 'üyelik', 'geri-bildirim', 'anket', 'CRM', 'kiosk', 'misafir-karşılama', 'şikayet-çözüm'] },
  { name: 'Hukuk', emoji: '⚖️', caps: ['kvkk', 'sözleşme', 'fesih', 'risk', 'uyum', 'veli-muvafakat', 'telif', 'sigorta-hukuk', 'disiplin', 'rapor-hukuk'] },
  { name: 'Teknoloji', emoji: '💻', caps: ['kod-üretim', 'bug-çözüm', 'db-yönetimi', 'api', 'güvenlik', 'devops', 'test', 'veri-analizi', 'ai-orkestrasyon', 'bakım'] },
  { name: 'İletişim', emoji: '📡', caps: ['basın', 'sosyal-medya-yanıt', 'kriz', 'dahili-duyuru', 'neşriyat', 'podcast', 'video', 'fotoğraf', 'web', 'çeviri'] },
  { name: 'Ulaşım', emoji: '🚐', caps: ['servis-plan', 'araç-takip', 'yakıt', 'şoför', 'otopark-yön', 'taksi', 'lojistik-teslim', 'bakım-araç', 'rota', 'misafir-ulaşım'] },
  { name: 'Çevre', emoji: '🌱', caps: ['enerji-tasarruf', 'su-yönetimi', 'atık', 'karbon', 'bahçe', 'geri-dönüşüm', 'hava-kalitesi', 'gürültü', 'eğitim-çevre', 'rapor-çevre'] },
  { name: 'Strateji', emoji: '🧭', caps: ['pazar-analizi', 'rekabet', 'fiyatlandırma', 'büyüme', 'franchise', 'yatırım-strateji', 'risk-strateji', 'performans-pano', 'senaryo', 'uzun-vade'] },
];

// 150 ajan üret (15 sektör × 10 uzman)
export function buildAgentCatalog(): CatalogAgent[] {
  const agents: CatalogAgent[] = [];
  SECTORS.forEach((sector, si) => {
    sector.caps.forEach((cap, ci) => {
      agents.push({
        id: `ag-${String(si + 1).padStart(2, '0')}-${String(ci + 1).padStart(2, '0')}`,
        name: `${sector.emoji} ${cap.replace(/-/g, ' ')}`,
        sector: sector.name,
        emoji: sector.emoji,
        capability: cap,
        skillScore: 55 + ((si * 7 + ci * 5) % 45),
        source: ci % 3 === 0 ? 'otonom' : 'motorsuz',
      });
    });
  });
  return agents;
}

export const AGENT_CATALOG: CatalogAgent[] = buildAgentCatalog(); // 150 ajan

export function agentsBySector(sector: string): CatalogAgent[] {
  return AGENT_CATALOG.filter((a) => a.sector === sector);
}

export function agentCatalogStatus(): string {
  return `Sektörel Ajan Kataloğu [${AGENT_CATALOG.length} ajan • ${SECTORS.length} sektör × 10 uzman]`;
}
