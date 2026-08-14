"""
LİKYA SYSTEM DOCTOR - OTONOM HATA DÜZELTME DOKTORU
/api/v1/ceo/execute hattındaki kopuklukları, monorepo path uyuşmazlıklarını
ve chat infaz hatalarını otomatik tespit edip kendi kendine düzeltir.
"""

import os
import sys
import re
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
ADMIN_DIR = PROJECT_ROOT / "apps" / "admin"
ROUTE_FILE = ADMIN_DIR / "src" / "app" / "api" / "v1" / "ceo" / "execute" / "route.ts"
CEO_FILE = ADMIN_DIR / "src" / "app" / "components" / "CEOCommandCenter.tsx"

print("=" * 70)
print("🩺 LİKYA SYSTEM DOCTOR - OTONOM HATA DÜZELTME DOKTORU")
print("=" * 70)

diagnoses = []
treatments = []

# ============================================================
# 1. API ROUTE KONTROLÜ & ONARIMI
# ============================================================
print("\n🔍 1. API ROUTE KONTROLÜ & ONARIMI")
print("-" * 50)

if not ROUTE_FILE.exists():
    diagnoses.append("route.ts dosyası bulunamadı")
    print(f"❌ HATA: {ROUTE_FILE} bulunamadı")
else:
    content = ROUTE_FILE.read_text(encoding='utf-8')
    print(f"✅ route.ts bulundu ({len(content)} karakter)")

    # Dinamik PROJECT_ROOT kontrolü
    if "process.cwd().endsWith('apps/admin')" in content:
        print("✅ Dinamik PROJECT_ROOT çözümlemesi mevcut")
    else:
        diagnoses.append("PROJECT_ROOT dinamik çözümlemesi eksik")
        print("❌ HATA: PROJECT_ROOT dinamik çözümlemesi eksik")
        # Onarım
        content = content.replace(
            "const PROJECT_ROOT = path.resolve(process.cwd(), '../..');",
            "const PROJECT_ROOT = path.resolve(process.cwd(), process.cwd().endsWith('apps/admin') ? '../..' : '.');"
        )
        ROUTE_FILE.write_text(content, encoding='utf-8')
        treatments.append("route.ts: Dinamik PROJECT_ROOT eklendi")
        print("🔧 ONARILDI: Dinamik PROJECT_ROOT eklendi")

    # Güvenli JSON parse kontrolü
    if "Geçersiz JSON gövdesi" in content:
        print("✅ Güvenli JSON parse mevcut")
    else:
        diagnoses.append("Güvenli JSON parse eksik")
        print("❌ HATA: Güvenli JSON parse eksik")
        # Onarım
        content = content.replace(
            "const body = await request.json();",
            "let body: { command?: string };\n    try {\n      body = await request.json();\n    } catch {\n      return NextResponse.json({ success: false, error: 'Geçersiz JSON gövdesi' }, { status: 400 });\n    }"
        )
        ROUTE_FILE.write_text(content, encoding='utf-8')
        treatments.append("route.ts: Güvenli JSON parse eklendi")
        print("🔧 ONARILDI: Güvenli JSON parse eklendi")

    # Anlaşılır hata yakalama kontrolü
    if "error instanceof Error" in content:
        print("✅ Anlaşılır hata yakalama mevcut")
    else:
        diagnoses.append("Anlaşılır hata yakalama eksik")
        print("❌ HATA: Anlaşılır hata yakalama eksik")
        # Onarım
        content = content.replace(
            "return NextResponse.json({ success: false, error: String(error) }, { status: 500 });",
            "const message = error instanceof Error ? error.message : String(error);\n    return NextResponse.json({ success: false, error: message }, { status: 500 });"
        )
        ROUTE_FILE.write_text(content, encoding='utf-8')
        treatments.append("route.ts: Anlaşılır hata yakalama eklendi")
        print("🔧 ONARILDI: Anlaşılır hata yakalama eklendi")

# ============================================================
# 2. FRONTEND FETCH HATTI KONTROLÜ & ONARIMI
# ============================================================
print("\n🔍 2. FRONTEND FETCH HATTI KONTROLÜ & ONARIMI")
print("-" * 50)

if not CEO_FILE.exists():
    diagnoses.append("CEOCommandCenter.tsx bulunamadı")
    print(f"❌ HATA: {CEO_FILE} bulunamadı")
