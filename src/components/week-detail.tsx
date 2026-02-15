'use client';

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WeekEntry, Mood, moodColors } from '@/lib/types';
import { formatDate, getAgeAtWeek } from '@/lib/life-calculations';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  X,
  Plus,
  Save,
  Calendar,
  Heart,
  Tag,
  Sparkles,
  Clock
} from 'lucide-react';

interface WeekDetailProps {
  week: WeekEntry | null;
  birthdate: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (weekNumber: number, journal: string, mood?: Mood, tags?: string[]) => void;
}

const moodOptions: { value: Mood; label: string; emoji: string }[] = [
  { value: 'great', label: 'Great', emoji: '😊' },
  { value: 'good', label: 'Good', emoji: '🙂' },
  { value: 'neutral', label: 'Neutral', emoji: '😐' },
  { value: 'bad', label: 'Bad', emoji: '😔' },
  { value: 'terrible', label: 'Terrible', emoji: '😢' },
];

const suggestedTags = [
  'work', 'family', 'health', 'travel', 'learning',
  'friends', 'achievement', 'challenge', 'celebration', 'reflection',
  'love', 'fitness', 'creative', 'rest', 'adventure'
];

function WeekDetailContent({
  week,
  birthdate,
  onClose,
  onSave
}: {
  week: WeekEntry;
  birthdate: string;
  onClose: () => void;
  onSave: (weekNumber: number, journal: string, mood?: Mood, tags?: string[]) => void;
}) {
  const [journal, setJournal] = useState(week.journal || '');
  const [mood, setMood] = useState<Mood | undefined>(week.mood);
  const [tags, setTags] = useState<string[]>(week.tags || []);
  const [newTag, setNewTag] = useState('');

  const handleSave = useCallback(() => {
    onSave(week.weekNumber, journal, mood, tags.length > 0 ? tags : undefined);
    onClose();
  }, [week, journal, mood, tags, onSave, onClose]);

  const addTag = useCallback((tag: string) => {
    const normalizedTag = tag.toLowerCase().trim();
    if (normalizedTag && !tags.includes(normalizedTag)) {
      setTags(prev => [...prev, normalizedTag]);
    }
    setNewTag('');
  }, [tags]);

  const removeTag = useCallback((tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
  }, []);

  const age = getAgeAtWeek(new Date(birthdate), week.weekNumber);

  return (
    <DialogContent className="max-w-2xl bg-slate-900/95 border-slate-700 text-white backdrop-blur-xl">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-xl">
          <Calendar className="w-5 h-5 text-cyan-400" />
          Week {week.weekNumber}
        </DialogTitle>
        <DialogDescription className="text-slate-400">
          {formatDate(week.startDate)} - {formatDate(week.endDate)}
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6 mt-4">
        {/* Quick stats */}
        <div className="flex gap-4 text-sm text-slate-400">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            Age: {age}
          </div>
          <div className="flex items-center gap-1">
            <Sparkles className="w-4 h-4" />
            Year {Math.ceil(week.weekNumber / 52)}
          </div>
          {week.isCurrent && (
            <Badge variant="outline" className="bg-amber-500/20 text-amber-400 border-amber-500/50">
              Current Week
            </Badge>
          )}
        </div>

        {/* Mood selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <Heart className="w-4 h-4 text-rose-400" />
            How was this week?
          </label>
          <div className="flex gap-2 flex-wrap">
            {moodOptions.map((option) => (
              <motion.button
                key={option.value}
                onClick={() => setMood(mood === option.value ? undefined : option.value)}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium transition-all',
                  'flex items-center gap-2',
                  mood === option.value
                    ? `${moodColors[option.value].bg} text-white`
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                )}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span>{option.emoji}</span>
                <span>{option.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Journal entry */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300">
            Journal Entry
          </label>
          <Textarea
            value={journal}
            onChange={(e) => setJournal(e.target.value)}
            placeholder="What happened this week? What are you grateful for? Any lessons learned?"
            className="min-h-[150px] bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500 focus:border-cyan-500 focus:ring-cyan-500/20"
          />
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <Tag className="w-4 h-4 text-violet-400" />
            Tags
          </label>

          {/* Selected tags */}
          <div className="flex flex-wrap gap-2 mb-2">
            <AnimatePresence>
              {tags.map((tag) => (
                <motion.div
                  key={tag}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                >
                  <Badge
                    variant="secondary"
                    className="bg-slate-700 text-slate-200 hover:bg-slate-600 cursor-pointer"
                    onClick={() => removeTag(tag)}
                  >
                    {tag}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          {/* Add new tag */}
          <div className="flex gap-2">
            <Input
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  addTag(newTag);
                }
              }}
              placeholder="Add a tag..."
              className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500"
            />
            <Button
              onClick={() => addTag(newTag)}
              variant="outline"
              size="icon"
              className="bg-slate-800 border-slate-600 hover:bg-slate-700"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Suggested tags */}
          <div className="flex flex-wrap gap-1 mt-2">
            {suggestedTags
              .filter(t => !tags.includes(t))
              .slice(0, 8)
              .map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="text-xs cursor-pointer hover:bg-slate-700 border-slate-600 text-slate-400"
                  onClick={() => addTag(tag)}
                >
                  + {tag}
                </Badge>
              ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
          <Button
            onClick={onClose}
            variant="ghost"
            className="text-slate-400 hover:text-white"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Entry
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}

export default function WeekDetail({
  week,
  birthdate,
  isOpen,
  onClose,
  onSave
}: WeekDetailProps) {
  // Use key to reset component state when week changes
  const dialogKey = useMemo(() => week?.weekNumber ?? 'none', [week?.weekNumber]);

  if (!week) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <WeekDetailContent
        key={dialogKey}
        week={week}
        birthdate={birthdate}
        onClose={onClose}
        onSave={onSave}
      />
    </Dialog>
  );
}
