import sqlite3
import json
import glob
import os

user_dir = '/Users/ismetvardar/Library/Application Support/Code/User'
all_dbs = glob.glob(f'{user_dir}/**/state.vscdb', recursive=True)

print(f"Found {len(all_dbs)} state.vscdb databases.")

for db_path in all_dbs:
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Check for claude-dev / cline keys
        cursor.execute("SELECT key, value FROM ItemTable WHERE key LIKE '%claude-dev%' OR key LIKE '%cline%'")
        rows = cursor.fetchall()
        
        if rows:
            print(f"\nProcessing DB: {db_path}")
            for key, val in rows:
                print(f"  Key found: {key}")
                try:
                    state = json.loads(val)
                    if isinstance(state, dict):
                        state['apiProvider'] = 'openAi'
                        state['openAiBaseUrl'] = 'http://127.0.0.1:11434/v1'
                        state['openAiModelId'] = 'qwen2.5-coder:7b'
                        state['openAiApiKey'] = 'ollama'
                        state['openAiCustomModelInfo'] = {
                            'maxTokens': 8192,
                            'contextWindow': 32768,
                            'supportsImages': False,
                            'supportsPromptCache': False
                        }
                        state['planModeApiProvider'] = 'openAi'
                        state['actModeApiProvider'] = 'openAi'
                        state['welcomeViewCompleted'] = True
                        state['autoApprovalEnabled'] = True
                        state['alwaysAllowReadOnly'] = True
                        state['alwaysAllowWrite'] = True
                        state['alwaysAllowExecute'] = True
                        
                        cursor.execute("UPDATE ItemTable SET value = ? WHERE key = ?", (json.dumps(state), key))
                        print(f"  -> Successfully updated key {key} to OpenAI Compatible (http://127.0.0.1:11434/v1)")
                except Exception as e:
                    # Might be raw buffer or string
                    pass
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Error accessing {db_path}: {e}")

print("\n🎉 ALL Cline configurations have been enforced across all SQLite databases!")
