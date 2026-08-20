// ============================================================================
// 📟 VIRTUAL BLE PERIPHERAL — Web Bluetooth API mock (Adım 26)
// BluetoothDevice / BluetoothRemoteGATTServer / GATTService / GATTCharacteristic
// Web Bluetooth'un bulunmadığı headless CI ortamlarında uçtan uca test sağlar.
// Deterministik: RSSI, pil ve notify akışları seed'li PRNG ile üretilir.
// ============================================================================

import { mulberry32 } from './virtualBleSensorLab.ts';
import { INSoleServiceUUID, INSolePressureCharUUID, packInsolePacket } from '../bleProtocolDefinition.ts';

// ── BufferSource yardımcısı (Web Bluetooth'taki BufferSource tipleri) ────────
export function toBytes(src: Uint8Array | ArrayBuffer): Uint8Array {
  return src instanceof Uint8Array ? new Uint8Array(src) : new Uint8Array(src);
}

// ── Characteristic mock ───────────────────────────────────────────────────────
export interface VirtualCharacteristicValueEvent {
  target: { value: DataView };
}

export class VirtualGattCharacteristic {
  readonly uuid: string;
  readonly properties: string[];
  value: DataView | null = null;
  writeLog: Uint8Array[] = []; // OTA doğrulaması için yazılan tüm tamponlar
  private listeners: Array<(evt: VirtualCharacteristicValueEvent) => void> = [];

  constructor(uuid: string, properties: string[], initialValue?: Uint8Array) {
    this.uuid = uuid;
    this.properties = properties;
    if (initialValue) this.value = new DataView(initialValue.buffer, initialValue.byteOffset, initialValue.byteLength);
  }

  async readValue(): Promise<DataView> {
    if (!this.value) throw new Error('Karakteristik değeri boş');
    return this.value;
  }

  async writeValue(value: Uint8Array): Promise<void> {
    const bytes = toBytes(value);
    this.value = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    this.writeLog.push(bytes);
  }

  async writeValueWithResponse(value: Uint8Array): Promise<void> {
    await this.writeValue(value);
  }

  async startNotifications(): Promise<void> {
    if (!this.properties.includes('NOTIFY')) throw new Error('Karakteristik NOTIFY desteklemiyor');
  }

  async stopNotifications(): Promise<void> {
    return undefined;
  }

  addEventListener(type: 'characteristicvaluechanged', cb: (evt: VirtualCharacteristicValueEvent) => void): void {
    if (type === 'characteristicvaluechanged') this.listeners.push(cb);
  }

  removeEventListener(type: 'characteristicvaluechanged', cb: (evt: VirtualCharacteristicValueEvent) => void): void {
    if (type === 'characteristicvaluechanged') {
      this.listeners = this.listeners.filter((l) => l !== cb);
    }
  }

  /** Headless sürücü: değer değişim olayını simüle eder (donanım notify'si yerine). */
  simulateNotification(value: Uint8Array): void {
    const bytes = toBytes(value);
    this.value = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    const evt: VirtualCharacteristicValueEvent = { target: { value: this.value } };
    for (const l of [...this.listeners]) l(evt);
  }
}

// ── Service mock ───────────────────────────────────────────────────────────────
export class VirtualGattService {
  readonly uuid: string;
  readonly characteristics: VirtualGattCharacteristic[];

  constructor(uuid: string, characteristics: VirtualGattCharacteristic[]) {
    this.uuid = uuid;
    this.characteristics = characteristics;
  }

  getCharacteristic(uuid: string): VirtualGattCharacteristic {
    const c = this.characteristics.find((x) => x.uuid === uuid);
    if (!c) throw new Error(`Karakteristik yok: ${uuid}`);
    return c;
  }

  getCharacteristics(): VirtualGattCharacteristic[] {
    return this.characteristics;
  }
}

