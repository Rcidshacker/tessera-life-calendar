'use client';

// Life in Dots 2.0 - Life Grid Component

import { useState, useMemo, useCallback, useRef } from 'react';
import { WeekEntry, LIFE_PHASES, MOOD_CONFIG, Mood } from '@/lib/types';
import { formatWeek, formatDate } from '@/lib/life-calculations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { 
  ZoomIn, 
  ZoomOut, 
  Calendar,
  Heart,
  Sparkles,
  Target
} from 'lucide-react';

interface LifeGridProps {
  weeks: WeekEntry[];
  currentWeekNumber: number;
  onUpdateWeek: (weekNumber: number, data: { journal?: string; mood?: Mood; tags?: string[]; goals?: string[] }) => void;
}

export function LifeGrid({ weeks, currentWeekNumber, onUpdateWeek }: LifeGridProps) {
  const [selectedWeek, setSelectedWeek] = useState<WeekEntry | null>(null);
  const [zoom, setZoom] = useState(1);
  const gridRef = useRef<HTMLDivElement>(null);
  const currentWeekRef = useRef<HTMLDivElement>(null);

  // Journal state for selected week
  const [journalText, setJournalText] = useState('');
  const [selectedMood, setSelectedMood] = useState<Mood | undefined>();
  const [goalText, setGoalText] = useState('');

  // Get dot color based on week data
  const getDotColor = useCallback((week: WeekEntry): string => {
    if (!week.isLived) {
      return 'bg-gray-800/30 border-gray-700/30';
    }
    
    if (week.mood) {
      const moodColor = MOOD_CONFIG[week.mood].color;
      return `border-[${moodColor}]/50`;
    }
    
    const phaseColor = LIFE_PHASES[week.lifePhase].color;
    return '';
  }, []);

  // Get dot background based on mood or phase
  const getDotBg = useCallback((week: WeekEntry): string => {
    if (!week.isLived) {
      return 'bg-gray-800/30';
    }
    
    if (week.mood) {
      return `bg-[${MOOD_CONFIG[week.mood].color}]`;
    }
    
    return `bg-[${LIFE_PHASES[week.lifePhase].color}]`;
  }, []);

  // Handle week selection
  const handleWeekClick = useCallback((week: WeekEntry) => {
    setSelectedWeek(week);
    setJournalText(week.journal || '');
    setSelectedMood(week.mood);
    setGoalText(week.goals?.join('\n') || '');
  }, []);

  // Save week data
  const handleSaveWeek = useCallback(() => {
    if (!selectedWeek) return;
    
    onUpdateWeek(selectedWeek.weekNumber, {
      journal: journalText,
      mood: selectedMood,
      goals: goalText.split('\n').filter(g => g.trim()),
    });
    
    setSelectedWeek(null);
  }, [selectedWeek, journalText, selectedMood, goalText, onUpdateWeek]);

  // Group weeks by year for display
  const yearsData = useMemo(() => {
    const years: { year: number; weeks: WeekEntry[]; age: number }[] = [];
    const totalYears = Math.ceil(weeks.length / 52);
    
    for (let year = 0; year < totalYears; year++) {
      const yearWeeks = weeks.slice(year * 52, (year + 1) * 52);
      years.push({
        year,
        weeks: yearWeeks,
        age: year,
      });
    }
    
    return years;
  }, [weeks]);

  // Calculate visible years based on zoom
  const visibleYears = useMemo(() => {
    const startYear = Math.max(0, Math.floor((1 / zoom) * 0) - 5);
    const endYear = Math.min(yearsData.length, Math.ceil(yearsData.length * zoom) + 10);
    return yearsData.slice(0, Math.ceil(yearsData.length / zoom) + 20);
  }, [yearsData, zoom]);

  return (
    <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-purple-400" />
            Your Life Journey
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoom(Math.min(2, zoom + 0.25))}
              className="text-gray-400 hover:text-white"
            >
              <ZoomIn className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setZoom(Math.max(0.5, zoom - 0.25))}
              className="text-gray-400 hover:text-white"
            >
              <ZoomOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        {/* Phase Legend */}
        <div className="flex flex-wrap gap-2 mb-4">
          {Object.entries(LIFE_PHASES).map(([key, phase]) => (
            <div key={key} className="flex items-center gap-1.5 text-xs">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: phase.color }}
              />
              <span className="text-gray-400">{phase.name}</span>
            </div>
          ))}
          <div className="mx-2 w-px h-4 bg-gray-700" />
          {Object.entries(MOOD_CONFIG).map(([key, config]) => (
            <div key={key} className="flex items-center gap-1 text-xs">
              <span>{config.emoji}</span>
              <span className="text-gray-400">{config.label}</span>
            </div>
          ))}
        </div>

        {/* Life Grid */}
        <ScrollArea className="h-[500px] pr-4">
          <div
            ref={gridRef}
            className="space-y-1"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top left',
              width: `${100 / zoom}%`,
            }}
          >
            {/* Year rows */}
            <div className="flex items-start gap-2">
              <div className="w-12 flex-shrink-0 text-xs text-gray-500 font-medium">
                Age
              </div>
              <div className="flex-1 grid grid-cols-52 gap-0.5">
                {Array.from({ length: 52 }, (_, i) => (
                  <div
                    key={i}
                    className="w-2 h-2 text-[8px] text-gray-600 flex items-center justify-center"
                  >
                    {i % 13 === 0 ? `Q${Math.floor(i / 13) + 1}` : ''}
                  </div>
                ))}
              </div>
            </div>

            {visibleYears.map((yearData) => (
              <div
                key={yearData.year}
                className="flex items-start gap-2"
              >
                {/* Age label */}
                <div className="w-12 flex-shrink-0 text-xs text-gray-500 font-medium py-0.5">
                  {yearData.age}
                </div>

                {/* Weeks row */}
                <div className="flex-1 grid grid-cols-52 gap-0.5">
                  {yearData.weeks.map((week) => {
                    const isCurrent = week.weekNumber === currentWeekNumber;
                    const dotStyle: React.CSSProperties = week.mood
                      ? { backgroundColor: MOOD_CONFIG[week.mood].color }
                      : week.isLived
                        ? { backgroundColor: LIFE_PHASES[week.lifePhase].color }
                        : {};

                    return (
                      <div
                        key={week.weekNumber}
                        ref={isCurrent ? currentWeekRef : undefined}
                        onClick={() => handleWeekClick(week)}
                        className={`
                          w-2.5 h-2.5 rounded-sm cursor-pointer
                          transition-all duration-200
                          hover:scale-150 hover:z-10 hover:ring-2 hover:ring-white/50
                          ${!week.isLived ? 'bg-gray-800/30' : ''}
                          ${isCurrent ? 'ring-2 ring-white animate-pulse' : ''}
                          ${week.journal ? 'ring-1 ring-white/30' : ''}
                        `}
                        style={dotStyle}
                        title={`${formatWeek(week)}\n${week.journal || 'No entry'}`}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Stats summary */}
        <div className="mt-4 pt-4 border-t border-gray-800 flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="text-gray-400">
              <span className="text-white font-semibold">{currentWeekNumber}</span> weeks lived
            </span>
            <span className="text-gray-400">
              <span className="text-white font-semibold">{weeks.length - currentWeekNumber}</span> weeks remaining
            </span>
          </div>
          <span className="text-gray-400">
            Click any week to add a journal entry
          </span>
        </div>
      </CardContent>

      {/* Week Detail Modal */}
      <Dialog open={!!selectedWeek} onOpenChange={() => setSelectedWeek(null)}>
        <DialogContent className="bg-gray-900 border-gray-800 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedWeek && (
                <>
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: LIFE_PHASES[selectedWeek.lifePhase].color }}
                  />
                  Week {selectedWeek.weekOfYear}, Age {selectedWeek.age}
                </>
              )}
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              {selectedWeek && (
                <>
                  {formatDate(selectedWeek.startDate)} - {formatDate(selectedWeek.endDate)}
                  <Badge variant="outline" className="ml-2 border-gray-700 text-gray-300">
                    {LIFE_PHASES[selectedWeek.lifePhase].name}
                  </Badge>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Mood Selection */}
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block flex items-center gap-2">
                <Heart className="w-4 h-4 text-pink-400" />
                How was this week?
              </label>
              <div className="flex gap-2">
                {(Object.entries(MOOD_CONFIG) as [Mood, typeof MOOD_CONFIG[Mood]][]).map(([mood, config]) => (
                  <button
                    key={mood}
                    onClick={() => setSelectedMood(mood)}
                    className={`
                      px-3 py-2 rounded-lg text-lg transition-all
                      ${selectedMood === mood 
                        ? 'bg-white/20 ring-2 ring-white/50' 
                        : 'bg-gray-800 hover:bg-gray-700'
                      }
                    `}
                  >
                    {config.emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Journal Entry */}
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                Journal Entry
              </label>
              <Textarea
                value={journalText}
                onChange={(e) => setJournalText(e.target.value)}
                placeholder="What happened this week? What did you learn? How did you feel?"
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 min-h-[100px]"
              />
            </div>

            {/* Goals */}
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block flex items-center gap-2">
                <Target className="w-4 h-4 text-green-400" />
                Goals for this week (one per line)
              </label>
              <Textarea
                value={goalText}
                onChange={(e) => setGoalText(e.target.value)}
                placeholder="Learn something new&#10;Exercise 3 times&#10;Call a friend"
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 min-h-[60px]"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-2">
              <Button
                onClick={handleSaveWeek}
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                Save Entry
              </Button>
              <Button
                variant="ghost"
                onClick={() => setSelectedWeek(null)}
                className="text-gray-400"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
