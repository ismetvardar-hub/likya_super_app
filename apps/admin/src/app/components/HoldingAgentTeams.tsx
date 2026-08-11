'use client';

import React, { useState } from 'react';

// ============================================================================
// TİP TANIMLARI
// ============================================================================
type DepartmanTip =
  | 'pazarlama'
  | 'sosyal_medya'
  | 'satis'
  | 'it'
  | 'halkla_iliskiler'
  | 'insan_kaynaklari'
  | 'hukuk'
  | 'tedarik'
  | 'arge'
  | 'musteri_deneyimi';

interface Departman {
  id: DepartmanTip;
  ad: string;
  emoji: string;
  renk: string;
  aciklama: string;
  ajanlar: Ajan[];
}

interface Ajan {
  id: string;
  ad: string;
  rol: string;
  emoji: string;
  durum: 'aktif' | 'beklemede' | 'calisiyor';
  gorev: string;
  sonGorev: string;
  verimlilik: number;
}

interface DepartmanGorev {
  id: string;
  departman: DepartmanTip;
  baslik: string;
  aciklama: string;
  durum: 'planlandi' | 'calisiyor' | 'tamamlandi';
  sonuc?: string;
  zaman: string;
}

// ============================================================================
// YARDIMCI FONKSİYONLAR
// ============================================================================
const simdi = () => new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

const durumRenk: Record<string, string> = {
  aktif: '#48bb78',
  beklemede: '#ecc94b',
  calisiyor: '#00f2fe',
  planlandi: '#94a3b8',
  tamamlandi: '#48bb78',
};

const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '18px',
  padding: '20px',
};

const btnStyle: React.CSSProperties = {
  background: 'linear-gradient(135deg, #0f4c81, #00f2fe)',
  border: 'none',
  color: '#fff',
  padding: '10px 16px',
  borderRadius: '10px',
  fontWeight: 'bold',
  fontSize: '12px',
  cursor: 'pointer',
};

