import { supabase } from './supabaseClient';
import type { AttendanceRecord } from '../types';

export const attendanceService = {
  async getAttendance(userId: string): Promise<AttendanceRecord[]> {
    const { data: subjects, error: subError } = await supabase
      .from('subjects')
      .select('id, name')
      .eq('user_id', userId);

    if (subError) throw subError;

    const records: AttendanceRecord[] = [];

    for (const sub of (subjects || [])) {
      // Get attendance count from DB
      const { data, error } = await supabase
        .from('attendance')
        .select('attended')
        .eq('user_id', userId)
        .eq('subject_id', sub.id);

      if (error) throw error;

      const attended = (data || []).filter(a => a.attended).length;
      const missed = (data || []).filter(a => !a.attended).length;

      records.push({
        id: sub.id, // using subject ID as record ID for frontend UI routing
        subjectId: sub.id,
        subjectName: sub.name,
        attended,
        missed,
        requiredPercent: 75
      });
    }

    return records;
  },

  async logAttendance(userId: string, subjectId: string, date: string, attended: boolean): Promise<void> {
    const { error } = await supabase
      .from('attendance')
      .insert({
        user_id: userId,
        subject_id: subjectId,
        date,
        class_type: 'Lecture',
        attended
      });

    if (error) throw error;
  },

  async updateAttendance(userId: string, record: AttendanceRecord): Promise<void> {
    // Determine delta and insert updates into table
    // In our simplified UI record adjusters:
    // clear previous logs for today and insert matching counts
    const todayStr = new Date().toISOString().split('T')[0];
    
    // Reset today logs for subject to allow incremental adjusts
    await supabase
      .from('attendance')
      .delete()
      .eq('user_id', userId)
      .eq('subject_id', record.subjectId)
      .eq('date', todayStr);

    // Insert attended
    for (let i = 0; i < record.attended; i++) {
      await supabase.from('attendance').insert({
        user_id: userId,
        subject_id: record.subjectId,
        date: todayStr,
        class_type: 'Lecture',
        attended: true
      });
    }

    // Insert missed
    for (let i = 0; i < record.missed; i++) {
      await supabase.from('attendance').insert({
        user_id: userId,
        subject_id: record.subjectId,
        date: todayStr,
        class_type: 'Lecture',
        attended: false
      });
    }
  }
};
