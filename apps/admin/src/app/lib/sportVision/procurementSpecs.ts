// ============================================================================
// 📦 LİKYA SPORT VISION — DONANIM TEKNİK ŞARTNAMESİ, TEDARİK & SATIN ALMA MOTORU
// Kapalı kutu (Veo / Spiideo / Pixellot / Bepro) tekel sistemlerine aylık/yıllık
// binlerce € lisans ödemek yerine; endüstriyel bileşenleri doğrudan tedarik edip
// yerli yazılımımıza (Sport Vision) entegre ediyoruz. 100% deterministik matematik.
// ============================================================================

export type HardwareCategory =
  | 'OPTIK_KAMERA'
  | 'EDGE_AI'
  | 'BIYOMETRIK_SENSOR'
  | 'BIYOMETRIK_ISTASYON'
  | 'AG_DEPOLAMA';

export interface HardwareSpec {
  id: string;
  category: HardwareCategory;
  name: string;
  icon: string;
  requiredCount: number;
  unitPriceUSD: number;
  unitPriceTL: number;
  leadTimeWeeks: number;
  warrantyYears: number;
  replaces: string;       // hangi kapalı kutu sistemin yerine geçer
  rationale: string;      // biyomekanik / gelişim ligi gerekçesi
  criteria: string[];     // teknik şartname maddeleri
}

// ----------------------------------------------------------------------------
// 1️⃣ DONANIM TEKNİK KRİTER KÜTÜPHANESİ
// ----------------------------------------------------------------------------
export const HARDWARE_SPECS: HardwareSpec[] = [
  {
    id: 'cam-4k',
    category: 'OPTIK_KAMERA',
    name: 'Endüstriyel 4K Panoramik Kamera',
    icon: '📹',
    requiredCount: 4,
    unitPriceUSD: 590,
    unitPriceTL: 22400,
    leadTimeWeeks: 3,
    warrantyYears: 2,
    replaces: 'Veo Cam 3 • Spiideo Kamera • Pixellot Cam',
    rationale: 'Saha kapsama + 4K maç arşivi + klip üretimi (Medya Kasası besler)',
    criteria: [
      '4K Panoramik 180° geniş açı',
      '120 FPS Global Shutter (Sony Pregius / Hikvision Industrial sensör) — hızlı hareket bulanıklığı sıfır',
      'IP67 su/toz koruması (dış saha dayanımı)',
      'PoE+ tek kablo ile güç + veri (60W)',
    ],
  },
  {
    id: 'edge-ai',
    category: 'EDGE_AI',
    name: 'NVIDIA Jetson Orin (Saha İçi AI İşlemci)',
    icon: '🧠',
    requiredCount: 3,
    unitPriceUSD: 633,
    unitPriceTL: 24060,
    leadTimeWeeks: 2,
    warrantyYears: 1,
    replaces: 'Veo AI Bulut İşlem • Pixellot Bulut Render • Spiideo Auto-Edit',
    rationale: 'Sıfır bulut gecikmesi — sahada anlık iskelet analitiği (Ghost Avatar, vuruş açısı)',
    criteria: [
      'Jetson Orin Nano 8GB ×2 (saha kenarı) + Orin AGX ×1 (ana işlem)',
      '60+ FPS gerçek zamanlı pose estimation (TensorRT)',
      'On-device KVKK: video sahada işlenir, buluta çıkmaz',
      'OpenCV + TensorRT çıkarım — yerli yazılım tam erişim (kapalı kutu değil)',
    ],
  },
  {
    id: 'hrv-sensor',
    category: 'BIYOMETRIK_SENSOR',
    name: 'EKG/HRV Sporcu Sensörü + BLE 5.3 Gateway',
    icon: '⌚',
    requiredCount: 14,
    unitPriceUSD: 126,
    unitPriceTL: 4780,
    leadTimeWeeks: 2,
    warrantyYears: 1,
    replaces: 'Kinexon GPS • Catapult Vest (lisans kilitli sağlık verisi)',
    rationale: 'HRV (kalp atış hızı değişkenliği) — antrenman yükü + yorgunluk takibi',
    criteria: [
      'Polar H10 (EKG doğruluğu, 1 kHz) — altın standart',
      'Verity Sense kol bandı (kayıt modu, maç sırasında)',
      'BLE 5.3 Gateway: 10+ cihaz eşzamanlı toplama',
      'On-device HRV hesabı (KVKK uyumlu, yıllık lisans YOK)',
    ],
  },
  {
    id: 'biostation',
    category: 'BIYOMETRIK_ISTASYON',
    name: 'Antropometri & Vücut Analiz İstasyonu',
    icon: '📏',
    requiredCount: 1,
    unitPriceUSD: 5100,
    unitPriceTL: 193800,
    leadTimeWeeks: 4,
    warrantyYears: 2,
    replaces: 'InBody laboratuvar hizmeti • Kitman ölçüm aboneliği',
    rationale: 'PHV / Mirwald biyolojik yaş hesabı + Gelişim Ligi (boy artış hızı takibi)',
    criteria: [
      'Seca 213 Dijital Stadiometre (boy ±1mm)',
      'InBody 570 / Tanita — segmental vücut analizi',
      'USB/Bluetooth otomatik dijital kayıt (OCR değil)',
      'Veri → PHV/Mirwald hesaplayıcısına otomatik beslenir',
    ],
  },
  {
    id: 'network',
    category: 'AG_DEPOLAMA',
    name: '10GbE Saha Ağı & NVMe Tampon Depolama',
    icon: '🌐',
    requiredCount: 1,
    unitPriceUSD: 2850,
    unitPriceTL: 108300,
    leadTimeWeeks: 3,
    warrantyYears: 3,
    replaces: 'Bulut video depolama aboneliği (upload kotası lisansı)',
    rationale: '4K akış için sıfır gecikme + 48s imha tamponu (KVKK)',
    criteria: [
      '10 Gbps SFP+ Managed Switch',
      'Cat6A SFTP zırhlı saha kablolaması (parazit koruması)',
      '8TB NVMe RAID-10 tampon depolama (48 saat imha öncesi)',
      'PoE+ 60W portları (kamera besleme) + UPS yedek güç',
    ],
  },
];

