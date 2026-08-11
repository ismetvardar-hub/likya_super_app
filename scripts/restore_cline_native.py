import sqlite3
import json
import glob

user_dir = '/Users/ismetvardar/Library/Application Support/Code/User'
all_dbs = glob.glob(f'{user_dir}/**/state.vscdb', recursive=True)

print("Restoring Cline to original native Ollama state...")

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
                    # Restore exact native Ollama provider
                    state['apiProvider'] = 'ollama'
                    state['ollamaBaseUrl'] = 'http://127.0.0.1:11434'
                    state['ollamaModelId'] = 'qwen2.5-coder:7b'
                    state['planModeApiProvider'] = 'ollama'
                    state['actModeApiProvider'] = 'ollama'
                    state['welcomeViewCompleted'] = True
                    
                    cursor.execute("UPDATE ItemTable SET value = ? WHERE key = ?", (json.dumps(state), key))
                    print(f"Restored key: {key} in {db_path}")
            except Exception:
                pass
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Error on {db_path}: {e}")

print("✅ Cline successfully restored to native Ollama mode!")
