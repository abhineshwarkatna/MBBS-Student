export interface UserProfile {
  name: string;
  mbbsYear: '1st MBBS' | '2nd MBBS' | '3rd MBBS' | 'Final Year';
  semester: string;
  college: string;
  targetPercentage: number;
  dailyStudyTarget: number; // in hours
  wakeTime: string; // "hh:mm"
  sleepTime: string; // "hh:mm"
  dailyStepTarget: number;
  sleepTarget: number; // in hours
  waterTarget: number; // in glasses
  exerciseTarget: number; // in minutes
  xp: number;
  level: number;
  badges: Badge[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
}

export interface Subject {
  id: string;
  name: string;
  progress: number; // 0 - 100
  studyHours: number;
  examWeight: 'High' | 'Medium' | 'Low';
}

export interface SyllabusTopic {
  id: string;
  subjectId: string;
  unit: string;
  name: string;
  status: 'Not Started' | 'Learning' | 'Completed' | 'Revised' | 'Needs Revision';
  lastStudied?: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  dueTime?: string;
  priority: 'High' | 'Medium' | 'Low';
  category: 'Study' | 'Clinical' | 'Personal' | 'Other';
  durationEst: number; // in minutes
  durationAct?: number;
  isCompleted: boolean;
}

export interface ClinicalPosting {
  id: string;
  department: string;
  mentor: string;
  startDate: string;
  endDate: string;
  ward: string;
  casesCount: number;
  proceduresObserved: number;
  proceduresPerformed: number;
  completed: boolean;
  notes: string;
}

export interface CaseLog {
  id: string;
  postingId: string;
  date: string;
  complaint: string;
  diagnosis: string;
  management: string;
  learningPoints: string;
  supervisor: string;
}

export interface AttendanceRecord {
  id: string;
  subjectId: string;
  subjectName: string;
  attended: number;
  missed: number;
  requiredPercent: number; // default 75 or 80
}

export interface Exam {
  id: string;
  title: string;
  date: string;
  type: 'University' | 'Internal' | 'Practical' | 'Viva' | 'NEET-PG';
  status: 'Upcoming' | 'Completed';
}

export interface RevisionItem {
  id: string;
  subjectId: string;
  topicId: string;
  topicName: string;
  stage: number; // Spaced repetition levels: 1, 2, 3, 4, 5
  dueDate: string;
  status: 'Needs Revision' | 'Due Soon' | 'Revised';
}

export interface Flashcard {
  id: string;
  subjectId: string;
  question: string;
  answer: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  nextDueDate: string;
  box: number; // Leitner box
}

export interface MCQQuestion {
  id: string;
  subjectId: string;
  topicId?: string;
  question: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface MCQAttempt {
  id: string;
  subjectId: string;
  date: string;
  totalQuestions: number;
  correctAnswers: number;
  accuracy: number;
}

export interface HealthMetric {
  date: string;
  steps: number;
  sleep: number; // hours
  calories: number;
  exercise: number; // minutes
  water: number; // glasses
  heartRate: number; // bpm
  hrv: number; // ms
}

export interface FocusSession {
  id: string;
  subjectId: string;
  topicId?: string;
  topicName: string;
  duration: number; // in minutes
  date: string;
}

export interface JournalEntry {
  date: string;
  entry: string;
  mood: 'Excellent' | 'Good' | 'Normal' | 'Low' | 'Very Low';
  achievements: string;
  priorityTomorrow: string;
}

export interface DeviceConnection {
  provider: 'Smartwatch' | 'Google Fit' | 'Apple Health' | 'Google Health' | 'Strava' | string;
  connected: boolean;
  lastSync: string;
}

export interface AIChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
