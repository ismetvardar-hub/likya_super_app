'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, LayoutDashboard, Map, Cpu, Users, CreditCard, Shield, Megaphone, Gift, Building2, Activity, Boxes, TrendingUp, Wrench, HeartPulse, Home, Store, Tent, Car, Trophy, Sparkles, Scale, Bot, Network, Radar, Cloud, Music, Trash2, Ghost, Ruler, ShoppingBag, Package, UserPlus } from 'lucide-react';
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
import MarketplaceGallery from './MarketplaceGallery';
import MarketplacePaymentTerminal from './MarketplacePaymentTerminal';
import DazeNeuralMarketHud from './DazeNeuralMarketHud';
import DazeVisionKioskView from './DazeVisionKioskView';
import N8nOrchestratorCard from './N8nOrchestratorCard';
import LifeCoachDashboardCards from './LifeCoachDashboardCards';
import FamilyFinanceDashboardCards from './FamilyFinanceDashboardCards';
import SupervisionZoneOverlay from './SupervisionZoneOverlay';
import BuiltinTemplateStoreCard from './BuiltinTemplateStoreCard';
import AdvancedEnterpriseModules from './AdvancedEnterpriseModules';
import GrowthRadarSwarmCard from './GrowthRadarSwarmCard';
import ExtremeSCustomerPortal from './ExtremeSCustomerPortal';
import ExecutiveSimplifiedHud from './ExecutiveSimplifiedHud';
import DazeChef from './DazeChef';
import VerifiedRevenueWidget from './VerifiedRevenueWidget';
import TrustLeaderboard from './TrustLeaderboard';
import NeonGraphView from './NeonGraphView';
import vaultData from '../lib/rag/vaultData.json';
import CrmCustomerCard from './CrmCustomerCard';
import ExecutiveLifeOSCard from './ExecutiveLifeOSCard';
import { loadContext } from '../lib/lifeos/executiveContextEngine';
import { wrapWithContext } from '../lib/lifeos/contextPromptBuilder';
import PokeTokenTracker from './PokeTokenTracker';
import SecurityAppBuilderCard from './SecurityAppBuilderCard';
import SportsVisionMemoryCard from './SportsVisionMemoryCard';
import ExtremeSimulatorSecurityCard from './ExtremeSimulatorSecurityCard';
import FinancePmDashboardCard from './FinancePmDashboardCard';
import AgentMatrixSafetyCard from './AgentMatrixSafetyCard';
import McpA2aOpsCard from './McpA2aOpsCard';
import MultiAgentSportsCard from './MultiAgentSportsCard';
import DazeSentinelHud from './DazeSentinelHud';
import ChatwootSupportPanel from './ChatwootSupportPanel';
import DazeCrewView from './DazeCrewView';
import DazeVisionOrderTracker from './DazeVisionOrderTracker';
import { sanitizeInput } from '../lib/security/zeroTrustShield';
import RoomOnlyConcept from './RoomOnlyConcept';
import AthletePerformanceAI from './AthletePerformanceAI';
import SportVisionDashboard from './SportVisionDashboard';
import SportVisionX from './SportVisionX';
import YouthDevelopmentDashboard from './YouthDevelopmentDashboard';
import HolisticChildDashboard from './HolisticChildDashboard';
import ScoutingEcosystem from './ScoutingEcosystem';
import ToolsAndAgentsDashboard from './ToolsAndAgentsDashboard';
import DazeSmartCampus from './DazeSmartCampus';
import SportMediaCommerceDashboard from './SportMediaCommerceDashboard';
import ProcurementDashboard from './ProcurementDashboard';
import { runPraisonChain, type AgentTask } from '../lib/ai/praisonOrchestrator';
import { openLiveBridgeStatus, createSpeechRecognitionBridge, isSpeechRecognitionSupported } from '../lib/ai/openLiveBridge';
import { chatwootBridgeStatus } from '../lib/support/chatwootBridge';
import { gestureTrackerStatus } from '../lib/vision/gestureTracker';
import { openRouterStatus } from '../lib/ai/openRouterAdapter';
import { ttsEngineStatus, speakText } from '../lib/voice/ttsEngine';
import { runnerHStatus } from '../lib/ai/runnerHEngine';
import { in3dBridgeStatus } from '../lib/vision/in3dAvatarBridge';
import { meshyStatus } from '../lib/vision/meshyAssetGenerator';
import { viralClipStatus } from '../lib/marketing/viralClipEngine';
import HRDispatchDashboard from './HRDispatchDashboard';
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
import AgentTelemetryPanel from './AgentTelemetryPanel';
import OSINTSahaRadar from './OSINTSahaRadar';
import GoogleCloudHibe from './GoogleCloudHibe';
import GlobalSaaSFatura from './GlobalSaaSFatura';
import LikyaMusicStation from './LikyaMusicStation';
import DensityBalancer from './DensityBalancer';

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

// 🗂️ 👑 6 ANA DAL — LİKYA HOLDİNG AJAN AĞACI hiyerarşisi (Modüller sekmesi/navigasyon)
const MODULE_DOMAINS: { id: string; name: string; chipLabel: string; icon: string; color: string; moduleIds: string[] }[] = [
  {
    id: 'biz',
    name: 'İşletme, Finans & İK',
    chipLabel: 'İşletme',
    icon: '🏢',
    color: '#f59e0b',
    moduleIds: [
      'campus', 'pricing', 'supplier', 'crew', 'gift', 'hrdispatch',
      'finance', 'marketing', 'legal', 'dept', 'hr', 'payment', 'risk',
      'gcp', 'saas', 'mediacom',
    ],
  },
  {
    id: 'sport',
    name: 'Spor, Biyomekanik & Akademi',
    chipLabel: 'Spor',
    icon: '🎾',
    color: '#34d399',
    moduleIds: [
      'athlete', 'sportvision', 'sportvisionx', 'youthdev', 'holistic', 'scouting',
    ],
  },
  {
    id: 'facility',
    name: 'Tesis, Konaklama & Deneyim Parkı',
    chipLabel: 'Tesis & Konaklama',
    icon: '🏕️',
    color: '#10b981',
    moduleIds: [
      'caravan', 'tent', 'room', 'twin', 'iot', 'engine',
    ],
  },
  {
    id: 'market',
    name: 'Pazaryeri & Kiralama',
    chipLabel: 'Pazaryeri',
    icon: '🛒',
    color: '#f87171',
    moduleIds: ['market'],
  },
  {
    id: 'music',
    name: 'Müzik, Sanat & Atmosfer',
    chipLabel: 'Müzik',
    icon: '🎵',
    color: '#ecc94b',
    moduleIds: ['music'],
  },
  {
    id: 'system',
    name: 'Çekirdek Sistem & Altyapı',
    chipLabel: 'Sistem',
    icon: '🧠',
    color: '#00f2fe',
    moduleIds: [
      'mesh', 'balance', 'toolsagents', 'smartcampus', 'procurement',
      'facility', 'security', 'stress', 'monitor', 'telemetry', 'osint', 'ai',
    ],
  },
];

const MODULES: ModuleItem[] = [
  // 👑 PATRON & EXTREMES (ExtremeS müşteri portalı — birincil)
  { id: 'exec', name: '👑 Patron Panel', icon: <LayoutDashboard size={16} />, color: '#f0abfc', description: '4 sütunlu yalın yönetim', category: 'core' },
  { id: 'extremes', name: '⚡ ExtremeS', icon: <TrendingUp size={16} />, color: '#7c3aed', description: 'Müşteri süper uygulama portalı', category: 'core' },
  // 🎛️ ANA KOMUTA (Executive Core)
  { id: 'campus', name: 'CEO Kokpiti', icon: <LayoutDashboard size={16} />, color: '#48bb78', description: 'Finansal metrikler + 5 bölge haritası', category: 'core' },
  { id: 'mesh', name: '21 Ajan Mesh', icon: <Network size={16} />, color: '#00f2fe', description: '21 Departmanlı Ajan Ağı + Multi-LLM', category: 'core' },
  { id: 'balance', name: 'Yoğunluk Dengeleme', icon: <Scale size={16} />, color: '#48bb78', description: 'Homojen dağılım & otonom rotasyon', category: 'core' },

  // 🍽️ DAZE HUB & İŞLETME
  { id: 'crew', name: 'Daze Crew', icon: <Users size={16} />, color: '#ecc94b', description: 'Personel & Vardiya', category: 'daze' },
  { id: 'pricing', name: 'Borsa & Fiyatlama', icon: <TrendingUp size={16} />, color: '#fbbf24', description: 'Dinamik fiyat & talep', category: 'daze' },
  { id: 'supplier', name: 'Stok & Tedarik', icon: <Boxes size={16} />, color: '#34d399', description: 'Depo & otomatik satınalma', category: 'daze' },
  { id: 'gift', name: 'Daze-Gift', icon: <Gift size={16} />, color: '#fbbf24', description: 'İkram sistemi', category: 'daze' },

  // 🎾 SPOR, KAMPÜS & DENEYİM
  { id: 'athlete', name: 'Sports Vision', icon: <Trophy size={16} />, color: '#f59e0b', description: 'Biyomekanik AI analiz', category: 'sports' },
  { id: 'sportvision', name: 'Sport Vision Ajanlar', icon: <Activity size={16} />, color: '#34d399', description: 'Otonom branş ajanları & BESYO akademisi', category: 'sports' },
  { id: 'sportvisionx', name: 'Sport Vision X', icon: <Ghost size={16} />, color: '#00f2fe', description: '3D ikiz, ritim kilidi, viral klip, termal radar', category: 'sports' },
  { id: 'youthdev', name: 'Gelişim Ligi & Biyometrik', icon: <Ruler size={16} />, color: '#4ade80', description: 'PHV büyüme atağı & genç sporcu akademisi', category: 'sports' },
  { id: 'holistic', name: '360° Çocuk Gelişimi', icon: <HeartPulse size={16} />, color: '#f472b6', description: 'Veli anketi, medikal OCR, tribün analizi', category: 'sports' },
  { id: 'scouting', name: 'Scouting & Rekabet', icon: <Trophy size={16} />, color: '#f59e0b', description: 'Kulüp ihracı & küresel rekabet zekası', category: 'sports' },
  { id: 'toolsagents', name: 'İstemci Araçlar & Ajan Hattı', icon: <Wrench size={16} />, color: '#ecc94b', description: 'KVKK uyumlu araçlar & 6 ajanlı üretim hattı', category: 'infra' },
  { id: 'smartcampus', name: 'Akıllı Tesis Operasyonları', icon: <Building2 size={16} />, color: '#34d399', description: 'Enerji, lig, güvenlik, bakım, concierge', category: 'infra' },
  { id: 'mediacom', name: 'Medya Kasası & KVKK', icon: <ShoppingBag size={16} />, color: '#f472b6', description: 'Klip satışı, Daze-Gift, hukuk uyumu', category: 'growth' },
  { id: 'procurement', name: 'Donanım & Satın Alma', icon: <Package size={16} />, color: '#00f2fe', description: 'Şartname, tedarikçi, ihale, beyanname', category: 'infra' },
  { id: 'hrdispatch', name: 'Otonom Vardiya & İK', icon: <UserPlus size={16} />, color: '#4ade80', description: 'İşe davet, yoğunluk radarı, skorlama', category: 'ops' },
  { id: 'caravan', name: 'Konaklama & Karavan', icon: <Car size={16} />, color: '#34d399', description: 'Otel, karavan & kort slotları', category: 'sports' },
  { id: 'tent', name: 'Çadır Konaklama & Glamping', icon: <Tent size={16} />, color: '#fbbf24', description: 'Yer tahsisi & fiziksel konaklama (ekipman kiralama Pazaryeri nde)', category: 'sports' },
  { id: 'market', name: 'Pazaryeri & Kiralama', icon: <Store size={16} />, color: '#f87171', description: 'Sıfır satış • 2. el • kiralama & TBYB', category: 'sports' },
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

  // 🧠 YENİ STRATEJİK MODÜLLER (5'i 1 Arada Mega Entegrasyon)
  { id: 'telemetry', name: 'Ajan Orkestrasyonu & Telemetri', icon: <Cpu size={16} />, color: '#00f2fe', description: 'Multi-agent LLM canlı metrikleri', category: 'core' },
  { id: 'osint', name: 'OSINT & Saha Radarı', icon: <Radar size={16} />, color: '#f87171', description: 'Çevre güvenliği & SAR alarmı', category: 'infra' },
  { id: 'gcp', name: 'Google Cloud Hibe Asistanı', icon: <Cloud size={16} />, color: '#60a5fa', description: '350K$ AI cloud hibe motoru', category: 'growth' },
  { id: 'saas', name: 'Global SaaS & USD Fatura', icon: <CreditCard size={16} />, color: '#34d399', description: 'Stripe / ABD LLC köprüsü', category: 'growth' },
  { id: 'music', name: 'Likya Müzik & Atmosfer', icon: <Music size={16} />, color: '#ecc94b', description: 'Akustik frekans istasyonu & gamification', category: 'daze' },
];

