// ============================================================================
// 📡 BLE PROTOKOL TANIMI (Adım 18) — custom GATT + ikili payload
// Service:  4fafc201-1fb5-459e-8fcc-c5c9c331914b
// Characteristic (Notify): beb5483e-36e1-4688-b7f5-ea07361b26a8
// Payload (6 byte, little-endian):
//   [0] toe_pct     (0-100)
//   [1] heel_pct    (0-100)
//   [2..3] gct_ms   (uint16 LE)
//   [4..5] strike   (uint16 LE — normalize 0..1000)
// ============================================================================

export const INSoleServiceUUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
export const INSolePressureCharUUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';

export const PAYLOAD_SIZE = 6;

export interface InsolePacket {
  toePct: number;
  heelPct: number;
  gctMs: number;
  strikeForce: number;   // 0..1
  raw: Uint8Array;
}

// ---------------------------------------------------------------------------
// 1. Pack — TS → 6 byte payload (ESP32 ile uyumlu)
// ---------------------------------------------------------------------------
export function packInsolePacket(toePct: number, heelPct: number, gctMs: number, strikeForce = 0.5): Uint8Array {
  const buf = new Uint8Array(PAYLOAD_SIZE);
  buf[0] = Math.max(0, Math.min(100, Math.round(toePct)));
  buf[1] = Math.max(0, Math.min(100, Math.round(heelPct)));
  buf[2] = gctMs & 0xFF;
  buf[3] = (gctMs >> 8) & 0xFF;
  const strike = Math.round(Math.max(0, Math.min(1, strikeForce)) * 1000);
  buf[4] = strike & 0xFF;
  buf[5] = (strike >> 8) & 0xFF;
  return buf;
}

// ---------------------------------------------------------------------------
// 2. Unpack — 6 byte DataView → ayrıştırılmış paket
// ---------------------------------------------------------------------------
export function unpackInsolePacket(view: DataView, offset = 0): InsolePacket {
  const toePct = view.getUint8(offset);
  const heelPct = view.getUint8(offset + 1);
  const gctMs = view.getUint16(offset + 2, true);      // little-endian
  const strike = view.getUint16(offset + 4, true);
  const raw = new Uint8Array(view.buffer.slice(view.byteOffset, view.byteOffset + view.byteLength));
  return { toePct, heelPct, gctMs, strikeForce: strike / 1000, raw };
}

// ---------------------------------------------------------------------------
// 3. BLE GATT Hizmet Tanımı (Admin/UI için meta)
// ---------------------------------------------------------------------------
export const INSOLE_GATT_DEFINITION = {
  service: { uuid: INSoleServiceUUID, name: 'ExtremeS Akıllı Tabanlık' },
  characteristics: [
    { uuid: INSolePressureCharUUID, name: 'Basınç & Zaman', properties: ['NOTIFY'], format: '6 byte LE: toe_pct, heel_pct, gct_ms(u16), strike(u16)' },
  ],
} as const;

export function bleProtocolStatus(): string {
  return `BLE Protokol: ${PAYLOAD_SIZE} byte • ${INSoleServiceUUID.slice(0, 8)}… • toe/heel/gct/strike`;
}
