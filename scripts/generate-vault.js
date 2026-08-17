// ============================================================================
// 🛠️ 50 NOTLUK MASTER VAULT ÜRETİCİSİ
// Çalıştırma: node scripts/generate-vault.js
// Deterministik 50 kurumsal bilgi notu üretir → apps/admin/seed/master-vault.json
// Kırılmasız: vault üretimi veri/ klasörüne yazar (KVKK korumalı, gitignore).
// ============================================================================

const fs = require('fs');
const path = require('path');

const CATEGORIES = [
  'İşletme & Finans', 'Spor & Biyomekanik', 'Tesis & Konaklama',
  'Pazaryeri & Kiralama', 'Müzik & Atmosfer', 'Sistem & AI Altyapı',
  'Hukuk & KVKK', 'Pazarlama & Büyüme', 'İnsan Kaynakları', 'Operasyon',
];

const SEED = [
  'Daze Hub çalışan vardiya akışı 7/24 kesintisiz çalışır; kritik dönüşlerde otomatik takviye ajanı devreye girer.',
  'KVKK md.5/1-a açık rıza şablonu 18 yaş altı sporcular için veli muvafakatnamesi gerektirir.',
  'Padel kort rezervasyonları 60 dk dilimlerle yapılır; iptal ücretsiz, 15 dk geç kalma slotu düşürür.',
  'Daze Chef 120s motoru buzdolabı görselini multimodal Gemini ile analiz eder ve reçete üretir.',
  'Pazaryeri kiralama depozitosu %20, Try Before You Buy beğenirse kiralama bedeli satıştan düşülür.',
  'Likya Müzik nöro-akustik DJ, tesis doluluk oranına göre 90-140 BPM arası ritim seçer.',
  'Finans motoru günlük cirodan MRR üretir; çarpan 2.4x ile 8x arasında dikey bazlı değişir.',
  'IoT turnike logları gate_access_logs tablosuna yazılır; anomali tespiti Daze Sentinel tarafından yapılır.',
  'Scouting ajanı biyomekanik kartlardan performans indeksi hesaplar; 85+ skor öncelikli aday işaretlenir.',
  'Kurumsal hafıza her patron onayını arşive yazar; çelişkili kararlarda en son onay geçerlidir.',
];

const TITLES = [
  'Vardiya Akışı', 'KVKK Rıza', 'Padel Rezervasyon', 'Daze Chef Reçete', 'Kiralama Depozitosu',
  'Nöro-Akustik Ritim', 'MRR Çarpanı', 'Turnike Logları', 'Scouting İndeksi', 'Kurumsal Hafıza',
];

function makeVault() {
  const notes = [];
  for (let i = 1; i <= 50; i++) {
    const cat = CATEGORIES[i % CATEGORIES.length];
    const seedIdx = i % SEED.length;
    notes.push({
      id: `note-${String(i).padStart(3, '0')}`,
      title: `${TITLES[i % TITLES.length]} — Not ${i}`,
      category: cat,
      content: `[${cat}] ${SEED[seedIdx]} (detay #${i}: Likya Holding bilgi tabanı otomatik notu)`,
      tags: cat.toLowerCase().split(' ').slice(0, 2),
      updatedAt: new Date().toISOString().slice(0, 10),
      source: 'master-vault-generator',
    });
  }
  return { generatedAt: new Date().toISOString(), count: notes.length, notes };
}

const outDir = path.resolve(__dirname, '../apps/admin/seed');
fs.mkdirSync(outDir, { recursive: true });
const vault = makeVault();
fs.writeFileSync(path.join(outDir, 'master-vault.json'), JSON.stringify(vault, null, 2), 'utf-8');
console.log(`✅ MASTER VAULT ÜRETİLDİ: ${vault.count} not → apps/admin/seed/master-vault.json`);
