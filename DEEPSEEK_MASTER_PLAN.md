# 🌲 LİKYA KAMPÜSÜ: DEEPSEEK V3 GELİŞTİRME MASTER PLANI VE SPRINT GÖREVLERİ

Bu belge, **Likya Açıkhava Yaşam & İnovasyon Kampüsü (Likya CampusOS)** projesinin vizyonunu, tamamlanan modüllerini ve DeepSeek V3 (Cline / Roo Code) tarafından sırasıyla kodlanacak görevleri içerir.

---

## 🏛️ 1. PROJENİN AMACI VE VİZYONU

Likya Kampüsü; **Antalya / Olympos'ta 30-35 dönümlük bir arazide** kurulan, doğa sporları, eko-turizm, güneş enerjisi (GES), akıllı karavan/tiny house showroomları ve 16 ticari işletmeyi tek bir otonom dijital ekosistemde birleştiren Türkiye'nin ilk **"Akıllı Eko-Kampüs İşletim Sistemi (CampusOS)"** projesidir.

### 👥 4 Temel Kullanıcı Rolü:
1. 🔴 **Patron (CEO - Ahmet Y.):** `http://localhost:3000` (Genel ciro, enerji üretimi, güvenlik, doluluk ve holding metrikleri).
2. 🔵 **Kiracı (16 Dükkan):** `http://localhost:3000/tenant` (Stok, sipariş onay, günlük ciro, kira/komisyon dökümü).
3. 🟡 **Çalışan (Saha IoT & Personel):** `http://localhost:3000/staff` (Telemetri, GES arıza takibi, akıllı dolap kontrolü, su debisi).
4. 🟢 **Müşteri (Süper Uygulama):** `http://localhost:3000/customer` (Alışveriş, 2.El, Yemek, Konaklama, Spor, Bilet, Cüzdan).

---

## ✅ 2. ŞU ANA KADAR NELER YAPILDI? (TAMAMLANANLAR)

1. **🏛️ CEO Yönetim Paneli (`/`):**
   - 450 kWp GES Güneş Paneli üretim ve depolama grafikleri.
   - 16 Dükkanın anlık ciro ve doluluk oranları.
   - Plaka Tanıma (ANPR) bariyer ve 15 saniyelik TOTP dinamik turnike logları.
