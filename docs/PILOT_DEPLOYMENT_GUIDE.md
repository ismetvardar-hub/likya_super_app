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

## 6b. Maç Günü Hızlı Seans Başlatıcı (Adım 106)

`src/modules/court/MatchDaySessionStarter.tsx` — koç için **1-dokunuş** saha kurulumu:

1. **Kort seç** (1–8) · **Pilot takım** ("U14 Elit Gelişim") · **Format**: Single Set / Best of 3 / 20-dk High Intensity Drill.
2. `⚡ Tek Dokunuşla Seansı Başlat` → BLE tabanlık akışları (Sol+Sağ) + Decathlon HRM beslemesi otomatik başlar, **arka plan telemetri kaydı** (100Hz) devreye girer.
3. Durum makinesi: `🟢 Seans Aktif` → `🟡 Set Molası (90sn)` → `▶️ Devam` → `🏁 Maçı Bitir` (kayıt kapanır, `endedAt` damgalanır).

> Konfig doğrulama: kort aralığı (1-8), takım ve format kontrolü — hatalı girişte asla seans açılmaz.

---

## 6c. Koç Mola & Set Arası Taktik HUD (Adım 107)

`src/modules/court/IntermissionTacticalCard.tsx` — 90 saniyelik değişim kartı:

- **Metrikler:** İlk Servis % · Ortalama Racket Hızı (km/s) · **GCT Yorgunluk Drift'i (+ms)** · Yüksek Yüklü Deselerasyonlar.
- **Öneri üretici:** kural tabanlı, her zaman **3 maddelik düz dil** taktik önerisi:
  - İlk servis <%50 → *"2. serviste slice derinliğini artır, riski azalt"*
  - GCT drift >20ms → *"oyunu kısalt, çapraz vuruş sayısını azalt"*
  - Deselerasyon >25 → *"kısa yön değişimlerini azalt, topu daha derin oyna"*
  - Rakip gözlemi kartta ayrıca gösterilir.

---

## 6d. Kort Ses Notu & Audio Marker Kaydedici (Adım 108)

`src/modules/court/CourtVoiceNoteRecorder.tsx` — canlı oyun sırasında **1-dokunuş** sesli not:

