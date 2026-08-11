import sqlite3
import json
import glob

user_dir = '/Users/ismetvardar/Library/Application Support/Code/User'
all_dbs = glob.glob(f'{user_dir}/**/state.vscdb', recursive=True)

gemini_instructions = """🌲 SEN LİKYA KAMPÜSÜ'NÜN BAŞ YAZILIM MÜHENDİSİSİN (GOOGLE GEMINI PRO)!
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
        
        cursor.execute("SELECT key, value FROM ItemTable WHERE key LIKE '%claude-dev%'")
        rows = cursor.fetchall()
        
        for key, val in rows:
            try:
                state = json.loads(val)
                if isinstance(state, dict):
                    state['apiProvider'] = 'gemini'
                    state['apiModelId'] = 'gemini-2.0-flash'
                    state['planModeApiProvider'] = 'gemini'
                    state['actModeApiProvider'] = 'gemini'
                    state['customInstructions'] = gemini_instructions
                    state['autoApprovalEnabled'] = True
                    state['alwaysAllowReadOnly'] = True
                    state['alwaysAllowWrite'] = True
                    state['alwaysAllowExecute'] = True
                    
                    cursor.execute("UPDATE ItemTable SET value = ? WHERE key = ?", (json.dumps(state), key))
                    print(f"Configured Gemini in {db_path}")
            except Exception:
                pass
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Error on {db_path}: {e}")

print("✅ Cline successfully switched to GOOGLE GEMINI!")
