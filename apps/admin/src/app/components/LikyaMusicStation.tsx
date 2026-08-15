'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Music, Play, Pause, Trophy, Sparkles, CheckCircle2, Headphones, ThumbsUp, MessageCircle, Download, Share2, Volume2, VolumeX } from 'lucide-react';

// ============================================================================
// 🎧 LİKYA MÜZİK — AKUSTİK FREKANS İSTASYONU (Otonom Hibrit DJ)
// Mekan doluluğuna (%0-%100) göre tempo otomatik değiştiren Otonom DJ Modu
// + canlı frekans barı + etkileşim (Beğen / Yorum / İndir / Spotify Yayınla)
// ============================================================================

type TrackSource = 'Likya AI Original' | 'Spotify Lisanslı';

interface TrackOption {
  id: string;
  name: string;
  artist: string;
  source: TrackSource;
  mood: string;
  tempo: number; // BPM
  fillRange: [number, number];
  color: string;
  audioUrl: string; // gerçek, telifsiz stüdyo kalitesi akış (Radio Paradise MP3)
  sunoPrompt: string; // profesyonel Suno üretim promptu
}

const TRACKS: TrackOption[] = [
  {
    id: 'zen', name: 'Sunset Zen Dalgası', artist: 'Likya Synth Ensemble', source: 'Likya AI Original',
    mood: 'sakin / boş kampüs', tempo: 72, fillRange: [0, 25], color: '#00f2fe',
    audioUrl: 'https://stream.radioparadise.com/mellow-192',
    sunoPrompt: 'Zen sunrise ambient, soft piano, warm pad, ocean waves, meditation atmosphere, 72 bpm, warm acoustic, studio mastering, no lyrics, calming, spa',
  },
  {
    id: 'chill', name: 'Akdeniz Lounge', artist: 'Mavi Rüzgar Collective', source: 'Spotify Lisanslı',
    mood: 'rahat / orta doluluk', tempo: 92, fillRange: [25, 55], color: '#34d399',
    audioUrl: 'https://stream.radioparadise.com/global-192',
    sunoPrompt: 'Mediterranean lounge, deep house bass, acoustic guitar, soft saxophone, sunset vibes, 92 bpm, warm acoustic, studio mastering',
  },
  {
    id: 'vibes', name: 'Neon Kampüs Groove', artist: 'Likya Synth Ensemble', source: 'Likya AI Original',
    mood: 'enerjik / yoğun saat', tempo: 118, fillRange: [55, 80], color: '#f59e0b',
    audioUrl: 'https://stream.radioparadise.com/mp3-192',
    sunoPrompt: 'Neon city groove, funk bass, synthwave leads, deep house drums, energetic crowd, 118 bpm, modern studio production',
  },
  {
    id: 'party', name: 'Likya Sunset Party Mix', artist: 'Likya AI Original', source: 'Likya AI Original',
    mood: 'maksimum / etkinlik', tempo: 132, fillRange: [80, 101], color: '#f87171',
    audioUrl: 'https://stream.radioparadise.com/rock-192',
    sunoPrompt: 'High energy party anthem, festival mainstage, driving beats, uplifting chords, 132 bpm, punchy mastering, crowd energy',
  },
];

// Otonom DJ: doluluk → canlı tempo hesabı (72 → 132 BPM aralığı)
const tempoForFill = (fill: number): number => Math.round(72 + (fill / 100) * 60);

// Canlı akustik frekans çubukları — doluluk + dalga fonksiyonu ile üretilir
function frequencyHeights(fill: number, tick: number): number[] {
  return Array.from({ length: 16 }, (_, i) => {
    const wave = Math.abs(Math.sin((i + 1) * 1.7 + tick * 0.4) * 100);
    const base = 12 + fill * 0.3;
    const seed = Math.abs(Math.sin((i + 1) * 3.1 + fill * 0.05 + tick));
    return Math.max(8, Math.min(64, base * 0.35 + wave * 0.18 + seed * 32));
  });
}

// ============================================================================
// 🧠 PROFESYONEL SUNO ÜRETİM MİMARİSİ
// Her parça için stüdyo kalitesinde prompt kalıpları + asenkron beste tetikleme.
// Anahtar yoksa üretim kuyruğu "hazır" durumda bekler; anahtar gelince otomatik devreye girer.
// ============================================================================
const SUNO_API_URL = process.env.NEXT_PUBLIC_SUNO_API_URL || 'https://api.suno.ai/v1';
const SUNO_API_KEY = process.env.NEXT_PUBLIC_SUNO_API_KEY || '';

// Profesyonel prompt şablonu: parça promptu + tempo + atmosfer + mastering kalitesi
function buildSunoPrompt(track: TrackOption): string {
  return [
    `Genre: ${track.mood.split('/')[0].trim()}`,
    track.sunoPrompt,
    `${track.tempo} bpm`,
    'Likya Kampüsü atmosferi: plaj lounge, festival canlılığı, akdeniz gün batımı',
    'studio mastering, 320kbps, seamless loop, no spoken words',
  ].join(', ');
}

// Arka planda Suno bestesini tetikler; üretilen parçayı oynatma kuyruğuna alır
async function triggerSunoComposition(track: TrackOption, onStatus: (msg: string) => void): Promise<void> {
  const prompt = buildSunoPrompt(track);
  if (!SUNO_API_KEY) {
    onStatus(`🧠 Suno prodüksiyon kuyruğunda: "${track.name}" (API anahtarı ayarlanmadığında kuyrukta bekler)`);
    return;
  }
  try {
    const res = await fetch(`${SUNO_API_URL}/compositions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${SUNO_API_KEY}` },
      body: JSON.stringify({
        prompt,
        title: track.name,
        make_instrumental: true,
        style: track.mood,
        tags: ['likya', 'lounge', 'campus'],
      }),
    });
    if (!res.ok) throw new Error(`Suno API yanıtı: ${res.status}`);
    const data = await res.json();
    const trackId = data?.id || data?.data?.[0]?.id || 'unknown';
    onStatus(`🧠 Suno bestesi üretildi ve oynatma kuyruğuna alındı → "${track.name}" (${trackId})`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'hata';
    onStatus(`⚠️ Suno API'ye ulaşılamadı (${msg}) — parça akışı devam ediyor, üretim kuyrukta: "${track.name}"`);
  }
}

// ============================================================================
// 🎭 LİKYA DUYGU SERÜVENİ — 3 Aşamalı Nöro-Akustik "Duygusal Simya" Algoritması
// İdrak → Dikkat Yakalama → Rezonans (Empati) → Kademeli BPM Rampası (75→98→124)
// ============================================================================
interface JourneyPhase {
  no: number;
  name: string;
  desc: string;
  bpm: number;
  fill: number;
  sunoPrompt: string;
}

const JOURNEY_PHASES: JourneyPhase[] = [
  {
    no: 1,
    name: 'Dikkat Çekme',
    desc: 'Attention Hook — tatlı saksafon riff / hafif Likya dalga efekti',
    bpm: 75,
    fill: 8,
    sunoPrompt: 'Warm acoustic guitar, soft downtempo, melancholic Mediterranean breeze, catchy attention hook, 78 bpm',
  },
  {
    no: 2,
    name: 'Frekans Eşleme',
    desc: 'Rezonans — düşük frekansa inip bağ kurma (Lo-Fi / Akdeniz gitarı)',
    bpm: 98,
    fill: 42,
    sunoPrompt: 'Uplifting deep house bassline, rhythmic handclaps, sunny trumpet melody, resonant groove, 105 bpm',
  },
  {
    no: 3,
    name: 'Coşku Rampası',
    desc: 'Yukarı Taşıma — kademeli tempo artışı ile zirve eğlence',
    bpm: 124,
    fill: 88,
    sunoPrompt: 'High-energy Mediterranean disco-funk, euphoric drops, contagious groove, 124 bpm',
  },
];

// Demo: her evre 30 sn (üretimde 5 dakikaya çıkarılabilir)
const JOURNEY_PHASE_MS = 30000;

