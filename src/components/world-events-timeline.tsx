'use client';

// Life in Dots 2.0 - World Events Timeline Component

import { useMemo, useState, useEffect } from 'react';
import { WorldEvent, WeekEntry, Milestone, MilestoneCategory } from '@/lib/types';
import { WORLD_EVENTS, getWorldEventsDuringLife, formatDate, getWeekNumberInLife, getAgeAtDate } from '@/lib/life-calculations';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { createClient } from '@/lib/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Globe,
  Rocket,
  Building2,
  FlaskConical,
  Palette,
  AlertTriangle,
  Trophy,
  Sparkles,
  Pencil,
  Trash2
} from 'lucide-react';

interface WorldEventsTimelineProps {
  birthdate: Date;
  currentWeekNumber: number;
}

const categoryIcons = {
  technology: Rocket,
  politics: Building2,
  science: FlaskConical,
  culture: Palette,
  disaster: AlertTriangle,
  sports: Trophy,
};

const categoryColors = {
  technology: 'text-blue-400 bg-blue-500/20',
  politics: 'text-purple-400 bg-purple-500/20',
  science: 'text-green-400 bg-green-500/20',
  culture: 'text-pink-400 bg-pink-500/20',
  disaster: 'text-red-400 bg-red-500/20',
  sports: 'text-orange-400 bg-orange-500/20',
};

