import { supabase } from './supabaseClient';
import type { Subject, SyllabusTopic, FocusSession } from '../types';

export const studyService = {
  async getSubjects(userId: string): Promise<Subject[]> {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    return (data || []).map(s => ({
      id: s.id,
      name: s.name,
      progress: Number(s.target_progress || 0),
      studyHours: 0, // Calculated dynamically
      examWeight: 'High' // Default mapping
    }));
  },

  async addSubject(userId: string, sub: { name: string; examWeight: 'High' | 'Medium' | 'Low' }): Promise<Subject> {
    const { data, error } = await supabase
      .from('subjects')
      .insert({
        user_id: userId,
        name: sub.name,
        target_progress: 0
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      progress: 0,
      studyHours: 0,
      examWeight: sub.examWeight
    };
  },

  async getSyllabus(userId: string): Promise<SyllabusTopic[]> {
    const { data, error } = await supabase
      .from('syllabus_topics')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    return (data || []).map(st => ({
      id: st.id,
      subjectId: st.subject_id,
      unit: st.unit || 'General',
      name: st.title,
      status: st.status as any,
      lastStudied: st.last_studied || undefined
    }));
  },

  async updateSyllabusTopic(userId: string, id: string, status: string): Promise<void> {
    const { error } = await supabase
      .from('syllabus_topics')
      .update({
        status,
        last_studied: new Date().toISOString().split('T')[0],
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  },

  async addFocusSession(userId: string, fs: Omit<FocusSession, 'id' | 'date'>): Promise<FocusSession> {
    const start = new Date(Date.now() - fs.duration * 60 * 1000).toISOString();
    const end = new Date().toISOString();

    const { data, error } = await supabase
      .from('focus_sessions')
      .insert({
        user_id: userId,
        subject_id: fs.subjectId,
        topic_id: fs.topicId || null,
        started_at: start,
        ended_at: end,
        duration_minutes: fs.duration,
        session_type: 'Pomodoro'
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      subjectId: data.subject_id,
      topicId: data.topic_id || undefined,
      topicName: fs.topicName,
      duration: data.duration_minutes,
      date: new Date().toISOString().split('T')[0]
    };
  }
};
