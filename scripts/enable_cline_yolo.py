import sqlite3
import json
import glob
import os

user_dir = '/Users/ismetvardar/Library/Application Support/Code/User'
all_dbs = glob.glob(f'{user_dir}/**/state.vscdb', recursive=True)

print("Enabling 100% Auto-Approve (YOLO Mode) for Cline...")

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
                    # 100% Full Auto-Approval (Zero Prompts, Zero Clicks)
                    state['autoApprovalEnabled'] = True
                    state['alwaysAllowReadOnly'] = True
                    state['alwaysAllowReadOnlyOutsideWorkspace'] = True
                    state['alwaysAllowWrite'] = True
                    state['alwaysAllowWriteOutsideWorkspace'] = True
                    state['alwaysAllowWriteProtected'] = True
                    state['alwaysAllowExecute'] = True
                    state['alwaysAllowBrowser'] = True
                    state['alwaysAllowMcp'] = True
                    state['alwaysAllowModeSwitch'] = True
                    state['alwaysAllowSubtasks'] = True
                    state['alwaysAllowFollowupQuestions'] = True
                    state['writeDelayMs'] = 0
                    state['requestDelaySeconds'] = 0
                    
                    cursor.execute("UPDATE ItemTable SET value = ? WHERE key = ?", (json.dumps(state), key))
                    print(f"Updated YOLO auto-approve in {db_path} for key {key}")
            except Exception:
                pass
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Error on {db_path}: {e}")

print("✅ Cline Auto-Approve (YOLO Mode) is now 100% ENABLED everywhere!")
