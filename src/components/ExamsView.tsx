import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Plus, 
  Trash2, 
  CheckCircle, 
  RotateCcw,
  Sparkles
} from 'lucide-react';

export const ExamsView: React.FC = () => {
  const {
    exams,
    revisionQueue,
    subjects,
    addExam,
    deleteExam,
    updateRevisionItem
  } = useApp();

  const [showAddExamModal, setShowAddExamModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newType, setNewType] = useState<'University' | 'Internal' | 'Practical' | 'Viva' | 'NEET-PG'>('Internal');

  const getDaysDiff = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const handleCreateExam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDate) return;

    addExam({
      title: newTitle,
      date: newDate,
      type: newType
    });

    setNewTitle('');
    setNewDate('');
    setNewType('Internal');
    setShowAddExamModal(false);
  };

  const getUrgencyColor = (days: number) => {
    if (days <= 7) return 'from-red-500/10 to-rose-500/10 border-red-500/30 text-red-600 dark:text-red-400';
    if (days <= 20) return 'from-orange-500/10 to-amber-500/10 border-orange-500/30 text-orange-600 dark:text-orange-400';
    return 'from-teal-500/10 to-blue-500/10 border-teal-500/30 text-teal-600 dark:text-teal-400';
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* HEADER BAR */}
      <div className="flex justify-between items-center bg-slate-900/5 dark:bg-slate-900/30 p-6 rounded-3xl border border-slate-200/40 dark:border-slate-800/40">
        <div>
          <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest font-mono">Academic Timelines</span>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">Exams & Spaced-Repetition Queue</h2>
        </div>
        <button
          onClick={() => setShowAddExamModal(true)}
          className="flex items-center space-x-2 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2.5 rounded-xl font-bold shadow-md shadow-teal-500/10 transition-all text-xs"
        >
          <Plus size={14} />
          <span>Add Exam Date</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: EXAM COUNTDOWNS */}
        <div className="lg:col-span-1 space-y-4">
          <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">
            Exam Countdown Timelines
          </h3>
          <div className="space-y-3">
            {exams.map((ex) => {
              const daysLeft = getDaysDiff(ex.date);
              const isOver = daysLeft < 0;
              return (
                <div 
                  key={ex.id}
                  className={`p-5 rounded-2xl border bg-gradient-to-br transition-all flex flex-col justify-between h-40 shadow-sm relative ${
                    isOver 
                      ? 'from-slate-200/20 to-slate-300/20 border-slate-200 dark:border-slate-800 text-slate-400'
                      : getUrgencyColor(daysLeft)
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-white dark:bg-slate-900 shadow-sm border border-slate-200/50 dark:border-slate-800/50">
                        {ex.type}
                      </span>
                      <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-100 mt-2 truncate w-44">
                        {ex.title}
                      </h4>
                      <p className="text-[10px] text-slate-400 mt-1 font-bold">Date: {ex.date}</p>
                    </div>
                    
                    <button
                      onClick={() => deleteExam(ex.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/5"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>

                  <div className="flex justify-between items-end mt-4">
                    <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest">Countdown</span>
                    <h5 className="text-3xl font-black tracking-tight leading-none">
                      {isOver ? 'Past' : `${daysLeft}d`}
                    </h5>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: SPACED REPETITION QUEUE */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">
            Spaced Repetition Revision Queue
          </h3>
          <div className="glass-panel rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/50 shadow-md">
            <div className="flex items-center space-x-2 border-b border-slate-200/50 dark:border-slate-800/50 pb-4 mb-4">
              <RotateCcw className="text-teal-500" size={18} />
              <div>
                <h4 className="font-black text-sm text-slate-800 dark:text-slate-200">Active Leitner Revision Intervals</h4>
                <p className="text-[10px] text-slate-400">Marking items revised updates recall vectors and sets future intervals.</p>
              </div>
            </div>

            {/* List of Revision items */}
            <div className="space-y-3.5 max-h-[350px] overflow-y-auto pr-2">
              {revisionQueue.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <CheckCircle size={36} className="mx-auto mb-2 text-emerald-500/60" />
                  <p className="text-xs font-bold">No revision items pending today.</p>
                  <p className="text-[10px] italic">You're fully up to date! 🎉</p>
                </div>
              ) : (
                revisionQueue.map((item) => {
                  const subjectName = subjects.find(s => s.id === item.subjectId)?.name || 'Pathology';
                  const isDue = new Date(item.dueDate).getTime() <= new Date().getTime();
                  return (
                    <div 
                      key={item.id}
                      className={`flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border transition-all gap-4 ${
                        isDue 
                          ? 'border-rose-500/25 bg-rose-500/[0.01]' 
                          : 'border-slate-200 dark:border-slate-850 bg-white/40 dark:bg-slate-900/40'
                      }`}
                    >
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-teal-500/10 text-teal-600 border border-teal-500/15">
                            {subjectName}
                          </span>
                          <span className="text-[9px] text-slate-400 font-bold">Stage {item.stage}</span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1">{item.topicName}</h4>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`text-[9px] font-bold ${isDue ? 'text-rose-500' : 'text-slate-400'}`}>
                            Due: {item.dueDate} {isDue && '(Due Today)'}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {item.status !== 'Revised' && (
                          <button
                            onClick={() => updateRevisionItem(item.id, 'Revised', 1)}
                            className="flex items-center space-x-1 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white font-bold text-[10px] px-3.5 py-1.5 rounded-lg shadow-sm"
                          >
                            <Sparkles size={10} />
                            <span>Mark Revised</span>
                          </button>
                        )}
                        <span className={`px-2 py-0.5 text-[9px] font-extrabold uppercase rounded ${
                          item.status === 'Needs Revision' 
                            ? 'bg-rose-500/10 text-rose-500' 
                            : item.status === 'Due Soon' 
                              ? 'bg-orange-500/10 text-orange-500' 
                              : 'bg-emerald-500/10 text-emerald-500'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        </div>

      </div>

      {/* ADD EXAM MODAL */}
      {showAddExamModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel max-w-md w-full rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-150">Add Exam Countdown</h3>
              <button 
                onClick={() => setShowAddExamModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Plus size={18} className="rotate-45" />
              </button>
            </div>
            <form onSubmit={handleCreateExam} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Exam Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-sm font-medium outline-none"
                  placeholder="e.g. Pathology Block, Viva, Internal Test..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Exam Date</label>
                  <input
                    type="date"
                    required
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Exam Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-xs font-bold"
                  >
                    <option value="University">🏛️ University Finals</option>
                    <option value="Internal">📝 Internal Test</option>
                    <option value="Practical">🧪 Practical Spotters</option>
                    <option value="Viva">🎤 Viva Voce</option>
                    <option value="NEET-PG">🎯 NEET-PG Prep</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white text-xs font-black shadow-md hover:shadow-lg transition-all"
              >
                Schedule Exam
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
