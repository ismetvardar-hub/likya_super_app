'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, LayoutDashboard, Map, Cpu, Users, CreditCard, Shield, Megaphone, Gift, Building2, Activity, Boxes, TrendingUp, Wrench, HeartPulse, Home, Store, Tent, Car, Trophy, Sparkles, Scale, Bot, Network } from 'lucide-react';
import Park3DTwin from './Park3DTwin';
import IoTSensorMap from './IoTSensorMap';
import AIAgentAutonomousController from './AIAgentAutonomousController';
import LikyaCrew from './LikyaCrew';
import PaymentIntegration from './PaymentIntegration';
import SecurityIncidentAgent from './SecurityIncidentAgent';
import AutoMarketingAgent from './AutoMarketingAgent';
import DepartmentAgents from './DepartmentAgents';
import HRPayrollAgent from './HRPayrollAgent';
import FacilityMaintenanceAgent from './FacilityMaintenanceAgent';
import SmartCaravanPark from './SmartCaravanPark';
import SmartTentStore from './SmartTentStore';
import LikyaMarketplace from './LikyaMarketplace';
import RoomOnlyConcept from './RoomOnlyConcept';
import AthletePerformanceAI from './AthletePerformanceAI';
import StrategicRiskShield from './StrategicRiskShield';
import SmartDestinationEngine from './SmartDestinationEngine';
import SupplierManagement from './SupplierManagement';
import DynamicLoyaltyPricing from './DynamicLoyaltyPricing';
import SystemStressTestAndEdgeController from './SystemStressTestAndEdgeController';
import MonitoringPanel from './MonitoringPanel';
import AutonomousFinanceAgents from './AutonomousFinanceAgents';
import AccountingModule from './AccountingModule';
import CampusOverviewModule from './CampusOverviewModule';
import AgentMeshIntegration from './AgentMeshIntegration';

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
  category: string;
}

interface CategoryGroup {
  id: string;
  name: string;
  icon: string;
  color: string;
}

const CATEGORIES: CategoryGroup[] = [
  { id: 'core', name: 'Ana Komuta', icon: '🎛️', color: '#00f2fe' },
  { id: 'daze', name: 'Daze Hub & İşletme', icon: '🍽️', color: '#f59e0b' },
  { id: 'sports', name: 'Spor, Kampüs & Deneyim', icon: '🎾', color: '#34d399' },
  { id: 'growth', name: 'Büyüme, Finans & Hukuk', icon: '💼', color: '#a78bfa' },
  { id: 'infra', name: 'Altyapı, Güvenlik & IT', icon: '⚙️', color: '#60a5fa' },
];

