'use client';

import React, { useState } from 'react';
import { Truck, Package, AlertTriangle, Clock, RefreshCw, CheckCircle2 } from 'lucide-react';

// ============================================================================
// LİKYA OTONOM TEDARİKÇİ & REÇETE PORTALI
// Faz 3 Modül 1: Kritik stok seviyesinde otonom sipariş taslağı üretimi
// ============================================================================

interface StockItem {
  id: string;
  name: string;
  currentStock: number;
  criticalLevel: number;
  depletionRatePerMin: number; // dakikada tükenme hızı
  supplier: string;
  unit: string;
  status: 'OK' | 'LOW' | 'CRITICAL';
}

export default function SupplierManagement() {
  const [stockItems, setStockItems] = useState<StockItem[]>([
    { id: '1', name: 'Organik Domates', currentStock: 8, criticalLevel: 10, depletionRatePerMin: 0.5, supplier: 'Likya Organik Çiftlik', unit: 'kg', status: 'CRITICAL' },
    { id: '2', name: 'Sedir Balı', currentStock: 25, criticalLevel: 8, depletionRatePerMin: 0.2, supplier: 'Olympos Arıcılık', unit: 'kg', status: 'OK' },
    { id: '3', name: 'Zeytinyağı', currentStock: 12, criticalLevel: 15, depletionRatePerMin: 0.3, supplier: 'Likya Zeytin Bahçesi', unit: 'L', status: 'LOW' },
    { id: '4', name: 'Taze Nane', currentStock: 5, criticalLevel: 6, depletionRatePerMin: 0.4, supplier: 'Kampüs Serası', unit: 'demet', status: 'CRITICAL' },
  ]);

  const [orderDrafts, setOrderDrafts] = useState<{ id: string; name: string; qty: number; supplier: string; eta: string }[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // 120 saniyelik mutfak geri sayımı ile stok erime hızı eşleştirme
  const generateOrderDrafts = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const drafts = stockItems
        .filter((item) => item.status !== 'OK')
        .map((item) => {
          // Kritik seviyeye ulaşma süresi (dakika)
          const minutesToCritical = Math.max(0, (item.currentStock - item.criticalLevel) / item.depletionRatePerMin);
          // Otonom sipariş miktarı: kritik seviyenin 2 katı
          const orderQty = Math.ceil(item.criticalLevel * 2);
          return {
            id: item.id,
            name: item.name,
            qty: orderQty,
            supplier: item.supplier,
            eta: minutesToCritical <= 0 ? 'ACİL (120sn)' : `${Math.ceil(minutesToCritical)} dk`,
          };
        });
      setOrderDrafts(drafts);
      setIsGenerating(false);
    }, 1000);
  };

  const getStatusBadge = (status: StockItem['status']) => {
    switch (status) {
      case 'CRITICAL':
        return <span style={{ background: 'rgba(239,68,68,0.2)', color: '#f87171', border: '1px solid rgba(239,68,68,0.3)', fontSize: '11px', padding: '4px 10px', borderRadius: '20px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}><AlertTriangle size={12} /> Kritik</span>;
      case 'LOW':
        return <span style={{ background: 'rgba(245,158,11,0.2)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.3)', fontSize: '11px', padding: '4px 10px', borderRadius: '20px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> Düşük</span>;
      default:
        return <span style={{ background: 'rgba(16,185,129,0.2)', color: '#34d399', border: '1px solid rgba(16,185,129,0.3)', fontSize: '11px', padding: '4px 10px', borderRadius: '20px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={12} /> Normal</span>;
    }
  };

  return (
    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px', color: '#fff', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', marginTop: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #1e293b' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Truck size={20} color="#f59e0b" />
            Otonom Tedarikçi & Reçete Portalı
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>Kritik stok seviyesinde otonom sipariş taslağı üretimi • 120sn mutfak geri sayımı</p>
        </div>

        <button
          onClick={generateOrderDrafts}
          disabled={isGenerating}
          style={{
            display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', cursor: isGenerating ? 'not-allowed' : 'pointer', border: 'none',
            background: isGenerating ? 'rgba(180,83,9,0.5)' : '#d97706',
            color: '#fff',
          }}
        >
          {isGenerating ? <><RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> Analiz Ediliyor...</> : <><Package size={16} /> Otonom Sipariş Üret</>}
        </button>
      </div>

      {/* Stok Durumu */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0', marginBottom: '12px' }}>📦 Stok Durumu & Erime Hızı</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
          {stockItems.map((item) => {
            const ratio = Math.min(100, (item.currentStock / item.criticalLevel) * 100);
            return (
              <div key={item.id} style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: '12px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '14px', color: '#f1f5f9' }}>{item.name}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>{item.supplier}</div>
                  </div>
                  {getStatusBadge(item.status)}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '20px', fontWeight: '800', color: item.status === 'CRITICAL' ? '#f87171' : item.status === 'LOW' ? '#fbbf24' : '#34d399' }}>
                    {item.currentStock} <span style={{ fontSize: '12px', fontWeight: '400', color: '#94a3b8' }}>{item.unit}</span>
                  </span>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>Kritik: {item.criticalLevel}</span>
                </div>
                <div style={{ width: '100%', background: 'rgba(15,23,42,0.8)', height: '8px', borderRadius: '20px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: item.status === 'CRITICAL' ? '#ef4444' : item.status === 'LOW' ? '#f59e0b' : '#10b981', width: `${Math.min(100, ratio)}%` }}></div>
                </div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '8px' }}>
                  Erime Hızı: <strong style={{ color: '#e2e8f0' }}>{item.depletionRatePerMin} {item.unit}/dk</strong>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Otonom Sipariş Taslakları */}
      {orderDrafts.length > 0 && (
        <div>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0', marginBottom: '12px' }}>🛒 Otonom Sipariş Taslakları</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {orderDrafts.map((draft) => (
              <div key={draft.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(217,119,6,0.1)', border: '1px solid rgba(217,119,6,0.3)', borderRadius: '10px', padding: '12px 16px' }}>
                <div>
                  <div style={{ fontWeight: '600', fontSize: '13px', color: '#f1f5f9' }}>{draft.name}</div>
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>{draft.supplier}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '700', color: '#fbbf24' }}>{draft.qty} adet</span>
                  <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '20px', background: draft.eta.includes('ACİL') ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)', color: draft.eta.includes('ACİL') ? '#f87171' : '#fbbf24', border: `1px solid ${draft.eta.includes('ACİL') ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'}` }}>
                    ⏱ {draft.eta}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
