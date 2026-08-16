import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Award, 
  Sunrise, 
  BookOpen, 
  BrainCircuit, 
  ClipboardList, 
  Droplet, 
  Flame,
  Lock
} from 'lucide-react';

export const AchievementsView: React.FC = () => {
  const { profile } = useApp();

  const badgeIcons: Record<string, any> = {
    'Sunrise': Sunrise,
    'BookOpen': BookOpen,
    'BrainCircuit': BrainCircuit,
    'ClipboardList': ClipboardList,
    'Droplet': Droplet,
    'Flame': Flame
  };

  const allBadges = [
    { id: 'b1', name: 'Early Bird', description: 'Log wake-up time before 6:30 AM.', icon: 'Sunrise' },
    { id: 'b2', name: 'Dedicated Learner', description: 'Log a total of 25 study hours.', icon: 'BookOpen' },
    { id: 'b3', name: 'MCQ Specialist', description: 'Achieve >85% accuracy in a quiz of 10+ questions.', icon: 'BrainCircuit' },
    { id: 'b4', name: 'Clinical Observer', description: 'Log 5 distinct clinical cases in the case book.', icon: 'ClipboardList' },
    { id: 'b5', name: 'Hydration Champion', description: 'Meet daily water goals 5 days in a row.', icon: 'Droplet' },
    { id: 'b6', name: 'Streak Master', description: 'Maintain a 7-day study schedule streak.', icon: 'Flame' }
  ];

  // XP Progress Calculations
  const xpInCurrentLevel = profile.xp % 100;
  const levelProgressPercent = xpInCurrentLevel;

  const getRankName = (lvl: number) => {
    if (lvl < 3) return 'Beginner Medical Student';
    if (lvl < 7) return 'Consistent Learner';
    if (lvl < 15) return 'Dedicated Clinical Scholar';
    return 'Academic Performer';
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* HEADER BAR */}
      <div className="flex justify-between items-center bg-slate-900/5 dark:bg-slate-900/30 p-6 rounded-3xl border border-slate-200/40 dark:border-slate-800/40">
        <div>
          <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest font-mono">Gamified Milestones</span>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">XP Progression & Achievements</h2>
        </div>
      </div>

      {/* XP LEVEL SUMMARY CARD */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/50 shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-400 to-indigo-500 text-white flex items-center justify-center font-black text-2xl shadow-lg">
            {profile.level}
          </div>
          <div>
            <span className="text-[10px] text-teal-500 font-extrabold uppercase tracking-widest block">Current Rank</span>
            <h3 className="text-xl font-black text-slate-800 dark:text-slate-100 mt-0.5">
              {getRankName(profile.level)}
            </h3>
            <p className="text-xs text-slate-400 font-medium">Total XP: {profile.xp} Points</p>
          </div>
        </div>

        {/* Level XP progress slider */}
        <div className="flex-1 md:max-w-md space-y-2">
          <div className="flex justify-between text-xs font-bold text-slate-450">
            <span>Progress to Level {profile.level + 1}</span>
            <span>{xpInCurrentLevel} / 100 XP</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-850 h-3 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-teal-500 to-indigo-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${levelProgressPercent}%` }}
            ></div>
          </div>
          <span className="text-[10px] text-slate-400 italic block pl-1">
            *Gain XP by completing daily tasks (+10 XP), syllabus topics (+20 XP), and Pomodoro blocks (+10 XP).
          </span>
        </div>
      </div>

      {/* BADGES GRID BOX */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">
          MBBS Student Badges
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {allBadges.map((badge) => {
            const unlockedInfo = profile.badges.find(b => b.id === badge.id);
            const isUnlocked = !!unlockedInfo;
            const IconComponent = badgeIcons[badge.icon] || Award;
            
            return (
              <div 
                key={badge.id}
                className={`p-5 rounded-3xl border transition-all flex items-start space-x-4 shadow-sm relative ${
                  isUnlocked 
                    ? 'border-purple-500/25 bg-gradient-to-br from-purple-500/[0.03] to-indigo-500/[0.03]' 
                    : 'border-slate-200 dark:border-slate-850 bg-white/40 dark:bg-slate-900/30 opacity-60'
                }`}
              >
                {/* Badge Icon circle */}
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 shadow ${
                  isUnlocked 
                    ? 'bg-gradient-to-tr from-purple-500 to-indigo-500 text-white' 
                    : 'bg-slate-100 dark:bg-slate-900 text-slate-400'
                }`}>
                  {isUnlocked ? <IconComponent size={24} /> : <Lock size={18} />}
                </div>

                <div className="min-w-0">
                  <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 truncate">{badge.name}</h4>
                  <p className="text-[11px] text-slate-400 leading-normal mt-0.5">{badge.description}</p>
                  
                  {isUnlocked && (
                    <span className="text-[9px] text-purple-500 bg-purple-500/5 px-2 py-0.5 rounded border border-purple-500/10 font-bold block mt-2 w-max">
                      Unlocked: {unlockedInfo.unlockedAt}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
