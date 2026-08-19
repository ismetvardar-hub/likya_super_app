# 🏗️ Likya / SportVisionX — B2C Müşteri Deneyimi Dönüşüm Denetim Raporu

> **Tarih:** 2026-08-19 · **Kapsam:** `apps/admin` (Next.js) tam kod tabanı
> **Amaç:** Mevcut CEO/Admin odaklı 45+ modülün **Sporcu (Athlete) / Antrenör (Coach) / Veli (Parent)** odaklı müşteri deneyimine dönüştürülmesi için mimari harita + gap analizi + fazlı yürütme planı.

---

## 1. Yönetici Özeti

Platform bugün **"CEO Komuta Merkezi"** mimarisi üzerine kurulu: 6 iş dünyası dalı (İşletme, Spor, Tesis, Pazaryeri, Müzik, Sistem) altında **45+ bağımsız görünüm**, **36 spor bilimi motoru**, **25 operasyon motoru**, **31 AI motoru** ve 90 React bileşeni barındırıyor. Tüm veri **mock-first deterministik simülasyon** üzerinden akıyor; gerçek donanım (BLE kemer, ESP32 tabanlık, Mi Band) **Web Bluetooth köprüsü** ile bağlanabilir.

**Kritik bulgu:** `/customer` ve `/extremes` zaten müşteri yüzü sunuyor (süper-app + ExtremeS portalı), ancak **spor bilimi tarafı (telemetri, karneler, sakatlık riski, turnuvalar) hâlâ CEO/antrenör penceresinden** render ediliyor. B2C dönüşümü = aynı motorları **rol-bazlı temiz ekranlarla** sarmalayıp veri mantığını korumak.

---

## 2. Kod Tabanı Keşfi & Envanter

### 2.1 Routing & Sayfalar
| Route | Bileşen | Hedef Kitle | Not |
|---|---|---|---|
| `/` | CEOCommandCenter | CEO/Admin | 45+ view tek SPA içinde |
| `/customer` | CustomerSuperApp | Müşteri | Süper-app: alışveriş, yemek, rezervasyon, spor, bilet, cüzdan |
| `/extremes` + `/app` | ExtremeSSuperApp | Müşteri/Sporcu | Bağımsız mobil süper-uygulama (PWA) |
| `/staff` | Tesis operasyon ekranı | Personel | GES, dolap, sayaç |
| `/tenant` | Kiracı paneli | Dükkan kiracıları | — |
| `/landing` | B2B SaaS landing | Potansiyel müşteri | Lead formu |

### 2.2 Navigasyon (6 dal · 45+ modül) → Bileşen Haritası
| Dal (Domain) | Modül ID | Görünüm Bileşeni | Kaynak |
|---|---|---|---|
| 👑 Patron & ExtremeS | `exec` | ExecutiveSimplifiedHud | `components/ExecutiveSimplifiedHud.tsx` |
| | `extremes` | ExtremeSCustomerPortal | `components/ExtremeSCustomerPortal.tsx` |
| 🎾 Spor | `athlete` | AthletePerformanceAI | `components/AthletePerformanceAI.tsx` |
| | `sportvision` | SportVisionDashboard + Memory + MultiAgent | `components/SportVisionDashboard.tsx` vb. |
| | `sportvisionx` | **SportVisionX** (7 sekme: Ghost/Asustik/Klip/Termal/Metabolik/Pazu Bandı/Performans) | `components/SportVisionX.tsx` |
| | `youthdev` | YouthDevelopmentDashboard | `components/YouthDevelopmentDashboard.tsx` |
| | `holistic` | HolisticChildDashboard | `components/HolisticChildDashboard.tsx` |
| | `scouting` | ScoutingEcosystem | `components/ScoutingEcosystem.tsx` |
| 🏕️ Tesis & Konaklama | `caravan/tent/room/twin/iot/engine` | SmartCaravanPark / SmartTentStore / RoomOnlyConcept / 3D Park Twin / IoTSensorMap / SmartEngine | — |
| 🛒 Pazaryeri | `market` | Marketplace modülleri | — |
| 💼 Büyüme/Finans | `finance/marketing/legal/hr/payment/risk/gcp/saas/mediacom` | Finans & KDV / Auto-Marketing / LegalRisk / HRPayroll / PaymentIntegration / StrategicRiskShield / GoogleCloudHibe / GlobalSaaSFatura / SportMediaCommerce | — |
| ⚙️ Altyapı/Güvenlik | `facility/security/stress/monitor/telemetry/osint/procurement/smartcampus` | Tesis Bakım / Saha Güvenliği / Stres Testi / İzleme / Ajan Telemetri / OSINT / Donanım Satın Alma / Akıllı Tesis | — |

