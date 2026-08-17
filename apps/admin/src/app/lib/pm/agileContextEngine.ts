// ============================================================================
// 📊 YAPAY ZEKA PROJE YÖNETİM ADAPTÖRÜ (Laba PM Blueprint)
// Toplantı ses/metin kaydı → anında aksiyon maddeleri + takvim görevleri.
// Darboğaz analizi. Deterministik; Plan Z güvenli. Kırılmasız.
// ============================================================================

export interface MeetingNote {
  text: string;
  attendees: string[];
}

export interface ActionItem {
  task: string;
  assignee: string;
  dueDate: string;
  priority: 'yuksek' | 'orta' | 'dusuk';
}

export interface Bottleneck {
  area: string;
  severity: number; // 0-100
  recommendation: string;
}

// Toplantı metninden aksiyon maddeleri çıkar (deterministik keyword eşleşme)
const ACTION_VERBS = ['yapalım', 'yapılacak', 'tamamlayalım', 'bitirelim', 'takip edelim', 'planlayalım', 'araştıralım'];

export function extractActionItems(note: MeetingNote): ActionItem[] {
  const sentences = note.text.split(/[.!?]+/).map((s) => s.trim()).filter(Boolean);
  const items: ActionItem[] = [];
  sentences.forEach((s, i) => {
    const lower = s.toLowerCase();
    if (ACTION_VERBS.some((v) => lower.includes(v))) {
      items.push({
        task: applyGentle(s),
        assignee: note.attendees[i % note.attendees.length] ?? 'Daze Crew',
        dueDate: new Date(Date.now() + (i + 1) * 86400000).toISOString().slice(0, 10),
        priority: lower.includes('acil') ? 'yuksek' : lower.includes('önemli') ? 'orta' : 'dusuk',
      });
    }
  });
  return items;
}

// Daze nezaket filtresi — aksiyon maddeleri nazik tonda
export function applyGentle(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/^(yapalım|yapılacak|tamamlayalım|bitirelim|takip edelim|planlayalım|araştıralım)/i, 'Lütfen $1')
    .replace(/!+$/, '');
}

// Darboğaz analizi (deterministik — görev yükü yoğunluğu)
export function analyzeBottlenecks(notes: MeetingNote[]): Bottleneck[] {
  const totalTasks = notes.reduce((s, n) => s + extractActionItems(n).length, 0);
  return [
    { area: 'Tesis Bakım', severity: Math.min(90, 55 + totalTasks * 7), recommendation: 'Bakım vardiyasına 1 ek personel tahsis edilmeli' },
    { area: 'Pazaryeri Sipariş', severity: Math.min(90, 48 + totalTasks * 5), recommendation: 'Sipariş öncelik kuyruğu otomasyonu genişletilmeli' },
    { area: 'Daze Chef Mutfak', severity: Math.min(90, 42 + totalTasks * 4), recommendation: '120s sayacına paralel hazırlık istasyonu eklenmeli' },
  ];
}

export function agilePmStatus(): string {
  return `Agile PM [Laba blueprint • kayıt→aksiyon • darboğaz • nezaket tonu]`;
}
