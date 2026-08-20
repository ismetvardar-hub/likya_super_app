# 🔬 LİKYA SPORTVISIONX — TEKNİK MİMARİ WHITEPAPER (Executive Summary)

> **150 adım · 17 track · 200+ deterministik motor · %100 test kapsamı**
> Matematiksel formalizmler, CRDT garantileri, KVKK uyumu ve bundle benchmark'ları.

---

## 1. Yük Modeli: EWMA-ACWR & Banister TRIMP

**ACWR (Akut:Kronik Yük Oranı)** — EWMA ile üstel ağırlıklandırma:

$$ ACWR = \frac{A_t}{C_t}, \quad A_t = \lambda_a \cdot L_t + (1-\lambda_a) A_{t-1}, \quad C_t = \lambda_c \cdot L_t + (1-\lambda_c) C_{t-1} $$

burada $\lambda_a = \frac{2}{7+1}$ (akut, 7 gün) ve $\lambda_c = \frac{2}{28+1}$ (kronik, 28 gün). Risk bölgeleri: 🟢 [0.8, 1.3] optimal · 🟡 <0.8 / 1.3–1.5 uyarı · 🔴 ≥1.5 spike (≈4x sakatlık riski).

**Banister TRIMP:**

$$ TRIMP = D \times \Delta HR \times 0.64 \times e^{y \cdot \Delta HR}, \quad \Delta HR = \frac{HR_{mean} - HR_{rest}}{HR_{max} - HR_{rest}}, \quad y = 1.92\;(M) / 1.67\;(F) $$

Readiness Skoru (RHR/HRV/Uyku/VO2Max ağırlıklı) → ACWR planı otomatik azaltılır: **RED %40 / AMBER %20 / GREEN %0**.

## 2. Sensör-Vizyon EKF Füzyonu

100Hz BLE tabanlık + kamera CoM ivmesi, doğrusallaştırılmış Kalman filtresiyle birleşir:

$$ \hat{x}_{k|k-1} = F \hat{x}_{k-1}, \quad P_{k|k-1} = F P_{k-1} F^T + Q $$

$$ K_k = P_{k|k-1} H^T (H P_{k|k-1} H^T + R)^{-1}, \quad \hat{x}_k = \hat{x}_{k|k-1} + K_k (z_k - H \hat{x}_{k|k-1}) $$

- **Tıkanma (occlusion):** kamera görünmezse tabanlık birincil; geri dönüşte otomatik kurtarma.
- **IMU drift düzeltmesi:** görsel optik işaret ile $\Delta\theta = \alpha(\theta_{vis} - \theta_{imu})$.
- Yakınsama eşiği: kovaryans < 0.02 (steady-state) — 8 ölçümde doğrulandı.

## 3. Edge Mikro-Transformer (nanoGPT Esinli)

Saf TypeScript çok başlı self-attention (Python/WASM yok), 100Hz kinematik pencere ($T=16$):

$$ Attention(Q,K,V) = softmax\left(\frac{Q K^T}{\sqrt{d_k}}\right) V, \quad d_k = \frac{d_{model}}{n_{head}} = 4 $$

- Katman: MHSA → residual → LayerNorm → FFN(ReLU) → residual → LayerNorm; **3 vuruş öncesi** kinetik çöküş olasılığı.
- **Gecikme: <15ms** (ölçüldü) — cihaz içi, bulut bağımlılığı yok. Deterministik mulberry32 ağırlık başlatma.

## 4. Edge Replikasyon & CRDT Garantileri

Aktif-aktif çok bölge (FRA1/IST1/DUB1) — haversine en-yakın PoP yönlendirme:

- **LWW register:** $w_k = \max_{tsMs}(v_k)$ — aynı anahtarda daha yeni zaman damgası kazanır (eşitlikte nodeId tie-break).
- **Birleşme (merge):** $\text{store}_A \cup \text{store}_B$ — toplamsal, çakışma çözümü deterministik; 3 bölge tutarlılık (sapma 0).
- Paket sıralaması tsMs'e göre yeniden kurulur; sıra dışı paketler işaretlenir.

## 5. KVKK Uyumlu Append-Only Denetim

- **Append-only audit:** saha olayları, triyaj raporları ve sponsor izlenimleri yalnızca eklenir; sağlama toplamı (FNV-1a) ile değişmezlik doğrulanır (kurcalama → checksum uyumsuzluğu).
- **PII gizleme:** tam ad, doğum tarihi, tıbbi notlar uzunluk-koruyan maske (`D•••••••••`); federasyon çıktısında sızıntı test edilir.
- **Anonim kohort:** çoklu-akademi karşılaştırmalarında sporcu kimliği asla yayınlanmaz (izolasyon doğrulaması 0 sızıntı).
- **Silme/taşıma hakları:** mobil köprü ETag + diff; istemci verileri kullanıcı onayıyla temizlenir.

## 6. Bundle Optimizasyonu & Canlı Performans Benchmark'ları

| Metrik | Hedef | Ölçülen |
|---|---|---|
| İlk yük JS | <200KB | **144KB** |
| WebRTC yayın gecikmesi | <300ms | ✓ (mikro-saniye faz hizası ±1000µs) |
| Edge transformer | <15ms | ✓ (deterministik) |
| Ring-buffer bellek | ≤50MB | **1.21MB** (saha simülasyonu, 19.908 paket) |
| Paket kaybı | <%2 | **%0** (saha simülasyonu) |
| Cloudflare/Dokploy edge | 3 bölge | FRA1/IST1/DUB1 — CRDT sapma 0 |

- **Code-split + lazy-load:** 4 ağır modül (3D ısı haritası, slow-motion biyomekanik, taktik tuval) → **250KB** tasarruf.

## 7. Sonuç & Güvence

- **Doğrulama:** `master100StepVerification.mts` — **69/69** (30 batch smoke + 6 unit + E2E + roadmap 150/150).
- **Üretim altyapısı:** multi-stage Docker (<180MB, non-root) + Dokploy/Traefik TLS + fail-fast env validator + CI/CD.
- **Açık kaynak etiği:** tüm motorlar saf/deterministik, node-runnable; hiçbir kritik yol dış LLM'e bağımlı değil (Plan Z kural motoru + mock sandbox).

---

*Bu whitepaper, 150 adımın matematiksel ve mühendislik temellerini özetler; ayrıntılar `docs/100_STEP_EXECUTION_ROADMAP.md` ve `docs/PILOT_DEPLOYMENT_GUIDE.md`'de.*

