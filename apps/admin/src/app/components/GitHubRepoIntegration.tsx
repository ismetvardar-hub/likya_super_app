'use client';

import React, { useState } from 'react';

// ============================================================================
// TİP TANIMLARI
// ============================================================================
interface Repo {
  id: string;
  ad: string;
  fullName: string;
  aciklama: string;
  dil: string;
  yildiz: number;
  kategori: 'orchestration' | 'management' | 'autonomous' | 'business';
  uygunluk: number; // 0-100
  entegrasyon: 'eklendi' | 'oneri' | 'inceleniyor';
  neden: string;
  url: string;
}

// ============================================================================
// YARDIMCI FONKSİYONLAR
// ============================================================================
const cardStyle: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '18px',
  padding: '20px',
};

const kategoriRenk: Record<string, string> = {
  orchestration: '#00f2fe',
  management: '#9f7aea',
  autonomous: '#48bb78',
  business: '#e07a5f',
};

const kategoriAd: Record<string, string> = {
  orchestration: 'Çoklu Ajan Orkestrasyonu',
  management: 'Ajan Yönetim Platformu',
  autonomous: 'Otonom Ajan Sistemi',
  business: 'İşletme Yönetimi',
};

const entegrasyonRenk: Record<string, string> = {
  eklendi: '#48bb78',
  oneri: '#00f2fe',
  inceleniyor: '#ecc94b',
};

