'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  FIELD_DEVICE_PROFILES,
  fieldDeviceProfile,
  rssiQuality,
  rssiBars,
  batteryVoltageGauge,
  batteryHealth,
  computeBaselineZero,
  BASELINE_CALIBRATION_MS,
  BASELINE_CALIBRATION_SAMPLES,
  BASELINE_CALIBRATION_SAMPLE_RATE_HZ,
  bondDevice,
  upsertBondedDevice,
  serializeBondedDevices,
  parseBondedDevices,
  BONDED_DEVICES_KEY,
  type BondedDevice,
  type FieldDeviceKind,
  type CalibrationResult,
} from '../../app/lib/hardware/fieldPairingWizardEngine.ts';

// ============================================================================
// 🧲 KORT TABLET BLE EŞLEŞTİRME & KALİBRASYON SİHİRBAZI (Adım 102)
// Adımlar: 1) Keşif (Insole Sol / Insole Sağ / Decathlon HRM)
//          2) RSSI ölçer + pil voltaj göstergesi
//          3) 5 saniyelik baseline zero-kalibrasyonu
//          4) Bonded kayıt → localStorage'a otomatik kayıt (1 dokunuşla bağlan)
// Motor: fieldPairingWizardEngine.ts
// ============================================================================

type WizardStep = 'discover' | 'meter' | 'calibrate' | 'done';

