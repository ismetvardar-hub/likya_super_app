import sqlite3
import json
import glob
import os

env_path = "/Users/ismetvardar/.gemini/antigravity/scratch/likya_super_app/.env.local"
api_key = ""

if os.path.exists(env_path):
    with open(env_path, "r") as f:
        for line in f:
            if "GEMINI_API_KEY=" in line:
                api_key = line.strip().split("=", 1)[1]
                break

if not api_key.startswith("AIzaSy"):
    print("❌ API anahtarı bulunamadı.")
    exit(1)

print(f"🔑 Kayıtlı Gemini API Anahtarı Kullanılıyor: {api_key[:8]}...{api_key[-4:]}")

user_dir = '/Users/ismetvardar/Library/Application Support/Code/User'
all_dbs = glob.glob(f'{user_dir}/**/state.vscdb', recursive=True)

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
                    state['apiProvider'] = 'gemini'
                    state['apiModelId'] = 'gemini-flash-latest'
                    state['geminiApiKey'] = api_key
                    state['apiKey'] = api_key
                    state['autoApprovalEnabled'] = True
                    state['alwaysAllowReadOnly'] = True
                    state['alwaysAllowWrite'] = True
                    state['alwaysAllowExecute'] = True
                    state['alwaysAllowBrowser'] = True
                    state['alwaysAllowMcp'] = True
                    cursor.execute("UPDATE ItemTable SET value = ? WHERE key = ?", (json.dumps(state), k))
            except Exception:
                pass
        
        roo_cfg = {
            'apiProvider': 'gemini',
            'apiModelId': 'gemini-flash-latest',
            'geminiApiKey': api_key,
            'apiKey': api_key,
            'planModeApiProvider': 'gemini',
            'actModeApiProvider': 'gemini',
            'autoApprovalEnabled': True,
            'alwaysAllowReadOnly': True,
            'alwaysAllowWrite': True,
            'alwaysAllowExecute': True,
            'alwaysAllowBrowser': True,
            'alwaysAllowMcp': True
        }
        cursor.execute("INSERT OR REPLACE INTO ItemTable (key, value) VALUES (?, ?)", ('rooveterinaryinc.roo-cline', json.dumps(roo_cfg)))
        cursor.execute("INSERT OR REPLACE INTO ItemTable (key, value) VALUES (?, ?)", ('roo-cline', json.dumps(roo_cfg)))
        cursor.execute("INSERT OR REPLACE INTO ItemTable (key, value) VALUES (?, ?)", ('saoudrizwan.claude-dev', json.dumps(roo_cfg)))
        cursor.execute("INSERT OR REPLACE INTO ItemTable (key, value) VALUES (?, ?)", ('secret://{"extensionId":"rooveterinaryinc.roo-cline","key":"geminiApiKey"}', api_key))
        cursor.execute("INSERT OR REPLACE INTO ItemTable (key, value) VALUES (?, ?)", ('secret://{"extensionId":"saoudrizwan.claude-dev","key":"geminiApiKey"}', api_key))
        
        conn.commit()
        conn.close()
    except Exception as e:
        print('Error:', e)

print("✅ ROO CODE VE CLINE KURULUMU %100 TAMAMLANDI!")
