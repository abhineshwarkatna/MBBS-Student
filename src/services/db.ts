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
  AIChatMessage,
  Badge
} from '../types';

// Constants for Local Storage
const DB_KEY = 'medtrack_ai_database';

interface DatabaseSchema {
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
  journalEntries: Record<string, JournalEntry>; // key is date YYYY-MM-DD
  deviceConnections: DeviceConnection[];
  aiChatHistory: AIChatMessage[];
  unlockedAchievements: string[]; // Badge IDs
}

// 15 Realistic Medical MCQs
const SEED_MCQ_QUESTIONS: MCQQuestion[] = [
  {
    id: 'q1',
    subjectId: 'sub-path',
    question: 'A 6-year-old boy presents with generalized edema, hypoalbuminemia, and massive proteinuria (4.5 g/24h). Light microscopy of a renal biopsy reveals normal-appearing glomeruli. What is the most likely diagnosis?',
    options: [
      'Membranous Glomerulonephritis',
      'Minimal Change Disease',
      'Focal Segmental Glomerulosclerosis',
      'Post-Streptococcal Glomerulonephritis'
    ],
    correctOptionIndex: 1,
    explanation: 'Minimal Change Disease (MCD) is the most common cause of nephrotic syndrome in children. Light microscopy shows normal glomeruli, but electron microscopy reveals effacement of podocyte foot processes.'
  },
  {
    id: 'q2',
    subjectId: 'sub-pharm',
    question: 'A patient undergoing treatment for pulmonary tuberculosis notices that their urine, tears, and sweat have turned a reddish-orange color. Which of the following anti-tubercular drugs is most likely responsible?',
    options: [
      'Isoniazid',
      'Ethambutol',
      'Rifampin',
      'Pyrazinamide'
    ],
    correctOptionIndex: 2,
    explanation: 'Rifampin is known to cause harmless reddish-orange discoloration of bodily fluids. It works by inhibiting bacterial DNA-dependent RNA polymerase.'
  },
  {
    id: 'q3',
    subjectId: 'sub-path',
    question: 'During acute inflammation, which mediator is primarily responsible for the initial rapid increase in vascular permeability and vasodilation in the venules?',
    options: [
      'Bradykinin',
      'Histamine',
      'Leukotriene B4',
      'C5a anaphylatoxin'
    ],
    correctOptionIndex: 1,
    explanation: 'Histamine, released by mast cell degranulation, is the primary mediator of the immediate transient phase of increased vascular permeability, acting on H1 receptors.'
  },
  {
    id: 'q4',
    subjectId: 'sub-pharm',
    question: 'A 45-year-old patient diagnosed with bronchial asthma presents with hypertension. Which of the following antihypertensive agents is strictly contraindicated in this patient?',
    options: [
      'Amlodipine',
      'Propranolol',
      'Enalapril',
      'Losartan'
    ],
    correctOptionIndex: 1,
    explanation: 'Propranolol is a non-selective beta-blocker. Blocking beta-2 receptors in the lungs causes bronchoconstriction, which can precipitate a life-threatening asthma attack.'
  },
  {
    id: 'q5',
    subjectId: 'sub-micro',
    question: 'A 24-year-old medical student presents with fever, dry cough, and patchy bilateral infiltrates on a chest X-ray. Sputum gram stain shows no organisms, and routine culture is negative. Cold agglutinin test is positive. What is the causative agent?',
    options: [
      'Streptococcus pneumoniae',
      'Mycoplasma pneumoniae',
      'Mycobacterium tuberculosis',
      'Klebsiella pneumoniae'
    ],
    correctOptionIndex: 1,
    explanation: 'Mycoplasma pneumoniae is a common cause of atypical pneumonia ("walking pneumonia") in young adults, characterized by positive cold agglutinin titers and lack of cell wall (making beta-lactams ineffective).'
  },
  {
    id: 'q6',
    subjectId: 'sub-path',
    question: 'A 55-year-old male with a history of deep vein thrombosis suddenly develops severe chest pain and dyspnea. Autopsy later reveals a saddle embolus blocking the pulmonary artery bifurcation. Which of the following is the most common source of such emboli?',
    options: [
      'Right atrium',
      'Deep leg veins (e.g., Femoral vein)',
      'Superficial saphenous veins',
      'Portal venous system'
    ],
    correctOptionIndex: 1,
    explanation: 'Over 95% of pulmonary emboli arise from thrombi in the deep veins of the lower extremity (DVT), particularly above the knee in the popliteal, femoral, and iliac veins.'
  },
  {
    id: 'q7',
    subjectId: 'sub-pharm',
    question: 'Which of the following adverse effects is uniquely associated with the administration of Doxorubicin (Adriamycin) for cancer chemotherapy?',
    options: [
      'Pulmonary fibrosis',
      'Cardiotoxicity (dilated cardiomyopathy)',
      'Hemorrhagic cystitis',
      'Ototoxicity and nephrotoxicity'
    ],
    correctOptionIndex: 1,
    explanation: 'Doxorubicin is cardiotoxic and can cause dilated cardiomyopathy due to iron-dependent oxygen free-radical generation. Hemorrhagic cystitis is caused by cyclophosphamide, pulmonary fibrosis by bleomycin.'
  },
  {
    id: 'q8',
    subjectId: 'sub-micro',
    question: 'An 8-year-old child presents with bloody diarrhea and abdominal cramps after eating an undercooked hamburger. Stool culture shows a gram-negative rod that does not ferment sorbitol. What serious complication is this patient at risk for?',
    options: [
      'Toxic megacolon',
      'Guillain-Barré syndrome',
      'Hemolytic Uremic Syndrome (HUS)',
      'Pseudomembranous colitis'
    ],
    correctOptionIndex: 2,
    explanation: 'Sorbitol-negative E. coli (O157:H7) produces Shiga-like toxin (verotoxin), which destroys glomerular endothelial cells, leading to Hemolytic Uremic Syndrome (HUS) (microangiopathic hemolytic anemia, thrombocytopenia, acute renal failure).'
  },
  {
    id: 'q9',
    subjectId: 'sub-path',
    question: 'A 60-year-old man presents with chronic fatigue and pallor. A peripheral blood smear shows microcytic, hypochromic red blood cells. Serum ferritin is low, and total iron-binding capacity (TIBC) is elevated. What is the most appropriate next clinical step?',
    options: [
      'Initiate oral iron supplementation immediately and follow up in 3 months',
      'Order a colonoscopy to check for occult gastrointestinal bleeding',
      'Perform a bone marrow biopsy to rule out myelodysplastic syndrome',
      'Administer intramuscular Vitamin B12 injections'
    ],
    correctOptionIndex: 1,
    explanation: 'In older adults, microcytic hypochromic anemia indicates iron deficiency. The primary cause is occult GI blood loss (e.g., from colon cancer) until proven otherwise. A colonoscopy is essential.'
  },
  {
    id: 'q10',
    subjectId: 'sub-pharm',
    question: 'An organophosphate pesticide poisoning case is brought to the emergency department. The patient exhibits miosis, bradycardia, salivation, lacrimation, and muscle fasciculations. What is the pharmacological mechanism of action of the antidote Pralidoxime?',
    options: [
      'Competitive blockade of muscarinic receptors',
      'Reactivation of acetylcholinesterase enzyme',
      'Direct stimulation of nicotinic receptors',
      'Inhibition of acetylcholine release'
    ],
    correctOptionIndex: 1,
    explanation: 'Pralidoxime (2-PAM) is a cholinesterase reactivator that binds to the organophosphate-inactivated acetylcholinesterase, removing the phosphate group and restoring enzyme function. Atropine acts by blocking muscarinic receptors.'
  }
];

