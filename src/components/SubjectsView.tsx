import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Plus, 
  Sparkles, 
  CalendarDays
} from 'lucide-react';
import type { SyllabusTopic } from '../types';

export const SubjectsView: React.FC = () => {
  const {
    subjects,
    syllabus,
    addSubject,
    updateSyllabusTopic,
    gainXpPoints
  } = useApp();

  const [activeSubjectId, setActiveSubjectId] = useState<string>('sub-path');
  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  
  // New Subject Form
  const [newSubName, setNewSubName] = useState('');
  const [newSubWeight, setNewSubWeight] = useState<'High' | 'Medium' | 'Low'>('High');

  // Study Planner States
  const [plannerDifficulty, setPlannerDifficulty] = useState<'High' | 'Moderate' | 'Low'>('Moderate');
  const [plannerHours, setPlannerHours] = useState(4.5);
  const [generatedSchedule, setGeneratedSchedule] = useState<{ time: string; topic: string; details: string }[] | null>(null);
  const [generatingPlanner, setGeneratingPlanner] = useState(false);

  const activeSubject = subjects.find(s => s.id === activeSubjectId) || subjects[0];
  const activeSyllabus = syllabus.filter(t => t.subjectId === activeSubjectId);

  const handleAddSubjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubName.trim()) return;

    addSubject({
      name: newSubName,
      examWeight: newSubWeight
    });

    setNewSubName('');
    setShowAddSubjectModal(false);
  };

  const getStatusColor = (status: SyllabusTopic['status']) => {
    switch (status) {
      case 'Completed': return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20';
      case 'Revised': return 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20';
      case 'Learning': return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'Needs Revision': return 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20';
      default: return 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-200 dark:border-slate-800';
    }
  };

  const handleGeneratePlanner = () => {
    setGeneratingPlanner(true);
    setTimeout(() => {
      // Generate standard medical study schedule based on inputs
      const schedule = [
        { time: '08:00 AM - 09:30 AM', topic: `${activeSubject?.name || 'Pathology'} Core Concepts`, details: 'Read high-yield clinical features and pathophysiology logs.' },
        { time: '10:30 AM - 12:00 PM', topic: `Syllabus Revision Session`, details: 'Spaced repetition revision of flagged topics.' },
        { time: '04:00 PM - 05:00 PM', topic: 'MCQ Practice & Review', details: 'Solve 15-20 practice questions on study units.' },
        { time: '07:30 PM - 08:30 PM', topic: 'Flashcard Drills', details: 'Review Leitner Box items and test recall speed.' }
      ];
      setGeneratedSchedule(schedule);
      setGeneratingPlanner(false);
      gainXpPoints(10); // Reward for using planner
    }, 1200);
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* HEADER BAR */}
      <div className="flex justify-between items-center bg-slate-900/5 dark:bg-slate-900/30 p-6 rounded-3xl border border-slate-200/40 dark:border-slate-800/40">
        <div>
          <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest">Syllabus Tracker</span>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">Subjects & Curriculum</h2>
        </div>
        <button
          onClick={() => setShowAddSubjectModal(true)}
          className="flex items-center space-x-2 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2.5 rounded-xl font-bold shadow-md shadow-teal-500/10 transition-all text-sm"
        >
          <Plus size={16} />
          <span>Add Subject</span>
        </button>
      </div>

      {/* MAIN LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: SUBJECTS GRID */}
        <div className="space-y-4">
          <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">
            Subject Course List
          </h3>
          <div className="space-y-3">
            {subjects.map((sub) => {
              const isSelected = sub.id === activeSubjectId;
              return (
                <button
                  key={sub.id}
                  onClick={() => setActiveSubjectId(sub.id)}
                  className={`w-full p-4 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? 'border-teal-500 bg-teal-500/5 shadow-md shadow-teal-500/5'
                      : 'border-slate-200 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-900/40 bg-white dark:bg-slate-900/60'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-extrabold text-slate-800 dark:text-slate-200">{sub.name}</h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-1.5 py-0.2 rounded text-[9px] font-extrabold ${
                          sub.examWeight === 'High' 
                            ? 'bg-red-500/15 text-red-500' 
                            : sub.examWeight === 'Medium' 
                              ? 'bg-orange-500/15 text-orange-500' 
                              : 'bg-emerald-500/15 text-emerald-500'
                        }`}>
                          {sub.examWeight} Weight
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold">{sub.studyHours}h Studied</span>
                      </div>
                    </div>
                    <span className="text-lg font-black text-teal-500">{sub.progress}%</span>
                  </div>

                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-3">
                    <div 
                      className="bg-gradient-to-r from-teal-500 to-blue-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${sub.progress}%` }}
                    ></div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMNS: SYLLABUS CHECKLIST & STUDY PLANNER */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* SYLLABUS TOPIC CHECKLIST */}
          <div className="glass-panel rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/50 shadow-md">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center border-b border-slate-200/50 dark:border-slate-800/50 pb-4 mb-4 gap-2">
              <div>
                <h3 className="font-black text-lg text-slate-850 dark:text-slate-100">
                  {activeSubject ? activeSubject.name : 'Syllabus topics'} Curriculum
                </h3>
                <p className="text-xs text-slate-400">Click to log completed units and spaced repetition updates.</p>
              </div>
              <span className="text-xs font-bold text-teal-500 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/15">
                {activeSyllabus.filter(t => t.status === 'Completed' || t.status === 'Revised').length} / {activeSyllabus.length} Completed
              </span>
            </div>

            {/* List of syllabus topics */}
            <div className="space-y-3.5 max-h-[300px] overflow-y-auto pr-2">
              {activeSyllabus.length === 0 ? (
                <p className="text-center text-xs py-8 text-slate-400 italic">No syllabus topics pre-seeded for this subject. Use onboarding timetable or settings to add.</p>
              ) : (
                activeSyllabus.map((topic) => (
                  <div 
                    key={topic.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl border border-slate-200 dark:border-slate-850 bg-white/50 dark:bg-slate-900/40 gap-3"
                  >
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">{topic.unit}</span>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-150 truncate mt-0.5">{topic.name}</h4>
                      {topic.lastStudied && (
                        <p className="text-[9px] text-slate-400 font-medium mt-0.5">Last Studied: {topic.lastStudied}</p>
                      )}
                    </div>
                    
                    {/* Status selection buttons */}
                    <div className="flex flex-wrap gap-1.5">
                      {(['Learning', 'Completed', 'Revised', 'Needs Revision'] as const).map((status) => {
                        const isActive = topic.status === status;
                        return (
                          <button
                            key={status}
                            onClick={() => updateSyllabusTopic(topic.id, status)}
                            className={`px-2.5 py-1 text-[9px] font-extrabold uppercase rounded-lg border transition-all ${
                              isActive 
                                ? getStatusColor(status) + ' border-teal-500/30' 
                                : 'bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-500 border-transparent hover:bg-slate-200/50 dark:hover:bg-slate-850'
                            }`}
                          >
                            {status === 'Revised' ? '🔄 Revised' : status === 'Needs Revision' ? '⚠️ Due' : status}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* SMART STUDY PLANNER */}
          <div className="glass-panel rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/50 shadow-md">
            <div className="flex items-center space-x-2 mb-4">
              <Sparkles className="text-teal-500" size={20} />
              <h3 className="font-extrabold text-lg text-slate-800 dark:text-slate-100">
                SMART Study Planner
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Target Difficulty</label>
                <select
                  value={plannerDifficulty}
                  onChange={(e) => setPlannerDifficulty(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-xs font-bold outline-none focus:ring-2 focus:ring-teal-500"
                >
                  <option value="High">🔴 High Priority (Tough topics first)</option>
                  <option value="Moderate">🟠 Moderate Focus (Mixed balance)</option>
                  <option value="Low">🟢 Low Load (Quick reviews)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Study Window (Hours)</label>
                <input
                  type="number"
                  step="0.5"
                  value={plannerHours}
                  onChange={(e) => setPlannerHours(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-xs font-bold outline-none"
                />
              </div>
            </div>

            <button
              onClick={handleGeneratePlanner}
              disabled={generatingPlanner}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-teal-500 to-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-md hover:scale-[1.01] hover:shadow-lg transition-all flex justify-center items-center gap-2"
            >
              <Sparkles size={14} className={generatingPlanner ? 'animate-spin' : ''} />
              <span>{generatingPlanner ? 'Analyzing syllabus gaps...' : 'Generate Plan'}</span>
            </button>

            {/* Generated schedule slot render */}
            {generatedSchedule && (
              <div className="mt-5 p-4 rounded-2xl bg-teal-500/5 border border-teal-500/10 space-y-3.5 animate-fade-in text-left">
                <h4 className="font-extrabold text-sm text-teal-600 dark:text-teal-400 flex items-center gap-1.5">
                  <CalendarDays size={16} />
                  Recommended Today's Study Blocks
                </h4>
                <div className="space-y-3">
                  {generatedSchedule.map((slot, index) => (
                    <div key={index} className="flex justify-between items-start gap-4 border-b border-slate-200/20 last:border-0 pb-2.5 last:pb-0">
                      <div>
                        <span className="text-[10px] text-teal-500 font-bold bg-teal-500/5 px-2 py-0.5 rounded border border-teal-500/10">
                          {slot.time}
                        </span>
                        <h5 className="font-extrabold text-xs text-slate-800 dark:text-slate-250 mt-1">{slot.topic}</h5>
                        <p className="text-[11px] text-slate-400 mt-0.5">{slot.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* ADD SUBJECT MODAL OVERLAY */}
      {showAddSubjectModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel max-w-md w-full rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-150">Add MBBS Course Subject</h3>
              <button 
                onClick={() => setShowAddSubjectModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Plus size={18} className="rotate-45" />
              </button>
            </div>
            <form onSubmit={handleAddSubjectSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Subject Name</label>
                <input
                  type="text"
                  required
                  value={newSubName}
                  onChange={(e) => setNewSubName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-sm font-medium outline-none"
                  placeholder="e.g. Pediatrics, Surgery..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Exam weight</label>
                <select
                  value={newSubWeight}
                  onChange={(e) => setNewSubWeight(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-xs font-bold"
                >
                  <option value="High">🔴 High Weight (Major subject)</option>
                  <option value="Medium">🟠 Medium Weight (Clinical elective)</option>
                  <option value="Low">🟢 Low Weight (Short subject)</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white text-xs font-black shadow-md hover:shadow-lg transition-all"
              >
                Create Subject
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
