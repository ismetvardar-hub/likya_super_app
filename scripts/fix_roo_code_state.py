import sqlite3
import json
import os

db_path = '/Users/ismetvardar/Library/Application Support/Code/User/globalStorage/state.vscdb'

if not os.path.exists(db_path):
    print(f"Error: {db_path} does not exist")
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# 1. Fetch current Roo Code state
cursor.execute('SELECT value FROM ItemTable WHERE key = "RooVeterinaryInc.roo-cline"')
row = cursor.fetchone()

if row:
    state = json.loads(row[0])
else:
    state = {}

# 2. Inject perfect working Ollama & OpenAI Compatible configuration
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

state['ollamaBaseUrl'] = 'http://127.0.0.1:11434'
state['ollamaModelId'] = 'qwen2.5-coder:7b'
state['mode'] = 'code'
state['currentApiConfigName'] = 'ollama-local'

state['listApiConfigMeta'] = [
    {
        'id': 'ollama-local-id',
        'name': 'ollama-local',
        'apiProvider': 'openai-compatible',
        'openAiBaseUrl': 'http://127.0.0.1:11434/v1',
        'openAiModelId': 'qwen2.5-coder:7b',
        'openAiApiKey': 'ollama'
    }
]

# Clear old task histories that could be in paused state
state['taskHistory'] = []

# Write back to SQLite
cursor.execute('UPDATE ItemTable SET value = ? WHERE key = "RooVeterinaryInc.roo-cline"', (json.dumps(state),))
conn.commit()
print("✅ Successfully injected OpenAI-compatible Ollama configuration into Roo Code state.vscdb!")

conn.close()