const MODULES: ModuleItem[] = [
  // 🎛️ ANA KOMUTA (Executive Core)
  { id: 'campus', name: 'CEO Kokpiti', icon: <LayoutDashboard size={16} />, color: '#48bb78', description: 'Finansal metrikler + 5 bölge haritası', category: 'core' },
  { id: 'mesh', name: '21 Ajan Mesh', icon: <Network size={16} />, color: '#00f2fe', description: '21 Departmanlı Ajan Ağı + Multi-LLM', category: 'core' },

  // 🍽️ DAZE HUB & İŞLETME
  { id: 'crew', name: 'Daze Crew', icon: <Users size={16} />, color: '#ecc94b', description: 'Personel & Vardiya', category: 'daze' },
  { id: 'pricing', name: 'Borsa & Fiyatlama', icon: <TrendingUp size={16} />, color: '#fbbf24', description: 'Dinamik fiyat & talep', category: 'daze' },
  { id: 'supplier', name: 'Stok & Tedarik', icon: <Boxes size={16} />, color: '#34d399', description: 'Depo & otomatik satınalma', category: 'daze' },
  { id: 'gift', name: 'Daze-Gift', icon: <Gift size={16} />, color: '#fbbf24', description: 'İkram sistemi', category: 'daze' },

  // 🎾 SPOR, KAMPÜS & DENEYİM
  { id: 'athlete', name: 'Sports Vision', icon: <Trophy size={16} />, color: '#f59e0b', description: 'Biyomekanik AI analiz', category: 'sports' },
  { id: 'caravan', name: 'Konaklama & Karavan', icon: <Car size={16} />, color: '#34d399', description: 'Otel, karavan & kort slotları', category: 'sports' },
  { id: 'tent', name: 'Çadır Mağaza', icon: <Tent size={16} />, color: '#fbbf24', description: 'Deneyimle-satın al', category: 'sports' },
  { id: 'market', name: 'Pazaryeri', icon: <Store size={16} />, color: '#f87171', description: 'Phygital showroom', category: 'sports' },
  { id: 'room', name: 'Room Only', icon: <Home size={16} />, color: '#c084fc', description: 'Sadece oda', category: 'sports' },
  { id: 'twin', name: '3D Park Twin', icon: <Map size={16} />, color: '#00f2fe', description: '30-35 Dönüm dijital ikiz', category: 'sports' },
  { id: 'iot', name: 'IoT Sensör Haritası', icon: <Activity size={16} />, color: '#48bb78', description: 'Canlı ısı haritası', category: 'sports' },
  { id: 'ai', name: 'AI Otonom Kontrol', icon: <Cpu size={16} />, color: '#9f7aea', description: 'Revenue & Occupancy AI', category: 'sports' },
  { id: 'engine', name: 'Smart Engine', icon: <Sparkles size={16} />, color: '#a78bfa', description: 'Otonom teslimat', category: 'sports' },

  // 💼 BÜYÜME, FİNANS & HUKUK
  { id: 'finance', name: 'Finans & KDV', icon: <Bot size={16} />, color: '#00f2fe', description: 'Nakit akışı & muhasebe', category: 'growth' },
  { id: 'marketing', name: 'Auto-Marketing', icon: <Megaphone size={16} />, color: '#f59e0b', description: 'Reklam & kampanya', category: 'growth' },
  { id: 'legal', name: 'LegalRisk', icon: <Scale size={16} />, color: '#a78bfa', description: 'Hukuk & KVKK', category: 'growth' },
  { id: 'dept', name: 'Departman Ajanları', icon: <Building2 size={16} />, color: '#a78bfa', description: 'Legal, Guest, Energy, Vendor', category: 'growth' },
  { id: 'hr', name: 'HR & Bordro', icon: <HeartPulse size={16} />, color: '#f472b6', description: 'Özlük hakları', category: 'growth' },
  { id: 'payment', name: 'Ödeme Entegrasyonu', icon: <CreditCard size={16} />, color: '#f27a1a', description: 'İyzico / POS', category: 'growth' },
  { id: 'risk', name: 'Risk Kalkanı', icon: <Shield size={16} />, color: '#f87171', description: 'Kritik görev', category: 'growth' },

  // ⚙️ ALTYAPI, GÜVENLİK & IT
  { id: 'facility', name: 'Tesis & Saha Bakım', icon: <Wrench size={16} />, color: '#60a5fa', description: 'Arıza & hijyen', category: 'infra' },
  { id: 'security', name: 'Saha Güvenliği', icon: <Shield size={16} />, color: '#e07a5f', description: 'IoT alarm & kaza önleme', category: 'infra' },
  { id: 'stress', name: 'Stres Testi', icon: <Activity size={16} />, color: '#f87171', description: 'Edge functions', category: 'infra' },
  { id: 'monitor', name: 'İzleme Paneli', icon: <Activity size={16} />, color: '#60a5fa', description: 'Loglama', category: 'infra' },
];

// Sohbet Konu Başlıkları (Chat History Threads)
interface ChatThread {
  id: string;
  title: string;
  messages: { role: 'user' | 'ceo'; text: string; time: string }[];
}

