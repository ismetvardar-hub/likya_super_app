import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

// ============================================================================
// LİKYA CEO YEREL İNFAZ ROUTE'U (Next.js App Router)
// FastAPI/Uvicorn bağımlılığı olmadan doğrudan dosya yazma/okuma
// ============================================================================

// Dinamik PROJECT_ROOT çözümlemesi - hangi dizinden çalıştırılırsa çalıştırılsın
const PROJECT_ROOT = path.resolve(process.cwd(), process.cwd().endsWith('apps/admin') ? '../..' : '.');

const ALLOWED_EXTENSIONS = ['.tsx', '.ts', '.dart', '.py', '.js', '.jsx', '.css', '.md', '.json', '.yaml', '.yml', '.sql'];
const ALLOWED_DIRS = ['apps', 'src', 'scripts', 'supabase', 'docs'];

function isSafePath(filePath: string): boolean {
  const resolved = path.resolve(PROJECT_ROOT, filePath);
  return resolved.startsWith(PROJECT_ROOT);
}

function isAllowedExtension(filePath: string): boolean {
  const ext = path.extname(filePath);
  return ALLOWED_EXTENSIONS.includes(ext);
}

function analyzeCommand(command: string): { action: string; file_path?: string; directory?: string } {
  const lower = command.toLowerCase();

  // Dosya yazma komutu tespiti
  const writePatterns = [
    /(?:oluştur|yaz|ekle|güncelle|değiştir|tasarla)\s+(?:bir\s+)?(?:dosya|bileşen|component|ekran|modül|widget|screen)\s+([\w/.-]+)/,
    /(?:oluştur|yaz|ekle)\s+([\w/.-]+\.(?:tsx|ts|dart|py|js|jsx|css|md|json|sql))/,
  ];
  for (const pattern of writePatterns) {
    const match = lower.match(pattern);
    if (match) {
      let filePath = match[1];
      if (!ALLOWED_EXTENSIONS.some((ext) => filePath.endsWith(ext))) {
        filePath = `apps/admin/src/app/components/${filePath}.tsx`;
      }
      return { action: 'write_file', file_path: filePath };
    }
  }

  // Dosya okuma komutu tespiti
  const readPatterns = [
    /(?:oku|incele|göster|aç)\s+(?:dosyayı\s+)?([\w/.-]+\.(?:tsx|ts|dart|py|js|jsx|css|md|json|sql))/,
  ];
  for (const pattern of readPatterns) {
    const match = lower.match(pattern);
    if (match) {
      return { action: 'read_file', file_path: match[1] };
    }
  }

  // Dosya listeleme komutu
  if (lower.includes('listele') || lower.includes('dosyaları göster')) {
    return { action: 'list_files', directory: 'apps/admin/src/app/components' };
  }

  return { action: 'analyze_only' };
}

