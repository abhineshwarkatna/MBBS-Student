import { supabase } from './supabaseClient';

export const reportService = {
  async generateDailyReport(_userId: string, date: string): Promise<any> {
    const { data: session } = await supabase.auth.getSession();
    const token = session?.session?.access_token;

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/daily-report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ date })
    });
    const result = await response.json();
    return result.report;
  },

  async generateWeeklyReport(_userId: string, startDate: string, endDate: string): Promise<any> {
    const { data: session } = await supabase.auth.getSession();
    const token = session?.session?.access_token;

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/weekly-report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ start_date: startDate, end_date: endDate })
    });
    const result = await response.json();
    return result.report;
  },

  async generateMonthlyReport(_userId: string, month: number, year: number): Promise<any> {
    const { data: session } = await supabase.auth.getSession();
    const token = session?.session?.access_token;

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/monthly-report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ month, year })
    });
    const result = await response.json();
    return result.report;
  }
};