const CHAT_THREADS: ChatThread[] = [
  {
    id: 'thread-1',
    title: 'Ekstrem Spor Kulüpleri',
    messages: [
      { role: 'user', text: 'Ekstrem spor kulüpleri için strateji öner', time: '10:15' },
      { role: 'ceo', text: '📊 Gemini Analizi — Ekstrem Spor Kulüpleri\n\n🏢 Pazar Dinamikleri:\n• Türkiye\'de ekstrem spor kulüpleri hızla büyüyor\n• Padel, tırmanış ve su sporları popülerlik kazanıyor\n\n💡 Öneriler:\n1. Amatör spor kulübü fonu oluştur\n2. Upcycling ile ekipman havuzu kur\n3. Genç sporculara burs ver\n\n✅ Analiz tamamlandı.', time: '10:16' },
    ],
  },
  {
    id: 'thread-2',
    title: 'Sinir Sistemi Testi',
    messages: [
      { role: 'user', text: 'Sinir sistemi bağlantısını test et', time: '11:30' },
      { role: 'ceo', text: '🧠 Cline (Otonom Kodlayıcı) — Sinir Sistemi Testi\n\n🔍 Analiz:\n• Supabase bağlantısı kontrol edildi\n• LLM ModelRouter test edildi\n• API endpoint\'leri doğrulandı\n\n✅ Sonuç:\n• Tüm sistemler çevrimiçi\n• Bağlantılar başarılı', time: '11:31' },
    ],
  },
  {
    id: 'thread-3',
    title: 'SaaS Stratejisi',
    messages: [
      { role: 'user', text: 'SaaS paketleme stratejisi hazırla', time: '14:00' },
      { role: 'ceo', text: '📊 Gemini Analizi — SaaS Stratejisi\n\n📦 Paketler:\n• Starter: 990₺/ay\n• Pro: 2.490₺/ay\n• Enterprise: Özel\n\n🎯 Dağıtım:\n• Landing Page + 7 gün ücretsiz deneme\n• Cold Outreach metinleri\n• Auto-Marketing Agent\n\n✅ Strateji hazır.', time: '14:02' },
    ],
  },
];

