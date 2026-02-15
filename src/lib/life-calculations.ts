// Life in Dots 2.0 - Life Calculations Utility

import {
  WeekEntry,
  LifePhase,
  LifeStats,
  Mood,
  LIFE_PHASES,
  MOOD_CONFIG,
  Milestone,
  WorldEvent,
} from './types';

// Generate a unique ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

// Get the life phase based on age
export function getLifePhase(age: number): LifePhase {
  if (age <= 12) return 'childhood';
  if (age <= 19) return 'teen';
  if (age <= 29) return 'young-adult';
  if (age <= 49) return 'adult';
  if (age <= 64) return 'middle-age';
  return 'senior';
}

// Calculate total weeks between two dates
export function weeksBetween(date1: Date, date2: Date): number {
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  return Math.floor((date2.getTime() - date1.getTime()) / msPerWeek);
}

// Get week number in life from birthdate
export function getWeekNumberInLife(birthdate: Date, targetDate: Date): number {
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  return Math.floor((targetDate.getTime() - birthdate.getTime()) / msPerWeek);
}

// Get the start and end dates of a specific week number
export function getWeekDates(birthdate: Date, weekNumber: number): { start: Date; end: Date } {
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const start = new Date(birthdate.getTime() + weekNumber * msPerWeek);
  const end = new Date(start.getTime() + 6 * 24 * 60 * 60 * 1000);
  return { start, end };
}

// Calculate age at a specific date
export function getAgeAtDate(birthdate: Date, targetDate: Date): number {
  let age = targetDate.getFullYear() - birthdate.getFullYear();
  const monthDiff = targetDate.getMonth() - birthdate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && targetDate.getDate() < birthdate.getDate())) {
    age--;
  }
  return age;
}

// Calculate age at a specific week
export function getAgeAtWeek(birthdate: Date, weekNumber: number): number {
  const { start } = getWeekDates(birthdate, weekNumber);
  return getAgeAtDate(birthdate, start);
}

// Generate all week entries for a life
export function generateLifeWeeks(
  birthdate: Date,
  lifeExpectancy: number
): WeekEntry[] {
  const weeks: WeekEntry[] = [];
  const totalWeeks = lifeExpectancy * 52;
  const now = new Date();
  const currentWeekNumber = getWeekNumberInLife(birthdate, now);

  for (let i = 0; i < totalWeeks; i++) {
    const { start, end } = getWeekDates(birthdate, i);
    const age = getAgeAtDate(birthdate, start);
    const lifePhase = getLifePhase(age);
    const isLived = i < currentWeekNumber;
    const isCurrent = i === currentWeekNumber;

    weeks.push({
      weekNumber: i,
      year: Math.floor(i / 52),
      weekOfYear: (i % 52) + 1,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      isLived,
      isCurrent,
      lifePhase,
      age,
    });
  }

  return weeks;
}