// ── GATT Server mock ───────────────────────────────────────────────────────────
export class VirtualGattServer {
  connected = false;
  readonly device: VirtualBleDevice;
  private services: VirtualGattService[] = [];

  constructor(device: VirtualBleDevice, services: VirtualGattService[]) {
    this.device = device;
    this.services = services;
  }

  connect(): VirtualGattServer {
    this.connected = true;
    return this;
  }

  disconnect(): void {
    this.connected = false;
  }

  async getPrimaryService(uuid: string): Promise<VirtualGattService> {
    if (!this.connected) throw new Error('GATT sunucusu bağlı değil');
    const s = this.services.find((x) => x.uuid === uuid);
    if (!s) throw new Error(`Servis yok: ${uuid}`);
    return s;
  }

  getService(uuid: string): VirtualGattService {
    const s = this.services.find((x) => x.uuid === uuid);
    if (!s) throw new Error(`Servis yok: ${uuid}`);
    return s;
  }
}

// ── Device mock ─────────────────────────────────────────────────────────────────
export interface VirtualBlePeripheralProfile {
  id: string;
  name?: string;
  rssiDbm?: number;
  batteryPercent?: number;
  charging?: boolean;
}

export class VirtualBleDevice {
  readonly id: string;
  readonly name: string;
  readonly gatt: VirtualGattServer;
  private rssiDbm: number;
  private batteryPercent: number;
  private charging: boolean;

  constructor(profile: VirtualBlePeripheralProfile, seed = 1) {
    this.id = profile.id;
    this.name = profile.name ?? profile.id;
    this.rssiDbm = profile.rssiDbm ?? -45 - Math.round(mulberry32(seed)() * 30); // -45..-75
    this.batteryPercent = profile.batteryPercent ?? 60 + Math.round(mulberry32(seed + 1)() * 40);
    this.charging = profile.charging ?? false;
    this.gatt = new VirtualGattServer(this, buildServices(this.batteryPercent, seed));
  }

  connect(): VirtualGattServer {
    return this.gatt.connect();
  }

  disconnect(): void {
    this.gatt.disconnect();
  }

  readRssi(): number {
    return this.rssiDbm;
  }

  readBattery(): number {
    return this.batteryPercent;
  }

  isCharging(): boolean {
    return this.charging;
  }
}

// ── Standart servisler: Pil (0x180F) + ExtremeS tabanlık (custom) ────────────
function buildServices(batteryPercent: number, seed: number): VirtualGattService[] {
  const battery = new VirtualGattService('180F', [
    new VirtualGattCharacteristic('2A19', ['READ'], new Uint8Array([Math.round(batteryPercent)])),
  ]);
  const insole = new VirtualGattService(INSoleServiceUUID, [
    new VirtualGattCharacteristic(INSolePressureCharUUID, ['NOTIFY', 'READ', 'WRITE']),
  ]);
  return [battery, insole];
}

/** Uygulama kodu: sanal tabanlık periferiği üretir (headless CI). */
export function buildVirtualInsolePeripheral(
  id: string,
  opts: { batteryPercent?: number; rssiDbm?: number; seed?: number } = {},
): VirtualBleDevice {
  return new VirtualBleDevice({ id, name: `${id} (ESP32 Tabanlık)`, ...opts }, opts.seed ?? 7);
}

/** Test amacıyla tabanlık karakteristiğine 6 byte'lık paket gönderir. */
export function sendInsoleFrame(device: VirtualBleDevice, frame: { toePct: number; heelPct: number; gctMs: number; strikeForce?: number }): void {
  const service = device.gatt.getService(INSoleServiceUUID);
  const char = service.getCharacteristic(INSolePressureCharUUID);
  char.simulateNotification(packInsolePacket(frame.toePct, frame.heelPct, frame.gctMs, frame.strikeForce));
}

export function virtualBlePeripheralStatus(): string {
  return 'Virtual BLE: BluetoothDevice/GATTServer/Characteristic mock • pil+RSSI • headless CI';
}