const SEED_BADGES: Badge[] = [
  { id: 'b1', name: 'Early Bird', description: 'Log wake-up time before 6:30 AM.', icon: 'Sunrise', unlockedAt: '' },
  { id: 'b2', name: 'Dedicated Learner', description: 'Log a total of 25 study hours.', icon: 'BookOpen', unlockedAt: '' },
  { id: 'b3', name: 'MCQ Specialist', description: 'Achieve >85% accuracy in a quiz of 10+ questions.', icon: 'BrainCircuit', unlockedAt: '' },
  { id: 'b4', name: 'Clinical Observer', description: 'Log 5 distinct clinical cases in the case book.', icon: 'ClipboardList', unlockedAt: '' },
  { id: 'b5', name: 'Hydration Champion', description: 'Meet daily water goals 5 days in a row.', icon: 'Droplet', unlockedAt: '' },
  { id: 'b6', name: 'Streak Master', description: 'Maintain a 7-day study schedule streak.', icon: 'Flame', unlockedAt: '' }
];

// Helper to format date relative to today (YYYY-MM-DD)
export function getRelativeDateString(daysOffset: number): string {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split('T')[0];
}

// Generate Mock Seed Database
function generateSeedDatabase(): DatabaseSchema {
  const profile: UserProfile = {
    name: 'Abhineshwar',
    mbbsYear: '3rd MBBS',
    semester: '6th Semester',
    college: 'AIIMS Delhi',
    targetPercentage: 80,
    dailyStudyTarget: 4.5,
    wakeTime: '06:00',
    sleepTime: '23:00',
    dailyStepTarget: 10000,
    sleepTarget: 7.5,
    waterTarget: 8,
    exerciseTarget: 45,
    xp: 450,
    level: 5,
    badges: [
      { ...SEED_BADGES[0], unlockedAt: getRelativeDateString(-10) },
      { ...SEED_BADGES[1], unlockedAt: getRelativeDateString(-5) },
      { ...SEED_BADGES[3], unlockedAt: getRelativeDateString(-2) }
    ]
  };

  const subjects: Subject[] = [
    { id: 'sub-path', name: 'Pathology', progress: 78, studyHours: 24, examWeight: 'High' },
    { id: 'sub-pharm', name: 'Pharmacology', progress: 72, studyHours: 22, examWeight: 'High' },
    { id: 'sub-micro', name: 'Microbiology', progress: 65, studyHours: 14, examWeight: 'Medium' },
    { id: 'sub-forensic', name: 'Forensic Medicine', progress: 54, studyHours: 8, examWeight: 'Low' }
  ];

  const syllabus: SyllabusTopic[] = [
    // Pathology
    { id: 't-path-1', subjectId: 'sub-path', unit: 'General Pathology', name: 'Acute and Chronic Inflammation', status: 'Completed', lastStudied: getRelativeDateString(-4) },
    { id: 't-path-2', subjectId: 'sub-path', unit: 'General Pathology', name: 'Hemodynamic Disorders & Thromboembolism', status: 'Revised', lastStudied: getRelativeDateString(-2) },
    { id: 't-path-3', subjectId: 'sub-path', unit: 'Systemic Pathology', name: 'Atherosclerosis and Hypertension', status: 'Learning', lastStudied: getRelativeDateString(-1) },
    { id: 't-path-4', subjectId: 'sub-path', unit: 'Systemic Pathology', name: 'Glomerular Diseases (Nephrotic vs Nephritic)', status: 'Needs Revision', lastStudied: getRelativeDateString(-5) },
    { id: 't-path-5', subjectId: 'sub-path', unit: 'Systemic Pathology', name: 'Neoplasia and Tumor Suppressor Genes', status: 'Not Started' },
    // Pharmacology
    { id: 't-pharm-1', subjectId: 'sub-pharm', unit: 'General Pharmacology', name: 'Pharmacokinetics: Absorption & Metabolism', status: 'Completed', lastStudied: getRelativeDateString(-8) },
    { id: 't-pharm-2', subjectId: 'sub-pharm', unit: 'ANS Pharmacology', name: 'Cholinergic and Adrenergic Agonists', status: 'Revised', lastStudied: getRelativeDateString(-3) },
    { id: 't-pharm-3', subjectId: 'sub-pharm', unit: 'CVS Pharmacology', name: 'Antihypertensive Agents', status: 'Learning', lastStudied: getRelativeDateString(-1) },
    { id: 't-pharm-4', subjectId: 'sub-pharm', unit: 'Chemotherapy', status: 'Not Started', name: 'Beta-lactam Antibiotics' },
    // Microbiology
    { id: 't-micro-1', subjectId: 'sub-micro', unit: 'General Bacteriology', name: 'Bacterial Cell Wall and Gram Staining', status: 'Completed', lastStudied: getRelativeDateString(-11) },
    { id: 't-micro-2', subjectId: 'sub-micro', unit: 'Systemic Bacteriology', name: 'Mycobacterium tuberculosis', status: 'Revised', lastStudied: getRelativeDateString(-6) },
    { id: 't-micro-3', subjectId: 'sub-micro', unit: 'Virology', name: 'HIV Replication and Diagnosis', status: 'Learning', lastStudied: getRelativeDateString(-2) }
  ];

  // Clinical Postings (General Medicine Ward)
  const clinicalPostings: ClinicalPosting[] = [
    {
      id: 'cp-med',
      department: 'General Medicine',
      mentor: 'Dr. Sandeep Sharma (Professor)',
      startDate: getRelativeDateString(-15),
      endDate: getRelativeDateString(15),
      ward: 'Male Medicine Ward 3',
      casesCount: 6,
      proceduresObserved: 4,
      proceduresPerformed: 2,
      completed: false,
      notes: 'Focusing on cardiovascular examinations, pleural taps, and central line setups.'
    }
  ];

  // Case logs (MBBS logbook entries)
  const caseLogs: CaseLog[] = [
    {
      id: 'cl-1',
      postingId: 'cp-med',
      date: getRelativeDateString(-10),
      complaint: 'Polyuria, polydipsia, and altered sensorium for 1 day',
      diagnosis: 'Diabetic Ketoacidosis (DKA) secondary to poor insulin compliance',
      management: 'IV fluid resuscitation (0.9% NaCl), continuous low-dose insulin infusion, potassium replacement, hourly blood glucose and venous blood gas monitoring.',
      learningPoints: 'Calculated anion gap, understood dynamic management of potassium during insulin infusion to avoid severe hypokalemia.',
      supervisor: 'Dr. Sandeep Sharma'
    },
    {
      id: 'cl-2',
      postingId: 'cp-med',
      date: getRelativeDateString(-7),
      complaint: 'Severe fatigue, exertional dyspnea, and pallor',
      diagnosis: 'Severe Iron Deficiency Anemia (Hemoglobin: 6.2 g/dL)',
      management: 'Packed red blood cell transfusion (1 unit), started oral Ferrous Ascorbate + Folic Acid, advised diet rich in iron, scheduled colonoscopy to rule out occult GI bleeding source.',
      learningPoints: 'Observed microcytic hypochromic cells on peripheral smear, clinical examination signs: koilonychia, angular cheilitis, pale conjunctiva.',
      supervisor: 'Dr. Meera Nair (Senior Resident)'
    },
    {
      id: 'cl-3',
      postingId: 'cp-med',
      date: getRelativeDateString(-4),
      complaint: 'Fever with chills, productive cough with rusty sputum, and pleuritic chest pain for 3 days',
      diagnosis: 'Lobar Pneumonia (Streptococcus pneumoniae confirmed by sputum culture)',
      management: 'Empiric IV Ceftriaxone 1g BD, oxygen therapy via nasal cannulae (target Sat: >94%), nebulized salbutamol, paracetamol for fever.',
      learningPoints: 'Auscultated bronchial breathing, crackles, and increased vocal resonance over the right middle zone. Correlated with lobar consolidation on CXR.',
      supervisor: 'Dr. Sandeep Sharma'
    },
    {
      id: 'cl-4',
      postingId: 'cp-med',
      date: getRelativeDateString(-2),
      complaint: 'Progressive dyspnea on exertion and orthopnea',
      diagnosis: 'Rheumatic Heart Disease with Mitral Stenosis',
      management: 'Low sodium diet, Loop diuretics (Furosemide 40mg OD), Beta-blockers (Metoprolol succinate) for rate control, monthly Penicillin G prophylaxis.',
      learningPoints: 'Auscultated a low-pitched rumbling mid-diastolic murmur with an opening snap at the apex in left lateral decubitus. Learnt criteria for mitral valvuloplasty.',
      supervisor: 'Dr. Sandeep Sharma'
    }
  ];

  // Attendance
  const attendance: AttendanceRecord[] = [
    { id: 'att-1', subjectId: 'sub-path', subjectName: 'Pathology', attended: 35, missed: 5, requiredPercent: 75 },
    { id: 'att-2', subjectId: 'sub-pharm', subjectName: 'Pharmacology', attended: 32, missed: 6, requiredPercent: 75 },
    { id: 'att-3', subjectId: 'sub-micro', subjectName: 'Microbiology', attended: 22, missed: 8, requiredPercent: 75 }, // 73.3% WARNING
    { id: 'att-4', subjectId: 'sub-forensic', subjectName: 'Forensic Medicine', attended: 15, missed: 2, requiredPercent: 75 }
  ];

  // Exams
  const exams: Exam[] = [
    { id: 'ex-1', title: 'Internal Pathology & Pharmacology Test', date: getRelativeDateString(14), type: 'Internal', status: 'Upcoming' },
    { id: 'ex-2', title: 'Medicine Ward Viva & Clinical Exam', date: getRelativeDateString(16), type: 'Practical', status: 'Upcoming' },
    { id: 'ex-3', title: 'Microbiology Practical Spotters', date: getRelativeDateString(25), type: 'Practical', status: 'Upcoming' },
    { id: 'ex-4', title: 'Final 3rd Year University Examinations', date: getRelativeDateString(42), type: 'University', status: 'Upcoming' }
  ];

  // Tasks
  const tasks: Task[] = [
    { id: 'task-1', title: 'Review Pathology Nephrotic Syndrome notes', description: 'Revise MCD, FSGS, and Membranous Nephropathy pathology.', dueDate: getRelativeDateString(0), priority: 'High', category: 'Study', durationEst: 45, isCompleted: true },
    { id: 'task-2', title: 'Solve 15 Pharmacology ANS MCQs', description: 'Attempt practice questions on cholinergic agonists and blockers.', dueDate: getRelativeDateString(0), priority: 'Medium', category: 'Study', durationEst: 30, isCompleted: true },
    { id: 'task-3', title: 'Log clinical case for today', description: 'Write case details for the patient seen with DKA.', dueDate: getRelativeDateString(0), priority: 'High', category: 'Clinical', durationEst: 15, isCompleted: false },
    { id: 'task-4', title: 'Complete water tracking', description: 'Log 8 glasses of water.', dueDate: getRelativeDateString(0), priority: 'Low', category: 'Personal', durationEst: 5, isCompleted: false },
    { id: 'task-5', title: 'Submit Microbiology Assignment', description: 'Hand over Tuberculosis smear staining charts.', dueDate: getRelativeDateString(1), priority: 'High', category: 'Study', durationEst: 60, isCompleted: false }
  ];

  // Spaced Repetition Revision items
  const revisionQueue: RevisionItem[] = [
    { id: 'rev-1', subjectId: 'sub-path', topicId: 't-path-4', topicName: 'Glomerular Diseases', stage: 1, dueDate: getRelativeDateString(0), status: 'Needs Revision' },
    { id: 'rev-2', subjectId: 'sub-pharm', topicId: 't-pharm-2', topicName: 'ANS Pharmacology', stage: 3, dueDate: getRelativeDateString(1), status: 'Due Soon' },
    { id: 'rev-3', subjectId: 'sub-micro', topicId: 't-micro-2', topicName: 'Mycobacterium tuberculosis', stage: 4, dueDate: getRelativeDateString(3), status: 'Revised' }
  ];

  // Flashcards
  const flashcards: Flashcard[] = [
    { id: 'fc-1', subjectId: 'sub-path', question: 'What is the pathognomonic electron microscopic finding in Minimal Change Disease?', answer: 'Effacement (flattening) of podocyte foot processes.', difficulty: 'Easy', nextDueDate: getRelativeDateString(1), box: 2 },
    { id: 'fc-2', subjectId: 'sub-pharm', question: 'Which tuberculosis drug causes peripheral neuropathy, and how is it prevented?', answer: 'Isoniazid (INH). It is prevented by co-administering Vitamin B6 (Pyridoxine).', difficulty: 'Medium', nextDueDate: getRelativeDateString(0), box: 1 },
    { id: 'fc-3', subjectId: 'sub-micro', question: 'Which staining method is used to identify Mycobacterium tuberculosis, and what is its key chemical component?', answer: 'Ziehl-Neelsen staining (Acid-fast stain). It detects Mycolic Acid in the cell wall.', difficulty: 'Easy', nextDueDate: getRelativeDateString(2), box: 3 }
  ];

  // MCQ Attempts (14 Days)
  const mcqAttempts: MCQAttempt[] = [];
  for (let i = 14; i >= 1; i--) {
    mcqAttempts.push({
      id: `mcq-att-${i}`,
      subjectId: i % 2 === 0 ? 'sub-path' : 'sub-pharm',
      date: getRelativeDateString(-i),
      totalQuestions: 10,
      correctAnswers: Math.floor(Math.random() * 4) + 6, // 6 to 9 correct
      accuracy: 0
    });
  }
  mcqAttempts.forEach(att => att.accuracy = (att.correctAnswers / att.totalQuestions) * 100);

  // Health Metrics (14 Days)
  const healthMetrics: HealthMetric[] = [];
  const baseSteps = 8000;
  const baseSleep = 7.0;
  const baseCal = 2000;
  const baseEx = 40;
  const baseWater = 6;

  for (let i = 14; i >= 0; i--) {
    // Generate slight variances
    const randomMultiplier = 1 + (Math.random() * 0.4 - 0.2); // -20% to +20%
    const sleepDiff = Math.random() * 2.5 - 1.25; // -1.25h to +1.25h
    
    healthMetrics.push({
      date: getRelativeDateString(-i),
      steps: Math.floor(baseSteps * randomMultiplier),
      sleep: parseFloat((baseSleep + sleepDiff).toFixed(1)),
      calories: Math.floor(baseCal * randomMultiplier),
      exercise: Math.max(0, Math.floor(baseEx * randomMultiplier)),
      water: Math.floor(baseWater + Math.random() * 4),
      heartRate: Math.floor(70 + Math.random() * 10),
      hrv: Math.floor(55 + Math.random() * 20)
    });
  }

  // Focus sessions (14 Days)
  const focusSessions: FocusSession[] = [];
  for (let i = 14; i >= 1; i--) {
    if (Math.random() > 0.3) {
      focusSessions.push({
        id: `fs-${i}`,
        subjectId: i % 2 === 0 ? 'sub-path' : 'sub-pharm',
        topicName: i % 2 === 0 ? 'Glomerular Diseases' : 'ANS Drugs',
        duration: Math.random() > 0.5 ? 50 : 25,
        date: getRelativeDateString(-i)
      });
    }
  }

  // Journal Entries
  const journalEntries: Record<string, JournalEntry> = {
    [getRelativeDateString(-2)]: {
      date: getRelativeDateString(-2),
      entry: 'Attended the medicine rounds and presented the Rheumatic Heart Disease case. Felt nervous during cardiac auscultation, but Dr. Sandeep helped me locate the opening snap. Spent the afternoon reading pharmacology CVS drugs.',
      mood: 'Good',
      achievements: 'Successfully identified the mitral stenosis murmur on clinical exam.',
      priorityTomorrow: 'Revise ECG changes in acute myocardial infarction and practice pharmacology MCQs.'
    },
    [getRelativeDateString(-1)]: {
      date: getRelativeDateString(-1),
      entry: 'Decent day today. Focused mostly on pathology glomerular diseases. Min Change Disease and FSGS are finally clear. Did a Pomodoro study session. Steps were low because of rainy weather, but finished the planned reading.',
      mood: 'Normal',
      achievements: 'Completed the kidney pathology units and cleared concepts on podocyte effacement.',
      priorityTomorrow: 'Prepare clinical posting cases and look up diabetic ketoacidosis emergency protocols.'
    }
  };

  const deviceConnections: DeviceConnection[] = [
    { provider: 'Smartwatch', connected: true, lastSync: getRelativeDateString(0) + ' 09:42 AM' },
    { provider: 'Google Fit', connected: false, lastSync: 'Never' },
    { provider: 'Apple Health', connected: false, lastSync: 'Never' }
  ];

  const aiChatHistory: AIChatMessage[] = [
    { id: '1', role: 'assistant', content: 'Hello! I am your MedTrack study & clinical assistant. I can explain complex medical topics, construct customized MBBS revision plans, test you with MCQs/Viva practice, or summarize your clinical journal. How can I help you today?', timestamp: new Date().toISOString() }
  ];

  return {
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
    mcqQuestions: SEED_MCQ_QUESTIONS,
    mcqAttempts,
    healthMetrics,
    focusSessions,
    journalEntries,
    deviceConnections,
    aiChatHistory,
    unlockedAchievements: ['b1', 'b2', 'b4']
  };
}

