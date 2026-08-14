'use client';

import React, { useEffect, useState } from 'react';
import { Cpu, Activity, Clock, DollarSign, Zap, ShieldCheck, Users, ChefHat, Radar } from 'lucide-react';

// ============================================================================
// LİKYA MULTI-AGENT HUB & LLM TELEMETRİ PANELİ
// Anlık token tüketimi, KV Cache, TTFT gecikmesi, $/1k token maliyeti
// ve CrewAI/LangGraph alt ajanlarının canlı durum rozetleri
// ============================================================================

interface MetricCard {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  color: string;
}

interface SubAgent {
  id: string;
  name: string;
  team: string;
  status: 'active' | 'busy' | 'idle' | 'error';
  tasks: number;
  llm: string;
  color: string;
}

const SUB_AGENTS: SubAgent[] = [
  { id: 'fin', name: 'Finans Ajanı', team: 'CrewAI', status: 'active', tasks: 14, llm: 'gemini-3.5-flash', color: '#34d399' },
  { id: 'sec', name: 'Güvenlik Ajanı', team: 'LangGraph', status: 'busy', tasks: 7, llm: 'deepseek-v3', color: '#f87171' },
  { id: 'kitchen', name: 'Mutfak Ajanı', team: 'CrewAI', status: 'active', tasks: 23, llm: 'gemini-3.5-flash', color: '#f59e0b' },
  { id: 'field', name: 'Saha IoT Ajanı', team: 'LangGraph', status: 'idle', tasks: 5, llm: 'ollama-qwen', color: '#00f2fe' },
];

const RECENT_CALLS = [
  { time: '12:04:11', agent: 'Finans Ajanı', tokens: '1.2K', cost: '$0.0031', latency: '142ms' },
  { time: '12:04:08', agent: 'Mutfak Ajanı', tokens: '842', cost: '$0.0019', latency: '96ms' },
  { time: '12:04:02', agent: 'Güvenlik Ajanı', tokens: '2.1K', cost: '$0.0052', latency: '204ms' },
  { time: '12:03:58', agent: 'Saha IoT Ajanı', tokens: '510', cost: '$0.0011', latency: '88ms' },
];

const STATUS_META: Record<SubAgent['status'], { label: string; color: string }> = {
  active: { label: 'AKTİF', color: '#48bb78' },
  busy: { label: 'MEŞGUL', color: '#f59e0b' },
  idle: { label: 'BEKLEMEDE', color: '#64748b' },
  error: { label: 'HATA', color: '#f87171' },
};

export default function AgentTelemetryPanel() {
  const [tokenUsage, setTokenUsage] = useState(847_321);
  const [kvCache, setKvCache] = useState(92);
  const [ttft, setTtft] = useState(128);
  const [costPer1k, setCostPer1k] = useState(0.0021);

  // Canlı telemetri simülasyonu (gerçek ortamda Supabase/EventBus'a bağlanır)
  useEffect(() => {
    const id = setInterval(() => {
      setTokenUsage((t) => t + Math.floor(Math.random() * 420));
      setKvCache((k) => Math.min(99, Math.max(60, k + (Math.random() > 0.45 ? 1 : -1))));
      setTtft((t) => Math.floor(88 + Math.random() * 130));
      setCostPer1k((c) => Math.max(0.0015, +(c + (Math.random() - 0.5) * 0.0004).toFixed(6)));
    }, 2500);
    return () => clearInterval(id);
  }, []);

  const metrics: MetricCard[] = [
    { label: 'Anlık Token Tüketimi', value: tokenUsage.toLocaleString('tr-TR'), sub: 'son 24s: +%2.4 artış', icon: <Zap size={18} color="#00f2fe" />, color: '#00f2fe' },
    { label: 'KV Cache Durumu', value: `%${kvCache}`, sub: kvCache > 85 ? 'yüksek önbellek isabeti' : 'normal', icon: <Cpu size={18} color="#a78bfa" />, color: '#a78bfa' },
    { label: 'Gecikme (TTFT)', value: `${ttft} ms`, sub: 'ortalama 141 ms hedef altı', icon: <Clock size={18} color="#f59e0b" />, color: '#f59e0b' },
    { label: 'Canlı Maliyet', value: `$${(costPer1k * 1000).toFixed(2)}/1k`, sub: `$ ${(costPer1k * tokenUsage / 1000).toFixed(2)} oturum`, icon: <DollarSign size={18} color="#34d399" />, color: '#34d399' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={20} color="#00f2fe" />
            Multi-Agent Hub &amp; LLM Telemetri
          </h2>
          <p style={{ fontSize: '12px', color: '#94a3b8' }}>CrewAI • LangGraph • Canlı Inference Metrikleri</p>
        </div>
        <span style={{ padding: '6px 12px', background: 'rgba(72,187,120,0.15)', color: '#48bb78', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#48bb78', boxShadow: '0 0 8px #48bb78', animation: 'radarPulse 1.5s infinite' }} />
          CANLI TELEMETRİ
        </span>
      </div>

      {/* Metrik Sayaçları */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
        {metrics.map((m) => (
          <div key={m.label} style={{
            background: 'rgba(255,255,255,0.03)',
            border: `1px solid ${m.color}22`,
            borderRadius: '14px',
            padding: '16px',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{m.label}</span>
              {m.icon}
            </div>
            <div style={{ fontSize: '22px', fontWeight: 'bold', color: '#fff' }}>{m.value}</div>
            <div style={{ fontSize: '10px', color: m.color }}>{m.sub}</div>
          </div>
        ))}
      </div>
      {/* Alt Ajan Durum Rozetleri */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
        {SUB_AGENTS.map((a) => {
          const st = STATUS_META[a.status];
          return (
            <div key={a.id} style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '14px',
              padding: '14px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ width: '32px', height: '32px', borderRadius: '10px', background: `${a.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {a.id === 'fin' && <Users size={16} color={a.color} />}
                    {a.id === 'sec' && <ShieldCheck size={16} color={a.color} />}
                    {a.id === 'kitchen' && <ChefHat size={16} color={a.color} />}
                    {a.id === 'field' && <Radar size={16} color={a.color} />}
                  </span>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>{a.name}</div>
                    <div style={{ fontSize: '10px', color: '#64748b' }}>{a.team}</div>
                  </div>
                </div>
                <span style={{
                  padding: '4px 8px', borderRadius: '8px', fontSize: '9px', fontWeight: '700', letterSpacing: '0.5px',
                  background: `${st.color}18`, color: st.color, border: `1px solid ${st.color}30`,
                }}>
                  {st.label}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8' }}>
                <span>{a.tasks} görev kuyruğunda</span>
                <span style={{ color: a.color }}>{a.llm}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Son LLM Çağrıları */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '14px',
        overflow: 'hidden',
      }}>
        <div style={{ padding: '12px 16px', fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          ⚡ Son LLM Çağrıları
        </div>
        {RECENT_CALLS.map((c, i) => (
          <div key={i} style={{
            display: 'grid',
            gridTemplateColumns: '70px 1fr 90px 90px 80px',
            gap: '8px',
            padding: '10px 16px',
            fontSize: '11px',
            color: '#94a3b8',
            borderBottom: i < RECENT_CALLS.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none',
            alignItems: 'center',
          }}>
            <span style={{ color: '#64748b' }}>{c.time}</span>
            <span style={{ color: '#e2e8f0' }}>{c.agent}</span>
            <span>{c.tokens} tok</span>
            <span style={{ color: '#34d399' }}>{c.cost}</span>
            <span>{c.latency}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

