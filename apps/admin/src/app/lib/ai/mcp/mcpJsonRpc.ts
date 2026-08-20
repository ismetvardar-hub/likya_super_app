// ============================================================================
// 🛰️ MCP JSON-RPC 2.0 ROUTER — Claude Desktop / Cursor / local ajanlarla
// protokol uyumlu haberleşme katmanı
// Desteklenen methodlar: initialize • tools/list • tools/call •
// resources/list • resources/read • ping
// ============================================================================
import { listMcpTools, listMcpResources, readMcpResource, findMcpTool, mcpServerDefinitionStatus } from './mcpServerDefinition';

export interface JsonRpcRequest {
  jsonrpc: '2.0';
  id: string | number;
  method: string;
  params?: Record<string, unknown>;
}
export interface JsonRpcResponse {
  jsonrpc: '2.0';
  id: string | number;
  result?: unknown;
  error?: { code: number; message: string };
}

export function handleJsonRpc(req: JsonRpcRequest): JsonRpcResponse {
  const respond = (result: unknown): JsonRpcResponse => ({ jsonrpc: '2.0', id: req.id, result });
  const fail = (code: number, message: string): JsonRpcResponse => ({ jsonrpc: '2.0', id: req.id, error: { code, message } });

  switch (req.method) {
    case 'initialize':
      return respond({
        protocolVersion: '2024-11-05',
        capabilities: { tools: { listChanged: false }, resources: { subscribe: false } },
        serverInfo: { name: 'likya-mcp-bridge', version: '1.0.0' },
      });
    case 'ping':
      return respond('pong');
    case 'tools/list':
      return respond({ tools: listMcpTools() });
    case 'tools/call': {
      const p = req.params ?? {};
      const tool = findMcpTool(String(p.name ?? ''));
      if (!tool) return fail(-32602, `Bilinmeyen tool: ${String(p.name)}`);
      const args = (p.arguments ?? {}) as Record<string, unknown>;
      return respond({ content: [{ type: 'text', text: JSON.stringify(tool.handler(args)) }], isError: false });
    }
    case 'resources/list':
      return respond({ resources: listMcpResources() });
    case 'resources/read': {
      const uri = String((req.params ?? {}).uri ?? '');
      const content = readMcpResource(uri);
      if (content === null) return fail(-32602, `Bilinmeyen resource: ${uri}`);
      return respond({ contents: [{ uri, mimeType: 'application/json', text: content }] });
    }
    default:
      return fail(-32601, `Metod desteklenmiyor: ${req.method}`);
  }
}

// ── Stdio benzeri transport: satır bazlı JSON-RPC işleme ────────────────────
export function handleLine(line: string): string | null {
  try {
    const req = JSON.parse(line) as JsonRpcRequest;
    if (req.jsonrpc !== '2.0' || !req.method) return null;
    return JSON.stringify(handleJsonRpc(req));
  } catch {
    return null;
  }
}

export function mcpBridgeStatus(): string {
  return `MCP Bridge: ${mcpServerDefinitionStatus()}; JSON-RPC 2.0 router aktif`;
}
