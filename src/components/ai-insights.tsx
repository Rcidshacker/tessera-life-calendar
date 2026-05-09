'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sparkles, RefreshCw, Lightbulb, TrendingUp, Heart, Loader2 } from 'lucide-react'
import { WeekEntry, LifeStats, UserSettings } from '@/lib/types'

interface AIInsightsProps {
  weeks: WeekEntry[]
  stats: LifeStats | null
  settings: UserSettings | null
}

function TypewriterText({ text, speed = 12 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState('')
  const [done, setDone] = useState(false)

  useEffect(() => {
    setDisplayed('')
    setDone(false)
    let i = 0
    const id = setInterval(() => {
      i++
      setDisplayed(text.slice(0, i))
      if (i >= text.length) {
        clearInterval(id)
        setDone(true)
      }
    }, speed)
    return () => clearInterval(id)
  }, [text, speed])

  return (
    <span>
      {displayed}
      {!done && <span className="typewriter-cursor" />}
    </span>
  )
}

function SkeletonPulse({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }, (_, i) => (
        <div
          key={i}
          className="skeleton-shimmer rounded-md"
          style={{ height: 12, width: i === lines - 1 ? '65%' : '100%' }}
        />
      ))}
    </div>
  )
}

const categoryAccents: Record<string, string> = {
  patterns: 'oklch(0.62 0.24 280)',
  suggestions: 'oklch(0.78 0.16 75)',
  encouragement: 'oklch(0.7 0.2 0)',
}

