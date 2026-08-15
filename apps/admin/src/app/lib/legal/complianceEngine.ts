// ============================================================================
// 🛡️ LİKYA HUKUK & KVKK UYUM MOTORU (Legal & Compliance Shield)
// Aydınlatma + Açık Rıza • Veli Muvafakatname • 48s Otonom İmha
// KVKK (6698) & GDPR uyumlu — medya işleme yasal güvence altında
// ============================================================================

export type ConsentStatus = 'onaylandi' | 'bekliyor' | 'veli_gerekli';

export interface ConsentRecord {
  athleteId: string;
  athleteName: string;
  birthDate: string;
  isMinor: boolean;        // 18 yaş altı
  consentStatus: ConsentStatus;
  consentedAt: string | null;
  guardianName: string | null;
}

// 18 yaş kontrolü
export function isMinor(birthDate: string): boolean {
  const birth = new Date(birthDate);
  const now = new Date();
  const age = (now.getTime() - birth.getTime()) / (365.25 * 24 * 3600 * 1000);
  return age < 18;
}

// ----------------------------------------------------------------------------
// 📜 AYDINLATMA & AÇIK RIZA SÖZLEŞMESİ ŞABLONU (KVKK 10. madde)
// ----------------------------------------------------------------------------
export function generateConsentTemplate(athleteName: string, guardianName?: string): string {
  const party = guardianName ? `${guardianName} (veli/vasi olarak)` : athleteName;
  return `📜 LİKYA KAMPÜSÜ — GÖRSEL VERİ İŞLEME AÇIK RIZA BEYANI

1. VERİ SORUMLUSU: Likya Kampüsü İşletmesi
2. İŞLENEN VERİLER: Spor sahasında çekilen video, hareket analizi (biyomekanik), kısa klip ve fotoğraflar.
3. İŞLEME AMACI: Performans analizi, sporcu gelişimi, satın alınabilir kişisel medya paketleri üretimi ve tesis içi oyunlaştırma (XP/token).
4. HUKUKİ DAYANAK: KVKK md.5/1-a (açık rıza) + md.10 (aydınlatma).
5. SÜRE: 48 saat içinde satın alınmayan medya OTONOM OLARAK İMHA EDİLİR.
6. ANONİMLEŞTİRME: Rızası olmayan üçüncü kişilerin yüzleri otomatik bulanıklaştırılır (Face Blur).
7. HAKLAR: Bilgi edinme, düzeltme, silme, itiraz (KVKK md.11).

${party} olarak bu kapsamdaki görsel veri işlenmesine AÇIK RIZA veriyorum.
Tarih: ${new Date().toLocaleDateString('tr-TR')}`;
}

// ----------------------------------------------------------------------------
// 👨‍👩‍👦 VELİ MUVAFAKATNAME (18 yaş altı için zorunlu)
// ----------------------------------------------------------------------------
export function generateGuardianConsentTemplate(minorName: string, guardianName: string): string {
  return `👨‍👩‍👦 LİKYA KAMPÜSÜ — VELİ/VASİ DİJİTAL MUVAFAKATNAMESİ

${guardianName} veli/vasi olarak; reşit olmayan ${minorName} adlı sporcunun
spor sahasında video/biyomekanik analiz amaçlı görüntülenmesine, kısa klip ve
fotoğraf üretilmesine ve bu medyanın satışına AÇIK RIZA veriyorum.

Kapsam: Likya Sport Vision (klip, analiz, 4K arşiv) • Daze-Gift (XP/token ile talep)
Süre: 48 saat imha politikası geçerlidir.
Tarih: ${new Date().toLocaleDateString('tr-TR')}`;
}

// ----------------------------------------------------------------------------
// ✅ RIZA DURUMU TESPİTİ
// ----------------------------------------------------------------------------
export function resolveConsent(record: Omit<ConsentRecord, 'consentStatus'>): ConsentRecord {
  const status: ConsentStatus = record.isMinor
    ? record.guardianName
      ? 'onaylandi'
      : 'veli_gerekli'
    : 'onaylandi';
  return { ...record, consentStatus: status, consentedAt: record.consentedAt || new Date().toISOString() };
}

// ----------------------------------------------------------------------------
// ⏳ 48 SAATLİK OTONOM İMHA (Auto-Purge Lifecycle)
// ----------------------------------------------------------------------------
export interface PurgeStatus {
  mediaId: string;
  createdAt: string;
  remainingHours: number;
  remainingMinutes: number;
  willPurge: boolean;
  phase: 'SILINECEK' | 'SILINDI' | 'YENI';
}

export function autoPurgeTimer(mediaId: string, createdAt: string, now = Date.now()): PurgeStatus {
  const created = new Date(createdAt).getTime();
  const elapsed = now - created;
  const total = 48 * 60 * 60 * 1000; // 48 saat
  const remaining = Math.max(0, total - elapsed);

  if (elapsed >= total) {
    return { mediaId, createdAt, remainingHours: 0, remainingMinutes: 0, willPurge: true, phase: 'SILINDI' };
  }
  if (remaining > total * 0.8) {
    return {
      mediaId, createdAt,
      remainingHours: Math.floor(remaining / 3600000),
      remainingMinutes: Math.floor((remaining % 3600000) / 60000),
      willPurge: false, phase: 'YENI',
    };
  }
  return {
    mediaId, createdAt,
    remainingHours: Math.floor(remaining / 3600000),
    remainingMinutes: Math.floor((remaining % 3600000) / 60000),
    willPurge: false, phase: 'SILINECEK',
  };
}

// ----------------------------------------------------------------------------
// 🧑 48 SAAT İMA SAYACI (frontend için canlı geri sayım hesaplama)
// ----------------------------------------------------------------------------
export function formatCountdown(p: Pick<PurgeStatus, 'remainingHours' | 'remainingMinutes'>): string {
  return `${String(p.remainingHours).padStart(2, '0')}:${String(p.remainingMinutes).padStart(2, '0')} kaldı`;
}
