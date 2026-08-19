// ============================================================================
// 📡 WEB BLUETOOTH KÖPRÜSÜ — SportVisionX Live Hub sensör bağlantısı
// 1. Decathlon Kalp Kemeri (Heart Rate Service: 0x180D / 0x2A37)
// 2. ESP32 Akıllı Tabanlık (Custom BLE Service — basınç notification)
// 3. Mi Band / IMU (0xFEE0 custom)
// - navigator.bluetooth ile tarayıcı cihaz seçici (device picker)
// - Bağlanan sensör canlı telemetriyi gerçek veriye geçirir
// - Web Bluetooth yoksa / donanım yoksa zarif mesaj + simülasyon devam
// ============================================================================

export type BleSensorKind = 'HEART_RATE' | 'INSOLE' | 'MI_BAND';

export interface BleSensorStatus {
  connected: boolean;
  kind: BleSensorKind;
  deviceName?: string;
  message?: string;
}

export interface InsolePressureData {
  forefootPct: number;
  heelPct: number;
}

export interface ImuSample {
  ax: number;
  ay: number;
  az: number;
}

// ESP32 tabanlık varsayılan custom service (config edilebilir)
export const DEFAULT_INSOLE_SERVICE = '0000fff0-0000-1000-8000-00805f9b34fb';

// ---------------------------------------------------------------------------
// 1. Web Bluetooth destek kontrolü (güvenli bağlam: https / localhost)
// ---------------------------------------------------------------------------
export function webBluetoothSupported(): boolean {
  if (typeof navigator === 'undefined') return false;
  return 'bluetooth' in navigator;
}

function btNavigator(): any {
  return (navigator as unknown as { bluetooth?: any }).bluetooth;
}

async function requestDeviceWithFilters(filters: object[]): Promise<{ device: any; server: any }> {
  const bt = btNavigator();
  if (!bt) throw new Error('Bu tarayıcı Web Bluetooth desteklemiyor — Chrome veya Edge kullanın (https/localhost gerekli)');
  const device = await bt.requestDevice({ filters, optionalServices: [] });
  const server = await device.gatt!.connect();
  return { device, server };
}

// ---------------------------------------------------------------------------
// 2. Heart Rate (0x180D) — Decathlon Kalp Kemeri
// ---------------------------------------------------------------------------
export function parseHeartRateValue(view: DataView): number {
  const flags = view.getUint8(0);
  const is16Bit = (flags & 0x01) === 1;
  return is16Bit ? view.getUint16(1, true) : view.getUint8(1);
}

export async function requestHeartRateConnection(onHeartRate: (bpm: number) => void): Promise<BleSensorStatus> {
  const { device, server } = await requestDeviceWithFilters([{ services: ['heart_rate'] }]);
  const service = await server.getPrimaryService('heart_rate');
  const char = await service.getCharacteristic('heart_rate_measurement');
  await char.startNotifications();
  char.addEventListener('characteristicvaluechanged', (e: Event) => {
    const v = (e.target as any).value;
    if (v) onHeartRate(parseHeartRateValue(v));
  });
  return { connected: true, kind: 'HEART_RATE', deviceName: device.name ?? 'Kalp Kemeri', message: '❤️ Kalp Kemeri bağlandı — canlı nabız akıyor' };
}

// ---------------------------------------------------------------------------
// 3. ESP32 Akıllı Tabanlık (Custom BLE Service — basınç notification)
//    Payload: [0]=forefoot %, [1]=heel % (byte protokol)
// ---------------------------------------------------------------------------
export function parseInsolePressure(view: DataView): InsolePressureData {
  const fore = view.getUint8(0) % 100;
  const heel = view.getUint8(1) % 100;
  const total = fore + heel;
  return { forefootPct: Math.round((fore / Math.max(1, total)) * 100), heelPct: 100 - Math.round((fore / Math.max(1, total)) * 100) };
}

export async function requestInsoleConnection(serviceUuid = DEFAULT_INSOLE_SERVICE, onPressure: (d: InsolePressureData) => void): Promise<BleSensorStatus> {
  const { device, server } = await requestDeviceWithFilters([{ services: [serviceUuid] }]);
  const service = await server.getPrimaryService(serviceUuid);
  const chars = await service.getCharacteristics();
  const char = chars[0];
  await char.startNotifications();
  char.addEventListener('characteristicvaluechanged', (e: Event) => {
    const v = (e.target as any).value;
    if (v) onPressure(parseInsolePressure(v));
  });
  return { connected: true, kind: 'INSOLE', deviceName: device.name ?? 'ESP32 Tabanlık', message: '👟 ESP32 Tabanlık bağlandı — basınç akıyor' };
}

// ---------------------------------------------------------------------------
// 4. Mi Band / IMU (0xFEE0 custom — notification dinler)
// ---------------------------------------------------------------------------
export async function requestMiBandConnection(onImu: (s: ImuSample) => void, serviceUuid = '0000fee0-0000-1000-8000-00805f9b34fb'): Promise<BleSensorStatus> {
  const { device, server } = await requestDeviceWithFilters([{ services: [serviceUuid] }]);
  const service = await server.getPrimaryService(serviceUuid);
  const chars = await service.getCharacteristics();
  if (chars.length === 0) throw new Error('MiBand servisinde karakteristik bulunamadı');
  await chars[0].startNotifications();
  chars[0].addEventListener('characteristicvaluechanged', (e: Event) => {
    const v = (e.target as any).value;
    if (v) {
      onImu({ ax: v.getInt8(0) / 10, ay: v.getInt8(1) / 10, az: v.getInt8(2) / 10 });
    }
  });
  return { connected: true, kind: 'MI_BAND', deviceName: device.name ?? 'Mi Band', message: '⌚ Mi Band / IMU bağlandı — kinetik akıyor' };
}

export function webBluetoothBridgeStatus(): string {
  return webBluetoothSupported() ? 'Web Bluetooth hazır — tarayıcı cihaz seçici kullanılabilir' : 'Web Bluetooth yok (Chrome/Edge + https gerekli) — simülasyon modu';
}