export function AIInsights({ weeks, stats, settings }: AIInsightsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [insights, setInsights] = useState<{
    insights: string
    patterns: string[]
    suggestions: string[]
    encouragement?: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [insightsKey, setInsightsKey] = useState(0)

  const fetchInsights = useCallback(async () => {
    if (!stats || !settings) return
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          journalEntries: weeks
            .filter(w => w.journal)
            .slice(-20)
            .map(w => ({
              weekNumber: w.weekNumber,
              date: w.startDate,
              journal: w.journal,
              mood: w.mood,
              age: w.age,
              lifePhase: w.lifePhase,
            })),
          stats: {
            totalWeeksLived: stats.totalWeeksLived,
            averageMood: stats.averageMood,
            journalStreak: stats.journalStreak,
            lifeScore: stats.lifeScore,
          },
          settings: {
            name: settings.name,
            birthdate: settings.birthdate,
            lifeExpectancy: settings.lifeExpectancy,
          },
        }),
      })

      if (!response.ok) throw new Error('Failed to fetch insights')
      const data = await response.json()
      setInsights(data)
      setInsightsKey(k => k + 1)
    } catch (err) {
      setError('Unable to generate insights. Please try again.')
      console.error('AI Insights error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [weeks, stats, settings])

  return (
    <div
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'oklch(1 0 0 / 0.03)',
        border: '1px solid oklch(1 0 0 / 0.08)',
        backdropFilter: 'blur(16px)',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: '1px solid oklch(1 0 0 / 0.07)' }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'oklch(0.62 0.24 280 / 0.15)' }}
          >
            <Sparkles className="w-3.5 h-3.5" style={{ color: 'oklch(0.72 0.18 280)' }} />
          </div>
          <span className="text-sm font-medium text-white">AI Life Coach</span>
        </div>
        <button
          onClick={fetchInsights}
          disabled={isLoading || !stats}
          className="p-1.5 rounded-lg transition-colors hover:bg-white/5 disabled:opacity-30"
          style={{ color: 'oklch(0.62 0.24 280)' }}
        >
          {isLoading
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <RefreshCw className="w-3.5 h-3.5" />
          }
        </button>
      </div>

      <div className="p-4">
        {/* Empty state */}
        {!insights && !isLoading && !error && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-4 py-8 text-center"
          >
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{
                background: 'oklch(0.62 0.24 280 / 0.1)',
                border: '1px solid oklch(0.62 0.24 280 / 0.2)',
              }}
            >
              <Sparkles className="w-6 h-6" style={{ color: 'oklch(0.62 0.24 280)' }} />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-medium text-white">Get AI insights</p>
              <p className="text-xs leading-relaxed" style={{ color: 'oklch(0.5 0 0)' }}>
                Personalized reflection on your life journey
              </p>
            </div>
            <Button
              onClick={fetchInsights}
              disabled={!stats}
              className="h-9 rounded-xl px-5 text-xs font-medium"
              style={{ background: 'oklch(0.62 0.24 280)', color: 'white', border: 'none' }}
            >
              Generate Insights
            </Button>
          </motion.div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="py-4 space-y-5">
            <SkeletonPulse lines={4} />
            <SkeletonPulse lines={3} />
            <SkeletonPulse lines={2} />
          </div>
        )}

        {/* Error */}
        {error && !isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="py-6 text-center space-y-3"
          >
            <p className="text-sm" style={{ color: 'oklch(0.65 0.2 22)' }}>{error}</p>
            <button
              onClick={fetchInsights}
              className="text-xs underline underline-offset-2"
              style={{ color: 'oklch(0.62 0.24 280)' }}
            >
              Try again
            </button>
          </motion.div>
        )}

        {/* Insights */}
        {insights && !isLoading && (
          <ScrollArea className="max-h-[420px] scrollbar-thin">
            <AnimatePresence mode="wait">
              <motion.div
                key={insightsKey}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-4 pr-2"
              >
                {/* Main insight text — typewriter */}
                <div
                  className="rounded-xl p-4"
                  style={{
                    background: 'oklch(0.62 0.24 280 / 0.06)',
                    border: '1px solid oklch(0.62 0.24 280 / 0.15)',
                    borderLeft: '3px solid oklch(0.62 0.24 280 / 0.5)',
                  }}
                >
                  <p className="text-sm leading-relaxed" style={{ color: 'oklch(0.75 0 0)' }}>
                    <TypewriterText text={insights.insights} speed={10} />
                  </p>
                </div>

                {/* Patterns */}
                {insights.patterns.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="w-3.5 h-3.5" style={{ color: categoryAccents.patterns }} />
                      <span className="text-xs font-medium" style={{ color: 'oklch(0.6 0 0)' }}>
                        Patterns
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {insights.patterns.map((p, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + i * 0.07 }}
                          className="flex gap-2.5 rounded-lg p-2.5"
                          style={{
                            background: `${categoryAccents.patterns}0d`,
                            borderLeft: `2px solid ${categoryAccents.patterns}55`,
                          }}
                        >
                          <span
                            className="text-[10px] font-semibold leading-none mt-0.5 flex-shrink-0"
                            style={{ color: categoryAccents.patterns }}
                          >
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <span className="text-xs leading-relaxed" style={{ color: 'oklch(0.7 0 0)' }}>
                            {p}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Suggestions */}
                {insights.suggestions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-2"
                  >
                    <div className="flex items-center gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5" style={{ color: categoryAccents.suggestions }} />
                      <span className="text-xs font-medium" style={{ color: 'oklch(0.6 0 0)' }}>
                        Suggestions
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {insights.suggestions.map((s, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.35 + i * 0.07 }}
                          className="flex gap-2.5 rounded-lg p-2.5"
                          style={{
                            background: `${categoryAccents.suggestions}0d`,
                            borderLeft: `2px solid ${categoryAccents.suggestions}55`,
                          }}
                        >
                          <span
                            className="text-[10px] font-semibold leading-none mt-0.5 flex-shrink-0"
                            style={{ color: categoryAccents.suggestions }}
                          >
                            {String(i + 1).padStart(2, '0')}
                          </span>
                          <span className="text-xs leading-relaxed" style={{ color: 'oklch(0.7 0 0)' }}>
                            {s}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Encouragement */}
                {insights.encouragement && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="rounded-xl p-4"
                    style={{
                      background: 'oklch(0.7 0.2 0 / 0.07)',
                      border: '1px solid oklch(0.7 0.2 0 / 0.15)',
                      borderLeft: `3px solid ${categoryAccents.encouragement}88`,
                    }}
                  >
                    <div className="flex items-center gap-1.5 mb-2">
                      <Heart className="w-3.5 h-3.5" style={{ color: categoryAccents.encouragement }} />
                      <span className="text-xs font-medium" style={{ color: categoryAccents.encouragement }}>
                        A Note for You
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed italic" style={{ color: 'oklch(0.68 0 0)' }}>
                      {insights.encouragement}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            </AnimatePresence>
          </ScrollArea>
        )}
      </div>
    </div>
  )
}