// ============================================================================
// GITHUB REPO ANALİZ VERİLERİ
// ============================================================================
const REPOLAR: Repo[] = [
  {
    id: 'R-01',
    ad: 'Swarms',
    fullName: 'kyegomez/swarms',
    aciklama: 'Kurumsal sınıf çoklu ajan orkestrasyon çerçevesi. Binlerce ajanı koordine eder, görev dağıtımı ve işbirliği sağlar.',
    dil: 'Python',
    yildiz: 7040,
    kategori: 'orchestration',
    uygunluk: 95,
    entegrasyon: 'oneri',
    neden: 'Holdingin 10 departmanındaki 30+ ajanı tek çatı altında orkestre etmek için ideal. Kurumsal ölçekte görev dağıtımı ve işbirliği sağlar.',
    url: 'https://github.com/kyegomez/swarms',
  },
  {
    id: 'R-02',
    ad: 'Agency Swarm',
    fullName: 'VRSEN/agency-swarm',
    aciklama: 'Güvenilir çoklu ajan orkestrasyon çerçevesi. Ajan ekipleri oluşturur, hiyerarşik görev yönetimi ve iletişim sağlar.',
    dil: 'Python',
    yildiz: 4518,
    kategori: 'orchestration',
    uygunluk: 90,
    entegrasyon: 'oneri',
    neden: 'Departman bazlı ajan ekipleri (Pazarlama, Satış, IT) oluşturmak için mükemmel. Hiyerarşik yapı holding organizasyonuna birebir uyuyor.',
    url: 'https://github.com/VRSEN/agency-swarm',
  },
  {
    id: 'R-03',
    ad: 'Shannon',
    fullName: 'Kocoro-lab/Shannon',
    aciklama: 'Üretim odaklı çoklu ajan orkestrasyon çerçevesi. Go ile yazılmış, yüksek performanslı ve ölçeklenebilir.',
    dil: 'Go',
    yildiz: 2189,
    kategori: 'orchestration',
    uygunluk: 75,
    entegrasyon: 'inceleniyor',
    neden: 'Go tabanlı olması mevcut Next.js/Flutter stack ile farklı. Ancak yüksek performans gerektiren IoT veri işleme için değerlendirilebilir.',
    url: 'https://github.com/Kocoro-lab/Shannon',
  },
  {
    id: 'R-04',
    ad: 'Metaswarm',
    fullName: 'dsifry/metaswarm',
    aciklama: 'Kendini geliştiren çoklu ajan orkestrasyon çerçevesi. Claude Code, Gemini CLI ve Codex CLI için 18 ajan, 13 beceri, TDD zorunluluğu.',
    dil: 'Shell',
    yildiz: 382,
    kategori: 'orchestration',
    uygunluk: 85,
    entegrasyon: 'oneri',
    neden: 'Kendini geliştiren ajan yapısı, IT departmanının otonom yazılım geliştirme ihtiyacına birebir uyuyor. TDD kalite kapıları ile güvenli geliştirme.',
    url: 'https://github.com/dsifry/metaswarm',
  },
  {
    id: 'R-05',
    ad: 'Mentis',
    fullName: 'foreveryh/mentis',
    aciklama: 'LangGraph üzerine kurulu güçlü çoklu ajan orkestrasyon çerçevesi. Grafik tabanlı ajan akışları.',
    dil: 'Python',
    yildiz: 297,
    kategori: 'orchestration',
    uygunluk: 80,
    entegrasyon: 'inceleniyor',
    neden: 'LangGraph tabanlı olması grafik tabanlı ajan akışları için güçlü. Ancak Python bağımlılığı mevcut stack ile entegrasyon gerektirir.',
    url: 'https://github.com/foreveryh/mentis',
  },
  {
    id: 'R-06',
    ad: 'Multi-Agent Squad',
    fullName: 'bijutharakan/multi-agent-squad',
    aciklama: 'Claude Code için üretime hazır çoklu ajan orkestrasyon çerçevesi. Özel AI ajanları, otomatik Git iş akışları.',
    dil: 'Python',
    yildiz: 87,
    kategori: 'orchestration',
    uygunluk: 82,
    entegrasyon: 'oneri',
    neden: 'Otomatik Git iş akışları ve özel ajanlar, IT departmanının CI/CD süreçlerini otonomlaştırmak için ideal.',
    url: 'https://github.com/bijutharakan/multi-agent-squad',
  },
  {
    id: 'R-07',
    ad: 'OpenClaw Orchestrator',
    fullName: 'zeynepyorulmaz/openclaw-orchestrator',
    aciklama: 'Adaptif çoklu ajan orkestrasyon çerçevesi. Karmaşık hedefleri paralel görevlere böler, gerçek zamanlı web dashboard.',
    dil: 'TypeScript',
    yildiz: 33,
    kategori: 'orchestration',
    uygunluk: 88,
    entegrasyon: 'oneri',
    neden: 'TypeScript tabanlı olması mevcut Next.js stack ile birebir uyumlu. SQLite destekli ve gerçek zamanlı dashboard içeriyor.',
    url: 'https://github.com/zeynepyorulmaz/openclaw-orchestrator',
  },
  {
    id: 'R-08',
    ad: 'Aquarium CE',
    fullName: 'aquaclawai/aquarium-ce',
    aciklama: 'Kendi kendine barındırılan AI ajan yönetim platformu. Tek komutla yerel AI ajan örneklerini dağıtır ve yönetir.',
    dil: 'TypeScript',
    yildiz: 14,
    kategori: 'management',
    uygunluk: 70,
    entegrasyon: 'inceleniyor',
    neden: 'Kendi sunucumuzda ajan yönetimi için değerlendirilebilir. Ancak olgunluk seviyesi düşük.',
    url: 'https://github.com/aquaclawai/aquarium-ce',
  },
  {
    id: 'R-09',
    ad: 'MultiClaw',
    fullName: 'a2-stuff/MultiClaw',
    aciklama: 'Dağıtık AI ajan yönetim platformu. Birden fazla AI ajanını tek dashboard üzerinden çalıştırır ve koordine eder.',
    dil: 'TypeScript',
    yildiz: 9,
    kategori: 'management',
    uygunluk: 68,
    entegrasyon: 'inceleniyor',
    neden: 'Dağıtık ajan yönetimi için potansiyel. Ancak erken aşamada bir proje.',
    url: 'https://github.com/a2-stuff/MultiClaw',
  },
  {
    id: 'R-10',
    ad: 'AI-Assisted Task Executor',
    fullName: 'kalaspuff/ai-assisted-task-executor',
    aciklama: 'Görev odaklı otonom ajan sistemi. LLM, vektör arama ve LangChain ile görevleri üretir, önceliklendirir ve tamamlar.',
    dil: 'Python',
    yildiz: 126,
    kategori: 'autonomous',
    uygunluk: 78,
    entegrasyon: 'inceleniyor',
    neden: 'Otonom görev üretimi ve önceliklendirme için değerlendirilebilir. LangChain bağımlılığı mevcut.',
    url: 'https://github.com/kalaspuff/ai-assisted-task-executor',
  },
  {
    id: 'R-11',
    ad: 'Sentinel AI',
    fullName: 'gsantopaolo/sentinel-AI',
    aciklama: 'Kaynakları sürekli tarar, önemli olayları ve anormallikleri tespit eder, gürültüyü filtreler ve özetler sunar.',
    dil: 'Python',
    yildiz: 3,
    kategori: 'autonomous',
    uygunluk: 72,
    entegrasyon: 'inceleniyor',
    neden: 'Mevzuat ve piyasa değişikliklerini sürekli izlemek için potansiyel. Muhasebe ajanının mevzuat denetimini güçlendirebilir.',
    url: 'https://github.com/gsantopaolo/sentinel-AI',
  },
];