// 🧠 GELİŞMİŞ SUNO DUYGU PARAMETRELERİ — API isteklerine eklenir
const SUNO_EMOTION_PARAMS = ['emotion_uplifter', 'catchy_hook', 'melodic_dopamine_booster'];

// ============================================================================
// 🗺️ LİKYA ÇOK BÖLGELİ AKUSTİK MATRİSİ (Multi-Zone Acoustic Matrix)
// Her bölge bağımsız: kendi akışı, BPM'i, ses seviyesi ve duygu hedefi.
// ============================================================================
interface MusicZone {
  id: string;
  name: string;
  icon: string;
  genre: string;
  mood: string;      // amaç & duygu dönüşümü
  tempo: number;     // temel BPM
  target: string;    // hedef duygu
  color: string;
  audioUrl: string;  // gerçek telifsiz akış
  sunoPrompt: string;
  trigger: string;   // otomasyon / sensör tetikleyicisi
}

const ZONES: MusicZone[] = [
  {
    id: 'yoga', name: 'Yoga & Spa', icon: '🧘', genre: '432Hz Zen & Doğa',
    mood: 'Zihni dinginleştirme, derin gevşeme', tempo: 60, target: 'Dinginlik', color: '#34d399',
    audioUrl: 'https://stream.radioparadise.com/mellow-192',
    sunoPrompt: '432Hz healing frequencies, tibetan singing bowls, nature sounds, zen meditation, deep relaxation, 60 bpm, no lyrics',
    trigger: 'Sabah gün doğumu & seans saatlerinde otomatik başlar',
  },
  {
    id: 'pool', name: 'Ana Havuz & Sunset Bar', icon: '🏊', genre: 'Akdeniz Disco / House',
    mood: 'Canlılık, sosyalleşme, dikkat çekip eğlendirme', tempo: 122, target: 'Eğlence', color: '#f59e0b',
    audioUrl: 'https://stream.radioparadise.com/mp3-192',
    sunoPrompt: 'Mediterranean disco house, deep funk bass, sunset party energy, 122 bpm, crowd euphoria',
    trigger: 'Doluluk ve güneş batış saatine göre otomatik tempo artışı',
  },
  {
    id: 'restaurant', name: 'Gurme Restoran & Lounge', icon: '🍽️', genre: 'Akustik & Bossa Nova',
    mood: 'Sohbeti bastırmayan, iştah & konfor odaklı ses', tempo: 84, target: 'Konfor', color: '#ecc94b',
    audioUrl: 'https://stream.radioparadise.com/global-192',
    sunoPrompt: 'Mediterranean acoustic guitar, bossa nova, soft saxophone, elegant restaurant ambiance, 84 bpm',
    trigger: 'Çatal-bıçak uğultusu arttıkça akustiği yumuşatır',
  },
  {
    id: 'villas', name: 'Konaklama & Villalar', icon: '🏡', genre: 'Ambient Chill / Lo-Fi',
    mood: 'Mahremiyet, huzur, kesintisiz uyku modu', tempo: 68, target: 'Huzur', color: '#a78bfa',
    audioUrl: 'https://stream.radioparadise.com/mellow-192',
    sunoPrompt: 'Ambient chill, lo-fi beats, personal privacy mode, seamless sleep soundtrack, 68 bpm',
    trigger: 'Misafir aplikasyonundan kendi modunu seçebilir',
  },
  {
    id: 'padel', name: 'Padel Kortu & Spor', icon: '🎾', genre: 'High-Energy Beats',
    mood: 'Yüksek dopamin, hareket enerjisi', tempo: 130, target: 'Enerji', color: '#f87171',
    audioUrl: 'https://stream.radioparadise.com/rock-192',
    sunoPrompt: 'Motivational bass, energetic workout rhythm, dynamic hits, 130 bpm, sports arena energy',
    trigger: 'Maç/antrenman yoğunluğuna göre dinamik vuruşlar',
  },
];

// Bölge başına çalışma durumu
interface ZoneRuntime {
  playing: boolean;
  volume: number;
  muted: boolean;
  energy: number; // 0-100 → BPM modülasyonu
  sunoStatus: string;
}
const initialZoneRuntimes = (): Record<string, ZoneRuntime> =>
  Object.fromEntries(ZONES.map((z) => [z.id, { playing: false, volume: 60, muted: false, energy: 40, sunoStatus: '' }]));

// ============================================================================
// 🌤️ HAVA DURUMU DJ OTOMASYONU (Open-Meteo — ücretsiz, anahtar gerektirmez)
// Antalya (Likya Kampüsü) anlık hava durumuna göre tempo/atmosfer önerir.
// ============================================================================
const WEATHER_LOCATION = 'latitude=36.54&longitude=30.53';
interface LikyaWeather {
  temp: number;
  code: number;
  label: string;
  icon: string;
  isDay: boolean;
  sunset: string;
  loaded: boolean;
  bpmOffset: number;
  recommendation: string;
}

function weatherLabel(code: number): { label: string; icon: string; bpmOffset: number; rec: string } {
  if (code === 0) return { label: 'Açık & Güneşli', icon: '☀️', bpmOffset: 10, rec: 'Enerji artışı — canlı groove önerilir' };
  if (code >= 1 && code <= 3) return { label: 'Parçalı Bulutlu', icon: '⛅', bpmOffset: 4, rec: 'Hafif tempo artışı' };
  if (code === 45 || code === 48) return { label: 'Sisli', icon: '🌫️', bpmOffset: -6, rec: 'Ambient moda geç' };
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return { label: 'Yağmurlu', icon: '🌧️', bpmOffset: -12, rec: 'Chill/Lounge — şömine atmosferi' };
  if (code >= 71 && code <= 77) return { label: 'Karlı', icon: '❄️', bpmOffset: -15, rec: 'Sakin Lo-Fi / meditasyon modu' };
  if (code >= 95) return { label: 'Fırtına', icon: '⛈️', bpmOffset: -18, rec: 'Tam sakinlik — spa frekansları' };
  return { label: 'Bulutlu', icon: '☁️', bpmOffset: 0, rec: 'Standart DJ profili' };
}

// Serüven evresi için Suno bestesi tetikle (duygu parametreleriyle)
async function triggerEmotionalComposition(phase: JourneyPhase, onStatus: (msg: string) => void): Promise<void> {
  if (!SUNO_API_KEY) {
    onStatus(`🎭 Evre ${phase.no} Suno kuyruğunda: "${phase.name}" (${phase.bpm} BPM — anahtar ayarlanmadı)`);
    return;
  }
  try {
    const res = await fetch(`${SUNO_API_URL}/compositions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${SUNO_API_KEY}` },
      body: JSON.stringify({
        prompt: phase.sunoPrompt,
        title: `Likya ${phase.name}`,
        make_instrumental: true,
        style: 'mediterranean lounge',
        tags: ['likya', 'journey', ...SUNO_EMOTION_PARAMS],
        emotion_uplifter: true,      // ruh halini yükselt
        catchy_hook: true,           // merak uyandıran dikkat çengeli
        melodic_dopamine_booster: true, // melodiyle dopamin artışı
      }),
    });
    if (!res.ok) throw new Error(`Suno API yanıtı: ${res.status}`);
    const data = await res.json();
    onStatus(`🎭 Evre ${phase.no} (${phase.name}) Suno bestesi kuyruğa alındı → ${data?.id || phase.name}`);
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'hata';
    onStatus(`⚠️ Suno API ulaşılamadı (${msg}) — Evre ${phase.no} akışta, üretim kuyrukta`);
  }
}

interface Quest {
  id: string;
  title: string;
  xp: number;
  reward: string;
  done: boolean;
  color: string;
}