// Database helper functions
export function getDb(): DatabaseSchema {
  const localDb = localStorage.getItem(DB_KEY);
  if (localDb) {
    try {
      return JSON.parse(localDb);
    } catch (e) {
      console.error('Failed to parse database, resetting to seed', e);
    }
  }
  const seed = generateSeedDatabase();
  saveDb(seed);
  return seed;
}

export function saveDb(db: DatabaseSchema) {
  localStorage.setItem(DB_KEY, JSON.stringify(db));
}

// PROFILE
export function getProfile(): UserProfile {
  return getDb().profile;
}

export function updateProfile(profile: Partial<UserProfile>): UserProfile {
  const db = getDb();
  db.profile = { ...db.profile, ...profile };
  saveDb(db);
  return db.profile;
}

// SUBJECTS
export function getSubjects(): Subject[] {
  return getDb().subjects;
}

export function addSubject(sub: Omit<Subject, 'id' | 'progress' | 'studyHours'>): Subject {
  const db = getDb();
  const newSub: Subject = {
    ...sub,
    id: `sub-${Date.now()}`,
    progress: 0,
    studyHours: 0
  };
  db.subjects.push(newSub);
  saveDb(db);
  return newSub;
}

export function updateSubject(sub: Subject): Subject[] {
  const db = getDb();
  db.subjects = db.subjects.map(s => s.id === sub.id ? sub : s);
  saveDb(db);
  return db.subjects;
}