### 2.3 Motor Envanteri (`lib/`)

---

## 3. Rol & Yetki Haritası

- **RBAC motoru:** `lib/auth/rbacGuard.ts` + `roleGuard.ts` — hiyerarşi `ceo(4) > manager(3) > staff(2) > customer(1) > public(0)`.
- **Kimlik kaynağı:** Supabase JWT (`app_metadata.role`) veya backend JWT (`role`, `tenant_id`). `tenant_id` ile çok kiracılı izolasyon (`supabase/migrations/20260813000100_rls_tenant_isolation.sql`).
- **Güncel erişim modeli:** Tüm 45 görünüm **CEOCommandCenter** altında tek erişimde; spor motorları **CEO/antrenör penceresinde** render ediliyor. `customer` rolüne açık arayüzler: `/customer` ve `/extremes` (rol kontrolü sayfa düzeyinde değil — ana panel **giriş engeli yok**, çoğunlukla demo odaklı).
- **Gap:** Koç (coach) ve veli (parent) rolleri RBAC'ta **ayrı tanımlı değil** — `staff`/`customer` altında gruplanıyor. Sporcu verisi (karneler, sakatlık, telemetri) için **rol-bazlı görünürlük katmanı** yok.

---

## 4. Veri Akışı & State Yönetimi

| Katman | Mekanizma |
|---|---|
| **Senkron motorlar** | Saf fonksiyonlar; her görünüm kendi `useState` içinde deterministik mock veri üretir (`generateLiveSnapshot`, `generateLiveHubSnapshot`) |
| **Gerçek zamanlı akış** | `setInterval` (3sn) ile canlı simülasyon; donanım gelince **Web Bluetooth** notification callback'leri aynı state'i besler |
| **Olay dağıtımı** | `dazeHubEventBus` (ORDER_PLACED, COURT_DELIVERY_PLACED, KITCHEN_TIMER_TICK…) — LocalStorage geçmişli |
| **API/şelale** | `modelMatrix` → OmniRoute (Plan A Gemini → B Groq → C Cerebras → N NVIDIA → E OpenRouter), `routeToModel` |
| **Kalıcılık** | Mock-first (memory) + `bookingWriter`/Supabase migration'ları (DB hazır) |

**Kritik mimari gerçek:** Motorlar **donanımdan ve görünümden bağımsız** — aynı `computeSportsScienceMetrics()` hem CEO HUD hem müşteri kartında kullanılabilir. Dönüşümde veri katmanı değişmez.

---

## 5. Müşteri Dönüşüm Analizi (Modül Başına)

### 5.1 🎾 SportVisionX → Sporcu & Antrenör & Veli

