'use client';

// Life in Dots 2.0 - AI Insights Component

import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Sparkles, 
  RefreshCw, 
  Lightbulb, 
  TrendingUp, 
  Heart,
  Loader2
} from 'lucide-react';
import { WeekEntry, LifeStats, UserSettings } from '@/lib/types';

interface AIInsightsProps {
  weeks: WeekEntry[];
  stats: LifeStats | null;
  settings: UserSettings | null;
}

export function AIInsights({ weeks, stats, settings }: AIInsightsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState<{
    insights: string;
    patterns: string[];
    suggestions: string[];
    encouragement?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchInsights = useCallback(async () => {
    if (!stats || !settings) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          journalEntries: weeks.filter(w => w.journal).slice(-20).map(w => ({
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
      });

      if (!response.ok) {
        throw new Error('Failed to fetch insights');
      }

      const data = await response.json();
      setInsights(data);
    } catch (err) {
      setError('Unable to generate insights. Please try again.');
      console.error('AI Insights error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [weeks, stats, settings]);

  return (
    <Card className="bg-gray-900/50 border-gray-800 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-400" />
            AI Life Coach
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchInsights}
            disabled={isLoading || !stats}
            className="text-purple-400 hover:text-purple-300"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!insights && !isLoading && (
          <div className="text-center py-6">
            <Sparkles className="w-12 h-12 mx-auto text-purple-400/50 mb-4" />
            <p className="text-gray-400 mb-4">
              Get AI-powered insights about your life journey
            </p>
            <Button
              onClick={fetchInsights}
              disabled={!stats}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Generate Insights
            </Button>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-8">
            <Loader2 className="w-12 h-12 mx-auto text-purple-400 animate-spin mb-4" />
            <p className="text-gray-400">Analyzing your life journey...</p>
          </div>
        )}

        {error && (
          <div className="text-center py-6 text-red-400">
            <p>{error}</p>
            <Button
              variant="ghost"
              onClick={fetchInsights}
              className="mt-2"
            >
              Try Again
            </Button>
          </div>
        )}

        {insights && !isLoading && (
          <ScrollArea className="h-[400px] pr-4">
            <div className="space-y-4">
              {/* Main Insights */}
              <div className="bg-gray-800/50 rounded-lg p-4">
                <p className="text-gray-300 leading-relaxed whitespace-pre-line">
                  {insights.insights}
                </p>
              </div>

              {/* Patterns */}
              {insights.patterns.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                    <span className="text-sm font-medium text-gray-300">Patterns Detected</span>
                  </div>
                  <div className="space-y-2">
                    {insights.patterns.map((pattern, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 bg-blue-500/10 rounded-lg p-3"
                      >
                        <Badge variant="outline" className="border-blue-500/50 text-blue-400 shrink-0">
                          {i + 1}
                        </Badge>
                        <span className="text-sm text-gray-300">{pattern}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {insights.suggestions.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-4 h-4 text-yellow-400" />
                    <span className="text-sm font-medium text-gray-300">Suggestions</span>
                  </div>
                  <div className="space-y-2">
                    {insights.suggestions.map((suggestion, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 bg-yellow-500/10 rounded-lg p-3"
                      >
                        <Badge variant="outline" className="border-yellow-500/50 text-yellow-400 shrink-0">
                          {i + 1}
                        </Badge>
                        <span className="text-sm text-gray-300">{suggestion}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Encouragement */}
              {insights.encouragement && (
                <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-4 border border-purple-500/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-4 h-4 text-pink-400" />
                    <span className="text-sm font-medium text-pink-300">A Note for You</span>
                  </div>
                  <p className="text-gray-300 italic">{insights.encouragement}</p>
                </div>
              )}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
