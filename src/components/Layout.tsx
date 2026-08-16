import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import medtrackLogo from '../assets/medtrack_logo.png';
import {
  LayoutDashboard,
  BookOpen,
  ClipboardList,
  CalendarRange,
  Brain,
  Bot,
  Activity,
  Timer,
  FileText,
  Award,
  Settings,
  Menu,
  X,
  Sparkles,
  Award as BadgeIcon,
  Sun,
  MoonStar,
  CheckSquare
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const {
    currentView,
    setCurrentView,
    theme,
    setTheme,
    profile,
    levelUpNotification,
    setLevelUpNotification,
    badgeNotification,
    setBadgeNotification
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', name: 'Dashboard', icon: LayoutDashboard, category: 'Main' },
    { id: 'subjects', name: 'Syllabus & Planner', icon: BookOpen, category: 'Academics' },
    { id: 'clinical', name: 'Clinical Posting', icon: ClipboardList, category: 'Academics' },
    { id: 'attendance', name: 'Attendance Tracker', icon: CheckSquare, category: 'Academics' },
    { id: 'exams', name: 'Exams & Revision', icon: CalendarRange, category: 'Academics' },
    { id: 'mcq', name: 'MCQs & Flashcards', icon: Brain, category: 'Academics' },
    { id: 'ai', name: 'AI Study Assistant', icon: Bot, category: 'AI Tools' },
    { id: 'health', name: 'Health & Watch', icon: Activity, category: 'Lifestyle' },
    { id: 'focus', name: 'Pomodoro Focus', icon: Timer, category: 'Lifestyle' },
    { id: 'journal', name: 'Reflection Journal', icon: FileText, category: 'Lifestyle' },
    { id: 'achievements', name: 'Achievements', icon: Award, category: 'Lifestyle' },
    { id: 'settings', name: 'Settings', icon: Settings, category: 'System' }
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 transition-colors duration-200">
      
      {/* SIDEBAR - DESKTOP */}
      <aside className="hidden md:flex flex-col w-72 glass-panel border-r border-slate-200/50 dark:border-slate-800/50 h-screen sticky top-0 z-20">
        
        {/* Brand Logo */}
        <div className="p-6 border-b border-slate-200/50 dark:border-slate-800/50 flex items-center space-x-3">
          <img src={medtrackLogo} alt="MedTrack AI Logo" className="w-11 h-11 rounded-xl shadow-md border border-teal-500/20 animate-float" />
          <div>
            <h1 className="font-extrabold text-xl leading-none bg-gradient-to-r from-teal-600 to-blue-600 dark:from-teal-400 dark:to-blue-400 bg-clip-text text-transparent tracking-tight">
              MedTrack AI
            </h1>
            <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500 tracking-wider">
              MBBS Assistant
            </span>
          </div>
        </div>

        {/* User Mini Profile Card */}
        <div className="p-4 mx-4 my-4 rounded-2xl bg-slate-100/50 dark:bg-slate-900/50 border border-slate-200/30 dark:border-slate-800/30 flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-400 to-indigo-500 flex items-center justify-center text-white font-bold text-lg shadow-inner">
              {profile.name[0]}
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-teal-500 border-2 border-white dark:border-slate-950"></div>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm font-bold truncate text-slate-800 dark:text-slate-200">{profile.name}</h2>
            <p className="text-[11px] text-slate-400 truncate">{profile.mbbsYear} • Lvl {profile.level}</p>
          </div>
        </div>

        {/* Navigation Items grouped by Category */}
        <nav className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
          {['Main', 'Academics', 'AI Tools', 'Lifestyle', 'System'].map((cat) => {
            const catItems = menuItems.filter(item => item.category === cat);
            return (
              <div key={cat} className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-3 block mb-1">
                  {cat}
                </span>
                {catItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      id={`nav-${item.id}`}
                      onClick={() => setCurrentView(item.id)}
                      className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-gradient-to-r from-teal-500/10 to-blue-500/10 dark:from-teal-500/20 dark:to-blue-500/20 text-teal-600 dark:text-teal-400 border-l-4 border-teal-500 pl-2 shadow-sm shadow-teal-500/5'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900/50 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      <Icon size={18} className={isActive ? 'text-teal-500' : 'opacity-70'} />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </div>
            );
          })}
        </nav>

        {/* Footer controls (Theme Toggler) */}
        <div className="p-4 border-t border-slate-200/50 dark:border-slate-800/50 flex justify-between items-center">
          <span className="text-xs text-slate-400 dark:text-slate-500">Theme</span>
          <button
            id="theme-toggler"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/40 hover:bg-slate-200 dark:hover:bg-slate-800 transition-all text-slate-700 dark:text-slate-300"
            title="Toggle Theme"
          >
            {theme === 'light' ? <MoonStar size={16} /> : <Sun size={16} />}
          </button>
        </div>
      </aside>

      {/* MOBILE HEADER */}
      <header className="md:hidden glass border-b border-slate-200/50 dark:border-slate-800/50 sticky top-0 z-20 flex justify-between items-center px-4 py-3">
        <div className="flex items-center space-x-2">
          <img src={medtrackLogo} alt="MedTrack AI Logo" className="w-8 h-8 rounded-lg shadow-sm" />
          <span className="font-extrabold text-lg bg-gradient-to-r from-teal-600 to-blue-600 dark:from-teal-400 dark:to-blue-400 bg-clip-text text-transparent tracking-tight">
            MedTrack AI
          </span>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300"
          >
            {theme === 'light' ? <MoonStar size={16} /> : <Sun size={16} />}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* MOBILE DRAWER */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[53px] bg-slate-950/80 backdrop-blur-sm z-30 flex justify-end transition-opacity duration-300">
          <div className="w-80 h-full bg-white dark:bg-slate-900 p-6 shadow-2xl flex flex-col justify-between overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center space-x-3 pb-4 border-b border-slate-200/50 dark:border-slate-800/50">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-teal-400 to-indigo-500 flex items-center justify-center text-white font-bold">
                  {profile.name[0]}
                </div>
                <div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-200">{profile.name}</h3>
                  <p className="text-xs text-slate-400">{profile.mbbsYear}</p>
                </div>
              </div>
              <nav className="space-y-1.5">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentView === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setCurrentView(item.id);
                        setMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        isActive
                          ? 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-l-4 border-teal-500 pl-2'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Icon size={18} />
                      <span>{item.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
            <div className="pt-6 border-t border-slate-200/50 dark:border-slate-800/50 flex justify-between text-xs text-slate-400">
              <span>MedTrack AI v1.0.0</span>
              <span>AIIMS Delhi</span>
            </div>
          </div>
        </div>
      )}

      {/* CONTENT WINDOW */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto h-screen relative pb-16 md:pb-0">
        <div className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>

      {/* MOBILE BOTTOM NAVIGATION BAR */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 glass-panel border-t border-slate-200/50 dark:border-slate-800/50 flex justify-around items-center px-2 py-1 z-20">
        {[
          { id: 'dashboard', name: 'Home', icon: LayoutDashboard },
          { id: 'subjects', name: 'Study', icon: BookOpen },
          { id: 'clinical', name: 'Clinical', icon: ClipboardList },
          { id: 'ai', name: 'AI', icon: Bot },
          { id: 'health', name: 'Health', icon: Activity }
        ].map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-all ${
                isActive
                  ? 'text-teal-500 scale-105'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              <Icon size={20} />
              <span className="text-[10px] font-bold mt-0.5">{item.name}</span>
            </button>
          );
        })}
      </nav>

      {/* GAMIFICATION NOTIFICATIONS */}
      
      {/* 1. Level Up Modal Overlay */}
      {levelUpNotification?.show && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="glass-panel max-w-md w-full rounded-3xl p-8 border border-teal-500/30 text-center animate-bounce-in shadow-2xl shadow-teal-500/10">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-teal-400 to-indigo-500 text-white flex items-center justify-center shadow-lg animate-pulse mb-6">
              <Sparkles size={48} className="text-yellow-300 animate-spin" style={{ animationDuration: '4s' }} />
            </div>
            <h2 className="text-3xl font-extrabold bg-gradient-to-r from-teal-500 to-blue-500 bg-clip-text text-transparent tracking-tight mb-2">
              Level Up! 🎉
            </h2>
            <p className="text-lg text-slate-700 dark:text-slate-300 font-medium mb-6">
              Congratulations! You reached **Level {levelUpNotification.level}**!
            </p>
            <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-4 mb-6">
              <p className="text-xs text-slate-500">
                "Dedicated efforts bear fruit. Keep up the high consistency in your studies and clinicalPosting rounds."
              </p>
            </div>
            <button
              onClick={() => setLevelUpNotification(null)}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white font-bold shadow-md hover:shadow-lg transition-all"
            >
              Let's Keep Learning!
            </button>
          </div>
        </div>
      )}

      {/* 2. Badge Unlocked Modal Overlay */}
      {badgeNotification?.show && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="glass-panel max-w-md w-full rounded-3xl p-8 border border-purple-500/30 text-center shadow-2xl shadow-purple-500/10">
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-tr from-purple-400 to-pink-500 text-white flex items-center justify-center shadow-lg mb-6">
              <BadgeIcon size={48} className="text-yellow-200" />
            </div>
            <span className="text-xs font-extrabold uppercase tracking-widest text-purple-500 dark:text-purple-400 block mb-1">
              Achievement Unlocked
            </span>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2">
              {badgeNotification.name}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              {badgeNotification.desc}
            </p>
            <div className="bg-purple-500/5 border border-purple-500/15 rounded-2xl p-3 mb-6">
              <p className="text-xs text-purple-600 dark:text-purple-400 font-semibold">
                +100 XP Points Awarded
              </p>
            </div>
            <button
              onClick={() => setBadgeNotification(null)}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold shadow-md hover:shadow-lg transition-all"
            >
              Collect Reward
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
