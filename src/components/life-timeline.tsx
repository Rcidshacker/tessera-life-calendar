'use client';

import { motion } from 'framer-motion';
import { WorldEvent } from '@/lib/types';
import { getWorldEventsDuringLife, getWeekForWorldEvent, formatDate } from '@/lib/life-calculations';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Globe,
  Rocket,
  Building2,
  Cpu,
  Palette,
  Atom,
  Trophy,
  AlertTriangle,
  Calendar
} from 'lucide-react';

interface LifeTimelineProps {
  birthdate: string;
  onEventClick?: (weekNumber: number) => void;
}

const categoryIcons = {
  politics: Building2,
  technology: Cpu,
  culture: Palette,
  science: Atom,
  sports: Trophy,
  disaster: AlertTriangle,
};

const categoryColors = {
  politics: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  technology: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
  culture: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  science: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  sports: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  disaster: 'bg-red-500/20 text-red-400 border-red-500/30',
};

export default function LifeTimeline({ birthdate, onEventClick }: LifeTimelineProps) {
  const events = getWorldEventsDuringLife(new Date(birthdate));

  if (events.length === 0) {
    return (
      <Card className="bg-slate-800/60 border-slate-700/50 backdrop-blur-sm">
        <CardContent className="pt-6 text-center">
          <Globe className="w-12 h-12 mx-auto mb-3 text-slate-500" />
          <p className="text-sm text-slate-400">
            World events will appear here as you age
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-slate-800/60 border-slate-700/50 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-base text-white flex items-center gap-2">
          <Globe className="w-4 h-4 text-cyan-400" />
          World Events During Your Life
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px] pr-2">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[11px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-500/50 via-violet-500/50 to-pink-500/50" />

            <div className="space-y-3">
              {events.map((event, index) => {
                const Icon = categoryIcons[event.category];
                const weekNumber = getWeekForWorldEvent(birthdate, event.date);
                const ageAtEvent = Math.floor((weekNumber - 1) / 52);

                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative pl-8 cursor-pointer group"
                    onClick={() => onEventClick?.(weekNumber)}
                  >
                    {/* Event dot */}
                    <div className={cn(
                      'absolute left-0 top-1 p-1.5 rounded-full border-2',
                      categoryColors[event.category]
                    )}>
                      <Icon className="w-3 h-3" />
                    </div>

                    {/* Event card */}
                    <div className={cn(
                      'p-3 rounded-lg bg-slate-700/30 border border-slate-600/30',
                      'group-hover:bg-slate-700/50 group-hover:border-slate-500/50',
                      'transition-all duration-200'
                    )}>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-sm font-medium text-white">
                          {event.title}
                        </h4>
                        <Badge
                          variant="outline"
                          className="text-[10px] bg-slate-800/50 border-slate-600/50 text-slate-400"
                        >
                          Age {ageAtEvent}
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {event.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-500">
                        <Calendar className="w-3 h-3" />
                        {formatDate(event.date)}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