// SYLLABUS
export function getSyllabus(): SyllabusTopic[] {
  return getDb().syllabus;
}

export function updateSyllabusTopic(id: string, status: SyllabusTopic['status']): SyllabusTopic[] {
  const db = getDb();
  db.syllabus = db.syllabus.map(t => {
    if (t.id === id) {
      const updated = {
        ...t,
        status,
        lastStudied: status === 'Completed' || status === 'Revised' ? getRelativeDateString(0) : t.lastStudied
      };
      
      // Update subject progress based on topic status
      setTimeout(() => calculateSubjectProgress(t.subjectId), 10);
      
      return updated;
    }
    return t;
  });
  saveDb(db);
  return db.syllabus;
}

// Recalculates subject progress based on syllabus topic completion
function calculateSubjectProgress(subjectId: string) {
  const db = getDb();
  const subjectTopics = db.syllabus.filter(t => t.subjectId === subjectId);
  if (subjectTopics.length === 0) return;

  const completed = subjectTopics.filter(t => t.status === 'Completed' || t.status === 'Revised').length;
  const progress = Math.round((completed / subjectTopics.length) * 100);

  db.subjects = db.subjects.map(s => s.id === subjectId ? { ...s, progress } : s);
  saveDb(db);
}

// TASK CRUD
export function getTasks(): Task[] {
  const db = getDb();
  return db.tasks;
}