// ----------------------------------------------------------------------------
// 2️⃣ AÇIK DONANIM PAKETİ TOPLAM BEDELİ (tek seferlik — lisans yok)
// ----------------------------------------------------------------------------
export function openHardwareBundleUSD(): number {
  const subtotal = HARDWARE_SPECS.reduce((sum, s) => sum + specTotalUSD(s), 0);
  return Math.round(subtotal * 1.1); // %10 kurulum & montaj & devreye alma
}
export function openHardwareBundleTL(): number {
  return Math.round(openHardwareBundleUSD() * USD_TL_RATE);
}
export function openHardwareBundleEUR(): number {
  return Math.round(openHardwareBundleUSD() * EUR_USD_RATE);
}

// ----------------------------------------------------------------------------
// 3️⃣ KAPALI KUTU REFERANS SİSTEMLERİ (piyasa abonelik + lisans kilitli)
// ----------------------------------------------------------------------------
export interface ClosedBoxSystem {
  id: string;
  name: string;
  cameraUnitsNeeded: number;  // 0 = tek paket kilitli (Akademi paketi)
  cameraUnitUSD: number;
  yearlyLicenseUSD: number;
  coverageGap: string;        // bizde olup onlarda olmayan yetenek
}

export const CLOSED_BOX_SYSTEMS: ClosedBoxSystem[] = [
  {
    id: 'veo',
    name: 'Veo Cam 3',
    cameraUnitsNeeded: 4,
    cameraUnitUSD: 1500,
    yearlyLicenseUSD: 1250,
    coverageGap: 'Yıllık lisans zorunlu • biyomekanik/GPS/HRV yok • bulut bağımlı',
  },
  {
    id: 'spiideo',
    name: 'Spiideo',
    cameraUnitsNeeded: 4,
    cameraUnitUSD: 2500,
    yearlyLicenseUSD: 1500,
    coverageGap: 'Pahalı abonelik • özel analiz API kapalı',
  },
  {
    id: 'pixellot',
    name: 'Pixellot Air NXT',
    cameraUnitsNeeded: 4,
    cameraUnitUSD: 3500,
    yearlyLicenseUSD: 1800,
    coverageGap: 'Bulut işleme zorunlu • kod/kontrol erişimi yok',
  },
  {
    id: 'bepro',
    name: 'Bepro (pozisyon takip)',
    cameraUnitsNeeded: 1,
    cameraUnitUSD: 12000,
    yearlyLicenseUSD: 2500,
    coverageGap: 'Tek paket kilitli • video edit / medya satışı / PHV yok',
  },
  {
    id: 'academy',
    name: 'Akademi Tam Paketi (Veo+Hudl+Kitman+Kinexon)',
    cameraUnitsNeeded: 0,
    cameraUnitUSD: 74000,
    yearlyLicenseUSD: 0,
    coverageGap: '4 ayrı abonelik + entegrasyon + bakım cehennemi',
  },
];

