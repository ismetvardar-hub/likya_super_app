// ============================================================================
// 🏛️ LİKYA KURUMSAL BİLGİ VAULT'U (Enterprise Knowledge Vault)
// Kurulan tüm modüllerin bilgisi burada "mühürlü" tutulur.
// Soru geldiğinde anahtar kelime eşleşmesiyle (RAG) ilgili bilgi
// otomatik olarak CEO prompt'una enjekte edilir → CEO bilimsel doğrulukla yanıtlar.
// ============================================================================

export interface KnowledgeEntry {
  id: string;
  title: string;
  icon: string;
  keywords: string[];
  content: string;
}

export const KNOWLEDGE_VAULT: KnowledgeEntry[] = [
  {
    id: 'sport-vision',
    title: 'Sport Vision — Otonom Branş Ajanları & Spor Bilimleri',
    icon: '🎾',
    keywords: ['sport vision', 'branş', 'padel', 'yüzme', 'yoga', 'fitness', 'koşu', 'tenis', 'futbol', 'biyomekanik', 'besyo', 'vo2max', 'ajan'],
    content:
      'Sport Vision, her spor branşına ayrı bir "Uzman Gözlemci Ajan" atar (Padel, Yüzme, Fitness, Yoga, Koşu, Futbol). Her ajanın persona, biyomekanik odakları, sakatlık risk noktaları, ideal BPM ve MET değeri vardır. Tüm istatistikler DETERMİNİSTİK matematikle hesaplanır (LLM halüsinasyonu yok): kalori (MET yöntemi), vuruş hızı, saha kapsama alanı, isabet oranı, güç çıkışı (P=F·v), VO2Max (Cooper testi: VO2max=(d−504.9)/44.73), laktat eşiği (maks HR %85). BESYO kütüphanesi 4 modül içerir: Biyomekanik Analiz (açı verimi, asimetri, eklem yükü), Kondisyon Motoru (periyodizasyon), Sakatlık Önleme (HRV bazlı aşırı yüklenme riski), Antrenör Pedagojisi. Kişiselleştirilmiş mesajlaşma motoru sporcuya motive edici, antrenöre bilimsel rapor üretir.',
  },
  {
    id: 'youth-dev',
    title: 'Gelişim Ligi & Biyometrik Akademi (Youth Maturation)',
    icon: '🧬',
    keywords: ['gelişim', 'biyometrik', 'phv', 'büyüme', 'mirwald', 'khamis', 'ape index', 'kulaç', 'altyapı', 'genç sporcu', 'maturity', 'kemik yaşı', 'osgood', 'olgunlaşma'],
    content:
      'Gelişim Ligi, genç sporcuları kronolojik yaşa değil BİYOLOJİK yaşa göre değerlendirir. Üç bilimsel algoritma kullanır: (1) MİRWALD (2002) Maturity Offset: boy, oturma yüksekliği, bacak boyu, kilo ve yaş ile PHV (Peak Height Velocity — Büyüme Zirve Hızı) tahmini; negatif değer PHV öncesi, 0 civarı HIZLI BÜYÜME evresi, pozitif sonrası demektir. (2) TANNER/KHAMIS-ROCHE yetişkin boy tahmini: erkek (baba+anne+13)/2, kız (baba+anne−13)/2. (3) APE INDEX: kulaç/boy oranı (yüzme, tenis, basketbolda erişim avantajı). PHV dönemi "Büyüme Kalkanı" aktifleşir: plyometrik yük %30 azaltılır, kalsiyum 1300 mg/D3/magnezyum önerilir — Osgood-Schlatter gibi büyüme çağı sakatlıkları önlenir. Beslenme motoru büyüme payı + antrenman harcamasını toplar. 3 taraflı rapor: sporcuya motive edici, veliye beslenme/uyku/büyüme ağrısı rehberi, antrenöre yük yönetimi.',
  },
  {
    id: 'density-balancer',
    title: 'Yoğunluk Dengeleme & Homojen Dağılım Motoru',
    icon: '⚖️',
    keywords: ['yoğunluk', 'dengeleme', 'homojen', 'dağılım', 'tenha', 'kalabalık', 'happy hour', 'personel rotasyonu', 'pop-up', 'etkinlik', 'sessiz vaha'],
    content:
      'Yoğunluk Dengeleme Motoru, tesisin doluluğunu bölge bazında izleyip 5 otonom strateji uygular: (1) Dinamik Fiyat/Flash İkram: tenha bölge %30 indirim başlatır; (2) Akustik Çekim (BPM Köprüsü): tenha bölgede müziği yükseltir, yoğun bölgede düşürür; (3) Pop-Up Etkinlik: atıl alanlara mini şov; (4) Personel Rotasyonu: yoğun bölgeden tenha bölgeye personel kaydırır; (5) Sessiz Vaha Rotası: sessizlik arayan misafirlere tenha bölgeleri önerir. Homojenlik Puanı (standart sapma bazlı %0-100) dağılım dengesini ölçer; her karar zaman damgalı denetim kaydına işlenir ve kritik kararlar Telegram/Discord VIP hattından Patron\'a bildirilir.',
  },
  {
    id: 'music-matrix',
    title: 'Çok Bölgeli Akustik Matrisi & Likya Müzik',
    icon: '🎧',
    keywords: ['akustik', 'bölge', 'müzik matrisi', 'zone', 'yoga spa', 'havuz', 'restoran', 'villa', 'padel kort', 'frekans', 'bpm', 'çal'],
    content:
      'Likya Müzik, 5 bölgeli bağımsız akustik ekosistemdir: Yoga&Spa (432Hz Zen), Ana Havuz&Sunset Bar (Disco/House), Restoran (Bossa/Akustik), Villalar (Lo-Fi), Padel Kortu (High-Energy). Her bölge kendi gerçek telifsiz radyo akışını (Radio Paradise MP3) bağımsız çalar; canlı BPM, ses seviyesi, enerji ve Suno üretim akışı ayrı yönetilir. "Tesis Geneli Parti Modu" tek tıkla tüm bölgeleri kutlamaya alır. Gerçek parçalar new Audio(track.audioUrl) ile, parça bitince onended ile sıradakine kesintisiz geçilir.',
  },
  {
    id: 'weather-dj',
    title: 'Hava Durumu DJ Otomasyonu (Open-Meteo)',
    icon: '🌤️',
    keywords: ['hava durumu', 'open-meteo', 'yağmur', 'güneş', 'sıcaklık', 'fırtına', 'tempo', 'atmosfer', 'gün batımı', 'antalya'],
    content:
      'Hava Durumu DJ Otomasyonu, ücretsiz Open-Meteo API ile Antalya anlık hava durumunu çeker ve müziğin BPM\'ini otomatik ayarlar: açık/güneşli +10 BPM (canlı groove), parçalı bulutlu +4, sisli −6 (ambient), yağmurlu −12 (lounge/şömine), karlı −15 (lo-fi), fırtına −18 (spa frekansları). Gün batımı saati de gösterilir; hava her 15 dakikada yenilenir ve "Hava DJ Otomatik" anahtarıyla açılıp kapatılabilir.',
  },
  {
    id: 'memory',
    title: 'Sonsuz Kurumsal Hafıza & Karar Mührü',
    icon: '🏛️',
    keywords: ['hafıza', 'karar', 'arşiv', 'enterprise', 'vault', 'onay', 'mühür', 'kaydet', 'strateji', 'kural', 'vizyon', 'sakla'],
    content:
      'Sonsuz Kurumsal Hafıza, TTL\'siz kalıcı SQLite deposudur (node:sqlite, JSON yedeğiyle). İki tablo: decisions (onaylı stratejik kararlar, status APPROVED, approved_by Patron) ve enterprise_vault (fatura/sözleşme/müşteri/işlem arşivi). Kullanıcı kural/vizyon/strateji verdiğinde chat altında "💡 Bu kararı ömür boyu kalıcı hafızaya kaydedeyim mi?" onayı çıkar; onaylanınca karar mühürlenir ve SONRAKİ TÜM promptlara otomatik enjekte edilir (çekirdek bellek). Geçmiş fatura/sözleşme/karar soruları arşivden taranarak yanıtlanır.',
  },
  {
    id: 'model-matrix',
    title: 'A-B-C-D Hibrit Model Şelalesi',
    icon: '🚀',
    keywords: ['yedek', 'model', 'şelale', 'deepseek', 'gemini', 'groq', 'ollama', 'mistral', 'openrouter', 'fallback', 'rozet', 'kota'],
    content:
      'A-B-C-D model şelalesi, LLM arızalarında kesintisiz yedekleme sağlar. Kodlama: A=DeepSeek → B=Groq → C=OpenAI → D=Anthropic → E=Mistral → F=Yerel Ollama. Sohbet/araştırma: A=Gemini → B=Groq → C=OpenAI → D=Anthropic → E=OpenRouter → F=Ollama. 429 (kota)/401 (kredi)/timeout durumunda kullanıcıya hissettirmeden sıradaki plana geçilir; başarılı model yanıta rozet olarak iliştirilir ([🧠 Plan A: DeepSeek]). Eksik anahtarlı planlar otomatik atlanır. Şu an aktif: DeepSeek + Gemini + yerel Ollama (qwen2.5-coder:7b).',
  },
  {
    id: 'safety-shield',
    title: 'Güvenlik Kalkanı & Otomatik Geri Alma',
    icon: '🛡️',
    keywords: ['kalkan', 'rollback', 'geri alma', 'syntax', 'güvenlik', 'tsc', 'hata', 'çökme', 'koruma', 'doğrulama'],
    content:
      'İnfaz motoru üç katmanlı koruma kalkanıyla çalışır: (1) Yazma Öncesi Syntax Kapısı: TS/TSX/JS/JSX TypeScript derleyicisiyle doğrulanır, bozuk kod diske hiç yazılmaz; (2) Yazma Sonrası tsc --noEmit doğrulaması: hedef dosya hataya sebep oluyorsa dosya anında orijinaline döndürülür (rollback); (3) Self-Correction Loop: ilk üretimde sözdizimi hatası olursa hata mesajı modele geri beslenip bir kez düzeltme istenir. Böylece CEO chat kendi arayüzünü asla çökertemez. Ayrıca kritik komutlar (sil, öde, sözleşme, yayınla) İNSAN ONAYI kesintisiyle Patron\'un onayına sunulur.',
  },
  {
    id: 'sportvision-x',
    title: 'Sport Vision X — Devrimsel Modüller',
    icon: '🩻',
    keywords: ['ghost', 'avatar', '3d ikiz', 'holografik', 'klip', 'termal', 'metabolik', 'kriyo', 'ritim kilitleme', 'binaural', 'viral', 'showtime'],
    content:
      'Sport Vision X 5 devrimsel modül içerir: (1) Ghost Avatar: sporcunun hareketine şampiyonun şeffaf 3D hayaleti bindirilir, kol açısı farkı canlı görülür; (2) Akustik Ritim Kitleme: kadans düşünce Likya Müzik BPM\'i hedef ritme kilitler (akustik pacing); (3) Viral Klip Fabrikası: kamera en estetik 3 anı seçer, ağır çekim+hız göstergesi+LİKYA logosu ile 15 sn Reels klip sporcunun WhatsApp\'ına gider; (4) Termal Sakatlık Radarı: lokal ısı artışından (ör. +1.8°C omuz) mikro enflamasyonu önceden sezer, kriyo yönlendirmesi yapar; (5) Metabolik Bar Köprüsü: yakılan kalori/elektrolit Daze Chef ekranına düşer, sporcu sahaya çıkarken smoothie hazırdır.',
  },
  {
    id: 'journey',
    title: 'Duygu Serüveni & Vibe Scanner',
    icon: '🎭',
    keywords: ['duygu', 'serüven', 'vibe', 'ruh hali', 'enerji', 'mekan nabzı', 'dikkat çekme', 'rezonans', 'coşku', 'nöro-akustik'],
    content:
      'Duygu Serüveni (Emotional Journey), mekanı "Duygusal Simya" laboratuvarına çevirir. 3 evreli otonom BPM rampası: (1) Dikkat Çekme 75 BPM (tatlı saksafon/dalga efekti), (2) Frekans Eşleme 98 BPM (lo-fi/Akdeniz gitarı — düşük frekansa inip bağ kurma), (3) Coşku Rampası 124+ BPM (disco-funk zirve). Vibe Scanner paneli "Mekan Ruh Hali / Duygu Dönüştürücü" durumunu gösterir. Gizlilik sınırı: konuşma asla dinlenmez — yalnızca on-device işlenen toplu çevre sinyalleri (gürültü, enerji, ruh hali eğilimi) KVKK/GDPR uyumlu şekilde kullanılır.',
  },
  {
    id: 'scouting',
    title: 'Scouting & Küresel Rekabet Ekosistemi',
    icon: '🎯',
    keywords: ['scouting', 'rekabet', 'hudl', 'catapult', 'homecourt', 'kitman', 'zone7', 'rakip', 'kulüp', 'ihraç', 'yetene', 'la masia', 'ajax', 'img'],
    content:
      'Sport Vision Scouting Ekosistemi, küresel rakiplere (Hudl, Catapult, HomeCourt, Kitman Labs, Zone7) karşı 8 boyutlu konumlanma sunar. Rakipler güçlü: saha video/skor (Hudl), GPS/biyometrik (Catapult), mobil biyomekanik (HomeCourt), sağlık AMS (Kitman), sakatlık tahmini (Zone7). BİZİM BENZERSİZ FARKIMIZ: 360° bütüncül yaklaşım — biyolojik yaş (PHV/Mirwald), çift veli pedagojisi (Q1-Q4), okul/akademik yük, kan tahlili OCR, tribün davranışı ve müzik/beslenme köprüsü rakiplerde YOK. Scouting modülü: genç sporcuların scout karnesini (holistik gelişim + sosyal + PHV ağırlıklı hazırlık skoru) üretir ve La Masia, Ajax, IMG gibi kulüplere tek tıkla yetenek dosyası gönderir (WhatsApp). Doğrulanmış Hareket Kütüphanesi, ideal vuruş açıları ve risk eşiklerini güven skorlarıyla biriktirerek veri üstünlüğü hedefler.',
  },
  {
    id: 'mediacom',
    title: 'Medya Kasası & KVKK Uyum',
    icon: '🎬',
    keywords: ['kvkk', 'rıza', 'muvafakat', 'veli onay', 'medya', 'klip satış', 'daze-gift', 'xp', 'imha', '48 saat', 'hukuk', 'filigran', 'anonim'],
    content:
      'Sport Media Commerce, hukuki güvence + medya satışı + sadakat kataloğu sunar. KVKK (6698) md.5/1-a açık rıza + md.10 aydınlatma şablonu üretir; 18 yaş altı sporcular için VELİ MUVAFAKATNAME zorunludur. Anonimleştirme: rızası olmayan üçüncü kişilerin yüzleri AI ile otomatik bulanıklaştırılır. 48 SAAT OTONOM İMHA: satın alınmayan ham/önizleme video 48 saat sonra diskten kalıcı silinir. Ürün kasası: Viral Reels Klip (150 TL/5$/500 XP), Biyomekanik Analiz (250 TL/9$/1000 XP), 4K Fotoğraf Paketi (100 TL/4$/350 XP), 4K Maç Arşivi (350 TL/12$/1500 XP). Daze-Gift: XP/token ile ücretsiz medya talebi (redeemWithPoints). Filigranlı önizleme + çift kanallı satın alma (kart/mobil + XP).',
  },
  {
    id: 'procurement',
    title: 'Donanım Şartname & Satın Alma Motoru',
    icon: '📦',
    keywords: ['donanım', 'şartname', 'tedarik', 'satın alma', 'ihale', 'veo', 'spiideo', 'pixellot', 'bepro', 'jetson', 'kamera', 'poe', 'global shutter', 'polar', 'inbody', 'roi', 'lisans', 'beyanname'],
    content:
      'Sport Vision Donanım Motoru: hazır kapalı kutu sistemlere (Veo Cam 3, Spiideo, Pixellot Air NXT, Bepro) aylık/yıllık lisans ödemek yerine endüstriyel bileşenler doğrudan tedarik edilir: 4K Panoramik 180° kamera (120 FPS Global Shutter, Sony Pregius/Hikvision, IP67, PoE+), NVIDIA Jetson Orin Nano/AGX Edge AI (sıfır bulut gecikmesi, on-device KVKK), Polar H10/Verity Sense HRV + BLE 5.3 Gateway, Seca 213 stadiometre + InBody 570 istasyonu (PHV/Mirwald besler), 10 Gbps SFP+ ağ + 8TB NVMe RAID tampon. evaluateSupplierQuote(): Teknik Uyum %40 + Fiyat %30 + Teslim %15 + Garanti %15 + güven bonusu (garanti≥2 yıl +3, uyum≥%90 +4); ONAY ≥78, İNCELEME ≥55, altı RED. 5 yıllık TCO hesabı (donanım + zorunlu abonelik) ile ortalama %65 maliyet avantajı: 13.970 USD tek seferlik (kurulum dahil ~15.370 USD) vs Veo 31.000$, Spiideo 40.000$, Pixellot 50.000$, Bepro 24.500$, Akademi paketi 74.000$. generatePurchaseRequisition() resmî satın alma beyannamesini üretir (gerekçe, kalemler, bütçe TL/USD/EUR, tedarikçi listesi, onay imzası).',
  },

  {
    id: 'pwa-deploy',
    title: '7/24 Bulut & Mobil PWA Mimarisi',
    icon: '📱',
    keywords: ['pwa', 'mobil', 'vercel', 'cloud run', 'deploy', 'dağıtım', 'manifest', 'ana ekran', 'pin', 'kilit', 'offline', 'service worker', 'bulut'],
    content:
      'Likya Command CEO 7/24 kesintisiz bulut mimarisi: GitHub reposu → otomatik CI/CD → Vercel/Cloud Run üzerinde yayın (output standalone, Dockerfile hazır) → Supabase Cloud veri tabanı. Mobil: PWA (progressive web app) — manifest.json (standalone, tema #0f172a), Service Worker /sw.js (ağ öncelikli + offline önbellek), Safari/Chrome "Ana Ekrana Ekle" ile tarayıcı çubuğu olmadan tam ekran uygulama. Patron Güvenlik Kalkanı: 4 haneli PIN kilidi (varsayılan 1818, değiştirilebilir), 5 hatalı denemede 30 sn kilit, sessionStorage oturum kilidi (pencere kapanınca yeniden kilit). İkonlar deterministik PNG üreticiyle üretilir (scripts/gen-icons.cjs): neon cam göbeği→mor gradyan + şimşek. Production build: npx tsc --noEmit EXIT 0 + npm run build EXIT 0 doğrulanmıştır.',
  },
  {
    id: 'mega-ekosistem',
    title: 'Master Ekosistem İnovasyon Paketi (8 Modül)',
    icon: '🏛️',
    keywords: ['radar', 'hız analizi', 'sprint', 'vuruş hızı', 'erp', 'reçete', 'stok', 'bordro', 'prim', 'prompt', 'orkestratör', 'memory', 'rag', 'live context', 'event bus', 'maç bitişi', 'security', 'rate limit', 'enjeksiyon', 'cors', 'stop-slop', 'üslup', 'omni', 'router', 'fallback', 'sentinel', 'uptime', 'meteoroloji', 'yedekleme'],
    content:
      'Master Ekosistem İnovasyon Paketi 8 deterministik modül sunar: 1) speedRadar.ts — piksel/frame hareketinden km/s vuruş ve sprint hızı (kale 7.32m kalibrasyonu, fizik sınırı 250 km/s üzeri otomatik geçersiz). 2) erpEngine.ts — reçete hammadde tüketimi (atomik stok kontrolü), canlı stok uyarıları (DÜŞÜK/KRİTİK/TÜKENDİ), Daze Crew bordro (saatlik+mesai %150+haftasonu %200+vardiya 150 TL, %22 kesinti) ve %5 komisyon şeması. 3) promptOrchestrator.ts — 3 katmanlı bağlam: Memory %35 + Live %30 + RAG %25 + direktif %10, token bütçesi kesintisiz kırpma, RAG Bilgi Vaultu (enterpriseKnowledge) entegre. 4) eventBus.ts — non-blocking asenkron kuyruk: maç bitişi → Chef içecek emri + Veli WhatsApp raporu + arka plan log, FIFO + once desteği. 5) securityAudit.ts — kayan pencere rate-limit, SQL/NoSQL/LDAP/XSS/komut enjeksiyon kalkanı, CORS wildcard denetimi, birleşik auditRequest. 6) stopSlopFilter.ts — 30+ AI klişesi temizliği + kaba ifade sansürü (•••) + gentlemanValidator. 7) omniRouter.ts — 8 sağlayıcı ağırlıklı yük dengeleme, yuvarlak robin, başarı/başarısızlık istatistiği, fallback şelalesi (rankByReliability). 8) dazeSentinel.ts — turnike/IoT uptime monitörü (% uptime), meteoroloji risk + Daze DJ tempo köprüsü, yedekleme zamanlama + saklama politikası. Tüm modüller LLM-siz, tamamen deterministik matematiktir; tsc EXIT 0 + 23/23 fonksiyonel test geçti.',
  },

  {
    id: 'hr-dispatch',
    title: 'Otonom İşe Davet & Dinamik Vardiya Motoru',
    icon: '👥',
    keywords: ['ik', 'insan kaynakları', 'vardiya', 'işe davet', 'personel', 'part-time', 'yoğunluk', 'skorlama', 'müsaitlik', 'availability', 'qr', 'bordro', 'prim'],
    content:
      'Otonom Vardiya Motoru (hr/shiftDispatchEngine.ts): 1) Yoğunluk analizi — departman yoğunluğu %75+ veya rezervasyon %80+ → +2 personel, %50+/%55+ → +1, etkinlik flag +1; aciliyet KRİTİK/YÜKSEK/ORTA/DÜŞÜK. 2) Skorlama — Performans %50 + Güvenilirlik %30 + Bütçe uyumu %20 + müsaitlik bonusu 15 puan; tavan bütçenin %80 üzeri saatlik ücret cezalandırılır. 3) İki taraflı otonom davet — WhatsApp şablonu (saatlik ₺ + prim + EVET/HAYIR yönlendirmesi); KABUL → takvim + QR kartı (LKY|INV-...|ONAYLI), RET → alternatif gün/saat sorgusu → Availability Pool hafızası. 4) LikyaCrew (skill + vardiya + XP + müşteri memnuniyeti) ve HRPayrollAgent (maaş + prim + fazla mesai) ile uyumludur. STRIX güvenlik kalkanı (/api/v1/ceo/memory 20 req/dk, /api/v1/ceo/notify 10 req/dk) API rotalarına entegredir.',
  },

  {
    id: 'praison-hud-tools',
    title: 'PraisonAI İşgücü, Sci-Fi HUD & AI Araç Matrisi',
    icon: '🦾',
    keywords: ['praison', 'ajan', 'orkestrasyon', 'research', 'plan', 'execute', 'sci-fi', 'hud', 'kilit', 'hud access node', 'tool registry', 'araç', 'router', 'görev', 'metin', 'kod', 'görsel', 'analiz'],
    content:
      'PraisonAI Çoklu Ajan Orkestrasyonu (lib/ai/praisonOrchestrator.ts): ResearchAgent (veri analizi, risk düşük/orta/yüksek) → PlanAgent (3 adımlı aksiyon planı, ACİL/NORMAL/DÜŞÜK) → ExecuteAgent (STOK→ERP, VARDİYA→HR davet, BİLDİRİM→VIP hattı, MÜZİK→DJ BPM, TESİS→Sentinel bakım) zinciri. Sci-Fi HUD Access Node (components/SciFiLockScreen.tsx): kuantum/neon grid + terminal veri akışı + PIN + güvenlik jetonu onay animasyonu, Session Lock + 5 hatalı denemede 30sn kilit (layout ta PatronLock yerine geçti). AI Araç & Model Yönlendirici (lib/ai/toolRegistry.ts): 8 görev tipi (METİN/KOD/GÖRSEL/ANALİZ/SES/VERİ/ÇEVİRİ/ÖZET) için 23 araçlık kayıt defteri; detectTaskType komuttan tipi tahmin eder, selectToolForTask anahtar yoksa yerel kural motoruna (Plan Z) düşer; örn. kod→DeepSeek V3, analiz→Speed Radar, çeviri→Gemini Translate.',
  },

  {
    id: 'rbac-openlive',
    title: 'Logto RBAC & OpenLive Ses Köprüsü',
    icon: '🔐',
    keywords: ['rbac', 'logto', 'rol', 'yetki', 'ssn', 'role guard', 'openlive', 'ses', 'voice', 'mediarecorder', 'mikrofon', 'tts', 'konuşma'],
    content:
      'RBAC (lib/access/roleGuard.ts): Logto uyumlu merkezi kimlik — 6 rol (CEO süper yetki, Tesis Müdürü, Antrenör, Daze Crew, Müşteri, Misafir), kaynak bazlı izinler (module:<id>:view/edit, action:<ad>), can() joker desteği, guardAction(), rol hiyerarşisi (canInherited) ve Logto token claim den resolveRoleFromToken köprüsü. OpenLive (lib/voice/openLive.ts): çift yönlü ses köprüsü — Web Speech yoksa MediaRecorder fallback (startOpenLiveRecording, süreye dayalı deterministik transkript), yanıtları SpeechSynthesis ile seslendirir (speakResponse). CEO Chat entegrasyonu: PraisonAI ajan zinciri (detectPraisonTask: stok/vardiya/tesis/müzik/bildirim/finans/spor komutlarından sayıları okuyup Research→Plan→Execute sonucunu chatte gösterir) ve mikrofon butonu MediaRecorder fallback.',
  },

  {
    id: 'plugin-kit',
    title: 'Kırılmasız Eklenti Paketi (Add-on/Plugin)',
    icon: '🧩',
    keywords: ['plugin', 'eklenti', 'addon', 'openlive bridge', 'vad', 'barge-in', 'chatwoot', 'whatsapp', 'gesture', 'ghost', 'pinch', '4 seviye', 'logto guard'],
    content:
      '4 bağımsız eklenti adaptörü (mevcut 42 modüle kırılmasız eklenir): (1) lib/ai/openLiveBridge.ts — Web Audio VAD (RMS enerji eşiği) + Barge-In (araya girme) destekli çift yönlü ses köprüsü, AnalyserNode tabanlı VadDetector, createOpenLiveBridge(). (2) lib/support/chatwootBridge.ts — WhatsApp/Web/Messenger/Email webhook normalize + kanal bazlı yönlendirme (routeInbound), token yoksa simülasyon modu. (3) lib/vision/gestureTracker.ts — 21 noktalı el landmarklarından Ghost (kaydırma) ve Pinch (sıkıştırma) jestleri, trackHandSequence majority voting. (4) lib/auth/roleGuard.ts — Logto uyumlu 4 seviyeli RBAC (SUPER_ADMIN, FACILITY_MANAGER, COACH, CREW), resolveRole(claims), requireRole(), guardMiddleware() Next.js route handler sarmalayıcısı. CEO chat headerında eklenti durum rozetleri görünür.',
  },

  {
    id: 'plugin-kit-2',
    title: 'İleri Eklenti Paketi (OpenRouter, TTS, Runner H, 3D, Viral)',
    icon: '🚀',
    keywords: ['openrouter', 'gateway', 'claude', 'llama', 'tts', 'voicebox', 'dia tts', 'runner h', 'komuta', 'in3d', 'avatar', 'meshy', '3d', 'gltf', 'viral klip', 'reels', 'form validation'],
    content:
      '7 kırılmasız eklenti: (1) lib/ai/openRouterAdapter.ts — OpenRouter Gateway: tek anahtar üzerinden Claude/DeepSeek/Llama/Gemini model yönlendirme (modelFromPrompt), routeViaOpenRouter; modelMatrix.ts Plan E korunur, generateWithOpenRouterGateway eklenir. (2) lib/voice/ttsEngine.ts — Ultra doğal ses: Web Speech + Dia TTS/VoiceBox uyumlu köprü, pickVoice Türkçe ses önceliği, speakText. (3) lib/ai/runnerHEngine.ts — Runner H: tek talimat yürütücü, 16 alt modül eşleme kuralı (padel/stok/vardiya/bilet...), parseCommand + executeCommand. (4) lib/vision/in3dAvatarBridge.ts — in3D Avatar: 33 nokta iskelet eşleme, limbAngle/classifyPose, Sport Vision 3D bağlantısı. (5) lib/vision/meshyAssetGenerator.ts — Meshy 3D: text-to-3d üretim (MESHY_API_KEY varsa gerçek, yoksa simülasyon), GLTFLoader köprüsü. (6) lib/marketing/viralClipEngine.ts — Viral Klip Motoru: maç anlarından Reels/Short taslağı (viralScore, suggestBpm, generateReelDraft). (7) styles/form-validation.css — sıfır JS maliyetli :invalid/:valid/:focus-visible form doğrulama stilleri (layout.tsx import eder). CEO chat headerında 10 eklenti rozeti görünür.',
  },

  {
    id: 'market-gallery',
    title: 'Pazaryeri Görsel Vitrini (MarketplaceGallery)',
    icon: '🖼️',
    keywords: ['vitrin', 'gallery', 'fotoğraf', 'ürün kartı', 'sıfır', '2. el', 'kiralama', 'tbyb', 'try before you buy', '3d görüntüle', 'gltf', 'unsplash'],
    content:
      'components/MarketplaceGallery.tsx — fotoğraflı pazaryeri vitrini: 3 segment (🏷️ Sıfır Mağaza: Babolat Pure Aero 2026, Bullpadel Vertex 04, Daze Techform Tişört; 🔄 2. El Pazarı: Wilson Blade V9 %90 A+ Doğrulanmış, Head Speed Pro; 🎪 Kiralama/TBYB: 4 Kişilik Glamping Çadırı, Slinger Top Fırlatma, Padel Test Kiti). Her kartta 4:3 responsive görsel (Unsplash; onError → ikon+degrade fallback — asla boş kart yok), durum rozetleri (Sıfır yeşil / A+ Doğrulanmış mor / Teste Uygun cyan), TBYB rozeti, fiyat (₺/satış veya ₺/günlük) ve aksiyon butonu (Satın Al / Hemen Kirala / 3D İncele). 🧊 3D Görüntüle rozeti → Meshy GLTF + in3D köprülü modal (detay listesi + köprü rozetleri). Responsive: masaüstünde auto-fill grid (minmax 240px), mobilde (<768px) yatay scroll + scroll-snap. CEOCommandCenter market view üstünde LikyaMarketplace yönetim panelinin ÜZERİNE bindirilir (kırılmasız).',
  },

  {
    id: 'supabase-resilient',
    title: 'Dayanıklı Supabase Client Katmanı',
    icon: '🗄️',
    keywords: ['supabase', 'veritabanı', 'fallback', 'mock', 'parcels', 'sports_facilities', 'pos_transactions', 'staff_tasks', 'resilient', 'dayanıklı'],
    content:
      'lib/db/supabaseClient.ts — kırılmasız veri katmanı: SUPABASE_DB_URL / anahtar eksik olsa bile uygulama asla çökmez; queryLiveTable() deterministik mock fallback döner (parcels, sports_facilities, pos_transactions, staff_tasks örnek satırları). supabaseEnvReady() + getSafeSupabaseClient() env hazır olduğunda @supabase/supabase-js dynamic import ile canlı sorgu atar (kod değişikliği gerekmez). IoTSensorMap, AIAgentAutonomousController ve MonitoringPanel bu köprüyle dinamik sorgu yapabilir.',
  },

  {
    id: 'master-addon-pack',
    title: 'Master Add-on Paketi (RAG, Vault, Graph, MRR, CMO, Creem)',
    icon: '🧰',
    keywords: ['ollama', 'rag', 'vault', '50 not', 'neon graph', 'trustmrr', 'leaderboard', 'cmo', 'okara', 'creem', 'mor', 'b2b lead', 'gojiberry', 'influencer', 'shoutcart', 'swarm bus', 'mini-app', 'hugo ai', 'sponsorluk'],
    content:
      'Master eklenti paketi: (1) scripts/generate-vault.js 50 notluk vault üretici + lib/rag/vaultData.json (seed). (2) lib/rag/localRagEngine.ts — Ollama yerel RAG; kapalıysa keyword fallback (Plan Z). (3) components/NeonGraphView.tsx — vault notlarını neon node-edge graph olarak render (toolsagents view). (4) lib/finance/mrrValuationEngine.ts + components/VerifiedRevenueWidget.tsx — TrustMRR MRR→çarpan→değerleme (finance view). (5) components/TrustLeaderboard.tsx — departman ciro sıralaması. (6) lib/marketing/agencyMarketing.ts — 8 yetenekli ajans (campaign-plan→landing-page). (7) lib/ai/agentSwarmBus.ts — publish/subscribe ajan mesajlaşma. (8) lib/ai/miniAppGenerator.ts — emergent mini-app stub. (9) lib/marketing/aiCmoEngine.ts — Okara modeli 10 ajanlı CMO. (10) lib/social/socialMediaBridge.ts — Zernio/Blotato MCP köprüsü. (11) lib/support/hugoTicketResolver.ts — otomatik bilet çözücü. (12) lib/marketing/sponsorshipSlots.ts — sponsorluk yuvaları. (13) lib/payments/creemGlobalBridge.ts — Creem MoR dijital satış + lisans anahtarı. (14) lib/ai/b2bLeadAgent.ts — Gojiberry lead skorlama. (15) lib/marketing/influencerBridge.ts — Shoutcart influencer köprüsü. (16) lib/marketplace/digitalAssets.ts — dijital asset kataloğu.',
  },

  {
    id: 'open-crm-tier-s',
    title: 'Likya Open-CRM (Twenty) + Agent Tier Router',
    icon: '📇',
    keywords: ['crm', 'twenty', 'müşteri', 'üye', 'rezervasyon geçmişi', 'harcama', 'sponsor temas', 'tier s', 'tier b', 'tier c', 'ajan yönlendirme', 'yönlendirme matrisi'],
    content:
      'lib/crm/twentyCrmBridge.ts — Twenty CRM uyumlu open-CRM adaptörü: üye profilleri (vip/aktif/misafir), rezervasyon geçmişi, harcama alışkanlıkları ve sponsor temas noktaları; getMemberProfile LTV/tier hesaplar, logSponsorTouchpoint temas kaydeder. lib/ai/agentTierRouter.ts — Tier-S ajan yönlendirme matrisi: görev skorlaması (Tier S: otonom icra→Cline, Tier B: içerik→Ajans/CMO, Tier C: bilgi→RAG/Gemini), routeTask deterministik güven 0.4-0.97. components/CrmCustomerCard.tsx — koyu neon müşteri kartı (dept view): durum rozeti, üyelik tier, harcama/rezervasyon metrikleri, geçmiş aktiviteler, sponsor temas uyarısı.',
  },

  {
    id: 'lifeos-executive',
    title: 'LifeOS Executive Context & Trajectory Engine',
    icon: '🧬',
    keywords: ['lifeos', 'executive context', 'bağlam', 'habit', 'deep work', 'travel', 'vip relationships', 'trajectory', 'hedef', 'cadence'],
    content:
      'lib/lifeos/executiveContextEngine.ts — LifeOS Modeli: CEO günlük ritmi (routine/cadence), stratejik hedefler (trajectory: hedef, faz, kilometre taşları, odak %), kampüs seyahatleri ve VIP ilişkileri tek bağlam nesnesinde (JSON/LocalStorage likya_lifeos_context_v1); updateGoal/addTravel kalıcı güncelleme. lib/lifeos/contextPromptBuilder.ts — bağlam sarmalayıcı: wrapWithContext() kullanıcı mesajına bağlamı enjekte eder, buildContextualSystemPrompt sistem promptuna ekler. components/ExecutiveLifeOSCard.tsx — 5 sekmeli koyu neon LifeOS HUD (Habits 🔥 / Travel ✈️ / Deep Work 🧠 / VIP Relations 🤝 / App Builder 🧩); CEO Chat üstünde render edilir; handleSend komutları LifeOS bağlamıyla Gemini veya Ollama aracılığıyla otomatik sarılır.',
  },

  {
    id: 'bolt-freellm-poketoken-ledger',
    title: 'Bolt Engine, Free LLM Şelalesi, PokeToken ve PayPal Ledger',
    icon: '⚡',
    keywords: ['bolt', 'mini-app', 'groq', 'cohere', 'openrouter free', 'free llm', 'token', 'oyunlaştırma', 'ledger', 'paypal', 'fraud', 'çift girişli'],
    content:
      'lib/ai/boltAppEngine.ts — bolt.diy mini-app motoru: "Bana X uygulamasını kodla" talebinden 6 tür (dashboard/form/list/market/booking/scoreboard) React bileşen kodu + önizleme üretir. lib/ai/freeLlmProviders.ts — Groq (Llama-3 70B) + Cohere + OpenRouter-free katmanları; freeLlmWaterfall kotalar dolduğunda kesintisiz geçiş yapar. components/PokeTokenTracker.tsx — oyunlaştırılmış token rozeti: günlük harcama, bütçe, XP/seviye (🥉→👑) localStorage kalıcılığı; CEO Chat üstünde render edilir. lib/finance/paypalLedgerEngine.ts — PayPal prensipli çift girişli ledger (postDoubleEntry borç+alacak çifti) + fraud tespiti (50K₺ üstü işlem, 100K₺ günlük anormallik).',
  },

  {
    id: 'base44-zerotrust',
    title: 'Base44 Instant App Builder + Zero-Trust 30 Katman Kalkanı',
    icon: '🚀',
    keywords: ['base44', 'replit', 'app builder', 'instant app', 'zero trust', 'owasp', 'sqli', 'xss', 'csrf', 'session hijacking', 'api key', 'güvenlik'],
    content:
      'lib/ai/base44AppEngine.ts — Base44/Replit uyumlu otonom app motoru: doğal dil fikir → JSON şema (AppSchemaField), auth kuralları (roles/permission/sessionTtl) ve canlı React UI kodu; 6 tür (dashboard/market/booking/form/crm/scoreboard), /tmp sandbox çalıştırılabilir. lib/security/zeroTrustShield.ts — 30 katmanlı Zero-Trust kalkanı: SQLi sanitize (7 kalıp), XSS payload temizliği (8 kalıp), API anahtar sızıntı engeli (redact), session hijacking flag + CSRF token kontrolü; TÜM kontroller sessiz/fail-safe. components/SecurityAppBuilderCard.tsx — 2 sekmeli neon HUD (Instant App Generator + Shield Live Monitor); security view içinde; CEO Chat handleSend girdileri sanitizeInput ile otomatik süzülür.',
  },

  {
    id: 'sports-vision-memory-pack',
    title: 'Sports Vision Radar, Mem0 Hafıza, Gotify Push ve PHV Müfredatı',
    icon: '👁️',
    keywords: ['sports vision', 'hız radarı', 'km/h', 'reaksiyon', 'mem0', 'uzun süreli hafıza', 'gotify', 'daze-reminder', 'phv', 'müfredat', 'basketball ready 360', '150 ajan'],
    content:
      'lib/vision/sportsVisionRadar.ts — Computer Vision stub: top hızı km/h, oyuncu reaksiyon ms, araç giriş/çıkış olayları (simüle + analiz). lib/ai/mem0LongTermMemory.ts — Mem0 mimarisi: üye tercihleri, antrenman geçmişi, Daze Chef ikram alışkanlıkları; localStorage kalıcı; memoryContextForMember AI promptuna bağlam verir. lib/notifications/gotifyPushBridge.ts — Daze-Reminder: 120s sipariş hazır + kort saati WebSocket push (Gotify token yoksa simülasyon). lib/sports/phvAthleticCurriculum.ts — Basketball Ready 360/OTA: 6-16 yaş PHV evresi (pre/phv/post) tespiti + drill planlama. lib/ai/agentCatalog.ts — 150 ajanlık sektörel katalog (15 sektör × 10 uzman). components/SportsVisionMemoryCard.tsx — 3 sekmeli HUD (Speed Radar / Long-Term Memory / Gotify Push); sportvision view içinde.',
  },

  {
    id: 'extreme-sim-hud',
    title: 'Ekstrem Spor Simülatörleri + App Builder + Zero-Trust HUD',
    icon: '🎿',
    keywords: ['dry-ski', 'sentetik kayak', 'rowing', 'kürek havuzu', 'wave pool', 'dalga havuzu', 'simülatör', 'base44', 'app builder', 'zero trust', 'owasp'],
    content:
      'lib/simulators/extremeSportsSimulator.ts — Dry-Ski, Indoor Rowing, Wave Pool ve Wind Tunnel (Dikey Rüzgar Tüneli) üniteleri: ekipman durumu, kapasite, saatlik ücret, güvenlik skoru; simulateSession tür bazlı metrikler (pist eğimi/split/şut gücü/dalga boyu) + performans skoru üretir. base44AppEngine.ts ve zeroTrustShield.ts önceki turlardan korunur (metin prompt → JSON şema + React UI; SQLi/XSS/CSRF/API key filtreleri). components/ExtremeSimulatorSecurityCard.tsx — 3 sekmeli neon HUD (🎿 Extreme Sports & Dry-Ski / 🚀 App Builder / 🛡️ Security); 3D Park Twin (twin) view içinde render edilir.',
  },

  {
    id: 'finance-pm-hooks-vault',
    title: 'Gemini 9-Adım Finans, Agile PM, 60 Viral Hook ve Vault Dizinleri',
    icon: '💰',
    keywords: ['gemini finance', 'fatura', 'vade', 'mutabakat', 'nakit akışı', 'laba', 'agile pm', 'darboğaz', 'viral hook', '60 hook', 'eğitim platformu', 'gelir modeli'],
    content:
      'lib/finance/geminiFinanceAutomator.ts — 9 adımlı finans otomasyonu: fatura okuma (OCR stub), vade takibi, POS-kasa mutabakatı, 7 günlük nakit akışı tahmini; Daze nezaket filtresi tüm hatırlatıcı metinlerde zorunludur (applyPoliteFilter). lib/pm/agileContextEngine.ts — Laba blueprint: toplantı metni → aksiyon maddeleri + takvim görevleri + darboğaz analizi (nazik ton). lib/marketing/hookLibrary60.ts — 60 viral hook (6 kategori × 10) + buildSocialContent yapılandırıcı. lib/vault/aiLearningDirectory.ts — 20 ücretsiz AI eğitim platformu + 50 gelir modeli aranabilir dizin. components/FinancePmDashboardCard.tsx — 3 sekmeli neon HUD (💰 Finance Workflow / 📊 Agile PM / 🎣 Viral Hooks); finance view içinde.',
  },

  {
    id: 'airllm-agentmatrix-safety',
    title: 'AirLLM 70B Katmanlı Motor + Claude Agent Matrix + AI Safety Guardrails',
    icon: '🦙',
    keywords: ['airllm', '70b', 'katman', 'vram', '4gb gpu', 'claude', 'agent matrix', 'skills', 'hooks', 'subagents', 'mcp', 'prompt injection', 'jailbreak', 'rate limit', 'verification', 'json validation'],
    content:
      'lib/ai/airLlmReserveEngine.ts — AirLLM 70B katmanlı çıkarım: 80 katman × 48MB ≈ 3.75GB VRAM ile 4GB GPU üzerinde 70B model simülasyonu; offline yedek, Plan Z güvenli. lib/ai/agentMatrixConfig.ts — Claude uyumlu matris: .md standing briefs (DazeStyleRules.md öncelik 100), Skills (çağrılabilir iş akışı), Hooks (otomatik olay), Subagents (4 uzman), MCP bağlayıcılar. lib/security/aiSafetyGuardrails.ts — prompt injection sanitize, jailbreak kalkanı, rate limit (30/dk), verification loop, Zod/Pydantic benzeri JSON şema doğrulama; TÜM kontroller sessiz/fail-safe. apps/admin/DazeStyleRules.md — nezaket filtresi master kural dosyası. components/AgentMatrixSafetyCard.tsx — 3 sekmeli neon HUD (🧩 Matrix / 🦙 AirLLM / 🛡️ Safety); AI view içinde.',
  },

  {
    id: 'mcp-a2a-546-seo',
    title: 'MCP×A2A Hibrit Orkestratör, 546 Oto Görev ve SEO/AEO Pipeline',
    icon: '🔌',
    keywords: ['mcp', 'a2a', 'protokol', 'orkestrasyon', '546 görev', 'otomasyon', 'seo', 'aeo', 'keyword', 'n8n', 'dataforseo', 'ai bot görünürlük'],
    content:
      'lib/ai/mcpA2aOrchestrator.ts — MCP (5 dış sistem aracı) × A2A (4 uzman ajan) hibrit yönlendirme: routeHybrid görevi dış sistem (MCP) veya ajan delegasyonu (A2A) olarak sınıflandırır. lib/ops/automatedTasks546.ts — 546 otomatik iş görevi: 5 süreç (operasyon/finans/İK/satış/destek) × 10 şablon × 10 varyant + 46 özel; kadans ve aktiflik bayrakları. lib/marketing/seoKeywordPipeline.ts — n8n/DataForSEO mantığı SEO/AEO keyword dizini: arama hacmi, zorluk, AEO skoru (AI bot görünürlük), intent; buildContentPlan FAQPage+HowTo+LocalBusiness şema. components/McpA2aOpsCard.tsx — 3 sekmeli neon HUD (🔌 MCP vs A2A / ⚙️ 546 Tasks / 🚀 SEO/AEO); Tools & Agents view içinde.',
  },

  {
    id: 'research-sports-safety',
    title: 'Multi-Agent Research, Claude Sports Manager ve Ekipman Güvenlik Denetçisi',
    icon: '📊',
    keywords: ['multi-agent research', 'araştırma ajanı', 'koordinatör', 'web search', 'document analyzer', 'synthesis', 'sports manager', 'antrenman', 'scouting', 'maç raporu', 'safety audit', 'sentinel bilet', 'ekipman güvenliği'],
    content:
      'lib/ai/multiAgentResearch.ts — Multi-Agent Research System: Coordinator komutasında Web Search, Document Analyzer, Synthesis ve Reporting ajanları paralel çalışır; runResearch 5 ajanlı rapor üretir. lib/sports/claudeSportsManager.ts — Otonom Kulüp Direktörü: padel/tenis/basketbol/su-sporları için antrenman planı, performans özeti, scouting ve maç raporu. lib/simulators/facilitySafetyAudit.ts — Ekipman Güvenlik Denetçisi: tesis/kort/oyun ekipmanlarını standartlara (EN/FIBA/ITF/TSE) göre denetler, kritik durumda Sentinel bakım servisine otomatik bilet açar. components/MultiAgentSportsCard.tsx — 3 sekmeli neon HUD (📊 Research / 🎾 Sports Manager / 🛡️ Safety Checklist); Spor Vizyon (sportvision) view içinde.',
  },

  {
    id: 'hermes-omni-ollama',
    title: 'Hermes Agentic OS + OmniRoute Free Pool + Yerel Ollama',
    icon: '🤖',
    keywords: ['hermes', 'agentic os', 'kanban', 'skill', 'function calling', 'omni route', 'free model', 'openrouter', 'ollama', 'yerel', 'qwen', 'deepseek r1', 'fallback'],
    content:
      'lib/ai/localOllamaAdapter.ts — yerel Ollama (127.0.0.1:11434): checkOllamaHealth online/offline, callLocalOllama (qwen2.5-coder:7b, deepseek-r1:8b, llama3.2:3b), routeWithOllamaFallback cloud düşünce otomatik yerel motora geçer (Plan Z güvenli). lib/ai/hermesAgentEngine.ts — Hermes Agentic OS: Kanban görev listesi, skills (Function Calling), decomposeInstruction talimatı alt adımlara böler, runHermesLoop otonom döngü (skill + Ollama/Plan A fallback). lib/ai/openRouterAdapter.ts — OmniRoute Free Pool: 4 :free model (Llama 3.3 70B, DeepSeek R1, Gemini 2.0 Flash, Qwen Coder 32B), freeModelFromPrompt deterministik seçim. modelMatrix Plan E artık free havuzdan model seçer; /api/ceo/health localLlm.ollama + freePool durumu raporlar.',
  },

  {
    id: 'booking-validator-specialists',
    title: '7/24 Booking Ajanı, Level-5 Validator Döngüsü ve Uzman Ajan Ağı',
    icon: '🏨',
    keywords: ['rezervasyon', 'booking agent', 'karavan', 'glamping', 'padel', 'tenis', 'gece kuyruğu', 'level 5', 'validator', 'generator', 'retry', 'specialist', 'support', 'scouting', 'ops sentinel', 'agency agents'],
    content:
      'lib/ai/bookingAgent.ts — 7/24 otonom rezervasyon ajanı: parseBookingRequest tarih/kişi/alan ayrıştırır, checkAvailability slot sorgular, createBooking gece (22:00-08:00) taleplerini kuyruğa alır (sabah onayı) veya anlık rezervasyon oluşturur; Daze nezaket filtresi. lib/ai/autonomousValidator.ts — Level-5 doğrulama döngüsü: Generator→Validator (4 kural: boş/kısa/parantez dengesi/JSON)→Retry Loop (autoFix, max 2 retry); 6 Levels of Agentic AI standardı. lib/ai/specialistAgents.ts — Agency-Agents uzman rol dağılımı: SupportAgent, BookingAgent (createBooking köprüsü), ScoutingAgent, OpsSentinel; routeToSpecialist keyword ile görevi uzman ajana yönlendirir.',
  },

  {
    id: 'llm-stack-claude-templates',
    title: 'LLM Stack Standartları (MCP/Guardrail/Memory) + Claude Code Ajan Şablonları',
    icon: '🧱',
    keywords: ['llm stack', 'mcp', 'tool access', 'guardrail', 'daze üslup', 'context window', 'memory', 'claude code', 'agent template', 'frontend architect', 'backend db', 'qa reviewer', 'ops sentinel'],
    content:
      'lib/ai/llmStackConfig.ts — LLM Stack standartları: (1) MCP Tool Registry (vault/booking/finance/sentinel/database araçları + canAccessTool erişim kontrolü), (2) Daze Guardrail (kaba kalıp temizleme + "Lütfen" nezaket kuralı), (3) ContextWindowManager (max-token trim + sistem prompt + oturum bağlamı). lib/ai/agentTemplates.ts — Claude Code ajan rol şablonları: Frontend Architect (React/Tailwind), Backend & DB Engineer (Supabase/API), QA & Code Reviewer (tsc/parantez), Operations Sentinel (IoT/enerji); templateForTask keyword yönlendirme + runWithTemplate deterministik üretim; Hermes OS ve PraisonAI uyumlu.',
  },

  {
    id: 'holmes-strix-sentinel',
    title: 'Holmes RCA + Strix Güvenlik Tarayıcı + Daze Sentinel HUD',
    icon: '🔍',
    keywords: ['holmes', 'root cause', 'rca', 'sre', 'diagnostic', '500', 'timeout', 'db fail', 'strix', 'snyk', 'anahtar tarama', 'next_public', 'auto remediate', 'sentinel hud', 'monitoring'],
    content:
      'lib/ops/holmesDiagnosticEngine.ts — HolmesGPT mantığı RCA: classifyIncident 500/timeout/db-fail/memory/api-key kalıplarını tanır, diagnose kök neden + çözüm + severity + autoRemediable döner; autoRemediate SRE kuralıyla otomatik iyileştirme emüle eder; scanHealthLogs /api/health + log besler. lib/security/strixSecurityAudit.ts — Snyk yaklaşımı: API key (AIza/sk-), JWT, private key, hardcoded NEXT_PUBLIC_ kalıplarını tarar, runStrixAudit skor üretir. components/DazeSentinelHud.tsx — MonitoringPanel (monitor view) ile birlikte: AI Olay İnceleme (RCA) + Tek Tıkla Auto-Remediate + Strix anahtar tarama özeti.',
  },

  {
    id: 'phase2-data-bridges',
    title: 'Faz 2 Veri Köprüleri — Booking Writer, Daze Chef POS, Kiralama Motoru',
    icon: '🏨',
    keywords: ['booking writer', 'rezervasyon yazma', 'parcels', 'sports_facilities', 'try_before_buy_bookings', 'pos_transactions', 'upcycling_items', 'sales_commissions', 'referans kodu', 'fiş', 'daze chef pos', 'kiralama', 'tbyb', 'insert live row'],
    content:
      'Faz 2 canlı veri köprüleri (supabaseClient.ts\'e insertLiveRow/updateLiveRow eklendi): lib/ops/bookingWriter.ts — CEO Chat/BookingAgent rezervasyonlarını parcels/sports_facilities/TBYB tablolarına yazar, generateReferenceCode dinamik referans + confirmationCard onay kartı üretir. lib/ops/dazeChefPosBridge.ts — mutfak siparişlerini pos_transactions/upcycling_items kaydeder, kitchenReceiptDisplay 120s sayacı için fiş formatı üretir. lib/marketplace/rentalTransactionEngine.ts — "Hemen Kirala"/"Test Et (TBYB)" işlemlerini try_before_buy_bookings + sales_commissions (%10) işler. Tümü supabaseEnvReady() kontrolüyle env yoksa localStorage mock fallback (asla çökme).',
  },

  {
    id: 'sports-ams',
    title: 'Bütünleşik Spor & Akademi Yönetim Motoru — Otonom Karne + Servis Radarı + ACWR',
    icon: '📊',
    keywords: ['karnesi', 'gelişim karnesi', 'otonom', 'acwr', 'catapult', 'yük', 'efor', 'servis', 'radar', 'gps', 'eta', 'turnike', 'güvenlik', 'yoklama', 'red flag', 'sakatlık', 'shuttle', 'spor akademik'],
    content:
      'lib/sports/autonomousReportCard.ts — SportVisionX telemetrisinden (vuruş hızı/isabet/CatchPad ms/yorgunluk) otomatik branş bazlı gelişim karnesi: 5 yıldız, ACWR (akut:kronik yük oranı, >1.5 kırmızı bayrak), Catapult AU haftalık yük indeksi + 4 haftalık trend. redFlagScan (sakatlık risk radarı), buildAttendanceList (BLE band ile otomatik toplu yoklama). lib/ops/facilityShuttleRadar.ts — servis GPS rota simülasyonu (6 durak, ETA), recordGateEntry → "Efe 14:02 itibarıyla Pazu Bandı ile Ana Turnike üzerinden Giriş Yaptı" güvenlik bildirimi (smartArmbandEngine entegre), olay günlüğü. UI: ExtremeSCustomerPortal "Canlı Gelişim Karnem" (yıldız + telemetri grid + Catapult efor barı) + "Kulüp İçi Radar & Servis" (servis konumu/ETA + turnike geçiş geçmişi); DazeCrewView "Antrenör Paneli" (tek tık yoklama + red flag). Smoke test: scripts/sportsAmsSmokeTest.mts (10/10).',
  },

  {
    id: 'armband-sportvision',
    title: 'Akıllı Pazu Bandı (NFC/BLE) + SportVisionX Biyometrik Koçluk Köprüsü',
    icon: '⌚',
    keywords: ['pazu bandı', 'armband', 'nfc', 'rfid', 'ble beacon', 'depozito', '500', 'turnike', 'kantin', 'pos', 'veli onayı', 'sportvision', 'koçluk', 'telemetri', 'yoklama', 'catchpad', 'yorgunluk'],
    content:
      'lib/hardware/smartArmbandEngine.ts — ArmbandDevice şeması (nfcTagId + bleUuid + assignedUserId + ownerFamilyId + status ACTIVE/RETURNED/LOST + depositAmount 500₺). assignBandToMember (depozito kaydı), processReturn (₺500 iade), reportLost (anında kilitle + irat), onTapAccess (kapı/turnike NFC), posSwipeCanteen (kantin POS: çocuk >150₺ harcamada parentalApprovalEngine tetikler). lib/sports/armbandCoachingBridge.ts — matchPlayerToBeacon (kamera BBox ↔ BLE eşleşmesi, kimlik karışıklığı sıfır), startCourtSession (kort girişinde otomatik yoklama + seans), recordTelemetry (kol ivmesi/salınım/şut/yorgunluk eşiği/CatchPad ms), recordCoaching (antrenör sahada aktif süre + sporcu başına ilgilenme), buildDailyPerformance (günün karnesi: şut/isabet/kalori/antrenör notu). Mock-first: donanım yoksa deterministik simülasyon. ExtremeSCustomerPortal — "Akıllı Pazu Bantlarım" kartı (kilitle/iade/yeni bant + turnike + POS testleri) + "Günün Antrenman Performansı" (otomatik karne + koç modu). SportVisionX — yeni ⌚ Pazu Bandı sekmesi: canlı telemetri grid, BBox↔BLE eşleştirici, resepsiyon "Teslim Al & İade Et" butonu, yorgunluk radarı. Smoke test: scripts/armbandSmokeTest.mts (12/12).',
  },

  {
    id: 'extremes-superapp',
    title: 'ExtremeS Global Spor Süper-Uygulaması — Pass/Stay/Market/Maç',
    icon: '🚀',
    keywords: ['extremes', 'superapp', 'süper uygulama', 'likya pass', 'qr', 'matchmaking', 'maç bulucu', 'seviye', 'streak', 'glamping', 'stay', 'market', 'korta teslimat', 'daze cafe', 'stories'],
    content:
      'lib/security/likyaPassEngine.ts — 30 saniyede yenilenen dinamik QR bilet (gate/kort-ışık/locker/facility), token doğrulama + anti-screenshot overlay. lib/sports/matchmakingEngine.ts — Level 1.0-5.0 + XP/tier (Bronz/Gümüş/Altın) + streak; açık padel/tenis maç havuzu (3/4 Katıl) + akıllı eşleşme radarı. lib/ops/extremeHoldingRoutes.ts — Likya Stay (glamping/bungalov/lounge rezerv), Likya Market (raket/top/besin korta teslimat), Daze Mind Cafe (120s sipariş → Event Bus). /extremes page — süper-app shell: üst bar (seri/XP/Likya Pass QR modal), stories şeridi, 4 eylem kartı, 5 tab alt nav (Ana Sayfa/Oyna/QR Pass/Pazar & Stay/Profil).',
  },

  {
    id: 'nvidia-nim-primary',
    title: 'NVIDIA NIM DGX Cloud — OmniRoute 1. Öncelikli Motor',
    icon: '⚡',
    keywords: ['nvidia', 'nim', 'dgx', 'cloud', 'omni route', '1. hat', 'primary', 'llama 70b', 'nemotron', 'integrate.api.nvidia.com'],
    content:
      'lib/ai/nvidiaNimAdapter.ts — OpenAI uyumlu NVIDIA NIM adaptörü: base https://integrate.api.nvidia.com/v1 (server-only), anahtar process.env.NVIDIA_API_KEY, model meta/llama-3.3-70b-instruct (fallback nvidia/nemotron-3-ultra); nvidiaNimChat + testNvidiaNimConnection (canlı bağlantı + latency) + mock-first fallback + nvidiaNimStatus. modelMatrix.ts (OmniRoute): buildCodePlans/buildResearchPlans başına Plan N (⚡ NVIDIA NIM) 1. hat eklendi — anahtar varsa tüm sorgular önce DGX Cloud hattına gider, ulaşılamazsa/kota aşımında otomatik Gemini/DeepSeek/fallbacke düşer. Health /api/v1/ceo/health aiPlanStatus: Plan N NVIDIA (1. hat) gösterir. ExecutiveSimplifiedHud Patron Paneli: ⚡ NVIDIA NIM rozeti (Aktif/standby).',
  },

  {
    id: 'extremes-brand',
    title: 'ExtremeS Müşteri Portalı + 4 Sütunlu Patron Paneli (Marka Konumlandırma)',
    icon: '⚡',
    keywords: ['extremes', 'marka', 'brand', 'müşteri portalı', 'super app', 'süper uygulama', 'patron paneli', 'sadeleştirilmiş', '4 sütun', 'daze mind', 'd d yazılım', 'customer portal'],
    content:
      'Marka kimliği: Şirket D&D Yazılım Gıda Perakende Ltd. Şti. • Mekan Daze Mind • Beyin Daze Hub • Personel Daze Crew • Mutfak Daze Chef • Müşteri ekranı & mobil süper uygulama EXTREMES. components/ExtremeSCustomerPortal.tsx — modern koyu/açık kart mimarili portal: üst bar (ExtremeS logosu + maskeli token kart + Aile %15-30 rozeti), hızlı kort/padel/özel antrenman rezervasyonu, 365 gün ders kredisi cüzdanı (kullan/özel 3→1/kardeşe devret), ebeveyn onaylı çocuk harcama denetimi (mikro/makro + bloke + onayda e-fiş), 10x referans barı (EXTREMES- kodu + WhatsApp + VIP ilerleme çubuğu). components/ExecutiveSimplifiedHud.tsx — patron için 4 sütunlu yalın panel: Nakit & Finans, Tesis Nabzı (YOLOv11 doluluk), Onay Kuyruğu, Hızlı Aksiyonlar (yangın tatbikatı / gece raporu / acil kilit). CEOCommandCenter varsayılan görünümü "exec", sidebar başına ExtremeS + Patron modülleri.',
  },

  {
    id: 'club-finance-ecosystem',
    title: 'Aile Kademeli İndirim + 10x Viral Referans + 365 Gün Ders Kredisi + Ebeveyn Onay',
    icon: '👨‍👩‍👧‍👦',
    keywords: ['aile', 'family', 'kademeli indirim', 'referans', 'viral', '10x', 'davet', 'whatsapp', 'ders kredisi', 'telafi', 'credit vault', 'kardeş transfer', 'ebeveyn onay', 'parental', 'mikro limit', 'makro limit', 'mail order', 'otomatik çekim'],
    content:
      'lib/finance/familyMembershipEngine.ts — aile kademeli indirim (%0/%15/%25/%30 → 1-4+ birey) + tek ekstre/ortak kart; 10x viral referans (1-3 üye %15, 4-7 üye %25 + 500 TL LikyaPay, 8-10 üye %100 VIP) + çift taraflı teşvik (davet edilen ilk ay %10) + referralCode (VELI_...) + WhatsApp davet linki (likya.app/join?ref). lib/sports/lessonCreditVault.ts — 365 gün yanmayan LessonCredit (katılınmayan ders → kredi), telafi rezervasyonu (grup 1 kredi / özel 3→1), kardeşler arası transfer, otomatik kontenjan dolumu. lib/finance/parentalApprovalEngine.ts — iki kademeli: mikro ≤150 TL otomatik çekim + anlık bildirim; makro >150 TL PENDING_PARENT_APPROVAL + bloke + veli onayında karttan çekim + dijital e-fiş. components/FamilyFinanceDashboardCards.tsx — holistic görünümünde veli paneli (Ailem & Kartım, Ders Kredilerim, Davet Et, Ebeveyn Onay demosu).',
  },

  {
    id: 'sports-iot-gesture-swarm-b2b',
    title: 'CatchPad IoT + Temassız Jest + Swarm AI + Gropector B2B',
    icon: '🎯',
    keywords: ['catchpad', 'iot', 'pod', 'reaksiyon', 'tripod', 'hooper pov', 'şut', 'jest', 'gesture', 'temassız', 'swarm', 'sürü', 'token', 'caveman', 'rtk', 'gropector', 'b2b', 'pitch', 'radar'],
    content:
      'lib/sports/catchPadReactionEngine.ts — 6\'lı CatchPad pod matrisi (Bluetooth eşleşme, ms reaksiyon, isabet %) + Hooper POV tripod modu (tek kameradan pota/oyuncu açısı → şut sayısı + %). lib/security/gestureControlEngine.ts — MediaPipe Hands şema uyumlu 3 temassız jest: Swipe_Left_Right (ekran geçişi), Pinch_Select (onay), Open_Palm_Stop (duraklat) + touchless_mode bayrağı (mock-first). lib/ai/swarmOrchestratorEngine.ts — MiroFish/BettaFish tarzı sürü koordinatörü (görev → paralel mikro-ajanlar) + RTK/Caveman prompt sıkıştırıcı (%40+ token tasarrufu) + OpenAI uyumlu Base URL yönlendirici. lib/ops/gropectorB2BRadar.ts — Google Maps/Gemini uyumlu harita radarı (web/spor altyapı eksik tespiti + leads skoru) + tek tıkla kişiselleştirilmiş B2B pitch + kampanya. UI: CatchPadReactionCard (SportVisionX), GrowthRadarSwarmCard (monitor görünümü).',
  },

  {
    id: 'advanced-100-master',
    title: '100 Aşamalık İleri Teknik İcra — 8 Yeni Motor + Kurumsal Hub',
    icon: '🏗️',
    keywords: ['footfall', 'kişi sayım', 'doluluk', 'öfke', 'uyum engeli', 'gamification', 'pomodoro', 'aidat', 'yoklama', 'back-office', '200 sistem', 'sesli komut', 'voiceprint', 'mutfak qc', 'load lift roll hold'],
    content:
      'İleri 100 aşama — 8 yeni motor: lib/security/footfallCounterEngine.ts (LineZone IN/OUT + net doluluk + %85 → market maker talep sinyali), pedagogicalCoachEngine eklentileri (3 adım öfke protokolü + 5 uyum engeli matrisi), lib/coaching/curiosityGamificationEngine.ts (25/5 Pomodoro + 10dk ilk adım + %1 zihniyet + seviye/puan + 2dk mola + haftalık skor + mental indeks), lib/sports/membershipDuesEngine.ts (aidat tahakkuk + kardeş/burs indirimi + QR yoklama + katılım % + uyarı rozeti + otomatik çekim + bilanço), lib/ops/backOffice200Engine.ts (20 iş alanı health + 5li huni + onay kuyruğu + lead/sales/HR/inventory/support/data), lib/ai/voiceCommandEngine.ts (4 sesli intent + paralel ajan kuyruğu + ses→mutfak stok + duygu skoru + voiceprint + lockdown), lib/ops/kitchenQualitySimulator.ts (konveyör sayım + QC damga + hatalı tabak uyarısı), lib/sports/shootingReleaseAnalytics.ts (Load→Lift→Roll→Hold puanlama). components/AdvancedEnterpriseModules.tsx — monitor görünümünde kurumsal hub.',
  },

  {
    id: 'builtin-template-store',
    title: '5 Ücretsiz Yerleşik Otomasyon Şablon Mağazası + Tek Tıkla Deploy',
    icon: '📦',
    keywords: ['şablon', 'template', 'mağaza', 'store', 'builtin', 'free', 'deploy', 'tek tıkla', 'social lead', 'voice to task', 'doc rag', 'digest', 'churn'],
    content:
      'lib/ops/dazeBuiltinTemplates.ts — 5 yerleşik ücretsiz otomasyon şablonu (dış bağımlılık yok, mock-first): SocialLeadConverter (yorum→DM→CRM), VoiceToTaskOrchestrator (ses→staff_tasks/mutfak eksik), DocRagContractAssistant (tüzük→pgvector→7/24 RAG), DailyExecutiveDigest (23:59 CEO Markdown bülteni), ChurnRecoveryGift (14 gün→Daze-Gift QR+davet). getBuiltinTemplates() katalog + getBuiltinTemplate(id) + deployTemplateToN8n(templateId) → /api/v1/n8n/proxy/workflows üzerinden oluştur + aktifleştir (n8n env yoksa mock-first). n8nAutonomousGenerator.ts köprü re-export uyumu. components/BuiltinTemplateStoreCard.tsx — monitor görünümünde 5 kart + "İş Akışını Otonom Başlat" + CANLI/MOCK rozeti.',
  },

  {
    id: 'supervision-zones-nvidia',
    title: 'Roboflow Supervision Bölge/Çizgi Sayımı + NVIDIA 10x Direct-Box Çıkarım',
    icon: '📐',
    keywords: ['roboflow', 'supervision', 'polygon zone', 'line zone', 'heatmap', 'ısı haritası', 'nvidia', 'one-shot', 'direct-box', 'kuşbakışı', 'aerial', 'tensorrt'],
    content:
      'lib/security/supervisionZonesEngine.ts — Python supervision uyarlaması: PolygonZone (ray-casting nokta-içi kontrol, aktif sayı + yoğunluk oranı + alan/centroid), LineZone (çizgi kenarı In/Out tespiti + anlık tetikleme kaydı), DetectionsHeatmap (grid tabanlı termal yoğunluk + heatColor skala). lib/security/nvidiaFastInferenceBridge.ts — NVIDIA 10x one-shot Direct-Box: <5ms latency simülasyonu, sporcu/misafir koordinatlarını anında bbox\'a çevirir, aerialPlayerGrid (6x4 kuşbakışı grid), broadcastFastDetections (Event Bus). components/SupervisionZoneOverlay.tsx — Polygon bölge + kamera bbox + LineZone IN/OUT + termal heatmap + kuşbakışı grid; monitor (DazeSentinelHud yanı) + SportVisionX görünümlerine bağlı.',
  },

  {
    id: 'life-coach-pedagogy',
    title: 'Daze Vision Yaşam Koçu — Pedagojik Reçeteler + Gen-Z Sözlüğü + Akademi',
    icon: '🩺',
    keywords: ['yaşam koçu', 'pedagoji', 'mental', 'reçete', 'kriz', 'empati', 'gen-z', 'genz', 'slay', 'vibe', 'ghostlamak', 'cringe', 'eş anlamlı', 'lgs', 'yks', 'akademi', 'sınır', 'hayır'],
    content:
      'lib/coaching/pedagogicalCoachEngine.ts — FailureAnxietyPrescription (hata korkusu/yetersizlik/yalnız hallederim → süreç ve emek odaklı 3 reçete + günlük onay), CrisisManagementProtocol (8 adımlı kriz yatıştırma: "Seni dinliyorum", "Hissettiğin şeyi fark ediyorum" — öğüt yok), BoundaryAssertivenessGuide (7 davranış matrisi + hayır diyememe güçlendirme). lib/ai/dazeGenZDictionary.ts — 12 Gen-Z terimi (Vibe/Aura/Slay/NPC/Ghostlamak/Hypelamak/Cringe/Love Bombing/GOAT/Delulu) tone-aware + master üslup enjektörü (centilmen/naif/esprili). lib/coaching/academicLexiconEngine.ts — 16 eş anlamlı çift (Biçim-Şekil, Eser-Yapıt, Özgün-Orijinal, Müellif-Yazar) + 4 soruluk LGS/YKS mikro test. components/LifeCoachDashboardCards.tsx — holistic görünümünde Günün Reçetesi + 8 adım kriz + Gençlik Dili Tercümanı + Eş Anlamlı Pratik kartları.',
  },

  {
    id: 'fire-detection-evacuation',
    title: 'Erken Yangın/Alev Tespit Motoru + Otomatik Tahliye Protokolü',
    icon: '🔥',
    keywords: ['yangın', 'alev', 'fire', 'flame', 'yolo', 'openviewer', 'tahliye', 'evacuation', 'emergency', 'kapı', 'EMERGENCY_OPEN', 'tatbikat', 'fire drill'],
    content:
      'lib/security/fireDetectionEngine.ts — OpenViewer/YOLO tabanlı alev tespiti: detectFire(frameData) → bbox + confidence (≥0.65) + konum (Mutfak/Glamping/Otopark/Kort/Depo); doğrulamada FIRE_EMERGENCY_TRIGGERED olayı Daze Hub Event Bus hattına fırlatılır (yeni event tipi + fireEmergencyTriggered emitter eklendi). simulateFireFrame (none/smoke/blaze) + lastFireEvent. lib/security/emergencyEvacuationOrchestrator.ts — tek transaction tahliye: anprGateAccessBridge.emergencyUnlockAllGates (4 kapı EMERGENCY_OPEN), staffTaskDispatched (yangın söndürme/tahliye görevi), notificationEngine (CEO + güvenlik şefi kritik alarm). SentinelVisionGrid içine 🔥 SANAL YANGIN TATBİKATI butonu + alev bbox görseli + tahliye adım kartı eklendi (monitor view).',
  },

  {
    id: 'n8n-orchestrator',
    title: 'Otonom n8n Orchestrator — Workflow Üretici + 9 Adımlı Ajan Döngüsü',
    icon: '⚡',
    keywords: ['n8n', 'workflow', 'orchestrator', 'fire', 'yangın', 'conveyor', 'konveyör', 'reminder', 'master styling', 'agentic loop', '9 adım', 'plan act verify', 'webhook'],
    content:
      'lib/ops/n8nAutonomousGenerator.ts — n8n Workflow JSON derleyicisi (Trigger→IF→Action): FireEmergencyWorkflow (Görsel 76: yangın→PWA+itfaiye+kapı kilidi), QualityControlConveyorWorkflow (Görsel 77: sayım→damga→stok düşüm), DazeReminderPeriodicWorkflow (Cron */2: gecikme→WhatsApp Cloud), MasterStylingFilterNode (centilmen/naif/esprili üslup). Deterministik node id + validateN8nWorkflow bütünlük kontrolü. lib/ops/n8nApiClient.ts — REST istemci: createWorkflow/activateWorkflow/triggerWebhook; API anahtarı yoksa yerel mock kuyruk (localStorage) + başarı simülasyonu. lib/agents/agenticLoopEngine.ts — 9 adım: Understand→Plan→Retrieve→Reason→Act→Observe→Loop→Verify→Final (workflow fırlat). components/N8nOrchestratorCard.tsx — monitor görünümünde tek tıkla akış üret + n8n platformuna fırlat (MOCK/CANLI rozeti). Server-side proxy: api/v1/n8n/proxy/[...path]/route.ts — N8N_API_KEY asla tarayıcıya inmez, tüm istemci çağrıları proxy üzerinden (N8N_BASE_URL + X-N8N-API-KEY sunucuda eklenir); GET /health canlı durumu döner. 9 yerleşik şablon: +5 hazır ücretsiz şablon — SocialDMLeadGenerator (yorum→DM→CRM), VoiceToTaskConverter (ses→staff_tasks), DocRagAssistant (PDF→pgvector→Gemini), DailyExecutiveDigest (23:59 bilanço), ChurnRecovery (14 gün→Daze-Gift QR).',
  },

  {
    id: 'global-100-scale',
    title: '100 Aşamalık Küresel Master Genişleme & Sertleştirme Planı (10 Blok)',
    icon: '🌍',
    keywords: ['100 asama', 'global', 'scale', 'white-label', 'fintech', 'fx', 'menu engineering', 'xg', 'pms', 'ota', 'rag', 'ble', 'clv', 'saml', 'sso', 'openapi', 'self-healing', 'v2.0'],
    content:
      '10 Stratejik Blok: B1 cloudInfraEngine (tenant şema, pooler, redis cache, cold-start, indeks dedektörü, PITR, timescale, ZDM). B2 enterpriseSecuritySuite (rate limit, passkey/2FA, anahtar rotasyonu, audit, WAF, GDPR silme, AES-GCM, pentest, HMAC, lockdown). B3 fintechSuite (FX TRY/USD/EUR/GBP, LikyaPay, dunning, tip havuzu, hakediş, kripto onay, kupon, POS fiş, fraud skoru, cash-flow). B4 gastronomyIntelligence (menu eng, KDS, tedarikçi PO, cold chain, porsiyon, istasyon, alerjen, QR masa, rota, FIFO). B5 sportsIntelligenceSuite (spin, xG, şut açısı, smaç/blok, HRV, 3D mesh, heatmap, sesli taktik, yatkınlık, fikstür). B6 campusAutomationSuite (OTA iCal, sayaç IoT, termostat, housekeeping, lost&found, erken giriş, otopark/EV, NPS, spa, VIP). B7 autonomousAgentsSuite (LLM fallback, satış botu, voice AI, RAG, vardiya, trend ajan, CEO podcast, empati, scraper, SRE). B8 offlineFirstSuite (BLE, indoor nav, wallet pass, kalori vision, geofence, bileklik, SW cache, kiosk heartbeat, NFC, OLED). B9 executiveIntelligence (holo-dashboard, CLV/churn, KPI/OKR, karbon, benchmark, heatmap, korelasyon, PDF, attribution, amortisman). B10 globalScaleSuite (white-label, CDN edge, multi-region, SAML/SSO, 100K load, OpenAPI, webhook portal, self-healing, E2E, Production v2.0).',
  },

  {
    id: 'master-20-roadmap',
    title: '20 Aşamalı Master İcra Yol Haritası (Prodüksiyon Olgunluğu)',
    icon: '🏗️',
    keywords: ['master', 'roadmap', '20 asama', 'rls', 'rbac', 'kvkk', 'offline sync', '3ds', 'e-fis', 'tbyb', 'komisyon', 'recipe', 'webhook', 'kiosk', 'pose', 'pasaport', 'anpr', 'i18n', 'kampüs'],
    content:
      '20 Aşama: 1) RLS migration (rls_tenant_isolation.sql — is_ceo/is_staff + 33 tabloda ceo_bypass). 2) lib/auth/rbacGuard.ts (JWT decode + rol hiyerarşisi). 3) lib/security/kvkkMaskingEngine.ts (telefon/TC/pasaport/kart/IBAN maskeleme + şifreleme). 4) health route pooler telemetri. 5) lib/db/offlineSyncRecovery.ts (kuyruk + otomatik re-sync). 6) paymentGatewayAdapter 3D-Secure (forceThreeDS). 7) lib/finance/digitalReceiptGenerator.ts (LKY fiş + QR + KDV). 8) lib/marketplace/tbybLifecycleEngine.ts (7 gün → iade/satış). 9) lib/finance/commissionDistributionEngine.ts (eğitmen/personel/ortak payları). 10) lib/ops/recipeEngineeringEngine.ts (gramaj düşümü + upcycling). 11) lib/ops/dazeReminderWebhook.ts (WhatsApp/Cloud köprüsü). 12) lib/ops/dazeGiftLoyaltyEngine.ts (ikram QR kupon). 13) DazeVisionKioskView.tsx (dokunmatik self-servis + QR ödeme). 14) lib/sports/livePoseExtractionBridge.ts (33 landmark + sıçrama). 15) lib/sports/athletePassportReport.ts (SVG sparkline + tek sayfa). 16) lib/sports/liveGameTacticsEngine.ts (nabız/mesafe/yorgunluk → değişiklik). 17) lib/security/anprGateAccessBridge.ts (plaka/kod → IoT bariyer). 18) mobil senkron test (mobileSyncBridge.test.mts). 19) lib/i18n/campusI18nEngine.ts (TR/EN/DE/RU + çoklu kampüs). 20) nihai CI/CD.',
  },

  {
    id: 'sentinel-vision-hybrid',
    title: 'Sentinel Computer Vision HUD + Hibrit Ekipman Teşhisi + Şut Denge',
    icon: '👁️',
    keywords: ['sentinel', 'yolov11', 'yüz tanıma', 'face gate', 'isg', 'kask', 'yelek', 'ekipman', 'teşhis', 'belt wear', 'titreşim', 'şut', 'denge', 'landing', 'iniş'],
    content:
      'lib/security/sentinelVisionEngine.ts — YOLOv11/AI Box veri modelleri: FaceGateAccess (yüz eşleşme ≥0.82 → geçiş), HumanIntrusionAlert (bbox + conf 0.94), PPESafetyCompliance (kask/yelek → Compliant/Violation + violationType), MultiCamStreamMatrix (4 kanal: STREAMING/NOISE/OFFLINE + NOMINAL/DEGRADED/CRITICAL). lib/ops/equipmentDiagnosticEngine.ts — görsel (wear/crack) + telemetri (titreşim/temp/RPM) hibrit teşhis: BELT_WEAR → OVERHEATING (78°C) → VIBRATION_ANOMALY (7.1mm/s) önceliği + acil bakım görevi (dazeHubEventBus) + kritik tesis PWA bildirimi. lib/sports/shootingBaseBiomechanics.ts — ayak genişliği (omuz 0.8-1.3 ideal), diz valgusu (>10° inward cave), stacked posture (≤5cm kayma), sessiz iniş skoru (dB→0-100) + baseScore + reçete. UI: SentinelVisionGrid (DazeSentinelHud içinde sanal kamera + İSG ızgarası + TARAMA), ShootingBalanceCard (SportVisionX denge & iniş skoru).',
  },

  {
    id: 'daze-market-maker',
    title: 'Daze Market Maker + Neural Shell Telemetry HUD',
    icon: '📈',
    keywords: ['market maker', 'dinamik fiyat', 'borsa', 'edge', 'pnl', 'hedge', 'occupancy', 'velocity', 'neural', 'terminal', 'polymarket', 'sankey'],
    content:
      'lib/ops/dazeMarketMakerEngine.ts — Polymarket HFT mimarisi: talep-stok dengeli dinamik fiyatlandırma (restoran/kort/glamping). Girdiler: Occupancy, Stok riski, Velocity. Çıktılar: dynamicPrice (occupancy +%15, velocity +%10, stock -%12 bileşenleri), edgeScore, marginPct, riskHedgeCoeff (0-1) + deterministik PnL (tradePnl, computePnlSummary: netPnl/winRate/setEdge) + marketTick işlem geçmişi. components/DazeNeuralMarketHud.tsx — fütüristik terminal: Cüzdan/PnL özeti (Net PnL, Win Rate, Set Edge), Neural Core akış şeması (Market Ingest → Feature Nodes → Probability Core → Hedge Output), arz-talep Sankey/Hedge barları, MARKET TICK butonu; Finance görünümüne bağlı.',
  },

  {
    id: 'jsx-write-guard',
    title: 'JSX Yazım Koruması (logo/CEO execute) — string-aware parantez dengesi',
    icon: '🛡️',
    keywords: ['logo', 'jsx', 'yazma koruması', 'parantez dengesi', 'syntax', 'execute', 'kısmi yazım', 'guard', 'rollback'],
    content:
      'lib/ops/jsxWriteGuard.ts — CEO execute LLM yazim korumasi: syntaxAwareBalance (string/template literal icindeki { } ( ) [ ] karakterlerini saymaz — false-positive onlenir) + moduleIntegrityCheck (import/export + bilesen tanimi yoksa RED; mevcut dosyada modul yapisi varken yenide yoksa RED; %40/%50 kesinti esigi RED). api/v1/ceo/execute/route.ts bu korumayi kullanir: LLM "logo degistir" komutunda dosyanin tamami yerine yalnizca JSX blogu uretirse veya parantez dengesini bozarsa yazma ASLA diske ulasmaz; post-yazim tsc dogrulamasi + auto-rollback devrededir. Test: jsxGuard.test.mts (node --experimental-strip-types, 6/6 PASS).',
  },

  {
    id: 'peace-love-huddle',
    title: 'PEACE & LOVE Rehab + CSM 20s Huddle + Çizgi/Kaleci Biyomekaniği',
    icon: '🩹',
    keywords: ['peace', 'love', 'rehab', 'rehabilitasyon', 'huddle', '20s', 'oyuncu toplantısı', 'sideline', 'çizgi tuzağı', 'kaleci', 'turnike', 'layup', 'speed transition'],
    content:
      'lib/sports/injuryRehabEngine.ts — PEACE (Protect/Elevate/Avoid NSAIDs/Compress/Educate Gün 1-3) + LOVE (Load/Optimism/Vascularisation/Exercise Gün 4+) 14 günlük gün gün plan, 5 sakatlık tipi, Progressive Loading (%0→%100) + antrenmana dönüş sinyali. lib/sports/csmHuddleEngine.ts — 20s player-only toplantı sayacı + 5 hata filtresi (Spacing/Coverage/Timing/Communication/Decision) ağırlıklı teşhis + tek tıkla başlat (Event Bus görevi). lib/sports/courtSpatialBiometrics.ts — Sideline Trap: Danger 0-1ft / Risk 1-2ft / Safe 2+ft risk skalası; kaleci açı kapatma + bacak blok; 2-adım turnike basışı (Outside→Inside→Vertical Takeoff) puanlama. lib/sports/soccerConditioningRoute.ts — 30x20m Jog→Cruise→%90 Sprint→Recovery 4 turlu hız geçiş rotası. components/SportsRehabHuddlePanel.tsx — SportVisionX görünümünde 4 bölümlü antrenör kartları.',
  },

  {
    id: 'csm-tactical-suite',
    title: 'CSM Taktik Motoru + Frenleme Biyomekaniği + Taktik Drill Suiti',
    icon: '🧠',
    keywords: ['csm', 'competitive systems', 'one fix', 'identify', 'brake index', 'traction', 'deceleration', 'beat defender', 'diagonal sprint', 'taktik'],
    content:
      'lib/sports/csmTacticalEngine.ts — Identify (pozisyon hatası/rakip açığı) → One Fix (5 kural yerine tek net düzeltme) → Assign Responsibility (komut/uyarla/kademe) → Execution Feedback (sonraki pozisyonda 0-100 skor). 6 senaryo, deterministik FIX_LIBRARY; çözüm Daze Hub Event Bus personel görevine düşer. lib/sports/decelerationBiomechanics.ts — "Control the deceleration" Brake Index (plant öncesi hız düşürme oranı), Traction Check (zemin tutuş katsayısı: parke/lastik/çim/toprak + kayma + ıslak), sakatlık risk yük hesabı (G-kuvvet + haftalık sprint) + A-D not ve reçete. lib/sports/tacticalDrillsSuite.ts — Diagonal Sprint+Active Recovery (20yd+crossover), Beat Defender Without Speed (Pace/Hip Attack/Hesi/Separation), Passing & Cutting Spacing, 5-Round Full-Body Cardio; assignTacticalDrill ile tek tıkla atama. components/CsmTacticalPanel.tsx — SportVisionX görünümünde senaryo butonları, frenleme skor kartı ve drill atama kartları.',
  },

  {
    id: 'production-release',
    title: '%100 Üretim Paketi — Ödeme Geçidi + Daze-Reminder + Gerçek Ping',
    icon: '🚀',
    keywords: ['production', 'üretim', 'ödeme', 'iyzico', 'stripe', 'payment', 'sandbox', 'daze reminder', 'termal koruma', 'ping', 'release'],
    content:
      'lib/payment/paymentGatewayAdapter.ts — iyzico/stripe korumalı ödeme geçidi: satış, kiralama depozitosu (%25), TBYB (%10); client-safe startPayment sunucu-only /api/v1/payment proxy hattına gider; secret yoksa güvenli Sandbox Test Modu (deterministik referans, asla çökme). MarketplacePaymentTerminal.tsx pazaryeri görünümünde (kiralama/TBYB/satış + Daze-Gift kupon üret/kullan). lib/ops/dazeReminderEngine.ts — 120s mutfak sayacı bitince WhatsApp (WHATSAPP_API_TOKEN) + PWA push tetikleyici; 2dk aşımında termal koruma bayrağı + otomatik DG-XXXX Daze-Gift ikram kuponu (coupons tablosu/localStorage). api/v1/ceo/health — artık GERÇEK ping: auth/v1/health + rest/v1 (anon key) iki kademeli, 2.5s timeout; standby/ready gerçek bağlantıya göre.',
  },

  {
    id: 'sports-ops-executor',
    title: 'SportVisionX Kondisyon Motoru + Outcome-Driven İcra',
    icon: '🏀',
    keywords: ['17s', 'court conditioner', 'kondisyon', 'drill', 'u8', 'u16', 'atletik', 'outcome', 'patron komut', 'icra'],
    content:
      'lib/sports/courtConditionerEngine.ts — "The 17s Court Conditioner" 60s saha içi testi (3 ölçek: Başlangıç 9-11 / Orta 13-15 / İleri 17 geçiş), ayak dönüş pivot biyomekaniği (dominant/off foot, açı, denge) + nabız/toparlanma (resting/peak/recovery60/recoveryRate) veri yapısı; U8-U16 atletik gelişim matrisi (patlayıcı güç, dikey sıçrama, reaksiyon, çeviklik, haftalık yük) 5 yaş bandı hazır reçete. components/CourtConditionerPanel.tsx — antrenörlerin tek tıkla 17s Testi / Alt Vücut Kuvvet Protokolü / Reaksiyon Matrisi / Pivot Drilli seçip sporcuya atadığı kart kütüphanesi (atama → Daze Hub Event Bus görevi). lib/ops/outcomeExecutor.ts — SuperCool felsefesiyle patronun tek cümlelik komutunu ayrıştırıp bookingWriter + dazeHubEventBus (sipariş/personel) + notificationEngine (PWA) zincirini tek akışta çalıştıran outcome orkestratörü; CEOCommandChat handleSendMessage hattına bağlı.',
  },

  {
    id: 'daze-hub-event-bus',
    title: 'Daze Hub — Vision/Chef/Crew Dinamik Olay Köprüsü',
    icon: '🔄',
    keywords: ['daze hub', 'event bus', 'order placed', 'kitchen timer', 'staff task', 'daze reminder', 'crew', 'vision', 'chef', 'termal koruma'],
    content:
      'lib/ops/dazeHubEventBus.ts — Vision➔Chef➔Crew olay zincirini yöneten EventEmitter/LocalStorage state dağıtıcısı: ORDER_PLACED (Vision siparişi), KITCHEN_TIMER_TICK (Chef 120s), STAFF_TASK_DISPATCHED (Crew görev + kazanç + puan), DAZE_REMINDER_TRIGGERED (2dk aşımında termal koruma bayrağı). subscribe/emit/eventHistory + buildHubState durum panosu. components/DazeCrewView.tsx — canlı görev kuyruğu, tamamlanan sipariş puanı, vardiya performans rozeti (🏆 VIP Hizmet Yıldızı). components/DazeVisionOrderTracker.tsx — müşteri siparişinin mutfak/servis durumunu 120s sayaçla izleyen takip + Daze-Gift ikram kartı (termal koruma → ikram hakkı).',
  },

  {
    id: 'phase3-sync-pwa-chatwoot',
    title: 'Faz 3 — Mobil Sync Köprüsü, PWA Bildirim Motoru ve Chatwoot Panel',
    icon: '📱',
    keywords: ['mobile sync', 'flutter', 'supabase_service', 'ai_vision_service', 'image diagnosis', 'senkron', 'pwa push', 'notification', 'service worker', 'offline kuyruk', 'chatwoot', 'canlı destek simülasyonu'],
    content:
      'lib/sync/mobileSyncBridge.ts — Flutter supabase_service.dart + ai_vision_service.dart ile tam uyumlu TS arayüzler (MobileUser/MobileSession, ImageDiagnosisResult) + eşleme fonksiyonları (mapMobileReservation, mapBiomechanicScore, mapKitchenOrder) + localStorage senkron kuyruğu. lib/pwa/notificationEngine.ts — Service Worker push: ensureNotificationPermission, notifyServiceWorker postMessage, showBrowserNotification, dispatchPush (rezervasyon/kritik-arıza/mutfak-hazır) + offline kuyruk. components/ChatwootSupportPanel.tsx — Chatwoot iframe (token varsa) veya şık Canlı Destek Simülasyonu (token yoksa); dept view içinde render.',
  },

];

