import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Brain, 
  Clock, 
  Award, 
  ArrowRight, 
  RotateCcw,
  Bookmark,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export const McqView: React.FC = () => {
  const {
    subjects,
    mcqQuestions,
    addMCQAttempt,
    flashcards,
    updateFlashcard
  } = useApp();

  const [activeTab, setActiveTab] = useState<'mcq' | 'flashcards'>('mcq');

  // MCQ Engine States
  const [mcqStep, setMcqStep] = useState<'setup' | 'quiz' | 'results'>('setup');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('sub-path');
  const [quizQuestions, setQuizQuestions] = useState(mcqQuestions);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<number, boolean>>({});
  const [quizTimer, setQuizTimer] = useState(300); // 5 mins for 5 questions
  const [timerActive, setTimerActive] = useState(false);

  // Flashcards States
  const [fcSubjectId, setFcSubjectId] = useState<string>('sub-path');
  const [fcIndex, setFcIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const activeFlashcards = flashcards.filter(fc => fc.subjectId === fcSubjectId);
  const currentFlashcard = activeFlashcards[fcIndex];

  // Timer Tick
  useEffect(() => {
    let interval: any = null;
    if (timerActive && quizTimer > 0 && mcqStep === 'quiz') {
      interval = setInterval(() => {
        setQuizTimer(prev => prev - 1);
      }, 1000);
    } else if (quizTimer === 0 && mcqStep === 'quiz') {
      handleCompleteQuiz();
    }
    return () => clearInterval(interval);
  }, [timerActive, quizTimer, mcqStep]);

  const handleStartQuiz = () => {
    const filtered = mcqQuestions.filter(q => q.subjectId === selectedSubjectId);
    if (filtered.length === 0) {
      alert('No questions seeded for this subject yet. Select Pathology or Pharmacology.');
      return;
    }
    setQuizQuestions(filtered.slice(0, 5)); // Take up to 5 questions
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setSubmittedAnswers({});
    setQuizTimer(300);
    setTimerActive(true);
    setMcqStep('quiz');
  };

  const handleSelectOption = (optIndex: number) => {
    if (submittedAnswers[currentQuestionIndex]) return;
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIndex]: optIndex
    });
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswers[currentQuestionIndex] === undefined) return;
    setSubmittedAnswers({
      ...submittedAnswers,
      [currentQuestionIndex]: true
    });
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      handleCompleteQuiz();
    }
  };

  const handleCompleteQuiz = () => {
    setTimerActive(false);
    
    // Calculate correct answers
    let correctCount = 0;
    quizQuestions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correctOptionIndex) {
        correctCount += 1;
      }
    });

    addMCQAttempt({
      subjectId: selectedSubjectId,
      totalQuestions: quizQuestions.length,
      correctAnswers: correctCount
    });

    setMcqStep('results');
  };

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-6 text-left">
      
      {/* HEADER BAR */}
      <div className="flex justify-between items-center bg-slate-900/5 dark:bg-slate-900/30 p-6 rounded-3xl border border-slate-200/40 dark:border-slate-800/40">
        <div>
          <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest font-mono">Exam Preparation</span>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">Quiz Master & Memory Cards</h2>
        </div>
      </div>

      {/* TABS SELECTOR */}
      <div className="flex border-b border-slate-200/50 dark:border-slate-800/50 gap-4">
        <button
          onClick={() => setActiveTab('mcq')}
          className={`pb-3 text-sm font-bold transition-all relative ${
            activeTab === 'mcq' 
              ? 'text-teal-500' 
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Clinical MCQ Quizzes
          {activeTab === 'mcq' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500 rounded-full"></div>}
        </button>
        <button
          onClick={() => setActiveTab('flashcards')}
          className={`pb-3 text-sm font-bold transition-all relative ${
            activeTab === 'flashcards' 
              ? 'text-teal-500' 
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Spaced Repetition Flashcards
          {activeTab === 'flashcards' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500 rounded-full"></div>}
        </button>
      </div>

      {/* RENDER ACTIVE TAB */}
      {activeTab === 'mcq' ? (
        <div className="glass-panel rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/50 shadow-md min-h-[400px]">
          
          {/* SETUP SCREEN */}
          {mcqStep === 'setup' && (
            <div className="max-w-md mx-auto py-10 space-y-6 text-center animate-fade-in">
              <div className="w-16 h-16 rounded-2xl bg-teal-500/10 text-teal-500 flex items-center justify-center mx-auto shadow-inner">
                <Brain size={32} />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-800 dark:text-slate-100">Configure Study Quiz</h3>
                <p className="text-xs text-slate-400 mt-1">Select an MBBS subject to load a timed practice test of clinical case scenarios.</p>
              </div>

              <div className="text-left space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Select Subject</label>
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-xs font-bold outline-none"
                  >
                    {subjects.map((sub) => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <button
                onClick={handleStartQuiz}
                className="w-full py-3.5 bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all"
              >
                Launch Mock Exam
              </button>
            </div>
          )}

          {/* ACTIVE QUIZ SCREEN */}
          {mcqStep === 'quiz' && quizQuestions.length > 0 && (
            <div className="space-y-6 animate-fade-in">
              {/* Quiz Header Info */}
              <div className="flex justify-between items-center border-b border-slate-200/50 dark:border-slate-800/50 pb-4">
                <div>
                  <span className="text-[10px] text-teal-500 font-extrabold uppercase bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/10">
                    Question {currentQuestionIndex + 1} of {quizQuestions.length}
                  </span>
                  <h4 className="text-xs text-slate-400 font-bold mt-1">
                    Mock Test Focus Area
                  </h4>
                </div>
                <div className="flex items-center space-x-2 text-rose-500 bg-rose-500/5 px-3 py-1.5 rounded-xl border border-rose-500/10 font-mono text-xs font-bold">
                  <Clock size={14} />
                  <span>{formatTimer(quizTimer)}</span>
                </div>
              </div>

              {/* Question Statement */}
              <div className="space-y-4">
                <h3 className="font-extrabold text-sm text-slate-800 dark:text-slate-150 leading-relaxed bg-slate-100/30 dark:bg-slate-900/30 p-4 rounded-2xl border border-slate-200/30 dark:border-slate-800/30">
                  {quizQuestions[currentQuestionIndex].question}
                </h3>

                {/* Answer Options Grid */}
                <div className="space-y-2.5">
                  {quizQuestions[currentQuestionIndex].options.map((option, index) => {
                    const isSelected = selectedAnswers[currentQuestionIndex] === index;
                    const isSubmitted = submittedAnswers[currentQuestionIndex];
                    const isCorrect = quizQuestions[currentQuestionIndex].correctOptionIndex === index;
                    
                    let optionStyle = 'border-slate-200 dark:border-slate-850 hover:bg-slate-100/50 dark:hover:bg-slate-900/50';
                    if (isSelected) optionStyle = 'border-teal-500 bg-teal-500/5 text-teal-600 dark:text-teal-400';
                    if (isSubmitted) {
                      if (isCorrect) optionStyle = 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400';
                      else if (isSelected) optionStyle = 'border-rose-500 bg-rose-500/10 text-rose-500';
                    }

                    return (
                      <button
                        key={index}
                        disabled={isSubmitted}
                        onClick={() => handleSelectOption(index)}
                        className={`w-full flex items-center justify-between p-4 rounded-2xl border text-xs font-semibold text-left transition-all ${optionStyle}`}
                      >
                        <span>{option}</span>
                        {isSubmitted && isCorrect && <CheckCircle2 size={16} className="text-emerald-500" />}
                        {isSubmitted && isSelected && !isCorrect && <XCircle size={16} className="text-rose-500" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Diagnostic explanation if submitted */}
              {submittedAnswers[currentQuestionIndex] && (
                <div className="bg-teal-500/5 border border-teal-500/10 p-4 rounded-2xl space-y-2 animate-fade-in">
                  <span className="text-[9px] text-teal-500 font-extrabold uppercase tracking-widest block">Clinical Explanation</span>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    {quizQuestions[currentQuestionIndex].explanation}
                  </p>
                </div>
              )}

              {/* Quiz Action controls */}
              <div className="flex justify-between items-center pt-4 border-t border-slate-200/50 dark:border-slate-800/50">
                <span className="text-[10px] text-slate-400 font-bold uppercase">MedTrack AI exam-prep</span>
                {!submittedAnswers[currentQuestionIndex] ? (
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={selectedAnswers[currentQuestionIndex] === undefined}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider ${
                      selectedAnswers[currentQuestionIndex] === undefined
                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                        : 'bg-teal-500 text-white hover:bg-teal-600'
                    }`}
                  >
                    Confirm Answer
                  </button>
                ) : (
                  <button
                    onClick={handleNextQuestion}
                    className="flex items-center space-x-1 bg-gradient-to-r from-teal-500 to-blue-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl"
                  >
                    <span>{currentQuestionIndex === quizQuestions.length - 1 ? 'Show Results' : 'Next Question'}</span>
                    <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* QUIZ RESULTS SCREEN */}
          {mcqStep === 'results' && (
            <div className="max-w-md mx-auto py-10 space-y-6 text-center animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-teal-400 to-indigo-500 text-white flex items-center justify-center mx-auto shadow-lg animate-pulse">
                <Award size={30} />
              </div>
              
              <div>
                <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100">Quiz Completed!</h3>
                <p className="text-xs text-slate-450 mt-1">Excellent prep session. Your results are synced into analytics history.</p>
              </div>

              {/* Accuracy stats board */}
              <div className="grid grid-cols-2 gap-4 bg-slate-100/50 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200/30 dark:border-slate-800/30">
                <div>
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Accuracy</span>
                  <span className="text-2xl font-black text-teal-500">
                    {Math.round((Object.keys(selectedAnswers).filter(
                      index => selectedAnswers[parseInt(index)] === quizQuestions[parseInt(index)].correctOptionIndex
                    ).length / quizQuestions.length) * 100)}%
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 font-extrabold uppercase block">Questions Solved</span>
                  <span className="text-2xl font-black text-blue-500">
                    {quizQuestions.length}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setMcqStep('setup')}
                  className="w-full flex items-center justify-center space-x-1.5 py-3 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-700 dark:text-slate-350 rounded-xl font-bold text-xs uppercase"
                >
                  <RotateCcw size={14} />
                  <span>Practice Again</span>
                </button>
              </div>
            </div>
          )}

        </div>
      ) : (
        /* SPACED REPETITION FLASHCARDS VIEW */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          
          {/* SUBJECT SELECTOR COLUMN */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest pl-1">
              Select Deck
            </h3>
            <div className="space-y-3">
              {subjects.map((sub) => (
                <button
                  key={sub.id}
                  onClick={() => {
                    setFcSubjectId(sub.id);
                    setFcIndex(0);
                    setIsFlipped(false);
                  }}
                  className={`w-full p-4 rounded-2xl border text-left flex justify-between items-center transition-all ${
                    fcSubjectId === sub.id
                      ? 'border-purple-500 bg-purple-500/5'
                      : 'border-slate-200 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-900/40 bg-white dark:bg-slate-900/60'
                  }`}
                >
                  <h4 className="font-extrabold text-slate-800 dark:text-slate-200">{sub.name}</h4>
                  <span className="text-xs font-bold text-purple-500">
                    {flashcards.filter(fc => fc.subjectId === sub.id).length} Cards
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* ACTIVE FLASHCARD COLUMN */}
          <div className="lg:col-span-2 space-y-6">
            {currentFlashcard ? (
              <div className="space-y-6">
                
                {/* 3D card layout panel */}
                <div 
                  onClick={() => setIsFlipped(!isFlipped)}
                  className="w-full h-80 rounded-3xl cursor-pointer perspective-1000 select-none group"
                >
                  <div className={`relative w-full h-full text-center transition-transform duration-500 transform-style-preserve-3d ${
                    isFlipped ? 'rotate-y-180' : ''
                  }`}>
                    
                    {/* Front side of Card */}
                    <div className="absolute inset-0 w-full h-full backface-visibility-hidden glass-panel border border-slate-200 dark:border-slate-800 rounded-3xl p-8 flex flex-col justify-between shadow-lg">
                      <div className="flex justify-between items-center text-purple-500 text-xs font-bold">
                        <span>MBBS MEMORY CARD</span>
                        <span>Leitner Box {currentFlashcard.box}</span>
                      </div>
                      <div className="flex-1 flex items-center justify-center px-4">
                        <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 leading-relaxed">
                          {currentFlashcard.question}
                        </h3>
                      </div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">
                        Tap Card to Reveal Answer
                      </span>
                    </div>

                    {/* Back side of Card */}
                    <div className="absolute inset-0 w-full h-full backface-visibility-hidden rotate-y-180 glass-panel border border-purple-500/30 rounded-3xl p-8 flex flex-col justify-between shadow-lg bg-purple-550/[0.01]">
                      <div className="flex justify-between items-center text-purple-500 text-xs font-bold">
                        <span>RECALL DIAGNOSTICS</span>
                        <span>Stage Resolved</span>
                      </div>
                      <div className="flex-1 flex items-center justify-center px-4 overflow-y-auto">
                        <p className="text-sm font-semibold text-slate-700 dark:text-slate-250 leading-relaxed">
                          {currentFlashcard.answer}
                        </p>
                      </div>
                      <span className="text-[10px] text-purple-500 font-bold uppercase tracking-widest block">
                        Grade recall ease below
                      </span>
                    </div>

                  </div>
                </div>

                {/* Rescheduling buttons based on Leitner Box */}
                {isFlipped && (
                  <div className="grid grid-cols-3 gap-3 animate-fade-in">
                    <button
                      onClick={() => {
                        updateFlashcard(currentFlashcard.id, 'hard');
                        setIsFlipped(false);
                        if (fcIndex < activeFlashcards.length - 1) setFcIndex(fcIndex + 1);
                      }}
                      className="py-3 bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/15 rounded-2xl text-xs font-black uppercase tracking-wider"
                    >
                      🛑 Forgot (Hard)
                    </button>
                    <button
                      onClick={() => {
                        updateFlashcard(currentFlashcard.id, 'medium');
                        setIsFlipped(false);
                        if (fcIndex < activeFlashcards.length - 1) setFcIndex(fcIndex + 1);
                      }}
                      className="py-3 bg-orange-500/10 text-orange-500 border border-orange-500/20 hover:bg-orange-500/15 rounded-2xl text-xs font-black uppercase tracking-wider"
                    >
                      🟠 Recalled (Medium)
                    </button>
                    <button
                      onClick={() => {
                        updateFlashcard(currentFlashcard.id, 'easy');
                        setIsFlipped(false);
                        if (fcIndex < activeFlashcards.length - 1) setFcIndex(fcIndex + 1);
                      }}
                      className="py-3 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500/15 rounded-2xl text-xs font-black uppercase tracking-wider"
                    >
                      🟢 Instant (Easy)
                    </button>
                  </div>
                )}

                {/* Progress bar deck navigator */}
                <div className="flex justify-between items-center text-xs text-slate-400 pl-1">
                  <span>Card {fcIndex + 1} of {activeFlashcards.length}</span>
                  <div className="flex gap-2">
                    <button
                      disabled={fcIndex === 0}
                      onClick={() => {
                        setFcIndex(prev => prev - 1);
                        setIsFlipped(false);
                      }}
                      className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold ${fcIndex === 0 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                    >
                      Prev
                    </button>
                    <button
                      disabled={fcIndex === activeFlashcards.length - 1}
                      onClick={() => {
                        setFcIndex(prev => prev + 1);
                        setIsFlipped(false);
                      }}
                      className={`px-3 py-1.5 rounded-lg border text-[10px] font-bold ${fcIndex === activeFlashcards.length - 1 ? 'opacity-40 cursor-not-allowed' : 'hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                    >
                      Next
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              <div className="glass-panel rounded-3xl p-12 text-center border border-slate-200/50 dark:border-slate-800/50 shadow-md">
                <Bookmark size={40} className="mx-auto text-slate-300 opacity-60 mb-2" />
                <h3 className="font-extrabold text-lg">No cards in this subject deck</h3>
                <p className="text-xs text-slate-400 mt-1">Please configure core study targets or add flashcards in settings.</p>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};
