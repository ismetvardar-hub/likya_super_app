// AŞAMA — Sporcu Medya Kasası (Athlete Media Vault) davranış testi
// EXIF ayrıştırma, kopya tespiti, BLE telemetri eşleştirme, depolama raporu.
// Node native type-stripping ile çalışır: node athleteMediaVault.test.mts
import {
  buildVaultIndex,
  createMediaVault,
  exifStringToIso,
  findNearestTelemetryFrame,
  hashMediaBytes,
  linkMediaToTelemetry,
  parseExifTimestamp,
  registerMediaUpload,
  vaultStorageReport,
  type MediaUpload,
  type TelemetryFrame,
} from './src/app/lib/sports/media/athleteMediaVault.ts';

const results: { name: string; ok: boolean }[] = [];
function check(name: string, cond: boolean) {
  results.push({ name, ok: cond });
  console.log((cond ? 'PASS' : 'FAIL') + ' - ' + name);
}

// ---------------------------------------------------------------------------
// Yardımcı: sentetik JPEG + EXIF APP1 (DateTimeOriginal) üretici
// ---------------------------------------------------------------------------
function makeExifJpeg(dateTime: string, bigEndian = false): Uint8Array {
  const tiffSize = 8 + 2 + 12 + 12 + 4 + 20 + 20; // başlık + IFD(2 giriş) + ptr + 2 ASCII
  const app1Data = 6 + tiffSize; // "Exif\0\0" + TIFF
  const total = 2 + 4 + app1Data; // SOI + (APP1 marker + len) + APP1 verisi
  const buf = new ArrayBuffer(total);
  const bytes = new Uint8Array(buf);
  const view = new DataView(buf);
  const le = !bigEndian;

  let p = 0;
  bytes[p++] = 0xff; bytes[p++] = 0xd8; // SOI
  bytes[p++] = 0xff; bytes[p++] = 0xe1; // APP1
  view.setUint16(p, app1Data + 2, false); p += 2; // segment uzunluğu (kendisi dahil)
  const exif = new TextEncoder().encode('Exif\u0000\u0000');
  bytes.set(exif, p); p += 6; // p = TIFF başlangıcı

  const tiff = p;
  bytes[p++] = le ? 0x49 : 0x4d; // byte order
  bytes[p++] = le ? 0x49 : 0x4d;
  view.setUint16(p, 42, le); p += 2; // magic
  view.setUint32(p, 8, le); p += 4; // IFD ofseti (TIFF tabanlı)

  const ifd = p;
  view.setUint16(p, 2, le); p += 2; // 2 IFD girişi
  const str1Off = (ifd - tiff) + 2 + 12 + 12 + 4; // TIFF'ye göreli (38)
  const str2Off = str1Off + 20;
  // Giriş 1: DateTimeOriginal (0x9003)
  view.setUint16(p, 0x9003, le); p += 2;
  view.setUint16(p, 2, le); p += 2; // ASCII
  view.setUint32(p, 19, le); p += 4; // 19 karakter
  view.setUint32(p, str1Off, le); p += 4;
  // Giriş 2: DateTime (0x0132)
  view.setUint16(p, 0x0132, le); p += 2;
  view.setUint16(p, 2, le); p += 2;
  view.setUint32(p, 19, le); p += 4;
  view.setUint32(p, str2Off, le); p += 4;
  view.setUint32(p, 0, le); p += 4; // sonraki IFD yok
  new TextEncoder().encodeInto(dateTime, bytes.subarray(tiff + str1Off, tiff + str1Off + 20));
  new TextEncoder().encodeInto(dateTime, bytes.subarray(tiff + str2Off, tiff + str2Off + 20));
  return bytes;
}

const EXIF_DATE = '2026:08:20 16:30:45';
const EXIF_ISO = '2026-08-20T16:30:45.000Z';

// ---------------------------------------------------------------------------
// 1. EXIF ayrıştırma (little endian + big endian + geçersiz girdi)
// ---------------------------------------------------------------------------
check('1. EXIF DateTimeOriginal (LE) → ISO', parseExifTimestamp(makeExifJpeg(EXIF_DATE)) === EXIF_ISO);
check('2. EXIF DateTimeOriginal (BE) → ISO', parseExifTimestamp(makeExifJpeg(EXIF_DATE, true)) === EXIF_ISO);
check('3. JPEG olmayan byte → null', parseExifTimestamp(new Uint8Array([1, 2, 3, 4])) === null);
check('4. exifStringToIso format doğruluğu', exifStringToIso('2026:08:20 16:30:45') === EXIF_ISO);
check('5. exifStringToIso geçersiz tarih → null', exifStringToIso('2026:13:99 99:99:99') === null);

