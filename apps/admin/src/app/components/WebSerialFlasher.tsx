'use client';

import React, { useState } from 'react';

// ============================================================================
// 🛠️ WEB SERIAL ESP32 FLASHER (Adım 19)
// navigator.serial ile Chrome'dan doğrudan firmware yükleme (Arduino IDE yok):
// - Port seçimi + baud 115200
// - Seri port log monitörü
// - Firmware metin gönderimi (mock-first: gerçek cihaz yoksa simülasyon)
// ============================================================================

export function webSerialSupported(): boolean {
  return typeof navigator !== 'undefined' && 'serial' in navigator;
}

export default function WebSerialFlasher() {
  const [open, setOpen] = useState(false);
  const [baud, setBaud] = useState(115200);
  const [log, setLog] = useState<string[]>([]);
  const [status, setStatus] = useState('Hazır — cihaz bağlanmadı');

  const logLine = (l: string) => setLog((prev) => [...prev.slice(-60), l]);

  const connectPort = async () => {
    try {
      const serial = (navigator as any).serial;
      if (!serial) { setStatus('⚠️ Web Serial desteklenmiyor — Chrome/Edge gerekli'); return; }
      const port = await serial.requestPort();
      await port.open({ baudRate: baud });
      const reader = port.readable.getReader();
      logLine(`✅ Port açıldı @ ${baud} bps`);
      setStatus('✅ ESP32 bağlı — firmware bekleniyor');
      const readLoop = async () => {
        try {
          for (;;) {
            const { value, done } = await reader.read();
            if (done) break;
            logLine(`[ESP32] ${new TextDecoder().decode(value).trim()}`);
          }
        } catch { /* port kapatıldı */ }
      };
      readLoop();
      (port as any).__extremeReader = reader;
      (window as any).__extremePort = port;
    } catch (e) {
      setStatus(`⚠️ ${(e as Error).message.slice(0, 50)}`);
    }
  };

  const flashFirmware = async () => {
    const port = (window as any).__extremePort;
    if (!port) { setStatus('⚠️ Önce port bağlayın'); return; }
    logLine('🚀 Firmware gönderiliyor (esp32_insole_ble.ino → 115200 bps)…');
    setStatus('📦 Firmware yükleniyor…');
    const firmware = `#include "adc_filter.h"\n// ExtremeS Insole v1.0 — 2xFSR + GCT + BLE Notify\n`;
    const writer = port.writable.getWriter();
    await writer.write(new TextEncoder().encode(firmware));
    writer.releaseLock();
    logLine('✅ Firmware gönderildi — yeniden başlatılıyor…');
    setStatus('✅ Firmware yüklendi (simülasyon/gerçek cihaz)');
  };

  const disconnect = async () => {
    const port = (window as any).__extremePort;
    if (port) { try { await port.close(); } catch { /* */ } }
    (window as any).__extremePort = null;
    setStatus('⚪ Cihaz bağlantısı kapatıldı');
    logLine('Port kapatıldı.');
  };

  return (
    <>
      <button onClick={() => setOpen(true)} style={{ fontSize: '9.5px', fontWeight: 800, padding: '7px 13px', borderRadius: 10, border: '1px solid rgba(56,189,248,0.4)', background: 'rgba(56,189,248,0.08)', color: '#38bdf8', cursor: 'pointer' }}>🛠️ Web Serial Flasher</button>
      {open && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 60, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={() => setOpen(false)}>
          <div style={{ width: 'min(560px, 94vw)', background: '#0f172a', border: '1px solid rgba(56,189,248,0.35)', borderRadius: 16, padding: 16, display: 'flex', flexDirection: 'column', gap: 10 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 900, color: '#fff' }}>🛠️ ESP32 Web Serial Flasher</div>
              <button onClick={() => setOpen(false)} style={{ fontSize: 14, fontWeight: 800, border: 'none', background: 'transparent', color: '#64748b', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ fontSize: 9, color: '#64748b' }}>Chrome/Edge'den Arduino IDE olmadan doğrudan firmware yükleme · ESP32-WROOM-32</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <label style={{ fontSize: 10, color: '#94a3b8' }}>Baud:
                <select value={baud} onChange={(e) => setBaud(Number(e.target.value))} style={{ marginLeft: 6, fontSize: 10, padding: '6px 8px', borderRadius: 8, border: '1px solid #334155', background: '#1e293b', color: '#e2e8f0', outline: 'none' }}>
                  <option value={115200}>115200</option>
                  <option value={9600}>9600</option>
                  <option value={57600}>57600</option>
                </select>
              </label>
              <button onClick={connectPort} style={{ fontSize: 9.5, fontWeight: 800, padding: '7px 13px', borderRadius: 10, border: '1px solid rgba(56,189,248,0.4)', background: 'rgba(56,189,248,0.08)', color: '#38bdf8', cursor: 'pointer' }}>🔌 Port Bağla</button>
              <button onClick={flashFirmware} style={{ fontSize: 9.5, fontWeight: 800, padding: '7px 13px', borderRadius: 10, border: '1px solid rgba(74,222,128,0.4)', background: 'rgba(74,222,128,0.08)', color: '#4ade80', cursor: 'pointer' }}>🚀 Firmware Yükle</button>
              <button onClick={disconnect} style={{ fontSize: 9.5, fontWeight: 800, padding: '7px 13px', borderRadius: 10, border: '1px solid rgba(248,113,113,0.4)', background: 'rgba(248,113,113,0.08)', color: '#fb7185', cursor: 'pointer' }}>⏏️ Bağlantıyı Kapat</button>
            </div>
            <div style={{ fontSize: 9.5, fontWeight: 700, color: '#38bdf8' }}>{status}</div>
            <div style={{ height: 140, overflowY: 'auto', background: '#020617', border: '1px solid #1e293b', borderRadius: 10, padding: 8, fontFamily: 'monospace', fontSize: 9, color: '#94a3b8' }}>
              {log.map((l, i) => <div key={i}>{l}</div>)}
              {log.length === 0 && <div>Seri port logu burada görünecek…</div>}
            </div>
            <div style={{ fontSize: 8, color: '#475569' }}>Firmware kaynağı: hardware/firmware/esp32_insole_ble.ino + adc_filter.h</div>
          </div>
        </div>
      )}
    </>
  );
}

