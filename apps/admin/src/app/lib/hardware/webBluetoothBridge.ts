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
  gctMs: number;
}

export interface ImuSample {
  ax: number;
  ay: number;
  az: number;
}

// ESP32 akıllı tabanlık custom service (BLE pairing spec)
export const DEFAULT_INSOLE_SERVICE = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';

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
// 2. Heart Rate (0x180D) — Decathlon Kalp Kemeri (+ RR aralıkları → HRV)
// ---------------------------------------------------------------------------
export function parseHeartRateValue(view: DataView): number {
  const flags = view.getUint8(0);
  const is16Bit = (flags & 0x01) === 1;
  return is16Bit ? view.getUint16(1, true) : view.getUint8(1);
}

/** 0x2A37 payload'ından RR interval dizisi (bit4 set ise, uint16 ms) */
export function parseHeartRateRR(view: DataView): number[] {
  const flags = view.getUint8(0);
  const rr: number[] = [];
  if ((flags & 0x10) === 0) return rr;
  let offset = 1 + ((flags & 0x01) === 1 ? 2 : 1);
  while (offset + 2 <= view.byteLength) {
    rr.push(view.getUint16(offset, true));
    offset += 2;
  }
  return rr;
}

/** rMSSD (ms): ardışık RR farklarının karekök ortalaması — HRV göstergesi */
export function computeRmssd(rrIntervals: number[]): number | null {
  if (rrIntervals.length < 2) return null;
  let sum = 0;
  for (let i = 1; i < rrIntervals.length; i++) {
    const d = rrIntervals[i] - rrIntervals[i - 1];
    sum += d * d;
  }
  return Math.round(Math.sqrt(sum / (rrIntervals.length - 1)));
}

export async function requestHeartRateConnection(
  onHeartRate: (bpm: number) => void,
  onRR?: (rr: number[]) => void,
): Promise<BleSensorStatus> {
  const { device, server } = await requestDeviceWithFilters([{ services: ['heart_rate'] }]);
  const service = await server.getPrimaryService('heart_rate');
  const char = await service.getCharacteristic('heart_rate_measurement');
  await char.startNotifications();
  char.addEventListener('characteristicvaluechanged', (e: Event) => {
    const v = (e.target as any).value;
    if (!v) return;
    onHeartRate(parseHeartRateValue(v));
    if (onRR) onRR(parseHeartRateRR(v));
  });
  return { connected: true, kind: 'HEART_RATE', deviceName: device.name ?? 'Kalp Kemeri', message: '❤️ Kalp Kemeri bağlandı — canlı nabız + HRV akıyor' };
}

// ---------------------------------------------------------------------------
// 3. ESP32 Akıllı Tabanlık (Custom BLE — pairing spec: ESP32/ExtremeS)
//    Payload: [0]=toe_pressure % [1]=heel_pressure % [2..3]=gct_ms (uint16 LE)
// ---------------------------------------------------------------------------
export function parseInsolePressure(view: DataView): InsolePressureData {
  const toe = view.getUint8(0) % 100;
  const heel = view.getUint8(1) % 100;
  const gctMs = view.byteLength >= 4 ? view.getUint16(2, true) : 0;
  const total = toe + heel;
  return { forefootPct: Math.round((toe / Math.max(1, total)) * 100), heelPct: 100 - Math.round((toe / Math.max(1, total)) * 100), gctMs };
}

export async function requestInsoleConnection(serviceUuid = DEFAULT_INSOLE_SERVICE, onPressure: (d: InsolePressureData) => void): Promise<BleSensorStatus> {
  const { device, server } = await requestDeviceWithFilters([
    { namePrefix: 'ESP32' },
    { namePrefix: 'ExtremeS' },
  ]);
  const service = await server.getPrimaryService(serviceUuid);
  const chars = await service.getCharacteristics();
  const char = chars[0];
  await char.startNotifications();
  char.addEventListener('characteristicvaluechanged', (e: Event) => {
    const v = (e.target as any).value;
    if (v) onPressure(parseInsolePressure(v));
  });
  return { connected: true, kind: 'INSOLE', deviceName: device.name ?? 'ESP32 Tabanlık', message: '👟 ESP32 Tabanlık bağlandı — basınç + GCT akıyor' };
}

// ---------------------------------------------------------------------------
// 4. Mi Band / IMU (0xFEE0 custom — notification dinler)
// ---------------------------------------------------------------------------
export async function requestMiBandConnection(onImu: (s: ImuSample) => void, serviceUuid = '0000fee0-0000-1000-8000-00805f9b34fb'): Promise<BleSensorStatus> {
  const { device, server } = await requestDeviceWithFilters([
    { services: [serviceUuid] },
    { services: ['0000fee1-0000-1000-8000-00805f9b34fb'] },
  ]);
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

// ---------------------------------------------------------------------------
// 5. Tarayıcı Uyumluluk Danışmanı
// ---------------------------------------------------------------------------
export function browserBluetoothAdvice(): string {
  if (webBluetoothSupported()) return '';
  return '⚠️ Tarayıcınız Web Bluetooth desteklemiyor. Lütfen Mac/PC/Android üzerinde Google Chrome veya iPhone/iPad üzerinde Bluefy tarayıcısını kullanın.';
}

export function webBluetoothBridgeStatus(): string {
  return webBluetoothSupported() ? 'Web Bluetooth hazır — tarayıcı cihaz seçici kullanılabilir' : 'Web Bluetooth yok (Chrome/Edge + https gerekli) — simülasyon modu';
}
