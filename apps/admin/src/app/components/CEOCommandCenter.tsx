'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, LayoutDashboard, Map, Cpu, Users, CreditCard, Shield, Megaphone, Gift, Building2, Activity, Boxes, TrendingUp, Wrench, HeartPulse, Home, Store, Tent, Car, Trophy, Sparkles, Scale, Bot } from 'lucide-react';

// ============================================================================
// LİKYA CEO COMMAND CENTER - 2 SAYFALI SPLIT LAYOUT
// Sol: Açılır/Kapanır Modül Menüsü (Sidebar)
// Sağ: Odaklanmış Likya CEO Sohbet Odası (Dedicated Chat Workspace)
// ============================================================================

interface ModuleItem {
  id: string;
  name: string;
  icon: React.ReactNode;
  color: string;
  description: string;
}

const MODULES: ModuleItem[] = [
  { id: 'twin', name: '3D Park Twin', icon: <Map size={16} />, color: '#00f2fe', description: '30-35 Dönüm dijital ikiz' },
  { id: 'iot', name: 'IoT Sensör Haritası', icon: <Activity size={16} />, color: '#48bb78', description: 'Canlı ısı haritası' },
  { id: 'ai', name: 'AI Otonom Kontrol', icon: <Cpu size={16} />, color: '#9f7aea', description: 'Revenue & Occupancy AI' },
  { id: 'crew', name: 'Likya Crew', icon: <Users size={16} />, color: '#ecc94b', description: 'Personel operasyonu' },
  { id: 'payment', name: 'Ödeme Entegrasyonu', icon: <CreditCard size={16} />, color: '#f27a1a', description: 'İyzico / POS' },
  { id: 'security', name: 'Güvenlik Ajanı', icon: <Shield size={16} />, color: '#e07a5f', description: 'Olay yönetimi' },
  { id: 'marketing', name: 'Auto-Marketing', icon: <Megaphone size={16} />, color: '#f59e0b', description: 'Reklam & kampanya' },
  { id: 'gift', name: 'Daze-Gift', icon: <Gift size={16} />, color: '#fbbf24', description: 'İkram sistemi' },
  { id: 'dept', name: 'Departman Ajanları', icon: <Building2 size={16} />, color: '#a78bfa', description: 'Legal, Guest, Energy, Vendor' },
  { id: 'hr', name: 'HR & Bordro', icon: <HeartPulse size={16} />, color: '#f472b6', description: 'Özlük hakları' },
  { id: 'facility', name: 'Tesis Bakım', icon: <Wrench size={16} />, color: '#60a5fa', description: 'Arıza yönetimi' },
  { id: 'caravan', name: 'Karavan Parkı', icon: <Car size={16} />, color: '#34d399', description: 'Kullandıkça öde' },
  { id: 'tent', name: 'Çadır Mağaza', icon: <Tent size={16} />, color: '#fbbf24', description: 'Deneyimle-satın al' },
  { id: 'market', name: 'Pazaryeri', icon: <Store size={16} />, color: '#f87171', description: 'Phygital showroom' },
  { id: 'room', name: 'Room Only', icon: <Home size={16} />, color: '#c084fc', description: 'Sadece oda' },
  { id: 'athlete', name: 'Atlet AI', icon: <Trophy size={16} />, color: '#f59e0b', description: 'Biyometrik performans' },
  { id: 'risk', name: 'Risk Kalkanı', icon: <Shield size={16} />, color: '#f87171', description: 'Kritik görev' },
  { id: 'engine', name: 'Smart Engine', icon: <Sparkles size={16} />, color: '#a78bfa', description: 'Otonom teslimat' },
  { id: 'supplier', name: 'Tedarikçi', icon: <Boxes size={16} />, color: '#34d399', description: 'Reçete portalı' },
  { id: 'pricing', name: 'Dinamik Fiyat', icon: <TrendingUp size={16} />, color: '#fbbf24', description: 'Sadakat & fiyat' },
  { id: 'stress', name: 'Stres Testi', icon: <Activity size={16} />, color: '#f87171', description: 'Edge functions' },
  { id: 'monitor', name: 'İzleme Paneli', icon: <Activity size={16} />, color: '#60a5fa', description: 'Loglama' },
  { id: 'legal', name: 'LegalRisk', icon: <Scale size={16} />, color: '#a78bfa', description: 'Hukuk & KVKK' },
  { id: 'finance', name: 'Finans Ajanları', icon: <Bot size={16} />, color: '#00f2fe', description: 'Otonom muhasebe' },
];

