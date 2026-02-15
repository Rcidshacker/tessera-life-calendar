'use client';

// Life in Dots 2.0 - Main Application Page

import { useState, useCallback } from 'react';
import { useLifeData } from '@/hooks/use-life-data';
import { UserSettings, Mood } from '@/lib/types';
import { LifeGrid } from '@/components/life-grid';
import { LifeStatsCard } from '@/components/life-stats';
import { AIInsights } from '@/components/ai-insights';
import { WorldEventsTimeline } from '@/components/world-events-timeline';
import { Onboarding } from '@/components/onboarding';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { AuthGate } from '@/components/auth-gate';
import { LogoutButton } from '@/components/logout-button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Calendar,
  BarChart3,
  Sparkles,
  Globe,
  Menu,
  X,
  Heart
} from 'lucide-react';

export default function Home() {
  const {
    settings,
    weeks,
    stats,
    isOnboarded,
    currentWeekNumber,
    initializeUser,
    updateSettings,
    updateWeek,
  } = useLifeData();

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('stats');

  // Handle week update
  const handleUpdateWeek = useCallback((
    weekNumber: number,
    data: { journal?: string; mood?: Mood; tags?: string[]; goals?: string[] }
  ) => {
    updateWeek(weekNumber, data);
  }, [updateWeek]);

  // Handle onboarding complete
  const handleOnboardingComplete = (newSettings: UserSettings) => {
    initializeUser(newSettings);
  };

  // Show onboarding if not onboarded


  return (
    <AuthGate>
      {!isOnboarded ? (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950">
          <Onboarding onComplete={handleOnboardingComplete} />
        </div>
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950 text-white">
          {/* Background effects */}
          <div className="fixed inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-br from-purple-500/3 to-blue-500/3 rounded-full blur-3xl" />
          </div>

          <div className="relative flex h-screen">
            {/* Sidebar */}
            <aside
              className={`${sidebarOpen ? 'w-96' : 'w-0'
                } transition-all duration-300 overflow-hidden border-r border-gray-800/50 bg-gray-900/30 backdrop-blur-sm`}
            >
              <ScrollArea className="h-full">
                <div className="p-4">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                        Life in Dots
                      </h1>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {settings?.name ? `${settings.name}'s Journey` : 'Your Life Journey'}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSidebarOpen(false)}
                      className="text-gray-400 hover:text-white"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Navigation */}
                  <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-gray-800/50 border border-gray-700/50 mb-4">
                      <TabsTrigger value="stats" className="text-xs data-[state=active]:bg-purple-500/20">
                        <BarChart3 className="w-3 h-3 mr-1" />
                        Stats
                      </TabsTrigger>
                      <TabsTrigger value="insights" className="text-xs data-[state=active]:bg-purple-500/20">
                        <Sparkles className="w-3 h-3 mr-1" />
                        AI
                      </TabsTrigger>
                      <TabsTrigger value="events" className="text-xs data-[state=active]:bg-purple-500/20">
                        <Globe className="w-3 h-3 mr-1" />
                        World
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="stats">
                      <LifeStatsCard
                        stats={stats}
                        currentPhase={weeks[currentWeekNumber]?.lifePhase || 'adult'}
                      />
                    </TabsContent>

                    <TabsContent value="insights">
                      <AIInsights
                        weeks={weeks}
                        stats={stats}
                        settings={settings}
                      />
                    </TabsContent>

                    <TabsContent value="events">
                      {settings?.birthdate && (
                        <WorldEventsTimeline
                          birthdate={new Date(settings.birthdate)}
                          currentWeekNumber={currentWeekNumber}
                        />
                      )}
                    </TabsContent>
                  </Tabs>

                  {/* Quick info */}
                  <div className="mt-6 p-4 rounded-lg bg-gray-800/30 border border-gray-700/30">
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className="w-4 h-4 text-pink-400" />
                      <span className="text-sm font-medium text-gray-300">Remember</span>
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Each dot represents one week of your life. Click on any week to add a journal entry,
                      track your mood, or set goals. Your journey is unique - make every week count!
                    </p>
                  </div>
                </div>
              </ScrollArea>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col overflow-hidden">
              {/* Top Bar */}
              <header className="flex items-center justify-between p-4 border-b border-gray-800/50 bg-gray-900/30 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  {!sidebarOpen && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSidebarOpen(true)}
                      className="text-gray-400 hover:text-white"
                    >
                      <Menu className="w-5 h-5" />
                    </Button>
                  )}
                  <LogoutButton />
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-400" />
                    <span className="text-sm text-gray-300">
                      Week {currentWeekNumber} of {weeks.length}
                    </span>
                  </div>
                </div>

                {/* Quick stats */}
                <div className="hidden md:flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-800/50 border border-gray-700/50">
                    <span className="text-gray-400">Lived:</span>
                    <span className="font-medium text-purple-400">{stats?.totalWeeksLived.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-800/50 border border-gray-700/50">
                    <span className="text-gray-400">Progress:</span>
                    <span className="font-medium text-blue-400">{stats?.percentageLived.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-800/50 border border-gray-700/50">
                    <span className="text-gray-400">Score:</span>
                    <span className="font-medium text-green-400">{stats?.lifeScore}/100</span>
                  </div>
                </div>
              </header>

              {/* Life Grid */}
              <div className="flex-1 p-4 overflow-hidden">
                {weeks.length > 0 ? (
                  <LifeGrid
                    weeks={weeks}
                    currentWeekNumber={currentWeekNumber}
                    onUpdateWeek={handleUpdateWeek}
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-gray-400">
                      <Calendar className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Loading your life journey...</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Legend */}
              <footer className="p-4 border-t border-gray-800/50 bg-gray-900/30 backdrop-blur-sm">
                <div className="flex flex-wrap items-center justify-center gap-4 text-xs">
                  <span className="text-gray-500">Life Phases:</span>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-sm bg-blue-400" />
                    <span className="text-gray-400">Childhood</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-sm bg-purple-400" />
                    <span className="text-gray-400">Teen</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-sm bg-emerald-400" />
                    <span className="text-gray-400">Young Adult</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-sm bg-amber-400" />
                    <span className="text-gray-400">Adult</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-sm bg-orange-400" />
                    <span className="text-gray-400">Middle Age</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-sm bg-pink-400" />
                    <span className="text-gray-400">Senior</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-sm bg-gray-600/30" />
                    <span className="text-gray-400">Future</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-sm ring-2 ring-white animate-pulse" />
                    <span className="text-gray-400">Current</span>
                  </div>
                </div>
              </footer>
            </main>
          </div>
        </div>
      )}
    </AuthGate>
  );
}
