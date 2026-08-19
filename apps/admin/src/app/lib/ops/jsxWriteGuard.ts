// ============================================================================
// 🛡️ JSX WRITE GUARD — CEO execute LLM yazım koruması (logo/JSX senaryosu)
// 1. syntaxAwareBalance: parantez/süslü/köşeli dengesi — STRING/template
//    literal içindeki karakterleri SAYMAZ (false-positive'i önler).
// 2. moduleIntegrityCheck: LLM dosyanın TAMAMI yerine yalnızca JSX bloğu
//    üretirse (import/export + bileşen tanımı yok / kesinti) → RED.
// Saf fonksiyonlar: Node'da doğrudan test edilebilir, Next.js bağımlılığı yok.
// ============================================================================

/**
 * String-aware parantez dengesi: `'...'`, `"..."`, `\`...\`` içindeki
 * karakterler sayılmaz; escape'ler (`\\'`, `\\"`, `\\\``) yok sayılır.
 * Döngü karmaşıklığı: O(n). Plan Z güvenli — asla throw etmez.
 */
export function syntaxAwareBalance(content: string): { ok: boolean; diff?: string } {
  const pairs: [string, string][] = [
    ['{', '}'],
    ['(', ')'],
    ['[', ']'],
  ];
  const counters = new Map<string, number>();
  pairs.forEach(([o, c]) => { counters.set(o, 0); counters.set(c, 0); });

  let inString: "'" | '"' | '`' | null = null;
  let escaped = false;

  for (let i = 0; i < content.length; i++) {
    const ch = content[i];

    if (escaped) { escaped = false; continue; }
    if (ch === '\\') { escaped = true; continue; }

    if (inString) {
      if (ch === inString) inString = null;
      continue;
    }
    if (ch === "'" || ch === '"' || ch === '`') { inString = ch; continue; }

    if (counters.has(ch)) counters.set(ch, (counters.get(ch) ?? 0) + 1);
  }

  for (const [open, close] of pairs) {
    const o = counters.get(open) ?? 0;
    const c = counters.get(close) ?? 0;
    if (o !== c) return { ok: false, diff: `${open}${close}: ${o} açık / ${c} kapalı` };
  }
  return { ok: true };
}

/**
 * Modül bütünlüğü + kesinti koruması.
 * - LLM yalnızca JSX bloğu üretirse (import/export yok + bileşen tanımı yok) → red.
 * - existingContent uzunsa ve yeni içerik %40'ın altındaysa → red (kesinti).
 */
export function moduleIntegrityCheck(content: string, existingContent: string): { ok: boolean; error?: string } {
  const hasModuleStructure = /(^|\n)\s*(import|export)\s/.test(content) || /export default/.test(content);
  const hasComponentDef = /(function|const|class)\s+\w+|React\./.test(content);
  if (!hasModuleStructure || !hasComponentDef) {
    return {
      ok: false,
      error: 'Modül bütünlüğü bozuk: üretilen içerikte import/export + bileşen tanımı yok — LLM dosyanın tamamı yerine yalnızca JSX bloğu üretti. Yazma iptal edildi.',
    };
  }

  if (existingContent && existingContent.trim().length > 0) {
    const existingHasModule = /(^|\n)\s*(import|export)\s/.test(existingContent);
    const newHasModule = /(^|\n)\s*(import|export)\s/.test(content);
    if (existingHasModule && !newHasModule) {
      return { ok: false, error: 'Modül bütünlüğü bozuldu: mevcut dosyada import/export yapısı var ama yeni içerikte hiç yok — LLM dosyanın tamamı yerine yalnızca JSX bloğu üretti. Yazma iptal edildi.' };
    }

    const existingLen = existingContent.trim().length;
    if (existingLen >= 300 && content.length < existingLen * 0.4) {
      const pct = Math.round((content.length / existingLen) * 100);
      return { ok: false, error: `Çıktı orijinalin %${pct}'i (${existingLen}→${content.length} karakter) — LLM dosyayı kesti ya da parçalı yazdı. Yazma iptal edildi.` };
    }
    if (existingLen > 8000 && content.length < existingLen * 0.5) {
      const pct = Math.round((content.length / existingLen) * 100);
      return { ok: false, error: `Çıktı orijinalin %${pct}'i (${existingLen}→${content.length} karakter) — LLM dosyayı kesti. Yazma iptal edildi.` };
    }
  }

  return { ok: true };
}
