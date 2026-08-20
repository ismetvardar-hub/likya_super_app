// ============================================================================
// 📄 PDF RAPOR ÜRETİCİ (Adım 01) — print-based A4 PDF
// jsPDF/html2canvas bağımlılığı olmadan tarayıcı print motoru üzerinden
// üretim kalitesinde PDF çıktısı üretir:
// - buildPdfHtml: A4 yazdırma dostu HTML (yüksek kontrast)
// - printPdf: gizli iframe + window.print (tarayıcı "PDF olarak kaydet")
// - downloadHtmlReport: HTML dosyası olarak indir
// Mevcut motorlara dokunmaz; postSessionReport'u sade görünüme çevirir.
// ============================================================================

export interface PdfReportData {
  title: string;
  subtitle?: string;
  meta: { label: string; value: string }[];
  sections: { heading: string; lines: string[] }[];
  footer: string;
}

// ---------------------------------------------------------------------------
// 1. A4 yazdırma dostu HTML üretimi (yüksek kontrast, siyah-beyaz güvenli)
// ---------------------------------------------------------------------------
export function buildPdfHtml(data: PdfReportData): string {
  const metaRows = data.meta.map((m) => `<tr><td class="m">${m.label}</td><td class="v">${m.value}</td></tr>`).join('');
  const sections = data.sections
    .map(
      (s) => `
    <div class="sec">
      <h2>${s.heading}</h2>
      ${s.lines.map((l) => `<div class="line">• ${l}</div>`).join('')}
    </div>`,
    )
    .join('');

  return `<!DOCTYPE html><html lang="tr"><head><meta charset="UTF-8"/><title>${data.title}</title>
<style>
  @page { size: A4; margin: 14mm; }
  * { box-sizing: border-box; }
  body { font-family: -apple-system, 'Segoe UI', Arial, sans-serif; color: #0f172a; font-size: 12px; line-height: 1.5; }
  .head { border-bottom: 3px solid #0f172a; padding-bottom: 10px; margin-bottom: 14px; }
  .head h1 { font-size: 20px; margin: 0 0 4px; }
  .head .sub { color: #475569; font-size: 11px; }
  table.meta { width: 100%; border-collapse: collapse; margin: 10px 0; }
  table.meta td { padding: 5px 8px; border-bottom: 1px solid #cbd5e1; font-size: 11px; }
  table.meta td.m { color: #475569; width: 30%; }
  table.meta td.v { font-weight: 700; }
  .sec { margin-bottom: 14px; page-break-inside: avoid; }
  .sec h2 { font-size: 13px; border-left: 4px solid #0f172a; padding-left: 8px; margin: 0 0 8px; }
  .line { padding: 3px 0; }
  .foot { border-top: 2px solid #0f172a; margin-top: 18px; padding-top: 8px; color: #64748b; font-size: 10px; text-align: center; }
</style></head><body>
  <div class="head">
    <h1>${data.title}</h1>
    ${data.subtitle ? `<div class="sub">${data.subtitle}</div>` : ''}
    <table class="meta">${metaRows}</table>
  </div>
  ${sections}
  <div class="foot">${data.footer}</div>
</body></html>`;
}

// ---------------------------------------------------------------------------
// 2. Tarayıcı print (PDF olarak kaydet) — gizli iframe tekniği
// ---------------------------------------------------------------------------
export function printPdf(data: PdfReportData): void {
  if (typeof window === 'undefined') return;
  const html = buildPdfHtml(data);
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);
  const doc = iframe.contentDocument || iframe.contentWindow?.document;
  if (!doc) return;
  doc.open();
  doc.write(html);
  doc.close();
  iframe.onload = () => {
    iframe.contentWindow?.focus();
    iframe.contentWindow?.print();
    setTimeout(() => iframe.remove(), 3000);
  };
}

// ---------------------------------------------------------------------------
// 3. HTML dosyası olarak indir (PDF'e çevrilecek/arşiv)
// ---------------------------------------------------------------------------
export function downloadHtmlReport(data: PdfReportData, fileName = 'extremes-report.html'): void {
  if (typeof window === 'undefined') return;
  const blob = new Blob([buildPdfHtml(data)], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  a.click();
  URL.revokeObjectURL(url);
}

export function pdfReportGeneratorStatus(): string {
  return 'PDF Üretici: A4 print-based • jsPDF bağımlılığı yok • iframe print + HTML indir';
}