// 5 yıllık kapalı kutu toplam sahip olma maliyeti (TCO)
export function closedBoxTCO5Y(system: ClosedBoxSystem): number {
  if (system.cameraUnitsNeeded === 0) return system.cameraUnitUSD;
  return system.cameraUnitsNeeded * (system.cameraUnitUSD + system.yearlyLicenseUSD * 5);
}

// ----------------------------------------------------------------------------
// 4️⃣ ROI HESABI — "Kapalı Kutu vs Açık Donanım" maliyet avantajı
// ----------------------------------------------------------------------------
export interface ROICalculation {
  openTotalUSD: number;
  perSystem: { name: string; closedTCO5Y: number; savingsPct: number }[];
  avgVideoSavingsPct: number;   // video kategorisi ortalaması (%65 hedefi)
}

export function computeOpenHardwareROI(): ROICalculation {
  const openTotalUSD = openHardwareBundleUSD();
  const perSystem = CLOSED_BOX_SYSTEMS.map((s) => {
    const closed = closedBoxTCO5Y(s);
    return {
      name: s.name,
      closedTCO5Y: closed,
      savingsPct: Math.round((1 - openTotalUSD / closed) * 100),
    };
  });
  // Bepro pozisyon takip kategorisi (video değil) hariç video sistemleri ortalaması
  const videoSystems = perSystem.filter((p) => p.name !== 'Bepro (pozisyon takip)');
  const avgVideoSavingsPct = Math.round(
    videoSystems.reduce((sum, p) => sum + p.savingsPct, 0) / Math.max(1, videoSystems.length)
  );
  return { openTotalUSD, perSystem, avgVideoSavingsPct };
}

export const USD_TL_RATE = 38;
export const EUR_USD_RATE = 0.92;

export function specTotalUSD(spec: HardwareSpec): number {
  return spec.requiredCount * spec.unitPriceUSD;
}

// ----------------------------------------------------------------------------
// 5️⃣ TEDARİKÇİ TEKLİF DEĞERLENDİRME MOTORU (deterministik skorlama)
// ----------------------------------------------------------------------------
export type SupplierSource = 'RESMI_DISTRIBUTOR' | 'ITHALATCI' | 'YERLI_URETIM';

export interface SupplierQuote {
  supplierId: string;
  supplierName: string;
  source: SupplierSource;
  itemId: string;
  itemName: string;
  unitPriceUSD: number;
  deliveryWeeks: number;
  warrantyYears: number;
  technicalCompliancePct: number;   // %0-100 teknik uyumluluk
}

export interface QuoteScore extends SupplierQuote {
  priceScore: number;
  deliveryScore: number;
  warrantyScore: number;
  complianceScore: number;
  weightedTotal: number;
  tco5yUSD: number;
  verdict: '✅ ONAY' | '🔍 İNCELEME' | '❌ RED';
}

