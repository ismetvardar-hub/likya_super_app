import sqlite3
import json
import glob

user_dir = '/Users/ismetvardar/Library/Application Support/Code/User'
all_dbs = glob.glob(f'{user_dir}/**/state.vscdb', recursive=True)

custom_instruction = """CRITICAL: You MUST use XML tool tags to execute actions.
When writing or creating files, you MUST ONLY output:
<write_to_file>
<path>filepath</path>
<content>
file content
</content>
</write_to_file>

DO NOT output JSON. DO NOT output {"name": "editor"}. Always use <write_to_file>.
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
                    state['customInstructions'] = custom_instruction
                    cursor.execute("UPDATE ItemTable SET value = ? WHERE key = ?", (json.dumps(state), key))
                    print(f"Updated customInstructions in {db_path}")
            except Exception:
                pass
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Error on {db_path}: {e}")

print("✅ Custom instructions injected into Cline!")
