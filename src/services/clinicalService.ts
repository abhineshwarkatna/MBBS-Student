import { supabase } from './supabaseClient';
import type { ClinicalPosting, CaseLog } from '../types';

export const clinicalService = {
  async getClinicalPostings(userId: string): Promise<ClinicalPosting[]> {
    const { data, error } = await supabase
      .from('clinical_postings')
      .select('*')
      .eq('user_id', userId)
      .order('posting_date', { ascending: false });

    if (error) throw error;

    return (data || []).map(cp => ({
      id: cp.id,
      department: cp.department,
      mentor: cp.mentor || '',
      startDate: cp.posting_date,
      endDate: cp.posting_date, // Mapping start/end date
      ward: cp.location || '',
      casesCount: cp.cases_seen || 0,
      proceduresObserved: cp.procedures_observed || 0,
      proceduresPerformed: cp.procedures_performed || 0,
      completed: cp.completed || false,
      notes: cp.notes || ''
    }));
  },

  async addClinicalPosting(userId: string, cp: Omit<ClinicalPosting, 'id' | 'casesCount' | 'proceduresObserved' | 'proceduresPerformed' | 'completed'>): Promise<ClinicalPosting> {
    const { data, error } = await supabase
      .from('clinical_postings')
      .insert({
        user_id: userId,
        department: cp.department,
        posting_date: cp.startDate,
        location: cp.ward,
        mentor: cp.mentor,
        completed: false,
        notes: cp.notes
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      department: data.department,
      mentor: data.mentor || '',
      startDate: data.posting_date,
      endDate: data.posting_date,
      ward: data.location || '',
      casesCount: data.cases_seen || 0,
      proceduresObserved: data.procedures_observed || 0,
      proceduresPerformed: data.procedures_performed || 0,
      completed: false,
      notes: data.notes || ''
    };
  },

  async getCaseLogs(userId: string): Promise<CaseLog[]> {
    const { data, error } = await supabase
      .from('case_logs')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (error) throw error;

    return (data || []).map(cl => ({
      id: cl.id,
      postingId: cl.clinical_posting_id,
      date: cl.date,
      complaint: cl.presenting_complaint,
      diagnosis: cl.diagnosis_discussion,
      management: cl.management_discussion || '',
      learningPoints: cl.learning_points || '',
      supervisor: cl.supervisor || ''
    }));
  },

  async addCaseLog(userId: string, cl: Omit<CaseLog, 'id'>): Promise<CaseLog> {
    // 1. Submit Case Log
    const { data, error } = await supabase
      .from('case_logs')
      .insert({
        user_id: userId,
        clinical_posting_id: cl.postingId,
        date: cl.date,
        presenting_complaint: cl.complaint,
        diagnosis_discussion: cl.diagnosis,
        management_discussion: cl.management,
        learning_points: cl.learningPoints,
        supervisor: cl.supervisor
      })
      .select()
      .single();

    if (error) throw error;

    // 2. Increment cases count in the corresponding clinical posting
    const { data: posting } = await supabase
      .from('clinical_postings')
      .select('cases_seen')
      .eq('id', cl.postingId)
      .single();
    
    if (posting) {
      await supabase
        .from('clinical_postings')
        .update({ cases_seen: (posting.cases_seen || 0) + 1 })
        .eq('id', cl.postingId);
    }

    return {
      id: data.id,
      postingId: data.clinical_posting_id,
      date: data.date,
      complaint: data.presenting_complaint,
      diagnosis: data.diagnosis_discussion,
      management: data.management_discussion || '',
      learningPoints: data.learning_points || '',
      supervisor: data.supervisor || ''
    };
  },

  async deleteCaseLog(userId: string, id: string): Promise<void> {
    const { error } = await supabase
      .from('case_logs')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  }
};