export const SAMPLE_SUPPLIER_QUOTES: SupplierQuote[] = [
  {
    supplierId: 'hik-dist',
    supplierName: 'Hikvision Resmî Distribütör',
    source: 'RESMI_DISTRIBUTOR',
    itemId: 'cam-4k',
    itemName: '4K Endüstriyel Kamera',
    unitPriceUSD: 590,
    deliveryWeeks: 3,
    warrantyYears: 2,
    technicalCompliancePct: 95,
  },
  {
    supplierId: 'sdi-th',
    supplierName: 'SDI Tech İthalatçı',
    source: 'ITHALATCI',
    itemId: 'cam-4k',
    itemName: '4K Endüstriyel Kamera',
    unitPriceUSD: 540,
    deliveryWeeks: 6,
    warrantyYears: 1,
    technicalCompliancePct: 82,
  },
  {
    supplierId: 'yerli-atolye',
    supplierName: 'Yerli Üretim Atölye',
    source: 'YERLI_URETIM',
    itemId: 'cam-4k',
    itemName: '4K Endüstriyel Kamera',
    unitPriceUSD: 620,
    deliveryWeeks: 4,
    warrantyYears: 3,
    technicalCompliancePct: 88,
  },
];

// Ağırlıklar: Teknik Uyum %40 • Fiyat %30 • Teslimat %15 • Garanti %15
const W = { price: 0.3, delivery: 0.15, warranty: 0.15, compliance: 0.4 };

export function evaluateSupplierQuote(
  quote: SupplierQuote,
  batch: SupplierQuote[] = SAMPLE_SUPPLIER_QUOTES
): QuoteScore {
  const prices = batch.map((q) => q.unitPriceUSD);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const range = Math.max(1, maxPrice - minPrice);

  const priceScore = Math.round(100 * (maxPrice - quote.unitPriceUSD) / range);
  const deliveryScore = Math.round(100 * Math.max(0, Math.min(1, 1 - (quote.deliveryWeeks - 1) / 10)));
  const warrantyScore = Math.round(Math.min(100, quote.warrantyYears * 33.33));
  const complianceScore = Math.round(Math.max(0, Math.min(100, quote.technicalCompliancePct)));

  let weightedTotal = Math.round(
    priceScore * W.price + deliveryScore * W.delivery + warrantyScore * W.warranty + complianceScore * W.compliance
  );
  // Güven bonusu: uzun garanti + yüksek teknik uyumluluk
  if (quote.warrantyYears >= 2) weightedTotal += 3;
  if (quote.technicalCompliancePct >= 90) weightedTotal += 4;

  const tco5yUSD = Math.round(quote.unitPriceUSD * (1 + 0.08 * Math.max(0, 5 - quote.warrantyYears)));
  const verdict: QuoteScore['verdict'] = weightedTotal >= 78 ? '✅ ONAY' : weightedTotal >= 55 ? '🔍 İNCELEME' : '❌ RED';

  return {
    ...quote,
    priceScore,
    deliveryScore,
    warrantyScore,
    complianceScore,
    weightedTotal,
    tco5yUSD,
    verdict,
  };
}


// ----------------------------------------------------------------------------
// 6️⃣ RESMİ SATIN ALMA TALEBİ & BEYANNAME ÜRETİCİSİ
// ----------------------------------------------------------------------------
export interface RequisitionOptions {
  requester?: string;
  department?: string;
}

