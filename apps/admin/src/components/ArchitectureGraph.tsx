'use client';

import React from 'react';

export default function ArchitectureGraph() {
  const nodes = [
    {
      title: '📱 Flutter Mobile Super-App',
      tech: 'Dart / BLoC / GoRouter',
      desc: '18 Modül (P2P Takas, QR Tarayıcı, Çevrimdışı Bilet, Cüzdan, AR Vizör)',
      color: '#00f2fe',
      status: 'AKTİF',
    },
    {
      title: '🗄️ Supabase PostgreSQL Core',
      tech: 'Postgres / RLS / Realtime',
      desc: '6 Tablo (users, fair_products, events, tickets, repairs, audit_logs)',
      color: '#48bb78',
      status: 'BAĞLI',
    },
    {
      title: '⚡ Deno Edge Functions',
      tech: 'TypeScript / Serverless',
      desc: 'verify-ticket & AI Vision görüntü teşhis servisi',
      color: '#f6ad55',
      status: 'CANLI',
    },
    {
      title: '🚀 CEO Command Center',
      tech: 'Next.js 14 / Docker / Tailwind/CSS',
      desc: 'Sürdürülebilirlik ESG Raporlama, Satıcı Onayı ve Metrikler',
      color: '#e07a5f',
      status: 'YÖNETİLİYOR',
    },
  ];

  return (
    <div style={{ marginTop: '20px' }}>
      <h3 style={{ fontSize: '16px', fontWeight: 'bold', marginBottom: '16px' }}>
        Canlı Sistem Mimari Düğümleri & Veri Akış Haritası 🌐
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
        {nodes.map((node, i) => (
          <div
            key={i}
            style={{
              background: 'rgba(255, 255, 255, 0.04)',
              border: `1px solid ${node.color}40`,
              borderRadius: '16px',
              padding: '16px',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'bold' }}>{node.tech}</span>
              <span
                style={{
                  background: `${node.color}20`,
                  color: node.color,
                  padding: '2px 8px',
                  borderRadius: '6px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                }}
              >
                {node.status}
              </span>
            </div>
            <div style={{ fontSize: '15px', fontWeight: 'bold', color: 'white', marginTop: '8px' }}>
              {node.title}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px', lineHeight: 1.4 }}>
              {node.desc}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
