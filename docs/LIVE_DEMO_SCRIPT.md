# 🎥 LİKYA SPORTVISIONX — 5 DAKİKALIK CANLI DEMO WALKTHROUGH

> Satış demoları ve yatırımcı sunumları için adım adım sunum senaryosu.
> Altyapı: `node scripts/simulateLiveCourtMatch.mts` (12/12) + canlı UI (MatchDaySessionStarter,
> FieldPairingWizard, IntermissionTacticalCard, CourtVoiceNoteRecorder, KineticDigitalTwinReplay).

---

## ⏱️ Dakika 0–1: 1-Tap Session Setup & BLE Zero-Calibration

**Sahne:** Kort tablette `MatchDaySessionStarter` — Kort 1, "U14 Elit Gelişim", Best of 3.

1. **⚡ Tek Dokunuşla Seansı Başlat** → 3 BLE akışı (Sol/Sağ tabanlık + Decathlon HRM) + 100Hz kayıt otomatik başlar.
2. **FieldPairingWizard** → RSSI metre (≥GOOD), pil voltaj göstergesi.
3. **🎯 Baseline kalibrasyonu (5sn)** — 500 örnek → *"ofset 5 · stabil"* ekranda.
4. İzleyiciye: *"Sporcu henüz kortta değilken bile sensörler sıfır-taban kalibre oldu."*

## ⏱️ Dakika 1–3: Simüle 100Hz Canlı Ralli

**Sahne:** Canlı telemetri akışı + 3D ikiz.

1. Simülasyon rallisi başlar (canlı HUD: GCT, GRF, HR).
2. **GCT drift +28ms > 20ms** → otomatik **🟡 Mola Taktik Kartı** önerisi ekranda.
3. **KineticDigitalTwinReplay** — 3D ayak basıncı + diz fleksiyon + vuruş açısı (scrub/360°).
4. **🎙️ Koç sesli notu** 1-dokunuşla başlat → 100Hz timeline'a işaretlenir (çerçeve #6303).
5. İzleyiciye: *"Koç oyun sırasında ayağa kalkmadan not alıyor; not telemetriyle senkron."*

## ⏱️ Dakika 3–4: Intermission Tactical AI Card & Ghost Avatar

**Sahne:** Set arası 90sn pencere.

1. **IntermissionTacticalCard:** İlk Servis %, Racket Hızı, GCT Drift, Deselerasyon + **3 maddelik öneri**.
2. **Ghost Avatar / Biyomekanik GPT:** "Arda'nın ikinci servis hız düşüşünün kök nedeni nedir?" → telemetriye dayalı, sade dilli yanıt (kinetik zincir gecikmesi 135ms + desel torku).
3. İzleyiciye: *"AI, koça kanıta dayalı tavsiye veriyor — tahmin değil, ölçüm."*

## ⏱️ Dakika 4–5: Maç Sonu — Otomatik Veli & Export

**Sahne:** Maç tamamlanır.

1. **🏁 Maçı Bitir** → otomatik **veli WhatsApp özeti** (süre + TRIMP 91 + 🎉 PB rekoru + toparlanma).
2. **Master export:** CSV (643KB) + JSON (720KB) + TRIMP/ACWR eğrileri + scout notu → `/tmp/likya-sim-export/`.
3. **Federasyon pasaportu** (ITF/TTF) PII maskeli — tek tık.
4. İzleyiciye: *"Maç biter bitmez veli bilgilendi, spor bilimci veri paketini aldı, koç bir sonraki sete hazır."*

---

## 🧠 Sunucu İpucu

- Vurgu sırası: **Görünmeyen yorgunluk → otomatik aksiyon → veli değeri**.
- Metrik kartı: 100Hz · <300ms yayın · <15ms edge AI · %0 paket kaybı · 50MB buffer · 144KB ilk yük.
- Demo çöktüğünde: `master100StepVerification.mts` (69/69) + `pilotPhase1-10SmokeTest` (190+ kontrol) yedek kanıt.
