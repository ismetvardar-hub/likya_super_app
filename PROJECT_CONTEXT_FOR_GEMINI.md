# LİKYA KAMPÜSÜ PROJE BAĞLAMI - GEMINI GELİŞİM PLANI İÇİN

## 1. PROJE KONUMU
- **Kök Dizin**: `/Users/ismetvardar/.gemini/antigravity/scratch/likya_super_app`
- **Admin (Next.js)**: `apps/admin/`
- **Mobile (Flutter)**: `apps/mobile/`
- **Supabase**: `supabase/`

## 2. PROJE TANIMI
Likya Açıkhava İnovasyon, Kamp & Yaşam Kampüsü — 30-35 dönüm otonom deneyim parkı (Experiential Retail & Eko-Turizm). Sıfır sermaye modeli.

## 3. 4 ROL
1. **Patron (CEO)** — 3D Twin & Gelir Yönetimi
2. **Kiracı** — 16 Dükkan & POS
3. **Çalışan** — Saha IoT & QR Devriye
4. **Müşteri** — Deneyim & Bilet

## 4. GELİR MODELLERİ
- Konaklama Geliri (%100 Net Kâr) — 40-50 Parsel Karavan & Tiny House
- "Try Before Buy" Satış Komisyonu (%3-%15)
- Sahne & Bilet Komisyonu (%10-%15)
- 16 Dükkan Ciro Payı (%8-%15)
- Amatör Spor Kulübü Fonu (Upcycling)

## 5. YAPILAN İŞLER (ÖZET)

### Admin Panel (Next.js 14)
- **CEOCommandChat.tsx** — Jarvis tarzı sesli & yazılı otonom ajan orkestratörü
  - 7 Departman Ajanı: Muhasebe 📒, Finans 💰, IT 🛠️, Cline 🧠, Konaklama 🏕️, Pazarlama 📣, Satış 🛒
  - Sesli giriş (Speech-to-Text) + Sesli çıkış (Text-to-Speech) — Türkçe
  - Uyandırma kelimesi: "Likya", "Patron", "Hey"
  - Sesli sorarsan sesli, yazılı sorarsan yazılı cevap
  - Çoklu model yedekleme: DeepSeek-V3 → DeepSeek-R1 → Gemini → Ollama
- **ModelRouter.ts** — Çoklu model failover yönlendirici
  - DeepSeek-V3 (hızlı kod), DeepSeek-R1 (karmaşık mimari), Gemini, Ollama
- **AccountingModule.tsx** — Ön muhasebe & finans modülü
- **AutonomousFinanceAgents.tsx** — Otonom muhasebe & finans ajanları
- **HoldingAgentTeams.tsx** — Holding departman ajan takımları
- **GitHubRepoIntegration.tsx** — GitHub hazır ajan sistemleri analizi
- **AgentReachSkillsIntegration.tsx** — Agent Reach & Skills repoları analizi
- **page.tsx** — CEO Dashboard, 3D Twin, finansal metrikler, 16 dükkan, saha görevleri, müşteri deneyimi

### Mobile (Flutter)
- 40+ özellik modülü: emergency, tickets, wallet, events, fair_products, repair_donations, weather, energy, transit, mobility, etc.

### Supabase
- RLS güvenlikli şema, audit loglar, master facility şeması

## 6. TEKNOLOJİ YIĞINI
- **Frontend**: Next.js 14, React 18, TypeScript
- **Mobile**: Flutter, Dart
- **Backend**: Supabase (PostgreSQL, RLS)
- **AI**: DeepSeek-V3, DeepSeek-R1, Gemini 2.0 Flash, Local Ollama (qwen2.5:7b)
- **Tasarım**: Koyu mod, Glassmorphism, neon renkler (#00f2fe, #10B981, #F27A1A, #8B5CF6)

## 7. GELİŞTİRME İHTİYAÇLARI (GEMINI'DEN PLAN İSTENECEK)
- Hangi modüller eksik?
- Hangi özellikler öncelikli geliştirilmeli?
- AI ajan sistemi nasıl güçlendirilmeli?
- Supabase şeması nasıl genişletilmeli?
- Mobil uygulama hangi ekranları eksik?
