// ============================================================================
// 🛍️ PAZARYERİ DİJİTAL ASSET KATALOĞU
// Dijital ürünler (Vault, 3D modeller, lisanslar) — Creem MoR köprüsüyle
// döviz satışa hazır. Deterministik; Plan Z güvenli.
// ============================================================================

export interface DigitalAsset {
  id: string;
  name: string;
  emoji: string;
  category: 'vault' | '3d' | 'license' | 'course';
  priceUsd: number;
  size: string;
  description: string;
  creemProductId?: string;
}

export const DIGITAL_ASSETS: DigitalAsset[] = [
  { id: 'da-1', name: 'Likya Master Vault (50 Not)', emoji: '🗄️', category: 'vault', priceUsd: 49, size: 'JSON / Markdown', description: '50 kurumsal bilgi notu — AI RAG hazır', creemProductId: 'vault-master' },
  { id: 'da-2', name: '3D Park Twin GLTF', emoji: '🏕️', category: '3d', priceUsd: 89, size: '.glb / 38MB', description: 'Tesis 3D ikizi — Three.js/GLTF', creemProductId: '3d-park-twin' },
  { id: 'da-3', name: 'Daze Chef AI Reçete Modülü', emoji: '🍳', category: 'license', priceUsd: 19, size: 'Aylık lisans', description: 'Multimodal buzdolabı → reçete modülü', creemProductId: 'daze-chef-ai' },
  { id: 'da-4', name: 'Likya Padel Antrenman Seti', emoji: '🎾', category: 'course', priceUsd: 29, size: 'Video + PDF', description: 'BESYO antrenör seti (12 video)' },
];

export function assetsByCategory(category: DigitalAsset['category']): DigitalAsset[] {
  return DIGITAL_ASSETS.filter((a) => a.category === category);
}

export function digitalAssetsStatus(): string {
  return `Dijital Asset [${DIGITAL_ASSETS.length} ürün • vault/3D/lisans • Creem MoR satışa hazır]`;
}