2. **📱 Müşteri Süper Uygulaması (`/customer` - 8 Modüler Bileşen):**
   - 🌤️ `WeatherWidget.tsx`: Cam efektli canlı hava durumu, nem ve parkur durumu.
   - 🎒 `ShoppingTab.tsx`: 0-Km outdoor ekipman pazarı ve sepet.
   - ♻️ `UpcyclingTab.tsx`: 2. El al-sat, AI Vision tarama ve Bluetooth Akıllı Dolap (#04).
   - 🍔 `FoodTab.tsx`: Kampüs bistro/kafe menüsü ve Likya Pay anında ödeme.
   - 🏡 `AccommodationTab.tsx`: Çadır, Karavan Showroom, Karavan Otopark (16A/32A) ve Bungalow (Şömine & Jakuzi opsiyonları).
   - 🎾 `SportsTab.tsx`: Padel kortları, orman saunası, buz banyosu, E-Bike/Scooter QR kiralama (₺3.5/dk).
   - 🎟️ `TicketsTab.tsx`: 15 saniyelik dönen TOTP QR bilet ve Amfitiyatro konserleri.
   - 💳 `WalletTab.tsx`: Likya Pay FAST yükleme, %10 Eco-Puan ve Kızılçam Fidan Sertifikası.
3. **🤖 Otonom AI Altyapısı:**
   - DeepSeek V3 + Cline entegrasyonu.
   - CrewAI Multi-Agent Yönetim Kurulu (CTO, CMO, CEO).

---

## 🎯 3. DEEPSEEK SIRALI SPRINT GÖREVLERİ (KOPYALA-YAPIŞTIR LİSTESİ)

Aşağıdaki görevleri sırasıyla VS Code'daki Cline'a vererek sistemi adım adım genişletebilirsiniz:

---

### 📌 GÖREV 1: KİRACI (16 DÜKKAN) YÖNETİM PANELİ (`/tenant`)
> **Cline'a Verilecek Komut:**
```text
apps/admin/src/app/tenant/page.tsx dosyasını oluştur. Bu sayfa Likya Kampüsü'ndeki 16 dükkan sahibi için Kiracı Yönetim Paneli olacak. 
Tasarım: Modern, koyu mod, cam efektli (Glassmorphism).
İçerik:
1. Dükkan Seçici (Migros Kampüs, Likya Outdoor, Padel Pro Shop, Fırın & Kafe vb.).
2. Günlük Ciro & Sipariş Sayısı Kartları (Örn: ₺18.450 Ciro, 42 Sipariş).
3. Canlı Gelen Siparişler Listesi (Onayla / Hazırlanıyor / Teslim Edildi butonları ile).
4. Hızlı Stok Güncelleme Tablosu (Ürün adı, stok adedi, fiyat ve Stokta Var/Yok butonu).
Sayfayı eksiksiz, interaktif ve çalışan butonlarla kodla.
```

---

### 📌 GÖREV 2: SAHA PERSONELİ VE IOT TELEMETRİ PANELİ (`/staff`)
> **Cline'a Verilecek Komut:**
```text
apps/admin/src/app/staff/page.tsx dosyasını oluştur. Bu sayfa Kampüs Saha Operasyon ve IoT Donanım Teknik Ekibi için olacak.
Tasarım: Neon detaylı, koyu koyu arka planlı teknik dashboard.
İçerik:
1. ☀️ GES Güneş Enerjisi İnverter Durumları (İnverter 1: 48.2 kW Normal, İnverter 2: 51.4 kW Normal, Sıcaklık: 42°C).
2. 🚰 Su Arıtma & Debi Takibi (Tank Doluluk: %84, pH: 7.2, Klor: Normal).
3. 📦 Bluetooth Akıllı Dolaplar (Smart Locker #01-#12 Dolu/Boş durumları ve Uzaktan Acil Aç butonu).
4. ⚡ Karavan Parkı Elektrik Sayaçları (Parsel A-01'den A-12'ye anlık kWh tüketimi ve Aşırı Akım Alarmı).
5. 🚨 Acil Müdahale ve Arıza Kaydı Oluşturma Butonu.
Sayfayı eksiksiz ve interaktif olarak kodla.
```

---

### 📌 GÖREV 3: AI CONCIERGE & KAMPÜS REHBERİ (MÜŞTERİ CHATBOTU)
> **Cline'a Verilecek Komut:**
```text
apps/admin/src/app/customer/components/AIChatModal.tsx bileşenini oluştur ve apps/admin/src/app/customer/page.tsx içine sağ altta yüzen şık bir 'AI Rehber' butonu olarak ekle.
İçerik:
1. Butona basılınca açılan cam efektli lüks bir sohbet penceresi.
2. Ziyaretçi "Bugün amfitiyatroda ne var?", "E-Bike nasıl kiralarım?", "En yakın kahveci nerede?" diye sorduğunda anında hazır akıllı yanıtlar veren Likya AI Asistanı simülasyonu.
3. Hızlı soru butonları (📍 Kampüs Haritası, 🚲 Bisiklet Fiyatı, ☕ Kafe Menüsü).
```

---

### 📌 GÖREV 4: CEO DASHBOARD'A TÜM SAYFALARIN HIZLI GEÇİŞ ÇUBUĞU
> **Cline'a Verilecek Komut:**
```text
apps/admin/src/app/page.tsx (CEO Paneli) en üstüne şık bir hızlı rol geçiş çubuğu (Quick Navigation Bar) ekle:
- [🔴 CEO Dashboard (/)]
- [🔵 16 Dükkan Paneli (/tenant)]
- [🟡 Saha & IoT Personeli (/staff)]
- [🟢 Müşteri Süper Uygulaması (/customer)]
Tıklanınca ilgili sayfalara hızlıca geçiş yapılabilsin.
```
