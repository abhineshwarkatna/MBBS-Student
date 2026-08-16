import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  UserProfile,
  Subject,
  SyllabusTopic,
  Task,
  ClinicalPosting,
  CaseLog,
  AttendanceRecord,
  Exam,
  RevisionItem,
  Flashcard,
  MCQQuestion,
  MCQAttempt,
  HealthMetric,
  FocusSession,
  JournalEntry,
  DeviceConnection,
  AIChatMessage
} from '../types';
import * as db from '../services/db';
import { authService } from '../services/authService';
import { taskService } from '../services/taskService';
import { clinicalService } from '../services/clinicalService';
import { studyService } from '../services/studyService';
import { attendanceService } from '../services/attendanceService';
import { examService } from '../services/examService';
import { healthService } from '../services/healthService';
import { aiService } from '../services/aiService';
import { supabase } from '../services/supabaseClient';

interface AppContextType {
  profile: UserProfile;
  subjects: Subject[];
  syllabus: SyllabusTopic[];
  tasks: Task[];
  clinicalPostings: ClinicalPosting[];
  caseLogs: CaseLog[];
  attendance: AttendanceRecord[];
  exams: Exam[];
  revisionQueue: RevisionItem[];
  flashcards: Flashcard[];
  mcqQuestions: MCQQuestion[];
  mcqAttempts: MCQAttempt[];
  healthMetrics: HealthMetric[];
  focusSessions: FocusSession[];
  journalEntries: Record<string, JournalEntry>;
  deviceConnections: DeviceConnection[];
  aiChatHistory: AIChatMessage[];
  todayScore: number;
  todayScoreBreakdown: Record<string, number>;
  
  currentView: string;
  setCurrentView: (view: string) => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  isOnboarded: boolean;
  setIsOnboarded: (onboarded: boolean) => void;

  currentUser: any;
  signUp: (email: string, password: string, fullName: string, college: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  syncHealthData: () => Promise<void>;
  deleteHealthData: () => Promise<void>;

  updateProfile: (profile: Partial<UserProfile>) => void;
  addSubject: (sub: Omit<Subject, 'id' | 'progress' | 'studyHours'>) => void;
  updateSyllabusTopic: (id: string, status: SyllabusTopic['status']) => void;
  addTask: (task: Omit<Task, 'id'>) => void;
  updateTask: (task: Task) => void;
  deleteTask: (id: string) => void;
  addClinicalPosting: (posting: Omit<ClinicalPosting, 'id' | 'casesCount' | 'proceduresObserved' | 'proceduresPerformed' | 'completed'>) => void;
  updateClinicalPosting: (posting: ClinicalPosting) => void;
  addCaseLog: (caseLog: Omit<CaseLog, 'id'>) => void;
  deleteCaseLog: (id: string) => void;
  updateAttendance: (record: AttendanceRecord) => void;
  addExam: (exam: Omit<Exam, 'id' | 'status'>) => void;
  deleteExam: (id: string) => void;
  updateRevisionItem: (id: string, status: RevisionItem['status'], stageIncrease?: number) => void;
  updateFlashcard: (id: string, quality: 'easy' | 'medium' | 'hard') => void;
  addMCQAttempt: (attempt: Omit<MCQAttempt, 'id' | 'date' | 'accuracy'>) => void;
  updateTodayHealth: (metric: Partial<HealthMetric>) => void;
  addFocusSession: (session: Omit<FocusSession, 'id' | 'date'>) => void;
  saveJournalEntry: (date: string, entry: Omit<JournalEntry, 'date'>) => void;
  toggleDeviceConnection: (provider: DeviceConnection['provider']) => void;
  sendAIMessage: (content: string) => Promise<void>;
  clearAIChat: () => void;
  gainXpPoints: (amount: number) => void;
  
  levelUpNotification: { show: boolean; level: number } | null;
  setLevelUpNotification: (val: { show: boolean; level: number } | null) => void;
  badgeNotification: { show: boolean; name: string; desc: string } | null;
  setBadgeNotification: (val: { show: boolean; name: string; desc: string } | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation & Theme
  const [currentView, setCurrentView] = useState('dashboard');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const savedTheme = localStorage.getItem('medtrack_theme');
    if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
    return 'dark'; // Premium dark theme by default
  });
  const [isOnboarded, setIsOnboarded] = useState<boolean>(() => {
    return localStorage.getItem('medtrack_onboarded') === 'true';
  });

