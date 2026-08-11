'use client';

import React, { useState } from 'react';
import { Bot, TrendingUp, Cpu, Zap, CheckCircle2, RefreshCw } from 'lucide-react';

// ============================================================================
// LİKYA L2-L3 AI AJAN OTONOMİ KONTROL PANELİ
// Faz 2 Modül 3: RevenueForecast & OccupancyOptimizer arka plan ajanları
// ============================================================================

export default function AIAgentAutonomousController() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [logs, setLogs] = useState<string[]>([
    '[L2-Agent] RevenueForecast ajanı arka planda hazır.',
    '[L3-Agent] OccupancyOptimizer otonom sinyal bekliyor.'
  ]);

  const [forecastResult, setForecastResult] = useState<{
    recommendedMultiplier: number;
    predictedRevenue: number;
    actionTaken: string;
  } | null>(null);

  // Otonom Ajan Döngüsünü Tetikle
  const runAutonomousAgents = async () => {
    setIsProcessing(true);
    addLog('🚀 [L2/L3 Orchestrator] Ajan döngüsü başlatıldı...');

    try {
      // 1. RevenueForecast Ajan Simülasyonu
      addLog('📊 [RevenueForecast] Anlık doluluk ve satış verileri çekiliyor...');
      await new Promise((r) => setTimeout(r, 800));

      const mockOccupancy = Math.floor(Math.random() * 30) + 70; // %70 - %100 arası
      const multiplier = mockOccupancy > 85 ? 1.25 : mockOccupancy > 75 ? 1.10 : 1.00;
      const predicted = Math.floor(45000 * multiplier);

      addLog(`📈 [RevenueForecast] Yoğunluk: %${mockOccupancy} | Dinamik Çarpan: ${multiplier}x`);

      // Supabase'e Dinamik Fiyat Kaydı (opsiyonel - supabase-js kuruluysa)
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
        const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';
        if (supabaseUrl && supabasePublishableKey) {
          const { createClient } = await import('@supabase/supabase-js');
          const supabase = createClient(supabaseUrl, supabasePublishableKey);
          const { error: priceError } = await supabase.from('pricing_logs').insert([
            {
              entity_type: 'parcel',
              entity_id: 'main-plaza',
              old_price: 100,
              new_price: Math.round(100 * multiplier),
              reason: `Otonom Ajan: Yoğunluk %${mockOccupancy} seviyesinde.`,
              ai_model: 'deepseek-v3',
            }
          ]);
          if (!priceError) {
            addLog('✅ [pricing_logs] Dinamik fiyatlandırma Supabase\'e yazıldı.');
          }
        }
      } catch (e) {
        addLog('ℹ️ [pricing_logs] Supabase bağlantısı yok - yerel simülasyon modu.');
      }

      // 2. OccupancyOptimizer Ajan Simülasyonu
      addLog('🧠 [OccupancyOptimizer] Bölgesel yük dengeleme analizi yapılıyor...');
      await new Promise((r) => setTimeout(r, 800));

      let actionMsg = 'Park içi yoğunluk dengeli.';
      if (mockOccupancy > 85) {
        actionMsg = 'Restoran ve gıda alanına özel sadakat indirimi tanımlanarak kalabalık yönlendirildi.';
        addLog('⚠️ [OccupancyOptimizer] Kritik Yoğunluk! Otonom Kampanya Tetiklendi.');
      } else {
        addLog('✨ [OccupancyOptimizer] Optimum doluluk seviyesi korundu.');
      }

      setForecastResult({
        recommendedMultiplier: multiplier,
        predictedRevenue: predicted,
        actionTaken: actionMsg
      });

      addLog('🎯 [Orchestration Complete] Ajan döngüsü başarıyla tamamlandı.');
    } catch (err) {
      addLog('❌ Ajan döngüsünde hata oluştu.');
    } finally {
      setIsProcessing(false);
    }
  };

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString('tr-TR');
    setLogs((prev) => [`[${timestamp}] ${msg}`, ...prev.slice(0, 7)]);
  };

  return (
    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px', color: '#fff', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', marginTop: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #1e293b' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Cpu size={20} color="#a78bfa" style={{ animation: 'pulse 1s infinite' }} />
              L2-L3 AI Ajan Otonomi Kontrol Paneli
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>RevenueForecast & OccupancyOptimizer Arka Plan Ajanları</p>
          </div>

          <button
            onClick={runAutonomousAgents}
            disabled={isProcessing}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '12px', fontSize: '12px', fontWeight: '600', transition: 'all 0.2s', cursor: isProcessing ? 'not-allowed' : 'pointer', border: 'none',
              background: isProcessing ? 'rgba(88,28,135,0.5)' : '#7c3aed',
              color: isProcessing ? '#d8b4fe' : '#fff',
              boxShadow: isProcessing ? 'none' : '0 4px 15px rgba(124,58,237,0.2)',
            }}
          >
            {isProcessing ? (
              <>
                <RefreshCw size={16} style={{ animation: 'spin 1s linear infinite' }} /> Ajanlar Çalışıyor...
              </>
            ) : (
              <>
                <Zap size={16} color="#fcd34d" /> Otonom Döngüyü Tetikle
              </>
            )}
          </button>
        </div>
      </div>

      {/* Ajan Karar Özeti */}
      {forecastResult && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
          <div style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(168,85,247,0.3)', padding: '16px', borderRadius: '12px' }}>
            <div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <TrendingUp size={14} color="#a78bfa" /> Dinamik Çarpan
            </div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#c4b5fd' }}>
              {forecastResult.recommendedMultiplier}x
            </div>
          </div>

          <div style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(16,185,129,0.3)', padding: '16px', borderRadius: '12px' }}>
            <div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={14} color="#34d399" /> Tahmini Günlük Gelir
            </div>
            <div style={{ fontSize: '24px', fontWeight: '800', color: '#6ee7b7' }}>
              ₺{forecastResult.predictedRevenue.toLocaleString('tr-TR')}
            </div>
          </div>

          <div style={{ background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(99,102,241,0.3)', padding: '16px', borderRadius: '12px' }}>
            <div style={{ color: '#94a3b8', fontSize: '12px', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Bot size={14} color="#818cf8" /> Otonom Aksiyon
            </div>
            <div style={{ fontSize: '12px', fontWeight: '500', color: '#e2e8f0', marginTop: '4px' }}>
              {forecastResult.actionTaken}
            </div>
          </div>
        </div>
      )}

      {/* Canlı Ajan Konsol Logları */}
      <div style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid #1e293b', borderRadius: '12px', padding: '16px', fontFamily: 'monospace', fontSize: '12px', color: '#cbd5e1' }}>
        <div style={{ color: '#64748b', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }}></span> Canlı Otonom Sinyal Akışı
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {logs.map((log, index) => (
            <div key={index} style={{ lineHeight: '1.5', borderBottom: '1px solid rgba(30,41,59,0.4)', paddingBottom: '4px' }}>
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