// ============================================================================
// HOLDİNG DEPARTMANLARI & AJAN TAKIMLARI
// ============================================================================
const DEPARTMANLAR: Departman[] = [
  {
    id: 'pazarlama',
    ad: 'Pazarlama Departmanı',
    emoji: '📣',
    renk: '#e07a5f',
    aciklama: 'Kampanya stratejisi, marka konumlandırma, pazar analizi ve büyüme planlaması.',
    ajanlar: [
      { id: 'PZ-01', ad: 'Marka Stratejisti', rol: 'Marka konumlandırma & kimlik', emoji: '🎯', durum: 'aktif', gorev: 'Likya marka kimliği v2.0', sonGorev: 'Logo & renk paleti güncellendi', verimlilik: 92 },
      { id: 'PZ-02', ad: 'Kampanya Yöneticisi', rol: 'Dijital & saha kampanyaları', emoji: '📢', durum: 'calisiyor', gorev: 'Yaz sezonu kampanya paketi', sonGorev: '3 kampanya taslağı hazırlandı', verimlilik: 88 },
      { id: 'PZ-03', ad: 'Pazar Analisti', rol: 'Rekabet & trend analizi', emoji: '📊', durum: 'aktif', gorev: 'Eko-turizm pazar raporu', sonGorev: 'Rakip kampüs analizi tamamlandı', verimlilik: 85 },
    ],
  },
  {
    id: 'sosyal_medya',
    ad: 'Sosyal Medya Departmanı',
    emoji: '📱',
    renk: '#00f2fe',
    aciklama: 'İçerik üretimi, influencer iş birlikleri, topluluk yönetimi ve viral büyüme.',
    ajanlar: [
      { id: 'SM-01', ad: 'İçerik Üretici', rol: 'Reels, story & görsel içerik', emoji: '🎬', durum: 'calisiyor', gorev: 'Karavan showroom tanıtım reels', sonGorev: '3 reels yayınlandı', verimlilik: 95 },
      { id: 'SM-02', ad: 'Influencer Koordinatörü', rol: 'Kamp & outdoor influencerları', emoji: '🤝', durum: 'aktif', gorev: '5 influencer iş birliği', sonGorev: '2 anlaşma imzalandı', verimlilik: 90 },
      { id: 'SM-03', ad: 'Topluluk Yöneticisi', rol: 'Yorum & DM yönetimi', emoji: '💬', durum: 'aktif', gorev: 'Haftalık topluluk raporu', sonGorev: '1.2K yeni takipçi', verimlilik: 87 },
      { id: 'SM-04', ad: 'Viral Büyüme Uzmanı', rol: 'Trend takibi & hashtag stratejisi', emoji: '🚀', durum: 'beklemede', gorev: 'TikTok trend analizi', sonGorev: 'Viral kampanya önerisi hazır', verimlilik: 82 },
    ],
  },
  {
    id: 'satis',
    ad: 'Satış Departmanı',
    emoji: '💼',
    renk: '#48bb78',
    aciklama: 'B2B anlaşmalar, sponsorluklar, üretici ortaklıkları ve gelir artırma.',
    ajanlar: [
      { id: 'ST-01', ad: 'B2B Satış Temsilcisi', rol: 'Kurumsal & sponsor anlaşmaları', emoji: '🤝', durum: 'calisiyor', gorev: 'Enerji markası sponsorluk görüşmesi', sonGorev: 'GES sponsorluk teklifi gönderildi', verimlilik: 89 },
      { id: 'ST-02', ad: 'Üretici Ortaklık Müdürü', rol: 'Karavan & ekipman üreticileri', emoji: '🏭', durum: 'aktif', gorev: '5 yeni üretici ortaklığı', sonGorev: 'Hymer & Knaus anlaşması tamam', verimlilik: 93 },
      { id: 'ST-03', ad: 'Kurumsal Etkinlik Satışı', rol: 'Şirket etkinlikleri & retreat', emoji: '🎪', durum: 'beklemede', gorev: 'Q3 kurumsal etkinlik takvimi', sonGorev: '2 şirket retreat onaylandı', verimlilik: 84 },
    ],
  },
  {
    id: 'it',
    ad: 'IT & Yazılım Departmanı',
    emoji: '💻',
    renk: '#9f7aea',
    aciklama: 'Yazılım geliştirme, altyapı, siber güvenlik ve otonom sistemler.',
    ajanlar: [
      { id: 'IT-01', ad: 'Full-Stack Geliştirici', rol: 'Next.js & Flutter geliştirme', emoji: '👨‍💻', durum: 'calisiyor', gorev: 'Muhasebe modülü entegrasyonu', sonGorev: 'Otonom ajan sistemi kuruldu', verimlilik: 96 },
      { id: 'IT-02', ad: 'Siber Güvenlik Uzmanı', rol: 'Güvenlik & RLS denetimi', emoji: '🛡️', durum: 'aktif', gorev: 'Aylık güvenlik taraması', sonGorev: 'RLS politikaları doğrulandı', verimlilik: 91 },
      { id: 'IT-03', ad: 'IoT & Altyapı Mühendisi', rol: 'Sensör ağı & mesh iletişim', emoji: '📡', durum: 'aktif', gorev: 'GES sensör kalibrasyonu', sonGorev: '142.8 kW canlı üretim', verimlilik: 88 },
      { id: 'IT-04', ad: 'Veri Bilimci', rol: 'Analitik & tahmin modelleri', emoji: '🧠', durum: 'beklemede', gorev: 'Doluluk tahmin modeli', sonGorev: 'Talep tahmini %94 doğruluk', verimlilik: 90 },
    ],
  },
  {
    id: 'halkla_iliskiler',
    ad: 'Halkla İlişkiler Departmanı',
    emoji: '🎙️',
    renk: '#ecc94b',
    aciklama: 'Basın ilişkileri, kriz yönetimi, yerel yönetim ve topluluk iletişimi.',
    ajanlar: [
      { id: 'PR-01', ad: 'Basın Sözcüsü', rol: 'Basın bültenleri & röportajlar', emoji: '📰', durum: 'aktif', gorev: 'Kampüs açılış basın bülteni', sonGorev: '3 yerel gazete haberi', verimlilik: 86 },
      { id: 'PR-02', ad: 'Kriz İletişim Uzmanı', rol: 'Kriz senaryoları & yönetimi', emoji: '🚨', durum: 'beklemede', gorev: 'Kriz iletişim planı v2', sonGorev: 'Risk matrisi güncellendi', verimlilik: 83 },
      { id: 'PR-03', ad: 'Kamu İlişkileri Koordinatörü', rol: 'Belediye & orman müdürlüğü', emoji: '🏛️', durum: 'aktif', gorev: 'Tahsis sözleşmesi takibi', sonGorev: 'İzin süreci ilerliyor', verimlilik: 89 },
    ],
  },
  {
    id: 'insan_kaynaklari',
    ad: 'İnsan Kaynakları Departmanı',
    emoji: '👥',
    renk: '#f472b6',
    aciklama: 'İşe alım, eğitim, çalışan memnuniyeti ve yetenek yönetimi.',
    ajanlar: [
      { id: 'HR-01', ad: 'İşe Alım Uzmanı', rol: 'Aday tarama & mülakat', emoji: '🔍', durum: 'aktif', gorev: 'Saha personeli alımı', sonGorev: '3 aday mülakata çağrıldı', verimlilik: 85 },
      { id: 'HR-02', ad: 'Eğitim Koordinatörü', rol: 'Oryantasyon & gelişim', emoji: '🎓', durum: 'beklemede', gorev: 'IoT personel eğitimi', sonGorev: 'Eğitim modülü hazırlandı', verimlilik: 81 },
      { id: 'HR-03', ad: 'Çalışan Memnuniyeti', rol: 'Anket & geri bildirim', emoji: '💚', durum: 'aktif', gorev: 'Aylık memnuniyet anketi', sonGorev: 'Memnuniyet %87', verimlilik: 79 },
    ],
  },
  {
    id: 'hukuk',
    ad: 'Hukuk & Uyum Departmanı',
    emoji: '⚖️',
    renk: '#f59e0b',
    aciklama: 'Sözleşmeler, mevzuat uyumu, fikri mülkiyet ve risk yönetimi.',
    ajanlar: [
      { id: 'HK-01', ad: 'Sözleşme Avukatı', rol: 'Kira & ortaklık sözleşmeleri', emoji: '📜', durum: 'aktif', gorev: '16 dükkan kira sözleşmesi', sonGorev: '12 sözleşme imzalandı', verimlilik: 90 },
      { id: 'HK-02', ad: 'Mevzuat Uzmanı', rol: 'Turizm & ticaret mevzuatı', emoji: '📋', durum: 'calisiyor', gorev: 'e-Fatura uyum denetimi', sonGorev: 'KDV oranları doğrulandı', verimlilik: 87 },
      { id: 'HK-03', ad: 'Fikri Mülkiyet Danışmanı', rol: 'Marka & patent koruması', emoji: '™️', durum: 'beklemede', gorev: 'Likya marka tescili', sonGorev: 'Tescil başvurusu hazır', verimlilik: 82 },
    ],
  },
  {
    id: 'tedarik',
    ad: 'Tedarik & Lojistik Departmanı',
    emoji: '🚚',
    renk: '#38bdf8',
    aciklama: 'Malzeme tedariki, stok yönetimi ve saha lojistiği.',
    ajanlar: [
      { id: 'TD-01', ad: 'Tedarik Uzmanı', rol: 'Malzeme & ekipman alımı', emoji: '📦', durum: 'aktif', gorev: 'Kamp ekipmanı tedariki', sonGorev: 'Çadır & mobilya siparişi', verimlilik: 84 },
      { id: 'TD-02', ad: 'Stok Yöneticisi', rol: 'Envanter & depo takibi', emoji: '🗃️', durum: 'calisiyor', gorev: 'Aylık stok sayımı', sonGorev: 'Envanter %98 doğruluk', verimlilik: 86 },
      { id: 'TD-03', ad: 'Lojistik Koordinatörü', rol: 'Saha içi ulaşım & drone', emoji: '🛸', durum: 'aktif', gorev: 'Drone teslimat rotası', sonGorev: 'Teslimat koridoru aktif', verimlilik: 88 },
    ],
  },
  {
    id: 'arge',
    ad: 'Ar-Ge & İnovasyon Departmanı',
    emoji: '🔬',
    renk: '#34d399',
    aciklama: 'Yeni teknolojiler, sürdürülebilirlik çözümleri ve ürün geliştirme.',
    ajanlar: [
      { id: 'AR-01', ad: 'Sürdürülebilirlik Mühendisi', rol: 'Eko-teknoloji çözümleri', emoji: '🌱', durum: 'aktif', gorev: 'Gri su arıtma optimizasyonu', sonGorev: '18.5K L geri dönüşüm', verimlilik: 92 },
      { id: 'AR-02', ad: 'Ürün Geliştirme Uzmanı', rol: 'Yeni deneyim ürünleri', emoji: '💡', durum: 'calisiyor', gorev: 'Gece gözlemevi deneyimi', sonGorev: 'Prototip hazırlandı', verimlilik: 85 },
      { id: 'AR-03', ad: 'Biyomekanik Araştırmacı', rol: 'Spor analitiği & 3D kamera', emoji: '🦾', durum: 'aktif', gorev: 'Padel vuruş analizi modeli', sonGorev: '%88.4 doğruluk modeli', verimlilik: 89 },
    ],
  },
  {
    id: 'musteri_deneyimi',
    ad: 'Müşteri Deneyimi Departmanı',
    emoji: '💎',
    renk: '#fb7185',
    aciklama: 'Müşteri memnuniyeti, geri bildirim, sadakat programı ve destek.',
    ajanlar: [
      { id: 'MX-01', ad: 'CX Analisti', rol: 'Müşteri yolculuğu haritası', emoji: '🗺️', durum: 'aktif', gorev: 'Konaklama deneyimi analizi', sonGorev: 'NPS skoru: 72', verimlilik: 87 },
      { id: 'MX-02', ad: 'Sadakat Programı Uzmanı', rol: 'Likya Pay & ödül sistemi', emoji: '🎁', durum: 'calisiyor', gorev: 'Sadakat seviyeleri v2', sonGorev: '3 yeni ödül eklendi', verimlilik: 84 },
      { id: 'MX-03', ad: 'Destek Koordinatörü', rol: '7/24 müşteri desteği', emoji: '🎧', durum: 'aktif', gorev: 'Canlı destek hattı', sonGorev: 'Ortalama yanıt: 2 dk', verimlilik: 90 },
    ],
  },
];

