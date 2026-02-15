'use client';

// Life in Dots 2.0 - Life Stats Component

import { useMemo } from 'react';
import { LifeStats, LIFE_PHASES, MOOD_CONFIG, LifePhase, Mood } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Calendar, 
  Heart, 
  Target, 
  Sparkles,
  Award,
  Clock,
  Flame
} from 'lucide-react';

interface LifeStatsProps {
  stats: LifeStats | null;
  currentPhase: LifePhase;
}

export function LifeStatsCard({ stats, currentPhase }: LifeStatsProps) {
  const phaseInfo = LIFE_PHASES[currentPhase];

  if (!stats) {
    return (
      <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
        <CardContent className="p-6 text-center text-gray-400">
          Enter your birthdate to see your life statistics
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Life Score Card */}
      <Card className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 border-purple-800/50 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-white flex items-center gap-2 text-lg">
            <Award className="w-5 h-5 text-yellow-400" />
            Life Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="text-5xl font-bold text-white">
              {stats.lifeScore}
              <span className="text-xl text-gray-400">/100</span>
            </div>
            <div className="flex-1">
              <Progress 
                value={stats.lifeScore} 
                className="h-3 bg-gray-800"
              />
              <p className="text-sm text-gray-400 mt-2">
                Based on journaling, mood tracking, and engagement
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Calendar className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {stats.totalWeeksLived.toLocaleString()}
                </div>
                <div className="text-xs text-gray-400">Weeks Lived</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/20 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {stats.percentageLived.toFixed(1)}%
                </div>
                <div className="text-xs text-gray-400">Life Progress</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-pink-500/20 rounded-lg">
                <Heart className="w-5 h-5 text-pink-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {stats.averageMood}/5
                </div>
                <div className="text-xs text-gray-400">Average Mood</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-500/20 rounded-lg">
                <Flame className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <div className="text-2xl font-bold text-white">
                  {stats.journalStreak}
                </div>
                <div className="text-xs text-gray-400">Week Streak</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Current Life Phase */}
      <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-white flex items-center gap-2 text-lg">
            <Clock className="w-5 h-5" style={{ color: phaseInfo.color }} />
            Current Phase
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center"
              style={{ backgroundColor: phaseInfo.bgColor }}
            >
              <span className="text-2xl font-bold" style={{ color: phaseInfo.color }}>
                {stats.totalWeeksLived > 0 ? Math.floor(stats.totalWeeksLived / 52) : 0}
              </span>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">{phaseInfo.name}</h3>
              <p className="text-sm text-gray-400">{phaseInfo.description}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Life Phase Breakdown */}
      <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-white text-lg">Life Phase Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(Object.entries(LIFE_PHASES) as [LifePhase, typeof LIFE_PHASES[LifePhase]][]).map(([key, phase]) => {
              const weeks = stats.phaseBreakdown[key] || 0;
              const years = Math.floor(weeks / 52);
              const percentage = stats.totalWeeksLived > 0 
                ? (weeks / stats.totalWeeksLived) * 100 
                : 0;

              return (
                <div key={key} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-300">{phase.name}</span>
                    <span className="text-gray-400">
                      {years} years ({percentage.toFixed(0)}%)
                    </span>
                  </div>
                  <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${percentage}%`,
                        backgroundColor: phase.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Mood Distribution */}
      {Object.values(stats.moodDistribution).some(v => v > 0) && (
        <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-white text-lg">Mood Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 items-end h-20">
              {(Object.entries(MOOD_CONFIG) as [Mood, typeof MOOD_CONFIG[Mood]][]).map(([mood, config]) => {
                const count = stats.moodDistribution[mood] || 0;
                const total = Object.values(stats.moodDistribution).reduce((a, b) => a + b, 0);
                const percentage = total > 0 ? (count / total) * 100 : 0;
                const height = total > 0 ? Math.max(percentage, 5) : 5;

                return (
                  <div key={mood} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs text-gray-400">{percentage.toFixed(0)}%</span>
                    <div
                      className="w-full rounded-t transition-all duration-500"
                      style={{
                        height: `${height}%`,
                        backgroundColor: config.color,
                        minHeight: '8px',
                      }}
                    />
                    <span className="text-lg">{config.emoji}</span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Journal Stats */}
      <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-white flex items-center gap-2 text-lg">
            <Sparkles className="w-5 h-5 text-yellow-400" />
            Journaling
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-white">
                {stats.totalJournalEntries}
              </div>
              <div className="text-sm text-gray-400">Total Entries</div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-white">
                {stats.totalWeeksLived > 0 
                  ? ((stats.totalJournalEntries / stats.totalWeeksLived) * 100).toFixed(0)
                  : 0}%
              </div>
              <div className="text-sm text-gray-400">Coverage</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
