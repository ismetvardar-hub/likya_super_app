# 🚀 LİKYA SPORTVISIONX — PRODUCTION OPERATIONS RUNBOOK (Adım 100)

> **Sürüm:** v1.0.0-production-launch · **Kapsam:** 100/100 roadmap adımı tamamlandı
> Bu runbook; olay müdahale, donanım arıza giderme, yedekleme/geri yükleme ve kesintisiz dağıtım prosedürlerini içerir.

---

## 1. 🚨 Olay Müdahale Protokolleri (Incident Response)

| Seviye | Tanım | Tepki |
|---|---|---|
| **S1 Kritik** | Tüm platform çöktü / veri sızıntısı | 15 dk içinde müdahale, rollback, güvenlik bildirimi |
| **S2 Yüksek** | Kort telemetrisi kesildi / ödeme webhook'u başarısız | 60 dk içinde müdahale; alternatif kanala geçiş |
| **S3 Orta** | Tek modül hatası (rapor, radar) | 24 saat içinde düzeltme; sürüm notu |
| **S4 Düşük** | Kozmetik / iyileştirme | Bir sonraki sürüme devredilir |

**Müdahale Adımları:**
1. `scripts/system_health_check.sh` ile sistem sağlık taraması
2. `docker compose -f docker-compose.prod.yml ps` ile servis durumu
3. `apps/admin` logları: `docker logs likya_web --tail 200`
4. Supabase durum: `curl -s https://<ref>.supabase.co/health`
5. Gerekirse `git revert <commit>` + zero-downtime redeploy

---

## 2. 🛠️ Sensör Donanım Arıza Giderme Matrisi

| Belirti | Olası Neden | Kontrol / Çözüm |
|---|---|---|
| BLE bağlantısı yok | Pil bitmiş / GATT servisi kapalı | `batteryTelemetryService` ile pil oku; şarja al |
| Paket kaybı / gecikme | RF paraziti / mesafe | RSSI HUD'u aç (`HardwareDiagnosticsOverlay`); korta yaklaş |
| FSR değerleri 0 | Tabanlık kalibrasyonu bozuldu | `InsoleCalibrationWizard` ile tare + tek bacak kalibrasyonu |
| GCT tutarsız | Sensör senkron bozuldu | `feedToSync` / `sensorSyncEngine` 100ms hizasını kontrol et |
| Firmware eski | OTA güncel değil | `bleOtaService` ile CRC doğrulanmış OTA |
| Çift tabanlık asimetrisi | Sol/sağ eş zamanlı değil | `dualInsoleManager` bilateral paketleri incele |

---

## 3. 💾 Veritabanı Yedekleme & Geri Yükleme

- **Otomatik:** `prune_expired_telemetry(90)` günlük pg_cron + haftalık `pg_dump`
- **Yedek:** `pg_dump -U likya -h localhost likya > backup_$(date +%F).sql`
- **Geri Yükleme:** `psql -U likya -h localhost likya < backup.sql`
- **Retention:** Ham telemetri 30 gün ham → 90 gün özet → prune (bkz. `retentionPolicyEngine`)
- **Doğrulama:** `scripts/backup_restore.sh` restorasyon testi

---

## 4. 🔁 Kesintisiz Dağıtım (Zero-Downtime Deployment)

```bash
# 1. Testler
cd apps/admin && npx tsc --noEmit && node scripts/track7Batch19SmokeTest.mts
# 2. Build
npm run build
# 3. Docker imajı + Dokploy
docker compose -f docker-compose.prod.yml --env-file .env.prod build
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --no-deps web
# 4. Sağlık kontrolü
curl -fsS http://localhost:3000 && curl -fsS http://localhost:4000/v1/health
```

> Yeni imaj eski konteynerin yanında başlar; healthcheck yeşil olunca trafik geçer.

---

## 5. 🧪 Yayın Öncesi Kalite Kapıları

1. `npx tsc --noEmit` → **0 hata**
2. `npm run build` → **Compiled successfully**
3. Tüm smoke testler (`scripts/*.test.mts` + `scripts/track*SmokeTest.mts`) → **geçti**
4. `node scripts/master100StepVerification.mts` → **100/100 adım doğrulandı**
5. `node scripts/runE2eHeadless.mts` → **3/3 E2E senaryo**
6. Dokploy compose config → **geçerli**

---

## 6. 📌 Operasyon Notları

- **Gizlilik/KVKK:** Tıbbi & biyometrik veri `audit_logs` append-only; değiştirilemez
- **Güvenlik:** CSP/HSTS header'ları `securityHeadersEngine`; sanitizer tüm girdilerde
- **PWA:** `sw.js` cache-first statik + network-first/IDB kadro + background sync BLE
- **Kurtarma:** Bulut medyası (`supabaseStorageAdapter`) mock CI yedeğiyle test edilebilir

---
© 2026 Likya SportVisionX · v1.0.0-production-launch · 100/100 roadmap 🎉
