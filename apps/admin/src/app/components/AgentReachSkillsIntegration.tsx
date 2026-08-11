'use client';

import { useState } from 'react';

// ============================================================================
// LİKYA - AGENT REACH & SKILLS ENTEGRASYON ANALİZİ
// GitHub'daki hazır ajan sistemleri ve skills repolarının analizi
// ============================================================================

type Repo = {
  ad: string;
  url: string;
  aciklama: string;
  teknoloji: string;
  uygunluk: number; // 0-100
  likyaKullanimi: string;
  entegre: boolean;
};

const AGENT_REACH_REPOS: Repo[] = [
  {
    ad: 'Panniantong/Agent-Reach',
    url: 'https://github.com/Panniantong/Agent-Reach',
    aciklama: 'AI ajanına tüm interneti görme yeteneği verir. Twitter, Reddit, YouTube, GitHub, Bilibili, XiaoHongShu okuma ve arama — tek CLI, sıfır API ücreti. Python 3.10+',
    teknoloji: 'Python CLI',
    uygunluk: 92,
    likyaKullanimi: 'Likya Pazarlama Ajanı sosyal medya trendlerini, müşteri yorumlarını ve rakip analizini otonom olarak tarayabilir. Satış ajanı ürün fiyatlarını ve pazar talebini izleyebilir.',
    entegre: false,
  },
  {
    ad: 'EdisonChenAI/agent-reach',
    url: 'https://github.com/EdisonChenAI/agent-reach',
    aciklama: 'İnterneti kullan: 13+ platformda arama, okuma ve etkileşim — Twitter/X, Reddit, YouTube, GitHub, Bilibili, XiaoHongShu, Douyin dahil.',
    teknoloji: 'Python',
    uygunluk: 88,
    likyaKullanimi: 'Likya Müşteri deneyimi ajanı, kampüs ziyaretçilerinin sosyal medya paylaşımlarını izleyip geri bildirim toplayabilir.',
    entegre: false,
  },
  {
    ad: 'Jichi666/agent-reach-skill',
    url: 'https://github.com/Jichi666/agent-reach-skill',
    aciklama: 'OpenClaw Agent Skill - Agent Reach: 13+ platform internet erişimi. Ajan skill formatında paketlenmiş versiyon.',
    teknoloji: 'Agent Skill',
    uygunluk: 85,
    likyaKullanimi: 'Likya ajan takımına skill olarak eklenebilir — CEO ajanı internetten güncel veri çekebilir.',
    entegre: false,
  },
  {
    ad: 'vibe-with-me-tools/agent-reachout',
    url: 'https://github.com/vibe-with-me-tools/agent-reachout',
    aciklama: 'Claude Code\'un işi bitirdiğinde veya karar gerektiğinde Telegram üzerinden size ulaşmasını sağlar.',
    teknoloji: 'Telegram Bot',
    uygunluk: 78,
    likyaKullanimi: 'Likya CEO ajanı, önemli kararlar için Patron\'a Telegram üzerinden bildirim gönderebilir.',
    entegre: false,
  },
  {
    ad: 'ehrlich-b/wingthing',
    url: 'https://github.com/ehrlich-b/wingthing',
    aciklama: 'Her yerden erişilebilen sandbox AI ajanları. Güvenli izole ortamda ajan çalıştırma.',
    teknoloji: 'Sandbox',
    uygunluk: 75,
    likyaKullanimi: 'Likya ajanlarını güvenli izole ortamda çalıştırarak güvenlik risklerini azaltır.',
    entegre: false,
  },
];