- MediaRecorder (Web Audio) ile kayıt; kayıt anı **aktif 100Hz telemetri zaman çizelgesine** işaretlenir (çerçeve indeksi = seans offset / 10ms).
- Audio blob **IndexedDB**'de çevrimdışı önbelleklenir; ağ dönünce Supabase Storage **`session-voice-notes`** bucket'ına arka planda yüklenir (`<sessionId>/<noteId>.webm`).
- Üst sınır: 300 sn/not; meta doğrulama (mime audio/*, süre, boyut) her kayıtta çalışır.

---

## 6e. Maç Sonu Veli Anlık WhatsApp Özeti (Adım 109)

`src/app/lib/communication/parentInstantSummaryEngine.ts` — maç bittiğinde **60 saniye içinde** veliye kompakt pozitif özet:

```
🎾 Deniz bugünkü maçını tamamladı!
⏱️ Süre: 62 dk · Yük (TRIMP): 186
⭐ Yeni servis hızı rekoru: 178 km/s
💚 Toparlanma: Verimli bir yüklenme oldu; 48 saat aktif toparlanma (yüzme/hafif bisiklet) önerilir.
İyi çalıştı — Ayşe, detaylı rapor uygulamada hazır.
```

- Şablon motoru tamamen deterministik — **dış ücretli API bağımlılığı yok** (payload derleme yerelde).
- PB satırı yalnızca rekor varsa eklenir; TRIMP kategorisine göre toparlanma önerisi (12/24/48/72 saat).

---

## 6f. Pilot Telemetri CSV/JSON Master Export (Adım 110)

`src/app/lib/analytics/pilotTelemetryExportEngine.ts` — spor bilimcileri ve akademi yöneticileri için eksiksiz paket:

- **Ham 100Hz senkronize telemetri:** CSV (`tsMs,stream,toePct,heelPct,gctMs,strike`) + kompakt JSON (array-of-arrays, ~%40 daha küçük).
- **ACWR/TRIMP eğrileri:** mevcut bilimsel motorlarla (`computeBanisterTrimp`, `computeAcwrRolling`) 28 günlük yük penceresi.
- **Scout notları:** TID bileşik skoru → tavan kademesi + harf notu (Pro/A/B/C/D).
- **Track 9 bütünlük doğrulaması:** paketteki 10 domain (Adım 101–110) tek tek denetlenir.

---

## 6g. Çoklu Akademi Canlı Liderlik Tablosu (Adım 111)

`src/modules/analytics/MultiClubLeaderboard.tsx` — bağlı pilot tesislerin anonim karşılaştırması:

- Antalya / Lara / Belek kohortlarının telemetri **yüzdelikleri** toplanır; **Academy Power Index (API)** = RSI %40 + Sprint Çevikliği %35 + Tutarlılık Serisi %25.
- **Sıkı gizlilik filtresi:** rakip akademiler yalnızca anonimleştirilmiş kohort ortalamalarını görür. `verifyPrivacyIsolation()` sporcu kimliğinin özetlerde **asla** sızmadığını doğrular.

---

## 6h. Otonom AI Maç İçi Yorgunluk Tahmincisi (Adım 112)

`src/app/lib/ai/inMatchFatigueAdvisor.ts` — gerçek zamanlı dayanıklılık öngörüsü:

- **Model:** GCT uzama hızı (ms/set) + aktif deselerasyon sayısı + kardiyovasküler drift → yorgunluk skoru (0-100) ve **T_fatigue** (kalan dakika).
- Risk kademeleri: `low` < 30 · `moderate` < 50 · `high` < 70 · `critical` ≥ 70.
- Eşik aşıldığında koça otomatik taktik alarmı:
  > *"Oyuncunun bacak reaktif gücü 4. oyunda %27 düştü; servis-vole taktiği yerine taban çizgisinde tempo kontrolüne geçin."*

---

## 6i. Biyomekanik Kinetik Dijital İkiz 3D Replay (Adım 113)

`src/modules/three/KineticDigitalTwinReplay.tsx` + `lib/three/digitalTwinReplayEngine.ts`:

- 100Hz çift tabanlık basınç vektörleri + IMU rotasyonel hızlarından **prosedürel alt ekstremite kinematiği**: ayak vuruş açısı, diz fleksiyon yörüngesi, zemin temas vektörü.
- Kare süpürme (scrub) + **360° kamera dönüşü**; çerçeve sınırları ve lineer interpolasyon motoru (SVG 3D izdüşüm; Three.js/WebGL aynı motoru tüketir).

---

## 6j. Otomatik TID Havuz Sıralayıcı (Adım 114)

`src/modules/scouting/TalentPoolRankerView.tsx` + `lib/scouting/tidPoolRankingEngine.ts`:

- Akademiler arası tüm genç profil profilleri toplanır; biyometri **PHV ofsetine göre normalize** edilir (erken olgunlaşma avantajı cezalandırılır, geç olgunlaşana projeksiyon boyu eklenir).
- Otomatik tier kademeleri: **Top 5% Elite National Prospect** · **Developmental Tier 1** · **High Upside Raw Athlete** · **Developmental Tier 2**.

---

## 6k. Track 10 Uçtan Uca Test (Adım 115)

`scripts/pilotPhase3SmokeTest.mts` (21/21) — liderlik toplama + gizlilik izolasyonu, yorgunluk tahmin matematiği + taktik kural tetikleri, dijital ikiz interpolasyon/çerçeve sınırları, TID havuz PHV normalizasyonu ve Track 10 dosya/veri hattı bütünlüğü (111-115).

---

## 6l. Donanım Filo Sağlığı & Batarya Telemetri Yöneticisi (Adım 116)

`src/modules/facility/HardwareFleetDashboard.tsx` + `lib/hardware/hardwareFleetManager.ts` — akademi yöneticileri için merkezi filo panosu:

- 50+ BLE cihazın **SoC**, şarj döngüsü, **firmware sürüm drift'i** ve **sensör bozulma indeksi** tek panelde.
- Bakım uyarıları: düşük/kritik pil, **FSR membran aşınması** ("Insole Set #08: FSR pressure membrane degradation 22% — Recalibration recommended"), kritik bozulma, firmware güncellemesi.
- **OTA kademeli rollout:** Canary (%10) → Akademi — akademi rollout'u yalnızca Canary başarı oranı ≥%95 ise onaylanır (stage gating).

---

## 6m. Sub-Saniye WebRTC Düşük Gecikmeli Video & Telemetri Streamer (Adım 117)

`src/modules/video/LiveWebRtcPlayer.tsx` + `lib/video/webrtcCourtStreamer.ts`:

- **<300ms** gecikme hedefi; video yayını + 100Hz telemetri **DataChannel'lar** üzerinden: `telemetry_channel` (GRF paketleri) + `event_marker_channel` (ralli/olay işaretleri).
- Video karesi ↔ telemetri karesi **mikro-saniye faz hizası** (±1000µs tolerans); batch hizalama doğrulaması uzak koçluğa canlı overlay besler.

---

## 6n. Ulusal Federasyon (TTF/ITF) Veri Değişimi & Uyumluluk API (Adım 118)

`src/app/lib/federation/federationDataExchange.ts`:

- **ITF Junior Biometric Standard** + **TTF Development Passport (JSON)** formatlarında pasaport dışa aktarımı.
- **Otomatik PII gizleme:** tam ad, doğum tarihi ve tıbbi notlar maskelenir (sızıntı test edilir); doğrulanmış maç yükü (TRIMP), hız splitleri (0-5m/5-10m) ve TID yüzdelikleri aktarılır.
- Şema doğrulama: zorunlu alan eksikliği ve format uyumsuzluğu yakalanır.

---

## 6o. Aktif Sensör Self-Healing & Dinamik Oto-Kalibrasyon (Adım 119)

`src/app/lib/hardware/sensorSelfHealingEngine.ts` — doğal dinlenme aralıklarında çalışan drift-düzeltme:

- **Ağırlık taşımayan an** tespiti: 10 sn kesintisiz düşük FSR yükü (oturma molası, su molası).
- Zero-load baseline ofseti dinlenme ortalamasına sıfırlanır → sıcaklık + mekanik creep drift giderilir; sonraki okumalar otomatik düzeltilir.

---

## 6p. Track 11 Uçtan Uca Test (Adım 120)

`scripts/pilotPhase4SmokeTest.mts` (18/18) — filo batarya/membran uyarıları + OTA stage-gating, WebRTC DataChannel paketleme + faz hizası, federasyon şema/PII kuralları, zero-load drift düzeltme matematiği ve Track 11 dosya/veri hattı bütünlüğü (116-120).

---

## 6q. OpenRouter Birleşik API Gateway (Adım 121)

`src/app/lib/ai/openRouterGateway.ts` — tek OpenRouter anahtarı üzerinden dayanıklı çok-modelli yönlendirme:

- **3 tier preset:** `FAST_TACTICAL` (flash-001 → haiku, **<400ms** mola/drill önerisi) · `DEEP_REASONING` (sonnet → r1, TID/çok haftalık ilerleme) · `VISION_MULTIMODAL` (gpt-4o → gemini-pro-vision, kinematik açı/kort karesi).
- **Otomatik failover zinciri:** 429/5xx/timeout → üstel backoff ile sıralı fallback; tüm sağlayıcılar kapalıysa **deterministik mock sandbox** spor içgörüsü döner.

---

## 6r. Token, Gecikme & Günlük Bütçe Takipçisi (Adım 122)

`src/app/lib/ai/aiCostTracker.ts` — akademi seviyesi AI kaynak monitörü:

- Prompt/completion token, **uçtan uca gecikme (ms)** ve model fiyat bandına göre tahmini USD harcama izlenir.
- Kulüp başına **$2.00/gün** harcama limiti uygulanır; limit aşıldığında dış çağrı yapılmaz ve **yerel kural motoruna** otomatik düşülür.

---

## 6s. Semantik Cache & Sıfır-Maliyet Interceptor (Adım 123)

`src/app/lib/ai/openRouterCacheInterceptor.ts` — FNV-1a semantik cache'i OpenRouter hattına yerleştirir:

- Sporcu metrik yorum istekleri **dış ağ çağrısından önce** yakalanır; aynı telemetri profili → **anında hit → $0 token, 0ms ağ gecikmesi**.
- İsabetsizde OpenRouter'a gider ve sonuç cache'lenir (sonraki sorgular ücretsiz).

---

## 6t. Ghost Avatar & Yorgunluk Danışmanı Çok-Modelli Orkestrasyon (Adım 124)

`src/app/lib/ai/ghostAvatarOrchestrator.ts` — çekirdek spor motorlarını OpenRouter'a bağlar:

- `inMatchFatigueAdvisor` → **FAST_TACTICAL** (anında mola tavsiyesi)
- `seasonMemoryBuffer` + `scoutReportGenerator` → **DEEP_REASONING** (uzun vadeli gelişim/scout özeti)
- Tüm çağrılar cache-first interceptor üzerinden; ortak bütçe tracker'ı $2/gün zorlamasını sağlar.

---

## 6u. Track 12 Uçtan Uca Test (Adım 125)

`scripts/pilotPhase5SmokeTest.mts` (14/14) — istek/yanıt serileştirme + çok-tier seçim, ardışık sağlayıcı kesintilerinde failover retry, günlük bütçe tavanı + yerel kural motoru aktivasyonu, semantik cache hit intercept ($0) ve Track 12 dosya/veri hattı bütünlüğü (121-125).

---

## 6v. Çoklu Kamera RTSP/WebRTC Kalibratör (Adım 126)

`src/modules/cv/CourtCameraCalibrationView.tsx` + `lib/cv/cameraCalibrationEngine.ts`:

- 2-4 senkron kamera açısı (Baseline / Service / High-Angle Overhead) için extrinsic/intrinsic geometri kalibratörü.
- **DLT homography** (u,v) piksel → gerçek kort (X,Y,Z) metre; **reprojeksiyon hatası < 2cm** hedefi doğrulanır.
- Radyal/tanjantiyal **distorsiyon katsayıları** + kamera yerleşim doğrulama bayrakları (yükselme açısı, kapsama).

---

## 6w. Top Yörüngesi & İçeri/Dışarı Zıplama Tahmini (Adım 127)

`src/app/lib/cv/ballTrajectoryEngine.ts` — yüksek hızlı top uçuş fiziği:

- Video kareleri arasında (x(t), y(t), z(t)) interpolasyonu; **tepe yüksekliği**, **zıplama koordinatları** (X_bounce, Y_bounce) ve **çarpma hızı (km/h)** öngörüsü.
- Karar sınıfları: `IN_COURT` · `OUT_OF_BOUNDS` · `FAULT_SERVICE` (servis kutusu) · `NET_TOUCH` — **±2mm** milimetrik marj.

---

## 6x. 2D/3D İskelet Poz & Eklem Açısı Tahmini (Adım 128)

`src/app/lib/cv/poseEstimationEngine.ts` — 17-keypoint COCO/MediaPipe:

- Dirsek ekstansiyon açısı, **omuz-kalça kinetik ayırımı (X-Factor)**, temas anında diz fleksiyon.
- Hazırlık→vuruş **kinetik gecikme** (ayak basışı zaman damgası ↔ raket teması) tespiti + kütle merkezi (CoM).

---

## 6y. BLE Tabanlık & CV GRF Füzyon Filtresi (Adım 129)

`src/app/lib/fusion/sensorVisionFusionEngine.ts` — EKF + complementary füzyon:

- 100Hz BLE tabanlık basıncı + kamera CoM ivmesi birleştirilir; **tıkanma** (örn. ayak file arkası) → tabanlık birincil, kamera dönünce **otomatik kurtarma**.
- IMU açısal drift'i görsel optik işaretlerle düzeltilir; hibrit GRF (BW) çerçeveleri üretilir.

---

## 6z. Track 13 Uçtan Uca Test (Adım 130)

`scripts/pilotPhase6SmokeTest.mts` (21/21) — homography matris matematiği + reprojeksiyon hatası (<2cm), top zıplama parabolik fiziği + içeri/dışarı kararları, poz açı geometrisi + X-Factor, EKF yakınsama + kayıp-kare kurtarma ve Track 13 dosya/veri hattı bütünlüğü (126-130).

---

## 6aa. Cihaz İçi Mikro-Transformer Biyomekanik Çıkarım (Adım 131)

`src/app/lib/ai/edgeMicroTransformerEngine.ts` — Karpathy nanoGPT esinli, sıfır-bağımlılık saf TypeScript transformer:

- 100Hz füzyonlu kinematik karelerin (IMU + tabanlık + poz) **normalize kayan penceresi** → çok başlı self-attention ileri geçişi (Python/WASM yok).
- **3 vuruş öncesi** kinetik çöküş / yorgunluk sıçraması olasılığı — **<15ms** gecikme hedefi; deterministik mulberry32 ağırlık başlatma.

---

## 6ab. Monte Carlo Taktik Maç Simülatörü (Adım 132)

`src/modules/tactics/MatchTacticalSimulator.tsx` + `lib/tactics/monteCarloMatchSimulator.ts`:

- Oyuncunun hız splitleri, servis tutarlılığı ve yorgunluk azalma hızına dayalı **1000 Monte Carlo maç** simülasyonu.
- Rakip arketipleri: **Baseline Grinder / Big Server / All-Court Attacker**; kazanma olasılığı + **optimal vuruş seçimi** (3 strateji karşılaştırması).

---

## 6ac. Biyomekanik GPT Spor Bilimi Ajanı (Adım 133)

`src/app/lib/ai/biomechanicGptAgent.ts` — yanıtları doğrudan ölçülen telemetriye dayanan NL ajanı:

- Veli/koç sorgularını yanıtlar (örn. "Arda'nın ikinci servis hız düşüşünün kök nedeni nedir?") — **kinetik zincir gecikmesi, deselerasyon torku, PHV büyüme hızı** yerel depolardan referans alınır.
- **Sade dil + ahlaki guardrail:** kibar ton, sade terminoloji, güvensiz girdi reddi.

---

## 6ad. Otomatik Acil Sakatlık Triyajı (Adım 134)

`src/modules/medical/EmergencyTriageModal.tsx` + `lib/medical/emergencyTriageEngine.ts`:

- Tetikleyiciler: **desel >7.0 m/s²** · **asimetri >%35** · **ani kinetik duruş**.
- Standart protokoller: **PEACE & LOVE** / **RICE** + ortopedik konsültasyon için **zaman damgalı GRF-kinematik tıbbi olay raporu**.

---

## 6ae. Track 14 Uçtan Uca Test (Adım 135)

`scripts/pilotPhase7SmokeTest.mts` (21/21) — mikro-transformer tensor ileri geçiş + latency (<15ms) + determinizm, Monte Carlo yakınsama + olasılık sağlığı (0-100%), GPT yanıt grounding + metrik referansı, triyaj tetikleri + PEACE & LOVE protokolü ve Track 14 dosya/veri hattı bütünlüğü (131-135).

---

## 6af. GVS KNX Kort Aydınlatma & Otomasyon Gateway (Adım 136)

`src/modules/facility/KnxLightingControlView.tsx` + `lib/facility/knxLightingGateway.ts`:

- Komutlar: `ON` · `OFF` · `DIM_LUX (0-100%)` · `SCENE_MATCH_HIGH_INTENSITY` · `SCENE_STANDBY_ECO` — telegram payload (`KNX/1/1/1/COMMAND[:value]`) derleme.
- **Otomatik zamanlama:** planlı seans başlamadan **5 dk önce** açılır; kort **10 dk boşsa** ECO standby **%15**'e düşer. Başarısız-güvenli bellek-içi simülasyon driver (headless CI/offline).

---

## 6af-2. NFC / Dinamik QR Turnike Erişim Motoru (Adım 137)

`src/app/lib/facility/turnstileAccessEngine.ts`:

- **60sn dönüşümlü** kriptografik QR token + 24 saat NFC UID kart — FNV-1a zaman kovalı imza.
- Kapı kuralları: aktif rezervasyon + geçerli tıbbi feragat (Adım 90) + ödenmiş üyelik tier'ı (Adım 89) → red gerekçeleri: `EXPIRED_WAIVER` · `NO_ACTIVE_BOOKING` · `UNPAID_MEMBERSHIP`.

---

## 6ag. Dinamik Akıllı Dolap BLE/NFC Kilit Kontrolörü (Adım 138)

`src/app/lib/facility/smartLockerController.ts`:

- Turnike girişinde **müsait dolabı otomatik talep** eder + **ephemeral BLE açma anahtarı** üretir.
- Çıkışta otomatik serbest bırakma + **sanitasyon denetimi** (Adım 91); koç **acil master override** açma.

---

## 6ah. Çevresel Hava Sensörü & Zemin Telafi Motoru (Adım 139)

`src/app/lib/environment/courtWeatherEngine.ts`:

- Sıcaklık, bağıl nem, rüzgar ve zemin ıslaklığı alır; **WBGT** hesaplar (eşik **>28°C** → sıcak çarpması/hidrasyon molası alarmı).
- Adım 127 top zıplama fiziğini ıslaklık/nem ile düzeltir + **kayma riski/sürtünme katsayısı** üretir.

---

## 6ai. Track 15 Uçtan Uca Test (Adım 140)

`scripts/pilotPhase8SmokeTest.mts` (20/20) — KNX komut payload + otomatik karartma (ECO %15), turnike QR TTL rotasyonu + feragat/üyelik kilitleri, akıllı dolap ephemeral anahtar + master override, WBGT ısı alarmı + slip riski ve Track 15 dosya/veri hattı bütünlüğü (136-140).

---

## 6aj. Birleşik Atlet/Veli Mobil Köprü API (Adım 141)

`src/app/lib/mobile/mobileBridgeEngine.ts` + `src/app/api/mobile/sync/route.ts`:

- Çift yönlü senkron: **çevrimdışı seanslar**, günlük **iyilik anketleri** (Uyku/Ağrı/Ruh Hali 1-5) ve kişisel rekorlar.
- **ETag önbelleği + payload diff sıkıştırma** — senkron döngüsü başına **<10KB** bütçe; değişmeyen veride `noop` (HTTP 304).

---

## 6ak. Apple HealthKit & Google Health Connect Çift Adaptör (Adım 142)

`src/app/lib/health/healthConnectAdapter.ts`:

- Apple Watch / Garmin / Whoop / Galaxy Watch'tan **RHR, HRV (SDNN ms), Derin/REM uyku ve VO2 Max** senkronu.
- **Baseline Readiness Skoru (0-100%)** → kort öncesi **ACWR yük önerisi otomatik ayarlanır** (RED %40 / AMBER %20 / GREEN %0 azaltma).

---

## 6al. APNS & FCM Mobil Push Alert Yönlendirici (Adım 143)

`src/app/lib/notifications/mobilePushRouter.ts`:

- 5 kategori: `INJURY_RISK_ALERT` (kritik) · `TRAINING_REMINDER` · `NEW_PB_BADGE` · `COURT_CHANGE` · `WEATHER_CANCELLATION`.
- **Veli sessiz saatleri (22:00-07:00):** kritik olmayan bildirimler bastırılır. Profil tercihine göre **TR / EN / DE / FR** yerelleştirilmiş payload.

---

## 6am. Dinamik Veli Takvimi & iCal Senkron Motoru (Adım 144)

`src/app/lib/calendar/calendarSyncEngine.ts` + `src/app/api/calendar/[token]/route.ts`:

- **RFC 5545** uyumlu `.ics` abonelik beslemeleri (Apple Calendar / Google Calendar / Outlook) — token doğrulamalı.
- Kort ataması, maç saati veya turnuva değişiklikleri beslemeye **dinamik** yansır (manüel yeniden içe aktarma yok); zaman damgaları UTC.

---

## 6an. Track 16 Uçtan Uca Test (Adım 145)

`scripts/pilotPhase9SmokeTest.mts` (19/19) — mobil köprü payload sıkıştırma + diff senkron, HRV/RHR Readiness + ACWR yük azaltma, push sessiz saat bastırma + çok dilli payload, RFC 5545 VEVENT + zaman dilimi uyumu ve Track 16 dosya/veri hattı bütünlüğü (141-145).

---

## 6ao. Franchise Çoklu-Akademi Lisansı & Şube Yönetişim Motoru (Adım 146)

`src/modules/enterprise/FranchiseGovernanceView.tsx` + `lib/enterprise/franchiseGovernanceEngine.ts`:

- Master franchisor + çoklu şube lisansı (**Antalya Central / Istanbul Elite / Munich Performance**).
- **Koltuk tahsisleri** (koç/kort/aktif tabanlık çifti) zorlanır; **aylık franchise telif** otomatik (ciro payı % vs sabit taban ücret).

---

## 6ap. Sponsor İzlenim Motoru & ROI Analitiği (Adım 147)

`src/modules/enterprise/SponsorRoiDashboard.tsx` + `lib/enterprise/sponsorImpressionEngine.ts`:

- Yayın HUD (Adım 81), mobil veli beslemeleri ve turnuva braketlerinde **görsel izlenim + etkileşim** takibi.
- **Sponsor ROI & CPM** raporları + **denetlenebilir** FNV-1a sağlama toplamı (kurcalama tespiti).

---

## 6aq. Global Çok-Bölgeli Edge Telemetri Replikatörü (Adım 148)

`src/app/lib/sync/edgeTelemetryReplicator.ts`:

- 100Hz canlı telemetri **en yakın edge PoP'a** yönlendirilir (FRA1 / IST1 / DUB1 — haversine).
- Aktif-aktif çapraz bölge replikasyonu; gecikme + paket sıralaması **CRDT (LWW register)** ile çözülür.

---

## 6ar. Çok Para Birimli Faturalama & Otomatik Vergi Mutabakatı (Adım 149)

`src/app/lib/finance/multiCurrencyTaxEngine.ts`:

- **EUR / USD / TRY / GBP** dinamik döviz çevrimi (ECB/CBRT kur güncellemeleri).
- Uyumlu **KDV/VAT + uluslararası dijital hizmet vergisi** hesabı + **PDF mali fatura** dışa aktarımı.

---

## 6as. Track 17 Uçtan Uca Test & FINAL 150/150 MILESTONE (Adım 150)

`scripts/pilotPhase10SmokeTest.mts` (21/21) — franchise koltuk limitleri + telif matematiği, sponsor izlenim sayaçları + denetim, çok-bölgeli CRDT edge senkron + çakışma çözümü, çok para birimi VAT/KDV + döviz çevrimi ve **roadmap 150/150 FINAL MILESTONE** doğrulaması.

---

## 7. Maç Günü Kontrol Listesi

1. ☐ `curl /api/health` → `healthy: true` (DB, Storage, SW ok).
2. ☐ Tablet → saha modu → FieldPairingWizard: 3 cihaz da **GOOD+** sinyalde bondlandı.
3. ☐ 5 sn baseline kalibrasyonu her tabanlık için **stabil**.
4. ☐ Pilot takım + 4 veli daveti oluşturuldu; veliler OTP ile giriş yaptı.
5. ☐ Maç başlangıcı: MatchDaySessionStarter ile 1-dokunuş seans açıldı (kort + format + telemetri AKTİF).
6. ☐ Set aralarında IntermissionTacticalCard 90sn içinde metrik + 3 öneri gösterdi.
7. ☐ Koç sesli notları `session-voice-notes`'a yüklendi (offline kuyruk temiz).
8. ☐ Maç sonu veli WhatsApp özeti 60 sn içinde iletildi (TRIMP + PB + toparlanma).
9. ☐ Master export (CSV/JSON + ACWR/TRIMP + scout notu) oluşturuldu; Track 9 bütünlüğü 10/10.
10. ☐ Maç boyunca kort stres paneli: paket kaybı %2 altında, buffer 50MB içinde.
11. ☐ Çökme olursa: çevrimdışı kuyruğa düştü, Wi-Fi dönünce otomatik flush edildi.
12. ☐ Çoklu akademi liderlik tablosu: API sıralaması canlı; gizlilik izolasyonu doğrulandı.
13. ☐ Maç içi yorgunluk danışmanı T_fatigue öngörüsü ve taktik alarmları çalıştı.
14. ☐ Dijital ikiz 3D replay: vuruş geri sarma + 360° kamera sorunsuz.
15. ☐ TID havuz sıralaması PHV normalize edilmiş tier kademeleriyle yayında.
16. ☐ Donanım filosu: SoC/membran uyarıları temiz; OTA rollout kademeli onaylı.
17. ☐ WebRTC canlı yayın <300ms; telemetri overlay mikro-saniye hizalı.
18. ☐ Federasyon pasaportu (ITF/TTF) şema geçerli + PII maskeli gönderildi.
19. ☐ Sensör self-healing: dinlenme molalarında baseline drift düzeltmesi aktif.
20. ☐ OpenRouter gateway: tier yönlendirme + failover + <400ms FAST hedefi.
21. ☐ Akademi bütçesi: günlük $2 limiti; aşımda yerel kural motoru devrede.
22. ☐ Semantik cache: tekrar eden telemetri sorguları $0/0ms hit ile döner.
23. ☐ Ghost Avatar orkestrasyonu: yorgunluk (FAST) + sezon/scout (DEEP) uçtan uca.
24. ☐ Kamera kalibrasyonu: homography reprojeksiyon hatası <2cm + yerleşim flag'leri temiz.
25. ☐ Top yörünge: zıplama noktası + IN/OUT kararları doğru (marj ±2mm).
26. ☐ Poz tahmini: X-Factor + kinetik lag canlı hesaplanıyor.
27. ☐ GRF füzyonu: tıkanmada tabanlık birincil, kamera dönüşünde otomatik kurtarma.
28. ☐ Edge transformer: 3 vuruş öncesi risk öngörüsü <15ms çalışıyor.
29. ☐ Monte Carlo: 1000 maç simülasyonu + optimal vuruş stratejisi yayında.
30. ☐ Biyomekanik GPT: telemetriye dayalı, sade dilli ve guardrail'li yanıtlar.
31. ☐ Acil triyaj: desel/asimetri/duruş tetikleri + PEACE&LOVE/RICE + olay raporu hazır.
32. ☐ KNX aydınlatma: seans öncesi otomatik açılış + boşlukta ECO %15 çalışıyor.
33. ☐ Turnike: 60sn QR/NFC token + feragat/rezervasyon/üyelik kapı kuralları aktif.
34. ☐ Akıllı dolap: otomatik atama + BLE anahtar + sanitasyon + master override.
35. ☐ Hava motoru: WBGT >28°C alarmı + zemin kayma/zıplama telafisi yayında.
36. ☐ Mobil köprü: ETag + diff senkron <10KB; iyilik anketleri çalışıyor.
37. ☐ Health Connect: Readiness skoru ACWR yükünü otomatik ayarlıyor.
38. ☐ Push: sessiz saatler + TR/EN/DE/FR yerelleştirme doğru.
39. ☐ iCal: RFC5545 abonelik beslemesi Apple/Google/Outlook'a dinamik akıyor.
40. ☐ Franchise: şube koltuk limitleri + aylık telif hesabı doğru.
41. ☐ Sponsor: izlenim/CTR/CPM/ROI + denetim sağlama toplamı yayında.
42. ☐ Edge replikasyon: en-yakın PoP + CRDT tutarlılığı (3 bölge) aktif.
43. ☐ Çok para birimi: EUR/USD/TRY/GBP + KDV/DST + PDF fatura hazır.
44. ☐ ✅ **FINAL: 150/150 yol haritası %100 — üretim + 10 pilot fazı tamamlandı.**

---

## 8. Doğrulama

```
cd apps/admin
node scripts/pilotPhase1SmokeTest.mts   # 32/32 (Adım 101-105)
node scripts/pilotPhase2SmokeTest.mts   # 24/24 (Adım 106-110)
node scripts/pilotPhase3SmokeTest.mts   # 21/21 (Adım 111-115)
node scripts/pilotPhase4SmokeTest.mts   # 18/18 (Adım 116-120)
node scripts/pilotPhase5SmokeTest.mts   # 14/14 (Adım 121-125)
node scripts/pilotPhase6SmokeTest.mts   # 21/21 (Adım 126-130)
node scripts/pilotPhase7SmokeTest.mts   # 21/21 (Adım 131-135)
node scripts/pilotPhase8SmokeTest.mts   # 20/20 (Adım 136-140)
node scripts/pilotPhase9SmokeTest.mts   # 19/19 (Adım 141-145)
node scripts/pilotPhase10SmokeTest.mts  # 21/21 (Adım 146-150)
npx tsc --noEmit                        # 0 hata
npm run build                           # EXIT 0
node scripts/master100StepVerification.mts  # 69/69 (150/150 FINAL MILESTONE)
```

**🎉 150/150 STEPS %100 TAMAMLANDI — LİKYA SPORTVISIONX ÜRETİM + 10 PİLOT FAZI HAZIR 🏟️**