export function addTask(task: Omit<Task, 'id'>): Task {
  const db = getDb();
  const newTask: Task = {
    ...task,
    id: `task-${Date.now()}`
  };
  db.tasks.unshift(newTask);
  saveDb(db);
  return newTask;
}

export function updateTask(task: Task): Task[] {
  const db = getDb();
  db.tasks = db.tasks.map(t => t.id === task.id ? task : t);
  saveDb(db);
  return db.tasks;
}

export function deleteTask(id: string): Task[] {
  const db = getDb();
  db.tasks = db.tasks.filter(t => t.id !== id);
  saveDb(db);
  return db.tasks;
}

// CLINICAL POSTINGS & CASE LOGS
export function getClinicalPostings(): ClinicalPosting[] {
  return getDb().clinicalPostings;
}

export function addClinicalPosting(post: Omit<ClinicalPosting, 'id' | 'casesCount' | 'proceduresObserved' | 'proceduresPerformed' | 'completed'>): ClinicalPosting {
  const db = getDb();
  const newPost: ClinicalPosting = {
    ...post,
    id: `cp-${Date.now()}`,
    casesCount: 0,
    proceduresObserved: 0,
    proceduresPerformed: 0,
    completed: false
  };
  db.clinicalPostings.unshift(newPost);
  saveDb(db);
  return newPost;
}

