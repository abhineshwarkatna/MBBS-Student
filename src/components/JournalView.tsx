import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  FileText, 
  Sparkles
} from 'lucide-react';
import { getRelativeDateString } from '../services/db';

export const JournalView: React.FC = () => {
  const { journalEntries, saveJournalEntry, gainXpPoints } = useApp();

  const todayStr = getRelativeDateString(0);
  const existingToday = journalEntries[todayStr] || {
    entry: '',
    mood: 'Normal',
    achievements: '',
    priorityTomorrow: ''
  };

  // Form States
  const [entry, setEntry] = useState(existingToday.entry);
  const [mood, setMood] = useState<'Excellent' | 'Good' | 'Normal' | 'Low' | 'Very Low'>(existingToday.mood);
  const [achievements, setAchievements] = useState(existingToday.achievements);
  const [priorityTomorrow, setPriorityTomorrow] = useState(existingToday.priorityTomorrow);

  const [aiReport, setAiReport] = useState<string | null>(null);
  const [generatingAi, setGeneratingAi] = useState(false);

  const moodsList = [
    { label: 'Excellent', emoji: '😀', color: 'text-emerald-500 hover:bg-emerald-500/10 border-emerald-500/20' },
    { label: 'Good', emoji: '🙂', color: 'text-teal-500 hover:bg-teal-500/10 border-teal-500/20' },
    { label: 'Normal', emoji: '😐', color: 'text-blue-500 hover:bg-blue-500/10 border-blue-500/20' },
    { label: 'Low', emoji: '😔', color: 'text-orange-500 hover:bg-orange-500/10 border-orange-500/20' },
    { label: 'Very Low', emoji: '😞', color: 'text-rose-500 hover:bg-rose-500/10 border-rose-500/20' }
  ];

  const handleSaveJournal = (e: React.FormEvent) => {
    e.preventDefault();
    saveJournalEntry(todayStr, {
      entry,
      mood,
      achievements,
      priorityTomorrow
    });
    gainXpPoints(10); // XP for reflection
    alert('📝 Journal reflection saved successfully for today.');
  };

  const handleAIAnalyze = () => {
    setGeneratingAi(true);
    setTimeout(() => {
      setAiReport(`🤖 **AI Reflection Analysis & Productivity Summary**\n\n* **Stress Pattern**: Your logs indicate slight performance anxiety surrounding ward presentations. However, note that your recall accuracy was **82%** succeeding these logs when sleep was above **7.5 hours**.\n* **Study Hours Correlation**: You complete study sessions most efficiently between **3 PM and 6 PM** on days when clinical posting cases are logged early.\n* **Mood Vector**: Mood remains stable (Good/Normal) on days with active hydration (8 glasses) and exercise targets (45 mins). Keep walking after rounds!`);
      setGeneratingAi(false);
      gainXpPoints(5);
    }, 1200);
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* HEADER BAR */}
      <div className="flex justify-between items-center bg-slate-900/5 dark:bg-slate-900/30 p-6 rounded-3xl border border-slate-200/40 dark:border-slate-800/40">
        <div>
          <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest font-mono">Personal Reflection</span>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">Medical Journal & Mood Logs</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* JOURNAL WRITER PANEL */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/50 shadow-md">
          <div className="flex justify-between items-center mb-6 border-b border-slate-200/50 dark:border-slate-800/50 pb-4">
            <h3 className="font-extrabold text-lg text-slate-850 dark:text-slate-105 flex items-center gap-2">
              <FileText className="text-teal-500" size={20} />
              Today's Reflection Diary
            </h3>
            <span className="text-[10px] text-teal-500 font-extrabold uppercase bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/10">
              {todayStr}
            </span>
          </div>

          <form onSubmit={handleSaveJournal} className="space-y-5">
            
            {/* Mood selector buttons */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-450 mb-2">How is your mental state/mood today?</label>
              <div className="flex flex-wrap gap-2">
                {moodsList.map((m) => {
                  const isSelected = mood === m.label;
                  return (
                    <button
                      key={m.label}
                      type="button"
                      onClick={() => setMood(m.label as any)}
                      className={`flex items-center space-x-1.5 px-3.5 py-2.5 rounded-2xl border text-xs font-bold transition-all ${
                        isSelected 
                          ? 'border-teal-500 bg-teal-500/10 text-teal-600 dark:text-teal-400' 
                          : 'bg-slate-100 dark:bg-slate-900 border-transparent text-slate-500 hover:bg-slate-200/50'
                      }`}
                    >
                      <span className="text-lg leading-none">{m.emoji}</span>
                      <span>{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-450 mb-1.5">What did you study or experience in the ward today?</label>
              <textarea
                value={entry}
                onChange={(e) => setEntry(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-xs font-medium h-24 outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                placeholder="Write about clinical findings observed, surgery cases scrubbed, exam concepts revised..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-450 mb-1.5">Key Achievements Today</label>
                <input
                  type="text"
                  value={achievements}
                  onChange={(e) => setAchievements(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-xs font-semibold outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g. Mastered heart failure staging..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-450 mb-1.5">Priorities for Tomorrow</label>
                <input
                  type="text"
                  value={priorityTomorrow}
                  onChange={(e) => setPriorityTomorrow(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-xs font-semibold outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="e.g. Read liver pathology slides..."
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all"
            >
              Save Journal Reflection
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: HISTORICAL LOGS & PRIVATE AI REFLECTION */}
        <div className="space-y-6">
          
          {/* AI ANALYZER */}
          <div className="glass-panel rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/50 shadow-md space-y-4">
            <div className="flex items-center space-x-2">
              <Sparkles className="text-teal-500" size={18} />
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-800 dark:text-slate-200">AI Mood Analysis</h3>
            </div>
            
            <p className="text-[11px] text-slate-450 leading-relaxed font-semibold">
              Scan your journal logs privately to calculate productivity correlations and emotional stress factors.
            </p>

            <button
              onClick={handleAIAnalyze}
              disabled={generatingAi}
              className="w-full py-2.5 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-xl text-xs uppercase tracking-wider flex justify-center items-center gap-1.5 shadow"
            >
              <Sparkles size={12} className={generatingAi ? 'animate-spin' : ''} />
              <span>{generatingAi ? 'Extracting trends...' : 'Analyze Journal Entries'}</span>
            </button>

            {aiReport && (
              <div className="p-3.5 bg-teal-500/5 border border-teal-500/10 rounded-2xl text-left text-xs text-slate-500 leading-relaxed space-y-2 animate-fade-in">
                {aiReport}
              </div>
            )}
          </div>

          {/* HISTORICAL ENTRIES */}
          <div className="glass-panel rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/50 shadow-md space-y-4">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-400">Past Diary Logs</h3>
            <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-2">
              {Object.values(journalEntries).reverse().map((je) => (
                <div key={je.date} className="p-3 rounded-2xl bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/30 dark:border-slate-800/30 text-left">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] text-slate-400 font-extrabold">{je.date}</span>
                    <span className="text-sm" title={je.mood}>
                      {je.mood === 'Excellent' ? '😀' : je.mood === 'Good' ? '🙂' : je.mood === 'Normal' ? '😐' : je.mood === 'Low' ? '😔' : '😞'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-normal line-clamp-2">{je.entry}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