export async function POST(request: NextRequest) {
  try {
    // Güvenli JSON parse
    let body: { command?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Geçersiz JSON gövdesi' }, { status: 400 });
    }
    const command = body.command || '';

    if (!command) {
      return NextResponse.json({ success: false, error: 'Komut boş olamaz' }, { status: 400 });
    }

    const analysis = analyzeCommand(command);

    if (analysis.action === 'write_file' && analysis.file_path) {
      const filePath = analysis.file_path;
      if (!isSafePath(filePath)) {
        return NextResponse.json({ success: false, error: 'Güvenli olmayan yol' }, { status: 400 });
      }
      if (!isAllowedExtension(filePath)) {
        return NextResponse.json({ success: false, error: 'İzin verilmeyen dosya türü' }, { status: 400 });
      }

      const fullPath = path.resolve(PROJECT_ROOT, filePath);

      // Gemini LLM ile kod üretimi
      const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
      let finalContent = '';

      if (apiKey) {
        try {
          const genAI = new GoogleGenerativeAI(apiKey);
          const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

          // Hedef dosyayı oku (varsa)
          let existingContent = '';
          try {
            existingContent = await fs.readFile(fullPath, 'utf-8');
          } catch {
            existingContent = '';
          }

          const prompt = `Sen Likya Kampüsü'nün baş yazılım mühendisisin. Kullanıcının şu talimatına göre dosyayı güncelle:

TALİMAT: ${command}

HEDEF DOSYA: ${filePath}

MEVCUT İÇERİK:
${existingContent || '(Dosya yok, yeni oluşturulacak)'}

KURALLAR:
1. Sadece ve sadece tam güncellenmiş dosya içeriğini döndür.
2. Açıklama, yorum veya markdown kullanma.
3. TypeScript/React bileşeni ise 'use client' direktifi ile başla.
4. Koyu mod, glassmorphism ve neon renkler (#00f2fe, #10B981, #F27A1A, #8B5CF6) kullan.
5. Eksiksiz ve çalışan kod üret.`;

          const result = await model.generateContent(prompt);
          finalContent = result.response.text().trim();
        } catch (e) {
          // Gemini başarısız olursa basit şablon kullan
          finalContent = `// ${filePath} - Likya CEO tarafından oluşturuldu
'use client';

import React from 'react';

export default function GeneratedComponent() {
  return (
    <div style={{
      padding: '20px',
      background: 'rgba(255,255,255,0.03)',
      borderRadius: '16px',
      border: '1px solid rgba(255,255,255,0.1)',
    }}>
      <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff' }}>
        🎯 Likya CEO Komutuyla Oluşturuldu
      </h2>
      <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>
        Komut: ${command}
      </p>
    </div>
  );
}
`;
        }
      } else {
        // API key yoksa basit şablon
        finalContent = `// ${filePath} - Likya CEO tarafından oluşturuldu
'use client';

import React from 'react';

export default function GeneratedComponent() {
  return (
    <div style={{
      padding: '20px',
      background: 'rgba(255,255,255,0.03)',
      borderRadius: '16px',
      border: '1px solid rgba(255,255,255,0.1)',
    }}>
      <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff' }}>
        🎯 Likya CEO Komutuyla Oluşturuldu
      </h2>
      <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>
        Komut: ${command}
      </p>
    </div>
  );
}
`;
      }

      await fs.mkdir(path.dirname(fullPath), { recursive: true });
      await fs.writeFile(fullPath, finalContent, 'utf-8');

      return NextResponse.json({
        success: true,
        file: filePath,
        action: apiKey ? 'LLM tarafından güncellendi' : 'written',
        bytes_written: Buffer.byteLength(finalContent, 'utf-8'),
        message: apiKey ? 'Gemini LLM ile güncellendi' : 'Dosya başarıyla oluşturuldu',
      });
    }

    if (analysis.action === 'read_file' && analysis.file_path) {
      const filePath = analysis.file_path;
      if (!isSafePath(filePath)) {
        return NextResponse.json({ success: false, error: 'Güvenli olmayan yol' }, { status: 400 });
      }
      const fullPath = path.resolve(PROJECT_ROOT, filePath);
      try {
        const content = await fs.readFile(fullPath, 'utf-8');
        return NextResponse.json({
          success: true,
          file: filePath,
          action: 'read',
          content: content.slice(0, 5000),
        });
      } catch {
        return NextResponse.json({ success: false, error: `Dosya bulunamadı: ${filePath}` }, { status: 404 });
      }
    }

    if (analysis.action === 'list_files' && analysis.directory) {
      const dirPath = analysis.directory;
      const fullPath = path.resolve(PROJECT_ROOT, dirPath);
      try {
        const files = await fs.readdir(fullPath);
        return NextResponse.json({
          success: true,
          directory: dirPath,
          files: files.slice(0, 100),
        });
      } catch {
        return NextResponse.json({ success: false, error: `Dizin bulunamadı: ${dirPath}` }, { status: 404 });
      }
    }

    return NextResponse.json({
      success: false,
      action: 'analyze_only',
      message: 'Komut analiz edildi. Dosya işlemi belirlenemedi.',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