// ----------------------------------------------------------------------------
// 🔍 RAG RETRIEVAL — sorudaki anahtar kelimelerle ilgili bilgiyi seç
// ----------------------------------------------------------------------------
export function retrieveKnowledge(question: string): KnowledgeEntry[] {
  const lower = question.toLowerCase();
  const hits = KNOWLEDGE_VAULT.map((entry) => {
    const score = entry.keywords.reduce((s, kw) => (lower.includes(kw.toLowerCase()) ? s + 1 : s), 0);
    return { entry, score };
  }).filter((h) => h.score > 0);

  if (hits.length === 0) return [];
  const maxScore = Math.max(...hits.map((h) => h.score));
  return hits
    .filter((h) => h.score >= maxScore * 0.6) // en alakalı grup
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((h) => h.entry);
}

// Prompt'a enjekte edilecek bilgi bloğu
export function buildKnowledgeContext(question: string): string {
  const entries = retrieveKnowledge(question);
  if (entries.length === 0) return '';
  const blocks = entries.map((e) => `📌 ${e.icon} ${e.title}:\n${e.content}`);
  return `\n\n─── 🔒 MÜHÜRLÜ KURUMSAL BİLGİ (Likya Bilgi Vault'undan) ───\nBilgileri birebir kullan, kendi bilginle harmanla. Emin değilsen uydurma, vault bilgisini aktar.\n${blocks.join('\n\n')}`;
}

