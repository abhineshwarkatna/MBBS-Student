import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  GraduationCap,
  Activity,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Check
} from 'lucide-react';

export const Onboarding: React.FC = () => {
  const { setIsOnboarded, updateProfile, signInWithGoogle, getStravaAuthUrl } = useApp();
  const [step, setStep] = useState(1);
  
  // State for onboarding form fields
  const [name, setName] = useState('Abhineshwar');
  const [college, setCollege] = useState('AIIMS Delhi');
  const [mbbsYear, setMbbsYear] = useState<'1st MBBS' | '2nd MBBS' | '3rd MBBS' | 'Final Year'>('3rd MBBS');
  const [semester, setSemester] = useState('6th Semester');
  
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([
    'Pathology',
    'Pharmacology',
    'Microbiology'
  ]);
  
  const [examTitle, setExamTitle] = useState('University Finals');
  const [examDate, setExamDate] = useState('2026-09-27'); // approximately 42 days from 2026-08-16
  const [attendanceTarget, setAttendanceTarget] = useState(75);
  const [studyTarget, setStudyTarget] = useState(4.5);
  
  const [stepTarget, setStepTarget] = useState(10000);
  const [sleepTarget, setSleepTarget] = useState(7.5);
  const [waterTarget, setWaterTarget] = useState(8);
  const [exerciseTarget, setExerciseTarget] = useState(45);
  
  const [selectedHabits, setSelectedHabits] = useState<string[]>([
    'Review Flashcards',
    'Practice MCQs',
    'Sleep by 11:00 PM',
    'Drink 8 Glasses of Water',
    'Walk 10,000 Steps'
  ]);

  const defaultSubjectsForYear = {
    '1st MBBS': ['Anatomy', 'Physiology', 'Biochemistry'],
    '2nd MBBS': ['Pharmacology', 'Pathology', 'Microbiology', 'Forensic Medicine'],
    '3rd MBBS': ['Ophthalmology', 'Otorhinolaryngology (ENT)', 'Community Medicine'],
    'Final Year': ['Medicine', 'Surgery', 'Obstetrics & Gynecology', 'Pediatrics']
  };

  const handleYearChange = (year: '1st MBBS' | '2nd MBBS' | '3rd MBBS' | 'Final Year') => {
    setMbbsYear(year);
    // Pre-populate default subjects
    if (year === '1st MBBS') {
      setSelectedSubjects(defaultSubjectsForYear['1st MBBS']);
      setSemester('2nd Semester');
    } else if (year === '2nd MBBS') {
      setSelectedSubjects(defaultSubjectsForYear['2nd MBBS']);
      setSemester('4th Semester');
    } else if (year === '3rd MBBS') {
      setSelectedSubjects(['Pathology', 'Pharmacology', 'Microbiology']); // custom pre-seed
      setSemester('6th Semester');
    } else {
      setSelectedSubjects(defaultSubjectsForYear['Final Year']);
      setSemester('9th Semester');
    }
  };

  const handleSubjectToggle = (sub: string) => {
    if (selectedSubjects.includes(sub)) {
      setSelectedSubjects(selectedSubjects.filter(s => s !== sub));
    } else {
      setSelectedSubjects([...selectedSubjects, sub]);
    }
  };

  const handleHabitToggle = (habit: string) => {
    if (selectedHabits.includes(habit)) {
      setSelectedHabits(selectedHabits.filter(h => h !== habit));
    } else {
      setSelectedHabits([...selectedHabits, habit]);
    }
  };

  const handleCompleteOnboarding = () => {
    // 1. Update Profile values
    updateProfile({
      name,
      college,
      mbbsYear,
      semester,
      targetPercentage: 80,
      dailyStudyTarget: studyTarget,
      dailyStepTarget: stepTarget,
      sleepTarget: sleepTarget,
      waterTarget: waterTarget,
      exerciseTarget: exerciseTarget
    });

    // 2. Complete onboarding
    setIsOnboarded(true);
  };

  const totalSteps = 11;
  const progressPercent = Math.round((step / totalSteps) * 100);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-50 flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-2xl rounded-3xl p-6 md:p-10 border border-slate-200/50 dark:border-slate-800/50 shadow-2xl relative overflow-hidden flex flex-col min-h-[550px] justify-between">
        
        {/* Decorative Background Blob */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div>
          {/* Wizard Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-xl bg-teal-500 text-white shadow-md shadow-teal-500/10">
                <GraduationCap size={20} />
              </span>
              <span className="font-extrabold text-lg text-slate-800 dark:text-slate-200">MedTrack AI Setup</span>
            </div>
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
              Step {step} of {totalSteps}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-850 h-2 rounded-full mb-8 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-teal-500 to-blue-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>

          {/* STEP 1: Student Details */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-left">
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                  Welcome to MedTrack AI <Sparkles className="text-teal-500" size={20} />
                </h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Let's configure your academic environment. First, tell us your name and medical institution.
                </p>
              </div>

              {/* Google OAuth Login Option */}
              <div className="bg-slate-100/40 dark:bg-slate-900/40 border border-slate-200/40 dark:border-slate-800/40 p-5 rounded-2xl text-center space-y-3">
                <p className="text-xs font-bold text-slate-500 dark:text-slate-400">Sync with Supabase cloud database:</p>
                <button
                  onClick={async () => {
                    try {
                      await signInWithGoogle();
                    } catch (err: any) {
                      alert("Google Login Error: " + err.message);
                    }
                  }}
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

              <div className="space-y-4 text-left">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Student Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 font-medium focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                    placeholder="Enter name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Medical College</label>
                  <input
                    type="text"
                    value={college}
                    onChange={(e) => setCollege(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 font-medium focus:ring-2 focus:ring-teal-500 outline-none transition-all"
                    placeholder="Enter college"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: MBBS Academic Year */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-left">
                <h2 className="text-2xl font-bold mb-2">Select Your MBBS Year</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  This customizes the subject curriculum lists and postings parameters automatically.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-left">
                {(['1st MBBS', '2nd MBBS', '3rd MBBS', 'Final Year'] as const).map((year) => (
                  <button
                    key={year}
                    onClick={() => handleYearChange(year)}
                    className={`p-5 rounded-2xl border text-left flex flex-col justify-between h-32 transition-all ${
                      mbbsYear === year
                        ? 'border-teal-500 bg-teal-500/5 shadow-md shadow-teal-500/5'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900/50'
                    }`}
                  >
                    <span className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 w-10 h-10 flex items-center justify-center font-bold">
                      {year[0]}
                    </span>
                    <span className="font-extrabold text-slate-800 dark:text-slate-100">{year}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Current Semester */}
          {step === 3 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-left">
                <h2 className="text-2xl font-bold mb-2">What is your current Semester?</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Set the semester terms to align schedules correctly.
                </p>
              </div>
              <div className="space-y-4 text-left">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">Semester/Term</label>
                <select
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-teal-500 outline-none"
                >
                  {['1st Semester', '2nd Semester', '3rd Semester', '4th Semester', '5th Semester', '6th Semester', '7th Semester', '8th Semester', '9th Semester'].map((sem) => (
                    <option key={sem} value={sem}>{sem}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* STEP 4: Subject Selection */}
          {step === 4 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-left">
                <h2 className="text-2xl font-bold mb-2">Choose Your Subjects</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Select the subjects you are studying this semester. You can edit this list anytime.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left max-h-[300px] overflow-y-auto pr-2">
                {[
                  'Pathology', 'Pharmacology', 'Microbiology', 'Forensic Medicine',
                  'Anatomy', 'Physiology', 'Biochemistry',
                  'Ophthalmology', 'Otorhinolaryngology (ENT)', 'Community Medicine',
                  'Medicine', 'Surgery', 'Obstetrics & Gynecology', 'Pediatrics',
                  'Dermatology', 'Psychiatry', 'Orthopedics', 'Anesthesiology', 'Radiology'
                ].map((sub) => {
                  const isChecked = selectedSubjects.includes(sub);
                  return (
                    <button
                      key={sub}
                      onClick={() => handleSubjectToggle(sub)}
                      className={`flex justify-between items-center px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${
                        isChecked
                          ? 'border-teal-500 bg-teal-500/5 text-teal-600 dark:text-teal-400'
                          : 'border-slate-200 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-900/50 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <span>{sub}</span>
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${isChecked ? 'bg-teal-500 border-teal-500 text-white' : 'border-slate-300 dark:border-slate-700'}`}>
                        {isChecked && <Check size={12} strokeWidth={3} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 5: College Timetable */}
          {step === 5 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-left">
                <h2 className="text-2xl font-bold mb-2">Confirm College Hours</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  This schedules your postings and clinical lecture blocks during the day.
                </p>
              </div>
              <div className="bg-slate-100 dark:bg-slate-900/60 border border-slate-200/50 dark:border-slate-800/50 rounded-2xl p-5 text-left space-y-4">
                <div className="flex justify-between items-center border-b border-slate-200/50 dark:border-slate-800/50 pb-3">
                  <div>
                    <h4 className="font-extrabold text-slate-800 dark:text-slate-200">Morning Ward Postings</h4>
                    <p className="text-xs text-slate-400">Clinical postings in allocated departments</p>
                  </div>
                  <span className="px-3 py-1 bg-teal-500/10 text-teal-600 dark:text-teal-400 text-xs font-bold rounded-lg border border-teal-500/20">
                    09:00 AM - 12:00 PM
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-extrabold text-slate-800 dark:text-slate-200">Lectures & Practicals</h4>
                    <p className="text-xs text-slate-400">Theoretical sessions and dry-labs</p>
                  </div>
                  <span className="px-3 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-lg border border-blue-500/20">
                    02:00 PM - 04:00 PM
                  </span>
                </div>
              </div>
              <p className="text-xs text-slate-400 text-left italic">
                *The system auto-locks clinical sessions inside the schedule tracker based on these periods.
              </p>
            </div>
          )}

          {/* STEP 6: Target Exam Dates */}
          {step === 6 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-left">
                <h2 className="text-2xl font-bold mb-2">Set Target Exam Date</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  We use this date to configure the Exam Mode countdown and calculate spaced-repetition schedules.
                </p>
              </div>
              <div className="space-y-4 text-left">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Exam Description</label>
                  <input
                    type="text"
                    value={examTitle}
                    onChange={(e) => setExamTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-teal-500 outline-none"
                    placeholder="e.g., Final University Examinations"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Exam Date</label>
                  <input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-100 font-semibold focus:ring-2 focus:ring-teal-500 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 7: Attendance Target */}
          {step === 7 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-left">
                <h2 className="text-2xl font-bold mb-2">Set Minimum Attendance Target</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Universities mandate minimum percentages (usually 75% or 80%) for exam eligibility.
                </p>
              </div>
              <div className="space-y-4 text-left">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-slate-800 dark:text-slate-200">Required Target</span>
                  <span className="text-2xl font-black text-teal-500">{attendanceTarget}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={attendanceTarget}
                  onChange={(e) => setAttendanceTarget(parseInt(e.target.value))}
                  className="w-full accent-teal-500 h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
                <p className="text-xs text-slate-400 italic">
                  *The tracker flags warning markers for any subjects sliding below this value.
                </p>
              </div>
            </div>
          )}

          {/* STEP 8: Study Target */}
          {step === 8 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-left">
                <h2 className="text-2xl font-bold mb-2">Daily Study Target</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Specify how many hours you plan to spend daily on active studying and revisions.
                </p>
              </div>
              <div className="space-y-4 text-left">
                <div className="flex justify-between items-center">
                  <span className="font-extrabold text-slate-800 dark:text-slate-200">Self-Study Duration</span>
                  <span className="text-2xl font-black text-teal-500">{studyTarget} hours</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="12"
                  step="0.5"
                  value={studyTarget}
                  onChange={(e) => setStudyTarget(parseFloat(e.target.value))}
                  className="w-full accent-teal-500 h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* STEP 9: Health and Fitness targets */}
          {step === 9 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-left">
                <h2 className="text-2xl font-bold mb-2">Configure Lifestyle Targets</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  A healthy mind in a healthy body. Set daily goals to keep stress and fatigue managed.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4 text-left">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Steps Target</label>
                  <input
                    type="number"
                    value={stepTarget}
                    onChange={(e) => setStepTarget(parseInt(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-100/50 dark:bg-slate-900/50 text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Sleep Target (Hours)</label>
                  <input
                    type="number"
                    step="0.5"
                    value={sleepTarget}
                    onChange={(e) => setSleepTarget(parseFloat(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-100/50 dark:bg-slate-900/50 text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Water Target (Glasses)</label>
                  <input
                    type="number"
                    value={waterTarget}
                    onChange={(e) => setWaterTarget(parseInt(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-100/50 dark:bg-slate-900/50 text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">Exercise Target (Mins)</label>
                  <input
                    type="number"
                    value={exerciseTarget}
                    onChange={(e) => setExerciseTarget(parseInt(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-100/50 dark:bg-slate-900/50 text-sm font-semibold"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 10: Device connection */}
          {step === 10 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-left">
                <h2 className="text-2xl font-bold mb-2">Sync Your Wearable Accounts</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  MedTrack AI integrates securely with Strava or Google Health REST APIs to synchronize athletic activities, walking steps, and calorie counts.
                </p>
              </div>
              <div className="space-y-4 text-left">
                {/* Strava option */}
                <a
                  href={getStravaAuthUrl()}
                  className="w-full flex items-center justify-between p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all cursor-pointer"
                >
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-orange-500/10 text-orange-500 rounded-xl">
                      <Activity size={24} />
                    </div>
                    <div className="text-left">
                      <h4 className="font-extrabold text-slate-800 dark:text-slate-200">Connect Strava Activity API</h4>
                      <p className="text-xs text-slate-400">Sync outdoor runs, walks, calories, and distances</p>
                    </div>
                  </div>
                  <span className="px-4 py-1.5 rounded-lg text-xs font-bold bg-orange-500 text-white shadow-md">
                    Connect Strava
                  </span>
                </a>

                {/* Google Health option */}
                <div className="w-full flex items-center justify-between p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-teal-500/10 text-teal-500 rounded-xl">
                      <Activity size={24} />
                    </div>
                    <div className="text-left">
                      <h4 className="font-extrabold text-slate-800 dark:text-slate-200">Google Health Connection</h4>
                      <p className="text-xs text-slate-400">Automatically enabled for profiles. Manage in Health dashboard</p>
                    </div>
                  </div>
                  <span className="px-4 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500">
                    Ready
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 11: Habits Selection */}
          {step === 11 && (
            <div className="space-y-6 animate-fade-in">
              <div className="text-left">
                <h2 className="text-2xl font-bold mb-2">Select Core Habits</h2>
                <p className="text-slate-500 dark:text-slate-400 text-sm">
                  Choose the habits you want to track daily. Habits build consistency in clinical environments.
                </p>
              </div>
              <div className="grid grid-cols-1 gap-2.5 text-left max-h-[300px] overflow-y-auto pr-2">
                {[
                  'Review Flashcards', 'Practice MCQs', 'Sleep by 11:00 PM',
                  'Drink 8 Glasses of Water', 'Walk 10,000 Steps',
                  'Auscultate Ward Cases', 'Review Pharmacokinetics', 'Write reflection journal'
                ].map((habit) => {
                  const isChecked = selectedHabits.includes(habit);
                  return (
                    <button
                      key={habit}
                      onClick={() => handleHabitToggle(habit)}
                      className={`flex justify-between items-center px-4 py-3 rounded-xl border text-sm font-semibold transition-all ${
                        isChecked
                          ? 'border-teal-500 bg-teal-500/5 text-teal-600 dark:text-teal-400'
                          : 'border-slate-200 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-900/50 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <span>{habit}</span>
                      <div className={`w-5 h-5 rounded-md border flex items-center justify-center ${isChecked ? 'bg-teal-500 border-teal-500 text-white' : 'border-slate-300 dark:border-slate-700'}`}>
                        {isChecked && <Check size={12} strokeWidth={3} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Wizard Navigation Footer */}
        <div className="flex justify-between items-center mt-8 pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
          <button
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              step === 1
                ? 'opacity-40 cursor-not-allowed'
                : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900'
            }`}
          >
            <ChevronLeft size={16} />
            <span>Back</span>
          </button>
          
          {step < totalSteps ? (
            <button
              onClick={() => setStep(step + 1)}
              className="flex items-center space-x-1.5 px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-blue-500 text-white text-sm font-bold shadow-md shadow-teal-500/10 hover:shadow-lg transition-all"
            >
              <span>Next</span>
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleCompleteOnboarding}
              className="flex items-center space-x-1.5 px-6 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-indigo-500 text-white text-sm font-black shadow-lg shadow-teal-500/20 hover:scale-[1.02] transition-all"
            >
              <span>Generate Dashboard</span>
              <Sparkles size={16} />
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
