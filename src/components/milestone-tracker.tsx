'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Milestone, MilestoneCategory } from '@/lib/types';
import { generateId } from '@/lib/life-calculations';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Trophy, 
  Plus, 
  Check, 
  X, 
  Calendar,
  Briefcase,
  GraduationCap,
  Heart,
  Activity,
  Plane,
  Users,
  Pencil,
  Trash2
} from 'lucide-react';

interface MilestoneTrackerProps {
  milestones: Milestone[];
  onAdd: (milestone: Omit<Milestone, 'id' | 'weekNumber'>) => void;
  onUpdate: (id: string, updates: Partial<Milestone>) => void;
  onDelete: (id: string) => void;
}

const categoryIcons: Record<MilestoneCategory, React.ElementType> = {
  personal: Trophy,
  career: Briefcase,
  education: GraduationCap,
  relationship: Heart,
  health: Activity,
  travel: Plane,
  family: Users,
};

const categoryColors: Record<MilestoneCategory, string> = {
  personal: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  career: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  education: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  relationship: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
  health: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  travel: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  family: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
};

const categories: { value: MilestoneCategory; label: string }[] = [
  { value: 'personal', label: 'Personal' },
  { value: 'career', label: 'Career' },
  { value: 'education', label: 'Education' },
  { value: 'relationship', label: 'Relationship' },
  { value: 'health', label: 'Health' },
  { value: 'travel', label: 'Travel' },
  { value: 'family', label: 'Family' },
];

export default function MilestoneTracker({ 
  milestones, 
  onAdd, 
  onUpdate, 
  onDelete 
}: MilestoneTrackerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null);
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [category, setCategory] = useState<MilestoneCategory>('personal');
  const [description, setDescription] = useState('');

  const resetForm = useCallback(() => {
    setTitle('');
    setDate('');
    setCategory('personal');
    setDescription('');
    setEditingMilestone(null);
  }, []);

  const handleSubmit = useCallback(() => {
    if (!title || !date) return;

    if (editingMilestone) {
      onUpdate(editingMilestone.id, {
        title,
        date,
        category,
        description,
      });
    } else {
      onAdd({
        title,
        date,
        category,
        description,
        isCompleted: true,
      });
    }

    resetForm();
    setIsDialogOpen(false);
  }, [title, date, category, description, editingMilestone, onUpdate, onAdd, resetForm]);

  const openEditDialog = useCallback((milestone: Milestone) => {
    setEditingMilestone(milestone);
    setTitle(milestone.title);
    setDate(milestone.date);
    setCategory(milestone.category);
    setDescription(milestone.description || '');
    setIsDialogOpen(true);
  }, []);

  const completedMilestones = milestones.filter(m => m.isCompleted);
  const upcomingMilestones = milestones.filter(m => !m.isCompleted);

  return (
    <div className="space-y-4 p-4">
      {/* Add Milestone Button */}
      <Button
        onClick={() => setIsDialogOpen(true)}
        className="w-full bg-gradient-to-r from-cyan-500 to-violet-500 hover:from-cyan-600 hover:to-violet-600"
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Milestone
      </Button>

      {/* Milestones List */}
      <Card className="bg-slate-800/60 border-slate-700/50 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-white flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            Milestones ({completedMilestones.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {milestones.length === 0 ? (
            <div className="text-center py-6 text-slate-400">
              <Trophy className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No milestones yet</p>
              <p className="text-xs mt-1">Add your life achievements!</p>
            </div>
          ) : (
            <ScrollArea className="h-[300px] pr-2">
              <div className="space-y-2">
                <AnimatePresence>
                  {milestones.map((milestone) => {
                    const Icon = categoryIcons[milestone.category];
                    return (
                      <motion.div
                        key={milestone.id}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={cn(
                          'p-3 rounded-lg border bg-slate-700/30',
                          'flex items-start gap-3',
                          milestone.isCompleted 
                            ? 'border-slate-600/30' 
                            : 'border-dashed border-slate-500/30'
                        )}
                      >
                        {/* Category Icon */}
                        <div className={cn(
                          'p-2 rounded-lg border shrink-0',
                          categoryColors[milestone.category]
                        )}>
                          <Icon className="w-4 h-4" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className={cn(
                              'text-sm font-medium',
                              milestone.isCompleted ? 'text-white' : 'text-slate-300'
                            )}>
                              {milestone.title}
                            </h4>
                            {milestone.isCompleted && (
                              <Check className="w-4 h-4 text-emerald-400" />
                            )}
                          </div>
                          {milestone.description && (
                            <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                              {milestone.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge 
                              variant="outline" 
                              className="text-[10px] bg-slate-800/50 border-slate-600/50 text-slate-400"
                            >
                              {new Date(milestone.date).toLocaleDateString()}
                            </Badge>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-1 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-slate-400 hover:text-white"
                            onClick={() => openEditDialog(milestone)}
                          >
                            <Pencil className="w-3 h-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-slate-400 hover:text-rose-400"
                            onClick={() => onDelete(milestone.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) resetForm();
      }}>
        <DialogContent className="bg-slate-900/95 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>
              {editingMilestone ? 'Edit Milestone' : 'Add Milestone'}
            </DialogTitle>
            <DialogDescription className="text-slate-400">
              Record a significant life event
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm text-slate-300">Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What did you achieve?"
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
                  {categories.map((cat) => {
                    const Icon = categoryIcons[cat.value];
                    return (
                      <SelectItem 
                        key={cat.value} 
                        value={cat.value}
                        className="text-white focus:bg-slate-700"
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4" />
                          {cat.label}
                        </div>
                      </SelectItem>
                    );
                  })}
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
                className="bg-gradient-to-r from-cyan-500 to-violet-500"
              >
                {editingMilestone ? 'Update' : 'Add'} Milestone
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
