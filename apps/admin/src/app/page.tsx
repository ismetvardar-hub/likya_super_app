'use client';

import React, { useState } from 'react';
import CEOCommandChat from './components/CEOCommandChat';
import AccountingModule from './components/AccountingModule';
import AutonomousFinanceAgents from './components/AutonomousFinanceAgents';
import HoldingAgentTeams from './components/HoldingAgentTeams';
import GitHubRepoIntegration from './components/GitHubRepoIntegration';
import AgentReachSkillsIntegration from './components/AgentReachSkillsIntegration';
import PaymentIntegration from './components/PaymentIntegration';
import QRBiletSistemi from './components/QRBiletSistemi';
import IoTSensorMap from './components/IoTSensorMap';
import AIAgentAutonomousController from './components/AIAgentAutonomousController';
import SupplierManagement from './components/SupplierManagement';
import Park3DTwin from './components/Park3DTwin';
import DynamicLoyaltyPricing from './components/DynamicLoyaltyPricing';
import SystemStressTestAndEdgeController from './components/SystemStressTestAndEdgeController';
import MonitoringPanel from './components/MonitoringPanel';
import LikyaCrew from './components/LikyaCrew';
import SmartCaravanPark from './components/SmartCaravanPark';
import SmartTentStore from './components/SmartTentStore';
import LikyaMarketplace from './components/LikyaMarketplace';
import RoomOnlyConcept from './components/RoomOnlyConcept';
import AthletePerformanceAI from './components/AthletePerformanceAI';
import StrategicRiskShield from './components/StrategicRiskShield';
import SmartDestinationEngine from './components/SmartDestinationEngine';