export default function CEOCommandCenter() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeModule, setActiveModule] = useState<string | null>(null);

  return (
    <div style={{ display: 'flex', gap: '16px', minHeight: '600px', marginTop: '16px' }}>
      {/* ================================================================ */}
      {/* SOL: AÇILIR/KAPANIR MODÜL MENÜSÜ (SIDEBAR) */}
      {/* ================================================================ */}
      <div style={{
        width: sidebarOpen ? '260px' : '48px',
        background: 'rgba(13, 19, 34, 0.9)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px',
        padding: sidebarOpen ? '16px' : '8px',
        transition: 'width 0.3s ease',
        overflow: 'hidden',
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Sidebar Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          {sidebarOpen && (
            <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#e2e8f0', whiteSpace: 'nowrap' }}>
              📦 Modüller
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
          >
            {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>

        {/* Module List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto', flex: 1 }}>
          {MODULES.map((mod) => (
            <button
              key={mod.id}
              onClick={() => setActiveModule(mod.id)}
              title={mod.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: sidebarOpen ? '10px 12px' : '10px',
                borderRadius: '10px',
                border: activeModule === mod.id ? `1px solid ${mod.color}` : '1px solid transparent',
                background: activeModule === mod.id ? `${mod.color}15` : 'rgba(255,255,255,0.03)',
                color: activeModule === mod.id ? mod.color : '#94a3b8',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: activeModule === mod.id ? '600' : '400',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
                justifyContent: sidebarOpen ? 'flex-start' : 'center',
              }}
            >
              <span style={{ color: mod.color }}>{mod.icon}</span>
              {sidebarOpen && (
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{mod.name}</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ================================================================ */}
      {/* SAĞ: ODAKLANMIŞ LİKYA CEO SOHBET ODASI (DEDICATED WORKSPACE) */}
      {/* ================================================================ */}
      <div style={{
        flex: 1,
        background: 'rgba(13, 19, 34, 0.9)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Chat Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
            🎩
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff' }}>Likya CEO</div>
            <div style={{ fontSize: '11px', color: '#48bb78' }}>🟢 Çevrimiçi • Akıllı Yönlendirme Aktif</div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
            <span style={{ fontSize: '10px', padding: '4px 10px', borderRadius: '20px', background: 'rgba(72,187,120,0.15)', color: '#48bb78', border: '1px solid rgba(72,187,120,0.3)' }}>
              🧠 Yazılım → Cline
            </span>
            <span style={{ fontSize: '10px', padding: '4px 10px', borderRadius: '20px', background: 'rgba(0,242,254,0.15)', color: '#00f2fe', border: '1px solid rgba(0,242,254,0.3)' }}>
              📊 Strateji → Gemini
            </span>
          </div>
        </div>

        {/* Chat Messages Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', padding: '8px' }}>
          {/* CEO Welcome */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            <div style={{ fontSize: '10px', color: '#f59e0b', marginBottom: '2px', fontWeight: 'bold' }}>🎩 Likya CEO • 12:00</div>
            <div style={{
              maxWidth: '85%',
              padding: '12px 16px',
              borderRadius: '16px 16px 16px 4px',
              fontSize: '13px',
              lineHeight: '1.6',
              background: 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(245,158,11,0.05))',
              border: '1px solid rgba(245,158,11,0.3)',
              color: '#e2e8f0',
              boxShadow: '0 4px 20px rgba(245,158,11,0.1)',
            }}>
              Merhaba Patron! 👋 Ben Likya CEO. Talimatını yaz veya 🎤 sesli söyle.
              <br /><br />
              <strong>Akıllı Yönlendirme:</strong>
              <br />• 🧠 <strong>Yazılım</strong> talepleri → Cline (Otonom Kodlayıcı)
              <br />• 📊 <strong>Strateji/Pazar</strong> → Gemini Analizi
              <br />• ⚙️ <strong>Operasyon</strong> → Departman Ajanları
            </div>
          </div>

          {/* Smart Routing Indicators */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{ fontSize: '10px', padding: '6px 12px', borderRadius: '20px', background: 'rgba(72,187,120,0.1)', color: '#48bb78', border: '1px solid rgba(72,187,120,0.2)' }}>
              🧠 Cline (Otonom Kodlayıcı) İşliyor...
            </div>
            <div style={{ fontSize: '10px', padding: '6px 12px', borderRadius: '20px', background: 'rgba(0,242,254,0.1)', color: '#00f2fe', border: '1px solid rgba(0,242,254,0.2)' }}>
              📊 Gemini Analizi Hazırlanıyor...
            </div>
          </div>
        </div>

        {/* Chat Input */}
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', fontSize: '16px', cursor: 'pointer' }}>
            🎤
          </button>
          <button style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', fontSize: '16px', cursor: 'pointer' }}>
            🔊
          </button>
          <input
            placeholder="Patron, aklınızdakileri yazın... (örn: yazılım yap, pazar araştır, fatura kes)"
            style={{
              flex: 1,
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px',
              padding: '12px 16px',
              color: '#e2e8f0',
              fontSize: '13px',
              outline: 'none',
            }}
          />
          <button style={{ width: '40px', height: '40px', borderRadius: '50%', border: 'none', background: 'linear-gradient(135deg, #e07a5f, #f27a1a)', color: '#fff', fontSize: '16px', cursor: 'pointer' }}>
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}
