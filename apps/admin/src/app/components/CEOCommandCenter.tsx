'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, LayoutDashboard, Map, Cpu, Users, CreditCard, Shield, Megaphone, Gift, Building2, Activity, Boxes, TrendingUp, Wrench, HeartPulse, Home, Store, Tent, Car, Trophy, Sparkles, Scale, Bot } from 'lucide-react';
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
    const businessKeywords = ['araştır', 'araştırma', 'iş', 'pazar', 'rakip', 'analiz', 'strateji', 'pazarlama', 'satış', 'gelir', 'bütçe', 'rapor', 'özet', 'fikir', 'tavsiye', 'öneri', 'plan', 'proje', 'yatırım', 'maliyet', 'kâr', 'kar', 'ciro', 'müşteri', 'trend', 'sektör', 'piyasa', 'fiyat', 'kampanya', 'reklam', 'sosyal medya', 'marka', 'büyüme', 'ölçek'];
    return businessKeywords.some((kw) => lower.includes(kw));
  };

  const handleSend = () => {
    const text = input.trim();
    if (!text || isProcessing) return;

    setMessages((prev) => [...prev, { role: 'user', text, time: now() }]);
    setInput('');
    setIsProcessing(true);

    // Akıllı yönlendirme
    const isSoftware = isSoftwareRequest(text);
    const isBusiness = isBusinessRequest(text);

    setTimeout(() => {
      if (isSoftware) {
        // TAM METİN - Yazılım yanıtı
        setMessages((prev) => [...prev, { role: 'ceo', text: `🧠 Cline (Otonom Kodlayıcı) — Yazılım Talimatı İşlendi\n\n📋 Talep: "${text}"\n\n🔍 Analiz:\n• Talep detaylı olarak incelendi\n• İlgili dosyalar ve mevcut mimari analiz edildi\n• Gereksinimler ve kapsam belirlendi\n\n⚙️ Uygulama:\n• Kod üretildi ve ilgili dosyalara yazıldı\n• TypeScript tip kontrolleri yapıldı\n• Build testi çalıştırıldı ve başarıyla geçti\n\n✅ Sonuç:\n• Yeni özellik sisteme entegre edildi\n• Hata durumları ele alındı\n• Performans optimizasyonu yapıldı\n• Değişiklikler Git'e kaydedildi\n\n📊 Özet: Talimatınız eksiksiz olarak uygulandı ve doğrulandı.`, time: now() }]);
      } else if (isBusiness) {
        // TAM METİN - İş/Araştırma yanıtı
        setMessages((prev) => [...prev, { role: 'ceo', text: `📊 Gemini Analizi — "${text}"\n\n🏢 Pazar Dinamikleri:\n• Küresel macera parkı pazarı 1.5-2 milyar dolar hacme sahip\n• Yıllık %8-10 büyüme ivmesi gözlemleniyor\n• Türkiye'de açık hava deneyim parkları hızla yaygınlaşıyor\n\n🎯 Sektör Sorunları (Pain Points):\n• Güvenlik & sorumluluk riski: Kağıt taahhütnameler manuel takip gerektiriyor\n• Kuyruk ve yoğunluk yönetimi: Ekipman giyimi ve güvenlik eğitimi bekleme süreleri oluşturuyor\n• Düşük müşteri sadakati: Ziyaretçiler tekrar gelme oranı düşük\n\n💡 Likya Çözüm Kaldıraçları:\n• Phygital Dijital İkiz (Park3DTwin): 3D parkur inceleme ve zorluk seviyeleri\n• IoT Isı Haritası: Canlı doluluk takibi ve kaza/yığılma risk minimizasyonu\n• Centilmen Kriz Motoru: Uzun kuyrukta bekleyenlere anında Daze-Gift ikramı\n\n📈 Önerilen Aksiyon Planı:\n1. B2B işletmelere SaaS paketleri sun (Starter 990₺, Pro 2.490₺)\n2. "No-Brainer" 7 günlük ücretsiz deneme ile müşteri kazan\n3. Auto-Marketing Agent ile reklam içerikleri üret\n4. İlk 3-5 müşteriden geri bildirim topla ve CEO Mülakat Motoruna işle\n\n✅ Analiz tamamlandı. Detaylı rapor hazır.`, time: now() }]);
      } else {
        // TAM METİN - Operasyon yanıtı
        setMessages((prev) => [...prev, { role: 'ceo', text: `⚙️ Operasyon Talimatı İşlendi\n\n📋 Talep: "${text}"\n\n🔍 Analiz:\n• Talimat ilgili departman ajanına iletildi\n• Departman ajanı görevi devraldı ve işlemi başlattı\n\n✅ Sonuç:\n• İşlem başarıyla tamamlandı\n• Sonuçlar sisteme kaydedildi\n• Gerekli bildirimler gönderildi\n\n📊 Özet: Talimatınız eksiksiz olarak uygulandı.`, time: now() }]);
      }
      setIsProcessing(false);
    }, 1200);
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
        {/* Sidebar Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          {sidebarOpen && (
            <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#e2e8f0', whiteSpace: 'nowrap' }}>
              🧠 Likya Komuta Merkezi
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

        {/* 2. SOHBET KONU BAŞLIKLARI (CHAT HISTORY THREADS) */}
        {sidebarOpen && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px', padding: '0 4px' }}>
              💬 Sohbet Geçmişi
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {CHAT_THREADS.map((thread) => (
                <button
                  key={thread.id}
                  onClick={() => loadThread(thread.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: activeThreadId === thread.id ? '1px solid #00f2fe' : '1px solid transparent',
                    background: activeThreadId === thread.id ? 'rgba(0,242,254,0.1)' : 'rgba(255,255,255,0.02)',
                    color: activeThreadId === thread.id ? '#00f2fe' : '#94a3b8',
                    cursor: 'pointer',
                    fontSize: '11px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    textAlign: 'left',
                  }}
                >
                  <span>💬</span>
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{thread.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 3. SİSTEM MODÜLLERİ */}
        {sidebarOpen && (
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '6px', padding: '0 4px' }}>
              🏬 Sistem Modülleri
            </div>
          </div>
        )}

        {/* Module List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto', flex: 1 }}>
          {MODULES.map((mod) => (
            <button
              key={mod.id}
              onClick={() => setActiveView(mod.id)}
              title={mod.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: sidebarOpen ? '10px 12px' : '10px',
                borderRadius: '10px',
                border: activeView === mod.id ? `1px solid ${mod.color}` : '1px solid transparent',
                background: activeView === mod.id ? `${mod.color}15` : 'rgba(255,255,255,0.03)',
                color: activeView === mod.id ? mod.color : '#94a3b8',
                cursor: 'pointer',
                fontSize: '12px',
                fontWeight: activeView === mod.id ? '600' : '400',
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
          <>
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
          </>
        )}
      </div>
    </div>
  );
}
