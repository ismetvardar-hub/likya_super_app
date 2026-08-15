// ============================================================================
// 🛠️ LİKYA İSTEMCİ TABANLI DOSYA MOTORU (Client-Side Engine)
// Sunucuya HİÇBİR dosya yüklenmez — tüm işlem kullanıcının cihazında çalışır.
// %100 KVKK uyumu: veri cihazdan çıkmaz • Sunucu maliyeti: 0 TL
// ============================================================================

// ----------------------------------------------------------------------------
// 🖼️ FOTOĞRAF SIKIŞTIRMA (Canvas tabanlı — WASM'siz, evrensel)
// ----------------------------------------------------------------------------
export async function compressImage(file: File, maxWidth = 1280, quality = 0.72): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxWidth / bitmap.width);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas desteklenmiyor');
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', quality));
  if (!blob) throw new Error('Dönüştürme başarısız');
  return blob;
}

// ----------------------------------------------------------------------------
// 🔄 FORMAT DÖNÜŞTÜRÜCÜ (JPEG / PNG / WEBP)
// ----------------------------------------------------------------------------
export async function convertImageFormat(file: File, format: 'image/jpeg' | 'image/png' | 'image/webp', quality = 0.9): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas desteklenmiyor');
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, format, quality));
  if (!blob) throw new Error('Dönüştürme başarısız');
  return blob;
}

// ----------------------------------------------------------------------------
// 📄 CANVAS TABANLI RAPOR / PDF GÖRÜNTÜSÜ ÜRETİCİ (jsPDF'siz)
// Canvas'a rapor çizer → JPEG/WEBP olarak indirilebilir veya yazdırma ile PDF alınır
// ----------------------------------------------------------------------------
export interface LabReportData {
  title: string;
  athlete: string;
  date: string;
  rows: { param: string; value: string; ref: string; status: 'ok' | 'low' | 'high' }[];
  notes: string[];
}

export function renderReportToCanvas(data: LabReportData, width = 800, height = 560): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas desteklenmiyor');

  const grad = ctx.createLinearGradient(0, 0, width, height);
  grad.addColorStop(0, '#0d1322');
  grad.addColorStop(1, '#1e293b');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  ctx.fillStyle = '#00f2fe';
  ctx.font = 'bold 26px system-ui, sans-serif';
  ctx.fillText(data.title, 32, 48);

  ctx.fillStyle = '#e2e8f0';
  ctx.font = '16px system-ui, sans-serif';
  ctx.fillText(`${data.athlete} • ${data.date}`, 32, 78);

  let y = 118;
  ctx.font = '14px system-ui, sans-serif';
  data.rows.forEach((r) => {
    ctx.fillStyle = '#64748b';
    ctx.fillText(r.param, 40, y);
    ctx.fillStyle = '#fff';
    ctx.fillText(r.value, 240, y);
    ctx.fillStyle = '#475569';
    ctx.fillText(`(ref: ${r.ref})`, 400, y);
    ctx.fillStyle = r.status === 'ok' ? '#4ade80' : r.status === 'low' ? '#f87171' : '#fbbf24';
    ctx.fillText(r.status === 'ok' ? '✓ NORMAL' : r.status === 'low' ? '↓ DÜŞÜK' : '↑ YÜKSEK', 580, y);
    y += 34;
  });

  y += 14;
  ctx.fillStyle = '#f59e0b';
  ctx.font = 'bold 14px system-ui, sans-serif';
  ctx.fillText('📌 Öneriler', 40, y);
  y += 26;
  ctx.fillStyle = '#cbd5e1';
  ctx.font = '13px system-ui, sans-serif';
  data.notes.forEach((n) => {
    ctx.fillText(n.length > 72 ? n.slice(0, 72) + '...' : n, 40, y);
    y += 24;
  });

  ctx.fillStyle = '#475569';
  ctx.font = '11px system-ui, sans-serif';
  ctx.fillText('🏛️ LİKYA SPORT VISION — Client-Side Rapor (veri cihazdan çıkmadı)', 32, height - 24);

  return canvas;
}

// ----------------------------------------------------------------------------
// 📦 BLOB İNDİRME + YAZDIRMA (yazdırma → "PDF olarak kaydet")
// ----------------------------------------------------------------------------
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

export function printReport(canvas: HTMLCanvasElement): void {
  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write('<html><head><title>Likya Rapor</title></head><body style="margin:0">');
  const imgUrl = canvas.toDataURL('image/jpeg', 0.92);
  win.document.write(`<img src="${imgUrl}" style="width:100%" />`);
  win.document.write('</body></html>');
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 300);
}

// ----------------------------------------------------------------------------
// 🩺 SAĞLIK HESAPLARI (BMI vb.)
// ----------------------------------------------------------------------------
export function computeBMI(heightCm: number, weightKg: number): { bmi: number; category: string; color: string } {
  const h = heightCm / 100;
  if (h <= 0) return { bmi: 0, category: 'Geçersiz', color: '#64748b' };
  const bmi = Math.round((weightKg / (h * h)) * 10) / 10;
  if (bmi < 18.5) return { bmi, category: 'Zayıf', color: '#00f2fe' };
  if (bmi < 25) return { bmi, category: 'Normal', color: '#4ade80' };
  if (bmi < 30) return { bmi, category: 'Fazla Kilolu', color: '#fbbf24' };
  return { bmi, category: 'Obez', color: '#f87171' };
}

// ----------------------------------------------------------------------------
// 📝 METİN KARŞILAŞTIRMA (deterministik benzerlik — LLM yok)
// ----------------------------------------------------------------------------
export function simpleTextSimilarity(a: string, b: string): number {
  const tokens = (s: string) => new Set(s.toLowerCase().split(/\s+/).filter((w) => w.length > 2));
  const sa = tokens(a);
  const sb = tokens(b);
  if (sa.size === 0 || sb.size === 0) return 0;
  let common = 0;
  sa.forEach((t) => { if (sb.has(t)) common++; });
  return Math.round((common / Math.max(sa.size, sb.size)) * 100);
}

