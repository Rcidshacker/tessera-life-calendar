'use client'

import { useMemo, useEffect, useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { LifeStats, LIFE_PHASES, MOOD_CONFIG, LifePhase, Mood } from '@/lib/types'
import { TrendingUp, Calendar, Heart, Flame, Clock, Sparkles, Award } from 'lucide-react'

interface LifeStatsProps {
  stats: LifeStats | null
  currentPhase: LifePhase
}

function useCountUp(target: number, duration = 1200) {
  const [count, setCount] = useState(0)
  const prevTarget = useRef<number>(0)

  useEffect(() => {
    if (target === prevTarget.current) return
    prevTarget.current = target
    const start = performance.now()
    const from = 0

    const tick = (now: number) => {
      const elapsed = now - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.round(from + (target - from) * eased))
      if (progress < 1) requestAnimationFrame(tick)
    }

    requestAnimationFrame(tick)
  }, [target, duration])

  return count
}

function CircularRing({
  value,
  size = 100,
  stroke = 7,
  color = 'oklch(0.62 0.24 280)',
}: {
  value: number
  size?: number
  stroke?: number
  color?: string
}) {
  const radius = (size - stroke) / 2
  const circ = radius * 2 * Math.PI
  const offset = circ - (Math.min(value, 100) / 100) * circ

  return (
    <svg width={size} height={size} className="-rotate-90" style={{ flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke}
        className="fill-none" style={{ stroke: 'oklch(1 0 0 / 0.07)' }} />
      <motion.circle
        cx={size / 2} cy={size / 2} r={radius} strokeWidth={stroke}
        strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
        strokeLinecap="round"
        className="fill-none"
        style={{ stroke: color }}
      />
    </svg>
  )
}

function StatCard({
  icon: Icon,
  iconColor,
  value,
  suffix,
  label,
  delay = 0,
}: {
  icon: React.ElementType
  iconColor: string
  value: string | number
  suffix?: string
  label: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-xl p-3 flex items-center gap-3"
      style={{ background: 'oklch(1 0 0 / 0.04)', border: '1px solid oklch(1 0 0 / 0.07)' }}
    >
      <div
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ background: `${iconColor}18` }}
      >
        <Icon className="w-4 h-4" style={{ color: iconColor }} />
      </div>
      <div className="min-w-0">
        <div className="text-lg font-semibold text-white leading-none">
          {value}{suffix && <span className="text-sm font-normal ml-0.5" style={{ color: 'oklch(0.5 0 0)' }}>{suffix}</span>}
        </div>
        <div className="text-[10px] mt-0.5" style={{ color: 'oklch(0.45 0 0)' }}>{label}</div>
      </div>
    </motion.div>
  )
}

