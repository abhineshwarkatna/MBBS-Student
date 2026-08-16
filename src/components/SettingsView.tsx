import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  User, 
  Activity, 
  Sun,
  MoonStar
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    profile,
    theme,
    setTheme,
    updateProfile
  } = useApp();

  // Form states
  const [name, setName] = useState(profile.name);
  const [college, setCollege] = useState(profile.college);
  const [mbbsYear, setMbbsYear] = useState(profile.mbbsYear);
  const [semester, setSemester] = useState(profile.semester);
  
  // Targets States
  const [stepTarget, setStepTarget] = useState(profile.dailyStepTarget);
  const [sleepTarget, setSleepTarget] = useState(profile.sleepTarget);
  const [waterTarget, setWaterTarget] = useState(profile.waterTarget);
  const [studyTarget, setStudyTarget] = useState(profile.dailyStudyTarget);
  const [exerciseTarget, setExerciseTarget] = useState(profile.exerciseTarget || 45);
  const [targetPercentage, setTargetPercentage] = useState(profile.targetPercentage || 75);



  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      name,
      college,
      mbbsYear,
      semester
    });
    alert('👤 Profile details updated successfully.');
  };

  const handleSaveTargets = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      dailyStepTarget: stepTarget,
      sleepTarget: sleepTarget,
      waterTarget: waterTarget,
      dailyStudyTarget: studyTarget,
      exerciseTarget: exerciseTarget,
      targetPercentage: targetPercentage
    });
    alert('🎯 Lifestyle and academic targets updated successfully.');
  };



  return (
    <div className="space-y-6 text-left pb-12">
      
      {/* HEADER BAR */}
      <div className="flex justify-between items-center bg-slate-900/5 dark:bg-slate-900/30 p-6 rounded-3xl border border-slate-200/40 dark:border-slate-800/40">
        <div>
          <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest font-mono">Control Center</span>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">System Settings</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* PROFILE EDITOR */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/50 shadow-md">
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
            <User size={16} />
            Academic Profile
          </h3>
          
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 mb-1.5">Student Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-xs font-semibold outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 mb-1.5">Medical College</label>
              <input
                type="text"
                value={college}
                onChange={(e) => setCollege(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-xs font-semibold outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 mb-1.5">MBBS Year</label>
                <select
                  value={mbbsYear}
                  onChange={(e) => setMbbsYear(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-xs font-bold outline-none"
                >
                  <option value="1st MBBS">1st MBBS</option>
                  <option value="2nd MBBS">2nd MBBS</option>
                  <option value="3rd MBBS">3rd MBBS</option>
                  <option value="Final Year">Final Year</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 mb-1.5">Semester</label>
                <input
                  type="text"
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-xs font-semibold outline-none"
                />
              </div>
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-xs font-bold shadow-sm"
            >
              Update Profile
            </button>
          </form>
        </div>

        {/* TARGETS CONFIGURATION */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/50 shadow-md">
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
            <Activity size={16} />
            Daily Targets
          </h3>
          
          <form onSubmit={handleSaveTargets} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 mb-1.5">Daily Step Target</label>
                <input
                  type="number"
                  value={stepTarget}
                  onChange={(e) => setStepTarget(parseInt(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-100/50 dark:bg-slate-900/50 text-xs font-semibold outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 mb-1.5">Sleep Target (Hours)</label>
                <input
                  type="number"
                  step="0.5"
                  value={sleepTarget}
                  onChange={(e) => setSleepTarget(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-100/50 dark:bg-slate-900/50 text-xs font-semibold outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 mb-1.5">Water Intake (Glasses)</label>
                <input
                  type="number"
                  value={waterTarget}
                  onChange={(e) => setWaterTarget(parseInt(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-100/50 dark:bg-slate-900/50 text-xs font-semibold outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 mb-1.5">Daily Study (Hours)</label>
                <input
                  type="number"
                  step="0.5"
                  value={studyTarget}
                  onChange={(e) => setStudyTarget(parseFloat(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-100/50 dark:bg-slate-900/50 text-xs font-semibold outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 mb-1.5">Daily Exercise (Minutes)</label>
                <input
                  type="number"
                  value={exerciseTarget}
                  onChange={(e) => setExerciseTarget(parseInt(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-100/50 dark:bg-slate-900/50 text-xs font-semibold outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 mb-1.5">Required Attendance (%)</label>
                <input
                  type="number"
                  value={targetPercentage}
                  onChange={(e) => setTargetPercentage(parseInt(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-100/50 dark:bg-slate-900/50 text-xs font-semibold outline-none"
                />
              </div>
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-teal-500 hover:bg-teal-600 text-white rounded-xl text-xs font-bold shadow-sm"
            >
              Update Targets
            </button>
          </form>
        </div>

        {/* SYSTEM MODE SETTINGS */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/50 shadow-md space-y-4">
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-400">Appearance Mode</h3>
          
          <div className="flex bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200/30 dark:border-slate-850 w-max">
            <button
              onClick={() => setTheme('light')}
              className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                theme === 'light' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Sun size={14} />
              <span>Light Mode</span>
            </button>
            <button
              onClick={() => setTheme('dark')}
              className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                theme === 'dark' ? 'bg-slate-950 text-teal-400 shadow-sm border border-slate-800/40' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <MoonStar size={14} />
              <span>Premium Dark</span>
            </button>
          </div>
        </div>



      </div>

    </div>
  );
};
