// AŞAMA 18 — Flutter Mobil ↔ Web çift yönlü senkron şema uyum testi
// mobileSyncBridge (saf) modelleri Flutter servisleriyle birebir eşleşmeli:
// supabase_service.dart (MobileUser/Session) + ai_vision_service.dart (ImageDiagnosisResult).
import { mapMobileReservation, mapBiomechanicScore, mapKitchenOrder, type ImageDiagnosisResult, type MobileUser } from './src/app/lib/sync/mobileSyncBridge.ts';

const results: { name: string; ok: boolean }[] = [];
function check(name: string, cond: boolean) {
  results.push({ name, ok: cond });
  console.log((cond ? 'PASS' : 'FAIL') + ' - ' + name);
}

// 1. Flutter ImageDiagnosisResult şeması (ai_vision_service.dart) birebir
const diag: ImageDiagnosisResult = {
  detectedCategory: 'Elektronik / Taşınabilir Bilgisayar',
  conditionRating: 3,                    // 1-5
  repairDifficulty: 'Orta',              // 'Kolay' | 'Orta' | 'İleri Seviye'
  estimatedRepairHours: 2,
  detectedDefects: ['Klavye tuş aşınması'],
  isClearQuality: true,
  aiRecommendation: 'Batarya değişimiyle kurtarılabilir.',
};
check('1. ImageDiagnosisResult 7 alan birebir', Object.keys(diag).length === 7);

// 2. SupabaseService MobileUser şeması
const user: MobileUser = { id: 'u1', email: 'a@likya.app', fullName: 'Ali', role: 'user' };
check('2. MobileUser alanları (id/email/fullName/role)', Boolean(user.id && user.email && user.fullName && user.role));

// 3. Rezervasyon eşleme (mobil payload → web kaydı)
const res = mapMobileReservation({ id: 'r1', resource: 'tenis', date: '2026-08-20', hour: '16:00', guests: 2, reference: 'TEN-ABC', status: 'confirmed', mobileCreatedAt: '2026-08-01T10:00:00Z' });
check('3. mapMobileReservation reference korunur', res.reference === 'TEN-ABC' && res.resource === 'tenis');

// 4. Biyomekanik skor eşleme
const bio = mapBiomechanicScore({ athleteId: 'a1', athleteName: 'Efe', score: 82, radarAvgKmh: 18.4, reactionMs: 240, assessedAt: '2026-08-01' });
check('4. mapBiomechanicScore skor 0-100 korunur', bio.score === 82 && bio.athleteName === 'Efe');

// 5. Mutfak sipariş eşleme (120s sayaç)
const order = mapKitchenOrder({ orderId: 'O-1', receiptNo: 'F-55', item: 'Levrek', qty: 1, amount: 240, countdown: 120, status: 'mutfakta' });
check('5. mapKitchenOrder countdown 120 korunur', order.countdown === 120 && order.item === 'Levrek');

const failed = results.filter((r) => !r.ok).length;
console.log(`\nSONUÇ: ${results.length - failed}/${results.length} test geçti`);
process.exit(failed > 0 ? 1 : 0);
