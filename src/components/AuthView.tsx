import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import medtrackLogo from '../assets/medtrack_logo.png';
import { Mail, Lock, User, GraduationCap, ArrowRight } from 'lucide-react';

export const AuthView: React.FC = () => {
  const { signIn, signUp, signInWithGoogle } = useApp();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [college, setCollege] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    
    setLoading(true);
    setError(null);
    try {
      if (isSignUp) {
        if (!fullName || !college) {
          setError("Full name and medical college details are required for registration.");
          setLoading(false);
          return;
        }
        await signUp(email, password, fullName, college);
        alert("🎉 Account created successfully! Please sign in with your credentials.");
        setIsSignUp(false);
      } else {
        await signIn(email, password);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Authentication failed. Please verify credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Google Sign-In failed.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-55 flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-md rounded-3xl p-6 md:p-8 border border-slate-200/50 dark:border-slate-800/50 shadow-2xl relative overflow-hidden flex flex-col justify-between">
        
        {/* Decorative Background Blob */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div>
          {/* Logo & Brand Header */}
          <div className="text-center space-y-3 mb-8">
            <img src={medtrackLogo} alt="MedTrack AI Logo" className="w-16 h-16 rounded-2xl mx-auto shadow-lg border border-teal-500/20 animate-float" />
            <div>
              <h1 className="font-extrabold text-2xl leading-none bg-gradient-to-r from-teal-600 to-blue-600 dark:from-teal-400 dark:to-blue-400 bg-clip-text text-transparent tracking-tight">
                MedTrack AI
              </h1>
              <p className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">
                MBBS Student Assistant
              </p>
            </div>
          </div>

          {/* Tab Toggler */}
          <div className="flex bg-slate-100 dark:bg-slate-900/80 p-1 rounded-2xl border border-slate-200/30 dark:border-slate-850 mb-6">
            <button
              onClick={() => { setIsSignUp(false); setError(null); }}
              className={`w-1/2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                !isSignUp ? 'bg-white dark:bg-slate-950 text-teal-500 dark:text-teal-400 shadow-sm border border-slate-200/20 dark:border-slate-800/20' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsSignUp(true); setError(null); }}
              className={`w-1/2 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isSignUp ? 'bg-white dark:bg-slate-950 text-teal-500 dark:text-teal-400 shadow-sm border border-slate-200/20 dark:border-slate-800/20' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Alert Box */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-2xl text-xs font-medium mb-6 text-left">
              ⚠️ {error}
            </div>
          )}

          {/* Authentication Form */}
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {isSignUp && (
              <>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 text-slate-400" size={16} />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-xs font-semibold outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="e.g. Abhineshwar"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 mb-1.5">Medical College</label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3.5 top-3 text-slate-400" size={16} />
                    <input
                      type="text"
                      required
                      value={college}
                      onChange={(e) => setCollege(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-xs font-semibold outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder="e.g. AIIMS Delhi"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 text-slate-400" size={16} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-xs font-semibold outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="name@college.edu"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-450 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 text-slate-400" size={16} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-xs font-semibold outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1.5"
            >
              <span>{loading ? 'Authenticating...' : isSignUp ? 'Create Profile' : 'Sign In'}</span>
              {!loading && <ArrowRight size={14} />}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-slate-200 dark:border-slate-800"></div>
            <span className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Or Connect With</span>
            <div className="flex-1 border-t border-slate-200 dark:border-slate-800"></div>
          </div>

          {/* Google Sign-in Trigger */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="w-full py-3 px-4 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-2.5 shadow-sm transition-all"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5.04c1.66 0 3.2.57 4.38 1.69l3.27-3.27C17.67 1.65 14.98 1 12 1 7.35 1 3.37 3.67 1.39 7.56l3.92 3.04c.97-2.9 3.67-5.56 6.69-5.56z" />
              <path fill="#4285F4" d="M23.49 12.27c0-.81-.07-1.59-.2-2.36H12v4.51h6.46c-.29 1.48-1.14 2.73-2.4 3.58l3.73 2.89c2.18-2.01 3.7-4.97 3.7-8.62z" />
              <path fill="#FBBC05" d="M5.31 10.6c-.25-.76-.4-1.56-.4-2.4s.15-1.64.4-2.4L1.39 2.76C.5 4.54 0 6.52 0 8.6c0 2.08.5 4.06 1.39 5.84l3.92-3.04z" />
              <path fill="#34A853" d="M12 23c3.24 0 5.97-1.07 7.96-2.91l-3.73-2.89c-1.1.74-2.51 1.18-4.23 1.18-3.02 0-5.72-2.66-6.69-5.56L1.39 14.4C3.37 19.33 7.35 23 12 23z" />
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>

        {/* Info footer */}
        <div className="mt-8 text-center text-[10px] text-slate-400 font-semibold leading-relaxed">
          <span>🔒 Google Sign-In automatically retrieves and syncs your educational syllabus database.</span>
        </div>

      </div>
    </div>
  );
};
