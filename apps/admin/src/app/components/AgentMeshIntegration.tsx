'use client';

import React, { useState } from 'react';
import { Network, Bot, Database, Cpu, GitBranch, CheckCircle2 } from 'lucide-react';

// ============================================================================
// LİKYA 147 MULTI-AGENT MESH + DIFY + LIBRECHAT ENTEGRASYONU
// 12 Departmanlı Ajan Ağı + Multi-LLM Model Switcher + Dify RAG
// ============================================================================

interface AgentNode {
  id: string;
  name: string;
  role: string;
  status: 'active' | 'idle' | 'error';
  connections: number;
}

interface ModelOption {
  id: string;
  name: string;
  provider: string;
  status: 'online' | 'offline';
  latency: string;
}

const AGENT_NODES: AgentNode[] = [
  { id: 'A-01', name: 'Auto-Marketing', role: 'Reklam & Kampanya', status: 'active', connections: 12 },
  { id: 'A-02', name: 'Finans', role: 'Tahsilat & Bütçe', status: 'active', connections: 10 },
  { id: 'A-03', name: 'Tesis Bakım', role: 'Arıza & Bakım', status: 'active', connections: 8 },
  { id: 'A-04', name: 'Daze Chef', role: 'Mutfak & Menü', status: 'active', connections: 6 },
  { id: 'A-05', name: 'Daze Crew', role: 'Personel & Vardiya', status: 'active', connections: 9 },
  { id: 'A-06', name: 'LegalRisk', role: 'Hukuk & KVKK', status: 'active', connections: 5 },
  { id: 'A-07', name: 'GuestExperience', role: 'Müşteri Memnuniyeti', status: 'active', connections: 11 },
  { id: 'A-08', name: 'EnergySustainability', role: 'Yeşil Enerji', status: 'active', connections: 7 },
  { id: 'A-09', name: 'VendorPerformance', role: 'Kiracı Performans', status: 'active', connections: 6 },
  { id: 'A-10', name: 'SecurityIncident', role: 'Güvenlik & Olay', status: 'active', connections: 8 },
  { id: 'A-11', name: 'HRPayroll', role: 'Bordro & Özlük', status: 'active', connections: 5 },
  { id: 'A-12', name: 'FacilityMaintenance', role: 'Tesis Yönetimi', status: 'active', connections: 7 },
];

const MODELS: ModelOption[] = [
  { id: 'gemini', name: 'Gemini 1.5 Pro', provider: 'Google', status: 'online', latency: '1.2s' },
  { id: 'deepseek', name: 'DeepSeek V3', provider: 'DeepSeek', status: 'online', latency: '0.8s' },
  { id: 'ollama', name: 'Qwen 2.5 Coder', provider: 'Local Ollama', status: 'online', latency: '6.3s' },
  { id: 'dify', name: 'Dify RAG', provider: 'Dify', status: 'online', latency: '2.1s' },
];

