import { supabase } from './supabaseClient';

export interface Habit {
  id: string;
  name: string;
  description: string;
  currentStreak: number;
  bestStreak: number;
  completed?: boolean;
}

export const habitService = {
  async getHabits(userId: string, todayDate: string): Promise<Habit[]> {
    const { data: habits, error: habitsError } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', userId);

    if (habitsError) throw habitsError;

    const { data: logs, error: logsError } = await supabase
      .from('habit_logs')
      .select('habit_id, completed')
      .eq('user_id', userId)
      .eq('log_date', todayDate);

    if (logsError) throw logsError;

    const loggedSet = new Map<string, boolean>();
    (logs || []).forEach(log => {
      loggedSet.set(log.habit_id, log.completed);
    });

    return (habits || []).map(h => ({
      id: h.id,
      name: h.name,
      description: h.description || '',
      currentStreak: h.current_streak || 0,
      bestStreak: h.best_streak || 0,
      completed: loggedSet.get(h.id) || false
    }));
  },

  async addHabit(userId: string, name: string, description: string, targetFrequency: string): Promise<Habit> {
    const { data, error } = await supabase
      .from('habits')
      .insert({
        user_id: userId,
        name,
        description,
        target_frequency: targetFrequency,
        current_streak: 0,
        best_streak: 0
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      description: data.description || '',
      currentStreak: data.current_streak,
      bestStreak: data.best_streak,
      completed: false
    };
  },

  async logHabit(userId: string, habitId: string, date: string, completed: boolean): Promise<void> {
    // 1. Upsert habit log
    const { error: logError } = await supabase
      .from('habit_logs')
      .upsert({
        user_id: userId,
        habit_id: habitId,
        log_date: date,
        completed
      }, { onConflict: 'habit_id,log_date' });

    if (logError) throw logError;

    // 2. Increment/Decrement streaks (simulate or query database streak function calculate_habit_streak)
    if (completed) {
      const { data: habit } = await supabase.from('habits').select('current_streak, best_streak').eq('id', habitId).single();
      if (habit) {
        const nextStreak = (habit.current_streak || 0) + 1;
        const nextBest = Math.max(habit.best_streak || 0, nextStreak);
        await supabase
          .from('habits')
          .update({
            current_streak: nextStreak,
            best_streak: nextBest
          })
          .eq('id', habitId);
      }
    }
  }
};