// ============================================================================
// ➕ DİNAMİK MODÜL OLUŞTURUCU & SÜRÜKLE-BIRAK DÜZEN (Persistence: localStorage)
// ============================================================================
interface CustomModule {
  id: string;
  name: string;
  icon: string;          // emoji
  color: string;
  description: string;
  route: string;
  category: string;      // domain id
}

const LS_CUSTOM_MODULES = 'likya_custom_modules_v1';
const LS_DOMAIN_ORDER = 'likya_domain_order_v2'; // v2: 6 dallı Holding Ajan Ağacı

// Varsayılan düzen: MODULE_DOMAINS'ten üretilir
function defaultDomainOrder(): Record<string, string[]> {
  const order: Record<string, string[]> = {};
  for (const dom of MODULE_DOMAINS) order[dom.id] = [...dom.moduleIds];
  return order;
}

// localStorage'dan düzeni yükle (bozuk/eksikse varsayılana düş)
function loadDomainOrder(): Record<string, string[]> {
  try {
    const raw = localStorage.getItem(LS_DOMAIN_ORDER);
    if (raw) {
      const parsed = JSON.parse(raw) as Record<string, string[]>;
      const defaults = defaultDomainOrder();
      // Tüm varsayılan modüller korunur, yeni domain id'leri de eklenir
      const merged: Record<string, string[]> = {};
      for (const dom of MODULE_DOMAINS) {
        const saved = parsed[dom.id];
        const defIds = defaults[dom.id];
        const present = Array.isArray(saved) ? saved.filter((id) => defIds.includes(id) || id.startsWith('custom-')) : [];
        for (const id of defIds) if (!present.includes(id)) present.push(id);
        merged[dom.id] = present;
      }
      return merged;
    }
  } catch {
    // localStorage erişilemezse sessizce varsayılan
  }
  return defaultDomainOrder();
}

