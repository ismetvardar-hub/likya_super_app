# 🚀 PİLOT FAZ 1 SAHA DAĞITIM KILAVUZU — Live Field Pilot (Adım 101–105)

> SportVisionX **v1.0.1-pilot** · Kort tabletleri için sahada yönlendirmeli kurulum, canlı sağlık izleme, 100Hz telemetri güvenliği, pilot akademi hızlı kayıt ve çevrimdışı çökme raporlama.

---

## 1. Saha Kurulum Öncesi (Teknik Ön Koşullar)

| Öğe | Gereksinim | Kontrol |
|---|---|---|
| Kort tableti | Chrome/Edge (güncel), Web Bluetooth açık | `chrome://flags` → Web Bluetooth **Enabled** |
| BLE cihazları | Insole Sol (ExtremeS) · Insole Sağ (ExtremeS) · Decathlon HRM — şarj ≥ %50 | Uygulamada pil göstergesi |
| Ağ | Kort Wi-Fi (veya 4G); yoksa offline-first devreye girer | PWA kurulumu önerilir |
| Sunucu | `/api/health` erişilebilir (DB + Storage + SW) | Aşağıdaki 2. bölüm |
| Supabase | `SUPABASE_URL` + `SUPABASE_ANON_KEY` ortam değişkenleri | env doğrulaması |

---

## 2. Production Health-Check (Adım 101)

Canlı servis monitörü `GET /api/health` üzerinde çalışır.

```
curl -s https://<app-domain>/api/health | python3 -m json.tool
```

Yanıt yapısı (200 OK):

```json
{
  "success": true,
  "statusCode": 200,
  "healthy": true,
  "latency": { "dbPingMs": 42, "storagePingMs": 87, "totalMs": 129, "systemUptimeSec": 90123, "systemUptimeHuman": "1g 1s 2d 3sn" },
  "services": {
    "database":     { "status": "ok", "ok": true, "pingMs": 42, "detail": "auth/v1/health OK (http_200)" },
    "storage":      { "status": "ok", "ok": true, "pingMs": 87, "detail": "storage/v1 erişilebilir (http_200)" },
    "pwaServiceWorker": { "status": "ok", "ok": true, "swFile": true, "manifestValid": true, "detail": "sw.js yayında + manifest standalone geçerli" }
  },
  "build": { "app": "likya-sportvisionx", "version": "1.0.1-pilot" },
  "selfCheck": { "valid": true, "issues": [] }
}
```

- **DB Ping (ms):** `auth/v1/health` uç noktasına gerçek ağ ping'i (2.5 sn timeout).
- **Storage Ping (ms):** `storage/v1/bucket/healthcheck` erişilebilirlik ölçümü (4xx bile erişilebilirlik kanıtı sayılır).
- **PWA SW Durumu:** `public/sw.js` + `manifest.json` (standalone) sunucu tarafı doğrulaması.
- **Uptime:** sunucu fonksiyonunun çalışma süresi (`1g 1s 2d 3sn` biçimi).
- **Env yoksa:** `simulated` durumu + `healthy: true` döner — deterministik fallback, asla çökmez.

---

## 3. Kort Tablet BLE Eşleştirme & Kalibrasyon Sihirbazı (Adım 102)

`src/modules/hardware/FieldPairingWizard.tsx` — sahada yönlendirmeli kurulum:

1. **Cihaz seç:** Insole Sol / Insole Sağ / Decathlon HRM çiplerinden birini seç.
2. **Keşif:** `📡 BLE Tara` — tablet çevredeki cihazı bulur (`navigator.bluetooth.requestDevice`).
3. **Sinyal & pil:** RSSI metre (4 bar) ve pil voltaj göstergesi (LiPo 3.0–4.2V → %).
   - `EXCELLENT` ≥ -55 dBm · `GOOD` ≥ -70 · `FAIR` ≥ -80 · `WEAK` < -80.
   - **En az `GOOD` (2+ bar) sinyalde kuruluma devam edin.**
4. **Baseline kalibrasyonu:** `🎯 Başlat (5 sn)` — sporcu ayakta sabit; 500 örnek (100Hz × 5sn) toplanır.
   - `std < 0.1` → **stabil** (güvenli ofset); aksi halde tekrarlayın.
