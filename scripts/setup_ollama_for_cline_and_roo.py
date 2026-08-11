import sqlite3
import json
import glob
import os

user_dir = '/Users/ismetvardar/Library/Application Support/Code/User'
all_dbs = glob.glob(f'{user_dir}/**/state.vscdb', recursive=True)

ollama_instructions = """🌲 SEN LİKYA KAMPÜSÜ'NÜN BAŞ YAZILIM MÜHENDİSİSİN (QWEN-CODER 7B)!
Kullanıcı sana ne isterse anında eksiksiz Next.js, Flutter ve Supabase kodunu yaz.
Asla soru sorma veya lafı uzatma; doğrudan ilgili dosyaları aç ve kodu güncelle.

Müşteri Ekranları Modülerdir (apps/admin/src/app/customer/components/):
- WeatherWidget.tsx, ShoppingTab.tsx, UpcyclingTab.tsx, FoodTab.tsx, AccommodationTab.tsx, SportsTab.tsx, TicketsTab.tsx, WalletTab.tsx.
Her dosya 50 satırdır, hızla düzenle ve kaydet.
"""

for db_path in all_dbs:
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        cursor.execute("SELECT key, value FROM ItemTable WHERE key LIKE '%roo%' OR key LIKE '%claude-dev%'")
        rows = cursor.fetchall()
        
        for k, v in rows:
            try:
                state = json.loads(v)
                if isinstance(state, dict):
                    state['apiProvider'] = 'ollama'
                    state['ollamaModelId'] = 'qwen2.5-coder:7b'
                    state['ollamaBaseUrl'] = 'http://localhost:11434'
                    state['apiModelId'] = 'qwen2.5-coder:7b'
                    state['planModeApiProvider'] = 'ollama'
                    state['actModeApiProvider'] = 'ollama'
                    state['customInstructions'] = ollama_instructions
                    state['autoApprovalEnabled'] = True
                    state['alwaysAllowReadOnly'] = True
                    state['alwaysAllowWrite'] = True
                    state['alwaysAllowExecute'] = True
                    state['alwaysAllowBrowser'] = True
                    state['alwaysAllowMcp'] = True
                    cursor.execute("UPDATE ItemTable SET value = ? WHERE key = ?", (json.dumps(state), k))
            except Exception:
                pass
        
        ollama_cfg = {
            'apiProvider': 'ollama',
            'ollamaModelId': 'qwen2.5-coder:7b',
            'ollamaBaseUrl': 'http://localhost:11434',
            'apiModelId': 'qwen2.5-coder:7b',
            'planModeApiProvider': 'ollama',
            'actModeApiProvider': 'ollama',
            'customInstructions': ollama_instructions,
            'autoApprovalEnabled': True,
            'alwaysAllowReadOnly': True,
            'alwaysAllowWrite': True,
            'alwaysAllowExecute': True,
            'alwaysAllowBrowser': True,
            'alwaysAllowMcp': True
        }
        cursor.execute("INSERT OR REPLACE INTO ItemTable (key, value) VALUES (?, ?)", ('rooveterinaryinc.roo-cline', json.dumps(ollama_cfg)))
        cursor.execute("INSERT OR REPLACE INTO ItemTable (key, value) VALUES (?, ?)", ('roo-cline', json.dumps(ollama_cfg)))
        cursor.execute("INSERT OR REPLACE INTO ItemTable (key, value) VALUES (?, ?)", ('saoudrizwan.claude-dev', json.dumps(ollama_cfg)))
        
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Error on {db_path}: {e}")

print("✅ ROO CODE VE CLINE OLLAMA (QWEN2.5-CODER:7B) MODUNA GEÇİRİLDİ!")
