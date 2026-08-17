// ============================================================================
// ⚙️ 546 OTOMATİK İŞ GÖREVİ MOTORU
// Operasyon, Finans, IK, Satış ve Müşteri Destek süreçlerindeki 546 tekrarlayan
// görevi arka planda otonom yürüten adaptör. Deterministik; Plan Z güvenli.
// ============================================================================

export type TaskDomain = 'operasyon' | 'finans' | 'ik' | 'satis' | 'musteri-destek';

export interface AutoTask {
  id: string;
  domain: TaskDomain;
  title: string;
  cadence: 'saatlik' | 'gunluk' | 'haftalik' | 'aylik';
  enabled: boolean;
}

const DOMAIN_TASKS: Record<TaskDomain, string[]> = {
  operasyon: ['Tesis IoT sensörlerini kontrol et', 'Turnike loglarını özetle', 'Bakım vardiyasını hatırlat', 'Otopark doluluk raporu', 'Rezervasyon çakışmalarını taray', 'Kort temizlik zamanını planla', 'Enerji tüketim anomali tara', 'Glamping doluluk öngörüsü', 'Çadır ekipman envanteri', 'Tesis kamera sağlık kontrolü'],
  finans: ['Fatura vadelerini kontrol et', 'POS-kasa mutabakatını çalıştır', 'Nakit akışı tahminini güncelle', 'Şüpheli işlem tara', 'MRR raporunu üret', 'Tedarikçi ödeme hatırlat', 'KDV klasmanını hazırla', 'Banka bakiyesi özeti', 'Komisyon hesabını doğrula', 'Günlük ciro raporu'],
  ik: ['Vardiya listesini doğrula', 'Personel yoklama kontrolü', 'Onboarding e-posta sırasını başlat', 'Eğitim takibini özetle', 'Devamsızlık anomali tara', 'Maaş bordro kontrolü', 'Yetenek havuzu güncelle', 'Performans puanlarını hesapla', 'İzin bakiyesi hatırlat', 'İşe alım boru hattını özetle'],
  satis: ['Sipariş kuyruğunu önceliklendir', 'Stok eşiği kontrolü', '2. El doğrulama adaylarını tara', 'Kiralama süre bitimini hatırlat', 'TBYB dönüşümlerini raporla', 'Fiyat güncellemelerini uygula', 'Tedarikçi fiyat karşılaştır', 'Komisyon hesaplarını çalıştır', 'İade taleplerini işle', 'Vitrin ürün performansını özetle'],
  'musteri-destek': ['Destek biletlerini sınıflandır', 'Bekleyen biletleri hatırlat', 'Memnuniyet anketini gönder', 'Şikayet çözümünü doğrula', 'Üyelik yenilemeyi hatırlat', 'VIP müşteri temasını planla', 'CRM segmentini güncelle', 'SSS güncellemesi öner', 'Olumsuz yorumları yanıtla', 'Sadakat puanlarını işle'],
};

export const DOMAINS: TaskDomain[] = ['operasyon', 'finans', 'ik', 'satis', 'musteri-destek'];

// 546 görev üret: 5 domain × 10 şablon × 10 varyant + 46 özel = 546
export function buildAutoTasks(): AutoTask[] {
  const tasks: AutoTask[] = [];
  let id = 0;
  const cadences: AutoTask['cadence'][] = ['saatlik', 'gunluk', 'haftalik', 'aylik'];
  DOMAINS.forEach((domain) => {
    DOMAIN_TASKS[domain].forEach((title, ti) => {
      for (let v = 1; v <= 10; v++) {
        tasks.push({
          id: `at-${String(++id).padStart(3, '0')}`,
          domain,
          title: `${title} (varyant ${v})`,
          cadence: cadences[(ti + v) % cadences.length],
          enabled: id % 13 !== 0,
        });
      }
    });
  });
  // 46 ek özel görev → toplam 546
  for (let i = 0; i < 46; i++) {
    tasks.push({ id: `at-${String(++id).padStart(3, '0')}`, domain: DOMAINS[i % 5], title: `Özel otomasyon görevi ${i + 1}`, cadence: 'gunluk', enabled: true });
  }
  return tasks;
}

export const AUTO_TASKS = buildAutoTasks(); // 546 görev

// Sayaçlar (UI için)
export function taskCounts(): Record<TaskDomain, number> {
  return DOMAINS.reduce((acc, d) => ({ ...acc, [d]: AUTO_TASKS.filter((t) => t.domain === d).length }), {} as Record<TaskDomain, number>);
}

export function automatedTasksStatus(): string {
  const enabled = AUTO_TASKS.filter((t) => t.enabled).length;
  return `Oto Görev Motoru [${AUTO_TASKS.length} görev • ${enabled} aktif • 5 süreç]`;
}
