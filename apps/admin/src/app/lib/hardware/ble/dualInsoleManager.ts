// ============================================================================
// 👟 DUAL INSOLE MANAGER — çift periferik GATT yönetimi (Adım 27)
// INSOLE_LEFT + INSOLE_RIGHT eş zamanlı notify akışlarını tek bilateral
// stride paketinde toplar: L/R toe-heel + her bacak için bağımsız GCT.
// Sanal BLE periferik mock'ları üzerinde headless CI'da çalışır.
// ============================================================================

import { mulberry32 } from '../simulation/virtualBleSensorLab.ts';
import { buildVirtualInsolePeripheral, sendInsoleFrame, type VirtualBleDevice, type VirtualGattCharacteristic } from '../simulation/virtualBlePeripheral.ts';
import { INSoleServiceUUID, INSolePressureCharUUID, unpackInsolePacket } from '../bleProtocolDefinition.ts';

export const INSOLE_LEFT_ID = 'INSOLE_LEFT';
export const INSOLE_RIGHT_ID = 'INSOLE_RIGHT';

export interface SideStride {
  toePct: number;
  heelPct: number;
  gctMs: number;
  strikeForce: number;
}

export interface BilateralStridePacket {
  tMs: number;          // ortak saat
  seq: number;          // eş zamanlı paket sırası
  left: SideStride;
  right: SideStride;
}

export interface DualInsoleProfile {
  leftGctBias: number;   // sol GCT sapması (ms)
  rightGctBias: number;  // sağ GCT sapması (ms)
  leftLoadRatio: number; // sol taraf yük payı (0-1)
  seed?: number;
}

export const DEFAULT_DUAL_PROFILE: DualInsoleProfile = { leftGctBias: 0, rightGctBias: 0, leftLoadRatio: 0.5, seed: 7 };

export class DualInsoleManager {
  readonly left: VirtualBleDevice;
  readonly right: VirtualBleDevice;
  private leftChar: VirtualGattCharacteristic | null = null;
  private rightChar: VirtualGattCharacteristic | null = null;
  private packets: BilateralStridePacket[] = [];
  private seq = 0;
  private readonly profile: DualInsoleProfile;

  constructor(left?: VirtualBleDevice, right?: VirtualBleDevice, profile: DualInsoleProfile = DEFAULT_DUAL_PROFILE) {
    this.left = left ?? buildVirtualInsolePeripheral(INSOLE_LEFT_ID, { seed: 11 });
    this.right = right ?? buildVirtualInsolePeripheral(INSOLE_RIGHT_ID, { seed: 22 });
    this.profile = { ...DEFAULT_DUAL_PROFILE, ...profile };
  }

  /** İki periferiği de bağlar ve tabanlık karakteristiklerini hazırlar. */
  async connect(): Promise<{ leftConnected: boolean; rightConnected: boolean }> {
    this.left.connect();
    this.right.connect();
    const ls = await this.left.gatt.getPrimaryService(INSoleServiceUUID);
    const rs = await this.right.gatt.getPrimaryService(INSoleServiceUUID);
    this.leftChar = ls.getCharacteristic(INSolePressureCharUUID);
    this.rightChar = rs.getCharacteristic(INSolePressureCharUUID);
    await this.leftChar.startNotifications();
    await this.rightChar.startNotifications();
    return { leftConnected: this.left.gatt.connected, rightConnected: this.right.gatt.connected };
  }

  /** Her iki periferikten eş zamanlı bir çerçeve besler ve bilateral paket üretir. */
  feedStride(tMs: number, left: SideStride, right: SideStride): BilateralStridePacket {
    sendInsoleFrame(this.left, left);
    sendInsoleFrame(this.right, right);
    if (!this.leftChar?.value || !this.rightChar?.value) throw new Error('Notify değeri yok — önce connect()');
    const decodedLeft = unpackInsolePacket(this.leftChar.value);
    const decodedRight = unpackInsolePacket(this.rightChar.value);
    const pkt: BilateralStridePacket = {
      tMs,
      seq: this.seq++,
      left: { toePct: decodedLeft.toePct, heelPct: decodedLeft.heelPct, gctMs: decodedLeft.gctMs, strikeForce: decodedLeft.strikeForce },
      right: { toePct: decodedRight.toePct, heelPct: decodedRight.heelPct, gctMs: decodedRight.gctMs, strikeForce: decodedRight.strikeForce },
    };
    this.packets.push(pkt);
    return pkt;
  }

  /** Deterministik eş zamanlı stride akışı üretir (yürüyüş döngüsü + profil asimetrisi). */
  collectWindow(durationMs: number, stepMs = 50, seed?: number): BilateralStridePacket[] {
    const rand = mulberry32(seed ?? this.profile.seed ?? 7);
    const n = Math.max(1, Math.floor(durationMs / stepMs));
    const out: BilateralStridePacket[] = [];
    for (let i = 0; i < n; i++) {
      const tMs = i * stepMs;
      const cycle = (i % 24) / 24;
      const inStance = cycle < 0.45;
      const sideFrame = (gctBias: number): SideStride =>
        inStance
          ? {
              toePct: Math.min(100, Math.round(55 + rand() * 25)),
              heelPct: Math.min(100, Math.round(25 + rand() * 15)),
              gctMs: Math.max(0, Math.round((180 + gctBias) * (0.9 + rand() * 0.2))),
              strikeForce: Number((0.4 + rand() * 0.3).toFixed(2)),
            }
          : { toePct: 0, heelPct: 0, gctMs: 0, strikeForce: 0 };
      out.push(this.feedStride(tMs, sideFrame(this.profile.leftGctBias), sideFrame(this.profile.rightGctBias)));
    }
    return out;
  }

  getPackets(): BilateralStridePacket[] {
    return this.packets;
  }

  getPacketCount(): number {
    return this.packets.length;
  }

  disconnect(): void {
    this.left.disconnect();
    this.right.disconnect();
  }
}

export function dualInsoleManagerStatus(): string {
  return 'Dual Insole: INSOLE_LEFT+RIGHT GATT • bilateral stride (L/R toe-heel-GCT) • deterministik';
}
