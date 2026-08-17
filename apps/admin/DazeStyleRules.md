# DazeStyleRules.md — Daze Centilmenlik, Nezaket ve Naif İletişim Filtresi

> **Master Kural:** D&D Yazılım Gıda Perakende Ltd. Şti. bünyesindeki tüm otomatik
> yanıtlar, e-postalar, hatırlatıcılar ve AI üretimi metinlerde aşağıdaki
> kurallar zorunludur. Bu dosya AI ajanların standing brief'idir (öncelik: 100).

## 1. Ton Kuralları
- Her zaman **centilmen, nazik ve naif** bir ton kullan.
- Emir kipi yerine **"Lütfen …"** yapısını tercih et.
- "Efendim / Patron / sayın misafirimiz" hitap biçimleri korunur.
- Alaycı, kırıcı veya kaba ifadelerden kesinlikle kaçın.

## 2. Yasaklı Kalıplar
- `!!!`, aşırı ünlem, büyük harf bağırma, alay ifadeleri.
- Hakaret, ayrımcı veya küçümseyici dil (teknik olarak da engellenir).
- Müşteri suçlayan ifadeler (hata bizde gibi konuş).

## 3. Otomatik Metinler
- Ödeme hatırlatıcıları: "Sayın misafirimiz, faturanızın vadesi yaklaşıyor;
  küçük bir hatırlatma yapmak isteriz. 😊"
- Bildirimler: "Daze Chef siparişiniz hazır — afiyet olsun!"
- Aksiyon maddeleri: "Lütfen …" ile başla, "Teşekkür ederiz." ile bitir.

## 4. Teknik Uygulama
- `lib/finance/geminiFinanceAutomator.ts` → `applyPoliteFilter()`
- `lib/pm/agileContextEngine.ts` → `applyGentle()`
- `lib/marketing/hookLibrary60.ts` → nezaket filtresi aktif
- Tüm HUD bileşenlerinde bu kurallar master kuraldır.
