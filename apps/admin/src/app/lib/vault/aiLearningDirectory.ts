// ============================================================================
// 📚 LİKYA VAULT — 20 EĞİTİM PLATFORMU & 50 GELİR MODELİ DİZİNİ
// Aranabilir JSON dizinleri: ücretsiz AI platformları + gelir yöntemleri.
// Likya Vault / Pazaryeri kütüphanesine bağlanır. Deterministik; Plan Z.
// ============================================================================

export interface LearningPlatform {
  id: string;
  name: string;
  url: string;
  type: 'kurs' | 'topluluk' | 'arac' | 'veri';
  free: boolean;
  tags: string[];
}

export interface IncomeModel {
  id: string;
  name: string;
  category: 'dijital' | 'hizmet' | 'abonelik' | 'pazar' | 'varlik';
  monthlyPotential: string;
  difficulty: 'kolay' | 'orta' | 'zor';
}

// 20 ücretsiz AI eğitim platformu (deterministik dizin)
export const LEARNING_PLATFORMS: LearningPlatform[] = [
  { id: 'lp1', name: 'Google AI Studio', url: 'https://aistudio.google.com', type: 'arac', free: true, tags: ['gemini', 'prompt'] },
  { id: 'lp2', name: 'Hugging Face Learn', url: 'https://huggingface.co/learn', type: 'kurs', free: true, tags: ['nlp', 'model'] },
  { id: 'lp3', name: 'Fast.ai', url: 'https://fast.ai', type: 'kurs', free: true, tags: ['derin-ogrenme'] },
  { id: 'lp4', name: 'Kaggle Learn', url: 'https://kaggle.com/learn', type: 'kurs', free: true, tags: ['veri-bilimi'] },
  { id: 'lp5', name: 'DeepLearning.AI', url: 'https://deeplearning.ai', type: 'kurs', free: true, tags: ['yapay-zeka'] },
  { id: 'lp6', name: 'OpenAI Cookbook', url: 'https://cookbook.openai.com', type: 'veri', free: true, tags: ['api', 'kod'] },
  { id: 'lp7', name: 'Anthropic Docs', url: 'https://docs.anthropic.com', type: 'veri', free: true, tags: ['claude'] },
  { id: 'lp8', name: 'Replicate Docs', url: 'https://replicate.com/docs', type: 'arac', free: true, tags: ['model-api'] },
  { id: 'lp9', name: 'Coursera (audit)', url: 'https://coursera.org', type: 'kurs', free: true, tags: ['denetim'] },
  { id: 'lp10', name: 'edX (audit)', url: 'https://edx.org', type: 'kurs', free: true, tags: ['denetim'] },
  { id: 'lp11', name: 'MIT OpenCourseWare', url: 'https://ocw.mit.edu', type: 'kurs', free: true, tags: ['universite'] },
  { id: 'lp12', name: 'DataCamp (free)', url: 'https://datacamp.com', type: 'kurs', free: true, tags: ['veri'] },
  { id: 'lp13', name: 'freeCodeCamp', url: 'https://freecodecamp.org', type: 'kurs', free: true, tags: ['kodlama'] },
  { id: 'lp14', name: 'The Odin Project', url: 'https://theodinproject.com', type: 'kurs', free: true, tags: ['web'] },
  { id: 'lp15', name: 'W3Schools', url: 'https://w3schools.com', type: 'veri', free: true, tags: ['referans'] },
  { id: 'lp16', name: 'MDN Web Docs', url: 'https://developer.mozilla.org', type: 'veri', free: true, tags: ['web'] },
  { id: 'lp17', name: 'Streamlit Learn', url: 'https://docs.streamlit.io', type: 'arac', free: true, tags: ['uygulama'] },
  { id: 'lp18', name: 'Gradio Guides', url: 'https://gradio.app/guides', type: 'arac', free: true, tags: ['demo'] },
  { id: 'lp19', name: 'Google Developers ML', url: 'https://developers.google.com/machine-learning', type: 'kurs', free: true, tags: ['google'] },
  { id: 'lp20', name: 'Open Source AI Index', url: 'https://github.com/topics/llm', type: 'topluluk', free: true, tags: ['acik-kaynak'] },
];

// 50 gelir modeli (kategoriler × 10)
const INCOME_NAMES = [
  'Dijital Vault Satışı', 'Lisans Anahtarı (Creem)', '3D Model Pazaryeri', 'E-Kurs Paketi', 'Bülten Aboneliği',
  'Koçluk Seansı', 'Aylık Danışmanlık', 'Topluluk Üyelik Ücreti', 'Canlı Webinar', 'E-Ticaret Dropshipping',
  'Saha Reklam Slotu', 'Sponsorluk Anlaşması', 'Kiralama (TBYB)', 'Franchise Bedeli', 'Pazar Yeri Komisyonu',
  'Affiliate Komisyonu', 'Veri Raporu Satışı', 'API Erişim Bedeli', 'Şablon Satışı', 'Mobil Uygulama İçi Satın Alma',
  'Etkinlik Bileti', 'VIP Paket', 'Hızlı Kargo Eklentisi', 'Özel İçerik Aboneliği', 'Canlı Yayın Bağışı',
  'Dijital Ajans Hizmeti', 'Sosyal Medya Yönetimi', 'SEO Danışmanlığı', 'Reklam Yayıncılığı', 'Podcast Sponsoru',
  'YouTube Geliri', 'E-kitap + Sesli Kitap', 'Mobil Oyun İçi Reklam', 'Yazılım Aboneliği (SaaS)', 'Kurumsal Eğitim',
  'Prototip 3D Baskı', 'Fotoğraf Lisansı', 'Müzik Lisansı', 'Font Tasarım', 'Ses Efekti Paketi',
  'Kampüs Turları', 'Atölye Ücreti', 'Kişisel Antrenör', 'Beslenme Planı', 'Toplu Sipariş İskontosu',
  'Bulut Depolama Ücreti', 'Sohbet Botu Kurulumu', 'Özel İstek Hizmeti', 'Mentorluk Programı', 'Danışma Ücreti',
];

export function buildIncomeModels(): IncomeModel[] {
  const cats: IncomeModel['category'][] = ['dijital', 'hizmet', 'abonelik', 'pazar', 'varlik'];
  return INCOME_NAMES.slice(0, 50).map((name, i) => ({
    id: `inc-${String(i + 1).padStart(2, '0')}`,
    name,
    category: cats[i % 5],
    monthlyPotential: ['5-15K₺', '15-40K₺', '40-100K₺'][i % 3],
    difficulty: (['kolay', 'orta', 'zor'] as const)[i % 3],
  }));
}

export const INCOME_MODELS = buildIncomeModels(); // 50 model

// Dizin arama (deterministik substring eşleşme)
export function searchDirectory(query: string): { platforms: LearningPlatform[]; incomes: IncomeModel[] } {
  const q = query.toLowerCase();
  return {
    platforms: LEARNING_PLATFORMS.filter((p) => `${p.name} ${p.tags.join(' ')}`.toLowerCase().includes(q)),
    incomes: INCOME_MODELS.filter((m) => `${m.name} ${m.category}`.toLowerCase().includes(q)),
  };
}

export function learningDirectoryStatus(): string {
  return `Vault Dizin [${LEARNING_PLATFORMS.length} eğitim platformu • ${INCOME_MODELS.length} gelir modeli]`;
}