export function updateClinicalPosting(posting: ClinicalPosting): ClinicalPosting[] {
  const db = getDb();
  db.clinicalPostings = db.clinicalPostings.map(cp => cp.id === posting.id ? posting : cp);
  saveDb(db);
  return db.clinicalPostings;
}

export function getCaseLogs(): CaseLog[] {
  return getDb().caseLogs;
}

export function addCaseLog(caseLog: Omit<CaseLog, 'id'>): CaseLog {
  const db = getDb();
  const newCase: CaseLog = {
    ...caseLog,
    id: `cl-${Date.now()}`
  };
  db.caseLogs.unshift(newCase);
  
  // Increment case count in the related clinical posting
  db.clinicalPostings = db.clinicalPostings.map(cp => {
    if (cp.id === caseLog.postingId) {
      return { ...cp, casesCount: cp.casesCount + 1 };
    }
    return cp;
  });

  saveDb(db);
  return newCase;
}

export function deleteCaseLog(id: string): CaseLog[] {
  const db = getDb();
  const caseToDelete = db.caseLogs.find(cl => cl.id === id);
  if (caseToDelete) {
    db.clinicalPostings = db.clinicalPostings.map(cp => {
      if (cp.id === caseToDelete.postingId) {
        return { ...cp, casesCount: Math.max(0, cp.casesCount - 1) };
      }
      return cp;
    });
  }
  db.caseLogs = db.caseLogs.filter(cl => cl.id !== id);
  saveDb(db);
  return db.caseLogs;
}

// ATTENDANCE
export function getAttendance(): AttendanceRecord[] {
  return getDb().attendance;
}

export function updateAttendance(record: AttendanceRecord): AttendanceRecord[] {
  const db = getDb();
  db.attendance = db.attendance.map(r => r.id === record.id ? record : r);
  saveDb(db);
  return db.attendance;
}

// EXAMS
export function getExams(): Exam[] {
  return getDb().exams;
}

export function addExam(exam: Omit<Exam, 'id' | 'status'>): Exam {
  const db = getDb();
  const newExam: Exam = {
    ...exam,
    id: `ex-${Date.now()}`,
    status: 'Upcoming'
  };
  db.exams.push(newExam);
  // Sort exams by date ascending
  db.exams.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  saveDb(db);
  return newExam;
}

export function deleteExam(id: string): Exam[] {
  const db = getDb();
  db.exams = db.exams.filter(ex => ex.id !== id);
  saveDb(db);
  return db.exams;
}

// REVISION QUEUE (SPACED REPETITION)
export function getRevisionQueue(): RevisionItem[] {
  return getDb().revisionQueue;
}