export default function FieldPairingWizard() {
  const [step, setStep] = useState<WizardStep>('discover');
  const [activeKind, setActiveKind] = useState<FieldDeviceKind>('insole_left');
  const [rssi, setRssi] = useState(-60);
  const [voltage, setVoltage] = useState(4.05);
  const [calibration, setCalibration] = useState<CalibrationResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [connectedId, setConnectedId] = useState<string | null>(null);
  const [bonded, setBonded] = useState<BondedDevice[]>(() =>
    typeof localStorage !== 'undefined' ? parseBondedDevices(localStorage.getItem(BONDED_DEVICES_KEY)) : [],
  );
  const calSamples = useRef<number[]>([]);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  const profile = fieldDeviceProfile(activeKind);
  const gauge = batteryVoltageGauge(voltage, profile.batteryRange);
  const bars = rssiBars(rssi);
  const quality = rssiQuality(rssi);
  const batHealth = batteryHealth(voltage, profile.lowBatteryVolt);

  function persist(devices: BondedDevice[]) {
    setBonded(devices);
    if (typeof localStorage !== 'undefined') localStorage.setItem(BONDED_DEVICES_KEY, serializeBondedDevices(devices));
  }

  // Simüle BLE ölçümleri — gerçek navigator.bluetooth ortamında buraya
  // requestDevice() + characteristic read yerleşir; motor aynıdır.
  function refreshMetrics() {
    setRssi(-40 - Math.floor(Math.random() * 45));
    setVoltage(3.6 + Math.random() * 0.6);
  }

  function startDiscovery() {
    refreshMetrics();
    setStep('meter');
  }

  function saveBonded() {
    const device = bondDevice(activeKind, `sim-${activeKind}-${Date.now().toString(36)}`, { rssi, voltage });
    const updated = upsertBondedDevice(bonded, device);
    persist(updated);
    setConnectedId(device.deviceId);
  }

  function oneTapReconnect(device: BondedDevice) {
    setActiveKind(device.kind);
    setRssi(device.rssi);
    setVoltage(device.voltage);
    setConnectedId(device.deviceId);
    setStep('meter');
  }

  function startCalibration() {
    calSamples.current = [];
    setBusy(true);
    setCalibration(null);
    const intervalMs = Math.max(1, BASELINE_CALIBRATION_MS / BASELINE_CALIBRATION_SAMPLES);
    timer.current = setInterval(() => {
      // Bazal durum örneklemesi (~0 çevresinde küçük gürültü)
      calSamples.current.push(Math.round((Math.random() * 1.4 - 0.7) * 100) / 100);
      if (calSamples.current.length >= BASELINE_CALIBRATION_SAMPLES && timer.current) {
        clearInterval(timer.current);
        timer.current = null;
        setCalibration(computeBaselineZero(calSamples.current));
        setBusy(false);
        setStep('done');
      }
    }, intervalMs);
  }

  return (
    <div style={{ width: '100%', background: 'rgba(2,6,23,0.7)', borderRadius: 14, padding: 12 }}>
      <div style={{ display: 'flex', gap: 6, marginBottom: 10, flexWrap: 'wrap' }}>
        {FIELD_DEVICE_PROFILES.map((p) => (
          <button
            key={p.kind}
            onClick={() => { setActiveKind(p.kind); setStep('discover'); }}
            style={{
              ...chip,
              borderColor: p.kind === activeKind ? '#00f2fe' : '#334155',
              color: p.kind === activeKind ? '#00f2fe' : '#94a3b8',
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {step === 'discover' && (
        <div>
          <div style={{ fontSize: 12, color: '#e2e8f0', marginBottom: 4 }}>① Cihazı keşfet — {profile.label}</div>
          <div style={{ fontSize: 9, color: '#64748b', marginBottom: 8 }}>
            Service: {profile.serviceUuid.slice(0, 8)}… · Eşleşme adları: {profile.namePatterns.join(' / ')}
          </div>
          <button onClick={startDiscovery} style={primary}>📡 BLE Tara (Keşfi Başlat)</button>
        </div>
      )}

      {step === 'meter' && (
        <div>
          <div style={{ fontSize: 12, color: '#e2e8f0', marginBottom: 8 }}>② Sinyal &amp; pil kontrolü</div>
          {/* RSSI metre */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <span style={{ fontSize: 9, color: '#94a3b8', width: 90 }}>RSSI: <b style={{ color: '#e2e8f0' }}>{rssi} dBm</b></span>
            <div style={{ display: 'flex', gap: 3 }}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} style={{ width: 18, height: i * 4 + 6, borderRadius: 2, background: i <= bars ? '#00f2fe' : '#1e293b' }} />
              ))}
            </div>
            <span style={{ fontSize: 9, fontWeight: 800, color: bars >= 3 ? '#10B981' : bars === 2 ? '#F27A1A' : '#F43F5E' }}>{quality}</span>
          </div>
          {/* Pil voltaj göstergesi */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ fontSize: 9, color: '#94a3b8', width: 90 }}>Pil: <b style={{ color: '#e2e8f0' }}>{voltage.toFixed(2)}V</b></span>
            <div style={{ flex: 1, height: 8, borderRadius: 4, background: '#1e293b', overflow: 'hidden' }}>
              <div style={{ width: `${gauge}%`, height: '100%', borderRadius: 4, background: gauge > 50 ? '#10B981' : gauge > 20 ? '#F27A1A' : '#F43F5E' }} />
            </div>
            <span style={{ fontSize: 9, fontWeight: 800, color: batHealth === 'good' ? '#10B981' : batHealth === 'low' ? '#F27A1A' : '#F43F5E' }}>{gauge}%</span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            <button onClick={refreshMetrics} style={mini}>🔄 Ölçümü Yenile</button>
            <button onClick={() => setStep('calibrate')} style={primary}>İleri → Kalibrasyon</button>
          </div>
        </div>
      )}

      {step === 'calibrate' && (
        <div>
          <div style={{ fontSize: 12, color: '#e2e8f0', marginBottom: 4 }}>③ Baseline zero-kalibrasyonu (5 sn)</div>
          <div style={{ fontSize: 9, color: '#64748b', marginBottom: 8 }}>
            Sporcu ayakta sabit dursun · {BASELINE_CALIBRATION_SAMPLES} örnek @ {BASELINE_CALIBRATION_SAMPLE_RATE_HZ}Hz
          </div>
          <button onClick={startCalibration} disabled={busy} style={busy ? { ...primary, opacity: 0.5 } : primary}>
            {busy ? '⏳ Kalibrasyon sürüyor…' : '🎯 Başlat (5 sn)'}
          </button>
        </div>
      )}

      {step === 'done' && calibration && (
        <div>
          <div style={{ fontSize: 12, color: '#e2e8f0', marginBottom: 4 }}>
            {calibration.stable ? '✅ Kalibrasyon stabil' : '⚠️ Kalibrasyon değişken'}
          </div>
          <div style={{ fontSize: 9, color: '#94a3b8', marginBottom: 8 }}>
            Ofset: <b style={{ color: '#e2e8f0' }}>{calibration.offset}</b> · Ort: {calibration.mean} · CV: %{calibration.cv} · Örnek: {calibration.samples} — {calibration.note}
          </div>
          <button onClick={saveBonded} style={primary}>💾 Cihazı Kaydet (1 dokunuşla bağlan)</button>
        </div>
      )}

      {connectedId && (
        <div style={{ fontSize: 9, color: '#10B981', marginTop: 8 }}>
          🔗 Bonded: {connectedId} — localStorage&apos;a kaydedildi
        </div>
      )}

      {bonded.length > 0 && (
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 9, color: '#64748b', marginBottom: 4 }}>⚡ Anında yeniden bağlanma ({bonded.length})</div>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {bonded.map((d) => (
              <button key={d.kind} onClick={() => oneTapReconnect(d)} style={tiny}>
                {d.label} · {d.rssi}dBm · %{batteryVoltageGauge(d.voltage, profile.batteryRange)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const primary: React.CSSProperties = { fontSize: 10, fontWeight: 800, padding: '8px 12px', borderRadius: 8, border: '1px solid #00f2fe', background: 'rgba(0,242,254,0.12)', color: '#00f2fe', cursor: 'pointer' };
const mini: React.CSSProperties = { fontSize: 9, fontWeight: 800, padding: '6px 10px', borderRadius: 8, border: '1px solid #334155', background: 'transparent', color: '#e2e8f0', cursor: 'pointer' };
const chip: React.CSSProperties = { fontSize: 9, fontWeight: 800, padding: '6px 10px', borderRadius: 8, border: '1px solid #334155', background: 'transparent', color: '#94a3b8', cursor: 'pointer' };
const tiny: React.CSSProperties = { fontSize: 8, fontWeight: 700, padding: '4px 8px', borderRadius: 6, border: '1px solid #334155', background: 'transparent', color: '#94a3b8', cursor: 'pointer' };