export function LifeStatsCard({ stats, currentPhase }: LifeStatsProps) {
  const phaseInfo = LIFE_PHASES[currentPhase]
  const weeksLived = useCountUp(stats?.totalWeeksLived ?? 0)
  const journalEntries = useCountUp(stats?.totalJournalEntries ?? 0)

  if (!stats) {
    return (
      <div className="rounded-xl p-6 text-center text-sm" style={{ color: 'oklch(0.5 0 0)' }}>
        Enter your birthdate to see life statistics
      </div>
    )
  }

  const currentAge = Math.floor(stats.totalWeeksLived / 52)

  return (
    <div className="space-y-3">
      {/* Hero: Life Progress */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-2xl p-4"
        style={{
          background: 'linear-gradient(135deg, oklch(0.62 0.24 280 / 0.15), oklch(0.78 0.16 75 / 0.08))',
          border: '1px solid oklch(0.62 0.24 280 / 0.2)',
        }}
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <CircularRing value={stats.percentageLived} size={88} stroke={6} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-base font-semibold text-white leading-none">
                {stats.percentageLived.toFixed(1)}
              </span>
              <span className="text-[9px]" style={{ color: 'oklch(0.5 0 0)' }}>%</span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Award className="w-3.5 h-3.5" style={{ color: 'oklch(0.78 0.16 75)' }} />
              <span className="text-xs font-medium" style={{ color: 'oklch(0.65 0 0)' }}>Life Score</span>
            </div>
            <div className="text-4xl font-semibold text-white leading-none tabular-nums">
              {stats.lifeScore}
              <span className="text-lg font-normal ml-0.5" style={{ color: 'oklch(0.45 0 0)' }}>/100</span>
            </div>
            <p className="text-[10px] mt-1.5 leading-snug" style={{ color: 'oklch(0.45 0 0)' }}>
              Based on journaling, mood & engagement
            </p>
          </div>
        </div>
      </motion.div>

      {/* 2-col stats grid */}
      <div className="grid grid-cols-2 gap-2">
        <StatCard
          icon={Calendar}
          iconColor="oklch(0.62 0.24 280)"
          value={weeksLived.toLocaleString()}
          label="Weeks Lived"
          delay={0.05}
        />
        <StatCard
          icon={TrendingUp}
          iconColor="oklch(0.65 0.18 160)"
          value={`Age ${currentAge}`}
          label="Current Age"
          delay={0.1}
        />
        <StatCard
          icon={Heart}
          iconColor="oklch(0.7 0.2 0)"
          value={stats.averageMood.toFixed(1)}
          suffix="/5"
          label="Avg Mood"
          delay={0.15}
        />
        <StatCard
          icon={Flame}
          iconColor="oklch(0.75 0.18 50)"
          value={stats.journalStreak}
          label="Week Streak"
          delay={0.2}
        />
      </div>

      {/* Current Phase */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-xl p-3 flex items-center gap-3"
        style={{ background: 'oklch(1 0 0 / 0.04)', border: '1px solid oklch(1 0 0 / 0.07)' }}
      >
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: phaseInfo.bgColor ?? `${phaseInfo.color}22` }}
        >
          <Clock className="w-5 h-5" style={{ color: phaseInfo.color }} />
        </div>
        <div className="min-w-0">
          <div className="text-sm font-semibold text-white">{phaseInfo.name}</div>
          <div className="text-[10px] mt-0.5 leading-snug" style={{ color: 'oklch(0.48 0 0)' }}>
            {phaseInfo.description}
          </div>
        </div>
      </motion.div>

      {/* Phase breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-xl p-3 space-y-2.5"
        style={{ background: 'oklch(1 0 0 / 0.04)', border: '1px solid oklch(1 0 0 / 0.07)' }}
      >
        <div className="text-xs font-medium" style={{ color: 'oklch(0.55 0 0)' }}>Phase Distribution</div>
        {(Object.entries(LIFE_PHASES) as [LifePhase, typeof LIFE_PHASES[LifePhase]][]).map(([key, phase]) => {
          const phaseWeeks = stats.phaseBreakdown[key] || 0
          const years = Math.floor(phaseWeeks / 52)
          const pct = stats.totalWeeksLived > 0 ? (phaseWeeks / stats.totalWeeksLived) * 100 : 0

          return (
            <div key={key} className="space-y-1">
              <div className="flex justify-between text-[10px]">
                <span style={{ color: 'oklch(0.62 0 0)' }}>{phase.name}</span>
                <span style={{ color: 'oklch(0.42 0 0)' }}>{years}y · {pct.toFixed(0)}%</span>
              </div>
              <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'oklch(1 0 0 / 0.07)' }}>
                <motion.div
                  className="h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.9, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  style={{ backgroundColor: phase.color }}
                />
              </div>
            </div>
          )
        })}
      </motion.div>

      {/* Mood distribution */}
      {Object.values(stats.moodDistribution).some(v => v > 0) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.38, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-xl p-3 space-y-2"
          style={{ background: 'oklch(1 0 0 / 0.04)', border: '1px solid oklch(1 0 0 / 0.07)' }}
        >
          <div className="text-xs font-medium" style={{ color: 'oklch(0.55 0 0)' }}>Mood Distribution</div>
          <div className="flex gap-1.5 items-end h-14">
            {(Object.entries(MOOD_CONFIG) as [Mood, typeof MOOD_CONFIG[Mood]][]).map(([mood, config]) => {
              const count = stats.moodDistribution[mood] || 0
              const total = Object.values(stats.moodDistribution).reduce((a, b) => a + b, 0)
              const pct = total > 0 ? (count / total) * 100 : 0

              return (
                <div key={mood} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[9px] leading-none" style={{ color: 'oklch(0.42 0 0)' }}>
                    {pct > 0 ? `${pct.toFixed(0)}%` : ''}
                  </span>
                  <motion.div
                    className="w-full rounded-t-sm"
                    initial={{ height: 0 }}
                    animate={{ height: `${Math.max(pct, 4)}%` }}
                    transition={{ duration: 0.9, delay: 0.42, ease: [0.16, 1, 0.3, 1] }}
                    style={{ backgroundColor: config.color, minHeight: 4 }}
                  />
                  <span className="text-sm leading-none">{config.emoji}</span>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Journal stats */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-xl p-3 flex items-center justify-between"
        style={{ background: 'oklch(1 0 0 / 0.04)', border: '1px solid oklch(1 0 0 / 0.07)' }}
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5" style={{ color: 'oklch(0.78 0.16 75)' }} />
          <span className="text-xs font-medium" style={{ color: 'oklch(0.55 0 0)' }}>Journaling</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-lg font-semibold text-white leading-none">{journalEntries}</div>
            <div className="text-[10px]" style={{ color: 'oklch(0.45 0 0)' }}>entries</div>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold text-white leading-none">
              {stats.totalWeeksLived > 0
                ? `${((stats.totalJournalEntries / stats.totalWeeksLived) * 100).toFixed(0)}%`
                : '0%'}
            </div>
            <div className="text-[10px]" style={{ color: 'oklch(0.45 0 0)' }}>coverage</div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