// Calculate life statistics
export function calculateLifeStats(
  weeks: WeekEntry[],
  birthdate: Date
): LifeStats {
  const now = new Date();
  const currentWeekNumber = getWeekNumberInLife(birthdate, now);

  const livedWeeks = weeks.filter(w => w.isLived);
  const journalEntries = livedWeeks.filter(w => w.journal && w.journal.length > 0);

  // Calculate average mood
  const weeksWithMood = livedWeeks.filter(w => w.mood);
  const avgMood = weeksWithMood.length > 0
    ? weeksWithMood.reduce((sum, w) => sum + MOOD_CONFIG[w.mood!].value, 0) / weeksWithMood.length
    : 3;

  // Calculate journal streak
  let streak = 0;
  for (let i = currentWeekNumber - 1; i >= 0; i--) {
    const week = weeks[i];
    if (week?.journal && week.journal.length > 0) {
      streak++;
    } else {
      break;
    }
  }

  // Calculate phase breakdown
  const phaseBreakdown: Record<LifePhase, number> = {
    'childhood': 0,
    'teen': 0,
    'young-adult': 0,
    'adult': 0,
    'middle-age': 0,
    'senior': 0,
  };

  livedWeeks.forEach(w => {
    phaseBreakdown[w.lifePhase]++;
  });

  // Calculate mood distribution
  const moodDistribution: Record<Mood, number> = {
    'great': 0,
    'good': 0,
    'neutral': 0,
    'bad': 0,
    'terrible': 0,
  };

  weeksWithMood.forEach(w => {
    moodDistribution[w.mood!]++;
  });

  // Calculate life score (0-100)
  const journalScore = Math.min(journalEntries.length / 52 * 20, 20); // Max 20 points
  const moodScore = (avgMood / 5) * 30; // Max 30 points
  const streakScore = Math.min(streak / 12 * 20, 20); // Max 20 points
  const phaseDiversityScore = Object.values(phaseBreakdown).filter(v => v > 0).length * 5; // Max 30 points

  const lifeScore = Math.round(journalScore + moodScore + streakScore + phaseDiversityScore);

  return {
    totalWeeksLived: currentWeekNumber,
    totalWeeksRemaining: weeks.length - currentWeekNumber,
    percentageLived: (currentWeekNumber / weeks.length) * 100,
    currentPhase: weeks[currentWeekNumber]?.lifePhase || 'adult',
    averageMood: Math.round(avgMood * 10) / 10,
    journalStreak: streak,
    totalJournalEntries: journalEntries.length,
    lifeScore,
    phaseBreakdown,
    moodDistribution,
  };
}

// Major world events for the timeline
export const WORLD_EVENTS: WorldEvent[] = [
  { id: '1', title: 'World War II Ends', date: '1945-09-02', description: 'End of the deadliest conflict in human history', category: 'politics', significance: 10 },
  { id: '2', title: 'First Computer', date: '1946-02-14', description: 'ENIAC, the first general-purpose computer, is unveiled', category: 'technology', significance: 9 },
  { id: '3', title: 'DNA Structure Discovered', date: '1953-04-25', description: 'Watson and Crick discover the double helix structure of DNA', category: 'science', significance: 10 },
  { id: '4', title: 'Sputnik Launch', date: '1957-10-04', description: 'Soviet Union launches the first artificial satellite', category: 'science', significance: 9 },
  { id: '5', title: 'Moon Landing', date: '1969-07-20', description: 'Neil Armstrong becomes the first human to walk on the Moon', category: 'science', significance: 10 },
  { id: '6', title: 'Internet Protocol', date: '1983-01-01', description: 'TCP/IP becomes the standard protocol for ARPANET', category: 'technology', significance: 10 },
  { id: '7', title: 'Berlin Wall Falls', date: '1989-11-09', description: 'Symbol of the Cold War division comes down', category: 'politics', significance: 10 },
  { id: '8', title: 'World Wide Web', date: '1991-08-06', description: 'Tim Berners-Lee launches the first website', category: 'technology', significance: 10 },
  { id: '9', title: '9/11 Attacks', date: '2001-09-11', description: 'Terrorist attacks on the World Trade Center and Pentagon', category: 'disaster', significance: 10 },
  { id: '10', title: 'iPhone Launch', date: '2007-06-29', description: 'Apple introduces the iPhone, revolutionizing smartphones', category: 'technology', significance: 9 },
  { id: '11', title: 'Bitcoin Created', date: '2009-01-03', description: 'Satoshi Nakamoto mines the first Bitcoin block', category: 'technology', significance: 8 },
  { id: '12', title: 'Higgs Boson Discovered', date: '2012-07-04', description: 'CERN confirms the existence of the Higgs boson', category: 'science', significance: 9 },
  { id: '13', title: 'COVID-19 Pandemic', date: '2020-03-11', description: 'WHO declares COVID-19 a global pandemic', category: 'disaster', significance: 10 },
  { id: '14', title: 'ChatGPT Launch', date: '2022-11-30', description: 'OpenAI releases ChatGPT, sparking the AI revolution', category: 'technology', significance: 9 },
  { id: '15', title: 'First AI Art Exhibition', date: '2018-10-25', description: 'AI-generated artwork sells for $432,500 at Christie\'s', category: 'culture', significance: 7 },
];

