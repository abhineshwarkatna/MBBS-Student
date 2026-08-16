import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Sparkles, 
  Plus, 
  Trash2, 
  Check, 
  Clock, 
  AlertCircle, 
  BookOpen, 
  ClipboardList, 
  CheckCircle2,
  CalendarDays,
  X
} from 'lucide-react';
import { getRelativeDateString } from '../services/db';

export const DashboardView: React.FC = () => {
  const {
    profile,
    attendance,
    tasks,
    clinicalPostings,
    healthMetrics,
    focusSessions,
    exams,
    todayScore,
    updateTask,
    addTask,
    deleteTask,
    gainXpPoints
  } = useApp();

  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  
  // State for new task form
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [newCategory, setNewCategory] = useState<'Study' | 'Clinical' | 'Personal' | 'Other'>('Study');
  const [newDuration, setNewDuration] = useState(30);
  const [newTime, setNewTime] = useState('15:00');

  // Greeting based on current time
  const getGreeting = () => {
    const hours = new Date().getHours();
    if (hours < 12) return 'Good Morning';
    if (hours < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  // Format today's date
  const getFormattedDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Get days until main exam (University Finals)
  const getDaysToExam = () => {
    const finalExam = exams.find(e => e.type === 'University');
    if (!finalExam) return null;
    const diff = new Date(finalExam.date).getTime() - new Date().getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return { title: finalExam.title, days };
  };

  const examCountdown = getDaysToExam();

  // Tasks today
  const todayStr = getRelativeDateString(0);
  const todayTasks = tasks.filter(t => t.dueDate === todayStr);
  const completedToday = todayTasks.filter(t => t.isCompleted).length;

  // Active study hours today
  const studyMinsToday = focusSessions
    .filter(fs => fs.date === todayStr)
    .reduce((sum, fs) => sum + fs.duration, 0);
  const studyHoursToday = (studyMinsToday / 60).toFixed(1);

  // Health today
  const todayHealth = healthMetrics.find(m => m.date === todayStr) || {
    steps: 8432,
    sleep: 7.25,
    water: 6,
    calories: 1920
  };

  // Average attendance
  const avgAttendance = attendance.length > 0
    ? Math.round(attendance.reduce((sum, a) => sum + (a.attended / (a.attended + a.missed) * 100), 0) / attendance.length)
    : 80;

  // Clinical Posting active
  const activePosting = clinicalPostings.find(cp => !cp.completed);

  // Circular Score Circle Calculations
  const radius = 60;
  const stroke = 8;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - (todayScore / 100) * circumference;

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addTask({
      title: newTitle,
      description: newDesc,
      dueDate: todayStr,
      dueTime: newTime,
      priority: newPriority,
      category: newCategory,
      durationEst: newDuration,
      isCompleted: false
    });

    gainXpPoints(5); // XP for adding task
    setNewTitle('');
    setNewDesc('');
    setNewPriority('Medium');
    setNewCategory('Study');
    setNewDuration(30);
    setNewTime('15:00');
    setShowAddTaskModal(false);
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 bg-slate-900/5 dark:bg-slate-900/30 p-6 rounded-3xl border border-slate-200/40 dark:border-slate-800/40 backdrop-blur-md">
        <div>
          <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest">
            {profile.college} • {profile.mbbsYear}
          </span>
          <h2 className="text-3xl font-black text-slate-800 dark:text-slate-100 mt-1 flex items-center gap-2">
            {getGreeting()}, {profile.name} 👋
          </h2>
          <p className="text-sm text-slate-400 dark:text-slate-500 font-medium mt-1">
            {getFormattedDate()}
          </p>
        </div>
        
        {/* Streak Counter */}
        <div className="flex items-center space-x-3 bg-gradient-to-r from-orange-500/10 to-rose-500/10 border border-orange-500/20 dark:border-orange-500/30 px-5 py-3 rounded-2xl">
          <span className="text-2xl animate-pulse">🔥</span>
          <div>
            <h4 className="text-sm font-black text-orange-600 dark:text-orange-400">7 Day Study Streak</h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Academic Consistency</p>
          </div>
        </div>
      </div>

      {/* EXAM COUNTDOWN BANNER (EXAM MODE ACTIVATOR) */}
      {examCountdown && examCountdown.days <= 45 && (
        <div className="relative overflow-hidden bg-gradient-to-r from-red-500/15 via-rose-500/15 to-orange-500/15 border border-red-500/20 dark:border-red-500/30 rounded-3xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-2xl pointer-events-none"></div>
          <div>
            <span className="px-2.5 py-1 bg-red-500 text-white font-extrabold text-[10px] rounded-lg tracking-wider uppercase inline-block animate-pulse mb-2">
              🚨 Exam Preparation Mode Active
            </span>
            <h3 className="text-xl font-black text-slate-800 dark:text-slate-100">
              {examCountdown.days} Days Remaining for {examCountdown.title}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              AI suggests prioritizing **Pathology - Glomerular Diseases** and **Pharmacology - ANS drugs** revision.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-400">MCQ Target: 90% Completed</span>
            <div className="w-24 bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="bg-red-500 h-full rounded-full" style={{ width: '90%' }}></div>
            </div>
          </div>
        </div>
      )}

      {/* SCORE AND AI INSIGHT ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CIRCULAR MEDTRACK SCORE CARD */}
        <div className="glass-panel rounded-3xl p-6 flex flex-col items-center justify-center text-center relative border border-slate-200/50 dark:border-slate-800/50 shadow-md">
          <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">
            Today's MedTrack Score
          </h3>
          
          <div className="relative flex items-center justify-center mb-4">
            <svg height={radius * 2} width={radius * 2}>
              <circle
                stroke="rgba(20, 184, 166, 0.1)"
                fill="transparent"
                strokeWidth={stroke}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
              <circle
                stroke="url(#scoreGradient)"
                fill="transparent"
                strokeWidth={stroke}
                strokeDasharray={circumference + ' ' + circumference}
                style={{ strokeDashoffset }}
                strokeLinecap="round"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
                className="transition-all duration-500 -rotate-90 origin-center"
              />
              <defs>
                <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#14b8a6" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute text-center">
              <span className="text-3xl font-black bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent">
                {todayScore}
              </span>
              <span className="text-[10px] text-slate-400 font-bold block leading-none">/ 100</span>
            </div>
          </div>

          <p className="text-xs font-bold text-teal-600 dark:text-teal-400 bg-teal-500/10 border border-teal-500/20 px-3 py-1 rounded-full mb-3">
            Great Study Day!
          </p>
          <p className="text-[11px] text-slate-400 px-4">
            Productivity & health targets are strong today. Average sleep target was missed slightly.
          </p>
        </div>

        {/* AI INSIGHT ENGINE */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/50 flex flex-col justify-between shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Sparkles size={120} className="text-teal-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2 mb-3">
              <span className="p-1.5 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
                <Sparkles size={16} />
              </span>
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-teal-600 dark:text-teal-400">
                AI Diagnostics Insight
              </h3>
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 leading-relaxed">
              "Your study consistency in <span className="text-teal-500">Pathology</span> is high. However, we notice <span className="text-rose-500">Microbiology</span> lectures were missed twice this week, reducing your attendance score to 73.3%. Try attending the next lab session to avoid falling below targets."
            </p>
          </div>
          
          <div className="mt-4 pt-4 border-t border-slate-200/40 dark:border-slate-800/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Tomorrow AI Suggestion</span>
              <p className="text-xs text-slate-500 font-medium">Medicine ward postings at 9:00 AM. Prepare clinical auscultation methods tonight.</p>
            </div>
            <span className="text-[10px] text-teal-500 font-bold bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/15">Normalized sync</span>
          </div>
        </div>

      </div>

      {/* GRID LAYOUT - TODAY'S OVERVIEW TILES */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Core Study progress */}
        <div className="glass-panel p-4 rounded-2xl flex flex-col justify-between h-28 border border-slate-200/40 dark:border-slate-800/40 shadow-sm hover:scale-[1.01] transition-all">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Study Progress</span>
            <BookOpen size={16} className="text-teal-500" />
          </div>
          <div>
            <h4 className="text-2xl font-black text-slate-800 dark:text-slate-100">72%</h4>
            <div className="w-full bg-slate-250 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1.5">
              <div className="bg-teal-500 h-full rounded-full" style={{ width: '72%' }}></div>
            </div>
          </div>
        </div>

        {/* Clinical Postings status */}
        <div className="glass-panel p-4 rounded-2xl flex flex-col justify-between h-28 border border-slate-200/40 dark:border-slate-800/40 shadow-sm hover:scale-[1.01] transition-all">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Clinical Posting</span>
            <ClipboardList size={16} className="text-blue-500" />
          </div>
          <div>
            <h4 className="text-sm font-extrabold truncate text-slate-850 dark:text-slate-100">
              {activePosting ? activePosting.department : 'No Postings'}
            </h4>
            <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">
              {activePosting ? 'Ward 3 • Active' : 'Off-duty'}
            </p>
          </div>
        </div>

        {/* Attendance */}
        <div className="glass-panel p-4 rounded-2xl flex flex-col justify-between h-28 border border-slate-200/40 dark:border-slate-800/40 shadow-sm hover:scale-[1.01] transition-all">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Attendance</span>
            <AlertCircle size={16} className={avgAttendance < 75 ? 'text-rose-500' : 'text-emerald-500'} />
          </div>
          <div>
            <h4 className={`text-2xl font-black ${avgAttendance < 75 ? 'text-rose-500' : 'text-slate-800 dark:text-slate-100'}`}>
              {avgAttendance}%
            </h4>
            <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">
              Target Required: 75%
            </p>
          </div>
        </div>

        {/* Focus Study Hours */}
        <div className="glass-panel p-4 rounded-2xl flex flex-col justify-between h-28 border border-slate-200/40 dark:border-slate-800/40 shadow-sm hover:scale-[1.01] transition-all">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Focus Study</span>
            <Clock size={16} className="text-indigo-500" />
          </div>
          <div>
            <h4 className="text-2xl font-black text-slate-800 dark:text-slate-100">
              {studyHoursToday}h
            </h4>
            <p className="text-[10px] text-slate-400 font-bold mt-1 uppercase tracking-widest">
              Daily Target: {profile.dailyStudyTarget}h
            </p>
          </div>
        </div>

      </div>

      {/* SPLIT ROW: SCHEDULE & TASK LIST */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* TODAY'S TIMELINE ("MY DAY") */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/50 shadow-md">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-2">
              <CalendarDays className="text-teal-500" size={20} />
              <h3 className="font-extrabold text-lg text-slate-800 dark:text-slate-100">
                My Day Timeline
              </h3>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              AI Synchronized
            </span>
          </div>

          <div className="space-y-4 max-h-[380px] overflow-y-auto pr-2">
            {[
              { time: '06:00', title: '🌅 Wake Up', status: 'Completed', notes: 'Logged early rise before 6:30.' },
              { time: '07:00', title: '🏃 Morning Walk', status: 'Completed', notes: 'Completed 30 mins cardiovascular exercise.' },
              { time: '09:00', title: '🩺 Medicine Posting', status: 'Completed', notes: 'Male Ward 3. Presented Rheumatic Heart Disease case.' },
              { time: '13:00', title: '🍴 Lunch Break', status: 'Completed', notes: 'Hydration goal maintained.' },
              { time: '15:00', title: '📚 Pathology Study', status: 'Completed', notes: 'Read Minimal Change Disease pathology details.' },
              { time: '17:00', title: '☕ Brief Rest', status: 'Completed', notes: '20 minutes break.' },
              { time: '18:00', title: '🧠 MCQ Practice', status: 'Pending', notes: '15 questions in Pathology Glomerular Diseases due.' },
              { time: '20:00', title: '📖 Pharmacology Revision', status: 'Pending', notes: 'Revise autonomic nervous system adrenergic receptors.' },
              { time: '22:00', title: '📝 Daily Logbook Review', status: 'Pending', notes: 'Write reflection journal diary entries.' },
              { time: '23:00', title: '😴 Bedtime Sleep', status: 'Pending', notes: 'Target duration: 7.5 hours.' }
            ].map((slot, index) => {
              const isCompleted = slot.status === 'Completed';
              return (
                <div key={index} className="flex space-x-4 items-start relative group">
                  
                  {/* Timeline connector line */}
                  {index < 9 && (
                    <div className="absolute top-8 left-3.5 bottom-[-24px] w-0.5 bg-slate-200 dark:bg-slate-800 pointer-events-none"></div>
                  )}

                  {/* Icon Node */}
                  <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 z-10 ${
                    isCompleted 
                      ? 'bg-teal-500/10 border-teal-500 text-teal-600 dark:text-teal-400' 
                      : 'bg-slate-100 dark:bg-slate-900 border-slate-350 dark:border-slate-850 text-slate-400'
                  }`}>
                    {isCompleted ? <Check size={14} strokeWidth={3} /> : <Clock size={14} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-400 tracking-wider">
                        {slot.time}
                      </span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
                        isCompleted ? 'bg-teal-500/10 text-teal-600' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                      }`}>
                        {slot.status}
                      </span>
                    </div>
                    <h4 className={`text-sm font-bold mt-0.5 ${isCompleted ? 'text-slate-800 dark:text-slate-200' : 'text-slate-600 dark:text-slate-400'}`}>
                      {slot.title}
                    </h4>
                    {slot.notes && (
                      <p className="text-xs text-slate-400 mt-0.5 leading-relaxed truncate">
                        {slot.notes}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* TODAY'S TASKS LIST */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/50 shadow-md flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="text-teal-500" size={20} />
                <h3 className="font-extrabold text-lg text-slate-800 dark:text-slate-100">
                  Today's Tasks ({completedToday} / {todayTasks.length})
                </h3>
              </div>
              <button
                onClick={() => setShowAddTaskModal(true)}
                className="p-1.5 rounded-lg bg-teal-500 hover:bg-teal-600 text-white shadow-sm transition-all"
                title="Add Task"
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Task list render */}
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
              {todayTasks.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <CheckCircle2 size={32} className="mx-auto mb-2 text-slate-300 opacity-60" />
                  <p className="text-xs">No tasks scheduled for today.</p>
                  <p className="text-[10px] italic">You've completed everything! 🎉</p>
                </div>
              ) : (
                todayTasks.map((t) => (
                  <div
                    key={t.id}
                    className={`flex items-start justify-between p-3.5 rounded-2xl border transition-all ${
                      t.isCompleted
                        ? 'border-slate-200/50 dark:border-slate-800/30 bg-slate-100/20 dark:bg-slate-900/10 opacity-70'
                        : 'border-slate-200 dark:border-slate-850 bg-white dark:bg-slate-900/60 shadow-sm'
                    }`}
                  >
                    <div className="flex items-start space-x-3 min-w-0">
                      <button
                        onClick={() => updateTask({ ...t, isCompleted: !t.isCompleted })}
                        className={`w-5 h-5 rounded-md border flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                          t.isCompleted
                            ? 'bg-teal-500 border-teal-500 text-white'
                            : 'border-slate-350 dark:border-slate-700 bg-transparent'
                        }`}
                      >
                        {t.isCompleted && <Check size={12} strokeWidth={3} />}
                      </button>
                      <div className="min-w-0">
                        <h4 className={`text-xs font-bold leading-tight truncate ${t.isCompleted ? 'line-through text-slate-400' : 'text-slate-800 dark:text-slate-100'}`}>
                          {t.title}
                        </h4>
                        <p className="text-[10px] text-slate-400 truncate mt-0.5">{t.description}</p>
                        <div className="flex items-center space-x-2 mt-1.5">
                          <span className={`px-2 py-0.5 rounded text-[8px] font-extrabold uppercase ${
                            t.priority === 'High' 
                              ? 'bg-red-500/10 text-red-500' 
                              : t.priority === 'Medium' 
                                ? 'bg-orange-500/10 text-orange-500' 
                                : 'bg-emerald-500/10 text-emerald-500'
                          }`}>
                            {t.priority} Priority
                          </span>
                          <span className="text-[9px] text-slate-400 font-bold">{t.durationEst}m</span>
                          {t.dueTime && (
                            <span className="text-[9px] text-teal-500 bg-teal-500/5 px-1.5 py-0.2 rounded font-bold border border-teal-500/10">
                              {t.dueTime}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteTask(t.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/5 transition-all"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Core metrics quick sync */}
          <div className="mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-800/50 grid grid-cols-3 gap-2 text-center">
            <div className="bg-slate-100/60 dark:bg-slate-900/50 border border-slate-200/30 dark:border-slate-800/30 rounded-xl p-2">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block">Steps today</span>
              <span className="text-sm font-black text-teal-500">{todayHealth.steps.toLocaleString()}</span>
            </div>
            <div className="bg-slate-100/60 dark:bg-slate-900/50 border border-slate-200/30 dark:border-slate-800/30 rounded-xl p-2">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block">Sleep Duration</span>
              <span className="text-sm font-black text-blue-500">{todayHealth.sleep}h</span>
            </div>
            <div className="bg-slate-100/60 dark:bg-slate-900/50 border border-slate-200/30 dark:border-slate-800/30 rounded-xl p-2">
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block">Water logged</span>
              <span className="text-sm font-black text-indigo-500">{todayHealth.water} / 8</span>
            </div>
          </div>
        </div>

      </div>

      {/* ADD TASK MODAL OVERLAY */}
      {showAddTaskModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel max-w-md w-full rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-150">Create Today's Task</h3>
              <button 
                onClick={() => setShowAddTaskModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Task Title</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-sm font-medium outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Review pathology slides, prep ward cases..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Description</label>
                <input
                  type="text"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-sm font-medium outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Notes, study codes..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-xs font-bold"
                  >
                    <option value="High">🔴 High</option>
                    <option value="Medium">🟠 Medium</option>
                    <option value="Low">🟢 Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-xs font-bold"
                  >
                    <option value="Study">📚 Study</option>
                    <option value="Clinical">🩺 Clinical</option>
                    <option value="Personal">🏃 Personal</option>
                    <option value="Other">⚙️ Other</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Due Time</label>
                  <input
                    type="time"
                    value={newTime}
                    onChange={(e) => setNewTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Duration (mins)</label>
                  <input
                    type="number"
                    value={newDuration}
                    onChange={(e) => setNewDuration(parseInt(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-xs font-bold"
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white text-xs font-black shadow-md hover:shadow-lg transition-all"
              >
                Schedule Task
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
