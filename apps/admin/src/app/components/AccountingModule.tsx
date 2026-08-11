'use client';

import React, { useState } from 'react';

// ============================================================================
// TİP TANIMLARI
// ============================================================================
type CariTip = 'Müşteri' | 'Tedarikçi';
type FaturaTip = 'SATIŞ' | 'GİDER';
type FaturaDurum = 'Taslak' | 'Gönderildi' | 'Ödendi' | 'Vadesi Geçti';
type IslemTip = 'GELİR' | 'GİDER';
type HesapTip = 'kasa' | 'banka';

interface Cari {
  id: string;
  ad: string;
  tip: CariTip;
  telefon: string;
  email: string;
  bakiye: number;
}

interface FaturaKalem {
  id: string;
  urun: string;
  miktar: number;
  birimFiyat: number;
  kdvOrani: number;
}

interface Fatura {
  id: string;
  no: string;
  tip: FaturaTip;
  cariId: string;
  tarih: string;
  vade: string;
  durum: FaturaDurum;
  kalemler: FaturaKalem[];
}

interface Islem {
  id: string;
  tip: IslemTip;
  aciklama: string;
  tutar: number;
  tarih: string;
  kategori: string;
  hesap: HesapTip;
}

// ============================================================================
// YARDIMCI FONKSİYONLAR
// ============================================================================
const paraFormat = (n: number) =>
  n.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 2 });

const kdvHesapla = (kalemler: FaturaKalem[]) =>
  kalemler.reduce((toplam, k) => toplam + k.miktar * k.birimFiyat * (k.kdvOrani / 100), 0);

const araToplam = (kalemler: FaturaKalem[]) =>
  kalemler.reduce((toplam, k) => toplam + k.miktar * k.birimFiyat, 0);

const genelToplam = (kalemler: FaturaKalem[]) => araToplam(kalemler) + kdvHesapla(kalemler);

