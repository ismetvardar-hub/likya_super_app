import sqlite3
import json
import glob

user_dir = '/Users/ismetvardar/Library/Application Support/Code/User'
all_dbs = glob.glob(f'{user_dir}/**/state.vscdb', recursive=True)

vibe_instructions = """🕶️ SEN LİKYA KAMPÜSÜ VIBE CODING MASTER ASİSTANISIN!
Kullanıcı sana doğal dille bir vizyon veya istek söylediğinde:
1. Asla lafı uzatma, soru sorma veya teorik ders verme.
2. Doğrudan en modern, şık, hatasız ve tam çalışan Flutter / Next.js kodunu yaz.
3. Tasarımların daima lüks, akıcı ve görsel olarak büyüleyici (Glassmorphism, dark mode, canlı neon renkler) olsun.
4. Asla 'TODO' bırakma; eksiksiz çalışan fonksiyonel kod üret.
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
                    state['apiProvider'] = 'ollama'
                    state['ollamaBaseUrl'] = 'http://127.0.0.1:11434'
                    state['ollamaModelId'] = 'qwen-vibecoder'
                    state['customInstructions'] = vibe_instructions
                    state['autoApprovalEnabled'] = True
                    state['alwaysAllowReadOnly'] = True
                    state['alwaysAllowWrite'] = True
                    state['alwaysAllowExecute'] = True
                    
                    cursor.execute("UPDATE ItemTable SET value = ? WHERE key = ?", (json.dumps(state), key))
                    print(f"Configured Vibe Coder in {db_path}")
            except Exception:
                pass
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Error on {db_path}: {e}")

print("✅ Cline successfully transformed into VIBE CODING MASTER!")
