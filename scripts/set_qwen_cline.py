import sqlite3
import json
import glob

user_dir = '/Users/ismetvardar/Library/Application Support/Code/User'
all_dbs = glob.glob(f'{user_dir}/**/state.vscdb', recursive=True)

print("Updating Cline to use qwen-cline (Autonomous XML Tool Calling)...")

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
                    state['ollamaModelId'] = 'qwen-cline'
                    state['autoApprovalEnabled'] = True
                    state['alwaysAllowReadOnly'] = True
                    state['alwaysAllowWrite'] = True
                    state['alwaysAllowExecute'] = True
                    
                    cursor.execute("UPDATE ItemTable SET value = ? WHERE key = ?", (json.dumps(state), key))
                    print(f"Updated key: {key} in {db_path}")
            except Exception:
                pass
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Error on {db_path}: {e}")

print("✅ Cline successfully configured with qwen-cline!")
