"""
LİKYA TOOL-CALLING / GERÇEK İNFAZ MOTORU
Chat'ten gelen komutları analiz eder ve projedeki dosyaları güvenli şekilde okur/yazar.
"""

import os
import re
import json
from typing import Dict, Any, List, Optional
from pathlib import Path

# Proje kök dizini
PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent


class ToolExecutionEngine:
    """Chat komutlarını gerçek dosya işlemlerine dönüştüren motor."""

    def __init__(self) -> None:
        self.allowed_extensions = {'.tsx', '.ts', '.dart', '.py', '.js', '.jsx', '.css', '.md', '.json', '.yaml', '.yml', '.sql'}
        self.allowed_dirs = ['apps', 'src', 'scripts', 'supabase', 'docs']

    def _is_safe_path(self, file_path: str) -> bool:
        """Dosya yolunun güvenli olduğunu kontrol eder."""
        resolved = (PROJECT_ROOT / file_path).resolve()
        return str(resolved).startswith(str(PROJECT_ROOT))

    def _is_allowed_extension(self, file_path: str) -> bool:
        """Dosya uzantısının izinli olduğunu kontrol eder."""
        ext = Path(file_path).suffix
        return ext in self.allowed_extensions

    def read_file(self, file_path: str) -> Dict[str, Any]:
        """Dosyayı okur."""
        if not self._is_safe_path(file_path):
            return {"success": False, "error": "Güvenli olmayan yol"}
        if not self._is_allowed_extension(file_path):
            return {"success": False, "error": "İzin verilmeyen dosya türü"}
        try:
            full_path = PROJECT_ROOT / file_path
            if not full_path.exists():
                return {"success": False, "error": f"Dosya bulunamadı: {file_path}"}
            content = full_path.read_text(encoding='utf-8')
            return {"success": True, "file": file_path, "content": content[:5000]}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def write_file(self, file_path: str, content: str) -> Dict[str, Any]:
        """Dosyaya yazar."""
        if not self._is_safe_path(file_path):
            return {"success": False, "error": "Güvenli olmayan yol"}
        if not self._is_allowed_extension(file_path):
            return {"success": False, "error": "İzin verilmeyen dosya türü"}
        try:
            full_path = PROJECT_ROOT / file_path
            full_path.parent.mkdir(parents=True, exist_ok=True)
            full_path.write_text(content, encoding='utf-8')
            return {"success": True, "file": file_path, "bytes_written": len(content.encode('utf-8'))}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def list_files(self, directory: str = 'apps/admin/src/app/components') -> Dict[str, Any]:
        """Dizindeki dosyaları listeler."""
        try:
            full_path = PROJECT_ROOT / directory
            if not full_path.exists():
                return {"success": False, "error": f"Dizin bulunamadı: {directory}"}
            files = [str(f.relative_to(PROJECT_ROOT)) for f in full_path.rglob('*') if f.is_file()]
            return {"success": True, "directory": directory, "files": files[:100]}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def analyze_command(self, command: str) -> Dict[str, Any]:
        """Komutu analiz eder ve hangi dosya işlemi yapılacağını belirler."""
        command_lower = command.lower()

        # Dosya yazma komutu tespiti
        write_patterns = [
            r'(?:oluştur|yaz|ekle|güncelle|değiştir|tasarla)\s+(?:bir\s+)?(?:dosya|bileşen|component|ekran|modül|widget|screen)\s+([\w/.-]+)',
            r'(?:oluştur|yaz|ekle)\s+([\w/.-]+\.(?:tsx|ts|dart|py|js|jsx|css|md|json|sql))',
        ]
        for pattern in write_patterns:
            match = re.search(pattern, command_lower)
            if match:
                file_path = match.group(1)
                if not file_path.endswith(('.tsx', '.ts', '.dart', '.py', '.js', '.jsx', '.css', '.md', '.json', '.sql')):
                    file_path = f"apps/admin/src/app/components/{file_path}.tsx"
                return {
                    "action": "write_file",
                    "file_path": file_path,
                    "command": command,
                }

        # Dosya okuma komutu tespiti
        read_patterns = [
            r'(?:oku|incele|göster|aç)\s+(?:dosyayı\s+)?([\w/.-]+\.(?:tsx|ts|dart|py|js|jsx|css|md|json|sql))',
        ]
        for pattern in read_patterns:
            match = re.search(pattern, command_lower)
            if match:
                return {
                    "action": "read_file",
                    "file_path": match.group(1),
                    "command": command,
                }

        # Dosya listeleme komutu
        if 'listele' in command_lower or 'dosyaları göster' in command_lower:
            return {
                "action": "list_files",
                "directory": "apps/admin/src/app/components",
                "command": command,
            }

        return {
            "action": "analyze_only",
            "command": command,
            "message": "Komut analiz edildi. Dosya işlemi belirlenemedi.",
        }

    def execute(self, command: str) -> Dict[str, Any]:
        """Komutu çalıştırır."""
        analysis = self.analyze_command(command)

        if analysis["action"] == "write_file":
            # Basit bir şablon içerik üret (gerçek LLM entegrasyonu sonra)
            file_path = analysis["file_path"]
            template_content = (
                "// " + file_path + " - Likya CEO tarafından oluşturuldu\n"
                "'use client';\n\n"
                "import React from 'react';\n\n"
                "export default function GeneratedComponent() {\n"
                "  return (\n"
                "    <div style={{\n"
                "      padding: '20px',\n"
                "      background: 'rgba(255,255,255,0.03)',\n"
                "      borderRadius: '16px',\n"
                "      border: '1px solid rgba(255,255,255,0.1)',\n"
                "    }}>\n"
                "      <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#fff' }}>\n"
                "        🎯 Likya CEO Komutuyla Oluşturuldu\n"
                "      </h2>\n"
                "      <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '8px' }}>\n"
                "        Komut: " + command + "\n"
                "      </p>\n"
                "    </div>\n"
                "  );\n"
                "}\n"
            )
            result = self.write_file(file_path, template_content)
            result["analysis"] = analysis
            return result

        elif analysis["action"] == "read_file":
            result = self.read_file(analysis["file_path"])
            result["analysis"] = analysis
            return result

        elif analysis["action"] == "list_files":
            result = self.list_files(analysis["directory"])
            result["analysis"] = analysis
            return result

        return analysis


# Singleton instance
tool_engine = ToolExecutionEngine()
