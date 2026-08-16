import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Bot, 
  Send, 
  Trash2, 
  Sparkles, 
  ShieldAlert
} from 'lucide-react';

export const AiView: React.FC = () => {
  const { aiChatHistory, sendAIMessage, clearAIChat } = useApp();
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [aiChatHistory]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || sending) return;

    const userText = inputMessage;
    setInputMessage('');
    setSending(true);
    await sendAIMessage(userText);
    setSending(false);
  };

  const handleQuickPrompt = async (prompt: string) => {
    if (sending) return;
    setSending(true);
    await sendAIMessage(prompt);
    setSending(false);
  };

  return (
    <div className="space-y-6 text-left flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-100px)]">
      
      {/* HEADER BAR */}
      <div className="flex justify-between items-center bg-slate-900/5 dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 flex-shrink-0">
        <div className="flex items-center space-x-2">
          <span className="p-2 rounded-xl bg-teal-500 text-white shadow-md shadow-teal-500/10">
            <Bot size={20} />
          </span>
          <div>
            <h2 className="text-lg font-black text-slate-800 dark:text-slate-100 leading-none">AI Study & Viva Assistant</h2>
            <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider mt-1 block">Trained Medical Assistant</span>
          </div>
        </div>
        
        <button
          onClick={clearAIChat}
          className="p-2 text-slate-450 hover:text-red-500 hover:bg-red-500/5 rounded-xl transition-all"
          title="Clear Conversation"
        >
          <Trash2 size={16} />
        </button>
      </div>

      {/* PATIENT PRIVACY WARNING */}
      <div className="flex items-start space-x-2 bg-rose-500/10 border border-rose-500/15 p-3 rounded-xl flex-shrink-0">
        <ShieldAlert className="text-rose-500 mt-0.5 flex-shrink-0" size={14} />
        <p className="text-[10px] text-slate-400 font-semibold leading-relaxed">
          ⚠️ **Educational Notice**: AI outputs represent revision outlines and must NOT be used for diagnostics or actual patient care. Never enter protected health information (PHI) or personal patient details.
        </p>
      </div>

      {/* CHAT BUBBLES SCROLLER */}
      <div className="flex-1 overflow-y-auto px-2 space-y-4 py-2 border border-slate-200/40 dark:border-slate-850 rounded-2xl bg-slate-50/50 dark:bg-slate-950/30">
        {aiChatHistory.map((msg) => {
          const isAssistant = msg.role === 'assistant';
          return (
            <div
              key={msg.id}
              className={`flex ${isAssistant ? 'justify-start' : 'justify-end'} animate-fade-in`}
            >
              <div className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-4 border text-xs leading-relaxed whitespace-pre-line ${
                isAssistant
                  ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 shadow-sm'
                  : 'bg-gradient-to-tr from-teal-500 to-blue-500 text-white border-transparent shadow-md shadow-teal-500/5'
              }`}>
                {msg.content}
              </div>
            </div>
          );
        })}
        {sending && (
          <div className="flex justify-start">
            <div className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 rounded-2xl p-4 text-xs text-slate-400 italic flex items-center space-x-2">
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              <span>Scanning clinical indices...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* QUICK SUGGESTED PROMPTS */}
      <div className="flex flex-wrap gap-2 py-1 flex-shrink-0">
        {[
          { text: 'Explain MCD Nephrotic Syndrome', query: 'Explain minimal change disease' },
          { text: 'DKA Diagnosis Triad', query: 'Explain DKA diagnostic criteria and management' },
          { text: 'First-Line TB Drugs', query: 'Summarize tuberculosis drugs (HRZE) side effects' },
          { text: 'Review My Week', query: 'How was my week? Review my study logs.' },
          { text: 'Suggest Plan for Tomorrow', query: 'Suggest a plan for tomorrow.' }
        ].map((prompt, index) => (
          <button
            key={index}
            onClick={() => handleQuickPrompt(prompt.query)}
            className="px-3 py-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-650 dark:text-slate-400 rounded-xl text-[10px] font-extrabold flex items-center space-x-1"
          >
            <Sparkles size={10} className="text-teal-500" />
            <span>{prompt.text}</span>
          </button>
        ))}
      </div>

      {/* CHAT INPUT BAR */}
      <form onSubmit={handleSendMessage} className="flex gap-2 flex-shrink-0">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Ask AI viva questions, disease outlines, or drug mechanisms..."
          className="flex-1 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-xs font-semibold focus:ring-2 focus:ring-teal-500 outline-none"
        />
        <button
          type="submit"
          disabled={!inputMessage.trim() || sending}
          className="p-3 bg-teal-500 hover:bg-teal-600 disabled:bg-slate-350 dark:disabled:bg-slate-800 text-white rounded-xl shadow-md transition-all flex items-center justify-center"
        >
          <Send size={16} />
        </button>
      </form>

    </div>
  );
};