  // Auth User State
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Notifications for Gamification
  const [levelUpNotification, setLevelUpNotification] = useState<{ show: boolean; level: number } | null>(null);
  const [badgeNotification, setBadgeNotification] = useState<{ show: boolean; name: string; desc: string } | null>(null);

  // Core States
  const [profile, setProfile] = useState<UserProfile>(db.getProfile);
  const [subjects, setSubjects] = useState<Subject[]>(db.getSubjects);
  const [syllabus, setSyllabus] = useState<SyllabusTopic[]>(db.getSyllabus);
  const [tasks, setTasks] = useState<Task[]>(db.getTasks);
  const [clinicalPostings, setClinicalPostings] = useState<ClinicalPosting[]>(db.getClinicalPostings);
  const [caseLogs, setCaseLogs] = useState<CaseLog[]>(db.getCaseLogs);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(db.getAttendance);
  const [exams, setExams] = useState<Exam[]>(db.getExams);
  const [revisionQueue, setRevisionQueue] = useState<RevisionItem[]>(db.getRevisionQueue);
  const [flashcards, setFlashcards] = useState<Flashcard[]>(db.getFlashcards);
  const [mcqAttempts, setMCQAttempts] = useState<MCQAttempt[]>(db.getMCQAttempts);
  const [healthMetrics, setHealthMetrics] = useState<HealthMetric[]>(db.getHealthMetrics);
  const [focusSessions, setFocusSessions] = useState<FocusSession[]>(db.getFocusSessions);
  const [journalEntries, setJournalEntries] = useState<Record<string, JournalEntry>>(db.getJournalEntries);
  const [deviceConnections, setDeviceConnections] = useState<DeviceConnection[]>(db.getDeviceConnections);
  const [aiChatHistory, setAIChatHistory] = useState<AIChatMessage[]>(db.getAIChatHistory);

  // Calculated Scores
  const [todayScore, setTodayScore] = useState(75);
  const [todayScoreBreakdown, setTodayScoreBreakdown] = useState<Record<string, number>>({});

