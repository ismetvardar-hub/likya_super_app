# LİKYA SUPER-APP - PROJECT OVERVIEW

## 1. Vizyon ve Misyon
Likya Super-App; adil ticaret (fair trade), yerel etkinlikler ve biletleme, eşya onarımı ve bağış ekosistemini tek bir çatı altında toplayan modern, etik ve otonom bir süper uygulamadır.

İletişim ve hizmet felsefemiz sade, naif, centilmen ve çözüm odaklıdır.

## 2. Teknoloji Yığını (Tech Stack)
- **Backend & Database:** Supabase (PostgreSQL, Row Level Security, Auth, Storage, Edge Functions)
- **Mobil Uygulama:** Flutter (Dart, Clean Architecture / Feature-First)
- **Mimari:** Monorepo yapısı (`apps/mobile`, `supabase/migrations`)

## 3. Yol Haritası (Roadmap)
- **Faz 1 (Mevcut Faz):** Kök veritabanı şemalarının (`users`, `fair_products`, `events`, `tickets`, `repair_donations`) ve Row Level Security (RLS) politikalarının hazırlanması, Flutter temel proje yapısının kurgulanması.
- **Faz 2:** Supabase Auth & Flutter state management (BLoC/Riverpod) entegrasyonu, modül arayüzlerinin geliştirilmesi.
- **Faz 3:** AI Core ajan entegrasyonları, otomatik bilet QR doğrulama ve harita servislerinin eklenmesi.
