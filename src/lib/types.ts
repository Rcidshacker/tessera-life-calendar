// Life in Dots 2.0 - Type Definitions

export type Mood = 'great' | 'good' | 'neutral' | 'bad' | 'terrible';

export type LifePhase =
  | 'childhood'    // 0-12
  | 'teen'         // 13-19
  | 'young-adult'  // 20-29
  | 'adult'        // 30-49
  | 'middle-age'   // 50-64
  | 'senior';      // 65+

export type MilestoneCategory = 'personal' | 'career' | 'education' | 'relationship' | 'health' | 'travel' | 'family';

export interface WeekEntry {
  weekNumber: number;
  year: number;
  weekOfYear: number;
  startDate: string;
  endDate: string;
  journal?: string;
  mood?: Mood;
  tags?: string[];
  goals?: string[];
  isLived: boolean;
  isCurrent: boolean;
  lifePhase: LifePhase;
  age: number;
}

export interface Milestone {
  id: string;
  title: string;
  date: string;
  weekNumber?: number; // Calculated on frontend if not in DB
  category: MilestoneCategory;
  description?: string;
  icon?: string;
  isCompleted?: boolean; // For compatibility with milestone-tracker
  user_id?: string;
  created_at?: string;
}

export interface WorldEvent {
  id: string;
  title: string;
  date: string;
  description: string;
  category: 'technology' | 'politics' | 'science' | 'culture' | 'disaster' | 'sports';
  significance: number; // 1-10
}

export interface UserSettings {
  birthdate: string;
  lifeExpectancy: number;
  name: string;
  theme: 'dark' | 'light' | 'system';
  showWorldEvents: boolean;
  gridZoom: number;
}

export interface LifeData {
  settings: UserSettings;
  weeks: Map<number, WeekEntry>;
  milestones: Milestone[];
  lastUpdated: string;
}

export interface LifeStats {
  totalWeeksLived: number;
  totalWeeksRemaining: number;
  percentageLived: number;
  currentPhase: LifePhase;
  averageMood: number;
  journalStreak: number;
  totalJournalEntries: number;
  lifeScore: number;
  phaseBreakdown: Record<LifePhase, number>;
  moodDistribution: Record<Mood, number>;
}

export interface AIInsight {
  id: string;
  type: 'pattern' | 'suggestion' | 'reflection' | 'encouragement';
  title: string;
  content: string;
  createdAt: string;
}

export interface LifePhaseInfo {
  name: string;
  ageRange: [number, number];
  color: string;
  bgColor: string;
  description: string;
}

export const LIFE_PHASES: Record<LifePhase, LifePhaseInfo> = {
  'childhood': {
    name: 'Childhood',
    ageRange: [0, 12],
    color: '#60A5FA', // blue
    bgColor: 'rgba(96, 165, 250, 0.2)',
    description: 'The wonder years of discovery and growth'
  },
  'teen': {
    name: 'Teen Years',
    ageRange: [13, 19],
    color: '#A78BFA', // purple
    bgColor: 'rgba(167, 139, 250, 0.2)',
    description: 'Years of transformation and identity'
  },
  'young-adult': {
    name: 'Young Adult',
    ageRange: [20, 29],
    color: '#34D399', // emerald
    bgColor: 'rgba(52, 211, 153, 0.2)',
    description: 'Building foundations and exploring paths'
  },
  'adult': {
    name: 'Adult',
    ageRange: [30, 49],
    color: '#FBBF24', // amber
    bgColor: 'rgba(251, 191, 36, 0.2)',
    description: 'Peak productivity and deep relationships'
  },
  'middle-age': {
    name: 'Middle Age',
    ageRange: [50, 64],
    color: '#F97316', // orange
    bgColor: 'rgba(249, 115, 22, 0.2)',
    description: 'Wisdom and legacy building'
  },
  'senior': {
    name: 'Senior',
    ageRange: [65, 120],
    color: '#EC4899', // pink
    bgColor: 'rgba(236, 72, 153, 0.2)',
    description: 'Reflection and sharing wisdom'
  }
};

export const MOOD_CONFIG: Record<Mood, { color: string; emoji: string; label: string; value: number }> = {
  'great': { color: '#22C55E', emoji: '😄', label: 'Great', value: 5 },
  'good': { color: '#84CC16', emoji: '🙂', label: 'Good', value: 4 },
  'neutral': { color: '#EAB308', emoji: '😐', label: 'Neutral', value: 3 },
  'bad': { color: '#F97316', emoji: '😕', label: 'Bad', value: 2 },
  'terrible': { color: '#EF4444', emoji: '😢', label: 'Terrible', value: 1 }
};

export const MILESTONE_ICONS: Record<MilestoneCategory, string> = {
  personal: '⭐',
  career: '💼',
  education: '🎓',
  relationship: '❤️',
  health: '🏃',
  travel: '✈️',
  family: '👨‍👩‍👧‍👦'
};

export const moodColors: Record<Mood, { bg: string }> = {
  great: { bg: 'bg-green-500' },
  good: { bg: 'bg-lime-500' },
  neutral: { bg: 'bg-yellow-500' },
  bad: { bg: 'bg-orange-500' },
  terrible: { bg: 'bg-red-500' }
};
