'use client';

import React, { useState } from 'react';
import { priceFamily, referralTier, generateReferralCode, whatsappInviteText, whatsappShareUrl, familyMembershipEngineStatus, type FamilyMember } from '../lib/finance/familyMembershipEngine';
import { createLessonCredit, vaultBalance, reserveMakeup, transferCredit, lessonCreditVaultStatus, type CreditVault, type LessonCredit } from '../lib/sports/lessonCreditVault';
import { requestChildPurchase, approvePurchase, parentalApprovalEngineStatus, type PurchaseRequest } from '../lib/finance/parentalApprovalEngine';
import { maskCard } from '../lib/security/kvkkMaskingEngine';
import { initMockBands, assignBandToMember, reportLost, processReturn, onTapAccess, posSwipeCanteen, smartArmbandEngineStatus, type ArmbandDevice } from '../lib/hardware/smartArmbandEngine';
import { buildDailyPerformance, recordTelemetry, recordCoaching, matchPlayerToBeacon, startCourtSession, averageReaction, type TelemetrySample, type CoachingRecord, type DailyPerformance } from '../lib/sports/armbandCoachingBridge';
import { buildAutonomousReportCard, buildWeekTrend, autonomousReportCardStatus, type AthleteReportCard, type WeekTrendPoint } from '../lib/sports/autonomousReportCard';
import { getShuttleStatus, advanceShuttle, recordGateEntry, getSecurityLog, facilityShuttleRadarStatus, type ShuttleStatus, type SecurityEvent } from '../lib/ops/facilityShuttleRadar';
import { generateStepTelemetry, computeContactMetrics, classifyGait, gaitLabel, insoleRiskRadar, smartInsoleEngineStatus, type InsoleTelemetry } from '../lib/sports/smartInsoleEngine';
import { fuseSensorStream, coachGuidance, type FusionSnapshot, type CameraObservation } from '../lib/sports/multimodalFusionBridge';

// ============================================================================
// ⚡ EXTREMES — MÜŞTERİ PORTALI (Süper-App) — D&D Yazılım Gıda Perakende Ltd. Şti.
// Aile indirimleri • 365 gün ders kredisi • 10x referans • ebeveyn onaylı çocuk
// cüzdanı. Modern kart mimarisi. Plan Z güvenli.
// ============================================================================

const FAMILY: FamilyMember[] = [
  { id: 'V1', name: 'Ali (Veli)', relation: 'self', basePriceTl: 1500 },
  { id: 'V2', name: 'Efe (Çocuk)', relation: 'child', basePriceTl: 900 },
  { id: 'V3', name: 'Deniz (Çocuk)', relation: 'child', basePriceTl: 900 },
];

