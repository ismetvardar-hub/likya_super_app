// jsxWriteGuard fonksiyonel test — logo senaryosu (Node strip-types ile)
import { syntaxAwareBalance, moduleIntegrityCheck } from './src/app/lib/ops/jsxWriteGuard.ts';

const results: { name: string; ok: boolean }[] = [];

function check(name: string, cond: boolean) {
  results.push({ name, ok: cond });
  console.log((cond ? 'PASS' : 'FAIL') + ' - ' + name);
}

// 1. Kısmi JSX bloğu (bozuk süslü parantez — LLM yarım üretim) → RED
check('1. Kısmi JSX (bozuk süslü) RED', !syntaxAwareBalance('<div style={{ border: "1px" }>Logo</div>').ok);

// 2. String içinde { olan GEÇERLİ dosya → yanlış reddetme yok (false-positive fix)
const validWithBrace = `import React from 'react';
export default function Header() {
  const logoText = '{';
  return <div>Logo {logoText}</div>;
}`;
check('2. String icindeki { yanlis reddedilmez', syntaxAwareBalance(validWithBrace).ok);

// 3. Sadece JSX bloğu (import/export yok) → modül bütünlüğü RED
check('3. Sadece JSX blogu (import yok) RED', !moduleIntegrityCheck('<div>Logo yeni</div>', '').ok);

// 4. Tam dosya (eski → yeni logo) → PASS
const oldFile = `import React from 'react';
export default function Header() {
  return <div style={{ color: 'red' }}>ESKİ LOGO</div>;
}`;
const newFile = `import React from 'react';
export default function Header() {
  return <div style={{ color: '#00f2fe' }}>YENİ LOGO</div>;
}`;
check('4. Tam dosya logo degisikligi PASS', moduleIntegrityCheck(newFile, oldFile).ok);

// 5. Kesinti (mevcut uzun, yeni %30) → RED
const longExisting = 'import x from "y";\n' + 'a'.repeat(1000);
check('5. Kesinti (%30) RED', !moduleIntegrityCheck('import x from "y";', longExisting).ok);

// 6. Template literal içindeki dengesiz görünen { } → false-positive yok
const withTemplate = `import React from 'react';
export default function Card() {
  const msg = \`Tutar: {x} - {y}\`;
  return <div>{msg}</div>;
}`;
check('6. Template literal { } yanlis reddedilmez', syntaxAwareBalance(withTemplate).ok);

const failed = results.filter((r) => !r.ok).length;
console.log(`\nSONUÇ: ${results.length - failed}/${results.length} test geçti`);
process.exit(failed > 0 ? 1 : 0);
