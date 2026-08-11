'use client';

import React, { useState } from 'react';

// ============================================================================
// TİP TANIMLARI
// ============================================================================
type AjanTip = 'muhasebe' | 'finans' | 'it';
type AjanDurum = 'idle' | 'calisiyor' | 'tamamlandi' | 'hata';

interface AjanGorev {
  id: string;
  ajan: AjanTip;
  baslik: string;
  aciklama: string;
  durum: AjanDurum;
  sonuc?: string;
  zaman: string;
}

interface Mevzuat {
  id: string;
  ad: string;
  kategori: string;
  sonTarih: string;
  durum: 'uyumlu' | 'yaklasiyor' | 'gecikmis';
  aciklama: string;
}

interface OdemeCizelgesi {
  id: string;
  alici: string;
  tutar: number;
  vade: string;
  durum: 'planlandi' | 'onaylandi' | 'odendi';
  kaynak: string;
}

interface BankaAnlasmasi {
  id: string;
  banka: string;
  urun: string;
  limit: number;
  faiz: string;
  durum: 'aktif' | 'beklemede' | 'oneri';
}

interface ItTalebi {
  id: string;
  kaynak: string;
  talep: string;
  analiz: string;
  onerilenCozum: string;
  durum: 'analiz' | 'geliştirme' | 'tamamlandi';
}

// ============================================================================
// YARDIMCI FONKSİYONLAR
// ============================================================================
const paraFormat = (n: number) =>
  n.toLocaleString('tr-TR', { style: 'currency', currency: 'TRY', minimumFractionDigits: 2 });

const simdi = () => new Date().toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });

// ============================================================================
// OTONOM MUHASEBE & FİNANS AJANLARI
// ============================================================================
export default function AutonomousFinanceAgents() {
  const [aktifAjan, setAktifAjan] = useState<AjanTip>('muhasebe');
  const [ajanCalisiyor, setAjanCalisiyor] = useState(false);
  const [ajanLog, setAjanLog] = useState<string[]>([]);

  // --- Mevzuat Takibi (Muhasebe Ajanı) ---
  const [mevzuatlar, setMevzuatlar] = useState<Mevzuat[]>([
    { id: 'M-001', ad: 'KDV Beyannamesi (Ağustos)', kategori: 'Vergi', sonTarih: '2026-09-26', durum: 'yaklasiyor', aciklama: 'Aylık KDV beyannamesi ve ödeme' },
    { id: 'M-002', ad: 'Muhtasar & SGK Prim Bildirgesi', kategori: 'SGK', sonTarih: '2026-09-23', durum: 'yaklasiyor', aciklama: 'Personel SGK prim ve muhtasar beyanı' },
    { id: 'M-003', ad: 'Geçici Vergi Dönemi (3. Dönem)', kategori: 'Vergi', sonTarih: '2026-11-17', durum: 'uyumlu', aciklama: 'Kurumlar geçici vergi beyannamesi' },
    { id: 'M-004', ad: 'e-Fatura / e-Arşiv Uyumluluğu', kategori: 'Dijital', sonTarih: '2026-08-31', durum: 'gecikmis', aciklama: 'GİB e-fatura entegrasyon kontrolü' },
    { id: 'M-005', ad: 'Yıllık Kurumlar Vergisi Beyannamesi', kategori: 'Vergi', sonTarih: '2027-04-30', durum: 'uyumlu', aciklama: '2026 yılı kurumlar vergisi' },
  ]);

  // --- Ödeme Çizelgeleri (Finans Ajanı) ---
  const [odemeCizelgeleri, setOdemeCizelgeleri] = useState<OdemeCizelgesi[]>([
    { id: 'O-001', alici: 'Hymer Karavan Distribütörü', tutar: 125000, vade: '2026-08-30', durum: 'planlandi', kaynak: 'Banka' },
    { id: 'O-002', alici: 'Elektrik Dağıtım (GES Yedek)', tutar: 4800, vade: '2026-08-15', durum: 'onaylandi', kaynak: 'Banka' },
    { id: 'O-003', alici: 'Personel Maaşları (Ağustos)', tutar: 15000, vade: '2026-08-28', durum: 'planlandi', kaynak: 'Kasa' },
    { id: 'O-004', alici: 'Sigorta Primi (Tesis)', tutar: 7200, vade: '2026-08-20', durum: 'onaylandi', kaynak: 'Banka' },
  ]);

  // --- Banka Anlaşmaları (Finans Ajanı) ---
  const [bankaAnlasmalari, setBankaAnlasmalari] = useState<BankaAnlasmasi[]>([
    { id: 'B-001', banka: 'Ziraat Bankası', urun: 'Ticari Kredi Kartı', limit: 250000, faiz: '%2.1', durum: 'aktif' },
    { id: 'B-002', banka: 'İş Bankası', urun: 'KOBİ Kredi Hattı', limit: 500000, faiz: '%1.9', durum: 'beklemede' },
    { id: 'B-003', banka: 'Garanti BBVA', urun: 'e-Fatura Entegrasyonu', limit: 0, faiz: '—', durum: 'oneri' },
  ]);

  // --- IT Ajanı Talepleri ---
  const [itTalepleri, setItTalepleri] = useState<ItTalebi[]>([
    {
      id: 'IT-001', kaynak: 'Muhasebe Ajanı', talep: 'e-Fatura GİB entegrasyonu eksik',
      analiz: 'GİB e-fatura API bağlantısı kurulmalı, mali mühür sertifikası gerekli',
      onerilenCozum: 'e-Fatura modülü geliştirilecek: XML üretimi + GİB web servis entegrasyonu',
      durum: 'geliştirme',
    },
    {
      id: 'IT-002', kaynak: 'Finans Ajanı', talep: 'Otomatik ödeme hatırlatma sistemi yok',
      analiz: 'Vade tarihi yaklaşan ödemeler için bildirim mekanizması gerekiyor',
      onerilenCozum: 'Ödeme hatırlatma servisi: vade-3 gün öncesi e-posta + SMS bildirimi',
      durum: 'analiz',
    },
  ]);

  // --- Ajan Görev Geçmişi ---
  const [ajanGorevler, setAjanGorevler] = useState<AjanGorev[]>([
    { id: 'G-001', ajan: 'muhasebe', baslik: 'KDV Beyannamesi Hazırlığı', aciklama: 'Ağustos KDV matrahı hesaplandı, beyanname taslağı oluşturuldu', durum: 'tamamlandi', sonuc: '₺48,200 KDV matrahı, ₺9,640 ödenecek', zaman: '12:00' },
    { id: 'G-002', ajan: 'finans', baslik: 'Nakit Akışı Optimizasyonu', aciklama: 'Ağustos nakit akışı analiz edildi, ödeme önceliklendirmesi yapıldı', durum: 'tamamlandi', sonuc: '₺152,000 net nakit ihtiyacı tespit edildi', zaman: '12:05' },
    { id: 'G-003', ajan: 'it', baslik: 'e-Fatura Entegrasyon Talebi', aciklama: 'GİB uyumluluk kontrolünde eksik tespit edildi, IT ajanına iletildi', durum: 'tamamlandi', sonuc: 'IT-001 talebi oluşturuldu', zaman: '12:10' },
  ]);

  // ==========================================================================
  // AJAN ÇALIŞTIRMA FONKSİYONLARI
  // ==========================================================================
  const logEkle = (mesaj: string) => {
    setAjanLog((prev) => [`[${simdi()}] ${mesaj}`, ...prev].slice(0, 20));
  };

  const muhasebeAjaniniCalistir = () => {
    setAjanCalisiyor(true);
    logEkle('🧾 Muhasebe Ajanı: Mevzuat denetimi başlatıldı...');
    setTimeout(() => {
      // Mevzuatları güncelle: e-Fatura uyumluluğunu IT ajanına ilet
      setMevzuatlar((prev) =>
        prev.map((m) =>
          m.id === 'M-004'
            ? { ...m, durum: 'yaklasiyor', aciklama: 'GİB entegrasyonu IT ajanına iletildi (IT-001)' }
            : m
        )
      );
      setAjanGorevler((prev) => [
        {
          id: `G-${Date.now()}`, ajan: 'muhasebe', baslik: 'Mevzuat Denetimi Tamamlandı',
          aciklama: '5 mevzuat kontrol edildi, 1 uyumsuzluk tespit edildi',
          durum: 'tamamlandi', sonuc: 'e-Fatura entegrasyonu IT ajanına iletildi', zaman: simdi(),
        },
        ...prev,
      ]);
      logEkle('✅ Muhasebe Ajanı: Denetim tamamlandı. e-Fatura uyumsuzluğu IT ajanına iletildi.');
      setAjanCalisiyor(false);
    }, 1500);
  };

  const finansAjaniniCalistir = () => {
    setAjanCalisiyor(true);
    logEkle('💰 Finans Ajanı: Ödeme çizelgeleri ve banka anlaşmaları analiz ediliyor...');
    setTimeout(() => {
      // Ödeme çizelgelerini güncelle: vadesi yaklaşanları onayla
      setOdemeCizelgeleri((prev) =>
        prev.map((o) =>
          o.durum === 'planlandi' && o.vade <= '2026-08-20'
            ? { ...o, durum: 'onaylandi' }
            : o
        )
      );
      setAjanGorevler((prev) => [
        {
          id: `G-${Date.now()}`, ajan: 'finans', baslik: 'Ödeme Çizelgesi Optimizasyonu',
          aciklama: 'Vade tarihi yaklaşan ödemeler onaylandı, nakit akışı dengelendi',
          durum: 'tamamlandi', sonuc: '2 ödeme onaylandı, ₺12,000 nakit korundu', zaman: simdi(),
        },
        ...prev,
      ]);
      logEkle('✅ Finans Ajanı: Ödeme çizelgeleri optimize edildi. Banka anlaşmaları güncellendi.');
      setAjanCalisiyor(false);
    }, 1500);
  };

  const itAjaniniCalistir = () => {
    setAjanCalisiyor(true);
    logEkle('🤖 IT Ajanı: Gelen talepler analiz ediliyor, çözüm geliştiriliyor...');
    setTimeout(() => {
      setItTalepleri((prev) =>
        prev.map((t) =>
          t.durum === 'analiz'
            ? { ...t, durum: 'geliştirme', onerilenCozum: t.onerilenCozum + ' (modül geliştiriliyor)' }
            : t
        )
      );
      setAjanGorevler((prev) => [
        {
          id: `G-${Date.now()}`, ajan: 'it', baslik: 'IT Talepleri Analiz Edildi',
          aciklama: '2 talep analiz edildi, çözüm modülleri geliştirme aşamasına alındı',
          durum: 'tamamlandi', sonuc: 'e-Fatura + Ödeme Hatırlatma modülleri geliştiriliyor', zaman: simdi(),
        },
        ...prev,
      ]);
      logEkle('✅ IT Ajanı: Talepler analiz edildi. e-Fatura ve ödeme hatırlatma modülleri geliştiriliyor.');
      setAjanCalisiyor(false);
    }, 1500);
  };

  const ajanCalistir = () => {
    if (aktifAjan === 'muhasebe') muhasebeAjaniniCalistir();
    else if (aktifAjan === 'finans') finansAjaniniCalistir();
    else itAjaniniCalistir();
  };

  // ==========================================================================
  // STİL SABİTLERİ
  // ==========================================================================
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

  const ajanRenk: Record<AjanTip, string> = {
    muhasebe: '#00f2fe',
    finans: '#48bb78',
    it: '#9f7aea',
  };
  const ajanEmoji: Record<AjanTip, string> = {
    muhasebe: '🧾',
    finans: '💰',
    it: '🤖',
  };
  const ajanAd: Record<AjanTip, string> = {
    muhasebe: 'MUHASEBE AJANI',
    finans: 'FİNANS AJANI',
    it: 'IT AJANI',
  };

  const durumRenk = (d: string) =>
    d === 'uyumlu' || d === 'odendi' || d === 'tamamlandi' ? '#48bb78'
    : d === 'yaklasiyor' || d === 'onaylandi' || d === 'geliştirme' ? '#ecc94b'
    : d === 'gecikmis' || d === 'hata' ? '#f87171'
    : '#94a3b8';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* ===== OTONOM AJAN SİSTEMİ BAŞLIK ===== */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(159, 122, 234, 0.4), rgba(0, 242, 254, 0.15))',
          border: '1px solid rgba(159, 122, 234, 0.4)',
          borderRadius: '20px',
          padding: '20px 24px',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#fff', margin: 0 }}>
              🤖 OTONOM MUHASEBE & FİNANS AJAN SİSTEMİ
            </h2>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
              Mevzuatları otonom denetler, kendini günceller, ödemeleri ve faturaları yönetir, yetersiz kalırsa IT ajanına beyan eder
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {(['muhasebe', 'finans', 'it'] as AjanTip[]).map((a) => (
              <button key={a} onClick={() => setAktifAjan(a)} style={tabStyle(aktifAjan === a)}>
                {ajanEmoji[a]} {ajanAd[a]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ===== AKTİF AJAN PANELİ ===== */}
      <div style={{ ...cardStyle, borderLeft: `4px solid ${ajanRenk[aktifAjan]}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 'bold', color: ajanRenk[aktifAjan], margin: 0 }}>
              {ajanEmoji[aktifAjan]} {ajanAd[aktifAjan]}
            </h3>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
              {aktifAjan === 'muhasebe' && 'Vergi, SGK ve dijital mevzuatları otonom denetler, uyumsuzlukları tespit eder ve IT ajanına iletir.'}
              {aktifAjan === 'finans' && 'Ödeme çizelgelerini, banka anlaşmalarını ve nakit akışını otonom yönetir, optimizasyon yapar.'}
              {aktifAjan === 'it' && 'Muhasebe ve finans ajanlarının taleplerini analiz eder, eksik yazılımları geliştirir.'}
            </p>
          </div>
          <button
            onClick={ajanCalistir}
            disabled={ajanCalisiyor}
            style={{
              ...btnStyle,
              background: ajanCalisiyor ? 'rgba(255,255,255,0.1)' : `linear-gradient(135deg, ${ajanRenk[aktifAjan]}, #0f4c81)`,
              color: ajanCalisiyor ? '#94a3b8' : '#050811',
              minWidth: '180px',
            }}
          >
            {ajanCalisiyor ? '⏳ Otonom Çalışıyor...' : `▶ ${ajanAd[aktifAjan]} Çalıştır`}
          </button>
        </div>

        {/* Muhasebe Ajanı: Mevzuat Takibi */}
        {aktifAjan === 'muhasebe' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {mevzuatlar.map((m) => (
              <div key={m.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '12px 14px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '13px' }}>{m.ad}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{m.kategori} • Son Tarih: {m.sonTarih} • {m.aciklama}</div>
                </div>
                <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '20px', fontWeight: 'bold', background: `${durumRenk(m.durum)}22`, color: durumRenk(m.durum) }}>
                  {m.durum === 'uyumlu' ? '✅ Uyumlu' : m.durum === 'yaklasiyor' ? '⚠️ Yaklaşıyor' : '🚨 Gecikmiş'}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Finans Ajanı: Ödeme Çizelgeleri + Banka Anlaşmaları */}
        {aktifAjan === 'finans' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff', marginBottom: '10px' }}>📅 ÖDEME ÇİZELGELERİ</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {odemeCizelgeleri.map((o) => (
                  <div key={o.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '10px 14px', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '13px' }}>{o.alici}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>Vade: {o.vade} • Kaynak: {o.kaynak}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontWeight: 'bold', color: '#48bb78', fontSize: '14px' }}>{paraFormat(o.tutar)}</span>
                      <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '20px', fontWeight: 'bold', background: `${durumRenk(o.durum)}22`, color: durumRenk(o.durum) }}>
                        {o.durum === 'planlandi' ? '📋 Planlandı' : o.durum === 'onaylandi' ? '✅ Onaylandı' : '💸 Ödendi'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff', marginBottom: '10px' }}>🏦 BANKA ANLAŞMALARI</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {bankaAnlasmalari.map((b) => (
                  <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '10px 14px', flexWrap: 'wrap', gap: '8px' }}>
                    <div>
                      <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '13px' }}>{b.banka} • {b.urun}</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>Faiz: {b.faiz} {b.limit > 0 && `• Limit: ${paraFormat(b.limit)}`}</div>
                    </div>
                    <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '20px', fontWeight: 'bold', background: `${durumRenk(b.durum)}22`, color: durumRenk(b.durum) }}>
                      {b.durum === 'aktif' ? '✅ Aktif' : b.durum === 'beklemede' ? '⏳ Beklemede' : '💡 Öneri'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* IT Ajanı: Talepler */}
        {aktifAjan === 'it' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {itTalepleri.map((t) => (
              <div key={t.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                  <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '13px' }}>{t.id} • Kaynak: {t.kaynak}</div>
                  <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '20px', fontWeight: 'bold', background: `${durumRenk(t.durum)}22`, color: durumRenk(t.durum) }}>
                    {t.durum === 'analiz' ? '🔍 Analiz' : t.durum === 'geliştirme' ? '🛠️ Geliştirme' : '✅ Tamamlandı'}
                  </span>
                </div>
                <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '8px' }}>
                  <strong style={{ color: '#ecc94b' }}>Talep:</strong> {t.talep}
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                  <strong style={{ color: '#00f2fe' }}>Analiz:</strong> {t.analiz}
                </div>
                <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
                  <strong style={{ color: '#48bb78' }}>Çözüm:</strong> {t.onerilenCozum}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== AJAN GÖREV GEÇMİŞİ ===== */}
      <div style={cardStyle}>
        <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#fff', marginBottom: '14px' }}>📜 AJAN GÖREV GEÇMİŞİ</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {ajanGorevler.map((g) => (
            <div key={g.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '10px', padding: '10px 14px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '16px' }}>{ajanEmoji[g.ajan]}</span>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#fff', fontSize: '13px' }}>{g.baslik}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>{g.aciklama} • {g.zaman}</div>
                  {g.sonuc && <div style={{ fontSize: '11px', color: ajanRenk[g.ajan], marginTop: '2px' }}>→ {g.sonuc}</div>}
                </div>
              </div>
              <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '20px', fontWeight: 'bold', background: `${durumRenk(g.durum)}22`, color: durumRenk(g.durum) }}>
                {g.durum === 'tamamlandi' ? '✅ Tamamlandı' : g.durum === 'calisiyor' ? '⏳ Çalışıyor' : g.durum === 'hata' ? '🚨 Hata' : '⏸️ Beklemede'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* ===== CANLI AJAN LOG ===== */}
      <div style={{ ...cardStyle, background: 'rgba(0,0,0,0.4)' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#00f2fe', marginBottom: '14px' }}>⚡ CANLI AJAN LOG</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '200px', overflowY: 'auto' }}>
          {ajanLog.length === 0 && (
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>Henüz ajan çalıştırılmadı. Bir ajan seçip "Çalıştır" butonuna basın.</div>
          )}
          {ajanLog.map((log, i) => (
            <div key={i} style={{ fontSize: '12px', color: '#cbd5e1', fontFamily: 'monospace' }}>{log}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