export default function LikyaCampusCommandSystem() {

  // 4 Ana Rol: patron (CEO), tenant (Alt Kiracı / 16 Dükkan), staff (Saha Çalışanı), customer (Müşteri)
  const [activeRole, setActiveRole] = useState<'patron' | 'tenant' | 'staff' | 'customer'>('patron');
  const [activeSubTab, setActiveSubTab] = useState<string>('twin');

  // Patron / CEO Finansal Canlı Verileri
  const [financials] = useState({
    accommodationProfit: '₺184,500', // %100 Net Kâr
    tryBeforeBuyCommission: '₺36,200', // %3 - %15 Satış Komisyonu
    ticketCommission: '₺14,800', // %10 - %15 Bilet Komisyonu
    tenantRevenueShare: '₺28,900', // 16 Dükkan Ciro Payı
    clubCharityFund: '₺12,400', // Amatör Spor Kulübüne Aktarılan Upcycling Fonu
    gesGenerationKw: '142.8 kW',
    greyWaterRecycledL: '18,500 L',
  });

  // Alt Kiracı (16 Dükkan) Canlı Durumu
  const [shops] = useState([
    { id: 'D-01', name: 'Likya Doğa & Organik Market', category: 'Gıda & Doğa', dailyTurnover: '₺8,400', sharePct: '%10 (₺840)' },
    { id: 'D-02', name: 'Outdoor Kiralama & E-Bike', category: 'Spor & Ekipman', dailyTurnover: '₺12,200', sharePct: '%12 (₺1,464)' },
    { id: 'D-03', name: 'Sedir Cafe & Bistro', category: 'Yeme & İçme', dailyTurnover: '₺16,800', sharePct: '%8 (₺1,344)' },
    { id: 'D-04', name: 'Pod-Ofis Coworking', category: 'Hizmet', dailyTurnover: '₺4,500', sharePct: '%15 (₺675)' },
  ]);

  // Çalışan Saha Görevleri
  const [tasks, setTasks] = useState([
    { id: 'TSK-101', title: 'Parsel #04: Hymer Karavan Çıkış & Temizlik Onayı', zone: 'Karavan Parkı', status: 'Beklemede', priority: 'Yüksek', qrCode: 'QR-PARSEL-04' },
    { id: 'TSK-102', title: 'Padel Kortu #1 Ağ ve Zemin Kontrolü', zone: 'Spor Kompleksi', status: 'Beklemede', priority: 'Normal', qrCode: 'QR-PADEL-01' },
    { id: 'TSK-103', title: 'GES Canopi Panel Toz & Voltaj Ölçümü', zone: 'Eco-Tech Center', status: 'Tamamlandı', priority: 'Normal', qrCode: 'QR-GES-01' },
  ]);

  // AI Vision Fotoğraf Tarama Simülatörü
  const [cvScanning, setCvScanning] = useState(false);
  const [cvResult, setCvResult] = useState<{ brand: string; model: string; conf: string; value: string } | null>(null);

  const handleRunCvScan = () => {
    setCvScanning(true);
    setTimeout(() => {
      setCvScanning(false);
      setCvResult({
        brand: 'Quechua / Decathlon',
        model: 'Arpenaz 4.1 F&B Aile Kamp Çadırı',
        conf: '%98.4 Doğruluk',
        value: '₺4,200 (2. El Piyasa Değeri)',
      });
    }, 1200);
  };

  const handleCompleteTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, status: 'Tamamlandı (QR Doğrulandı)' } : t));
  };

  return (
    <main style={{ minHeight: '100vh', background: '#070b14', color: '#f8fafc', padding: '24px', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      {/* HIZLI ROL GEÇİŞ ÇUBUĞU (QUICK NAVIGATION BAR) */}
      <div
        style={{
          background: 'rgba(13, 19, 34, 0.9)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '18px',
          padding: '10px 14px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '10px',
          flexWrap: 'wrap',
          marginBottom: '20px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.4)',
        }}
      >
        <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 'bold', marginRight: '4px' }}>⚡ HIZLI GEÇİŞ:</span>
        <a
          href="/"
          style={{ padding: '8px 14px', borderRadius: '10px', background: 'rgba(224, 122, 95, 0.15)', border: '1px solid #e07a5f', color: '#e07a5f', fontSize: '12px', fontWeight: 'bold', textDecoration: 'none', cursor: 'pointer' }}
        >
          🔴 CEO Dashboard
        </a>
        <a
          href="/tenant"
          style={{ padding: '8px 14px', borderRadius: '10px', background: 'rgba(0, 242, 254, 0.15)', border: '1px solid #00f2fe', color: '#00f2fe', fontSize: '12px', fontWeight: 'bold', textDecoration: 'none', cursor: 'pointer' }}
        >
          🔵 16 Dükkan Paneli
        </a>
        <a
          href="/staff"
          style={{ padding: '8px 14px', borderRadius: '10px', background: 'rgba(236, 201, 75, 0.15)', border: '1px solid #ecc94b', color: '#ecc94b', fontSize: '12px', fontWeight: 'bold', textDecoration: 'none', cursor: 'pointer' }}
        >
          🟡 Saha & IoT Personeli
        </a>
        <a
          href="/customer"
          style={{ padding: '8px 14px', borderRadius: '10px', background: 'rgba(72, 187, 120, 0.15)', border: '1px solid #48bb78', color: '#48bb78', fontSize: '12px', fontWeight: 'bold', textDecoration: 'none', cursor: 'pointer' }}
        >
          🟢 Müşteri Süper Uygulaması
        </a>
      </div>

      {/* ÜST BAŞLIK & ROL DEĞİŞTİRİCİ BAR */}
      <header
        style={{
          background: 'linear-gradient(135deg, rgba(15, 76, 129, 0.7), rgba(0, 242, 254, 0.2))',
          border: '1px solid rgba(0, 242, 254, 0.3)',
          borderRadius: '24px',
          padding: '24px 28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
          marginBottom: '24px',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '28px' }}>🌲</span>
            <div>
              <h1 style={{ fontSize: '22px', fontWeight: '900', letterSpacing: '-0.5px', color: '#fff' }}>
                LİKYA AÇIKHAVA İNOVASYON, KAMP & YAŞAM KAMPÜSÜ
              </h1>
              <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '2px' }}>
                30-35 Dönüm Otonom Deneyim Parkı (Experiential Retail & Eko-Turizm) • Sıfır Sermaye Modeli
              </p>
            </div>
          </div>
        </div>

        {/* 4 ROL SEÇİCİ SEKMELER */}
        <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.4)', padding: '6px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
          {[
            { key: 'patron', label: '🔴 PATRON (CEO)', desc: '3D Twin & Gelir' },
            { key: 'tenant', label: '🔵 ALT KİRACI', desc: '16 Dükkan & POS' },
            { key: 'staff', label: '🟡 ÇALIŞAN', desc: 'Saha & QR Devriye' },
            { key: 'customer', label: '🟢 MÜŞTERİ', desc: 'Deneyim & Bilet' },
          ].map((role) => {
            const isSelected = activeRole === role.key;
            return (
              <button
                key={role.key}
                onClick={() => {
                  setActiveRole(role.key as any);
                  setActiveSubTab(role.key === 'patron' ? 'twin' : role.key === 'tenant' ? 'pos' : role.key === 'staff' ? 'tasks' : 'try_buy');
                }}
                style={{
                  padding: '10px 16px',
                  borderRadius: '12px',
                  border: isSelected ? '1px solid #00f2fe' : '1px solid transparent',
                  background: isSelected ? 'linear-gradient(135deg, #0f4c81, #00f2fe)' : 'transparent',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: isSelected ? 'bold' : '600',
                  fontSize: '13px',
                  transition: 'all 0.15s ease',
                  boxShadow: isSelected ? '0 4px 15px rgba(0, 242, 254, 0.3)' : 'none',
                }}
              >
                {role.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 🔴 1. PATRON (CEO) MODÜLÜ                                                 */}
      {/* ========================================================================= */}
      {activeRole === 'patron' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Finansal Gelir Modeli Metrikleri (Proje Dosyası Birebir Karşılığı) */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', padding: '20px' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold' }}>KONAKLAMA GELİRİ (%100 NET KÂR)</div>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#48bb78', marginTop: '6px' }}>{financials.accommodationProfit}</div>
              <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '4px' }}>40-50 Parsel Karavan & Tiny House</div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', padding: '20px' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold' }}>"TRY BEFORE BUY" SATIŞ KOMİSYONU (%3 - %15)</div>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#00f2fe', marginTop: '6px' }}>{financials.tryBeforeBuyCommission}</div>
              <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '4px' }}>Test Edip Satın Alınan Araç/Ekipman</div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', padding: '20px' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold' }}>SAHNE & BİLET KOMİSYONU (%10 - %15)</div>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#ecc94b', marginTop: '6px' }}>{financials.ticketCommission}</div>
              <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '4px' }}>Amfitiyatro Amatör Gösteriler</div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', padding: '20px' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold' }}>16 DÜKKAN CİRO PAYI (%8 - %15)</div>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#e07a5f', marginTop: '6px' }}>{financials.tenantRevenueShare}</div>
              <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '4px' }}>Bistro, Market, Kiralama, Coworking</div>
            </div>

            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '18px', padding: '20px' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold' }}>AMATÖR SPOR KULÜBÜ FONU (UPCYCLING)</div>
              <div style={{ fontSize: '24px', fontWeight: '900', color: '#9f7aea', marginTop: '6px' }}>{financials.clubCharityFund}</div>
              <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '4px' }}>Tamir Edilen Eşyaların Satış Geliri</div>
            </div>
          </div>

          {/* 30-35 Dönüm 3D Digital Twin Tesis Haritası */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff' }}>
                  🗺️ 30-35 DÖNÜM CANLI DİJİTAL İKİZ SAHA HARİTASI (5 ANA BÖLGE)
                </h2>
                <p style={{ fontSize: '12px', color: '#94a3b8' }}>Milli Emlak / Orman Tahsisli Arazinin Gerçek Zamanlı IoT ve Doluluk Durumu</p>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span style={{ padding: '6px 12px', background: 'rgba(72, 187, 120, 0.15)', color: '#48bb78', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' }}>
                  ☀️ GES: {financials.gesGenerationKw} Canlı
                </span>
                <span style={{ padding: '6px 12px', background: 'rgba(0, 242, 254, 0.15)', color: '#00f2fe', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' }}>
                  💧 Gri Su: {financials.greyWaterRecycledL}
                </span>
              </div>
            </div>

            {/* 5 Tesis Alanının İnteraktif Blokları */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px' }}>
              <div style={{ background: 'rgba(0, 242, 254, 0.08)', border: '1px solid #00f2fe', borderRadius: '16px', padding: '16px' }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#00f2fe' }}>1. Karavan & Tiny House Showroom</div>
                <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '6px' }}>42 Parsel Dolu / 48 Toplam (%87.5)</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>14 Müşteri "Try Before Buy" Test Konaklamasında</div>
              </div>

              <div style={{ background: 'rgba(236, 201, 75, 0.08)', border: '1px solid #ecc94b', borderRadius: '16px', padding: '16px' }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#ecc94b' }}>2. Kültür & Sanat Amfitiyatrosu</div>
                <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '6px' }}>500 Kişilik Sahne • Akustik Hazır</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Bu Akşam: "Olympos Gençlik Stand-Up" (380 Bilet Satıldı)</div>
              </div>

              <div style={{ background: 'rgba(72, 187, 120, 0.08)', border: '1px solid #48bb78', borderRadius: '16px', padding: '16px' }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#48bb78' }}>3. Spor & Biyomekanik Kompleksi</div>
                <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '6px' }}>2 Padel, 1 Tenis, Tırmanış, Sauna & Ice Bath</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>3D Biyomekanik Kameralar: 4 Sporcu Analiz Ediliyor</div>
              </div>

              <div style={{ background: 'rgba(224, 122, 95, 0.08)', border: '1px solid #e07a5f', borderRadius: '16px', padding: '16px' }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#e07a5f' }}>4. Ticari Yaşam Alanı (16 Dükkan)</div>
                <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '6px' }}>16 Dükkanın 16'sı Aktif Faaliyette</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Bistro, Doğa Marketi, Outdoor Kiralama, Upcycling Lab</div>
              </div>

              <div style={{ background: 'rgba(159, 122, 234, 0.08)', border: '1px solid #9f7aea', borderRadius: '16px', padding: '16px' }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#9f7aea' }}>5. Eco-Tech & Doğa Sistemleri</div>
                <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '6px' }}>Canopi GES, Gri Su Arıtma, Kompost Reaktörü</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>Sponsor Enerji Markalarının Canlı Referans Parkuru</div>
              </div>
            </div>
          </div>

          {/* 📒 ÖN MUHASEBE & FİNANS MODÜLÜ */}
          <AccountingModule />

          {/* 🤖 OTONOM MUHASEBE & FİNANS AJANLARI */}
          <AutonomousFinanceAgents />

          {/* 🏢 HOLDİNG OTONOM AJAN TAKIMLARI */}
          <HoldingAgentTeams />

          {/* 🌐 AGENT REACH & SKILLS ENTEGRASYON ANALİZİ */}
          <AgentReachSkillsIntegration />

          {/* 💳 ÖDEME ENTEGRASYONU (iyzico / PayTR / POS) */}
          <PaymentIntegration />

          {/* 🎟️ QR BİLET SİSTEMİ */}
          <QRBiletSistemi />

          {/* 📡 IoT SENSÖR & CANLI PARK ISI HARİTASI */}
          <IoTSensorMap />

          {/* 🤖 L2-L3 AI AJAN OTONOMİ KONTROL PANELİ */}
          <AIAgentAutonomousController />

          {/* 🚚 OTONOM TEDARİKÇİ & REÇETE PORTALI */}
          <SupplierManagement />

          {/* 🏗️ 3D PARK TWIN & SPATIAL NAVIGATION */}
          <Park3DTwin />

          {/* 🏆 DİNAMİK SADAKAT & FİYATLANDIRMA MİMARİSİ */}
          <DynamicLoyaltyPricing />

          {/* ⚙️ SİSTEM STRES TESTİ & EDGE FUNCTIONS */}
          <SystemStressTestAndEdgeController />

          {/* 📊 LOGLAMA & İZLEME PANELİ */}
          <MonitoringPanel />

          {/* 👥 LİKYA CREW - DİNAMİK PERSONEL OPERASYONU */}
          <LikyaCrew />

          {/* 🚐 SMART CARAVAN & PARK - KULLANDIKÇA ÖDE */}
          <SmartCaravanPark />

          {/* 🎪 TENT & EXPERIENCE STORE - DENEYİMLE-SATIN AL */}
          <SmartTentStore />

          {/* 🏪 LİKYA OUTDOOR SHOWROOM & PHYGITAL PAZARYERİ */}
          <LikyaMarketplace />

          {/* 🏡 ROOM ONLY - SADECE ODA & LİKYA ÇARŞI */}
          <RoomOnlyConcept />

          {/* 🏃 ATHLETE AI & BIOMETRIC PERFORMANCE SYSTEM */}
          <AthletePerformanceAI />

          {/* 🛡️ STRATEJİK RİSK KALKANI & KRİTİK GÖREV YÖNETİMİ */}
          <StrategicRiskShield />

          {/* ✨ SMART DESTINATION ENGINE - GELECEK VİZYONU */}
          <SmartDestinationEngine />
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🔵 2. ALT KİRACI (16 DÜKKAN & ÜRETİCİ) MODÜLÜ                              */}

      {/* ========================================================================= */}
      {activeRole === 'tenant' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {/* Hızlı POS Satış Terminali */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#00f2fe', marginBottom: '12px' }}>
                💳 DÜKKAN POS KASA & SİPARİŞ TERMİNALİ
              </h2>
              <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '16px' }}>
                Likya Cüzdan QR veya Kredi Kartı ile anında tahsilat yapın. Ciro payı otomatik holding havuzuna ayrılır.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <input
                  type="text"
                  placeholder="Satış Tutarı (₺)"
                  defaultValue="250.00"
                  style={{ padding: '12px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', fontSize: '14px' }}
                />
                <button
                  onClick={() => alert('₺250.00 Satış Başarılı! %10 (₺25.00) Ciro Payı Ayrıldı, ₺225.00 Dükkan Hesabına Aktarıldı.')}
                  style={{ background: 'linear-gradient(135deg, #0f4c81, #00f2fe)', border: 'none', color: '#fff', padding: '12px', borderRadius: '10px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
                >
                  ⚡ Müşteri QR Kodundan Tahsil Et
                </button>
              </div>
            </div>

            {/* 16 Dükkan Canlı Satış ve Ciro Payı Tablosu */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', marginBottom: '12px' }}>
                📊 16 DÜKKAN ANLIK CİRO & TESİS PAYI
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {shops.map((s) => (
                  <div key={s.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>{s.name} ({s.id})</div>
                      <div style={{ fontSize: '11px', color: '#94a3b8' }}>{s.category}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#48bb78' }}>{s.dailyTurnover}</div>
                      <div style={{ fontSize: '10px', color: '#00f2fe' }}>Kampüs Payı: {s.sharePct}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🟡 3. ÇALIŞAN (SAHA OPERASYON & GÜVENLİK) MODÜLÜ                           */}
      {/* ========================================================================= */}
      {activeRole === 'staff' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#ecc94b' }}>
                  📋 OTONOM SAHA GÖREV LİSTESİ & QR KONTROL NOKTALARI
                </h2>
                <p style={{ fontSize: '12px', color: '#94a3b8' }}>
                  Saha personeli fiziki noktadaki QR kodunu taratarak görevi ve sayaç değerini onaylar.
                </p>
              </div>
              <button
                onClick={() => alert('Kuzey Kapısı ANPR Bariyeri manuel olarak 15 saniyeliğine açıldı.')}
                style={{ background: 'rgba(236, 201, 75, 0.15)', border: '1px solid #ecc94b', color: '#ecc94b', padding: '8px 14px', borderRadius: '10px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
              >
                🚗 Manuel Kapı / Bariyer Aç
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {tasks.map((t) => (
                <div key={t.id} style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>{t.title}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                      Bölge: <strong>{t.zone}</strong> • Kontrol Kodu: <code style={{ color: '#00f2fe' }}>{t.qrCode}</code>
                    </div>
                  </div>
                  <div>
                    {t.status === 'Beklemede' ? (
                      <button
                        onClick={() => handleCompleteTask(t.id)}
                        style={{ background: '#ecc94b', color: '#000', border: 'none', padding: '8px 14px', borderRadius: '10px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
                      >
                        📷 QR Tara & Onayla
                      </button>
                    ) : (
                      <span style={{ color: '#48bb78', fontWeight: 'bold', fontSize: '12px' }}>✅ {t.status}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 🟢 4. MÜŞTERİ (SAHA DENEYİMİ & BİLET) MODÜLÜ                              */}
      {/* ========================================================================= */}
      {activeRole === 'customer' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {/* Showroom Karavan / Tiny House "Try Before Buy" */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#48bb78', marginBottom: '10px' }}>
                🚐 "TRY BEFORE BUY" SHOWROOM DENEYİMİ
              </h2>
              <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '14px' }}>
                Üreticilerin sergilediği karavan veya Tiny House'larda 1-2 gece konaklayarak test edin. Beğenirseniz doğrudan satın alın!
              </p>
              <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '14px' }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>Hymer Grand Canyon S 4x4 E-Karavan</div>
                <div style={{ fontSize: '12px', color: '#48bb78', marginTop: '4px' }}>Test Konaklama: ₺1,200/Gece • Satış Fiyatı: ₺3,450,000</div>
                <div style={{ display: 'flex', gap: '10px', marginTop: '12px' }}>
                  <button
                    onClick={() => alert('Parsel #04 için 2 Gece "Try Before Buy" Test Konaklamanız Rezerve Edildi!')}
                    style={{ flex: 1, background: '#48bb78', border: 'none', color: '#000', padding: '10px', borderRadius: '10px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
                  >
                    🏕️ Test Et / Kirala
                  </button>
                  <button
                    onClick={() => alert('Üreticiye doğrudan satın alma talebiniz iletildi. Kampüs %8 komisyonu Escrow havuzunda güvenceye alındı.')}
                    style={{ flex: 1, background: '#0f4c81', border: '1px solid #00f2fe', color: '#fff', padding: '10px', borderRadius: '10px', fontWeight: 'bold', fontSize: '12px', cursor: 'pointer' }}
                  >
                    🛒 Kapıma Satın Al
                  </button>
                </div>
              </div>
            </div>

            {/* Spor & Biyomekanik Gelişim Karnesi (AI Computer Vision) */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#00f2fe', marginBottom: '10px' }}>
                🎾 3D BİYOMEKANİK GELİŞİM KARNESİ
              </h2>
              <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '14px' }}>
                Padel ve Tenis kortundaki akıllı kameralar vuruş açınızı ve reaksiyon hızınızı otomatik analiz eder.
              </p>
              <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '14px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '13px', color: '#fff', fontWeight: 'bold' }}>Forehand Vuruş Doğruluğu:</span>
                  <span style={{ fontSize: '13px', color: '#48bb78', fontWeight: 'bold' }}>%88.4 (Çok İyi)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
                  <span style={{ fontSize: '13px', color: '#fff', fontWeight: 'bold' }}>Reaksiyon Süresi:</span>
                  <span style={{ fontSize: '13px', color: '#00f2fe', fontWeight: 'bold' }}>240 ms</span>
                </div>
                <div style={{ fontSize: '11px', color: '#e07a5f', marginTop: '10px' }}>
                  💡 AI Antrenör Notu: Geri vuruşlarda raket başını 4 derece daha erken indirin.
                </div>
              </div>
            </div>

            {/* AI Vision 2. El Pazaryeri Tarama Modülü */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#ecc94b', marginBottom: '10px' }}>
                👁️ AI COMPUTER VISION İLE 2. EL MODEL TANIMA
              </h2>
              <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '14px' }}>
                Satmak veya bağışlamak istediğiniz ekipmanın fotoğrafını yükleyin, yapay zeka marka/modelini 5 saniyede tespit etsin.
              </p>

              <button
                onClick={handleRunCvScan}
                disabled={cvScanning}
                style={{ width: '100%', background: 'linear-gradient(135deg, #0f4c81, #ecc94b)', border: 'none', color: '#000', padding: '12px', borderRadius: '10px', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}
              >
                {cvScanning ? '⏳ AI Fotoğrafı Analiz Ediyor...' : '📸 Ekipman Fotoğrafı Tara (AI Vision)'}
              </button>

              {cvResult && (
                <div style={{ marginTop: '14px', background: 'rgba(0,0,0,0.4)', padding: '12px', borderRadius: '12px', border: '1px solid #ecc94b' }}>
                  <div style={{ fontSize: '12px', color: '#ecc94b', fontWeight: 'bold' }}>✅ AI TESPİT SONUCU:</div>
                  <div style={{ fontSize: '13px', color: '#fff', marginTop: '4px' }}><strong>{cvResult.brand}</strong> - {cvResult.model}</div>
                  <div style={{ fontSize: '11px', color: '#48bb78', marginTop: '2px' }}>{cvResult.conf} • {cvResult.value}</div>
                </div>
              )}
            </div>

            {/* Upcycling & Amatör Spor Kulübü Şeffaf Bağış Fonu */}
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '24px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#9f7aea', marginBottom: '10px' }}>
                🛠️ UPCYCLING LAB & AMATÖR SPOR KULÜBÜ FONU
              </h2>
              <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '14px' }}>
                Bağışlanan hasarlı müzik ve spor aletleri atölyede onarılır. Satışından elde edilen gelir doğrudan genç sporcuların ekipman havuzuna aktarılır.
              </p>
              <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '14px' }}>
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>Tamirde: Dağ Bisikleti (Shimano Vites Değişimi)</div>
                <div style={{ fontSize: '11px', color: '#9f7aea', marginTop: '4px' }}>Hedef Fon: ₺3,200 ➔ Likya Gençlik Voleybol Takımına Dizlik Desteği</div>
                <button
                  onClick={() => alert('Onarım destek talebiniz veya eşya bağışınız kaydedildi! Teşekkür ederiz.')}
                  style={{ marginTop: '10px', width: '100%', background: 'rgba(159, 122, 234, 0.2)', border: '1px solid #9f7aea', color: '#fff', padding: '8px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  🎁 Eski Ekipmanımı Bağışla / Onarıma Bırak
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CEO KOMUT MERKEZİ - SESLİ & YAZILI CHAT BOX */}
      <CEOCommandChat />
    </main>
  );
}

