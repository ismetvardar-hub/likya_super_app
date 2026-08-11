# 🌿 Likya Super-App (Adil Ticaret, Etkinlik, Bilet & Onarım Ekosistemi)

![Likya Banner](https://img.shields.io/badge/Likya-SuperApp-0F4C81?style=for-the-badge&logo=flutter&logoColor=white)
![Build Status](https://img.shields.io/badge/CI%2FCD-Passing-48BB78?style=for-the-badge&logo=githubactions&logoColor=white)
![Supabase](https://img.shields.io/badge/Backend-Supabase_RLS-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)
![Next.js](https://img.shields.io/badge/Admin-Next.js_14-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)

Likya Super-App; adil ticaret (fair trade) pazar yeri, yerel kültür etkinlikleri ve QR biletleme, eşya onarımı ve sürdürülebilir bağış ekosistemini tek bir çatı altında toplayan otonom ve modern bir süper uygulamadır.

---

## 📐 Monorepo Proje Mimarısı

```
likya_super_app/
├── PROJECT.md                      # Proje genel tanımı ve faz yol haritası
├── AGENTS.md                       # AI Ajan çalışma yönergeleri ve ilkelere uyum
├── ARCHITECTURE.md                 # Veritabanı şema şartnamesi, RLS matrisi & mobil mimari
├── TODO.md                         # Faz bazlı görev takip listesi
├── docker-compose.yml              # Konteyner orchestrator yapılandırması
├── .env.example                    # Ortam değişkenleri güvenlik şablonu
├── .github/
│   └── workflows/
│       └── ci.yml                  # GitHub Actions CI/CD pipeline
├── supabase/
│   └── migrations/
│       └── 20260810_init_schema.sql # Supabase PostgreSQL kök şema & RLS migration
├── apps/
    ├── admin/                      # Next.js CEO Command Center (Yönetici Paneli)
    │   ├── Dockerfile              # Production multi-stage Dockerfile
    │   ├── .env.example
    │   ├── package.json
    │   └── src/
    │       └── app/
    │           ├── layout.tsx
    │           ├── globals.css     # Glassmorphism & Dark Mode stilleri
    │           └── page.tsx        # CEO Dashboard & Canlı Metrik Paneli
    └── mobile/                     # Flutter Mobil Uygulaması (Clean Architecture)
        ├── pubspec.yaml
        ├── test/
        │   ├── unit/models_and_services_test.dart
        │   └── widget/ui_screens_test.dart
        └── lib/
            ├── main.dart
            ├── core/
            │   ├── config/app_config.dart
            │   ├── router/app_router.dart    # GoRouter ve ShellRoute yapısı
            │   ├── services/supabase_service.dart # Realtime & Auth istemcisi
            │   └── theme/app_theme.dart      # Tasarım sistemi & UI Tokenları
            └── features/
                ├── auth/                     # Giriş & Kayıt ekranları
                ├── dashboard/                # Kampüs Akışı & Dashboard
                ├── fair_products/            # Adil Masa kataloğu, detay & ilan verme
                ├── events/                   # Etkinlik takvimi & detay
                ├── tickets/                  # QR Kod Bilet görüntüleyici (Realtime)
                └── repair_donations/         # Onarım başvuru formu & Stepper takip
```

---

## 🛠️ Teknoloji Yığını (Tech Stack)

| Bileşen | Teknoloji | Açıklama |
| :--- | :--- | :--- |
| **Backend & DB** | Supabase / PostgreSQL | Row Level Security (RLS), Realtime Postgres Changes, Auth |
| **Mobil İstemci** | Flutter (Dart 3.x) | Clean Architecture + Feature-First, GoRouter, QR Flutter |
| **Yönetici Paneli** | Next.js 14 / React | Dark Mode Glassmorphism UI, CEO Command Center |
| **Konteynerizasyon**| Docker & Docker Compose | Multi-Stage Build & Production Containerization |
| **CI/CD** | GitHub Actions | Otomatik Flutter Test, Next.js Build & Code Analysis |

---

## ⚡ Hızlı Başlangıç Rehberi

### 1. Depoyu Klonlama ve Ortam Kurulumu
```bash
# Ortam değişkenlerini kopyalayın
cp .env.example .env
cp apps/admin/.env.example apps/admin/.env
```

### 2. Supabase Veritabanı Migration İşlemi
Supabase SQL editöründe veya CLI üzerinden migration dosyasını çalıştırın:
```bash
# Migration dosyası konumu:
supabase/migrations/20260810_init_schema.sql
```
> **Not:** `20260810_init_schema.sql` dosyası `users`, `fair_products`, `events`, `tickets` ve `repair_donations` tablolarını, indeksleri, RLS politikalarını ve otomatik tetikleyicileri (triggers) sırasıyla kurar.

---

### 3. Mobil Uygulamayı Çalıştırma (`apps/mobile`)

```bash
cd apps/mobile

# Bağımlılıkları yükleyin
flutter pub get

# Testleri çalıştırın
flutter test

# Uygulamayı başlatın (iOS / Android / macOS / Web)
flutter run
```

---

### 4. CEO Command Center Yönetici Panelini Çalıştırma (`apps/admin`)

#### Geliştirme Ortamı (Development Mode):
```bash
cd apps/admin
npm install
npm run dev
```
Uygulamaya browser üzerinden erişin: `http://localhost:3000`

#### Docker ile Üretim Ortamında Çalıştırma (Production Mode):
```bash
# Kök dizinde:
docker-compose up --build -d
```

---

## 🔐 Güvenlik & Row Level Security (RLS) Stratejisi

Tüm veritabanı tablolarında `ALTER TABLE ... ENABLE ROW LEVEL SECURITY;` aktif edilmiştir:
- **`users`**: Kullanıcılar yalnızca kendi profillerini güncelleyebilir.
- **`fair_products`**: Aktif ürünler herkese açıktır. Yalnızca onaylı `seller` rolü ürün ekleyip güncelleyebilir.
- **`events`**: Etkinlikler herkese görünür. Yalnızca `organizer` ve `admin` yönetebilir.
- **`tickets`**: Bilet sahibi sadece kendi QR biletini görüntüleyebilir.
- **`repair_donations`**: Onarım durumları `repairer` ve `admin` tarafından güncellenebilir.

---

## 🧪 CI/CD Pipeline (GitHub Actions)

Depoya `push` yapıldığında veya `pull request` açıldığında `.github/workflows/ci.yml` otomatik çalışarak:
1. Flutter statik kod analizini (`flutter analyze`) ve birim testlerini (`flutter test`) yürütür.
2. Next.js admin projesinin derleme (`npm run build`) ve lint kontrollerini yapar.
3. Supabase SQL dosyasının bütünlüğünü doğrular.

---

## 📜 Lisans & Telif Hakkı
© 2026 **Likya Super-App Ekosistemi**. Tüm Hakları Saklıdır.
İletişim & Topluluk İlkeleri: *Sade, Naif, Centilmen ve Çözüm Odaklı.*
