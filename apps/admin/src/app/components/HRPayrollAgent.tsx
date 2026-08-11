'use client';

import React, { useState } from 'react';
import { Users, Wallet, Award, Clock, Calendar, TrendingUp, Shield, Send } from 'lucide-react';

// ============================================================================
// LİKYA İNSAN KAYNAKLARI - BORDRO & ÖZLÜK HAKLARI AJANI
// Çalışan maaşları + ek primler anlık hesaplanır, haftalık ödeme yapılır
// ============================================================================

interface Employee {
  id: string;
  name: string;
  department: string;
  hourlyRate: number;
  hoursThisWeek: number;
  baseSalary: number;
  bonus: number;
  totalPay: number;
  status: 'active' | 'pending';
}

interface PayrollRun {
  id: string;
  week: string;
  totalPayroll: number;
  employeeCount: number;
  status: 'processing' | 'completed';
}

export default function HRPayrollAgent() {
  const [employees, setEmployees] = useState<Employee[]>([
    { id: '1', name: 'Ali Şahin', department: 'Altyapı', hourlyRate: 150, hoursThisWeek: 40, baseSalary: 24000, bonus: 500, totalPay: 24500, status: 'active' },
    { id: '2', name: 'Mehmet Demir', department: 'IoT', hourlyRate: 140, hoursThisWeek: 38, baseSalary: 22000, bonus: 300, totalPay: 22300, status: 'active' },
    { id: '3', name: 'Zeynep Kaya', department: 'Hukuk', hourlyRate: 160, hoursThisWeek: 42, baseSalary: 26000, bonus: 400, totalPay: 26400, status: 'active' },
    { id: '4', name: 'Can Yılmaz', department: 'Yazılım', hourlyRate: 170, hoursThisWeek: 45, baseSalary: 28000, bonus: 200, totalPay: 28200, status: 'active' },
    { id: '5', name: 'Ayşe Kaya', department: 'Spor', hourlyRate: 130, hoursThisWeek: 35, baseSalary: 20000, bonus: 0, totalPay: 20000, status: 'pending' },
  ]);

  const [payrollRuns, setPayrollRuns] = useState<PayrollRun[]>([
    { id: '1', week: 'Hafta 32 (5-11 Ağustos)', totalPayroll: 121400, employeeCount: 5, status: 'completed' },
  ]);

  const [notifications, setNotifications] = useState<string[]>([
    '📨 Ali Şahin\'e haftalık ödeme hazır: 24.500 ₺ (maaş + 500 ₺ prim)',
  ]);

  const calculatePay = (employeeId: string) => {
    const emp = employees.find((e) => e.id === employeeId);
    if (!emp) return;

    // Maaş + prim + fazla mesai hesapla
    const overtimeHours = Math.max(0, emp.hoursThisWeek - 40);
    const overtimePay = overtimeHours * emp.hourlyRate * 1.5;
    const totalPay = emp.baseSalary + emp.bonus + overtimePay;

    setEmployees((prev) =>
      prev.map((e) => (e.id === employeeId ? { ...e, totalPay, status: 'active' } : e))
    );

    setNotifications((prev) => [
      `💰 ${emp.name} maaş hesaplandı: ${totalPay.toLocaleString('tr-TR')} ₺ (${emp.baseSalary.toLocaleString('tr-TR')} ₺ maaş + ${emp.bonus} ₺ prim + ${overtimePay.toLocaleString('tr-TR')} ₺ fazla mesai)`,
      ...prev,
    ]);
  };

  const runWeeklyPayroll = () => {
    const total = employees.reduce((sum, e) => sum + e.totalPay, 0);

    setPayrollRuns((prev) => [
      { id: String(Date.now()), week: 'Hafta 33 (12-18 Ağustos)', totalPayroll: total, employeeCount: employees.length, status: 'completed' },
      ...prev,
    ]);

    setNotifications((prev) => [
      `✅ Haftalık bordro tamamlandı: ${employees.length} çalışan, toplam ${total.toLocaleString('tr-TR')} ₺ ödendi`,
      ...prev,
    ]);
  };

  const formatTL = (n: number) => n.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  return (
    <div style={{ background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', padding: '24px', color: '#fff', boxShadow: '0 20px 40px rgba(0,0,0,0.4)', marginTop: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid #1e293b' }}>
        <div>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users size={20} color="#34d399" />
            İnsan Kaynakları — Bordro & Özlük Hakları Ajanı
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '4px' }}>Anlık maaş hesaplama • Ek primler • Haftalık ödeme</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <div style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: '10px', padding: '6px 12px', fontSize: '12px', color: '#34d399', fontWeight: '600' }}>
            👥 {employees.length} Çalışan
          </div>
          <div style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: '10px', padding: '6px 12px', fontSize: '12px', color: '#fbbf24', fontWeight: '600' }}>
            💰 Haftalık Bordro: {formatTL(employees.reduce((s, e) => s + e.totalPay, 0))} ₺
          </div>
        </div>
      </div>

      {/* Çalışan Listesi */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0', marginBottom: '12px' }}>👥 Çalışan Maaş & Prim Hesaplama</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {employees.map((e) => (
            <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: '10px', padding: '12px 16px' }}>
              <div>
                <div style={{ fontWeight: '600', fontSize: '13px', color: '#f1f5f9' }}>{e.name} • {e.department}</div>
                <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
                  ⏰ {e.hoursThisWeek} saat/hafta • 💵 {formatTL(e.hourlyRate)} ₺/saat
                </div>
                <div style={{ fontSize: '11px', color: '#34d399', marginTop: '4px' }}>
                  💰 Maaş: {formatTL(e.baseSalary)} ₺ • 🏆 Prim: {formatTL(e.bonus)} ₺
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#fbbf24', fontWeight: '700' }}>{formatTL(e.totalPay)} ₺</span>
                <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '20px', background: e.status === 'active' ? 'rgba(52,211,153,0.2)' : 'rgba(251,191,36,0.2)', color: e.status === 'active' ? '#34d399' : '#fbbf24', border: `1px solid ${e.status === 'active' ? 'rgba(52,211,153,0.3)' : 'rgba(251,191,36,0.3)'}` }}>
                  {e.status === 'active' ? '✅ Ödendi' : '⏳ Bekliyor'}
                </span>
                <button onClick={() => calculatePay(e.id)} style={{ padding: '6px 12px', borderRadius: '8px', border: 'none', background: 'linear-gradient(135deg, #0f4c81, #00f2fe)', color: '#fff', fontSize: '11px', fontWeight: '600', cursor: 'pointer' }}>
                  💰 Hesapla
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Haftalık Bordro */}
      <div style={{ marginBottom: '24px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0', marginBottom: '12px' }}>📅 Haftalık Bordro Çalıştırmaları</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {payrollRuns.map((p) => (
            <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: '10px', padding: '12px 16px' }}>
              <div>
                <div style={{ fontWeight: '600', fontSize: '13px', color: '#f1f5f9' }}>{p.week}</div>
                <div style={{ fontSize: '11px', color: '#94a3b8' }}>{p.employeeCount} çalışan</div>
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#fbbf24', fontWeight: '700' }}>{formatTL(p.totalPayroll)} ₺</span>
                <span style={{ fontSize: '11px', padding: '4px 10px', borderRadius: '20px', background: 'rgba(52,211,153,0.2)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)' }}>
                  ✅ Tamamlandı
                </span>
              </div>
            </div>
          ))}
        </div>
        <button onClick={runWeeklyPayroll} style={{ marginTop: '12px', width: '100%', padding: '12px', borderRadius: '10px', border: 'none', background: 'linear-gradient(135deg, #10B981, #48bb78)', color: '#fff', fontSize: '13px', fontWeight: '700', cursor: 'pointer' }}>
          📅 Haftalık Bordroyu Çalıştır ({formatTL(employees.reduce((s, e) => s + e.totalPay, 0))} ₺)
        </button>
      </div>

      {/* Bildirimler */}
      <div style={{ padding: '16px', background: 'rgba(30,41,59,0.6)', border: '1px solid rgba(51,65,85,0.5)', borderRadius: '12px' }}>
        <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#e2e8f0', marginBottom: '12px' }}>📨 Çalışan Ödeme Bildirimleri</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {notifications.map((n, i) => (
            <div key={i} style={{ fontSize: '12px', color: '#cbd5e1', padding: '8px', background: 'rgba(15,23,42,0.6)', borderRadius: '8px' }}>
              {n}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
