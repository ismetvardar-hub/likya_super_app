// ============================================================================
// 📦 BLE OTA SERVİSİ — chunked firmware aktarımı (Adım 29)
// • Firmware → MTU parçaları, özel OTA GATT karakteristiği üzerinden yazım
// • CRC32 checksum doğrulaması (her paket + bütün firmware)
// • İlerleme yüzdesi olayları (progress events) → UI gösterimi için
// Mevcut bleOtaEngine protokolünü (crc32/buildOtaPlan/encode/decode) kullanır.
// ============================================================================

import { crc32, buildOtaPlan, encodeOtaPacket, decodeOtaPacket, type OtaPacket } from '../bleOtaEngine.ts';
import type { VirtualGattCharacteristic } from '../simulation/virtualBlePeripheral.ts';

export const OTA_GATT_CHARACTERISTIC_UUID = 'd44bc439-abfd-45a2-b575-925416129601';

export type OtaStatus = 'sending' | 'verifying' | 'done' | 'error';

export interface OtaProgressEvent {
  seq: number;
  total: number;
  pct: number;
  status: OtaStatus;
  crcVerified?: boolean;
  message?: string;
}

export interface OtaResult {
  ok: boolean;
  crcVerified: boolean;
  packets: number;
  durationMs: number;
}

export type OtaProgressCallback = (evt: OtaProgressEvent) => void;

/**
 * Parçalı OTA aktarımını yönetir:
 * her parçayı OTA karakteristiğine yazar, alınan tamponları çözüp
 * CRC32 ile doğrular, her adımda ilerleme olayı yayınlar.
 */
export class BleOtaService {
  async start(firmware: Uint8Array, target: VirtualGattCharacteristic, onProgress?: OtaProgressCallback): Promise<OtaResult> {
    const plan: OtaPacket[] = buildOtaPlan(firmware);
    const t0 = Date.now();

    // 1) Aktarım
    for (let i = 0; i < plan.length; i++) {
      const p = plan[i];
      await target.writeValueWithResponse(encodeOtaPacket(p));
      onProgress?.({
        seq: p.seq,
        total: p.total,
        pct: Math.round(((i + 1) / plan.length) * 100),
        status: 'sending',
        message: `Parça ${p.seq + 1}/${p.total} yazıldı`,
      });
    }

    // 2) Doğrulama — her yazılan tamponu çöz, sıra + CRC eşleşmesi kontrol et
    onProgress?.({ seq: plan.length - 1, total: plan.length, pct: 100, status: 'verifying', message: 'CRC32 doğrulanıyor' });
    const log = target.writeLog;
    let ok = plan.length === log.length;
    const payloads: Uint8Array[] = [];
    if (ok) {
      for (let i = 0; i < plan.length; i++) {
        const decoded = decodeOtaPacket(log[i]);
        if (!decoded || decoded.seq !== plan[i].seq || decoded.crc !== plan[i].crc) {
          ok = false;
          break;
        }
        payloads.push(decoded.payload);
      }
    }

    // 3) Bütün firmware CRC karşılaştırması
    if (ok) {
      const totalLen = payloads.reduce((a, b) => a + b.length, 0);
      const reassembled = new Uint8Array(totalLen);
      let o = 0;
      for (const pl of payloads) {
        reassembled.set(pl, o);
        o += pl.length;
      }
      ok = crc32(reassembled) === crc32(firmware);
    }

    const result: OtaResult = { ok, crcVerified: ok, packets: plan.length, durationMs: Date.now() - t0 };
    onProgress?.({
      seq: plan.length - 1,
      total: plan.length,
      pct: 100,
      status: ok ? 'done' : 'error',
      crcVerified: ok,
      message: ok ? '✅ Firmware doğrulandı, güncelleme tamam' : '❌ CRC doğrulaması başarısız — firmware reddedildi',
    });
    return result;
  }
}

/** Tek parçanın CRC32 bütünlük kontrolü (yalın yardımcı). */
export function verifyOtaChunk(p: OtaPacket, received: Uint8Array): boolean {
  return p.crc === crc32(received);
}

export function bleOtaServiceStatus(): string {
  return 'BLE OTA Servis: chunked yazım • CRC32 (paket+firmware) • ilerleme olayları';
}