  // Sync state on mount and keep theme class updated
  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('medtrack_theme', theme);
  }, [theme]);

  // Recalculate score whenever tasks, syllabus, health, focus, etc change
  const refreshScoresAndState = async (forceUser?: any) => {
    const activeUser = forceUser !== undefined ? forceUser : currentUser;
    if (activeUser) {
      try {
        const [
          dbTasks,
          dbPostings,
          dbCases,
          dbAttendance,
          dbExams,
          dbRevisions,
          dbFlashcards,
          dbHealth,
          dbDeviceConns,
          dbChat
        ] = await Promise.all([
          taskService.getTasks(activeUser.id),
          clinicalService.getClinicalPostings(activeUser.id),
          clinicalService.getCaseLogs(activeUser.id),
          attendanceService.getAttendance(activeUser.id),
          examService.getExams(activeUser.id),
          examService.getRevisionQueue(activeUser.id),
          examService.getFlashcards(activeUser.id),
          healthService.getHealthMetrics(activeUser.id),
          healthService.getDeviceConnections(activeUser.id),
          aiService.getChatHistory(activeUser.id)
        ].map(p => p.catch(err => { console.error(err); return []; }))) as [any, any, any, any, any, any, any, any, any, any];

        setTasks(dbTasks);
        setClinicalPostings(dbPostings);
        setCaseLogs(dbCases);
        setAttendance(dbAttendance);
        setExams(dbExams);
        setRevisionQueue(dbRevisions);
        setFlashcards(dbFlashcards);
        setHealthMetrics(dbHealth);
        setDeviceConnections(dbDeviceConns);
        setAIChatHistory(dbChat);

        const { score, breakdown } = db.calculateTodayScore();
        setTodayScore(score);
        setTodayScoreBreakdown(breakdown);
      } catch (err) {
        console.error("Error loading data from Supabase:", err);
      }
    } else {
      const currentProfile = db.getProfile();
      const currentSubjects = db.getSubjects();
      const currentSyllabus = db.getSyllabus();
      const currentTasks = db.getTasks();
      const currentPostings = db.getClinicalPostings();
      const currentCaseLogs = db.getCaseLogs();
      const currentAttendance = db.getAttendance();
      const currentExams = db.getExams();
      const currentRevision = db.getRevisionQueue();
      const currentFlashcards = db.getFlashcards();
      const currentAttempts = db.getMCQAttempts();
      const currentHealth = db.getHealthMetrics();
      const currentFocus = db.getFocusSessions();
      const currentJournal = db.getJournalEntries();
      const currentConnections = db.getDeviceConnections();
      const currentChat = db.getAIChatHistory();

      setProfile(currentProfile);
      setSubjects(currentSubjects);
      setSyllabus(currentSyllabus);
      setTasks(currentTasks);
      setClinicalPostings(currentPostings);
      setCaseLogs(currentCaseLogs);
      setAttendance(currentAttendance);
      setExams(currentExams);
      setRevisionQueue(currentRevision);
      setFlashcards(currentFlashcards);
      setMCQAttempts(currentAttempts);
      setHealthMetrics(currentHealth);
      setFocusSessions(currentFocus);
      setJournalEntries(currentJournal);
      setDeviceConnections(currentConnections);
      setAIChatHistory(currentChat);

      const { score, breakdown } = db.calculateTodayScore();
      setTodayScore(score);
      setTodayScoreBreakdown(breakdown);
    }
  };

  useEffect(() => {
    // Check session
    authService.getUser().then(u => {
      setCurrentUser(u);
      refreshScoresAndState(u);
    }).catch(() => {
      refreshScoresAndState(null);
    });

    const sub = authService.onAuthStateChange((_event, session) => {
      const u = session?.user || null;
      setCurrentUser(u);
      refreshScoresAndState(u);
      if (u) {
        setIsOnboarded(true);
      }
    });

    return () => {
      sub.unsubscribe();
    };
  }, []);

  // Update onboarded state
  const handleSetIsOnboarded = (val: boolean) => {
    setIsOnboarded(val);
    localStorage.setItem('medtrack_onboarded', val ? 'true' : 'false');
    if (val) {
      refreshScoresAndState();
    }
  };

  // Helper to handle gamification XP gains and popup rewards
  const gainXpPoints = (amount: number) => {
    const currentLevel = db.getProfile().level;
    const result = db.earnXp(amount);
    
    if (result.level > currentLevel) {
      setLevelUpNotification({ show: true, level: result.level });
    }
    
    if (result.unlockedBadge) {
      setBadgeNotification({
        show: true,
        name: result.unlockedBadge.name,
        desc: result.unlockedBadge.description
      });
    }

    refreshScoresAndState();
  };

  // CRUD Wrapper Operations
  const updateProfile = async (profileData: Partial<UserProfile>) => {
    if (currentUser) {
      try {
        await supabase
          .from('profiles')
          .update({
            full_name: profileData.name,
            college: profileData.college,
            mbbs_year: profileData.mbbsYear === '1st MBBS' ? 1 : profileData.mbbsYear === '2nd MBBS' ? 2 : profileData.mbbsYear === '3rd MBBS' ? 3 : 4,
            semester: profileData.semester,
            daily_study_target: profileData.dailyStudyTarget,
            daily_step_target: profileData.dailyStepTarget,
            daily_sleep_target: profileData.sleepTarget
          })
          .eq('id', currentUser.id);
      } catch (err) {
        console.error(err);
      }
    }
    db.updateProfile(profileData);
    refreshScoresAndState();
  };

  const addSubject = async (subData: Omit<Subject, 'id' | 'progress' | 'studyHours'>) => {
    if (currentUser) {
      try {
        await studyService.addSubject(currentUser.id, subData);
      } catch (err) {
        console.error(err);
      }
    }
    db.addSubject(subData);
    gainXpPoints(30); // XP for adding subject
    refreshScoresAndState();
  };

  const updateSyllabusTopic = async (id: string, status: SyllabusTopic['status']) => {
    if (currentUser) {
      try {
        await studyService.updateSyllabusTopic(currentUser.id, id, status);
      } catch (err) {
        console.error(err);
      }
    }
    db.updateSyllabusTopic(id, status);
    if (status === 'Completed') gainXpPoints(20);
    if (status === 'Revised') gainXpPoints(15);
    refreshScoresAndState();
  };

  const addTask = async (taskData: Omit<Task, 'id'>) => {
    if (currentUser) {
      try {
        await taskService.addTask(currentUser.id, taskData);
      } catch (err) {
        console.error(err);
      }
    }
    db.addTask(taskData);
    refreshScoresAndState();
  };

  const updateTask = async (taskData: Task) => {
    const oldTask = tasks.find(t => t.id === taskData.id);
    if (currentUser) {
      try {
        await taskService.updateTask(currentUser.id, taskData);
      } catch (err) {
        console.error(err);
      }
    }
    db.updateTask(taskData);
    if (taskData.isCompleted && !oldTask?.isCompleted) {
      gainXpPoints(10); // 10 XP for task completion
    }
    refreshScoresAndState();
  };

  const deleteTask = async (id: string) => {
    if (currentUser) {
      try {
        await taskService.deleteTask(currentUser.id, id);
      } catch (err) {
        console.error(err);
      }
    }
    db.deleteTask(id);
    refreshScoresAndState();
  };

  const addClinicalPosting = async (postData: Omit<ClinicalPosting, 'id' | 'casesCount' | 'proceduresObserved' | 'proceduresPerformed' | 'completed'>) => {
    if (currentUser) {
      try {
        await clinicalService.addClinicalPosting(currentUser.id, postData);
      } catch (err) {
        console.error(err);
      }
    }
    db.addClinicalPosting(postData);
    gainXpPoints(50);
    refreshScoresAndState();
  };

  const updateClinicalPosting = async (postingData: ClinicalPosting) => {
    if (currentUser) {
      try {
        await supabase
          .from('clinical_postings')
          .update({
            department: postingData.department,
            mentor: postingData.mentor,
            location: postingData.ward,
            completed: postingData.completed,
            notes: postingData.notes
          })
          .eq('id', postingData.id)
          .eq('user_id', currentUser.id);
      } catch (err) {
        console.error(err);
      }
    }
    db.updateClinicalPosting(postingData);
    refreshScoresAndState();
  };

  const addCaseLog = async (caseData: Omit<CaseLog, 'id'>) => {
    if (currentUser) {
      try {
        await clinicalService.addCaseLog(currentUser.id, caseData);
      } catch (err) {
        console.error(err);
      }
    }
    db.addCaseLog(caseData);
    gainXpPoints(15); // 15 XP for logging a clinical case
    refreshScoresAndState();
  };

  const deleteCaseLog = async (id: string) => {
    if (currentUser) {
      try {
        await clinicalService.deleteCaseLog(currentUser.id, id);
      } catch (err) {
        console.error(err);
      }
    }
    db.deleteCaseLog(id);
    refreshScoresAndState();
  };

  const updateAttendance = async (record: AttendanceRecord) => {
    if (currentUser) {
      try {
        await attendanceService.updateAttendance(currentUser.id, record);
      } catch (err) {
        console.error(err);
      }
    }
    db.updateAttendance(record);
    refreshScoresAndState();
  };

  const addExam = async (examData: Omit<Exam, 'id' | 'status'>) => {
    if (currentUser) {
      try {
        await examService.addExam(currentUser.id, examData);
      } catch (err) {
        console.error(err);
      }
    }
    db.addExam(examData);
    refreshScoresAndState();
  };

  const deleteExam = async (id: string) => {
    if (currentUser) {
      try {
        await examService.deleteExam(currentUser.id, id);
      } catch (err) {
        console.error(err);
      }
    }
    db.deleteExam(id);
    refreshScoresAndState();
  };

  const updateRevisionItem = async (id: string, status: RevisionItem['status'], stageIncrease = 0) => {
    if (currentUser) {
      try {
        const item = revisionQueue.find(r => r.id === id);
        if (item) {
          await examService.updateRevisionItem(currentUser.id, id, status, item.stage);
        }
      } catch (err) {
        console.error(err);
      }
    }
    db.updateRevisionItem(id, status, stageIncrease);
    if (status === 'Revised') {
      gainXpPoints(15);
    }
    refreshScoresAndState();
  };

  const updateFlashcard = async (id: string, quality: 'easy' | 'medium' | 'hard') => {
    if (currentUser) {
      try {
        await examService.updateFlashcard(currentUser.id, id, quality);
      } catch (err) {
        console.error(err);
      }
    }
    db.updateFlashcardBox(id, quality);
    gainXpPoints(5); // 5 XP per flashcard reviewed
    refreshScoresAndState();
  };

  const addMCQAttempt = async (attemptData: Omit<MCQAttempt, 'id' | 'date' | 'accuracy'>) => {
    if (currentUser) {
      try {
        const { data: firstQ } = await supabase.from('mcq_questions').select('id').limit(1).single();
        if (firstQ) {
          await supabase.from('mcq_attempts').insert({
            user_id: currentUser.id,
            question_id: firstQ.id,
            selected_answer: 'A',
            is_correct: attemptData.correctAnswers > 0,
            time_taken_seconds: 30
          });
        }
      } catch (err) {
        console.error(err);
      }
    }
    db.addMCQAttempt(attemptData);
    const xpGained = Math.round(attemptData.correctAnswers * 5); // 5 XP per correct answer
    gainXpPoints(xpGained);
    refreshScoresAndState();
  };

  const updateTodayHealth = async (healthData: Partial<HealthMetric>) => {
    if (currentUser) {
      try {
        await healthService.updateTodayHealth(currentUser.id, healthData);
      } catch (err) {
        console.error(err);
      }
    }
    db.updateTodayHealthMetric(healthData);
    refreshScoresAndState();
  };

  const addFocusSession = async (focusData: Omit<FocusSession, 'id' | 'date'>) => {
    if (currentUser) {
      try {
        await studyService.addFocusSession(currentUser.id, focusData);
      } catch (err) {
        console.error(err);
      }
    }
    db.addFocusSession(focusData);
    const xpGained = Math.round((focusData.duration / 25) * 10); // 10 XP per 25 min Pomodoro
    gainXpPoints(xpGained);
    refreshScoresAndState();
  };

  const saveJournalEntry = async (date: string, entryData: Omit<JournalEntry, 'date'>) => {
    if (currentUser) {
      try {
        await supabase.from('journal_entries').upsert({
          user_id: currentUser.id,
          entry_date: date,
          content: entryData.entry,
          mood: entryData.mood
        }, { onConflict: 'user_id,entry_date' });
      } catch (err) {
        console.error(err);
      }
    }
    db.saveJournalEntry(date, entryData);
    gainXpPoints(10); // XP for reflection
    refreshScoresAndState();
  };

  const toggleDeviceConnection = async (provider: DeviceConnection['provider']) => {
    const conn = deviceConnections.find(c => c.provider === provider);
    const newStatus = !conn?.connected;

    if (currentUser) {
      try {
        await healthService.toggleDeviceConnection(currentUser.id, provider, newStatus);
      } catch (err) {
        console.error(err);
      }
    }
    db.updateDeviceConnection(provider, newStatus);
    
    // Simulate initial data pull on connection
    if (newStatus) {
      const todayMetric = db.getTodayHealthMetric();
      db.updateTodayHealthMetric({
        steps: todayMetric.steps === 0 ? 6430 : todayMetric.steps,
        sleep: todayMetric.sleep === 0 ? 7.2 : todayMetric.sleep,
        calories: todayMetric.calories === 0 ? 1750 : todayMetric.calories,
        exercise: todayMetric.exercise === 0 ? 30 : todayMetric.exercise,
        heartRate: todayMetric.heartRate || 72,
        hrv: todayMetric.hrv || 65
      });
      gainXpPoints(20);
    }
    
    refreshScoresAndState();
  };

  // AI medical query simulator
  const sendAIMessage = async (content: string) => {
    if (!content.trim()) return;
    
    // 1. Add user message
    db.addAIChatMessage('user', content);
    refreshScoresAndState();

    if (currentUser) {
      try {
        await aiService.sendMessage(content);
        const history = await aiService.getChatHistory(currentUser.id);
        setAIChatHistory(history);
        return;
      } catch (err) {
        console.error(err);
      }
    }

    // 2. Simulate AI thinking delay
    setTimeout(() => {
      let response = '';
      const lowerQuery = content.toLowerCase();

      // Clinical cases
      if (lowerQuery.includes('nephrotic') || lowerQuery.includes('minimal change')) {
        response = `📚 **MBBS Study Guide: Minimal Change Disease (Nephrotic Syndrome)**\n\n* **Definition**: A primary glomerular disease characterized clinically by nephrotic syndrome and pathologically by effacement of podocyte foot processes on electron microscopy (EM).\n* **Pathogenesis**: Cytokine-mediated injury causes loss of glomerular basement membrane polyanion charges, leading to selective proteinuria (mainly Albumin).\n* **Clinical Features**: Massive proteinuria (>3.5g/day), generalized edema (anasarca), hypoalbuminemia (<3g/dL), and hyperlipidemia.\n* **Microscopy**:\n  - *Light Microscopy (LM)*: Normal glomeruli.\n  - *Immunofluorescence (IF)*: Negative (no immune deposits).\n  - *Electron Microscopy (EM)*: Diffuse podocyte foot process effacement.\n* **Treatment**: Highly responsive to Corticosteroids (Prednisone).\n\n⚠️ *Disclaimer: This information is for educational preparation purposes for MBBS coursework/exams and should not replace formal clinical diagnosis or patient management guidelines.*`;
      } 
      else if (lowerQuery.includes('dka') || lowerQuery.includes('diabetic ketoacidosis')) {
        response = `🩺 **Clinical Case Guide: Diabetic Ketoacidosis (DKA)**\n\n* **Diagnostic Triad**:\n  1. Hyperglycemia (Blood glucose >250 mg/dL)\n  2. Metabolic Acidosis (pH <7.3, HCO3 <18 mEq/L, high anion gap)\n  3. Ketosis (Positive serum/urine ketones)\n* **Management Protocol**:\n  1. **Fluid Resuscitation**: Start with 0.9% Normal Saline (1-1.5 L in the 1st hour) to restore vascular volume.\n  2. **Insulin Therapy**: Continuous IV infusion of Regular Insulin (0.1 units/kg/hr) *only* if serum potassium is >3.3 mEq/L.\n  3. **Electrolyte Management**: Potassium levels drop rapidly under insulin therapy. Co-administer potassium if level is between 3.3 - 5.3 mEq/L.\n  4. **Monitor**: Check capillary glucose hourly and blood gases/electrolytes every 2-4 hours.\n\n⚠️ *Disclaimer: For educational simulation only. Clinical decisions must follow official institutional guidelines and senior consultant supervision.*`;
      }
      else if (lowerQuery.includes('tuberculosis') || lowerQuery.includes('rifampin')) {
        response = `💊 **Pharmacology Spotlight: First-Line Anti-Tubercular Drugs (HRZE)**\n\n1. **Isoniazid (H)**:\n   - *Mechanism*: Inhibits mycolic acid synthesis.\n   - *Side Effect*: Peripheral neuropathy (prevented with Pyridoxine/Vit B6), hepatotoxicity.\n2. **Rifampin (R)**:\n   - *Mechanism*: Inhibits DNA-dependent RNA polymerase.\n   - *Side Effect*: Reddish-orange discoloration of body secretions, CYP450 enzyme inducer.\n3. **Pyrazinamide (Z)**:\n   - *Mechanism*: Disrupts cell membrane metabolism.\n   - *Side Effect*: Hepatotoxicity, hyperuricemia (gouty arthritis).\n4. **Ethambutol (E)**:\n   - *Mechanism*: Inhibits arabosyl transferase (cell wall synthesis).\n   - *Side Effect*: Optic neuritis (red-green color blindness - *remember: E for Eye*).\n\n⚠️ *Disclaimer: Provided as coursework reference support.*`;
      }
      else if (lowerQuery.includes('week') || lowerQuery.includes('productivity') || lowerQuery.includes('how was my')) {
        const avgScore = todayScore;
        const totalHours = subjects.reduce((sum, s) => sum + s.studyHours, 0);
        response = `🤖 **MedTrack AI Weekly Insights**\n\nOver the past week, you maintained an average daily **MedTrack Score of ${avgScore}/100**. Excellent consistency!\n\n**Academic Output**:\n- Total Active Study: **${totalHours} hours** logged.\n- Strongest Area: **Pathology** (78% topic completion).\n- Area Needing Attention: **Microbiology** (attendance is currently **73.3%**, which is below your 75% target. Make sure to attend the next 2 lectures to clear the warning threshold).\n\n**Health Correlation**:\n- Your MCQ accuracy increased by **12%** on days where you logged a sleep duration of at least **7 hours**. Consider maintaining a strict bedtime routine before exam prep nights.`;
      }
      else if (lowerQuery.includes('tomorrow') || lowerQuery.includes('focus') || lowerQuery.includes('plan')) {
        response = `🤖 **AI-Generated Tomorrow Plan**\n\nBased on your current syllabus status and upcoming exams, here is your plan for tomorrow:\n\n1. **Clinical Ward posting (09:00 AM)**: You have General Medicine Posting. Revise cardiovascular percussion techniques tonight.\n2. **High Priority Topic**: **Pathology - Glomerular Diseases** is currently flagged as *Needs Revision*. Schedule a 45-minute study slot.\n3. **MCQ Target**: Solve 10 questions on CVS Pharmacology to improve your Pharmacology accuracy.\n4. **Health Alert**: Your step count has been below target. Try taking a 20-minute walk after clinical postings.`;
      }
      else if (lowerQuery.includes('mcv') || lowerQuery.includes('anemia')) {
        response = `🩸 **Anemia Morphological Classification Guide**\n\n* **Microcytic (MCV < 80 fL)**: Iron deficiency anemia, Thalassemia, Lead poisoning, Anemia of chronic disease (late stage).\n* **Normocytic (MCV 80 - 100 fL)**: Acute blood loss, Hemolysis, Aplastic anemia, Renal failure anemia.\n* **Macrocytic (MCV > 100 fL)**:\n  - *Megaloblastic*: Vitamin B12 deficiency, Folate deficiency (hypersegmented neutrophils visible).\n  - *Non-Megaloblastic*: Alcoholism, Liver disease, Hypothyroidism.\n\n⚠️ *Disclaimer: For study and MCQ prep only.*`;
      }
      else {
        response = `🤖 **MedTrack AI Assistant**\n\nI have scanned your MBBS dashboard data:\n- Current Year: **${profile.mbbsYear}**\n- Subjects: **${subjects.map(s => s.name).join(', ')}**\n- Current Daily Score: **${todayScore}/100**\n\nYour question: "${content}" touches on medical studies/clinical life. You can ask me to explain medical syndromes (e.g. "Explain DKA", "Explain Nephrotic Syndrome"), review your study metrics ("How is my week?"), or compile a schedule ("Suggest a plan for tomorrow").\n\n⚠️ *Disclaimer: Educational medical assistant. All information is for exam preparation purposes. Do not use for clinical diagnosis of real patients.*`;
      }

      db.addAIChatMessage('assistant', response);
      refreshScoresAndState();
    }, 1000);
  };

  const clearAIChat = async () => {
    if (currentUser) {
      try {
        await aiService.clearChat(currentUser.id);
      } catch (err) {
        console.error(err);
      }
    }
    db.clearAIChatHistory();
    refreshScoresAndState();
  };

  const syncHealthData = async () => {
    if (currentUser) {
      try {
        await healthService.syncHealthData(currentUser.id);
        await refreshScoresAndState();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const deleteHealthData = async () => {
    if (currentUser) {
      try {
        await healthService.deleteHealthData(currentUser.id);
        await refreshScoresAndState();
      } catch (err) {
        console.error(err);
      }
    }
  };

  const signUp = async (email: string, password: string, fullName: string, college: string) => {
    return await authService.signUp(email, password, fullName, college);
  };

  const signIn = async (email: string, password: string) => {
    return await authService.signIn(email, password);
  };

  const signOut = async () => {
    await authService.signOut();
    setCurrentUser(null);
    refreshScoresAndState(null);
  };

  return (
    <AppContext.Provider
      value={{
        profile,
        subjects,
        syllabus,
        tasks,
        clinicalPostings,
        caseLogs,
        attendance,
        exams,
        revisionQueue,
        flashcards,
        mcqQuestions: db.getMCQQuestions(),
        mcqAttempts,
        healthMetrics,
        focusSessions,
        journalEntries,
        deviceConnections,
        aiChatHistory,
        todayScore,
        todayScoreBreakdown,
        currentView,
        setCurrentView,
        theme,
        setTheme,
        isOnboarded,
        setIsOnboarded: handleSetIsOnboarded,
        
        currentUser,
        signUp,
        signIn,
        signOut,
        syncHealthData,
        deleteHealthData,

        updateProfile,
        addSubject,
        updateSyllabusTopic,
        addTask,
        updateTask,
        deleteTask,
        addClinicalPosting,
        updateClinicalPosting,
        addCaseLog,
        deleteCaseLog,
        updateAttendance,
        addExam,
        deleteExam,
        updateRevisionItem,
        updateFlashcard,
        addMCQAttempt,
        updateTodayHealth,
        addFocusSession,
        saveJournalEntry,
        toggleDeviceConnection,
        sendAIMessage,
        clearAIChat,
        gainXpPoints,
        
        levelUpNotification,
        setLevelUpNotification,
        badgeNotification,
        setBadgeNotification
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
