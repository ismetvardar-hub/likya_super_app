/* ============================================================================
   EXTREMES SMART INSOLE — ESP32 BLE Firmware (Production)
   Donanım: ESP32-WROOM-32 / NodeMCU
   Sensörler: 2x FSR (Piezorezistif) — Forefoot/Toe + Heel
   - Pin 34: Toe/Ön Ayak FSR (ADC)
   - Pin 35: Heel/Topuk FSR (ADC)
   Örnekleme: 100 Hz (10 ms) — ADC gürültü filtresi: EMA + low-pass
   GCT: eşik bazlı zemin temas süresi (esp_timer_get_time, µs hassasiyet)
   BLE: Custom Service 4fafc201-1fb5-459e-8fcc-c5c9c331914b
        Characteristic beb5483e-36e1-4688-b7f5-ea07361b26a8 (Notify)
   Payload (6 byte): [toe_pct][heel_pct][gct_lo][gct_hi][strike_lo][strike_hi]
   ========================================================================= */

#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>
#include "adc_filter.h"

// ── Pin & Zamanlama ──
#define PIN_TOE         34          // Forefoot FSR (ADC1_CH6)
#define PIN_HEEL        35          // Heel FSR (ADC1_CH7)
#define SAMPLE_HZ       100         // 100 Hz örnekleme
#define SAMPLE_US       10000       // 10 ms
#define PRESS_THRESH    25          // Basınç eşiği (0-100 %)
#define ADC_MAX         4095.0f     // 12-bit

// ── BLE UUID'ler ──
#define SERVICE_UUID    "4fafc201-1fb5-459e-8fcc-c5c9c331914b"
#define CHAR_UUID       "beb5483e-36e1-4688-b7f5-ea07361b26a8"

// ── Durum ──
BLECharacteristic* g_char;
bool g_connected = false;
EMAFilter toeEMA(0.25f), heelEMA(0.25f);
LowPassFilter toeLP(0.12f), heelLP(0.12f);

volatile uint32_t gctUs = 0;        // son temas süresi (µs)
volatile bool gctOpen = false;
volatile uint64_t contactStartUs = 0;
float strikeForce = 0.0f;          // son vuruş kuvveti (normalize)

class ServerCallbacks : public BLEServerCallbacks {
  void onConnect(BLEServer* s) { g_connected = true; }
  void onDisconnect(BLEServer* s) { g_connected = false; BLEDevice::startAdvertising(); }
};

void setup() {
  Serial.begin(115200);
  pinMode(PIN_TOE, INPUT);
  pinMode(PIN_HEEL, INPUT);

  BLEDevice::init("ExtremeS-Insole");
  BLEServer* server = BLEDevice::createServer();
  server->setCallbacks(new ServerCallbacks());
  BLEService* service = server->createService(SERVICE_UUID);
  g_char = service->createCharacteristic(CHAR_UUID, BLECharacteristic::PROPERTY_NOTIFY);
  g_char->addDescriptor(new BLE2902());
  service->start();
  BLEAdvertising* adv = BLEDevice::getAdvertising();
  adv->addServiceUUID(SERVICE_UUID);
  adv->setScanResponse(true);
  BLEDevice::startAdvertising();

  Serial.println("[ExtremeS] ESP32 Insole BLE hazır — 4fafc201…914b");
}

void loop() {
  static uint64_t lastSampleUs = 0;
  const uint64_t nowUs = esp_timer_get_time();

  if (nowUs - lastSampleUs >= SAMPLE_US) {
    lastSampleUs = nowUs;

    // ── 1. Ham ADC okuma + çift aşamalı filtre (Adım 17) ──
    const float rawToe = (float)analogRead(PIN_TOE) / ADC_MAX * 100.0f;
    const float rawHeel = (float)analogRead(PIN_HEEL) / ADC_MAX * 100.0f;
    const float toe = toeLP.filter(toeEMA.filter(rawToe));
    const float heel = heelLP.filter(heelEMA.filter(rawHeel));

    // ── 2. GCT — eşik bazlı temas süresi (µs hassasiyet, Adım 16) ──
    const bool touching = toe > PRESS_THRESH;
    if (touching && !gctOpen) {
      gctOpen = true;
      contactStartUs = esp_timer_get_time();
    } else if (!touching && gctOpen) {
      gctOpen = false;
      gctUs = (uint32_t)(esp_timer_get_time() - contactStartUs);  // µs
      strikeForce = (toe + heel) / 200.0f;                          // 0..1 normalize
    }

    // ── 3. 6 byte kompakt payload hazırla (Adım 18) ──
    uint8_t payload[6];
    payload[0] = (uint8_t)constrain((int)toe, 0, 100);       // toe_pct
    payload[1] = (uint8_t)constrain((int)heel, 0, 100);      // heel_pct
    const uint32_t gctMs = gctUs / 1000u;                     // ms
    payload[2] = gctMs & 0xFF;                                // gct_lo
    payload[3] = (gctMs >> 8) & 0xFF;                         // gct_hi
    const uint16_t strike = (uint16_t)(strikeForce * 1000.0f);
    payload[4] = strike & 0xFF;                               // strike_lo
    payload[5] = (strike >> 8) & 0xFF;                        // strike_hi

    if (g_connected) {
      g_char->setValue(payload, 6);
      g_char->notify();
    }

    // ── 4. Debug log (yalnızca 1 saniyede bir) ──
    static uint32_t lastLog = 0;
    if (nowUs - lastLog > 1000000) {
      lastLog = nowUs;
      Serial.printf("[ExtremeS] toe=%d%% heel=%d%% gct=%lums strike=%.3f\n",
                    payload[0], payload[1], (unsigned long)gctMs, strikeForce);
    }
  }
}
