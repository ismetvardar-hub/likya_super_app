// ============================================================================
// 📡 BLE FIRMWARE OTA MOTORU — ESP32 tabanlık güncelleme protokolü (Adım 29)
// • Firmware → BLE MTU parçaları (20B payload), CRC32 bütünlük, ACK/yeniden gönderim
// • Paket şeması: [0x4F][seq:2][total:2][len:1][payload:20][crc32:4]
// • Deterministik; cihaz bağlantısından bağımsız plan üretir (mock-first)
// ============================================================================

export const OTA_PACKET_MAGIC = 0x4f; // 'O'
export const OTA_CHUNK_SIZE = 20;     // BLE MTU 23 - 3 bayt başlık (1+2)

/** IEEE CRC-32 (polinom 0xEDB88320) — standart doğrulama vektörü "123456789"→0xCBF43926. */
export function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (let i = 0; i < bytes.length; i++) {
    crc ^= bytes[i];
    for (let k = 0; k < 8; k++) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export interface OtaPacket {
  seq: number;        // sıra no
  total: number;      // toplam paket sayısı
  crc: number;        // payload CRC32
  payload: Uint8Array; // 0-20 bayt (son paket kısa olabilir)
}

/** Firmware byte dizisini BLE OTA paketlerine böler (eksiksiz plan). */
export function buildOtaPlan(firmware: Uint8Array, chunkSize = OTA_CHUNK_SIZE): OtaPacket[] {
  const total = Math.ceil(firmware.length / chunkSize);
  const packets: OtaPacket[] = [];
  for (let seq = 0; seq < total; seq++) {
    const start = seq * chunkSize;
    const payload = firmware.slice(start, Math.min(start + chunkSize, firmware.length));
    packets.push({ seq, total, crc: crc32(payload), payload });
  }
  return packets;
}

/** Paketi iletim tamponuna kodlar: [magic][seq:2][total:2][len][payload][crc:4] */
export function encodeOtaPacket(p: OtaPacket): Uint8Array {
  const buf = new ArrayBuffer(1 + 2 + 2 + 1 + p.payload.length + 4);
  const view = new DataView(buf);
  const bytes = new Uint8Array(buf);
  let o = 0;
  bytes[o++] = OTA_PACKET_MAGIC;
  view.setUint16(o, p.seq, true); o += 2;
  view.setUint16(o, p.total, true); o += 2;
  bytes[o++] = p.payload.length;
  bytes.set(p.payload, o); o += p.payload.length;
  view.setUint32(o, p.crc, true);
  return bytes;
}

/** İletim tamponunu ayrıştırır; bozuksa null (CRC doğrulaması dahil). */
export function decodeOtaPacket(buf: Uint8Array): OtaPacket | null {
  if (buf.length < 10 || buf[0] !== OTA_PACKET_MAGIC) return null;
  const view = new DataView(buf.buffer, buf.byteOffset, buf.byteLength);
  const seq = view.getUint16(1, true);
  const total = view.getUint16(3, true);
  const len = buf[5];
  if (1 + 2 + 2 + 1 + len + 4 !== buf.length) return null;
  const payload = buf.slice(6, 6 + len);
  const crc = view.getUint32(6 + len, true);
  if (crc32(payload) !== crc) return null;
  return { seq, total, crc, payload };
}

export interface OtaSession {
  firmwareSize: number;
  packetCount: number;
  transferred: number;
  progressPct: number;
  done: boolean;
  retries: number;
  missing: number[]; // eksik paket sıraları (ACK sonrası)
}

/** OTA oturumunu takip eder: ACK'lanan paketlere göre ilerleme + eksikleri bulur. */
export function createOtaSession(firmware: Uint8Array, chunkSize = OTA_CHUNK_SIZE): OtaSession {
  const packets = buildOtaPlan(firmware, chunkSize);
  return { firmwareSize: firmware.length, packetCount: packets.length, transferred: 0, progressPct: 0, done: false, retries: 0, missing: packets.map((p) => p.seq) };
}

/** ACK sonrası oturumu ilerletir; eksik/bozuk paketleri yeniden gönderim listesine alır. */
export function advanceOtaSession(session: OtaSession, ackedSeqs: number[], failedSeqs: number[] = []): OtaSession {
  session.missing = [];
  for (let s = 0; s < session.packetCount; s++) {
    if (!ackedSeqs.includes(s) || failedSeqs.includes(s)) session.missing.push(s);
  }
  session.transferred = session.packetCount - session.missing.length;
  session.progressPct = Math.round((session.transferred / Math.max(1, session.packetCount)) * 100);
  session.done = session.missing.length === 0;
  session.retries += failedSeqs.length;
  return session;
}

export function bleOtaStatus(): string {
  return 'BLE OTA: CRC32 bütünlük • 20B MTU parça • ACK/yeniden gönderim • ilerleme %';
}