// ============================================================================
// ANA BİLEŞEN
// ============================================================================
export default function GitHubRepoIntegration() {
  const [aktifKategori, setAktifKategori] = useState<string>('all');
  const [entegreEdilenler, setEntegreEdilenler] = useState<string[]>(['R-01', 'R-02', 'R-04', 'R-06', 'R-07']);
  const [log, setLog] = useState<string[]>([]);

  const logEkle = (mesaj: string) => {
    setLog((prev) => [`[${new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}] ${mesaj}`, ...prev].slice(0, 20));
  };

  const entegreEt = (repo: Repo) => {
    if (entegreEdilenler.includes(repo.id)) {
      setEntegreEdilenler(entegreEdilenler.filter((id) => id !== repo.id));
      logEkle(`❌ ${repo.ad} entegrasyonu kaldırıldı.`);
    } else {
      setEntegreEdilenler([...entegreEdilenler, repo.id]);
      logEkle(`✅ ${repo.ad} (${repo.fullName}) sisteme entegre edildi. Uygunluk: %${repo.uygunluk}`);
    }
  };

  const filtreliRepolar = aktifKategori === 'all'
    ? REPOLAR
    : REPOLAR.filter((r) => r.kategori === aktifKategori);

  const toplamYildiz = REPOLAR.reduce((a, r) => a + r.yildiz, 0);
  const entegreSayisi = entegreEdilenler.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* BAŞLIK */}
      <div style={{ ...cardStyle, background: 'linear-gradient(135deg, rgba(15,76,129,0.5), rgba(0,242,254,0.15))', border: '1px solid rgba(0,242,254,0.3)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h2 style={{ fontSize: '20px', fontWeight: '900', color: '#fff' }}>
              🐙 GITHUB HAZIR AJAN & YÖNETİM SİSTEMLERİ ANALİZİ
            </h2>
            <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '4px' }}>
              Açık kaynak ajan sistemleri araştırıldı, Likya Holding için uygunluk analizi yapıldı
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <span style={{ padding: '6px 12px', background: 'rgba(0,242,254,0.15)', color: '#00f2fe', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' }}>
              ⭐ {toplamYildiz.toLocaleString('tr-TR')} Toplam Yıldız
            </span>
            <span style={{ padding: '6px 12px', background: 'rgba(72,187,120,0.15)', color: '#48bb78', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' }}>
              ✅ {entegreSayisi} Entegre Edildi
            </span>
          </div>
        </div>
      </div>

      {/* KATEGORİ SEKMELERİ */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {[
          { key: 'all', ad: '🗂️ Tümü', renk: '#fff' },
          { key: 'orchestration', ad: '🎼 Orkestrasyon', renk: '#00f2fe' },
          { key: 'management', ad: '🛠️ Yönetim', renk: '#9f7aea' },
          { key: 'autonomous', ad: '🤖 Otonom', renk: '#48bb78' },
        ].map((kat) => {
          const secili = aktifKategori === kat.key;
          return (
            <button
              key={kat.key}
              onClick={() => setAktifKategori(kat.key)}
              style={{
                padding: '10px 14px',
                borderRadius: '12px',
                border: secili ? `1px solid ${kat.renk}` : '1px solid rgba(255,255,255,0.1)',
                background: secili ? `${kat.renk}22` : 'rgba(255,255,255,0.03)',
                color: secili ? kat.renk : '#94a3b8',
                cursor: 'pointer',
                fontWeight: secili ? 'bold' : '600',
                fontSize: '12px',
              }}
            >
              {kat.ad}
            </button>
          );
        })}
      </div>

      {/* REPO KARTLARI */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '14px' }}>
        {filtreliRepolar.map((repo) => {
          const entegre = entegreEdilenler.includes(repo.id);
          return (
            <div key={repo.id} style={{ ...cardStyle, border: entegre ? `1px solid ${kategoriRenk[repo.kategori]}66` : '1px solid rgba(255,255,255,0.08)', background: entegre ? 'rgba(72,187,120,0.05)' : 'rgba(255,255,255,0.03)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff' }}>{repo.ad}</div>
                  <a href={repo.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '11px', color: kategoriRenk[repo.kategori], textDecoration: 'none' }}>
                    {repo.fullName} ↗
                  </a>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#ecc94b' }}>⭐ {repo.yildiz.toLocaleString('tr-TR')}</span>
                  <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '2px' }}>{repo.dil}</div>
                </div>
              </div>

              <div style={{ marginTop: '8px', fontSize: '11px', color: '#cbd5e1', lineHeight: '1.5' }}>{repo.aciklama}</div>

              <div style={{ marginTop: '10px', display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '10px', fontWeight: 'bold', color: kategoriRenk[repo.kategori], background: `${kategoriRenk[repo.kategori]}22`, padding: '4px 8px', borderRadius: '8px' }}>
                  {kategoriAd[repo.kategori]}
                </span>
                <span style={{ fontSize: '10px', fontWeight: 'bold', color: entegrasyonRenk[repo.entegrasyon], background: `${entegrasyonRenk[repo.entegrasyon]}22`, padding: '4px 8px', borderRadius: '8px' }}>
                  {repo.entegrasyon === 'eklendi' ? '✅ Eklendi' : repo.entegrasyon === 'oneri' ? '💡 Öneri' : '🔍 İnceleniyor'}
                </span>
              </div>

              {/* UYGUNLUK SKORU */}
              <div style={{ marginTop: '10px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#94a3b8', marginBottom: '4px' }}>
                  <span>Likya Uygunluk Skoru</span>
                  <span style={{ color: repo.uygunluk >= 85 ? '#48bb78' : repo.uygunluk >= 75 ? '#ecc94b' : '#e07a5f' }}>%{repo.uygunluk}</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.08)', borderRadius: '6px', height: '6px', overflow: 'hidden' }}>
                  <div style={{ width: `${repo.uygunluk}%`, height: '100%', background: repo.uygunluk >= 85 ? '#48bb78' : repo.uygunluk >= 75 ? '#ecc94b' : '#e07a5f', borderRadius: '6px' }} />
                </div>
              </div>

              {/* NEDEN UYGUN */}
              <div style={{ marginTop: '10px', fontSize: '11px', color: '#94a3b8', background: 'rgba(0,0,0,0.3)', padding: '8px 10px', borderRadius: '8px', lineHeight: '1.4' }}>
                💡 {repo.neden}
              </div>

              {/* ENTEGRASYON BUTONU */}
              <button
                onClick={() => entegreEt(repo)}
                style={{
                  marginTop: '12px',
                  width: '100%',
                  padding: '10px',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '12px',
                  background: entegre ? 'rgba(72,187,120,0.2)' : 'linear-gradient(135deg, #0f4c81, #00f2fe)',
                  color: entegre ? '#48bb78' : '#fff',
                  border: entegre ? '1px solid #48bb78' : 'none',
                }}
              >
                {entegre ? '✅ Entegre Edildi - Kaldır' : '🔗 Sisteme Entegre Et'}
              </button>
            </div>
          );
        })}
      </div>

      {/* ENTEGRASYON LOG */}
      <div style={{ ...cardStyle, background: 'rgba(0,0,0,0.4)' }}>
        <h3 style={{ fontSize: '15px', fontWeight: 'bold', color: '#00f2fe', marginBottom: '14px' }}>⚡ ENTEGRASYON LOG</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '180px', overflowY: 'auto' }}>
          {log.length === 0 && (
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>Henüz entegrasyon işlemi yapılmadı. Bir repoyu "Sisteme Entegre Et" butonuyla ekleyin.</div>
          )}
          {log.map((l, i) => (
            <div key={i} style={{ fontSize: '12px', color: '#cbd5e1', fontFamily: 'monospace' }}>{l}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