export function generatePurchaseRequisition(opts: RequisitionOptions = {}): string {
  const roi = computeOpenHardwareROI();
  const totalUSD = openHardwareBundleUSD();
  const totalTL = openHardwareBundleTL();
  const totalEUR = openHardwareBundleEUR();
  const evaluated = SAMPLE_SUPPLIER_QUOTES.map((q) => evaluateSupplierQuote(q));
  const approved = evaluated.filter((e) => e.verdict === '✅ ONAY');
  const videoSystems = CLOSED_BOX_SYSTEMS.filter((s) => s.id !== 'bepro');
  const avgClosed = Math.round(
    videoSystems.reduce((a, b) => a + closedBoxTCO5Y(b), 0) / Math.max(1, videoSystems.length)
  );

  const lines: string[] = [];
  lines.push('📦 LİKYA KAMPÜSÜ — RESMİ SATIN ALMA TALEBİ & TEKNİK ŞARTNAME BEYANNAMESİ');
  lines.push('='.repeat(74));
  lines.push(`Talep Tarihi: ${new Date().toLocaleDateString('tr-TR')}  •  Referans No: LKY-PROC-${new Date().getFullYear()}-01`);
  lines.push(`Talep Eden: ${opts.requester ?? 'Sport Vision Müdürlüğü'}  •  Bölüm: ${opts.department ?? 'Teknoloji & Performans'}`);
  lines.push('');
  lines.push('1) GEREKÇE');
  lines.push('   Hazır kapalı kutu sistemlere (Veo / Spiideo / Pixellot / Bepro) yıllık lisans');
  lines.push('   ödemek yerine; endüstriyel bileşenler doğrudan tedarik edilip yerli');
  lines.push('   yazılımımız (Sport Vision) ile entegre edilecektir.');
  lines.push('   • Biyomekanik analiz (Ghost Avatar, vuruş açısı) — Gelişim Ligi (PHV/Mirwald)');
  lines.push('   • HRV yorgunluk takibi (Polar H10 / BLE 5.3) — Medya Kasası 4K klip üretimi');
  lines.push(`   • 5 yıllık maliyet avantajı: %${roi.avgVideoSavingsPct} (bizim ${totalUSD.toLocaleString('tr-TR')} USD tek seferlik vs rakip ortalama ${avgClosed.toLocaleString('tr-TR')} USD TCO)`);
  lines.push('');
  lines.push('2) İHTİYAÇ KALEMLERİ & TEKNİK ŞARTNAME');
  HARDWARE_SPECS.forEach((s) => {
    lines.push(`   ${s.icon} ${s.name} ×${s.requiredCount}  —  ${s.unitPriceUSD}$/adet (${s.unitPriceTL.toLocaleString('tr-TR')} TL)`);
    lines.push(`       Yerine Geçer: ${s.replaces}`);
    s.criteria.forEach((c) => lines.push(`       • ${c}`));
  });
  lines.push('');
  lines.push(`   TOPLAM BÜTÇE (kurulum dahil): ${totalTL.toLocaleString('tr-TR')} TL  ≈  ${totalUSD.toLocaleString('tr-TR')} USD  ≈  ${totalEUR.toLocaleString('tr-TR')} EUR`);
  lines.push('   NOT: Yazılım bedeli YOK — Sport Vision yerli yazılımı lisanssız kullanılır.');
  lines.push('');
  lines.push('3) TEDARİKÇİ DEĞERLENDİRMESİ (Motor: evaluateSupplierQuote)');
  evaluated.forEach((e) => {
    lines.push(
      `   • ${e.supplierName} (${e.source}) — ${e.unitPriceUSD}$ • teslim ${e.deliveryWeeks} hafta • ${e.warrantyYears} yıl garanti • teknik uyum %${e.technicalCompliancePct}` +
        ` • SKOR ${e.weightedTotal} • ${e.verdict}`
    );
  });
  lines.push(`   İhaleye uygun adaylar: ${approved.map((a) => a.supplierName).join(', ') || '— (yeniden fiyat toplanmalı)'}`);
  lines.push('');
  lines.push('4) ONAY BÖLÜMÜ');
  lines.push('   Patron / CEO  :  .................................................');
  lines.push('   İmza & Kaşe   :  .................................................');
  lines.push('   Onay Tarihi   :  ....../....../20......');
  lines.push('');
  lines.push('   Bu beyanname Likya Donanım & Satın Alma Motoru tarafından üretilmiştir.');
  return lines.join('\n');
}