function loadCustomModules(): CustomModule[] {
  try {
    const raw = localStorage.getItem(LS_CUSTOM_MODULES);
    if (raw) {
      const parsed = JSON.parse(raw) as CustomModule[];
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // boş dön
  }
  return [];
}

// ➕ Yeni Modül Oluşturma Modalı
const EMOJI_PRESETS = ['🧩', '📊', '⚡', '🎯', '🧠', '🏆', '📈', '🔔', '🛰️', '🎪', '🧭', '💡'];

function ModuleCreateModal({ onClose, onSave }: { onClose: () => void; onSave: (name: string, icon: string, category: string, description: string, route: string) => void }) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('🧩');
  const [category, setCategory] = useState(MODULE_DOMAINS[0].id);
  const [description, setDescription] = useState('');
  const [route, setRoute] = useState('');

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 90, display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(5,10,20,0.8)', backdropFilter: 'blur(8px)', padding: '16px',
    }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} style={{
        width: '100%', maxWidth: '420px', borderRadius: '20px', padding: '22px',
        background: '#0f172a', border: '1px solid rgba(0,242,254,0.3)', boxShadow: '0 30px 60px rgba(0,0,0,0.6)',
        display: 'flex', flexDirection: 'column', gap: '14px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '15px', fontWeight: 800, color: '#fff' }}>➕ Yeni Modül Ekle</div>
          <button onClick={onClose} style={{ width: '30px', height: '30px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', cursor: 'pointer' }}>✕</button>
        </div>

        <label style={{ fontSize: '10px', color: '#64748b' }}>MODÜL ADI</label>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="örn. E-Spor Ligi"
          style={{ padding: '10px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: '#e2e8f0', fontSize: '13px', outline: 'none' }} />

        <label style={{ fontSize: '10px', color: '#64748b' }}>İKON (emoji veya yazın)</label>
        <input value={icon} onChange={(e) => setIcon(e.target.value)} maxLength={4}
          style={{ width: '60px', padding: '8px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', fontSize: '18px', outline: 'none', textAlign: 'center' }} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {EMOJI_PRESETS.map((e) => (
            <button key={e} onClick={() => setIcon(e)} style={{ fontSize: '18px', padding: '6px 9px', borderRadius: '8px', cursor: 'pointer', border: icon === e ? '1px solid #00f2fe' : '1px solid rgba(255,255,255,0.12)', background: icon === e ? 'rgba(0,242,254,0.15)' : 'rgba(255,255,255,0.04)' }}>{e}</button>
          ))}
        </div>

        <label style={{ fontSize: '10px', color: '#64748b' }}>AİT OLDUĞU KATEGORİ</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)}
          style={{ padding: '10px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: '#e2e8f0', fontSize: '13px', outline: 'none' }}>
          {MODULE_DOMAINS.map((d) => (
            <option key={d.id} value={d.id} style={{ background: '#0f172a', color: d.color }}>{d.icon} {d.name}</option>
          ))}
        </select>

        <label style={{ fontSize: '10px', color: '#64748b' }}>AÇIKLAMA</label>
        <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Modülün görevi kısaca"
          style={{ padding: '10px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: '#e2e8f0', fontSize: '13px', outline: 'none' }} />

        <label style={{ fontSize: '10px', color: '#64748b' }}>BAĞLANTI ROTASI (opsiyonel)</label>
        <input value={route} onChange={(e) => setRoute(e.target.value)} placeholder="örn. /espor-ligi"
          style={{ padding: '10px 12px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)', color: '#e2e8f0', fontSize: '13px', outline: 'none', fontFamily: 'monospace' }} />

        <button onClick={() => onSave(name, icon, category, description, route)}
          style={{ padding: '12px', borderRadius: '12px', cursor: 'pointer', border: '1px solid rgba(0,242,254,0.6)', background: 'linear-gradient(135deg, rgba(0,242,254,0.25), rgba(167,139,250,0.2))', color: '#fff', fontSize: '13px', fontWeight: 800 }}>
          ✨ Modülü Ekle
        </button>
      </div>
    </div>
  );
}


// Kullanılabilir AI Modelleri (Model Seçici)
const MODEL_OPTIONS = [
  { id: 'flash', label: 'Flash', icon: '⚡', desc: 'Hızlı yanıt' },
  { id: 'pro', label: 'Pro (Derin Düşünme)', icon: '🧠', desc: 'Analitik düşünme' },
  { id: 'cline', label: 'Cline (Otonom Kodlayıcı)', icon: '🛠️', desc: 'Kod üretimi' },
];

// Basit & güvenli Markdown renderer — başlık, kalın, italik, liste, kod, ayraç.
// React string'leri otomatik escape ettiği için XSS güvenlidir; ham etiketler
// (###, *, **, -, 1.) artık düz metin olarak görünmez.
const inlineMarkdown = (text: string) => {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**'))
      return <strong key={i} style={{ color: '#fff', fontWeight: '700' }}>{part.slice(2, -2)}</strong>;
    if (part.startsWith('`') && part.endsWith('`'))
      return <code key={i} style={{ background: 'rgba(255,255,255,0.1)', padding: '1px 5px', borderRadius: '4px', fontSize: '0.92em', color: '#00f2fe' }}>{part.slice(1, -1)}</code>;
    if (part.startsWith('*') && part.endsWith('*'))
      return <em key={i} style={{ color: '#cbd5e1' }}>{part.slice(1, -1)}</em>;
    return <span key={i}>{part}</span>;
  });
};

const renderMarkdown = (text: string) => {
  const lines = text.split('\n');
  const blocks: React.ReactNode[] = [];
  let list: React.ReactNode[] = [];
  let listOrdered = false;

  const flushList = () => {
    if (list.length === 0) return;
    const key = `l-${blocks.length}`;
    blocks.push(
      listOrdered
        ? <ol key={key} style={{ margin: '4px 0 4px 20px', paddingLeft: '4px' }}>{list}</ol>
        : <ul key={key} style={{ margin: '4px 0 4px 4px', paddingLeft: '16px' }}>{list}</ul>
    );
    list = [];
    listOrdered = false;
  };

  lines.forEach((line, i) => {
    const t = line.trim();
    if (!t) { flushList(); return; }

    // Başlık: ### / ## / #
    if (/^#{1,3}\s/.test(t)) {
      flushList();
      const level = t.match(/^#+/)?.[0].length ?? 1;
      const content = t.replace(/^#+\s/, '');
      blocks.push(
        <div key={`h-${i}`} style={{
          fontWeight: '700', color: '#fff',
          fontSize: level === 1 ? '17px' : level === 2 ? '15px' : '13px',
          margin: '8px 0 4px', letterSpacing: '0.2px',
        }}>
          {inlineMarkdown(content)}
        </div>
      );
      return;
    }

    // Sırasız liste: - veya •
    if (/^[-•]\s/.test(t)) {
      listOrdered = false;
      list.push(<li key={`li-${i}`} style={{ margin: '2px 0' }}>{inlineMarkdown(t.replace(/^[-•]\s/, ''))}</li>);
      return;
    }

    // Sıralı liste: 1. 2. 3.
    if (/^\d+\.\s/.test(t)) {
      listOrdered = true;
      list.push(<li key={`oli-${i}`} style={{ margin: '2px 0' }}>{inlineMarkdown(t.replace(/^\d+\.\s/, ''))}</li>);
      return;
    }

    // Yatay ayraç: ---
    if (/^-{3,}$/.test(t)) {
      flushList();
      blocks.push(<div key={`hr-${i}`} style={{ borderTop: '1px solid rgba(255,255,255,0.15)', margin: '8px 0' }} />);
      return;
    }

    // Kod bloğu: ```...```
    if (/^```/.test(t)) {
      flushList();
      const endIdx = lines.findIndex((l, j) => j > i && l.trim().startsWith('```'));
      const codeLines = endIdx === -1 ? [] : lines.slice(i + 1, endIdx);
      blocks.push(
        <pre key={`pre-${i}`} style={{
          background: 'rgba(0,0,0,0.35)', border: '1px solid rgba(0,242,254,0.25)',
          borderRadius: '8px', padding: '8px 12px', fontSize: '12px', overflowX: 'auto',
          margin: '6px 0', color: '#a5f3fc', whiteSpace: 'pre-wrap',
        }}>
          {codeLines.join('\n')}
        </pre>
      );
      return;
    }

    // Normal paragraf
    flushList();
    blocks.push(<span key={`p-${i}`} style={{ display: 'block', margin: '3px 0' }}>{inlineMarkdown(t)}</span>);
  });
  flushList();
  return <>{blocks}</>;
};

// Sohbet Konu Başlıkları (Chat History Threads)
interface ChatAttachment {
  name: string;
  type: string;
  dataUrl: string;
}

interface ChatMessage {
  role: 'user' | 'ceo';
  text: string;
  time: string;
  attachment?: ChatAttachment;
  memoryOffer?: { category: string; decision_text: string };
  approvalRequest?: { text: string };
}

interface ChatThread {
  id: string;
  title: string;
  messages: ChatMessage[];
}

const INITIAL_CHAT_THREADS: ChatThread[] = [
  {
    id: 'thread-1',
    title: 'Ekstrem Spor Kulüpleri',
    messages: [
      { role: 'user', text: 'Ekstrem spor kulüpleri için strateji öner', time: '10:15' },
      { role: 'ceo', text: '📊 Efendim, ekstrem spor kulüpleri konusunu Likya ile birlikte masaya yatırdık. 😊\n\n🏢 Pazar biraz şöyle:\n• Türkiye\'de ekstrem spor kulüpleri hızla büyüyor\n• Padel, tırmanış ve su sporları ciddi ilgi görüyor\n\n💡 Size birkaç zarif öneri:\n1. Amatör spor kulübü fonu kurabiliriz\n2. Upcycling ile ekipman havuzu oluşturabiliriz\n3. Genç sporculara burs verebiliriz\n\nAnalizimiz hazır, isterseniz üzerinden birlikte geçelim.', time: '10:16' },
    ],
  },
  {
    id: 'thread-2',
    title: 'Sinir Sistemi Testi',
    messages: [
      { role: 'user', text: 'Sinir sistemi bağlantısını test et', time: '11:30' },
      { role: 'ceo', text: '🧠 Efendim, sinir sisteminin nabzını tuttuk, her şey yolunda! 😊\n\n🔍 Kontrol ettiğimiz yerler:\n• Supabase bağlantısı — sağlam\n• LLM ModelRouter — pürüzsüz çalışıyor\n• API endpoint\'leri — hepsi ayakta\n\n✅ Kısacası tüm sistemler çevrimiçi ve keyifler yerinde.', time: '11:31' },
    ],
  },
  {
    id: 'thread-3',
    title: 'SaaS Stratejisi',
    messages: [
      { role: 'user', text: 'SaaS paketleme stratejisi hazırla', time: '14:00' },
      { role: 'ceo', text: '📊 Efendim, SaaS stratejinizi sizin için derledim. 😊\n\n📦 Önerdiğim paketler:\n• Starter: 990₺/ay\n• Pro: 2.490₺/ay\n• Enterprise: Özel görüşme ile\n\n🎯 Yol haritamız:\n• Landing Page + 7 gün ücretsiz deneme\n• Cold outreach metinleri\n• Auto-Marketing Agent devrede\n\nBeğenirseniz hemen uygulamaya geçebiliriz.', time: '14:02' },
    ],
  },
];

// ============================================================================
// 💾 SOHBET GEÇMİŞİ KALICI DEPOLAMA — silinen konuşmalar asla geri gelmez
// threads durumu localStorage'a kaydedilir; sayfa yenilense bile korunur.
// ============================================================================
const THREAD_STORAGE_KEY = 'likya_chat_threads_v1';

function loadThreads(): ChatThread[] {
  if (typeof window === 'undefined') return INITIAL_CHAT_THREADS;
  try {
    const raw = window.localStorage.getItem(THREAD_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed as ChatThread[];
    }
  } catch {
    /* bozuk/erişilemez veri → varsayılanlar */
  }
  return INITIAL_CHAT_THREADS;
}

function saveThreads(threads: ChatThread[]): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(THREAD_STORAGE_KEY, JSON.stringify(threads));
  } catch {
    /* depolama dolu/kapalı — sessizce geç */
  }
}

// Mobil/Tablet tespiti için media query hook'u (native app deneyimi)
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia(query);
    setMatches(mql.matches);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

export default function CEOCommandCenter() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeView, setActiveView] = useState<string>('exec'); // 'exec' varsayılan (Patron yalın panel)
  const [threads, setThreads] = useState<ChatThread[]>(loadThreads);
  const [activeThreadId, setActiveThreadId] = useState<string | null>(null);

// 🤖 PRAISONAI AJAN GÖREV DEDEKTÖRÜ — komut metninden ajan görevi + metrik anlık görüntüsü
function detectPraisonTaskInline(text: string): { task: AgentTask; snapshot: Record<string, number | string> } | null {
  const lower = text.toLowerCase();
  const numFrom = (re: RegExp): number => { const m = text.match(re); const v = m ? Number(m[1]) : NaN; return isNaN(v) ? 0 : v; };

  if (/(stok|envanter|sipariş|reçete|tedarik)/.test(lower))
    return { task: 'STOK', snapshot: { stok: numFrom(/(\d+)\s*(?:adet|birim|kg)/) || 120, reorderPoint: 150 } };
  if (/(vardiya|işe davet|personel|çalışan|takviye)/.test(lower))
    return { task: 'VARDİYA', snapshot: { yogunluk: numFrom(/(\d+)%?/) || 82, personel: 2 } };
  if (/(tesis|turnike|uptime|saha|bakım|çevrimdışı)/.test(lower))
    return { task: 'TESİS', snapshot: { offlineCihaz: numFrom(/(\d+)\s*(?:cihaz|turnike)/) || 1, uptimePct: 94 } };
  if (/(müzik|bpm|dj|atmosfer|ritim)/.test(lower))
    return { task: 'MÜZİK', snapshot: { bpm: 118, doluluk: 76 } };
  if (/(bildirim|uyarı|alert|kritik olay)/.test(lower))
    return { task: 'BİLDİRİM', snapshot: { kritikOlay: 1 } };
  if (/(nakit|finans|bütçe|likidite|ödeme)/.test(lower))
    return { task: 'FİNANS', snapshot: { nakit: 120000, yuk: 150000 } };
  if (/(antrenman|şut|hız|sporcu|radar)/.test(lower))
    return { task: 'SPORT', snapshot: { hizKmh: 148, formIndex: 82 } };
  return null;
}

  const [openCategory, setOpenCategory] = useState<string>('chat');
  const [filterDomain, setFilterDomain] = useState<string>('all'); // mobil modül filtresi
  const [openMobileDomain, setOpenMobileDomain] = useState<string | null>('biz'); // mobil akordiyon

  // ➕ Dinamik modül & sürükle-bırak durumu
  const [customModules, setCustomModules] = useState<CustomModule[]>(loadCustomModules);
  const [domainOrder, setDomainOrder] = useState<Record<string, string[]>>(loadDomainOrder);

  // 🎙️ OpenLive ses köprüsü durumu
  const [voiceActive, setVoiceActive] = useState(false);
  const speechRecognitionRef = useRef<ReturnType<typeof createSpeechRecognitionBridge> | null>(null);

  // 🎙️ OpenLive ses köprüsü — mikrofon düğmesi toggle'ı
  // GERÇEK STT: Web Speech Recognition (tr-TR) — süre-bazlı simülasyon
  // transkript KALDIRILDI; desteklenmeyen tarayıcıda açık bilgi verilir.
  const toggleVoice = () => {
    if (voiceActive) {
      setVoiceActive(false);
      if (speechRecognitionRef.current) {
        speechRecognitionRef.current.stop();
        speechRecognitionRef.current = null;
      }
      return;
    }
    // Gerçek STT başlat (Web Speech — tr-TR)
    if (isSpeechRecognitionSupported()) {
      const bridge = createSpeechRecognitionBridge({
        lang: 'tr-TR',
        interimResults: true,
        onResult: (finalTranscript) => {
          if (finalTranscript.trim()) {
            setInput(finalTranscript.trim());
            handleSend(finalTranscript.trim());
          }
        },
        onEnd: () => {
          setVoiceActive(false);
          speechRecognitionRef.current = null;
        },
        onError: (error) => {
          setVoiceActive(false);
          speechRecognitionRef.current = null;
          if (error === 'not-allowed') {
            setMessages((prev) => [...prev, { role: 'ceo', text: '⚙️ Sistem: Mikrofon izni reddedildi. Lütfen tarayıcı ayarlarından izin verin.', time: now() }]);
          }
        },
      });
      if (bridge) {
        speechRecognitionRef.current = bridge;
        setVoiceActive(true);
        setMessages((prev) => [...prev, { role: 'ceo', text: '🎙️ OpenLive (Web Speech): Dinliyorum Patron — konuşun, metin anında girdiye aktarılır. Tekrar dokununca durdururum.', time: now() }]);
        bridge.start();
        return;
      }
    }
    // Web Speech desteklenmiyor → açık bilgi (simülasyon transkript YOK)
    setMessages((prev) => [...prev, { role: 'ceo', text: '🎙️ Sesli komut bu tarayıcıda desteklenmiyor (Web Speech gerekli). Lütfen Chrome veya Microsoft Edge kullanın.', time: now() }]);
  };

  const [showModuleModal, setShowModuleModal] = useState(false);
  const [dragState, setDragState] = useState<{ id: string; fromDomain: string } | null>(null);
  const [dropHint, setDropHint] = useState<{ domain: string; index: number } | null>(null);

  // 💾 Kalıcı hafıza: her değişiklik localStorage'a yazılır
  useEffect(() => {
    try { localStorage.setItem(LS_CUSTOM_MODULES, JSON.stringify(customModules)); } catch { /* sessiz */ }
  }, [customModules]);
  useEffect(() => {
    try { localStorage.setItem(LS_DOMAIN_ORDER, JSON.stringify(domainOrder)); } catch { /* sessiz */ }
  }, [domainOrder]);

  // Bir domain'in modül listesi (varsayılan + kullanıcı düzeni + özel modüller)
  const getDomainIds = (domId: string): string[] => domainOrder[domId] ?? MODULE_DOMAINS.find((d) => d.id === domId)?.moduleIds ?? [];

  // Modül nesnesini çöz: statik MODULES veya özel modül
  const findModule = (id: string): ModuleItem | CustomModule | undefined =>
    MODULES.find((m) => m.id === id) ?? customModules.find((c) => c.id === id);

  // ➕ Yeni modül ekle
  const addCustomModule = (name: string, icon: string, category: string, description: string, route: string) => {
    if (!name.trim()) return;
    const id = `custom-${Date.now()}`;
    const color = MODULE_DOMAINS.find((d) => d.id === category)?.color ?? '#00f2fe';
    const mod: CustomModule = { id, name: name.trim(), icon: icon.trim() || '🧩', color, description: description.trim(), route: route.trim(), category };
    setCustomModules((prev) => [...prev, mod]);
    setDomainOrder((prev) => {
      const arr = [...(prev[category] ?? MODULE_DOMAINS.find((d) => d.id === category)?.moduleIds ?? [])];
      arr.push(id);
      return { ...prev, [category]: arr };
    });
    setShowModuleModal(false);
  };

  // 🖱️ Sürükle-bırak: hedef domain'e bırak
  const handleDrop = (targetDomain: string, targetIndex: number) => {
    if (!dragState) return;
    const { id, fromDomain } = dragState;
    const fromArr = [...getDomainIds(fromDomain)];
    const fromIdx = fromArr.indexOf(id);
    if (fromIdx < 0) { setDragState(null); setDropHint(null); return; }
    fromArr.splice(fromIdx, 1);
    const toArr = [...getDomainIds(targetDomain)];
    if (fromDomain === targetDomain) {
      let idx = Math.min(Math.max(targetIndex, 0), toArr.length);
      if (fromIdx < targetIndex) idx -= 1;
      toArr.splice(Math.min(Math.max(idx, 0), toArr.length), 0, id);
    } else {
      toArr.splice(Math.min(Math.max(targetIndex, 0), toArr.length), 0, id);
    }
    setDomainOrder((prev) => ({ ...prev, [fromDomain]: fromArr, [targetDomain]: toArr }));
    setDragState(null);
    setDropHint(null);
  };

  // 🔄 Varsayılan düzene sıfırla (özel modüller de temizlenir)
  const resetLayout = () => {
    setDomainOrder(defaultDomainOrder());
    setCustomModules([]);
    setDragState(null);
    setDropHint(null);
  };

  const [input, setInput] = useState('');
  const [attachMenuOpen, setAttachMenuOpen] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState<ChatAttachment | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedModel, setSelectedModel] = useState('flash');
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [backendOnline, setBackendOnline] = useState(true); // Header LED'i için
  const [approvedMemoryOffers, setApprovedMemoryOffers] = useState<string[]>([]);

  // 🏛️ Stratejik kararı ömür boyu kalıcı hafızaya mühürle
  const handleMemoryApprove = async (category: string, decisionText: string) => {
    try {
      const res = await fetch('/api/v1/ceo/memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve', category, decision_text: decisionText }),
      });
      const result = await res.json();
      if (result.success) {
        setApprovedMemoryOffers((prev) => (prev.includes(decisionText) ? prev : [...prev, decisionText]));
        setMessages((prev) => [...prev, {
          role: 'ceo',
          text: result.message || '🏛️ Karar ömür boyu kalıcı hafızaya mühürlendi.',
          time: now(),
        }]);
      } else {
        setMessages((prev) => [...prev, {
          role: 'ceo',
          text: `⚠️ Karar kaydedilemedi: ${result.error || 'bilinmeyen hata'}`,
          time: now(),
        }]);
      }
    } catch {
      setMessages((prev) => [...prev, {
        role: 'ceo',
        text: '⚠️ Efendim, karar kaydedilirken bir sorun oluştu. Lütfen tekrar deneyin.',
        time: now(),
      }]);
    }
  };

  // 🧑‍💼 Kritik işlem onayı (Human Approval Interrupt)
  const handleApproveCritical = async (approvalText: string) => {
    setMessages((prev) => prev.map((m) => (m.approvalRequest?.text === approvalText ? { ...m, approvalRequest: undefined } : m)));
    setMessages((prev) => [...prev, { role: 'ceo', text: '✅ Efendim, onayınız alındı. İşlem gerçekleştiriliyor...', time: now() }]);
    await handleSend(approvalText, true); // approved bayrağıyla yeniden gönder
  };

  const handleRejectCritical = (approvalText: string) => {
    setMessages((prev) => prev.map((m) => (m.approvalRequest?.text === approvalText ? { ...m, approvalRequest: undefined } : m)));
    setMessages((prev) => [...prev, {
      role: 'ceo',
      text: `🛑 Efendim, işlem iptal edildi. Hiçbir değişiklik yapılmadı.\n\n📋 İptal edilen: "${approvalText}"`,
      time: now(),
    }]);
  };

  // Sistemsel durum kontrolü — header LED'i (yeşil: aktif, kırmızı: çevrimdışı)
  const checkBackendHealth = useCallback(async () => {
    try {
      const controller = new AbortController();
      const t = setTimeout(() => controller.abort(), 5000);
      const res = await fetch('/api/v1/ceo/health', { method: 'GET', signal: controller.signal });
      clearTimeout(t);
      setBackendOnline(res.ok);
    } catch {
      setBackendOnline(false);
    }
  }, []);

  useEffect(() => {
    checkBackendHealth();
    const interval = setInterval(checkBackendHealth, 30000);
    return () => clearInterval(interval);
  }, [checkBackendHealth]);

  // Konu başlığına tıklandığında o konunun mesajlarını yükle
  const loadThread = (threadId: string) => {
    const thread = threads.find((t) => t.id === threadId);
    if (thread) {
      setActiveThreadId(threadId);
      setActiveView('chat');
      setMessages(thread.messages);
    }
  };

  // Konu başlığını silme fonksiyonu — kalıcı olarak kaldırır
  const handleDeleteThread = (threadId: string) => {
    setThreads((prev) => {
      const next = prev.filter((t) => t.id !== threadId);
      saveThreads(next); // 💾 silme işlemini kalıcılaştır — yenilenince geri gelmez
      return next;
    });
    if (activeThreadId === threadId) {
      startNewChat();
    }
  };

  // Sohbet geçmişini otomatik kalıcılaştır (değişen her durum kaydedilir)
  useEffect(() => {
    saveThreads(threads);
  }, [threads]);

  // Yeni sohbet başlat
  const startNewChat = () => {
    setActiveThreadId(null);
    setActiveView('chat');
    setMessages([]);
  };

  // Mesajlar değiştiğinde otomatik aşağı kaydır
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isProcessing]);

  const now = () => new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });

  // Not: Akıllı yönlendirme artık tamamen sunucuda (route.ts classifyIntent) yapılıyor;
  // eski istemci tarafı isSoftwareRequest/isBusinessRequest fonksiyonları kaldırıldı.

  const isWebSearchQuery = (text: string): boolean => {
    const lower = text.toLowerCase();
    return (lower.includes('web') || lower.includes('internet') || lower.includes('arama') || lower.includes('search')) &&
           (lower.includes('araştır') || lower.includes('araştir') || lower.includes('yapabiliyor') || lower.includes('yapabilir') || lower.includes('aktif') || lower.includes('var mı') || lower.includes('var mi') || lower.includes('çevrimiçi'));
  };

  // ===== MULTIMODAL ARAÇ MENÜSÜ (Ataş + Dosya/Görsel Yükleme) =====
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPendingAttachment({ name: file.name, type: file.type || 'application/octet-stream', dataUrl: String(reader.result) });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
    setAttachMenuOpen(false);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPendingAttachment({ name: file.name, type: file.type || 'image/*', dataUrl: String(reader.result) });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
    setAttachMenuOpen(false);
  };

  const removeAttachment = () => setPendingAttachment(null);

  const quickCommand = (command: string) => {
    setInput(command);
    setAttachMenuOpen(false);
  };

  const handleSend = async (overrideText?: string, approved?: boolean) => {
    const rawText = (overrideText ?? input).trim();
    // 🛡️ Zero-Trust Kalkanı: zararlı payloadları sessizce temizle (meşru kullanıcı asla engellenmez)
    const text = sanitizeInput(rawText).clean;
    const attach = pendingAttachment; // null'lanmadan önce yakala (multimodal görsel için)
    if (!text || isProcessing) return;

    setMessages((prev) => [...prev, { role: 'user', text, time: now(), attachment: pendingAttachment || undefined }]);
    setInput('');
    setPendingAttachment(null);
    setIsProcessing(true);

    // 🤖 PRAISONAI AJAN ZİNCİRİ — Research → Plan → Execute (üst öncelik)
    const praisonDetect = detectPraisonTaskInline(text);
    if (praisonDetect) {
      const chain = runPraisonChain({ task: praisonDetect.task, command: text, snapshot: praisonDetect.snapshot });
      setTimeout(() => {
        const msg =
          `🤖 PraisonAI Ajan Zinciri — ${praisonDetect.task}\n\n` +
          `🦾 RESEARCH:\n${chain.research.findings.map((f) => '• ' + f).join('\n')} (risk: ${chain.research.riskLevel})\n\n` +
          `🧩 PLAN:\n${chain.plan.steps.map((s) => `${s.order}. ${s.action} [${s.priority}]`).join('\n')}\n\n` +
          `⚙️ EXECUTE:\n${chain.execute.effect} ✅`;
        setMessages((prev) => [...prev, { role: 'ceo', text: msg, time: now() }]);
        setIsProcessing(false);
      }, 700);
      return;
    }

    // Akıllı yönlendirme
    const isWebSearch = isWebSearchQuery(text);

    // Özel Web Arama sorgusu yanıtı (Kullanıcının araştırma yeteneğini test etme sorusu)
    if (isWebSearch) {
      setTimeout(() => {
        setMessages((prev) => [...prev, {
          role: 'ceo',
          text: `🌐 İzninizle bir an web radarlarımı devreye aldım, efendim. 😊\n\nEvet, şu an internette gerçek zamanlı araştırma yapabiliyorum!\n\n🔍 Kullanabileceğim kanallar:\n• 🌐 **Google Search & Likya Deep Research:** Güncel pazar verileri, rakip analizleri ve global trendler\n• 🛰️ **OSINT Saha Radarı:** Canlı haber kaynakları ve açık kaynak istihbaratı\n• 💻 **Geliştirici & Teknoloji Ağları:** GitHub, NPM, PyPI ve güncel dokümantasyonlar\n\n💡 **Sizi ne mutlu ederse onu araştırayım:**\n- *"2025 ekstrem spor trendlerini web'de araştır."*\n- *"Padel tenis kortu yapım maliyetlerini listele."*\n- *"Google Cloud $350K hibe programı şartlarını güncel kaynaklardan bul."*\n\n🎯 Yeter ki siz söyleyin, web radarlarımı hemen sizin için çalıştırayım!`,
          time: now(),
        }]);
        setIsProcessing(false);
      }, 1000);
      return;
    }

    try {
      // GERÇEK API ÇAĞRISI - Backend /api/v1/ceo/execute
      // ⏱️ 60sn zaman aşımı: backend takılırsa isProcessing sonsuza dek kilitlenmesin
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);
      const response = await fetch('/api/v1/ceo/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          command: wrapWithContext(loadContext(), text),
          ...(approved ? { approved: true } : {}),
          // 👁️ Multimodal görsel payload — Gemini inlineData: { mimeType, data }
          ...(attach && attach.type.startsWith('image/')
            ? { image: { name: attach.name, mimeType: attach.type, data: attach.dataUrl.split(',')[1] ?? attach.dataUrl } }
            : {}),
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        setBackendOnline(true);
        const result = await response.json();
        // Backend'den dönen GERÇEK sonucu ekrana bas
        if (result.success) {
          setMessages((prev) => [...prev, {
            role: 'ceo',
            text: result.answer
              ? result.answer
              : `🧠 Efendim, isteğiniz başarıyla yerine getirildi! 😊\n\n${result.motor === 'deepseek' ? '**[🧠 Cline/DeepSeek]** DeepSeek Coder motoru' : '**[⚡ Gemini/Ollama]** Gemini motoru'} çalıştı.${result.healed ? '\n\n🩺 Efendim, arka plan servisi otomatik onarıldı ve talebiniz başarıyla tamamlandı.' : ''}\n\n📋 Talebiniz: "${text}"\n\n📁 İlgilendiğim dosya: ${result.file || 'belirlenemedi'}\n\n✅ Yapılan işlem: ${result.action || 'tamamlandı'}\n\n📊 Detay: ${result.bytes_written ? `${result.bytes_written} byte yazıldı` : result.message || 'başarıyla tamamlandı'}`,
            time: now(),
            ...(result.memory_offer ? { memoryOffer: result.memory_offer } : {}),
          }]);
        } else if (result.requires_approval) {
          // 🧑‍💼 İNSAN ONAYI KESİNTİSİ — kritik işlem için Patron onayı
          setMessages((prev) => [...prev, {
            role: 'ceo',
            text: result.message || '🧑‍💼 Bu kritik işlem geri dönülemez olabilir. Onaylıyor musunuz?',
            time: now(),
            approvalRequest: { text },
          }]);
        } else {
          setMessages((prev) => [...prev, {
            role: 'ceo',
            text: result.message
              ? `${result.message}\n\n📋 Talebiniz: "${text}"\n\n❌ Detay: ${result.error || 'beklenmedik bir hata'}`
              : `🙏 Efendim, bu işte biraz ters gitti, üzgünüm.\n\n📋 Talebiniz: "${text}"\n\n❌ Karşılaştığım durum: ${result.error || 'beklenmedik bir hata'}\n\n🔧 Dilerseniz talebi biraz daha sadeleştirip tekrar deneyebiliriz.`,
            time: now(),
          }]);
        }
      } else {
        // Rota hata döndürdü — GERÇEK hatayı göster (yanıltıcı "backend yok" mesajı kaldırıldı)
        let errorText = `İşlem tamamlanamadı (HTTP ${response.status}). Lütfen tekrar deneyin.`;
        try {
          const errBody = await response.json();
          if (errBody?.message) {
            errorText = `${errBody.message}${errBody.error ? `\n\n❌ Detay: ${errBody.error}` : ''}`;
          } else if (errBody?.error) {
            errorText = `❌ ${errBody.error}`;
          }
        } catch {
          // JSON çözümlenemedi — status bilgisi yeterli
        }
        setMessages((prev) => [...prev, { role: 'ceo', text: errorText, time: now() }]);
      }
    } catch (e) {
      // Gerçek ağ/bağlantı hatası — LED kırmızıya döner
      const errMsg = e instanceof Error && e.name !== 'AbortError' ? e.message : 'İstek zaman aşımına uğradı (60 sn).';
      setBackendOnline(false);
      setMessages((prev) => [...prev, {
        role: 'ceo',
        text: `⚠️ Efendim, sunucuya ulaşamadım: ${errMsg}\n\n🔧 Lütfen birkaç saniye sonra tekrar deneyin.`,
        time: now(),
      }]);
      // LED'i gerçek duruma göre yenile
      setTimeout(checkBackendHealth, 3000);
    }
    setIsProcessing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      // Canlı DOM değerini ilet — state senkron olmayabilir
      handleSend(e.currentTarget.value);
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      gap: isMobile ? '0' : '16px',
      minHeight: isMobile ? 'calc(100dvh - 150px)' : '600px',
      marginTop: isMobile ? '0' : '16px',
      width: '100%',
      maxWidth: '100vw',
      overflowX: 'hidden',
      paddingTop: 'env(safe-area-inset-top)',
      paddingBottom: isMobile ? 'calc(env(safe-area-inset-bottom) + 72px)' : 0,
    }}>
      {/* radarPulse & radarSpin keyframes - CANLI RADAR + radar animasyonları */}
      <style>{`
        @keyframes radarPulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 8px #48bb78; }
          50% { opacity: 0.35; box-shadow: 0 0 2px #48bb78; }
        }
        @keyframes radarSpin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
      {/* ================================================================ */}
      {/* SOL: AÇILIR/KAPANIR MODÜL MENÜSÜ (SIDEBAR) */}
      {/* ================================================================ */}
      <div style={{
        display: isMobile ? 'none' : 'flex',
        width: sidebarOpen ? '260px' : '48px',
        background: 'rgba(13, 19, 34, 0.9)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '16px',
        padding: sidebarOpen ? '16px' : '8px',
        transition: 'width 0.3s ease',
        overflow: 'hidden',
        flexShrink: 0,
        flexDirection: 'column',
      }}>
        {/* Sidebar Header - Likya Logosu + Komuta Merkezi */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          {sidebarOpen && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', whiteSpace: 'nowrap' }}>
              {/* Likya Neon Amblem - Geometrik 'L' Monogramı + CEO Tepe Şapkası (Cyan & Amber Işıltılı) */}
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, rgba(0,242,254,0.18), rgba(79,70,229,0.16), rgba(245,158,11,0.2))',
                border: '1px solid rgba(0,242,254,0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 18px rgba(0,242,254,0.35), inset 0 0 10px rgba(245,158,11,0.15)',
              }}>
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none">
                  <defs>
                    <linearGradient id="likyaLogo" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#00f2fe" />
                      <stop offset="55%" stopColor="#4facfe" />
                      <stop offset="100%" stopColor="#f59e0b" />
                    </linearGradient>
                  </defs>
                  {/* Neon radar halkası - fütüristik enerji */}
                  <circle cx="12" cy="12" r="10.4" stroke="url(#likyaLogo)" strokeWidth="0.7" opacity="0.35" strokeDasharray="3 2.4" />
                  {/* Geometrik L monogramı - şapkanın siperliğiyle birleşik */}
                  <path d="M8.2 20 V7 H16.4" stroke="url(#likyaLogo)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  {/* CEO tepe şapkası (crown) - L'nin üzerinde yükselen */}
                  <path d="M9.6 7 V3.6 H14.4 V7" stroke="#00f2fe" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  {/* Şapka siperliği - amber ışıltılı çizgi */}
                  <path d="M4.4 6.4 H19.6" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />
                  {/* Tepeden yükselen ışık huzmesi */}
                  <path d="M12 3.6 V1.9" stroke="#00f2fe" strokeWidth="1.4" strokeLinecap="round" />
                  {/* Amber bilgelik mücevheri - L köşesi */}
                  <circle cx="8.2" cy="7" r="1.4" fill="#f59e0b" />
                  <circle cx="8.2" cy="7" r="3" stroke="#f59e0b" strokeWidth="0.5" opacity="0.45" />
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
          {/* 🚀 ACİL BULUT IDE — github.dev web editörüne tek tık */}
          <a
            href="https://github.dev/ismetvardar-hub/likya_super_app"
            target="_blank"
            rel="noopener noreferrer"
            title="Acil Bulut IDE — web tabanlı editör (github.dev)"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '26px', height: '26px', borderRadius: '8px',
              background: 'rgba(0,242,254,0.08)', border: '1px solid rgba(0,242,254,0.3)',
              color: '#00f2fe', fontSize: '13px', textDecoration: 'none',
            }}
          >
            🚀
          </a>
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

        {/* Module List - Dinamik Akordiyon (Sürükle-Bırak + Özel Modül) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', overflowY: 'auto', flex: 1 }}>
          {/* ➕ Yeni Modül & Sıfırla */}
          <div style={{ display: 'flex', gap: '6px', padding: '0 2px 2px' }}>
            <button onClick={() => setShowModuleModal(true)}
              style={{ flex: 1, padding: '8px 10px', borderRadius: '10px', cursor: 'pointer', border: '1px dashed rgba(0,242,254,0.5)', background: 'rgba(0,242,254,0.08)', color: '#00f2fe', fontSize: '10px', fontWeight: 700 }}>
              ➕ Yeni Modül
            </button>
            <button onClick={resetLayout} title="Varsayılan düzene sıfırla"
              style={{ padding: '8px 10px', borderRadius: '10px', cursor: 'pointer', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.04)', color: '#94a3b8', fontSize: '10px', fontWeight: 600 }}>
              🔄
            </button>
          </div>

          {MODULE_DOMAINS.map((dom) => {
            const domIds = getDomainIds(dom.id);
            const catModules = domIds.map((id) => findModule(id)).filter((m): m is ModuleItem | CustomModule => !!m);
            const isOpen = openCategory === dom.id;
            const hasActive = catModules.some((m) => m.id === activeView);
            const isDropTarget = !!dragState && dragState.fromDomain !== dom.id;
            return (
              <div key={dom.id} style={{ marginBottom: '4px' }}>
                {/* Kategori Başlığı (Accordion Header + cross-category bırakma alanı) */}
                <button
                  onClick={() => setOpenCategory(isOpen ? '' : dom.id)}
                  onDragOver={(e) => { if (isDropTarget) { e.preventDefault(); setDropHint({ domain: dom.id, index: catModules.length }); } }}
                  onDrop={(e) => { if (isDropTarget) { e.preventDefault(); handleDrop(dom.id, catModules.length); } }}
                  onDragLeave={() => { if (isDropTarget) setDropHint(null); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '8px 10px',
                    borderRadius: '10px', cursor: 'pointer', fontSize: '11px', fontWeight: '700',
                    textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap',
                    border: dropHint?.domain === dom.id ? `1px dashed ${dom.color}` : 'none',
                    background: hasActive ? `${dom.color}15` : isDropTarget ? `${dom.color}0d` : 'rgba(255,255,255,0.03)',
                    color: hasActive ? dom.color : isDropTarget ? dom.color : '#94a3b8',
                    boxShadow: dropHint?.domain === dom.id ? `0 0 12px ${dom.color}40` : 'none',
                  }}
                >
                  <span>{dom.icon}</span>
                  <span style={{ flex: 1, textAlign: 'left' }}>{dom.name}</span>
                  <span style={{ fontSize: '9px', color: '#64748b' }}>{catModules.length}</span>
                  <span style={{ fontSize: '10px', color: '#64748b' }}>{isOpen ? '▾' : '▸'}</span>
                </button>

                {/* Kategori İçeriği (Accordion Body — sürükle-bırak sıralama) */}
                {isOpen && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px', paddingLeft: '8px' }}>
                    {catModules.map((mod, idx) => (
                      <button
                        key={mod.id}
                        draggable
                        onDragStart={(e) => { e.dataTransfer.setData('text/plain', mod.id); setDragState({ id: mod.id, fromDomain: dom.id }); }}
                        onDragEnd={() => { setDragState(null); setDropHint(null); }}
                        onDragOver={(e) => { if (dragState) { e.preventDefault(); setDropHint({ domain: dom.id, index: idx }); } }}
                        onDragLeave={() => { if (dragState) setDropHint(null); }}
                        onDrop={(e) => { if (dragState) { e.preventDefault(); handleDrop(dom.id, idx); } }}
                        onClick={() => setActiveView(mod.id)}
                        title={mod.name}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 10px', borderRadius: '8px',
                          cursor: 'grab',
                          borderTop: dropHint?.domain === dom.id && dropHint.index === idx ? `2px solid ${dom.color}` : '2px solid transparent',
                          borderLeft: activeView === mod.id ? `3px solid ${mod.color}` : '3px solid transparent',
                          background: activeView === mod.id ? `${mod.color}15` : dragState?.id === mod.id ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.02)',
                          color: activeView === mod.id ? mod.color : '#94a3b8',
                          fontSize: '12px', fontWeight: activeView === mod.id ? '600' : '400', whiteSpace: 'nowrap',
                          transition: 'all 0.15s', opacity: dragState?.id === mod.id ? 0.45 : 1,
                          boxShadow: activeView === mod.id ? `0 0 12px ${mod.color}30` : 'none',
                        }}
                      >
                        <span style={{ color: mod.color }}>{mod.icon}</span>
                        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>{mod.name}</span>
                        {'category' in mod && (mod as CustomModule).route && <span style={{ fontSize: '8px', color: '#64748b' }}>🧩</span>}
                        <span style={{ fontSize: '8px', color: '#475569' }}>⋮⋮</span>
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
        width: '100%',
        background: 'rgba(13, 19, 34, 0.9)',
        border: isMobile ? 'none' : '1px solid rgba(255,255,255,0.1)',
        borderRadius: isMobile ? '12px' : '16px',
        padding: isMobile ? '12px' : '24px',
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'hidden',
      }}>
        {/* MODÜL GÖRÜMÜ - activeView'e göre koşullu render */}
        {activeView !== 'chat' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(0,242,254,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>
                {findModule(activeView)?.icon || '📦'}
              </div>
              <div>
                <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff' }}>
                  {findModule(activeView)?.name || 'Modül'}
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                  {findModule(activeView)?.description || ''}
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
              {activeView === 'twin' && (
                <>
                  <Park3DTwin />
                  <ExtremeSimulatorSecurityCard />
                </>
              )}
              {activeView === 'exec' && <ExecutiveSimplifiedHud />}
              {activeView === 'extremes' && <ExtremeSCustomerPortal />}
              {activeView === 'iot' && <IoTSensorMap />}
              {activeView === 'ai' && (
                <>
                  <AIAgentAutonomousController />
                  <AgentMatrixSafetyCard />
                </>
              )}
              {activeView === 'crew' && (
                <>
                  <LikyaCrew />
                  <DazeCrewView />
                  <DazeVisionOrderTracker />
                </>
              )}
              {activeView === 'payment' && <PaymentIntegration />}
              {activeView === 'security' && (
                <>
                  <SecurityIncidentAgent />
                  <SecurityAppBuilderCard />
                </>
              )}
              {activeView === 'marketing' && <AutoMarketingAgent />}
              {activeView === 'dept' && (
                <>
                  <DepartmentAgents />
                  <CrmCustomerCard />
                  <ChatwootSupportPanel />
                </>
              )}
              {activeView === 'hr' && <HRPayrollAgent />}
              {activeView === 'facility' && <FacilityMaintenanceAgent />}
              {activeView === 'caravan' && <SmartCaravanPark />}
              {activeView === 'tent' && <SmartTentStore />}
              {activeView === 'market' && (
                <>
                  <MarketplaceGallery />
                  <MarketplacePaymentTerminal />
                  <DazeVisionKioskView />
                  <LikyaMarketplace />
                </>
              )}
              {activeView === 'room' && <RoomOnlyConcept />}
              {(() => {
                const cm = customModules.find((c) => c.id === activeView);
                return cm ? (
                  <div style={{ padding: '24px', borderRadius: '16px', background: 'rgba(255,255,255,0.02)', border: `1px solid ${cm.color}33`, display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '34px' }}>{cm.icon}</span>
                      <div>
                        <div style={{ fontSize: '18px', fontWeight: 800, color: cm.color }}>{cm.name} 🧩</div>
                        <div style={{ fontSize: '11px', color: '#94a3b8' }}>{cm.description}</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '10px', color: '#64748b', fontFamily: 'monospace', padding: '12px', borderRadius: '10px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      📁 Hedef Rota: <b style={{ color: '#00f2fe' }}>{cm.route || '/'}</b> — bu modül için bağımsız bir panel henüz üretilmedi; Cline talimatıyla inşa edilebilir.
                    </div>
                  </div>
                ) : null;
              })()}
              {activeView === 'athlete' && <AthletePerformanceAI />}
              {activeView === 'sportvision' && (
                <>
                  <SportVisionDashboard />
                  <SportsVisionMemoryCard />
                  <MultiAgentSportsCard />
                </>
              )}
              {activeView === 'sportvisionx' && <SportVisionX />}
              {activeView === 'youthdev' && <YouthDevelopmentDashboard />}
              {activeView === 'holistic' && (
                <>
                  <HolisticChildDashboard />
                  <LifeCoachDashboardCards />
                  <FamilyFinanceDashboardCards />
                </>
              )}
              {activeView === 'scouting' && <ScoutingEcosystem />}
              {activeView === 'toolsagents' && (
                <>
                  <ToolsAndAgentsDashboard />
                  <McpA2aOpsCard />
                  <NeonGraphView notes={(vaultData.notes ?? []).map((n) => ({ id: n.id, title: n.title, category: n.category, content: n.content }))} />
                </>
              )}
              {activeView === 'smartcampus' && <DazeSmartCampus />}
              {activeView === 'mediacom' && <SportMediaCommerceDashboard />}
              {activeView === 'procurement' && <ProcurementDashboard />}
              {activeView === 'hrdispatch' && <HRDispatchDashboard />}
              {activeView === 'risk' && <StrategicRiskShield />}
              {activeView === 'engine' && (
                <>
                  <SmartDestinationEngine />
                  <DazeChef />
                </>
              )}
              {activeView === 'supplier' && <SupplierManagement />}
              {activeView === 'pricing' && <DynamicLoyaltyPricing />}
              {activeView === 'stress' && <SystemStressTestAndEdgeController />}
              {activeView === 'monitor' && (
                <>
                  <MonitoringPanel />
                  <DazeSentinelHud />
                  <SupervisionZoneOverlay />
                  <N8nOrchestratorCard />
                  <BuiltinTemplateStoreCard />
                  <AdvancedEnterpriseModules />
                  <GrowthRadarSwarmCard />
                </>
              )}
              {activeView === 'finance' && (
                <>
                  <AutonomousFinanceAgents />
                  <VerifiedRevenueWidget />
                  <TrustLeaderboard />
                  <FinancePmDashboardCard />
                  <DazeNeuralMarketHud />
                </>
              )}
              {activeView === 'legal' && <DepartmentAgents />}
              {activeView === 'gift' && <AutoMarketingAgent />}
              {activeView === 'telemetry' && <AgentTelemetryPanel />}
              {activeView === 'osint' && <OSINTSahaRadar />}
              {activeView === 'gcp' && <GoogleCloudHibe />}
              {activeView === 'saas' && <GlobalSaaSFatura />}
              {activeView === 'music' && <LikyaMusicStation />}
              {activeView === 'balance' && <DensityBalancer />}
            </div>
          </div>
        )}

        {/* CHAT GÖRÜNÜMÜ - activeView === 'chat' olduğunda */}
        {activeView === 'chat' && (
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '0' : '16px', flex: 1, minHeight: 0 }}>
            {/* SOL/ORTA: ANA CHAT THREAD */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
              {/* Chat Header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(0,242,254,0.2), rgba(245,158,11,0.2))', border: '1px solid rgba(0,242,254,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 16px rgba(0,242,254,0.3)' }}>
                  <svg viewBox="0 0 24 24" width="26" height="26" fill="none">
                    <defs>
                      <linearGradient id="likyaHeaderLogo" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#00f2fe" />
                        <stop offset="55%" stopColor="#4facfe" />
                        <stop offset="100%" stopColor="#f59e0b" />
                      </linearGradient>
                    </defs>
                    <circle cx="12" cy="12" r="10.4" stroke="url(#likyaHeaderLogo)" strokeWidth="0.7" opacity="0.35" strokeDasharray="3 2.4" />
                    <path d="M8.2 20 V7 H16.4" stroke="url(#likyaHeaderLogo)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M9.6 7 V3.6 H14.4 V7" stroke="#00f2fe" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M4.4 6.4 H19.6" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />
                    <path d="M12 3.6 V1.9" stroke="#00f2fe" strokeWidth="1.4" strokeLinecap="round" />
                    <circle cx="8.2" cy="7" r="1.4" fill="#f59e0b" />
                    <circle cx="8.2" cy="7" r="3" stroke="#f59e0b" strokeWidth="0.5" opacity="0.45" />
                  </svg>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff' }}>Likya CEO</div>
                  {/* Canlılık LED'i — yeşil: sistem aktif, kırmızı: çevrimdışı */}
                  <span
                    title={backendOnline ? 'Sistem aktif' : 'Sistem çevrimdışı'}
                    style={{
                      width: '9px',
                      height: '9px',
                      borderRadius: '50%',
                      display: 'inline-block',
                      flexShrink: 0,
                      background: backendOnline ? '#22c55e' : '#ef4444',
                      boxShadow: backendOnline
                        ? '0 0 8px #22c55e, 0 0 16px rgba(34,197,94,0.5)'
                        : '0 0 8px #ef4444, 0 0 16px rgba(239,68,68,0.5)',
                      animation: backendOnline ? 'radarPulse 2s infinite' : 'none',
                    }}
                  />
                </div>
              </div>

              {/* 🧬 LifeOS Executive Context — CEO bağlamı */}
              <ExecutiveLifeOSCard />

              {/* 🎮 PokeToken Tracker — oyunlaştırılmış token rozeti */}
              <PokeTokenTracker />

              {/* 🧩 EKLENTİ DURUMU — kırılmasız plugin rozetleri */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '12px', alignItems: 'center' }}>
                {[
                  { label: '🎙️ OpenLive VAD+BargeIn', status: openLiveBridgeStatus() },
                  { label: '💬 Chatwoot', status: chatwootBridgeStatus() },
                  { label: '✋ Gesture (Ghost/Pinch)', status: gestureTrackerStatus() },
                  { label: '🔐 Logto 4L RBAC', status: 'SUPER_ADMIN→CREW guard kapısı' },
                  { label: '🌐 OpenRouter', status: openRouterStatus() },
                  { label: '🎙️ TTS VoiceBox', status: ttsEngineStatus() },
                  { label: '🦾 Runner H', status: runnerHStatus() },
                  { label: '👤 in3D Avatar', status: in3dBridgeStatus() },
                  { label: '🧊 Meshy 3D', status: meshyStatus() },
                  { label: '🎬 Viral Klip', status: viralClipStatus() },
                ].map((p) => (
                  <span
                    key={p.label}
                    title={p.status}
                    style={{
                      fontSize: '9px', padding: '3px 8px', borderRadius: '999px',
                      border: '1px solid rgba(0,242,254,0.35)',
                      background: 'rgba(0,242,254,0.08)',
                      color: '#67e8f9', fontWeight: 600, letterSpacing: '0.3px',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {p.label}
                  </span>
                ))}
              </div>

              {/* Chat Messages Area - Dinamik */}
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', padding: '8px' }}>
                {messages.length === 0 && !isProcessing ? (
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '18px', textAlign: 'center', padding: '24px', minHeight: '100%' }}>
                    {/* Likya Neon Amblem - Geometrik 'L' + CEO Tepe Şapkası (Cyan & Amber Işıltılı) */}
                    <div style={{
                      width: '76px', height: '76px', borderRadius: '24px',
                      background: 'linear-gradient(135deg, rgba(0,242,254,0.22), rgba(79,70,229,0.18), rgba(245,158,11,0.22))',
                      border: '1px solid rgba(0,242,254,0.45)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 0 34px rgba(0,242,254,0.4), inset 0 0 14px rgba(245,158,11,0.18)',
                      animation: 'radarPulse 2s infinite',
                    }}>
                      <svg viewBox="0 0 24 24" width="42" height="42" fill="none">
                        <defs>
                          <linearGradient id="likyaHeroLogo" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#00f2fe" />
                            <stop offset="55%" stopColor="#4facfe" />
                            <stop offset="100%" stopColor="#f59e0b" />
                          </linearGradient>
                        </defs>
                        <circle cx="12" cy="12" r="10.4" stroke="url(#likyaHeroLogo)" strokeWidth="0.7" opacity="0.35" strokeDasharray="3 2.4" />
                        <path d="M8.2 20 V7 H16.4" stroke="url(#likyaHeroLogo)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M9.6 7 V3.6 H14.4 V7" stroke="#00f2fe" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M4.4 6.4 H19.6" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />
                        <path d="M12 3.6 V1.9" stroke="#00f2fe" strokeWidth="1.4" strokeLinecap="round" />
                        <circle cx="8.2" cy="7" r="1.4" fill="#f59e0b" />
                        <circle cx="8.2" cy="7" r="3" stroke="#f59e0b" strokeWidth="0.5" opacity="0.45" />
                      </svg>
                    </div>
                    <h2 style={{
                      fontSize: '22px', fontWeight: 'bold', margin: 0,
                      background: 'linear-gradient(135deg, #00f2fe, #a78bfa, #f59e0b)',
                      WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
                    }}>
                      Size nasıl yardımcı olabilirim, Efendim?
                    </h2>
                    <p style={{ fontSize: '12px', color: '#64748b', maxWidth: '320px', margin: 0 }}>
                      Aklınızdakileri yazın ya da size kolaylık olması için bir öneriye dokunun.
                    </p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                      {['🚀 Hızlı Durum Özeti', '🛰️ Saha Radarı Analizi', '📊 Finans & Ciro Durumu'].map((s) => (
                        <button
                          key={s}
                          onClick={() => setInput(s)}
                          style={{
                            padding: '10px 16px', borderRadius: '20px', cursor: 'pointer',
                            border: '1px solid rgba(0,242,254,0.25)',
                            background: 'rgba(0,242,254,0.06)', color: '#e2e8f0',
                            fontSize: '12px', fontWeight: '600', transition: 'all 0.2s',
                          }}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                {messages.map((m, i) => (
                  <div key={i} style={{
                    display: 'flex',
                    flexDirection: m.role === 'user' ? 'row-reverse' : 'row',
                    alignItems: 'flex-start',
                    gap: '12px',
                  }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '10px', flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: m.role === 'user'
                        ? 'linear-gradient(135deg, rgba(0,242,254,0.25), rgba(72,187,120,0.25))'
                        : 'linear-gradient(135deg, rgba(0,242,254,0.18), rgba(79,70,229,0.16), rgba(245,158,11,0.2))',
                      border: m.role === 'user' ? '1px solid rgba(0,242,254,0.25)' : '1px solid rgba(0,242,254,0.4)',
                      fontSize: '15px',
                      boxShadow: m.role === 'user' ? '0 0 10px rgba(0,242,254,0.15)' : '0 0 14px rgba(0,242,254,0.3)',
                    }}>
                      {m.role === 'user' ? (
                        '👤'
                      ) : (
                        /* Likya CEO Neon Amblemi — cyan/amber degrade vektörel logo */
                        <svg viewBox="0 0 24 24" width="20" height="20" fill="none">
                          <defs>
                            <linearGradient id="likyaMsgLogo" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#00f2fe" />
                              <stop offset="55%" stopColor="#4facfe" />
                              <stop offset="100%" stopColor="#f59e0b" />
                            </linearGradient>
                          </defs>
                          <circle cx="12" cy="12" r="10.4" stroke="url(#likyaMsgLogo)" strokeWidth="0.7" opacity="0.35" strokeDasharray="3 2.4" />
                          <path d="M8.2 20 V7 H16.4" stroke="url(#likyaMsgLogo)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M9.6 7 V3.6 H14.4 V7" stroke="#00f2fe" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M4.4 6.4 H19.6" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />
                          <path d="M12 3.6 V1.9" stroke="#00f2fe" strokeWidth="1.4" strokeLinecap="round" />
                          <circle cx="8.2" cy="7" r="1.4" fill="#f59e0b" />
                        </svg>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0, maxWidth: '85%' }}>
                      <div style={{ fontSize: '10px', color: '#64748b', marginBottom: '4px', fontWeight: '600', letterSpacing: '0.3px' }}>
                        {m.role === 'user' ? 'Siz' : 'Likya CEO'} • {m.time}
                      </div>
                      {m.attachment && (
                        <div style={{
                          marginBottom: '10px', borderRadius: '10px', overflow: 'hidden',
                          border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(13,19,34,0.5)',
                          maxWidth: '260px',
                        }}>
                          {m.attachment.type.startsWith('image/') ? (
                            <img src={m.attachment.dataUrl} alt={m.attachment.name} style={{ width: '100%', maxHeight: '180px', objectFit: 'cover', display: 'block' }} />
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 12px', fontSize: '11px', color: '#e2e8f0' }}>
                              📄 {m.attachment.name}
                            </div>
                          )}
                        </div>
                      )}
                      <div style={{
                        fontSize: '14px',
                        lineHeight: '1.7',
                        whiteSpace: 'pre-wrap',
                        color: m.role === 'user' ? '#e2e8f0' : '#cbd5e1',
                      }}>
                        {renderMarkdown(m.text)}
                      </div>
                      {/* 🎙️ TTS — CEO yanıtını seslendirme butonu */}
                      {m.role === 'ceo' && (
                        <button
                          title="Yanıtı sesli dinle (TTS)"
                          onClick={() => speakText(m.text.replace(/[#*`]/g, ''), { lang: 'tr-TR', rate: 1.0 })}
                          style={{
                            marginTop: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px',
                            padding: '3px 9px', borderRadius: '999px', cursor: 'pointer',
                            border: '1px solid rgba(0,242,254,0.35)', background: 'rgba(0,242,254,0.08)',
                            color: '#67e8f9', fontSize: '10px', fontWeight: 600,
                          }}
                        >
                          🔊 Sesli Oku
                        </button>
                      )}
                      {m.memoryOffer && m.role === 'ceo' && (
                        <div style={{
                          marginTop: '12px',
                          borderRadius: '12px',
                          border: '1px solid rgba(245,158,11,0.35)',
                          background: 'linear-gradient(135deg, rgba(245,158,11,0.08), rgba(0,242,254,0.06))',
                          padding: '10px 12px',
                        }}>
                          <div style={{ fontSize: '12px', color: '#fbbf24', fontWeight: '600', marginBottom: '8px' }}>
                            💡 Efendim, bu stratejik kararı ömür boyu kalıcı hafızaya kaydedeyim mi?
                          </div>
                          <button
                            onClick={() => handleMemoryApprove(m.memoryOffer!.category, m.memoryOffer!.decision_text)}
                            disabled={approvedMemoryOffers.includes(m.memoryOffer!.decision_text)}
                            style={{
                              padding: '8px 18px',
                              borderRadius: '20px',
                              cursor: approvedMemoryOffers.includes(m.memoryOffer!.decision_text) ? 'default' : 'pointer',
                              border: '1px solid rgba(34,197,94,0.5)',
                              background: approvedMemoryOffers.includes(m.memoryOffer!.decision_text) ? 'rgba(34,197,94,0.15)' : 'rgba(34,197,94,0.1)',
                              color: '#4ade80',
                              fontSize: '12px',
                              fontWeight: '700',
                              transition: 'all 0.2s',
                            }}
                          >
                            {approvedMemoryOffers.includes(m.memoryOffer!.decision_text) ? '🏛️ Mühürlendi ✓' : '🔒 Onayla & Mühürle'}
                          </button>
                        </div>
                      )}
                      {m.approvalRequest && m.role === 'ceo' && (
                        <div style={{
                          marginTop: '12px', borderRadius: '12px',
                          border: '1px solid rgba(248,113,113,0.4)',
                          background: 'rgba(248,113,113,0.08)',
                          padding: '10px 12px',
                        }}>
                          <div style={{ fontSize: '12px', color: '#fbbf24', fontWeight: '700', marginBottom: '8px' }}>
                            🧑‍💼 Patron, bu kritik işlemi onaylıyor musunuz?
                          </div>
                          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                            <button
                              onClick={() => handleApproveCritical(m.approvalRequest!.text)}
                              style={{
                                padding: '8px 18px', borderRadius: '20px', cursor: 'pointer',
                                border: '1px solid rgba(74,222,128,0.5)', background: 'rgba(74,222,128,0.1)',
                                color: '#4ade80', fontSize: '12px', fontWeight: '700',
                              }}
                            >
                              ✅ Onayla
                            </button>
                            <button
                              onClick={() => handleRejectCritical(m.approvalRequest!.text)}
                              style={{
                                padding: '8px 18px', borderRadius: '20px', cursor: 'pointer',
                                border: '1px solid rgba(248,113,113,0.5)', background: 'rgba(248,113,113,0.1)',
                                color: '#f87171', fontSize: '12px', fontWeight: '700',
                              }}
                            >
                              🛑 Reddet
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                  </>
                )}
                {isProcessing && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: '#f59e0b' }}>
                    <span style={{ display: 'inline-flex', animation: 'pulse 1s infinite' }}>
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none">
                        <defs>
                          <linearGradient id="likyaProcLogo" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#00f2fe" />
                            <stop offset="55%" stopColor="#4facfe" />
                            <stop offset="100%" stopColor="#f59e0b" />
                          </linearGradient>
                        </defs>
                        <path d="M8.2 20 V7 H16.4" stroke="url(#likyaProcLogo)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M9.6 7 V3.6 H14.4 V7" stroke="#00f2fe" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M4.4 6.4 H19.6" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" opacity="0.9" />
                        <circle cx="8.2" cy="7" r="1.4" fill="#f59e0b" />
                      </svg>
                    </span> Bir saniye efendim, hemen ilgileniyorum...
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Attachment Önizleme Barı */}
              {pendingAttachment && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 12px', marginTop: '12px', background: 'rgba(0,242,254,0.06)', border: '1px solid rgba(0,242,254,0.25)', borderRadius: '12px' }}>
                  {pendingAttachment.type.startsWith('image/') ? (
                    <img src={pendingAttachment.dataUrl} alt={pendingAttachment.name} style={{ width: '44px', height: '44px', borderRadius: '8px', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '44px', height: '44px', borderRadius: '8px', background: 'rgba(0,242,254,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>📄</div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '12px', fontWeight: '600', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pendingAttachment.name}</div>
                    <div style={{ fontSize: '10px', color: '#00f2fe' }}>{pendingAttachment.type.startsWith('image/') ? '🖼️ Görsel eklenecek' : '📎 Dosya eklenecek'}</div>
                  </div>
                  <button onClick={removeAttachment} style={{ width: '26px', height: '26px', borderRadius: '50%', border: 'none', background: 'rgba(248,113,113,0.2)', color: '#f87171', fontSize: '13px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
                </div>
              )}

              {/* Chat Input - Web & Mobil Uyumlu */}
              {isMobile ? (
                <div style={{ display: 'flex', flexDirection: 'column', width: '100%', marginTop: '12px' }}>
                  {/* Model Seçici - Girişin üstünde ortalanmış zarif bir pill */}
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px', position: 'relative' }}>
                    <button
                      onClick={() => setModelMenuOpen(!modelMenuOpen)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '6px 14px',
                        borderRadius: '20px',
                        border: '1px solid rgba(255,255,255,0.08)',
                        background: 'rgba(30, 41, 59, 0.5)',
                        color: '#cbd5e1',
                        fontSize: '11px',
                        fontWeight: '600',
                        backdropFilter: 'blur(8px)',
                        cursor: 'pointer'
                      }}
                    >
                      <span>{MODEL_OPTIONS.find((m) => m.id === selectedModel)?.icon}</span>
                      <span>{MODEL_OPTIONS.find((m) => m.id === selectedModel)?.label}</span>
                      <span style={{ fontSize: '9px', color: '#64748b' }}>▾</span>
                    </button>

                    {modelMenuOpen && (
                      <div style={{
                        position: 'absolute',
                        bottom: '32px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                        minWidth: '200px',
                        zIndex: 100,
                        background: 'rgba(13,19,34,0.98)',
                        border: '1px solid rgba(0, 242, 254, 0.25)',
                        borderRadius: '16px',
                        padding: '6px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px'
                      }}>
                        {MODEL_OPTIONS.map((m) => (
                          <button
                            key={m.id}
                            onClick={() => { setSelectedModel(m.id); setModelMenuOpen(false); }}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              padding: '10px',
                              borderRadius: '10px',
                              border: 'none',
                              cursor: 'pointer',
                              textAlign: 'left',
                              background: selectedModel === m.id ? 'rgba(0,242,254,0.1)' : 'transparent',
                              color: selectedModel === m.id ? '#00f2fe' : '#e2e8f0',
                              fontSize: '12px'
                            }}
                          >
                            <span>{m.icon}</span>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: '600' }}>{m.label}</div>
                              <div style={{ fontSize: '9px', color: '#64748b' }}>{m.desc}</div>
                            </div>
                            {selectedModel === m.id && <span style={{ color: '#00f2fe' }}>✓</span>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Likya Yuvarlak Giriş Kutusu */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    background: 'rgba(30, 41, 59, 0.6)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    borderRadius: '28px',
                    padding: '4px 6px 4px 12px',
                    gap: '8px',
                    boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.05)'
                  }}>
                    {/* Sol: + Butonu */}
                    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                      <button
                        onClick={() => setAttachMenuOpen(!attachMenuOpen)}
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          border: 'none',
                          background: 'rgba(255, 255, 255, 0.05)',
                          color: '#94a3b8',
                          fontSize: '20px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer'
                        }}
                      >
                        +
                      </button>

                      {attachMenuOpen && (
                        <div style={{
                          position: 'fixed',
                          bottom: '72px',
                          left: '12px',
                          right: '12px',
                          background: 'rgba(13,19,34,0.98)',
                          border: '1px solid rgba(0,242,254,0.25)',
                          borderRadius: '20px',
                          padding: '16px 12px calc(env(safe-area-inset-bottom) + 16px)',
                          backdropFilter: 'blur(16px)',
                          boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '2px',
                          zIndex: 110
                        }}>
                          {[
                            { icon: '📁', label: 'Dosya Yükle', desc: 'PDF, TXT, CSV, Excel', onClick: () => fileInputRef.current?.click() },
                            { icon: '📸', label: 'Fotoğraf / Kamera', desc: 'Galeriden seç veya çek (JPG, PNG)', onClick: () => imageInputRef.current?.click() },
                            { icon: '🎨', label: 'Görsel Tasarla', desc: '[Görsel Tasarla]', onClick: () => quickCommand('[Görsel Tasarla]') },
                            { icon: '🎵', label: 'Likya Müzik & Jingle', desc: '[Müzik Üret]', onClick: () => quickCommand('[Müzik Üret]') },
                            { icon: '🔬', label: 'Deep Research', desc: '[Deep Research]', onClick: () => quickCommand('[Deep Research]') },
                          ].map((item) => (
                            <button
                              key={item.label}
                              onClick={item.onClick}
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px',
                                padding: '12px',
                                borderRadius: '12px',
                                border: 'none',
                                background: 'transparent',
                                color: '#e2e8f0',
                                cursor: 'pointer',
                                textAlign: 'left',
                                fontSize: '13px'
                              }}
                            >
                              <span style={{ fontSize: '18px' }}>{item.icon}</span>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: '600' }}>{item.label}</div>
                                <div style={{ fontSize: '10px', color: '#64748b' }}>{item.desc}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Gizli Dosya/Görsel Girişleri */}
                    <input ref={fileInputRef} type="file" accept=".pdf,.txt,.csv,.docx,.xlsx,.xls,text/plain,application/pdf" style={{ display: 'none' }} onChange={handleFileSelect} />
                    <input ref={imageInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageSelect} />

                    {/* Orta: Input */}
                    <input
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Likya'ya sorun..."
                      style={{
                        flex: 1,
                        background: 'transparent',
                        border: 'none',
                        color: '#e2e8f0',
                        fontSize: '14px',
                        outline: 'none',
                        padding: '8px 0'
                      }}
                    />

                    {/* Sağ: Mikrofon ve Gönder Butonları */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <button
                        title="Sesli komut (OpenLive)"
                        onClick={toggleVoice}
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          border: 'none',
                          background: voiceActive ? 'rgba(0,242,254,0.25)' : 'transparent',
                          color: voiceActive ? '#00f2fe' : '#94a3b8',
                          fontSize: '18px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: 'pointer',
                          boxShadow: voiceActive ? '0 0 12px rgba(0,242,254,0.6)' : 'none',
                          animation: voiceActive ? 'radarPulse 1.5s infinite' : 'none',
                        }}
                      >
                        {voiceActive ? '🔴' : '🎤'}
                      </button>

                      {/* Gönder Butonu — Enter yanında güvenilir görsel geri bildirim */}
                      <button
                        title="Gönder"
                        onClick={() => handleSend()}
                        disabled={isProcessing || !input.trim()}
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          border: 'none',
                          cursor: 'pointer',
                          background: input.trim() ? 'linear-gradient(135deg, #00f2fe, #f59e0b)' : 'rgba(255,255,255,0.06)',
                          color: input.trim() ? '#0d1322' : '#64748b',
                          fontSize: '15px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'all 0.2s',
                        }}
                      >
                        ➤
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  {/* Multimodal Ataş (+) Menü */}
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => setAttachMenuOpen(!attachMenuOpen)}
                      style={{
                        width: '40px', height: '40px', borderRadius: '50%',
                        border: attachMenuOpen ? '1px solid #00f2fe' : '1px solid rgba(255,255,255,0.2)',
                        background: attachMenuOpen ? 'rgba(0,242,254,0.1)' : 'rgba(255,255,255,0.05)',
                        color: attachMenuOpen ? '#00f2fe' : '#94a3b8',
                        fontSize: '18px', fontWeight: 'bold', cursor: 'pointer',
                      }}
                    >
                      +
                    </button>

                    {attachMenuOpen && (
                      <div style={{
                        position: 'absolute',
                        bottom: '48px',
                        left: '0',
                        width: '235px',
                        background: 'rgba(13,19,34,0.98)', border: '1px solid rgba(0,242,254,0.25)',
                        borderRadius: '14px',
                        padding: '8px',
                        backdropFilter: 'blur(16px)',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.5), 0 0 20px rgba(0,242,254,0.12)',
                        display: 'flex', flexDirection: 'column', gap: '2px', zIndex: 40,
                      }}>
                        {[
                          { icon: '📁', label: 'Dosya Yükle', desc: 'PDF, TXT, CSV, Excel', onClick: () => fileInputRef.current?.click() },
                          { icon: '📸', label: 'Fotoğraf / Kamera', desc: 'Galeriden seç veya çek (JPG, PNG)', onClick: () => imageInputRef.current?.click() },
                          { icon: '🎨', label: 'Görsel Tasarla', desc: '[Görsel Tasarla]', onClick: () => quickCommand('[Görsel Tasarla]') },
                          { icon: '🎵', label: 'Likya Müzik & Jingle', desc: '[Müzik Üret]', onClick: () => quickCommand('[Müzik Üret]') },
                          { icon: '🔬', label: 'Deep Research', desc: '[Deep Research]', onClick: () => quickCommand('[Deep Research]') },
                        ].map((item) => (
                          <button
                            key={item.label}
                            onClick={item.onClick}
                            style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 10px', borderRadius: '10px', border: 'none', background: 'transparent', color: '#e2e8f0', cursor: 'pointer', textAlign: 'left', fontSize: '12px' }}
                            onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,242,254,0.08)')}
                            onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                          >
                            <span style={{ fontSize: '15px' }}>{item.icon}</span>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: '600' }}>{item.label}</div>
                              <div style={{ fontSize: '9px', color: '#64748b' }}>{item.desc}</div>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Gizli Dosya/Görsel Girişleri */}
                  <input ref={fileInputRef} type="file" accept=".pdf,.txt,.csv,.docx,.xlsx,.xls,text/plain,application/pdf" style={{ display: 'none' }} onChange={handleFileSelect} />
                  <input ref={imageInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageSelect} />

                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Patron, aklınızdakileri yazın... (örn: yazılım yap, pazar araştır, fatura kes)"
                    style={{
                      flex: 1,
                      minWidth: 0,
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      color: '#e2e8f0',
                      fontSize: '13px',
                      outline: 'none',
                    }}
                  />
                  {/* Gönder Butonu — mobil için görsel geri bildirim */}
                  <button
                    title="Gönder"
                    onClick={() => handleSend()}
                    disabled={isProcessing || !input.trim()}
                    style={{
                      width: '42px', height: '42px', borderRadius: '12px', flexShrink: 0,
                      border: 'none', cursor: 'pointer',
                      background: input.trim() ? 'linear-gradient(135deg, #00f2fe, #f59e0b)' : 'rgba(255,255,255,0.06)',
                      color: input.trim() ? '#0d1322' : '#64748b',
                      fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'all 0.2s',
                    }}
                  >
                    ➤
                  </button>
                  {/* Model Seçici (Likya Tarzı Dropdown) */}
                  <div style={{ position: 'relative', flexShrink: 0 }}>
                    <button
                      onClick={() => setModelMenuOpen(!modelMenuOpen)}
                      title="Modeli değiştir"
                      style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        padding: '8px 12px', borderRadius: '12px', cursor: 'pointer',
                        border: modelMenuOpen ? '1px solid #00f2fe' : '1px solid rgba(255,255,255,0.15)',
                        background: modelMenuOpen ? 'rgba(0,242,254,0.1)' : 'rgba(255,255,255,0.04)',
                        color: '#e2e8f0', fontSize: '11px', fontWeight: '600', whiteSpace: 'nowrap',
                      }}
                    >
                      {MODEL_OPTIONS.find((m) => m.id === selectedModel)?.icon} {MODEL_OPTIONS.find((m) => m.id === selectedModel)?.label} ▾
                    </button>
                    {modelMenuOpen && (
                      <div style={{
                        position: 'absolute', bottom: '44px', right: 0, minWidth: '210px', zIndex: 45,
                        background: 'rgba(13,19,34,0.98)', border: '1px solid rgba(0,242,254,0.25)',
                        borderRadius: '14px', padding: '6px', backdropFilter: 'blur(16px)',
                        boxShadow: '0 8px 30px rgba(0,0,0,0.5), 0 0 20px rgba(0,242,254,0.12)',
                        display: 'flex', flexDirection: 'column', gap: '2px',
                      }}>
                        {MODEL_OPTIONS.map((m) => (
                          <button
                            key={m.id}
                            onClick={() => { setSelectedModel(m.id); setModelMenuOpen(false); }}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 10px',
                              borderRadius: '10px', border: 'none', cursor: 'pointer', textAlign: 'left',
                              background: selectedModel === m.id ? 'rgba(0,242,254,0.1)' : 'transparent',
                              color: selectedModel === m.id ? '#00f2fe' : '#e2e8f0',
                              fontSize: '12px',
                            }}
                          >
                            <span>{m.icon}</span>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontWeight: '600' }}>{m.label}</div>
                              <div style={{ fontSize: '9px', color: '#64748b' }}>{m.desc}</div>
                            </div>
                            {selectedModel === m.id && <span style={{ color: '#00f2fe' }}>✓</span>}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Mikrofon (gönderin yanında) */}
                  <button
                    title="Sesli komut"
                    style={{
                      width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                      border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(255,255,255,0.05)',
                      color: '#94a3b8', fontSize: '16px', cursor: 'pointer',
                    }}
                  >
                    🎤
                  </button>

                  {/* Gönder ok butonu kaldırıldı — Enter ile gönderiliyor */}
                </div>
              )}
            </div>

            {/* SAĞ: SOHBET GEÇMİŞİ PANELİ (RIGHT HISTORY SIDEBAR) */}
            <div style={{
              width: '260px',
              background: 'rgba(255,255,255,0.02)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '12px',
              padding: '16px',
              display: isMobile ? 'none' : 'flex',
              flexDirection: 'column',
              flexShrink: 0,
              overflowY: 'auto',
            }}>
              <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', fontWeight: 'bold' }}>
                💬 Sohbet Geçmişi
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {threads.map((thread) => (
                  <div
                    key={thread.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      width: '100%',
                    }}
                  >
                    {/* SİLME BUTONU (SOLDA) */}
                    <button
                      onClick={() => handleDeleteThread(thread.id)}
                      title="Sohbeti Sil"
                      style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#ef4444',
                        cursor: 'pointer',
                        padding: '8px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        height: '40px',
                        width: '36px',
                        flexShrink: 0,
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)';
                        e.currentTarget.style.borderColor = '#ef4444';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                        e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                      }}
                    >
                      <Trash2 size={14} />
                    </button>

                    {/* KONU BAŞLIĞI BUTONU */}
                    <button
                      onClick={() => loadThread(thread.id)}
                      style={{
                        flex: 1,
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
                        minWidth: 0,
                      }}
                    >
                      <div style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        color: activeThreadId === thread.id ? '#00f2fe' : '#e2e8f0',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        width: '100%',
                      }}>
                        {thread.title}
                      </div>
                      <div style={{ fontSize: '10px', color: '#64748b' }}>
                        {thread.messages.length} mesaj • {thread.messages[0].time}
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* MODÜL ÇEKMECESİ (Mobil - Bottom Drawer) */}
        {isMobile && mobileMenuOpen && (
          <div style={{
            position: 'fixed', inset: 0, zIndex: 60,
            background: 'rgba(13,19,34,0.98)',
            backdropFilter: 'blur(16px)',
            display: 'flex', flexDirection: 'column',
            paddingTop: 'env(safe-area-inset-top)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>📊 Modüller</div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button onClick={() => setShowModuleModal(true)} style={{ padding: '7px 12px', borderRadius: '18px', cursor: 'pointer', border: '1px dashed rgba(0,242,254,0.5)', background: 'rgba(0,242,254,0.1)', color: '#00f2fe', fontSize: '10px', fontWeight: 700 }}>
                  ➕ Yeni Modül
                </button>
                <button onClick={() => setMobileMenuOpen(false)} style={{ width: '32px', height: '32px', borderRadius: '50%', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', cursor: 'pointer', fontSize: '14px' }}>✕</button>
              </div>
            </div>
            {/* Kategori Filtre Butonları (Tümü / 5 Alan) */}
            <div style={{ display: 'flex', gap: '8px', padding: '12px 16px', overflowX: 'auto', borderBottom: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
              {[
                { id: 'all', name: 'Tümü', icon: '🗂️', color: '#e2e8f0', count: MODULES.length + customModules.length },
                ...MODULE_DOMAINS.map((d) => ({ id: d.id, name: d.chipLabel || d.name, icon: d.icon, color: d.color, count: getDomainIds(d.id).length })),
              ].map((d) => {
                const active = filterDomain === d.id;
                return (
                  <button
                    key={d.id}
                    onClick={() => setFilterDomain(d.id)}
                    style={{
                      padding: '8px 14px', borderRadius: '20px', cursor: 'pointer', whiteSpace: 'nowrap',
                      border: active ? `1px solid ${d.color}` : '1px solid rgba(255,255,255,0.12)',
                      background: active ? `${d.color}1a` : 'rgba(255,255,255,0.04)',
                      color: active ? d.color : '#94a3b8', fontSize: '11px', fontWeight: '700',
                    }}
                  >
                    {d.icon} {d.name} <span style={{ opacity: 0.7 }}>({d.count})</span>
                  </button>
                );
              })}
            </div>

            {/* 5 Alan Kategorili Akordiyon (sürükle-bırak) */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '8px 16px calc(env(safe-area-inset-bottom) + 16px)', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {MODULE_DOMAINS.filter((d) => filterDomain === 'all' || filterDomain === d.id).map((dom) => {
                const domModules = getDomainIds(dom.id).map((id) => findModule(id)).filter((m): m is ModuleItem | CustomModule => !!m);
                const isOpen = openMobileDomain === dom.id;
                const isDropTarget = !!dragState && dragState.fromDomain !== dom.id;
                return (
                  <div key={dom.id}>
                    <button
                      onClick={() => setOpenMobileDomain(isOpen ? null : dom.id)}
                      onDragOver={(e) => { if (isDropTarget) { e.preventDefault(); setDropHint({ domain: dom.id, index: domModules.length }); } }}
                      onDrop={(e) => { if (isDropTarget) { e.preventDefault(); handleDrop(dom.id, domModules.length); } }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                        padding: '12px 14px', borderRadius: '14px', cursor: 'pointer',
                        border: dropHint?.domain === dom.id ? `1px dashed ${dom.color}` : `1px solid ${dom.color}33`,
                        background: `${dom.color}0d`,
                        boxShadow: dropHint?.domain === dom.id ? `0 0 14px ${dom.color}40` : 'none',
                      }}
                    >
                      <span style={{ width: '34px', height: '34px', borderRadius: '10px', background: `${dom.color}1f`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>{dom.icon}</span>
                      <span style={{ flex: 1, textAlign: 'left', fontSize: '13px', fontWeight: '800', color: '#fff', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{dom.name}</span>
                      <span style={{ fontSize: '10px', fontWeight: '700', color: dom.color, padding: '3px 10px', borderRadius: '12px', background: `${dom.color}1a`, border: `1px solid ${dom.color}44` }}>{domModules.length}</span>
                      <span style={{ color: dom.color, fontSize: '12px' }}>{isOpen ? '▾' : '▸'}</span>
                    </button>

                    {isOpen && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '8px', paddingLeft: '6px' }}>
                        {domModules.map((mod, idx) => (
                          <button
                            key={mod.id}
                            draggable
                            onDragStart={(e) => { e.dataTransfer.setData('text/plain', mod.id); setDragState({ id: mod.id, fromDomain: dom.id }); }}
                            onDragEnd={() => { setDragState(null); setDropHint(null); }}
                            onDragOver={(e) => { if (dragState) { e.preventDefault(); setDropHint({ domain: dom.id, index: idx }); } }}
                            onDrop={(e) => { if (dragState) { e.preventDefault(); handleDrop(dom.id, idx); } }}
                            onClick={() => { setActiveView(mod.id); setMobileMenuOpen(false); }}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '10px', padding: '11px 14px',
                              borderRadius: '12px', cursor: 'grab', textAlign: 'left',
                              borderTop: dropHint?.domain === dom.id && dropHint.index === idx ? `2px solid ${dom.color}` : '2px solid transparent',
                              background: activeView === mod.id ? `${mod.color}15` : dragState?.id === mod.id ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.03)',
                              border: activeView === mod.id ? `1px solid ${mod.color}` : '1px solid rgba(255,255,255,0.06)',
                              color: activeView === mod.id ? mod.color : '#e2e8f0', opacity: dragState?.id === mod.id ? 0.5 : 1,
                            }}
                          >
                            <span style={{ color: mod.color, display: 'flex' }}>{mod.icon}</span>
                            <span style={{ fontSize: '13px', fontWeight: '600', flex: 1 }}>{mod.name}</span>
                            {'category' in mod && (mod as CustomModule).route && <span style={{ fontSize: '9px', color: '#64748b' }}>🧩</span>}
                            <span style={{ fontSize: '10px', color: '#64748b', maxWidth: '35%', textAlign: 'right' }}>{mod.description}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MOBİL ALT BAR (Bottom Navigation) */}
        {isMobile && (
          <div style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
            display: 'flex', justifyContent: 'space-around', alignItems: 'center',
            background: 'rgba(13,19,34,0.96)',
            borderTop: '1px solid rgba(255,255,255,0.1)',
            backdropFilter: 'blur(16px)',
            padding: '8px 4px',
            paddingBottom: 'calc(env(safe-area-inset-bottom) + 8px)',
          }}>
            {[
              { icon: '💬', label: 'Chat', active: activeView === 'chat', onClick: () => setActiveView('chat') },
              { icon: '📊', label: 'Modüller', active: mobileMenuOpen, onClick: () => setMobileMenuOpen(true) },
              { icon: '🛰️', label: 'Radar', active: activeView === 'osint', onClick: () => setActiveView('osint') },
              { icon: '⚙️', label: 'Ayarlar', active: activeView === 'monitor', onClick: () => setActiveView('monitor') },
            ].map((tab) => (
              <button
                key={tab.label}
                onClick={tab.onClick}
                style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
                  padding: '6px 14px', borderRadius: '10px', cursor: 'pointer',
                  background: tab.active ? 'rgba(0,242,254,0.1)' : 'transparent',
                  border: 'none', color: tab.active ? '#00f2fe' : '#94a3b8',
                  fontSize: '10px', fontWeight: tab.active ? '700' : '500',
                }}
              >
                <span style={{ fontSize: '17px' }}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* ➕ Yeni Modül Oluşturma Modalı */}
        {showModuleModal && (
          <ModuleCreateModal
            onClose={() => setShowModuleModal(false)}
            onSave={(name, icon, category, description, route) => addCustomModule(name, icon, category, description, route)}
          />
        )}

      </div>
    </div>
  );
}