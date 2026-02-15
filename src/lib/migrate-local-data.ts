import { createClient } from '@/lib/supabase/client'
import { Milestone, UserSettings, Mood } from '@/lib/types'

interface StoredWeekData {
    journal?: string;
    mood?: Mood;
    tags?: string[];
    goals?: string[];
}

interface LifeDataStorageInternal {
    settings: UserSettings | null;
    weeksData: Record<number, StoredWeekData>;
    milestones: Milestone[];
    lastUpdated: string;
}

export async function migrateLocalStorageToSupabase(userId: string) {
    const STORAGE_KEY = 'life-in-dots-data'
    const dataString = localStorage.getItem(STORAGE_KEY)

    if (!dataString) return { success: false, message: 'No local data found' }

    try {
        const data: LifeDataStorageInternal = JSON.parse(dataString)
        const supabase = createClient()

        // 1. Profile & Settings
        if (data.settings) {
            const { error: profileError } = await supabase
                .from('user_profiles')
                .upsert({
                    id: userId,
                    name: data.settings.name,
                    birthdate: data.settings.birthdate,
                    life_expectancy: data.settings.lifeExpectancy
                })

            if (profileError) throw profileError

            const { error: settingsError } = await supabase
                .from('user_settings')
                .upsert({
                    user_id: userId,
                    theme: data.settings.theme,
                    notifications_enabled: true
                })

            if (settingsError) throw settingsError
        }

        // 2. Weeks
        if (data.weeksData && Object.keys(data.weeksData).length > 0) {
            const weeksToInsert = Object.entries(data.weeksData).map(([weekNum, weekData]) => ({
                user_id: userId,
                week_number: parseInt(weekNum),
                journal: weekData.journal,
                mood: weekData.mood,
                goals: weekData.goals ? JSON.stringify(weekData.goals) : null,
            }))

            if (weeksToInsert.length > 0) {
                const { error: weeksError } = await supabase
                    .from('life_weeks')
                    .upsert(weeksToInsert, { onConflict: 'user_id,week_number' })

                if (weeksError) throw weeksError
            }
        }

        // 3. Milestones
        if (data.milestones && data.milestones.length > 0) {
            const milestonesToInsert = data.milestones.map(m => ({
                user_id: userId,
                title: m.title,
                description: m.description,
                date: m.date,
                category: m.category
            }))

            const { error: mileError } = await supabase
                .from('milestones')
                .insert(milestonesToInsert)

            if (mileError) throw mileError
        }

        // Clear local storage
        localStorage.removeItem(STORAGE_KEY)

        return { success: true, message: 'Migration successful' }

    } catch (error) {
        console.error('Migration error:', error)
        return { success: false, message: 'Migration failed', error }
    }
}