export function updateRevisionItem(id: string, status: RevisionItem['status'], stageIncrease = 0): RevisionItem[] {
  const db = getDb();
  db.revisionQueue = db.revisionQueue.map(item => {
    if (item.id === id) {
      const newStage = Math.min(5, item.stage + stageIncrease);
      // Calculate next due date offset based on Leitner system: stage 1 = +1 day, 2 = +3 days, 3 = +7 days, 4 = +14 days, 5 = +30 days
      const offsets = [0, 1, 3, 7, 14, 30];
      const offsetDays = offsets[newStage];
      const nextDue = getRelativeDateString(offsetDays);
      return {
        ...item,
        status,
        stage: newStage,
        dueDate: nextDue
      };
    }
    return item;
  });
  saveDb(db);
  return db.revisionQueue;
}

// FLASHCARDS
export function getFlashcards(): Flashcard[] {
  return getDb().flashcards;
}

export function addFlashcard(card: Omit<Flashcard, 'id' | 'difficulty' | 'nextDueDate' | 'box'>): Flashcard {
  const db = getDb();
  const newCard: Flashcard = {
    ...card,
    id: `fc-${Date.now()}`,
    difficulty: 'Medium',
    nextDueDate: getRelativeDateString(1),
    box: 1
  };
  db.flashcards.push(newCard);
  saveDb(db);
  return newCard;
}

export function updateFlashcardBox(id: string, responseQuality: 'easy' | 'medium' | 'hard'): Flashcard[] {
  const db = getDb();
  db.flashcards = db.flashcards.map(fc => {
    if (fc.id === id) {
      let nextBox = fc.box;
      if (responseQuality === 'easy') {
        nextBox = Math.min(5, fc.box + 1);
      } else if (responseQuality === 'hard') {
        nextBox = Math.max(1, fc.box - 1);
      }
      
      const offsets = [0, 1, 3, 7, 14, 30];
      const offsetDays = offsets[nextBox];
      const nextDue = getRelativeDateString(offsetDays);

      return {
        ...fc,
        box: nextBox,
        difficulty: responseQuality === 'easy' ? 'Easy' : responseQuality === 'hard' ? 'Hard' : 'Medium',
        nextDueDate: nextDue
      };
    }
    return fc;
  });
  saveDb(db);
  return db.flashcards;
}

// MCQS
export function getMCQQuestions(): MCQQuestion[] {
  return getDb().mcqQuestions;
}

export function getMCQAttempts(): MCQAttempt[] {
  return getDb().mcqAttempts;
}

export function addMCQAttempt(attempt: Omit<MCQAttempt, 'id' | 'date' | 'accuracy'>): MCQAttempt {
  const db = getDb();
  const accuracy = (attempt.correctAnswers / attempt.totalQuestions) * 100;
  const newAttempt: MCQAttempt = {
    ...attempt,
    id: `mcq-att-${Date.now()}`,
    date: getRelativeDateString(0),
    accuracy
  };
  db.mcqAttempts.unshift(newAttempt);
  saveDb(db);
  return newAttempt;
}

// HEALTH METRICS
export function getHealthMetrics(): HealthMetric[] {
  return getDb().healthMetrics;
}

export function getTodayHealthMetric(): HealthMetric {
  const db = getDb();
  const todayStr = getRelativeDateString(0);
  let todayMetric = db.healthMetrics.find(m => m.date === todayStr);
  
  if (!todayMetric) {
    // Generate template for today
    todayMetric = {
      date: todayStr,
      steps: 0,
      sleep: 0,
      calories: 0,
      exercise: 0,
      water: 0,
      heartRate: 72,
      hrv: 60
    };
    db.healthMetrics.unshift(todayMetric);
    saveDb(db);
  }
  return todayMetric;
}

export function updateTodayHealthMetric(metric: Partial<HealthMetric>): HealthMetric {
  const db = getDb();
  const todayStr = getRelativeDateString(0);
  db.healthMetrics = db.healthMetrics.map(m => {
    if (m.date === todayStr) {
      return { ...m, ...metric };
    }
    return m;
  });
  saveDb(db);
  return getTodayHealthMetric();
}

// FOCUS SESSIONS
export function getFocusSessions(): FocusSession[] {
  return getDb().focusSessions;
}

export function addFocusSession(session: Omit<FocusSession, 'id' | 'date'>): FocusSession {
  const db = getDb();
  const newSession: FocusSession = {
    ...session,
    id: `fs-${Date.now()}`,
    date: getRelativeDateString(0)
  };
  db.focusSessions.unshift(newSession);
  
  // Also increment study hours on the subject
  db.subjects = db.subjects.map(s => {
    if (s.id === session.subjectId) {
      return { ...s, studyHours: parseFloat((s.studyHours + session.duration / 60).toFixed(1)) };
    }
    return s;
  });

  saveDb(db);
  return newSession;
}

// JOURNAL AND MOOD
export function getJournalEntries(): Record<string, JournalEntry> {
  return getDb().journalEntries;
}

export function saveJournalEntry(date: string, entry: Omit<JournalEntry, 'date'>): JournalEntry {
  const db = getDb();
  const newEntry: JournalEntry = {
    ...entry,
    date
  };
  db.journalEntries[date] = newEntry;
  saveDb(db);
  return newEntry;
}

// DEVICE CONNECTIONS
export function getDeviceConnections(): DeviceConnection[] {
  return getDb().deviceConnections;
}