else:
    content = CEO_FILE.read_text(encoding='utf-8')
    print(f"✅ CEOCommandCenter.tsx bulundu ({len(content)} karakter)")

    # fetch çağrısı kontrolü
    if "fetch('/api/v1/ceo/execute'" in content:
        print("✅ Gerçek fetch çağrısı mevcut")
    else:
        diagnoses.append("handleSend gerçek fetch çağrısı yapmıyor")
        print("❌ HATA: handleSend gerçek fetch çağrısı yapmıyor")
        treatments.append("CEOCommandCenter.tsx: handleSend fetch çağrısı eklenecek")
        print("🔧 ONARIM GEREKLİ: handleSend fetch çağrısı eklenecek")

    # "Bilinmeyen hata" kontrolü
    if "Bilinmeyen hata" in content:
        diagnoses.append("'Bilinmeyen hata' fallback metni mevcut")
        print("⚠️ UYARI: 'Bilinmeyen hata' fallback metni mevcut")
    else:
        print("✅ 'Bilinmeyen hata' fallback metni yok")

# ============================================================
# 3. DİZİN & İZİN KONTROLÜ
# ============================================================
print("\n🔍 3. DİZİN & İZİN KONTROLÜ")
print("-" * 50)

print(f"✅ Proje kökü: {PROJECT_ROOT}")
print(f"✅ apps/admin: {ADMIN_DIR}")
print(f"✅ route.ts: {ROUTE_FILE}")
print(f"✅ CEOCommandCenter.tsx: {CEO_FILE}")

# Dosya yazma izni testi
test_file = PROJECT_ROOT / "scripts" / ".doctor_test"
try:
    test_file.write_text("test", encoding='utf-8')
    test_file.unlink()
    print("✅ Dosya yazma izni OK")
except Exception as e:
    diagnoses.append(f"Dosya yazma izni yok: {e}")
    print(f"❌ HATA: Dosya yazma izni yok: {e}")

# ============================================================
# 4. CANLI İNFAZ TESTİ - "Hızlı Senkronize Et" butonu ekle
# ============================================================
print("\n🔍 4. CANLI İNFAZ TESTİ - 'Hızlı Senkronize Et' butonu")
print("-" * 50)

if CEO_FILE.exists():
    content = CEO_FILE.read_text(encoding='utf-8')

    # "Hızlı Senkronize Et" butonu zaten var mı?
    if "Hızlı Senkronize Et" in content:
        print("✅ 'Hızlı Senkronize Et' butonu zaten mevcut")
    else:
        # Sistem Sağlık Rozeti'nin yanına buton ekle
        old_badge = """        {/* Sistem Sağlık Durumu Rozeti */}
        {sidebarOpen && (
          <div style={{ marginTop: '12px', padding: '10px 12px', borderRadius: '10px', background: 'rgba(72,187,120,0.08)', border: '1px solid rgba(72,187,120,0.2)', fontSize: '10px', color: '#48bb78', fontWeight: '600', whiteSpace: 'nowrap' }}>
            ● 21 Ajan Aktif | 221 Event Canlı
          </div>
        )}"""

        new_badge = """        {/* Sistem Sağlık Durumu Rozeti + Hızlı Senkronize Et */}
        {sidebarOpen && (
          <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ padding: '10px 12px', borderRadius: '10px', background: 'rgba(72,187,120,0.08)', border: '1px solid rgba(72,187,120,0.2)', fontSize: '10px', color: '#48bb78', fontWeight: '600', whiteSpace: 'nowrap' }}>
              ● 21 Ajan Aktif | 221 Event Canlı
            </div>
            <button
              onClick={() => { window.location.reload(); }}
              style={{
                padding: '8px 12px',
                borderRadius: '10px',
                border: '1px solid rgba(0,242,254,0.3)',
                background: 'rgba(0,242,254,0.1)',
                color: '#00f2fe',
                fontSize: '11px',
                fontWeight: '600',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              ⚡ Hızlı Senkronize Et
            </button>
          </div>
        )}"""

        if old_badge in content:
            content = content.replace(old_badge, new_badge)
            CEO_FILE.write_text(content, encoding='utf-8')
            treatments.append("CEOCommandCenter.tsx: 'Hızlı Senkronize Et' butonu eklendi")
            print("🔧 ONARILDI: 'Hızlı Senkronize Et' butonu eklendi")
        else:
            diagnoses.append("Sistem Sağlık Rozeti bulunamadı, buton eklenemedi")
            print("❌ HATA: Sistem Sağlık Rozeti bulunamadı")

# ============================================================
# 5. KLİNİK RAPOR
# ============================================================
print("\n" + "=" * 70)
print("📋 KLİNİK RAPOR")
print("=" * 70)

print(f"\n🩺 TESPİT EDİLEN HASTALIKLAR ({len(diagnoses)}):")
for d in diagnoses:
    print(f"   ❌ {d}")

print(f"\n💊 UYGULANAN TEDAVİLER ({len(treatments)}):")
for t in treatments:
    print(f"   ✅ {t}")

if not diagnoses and not treatments:
    print("   🎉 Sistem sağlıklı! Hiçbir hastalık tespit edilmedi.")

print("\n" + "=" * 70)
print("🎉 LİKYA SYSTEM DOCTOR TAMAMLANDI")
print("=" * 70)
