// ============================================================================
// 🦾 RUNNER H — TEK TALİMAT YÜRÜTÜCÜSÜ (Hafif Komuta Motoru)
// CEO Chat'ten gelen tek cümlelik emirleri ("Padel kortunu kapat",
// "Stok durumunu getir", "Vardiyayı düzenle") ayrıştırır ve ilgili alt
// modüle yönlendirir. Deterministik kural motoru — LLM gerektirmez.
// Kırılmasız: bağımsız servis, mevcut chat mantığını değiştirmez.
// ============================================================================

export interface RunnerCommand {
  action: string;
  target: string;
  module: string;
  keyword: string;
  confidence: number;
}

export interface RunnerExecution {
  ok: boolean;
  command: RunnerCommand;
  dispatch: string;
  simulated: boolean;
}

// Modül eşleme haritası (alt modül → yönlendirme hedefi)
const RUNNER_H_MODULES: { keyword: string; module: string; target: string; emoji: string }[] = [
  { keyword: 'padel', module: 'Spor', target: 'Tesis Rezervasyon / Kort Yönetimi', emoji: '🎾' },
  { keyword: 'kort', module: 'Spor', target: 'Saha & Kort Rezervasyonları', emoji: '🎾' },
  { keyword: 'stok', module: 'İşletme', target: 'Daze Hub / Envanter Motoru', emoji: '📦' },
  { keyword: 'vardiya', module: 'İK', target: 'Dinamik Vardiya Motoru', emoji: '🔄' },
  { keyword: 'personel', module: 'İK', target: 'Daze Crew Yönetimi', emoji: '👥' },
  { keyword: 'tesis', module: 'Tesis', target: 'Tesis & IoT Durum Paneli', emoji: '🏕️' },
  { keyword: 'turnike', module: 'Tesis', target: 'Turnike & Erişim Kontrolü', emoji: '🚪' },
  { keyword: 'müzik', module: 'Müzik', target: 'Likya Müzik & Nöro-Akustik DJ', emoji: '🎵' },
  { keyword: 'bilet', module: 'Müzik', target: 'QR Biletleme', emoji: '🎫' },
  { keyword: 'sipariş', module: 'Pazaryeri', target: 'Sıfır Satış / Sipariş Motoru', emoji: '🛒' },
  { keyword: 'kiralama', module: 'Pazaryeri', target: 'Kiralama & TBYB', emoji: '🎪' },
  { keyword: 'bütçe', module: 'Finans', target: 'Finans & Borsa Algoritması', emoji: '💰' },
  { keyword: 'nakit', module: 'Finans', target: 'Nakit Akışı Paneli', emoji: '💰' },
  { keyword: 'antrenman', module: 'Spor', target: 'Sport Vision / Antrenman Analizi', emoji: '🏋️' },
  { keyword: 'şut', module: 'Spor', target: 'Optik Hız Radarı', emoji: '🎯' },
  { keyword: 'rezervasyon', module: 'Tesis', target: 'Konaklama & Saha Rezervasyonu', emoji: '🏕️' },
];

// Tek cümlelik emri ayrıştır (deterministik)
export function parseCommand(text: string): RunnerCommand | null {
  if (!text) return null;
  const lower = text.toLowerCase();
  for (const entry of RUNNER_H_MODULES) {
    if (lower.includes(entry.keyword)) {
      const action = /(kapat|aç|başlat|durdur|getir|düzenle|listele|göster|özetle|çalıştır|değiştir)/.exec(lower)?.[0] ?? 'göster';
      return {
        action,
        target: entry.target,
        module: entry.module,
        keyword: entry.keyword,
        confidence: 0.92,
      };
    }
  }
  return null;
}

// Komutu icra et → ilgili alt modüle yönlendir
export function executeCommand(text: string): RunnerExecution {
  const command = parseCommand(text);
  if (!command) {
    return {
      ok: false,
      command: { action: 'yönlendir', target: 'Genel Komuta', module: 'CEO', keyword: '-', confidence: 0 },
      dispatch: '🦾 Runner H: Talimat alt modül eşleşmesi bulamadı — CEO orkestratöre iletildi.',
      simulated: true,
    };
  }
  const entry = RUNNER_H_MODULES.find((e) => e.keyword === command.keyword)!;
  return {
    ok: true,
    command,
    dispatch: `🦾 Runner H: "${command.action}" → ${entry.emoji} ${command.module} → ${command.target} (${command.confidence * 100}% eşleşme)`,
    simulated: true,
  };
}

// Eklenti durum rozeti
export function runnerHStatus(): string {
  return `Runner H [${RUNNER_H_MODULES.length} alt modül eşleme kuralı • tek talimat yürütücü]`;
}
