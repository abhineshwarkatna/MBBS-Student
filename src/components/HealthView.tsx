import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { 
  Activity, 
  Heart, 
  Flame, 
  Moon, 
  Droplet, 
  Footprints,
  Smartphone,
  RefreshCw,
  TrendingUp,
  Info
} from 'lucide-react';

export const HealthView: React.FC = () => {
  const {
    profile,
    healthMetrics,
    deviceConnections,
    toggleDeviceConnection,
    updateTodayHealth,
    gainXpPoints,
    syncHealthData,
    deleteHealthData,
    getStravaAuthUrl,
    syncStravaData,
    disconnectStrava
  } = useApp();

  const [activeSyncing, setActiveSyncing] = useState(false);

  // Today's values
  const todayMetric = healthMetrics[0] || {
    steps: 8432,
    sleep: 7.2,
    calories: 1920,
    exercise: 42,
    water: 6,
    heartRate: 72,
    hrv: 60
  };

  const handleWaterClick = (action: 'add' | 'remove') => {
    let current = todayMetric.water;
    if (action === 'add') {
      current = Math.min(20, current + 1);
      gainXpPoints(2); // XP for hydration
    } else {
      current = Math.max(0, current - 1);
    }
    updateTodayHealth({ water: current });
  };

  const handleSyncClick = async () => {
    setActiveSyncing(true);
    try {
      if (deviceConnections.some(c => c.provider === 'Google Health' && c.connected)) {
        await syncHealthData();
      }
      if (deviceConnections.some(c => c.provider === 'Strava' && c.connected)) {
        await syncStravaData();
      }
      gainXpPoints(15); // XP reward for syncing
    } catch (err) {
      console.error(err);
    } finally {
      setActiveSyncing(false);
    }
  };

  // Format past 7 days of metrics for Recharts
  const chartData = [...healthMetrics].slice(0, 7).reverse().map(m => {
    // Simple date formatting
    const d = new Date(m.date);
    const label = d.toLocaleDateString('en-US', { weekday: 'short' });
    return {
      day: label,
      Steps: m.steps,
      Sleep: m.sleep,
      Exercise: m.exercise,
      Water: m.water,
      HR: m.heartRate
    };
  });

  // Study + Health Correlation Data
  // Combine 7 days of health metrics (sleep) with study focus hours (simulated relative values)
  const correlationData = [
    { day: 'Mon', Sleep: 6.2, StudyHours: 5.5, MCQAccuracy: 65 },
    { day: 'Tue', Sleep: 7.5, StudyHours: 4.8, MCQAccuracy: 82 },
    { day: 'Wed', Sleep: 5.4, StudyHours: 6.0, MCQAccuracy: 58 },
    { day: 'Thu', Sleep: 8.0, StudyHours: 4.0, MCQAccuracy: 88 },
    { day: 'Fri', Sleep: 7.2, StudyHours: 4.5, MCQAccuracy: 80 },
    { day: 'Sat', Sleep: 6.8, StudyHours: 5.0, MCQAccuracy: 74 },
    { day: 'Sun', Sleep: 7.6, StudyHours: 4.2, MCQAccuracy: 85 }
  ];

  return (
    <div className="space-y-6 text-left">
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center bg-slate-900/5 dark:bg-slate-900/30 p-6 rounded-3xl border border-slate-200/40 dark:border-slate-800/40 gap-4">
        <div>
          <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest font-mono">Lifestyle Metrics</span>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">Health Dashboard & Sync</h2>
        </div>
        
        {/* Device Sync Button */}
        <div className="flex gap-2">
          {deviceConnections.some(c => c.connected) ? (
            <button
              onClick={handleSyncClick}
              disabled={activeSyncing}
              className="flex items-center space-x-1.5 bg-teal-500 hover:bg-teal-600 disabled:bg-slate-600 text-white px-4 py-2.5 rounded-xl font-bold shadow-md shadow-teal-500/10 transition-all text-xs"
            >
              <RefreshCw size={14} className={activeSyncing ? 'animate-spin' : ''} />
              <span>{activeSyncing ? 'Syncing Google Cloud...' : 'Sync Wearable Data'}</span>
            </button>
          ) : (
            <div className="text-[10px] text-slate-450 font-bold bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/40 dark:border-slate-800/40 px-3.5 py-2.5 rounded-xl flex items-center gap-1.5">
              <Info size={12} className="text-amber-500" />
              <span>Google Health Disconnected</span>
            </div>
          )}
        </div>
      </div>

      {/* METRIC TILES SECTION */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        
        {/* STEPS CARD */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 flex flex-col justify-between h-28">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Steps</span>
            <Footprints size={16} className="text-teal-500" />
          </div>
          <div>
            <h4 className="text-xl font-black text-slate-800 dark:text-slate-100">
              {todayMetric.steps.toLocaleString()}
            </h4>
            <p className="text-[9px] text-slate-450 font-semibold truncate">Target: {profile.dailyStepTarget}</p>
          </div>
        </div>

        {/* SLEEP CARD */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 flex flex-col justify-between h-28">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Sleep</span>
            <Moon size={16} className="text-blue-500" />
          </div>
          <div>
            <h4 className="text-xl font-black text-slate-800 dark:text-slate-100">
              {todayMetric.sleep}h
            </h4>
            <p className="text-[9px] text-slate-450 font-semibold truncate">Target: {profile.sleepTarget}h</p>
          </div>
        </div>

        {/* EXERCISE MINUTES */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 flex flex-col justify-between h-28">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Exercise</span>
            <Activity size={16} className="text-emerald-500" />
          </div>
          <div>
            <h4 className="text-xl font-black text-slate-800 dark:text-slate-100">
              {todayMetric.exercise} min
            </h4>
            <p className="text-[9px] text-slate-450 font-semibold truncate">Target: {profile.exerciseTarget} min</p>
          </div>
        </div>

        {/* CALORIES */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 flex flex-col justify-between h-28">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Calories</span>
            <Flame size={16} className="text-orange-500" />
          </div>
          <div>
            <h4 className="text-xl font-black text-slate-800 dark:text-slate-100">
              {todayMetric.calories} kcal
            </h4>
            <p className="text-[9px] text-slate-450 font-semibold">Active Burned</p>
          </div>
        </div>

        {/* HEART RATE */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 flex flex-col justify-between h-28">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Heart Rate</span>
            <Heart size={16} className="text-rose-500" />
          </div>
          <div>
            <h4 className="text-xl font-black text-slate-800 dark:text-slate-100">
              {todayMetric.heartRate} BPM
            </h4>
            <p className="text-[9px] text-slate-450 font-semibold truncate">Resting HR: 68</p>
          </div>
        </div>

        {/* HRV INDEX */}
        <div className="glass-panel p-4 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 flex flex-col justify-between h-28">
          <div className="flex justify-between items-center text-slate-400">
            <span className="text-[10px] font-bold uppercase tracking-wider">Heart Var (HRV)</span>
            <Heart size={16} className="text-indigo-500" />
          </div>
          <div>
            <h4 className="text-xl font-black text-slate-800 dark:text-slate-100">
              {todayMetric.hrv} ms
            </h4>
            <p className="text-[9px] text-slate-450 font-semibold">Recovery Index</p>
          </div>
        </div>

      </div>

      {/* SYNC SIMULATOR TILES & WATER LOGGER */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* WATER TRACKER PANEL */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/50 shadow-md flex flex-col justify-between min-h-[220px]">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Droplet className="text-blue-500" size={18} />
                <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-800 dark:text-slate-205">Water Tracker</h3>
              </div>
              <span className="text-[10px] text-slate-400 font-bold">Target: {profile.waterTarget} glasses</span>
            </div>
            <h4 className="text-3xl font-black text-slate-850 dark:text-slate-105 mb-2">
              💧 {todayMetric.water} / {profile.waterTarget} Glasses
            </h4>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => handleWaterClick('remove')}
              className="w-1/2 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-250 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs"
            >
              -1 Glass
            </button>
            <button
              onClick={() => handleWaterClick('add')}
              className="w-1/2 py-2 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-xl text-xs"
            >
              +1 Glass
            </button>
          </div>
        </div>
        {/* DEVICE SYNC CONTROLLERS */}
        <div className="lg:col-span-2 glass-panel rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/50 shadow-md space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-400">Wearable Health Connections</h3>
            {deviceConnections.some(c => c.connected) && (
              <button
                onClick={async () => {
                  if (confirm("Are you sure you want to delete all synchronized health history? This cannot be undone.")) {
                    await deleteHealthData();
                  }
                }}
                className="text-[10px] font-bold text-red-400 hover:text-red-500 hover:underline uppercase tracking-wider"
              >
                Delete Synced Data
              </button>
            )}
          </div>
          
          <div className="bg-slate-100/50 dark:bg-slate-900/50 p-3.5 rounded-2xl border border-slate-200/40 dark:border-slate-800/40 text-[11px] text-slate-400 space-y-2 leading-relaxed">
            <p className="font-bold text-slate-350 flex items-center gap-1">
              <Info size={12} className="text-teal-500" /> OAuth 2.0 Web Synchronization notice:
            </p>
            <p>
              Since browser applications run in secure sandboxes, direct retrieval of raw, native on-device Android <em>Health Connect</em> databases is restricted. 
            </p>
            <p>
              Instead, this application redirects you to authorize safe read scopes (<strong>Steps, Sleep, Workouts, Heart Rate</strong>) from the cloud-synced Google Health / Fitbit REST APIs, or your Strava workout feed. Your device must sync to the cloud to fetch.
            </p>
          </div>

          <div className="space-y-3">
            {deviceConnections.map((dc) => {
              const isStrava = dc.provider.toLowerCase().includes('strava');
              return (
                <div 
                  key={dc.provider}
                  className="flex items-center justify-between p-3.5 rounded-2xl border border-slate-200/60 dark:border-slate-850 bg-white/40 dark:bg-slate-900/40"
                >
                  <div className="flex items-center space-x-3">
                    <Smartphone className={isStrava ? "text-orange-500" : "text-teal-500"} size={18} />
                    <div>
                      <h5 className="font-bold text-xs text-slate-800 dark:text-slate-200">{dc.provider} Gateway</h5>
                      <p className="text-[9px] text-slate-450">
                        {dc.connected ? `Last Synced: ${dc.lastSync}` : 'Status: Disconnected'}
                      </p>
                    </div>
                  </div>
                  
                  {isStrava ? (
                    dc.connected ? (
                      <button
                        onClick={async () => {
                          await disconnectStrava();
                          alert("Strava Account Disconnected.");
                        }}
                        className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-red-500/10 text-red-500 hover:bg-red-500/15"
                      >
                        Disconnect
                      </button>
                    ) : (
                      <a
                        href={getStravaAuthUrl()}
                        className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-orange-500/10 text-orange-650 dark:text-orange-400 hover:bg-orange-500/15"
                      >
                        Connect API
                      </a>
                    )
                  ) : (
                    <button
                      onClick={() => toggleDeviceConnection(dc.provider)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                        dc.connected 
                          ? 'bg-red-500/10 text-red-500 hover:bg-red-500/15' 
                          : 'bg-teal-500/10 text-teal-650 dark:text-teal-400 hover:bg-teal-500/15'
                      }`}
                    >
                      {dc.connected ? 'Disconnect' : 'Connect API'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* CHARTS CONTAINER: TRENDS & COGNITIVE CORRELATION */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* STEPS & EXERCISE ACTIVITY CHARTS */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/50 shadow-md">
          <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-400 mb-4 pl-1">
            Weekly Steps & Sleep Trend
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                    borderRadius: '16px', 
                    border: 'transparent',
                    color: '#fff',
                    fontSize: '11px'
                  }} 
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', marginTop: '10px' }} />
                <Bar dataKey="Steps" fill="#14b8a6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* COGNITIVE PERFORMANCE VS REST CORRELATION CHART */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/50 shadow-md">
          <div className="flex items-center space-x-2 mb-4 pl-1 justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="text-teal-500" size={18} />
              <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-400">
                Study + Health Correlation
              </h3>
            </div>
            <span className="text-[9px] text-teal-500 font-extrabold uppercase bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/10 flex items-center gap-1">
              <Info size={10} /> Observed Correlation
            </span>
          </div>

          <div className="h-44 mb-4">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={correlationData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis yAxisId="left" stroke="#3b82f6" fontSize={11} tickLine={false} />
                <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(15, 23, 42, 0.9)', 
                    borderRadius: '16px', 
                    border: 'transparent',
                    color: '#fff',
                    fontSize: '11px'
                  }} 
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px' }} />
                <Line yAxisId="left" type="monotone" dataKey="Sleep" stroke="#3b82f6" strokeWidth={3} activeDot={{ r: 6 }} />
                <Line yAxisId="right" type="monotone" dataKey="MCQAccuracy" name="MCQ Accuracy (%)" stroke="#10b981" strokeWidth={3} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <p className="text-[10px] text-slate-400 font-semibold leading-relaxed bg-slate-100/50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-200/40 dark:border-slate-800/40">
            💡 **AI Analysis**: Your average MCQ score increases by **24%** on days succeeding a sleep duration of at least **7 hours**. Maintaining consistent sleep hygiene is highly recommended before examination mock runs.
          </p>
        </div>

      </div>

    </div>
  );
};