export function updateDeviceConnection(provider: DeviceConnection['provider'], connected: boolean): DeviceConnection[] {
  const db = getDb();
  db.deviceConnections = db.deviceConnections.map(dc => {
    if (dc.provider === provider) {
      return {
        ...dc,
        connected,
        lastSync: connected ? getRelativeDateString(0) + ' ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Never'
      };
    }
    return dc;
  });
  saveDb(db);
  return db.deviceConnections;
}

// AI CHAT HISTORY
export function getAIChatHistory(): AIChatMessage[] {
  return getDb().aiChatHistory;
}

export function addAIChatMessage(role: AIChatMessage['role'], content: string): AIChatMessage {
  const db = getDb();
  const newMsg: AIChatMessage = {
    id: `msg-${Date.now()}`,
    role,
    content,
    timestamp: new Date().toISOString()
  };
  db.aiChatHistory.push(newMsg);
  saveDb(db);
  return newMsg;
}

export function clearAIChatHistory(): AIChatMessage[] {
  const db = getDb();
  db.aiChatHistory = [];
  saveDb(db);
  return [];
}

// GAMIFICATION SYSTEM
export function earnXp(amount: number): { xp: number; level: number; unlockedBadge?: Badge } {
  const db = getDb();
  const profile = db.profile;
  profile.xp += amount;
  
  // 100 XP per level
  const newLevel = Math.floor(profile.xp / 100) + 1;
  if (newLevel > profile.level) {
    profile.level = newLevel;
  }

  // Check achievements
  let unlockedBadge: Badge | undefined;
  
  // Deduce new badge unlock cases
  if (amount > 0) {
    const unlockedIds = profile.badges.map(b => b.id);
    
    // Check Dedication Badge
    if (!unlockedIds.includes('b2') && db.subjects.reduce((sum, s) => sum + s.studyHours, 0) >= 25) {
      unlockedBadge = SEED_BADGES.find(b => b.id === 'b2');
    }
    // Check MCQ Specialist Badge
    else if (!unlockedIds.includes('b3')) {
      const highestMcq = db.mcqAttempts.find(att => att.totalQuestions >= 10 && att.accuracy >= 85);
      if (highestMcq) {
        unlockedBadge = SEED_BADGES.find(b => b.id === 'b3');
      }
    }
    // Check Clinical Observer Badge
    else if (!unlockedIds.includes('b4') && db.caseLogs.length >= 5) {
      unlockedBadge = SEED_BADGES.find(b => b.id === 'b4');
    }

    if (unlockedBadge) {
      const newUnlockedBadge = { ...unlockedBadge, unlockedAt: getRelativeDateString(0) };
      profile.badges.push(newUnlockedBadge);
    }
  }

  saveDb(db);
  return { xp: profile.xp, level: profile.level, unlockedBadge };
}

// SCORE CALCULATION ALGORITHM
export function calculateTodayScore(): { score: number; breakdown: Record<string, number> } {
  const db = getDb();
  
  // 1. Productivity: Tasks completed (Weight: 30%)
  const todayTasks = db.tasks.filter(t => t.dueDate === getRelativeDateString(0));
  const completedTasks = todayTasks.filter(t => t.isCompleted).length;
  const prodScore = todayTasks.length > 0 ? (completedTasks / todayTasks.length) * 100 : 80; // default 80 if no tasks

  // 2. Habits (Revision Queue + Study Checklist) (Weight: 20%)
  // Completed syllabus topics + solved questions
  const syllabusComplete = db.syllabus.filter(t => t.status === 'Completed' || t.status === 'Revised').length;
  const habitScore = Math.min(100, (syllabusComplete / db.syllabus.length) * 100);

  // 3. Physical Activity (Weight: 20%)
  const healthToday = getTodayHealthMetric();
  const stepProgress = Math.min(100, (healthToday.steps / db.profile.dailyStepTarget) * 100);
  const exerciseProgress = Math.min(100, (healthToday.exercise / db.profile.exerciseTarget) * 100);
  const physicalScore = (stepProgress + exerciseProgress) / 2;

  // 4. Sleep (Weight: 15%)
  const sleepProgress = Math.min(100, (healthToday.sleep / db.profile.sleepTarget) * 100);
  const sleepScore = sleepProgress;

  // 5. Study Focus Sessions (Weight: 10%)
  const focusToday = db.focusSessions
    .filter(fs => fs.date === getRelativeDateString(0))
    .reduce((sum, fs) => sum + fs.duration, 0);
  const focusTargetMin = db.profile.dailyStudyTarget * 60;
  const focusScore = Math.min(100, (focusToday / focusTargetMin) * 100);

  // 6. Goals achieved (Weight: 5%)
  // Simple completion check
  const waterProgress = Math.min(100, (healthToday.water / db.profile.waterTarget) * 100);
  const goalScore = waterProgress;

  // Weighted Combination
  // Formula: 30% Prod + 20% Habits + 20% Physical + 15% Sleep + 10% Focus + 5% Goals
  const totalScore = Math.round(
    (prodScore * 0.3) +
    (habitScore * 0.2) +
    (physicalScore * 0.2) +
    (sleepScore * 0.15) +
    (focusScore * 0.1) +
    (goalScore * 0.05)
  );

  return {
    score: isNaN(totalScore) ? 75 : totalScore,
    breakdown: {
      Productivity: Math.round(prodScore),
      Habits: Math.round(habitScore),
      'Physical Activity': Math.round(physicalScore),
      Sleep: Math.round(sleepScore),
      Focus: Math.round(focusScore),
      Goals: Math.round(goalScore)
    }
  };
}
