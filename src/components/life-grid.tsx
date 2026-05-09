'use client'

import { useState, useMemo, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { WeekEntry, LIFE_PHASES, MOOD_CONFIG, Mood } from '@/lib/types'
import { formatWeek, formatDate } from '@/lib/life-calculations'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { ZoomIn, ZoomOut, Calendar, Heart, Sparkles, Target } from 'lucide-react'

interface LifeGridProps {
  weeks: WeekEntry[]
  currentWeekNumber: number
  onUpdateWeek: (weekNumber: number, data: { journal?: string; mood?: Mood; tags?: string[]; goals?: string[] }) => void
}

interface TooltipState {
  week: WeekEntry
  x: number
  y: number
}

export function LifeGrid({ weeks, currentWeekNumber, onUpdateWeek }: LifeGridProps) {
  const [selectedWeek, setSelectedWeek] = useState<WeekEntry | null>(null)
  const [zoom, setZoom] = useState(1)
  const [tooltip, setTooltip] = useState<TooltipState | null>(null)
  const currentWeekRef = useRef<HTMLDivElement>(null)

  const [journalText, setJournalText] = useState('')
  const [selectedMood, setSelectedMood] = useState<Mood | undefined>()
  const [goalText, setGoalText] = useState('')

  const handleWeekClick = useCallback((week: WeekEntry) => {
    setTooltip(null)
    setSelectedWeek(week)
    setJournalText(week.journal || '')
    setSelectedMood(week.mood)
    setGoalText(week.goals?.join('\n') || '')
  }, [])

  const handleSaveWeek = useCallback(() => {
    if (!selectedWeek) return
    onUpdateWeek(selectedWeek.weekNumber, {
      journal: journalText,
      mood: selectedMood,
      goals: goalText.split('\n').filter(g => g.trim()),
    })
    setSelectedWeek(null)
  }, [selectedWeek, journalText, selectedMood, goalText, onUpdateWeek])

  const yearsData = useMemo(() => {
    const years: { year: number; weeks: WeekEntry[]; age: number }[] = []
    const totalYears = Math.ceil(weeks.length / 52)
    for (let year = 0; year < totalYears; year++) {
      years.push({ year, weeks: weeks.slice(year * 52, (year + 1) * 52), age: year })
    }
    return years
  }, [weeks])

  const visibleYears = useMemo(() => {
    return yearsData.slice(0, Math.ceil(yearsData.length / zoom) + 20)
  }, [yearsData, zoom])

  return (
    <>
      <Card
        className="border h-full flex flex-col"
        style={{
          background: 'oklch(1 0 0 / 0.03)',
          borderColor: 'oklch(1 0 0 / 0.08)',
          backdropFilter: 'blur(16px)',
        }}
      >
        <CardHeader className="pb-2 flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center gap-2 text-base font-medium">
              <Calendar className="w-4 h-4" style={{ color: 'oklch(0.62 0.24 280)' }} />
              Your Life Journey
            </CardTitle>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setZoom(z => Math.min(2, z + 0.25))}
                className="p-1.5 rounded-lg transition-colors hover:bg-white/5 text-[oklch(0.5_0_0)] hover:text-white"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoom(z => Math.max(0.5, z - 0.25))}
                className="p-1.5 rounded-lg transition-colors hover:bg-white/5 text-[oklch(0.5_0_0)] hover:text-white"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 overflow-hidden p-4 pt-0 flex flex-col gap-3">
          {/* Compact legend */}
          <div className="flex flex-wrap gap-x-3 gap-y-1">
            {Object.entries(LIFE_PHASES).map(([key, phase]) => (
              <div key={key} className="flex items-center gap-1 text-[10px]">
                <div className="w-2 h-2 rounded-[2px]" style={{ backgroundColor: phase.color }} />
                <span style={{ color: 'oklch(0.5 0 0)' }}>{phase.name}</span>
              </div>
            ))}
          </div>

          {/* Life Grid */}
          <ScrollArea className="flex-1 scrollbar-thin">
            <div
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'top left',
                width: `${100 / zoom}%`,
              }}
            >
              {/* Column header row */}
              <div className="flex items-start gap-1.5 mb-0.5">
                <div className="w-8 flex-shrink-0" />
                <div className="flex-1 grid grid-cols-52 gap-[3px]">
                  {Array.from({ length: 52 }, (_, i) => (
                    <div key={i} className="flex items-center justify-center" style={{ height: 10 }}>
                      {i % 13 === 0 && (
                        <span className="text-[7px] leading-none" style={{ color: 'oklch(0.38 0 0)' }}>
                          Q{Math.floor(i / 13) + 1}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Year rows */}
              <div className="space-y-[3px]">
                {visibleYears.map((yearData) => (
                  <div key={yearData.year} className="flex items-center gap-1.5">
                    <div
                      className="w-8 flex-shrink-0 text-right text-[9px] leading-none"
                      style={{ color: 'oklch(0.36 0 0)' }}
                    >
                      {yearData.age % 5 === 0 ? yearData.age : ''}
                    </div>

                    <div className="flex-1 grid grid-cols-52 gap-[3px]">
                      {yearData.weeks.map((week, weekIdx) => {
                        const isCurrent = week.weekNumber === currentWeekNumber
                        const isFuture = !week.isLived
                        const diagonalDelay = (yearData.year + weekIdx) * 3

                        const dotColor = week.mood
                          ? MOOD_CONFIG[week.mood].color
                          : week.isLived
                            ? LIFE_PHASES[week.lifePhase].color
                            : undefined

                        return (
                          <div
                            key={week.weekNumber}
                            ref={isCurrent ? currentWeekRef : undefined}
                            onClick={() => handleWeekClick(week)}
                            onMouseEnter={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect()
                              setTooltip({
                                week,
                                x: rect.left + rect.width / 2,
                                y: rect.top,
                              })
                            }}
                            onMouseLeave={() => setTooltip(null)}
                            className={cn(
                              'cell-appear w-full aspect-square rounded-[2px] cursor-pointer transition-transform duration-100',
                              'hover:scale-[1.6] hover:z-10 hover:brightness-125',
                              isCurrent && 'current-week-pulse ring-1',
                              week.journal && !isCurrent && 'ring-1 ring-white/20',
                            )}
                            style={{
                              backgroundColor: dotColor ?? 'oklch(1 0 0 / 0.07)',
                              opacity: isFuture ? 0.25 : 1,
                              animationDelay: `${diagonalDelay}ms`,
                              ringColor: isCurrent ? 'oklch(0.62 0.24 280)' : undefined,
                              position: 'relative',
                            }}
                            title={undefined}
                          />
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ScrollArea>

          {/* Bottom stats */}
          <div
            className="flex items-center justify-between text-[11px] pt-2 flex-shrink-0"
            style={{ borderTop: '1px solid oklch(1 0 0 / 0.07)' }}
          >
            <div className="flex items-center gap-4">
              <span style={{ color: 'oklch(0.5 0 0)' }}>
                <span className="text-white font-semibold">{currentWeekNumber.toLocaleString()}</span> weeks lived
              </span>
              <span style={{ color: 'oklch(0.5 0 0)' }}>
                <span className="text-white font-semibold">{(weeks.length - currentWeekNumber).toLocaleString()}</span> remaining
              </span>
            </div>
            <span style={{ color: 'oklch(0.38 0 0)' }}>Click any week to journal</span>
          </div>
        </CardContent>
      </Card>

      {/* Floating tooltip — rendered outside Card to escape any stacking context */}
      <AnimatePresence>
        {tooltip && (
          <motion.div
            key={tooltip.week.weekNumber}
            initial={{ opacity: 0, scale: 0.9, y: 4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 4 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28, duration: 0.15 }}
            className="pointer-events-none fixed z-[9999] min-w-[160px] max-w-[200px] rounded-xl p-3 shadow-2xl"
            style={{
              left: tooltip.x,
              top: tooltip.y - 8,
              transform: 'translate(-50%, -100%)',
              background: 'oklch(0.13 0.015 270)',
              border: '1px solid oklch(1 0 0 / 0.12)',
              backdropFilter: 'blur(12px)',
            }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <div
                className="w-2.5 h-2.5 rounded-[2px] flex-shrink-0"
                style={{
                  backgroundColor: tooltip.week.mood
                    ? MOOD_CONFIG[tooltip.week.mood].color
                    : tooltip.week.isLived
                      ? LIFE_PHASES[tooltip.week.lifePhase].color
                      : 'oklch(1 0 0 / 0.15)',
                }}
              />
              <span className="text-xs font-medium text-white">
                Age {tooltip.week.age} · Week {tooltip.week.weekOfYear}
              </span>
            </div>
            <div className="text-[10px] leading-relaxed" style={{ color: 'oklch(0.5 0 0)' }}>
              {formatDate(tooltip.week.startDate)}
            </div>
            {tooltip.week.mood && (
              <div className="mt-1.5 flex items-center gap-1.5 text-[10px]">
                <span>{MOOD_CONFIG[tooltip.week.mood].emoji}</span>
                <span style={{ color: 'oklch(0.65 0 0)' }}>{MOOD_CONFIG[tooltip.week.mood].label}</span>
              </div>
            )}
            {tooltip.week.journal && (
              <div
                className="mt-1.5 text-[10px] leading-snug line-clamp-2 italic"
                style={{ color: 'oklch(0.55 0 0)' }}
              >
                "{tooltip.week.journal}"
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Week Detail Dialog */}
      <Dialog open={!!selectedWeek} onOpenChange={() => setSelectedWeek(null)}>
        <DialogContent
          className="max-w-lg border text-white"
          style={{
            background: 'oklch(0.1 0.012 270)',
            borderColor: 'oklch(1 0 0 / 0.1)',
          }}
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base font-medium">
              {selectedWeek && (
                <>
                  <div
                    className="w-3.5 h-3.5 rounded-[3px]"
                    style={{ backgroundColor: LIFE_PHASES[selectedWeek.lifePhase].color }}
                  />
                  Week {selectedWeek.weekOfYear} · Age {selectedWeek.age}
                </>
              )}
            </DialogTitle>
            <DialogDescription style={{ color: 'oklch(0.5 0 0)' }}>
              {selectedWeek && (
                <span className="flex items-center gap-2">
                  {formatDate(selectedWeek.startDate)} — {formatDate(selectedWeek.endDate)}
                  <Badge
                    variant="outline"
                    className="text-[10px]"
                    style={{ borderColor: 'oklch(1 0 0 / 0.12)', color: 'oklch(0.6 0 0)' }}
                  >
                    {LIFE_PHASES[selectedWeek.lifePhase].name}
                  </Badge>
                </span>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 mt-1">
            {/* Mood */}
            <div className="space-y-2">
              <label className="text-xs font-medium flex items-center gap-1.5" style={{ color: 'oklch(0.6 0 0)' }}>
                <Heart className="w-3.5 h-3.5" style={{ color: 'oklch(0.7 0.2 0)' }} />
                How was this week?
              </label>
              <div className="flex gap-2 flex-wrap">
                {(Object.entries(MOOD_CONFIG) as [Mood, typeof MOOD_CONFIG[Mood]][]).map(([mood, config]) => (
                  <button
                    key={mood}
                    onClick={() => setSelectedMood(mood === selectedMood ? undefined : mood)}
                    className={cn(
                      'px-3 py-2 rounded-xl text-lg transition-all duration-150',
                      selectedMood === mood
                        ? 'scale-110 ring-2'
                        : 'opacity-60 hover:opacity-90 hover:scale-105',
                    )}
                    style={{
                      background: selectedMood === mood ? `${config.color}22` : 'oklch(1 0 0 / 0.05)',
                      ringColor: selectedMood === mood ? config.color : undefined,
                      border: `1px solid ${selectedMood === mood ? `${config.color}44` : 'oklch(1 0 0 / 0.08)'}`,
                    }}
                  >
                    {config.emoji}
                  </button>
                ))}
              </div>
            </div>

            {/* Journal */}
            <div className="space-y-2">
              <label className="text-xs font-medium flex items-center gap-1.5" style={{ color: 'oklch(0.6 0 0)' }}>
                <Sparkles className="w-3.5 h-3.5" style={{ color: 'oklch(0.78 0.16 75)' }} />
                Journal Entry
              </label>
              <Textarea
                value={journalText}
                onChange={(e) => setJournalText(e.target.value)}
                placeholder="What happened this week? What did you learn?"
                className="min-h-[100px] rounded-xl border text-white placeholder:text-[oklch(0.35_0_0)] resize-none text-sm leading-relaxed"
                style={{ background: 'oklch(1 0 0 / 0.04)', borderColor: 'oklch(1 0 0 / 0.1)' }}
              />
            </div>

            {/* Goals */}
            <div className="space-y-2">
              <label className="text-xs font-medium flex items-center gap-1.5" style={{ color: 'oklch(0.6 0 0)' }}>
                <Target className="w-3.5 h-3.5 text-emerald-400" />
                Goals (one per line)
              </label>
              <Textarea
                value={goalText}
                onChange={(e) => setGoalText(e.target.value)}
                placeholder="Exercise 3x&#10;Read 30 min daily&#10;Call a friend"
                className="min-h-[60px] rounded-xl border text-white placeholder:text-[oklch(0.35_0_0)] resize-none text-sm"
                style={{ background: 'oklch(1 0 0 / 0.04)', borderColor: 'oklch(1 0 0 / 0.1)' }}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <Button
                onClick={handleSaveWeek}
                className="flex-1 h-10 rounded-xl text-sm font-medium"
                style={{ background: 'oklch(0.62 0.24 280)', color: 'white', border: 'none' }}
              >
                Save Entry
              </Button>
              <Button
                variant="ghost"
                onClick={() => setSelectedWeek(null)}
                className="h-10 rounded-xl px-4 text-sm"
                style={{ color: 'oklch(0.5 0 0)' }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
