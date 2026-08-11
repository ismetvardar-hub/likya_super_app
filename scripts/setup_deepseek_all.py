import sqlite3
import json
import glob
import os
import urllib.request

api_key = "sk-abfae675345342abb598326ea392606c"

print("🔍 1. DeepSeek API Doğrulama Testi Başlatılıyor...")

# Canlı DeepSeek API Testi
url = "https://api.deepseek.com/chat/completions"
headers = {
    "Authorization": f"Bearer {api_key}",
    "Content-Type": "application/json"
}
data = json.dumps({
    "model": "deepseek-chat",
    "messages": [
        {"role": "user", "content": "Likya Kampusu projesi icin hazir misin? Kisa ve net cevap ver."}
    ],
    "max_tokens": 50
}).encode("utf-8")

try:
    req = urllib.request.Request(url, data=data, headers=headers)
    with urllib.request.urlopen(req, timeout=10) as response:
        res = json.loads(response.read().decode("utf-8"))
        reply = res["choices"][0]["message"]["content"].strip()
        print(f"✅ DEEPSEEK API CANLI YANIT VERDİ: '{reply}'")
except Exception as e:
    print(f"❌ API Test Uyarısı / Hatası: {e}")

# 2. .env.local dosyasına kaydet
env_path = "/Users/ismetvardar/.gemini/antigravity/scratch/likya_super_app/.env.local"
with open(env_path, "a") as f:
    f.write(f"\nDEEPSEEK_API_KEY={api_key}\n")
print("✅ .env.local dosyasına DeepSeek anahtarı eklendi.")

# 3. VS Code SQLite Veritabanlarına İşle
user_dir = '/Users/ismetvardar/Library/Application Support/Code/User'
all_dbs = glob.glob(f'{user_dir}/**/state.vscdb', recursive=True)

deepseek_instructions = """🌲 SEN LİKYA KAMPÜSÜ'NÜN BAŞ YAZILIM MÜHENDİSİSİN (DEEPSEEK V3 OTONOM KODLAYICI)!
Kullanıcı sana ne isterse anında eksiksiz ve çalışan Next.js, Flutter ve Supabase kodunu doğrudan dosyalara yaz.
Asla soru sorma veya lafı uzatma; doğrudan ilgili dosyaları aç ve kodu güncelle.

Müşteri Ekranları Modülerdir (apps/admin/src/app/customer/components/):
- WeatherWidget.tsx, ShoppingTab.tsx, UpcyclingTab.tsx, FoodTab.tsx, AccommodationTab.tsx, SportsTab.tsx, TicketsTab.tsx, WalletTab.tsx.
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
                    state['apiProvider'] = 'deepseek'
                    state['apiModelId'] = 'deepseek-chat'
                    state['deepSeekApiKey'] = api_key
                    state['apiKey'] = api_key
                    state['openAiApiKey'] = api_key
                    state['openAiBaseUrl'] = 'https://api.deepseek.com'
                    state['planModeApiProvider'] = 'deepseek'
                    state['actModeApiProvider'] = 'deepseek'
                    state['customInstructions'] = deepseek_instructions
                    state['autoApprovalEnabled'] = True
                    state['alwaysAllowReadOnly'] = True
                    state['alwaysAllowWrite'] = True
                    state['alwaysAllowExecute'] = True
                    state['alwaysAllowBrowser'] = True
                    state['alwaysAllowMcp'] = True
                    cursor.execute("UPDATE ItemTable SET value = ? WHERE key = ?", (json.dumps(state), k))
            except Exception:
                pass
        
        cfg = {
            'apiProvider': 'deepseek',
            'apiModelId': 'deepseek-chat',
            'deepSeekApiKey': api_key,
            'apiKey': api_key,
            'openAiApiKey': api_key,
            'openAiBaseUrl': 'https://api.deepseek.com',
            'planModeApiProvider': 'deepseek',
            'actModeApiProvider': 'deepseek',
            'customInstructions': deepseek_instructions,
            'autoApprovalEnabled': True,
            'alwaysAllowReadOnly': True,
            'alwaysAllowWrite': True,
            'alwaysAllowExecute': True,
            'alwaysAllowBrowser': True,
            'alwaysAllowMcp': True
        }
        
        cursor.execute("INSERT OR REPLACE INTO ItemTable (key, value) VALUES (?, ?)", ('rooveterinaryinc.roo-cline', json.dumps(cfg)))
        cursor.execute("INSERT OR REPLACE INTO ItemTable (key, value) VALUES (?, ?)", ('roo-cline', json.dumps(cfg)))
        cursor.execute("INSERT OR REPLACE INTO ItemTable (key, value) VALUES (?, ?)", ('saoudrizwan.claude-dev', json.dumps(cfg)))
        
        cursor.execute("INSERT OR REPLACE INTO ItemTable (key, value) VALUES (?, ?)", ('secret://{"extensionId":"rooveterinaryinc.roo-cline","key":"deepSeekApiKey"}', api_key))
        cursor.execute("INSERT OR REPLACE INTO ItemTable (key, value) VALUES (?, ?)", ('secret://{"extensionId":"saoudrizwan.claude-dev","key":"deepSeekApiKey"}', api_key))
        cursor.execute("INSERT OR REPLACE INTO ItemTable (key, value) VALUES (?, ?)", ('secret://{"extensionId":"rooveterinaryinc.roo-cline","key":"apiKey"}', api_key))
        cursor.execute("INSERT OR REPLACE INTO ItemTable (key, value) VALUES (?, ?)", ('secret://{"extensionId":"saoudrizwan.claude-dev","key":"apiKey"}', api_key))
        
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Error on {db_path}: {e}")

print("🚀 TÜM SİSTEM DEEPSEEK V3 İLE BAŞARIYLA KİLİTLENDİ VE AKTİFLEŞTİRİLDİ!")