// ============================================================================
// ANA BİLEŞEN
// ============================================================================
export default function HoldingAgentTeams() {
  const [aktifDepartman, setAktifDepartman] = useState<DepartmanTip>('pazarlama');
  const [gorevler, setGorevler] = useState<DepartmanGorev[]>([
    { id: 'G-01', departman: 'pazarlama', baslik: 'Yaz sezonu kampanya paketi', aciklama: '3 kampanya taslağı hazırlandı, onay bekliyor', durum: 'calisiyor', zaman: '10:30' },
    { id: 'G-02', departman: 'sosyal_medya', baslik: 'Karavan showroom tanıtım reels', aciklama: '3 reels yayınlandı, 45K görüntülenme', durum: 'tamamlandi', sonuc: '45K görüntülenme', zaman: '09:45' },
    { id: 'G-03', departman: 'satis', baslik: 'GES sponsorluk görüşmesi', aciklama: 'Enerji markasına teklif gönderildi', durum: 'calisiyor', zaman: '11:00' },
    { id: 'G-04', departman: 'it', baslik: 'Otonom ajan sistemi kurulumu', aciklama: 'Muhasebe & finans ajanları entegre edildi', durum: 'tamamlandi', sonuc: '3 ajan aktif', zaman: '08:20' },
    { id: 'G-05', departman: 'halkla_iliskiler', baslik: 'Kampüs açılış basın bülteni', aciklama: '3 yerel gazete haberi yayınlandı', durum: 'tamamlandi', sonuc: '3 haber', zaman: '09:00' },
    { id: 'G-06', departman: 'insan_kaynaklari', baslik: 'Saha personeli alımı', aciklama: '3 aday mülakata çağrıldı', durum: 'calisiyor', zaman: '10:00' },
    { id: 'G-07', departman: 'hukuk', baslik: 'e-Fatura uyum denetimi', aciklama: 'KDV oranları ve fatura formatı doğrulandı', durum: 'calisiyor', zaman: '11:30' },
    { id: 'G-08', departman: 'tedarik', baslik: 'Kamp ekipmanı tedariki', aciklama: 'Çadır & mobilya siparişi verildi', durum: 'tamamlandi', sonuc: 'Sipariş onaylandı', zaman: '08:50' },
    { id: 'G-09', departman: 'arge', baslik: 'Gece gözlemevi deneyimi', aciklama: 'Prototip hazırlandı, test aşamasında', durum: 'calisiyor', zaman: '12:00' },
    { id: 'G-10', departman: 'musteri_deneyimi', baslik: 'Sadakat seviyeleri v2', aciklama: '3 yeni ödül seviyesi eklendi', durum: 'tamamlandi', sonuc: '3 seviye eklendi', zaman: '09:30' },
  ]);
  const [ajanLog, setAjanLog] = useState<string[]>([]);

  const logEkle = (mesaj: string) => {
    setAjanLog((prev) => [`[${simdi()}] ${mesaj}`, ...prev].slice(0, 30));
  };

  const departmanCalistir = (dep: Departman) => {
    logEkle(`🚀 ${dep.ad} ajan takımı otonom çalıştırıldı...`);
    dep.ajanlar.forEach((ajan, i) => {
      setTimeout(() => {
        logEkle(`  ${ajan.emoji} ${ajan.ad} → ${ajan.gorev} işlemini tamamladı (verimlilik %${ajan.verimlilik})`);
      }, 600 * (i + 1));
    });
    setTimeout(() => {
      logEkle(`✅ ${dep.ad} tüm ajanlar görevlerini tamamladı.`);
    }, 600 * dep.ajanlar.length + 400);
  };

  const aktifDep = DEPARTMANLAR.find((d) => d.id === aktifDepartman)!;
  const depGorevler = gorevler.filter((g) => g.departman === aktifDepartman);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* BAŞLIK */}
      <div style={{ ...cardStyle, background: 'linear-gradient(135deg, rgba(15,76,129,0.5), rgba(159,122,234,0.2))', border: '1px solid rgba(159,122,234,0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#fff' }}>
              🏢 LİKYA HOLDİNG OTONOM AJAN TAKIMLARI
            </h2>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
              10 departman • 30+ otonom ajan • 7/24 kesintisiz operasyon
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ padding: '6px 12px', background: 'rgba(72,187,120,0.15)', color: '#48bb78', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' }}>
              🟢 {DEPARTMANLAR.reduce((a, d) => a + d.ajanlar.filter(x => x.durum === 'aktif').length, 0)} Aktif Ajan
            </span>
            <span style={{ padding: '6px 12px', background: 'rgba(0,242,254,0.15)', color: '#00f2fe', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' }}>
              ⚡ {DEPARTMANLAR.reduce((a, d) => a + d.ajanlar.filter(x => x.durum === 'calisiyor').length, 0)} Çalışıyor
            </span>
          </div>
        </div>
      </div>

      {/* DEPARTMAN SEKMELERİ */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {DEPARTMANLAR.map((dep) => {
          const secili = aktifDepartman === dep.id;
          return (
            <button
              key={dep.id}
              onClick={() => setAktifDepartman(dep.id)}
              style={{
                padding: '10px 14px',
                borderRadius: '12px',
                border: secili ? `1px solid ${dep.renk}` : '1px solid rgba(255,255,255,0.1)',
                background: secili ? `${dep.renk}22` : 'rgba(255,255,255,0.03)',
                color: secili ? dep.renk : '#94a3b8',
                cursor: 'pointer',
                fontWeight: secili ? 'bold' : '600',
                fontSize: '12px',
                transition: 'all 0.15s ease',
              }}
            >
              {dep.emoji} {dep.ad}
            </button>
          );
        })}
      </div>

      {/* SEÇİLİ DEPARTMAN DETAYI */}
      <div style={{ ...cardStyle, border: `1px solid ${aktifDep.renk}44` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: aktifDep.renk }}>
              {aktifDep.emoji} {aktifDep.ad}
            </h3>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>{aktifDep.aciklama}</p>
          </div>
          <button onClick={() => departmanCalistir(aktifDep)} style={btnStyle}>
            🚀 Ajan Takımını Otonom Çalıştır
          </button>
        </div>

        {/* AJAN KARTLARI */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
          {aktifDep.ajanlar.map((ajan) => (
            <div key={ajan.id} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '22px' }}>{ajan.emoji}</span>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>{ajan.ad}</div>
                    <div style={{ fontSize: '10px', color: '#94a3b8' }}>{ajan.rol}</div>
                  </div>
                </div>
                <span style={{ fontSize: '10px', fontWeight: 'bold', color: durumRenk[ajan.durum], background: `${durumRenk[ajan.durum]}22`, padding: '4px 8px', borderRadius: '8px' }}>
                  {ajan.durum === 'aktif' ? '🟢 Aktif' : ajan.durum === 'calisiyor' ? '⚡ Çalışıyor' : '⏸️ Beklemede'}
                </span>
              </div>
              <div style={{ marginTop: '10px', fontSize: '11px', color: '#cbd5e1' }}>
                <div>📌 Görev: <strong>{ajan.gorev}</strong></div>
                <div style={{ marginTop: '4px' }}>✅ Son: {ajan.sonGorev}</div>
              </div>
              <div style={{ marginTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8', marginBottom: '4px' }}>
                  <span>Verimlilik</span>
                  <span style={{ color: ajan.verimlilik >= 90 ? '#48bb78' : ajan.verimlilik >= 85 ? '#ecc94b' : '#e07a5f' }}>%{ajan.verimlilik}</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '6px', height: '6px', overflow: 'hidden' }}>
                  <div style={{ width: `${ajan.verimlilik}%`, height: '100%', background: ajan.verimlilik >= 90 ? '#48bb78' : ajan.verimlilik >= 85 ? '#ecc94b' : '#e07a5f', borderRadius: '6px' }} />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* DEPARTMAN GÖREVLERİ */}
        <div style={{ marginTop: '16px' }}>
          <h4 style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff', marginBottom: '10px' }}>📋 Departman Görev Akışı</h4>
          {depGorevler.length === 0 && (
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>Bu departman için henüz görev kaydı yok.</div>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {depGorevler.map((g) => (
              <div key={g.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '10px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#fff' }}>{g.baslik}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{g.aciklama}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '10px', fontWeight: 'bold', color: durumRenk[g.durum], background: `${durumRenk[g.durum]}22`, padding: '4px 8px', borderRadius: '8px' }}>
                    {g.durum === 'tamamlandi' ? '✅ Tamamlandı' : g.durum === 'calisiyor' ? '⚡ Çalışıyor' : '📋 Planlandı'}
                  </span>
                  {g.sonuc && <div style={{ fontSize: '10px', color: '#48bb78', marginTop: '4px' }}>{g.sonuc}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* TÜM DEPARTMANLAR ÖZET */}
      <div style={{ ...cardStyle, background: 'rgba(0,0,0,0.4)' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#00f2fe', marginBottom: '14px' }}>🏢 HOLDİNG GENELİ DEPARTMAN ÖZETİ</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
          {DEPARTMANLAR.map((dep) => (
            <div key={dep.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: 'bold', color: dep.renk }}>{dep.emoji} {dep.ad}</span>
                <span style={{ fontSize: '10px', color: '#94a3b8' }}>{dep.ajanlar.length} ajan</span>
              </div>
              <div style={{ marginTop: '8px', display: 'flex', gap: '4px' }}>
                {dep.ajanlar.map((a) => (
                  <span key={a.id} title={a.ad} style={{ fontSize: '14px', opacity: a.durum === 'beklemede' ? 0.4 : 1 }}>{a.emoji}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CANLI AJAN LOG */}
      <div style={{ ...cardStyle, background: 'rgba(0,0,0,0.4)' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#00f2fe', marginBottom: '14px' }}>⚡ CANLI AJAN LOG</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
          {ajanLog.length === 0 && (
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>Henüz ajan çalıştırılmadı. Bir departman seçip "Ajan Takımını Otonom Çalıştır" butonuna basın.</div>
          )}
          {ajanLog.map((log, i) => (
            <div key={i} style={{ fontSize: '12px', color: '#cbd5e1', fontFamily: 'monospace' }}>{log}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