export default function ExtremeSCustomerPortal() {
  const [family] = useState(FAMILY);
  const [vault, setVault] = useState<CreditVault>(() => {
    const credits: LessonCredit[] = [createLessonCredit('Efe', 'L1'), createLessonCredit('Efe', 'L2'), createLessonCredit('Efe', 'L3')];
    return { ownerId: 'V1', credits };
  });
  const [approval, setApproval] = useState<{ state: string; message: string } | null>(null);
  const [referrals, setReferrals] = useState(3);
  const [bands, setBands] = useState<ArmbandDevice[]>(() => initMockBands());
  const [perf, setPerf] = useState<DailyPerformance>(() => buildDailyPerformance('Efe'));
  const [telemetry, setTelemetry] = useState<TelemetrySample[]>([]);
  const [bandMsg, setBandMsg] = useState('');
  const [accessMsg, setAccessMsg] = useState('');
  const [posMsg, setPosMsg] = useState('');
  const [coach, setCoach] = useState<CoachingRecord | null>(null);
  const [card, setCard] = useState<AthleteReportCard>(() => buildAutonomousReportCard('Efe'));
  const [trend, setTrend] = useState<WeekTrendPoint[]>(() => buildWeekTrend('Efe'));
  const [shuttle, setShuttle] = useState<ShuttleStatus>(() => getShuttleStatus());
  const [secLog, setSecLog] = useState<SecurityEvent[]>(() => getSecurityLog());
  const [insole, setInsole] = useState<InsoleTelemetry>(() => generateStepTelemetry('R', 1.0, 1.02, 3));
  const [insoleMsg, setInsoleMsg] = useState('');
  const [fusion, setFusion] = useState<FusionSnapshot | null>(null);

  const pricing = priceFamily(family);
  const benefit = referralTier(referrals);
  const code = generateReferralCode('V1');
  const balance = vaultBalance(vault);
  const progress = Math.min(100, Math.round((referrals / 8) * 100));

  const purchase: PurchaseRequest = { requestId: 'RQ-2', childId: 'Efe', childName: 'Efe', item: 'Raket Kiralama', amountTl: 450, category: 'kiralama' };
  const runApproval = () => {
    const first = requestChildPurchase(purchase, { childId: 'Efe', dailyMicroLimitTl: 150, spentTodayTl: 30, cardSaved: true });
    setApproval({ state: first.state, message: first.message });
    if (first.state === 'PENDING_PARENT_APPROVAL') setTimeout(() => setApproval({ state: 'APPROVED', message: approvePurchase(purchase, true).message }), 1500);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', maxWidth: 860, margin: '0 auto', background: 'linear-gradient(160deg, #f8fafc, #eef2ff)', borderRadius: '22px', padding: '20px', boxShadow: '0 12px 40px rgba(79,70,229,0.15)', color: '#0f172a' }}>
      {/* ÜST BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', paddingBottom: '14px', borderBottom: '1px solid #e2e8f0' }}>
        <div>
          <div style={{ fontSize: '22px', fontWeight: 900, background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>⚡ ExtremeS</div>
          <div style={{ fontSize: '10px', color: '#64748b' }}>Hoş geldiniz Ali Bey • D&D Yazılım Gıda Perakende Ltd. Şti.</div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '10px', fontWeight: 800, padding: '6px 12px', borderRadius: '999px', background: '#4f46e5', color: '#fff' }}>💳 {maskCard('4546710011223344')} (Token)</span>
          <span style={{ fontSize: '10px', fontWeight: 800, padding: '6px 12px', borderRadius: '999px', background: '#ecfdf5', color: '#059669', border: '1px solid #34d399' }}>👨‍👩‍👧‍👦 Aile %{pricing.familyDiscountPct} İndirim</span>
        </div>
      </div>

      {/* HIZLI REZERVASYON */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '10px' }}>
        {[{ icon: '🎾', label: 'Padel Kort A', sub: '16:00 • ₺400' }, { icon: '🏸', label: 'Tenis Kort B', sub: '18:00 • ₺350' }, { icon: '🧑‍🏫', label: 'Özel Antrenman', sub: 'Kredi ile 3→1' }].map((c) => (
          <button key={c.label} style={{ padding: '16px 10px', borderRadius: '14px', border: '1px solid #e2e8f0', background: '#fff', cursor: 'pointer', boxShadow: '0 2px 8px rgba(15,23,42,0.05)', textAlign: 'center' }}>
            <div style={{ fontSize: '24px' }}>{c.icon}</div>
            <div style={{ fontSize: '12px', fontWeight: 800, color: '#0f172a' }}>{c.label}</div>
            <div style={{ fontSize: '10px', color: '#4f46e5', fontWeight: 700 }}>{c.sub}</div>
          </button>
        ))}
      </div>

      {/* DERS KREDİSİ CÜZDANI */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '14px' }}>
        <div style={{ fontSize: '11px', fontWeight: 800, color: '#0f172a' }}>🎟️ Ders Kredisi Cüzdanı <span style={{ color: '#64748b', fontWeight: 400 }}>({lessonCreditVaultStatus()})</span></div>
        <div style={{ fontSize: '26px', fontWeight: 900, color: '#4f46e5' }}>{balance.usable} <span style={{ fontSize: '12px', color: '#64748b' }}>kredi • 365 gün</span></div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
          <button onClick={() => { reserveMakeup(vault, 'group'); setVault({ ...vault }); }} style={lightBtn}>📅 Telafi Rezerve</button>
          <button onClick={() => { reserveMakeup(vault, 'private'); setVault({ ...vault }); }} style={lightBtn}>🎯 Özel Derse Çevir</button>
          <button onClick={() => { transferCredit(vault, 'Deniz', vault.credits[0]?.id ?? ''); setVault({ ...vault }); }} style={lightBtn}>↔️ Kardeşe Devret</button>
        </div>
      </div>

      {/* EBEVEYN ONAY KARTI */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '14px' }}>
        <div style={{ fontSize: '11px', fontWeight: 800, color: '#0f172a' }}>🛡️ Çocuk Harcama Denetimi — Efe (18 yaş altı)</div>
        <div style={{ fontSize: '10px', color: '#64748b', marginTop: '4px' }}>Günlük mikro limit: ₺150 • Harcanan: ₺30 • {parentalApprovalEngineStatus()}</div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button onClick={runApproval} style={primaryBtn}>🧪 ₺450 Raket Kiralama Talebi</button>
          {approval && (
            <div style={{ fontSize: '11px', fontWeight: 700, color: approval.state === 'APPROVED' ? '#059669' : approval.state === 'PENDING_PARENT_APPROVAL' ? '#b45309' : '#dc2626', background: approval.state === 'APPROVED' ? '#ecfdf5' : approval.state === 'PENDING_PARENT_APPROVAL' ? '#fffbeb' : '#fef2f2', border: '1px solid currentColor', borderRadius: '10px', padding: '8px 12px' }}>
              {approval.state} — {approval.message.slice(0, 70)}…
            </div>
          )}
        </div>
      </div>

      {/* AKILLI PAZU BANDI KARTI */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#0f172a' }}>🏷️ Akıllı Pazu Bantlarım <span style={{ fontWeight: 500, color: '#64748b', fontSize: '9px' }}>NFC/RFID + BLE Beacon</span></div>
          <span style={{ fontSize: '9px', fontWeight: 700, color: '#4f46e5', background: '#eef2ff', padding: '4px 10px', borderRadius: '999px' }}>{smartArmbandEngineStatus()}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
          {bands.map((b) => (
            <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '10px 12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '22px' }}>⌚</span>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: 800, color: '#0f172a' }}>{b.id} — {b.assignedUserId} <span style={{ fontSize: '9px', color: '#64748b' }}>{b.nfcTagId} · {b.bleUuid}</span></div>
                  <div style={{ fontSize: '9px', color: b.status === 'ACTIVE' ? '#059669' : b.status === 'RETURNED' ? '#64748b' : '#dc2626' }}>
                    {b.status === 'ACTIVE' ? '🟢 Aktif' : b.status === 'RETURNED' ? '⚪ İade edildi' : '🔴 Kayıp/Kilitli'} • Depozito ₺{b.depositAmount} {b.status === 'ACTIVE' ? '(iade edilebilir)' : b.status === 'LOST' ? '(irat edildi)' : '(iade edildi)'}
                  </div>
                </div>
              </div>
              {b.status === 'ACTIVE' && (
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => { const r = reportLost(b.id); setBands(initMockBands()); setBandMsg(`🚨 ${b.id} kilitlendi — erişim iptal, ₺${r.forfeitedTl} irat`); }} style={{ fontSize: '9px', fontWeight: 800, padding: '7px 12px', borderRadius: '10px', border: '1px solid #fecaca', background: '#fef2f2', color: '#dc2626', cursor: 'pointer' }}>🔒 Kaybettim / Kilitle</button>
                  <button onClick={() => { const r = processReturn(b.id); setBands(initMockBands()); setBandMsg(r.ok ? `✅ ${r.message}` : `⚠️ ${r.message}`); }} style={{ fontSize: '9px', fontWeight: 800, padding: '7px 12px', borderRadius: '10px', border: '1px solid #bbf7d0', background: '#f0fdf4', color: '#059669', cursor: 'pointer' }}>↩️ İade Et</button>
                </div>
              )}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button onClick={() => { const { band } = assignBandToMember('Efe', 'FAM-1'); setBands(initMockBands()); setBandMsg(`🆕 ${band.id} atandı (${band.bleUuid}) — 500 ₺ depozito kaydedildi`); }} style={lightBtn}>➕ Yeni Bant Talep Et</button>
          <button onClick={() => { setAccessMsg(onTapAccess('NFC-8A3F21').reason); }} style={lightBtn}>🚪 Kapı NFC Testi</button>
          <button onClick={() => { const r = posSwipeCanteen('BND-001', 190, 'Menü 2 + İçecek'); setPosMsg(r.parentalNotice ? `🛡️ ${r.state} — Ebeveyn onayı beklemede! ${r.message.slice(0, 40)}` : `💳 ${r.message}`); }} style={lightBtn}>🛒 POS ₺190 (Çocuk)</button>
        </div>
        <div style={{ display: 'flex', gap: '6px', marginTop: '8px', flexWrap: 'wrap' }}>
          {bandMsg && <span style={{ fontSize: '9.5px', fontWeight: 700, color: '#4f46e5', background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: '10px', padding: '6px 10px' }}>{bandMsg}</span>}
          {accessMsg && <span style={{ fontSize: '9.5px', fontWeight: 700, color: accessMsg.includes('✅') ? '#059669' : '#dc2626', background: accessMsg.includes('✅') ? '#f0fdf4' : '#fef2f2', border: '1px solid currentColor', borderRadius: '10px', padding: '6px 10px' }}>{accessMsg}</span>}
          {posMsg && <span style={{ fontSize: '9.5px', fontWeight: 700, color: posMsg.includes('onayı beklemede') ? '#b45309' : '#059669', background: posMsg.includes('onayı beklemede') ? '#fffbeb' : '#f0fdf4', border: '1px solid currentColor', borderRadius: '10px', padding: '6px 10px' }}>{posMsg}</span>}
        </div>
      </div>

      {/* GÜNÜN ANTRENMAN PERFORMANSI KARTI */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#0f172a' }}>🏃 Günün Antrenman Performansı — Efe</div>
          <span style={{ fontSize: '9px', fontWeight: 700, color: '#7c3aed', background: '#f5f3ff', padding: '4px 10px', borderRadius: '999px' }}>SportVisionX + Pazu Bandı Otomatik Karne</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px', marginTop: '10px' }}>
          {[
            ['🎾 Şut', `${perf.shots}`],
            ['🎯 İsabet', `%${perf.accuracyPct}`],
            ['🔥 Kalori', `${perf.calories} kcal`],
            ['⚡ Ort. Salınım', `${perf.avgSwingKmh} km/h`],
            ['🫀 Yorgunluk', `%${perf.maxFatiguePct}`],
            ['⏱️ CatchPad', `${perf.avgCatchPadMs} ms`],
          ].map(([k, v]) => (
            <div key={k} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '9px', color: '#64748b' }}>{k}</div>
              <div style={{ fontSize: '16px', fontWeight: 900, color: '#0f172a' }}>{v}</div>
            </div>
          ))}
        </div>
        <div style={{ fontSize: '10px', fontWeight: 600, color: perf.maxFatiguePct > 80 ? '#b45309' : '#059669', background: perf.maxFatiguePct > 80 ? '#fffbeb' : '#f0fdf4', border: '1px solid currentColor', borderRadius: '10px', padding: '8px 12px', marginTop: '10px' }}>🧑‍🏫 Antrenör notu: {perf.coachNote}</div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => { const s = startCourtSession('Efe', 'BLE-7C91-E2', 'Padel Kort A'); setBandMsg(`🏁 Seans başladı (${s.court}) — yoklama yazıldı`); }} style={lightBtn}>🏁 Korta Gir (Yoklama)</button>
          <button onClick={() => { const t = recordTelemetry('Efe', 24 + telemetry.length); setTelemetry((p) => [...p, t]); const p = buildDailyPerformance('Efe'); setPerf(p); }} style={lightBtn}>📡 Telemetri Al ({telemetry.length + 25}. şut)</button>
          <button onClick={() => { const c = recordCoaching('CO-1', 'Padel Kort A', 45, 4); setCoach(c); setBandMsg(`🧑🏫 Koçluk kaydı: 45 dk sahada → sporcu başına ${c.attentionPerPlayerMin} dk ilgilenme`); }} style={lightBtn}>🧑🏫 Koç Modu (45 dk)</button>
          {coach && <span style={{ fontSize: '9.5px', fontWeight: 700, color: '#059669', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', padding: '6px 10px' }}>Antrenör: {coach.activeMinutes} dk aktif • {coach.attentionPerPlayerMin} dk/sporcu</span>}
        </div>
        {telemetry.length > 0 && (
          <div style={{ marginTop: '10px', fontSize: '9px', color: '#64748b' }}>
            📡 Canlı: {averageReaction().avgMs} ms reaksiyon ort. • %{averageReaction().hitRatePct} CatchPad isabet • en iyi {averageReaction().bestMs} ms
          </div>
        )}
      </div>

      {/* CANLI GELİŞİM KARNEM — OTONOM */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#0f172a' }}>📊 Canlı Gelişim Karnem — {card.branch} <span style={{ fontSize: '9px', color: '#64748b', fontWeight: 500 }}>SportVisionX telemetrisinden otomatik</span></div>
          <span style={{ fontSize: '11px', fontWeight: 900, color: '#f59e0b' }}>{'⭐'.repeat(card.stars)}{'☆'.repeat(5 - card.stars)}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '8px', marginTop: '10px' }}>
          {[
            ['🎯 İsabet', `%${card.telemetry.accuracyPct}`, '#4f46e5'],
            ['⚡ Vuruş Hızı', `${card.telemetry.swingSpeedKmh} km/h`, '#7c3aed'],
            ['⏱️ Reaksiyon', `${card.telemetry.catchPadMs} ms`, '#0891b2'],
            ['🫀 Yorgunluk', `%${card.telemetry.fatiguePct}`, card.telemetry.fatiguePct > 80 ? '#dc2626' : '#059669'],
            ['🛡️ ACWR', `${card.acwr}`, card.acwr > 1.4 ? '#dc2626' : '#059669'],
            ['📈 Haftalık Yük', `${card.weeklyLoad} AU`, '#9333ea'],
          ].map(([k, v, c]) => (
            <div key={k as string} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '9px', color: '#64748b' }}>{k}</div>
              <div style={{ fontSize: '15px', fontWeight: 900, color: c as string }}>{v}</div>
            </div>
          ))}
        </div>
        {/* Catapult tarzı 4 haftalık efor barı */}
        <div style={{ marginTop: '12px' }}>
          <div style={{ fontSize: '9px', color: '#64748b', marginBottom: '4px' }}>Catapult tarzı haftalık efor (AU)</div>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'flex-end', height: '44px' }}>
            {trend.map((t) => (
              <div key={t.week} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px' }}>
                <div style={{ fontSize: '8px', fontWeight: 700, color: t.acwr > 1.4 ? '#dc2626' : '#64748b' }}>{t.load}</div>
                <div style={{ width: '100%', height: `${Math.min(100, (t.load / 3500) * 100)}%`, minHeight: '10px', borderRadius: '6px 6px 2px 2px', background: t.acwr > 1.4 ? 'linear-gradient(180deg,#ef4444,#fca5a5)' : 'linear-gradient(180deg,#4f46e5,#a78bfa)' }} />
                <div style={{ fontSize: '8px', color: '#94a3b8' }}>{t.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div style={{ fontSize: '10px', fontWeight: 600, color: card.acwr > 1.3 ? '#b45309' : '#059669', background: card.acwr > 1.3 ? '#fffbeb' : '#f0fdf4', border: '1px solid currentColor', borderRadius: '10px', padding: '8px 12px', marginTop: '10px' }}>🧠 {card.coachNote}</div>
      </div>

      {/* KULÜP İÇİ RADAR & SERVİS */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#0f172a' }}>🚌 Kulüp İçi Radar & Servis</div>
          <span style={{ fontSize: '9px', fontWeight: 700, color: '#0369a1', background: '#e0f2fe', padding: '4px 10px', borderRadius: '999px' }}>{autonomousReportCardStatus().split('•')[0]} • {facilityShuttleRadarStatus()}</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '10px 12px' }}>
            <div>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#0f172a' }}>🚐 SRV-07 — {shuttle.nextStop.name}</div>
              <div style={{ fontSize: '9px', color: '#64748b' }}>📍 {shuttle.currentPoint.lat}, {shuttle.currentPoint.lng} • {shuttle.driver} • {shuttle.passengers}/{shuttle.capacity} yolcu</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 900, color: '#0284c7' }}>{shuttle.etaMinutes} dk</div>
              <div style={{ fontSize: '8px', color: '#64748b' }}>tahmini varış</div>
            </div>
            <button onClick={() => { setShuttle(advanceShuttle(18)); }} style={lightBtn}>📡 Konumu Güncelle</button>
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button onClick={() => { const e = recordGateEntry('Efe', 'NFC-8A3F21', 'Ana Turnike'); setSecLog(getSecurityLog()); setBandMsg(e.message); }} style={lightBtn}>🛡️ Efe Giriş Kaydet</button>
            <button onClick={() => { const e = recordGateEntry('Deniz', 'NFC-44D9B0', 'Spor Kompleksi'); setSecLog(getSecurityLog()); setBandMsg(e.message); }} style={lightBtn}>🛡️ Deniz Giriş Kaydet</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {secLog.slice(0, 4).map((e) => (
              <div key={e.id} style={{ fontSize: '9.5px', color: '#334155', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '7px 10px' }}>
                <span style={{ fontWeight: 800, color: '#4f46e5' }}>{e.time}</span> • {e.message}
              </div>
            ))}
            {secLog.length === 0 && <div style={{ fontSize: '9.5px', color: '#94a3b8' }}>Henüz güvenlik olayı yok — turnike geçişleri burada listelenir.</div>}
          </div>
        </div>
      </div>

      {/* AKILLI TABANLIK & BARIŞ ANALİZİ */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#0f172a' }}>🦶 Akıllı Tabanlık & Basış Analizi <span style={{ fontSize: '9px', color: '#64748b', fontWeight: 500 }}>Plantiga sınıfı • 6 nokta FSR + 200Hz IMU</span></div>
          <span style={{ fontSize: '9px', fontWeight: 700, color: '#0d9488', background: '#f0fdfa', padding: '4px 10px', borderRadius: '999px' }}>{smartInsoleEngineStatus()}</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', marginTop: '10px' }}>
          {/* Basınç ısı haritası — ayak şekli */}
          <div style={{ background: '#0f172a', borderRadius: '14px', padding: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ fontSize: '9px', color: '#94a3b8', marginBottom: '6px' }}>Basınç Isı Haritası (kPa)</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '100%' }}>
              {[
                ['👣 Parmaklar', insole.pressure.toes, '#f472b6'],
                ['1. Metatars', insole.pressure.met1, '#a78bfa'],
                ['5. Metatars', insole.pressure.met5, '#818cf8'],
                ['Taban Kavisi', insole.pressure.midfoot, '#38bdf8'],
                ['Topuk', insole.pressure.heel, '#f87171'],
              ].map(([label, val, base]) => {
                const pct = Math.min(1, (val as number) / 100);
                const a = Math.round(40 + pct * 60).toString(16).padStart(2, '0');
                const bg = `linear-gradient(90deg, ${base as string}${a}, ${base as string}88)`;
                return (
                  <div key={label as string} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '9px', color: '#e2e8f0', padding: '6px 8px', borderRadius: '8px', background: bg, border: '1px solid rgba(255,255,255,0.12)' }}>
                    <span>{label}</span><span style={{ fontWeight: 800 }}>{val} kPa</span>
                  </div>
                );
              })}
            </div>
          </div>
          {/* Analitik özet */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              {[
                ['Zemin Teması', `${insole.gctMs} ms`, computeContactMetrics(insole.gctMs, insole.flightMs).band, insole.gctMs > 220 ? '#dc2626' : '#059669'],
                ['RSI', `${insole.rsi}`, 'Reaktif Güç', '#7c3aed'],
                ['Basış Tipi', gaitLabel(insole.gaitType), `${insole.pronationAngle}°`, insole.gaitType === 'NEUTRAL' ? '#059669' : '#d97706'],
                ['Simetri', `%${100 - insole.stepAsymmetry}`, `${insole.stepAsymmetry > 10 ? '⚠️ asimetrik' : 'denge sağlam'}`, insole.stepAsymmetry > 10 ? '#dc2626' : '#059669'],
              ].map(([k, v, s, c]) => (
                <div key={k as string} style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '8px', textAlign: 'center' }}>
                  <div style={{ fontSize: '9px', color: '#64748b' }}>{k}</div>
                  <div style={{ fontSize: '14px', fontWeight: 900, color: c as string }}>{v}</div>
                  <div style={{ fontSize: '8px', color: '#94a3b8' }}>{s}</div>
                </div>
              ))}
            </div>
            <div style={{ fontSize: '9px', color: '#475569', lineHeight: '1.5' }}>
              💬 Sağ ayak içe basma açısı: {insole.pronationAngle}° ({insole.gaitType === 'NEUTRAL' ? 'Normal' : 'Dikkat'}) • Ortalama Zemin Teması: {insole.gctMs} ms ({computeContactMetrics(insole.gctMs, insole.flightMs).band})
            </div>
            {insoleRiskRadar(insole).filter((a) => a.severity !== 'INFO').map((a) => (
              <div key={a.code} style={{ fontSize: '9px', fontWeight: 700, color: a.severity === 'CRITICAL' ? '#dc2626' : '#b45309', background: a.severity === 'CRITICAL' ? '#fef2f2' : '#fffbeb', border: '1px solid currentColor', borderRadius: '8px', padding: '6px 8px' }}>🚩 {a.message}</div>
            ))}
            {fusion && (
              <div style={{ fontSize: '9px', fontWeight: 700, color: fusion.fatigueZone === 'GREEN' ? '#059669' : fusion.fatigueZone === 'YELLOW' ? '#b45309' : '#dc2626', background: fusion.fatigueZone === 'GREEN' ? '#f0fdf4' : fusion.fatigueZone === 'YELLOW' ? '#fffbeb' : '#fef2f2', border: '1px solid currentColor', borderRadius: '8px', padding: '6px 8px' }}>
                🔗 3'lü Füzyon (Kamera+Pazu+Tabanlık): skor {fusion.fusionScore}/100 • {coachGuidance(fusion.fatigueZone, fusion.alerts).slice(0, 42)}
              </div>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', marginTop: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button onClick={() => { const t = generateStepTelemetry('R', 1.0, 1.02, 3 + Math.floor(Math.random() * 5)); setInsole(t); }} style={lightBtn}>👟 Adım Ölç ({insole.gctMs} ms)</button>
          <button onClick={() => { const cam: CameraObservation = { trackingId: 'TRK-004', court: 'Padel Kort A', speedMps: 4.2, displacementM: 120 }; const f = fuseSensorStream('Efe', cam, 'BLE-7C91-E2', bands, insole); setFusion(f); setInsoleMsg(f.summary.slice(0, 60)); }} style={lightBtn}>🔗 Füzyon Testi</button>
          <button onClick={() => setInsoleMsg('🛒 Likya Market: Akıllı Tabanlık ₺340 sepete eklendi — sporcu ayakkabısına özel kalıp')} style={primaryBtn}>🛒 Tabanlık Sipariş Et / Eşleştir</button>
          {insoleMsg && <span style={{ fontSize: '9.5px', fontWeight: 700, color: '#4f46e5', background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: '10px', padding: '6px 10px' }}>{insoleMsg}</span>}
        </div>
      </div>

      {/* 10x REFERANS */}


      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '14px' }}>
        <div style={{ fontSize: '11px', fontWeight: 800, color: '#0f172a' }}>🎁 10x Viral Referans — Davet Et & İndirim Kazan</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginTop: '8px', alignItems: 'center' }}>
          <span style={{ fontSize: '12px', fontWeight: 900, color: '#4f46e5' }}>EXTREMES-{code} <span style={{ color: '#64748b', fontWeight: 400 }}>• {referrals} davet → {benefit.reward}</span></span>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setReferrals((c) => Math.min(10, c + 1))} style={lightBtn}>➕ +1</button>
            <a href={whatsappShareUrl(whatsappInviteText('Ali', code))} target="_blank" rel="noreferrer" style={{ fontSize: '10px', fontWeight: 800, padding: '8px 14px', borderRadius: '10px', textDecoration: 'none', background: 'linear-gradient(135deg,#25d366,#4ade80)', color: '#0d1322' }}>📲 WhatsApp Davet</a>
          </div>
        </div>
        <div style={{ marginTop: '10px', height: '8px', borderRadius: '99px', background: '#e2e8f0', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, borderRadius: '99px', background: 'linear-gradient(90deg,#4f46e5,#7c3aed)', transition: 'width .3s' }} />
        </div>
        <div style={{ fontSize: '9px', color: '#64748b', marginTop: '4px' }}>8 davete kadar ücretsiz VIP üyelik ilerlemesi: %{progress} ({Math.max(0, 8 - referrals)} kaldı)</div>
      </div>
      <div style={{ fontSize: '9px', color: '#94a3b8', textAlign: 'center' }}>{familyMembershipEngineStatus()}</div>
    </div>
  );
}

const lightBtn: React.CSSProperties = { fontSize: '10px', fontWeight: 800, padding: '8px 14px', borderRadius: '10px', border: '1px solid #c7d2fe', background: '#eef2ff', color: '#4f46e5', cursor: 'pointer' };
const primaryBtn: React.CSSProperties = { fontSize: '10px', fontWeight: 800, padding: '9px 14px', borderRadius: '10px', border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg,#4f46e5,#7c3aed)', color: '#fff' };

