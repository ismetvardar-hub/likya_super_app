'use client';

import React, { useState } from 'react';

interface NodeDetails {
  key: string;
  name: string;
  color: string;
  badgeColor: string;
  icon: string;
  tagline: string;
  metrics: { label: string; value: string }[];
  liveStream: string[];
  actionBtnText: string;
}

export default function LikyaCoreOrchestratorTopology() {
  const [selectedNodeKey, setSelectedNodeKey] = useState<string>('fair');

  const nodes: Record<string, NodeDetails> = {
    fair: {
      key: 'fair',
      name: 'Likya Fuar & Deneyim Parkı',
      color: '#ecc94b',
      badgeColor: 'rgba(236, 201, 75, 0.2)',
      icon: '🟡',
      tagline: 'Karavan, Tiny House & "Try Before Buy" Canlı Deneyim Rezervasyonları',
      metrics: [
        { label: 'Aktif Karavan Parselleri', value: '18 / 24 Dolu (%75)' },
        { label: 'Tiny House Deneyim Konaklama', value: '8 Tiny House Aktif' },
        { label: 'Try Before Buy Talepleri', value: '14 Canlı Test Rezervasyonu' },
        { label: 'Güneş Panelli Otopark Şarjı', value: '12 E-Karavan Şarjda' },
      ],
      liveStream: [
        '🚐 [14:55:02] Parsel #04: Hymer E-Karavan giriş yaptı (Güneş şarjı başlatıldı).',
        '🏡 [14:52:18] Tiny House #02: "Sedir Ağacı Evi" için 2 günlük Try Before Buy onaylandı.',
        '🛠️ [14:48:30] Karavan su dolum otomatı 120L kaynak suyu ikmali yaptı.',
      ],
      actionBtnText: '🏕️ Karavan / Tiny House Rezervasyonu Aç',
    },
    stage: {
      key: 'stage',
      name: 'Likya Sahne & Etkinlik',
      color: '#3182ce',
      badgeColor: 'rgba(49, 130, 206, 0.2)',
      icon: '🔵',
      tagline: 'Amatör Biletleme, Antik Amfitiyatro & Dinamik QR Turnike Sistemi',
      metrics: [
        { label: 'Bahar Konseri Satılan Bilet', value: '1,250 / 1,500 Koltuk' },
        { label: 'Turnike Geçiş Hızı', value: '1.2 sn / Kişi (TOTP QR)' },
        { label: 'Amfitiyatro Akustik Seviye', value: '68.4 dB (Net & Temiz)' },
        { label: 'Bağımsız Sanatçı Gelir Payı', value: '%92 Sanatçıya Doğrudan' },
      ],
      liveStream: [
        '🎟️ [14:56:10] Turnike #1: Katılımcı Ahmet Y. dinamik QR ile geçiş yaptı.',
        '🎸 [14:50:00] Sahne #2: "Olympos Gençlik Korosu" amatör biletleme yayına alındı.',
        '🎧 [14:42:15] Akustik AI rüzgar filtresini devreye soktu.',
      ],
      actionBtnText: '🎟️ Yeni Konser / Tiyatro Etkinliği Tanımla',
    },
    social: {
      key: 'social',
      name: 'Likya Social & Community',
      color: '#9f7aea',
      badgeColor: 'rgba(159, 122, 234, 0.2)',
      icon: '🟣',
      tagline: 'Topluluk Çemberleri, Kullanıcı Etkinlikleri & Şifreli P2P Mesajlaşma',
      metrics: [
        { label: 'Aktif Topluluk Çemberleri', value: '34 İlgi Kulübü' },
        { label: 'Halkın Açtığı Etkinlikler', value: '12 Bu Hafta Sonu' },
        { label: 'P2P Uçtan Uca Şifreli Mesaj', value: '14,850 Mesaj/Gün' },
        { label: 'Gönüllü Ekip Üyeleri', value: '420 Eko-Vatandaş' },
      ],
      liveStream: [
        '💬 [14:54:12] "Likya Yolu Gece Yürüyüşçüleri" çemberine 8 yeni üye katıldı.',
        '🌱 [14:49:05] Zeynep K. "Plaj Temizliği & Kompost" halk etkinliği başlattı.',
        '📡 [14:40:22] Dağdaki gönüllü grubu BLE Mesh üzerinden konum paylaştı.',
      ],
      actionBtnText: '👥 Yeni Topluluk Kulübü Oluştur',
    },
    eco: {
      key: 'eco',
      name: 'Likya Eco-Impact & Care',
      color: '#e53e3e',
      badgeColor: 'rgba(229, 62, 62, 0.2)',
      icon: '🔴',
      tagline: 'Tamir Atölyesi (Repair Cafe), Upcycling İleri Dönüşüm & Şeffaf Bağış',
      metrics: [
        { label: 'Onarılan Cihaz & Eşya', value: '284 Adet (Bu Ay)' },
        { label: 'Önlenen E-Atık & Mobilya', value: '1.8 Ton Hurdaya Gitmedi' },
        { label: 'İleri Dönüşüm (Upcycling)', value: '64 Tasarım Ürünü' },
        { label: 'Askıda Eşya Bağış Havuzu', value: '₺42,500 Değerinde' },
      ],
      liveStream: [
        '🛠️ [14:55:40] Atölye #1: Dell Laptop batarya hücresi değişimi tamamlandı (Onarıldı).',
        '🎨 [14:51:10] Maker Lab: Kırık kaykay tahtası duvara asılabilir rafa dönüştürüldü.',
        '🎁 [14:46:00] Üniversite öğrencisine çalışma masası bağışı teslim edildi.',
      ],
      actionBtnText: '🛠️ Yeni Eşya Onarım Talebi Aç',
    },
    iot: {
      key: 'iot',
      name: 'Likya IoT & Saha Otomasyonu',
      color: '#38a169',
      badgeColor: 'rgba(56, 161, 105, 0.2)',
      icon: '🟢',
      tagline: 'Plaka Tanıma (ANPR), Otomatik Kapı/Turnike Röleleri & Akıllı Sayaçlar',
      metrics: [
        { label: 'ANPR Plaka Tanıma Doğruluğu', value: '%99.8 (0.4 sn Açılış)' },
        { label: 'Otomasyon Turnike & Bariyer', value: '16 IoT Röle Aktif' },
        { label: 'Akıllı Elektrik/Su Sayacı', value: '48 Dijital Düğüm' },
        { label: 'Otopark Doluluk Sensörü', value: '42 Boş / 120 Toplam' },
      ],
      liveStream: [
        '🚗 [14:56:45] Kuzey Kapısı: 07 LKY 777 plakalı araç otomatik tanındı ve bariyer açıldı.',
        '⚡ [14:53:20] Yaşam Merkezi akıllı elektrik sayacı: 14.2 kWh anlık tüketim.',
        '💧 [14:47:11] Su deposu IoT basınç sensörü optimum seviyede.',
      ],
      actionBtnText: '⚡ IoT Röle / Bariyer Manuel Tetikle',
    },
    wallet: {
      key: 'wallet',
      name: 'Likya Wallet & Escrow',
      color: '#e2e8f0',
      badgeColor: 'rgba(226, 232, 240, 0.2)',
      icon: '⚪',
      tagline: 'Ödeme Havuzu, Akıllı Sözleşme Escrow & Otomatik Komisyon Dağıtımı',
      metrics: [
        { label: 'Toplam Escrow Kilitli Fon', value: '₺340,000 (Güvende)' },
        { label: 'Dolaşımdaki Likya Coin', value: '840,000 LKY' },
        { label: 'Otomatik Komisyon Dağıtımı', value: '%96 Satıcı / %4 Holding' },
        { label: 'Anlık Mutabakat Süresi', value: '0.8 sn Blokzincir Onayı' },
      ],
      liveStream: [
        '💎 [14:57:00] Escrow Kilit: 5L Zeytinyağı takası için 880 TL havuzda bloke edildi.',
        '💸 [14:54:30] Tamamlanan sipariş: Ahmet Usta cüzdanına ₺320 aktarıldı (%4 komisyon ayrıldı).',
        '🪙 [14:45:15] Öğrenci cüzdanına +15 LKY yürüme ödülü yüklendi.',
      ],
      actionBtnText: '💎 Escrow Fon Mutabakatını İncele',
    },
  };

  const activeNode = nodes[selectedNodeKey];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Üst Mimari Başlığı */}
      <div
        style={{
          background: 'linear-gradient(135deg, rgba(15, 76, 129, 0.6), rgba(0, 242, 254, 0.2))',
          border: '2px solid var(--accent-cyan)',
          borderRadius: '24px',
          padding: '28px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '20px',
          boxShadow: '0 20px 50px rgba(0, 242, 254, 0.2)',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, #00f2fe 0%, #0f4c81 80%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                boxShadow: '0 0 25px #00f2fe',
                animation: 'pulse 2s infinite',
              }}
            >
              🏛️
            </div>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: '900', color: 'white', letterSpacing: '-0.5px' }}>
                MERKEZ: LİKYA CORE (MASTER ORCHESTRATOR)
              </h1>
              <p style={{ color: '#cbd5e1', fontSize: '13px', marginTop: '2px' }}>
                6 Stratejik Düğümle Çevrili Çok Katmanlı Otonom Ekosistem Topolojisi
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <div style={{ padding: '8px 16px', background: 'rgba(72, 187, 120, 0.2)', border: '1px solid var(--accent-green)', borderRadius: '12px', textAlign: 'center' }}>
            <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>Topoloji Durumu</div>
            <div style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--accent-green)' }}>6/6 Düğüm Senkronize ⚡</div>
          </div>
        </div>
      </div>

      {/* Hexagonal Düğüm Seçim Alanı */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
        {[
          { key: 'fair', label: 'Likya Fuar & Park', icon: '🟡', color: '#ecc94b' },
          { key: 'stage', label: 'Likya Sahne & Etkinlik', icon: '🔵', color: '#3182ce' },
          { key: 'social', label: 'Likya Social & Topluluk', icon: '🟣', color: '#9f7aea' },
          { key: 'eco', label: 'Likya Eco-Impact', icon: '🔴', color: '#e53e3e' },
          { key: 'iot', label: 'Likya IoT & Saha', icon: '🟢', color: '#38a169' },
          { key: 'wallet', label: 'Likya Wallet & Escrow', icon: '⚪', color: '#e2e8f0' },
        ].map((item) => {
          const isSelected = selectedNodeKey === item.key;
          return (
            <div
              key={item.key}
              onClick={() => setSelectedNodeKey(item.key)}
              style={{
                background: isSelected ? 'rgba(255,255,255,0.1)' : 'var(--card-bg)',
                border: isSelected ? `2px solid ${item.color}` : '1px solid var(--border-color)',
                borderRadius: '18px',
                padding: '16px',
                cursor: 'pointer',
                textAlign: 'center',
                boxShadow: isSelected ? `0 0 20px ${item.color}44` : 'none',
                transform: isSelected ? 'translateY(-3px)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ fontSize: '28px', marginBottom: '6px' }}>{item.icon}</div>
              <div style={{ fontSize: '13px', fontWeight: 'bold', color: isSelected ? item.color : 'white' }}>{item.label}</div>
              <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px' }}>
                {isSelected ? '● CANLI İZLENİYOR' : 'Düğüme Tıkla'}
              </div>
            </div>
          );
        })}
      </div>

      {/* Seçili Düğüm Detay & Telemetri Masası */}
      <div
        style={{
          background: 'var(--card-bg)',
          border: `1px solid ${activeNode.color}`,
          borderRadius: '24px',
          padding: '28px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
          boxShadow: `0 10px 30px ${activeNode.color}22`,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '24px' }}>{activeNode.icon}</span>
              <h2 style={{ fontSize: '20px', fontWeight: '800', color: 'white' }}>{activeNode.name}</h2>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>{activeNode.tagline}</p>
          </div>

          <button
            onClick={() => alert(`"${activeNode.name}" için yönetim paneli operasyonu tetiklendi!`)}
            style={{
              background: `linear-gradient(135deg, var(--primary-blue), ${activeNode.color})`,
              border: 'none',
              color: 'white',
              padding: '10px 20px',
              borderRadius: '12px',
              fontWeight: 'bold',
              fontSize: '13px',
              cursor: 'pointer',
              boxShadow: `0 6px 16px ${activeNode.color}44`,
            }}
          >
            {activeNode.actionBtnText}
          </button>
        </div>

        {/* 4 Ana Metrik Kutusu */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          {activeNode.metrics.map((m, idx) => (
            <div key={idx} style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '14px', padding: '16px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{m.label}</div>
              <div style={{ fontSize: '16px', fontWeight: 'bold', color: activeNode.color, marginTop: '4px' }}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* Canlı Saha Akışı & Olay Günlüğü */}
        <div style={{ background: 'rgba(0,0,0,0.4)', borderRadius: '16px', padding: '18px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--accent-cyan)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span className="pulse-dot"></span>
            <span>CANLI DÜĞÜM SAHA AKIŞI & TELEMETRİSİ</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {activeNode.liveStream.map((log, idx) => (
              <div key={idx} style={{ fontSize: '12px', color: '#e2e8f0', fontFamily: 'system-ui', padding: '6px 10px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
                {log}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
