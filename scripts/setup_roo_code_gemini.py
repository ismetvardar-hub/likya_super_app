import sqlite3
import json
import glob
import os

user_dir = '/Users/ismetvardar/Library/Application Support/Code/User'
all_dbs = glob.glob(f'{user_dir}/**/state.vscdb', recursive=True)

roo_instructions = """🌲 SEN LİKYA KAMPÜSÜ'NÜN BAŞ OTONOM YAZILIM MÜHENDİSİSİN (ROO CODE + GOOGLE GEMINI PRO)!
Kullanıcı sana ne isterse anında eksiksiz ve çalışan Next.js, Flutter ve Supabase kodunu yaz.
Asla soru sorma veya lafı uzatma; doğrudan ilgili dosyaları aç ve kodu güncelle.

Likya Mimarisi:
- 4 Rol: Patron (CEO), Kiracı (16 Dükkan), Çalışan (Saha IoT), Müşteri.
- Müşteri Ekranları Modülerdir: apps/admin/src/app/customer/components/ (WeatherWidget, ShoppingTab, UpcyclingTab, FoodTab, AccommodationTab, SportsTab, TicketsTab, WalletTab).
"""

for db_path in all_dbs:
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        cursor.execute("SELECT key, value FROM ItemTable WHERE key LIKE '%roo%' OR key LIKE '%claude-dev%'")
        rows = cursor.fetchall()
        
        # Eğer henüz roo anahtarı yoksa temel anahtarı oluşturalım
        found_roo = False
        for key, val in rows:
            if 'roo' in key:
                found_roo = True
            try:
                state = json.loads(val)
                if isinstance(state, dict):
                    state['apiProvider'] = 'gemini'
                    state['apiModelId'] = 'gemini-2.0-flash'
                    state['planModeApiProvider'] = 'gemini'
                    state['actModeApiProvider'] = 'gemini'
                    state['customInstructions'] = roo_instructions
                    state['autoApprovalEnabled'] = True
                    state['alwaysAllowReadOnly'] = True
                    state['alwaysAllowWrite'] = True
                    state['alwaysAllowExecute'] = True
                    state['alwaysAllowBrowser'] = True
                    state['alwaysAllowMcp'] = True
                    
                    cursor.execute("UPDATE ItemTable SET value = ? WHERE key = ?", (json.dumps(state), key))
                    print(f"Updated Gemini config for {key} in {db_path}")
            except Exception:
                pass
        
        # Yeni Roo Code yapılandırması ekle
        roo_state = {
            "apiProvider": "gemini",
            "apiModelId": "gemini-2.0-flash",
            "planModeApiProvider": "gemini",
            "actModeApiProvider": "gemini",
            "customInstructions": roo_instructions,
            "autoApprovalEnabled": True,
            "alwaysAllowReadOnly": True,
            "alwaysAllowWrite": True,
            "alwaysAllowExecute": True,
            "alwaysAllowBrowser": True,
            "alwaysAllowMcp": True
        }
        cursor.execute("INSERT OR REPLACE INTO ItemTable (key, value) VALUES (?, ?)", 
                       ("rooveterinaryinc.roo-cline", json.dumps(roo_state)))
        cursor.execute("INSERT OR REPLACE INTO ItemTable (key, value) VALUES (?, ?)", 
                       ("roo-cline", json.dumps(roo_state)))
        
        conn.commit()
        conn.close()
        print(f"✅ Injected Roo Code Gemini config into {db_path}")
    except Exception as e:
        print(f"Error on {db_path}: {e}")

print("\n🚀 ROO CODE GOOGLE GEMINI İLE BAŞARIYLA KURULDU VE YAPILANDIRILDI!")