const SKILLS_REPOS: Repo[] = [
  {
    ad: 'anthropics/skills',
    url: 'https://github.com/anthropics/skills',
    aciklama: 'Agent Skills resmi deposu. 17 skill: algorithmic-art, brand-guidelines, canvas-design, claude-api, doc-coauthoring, docx, frontend-design, internal-comms, mcp-builder, pdf, pptx, skill-creator, slack-gif-creator, theme-factory, web-artifacts-builder, webapp-testing, xlsx.',
    teknoloji: 'Agent Skills',
    uygunluk: 95,
    likyaKullanimi: 'Likya ajanlarına hazır skill ekleme: PDF/fatura oluşturma (docx, pdf, xlsx), frontend tasarım, webapp test, MCP builder. Muhasebe ajanı fatura PDF\'i, Satış ajanı teklif XLSX\'i oluşturabilir.',
    entegre: false,
  },
  {
    ad: 'vercel-labs/agent-skills',
    url: 'https://github.com/vercel-labs/agent-skills',
    aciklama: 'Vercel\'in resmi ajan skills koleksiyonu. Web geliştirme odaklı skills.',
    teknoloji: 'Agent Skills',
    uygunluk: 90,
    likyaKullanimi: 'Likya IT ajanı web geliştirme skills\'lerini kullanarak daha hızlı ve kaliteli kod üretebilir.',
    entegre: false,
  },
  {
    ad: 'google/skills',
    url: 'https://github.com/google/skills',
    aciklama: 'Google ürün ve teknolojileri için Agent Skills. Google API entegrasyonları.',
    teknoloji: 'Agent Skills',
    uygunluk: 82,
    likyaKullanimi: 'Likya ajanları Google Maps, Calendar, Drive gibi servisleri kullanabilir. Konaklama ajanı Google Calendar ile rezervasyon takvimi yapabilir.',
    entegre: false,
  },
  {
    ad: 'addyosmani/agent-skills',
    url: 'https://github.com/addyosmani/agent-skills',
    aciklama: 'AI kodlama ajanları için production-grade mühendislik skills. Addy Osmani tarafından.',
    teknoloji: 'Agent Skills',
    uygunluk: 88,
    likyaKullanimi: 'Likya IT ajanı production-grade kod yazma, performans optimizasyonu ve güvenlik skills\'lerini kullanabilir.',
    entegre: false,
  },
  {
    ad: 'agentskills/agentskills',
    url: 'https://github.com/agentskills/agentskills',
    aciklama: 'Agent Skills spesifikasyonu ve dokümantasyonu. Standart skill formatı tanımı.',
    teknoloji: 'Specification',
    uygunluk: 80,
    likyaKullanimi: 'Likya kendi özel skills\'lerini bu standartta oluşturabilir — fatura kesme, tahsilat, rezervasyon skills\'leri.',
    entegre: false,
  },
  {
    ad: 'obra/superpowers',
    url: 'https://github.com/obra/superpowers',
    aciklama: 'Ajanic skills framework & yazılım geliştirme metodolojisi. Çalışan bir sistem.',
    teknoloji: 'Framework',
    uygunluk: 86,
    likyaKullanimi: 'Likya ajan takımına güçlü bir skills framework\'ü sağlar — ajanlar arası koordinasyon ve görev yönetimi.',
    entegre: false,
  },
];

