// LİKYA PWA İKON ÜRETİCİ — saf Node (zlib + CRC32), harici bağımlılık yok
// Neon cam göbeği→mor gradyan + şimşek (enerji) ikonu
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c;
  }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, 'ascii');
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([len, t, data, crc]);
}
function encodePNG(width, height, rgba) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0; // filter none
    rgba.copy(raw, y * (width * 4 + 1) + 1, y * width * 4, (y + 1) * width * 4);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

// renkler
const hex = (h) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
const NAVY = hex('#0f172a'), CYAN = hex('#00f2fe'), PURPLE = hex('#a78bfa'), WHITE = [255, 255, 255];

// nokta-in-çokgen (şimşek bolt)
function inPoly(x, y, pts) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i], [xj, yj] = pts[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}
const BOLT = [
  [0.55, 0.16], [0.30, 0.55], [0.46, 0.55], [0.40, 0.84], [0.70, 0.44], [0.53, 0.44],
];

function render(size) {
  const px = Buffer.alloc(size * size * 4);
  const r = size * 0.2; // köşe yarıçapı
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const nx = x / (size - 1), ny = y / (size - 1);
      // yuvarlak köşe maskesi
      let inR = true;
      const cxl = Math.min(x, size - 1 - x), cyl = Math.min(y, size - 1 - y);
      if (cxl < r && cyl < r) {
        const dx = r - cxl, dy = r - cyl;
        inR = dx * dx + dy * dy <= r * r;
      }
      if (!inR) { px[i + 3] = 0; continue; }
      // arka plan gradyanı: köşe koyu lacivert → merkez neon
      const g = 0.45 + 0.55 * (1 - Math.hypot(nx - 0.5, ny - 0.5) * 1.6);
      const bg = [Math.round(NAVY[0] + (CYAN[0] - NAVY[0]) * g * 0.6), Math.round(NAVY[1] + (CYAN[1] - NAVY[1]) * g * 0.6), Math.round(NAVY[2] + (PURPLE[2] - NAVY[2]) * g * 0.7)];
      px[i] = bg[0]; px[i + 1] = bg[1]; px[i + 2] = bg[2]; px[i + 3] = 255;
      // şimşek (beyaz → cam göbeği geçişli)
      if (inPoly(nx, ny, BOLT)) {
        const tg = Math.min(1, Math.max(0, (ny - 0.16) / 0.68));
        px[i] = Math.round(WHITE[0] + (CYAN[0] - WHITE[0]) * tg);
        px[i + 1] = Math.round(WHITE[1] + (CYAN[1] - WHITE[1]) * tg);
        px[i + 2] = Math.round(WHITE[2] + (PURPLE[2] - WHITE[2]) * tg);
      }
    }
  }
  return px;
}

const outDir = path.join(__dirname, '..', 'public', 'icons');
fs.mkdirSync(outDir, { recursive: true });
[192, 512].forEach((size) => {
  const png = encodePNG(size, size, render(size));
  fs.writeFileSync(path.join(outDir, `icon-${size}.png`), png);
  console.log(`✅ icon-${size}.png (${png.length} bytes)`);
});

// SVG ikon (manifest "any" için)
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0f172a"/><stop offset="1" stop-color="#0e7490"/>
    </linearGradient>
    <linearGradient id="bolt" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#00f2fe"/>
    </linearGradient>
  </defs>
  <rect x="0" y="0" width="512" height="512" rx="102" fill="url(#bg)"/>
  <circle cx="256" cy="256" r="150" fill="none" stroke="#00f2fe" stroke-opacity="0.35" stroke-width="10"/>
  <path d="M282 82 L154 282 L236 282 L205 430 L358 225 L269 225 Z" fill="url(#bolt)"/>
</svg>`;
fs.writeFileSync(path.join(outDir, 'icon.svg'), svg);
console.log('✅ icon.svg');
console.log('İkonlar hazır: ' + outDir);
