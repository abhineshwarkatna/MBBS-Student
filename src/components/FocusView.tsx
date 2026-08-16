import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX
} from 'lucide-react';

export const FocusView: React.FC = () => {
  const { subjects, addFocusSession, gainXpPoints } = useApp();

  const [selectedSubId, setSelectedSubId] = useState('sub-path');
  const [topicName, setTopicName] = useState('Inflammation Pathogenesis');
  
  // Timer States
  const [timerMins, setTimerMins] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  // Focus history log
  const [sessionCount, setSessionCount] = useState(0);

  // Mode Selection
  const [focusMode, setFocusMode] = useState<'25-5' | '50-10' | 'custom'>('25-5');

  useEffect(() => {
    let interval: any = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      handleSessionComplete();
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const handleSessionComplete = () => {
    setIsRunning(false);
    
    // Log focus session
    addFocusSession({
      subjectId: selectedSubId,
      topicName: topicName || 'General Study',
      duration: timerMins
    });

    gainXpPoints(15); // XP award
    setSessionCount(prev => prev + 1);
    
    // Reset timer
    setTimeLeft(timerMins * 60);
    alert(`🎉 Focus Session completed! You earned +15 XP. Study hours updated on subject.`);
  };

  const handleModeChange = (mode: '25-5' | '50-10' | 'custom', customMins = 25) => {
    setFocusMode(mode);
    setIsRunning(false);
    if (mode === '25-5') {
      setTimerMins(25);
      setTimeLeft(25 * 60);
    } else if (mode === '50-10') {
      setTimerMins(50);
      setTimeLeft(50 * 60);
    } else {
      setTimerMins(customMins);
      setTimeLeft(customMins * 60);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Circle SVG Dash calculations
  const totalSeconds = timerMins * 60;
  const strokePercent = timeLeft / totalSeconds;
  const radius = 90;
  const stroke = 6;
  const normalizedRadius = radius - stroke * 2;
  const circumference = normalizedRadius * 2 * Math.PI;
  const strokeDashoffset = circumference - strokePercent * circumference;

  return (
    <div className="space-y-6 text-left">
      
      {/* HEADER BAR */}
      <div className="flex justify-between items-center bg-slate-900/5 dark:bg-slate-900/30 p-6 rounded-3xl border border-slate-200/40 dark:border-slate-800/40">
        <div>
          <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest font-mono">Study Productivity</span>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">Pomodoro Focus Timer</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* TIMER DISPLAY BLOCK */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/50 shadow-md flex flex-col items-center justify-center text-center min-h-[400px]">
          
          {/* TIMER MODES */}
          <div className="flex bg-slate-100 dark:bg-slate-900 border border-slate-200/30 dark:border-slate-800/30 p-1.5 rounded-2xl mb-8">
            <button
              onClick={() => handleModeChange('25-5')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                focusMode === '25-5' ? 'bg-teal-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              25 / 5 Min
            </button>
            <button
              onClick={() => handleModeChange('50-10')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                focusMode === '50-10' ? 'bg-teal-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              50 / 10 Min
            </button>
            <button
              onClick={() => {
                const mins = prompt('Enter custom minutes:', '30');
                if (mins && !isNaN(parseInt(mins))) {
                  handleModeChange('custom', parseInt(mins));
                }
              }}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                focusMode === 'custom' ? 'bg-teal-500 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Custom
            </button>
          </div>

          {/* CIRCULAR TIMER */}
          <div className="relative flex items-center justify-center mb-8">
            <svg height={radius * 2} width={radius * 2} className="relative z-10">
              <circle
                stroke="rgba(20, 184, 166, 0.1)"
                fill="transparent"
                strokeWidth={stroke}
                r={normalizedRadius}
                cx={radius}
                cy={radius}
              />
              <circle
                stroke="#14b8a6"
                fill="transparent"
                strokeWidth={stroke}
                strokeDasharray={circumference + ' ' + circumference}
                style={{ strokeDashoffset }}
                strokeLinecap="round"
                r={normalizedRadius}
                cx={radius}
                cy={radius}
                className="transition-all duration-300 -rotate-90 origin-center"
              />
            </svg>
            <div className="absolute text-center">
              <span className="text-4xl font-black text-slate-800 dark:text-slate-100 font-mono tracking-tight">
                {formatTime(timeLeft)}
              </span>
              <span className="text-[10px] text-slate-400 font-bold block uppercase tracking-wider mt-1">
                {isRunning ? 'Active Study' : 'Paused'}
              </span>
            </div>
          </div>

          {/* CONTROLS */}
          <div className="flex space-x-4 items-center">
            <button
              onClick={() => handleModeChange(focusMode)}
              className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-200 text-slate-650 dark:text-slate-350 transition-all"
              title="Reset Timer"
            >
              <RotateCcw size={18} />
            </button>

            <button
              onClick={() => setIsRunning(!isRunning)}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 to-blue-500 text-white font-black text-xs uppercase tracking-wider shadow-md hover:scale-[1.01] transition-all flex items-center space-x-2"
            >
              {isRunning ? (
                <>
                  <Pause size={16} />
                  <span>Pause Session</span>
                </>
              ) : (
                <>
                  <Play size={16} />
                  <span>Start Focus</span>
                </>
              )}
            </button>

            <button
              onClick={() => setIsMuted(!isMuted)}
              className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-200 text-slate-650 dark:text-slate-350 transition-all"
              title={isMuted ? 'Unmute ticking' : 'Mute ticking'}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          </div>

        </div>

        {/* STUDY SETTINGS CONFIG PANEL */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/50 shadow-md space-y-5">
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-400">Study Session Details</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Select Subject</label>
              <select
                value={selectedSubId}
                onChange={(e) => setSelectedSubId(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-xs font-bold outline-none"
              >
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Topic Focus</label>
              <input
                type="text"
                value={topicName}
                onChange={(e) => setTopicName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-xs font-semibold outline-none"
                placeholder="Topic description..."
              />
            </div>
          </div>

          <div className="border-t border-slate-200/40 dark:border-slate-800/40 pt-4">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Logged Sessions Today</span>
            <h4 className="text-xl font-black text-teal-500 mt-1">
              {sessionCount} / 4 Blocks Completed
            </h4>
            <p className="text-[10px] text-slate-450 mt-1">
              Reaching 4 study blocks completes your daily study hour targets.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