// ---------------------------------------------------------------------------
// 2. İçerik özeti (FNV-1a) deterministik + ayırt edici
// ---------------------------------------------------------------------------
const a = new Uint8Array([1, 2, 3, 4, 5]);
const b = new Uint8Array([1, 2, 3, 4, 6]);
check('6. hashMediaBytes deterministik', hashMediaBytes(a) === hashMediaBytes(new Uint8Array([1, 2, 3, 4, 5])));
check('7. hashMediaBytes ayırt edici (tek byte farkı)', hashMediaBytes(a) !== hashMediaBytes(b));

// ---------------------------------------------------------------------------
// 3. Kasa kaydı, EXIF kaynağı ve kopya tespiti
// ---------------------------------------------------------------------------
const vault = createMediaVault('likya_academy');
const uploadA: MediaUpload = {
  athleteId: 'at-01',
  sessionId: 'ss-42',
  kind: 'photo',
  fileName: 'mac_an.jpg',
  mimeType: 'image/jpeg',
  sizeBytes: 2048,
  bytes: makeExifJpeg(EXIF_DATE),
  source: 'coach',
  tags: ['mac', 'maç'],
};
const r1 = registerMediaUpload(vault, uploadA);
check('8. Yükleme EXIF kaynağıyla arşivlendi', r1.ok && !r1.deduped && r1.item?.exifSource === 'exif' && r1.item?.capturedAt === EXIF_ISO);
check('9. Yerel disk yolu doğru', r1.item?.localPath === '/var/lib/likya/media/at-01/ss-42/mac_an.jpg');

const r2 = registerMediaUpload(vault, uploadA);
check('10. Aynı içerik → kopya reddi', !r2.ok && r2.deduped && vault.items.length === 1);

// ---------------------------------------------------------------------------
// 4. BLE telemetri eşleştirme
// ---------------------------------------------------------------------------
const frames: TelemetryFrame[] = [
  { tMs: Date.UTC(2026, 7, 20, 16, 30, 0), heartRate: 152, gctMs: 178, activity: 'walk' },
  { tMs: Date.UTC(2026, 7, 20, 16, 30, 40), heartRate: 171, gctMs: 192, activity: 'sprint' },
];
const capturedMs = new Date(EXIF_ISO).getTime();
const near = findNearestTelemetryFrame(capturedMs, frames);
check('11. En yakın telemetri çerçevesi (5s sapma) eşleşir', near.frame?.heartRate === 171 && near.offsetSec === -5);
check('12. Pencere dışı → eşleşme yok', findNearestTelemetryFrame(capturedMs - 180_000, frames).frame === null);

const links = linkMediaToTelemetry(vault.items, frames);
check('13. linkMediaToTelemetry maç fotoğrafı eşleşti', links[0].matched && links[0].offsetSec === -5);
check('14. Telemetrisi olmayan medya eşleşmez', linkMediaToTelemetry(vault.items, frames, 100)[0].matched === false);

// ---------------------------------------------------------------------------
// 5. Depolama raporu, indeks ve dedup tasarrufu
// ---------------------------------------------------------------------------
const rVideo = registerMediaUpload(vault, {
  athleteId: 'at-01',
  sessionId: 'ss-42',
  kind: 'video',
  fileName: 'klip.mp4',
  mimeType: 'video/mp4',
  sizeBytes: 50_000,
  bytes: makeExifJpeg('2026:08:20 16:31:10'),
  source: 'parent',
});
check('15. Video yükleme EXIF ile arşivlendi', rVideo.ok && rVideo.item?.exifSource === 'exif');

// Manuel kopya kayıt (disk taraması simülasyonu) — dedup tasarrufu ölçümü
if (rVideo.item) {
  vault.items.push({ ...rVideo.item, id: 'MED-kopya', athleteId: 'at-02', sessionId: 'ss-99', fileName: 'kopya.mp4' });
}
const report = vaultStorageReport(vault);
check('16. Rapor: 3 kayıt + 50KB dedup tasarrufu', report.totalCount === 3 && report.dedupSavingsBytes === 50_000);
check('17. Rapor: tür bazlı sayım', report.byKind.photo.count === 1 && report.byKind.video.count === 2);
check('18. Rapor: EXIF kaynağı + toplam byte', report.byExifSource.exif === 3 && report.totalBytes === 102_048);

const onlyPhotos = buildVaultIndex(vault, { kind: 'photo' });
const onlyCoach = buildVaultIndex(vault, { source: 'coach' });
const onlySession = buildVaultIndex(vault, { sessionId: 'ss-42' });
check('19. İndeks filtre: tür', onlyPhotos.length === 1 && onlyPhotos[0].fileName === 'mac_an.jpg');
check('20. İndeks filtre: kaynak', onlyCoach.length === 1 && onlyCoach[0].source === 'coach');
check('21. İndeks filtre: oturum', onlySession.length === 2);

const failed = results.filter((r) => !r.ok).length;
console.log(`\nSONUÇ: ${results.length - failed}/${results.length} test geçti`);
process.exit(failed > 0 ? 1 : 0);