5. **Bonded kayıt:** `💾 Cihazı Kaydet` — MAC/UUID `localStorage (likya_bonded_devices)`'a yazılır.
   - Sonraki maçta **1 dokunuşla anında yeniden bağlanma** listesinde görünür.

> Gerçek donanım yoksa sihirbaz simülasyon modunda çalışır (UI akışı aynıdır).

---

## 4. 100Hz Telemetri Tampon & Kort Stres Monitörü (Adım 103)

`src/app/lib/telemetry/courtTelemetryStressEngine.ts` — çift akışlı (Sol+Sağ) 100Hz izleme:

- **Paket kaybı:** kayan 100 paketlik pencerede sıra boşluğu = kayıp; **%2 üzeri → uyarı** (ralli kalitesi düşük), **%6 üzeri → kritik**.
- **Jitter:** nominal 10ms'den ortalama sapma (ms).
- **Bellek üst sınırı:** ring-buffer **50MB** (`MAX_BUFFER_MEMORY_BYTES`). 2 saatlik maçta 2×100Hz ≈ 1.44M çerçeve/girdi yine de tablet tarayıcısını **çökertmez**; en eski çerçeveler FIFO düşürülür.
- **Durum makinesi:** `healthy` → `warning` (kayıp %2+ veya düşürme) → `critical` (kayıp %6+).

---

## 5. Pilot Akademi & Veli Hızlı Kayıt (Adım 104)

`src/modules/onboarding/PilotSquadOnboarding.tsx` — ilk pilot akademi için tek tık:

1. `⚡ Tek Tıkla Pilot Ekibi Oluştur` → 1 baş koç + **"U14 Elit Gelişim"** + 4 genç sporcu profili (temel biyometri: boy, kilo, dinlenme HR, 20m sprint, ACWR).
2. Otomatik **4 veli davet linki** üretilir (`https://app.likya.com/parent/verify?athlete=…&invite=…`) + her biri için **6 haneli OTP** (48 saat geçerli).
3. Linki ve OTP'yi veliye iletin (WhatsApp/kopyala); veli linkten girer, OTP'yi girer → sporcu profiline bağlanır.
4. Davetler tek kullanımlıktır (`used`); yanlış/süresi dolmuş OTP reddedilir.

---

## 6. Saha Hata Telemetrisi & Çevrimdışı Çökme Raporlayıcı (Adım 105)

`src/app/lib/monitoring/fieldCrashReporter.ts` — sıfır-bağımlılık istemci izleyici:

- **Yakalananlar:** yakalanmamış runtime hataları, Web Bluetooth **GATT kopuşları**, **IndexedDB kota** (QuotaExceeded), ağ hataları.
- **Saklama:** çökme dökümleri çevrimdışı `localStorage (likya_crash_queue)`'de sınırlı kuyrukta (**200 döküm**) bekler.
- **Flush:** ağ geri geldiğinde otomatik olarak telemetri sunucusuna gönderilir; başarısız gönderimler yeniden denenir (`replayAttempts`).
- Hata sınıflandırma: `gatt_disconnect` / `indexeddb_quota` / `network` / `runtime` / `unhandled`.

---

## 7. Maç Günü Kontrol Listesi

1. ☐ `curl /api/health` → `healthy: true` (DB, Storage, SW ok).
2. ☐ Tablet → saha modu → FieldPairingWizard: 3 cihaz da **GOOD+** sinyalde bondlandı.
3. ☐ 5 sn baseline kalibrasyonu her tabanlık için **stabil**.
4. ☐ Pilot takım + 4 veli daveti oluşturuldu; veliler OTP ile giriş yaptı.
5. ☐ Maç boyunca kort stres paneli: paket kaybı %2 altında, buffer 50MB içinde.
6. ☐ Çökme olursa: çevrimdışı kuyruğa düştü, Wi-Fi dönünce otomatik flush edildi.

---

## 8. Doğrulama

```
cd apps/admin
node scripts/pilotPhase1SmokeTest.mts   # 32/32
npx tsc --noEmit                        # 0 hata
npm run build                           # EXIT 0
node scripts/master100StepVerification.mts  # 50/50 (pilot dahil)
```

**PİLOT FAZ 1 HAZIR — SAHAYA ÇIKIŞ ONAYI VERİLEBİLİR. 🏟️**