// ============================================================================
// ANA MUHASEBE MODÜLÜ
// ============================================================================
export default function AccountingModule() {
  const [aktifSekme, setAktifSekme] = useState<'dashboard' | 'cari' | 'fatura' | 'kasa' | 'rapor'>('dashboard');

  // --- Cari Yönetimi State ---
  const [cariler, setCariler] = useState<Cari[]>([
    { id: 'C-001', ad: 'Likya Doğa & Organik Market', tip: 'Müşteri', telefon: '0532 111 22 33', email: 'market@likya.com', bakiye: 18450 },
    { id: 'C-002', ad: 'Sedir Cafe & Bistro', tip: 'Müşteri', telefon: '0533 444 55 66', email: 'cafe@likya.com', bakiye: 9200 },
    { id: 'C-003', ad: 'Hymer Karavan Distribütörü', tip: 'Tedarikçi', telefon: '0212 555 66 77', email: 'satis@hymer.com', bakiye: -125000 },
    { id: 'C-004', ad: 'Outdoor Kiralama & E-Bike', tip: 'Müşteri', telefon: '0534 777 88 99', email: 'outdoor@likya.com', bakiye: 5600 },
  ]);
  const [yeniCari, setYeniCari] = useState({ ad: '', tip: 'Müşteri' as CariTip, telefon: '', email: '' });

  // --- Fatura State ---
  const [faturalar, setFaturalar] = useState<Fatura[]>([
    {
      id: 'F-001', no: 'SF-2026-0001', tip: 'SATIŞ', cariId: 'C-001', tarih: '2026-08-01', vade: '2026-08-15', durum: 'Ödendi',
      kalemler: [{ id: 'K-1', urun: 'Organik Sebze Sepeti', miktar: 50, birimFiyat: 120, kdvOrani: 10 }],
    },
    {
      id: 'F-002', no: 'SF-2026-0002', tip: 'SATIŞ', cariId: 'C-002', tarih: '2026-08-05', vade: '2026-08-20', durum: 'Gönderildi',
      kalemler: [{ id: 'K-2', urun: 'Kampüs Bistro Catering', miktar: 1, birimFiyat: 8400, kdvOrani: 20 }],
    },
    {
      id: 'F-003', no: 'GF-2026-0001', tip: 'GİDER', cariId: 'C-003', tarih: '2026-08-03', vade: '2026-08-30', durum: 'Vadesi Geçti',
      kalemler: [{ id: 'K-3', urun: 'Hymer Grand Canyon S 4x4', miktar: 1, birimFiyat: 125000, kdvOrani: 20 }],
    },
  ]);
  const [yeniFatura, setYeniFatura] = useState<{ tip: FaturaTip; cariId: string; tarih: string; vade: string }>({
    tip: 'SATIŞ', cariId: 'C-001', tarih: new Date().toISOString().slice(0, 10), vade: '',
  });
  const [faturaKalemler, setFaturaKalemler] = useState<FaturaKalem[]>([
    { id: 'NK-1', urun: '', miktar: 1, birimFiyat: 0, kdvOrani: 20 },
  ]);

  // --- Kasa / Banka State ---
  const [islemler, setIslemler] = useState<Islem[]>([
    { id: 'I-001', tip: 'GELİR', aciklama: 'Konaklama Tahsilatı - Parsel #04', tutar: 1200, tarih: '2026-08-01', kategori: 'Konaklama', hesap: 'kasa' },
    { id: 'I-002', tip: 'GELİR', aciklama: 'Try Before Buy Komisyonu', tutar: 36200, tarih: '2026-08-02', kategori: 'Komisyon', hesap: 'banka' },
    { id: 'I-003', tip: 'GİDER', aciklama: 'Elektrik Faturası (GES Yedek)', tutar: 4800, tarih: '2026-08-04', kategori: 'Enerji', hesap: 'banka' },
    { id: 'I-004', tip: 'GİDER', aciklama: 'Personel Maaş Avansı', tutar: 15000, tarih: '2026-08-05', kategori: 'Personel', hesap: 'kasa' },
  ]);
  const [yeniIslem, setYeniIslem] = useState<{ tip: IslemTip; aciklama: string; tutar: number; kategori: string; hesap: HesapTip }>({
    tip: 'GELİR', aciklama: '', tutar: 0, kategori: 'Satış', hesap: 'kasa',
  });

  // --- Rapor State ---
  const [raporAyi, setRaporAyi] = useState('2026-08');
  const aylar = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10', '2026-11', '2026-12'];

  // ==========================================================================
  // İŞLEM FONKSİYONLARI
  // ==========================================================================
  const cariEkle = () => {
    if (!yeniCari.ad.trim()) return;
    const id = `C-${String(cariler.length + 1).padStart(3, '0')}`;
    setCariler([...cariler, { id, ...yeniCari, bakiye: 0 }]);
    setYeniCari({ ad: '', tip: 'Müşteri', telefon: '', email: '' });
  };

  const faturaKalemEkle = () => {
    setFaturaKalemler([...faturaKalemler, { id: `NK-${Date.now()}`, urun: '', miktar: 1, birimFiyat: 0, kdvOrani: 20 }]);
  };

  const faturaKalemSil = (id: string) => {
    setFaturaKalemler(faturaKalemler.filter((k) => k.id !== id));
  };

  const faturaKalemGuncelle = (id: string, alan: keyof FaturaKalem, deger: string | number) => {
    setFaturaKalemler(faturaKalemler.map((k) => (k.id === id ? { ...k, [alan]: deger } : k)));
  };

  const faturaOlustur = (tip: FaturaTip) => {
    const gecerliKalemler = faturaKalemler.filter((k) => k.urun.trim() && k.birimFiyat > 0);
    if (gecerliKalemler.length === 0) return;
    const no = `${tip === 'SATIŞ' ? 'SF' : 'GF'}-2026-${String(faturalar.length + 1).padStart(4, '0')}`;
    const yeni: Fatura = {
      id: `F-${Date.now()}`,
      no,
      tip,
      cariId: yeniFatura.cariId,
      tarih: yeniFatura.tarih,
      vade: yeniFatura.vade || yeniFatura.tarih,
      durum: 'Gönderildi',
      kalemler: gecerliKalemler,
    };
    setFaturalar([yeni, ...faturalar]);
    // Cari bakiyeyi güncelle
    const tutar = genelToplam(gecerliKalemler);
    setCariler(cariler.map((c) =>
      c.id === yeniFatura.cariId
        ? { ...c, bakiye: c.bakiye + (tip === 'SATIŞ' ? tutar : -tutar) }
        : c
    ));
    setFaturaKalemler([{ id: 'NK-1', urun: '', miktar: 1, birimFiyat: 0, kdvOrani: 20 }]);
  };

  const islemEkle = () => {
    if (!yeniIslem.aciklama.trim() || yeniIslem.tutar <= 0) return;
    setIslemler([
      { id: `I-${Date.now()}`, ...yeniIslem, tarih: new Date().toISOString().slice(0, 10) },
      ...islemler,
    ]);
    setYeniIslem({ tip: 'GELİR', aciklama: '', tutar: 0, kategori: 'Satış', hesap: 'kasa' });
  };

  const faturaDurumGuncelle = (id: string, durum: FaturaDurum) => {
    setFaturalar(faturalar.map((f) => (f.id === id ? { ...f, durum } : f)));
  };

  // ==========================================================================
  // HESAPLAMALAR (Dashboard & Rapor)
  // ==========================================================================
  const toplamGelir = islemler.filter((i) => i.tip === 'GELİR').reduce((s, i) => s + i.tutar, 0);
  const toplamGider = islemler.filter((i) => i.tip === 'GİDER').reduce((s, i) => s + i.tutar, 0);
  const netNakit = toplamGelir - toplamGider;
  const bekleyenTahsilat = faturalar
    .filter((f) => f.tip === 'SATIŞ' && (f.durum === 'Gönderildi' || f.durum === 'Vadesi Geçti'))
    .reduce((s, f) => s + genelToplam(f.kalemler), 0);
  const bekleyenOdeme = faturalar
    .filter((f) => f.tip === 'GİDER' && (f.durum === 'Gönderildi' || f.durum === 'Vadesi Geçti'))
    .reduce((s, f) => s + genelToplam(f.kalemler), 0);
  const toplamCariBakiye = cariler.reduce((s, c) => s + c.bakiye, 0);

  const kasaBakiye = islemler
    .filter((i) => i.hesap === 'kasa')
    .reduce((s, i) => s + (i.tip === 'GELİR' ? i.tutar : -i.tutar), 0);
  const bankaBakiye = islemler
    .filter((i) => i.hesap === 'banka')
    .reduce((s, i) => s + (i.tip === 'GELİR' ? i.tutar : -i.tutar), 0);

  const ayIslemleri = islemler.filter((i) => i.tarih.startsWith(raporAyi));
  const ayGelir = ayIslemleri.filter((i) => i.tip === 'GELİR').reduce((s, i) => s + i.tutar, 0);
  const ayGider = ayIslemleri.filter((i) => i.tip === 'GİDER').reduce((s, i) => s + i.tutar, 0);

  const kategoriGiderler = islemler
    .filter((i) => i.tip === 'GİDER')
    .reduce<Record<string, number>>((acc, i) => {
      acc[i.kategori] = (acc[i.kategori] || 0) + i.tutar;
      return acc;
    }, {});

  // ==========================================================================
  // ORTAK STİL SABİTLERİ
  // ==========================================================================
  const cardStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '18px',
    padding: '20px',
  };
  const inputStyle: React.CSSProperties = {
    padding: '10px 12px',
    borderRadius: '10px',
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff',
    fontSize: '13px',
    width: '100%',
  };
  const btnStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #0f4c81, #00f2fe)',
    border: 'none',
    color: '#fff',
    padding: '10px 16px',
    borderRadius: '10px',
    fontWeight: 'bold',
    fontSize: '13px',
    cursor: 'pointer',
  };
  const tabStyle = (aktif: boolean): React.CSSProperties => ({
    padding: '10px 16px',
    borderRadius: '12px',
    border: aktif ? '1px solid #00f2fe' : '1px solid transparent',
    background: aktif ? 'linear-gradient(135deg, #0f4c81, #00f2fe)' : 'transparent',
    color: '#fff',
    cursor: 'pointer',
    fontWeight: aktif ? 'bold' : '600',
    fontSize: '13px',
    transition: 'all 0.15s ease',
  });

  const cariAdi = (id: string) => cariler.find((c) => c.id === id)?.ad || id;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* ===== MUHASEBE MODÜLÜ BAŞLIK & SEKMELER ===== */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(15, 76, 129, 0.6), rgba(0, 242, 254, 0.15))',
          border: '1px solid rgba(0, 242, 254, 0.3)',
          borderRadius: '20px',
          padding: '20px 24px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#fff', margin: 0 }}>
              📒 ÖN MUHASEBE & FİNANS MODÜLÜ
            </h2>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
              Cari, Fatura, Kasa ve Raporlama — Paraşüt benzeri entegre finans yönetimi
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {([
              ['dashboard', '📊 Dashboard'],
              ['cari', '👥 Cari Yönetimi'],
              ['fatura', '🧾 Faturalar'],
              ['kasa', '💰 Kasa & Banka'],
              ['rapor', '📈 Raporlar'],
            ] as const).map(([key, label]) => (
              <button key={key} onClick={() => setAktifSekme(key)} style={tabStyle(aktifSekme === key)}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ================================================================ */}
      {/* 📊 DASHBOARD SEKMESİ                                              */}
      {/* ================================================================ */}
      {aktifSekme === 'dashboard' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Üst Metrik Kartları */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ ...cardStyle, borderLeft: '4px solid #48bb78' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold' }}>TOPLAM GELİR</div>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#48bb78', marginTop: '6px' }}>{paraFormat(toplamGelir)}</div>
              <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '4px' }}>Tüm dönem tahsilatlar</div>
            </div>
            <div style={{ ...cardStyle, borderLeft: '4px solid #e07a5f' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold' }}>TOPLAM GİDER</div>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#e07a5f', marginTop: '6px' }}>{paraFormat(toplamGider)}</div>
              <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '4px' }}>Tüm dönem giderleri</div>
            </div>
            <div style={{ ...cardStyle, borderLeft: '4px solid #00f2fe' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold' }}>NET NAKİT AKIŞI</div>
              <div style={{ fontSize: '24px', fontWeight: '900', color: netNakit >= 0 ? '#00f2fe' : '#e07a5f', marginTop: '6px' }}>{paraFormat(netNakit)}</div>
              <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '4px' }}>Gelir - Gider farkı</div>
            </div>
            <div style={{ ...cardStyle, borderLeft: '4px solid #ecc94b' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold' }}>BEKLEYEN TAHSİLAT</div>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#ecc94b', marginTop: '6px' }}>{paraFormat(bekleyenTahsilat)}</div>
              <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '4px' }}>Gönderildi / Vadesi geçti</div>
            </div>
            <div style={{ ...cardStyle, borderLeft: '4px solid #9f7aea' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold' }}>BEKLEYEN ÖDEME</div>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#9f7aea', marginTop: '6px' }}>{paraFormat(bekleyenOdeme)}</div>
              <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '4px' }}>Tedarikçi faturaları</div>
            </div>
            <div style={{ ...cardStyle, borderLeft: '4px solid #48bb78' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold' }}>TOPLAM CARİ BAKİYE</div>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#48bb78', marginTop: '6px' }}>{paraFormat(toplamCariBakiye)}</div>
              <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '4px' }}>{cariler.length} aktif cari</div>
            </div>
          </div>

          {/* Gelir / Gider Dağılımı */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            <div style={cardStyle}>
              <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff', marginBottom: '14px' }}>💹 GELİR / GİDER DAĞILIMI</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ color: '#94a3b8' }}>Gelir</span>
                    <span style={{ color: '#48bb78', fontWeight: 'bold' }}>{paraFormat(toplamGelir)}</span>
                  </div>
                  <div style={{ height: '10px', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{ width: `${toplamGelir + toplamGider > 0 ? (toplamGelir / (toplamGelir + toplamGider)) * 100 : 0}%`, height: '100%', background: 'linear-gradient(90deg, #48bb78, #00f2fe)', borderRadius: '6px' }} />
                  </div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                    <span style={{ color: '#94a3b8' }}>Gider</span>
                    <span style={{ color: '#e07a5f', fontWeight: 'bold' }}>{paraFormat(toplamGider)}</span>
                  </div>
                  <div style={{ height: '10px', background: 'rgba(255,255,255,0.06)', borderRadius: '6px', overflow: 'hidden' }}>
                    <div style={{ width: `${toplamGelir + toplamGider > 0 ? (toplamGider / (toplamGelir + toplamGider)) * 100 : 0}%`, height: '100%', background: 'linear-gradient(90deg, #e07a5f, #ecc94b)', borderRadius: '6px' }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Son İşlemler */}
            <div style={cardStyle}>
              <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff', marginBottom: '14px' }}>🕒 SON KASA HAREKETLERİ</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {islemler.slice(0, 5).map((i) => (
                  <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px' }}>
                    <div>
                      <div style={{ fontSize: '12px', color: '#fff', fontWeight: 'bold' }}>{i.aciklama}</div>
                      <div style={{ fontSize: '10px', color: '#94a3b8' }}>{i.tarih} • {i.kategori}</div>
                    </div>
                    <span style={{ fontSize: '13px', fontWeight: 'bold', color: i.tip === 'GELİR' ? '#48bb78' : '#e07a5f' }}>
                      {i.tip === 'GELİR' ? '+' : '-'}{paraFormat(i.tutar)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* 👥 CARİ YÖNETİMİ SEKMESİ                                          */}
      {/* ================================================================ */}
      {aktifSekme === 'cari' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
          {/* Yeni Cari Ekleme Formu */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff', marginBottom: '14px' }}>➕ YENİ CARİ EKLE</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <input style={inputStyle} placeholder="Cari Adı / Firma" value={yeniCari.ad} onChange={(e) => setYeniCari({ ...yeniCari, ad: e.target.value })} />
              <div style={{ display: 'flex', gap: '8px' }}>
                {(['Müşteri', 'Tedarikçi'] as CariTip[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setYeniCari({ ...yeniCari, tip: t })}
                    style={{
                      flex: 1, padding: '8px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold',
                      background: yeniCari.tip === t ? (t === 'Müşteri' ? 'rgba(72,187,120,0.2)' : 'rgba(224,122,95,0.2)') : 'rgba(255,255,255,0.03)',
                      border: yeniCari.tip === t ? `1px solid ${t === 'Müşteri' ? '#48bb78' : '#e07a5f'}` : '1px solid rgba(255,255,255,0.1)',
                      color: '#fff',
                    }}
                  >
                    {t === 'Müşteri' ? '👤 Müşteri' : '🏭 Tedarikçi'}
                  </button>
                ))}
              </div>
              <input style={inputStyle} placeholder="Telefon" value={yeniCari.telefon} onChange={(e) => setYeniCari({ ...yeniCari, telefon: e.target.value })} />
              <input style={inputStyle} placeholder="E-posta" value={yeniCari.email} onChange={(e) => setYeniCari({ ...yeniCari, email: e.target.value })} />
              <button onClick={cariEkle} style={btnStyle}>💾 Cariyi Kaydet</button>
            </div>
          </div>

          {/* Cari Listesi */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff', marginBottom: '14px' }}>📋 CARİ LİSTESİ & BAKİYELER</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {cariler.map((c) => (
                <div key={c.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>{c.ad}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                        <span style={{ color: c.tip === 'Müşteri' ? '#48bb78' : '#e07a5f', fontWeight: 'bold' }}>{c.tip}</span> • {c.telefon} • {c.email}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '14px', fontWeight: 'bold', color: c.bakiye >= 0 ? '#48bb78' : '#e07a5f' }}>
                        {c.bakiye >= 0 ? '' : '-'}{paraFormat(Math.abs(c.bakiye))}
                      </div>
                      <div style={{ fontSize: '10px', color: '#94a3b8' }}>{c.bakiye >= 0 ? 'Alacaklı' : 'Borçlu'}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* 🧾 FATURA SEKMESİ                                                 */}
      {/* ================================================================ */}
      {aktifSekme === 'fatura' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Yeni Fatura Oluşturma */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff', marginBottom: '14px' }}>🧾 YENİ FATURA OLUŞTUR</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginBottom: '14px' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Fatura Tipi</label>
                <select
                  style={inputStyle}
                  value={yeniFatura.tip}
                  onChange={(e) => setYeniFatura({ ...yeniFatura, tip: e.target.value as FaturaTip })}
                >
                  <option value="SATIŞ">Satış Faturası</option>
                  <option value="GİDER">Gider Faturası</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Cari</label>
                <select
                  style={inputStyle}
                  value={yeniFatura.cariId}
                  onChange={(e) => setYeniFatura({ ...yeniFatura, cariId: e.target.value })}
                >
                  {cariler.map((c) => (
                    <option key={c.id} value={c.id}>{c.ad}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Düzenleme Tarihi</label>
                <input type="date" style={inputStyle} value={yeniFatura.tarih} onChange={(e) => setYeniFatura({ ...yeniFatura, tarih: e.target.value })} />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Vade Tarihi</label>
                <input type="date" style={inputStyle} value={yeniFatura.vade} onChange={(e) => setYeniFatura({ ...yeniFatura, vade: e.target.value })} />
              </div>
            </div>

            {/* Fatura Kalemleri */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 40px', gap: '8px', padding: '0 4px' }}>
                <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold' }}>Ürün / Hizmet</span>
                <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold' }}>Miktar</span>
                <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold' }}>Birim Fiyat</span>
                <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold' }}>KDV %</span>
                <span />
              </div>
              {faturaKalemler.map((k) => (
                <div key={k.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 40px', gap: '8px', alignItems: 'center' }}>
                  <input style={inputStyle} placeholder="Ürün adı" value={k.urun}
                    onChange={(e) => faturaKalemGuncelle(k.id, 'urun', e.target.value)} />
                  <input style={inputStyle} type="number" min="1" placeholder="Miktar" value={k.miktar}
                    onChange={(e) => faturaKalemGuncelle(k.id, 'miktar', Number(e.target.value))} />
                  <input style={inputStyle} type="number" min="0" placeholder="Birim Fiyat" value={k.birimFiyat}
                    onChange={(e) => faturaKalemGuncelle(k.id, 'birimFiyat', Number(e.target.value))} />
                  <select style={inputStyle} value={k.kdvOrani}
                    onChange={(e) => faturaKalemGuncelle(k.id, 'kdvOrani', Number(e.target.value))}>
                    <option value={0}>%0</option>
                    <option value={1}>%1</option>
                    <option value={10}>%10</option>
                    <option value={20}>%20</option>
                  </select>
                  <button
                    onClick={() => faturaKalemSil(k.id)}
                    style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer', fontSize: '16px' }}
                    title="Kalemi sil"
                  >✕</button>
                </div>
              ))}
              <button
                onClick={faturaKalemEkle}
                style={{ ...btnStyle, background: 'transparent', border: '1px dashed #334155', color: '#00f2fe', width: 'fit-content', padding: '6px 14px' }}
              >+ Kalem Ekle</button>
            </div>

            {/* Fatura Özeti */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,242,254,0.06)', border: '1px solid rgba(0,242,254,0.2)', borderRadius: '12px', padding: '12px 16px', marginBottom: '14px' }}>
              <div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>Ara Toplam</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#e2e8f0' }}>{paraFormat(araToplam(faturaKalemler))}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>KDV Toplamı</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#ecc94b' }}>{paraFormat(kdvHesapla(faturaKalemler))}</div>
              </div>
              <div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>Genel Toplam</div>
                <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#00f2fe' }}>{paraFormat(genelToplam(faturaKalemler))}</div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button
                onClick={() => setYeniFatura({ tip: 'SATIŞ', cariId: cariler[0]?.id || '', tarih: new Date().toISOString().slice(0, 10), vade: '' })}
                style={{ ...btnStyle, background: 'transparent', border: '1px solid #334155', color: '#94a3b8' }}
              >Temizle</button>
              <button
                onClick={() => faturaOlustur('SATIŞ')}
                style={{ ...btnStyle, background: 'linear-gradient(135deg,#00f2fe,#10b981)', color: '#050811', fontWeight: 'bold' }}
              >Satış Faturası Oluştur</button>
              <button
                onClick={() => faturaOlustur('GİDER')}
                style={{ ...btnStyle, background: 'linear-gradient(135deg,#e07a5f,#f27a1a)', color: '#050811', fontWeight: 'bold' }}
              >Gider Faturası Oluştur</button>
            </div>
          </div>

          {/* Fatura Listesi */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff', marginBottom: '14px' }}>📄 FATURA LİSTESİ</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {faturalar.map((f) => {
                const cari = cariler.find((c) => c.id === f.cariId);
                const toplam = genelToplam(f.kalemler);
                const durumRenk = f.durum === 'Ödendi' ? '#48bb78' : f.durum === 'Gönderildi' ? '#ecc94b' : f.durum === 'Vadesi Geçti' ? '#f87171' : '#94a3b8';
                return (
                  <div key={f.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '12px 14px', flexWrap: 'wrap', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div style={{ width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', background: f.tip === 'SATIŞ' ? 'rgba(0,242,254,0.12)' : 'rgba(240,122,26,0.12)' }}>
                        {f.tip === 'SATIŞ' ? '📤' : '📥'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '14px' }}>{f.no} · {cari?.ad || '—'}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>{f.tarih} · {f.tip === 'SATIŞ' ? 'Satış' : 'Gider'} · {f.kalemler.length} kalem</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 'bold', color: f.tip === 'SATIŞ' ? '#00f2fe' : '#e07a5f', fontSize: '15px' }}>{paraFormat(toplam)}</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>KDV dahil</div>
                      </div>
                      <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '20px', fontWeight: 'bold', background: `${durumRenk}22`, color: durumRenk }}>
                        {f.durum}
                      </span>
                      {f.durum !== 'Ödendi' && (
                        <button
                          onClick={() => faturaDurumGuncelle(f.id, 'Ödendi')}
                          style={{ ...btnStyle, padding: '6px 12px', fontSize: '12px', background: 'rgba(72,187,120,0.15)', color: '#48bb78', border: '1px solid rgba(72,187,120,0.3)' }}
                        >Ödendi İşaretle</button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* 💰 KASA & BANKA SEKMESİ                                           */}
      {/* ================================================================ */}
      {aktifSekme === 'kasa' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div style={{ ...cardStyle, borderLeft: '4px solid #00f2fe' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold' }}>KASA BAKİYESİ</div>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#00f2fe', marginTop: '6px' }}>{paraFormat(kasaBakiye)}</div>
            </div>
            <div style={{ ...cardStyle, borderLeft: '4px solid #48bb78' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold' }}>BANKA BAKİYESİ</div>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#48bb78', marginTop: '6px' }}>{paraFormat(bankaBakiye)}</div>
            </div>
            <div style={{ ...cardStyle, borderLeft: '4px solid #ecc94b' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold' }}>TOPLAM NAKİT</div>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#ecc94b', marginTop: '6px' }}>{paraFormat(kasaBakiye + bankaBakiye)}</div>
            </div>
          </div>

          {/* Yeni İşlem */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff', marginBottom: '14px' }}>💸 YENİ KASA / BANKA HAREKETİ</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px', alignItems: 'end' }}>
              <div>
                <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Tür</label>
                <select style={inputStyle} value={yeniIslem.tip} onChange={(e) => setYeniIslem({ ...yeniIslem, tip: e.target.value as IslemTip })}>
                  <option value="GELİR">Gelir</option>
                  <option value="GİDER">Gider</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Hesap</label>
                <select style={inputStyle} value={yeniIslem.hesap} onChange={(e) => setYeniIslem({ ...yeniIslem, hesap: e.target.value as HesapTip })}>
                  <option value="kasa">Kasa</option>
                  <option value="banka">Banka</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Tutar</label>
                <input type="number" min="0" style={inputStyle} placeholder="0,00" value={yeniIslem.tutar} onChange={(e) => setYeniIslem({ ...yeniIslem, tutar: Number(e.target.value) })} />
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Kategori</label>
                <select style={inputStyle} value={yeniIslem.kategori} onChange={(e) => setYeniIslem({ ...yeniIslem, kategori: e.target.value })}>
                  <option value="Satış">Satış</option>
                  <option value="Kira">Kira</option>
                  <option value="Personel">Personel</option>
                  <option value="Enerji">Enerji</option>
                  <option value="Malzeme">Malzeme</option>
                  <option value="Diğer">Diğer</option>
                </select>
              </div>
              <div>
                <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Açıklama</label>
                <input style={inputStyle} placeholder="Açıklama" value={yeniIslem.aciklama} onChange={(e) => setYeniIslem({ ...yeniIslem, aciklama: e.target.value })} />
              </div>
              <button
                onClick={islemEkle}
                style={{ ...btnStyle, background: 'linear-gradient(135deg,#00f2fe,#10b981)', color: '#050811', fontWeight: 'bold' }}
              >Ekle</button>
            </div>
          </div>

          {/* Hareket Listesi */}
          <div style={cardStyle}>
            <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff', marginBottom: '14px' }}>📋 SON HAREKETLER</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {islemler.map((i) => (
                <div key={i.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '10px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '16px' }}>{i.tip === 'GELİR' ? '⬆️' : '⬇️'}</span>
                    <div>
                      <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '13px' }}>{i.aciklama || i.kategori}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>{i.tarih} · {i.hesap === 'kasa' ? 'Kasa' : 'Banka'} · {i.kategori}</div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 'bold', fontSize: '14px', color: i.tip === 'GELİR' ? '#48bb78' : '#f87171' }}>
                    {i.tip === 'GELİR' ? '+' : '-'}{paraFormat(i.tutar)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================================================================ */}
      {/* 📈 RAPORLAR SEKMESİ                                               */}
      {/* ================================================================ */}
      {aktifSekme === 'rapor' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff', margin: 0 }}>📊 FİNANSAL RAPORLAR</h3>
            <select style={{ ...inputStyle, width: 'auto' }} value={raporAyi} onChange={(e) => setRaporAyi(e.target.value)}>
              {aylar.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div style={{ ...cardStyle, borderLeft: '4px solid #48bb78' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold' }}>AY GELİR</div>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#48bb78', marginTop: '6px' }}>{paraFormat(ayGelir)}</div>
            </div>
            <div style={{ ...cardStyle, borderLeft: '4px solid #f87171' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold' }}>AY GİDER</div>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#f87171', marginTop: '6px' }}>{paraFormat(ayGider)}</div>
            </div>
            <div style={{ ...cardStyle, borderLeft: '4px solid #00f2fe' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold' }}>NET KÂR / ZARAR</div>
              <div style={{ fontSize: '24px', fontWeight: '900', color: ayGelir - ayGider >= 0 ? '#00f2fe' : '#f87171', marginTop: '6px' }}>{paraFormat(ayGelir - ayGider)}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {/* Kategori Bazlı Gider Dağılımı */}
            <div style={cardStyle}>
              <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff', marginBottom: '14px' }}>🧩 GİDER DAĞILIMI</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {Object.entries(kategoriGiderler).length === 0 && (
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>Bu ay için gider kaydı bulunmuyor.</div>
                )}
                {Object.entries(kategoriGiderler).map(([kategori, tutar]) => {
                  const max = Math.max(...Object.values(kategoriGiderler), 1);
                  const oran = (tutar / max) * 100;
                  return (
                    <div key={kategori}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                        <span style={{ color: '#cbd5e1' }}>{kategori}</span>
                        <span style={{ color: '#94a3b8' }}>{paraFormat(tutar)}</span>
                      </div>
                      <div style={{ height: '8px', background: '#1e293b', borderRadius: '6px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${oran}%`, background: 'linear-gradient(90deg,#e07a5f,#f27a1a)', borderRadius: '6px' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Cari Bakiyeler */}
            <div style={cardStyle}>
              <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff', marginBottom: '14px' }}>👥 CARİ BAKİYELER</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {cariler.map((c) => (
                  <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '10px 14px' }}>
                    <div>
                      <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '13px' }}>{c.ad}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>{c.tip}</div>
                    </div>
                    <div style={{ fontWeight: 'bold', fontSize: '14px', color: c.bakiye >= 0 ? '#48bb78' : '#f87171' }}>
                      {c.bakiye >= 0 ? '' : '-'}{paraFormat(Math.abs(c.bakiye))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

