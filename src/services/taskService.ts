import { supabase } from './supabaseClient';
import type { Task } from '../types';

export const taskService = {
  async getTasks(userId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .order('due_date', { ascending: true });
    
    if (error) throw error;
    
    // Map database properties back to camelCase frontend interface
    return (data || []).map(t => ({
      id: t.id,
      title: t.title,
      description: t.description || '',
      dueDate: t.due_date,
      dueTime: t.due_time || undefined,
      priority: t.priority,
      category: t.category,
      durationEst: t.estimated_minutes,
      durationAct: t.actual_minutes || undefined,
      isCompleted: t.status === 'completed'
    }));
  },

  async addTask(userId: string, task: Omit<Task, 'id'>): Promise<Task> {
    const dbTask = {
      user_id: userId,
      title: task.title,
      description: task.description,
      due_date: task.dueDate,
      due_time: task.dueTime || null,
      priority: task.priority,
      category: task.category,
      estimated_minutes: task.durationEst,
      status: task.isCompleted ? 'completed' : 'pending'
    };

    const { data, error } = await supabase
      .from('tasks')
      .insert(dbTask)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      title: data.title,
      description: data.description || '',
      dueDate: data.due_date,
      dueTime: data.due_time || undefined,
      priority: data.priority,
      category: data.category,
      durationEst: data.estimated_minutes,
      durationAct: data.actual_minutes || undefined,
      isCompleted: data.status === 'completed'
    };
  },

  async updateTask(userId: string, task: Task): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .update({
        title: task.title,
        description: task.description,
        due_date: task.dueDate,
        due_time: task.dueTime || null,
        priority: task.priority,
        category: task.category,
        estimated_minutes: task.durationEst,
        status: task.isCompleted ? 'completed' : 'pending',
        completed_at: task.isCompleted ? new Date().toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', task.id)
      .eq('user_id', userId);

    if (error) throw error;
  },

  async deleteTask(userId: string, id: string): Promise<void> {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  }
};
