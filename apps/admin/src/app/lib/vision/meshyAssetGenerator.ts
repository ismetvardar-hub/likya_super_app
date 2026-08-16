// ============================================================================
// 🧊 MESHY 3D ASSET ÜRETİCİ & YÜKLEYİCİ — GLTF/Three.js render altyapısı
// 3D Park Twin ve Pazaryeri için metin → 3D model üretimi ve GLTF yükleme.
// Deterministik stub: API anahtarı yoksa simülasyon; anahtar varsa gerçek çağrı.
// Kırılmasız: mevcut 3D/tesis sistemlerini değiştirmez.
// ============================================================================

export const MESHY_API_BASE = 'https://api.meshy.ai/v1';

export interface AssetRequest {
  prompt: string;
  format?: 'glb' | 'fbx' | 'usdz';
  artStyle?: string;
}

export interface AssetResult {
  ok: boolean;
  assetId: string;
  prompt: string;
  format: string;
  gltfUrl: string | null;
  simulated: boolean;
  message: string;
}

// Üretim isteği oluştur (anahtar yoksa simülasyon, varsa gerçek API çağrısı)
export async function requestAssetGeneration(req: AssetRequest): Promise<AssetResult> {
  const key = (typeof process !== 'undefined' && (process.env.MESHY_API_KEY || process.env.NEXT_PUBLIC_MESHY_API_KEY)) || '';
  const format = req.format ?? 'glb';
  const assetId = `mesh_${Date.now().toString(36)}`;

  if (!key) {
    return {
      ok: true,
      assetId,
      prompt: req.prompt,
      format,
      gltfUrl: null,
      simulated: true,
      message: `🧊 Meshy Simülasyon: "${req.prompt}" (${req.artStyle ?? 'gerçekçi'}) için ${format} asset kuyruğa alındı — MESHY_API_KEY eklendiğinde gerçek üretim başlar.`,
    };
  }

  try {
    const response = await fetch(`${MESHY_API_BASE}/text-to-3d`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` },
      body: JSON.stringify({ prompt: req.prompt, art_style: req.artStyle ?? 'realistic' }),
    });
    if (!response.ok) throw new Error(`Meshy HTTP ${response.status}`);
    const json = (await response.json()) as { result?: string };
    return {
      ok: true,
      assetId,
      prompt: req.prompt,
      format,
      gltfUrl: json.result ?? null,
      simulated: false,
      message: `🧊 Meshy üretimi başlatıldı: ${json.result ?? 'bellekte'}`,
    };
  } catch {
    return {
      ok: true,
      assetId,
      prompt: req.prompt,
      format,
      gltfUrl: null,
      simulated: true,
      message: '🧊 Meshy şu an erişilemiyor — simülasyon moduna düşüldü.',
    };
  }
}

// GLTF model yükleme helper'ı (Three.js/GLTFLoader uyumlu, kırılmasız)
export function gltfLoaderBridge(): { supported: boolean; library: string; note: string } {
  const w = typeof window;
  return {
    supported: w !== 'undefined',
    library: 'three/examples/jsm/loaders/GLTFLoader',
    note: '3D Park Twin ve Pazaryeri kartları için .glb asset bu köprüden yüklenir.',
  };
}

// Eklenti durum rozeti
export function meshyStatus(): string {
  const hasKey =
    typeof process !== 'undefined' && !!(process.env.MESHY_API_KEY || process.env.NEXT_PUBLIC_MESHY_API_KEY);
  return `Meshy 3D [${hasKey ? 'API BAĞLI' : 'Simülasyon'} • GLTF/Three.js render köprüsü]`;
}