| Modül | Mevcut Durum (CEO görünümü) | Müşteri Değer Önerisi | Gerekli UX/Uİ Adaptasyonu |
|---|---|---|---|
| **Live Performance Hub** | 6 bölgeli teknik grid (GCT, RSI, HRV, kN/s) | Sporcu: "Bugünkü formum" basit skorları; Veli: çocuğun gelişim grafiği | Ham değerleri **renkli skor rozetlerine** çevir; teknik birimleri alt metin yap; "Sporcu Görünümü / Antrenör Görünümü / Veli Görünümü" sekmesi |
| **Ölçüm & Gelişim Raporu** | 4 bölümlü rapor + AI tavsiye | Antrenör: haftalık plana gir; Veli: "düz yazıyla ne oldu" | **PDF/WhatsApp paylaş**, sade dille özet, "Geçen haftaya göre" okları |
| **Reels/Klip** | Paylaş linkleri (IG/WA) | Sporcu: sosyal vitrin | Klip seç + **kulüp şablonlu otomatik altyazı**; veli onayı gerekli (18-) |
| **Fit-Gaming** | XP/Lig/rozet + Daze kuponu | Sporcu: oyunlaştırma | Rozetleri **kupa odası** görünümüne dönüştür |
| **AI Hakem (Umpire)** | 5 branş canlı hakem paneli | Antrenör: mola içi analiz; İzleyici: canlı skor | **İzleyici modu** (skor + karar akışı), antrenör modu (istatistik) |
| **Akıllı Tabanlık** | Isı haritası + GCT/RSI | Veli: "çocuğun basışı sağlıklı mı?" | Ortopedi raporunu **düz dile** çevir; renk kodlu: 🟢 Güvenli / 🟡 Dikkat |
| **Turnuva & Eşleşme** | Braket + maç havuzu | Sporcu: "maç bul, katıl"; Veli: turnuva sonuç bildirimi | Push bildirim + **takvim entegrasyonu** |
| **Geofencing (Çocuk Koruma)** | Alarm + temizleme | Veli: **anlık push alarm** | Mobil bildirim kanalı + harita görünümü |
| **Kort Enerji & Teslimat** | IoT panel + sipariş hattı | Sporcu: korta sipariş; Veli: cüzdandan harcama onayı | Çocuk >150₺ harcamada **veli onay bildirimi** (mevcut parentalApproval) |

### 5.2 Diğer CEO Modülleri → Kısa Satır
- `finance/payment/risk/legal/gcp/saas` → CEO'da kalır; müşteriye yalnızca **özet sayaçlar**.
- `facility/iot/security/telemetry/osint/stress` → Operasyon ekranı (`/staff`) — role göre gizlenir.
- `marketplace/caravan/tent/room/twin/music` → Zaten müşteri yüzü (`/customer`, `/extremes`) ile örtüşür; tek şema paylaşımı.


| Katman | Motor Sayısı | Öne Çıkanlar |
|---|---|---|
| `sports/` | 36 | **aiLiveUmpireEngine** (canlı hakem), **multiSportRefereeEngine** (5 branş), **sportsScienceEngine** (3 eksen), **smartInsoleEngine** (tabanlık), **armbandCoachingBridge** (pazu bandı), **livePerformanceHub**, **postSessionReport**, **tournamentEngine**, **matchmakingEngine**, **autonomousReportCard**, **viralClipEngine**, **fitGamingEngine**, **varLightEngine**, **orthopedicGaitAnalysis**, **multimodalFusionBridge**, **liveTelemetryEngine** |
| `ops/` | 25 | **courtEnergyAutomation**, **courtDeliveryEngine**, **facilityShuttleRadar**, **dazeHubEventBus**, **extremeHoldingRoutes**, bookingWriter |
| `security/` | 15 | **geofencingProtection**, **likyaPassEngine**, **kvkkMaskingEngine**, parentalApproval, anprGateAccess |
| `ai/` | 31 | **modelMatrix** (OmniRoute şelalesi), **swarmOrchestrator**, **voiceCommandEngine**, **autonomousAgentsSuite** |
| `hardware/` | 2 | **webBluetoothBridge** (HRM/ESP32/MiBand), **smartArmbandEngine** |
| `finance/` | 8 | familyMembership, parentalApproval, commissionDistribution, fintechSuite |
| `coaching/` | 3 | pedagogicalCoachEngine, curiosityGamification, academicLexicon |


---

## 6. Gap Analizi

| # | Boşluk | Etki | Öneri |
|---|---|---|---|
| G1 | **Coach & Parent rolleri RBAC'ta yok** | Sporcu verisi rol ayrımı olmadan herkese açık | `roleGuard`'a `coach`, `parent` ekle + view kilitleri |
| G2 | **Spor görünümleri CEO paneli içinde** | Müşteri, teknik gridlerle karşılaşıyor | Rol tabanlı **yönlendirme katmanı**: `/athlete`, `/coach`, `/parent` route'ları |
| G3 | **Push bildirim kanalı yok** | Geofencing alarmı, maç daveti, kupon ekranda kalıyor | Web Push + (mobilde) FCM köprüsü |
| G4 | **Teknik birimler sadeleştirilmemiş** | GCT/RSI/HRV/kN/s veli için anlamsız | `sportsScienceEngine`'e `plainLanguage()` katmanı (skor 0-100 + emoji) |
| G5 | **Rapor paylaşımı (PDF/WA) yok** | Antrenör raporu çıktısı yok | `postSessionReport` → PDF export + WhatsApp share |
| G6 | **Mobil uyumluluk tutarsız** | CEO paneli geniş ekran; müşteri kartları mobil daraltılabilir | Grid bileşenlerini `minmax()` ile zaten responsive — test + PWA ekranı |
| G7 | **Tek cüzdan/tek kimlik** | Sporcu verisi (armband, tabanlık, karneler) tek profil şemasında değil | `athletePassport` aggregate (motorlar zaten üretiyor — birleştirici gerek) |
| G8 | **Gerçek donanım akışı %100 doğrulanmamış** | BLE bridge hazır; uç senaryo yok | Bluetooth smoke + gerçek cihaz test planı |

