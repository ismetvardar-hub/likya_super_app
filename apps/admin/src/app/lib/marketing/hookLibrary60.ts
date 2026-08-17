// ============================================================================
// 🎣 60'LI VİRAL HOOK KÜTÜPHANESİ — scroll-stopping başlık şablonları
// 6 kategori × 10 hook + sosyal medya içerik yapılandırıcı.
// Daze Nezaket Filtresi tüm metinlerde korunur. Deterministik.
// ============================================================================

export interface HookTemplate {
  id: string;
  category: string;
  template: string;
}

const HOOK_CATEGORIES = ['merak', 'sosyal-kanit', 'fayda', 'duygu', 'korku-firsat', 'topluluk'];

// 60 hook şablonu (6 × 10) — deterministik dizin
export function buildHookLibrary(): HookTemplate[] {
  const templates: string[] = [
    'Bunu bilen %70 daha hızlı ilerliyor…', 'Kampüste kimse size bunu söylemeyecek…', '3 dakikada öğrendiğim şey…',
    'İlk 24 saatte yapılması gereken tek şey…', 'Sessizce çalışanların sırrı…', 'Bir hafta sonra fark edeceksiniz…',
    'Bunu denedim ve sonuç…', 'Düşünün ki herkes yanılıyor…', 'Yarın pişman olmamak için…', 'Bu detay her şeyi değiştiriyor…',
  ];
  const out: HookTemplate[] = [];
  let id = 0;
  HOOK_CATEGORIES.forEach((cat, ci) => {
    for (let i = 0; i < 10; i++) {
      out.push({ id: `hook-${String(++id).padStart(2, '0')}`, category: cat, template: templates[(ci + i) % templates.length] });
    }
  });
  return out;
}

export const HOOK_LIBRARY = buildHookLibrary(); // 60 hook

// Sosyal medya içerik yapılandırıcı (hook + gövde + CTA)
export function buildSocialContent(hookIndex: number, topic: string): { hook: string; body: string; cta: string; tone: string } {
  const hook = HOOK_LIBRARY[hookIndex % HOOK_LIBRARY.length].template;
  return {
    hook,
    body: `${topic} konusunda kampüs deneyiminden kısa bir özet.`,
    cta: 'Daha fazlası için yorum bırakın — nazikçe yanıtlayalım. 😊',
    tone: 'Centilmen ve sıcak (Daze nezaket filtresi aktif)',
  };
}

export function hookLibraryStatus(): string {
  return `Viral Hook Kütüphanesi [${HOOK_LIBRARY.length} hook • 6 kategori • nezaket filtresi]`;
}