export function WorldEventsTimeline({ birthdate, currentWeekNumber }: WorldEventsTimelineProps) {
  const [personalMilestones, setPersonalMilestones] = useState<Milestone[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);

  // Form state
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState<MilestoneCategory>('personal');
  const [description, setDescription] = useState('');
  const supabase = createClient();

  // Fetch milestones on mount
  useEffect(() => {
    async function fetchMilestones() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('milestones')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: true });

        if (error) throw error;
        setPersonalMilestones(data || []);
      } catch (error) {
        console.error('Error fetching milestones:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchMilestones();
  }, [supabase]);

  // Reset form
  const resetForm = () => {
    setTitle('');
    setDate('');
    setCategory('personal');
    setDescription('');
    setEditingMilestone(null);
  };

  // Open edit dialog
  const handleEdit = (milestone: Milestone) => {
    setEditingMilestone(milestone);
    setTitle(milestone.title);
    setDate(milestone.date);
    setCategory(milestone.category);
    setDescription(milestone.description || '');
    setIsDialogOpen(true);
  };

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this milestone?')) return;

    try {
      const { error } = await supabase
        .from('milestones')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setPersonalMilestones(prev => prev.filter(m => m.id !== id));
    } catch (error) {
      console.error('Error deleting milestone:', error);
      alert('Failed to delete milestone');
    }
  };

  // Handle submit
  const handleSubmit = async () => {
    if (!title || !date) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      if (editingMilestone) {
        // Update
        const { error } = await supabase
          .from('milestones')
          .update({
            title,
            date,
            category,
            description,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingMilestone.id);

        if (error) throw error;

        setPersonalMilestones(prev => prev.map(m =>
          m.id === editingMilestone.id
            ? { ...m, title, date, category, description }
            : m
        ));
      } else {
        // Create
        const { data, error } = await supabase
          .from('milestones')
          .insert({
            user_id: user.id,
            title,
            date,
            category,
            description,
          })
          .select()
          .single();

        if (error) throw error;
        setPersonalMilestones(prev => [...prev, data]);
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error('Error saving milestone:', error);
      alert('Failed to save milestone');
    }
  };

  // Merge events and milestones
  const allEvents = useMemo(() => {
    // 1. World Events
    const worldEvents = getWorldEventsDuringLife(birthdate).map(event => ({
      ...event,
      type: 'world' as const,
      weekNumber: getWeekNumberInLife(birthdate, new Date(event.date)),
      age: getAgeAtDate(birthdate, new Date(event.date)),
      wasLived: new Date(event.date) <= new Date()
    }));

    // 2. Personal Milestones
    const personalEvents = personalMilestones.map(milestone => ({
      ...milestone,
      type: 'personal' as const,
      weekNumber: getWeekNumberInLife(birthdate, new Date(milestone.date)),
      age: getAgeAtDate(birthdate, new Date(milestone.date)),
      wasLived: new Date(milestone.date) <= new Date()
    }));

    // 3. Merge, Deduplicate, and Sort
    const merged = [...worldEvents, ...personalEvents];
    const uniqueEvents = Array.from(
      new Map(
        merged.map(item => [`${item.date}-${item.title}`, item])
      ).values()
    );

    return uniqueEvents.sort((a, b) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [birthdate, personalMilestones]);

  return (
    <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-400" />
            World Events & Milestones
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            className="h-8 gap-1 bg-violet-500/10 text-violet-300 border-violet-500/20 hover:bg-violet-500/20 hover:text-violet-200"
            onClick={() => setIsDialogOpen(true)}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Add Milestone
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full py-12 gap-3">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm text-gray-400">Loading milestones...</p>
          </div>
        ) : allEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12 text-gray-400">
            <div className="w-12 h-12 rounded-full bg-gray-800 flex items-center justify-center mb-3">
              <Sparkles className="w-6 h-6 text-gray-600" />
            </div>
            <p className="font-medium text-gray-300">No world events or milestones yet</p>
            <p className="text-xs mt-1 max-w-[200px]">Click 'Add Milestone' to create your first personal milestone</p>
          </div>
        ) : (
          <ScrollArea className="h-[400px] pr-4">
            <div className="relative pl-2 py-2">
              {/* Timeline line */}
              <div className="absolute left-[27px] top-2 bottom-2 w-0.5 bg-gray-800" />

              <div className="space-y-6">
                {allEvents.map((event, index) => {
                  const isWorld = event.type === 'world';
                  // @ts-ignore - Category handling differs
                  const Icon = isWorld ? categoryIcons[event.category] : Sparkles;
                  const colorClass = isWorld
                    // @ts-ignore
                    ? categoryColors[event.category]
                    : 'text-violet-400 bg-violet-500/20';

                  return (
                    <div
                      // @ts-ignore
                      key={`${event.type}-${event.id}`}
                      className={`relative flex items-start gap-4 ${!event.wasLived && isWorld ? 'opacity-50' : ''}`}
                    >
                      {/* Icon Bubble */}
                      <div className={`relative z-10 w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border-4 border-gray-900 ${isWorld ? 'bg-gray-800' : 'bg-gray-800' // Keeping consistent background, icon provides color
                        }`}>
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colorClass}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                      </div>

                      {/* Content Card */}
                      <div className="flex-grow min-w-0 pt-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-white truncate">
                            {event.title}
                          </span>
                          {isWorld ? (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-blue-500/30 text-blue-400 bg-blue-500/10 shrink-0">
                              WORLD
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 border-violet-500/30 text-violet-400 bg-violet-500/10 shrink-0">
                              {event.category.toUpperCase()}
                            </Badge>
                          )}

                          {/* Actions for Personal */}
                          {!isWorld && (
                            <div className="flex gap-1 ml-auto shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                // @ts-ignore
                                onClick={() => handleEdit(event)}
                                className="p-1 hover:text-blue-400 text-gray-500 hover:bg-gray-800/50 rounded"
                                aria-label="Edit milestone"
                                title="Edit milestone"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                // @ts-ignore
                                onClick={() => handleDelete(event.id)}
                                className="p-1 hover:text-red-400 text-gray-500 hover:bg-gray-800/50 rounded"
                                aria-label="Delete milestone"
                                title="Delete milestone"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>

                        <div className="text-xs text-gray-400 mb-1.5 flex items-center gap-2">
                          <span>{formatDate(event.date)}</span>
                          <span className="w-1 h-1 rounded-full bg-gray-600" />
                          <span className="text-gray-500">Age {event.age}</span>
                        </div>

                        {event.description && (
                          <p className="text-sm text-gray-300 leading-relaxed pr-2">
                            {event.description}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </ScrollArea>
        )}
      </CardContent>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="bg-slate-900/95 border-slate-700 text-white sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingMilestone ? 'Edit Milestone' : 'Add Personal Milestone'}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Record a significant moment in your journey.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What happened?"
                className="bg-slate-800/50 border-slate-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300">Date</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-slate-800/50 border-slate-600 text-white"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300">Category</label>
              <Select value={category} onValueChange={(v) => setCategory(v as MilestoneCategory)}>
                <SelectTrigger className="bg-slate-800/50 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600">
                  <SelectItem value="personal" className="text-white focus:bg-slate-700">Personal</SelectItem>
                  <SelectItem value="career" className="text-white focus:bg-slate-700">Career</SelectItem>
                  <SelectItem value="education" className="text-white focus:bg-slate-700">Education</SelectItem>
                  <SelectItem value="relationship" className="text-white focus:bg-slate-700">Relationship</SelectItem>
                  <SelectItem value="health" className="text-white focus:bg-slate-700">Health</SelectItem>
                  <SelectItem value="travel" className="text-white focus:bg-slate-700">Travel</SelectItem>
                  <SelectItem value="family" className="text-white focus:bg-slate-700">Family</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-slate-300">Description (optional)</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add more details..."
                className="bg-slate-800/50 border-slate-600 text-white min-h-[80px]"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="ghost"
                onClick={() => {
                  setIsDialogOpen(false);
                  resetForm();
                }}
                className="text-slate-400"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!title || !date}
                className="bg-gradient-to-r from-violet-500 to-fuchsia-500 hover:from-violet-600 hover:to-fuchsia-600"
              >
                {editingMilestone ? 'Update' : 'Add'} Milestone
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
