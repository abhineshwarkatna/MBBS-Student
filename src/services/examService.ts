import { supabase } from './supabaseClient';
import type { Exam, RevisionItem, Flashcard } from '../types';

export const examService = {
  async getExams(userId: string): Promise<Exam[]> {
    const { data, error } = await supabase
      .from('exams')
      .select('*')
      .eq('user_id', userId)
      .order('exam_date', { ascending: true });

    if (error) throw error;

    return (data || []).map(ex => ({
      id: ex.id,
      title: ex.name,
      date: ex.exam_date,
      type: ex.exam_type as any,
      status: new Date(ex.exam_date) <= new Date() ? 'Completed' : 'Upcoming'
    }));
  },

  async addExam(userId: string, exam: Omit<Exam, 'id' | 'status'>): Promise<Exam> {
    const { data, error } = await supabase
      .from('exams')
      .insert({
        user_id: userId,
        name: exam.title,
        exam_date: exam.date,
        exam_type: exam.type
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      title: data.name,
      date: data.exam_date,
      type: data.exam_type as any,
      status: 'Upcoming'
    };
  },

  async deleteExam(userId: string, id: string): Promise<void> {
    const { error } = await supabase
      .from('exams')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  },

  async getRevisionQueue(userId: string): Promise<RevisionItem[]> {
    const { data, error } = await supabase
      .from('revision_items')
      .select('*, syllabus_topics(title, subject_id)')
      .eq('user_id', userId);

    if (error) throw error;

    return (data || []).map(r => ({
      id: r.id,
      subjectId: r.syllabus_topics?.subject_id || '',
      topicId: r.topic_id,
      topicName: r.syllabus_topics?.title || 'Unknown Topic',
      stage: r.stage || 1,
      dueDate: r.next_review_at ? r.next_review_at.split('T')[0] : '',
      status: r.status as any
    }));
  },

  async updateRevisionItem(userId: string, id: string, status: string, reviewCount: number): Promise<void> {
    const nextDate = new Date();
    // Leitner Box interval calculation: Stage 1 = 1 day, Stage 2 = 3 days, Stage 3 = 7 days, Stage 4 = 14 days
    const intervalDays = status === 'Revised' ? (reviewCount * 3 + 1) : 1;
    nextDate.setDate(nextDate.getDate() + intervalDays);

    const { error } = await supabase
      .from('revision_items')
      .update({
        status,
        last_reviewed_at: new Date().toISOString(),
        next_review_at: nextDate.toISOString(),
        review_count: reviewCount + 1,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  },

  async getFlashcards(userId: string): Promise<Flashcard[]> {
    const { data, error } = await supabase
      .from('flashcards')
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;

    return (data || []).map(fc => ({
      id: fc.id,
      subjectId: 'sub-path', // default mapping
      question: fc.question,
      answer: fc.answer,
      difficulty: (fc.difficulty as any) || 'Medium',
      nextDueDate: '',
      box: 1
    }));
  },

  async updateFlashcard(userId: string, id: string, rating: 'easy' | 'medium' | 'hard'): Promise<void> {
    const nextDate = new Date();
    const interval = rating === 'easy' ? 7 : rating === 'medium' ? 3 : 1;
    nextDate.setDate(nextDate.getDate() + interval);

    const { error } = await supabase
      .from('flashcard_reviews')
      .insert({
        user_id: userId,
        flashcard_id: id,
        rating,
        reviewed_at: new Date().toISOString(),
        next_review_at: nextDate.toISOString()
      });

    if (error) throw error;
  }
};
