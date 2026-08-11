import sqlite3
import json

db_path = '/Users/ismetvardar/Library/Application Support/Code/User/globalStorage/state.vscdb'

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

cursor.execute('SELECT value FROM ItemTable WHERE key = "saoudrizwan.claude-dev"')
row = cursor.fetchone()

state = json.loads(row[0]) if row else {}

# Set OpenAI-Compatible for Cline (Streaming SSE - Zero Timeout)
state['apiProvider'] = 'openai-compatible'
state['openAiBaseUrl'] = 'http://127.0.0.1:11434/v1'
state['openAiModelId'] = 'qwen2.5-coder:7b'
state['openAiApiKey'] = 'ollama'
state['openAiCustomModelInfo'] = {
    'maxTokens': 8192,
    'contextWindow': 32768,
    'supportsImages': False,
    'supportsPromptCache': False
}
state['welcomeViewCompleted'] = True
state['autoApprovalEnabled'] = True
state['alwaysAllowReadOnly'] = True
state['alwaysAllowWrite'] = True
state['alwaysAllowExecute'] = True

cursor.execute('INSERT OR REPLACE INTO ItemTable (key, value) VALUES ("saoudrizwan.claude-dev", ?)', (json.dumps(state),))
conn.commit()
conn.close()

print("✅ Cline updated to OpenAI-Compatible mode with Zero Timeout!")