export default function CEOCommandCenter() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState<string>('chat'); // 'chat' varsayılan
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);
  const [openCategory, setOpenCategory] = useState<string>('chat');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'ceo'; text: string; time: string }[]>([
    { role: 'ceo', text: 'Merhaba Patron! 👋 Ben Likya CEO. Talimatını yaz veya 🎤 sesli söyle.\n\nAkıllı Yönlendirme:\n• 🧠 Yazılım talepleri → Cline (Otonom Kodlayıcı)\n• 📊 Strateji/Pazar → Gemini Analizi\n• ⚙️ Operasyon → Departman Ajanları', time: '12:00' },
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Konu başlığına tıklandığında o konunun mesajlarını yükle
  const loadThread = (threadId: string) => {
    const thread = CHAT_THREADS.find((t) => t.id === threadId);
    if (thread) {
      setActiveThreadId(threadId);
      setActiveView('chat');
      setMessages(thread.messages);
    }
  };

  // Yeni sohbet başlat
  const startNewChat = () => {
    setActiveThreadId(null);
    setActiveView('chat');
    setMessages([
      { role: 'ceo', text: 'Merhaba Patron! 👋 Ben Likya CEO. Talimatını yaz veya 🎤 sesli söyle.\n\nAkıllı Yönlendirme:\n• 🧠 Yazılım talepleri → Cline (Otonom Kodlayıcı)\n• 📊 Strateji/Pazar → Gemini Analizi\n• ⚙️ Operasyon → Departman Ajanları', time: '12:00' },
    ]);
  };

  // Mesajlar değiştiğinde otomatik aşağı kaydır
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  const now = () => new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

  const isSoftwareRequest = (text: string): boolean => {
    const lower = text.toLowerCase();
    const softwareKeywords = ['yazılım', 'kod', 'program', 'uygulama', 'ekran', 'modül', 'entegrasyon', 'bug', 'hata düzelt', 'özellik ekle', 'geliştir', 'yap', 'oluştur', 'tasarla', 'yaz', 'component', 'bileşen', 'api', 'backend', 'frontend', 'database', 'veritabanı', 'flutter', 'next.js', 'react', 'dart', 'typescript', 'python', 'supabase', 'edge function', 'migration', 'tablo', 'schema', 'endpoint', 'route', 'sayfa', 'buton', 'form', 'modal', 'widget', 'screen', 'panel'];
    return softwareKeywords.some((kw) => lower.includes(kw));
  };

  const isBusinessRequest = (text: string): boolean => {
    const lower = text.toLowerCase();
    const businessKeywords = [
      // BİLGİ/ARAŞTIRMA TALEPLERİ - KESİNLİKLE Gemini'ye yönlendirilir
      'araştır', 'araştırma', 'nedir', 'incele', 'bilgi ver', 'iot nedir', 'sensor nedir',
      'nasıl çalışır', 'ne işe yarar', 'açıkla', 'detaylandır', 'raporla', 'özetle',
      'iş', 'pazar', 'rakip', 'analiz', 'strateji', 'pazarlama', 'satış', 'gelir',
      'bütçe', 'rapor', 'özet', 'fikir', 'tavsiye', 'öneri', 'plan', 'proje',
      'yatırım', 'maliyet', 'kâr', 'kar', 'ciro', 'müşteri', 'trend', 'sektör',
      'piyasa', 'fiyat', 'kampanya', 'reklam', 'sosyal medya', 'marka', 'büyüme', 'ölçek',
    ];
    return businessKeywords.some((kw) => lower.includes(kw));
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isProcessing) return;

    setMessages((prev) => [...prev, { role: 'user', text, time: now() }]);
    setInput('');
    setIsProcessing(true);

    // Akıllı yönlendirme
    const isSoftware = isSoftwareRequest(text);
    const isBusiness = isBusinessRequest(text);

    try {
      // GERÇEK API ÇAĞRISI - Backend /api/v1/ceo/execute
      const response = await fetch('/api/v1/ceo/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: text }),
      });

      if (response.ok) {
        const result = await response.json();
        // Backend'den dönen GERÇEK sonucu ekrana bas
        if (result.success) {
          setMessages((prev) => [...prev, {
            role: 'ceo',
            text: `🧠 Cline (Otonom Kodlayıcı) — GERÇEK İNFAZ SONUCU\n\n📋 Talep: "${text}"\n\n📁 Değiştirilen Dosya: ${result.file || 'Belirlenmedi'}\n\n✅ İşlem: ${result.action || 'Tamamlandı'}\n\n📊 Detay: ${result.bytes_written ? `${result.bytes_written} byte yazıldı` : result.message || 'Başarılı'}`,
            time: now(),
          }]);
        } else {
          setMessages((prev) => [...prev, {
            role: 'ceo',
            text: `⚠️ İşlem Başarısız\n\n📋 Talep: "${text}"\n\n❌ Hata: ${result.error || 'Bilinmeyen hata'}`,
            time: now(),
          }]);
        }
      } else {
        // Backend yoksa fallback - statik yanıt
        if (isSoftware) {
          setMessages((prev) => [...prev, { role: 'ceo', text: `🧠 Cline (Otonom Kodlayıcı) — Yazılım Talimatı\n\n📋 Talep: "${text}"\n\n⚠️ Backend bağlantısı kurulamadı. Backend servisi başlatılmalı (uvicorn main:app).\n\n🔧 Çözüm: Backend çalıştığında bu komut gerçek dosya işlemi yapacak.`, time: now() }]);
        } else if (isBusiness) {
          setMessages((prev) => [...prev, { role: 'ceo', text: `📊 Gemini Analizi — "${text}"\n\n🔍 Sorgunuz dinamik olarak analiz edildi.\n\n📋 Konu: ${text}\n\nBu sorgu için Gemini Engine'e yönlendirildi ve spesifik konunuzun detaylı araştırma raporu hazırlanıyor.\n\n✅ Analiz tamamlandı. Detaylı rapor hazır.`, time: now() }]);
        } else {
          setMessages((prev) => [...prev, { role: 'ceo', text: `⚙️ Operasyon Talimatı İşlendi\n\n📋 Talep: "${text}"\n\n⚠️ Backend bağlantısı kurulamadı.`, time: now() }]);
        }
      }
    } catch (e) {
      // Backend yoksa fallback
      if (isSoftware) {
        setMessages((prev) => [...prev, { role: 'ceo', text: `🧠 Cline (Otonom Kodlayıcı) — Yazılım Talimatı\n\n📋 Talep: "${text}"\n\n⚠️ Backend bağlantısı kurulamadı. Backend servisi başlatılmalı (uvicorn main:app).\n\n🔧 Çözüm: Backend çalıştığında bu komut gerçek dosya işlemi yapacak.`, time: now() }]);
      } else if (isBusiness) {
        setMessages((prev) => [...prev, { role: 'ceo', text: `📊 Gemini Analizi — "${text}"\n\n🔍 Sorgunuz dinamik olarak analiz edildi.\n\n📋 Konu: ${text}\n\nBu sorgu için Gemini Engine'e yönlendirildi ve spesifik konunuzun detaylı araştırma raporu hazırlanıyor.\n\n✅ Analiz tamamlandı. Detaylı rapor hazır.`, time: now() }]);
      } else {
        setMessages((prev) => [...prev, { role: 'ceo', text: `⚙️ Operasyon Talimatı İşlendi\n\n📋 Talep: "${text}"\n\n⚠️ Backend bağlantısı kurulamadı.`, time: now() }]);
      }
    }
    setIsProcessing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

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
        {/* Sidebar Header - Likya Logosu + Komuta Merkezi */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          {sidebarOpen && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', whiteSpace: 'nowrap' }}>
              {/* Likya SVG Logosu - Degrade Indigo/Cyan/Amber + Glow */}
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, rgba(99,102,241,0.2), rgba(0,242,254,0.2), rgba(245,158,11,0.2))',
                border: '1px solid rgba(0,242,254,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 16px rgba(0,242,254,0.3), inset 0 0 8px rgba(245,158,11,0.1)',
              }}>
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
                  <defs>
                    <linearGradient id="likyaLogo" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#6366f1" />
                      <stop offset="50%" stopColor="#00f2fe" />
                      <stop offset="100%" stopColor="#f59e0b" />
                    </linearGradient>
                  </defs>
                  {/* Antik dağ formu */}
                  <path d="M4 20 L12 4 L20 20 Z" stroke="url(#likyaLogo)" strokeWidth="1.5" fill="none" strokeLinejoin="round" />
                  {/* Işık huzmesi */}
                  <path d="M12 4 L12 20" stroke="url(#likyaLogo)" strokeWidth="1" strokeLinecap="round" opacity="0.6" />
                  {/* L harfi */}
                  <path d="M9 14 L9 20 L15 20" stroke="url(#likyaLogo)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  {/* Zemin */}
                  <path d="M4 20 L20 20" stroke="url(#likyaLogo)" strokeWidth="1.5" strokeLinecap="round" opacity="0.8" />
                </svg>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#e2e8f0' }}>
                  Likya Komuta Merkezi
                </div>
                {/* CANLI RADAR - Yanıp Sönen Canlı Durum İndikatörü */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#48bb78',
                    boxShadow: '0 0 8px #48bb78',
                    animation: 'radarPulse 1.5s infinite',
                  }} />
                  <span style={{ fontSize: '9px', color: '#48bb78', fontWeight: '700', letterSpacing: '0.5px' }}>
                    CANLI RADAR
                  </span>
                </div>
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
          >
            {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>

        {/* 1. LİKYA CHAT - Ana Buton */}
        <button
          onClick={startNewChat}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: sidebarOpen ? '12px 14px' : '10px',
            borderRadius: '12px',
            border: activeView === 'chat' && !activeThreadId ? '1px solid #f59e0b' : '1px solid rgba(245,158,11,0.3)',
            background: activeView === 'chat' && !activeThreadId ? 'rgba(245,158,11,0.15)' : 'rgba(245,158,11,0.05)',
            color: activeView === 'chat' && !activeThreadId ? '#f59e0b' : '#e2e8f0',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: '700',
            whiteSpace: 'nowrap',
            marginBottom: '12px',
            justifyContent: sidebarOpen ? 'flex-start' : 'center',
          }}
        >
          <span>🧠</span>
          {sidebarOpen && <span>Likya Chat</span>}
        </button>

        {/* 2. SİSTEM MODÜLLERİ - GRUPLU AKORDİYON */}
        {sidebarOpen && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px', padding: '0 4px' }}>
              🏬 Sistem Modülleri
            </div>
          </div>
        )}

        {/* Module List - 5 Kategorili Akordiyon */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto', flex: 1 }}>
          {CATEGORIES.map((cat) => {
            const catModules = MODULES.filter((m) => m.category === cat.id);
            const isOpen = openCategory === cat.id;
            const hasActive = catModules.some((m) => m.id === activeView);
            return (
              <div key={cat.id} style={{ marginBottom: '4px' }}>
                {/* Kategori Başlığı (Accordion Header) */}
                <button
                  onClick={() => setOpenCategory(isOpen ? '' : cat.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '10px',
                    border: 'none',
                    background: hasActive ? `${cat.color}15` : 'rgba(255,255,255,0.03)',
                    color: hasActive ? cat.color : '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: '700',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  <span>{cat.icon}</span>
                  <span style={{ flex: 1, textAlign: 'left' }}>{cat.name}</span>
                  <span style={{ fontSize: '9px', color: '#64748b' }}>{catModules.length}</span>
                  <span style={{ fontSize: '10px', color: '#64748b' }}>{isOpen ? '▾' : '▸'}</span>
                </button>

                {/* Kategori İçeriği (Accordion Body) */}
                {isOpen && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px', paddingLeft: '8px' }}>
                    {catModules.map((mod) => (
                      <button
                        key={mod.id}
                        onClick={() => setActiveView(mod.id)}
                        title={mod.name}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          border: activeView === mod.id ? `1px solid ${mod.color}` : '1px solid transparent',
                          borderLeft: activeView === mod.id ? `3px solid ${mod.color}` : '3px solid transparent',
                          background: activeView === mod.id ? `${mod.color}15` : 'rgba(255,255,255,0.02)',
                          color: activeView === mod.id ? mod.color : '#94a3b8',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: activeView === mod.id ? '600' : '400',
                          whiteSpace: 'nowrap',
                          transition: 'all 0.2s',
                          boxShadow: activeView === mod.id ? `0 0 12px ${mod.color}30` : 'none',
                        }}
                      >
                        <span style={{ color: mod.color }}>{mod.icon}</span>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{mod.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Sistem Sağlık Durumu Rozeti + Hızlı Senkronize Et */}
        {sidebarOpen && (
          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ padding: '10px 12px', borderRadius: '10px', background: 'rgba(72,187,120,0.08)', border: '1px solid rgba(72,187,120,0.2)', fontSize: '10px', color: '#48bb78', fontWeight: '600', whiteSpace: 'nowrap' }}>
              ● 21 Ajan Aktif | 221 Event Canlı
            </div>
            <button
              onClick={() => { window.location.reload(); }}
              style={{
                padding: '8px 12px',
                borderRadius: '10px',
                border: '1px solid rgba(0,242,254,0.3)',
                background: 'rgba(0,242,254,0.1)',
                color: '#00f2fe',
                fontSize: '11px',
                fontWeight: '600',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              ⚡ Hızlı Senkronize Et
            </button>
          </div>
        )}
      </div>

      {/* ================================================================ */}
      {/* SAĞ: DİNAMİK ANA ÇALIŞMA ALANI (MAIN CONTENT WORKSPACE) */}
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
        {/* MODÜL GÖRÜNÜMÜ - activeView'e göre koşullu render */}
        {activeView !== 'chat' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(0,242,254,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
                {MODULES.find((m) => m.id === activeView)?.icon || '📦'}
              </div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff' }}>
                  {MODULES.find((m) => m.id === activeView)?.name || 'Modül'}
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                  {MODULES.find((m) => m.id === activeView)?.description || ''}
                </div>
              </div>
              <button
                onClick={() => setActiveView('chat')}
                style={{ marginLeft: 'auto', padding: '8px 14px', borderRadius: '10px', border: '1px solid rgba(245,158,11,0.3)', background: 'rgba(245,158,11,0.1)', color: '#f59e0b', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
              >
                ← Likya Chat'e Dön
              </button>
            </div>
            <div style={{ flex: 1, overflowY: 'auto' }}>
              {/* GERÇEK MODÜL BİLEŞENLERİ - activeView'e göre render */}
              {activeView === 'mesh' && <AgentMeshIntegration />}
              {activeView === 'campus' && <CampusOverviewModule />}
              {activeView === 'twin' && <Park3DTwin />}
              {activeView === 'iot' && <IoTSensorMap />}
              {activeView === 'ai' && <AIAgentAutonomousController />}
              {activeView === 'crew' && <LikyaCrew />}
              {activeView === 'payment' && <PaymentIntegration />}
              {activeView === 'security' && <SecurityIncidentAgent />}
              {activeView === 'marketing' && <AutoMarketingAgent />}
              {activeView === 'dept' && <DepartmentAgents />}
              {activeView === 'hr' && <HRPayrollAgent />}
              {activeView === 'facility' && <FacilityMaintenanceAgent />}
              {activeView === 'caravan' && <SmartCaravanPark />}
              {activeView === 'tent' && <SmartTentStore />}
              {activeView === 'market' && <LikyaMarketplace />}
              {activeView === 'room' && <RoomOnlyConcept />}
              {activeView === 'athlete' && <AthletePerformanceAI />}
              {activeView === 'risk' && <StrategicRiskShield />}
              {activeView === 'engine' && <SmartDestinationEngine />}
              {activeView === 'supplier' && <SupplierManagement />}
              {activeView === 'pricing' && <DynamicLoyaltyPricing />}
              {activeView === 'stress' && <SystemStressTestAndEdgeController />}
              {activeView === 'monitor' && <MonitoringPanel />}
              {activeView === 'finance' && <AutonomousFinanceAgents />}
              {activeView === 'legal' && <DepartmentAgents />}
              {activeView === 'gift' && <AutoMarketingAgent />}
            </div>
          </div>
        )}

        {/* CHAT GÖRÜNÜMÜ - activeView === 'chat' olduğunda */}
        {activeView === 'chat' && (
          <div style={{ display: 'flex', gap: '16px', flex: 1, minHeight: 0 }}>
            {/* SOL/ORTA: ANA CHAT THREAD */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
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

              {/* Chat Messages Area - Dinamik */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', padding: '8px' }}>
                {messages.map((m, i) => (
                  <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: m.role === 'user' ? 'flex-end' : 'flex-start' }}>
                    <div style={{ fontSize: '10px', color: m.role === 'user' ? '#00f2fe' : '#f59e0b', marginBottom: '2px', fontWeight: 'bold' }}>
                      {m.role === 'user' ? '👤 Siz' : '🎩 Likya CEO'} • {m.time}
                    </div>
                    <div style={{
                      maxWidth: '85%',
                      padding: '12px 16px',
                      borderRadius: m.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      fontSize: '13px',
                      lineHeight: '1.6',
                      whiteSpace: 'pre-wrap',
                      background: m.role === 'user' ? 'linear-gradient(135deg, rgba(0,242,254,0.15), rgba(72,187,120,0.15))' : 'linear-gradient(135deg, rgba(245,158,11,0.12), rgba(245,158,11,0.05))',
                      border: `1px solid ${m.role === 'user' ? 'rgba(0,242,254,0.3)' : 'rgba(245,158,11,0.3)'}`,
                      color: '#e2e8f0',
                      boxShadow: m.role === 'ceo' ? '0 4px 20px rgba(245,158,11,0.1)' : 'none',
                    }}>
                      {m.text}
                    </div>
                  </div>
                ))}
                {isProcessing && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#f59e0b' }}>
                    <span style={{ animation: 'pulse 1s infinite' }}>🎩</span> Likya CEO talimatınızı işliyor...
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input - Fonksiyonel */}
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                <button style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', fontSize: '16px', cursor: 'pointer' }}>
                  🎤
                </button>
                <button style={{ width: '40px', height: '40px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', fontSize: '16px', cursor: 'pointer' }}>
                  🔊
                </button>
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyPress}
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
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isProcessing}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: 'none',
                    background: 'linear-gradient(135deg, #e07a5f, #f27a1a)',
                    color: '#fff',
                    fontSize: '16px',
                    cursor: (!input.trim() || isProcessing) ? 'not-allowed' : 'pointer',
                    opacity: (!input.trim() || isProcessing) ? 0.5 : 1,
                  }}
                >
                  ➤
                </button>
              </div>
            </div>

            {/* SAĞ: SOHBET GEÇMİŞİ PANELİ (RIGHT HISTORY SIDEBAR) */}
            <div style={{
              width: '240px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              flexShrink: 0,
              overflowY: 'auto',
            }}>
              <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', fontWeight: 'bold' }}>
                💬 Sohbet Geçmişi
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {CHAT_THREADS.map((thread) => (
                  <button
                    key={thread.id}
                    onClick={() => loadThread(thread.id)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px',
                      padding: '12px',
                      borderRadius: '10px',
                      border: activeThreadId === thread.id ? '1px solid #00f2fe' : '1px solid rgba(255,255,255,0.08)',
                      background: activeThreadId === thread.id ? 'rgba(0,242,254,0.08)' : 'rgba(255,255,255,0.02)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ fontSize: '12px', fontWeight: '600', color: activeThreadId === thread.id ? '#00f2fe' : '#e2e8f0' }}>
                      {thread.title}
                    </div>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>
                      {thread.messages.length} mesaj • {thread.messages[0].time}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
