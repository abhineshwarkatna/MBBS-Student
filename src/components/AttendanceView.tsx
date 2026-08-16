import React from 'react';
import { useApp } from '../context/AppContext';
import { 
  Plus, 
  Minus, 
  AlertTriangle
} from 'lucide-react';

export const AttendanceView: React.FC = () => {
  const { attendance, updateAttendance, gainXpPoints } = useApp();

  const handleAdjustAttendance = (id: string, field: 'attended' | 'missed', action: 'inc' | 'dec') => {
    const record = attendance.find(r => r.id === id);
    if (!record) return;

    let newVal = field === 'attended' ? record.attended : record.missed;
    if (action === 'inc') newVal += 1;
    if (action === 'dec') newVal = Math.max(0, newVal - 1);

    updateAttendance({
      ...record,
      [field]: newVal
    });

    if (action === 'inc') {
      gainXpPoints(2); // minor XP for logging attendance
    }
  };

  // Calculations for projection helper
  const getAttendanceStats = (attended: number, missed: number, requiredPercent: number) => {
    const total = attended + missed;
    const currentPercent = total > 0 ? (attended / total) * 100 : 0;
    const meetsTarget = currentPercent >= requiredPercent;

    let helperText = '';
    let statusColor = 'text-slate-800 dark:text-slate-200';

    if (total === 0) {
      helperText = 'No lectures logged yet.';
      return { currentPercent: 0, meetsTarget: true, helperText, statusColor };
    }

    if (meetsTarget) {
      // Calculate how many classes the student can safely miss
      // (attended) / (total + x) >= reqPercent/100
      // attended * 100 >= reqPercent * (total + x)
      // (attended * 100) / reqPercent >= total + x
      // x <= (attended * 100 / reqPercent) - total
      const maxMissable = Math.floor((attended * 100 / requiredPercent) - total);
      if (maxMissable > 0) {
        helperText = `You can safely miss the next ${maxMissable} classes while maintaining your target.`;
      } else {
        helperText = 'You are exactly on target. Do not miss the next lecture.';
      }
      statusColor = 'text-emerald-500';
    } else {
      // Calculate how many consecutive classes to attend to reach target
      // (attended + y) / (total + y) >= reqPercent/100
      // (attended + y) * 100 >= reqPercent * (total + y)
      // 100*attended + 100*y >= reqPercent*total + reqPercent*y
      // (100 - reqPercent) * y >= reqPercent*total - 100*attended
      // y >= (reqPercent * total - 100 * attended) / (100 - reqPercent)
      const numerator = (requiredPercent * total) - (100 * attended);
      const denominator = 100 - requiredPercent;
      const classesNeeded = Math.ceil(numerator / denominator);
      helperText = `⚠️ Attend the next ${classesNeeded} consecutive lectures to reach your ${requiredPercent}% target.`;
      statusColor = 'text-rose-500';
    }

    return {
      currentPercent: parseFloat(currentPercent.toFixed(1)),
      meetsTarget,
      helperText,
      statusColor
    };
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* HEADER BAR */}
      <div className="flex justify-between items-center bg-slate-900/5 dark:bg-slate-900/30 p-6 rounded-3xl border border-slate-200/40 dark:border-slate-800/40">
        <div>
          <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest font-mono">Academic Eligibility</span>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">Attendance Tracker</h2>
        </div>
      </div>

      {/* TRACKER GRIDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {attendance.map((rec) => {
          const stats = getAttendanceStats(rec.attended, rec.missed, rec.requiredPercent);
          return (
            <div 
              key={rec.id} 
              className={`glass-panel rounded-3xl p-6 border transition-all flex flex-col justify-between h-72 shadow-md ${
                !stats.meetsTarget 
                  ? 'border-rose-500/25 bg-rose-500/[0.02] shadow-rose-500/[0.02]' 
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60'
              }`}
            >
              <div>
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="font-extrabold text-lg text-slate-800 dark:text-slate-200">{rec.subjectName}</h3>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Required Target: {rec.requiredPercent}%</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-3xl font-black ${stats.statusColor}`}>
                      {stats.currentPercent}%
                    </span>
                    <span className="text-xs text-slate-450 block font-semibold">
                      {rec.attended} / {rec.attended + rec.missed} Classes
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden mb-5">
                  <div 
                    className={`h-full rounded-full transition-all duration-300 ${
                      stats.meetsTarget ? 'bg-gradient-to-r from-teal-500 to-emerald-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(100, stats.currentPercent)}%` }}
                  ></div>
                </div>

                {/* Adjuster controls */}
                <div className="flex justify-between items-center bg-slate-50 dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Attended:</span>
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => handleAdjustAttendance(rec.id, 'attended', 'dec')}
                        className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-650 dark:text-slate-350 hover:bg-slate-300 dark:hover:bg-slate-700 font-bold"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-xs font-extrabold text-slate-700 dark:text-slate-350 w-6 text-center">{rec.attended}</span>
                      <button
                        onClick={() => handleAdjustAttendance(rec.id, 'attended', 'inc')}
                        className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-650 dark:text-slate-350 hover:bg-slate-300 dark:hover:bg-slate-700 font-bold"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Missed:</span>
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => handleAdjustAttendance(rec.id, 'missed', 'dec')}
                        className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-650 dark:text-slate-350 hover:bg-slate-300 dark:hover:bg-slate-700 font-bold"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-xs font-extrabold text-slate-700 dark:text-slate-350 w-6 text-center">{rec.missed}</span>
                      <button
                        onClick={() => handleAdjustAttendance(rec.id, 'missed', 'inc')}
                        className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-650 dark:text-slate-350 hover:bg-slate-300 dark:hover:bg-slate-700 font-bold"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Attendance warning / feedback banner */}
              <div className={`text-xs font-bold flex items-center space-x-1.5 ${stats.meetsTarget ? 'text-teal-600 dark:text-teal-400' : 'text-rose-500 bg-rose-500/5 p-2.5 rounded-xl border border-rose-500/10'}`}>
                {!stats.meetsTarget && <AlertTriangle size={14} className="flex-shrink-0" />}
                <p className="leading-snug">{stats.helperText}</p>
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