// Get world events that occurred during the user's life
export function getWorldEventsDuringLife(birthdate: Date): WorldEvent[] {
  return WORLD_EVENTS.filter(event => new Date(event.date) >= birthdate)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

// Get week number for a world event
export function getWeekForWorldEvent(birthdate: Date | string, eventDate: Date | string): number {
  const birth = typeof birthdate === 'string' ? new Date(birthdate) : birthdate;
  const event = typeof eventDate === 'string' ? new Date(eventDate) : eventDate;
  return getWeekNumberInLife(birth, event);
}

// Format date for display
export function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// Format week for display
export function formatWeek(week: WeekEntry): string {
  return `Week ${week.weekOfYear}, Age ${week.age} (${LIFE_PHASES[week.lifePhase].name})`;
}

// Calculate next milestone week
export function getNextMilestoneWeek(currentWeek: number): { week: number; title: string } | null {
  const milestones = [
    { week: 52, title: '1 Year Old' },
    { week: 52 * 5, title: 'Started School' },
    { week: 52 * 10, title: 'Double Digits' },
    { week: 52 * 13, title: 'Teenager' },
    { week: 52 * 16, title: 'Can Drive' },
    { week: 52 * 18, title: 'Adult' },
    { week: 52 * 21, title: 'Legal Drinking Age (US)' },
    { week: 52 * 25, title: 'Quarter Century' },
    { week: 52 * 30, title: 'Turned 30' },
    { week: 52 * 40, title: 'Turned 40' },
    { week: 52 * 50, title: 'Half Century' },
    { week: 52 * 60, title: 'Turned 60' },
    { week: 52 * 65, title: 'Retirement Age' },
    { week: 52 * 70, title: 'Turned 70' },
    { week: 52 * 80, title: 'Octogenarian' },
    { week: 52 * 90, title: 'Nonagenarian' },
    { week: 52 * 100, title: 'Century!' },
  ];

  for (const milestone of milestones) {
    if (milestone.week > currentWeek) {
      return milestone;
    }
  }
  return null;
}

// Generate default milestones based on birthdate
export function generateDefaultMilestones(birthdate: Date): Milestone[] {
  const milestones: Milestone[] = [];
  const year = birthdate.getFullYear();

  // Birth
  milestones.push({
    id: 'birth',
    title: 'Born',
    date: birthdate.toISOString().split('T')[0],
    weekNumber: 0,
    category: 'personal',
    description: 'The beginning of your journey',
  });

  // First steps (around 1 year)
  milestones.push({
    id: 'first-steps',
    title: 'First Steps',
    date: new Date(birthdate.getTime() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    weekNumber: 52,
    category: 'personal',
    description: 'A major milestone in development',
  });

  // School (around 5-6 years)
  milestones.push({
    id: 'first-school',
    title: 'First Day of School',
    date: new Date(birthdate.getTime() + 5.5 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    weekNumber: 52 * 5.5,
    category: 'education',
    description: 'The start of formal education',
  });

  // Teenager
  milestones.push({
    id: 'teenager',
    title: 'Became a Teenager',
    date: new Date(year + 13, birthdate.getMonth(), birthdate.getDate()).toISOString().split('T')[0],
    weekNumber: 52 * 13,
    category: 'personal',
    description: 'Welcome to the teenage years',
  });

  // Adult
  milestones.push({
    id: 'adult',
    title: 'Became an Adult',
    date: new Date(year + 18, birthdate.getMonth(), birthdate.getDate()).toISOString().split('T')[0],
    weekNumber: 52 * 18,
    category: 'personal',
    description: 'Legal adulthood begins',
  });

  return milestones;
}
