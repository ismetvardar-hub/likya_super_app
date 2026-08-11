# LİKYA SUPER-APP - AGENT GUIDELINES

## 1. Genel Geliştirme İlkeleri
- **Güvenlik Öncelikli (Security-First):** Veritabanı seviyesinde tüm tablolarda Row Level Security (RLS) aktif edilmeli ve istemci doğrudan sorgulama yaptığında veri sızıntısı önlenmelidir.
- **Temiz Kod (Clean Code):** Flutter tarafında Clean Architecture ve Feature-First yaklaşımı uygulanmalıdır. Spagetti kod yazılmamalıdır.
- **Modülerlik:** Her modül (`auth`, `fair_products`, `events`, `tickets`, `repair_donations`) bağımsız domain katmanına sahip olmalıdır.

## 2. Üslup ve İletişim
- Ajanlar ve sistem bildirimleri sade, kibar, yapıcı ve profesyonel bir dil kullanmalıdır.

## 3. Rol Bazlı Erişim ve RLS Kuralları
- `users`: Kullanıcılar sadece kendi profil bilgilerini okuyup güncelleyebilir.
- `fair_products`: Herkes onaylı ürünleri listeleyebilir. Yalnızca `seller` rolündeki kullanıcılar ürün ekleyebilir.
- `events`: Etkinlikler herkese açıktır. `organizer` veya `admin` rolü etkinlik oluşturabilir.
- `tickets`: Bilet sahibi kullanıcı sadece kendi biletlerini görür.
- `repair_donations`: Bağışçılar kendi taleplerini oluşturur ve izler; yetkili `repairer` / `admin` durum günceller.
