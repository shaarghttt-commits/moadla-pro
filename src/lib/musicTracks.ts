export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  genre: string;
  duration: number; // in seconds
  emoji: string;
  previewUrl?: string; // audio URL or synthesized sound
}

export const PRESET_MUSIC_TRACKS: MusicTrack[] = [
  {
    id: 'track-1',
    title: 'حلم السنين وهندسة 🎓',
    artist: 'أغاني التفوق والنجاح',
    genre: 'حماس وتفوق',
    duration: 15,
    emoji: '🎓',
  },
  {
    id: 'track-2',
    title: 'باشمهندس المستقبل ⚡',
    artist: 'طاقة وإصرار 2025',
    genre: 'موتيفيشن',
    duration: 15,
    emoji: '⚡',
  },
  {
    id: 'track-3',
    title: 'Lofi Study Chill & Deep Focus 🎧',
    artist: 'Moadla Lofi Beats',
    genre: 'هدوء ومذاكرة',
    duration: 20,
    emoji: '🎧',
  },
  {
    id: 'track-4',
    title: 'هدوء المطر والقهوة 🌧️☕',
    artist: 'مذاكرة الفجر',
    genre: 'أجواء دراسية',
    duration: 15,
    emoji: '🌧️',
  },
  {
    id: 'track-5',
    title: 'طاقة ونار قبل الامتحان 🔥',
    artist: 'وحوش معادلة الهندسة',
    genre: 'طاقة قصوى',
    duration: 15,
    emoji: '🔥',
  },
  {
    id: 'track-6',
    title: 'سيمفونية الفرحة والانتصار 🎻',
    artist: 'يوم النتيجة والقبول',
    genre: 'فرحة واحتفال',
    duration: 15,
    emoji: '✨',
  },
];