---

## 7. Fazlı Yürütme Planı (B2C Dönüşümü)

### Faz 0 — Temel (Değişikliksiz koruma) ✅ mevcut
- Tüm 36 spor motoru + OmniRoute + event bus: **dokunulmaz** (salt fonksiyon).
- `tsc --noEmit` + `npm run build` EXIT 0 + CI yeşil + deploy hattı aktif.

### Faz 1 — Rol Katmanı & Yönlendirme
1. `rbacGuard`'a `coach`, `parent` rolleri ekle (hiyerarşi: ceo > manager > coach > staff > parent > customer > public).
2. `/athlete`, `/coach`, `/parent` route'ları + `RoleGate` sarmalayıcısı (JWT role → route).
3. CEO paneli `customer`/`parent` rolüne kapatılır; `/extremes` sporcu yüzü olur.

### Faz 2 — Sadeleştirilmiş Müşteri Ekranları (sport modülleri)
4. **`sportsScienceEngine` → `plainLanguage()`** — her metrik için skor + emoji + sade cümle.
5. **Sporcu Evreni** (`/athlete`): "Bugünkü Formum" (Hub skorları), "Gelişim Karnem" (rapor), "Maçlarım" (turnuva/eşleşme), "Kupalarım" (fit-gaming), "Paylaş" (reels).
6. **Antrenör Evreni** (`/coach`): seans planı + canlı çok sporcu izleme + AI hakem + teslimat hattı.
7. **Veli Evreni** (`/parent`): çocuk karnesi + sakatlık riski + geofencing alarm + harcama onayı (parentalApproval).

### Faz 3 — Bildirim & Paylaşım
8. Web Push + FCM köprüsü (geofence alarmı, maç hatırlatması, kupon).
9. Rapor PDF/WhatsApp export (postSessionReport → print/PDF + share API).

### Faz 4 — Donanım Canlılığı & Ölçek
10. Web Bluetooth gerçek cihaz doğrulama + Supabase persistence geçişi (mock-first → DB, motor şemaları hazır).
11. PWA offline (kort içi veri toplama) + tablet layout final.

**Kırılmama garantisi:** Her fazda motor katmanı değişmez; sadece yeni `customer/` sarmalayıcı bileşenler eklenir. CEO paneli olduğu gibi kalır (görünüm aynı motorlardan beslenir).

---

## 8. Eklenecek Dosya Kılavuzu (Faz 1-2 hedefleri)
```
apps/admin/src/app/athlete/page.tsx        → Sporcu Evreni (Hub + Karne + Maçlar)
apps/admin/src/app/coach/page.tsx          → Antrenör Evreni (canlı izleme + hakem)
apps/admin/src/app/parent/page.tsx         → Veli Evreni (karne + koruma + onay)
apps/admin/src/app/lib/auth/roleGuard.ts   → coach/parent rolleri (mevcut dosya genişletilir)
apps/admin/src/app/lib/sports/sportsScienceEngine.ts → + plainLanguage()
apps/admin/src/app/components/customer/    → Sporcu/Antrenör/Veli kart bileşenleri
```

> **Sonuç:** Platformun veri/motor omurgası B2C'ye hazır durumda; eksik olan rol katmanı, sade dille sunum ve bildirim kanallarıdır. Faz 1-2 ile CEO/Admin pencereleri aynı motorlardan beslenen **Sporcu / Antrenör / Veli evrenlerine** dönüştürülebilir.

