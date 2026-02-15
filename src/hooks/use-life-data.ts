import { useCallback, useMemo, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/auth-context';
import { migrateLocalStorageToSupabase } from '@/lib/migrate-local-data';
import {
  WeekEntry,
  Milestone,
  UserSettings,
  LifeStats,
  Mood,
} from '@/lib/types';
import {
  generateLifeWeeks,
  calculateLifeStats,
  generateDefaultMilestones,
  getWeekNumberInLife,
} from '@/lib/life-calculations';

// Re-defining interface as it's not exported
interface StoredWeekData {
  journal?: string;
  mood?: Mood;
  tags?: string[];
  goals?: string[];
}

export function useLifeData() {
  const { user, loading: authLoading } = useAuth();
  const supabase = createClient();

  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [weeksData, setWeeksData] = useState<Record<number, StoredWeekData>>({});
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Load data from Supabase
  useEffect(() => {
    if (authLoading) return;

    const loadData = async () => {
      // Logic moved inside async to avoid synchronous state update in effect body
      if (!user) {
        setDataLoading(false);
        return;
      }

      setDataLoading(true);

      // Check for migration
      await migrateLocalStorageToSupabase(user.id);

      // Fetch Profile & Settings
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const { data: userSettings } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (profile) {
        setSettings({
          name: profile.name,
          birthdate: profile.birthdate,
          lifeExpectancy: profile.life_expectancy || 80,
          theme: userSettings?.theme || 'light',
          showWorldEvents: true, // Default or add to DB
          gridZoom: 1, // Default
        });
      }

      // Fetch Weeks
      const { data: weeks } = await supabase
        .from('life_weeks')
        .select('*')
        .eq('user_id', user.id);

      if (weeks) {
        const weeksMap: Record<number, StoredWeekData> = {};
        weeks.forEach((w: any) => {
          weeksMap[w.week_number] = {
            journal: w.journal,
            mood: w.mood,
            goals: w.goals ? JSON.parse(w.goals) : undefined,
          };
        });
        setWeeksData(weeksMap);
      }

      // Fetch Milestones
      const { data: miles } = await supabase
        .from('milestones')
        .select('*')
        .eq('user_id', user.id);

      if (miles) {
        setMilestones(miles.map((m: any) => ({
          id: m.id.toString(),
          title: m.title,
          description: m.description,
          date: m.date,
          category: m.category,
          weekNumber: 0, // Calculate later or store? Not stored in DB model provided.
        })));
      }

      setDataLoading(false);
    };

    loadData();

    // Realtime Subscriptions
    if (!user) return;

    const weeksChannel = supabase
      .channel('life_weeks_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'life_weeks', filter: `user_id=eq.${user.id}` },
        (payload) => {
          if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
            const newRow = payload.new as any;
            setWeeksData(prev => ({
              ...prev,
              [newRow.week_number]: {
                journal: newRow.journal,
                mood: newRow.mood,
                goals: newRow.goals ? JSON.parse(newRow.goals) : undefined
              }
            }));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(weeksChannel);
    };
  }, [user, supabase, authLoading]);

  // Generate weeks array (derived state)
  const weeks = useMemo((): WeekEntry[] => {
    if (!settings?.birthdate) return [];

    const birthdate = new Date(settings.birthdate);
    const lifeExpectancy = settings.lifeExpectancy || 80;
    const baseWeeks = generateLifeWeeks(birthdate, lifeExpectancy);

    return baseWeeks.map(week => {
      const storedData = weeksData[week.weekNumber];
      if (storedData) {
        return {
          ...week,
          journal: storedData.journal,
          mood: storedData.mood,
          tags: storedData.tags,
          goals: storedData.goals,
        };
      }
      return week;
    });
  }, [settings, weeksData]);

  // Derived Stats
  const stats = useMemo((): LifeStats | null => {
    if (!settings?.birthdate || weeks.length === 0) return null;
    return calculateLifeStats(weeks, new Date(settings.birthdate));
  }, [weeks, settings]);

  const isOnboarded = useMemo(() => {
    return !!settings?.birthdate;
  }, [settings]);

  const currentWeekNumber = useMemo(() => {
    if (!settings?.birthdate) return 0;
    return getWeekNumberInLife(new Date(settings.birthdate), new Date());
  }, [settings]);


  // Actions
  const initializeUser = useCallback(async (newSettings: UserSettings) => {
    if (!user) return;

    // Optimistic update
    setSettings(newSettings);
    const defaultMilestones = generateDefaultMilestones(new Date(newSettings.birthdate));
    setMilestones(defaultMilestones);

    // DB Update
    await supabase.from('user_profiles').upsert({
      id: user.id,
      name: newSettings.name,
      birthdate: newSettings.birthdate,
      life_expectancy: newSettings.lifeExpectancy
    });

    // Insert Milestones
    const milestonesToInsert = defaultMilestones.map(m => ({
      user_id: user.id,
      title: m.title,
      description: m.description,
      date: m.date,
      category: m.category
    }));
    await supabase.from('milestones').insert(milestonesToInsert);

  }, [user, supabase]);

  const updateSettings = useCallback(async (updates: Partial<UserSettings>) => {
    if (!user || !settings) return;

    const newSettings = { ...settings, ...updates };
    setSettings(newSettings); // Optimistic

    // DB Update
    if (updates.name || updates.birthdate || updates.lifeExpectancy) {
      await supabase.from('user_profiles').update({
        name: newSettings.name,
        birthdate: newSettings.birthdate,
        life_expectancy: newSettings.lifeExpectancy
      }).eq('id', user.id);
    }

    if (updates.theme) {
      await supabase.from('user_settings').upsert({
        user_id: user.id,
        theme: newSettings.theme
      });
    }

  }, [user, settings, supabase]);

  const updateWeek = useCallback(async (weekNumber: number, data: Partial<StoredWeekData>) => {
    if (!user) return;

    // Optimistic
    setWeeksData(prev => ({
      ...prev,
      [weekNumber]: { ...prev[weekNumber], ...data }
    }));

    // DB Update
    const payload: any = {
      user_id: user.id,
      week_number: weekNumber,
      updated_at: new Date().toISOString()
    };

    if (data.journal !== undefined) payload.journal = data.journal;
    if (data.mood !== undefined) payload.mood = data.mood;
    if (data.goals !== undefined) payload.goals = JSON.stringify(data.goals);

    await supabase.from('life_weeks').upsert(payload, { onConflict: 'user_id,week_number' });

  }, [user, supabase]);

  // Milestone Actions
  const addMilestone = useCallback(async (milestone: Omit<Milestone, 'id'>) => {
    if (!user) return;

    const { data, error } = await supabase.from('milestones').insert({
      user_id: user.id,
      title: milestone.title,
      description: milestone.description,
      date: milestone.date,
      category: milestone.category
    }).select().single();

    if (data) {
      setMilestones(prev => [...prev, {
        id: data.id.toString(),
        title: data.title,
        description: data.description,
        date: data.date,
        category: data.category,
        weekNumber: 0 // calc
      }]);
    }
  }, [user, supabase]);

  const updateMilestone = useCallback(async (id: string, updates: Partial<Milestone>) => {
    // DB Update
    await supabase.from('milestones').update({
      title: updates.title,
      description: updates.description,
      date: updates.date,
      category: updates.category
    }).eq('id', id);

    setMilestones(prev => prev.map(m => m.id === id ? { ...m, ...updates } : m));
  }, [supabase]);

  const deleteMilestone = useCallback(async (id: string) => {
    await supabase.from('milestones').delete().eq('id', id);
    setMilestones(prev => prev.filter(m => m.id !== id));
  }, [supabase]);

  const getWeek = useCallback((weekNumber: number) => {
    return weeks.find(w => w.weekNumber === weekNumber);
  }, [weeks]);

  const clearAllData = useCallback(async () => {
    setSettings(null);
    setWeeksData({});
    setMilestones([]);
  }, []);

  return {
    settings,
    weeks,
    milestones,
    stats,
    isOnboarded,
    currentWeekNumber,
    loading: dataLoading || authLoading,
    initializeUser,
    updateSettings,
    updateWeek,
    addMilestone,
    updateMilestone,
    deleteMilestone,
    getWeek,
    clearAllData
  };
}