export default function AgentReachSkillsIntegration() {
  const [activeTab, setActiveTab] = useState<'reach' | 'skills'>('reach');
  const [entegreler, setEntegreler] = useState<Record<string, boolean>>({});

  const toggleEntegre = (ad: string) => {
    setEntegreler((prev) => ({ ...prev, [ad]: !prev[ad] }));
  };

  const repos = activeTab === 'reach' ? AGENT_REACH_REPOS : SKILLS_REPOS;
  const tabTitle = activeTab === 'reach' ? 'Agent Reach Repoları' : 'Skills Repoları';
  const tabDesc = activeTab === 'reach'
    ? 'AI ajanlarına internet erişimi sağlayan hazır sistemler — sosyal medya, pazar analizi, müşteri geri bildirimi'
    : 'Ajanlara hazır yetenekler kazandıran skills repoları — PDF, XLSX, frontend, test, MCP builder';

  return (
    <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '20px', marginTop: '16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
        <span style={{ fontSize: '24px' }}>🌐</span>
        <div>
          <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#e2e8f0' }}>Agent Reach & Skills Entegrasyon Analizi</div>
          <div style={{ fontSize: '11px', color: '#94a3b8' }}>GitHub'daki hazır ajan sistemleri ve skills repolarının Likya\'ya uygunluk analizi</div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button
          onClick={() => setActiveTab('reach')}
          style={{
            padding: '8px 16px',
            borderRadius: '10px',
            border: activeTab === 'reach' ? '1px solid #00f2fe' : '1px solid rgba(255,255,255,0.15)',
            background: activeTab === 'reach' ? 'rgba(0,242,254,0.1)' : 'rgba(255,255,255,0.05)',
            color: activeTab === 'reach' ? '#00f2fe' : '#94a3b8',
            fontSize: '12px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          👁️ Agent Reach ({AGENT_REACH_REPOS.length})
        </button>
        <button
          onClick={() => setActiveTab('skills')}
          style={{
            padding: '8px 16px',
            borderRadius: '10px',
            border: activeTab === 'skills' ? '1px solid #48bb78' : '1px solid rgba(255,255,255,0.15)',
            background: activeTab === 'skills' ? 'rgba(72,187,120,0.1)' : 'rgba(255,255,255,0.05)',
            color: activeTab === 'skills' ? '#48bb78' : '#94a3b8',
            fontSize: '12px',
            fontWeight: 'bold',
            cursor: 'pointer',
          }}
        >
          🧩 Skills ({SKILLS_REPOS.length})
        </button>
      </div>

      {/* Description */}
      <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '16px', lineHeight: '1.5' }}>
        {tabDesc}
      </div>

      {/* Repo Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {repos.map((repo) => {
          const entegre = entegreler[repo.ad] || false;
          return (
            <div key={repo.ad} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '13px', color: '#e2e8f0' }}>{repo.ad}</span>
                    <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '12px', background: 'rgba(0,242,254,0.1)', color: '#00f2fe', border: '1px solid rgba(0,242,254,0.3)' }}>{repo.teknoloji}</span>
                    <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '12px', background: repo.uygunluk >= 90 ? 'rgba(72,187,120,0.1)' : repo.uygunluk >= 80 ? 'rgba(236,201,75,0.1)' : 'rgba(224,122,95,0.1)', color: repo.uygunluk >= 90 ? '#48bb78' : repo.uygunluk >= 80 ? '#ecc94b' : '#e07a5f', border: `1px solid ${repo.uygunluk >= 90 ? 'rgba(72,187,120,0.3)' : repo.uygunluk >= 80 ? 'rgba(236,201,75,0.3)' : 'rgba(224,122,95,0.3)'}` }}>
                    Uygunluk: %{repo.uygunluk}
                  </span>
                </div>
                </div>
                <button
                  onClick={() => toggleEntegre(repo.ad)}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '11px',
                    background: entegre ? 'rgba(72,187,120,0.2)' : 'linear-gradient(135deg, #0f4c81, #00f2fe)',
                    color: entegre ? '#48bb78' : '#fff',
                    border: entegre ? '1px solid #48bb78' : 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {entegre ? '✓ Entegre' : 'Entegre Et'}
                </button>
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '8px', lineHeight: '1.5' }}>
                {repo.aciklama}
              </div>
              <div style={{ fontSize: '11px', color: '#48bb78', marginTop: '8px', lineHeight: '1.5', background: 'rgba(72,187,120,0.05)', padding: '8px 10px', borderRadius: '8px', border: '1px solid rgba(72,187,120,0.15)' }}>
                <strong>🎯 Likya Kullanımı:</strong> {repo.likyaKullanimi}
              </div>
              <a href={repo.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', color: '#00f2fe', textDecoration: 'none', marginTop: '8px', display: 'inline-block' }}>
                🔗 GitHub'da Gör →
              </a>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div style={{ marginTop: '16px', padding: '14px', background: 'linear-gradient(135deg, rgba(0,242,254,0.05), rgba(72,187,120,0.05))', borderRadius: '12px', border: '1px solid rgba(0,242,254,0.15)' }}>
        <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#e2e8f0', marginBottom: '8px' }}>📊 Analiz Özeti</div>
        <div style={{ fontSize: '12px', color: '#94a3b8', lineHeight: '1.6' }}>
          <strong style={{ color: '#00f2fe' }}>Agent Reach:</strong> Likya Pazarlama ve Satış ajanlarına internet erişimi kazandırır — sosyal medya trendleri, müşteri yorumları, rakip analizi, pazar talebi. Sıfır API ücreti ile 13+ platform.
          <br /><br />
          <strong style={{ color: '#48bb78' }}>Skills:</strong> Likya ajanlarına hazır yetenekler kazandırır — Muhasebe ajanı PDF/XLSX fatura oluşturabilir, IT ajanı frontend/test skills kullanabilir, Konaklama ajanı Google Calendar entegrasyonu yapabilir.
          <br /><br />
          <strong style={{ color: '#ecc94b' }}>Önerilen Öncelik:</strong> 1) anthropics/skills (%95) — en yüksek uygunluk, 2) Panniantong/Agent-Reach (%92) — internet erişimi, 3) vercel-labs/agent-skills (%90) — web geliştirme.
        </div>
      </div>
    </div>
  );
}
