import { supabase } from './supabaseClient';
import type { AIChatMessage } from '../types';

export const aiService = {
  async sendMessage(message: string, conversationId?: string): Promise<{ response: string; conversationId: string }> {
    const { data: session } = await supabase.auth.getSession();
    const token = session?.session?.access_token;

    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-assistant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ message, conversationId })
    });

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error?.message || 'Failed to get response from AI assistant');
    }

    return {
      response: result.response,
      conversationId: result.conversationId
    };
  },

  async getChatHistory(userId: string): Promise<AIChatMessage[]> {
    const { data: conv } = await supabase
      .from('ai_conversations')
      .select('id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1);

    if (!conv || conv.length === 0) return [];

    const { data: messages, error } = await supabase
      .from('ai_messages')
      .select('*')
      .eq('conversation_id', conv[0].id)
      .order('created_at', { ascending: true });

    if (error) throw error;

    return (messages || []).map(m => ({
      id: m.id,
      role: m.role as any,
      content: m.content,
      timestamp: m.created_at
    }));
  },

  async clearChat(userId: string): Promise<void> {
    const { data: convs } = await supabase
      .from('ai_conversations')
      .select('id')
      .eq('user_id', userId);

    if (convs && convs.length > 0) {
      const ids = convs.map(c => c.id);
      await supabase
        .from('ai_conversations')
        .delete()
        .in('id', ids);
    }
  }
};