export default function AgentMeshIntegration() {
  const [activeModel, setActiveModel] = useState('gemini');
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const [meshStatus, setMeshStatus] = useState('147 Ajan Bağlı');

  const totalConnections = AGENT_NODES.reduce((sum, a) => sum + a.connections, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Network size={20} color="#00f2fe" />
            147 Multi-Agent Mesh
          </h2>
          <p style={{ fontSize: '12px', color: '#94a3b8' }}>12 Departmanlı Ajan Ağı • Event-Bus Bağlantılı</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <span style={{ padding: '6px 12px', background: 'rgba(72,187,120,0.15)', color: '#48bb78', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' }}>
            🟢 {meshStatus}
          </span>
          <span style={{ padding: '6px 12px', background: 'rgba(0,242,254,0.15)', color: '#00f2fe', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' }}>
            🔗 {totalConnections} Bağlantı
          </span>
        </div>
      </div>

      {/* Multi-LLM Model Switcher (LibreChat Standardı) */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '16px' }}>
        <div style={{ fontSize: '13px', fontWeight: '600', color: '#e2e8f0', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Bot size={16} color="#a78bfa" /> Multi-LLM Model Switcher (LibreChat Standardı)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
          {MODELS.map((model) => (
            <button
              key={model.id}
              onClick={() => setActiveModel(model.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                padding: '12px',
                borderRadius: '10px',
                border: activeModel === model.id ? `1px solid ${model.id === 'gemini' ? '#00f2fe' : model.id === 'deepseek' ? '#a78bfa' : model.id === 'ollama' ? '#48bb78' : '#f59e0b'}` : '1px solid rgba(255,255,255,0.08)',
                background: activeModel === model.id ? 'rgba(0,242,254,0.08)' : 'rgba(255,255,255,0.02)',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#e2e8f0' }}>{model.name}</span>
                <span style={{ fontSize: '10px', color: model.status === 'online' ? '#48bb78' : '#f87171' }}>
                  {model.status === 'online' ? '🟢' : '🔴'}
                </span>
              </div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>{model.provider} • {model.latency}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Dify RAG Endpoint */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '16px' }}>
        <div style={{ fontSize: '13px', fontWeight: '600', color: '#e2e8f0', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Database size={16} color="#f59e0b" /> Dify RAG Veritabanı Uç Noktaları
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: '12px', color: '#e2e8f0' }}>📚 Kampüs Bilgi Tabanı</span>
            <span style={{ fontSize: '10px', padding: '4px 10px', borderRadius: '20px', background: 'rgba(72,187,120,0.15)', color: '#48bb78' }}>Bağlı</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: '12px', color: '#e2e8f0' }}>📄 Sözleşme & KVKK Dokümanları</span>
            <span style={{ fontSize: '10px', padding: '4px 10px', borderRadius: '20px', background: 'rgba(72,187,120,0.15)', color: '#48bb78' }}>Bağlı</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: '12px', color: '#e2e8f0' }}>🍽️ Menü & Tarif Veritabanı</span>
            <span style={{ fontSize: '10px', padding: '4px 10px', borderRadius: '20px', background: 'rgba(72,187,120,0.15)', color: '#48bb78' }}>Bağlı</span>
          </div>
        </div>
      </div>

      {/* 12 Departmanlı Ajan Ağı */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '16px' }}>
        <div style={{ fontSize: '13px', fontWeight: '600', color: '#e2e8f0', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <GitBranch size={16} color="#34d399" /> 12 Departmanlı Ajan Ağı (147 Agent Mesh)
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px' }}>
          {AGENT_NODES.map((agent) => (
            <button
              key={agent.id}
              onClick={() => setSelectedAgent(agent.id)}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
                padding: '12px',
                borderRadius: '10px',
                border: selectedAgent === agent.id ? '1px solid #00f2fe' : '1px solid rgba(255,255,255,0.08)',
                background: selectedAgent === agent.id ? 'rgba(0,242,254,0.08)' : 'rgba(255,255,255,0.02)',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: '600', color: '#e2e8f0' }}>{agent.name}</span>
                <span style={{ fontSize: '10px', color: agent.status === 'active' ? '#48bb78' : '#f87171' }}>
                  {agent.status === 'active' ? '🟢' : '🔴'}
                </span>
              </div>
              <div style={{ fontSize: '10px', color: '#64748b' }}>{agent.role}</div>
              <div style={{ fontSize: '10px', color: '#00f2fe' }}>🔗 {agent.connections} bağlantı</div>
            </button>
          ))}
        </div>
      </div>

      {/* Event-Bus Durumu */}
      <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '16px' }}>
        <div style={{ fontSize: '13px', fontWeight: '600', color: '#e2e8f0', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Cpu size={16} color="#f87171" /> Event-Bus Bağlantı Durumu
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: '12px', color: '#e2e8f0' }}>📡 Supabase Realtime Kanalı</span>
            <span style={{ fontSize: '10px', padding: '4px 10px', borderRadius: '20px', background: 'rgba(72,187,120,0.15)', color: '#48bb78' }}>Aktif</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: '12px', color: '#e2e8f0' }}>🔔 Kriz & İkram Event'leri</span>
            <span style={{ fontSize: '10px', padding: '4px 10px', borderRadius: '20px', background: 'rgba(72,187,120,0.15)', color: '#48bb78' }}>Aktif</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', borderRadius: '8px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ fontSize: '12px', color: '#e2e8f0' }}>📊 IoT Sensör Veri Akışı</span>
            <span style={{ fontSize: '10px', padding: '4px 10px', borderRadius: '20px', background: 'rgba(72,187,120,0.15)', color: '#48bb78' }}>Aktif</span>
          </div>
        </div>
      </div>
    </div>
  );
}