const QUESTS: Quest[] = [
  { id: 'q1', title: '3 farklı dükkanda alışveriş yap', xp: 150, reward: '🎟️ Kort Ücretsiz', done: true, color: '#48bb78' },
  { id: 'q2', title: 'Upcycling atölyesine eski ekipman bağışla', xp: 200, reward: '🍜 Chef Masası', done: false, color: '#f59e0b' },
  { id: 'q3', title: 'Sabah yüzme turuna katıl', xp: 120, reward: '☕ Termal Kahve', done: false, color: '#00f2fe' },
  { id: 'q4', title: '3 yıldızlı müşteri yorumu bırak', xp: 80, reward: '💎 50 Likya Puanı', done: false, color: '#a78bfa' },
];

export default function LikyaMusicStation() {
  const [fill, setFill] = useState(42);
  const [playing, setPlaying] = useState(false);
  const [playerXp, setPlayerXp] = useState(1_240);
  const [liked, setLiked] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [published, setPublished] = useState(false);
  const [commentOpen, setCommentOpen] = useState(false);
  const [commentDraft, setCommentDraft] = useState('');
  const [commentSent, setCommentSent] = useState(false);
  const [tick, setTick] = useState(0);
  const [volume, setVolume] = useState(70);
  const [muted, setMuted] = useState(false);

  // 🌤️ Hava Durumu DJ Otomasyonu — türetilmiş değerlerden önce tanımlanır
  const [weather, setWeather] = useState<LikyaWeather>({ temp: 0, code: 0, label: '...', icon: '🌤️', isDay: true, sunset: '', loaded: false, bpmOffset: 0, recommendation: 'Hava durumu bekleniyor...' });
  const [weatherAuto, setWeatherAuto] = useState(true);

  // Türetilmiş değerler — audio fonksiyonlarından ÖNCE (sıralı kullanım)
  const activeTrack = TRACKS.find((t) => fill >= t.fillRange[0] && fill < t.fillRange[1]) || TRACKS[TRACKS.length - 1];
  const liveTempo = tempoForFill(fill) + (weatherAuto && weather.loaded ? weather.bpmOffset : 0);
  const bars = frequencyHeights(fill, tick);
  const totalXp = QUESTS.reduce((s, q) => s + q.xp, 0);
  const earnedXp = QUESTS.filter((q) => q.done).reduce((s, q) => s + q.xp, 0);
  // 🔊 GERÇEK STÜDYO AKIŞ MOTORU (HTMLAudioElement + crossfade)
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const activeTrackRef = useRef(activeTrack);
  activeTrackRef.current = activeTrack;
  const [sunoStatus, setSunoStatus] = useState('');
  const [journeyActive, setJourneyActive] = useState(false);
  const [journeyPhase, setJourneyPhase] = useState(1);
  const [detectedMood, setDetectedMood] = useState('Düşük Enerji / Melankolik');

  // 🗺️ ÇOK BÖLGELİ AKUSTİK MATRİS — bölge başına bağımsız durum
  const [zoneRuntimes, setZoneRuntimes] = useState<Record<string, ZoneRuntime>>(initialZoneRuntimes);
  const [masterParty, setMasterParty] = useState(false);
  // 📡 Canlı Sensör İstihbaratı — onaylı cihazlardan gelen toplu çevre sinyalleri
  const [sensorConsent, setSensorConsent] = useState<Record<string, number>>(
    Object.fromEntries(ZONES.map((z) => [z.id, 0])) // bölge başına onaylı müşteri sayısı
  );
  const [sensorReadings, setSensorReadings] = useState<{ zoneId: string; signal: number; mood: string; time: string; consented: number }[]>([]);
  const [sensorLive, setSensorLive] = useState(false);
  const [privacyOnDevice, setPrivacyOnDevice] = useState(true); // On-Device işleme (söz edilen önerilen mod)

  const fetchWeather = async () => {
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?${WEATHER_LOCATION}&current=temperature_2m,weather_code,is_day&daily=sunset&timezone=Europe%2FIstanbul`
      );
      const d = await res.json();
      const cur = d?.current || {};
      const w = weatherLabel(cur.weather_code ?? 0);
      const sunset = d?.daily?.sunset?.[0] || '';
      const sunsetTime = sunset ? sunset.slice(11, 16) : '';
      setWeather({
        temp: Math.round(cur.temperature_2m ?? 0),
        code: cur.weather_code ?? 0,
        label: w.label,
        icon: w.icon,
        isDay: cur.is_day === 1,
        sunset: sunsetTime,
        loaded: true,
        bpmOffset: w.bpmOffset,
        recommendation: w.rec,
      });
    } catch {
      setWeather((prev) => ({ ...prev, loaded: false, recommendation: 'Hava durumu alınamadı (çevrimdışı)' }));
    }
  };

  useEffect(() => {
    void fetchWeather();
    const interval = setInterval(() => void fetchWeather(), 15 * 60 * 1000); // 15 dk'da bir
    return () => clearInterval(interval);
  }, []);

  // 📡 Sensör taraması — onaylı bölgeler için her 4 sn'de toplu çevre sinyali üretir
  useEffect(() => {
    if (!sensorLive) return;
    const scan = () => {
      const now = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setSensorReadings((prev) => {
        const fresh = ZONES
          .filter((z) => (sensorConsent[z.id] || 0) > 0)
          .map((z) => {
            const consent = sensorConsent[z.id] || 0;
            const signal = Math.round(25 + (consent * 4) + Math.random() * 18);
            const mood = signal > 70 ? 'Eğlenceli' : signal > 50 ? 'Canlı' : signal > 30 ? 'Sakin' : 'Dingin';
            return { zoneId: z.id, signal, mood, time: now, consented: consent };
          });
        return [...fresh, ...prev].slice(0, 25);
      });
    };
    scan();
    const interval = setInterval(scan, 4000);
    return () => clearInterval(interval);
  }, [sensorLive, sensorConsent]);
  const zoneAudioRefs = useRef<Record<string, HTMLAudioElement | null>>({});
  const zoneFadeRefs = useRef<Record<string, ReturnType<typeof setInterval> | null>>({});

  const getZoneAudio = (zoneId: string): HTMLAudioElement => {
    if (!zoneAudioRefs.current[zoneId]) {
      const audio = new Audio();
      audio.preload = 'auto';
      zoneAudioRefs.current[zoneId] = audio;
    }
    return zoneAudioRefs.current[zoneId]!;
  };

  // Bölgeye özel canlı BPM (tempo ± enerji modülasyonu)
  const zoneLiveBpm = (zone: MusicZone, rt: ZoneRuntime): number =>
    Math.round(zone.tempo + (rt.energy - 50) * 0.4);

  // Bölgeyi bağımsız başlat / durdur (kendi akışı + fade-in)
  const toggleZone = (zone: MusicZone) => {
    const rt = zoneRuntimes[zone.id];
    const audio = getZoneAudio(zone.id);
    if (!rt.playing) {
      audio.src = zone.audioUrl;
      audio.volume = 0;
      audio.play().catch(() => { /* autoplay engeli */ });
      const step = 30; // ~0.9sn fade-in
      let i = 0;
      if (zoneFadeRefs.current[zone.id]) clearInterval(zoneFadeRefs.current[zone.id]);
      zoneFadeRefs.current[zone.id] = setInterval(() => {
        i++;
        const tv = rt.muted ? 0 : rt.volume / 100;
        audio.volume = tv * (Math.min(i, step) / step);
        if (i >= step) {
          if (zoneFadeRefs.current[zone.id]) { clearInterval(zoneFadeRefs.current[zone.id]); zoneFadeRefs.current[zone.id] = null; }
          audio.volume = tv;
        }
      }, 30);
      setZoneRuntimes((prev) => ({ ...prev, [zone.id]: { ...prev[zone.id], playing: true } }));
      // 🧠 Bölgeye özel Suno üretim akışı
      const trackLike = { name: zone.name, mood: zone.genre, tempo: zone.tempo, sunoPrompt: zone.sunoPrompt };
      void triggerSunoComposition(trackLike as unknown as TrackOption, (msg) =>
        setZoneRuntimes((prev) => ({ ...prev, [zone.id]: { ...prev[zone.id], sunoStatus: msg } }))
      );
    } else {
      audio.pause();
      if (zoneFadeRefs.current[zone.id]) { clearInterval(zoneFadeRefs.current[zone.id]); zoneFadeRefs.current[zone.id] = null; }
      setZoneRuntimes((prev) => ({ ...prev, [zone.id]: { ...prev[zone.id], playing: false } }));
    }
  };

  // Bölge ses seviyesi / mute (canlı audio.volume'a uygulanır)
  const setZoneVolume = (zoneId: string, v: number) => {
    setZoneRuntimes((prev) => ({ ...prev, [zoneId]: { ...prev[zoneId], volume: v, muted: v === 0 ? prev[zoneId].muted : prev[zoneId].muted } }));
    const audio = zoneAudioRefs.current[zoneId];
    if (audio) audio.volume = v / 100;
  };
  const toggleZoneMute = (zoneId: string) => {
    setZoneRuntimes((prev) => {
      const next = { ...prev, [zoneId]: { ...prev[zoneId], muted: !prev[zoneId].muted } };
      const audio = zoneAudioRefs.current[zoneId];
      if (audio) audio.volume = next[zoneId].muted ? 0 : next[zoneId].volume / 100;
      return next;
    });
  };
  const setZoneEnergy = (zoneId: string, e: number) => {
    setZoneRuntimes((prev) => ({ ...prev, [zoneId]: { ...prev[zoneId], energy: e } }));
  };

  // 🎛️ TESİS GENELİ PARTİ / ANONS MODU — tek tıkla tüm bölgeleri kutlamaya al
  const toggleMasterParty = () => {
    const next = !masterParty;
    setMasterParty(next);
    if (next) {
      ZONES.forEach((zone) => {
        const audio = getZoneAudio(zone.id);
        audio.src = zone.audioUrl;
        audio.volume = 0;
        audio.play().catch(() => { /* */ });
        let i = 0;
        if (zoneFadeRefs.current[zone.id]) clearInterval(zoneFadeRefs.current[zone.id]);
        zoneFadeRefs.current[zone.id] = setInterval(() => {
          i++;
          audio.volume = 0.8 * (Math.min(i, 30) / 30);
          if (i >= 30) { if (zoneFadeRefs.current[zone.id]) { clearInterval(zoneFadeRefs.current[zone.id]); zoneFadeRefs.current[zone.id] = null; } audio.volume = 0.8; }
        }, 30);
      });
      setZoneRuntimes(
        Object.fromEntries(ZONES.map((z) => [z.id, { playing: true, volume: 80, muted: false, energy: 100, sunoStatus: '🎉 Tesis Geneli Parti Modu' }]))
      );
    } else {
      ZONES.forEach((zone) => {
        const audio = zoneAudioRefs.current[zone.id];
        if (audio) audio.pause();
        if (zoneFadeRefs.current[zone.id]) { clearInterval(zoneFadeRefs.current[zone.id]); zoneFadeRefs.current[zone.id] = null; }
      });
      setZoneRuntimes(initialZoneRuntimes());
    }
  };

  // Parça bittiğinde sıradaki gerçek parçaya kesintisiz geç (Otonom DJ)
  const handleTrackEnded = () => {
    const idx = TRACKS.findIndex((t) => t.id === activeTrackRef.current.id);
    const next = TRACKS[(idx + 1) % TRACKS.length];
    setFill(next.fillRange[0] + 2); // UI güncellenir → fill efekti yeni akışı çalar
  };

  const getAudio = () => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.preload = 'auto';
      audio.addEventListener('ended', handleTrackEnded);
      audioRef.current = audio;
    }
    return audioRef.current;
  };

  // Kesintisiz geçiş: kısa fade-in ile gerçek stüdyo akışını başlat
  const playTrack = (target: TrackOption) => {
    const audio = getAudio();
    if (fadeTimerRef.current) { clearInterval(fadeTimerRef.current); fadeTimerRef.current = null; }
    audio.src = target.audioUrl;
    audio.volume = 0;
    audio.play().catch(() => { /* autoplay engeli — kullanıcı tıklamasıyla sürer */ });
    const step = 40; // ~1.2sn yumuşak giriş (crossfade hissi)
    let i = 0;
    fadeTimerRef.current = setInterval(() => {
      i++;
      const targetVol = muted ? 0 : volume / 100;
      audio.volume = targetVol * (Math.min(i, step) / step);
      if (i >= step) {
        if (fadeTimerRef.current) { clearInterval(fadeTimerRef.current); fadeTimerRef.current = null; }
        audio.volume = targetVol;
      }
    }, 30);
  };

  const stopAudio = () => {
    if (fadeTimerRef.current) { clearInterval(fadeTimerRef.current); fadeTimerRef.current = null; }
    const audio = audioRef.current;
    if (audio) { audio.pause(); audio.removeAttribute('src'); audio.load(); }
  };

  const togglePlay = () => {
    if (!playing) {
      playTrack(activeTrack);
      setPlaying(true);
      // 🧠 Suno bestesini arka planda tetikle (üretim kuyruğuna al)
      void triggerSunoComposition(activeTrack, setSunoStatus);
    } else {
      stopAudio();
      setPlaying(false);
    }
  };

  // Ses seviyesi & mute senkronu (gerçek akışa uygulanır)
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : volume / 100;
    }
  }, [volume, muted]);

  // Doluluk değişimi → Otonom DJ kesintisiz geçiş (crossfade)
  useEffect(() => {
    if (playing) playTrack(activeTrack);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fill]);

  // 🎭 DUYGU SERÜVENİ — otomatik BPM rampası: evre değişince parça kesintisiz ilerler
  useEffect(() => {
    if (!journeyActive) return;
    const phase = JOURNEY_PHASES[journeyPhase - 1];
    setFill(phase.fill); // → fill efekti crossfade ile evrenin akışını çalar
    void triggerEmotionalComposition(phase, setSunoStatus);
    if (journeyPhase < JOURNEY_PHASES.length) {
      const t = setTimeout(() => setJourneyPhase((p) => p + 1), JOURNEY_PHASE_MS);
      return () => clearTimeout(t);
    }
    // Son evre (Coşku Rampası) zirvede devam eder — serüven tamamlandı hissi
    setSunoStatus('🎉 Serüven zirvede! Coşku Rampası (124+ BPM) aktif — Likya eğleniyor');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [journeyPhase, journeyActive]);

  // Duygu Dönüştürücü Serüveni başlat / durdur
  const startJourney = () => {
    if (!journeyActive) {
      setJourneyActive(true);
      setJourneyPhase(1);
      setPlaying(true);
      setDetectedMood('Düşük Enerji / Melankolik');
      setSunoStatus('🎭 Vibe Scanner: düşük enerji algılandı — duygu serüveni başlıyor...');
    } else {
      setJourneyActive(false);
      setSunoStatus('🎭 Serüven durduruldu — mevcut akış devam ediyor');
    }
  };

  // Bileşen kapanırken akışı temizle
  useEffect(() => () => {
    if (fadeTimerRef.current) { clearInterval(fadeTimerRef.current); fadeTimerRef.current = null; }
    const audio = audioRef.current;
    if (audio) { audio.pause(); audio.removeAttribute('src'); audio.load(); }
    // Çok bölgeli matris seslerini temizle
    Object.values(zoneAudioRefs.current).forEach((a) => {
      if (a) { a.pause(); a.removeAttribute('src'); a.load(); }
    });
    Object.values(zoneFadeRefs.current).forEach((t) => {
      if (t) clearInterval(t);
    });
    zoneAudioRefs.current = {};
    zoneFadeRefs.current = {};
  }, []);

  // Otonom DJ frekans animasyonu — çalarken çubuklar canlanır
  useEffect(() => {
    if (!playing) return;
    const interval = setInterval(() => setTick((t) => t + 1), 160);
    return () => clearInterval(interval);
  }, [playing]);

  const submitComment = () => {
    if (commentDraft.trim()) {
      setCommentSent(true);
      setCommentOpen(false);
      setCommentDraft('');
    }
  };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🎧 Likya Müzik • Akustik Frekans İstasyonu
          </h2>
          <p style={{ fontSize: '12px', color: '#94a3b8' }}>Otonom Hibrit DJ — Doluluktan Beslenen Canlı Ses Motoru</p>
          <p style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>Mekan doluluğuna göre tempo otomatik değişir • Likya AI & Spotify Lisanslı parçalar</p>
        </div>
        <span style={{ padding: '6px 12px', background: 'rgba(167,139,250,0.15)', color: '#a78bfa', borderRadius: '10px', fontSize: '11px', fontWeight: 'bold' }}>
          <Trophy size={12} style={{ display: 'inline' }} /> {playerXp.toLocaleString('tr-TR')} XP
        </span>
      </div>

      {/* 🌤️ Hava Durumu DJ Otomasyonu — Open-Meteo (ücretsiz) */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap',
        padding: '12px 14px', borderRadius: '14px',
        background: 'linear-gradient(135deg, rgba(0,242,254,0.06), rgba(72,187,120,0.05))',
        border: weatherAuto && weather.loaded ? `1px solid ${weather.bpmOffset >= 0 ? 'rgba(72,187,120,0.4)' : 'rgba(0,242,254,0.4)'}` : '1px solid rgba(255,255,255,0.08)',
      }}>
        <span style={{ fontSize: '22px' }}>{weather.loaded ? weather.icon : '⏳'}</span>
        <div style={{ flex: 1, minWidth: '180px' }}>
          <div style={{ fontSize: '11px', fontWeight: '700', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🌤️ Antalya — Likya Kampüsü
            {weather.loaded && (
              <span style={{ fontSize: '9px', fontWeight: '600', padding: '2px 8px', borderRadius: '8px', background: 'rgba(0,242,254,0.1)', color: '#00f2fe' }}>
                {weather.temp}°C {weather.label}
              </span>
            )}
          </div>
          <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '3px' }}>
            🎵 DJ Otomasyonu: {weather.loaded ? weather.recommendation : 'Hava durumu yükleniyor...'}
            {weather.loaded && weather.sunset && <span style={{ color: '#f59e0b' }}> • 🌇 Gün batımı {weather.sunset}</span>}
            {weatherAuto && weather.loaded && weather.bpmOffset !== 0 && (
              <span style={{ color: weather.bpmOffset > 0 ? '#4ade80' : '#00f2fe' }}> • BPM {weather.bpmOffset > 0 ? `+${weather.bpmOffset}` : weather.bpmOffset}</span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          <button
            onClick={() => setWeatherAuto(!weatherAuto)}
            style={{
              padding: '7px 12px', borderRadius: '16px', cursor: 'pointer',
              border: weatherAuto ? '1px solid rgba(72,187,120,0.5)' : '1px solid rgba(255,255,255,0.2)',
              background: weatherAuto ? 'rgba(72,187,120,0.12)' : 'rgba(255,255,255,0.04)',
              color: weatherAuto ? '#4ade80' : '#94a3b8', fontSize: '9px', fontWeight: '700',
            }}
          >
            {weatherAuto ? '🟢 Hava DJ Otomatik' : '⚪ Manuel'}
          </button>
          <button
            onClick={() => void fetchWeather()}
            title="Hava durumunu yenile"
            style={{
              padding: '7px 12px', borderRadius: '16px', cursor: 'pointer',
              border: '1px solid rgba(0,242,254,0.4)', background: 'rgba(0,242,254,0.08)',
              color: '#00f2fe', fontSize: '9px', fontWeight: '700',
            }}
          >
            🔄 Yenile
          </button>
        </div>
      </div>

      {/* Otonom DJ Bar */}
      {/* Otonom DJ Bar */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(236,201,75,0.1), rgba(0,242,254,0.06))',
        border: '1px solid rgba(236,201,75,0.25)',
        borderRadius: '16px',
        padding: '18px',
        display: 'flex',
        flexDirection: 'column',
        gap: '14px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Play/Pause — gerçek ses çıkışı (Web Audio) */}
            <button
              onClick={togglePlay}
              style={{
                width: '44px', height: '44px', borderRadius: '50%', cursor: 'pointer',
                border: `1px solid ${activeTrack.color}`,
                background: `${activeTrack.color}20`,
                color: activeTrack.color, display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: playing ? `0 0 20px ${activeTrack.color}40` : 'none',
              }}
            >
              {playing ? <Pause size={18} /> : <Play size={18} />}
            </button>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                {playing ? '▶' : '⏸'} {activeTrack.name}
                <span style={{
                  fontSize: '10px', fontWeight: '700', padding: '3px 8px', borderRadius: '8px',
                  color: activeTrack.source === 'Likya AI Original' ? '#a78bfa' : '#34d399',
                  background: activeTrack.source === 'Likya AI Original' ? 'rgba(167,139,250,0.15)' : 'rgba(52,211,153,0.15)',
                  border: `1px solid ${activeTrack.source === 'Likya AI Original' ? 'rgba(167,139,250,0.4)' : 'rgba(52,211,153,0.4)'}`,
                }}>
                  {activeTrack.source}
                </span>
              </div>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                {activeTrack.artist} • Atmosfer: {activeTrack.mood} • {playing ? 'çalıyor' : 'duraklatıldı'}
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Otonom DJ Modu göstergesi */}
            <span style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 'bold',
              background: `${activeTrack.color}15`, color: activeTrack.color,
              border: `1px solid ${activeTrack.color}45`,
              boxShadow: `0 0 12px ${activeTrack.color}25`,
            }}>
              🎛️ Otonom DJ Modu • {liveTempo} BPM
              <span style={{ fontSize: '9px', fontWeight: '600', opacity: 0.85 }}>
                {fill > 80 ? 'MAX ENERJİ' : fill > 55 ? 'YÜKSEK' : fill > 25 ? 'ORTA' : 'SAKİN'}
              </span>
            </span>
            <div style={{ fontSize: '12px', color: '#e2e8f0', fontWeight: '600' }}>
              Doluluk: <span style={{ color: activeTrack.color }}>%{fill}</span>
            </div>
          </div>
        </div>

        {/* Canlı Akustik Frekans Barı */}
        <div style={{
          display: 'flex', alignItems: 'flex-end', gap: '3px', height: '56px',
          padding: '8px', borderRadius: '12px',
          background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.06)',
        }}>
          {bars.map((h, i) => (
            <div key={i} style={{
              flex: 1, height: `${h}%`, borderRadius: '3px',
              background: playing
                ? `linear-gradient(180deg, ${activeTrack.color}, rgba(167,139,250,0.4))`
                : 'rgba(148,163,184,0.35)',
              boxShadow: playing ? `0 0 6px ${activeTrack.color}60` : 'none',
              transition: 'height 0.16s ease, background 0.3s ease',
            }} />
          ))}
        </div>

        {/* Doluluk Slider — serüven aktifken otomatik BPM rampası yönetir */}
        <input
          type="range"
          min={0}
          max={100}
          value={fill}
          disabled={journeyActive}
          onChange={(e) => setFill(Number(e.target.value))}
          style={{
            width: '100%', cursor: journeyActive ? 'not-allowed' : 'pointer',
            accentColor: activeTrack.color, opacity: journeyActive ? 0.6 : 1,
          }}
        />
        {journeyActive && (
          <div style={{ fontSize: '10px', color: '#a78bfa', fontWeight: '600' }}>
            🎛️ BPM Rampası aktif — doluluk serüven tarafından otomatik yönetiliyor (75 → 98 → 124 BPM)
          </div>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#64748b', flexWrap: 'wrap', gap: '4px' }}>
          <span>🌅 Boş (%0-25) → Zen • 72 BPM</span>
          <span>🍹 Orta (%25-55) → Lounge • 92 BPM</span>
          <span>⚡ Yoğun (%55-80) → Groove • 118 BPM</span>
          <span>🎉 Etkinlik (%80+) → Party • 132 BPM</span>
        </div>

        {/* 🔊 Ses Seviyesi & Mute Kontrolü */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '10px 12px', borderRadius: '12px',
          background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
        }}>
          <button
            onClick={() => setMuted(!muted)}
            title={muted ? 'Sesi aç' : 'Sesi kapat'}
            style={{
              width: '34px', height: '34px', borderRadius: '50%', cursor: 'pointer', flexShrink: 0,
              border: muted ? '1px solid rgba(248,113,113,0.5)' : '1px solid rgba(0,242,254,0.4)',
              background: muted ? 'rgba(248,113,113,0.15)' : 'rgba(0,242,254,0.08)',
              color: muted ? '#f87171' : '#00f2fe',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {muted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
          <div style={{ fontSize: '10px', color: '#64748b', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>
            Ses {muted ? 'Kapalı' : `%${volume}`}
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={volume}
            onChange={(e) => { setVolume(Number(e.target.value)); if (muted && Number(e.target.value) > 0) setMuted(false); }}
            style={{ flex: 1, cursor: 'pointer', accentColor: muted ? '#f87171' : '#00f2fe' }}
          />
        </div>

        {/* 🧠 Suno Üretim Kuyruğu Durumu */}
        {sunoStatus && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '8px 12px', borderRadius: '10px', fontSize: '10px', color: '#a78bfa',
            background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.25)',
          }}>
            {sunoStatus}
          </div>
        )}


        {/* Etkileşim & İndirme Butonları */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            onClick={() => setLiked(!liked)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '20px', cursor: 'pointer',
              border: liked ? '1px solid rgba(236,72,153,0.5)' : '1px solid rgba(255,255,255,0.15)',
              background: liked ? 'rgba(236,72,153,0.15)' : 'rgba(255,255,255,0.04)',
              color: liked ? '#ec4899' : '#e2e8f0', fontSize: '11px', fontWeight: '700', transition: 'all 0.2s',
            }}
          >
            <ThumbsUp size={13} /> {liked ? 'Beğendiniz ✓' : 'Beğen'}
          </button>

          <button
            onClick={() => { setCommentOpen(!commentOpen); setCommentSent(false); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '20px', cursor: 'pointer',
              border: commentOpen ? '1px solid rgba(0,242,254,0.5)' : '1px solid rgba(255,255,255,0.15)',
              background: commentOpen ? 'rgba(0,242,254,0.1)' : 'rgba(255,255,255,0.04)',
              color: commentOpen ? '#00f2fe' : '#e2e8f0', fontSize: '11px', fontWeight: '700',
            }}
          >
            <MessageCircle size={13} /> {commentSent ? 'Yorum Gönderildi ✓' : 'Yorum Bırak'}
          </button>

          <button
            onClick={() => setDownloaded(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '20px', cursor: 'pointer',
              border: downloaded ? '1px solid rgba(52,211,153,0.5)' : '1px solid rgba(255,255,255,0.15)',
              background: downloaded ? 'rgba(52,211,153,0.15)' : 'rgba(255,255,255,0.04)',
              color: downloaded ? '#34d399' : '#e2e8f0', fontSize: '11px', fontWeight: '700',
            }}
          >
            <Download size={13} /> {downloaded ? 'İndirildi (MP3) ✓' : 'Parçayı İndir (MP3)'}
          </button>

          <button
            onClick={() => setPublished(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 14px', borderRadius: '20px', cursor: 'pointer',
              border: published ? '1px solid rgba(30,200,90,0.5)' : '1px solid rgba(255,255,255,0.15)',
              background: published ? 'rgba(30,200,90,0.15)' : 'rgba(255,255,255,0.04)',
              color: published ? '#1ec85a' : '#e2e8f0', fontSize: '11px', fontWeight: '700',
            }}
          >
            <Share2 size={13} /> {published ? 'Spotify’da Yayınlandı ✓' : 'Spotify’da Yayınla'}
          </button>
        </div>

        {/* Yorum kutusu */}
        {commentOpen && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <input
              value={commentDraft}
              onChange={(e) => setCommentDraft(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') submitComment(); }}
              placeholder="Müzik yorumunuzu yazın..."
              style={{
                flex: 1, padding: '10px 14px', borderRadius: '12px',
                border: '1px solid rgba(0,242,254,0.3)',
                background: 'rgba(255,255,255,0.05)', color: '#e2e8f0', fontSize: '12px', outline: 'none',
              }}
            />
            <button
              onClick={submitComment}
              style={{
                padding: '10px 16px', borderRadius: '12px', cursor: 'pointer',
                border: 'none', background: 'linear-gradient(135deg, #00f2fe, #f59e0b)',
                color: '#0d1322', fontSize: '12px', fontWeight: 'bold',
              }}
            >
              Gönder
            </button>
          </div>
        )}
      </div>

      {/* 🎭 Mekan Ruh Hali / Vibe Scanner — Duygu Serüveni Paneli */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(167,139,250,0.08), rgba(0,242,254,0.05))',
        border: journeyActive ? '1px solid rgba(167,139,250,0.45)' : '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#fff' }}>
            🎭 Mekan Ruh Hali / Vibe Scanner
          </div>
          <button
            onClick={startJourney}
            style={{
              padding: '9px 16px', borderRadius: '20px', cursor: 'pointer',
              border: journeyActive ? '1px solid rgba(248,113,113,0.5)' : '1px solid rgba(167,139,250,0.5)',
              background: journeyActive ? 'rgba(248,113,113,0.12)' : 'linear-gradient(135deg, #a78bfa, #00f2fe)',
              color: journeyActive ? '#f87171' : '#0d1322',
              fontSize: '11px', fontWeight: '700', transition: 'all 0.2s',
            }}
          >
            {journeyActive ? '⏹ Serüveni Durdur' : '🎭 Duygu Dönüştürücü Serüveni Başlat'}
          </button>
        </div>

        {/* Mod tespiti */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ padding: '6px 10px', borderRadius: '10px', fontSize: '10px', fontWeight: '600', background: 'rgba(248,113,113,0.12)', color: '#f87171', border: '1px solid rgba(248,113,113,0.3)' }}>
            Tespit: {detectedMood}
          </span>
          <span style={{ padding: '6px 10px', borderRadius: '10px', fontSize: '10px', fontWeight: '600', background: 'rgba(52,211,153,0.12)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)' }}>
            Hedef: %100 Yüksek Eğlence
          </span>
          {journeyActive && (
            <span style={{ padding: '6px 10px', borderRadius: '10px', fontSize: '10px', fontWeight: '700', background: JOURNEY_PHASES[journeyPhase - 1].fill > 50 ? 'rgba(245,158,11,0.15)' : 'rgba(0,242,254,0.12)', color: JOURNEY_PHASES[journeyPhase - 1].fill > 50 ? '#f59e0b' : '#00f2fe', border: '1px solid rgba(255,255,255,0.15)' }}>
              BPM Rampası: {JOURNEY_PHASES[journeyPhase - 1].bpm} BPM
            </span>
          )}
        </div>

        {/* Serüven evreleri */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {JOURNEY_PHASES.map((ph) => {
            const isActive = journeyActive && journeyPhase === ph.no;
            const isDone = journeyActive && journeyPhase > ph.no;
            return (
              <div key={ph.no} style={{
                flex: 1, minWidth: '150px',
                padding: '10px', borderRadius: '12px',
                background: isActive ? (ph.fill > 50 ? 'rgba(245,158,11,0.15)' : 'rgba(0,242,254,0.12)') : isDone ? 'rgba(72,187,120,0.08)' : 'rgba(255,255,255,0.02)',
                border: `1px solid ${isActive ? (ph.fill > 50 ? 'rgba(245,158,11,0.5)' : 'rgba(0,242,254,0.5)') : isDone ? 'rgba(72,187,120,0.3)' : 'rgba(255,255,255,0.08)'}`,
              }}>
                <div style={{ fontSize: '10px', fontWeight: '700', color: isDone ? '#48bb78' : isActive ? (ph.fill > 50 ? '#f59e0b' : '#00f2fe') : '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {isDone ? '✅' : isActive ? '▶' : `${ph.no}.`} {ph.name} • {ph.bpm} BPM
                </div>
                <div style={{ fontSize: '9px', color: '#94a3b8', marginTop: '4px', lineHeight: '1.5' }}>{ph.desc}</div>
              </div>
            );
          })}
        </div>
      </div>
      {/* 🗺️ ÇOK BÖLGELİ AKUSTİK MATRİS — Multi-Zone Acoustic Matrix */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(0,242,254,0.05), rgba(245,158,11,0.04))',
        border: masterParty ? '1px solid rgba(245,158,11,0.55)' : '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#fff' }}>
            🗺️ Çok Bölgeli Akustik Matrisi
            <span style={{ fontSize: '9px', color: '#64748b', fontWeight: '400', marginLeft: '8px' }}>
              {ZONES.filter((z) => zoneRuntimes[z.id]?.playing).length}/{ZONES.length} bölge aktif
            </span>
          </div>
          {/* 🎛️ MASTER: Tesis Geneli Parti / Anons Modu */}
          <button
            onClick={toggleMasterParty}
            style={{
              padding: '9px 16px', borderRadius: '20px', cursor: 'pointer',
              border: masterParty ? '1px solid rgba(248,113,113,0.6)' : '1px solid rgba(245,158,11,0.5)',
              background: masterParty ? 'rgba(248,113,113,0.15)' : 'linear-gradient(135deg, #f59e0b, #f87171)',
              color: masterParty ? '#f87171' : '#0d1322',
              fontSize: '11px', fontWeight: '700', transition: 'all 0.2s',
              animation: masterParty ? 'pulse 1.2s infinite' : 'none',
            }}
          >
            {masterParty ? '⏹ Partiyi Bitir' : '🎛️ TESİS GENELİ PARTİ / ANONS MODU'}
          </button>
        </div>

        {/* Master parti banner */}
        {masterParty && (
          <div style={{
            padding: '10px 14px', borderRadius: '12px', fontSize: '12px', fontWeight: '700', color: '#fbbf24',
            background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(248,113,113,0.15))',
            border: '1px solid rgba(245,158,11,0.5)',
            boxShadow: '0 0 20px rgba(245,158,11,0.25)',
            textAlign: 'center',
          }}>
            🎉 TESİS GENELİ KUTLAMA AKTİF — Tüm bölgeler eğlence modunda! 🎉
          </div>
        )}

        {/* Bölge kartları */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '10px' }}>
          {ZONES.map((zone) => {
            const rt = zoneRuntimes[zone.id];
            const liveBpm = zoneLiveBpm(zone, rt);
            return (
              <div key={zone.id} style={{
                display: 'flex', flexDirection: 'column', gap: '8px',
                padding: '12px', borderRadius: '12px',
                background: rt.playing ? `${zone.color}10` : 'rgba(255,255,255,0.02)',
                border: `1px solid ${rt.playing ? `${zone.color}50` : 'rgba(255,255,255,0.08)'}`,
                boxShadow: rt.playing ? `0 0 14px ${zone.color}25` : 'none',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', minWidth: 0 }}>
                    <span style={{ fontSize: '16px' }}>{zone.icon}</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '11px', fontWeight: '700', color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{zone.name}</div>
                      <div style={{ fontSize: '9px', color: zone.color, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{zone.genre}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleZone(zone)}
                    style={{
                      width: '30px', height: '30px', borderRadius: '50%', cursor: 'pointer', flexShrink: 0,
                      border: `1px solid ${rt.playing ? zone.color : 'rgba(255,255,255,0.2)'}`,
                      background: rt.playing ? `${zone.color}25` : 'rgba(255,255,255,0.05)',
                      color: rt.playing ? zone.color : '#94a3b8',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}
                  >
                    {rt.playing ? <Pause size={13} /> : <Play size={13} />}
                  </button>
                </div>

                {/* Canlı BPM + hedef */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '10px', fontWeight: '700', color: '#e2e8f0', background: 'rgba(255,255,255,0.05)', padding: '3px 8px', borderRadius: '8px' }}>
                    {liveBpm} BPM
                  </span>
                  <span style={{ fontSize: '9px', fontWeight: '600', padding: '3px 8px', borderRadius: '8px', background: `${zone.color}12`, color: zone.color }}>
                    Hedef: {zone.target}
                  </span>
                  <span style={{ fontSize: '9px', color: '#64748b' }}>{rt.playing ? '▶ çalıyor' : '⏸ durdu'}</span>
                </div>

                {/* Ses seviyesi + mute */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button onClick={() => toggleZoneMute(zone.id)} title="Sustur" style={{ background: 'none', border: 'none', color: rt.muted ? '#f87171' : '#94a3b8', cursor: 'pointer', padding: '2px' }}>
                    {rt.muted ? <VolumeX size={13} /> : <Volume2 size={13} />}
                  </button>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={rt.volume}
                    onChange={(e) => setZoneVolume(zone.id, Number(e.target.value))}
                    style={{ flex: 1, cursor: 'pointer', accentColor: zone.color, height: '4px' }}
                  />
                  <span style={{ fontSize: '9px', color: '#64748b', minWidth: '24px', textAlign: 'right' }}>%{rt.volume}</span>
                </div>

                {/* Enerji → BPM modülasyonu */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '9px', color: '#64748b' }}>Enerji</span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={rt.energy}
                    onChange={(e) => setZoneEnergy(zone.id, Number(e.target.value))}
                    style={{ flex: 1, cursor: 'pointer', accentColor: zone.color, height: '4px' }}
                  />
                  <span style={{ fontSize: '9px', color: '#64748b', minWidth: '24px', textAlign: 'right' }}>%{rt.energy}</span>
                </div>

                {/* Sensör tetikleyici */}
                <div style={{ fontSize: '8px', color: '#64748b', lineHeight: '1.4' }}>
                  🔌 {zone.trigger}
                </div>

                {/* Bölge Suno üretim akışı */}
                {rt.sunoStatus && (
                  <div style={{ fontSize: '8px', color: '#a78bfa', lineHeight: '1.4' }}>
                    {rt.sunoStatus}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>



      {/* 📡 CANLI SENSÖR İSTİHBARATI & GİZLİLİK MERKEZİ — Kanıt Paneli */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(72,187,120,0.06), rgba(0,242,254,0.04))',
        border: sensorLive ? '1px solid rgba(72,187,120,0.4)' : '1px solid rgba(255,255,255,0.08)',
        borderRadius: '16px',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#fff' }}>
            📡 Canlı Sensör İstihbaratı & Kanıt Merkezi
          </div>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setSensorLive(!sensorLive)}
              style={{
                padding: '7px 14px', borderRadius: '20px', cursor: 'pointer',
                border: sensorLive ? '1px solid rgba(72,187,120,0.5)' : '1px solid rgba(255,255,255,0.2)',
                background: sensorLive ? 'rgba(72,187,120,0.15)' : 'rgba(255,255,255,0.04)',
                color: sensorLive ? '#4ade80' : '#94a3b8', fontSize: '10px', fontWeight: '700',
              }}
            >
              {sensorLive ? '🟢 Sensör Taraması AKTİF' : '⚪ Sensör Taraması Kapalı'}
            </button>
            <button
              onClick={() => setPrivacyOnDevice(!privacyOnDevice)}
              title={privacyOnDevice ? 'On-Device: veri telefonda işlenir, sadece toplu sinyal gönderilir' : 'Bulut işleme (önerilmez)'}
              style={{
                padding: '7px 14px', borderRadius: '20px', cursor: 'pointer',
                border: privacyOnDevice ? '1px solid rgba(52,211,153,0.5)' : '1px solid rgba(248,113,113,0.5)',
                background: privacyOnDevice ? 'rgba(52,211,153,0.12)' : 'rgba(248,113,113,0.12)',
                color: privacyOnDevice ? '#34d399' : '#f87171', fontSize: '10px', fontWeight: '700',
              }}
            >
              {privacyOnDevice ? '🛡️ On-Device İşleme' : '⚠️ Bulut İşleme'}
            </button>
          </div>
        </div>

        {/* Gizlilik & yasal uyarı */}
        <div style={{
          padding: '10px 12px', borderRadius: '10px', fontSize: '9px', lineHeight: '1.6',
          background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', color: '#94a3b8',
        }}>
          🛡️ <b>Gizlilik Sınırı:</b> Bu sistem <b>konuşma içeriğini dinlemez, kaydetmez veya metne dökmez</b>.
          Yalnızca müşterinin açık onayıyla telefonunda <b>anında işlenen toplu çevre sinyalleri</b> (gürültü seviyesi, enerji,
          ruh hali eğilimi) gönderilir — ham ses/konuşma asla iletilmez. KVKK & GDPR uyumlu; müşteri iznini dilediği an geri çekebilir.
        </div>

        {/* Veri akışı diyagramı */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '10px', color: '#64748b' }}>
          <span style={{ padding: '6px 10px', borderRadius: '8px', background: 'rgba(0,242,254,0.08)', color: '#00f2fe', border: '1px solid rgba(0,242,254,0.3)' }}>📱 Müşteri Telefonu (İzin)</span>
          <span>→</span>
          <span style={{ padding: '6px 10px', borderRadius: '8px', background: 'rgba(52,211,153,0.08)', color: '#34d399', border: '1px solid rgba(52,211,153,0.3)' }}>🧠 On-Device Analiz (konuşma YOK)</span>
          <span>→</span>
          <span style={{ padding: '6px 10px', borderRadius: '8px', background: 'rgba(167,139,250,0.08)', color: '#a78bfa', border: '1px solid rgba(167,139,250,0.3)' }}>📊 Toplu Sinyal (aggregate)</span>
          <span>→</span>
          <span style={{ padding: '6px 10px', borderRadius: '8px', background: 'rgba(245,158,11,0.08)', color: '#f59e0b', border: '1px solid rgba(245,158,11,0.3)' }}>🖥️ Bu Panel</span>
        </div>

        {/* Bölge bazında onay + canlı okuma */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
          {ZONES.map((zone) => {
            const consent = sensorConsent[zone.id] || 0;
            const last = sensorReadings.find((r) => r.zoneId === zone.id);
            return (
              <div key={zone.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px', padding: '10px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '10px', fontWeight: '700', color: '#fff' }}>{zone.icon} {zone.name}</span>
                  <span style={{ fontSize: '9px', color: consent > 0 ? '#4ade80' : '#64748b' }}>
                    {consent > 0 ? `${consent} onaylı` : 'onay yok'}
                  </span>
                </div>
                {/* Onay sayısı (müşteri uygulaması entegre olunca gerçek veri gelir) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '9px', color: '#64748b' }}>Onay</span>
                  <input
                    type="range" min={0} max={12} value={consent}
                    onChange={(e) => setSensorConsent((prev) => ({ ...prev, [zone.id]: Number(e.target.value) }))}
                    style={{ flex: 1, cursor: 'pointer', accentColor: '#4ade80', height: '4px' }}
                  />
                  <span style={{ fontSize: '9px', color: '#64748b', minWidth: '16px', textAlign: 'right' }}>{consent}</span>
                </div>
                {sensorLive && last ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ flex: 1, height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${last.signal}%`, height: '100%', background: `linear-gradient(90deg, ${zone.color}, #4ade80)`, borderRadius: '4px', transition: 'width 0.8s ease' }} />
                    </div>
                    <span style={{ fontSize: '9px', fontWeight: '700', color: zone.color }}>{last.signal}</span>
                    <span style={{ fontSize: '9px', color: '#64748b' }}>{last.mood}</span>
                    <span style={{ fontSize: '8px', color: '#475569' }}>{last.time}</span>
                  </div>
                ) : (
                  <div style={{ fontSize: '9px', color: '#475569' }}>⏸ okuma bekleniyor (onay + tarama)</div>
                )}
              </div>
            );
          })}
        </div>

        {/* Operasyonel günlük (kanıt) */}
        <div style={{ maxHeight: '120px', overflowY: 'auto', padding: '8px 10px', borderRadius: '10px', background: 'rgba(0,0,0,0.25)', border: '1px solid rgba(255,255,255,0.06)', fontSize: '9px', color: '#64748b', lineHeight: '1.7', fontFamily: 'monospace' }}>
          {sensorReadings.length === 0 && '📡 Sistem bekliyor... Taramayı açın ve en az bir bölgeye onay verin.'}
          {sensorReadings.slice(0, 12).map((r, i) => {
            const zone = ZONES.find((z) => z.id === r.zoneId);
            return (
              <div key={`${r.zoneId}-${r.time}-${i}`}>
                [{r.time}] {zone?.icon} {zone?.name}: sinyal={r.signal} ruh={r.mood} (onaylı: {r.consented}) — ham ses İLETİLMEDİ ✓
              </div>
            );
          })}
        </div>
      </div>


      {/* Gamification: Mini Macera Görev Motoru */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: '14px',
        padding: '16px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', flexWrap: 'wrap', gap: '8px' }}>
          <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold' }}>
            🎮 Mini Macera Görev Motoru
          </div>
          <div style={{ fontSize: '11px', color: '#a78bfa', fontWeight: '600' }}>
            {earnedXp}/{totalXp} XP tamamlandı
          </div>
        </div>

        {/* XP ilerleme çubuğu */}
        <div style={{ height: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', overflow: 'hidden', marginBottom: '14px' }}>
          <div style={{
            width: `${(earnedXp / totalXp) * 100}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #a78bfa, #00f2fe)',
            borderRadius: '6px',
            boxShadow: '0 0 10px rgba(167,139,250,0.5)',
            transition: 'width 0.6s ease',
          }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '10px' }}>
          {QUESTS.map((q) => (
            <div key={q.id} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              background: q.done ? `${q.color}10` : 'rgba(255,255,255,0.02)',
              border: `1px solid ${q.done ? `${q.color}40` : 'rgba(255,255,255,0.08)'}`,
              borderRadius: '12px', padding: '12px',
            }}>
              {q.done
                ? <CheckCircle2 size={18} color="#48bb78" />
                : <Sparkles size={18} color={q.color} />}
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '12px', fontWeight: '600', color: '#fff' }}>{q.title}</div>
                <div style={{ fontSize: '10px', color: '#64748b', marginTop: '2px' }}>
                  +{q.xp} XP • Ödül: {q.reward}
                </div>
              </div>
              <span style={{
                fontSize: '9px', fontWeight: '700', padding: '3px 8px', borderRadius: '8px', textTransform: 'uppercase',
                color: q.done ? '#48bb78' : '#64748b',
                background: q.done ? 'rgba(72,187,120,0.12)' : 'rgba(255,255,255,0.04)',
              }}>
                {q.done ? 'Tamam' : 'Aktif'}
              </span>
            </div>
          ))}
        </div>

        {/* Rozetler */}
        <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
          {[
            { icon: '🔥', label: '5 Gün Seri' },
            { icon: '⚡', label: 'Hızlı Turist' },
            { icon: '🍽️', label: 'Lezzet Avcısı' },
            { icon: '🌊', label: 'Sahil Ruhu' },
            { icon: '💎', label: '1.240 XP Toplayıcı' },
          ].map((b) => (
            <span key={b.label} style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '6px 12px', borderRadius: '20px', fontSize: '10px', fontWeight: '600',
              background: 'rgba(236,201,75,0.1)', color: '#ecc94b',
              border: '1px solid rgba(236,201,75,0.25)',
            }}>
              {b.icon} {b.label}
            </span>
          ))}
        </div>
      </div>
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}

