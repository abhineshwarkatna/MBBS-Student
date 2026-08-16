import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Plus, 
  Search, 
  ClipboardList, 
  Trash2, 
  ShieldAlert, 
  UserCheck
} from 'lucide-react';

export const ClinicalView: React.FC = () => {
  const {
    clinicalPostings,
    caseLogs,
    addClinicalPosting,
    addCaseLog,
    deleteCaseLog
  } = useApp();

  const [activeTab, setActiveTab] = useState<'postings' | 'cases'>('postings');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals Toggles
  const [showAddPostingModal, setShowAddPostingModal] = useState(false);
  const [showAddCaseModal, setShowAddCaseModal] = useState(false);

  // New Posting Form States
  const [newDept, setNewDept] = useState('General Medicine');
  const [newMentor, setNewMentor] = useState('Dr. Sandeep Sharma');
  const [newWard, setNewWard] = useState('Medicine Ward 3');
  const [newStart, setNewStart] = useState('2026-08-01');
  const [newEnd, setNewEnd] = useState('2026-08-31');
  const [newNotes, setNewNotes] = useState('Log cardiovascular and hematology presentations.');

  // New Case Form States
  const [casePostingId, setCasePostingId] = useState('');
  const [caseComplaint, setCaseComplaint] = useState('');
  const [caseDiagnosis, setCaseDiagnosis] = useState('');
  const [caseManagement, setCaseManagement] = useState('');
  const [caseLearning, setCaseLearning] = useState('');
  const [caseSupervisor, setCaseSupervisor] = useState('');

  const activePosting = clinicalPostings.find(cp => !cp.completed) || clinicalPostings[0];

  const handleCreatePosting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDept.trim() || !newMentor.trim()) return;

    addClinicalPosting({
      department: newDept,
      mentor: newMentor,
      startDate: newStart,
      endDate: newEnd,
      ward: newWard,
      notes: newNotes
    });

    setShowAddPostingModal(false);
  };

  const handleCreateCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseComplaint.trim() || !caseDiagnosis.trim() || !casePostingId) return;

    addCaseLog({
      postingId: casePostingId,
      date: new Date().toISOString().split('T')[0],
      complaint: caseComplaint,
      diagnosis: caseDiagnosis,
      management: caseManagement,
      learningPoints: caseLearning,
      supervisor: caseSupervisor
    });

    setCaseComplaint('');
    setCaseDiagnosis('');
    setCaseManagement('');
    setCaseLearning('');
    setCaseSupervisor('');
    setShowAddCaseModal(false);
  };

  // Filter cases based on search query
  const filteredCases = caseLogs.filter(cl => 
    cl.diagnosis.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cl.complaint.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cl.learningPoints.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 text-left">
      
      {/* HEADER BAR */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center bg-slate-900/5 dark:bg-slate-900/30 p-6 rounded-3xl border border-slate-200/40 dark:border-slate-800/40 gap-4">
        <div>
          <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-widest">Clinical Life</span>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-1">Ward Posting & Case Logbook</h2>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowAddPostingModal(true)}
            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl font-bold text-xs transition-all"
          >
            Create Posting
          </button>
          <button
            onClick={() => {
              if (clinicalPostings.length === 0) {
                alert('Please create a clinical posting first.');
                return;
              }
              setCasePostingId(clinicalPostings[0].id);
              setShowAddCaseModal(true);
            }}
            className="flex items-center space-x-1.5 bg-teal-500 hover:bg-teal-600 text-white px-4 py-2.5 rounded-xl font-bold shadow-md shadow-teal-500/10 transition-all text-xs"
          >
            <Plus size={14} />
            <span>Add Case Log</span>
          </button>
        </div>
      </div>

      {/* CONFIDENTIALITY ADVISORY */}
      <div className="flex items-start space-x-3 bg-red-500/15 border border-red-500/20 dark:border-red-500/30 p-4 rounded-2xl">
        <ShieldAlert className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
        <div>
          <h4 className="text-xs font-black text-red-600 dark:text-red-400">HIPAA & Patient Privacy Protocol</h4>
          <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
            Strict confidentiality is mandatory. Never input real patient names, registration IDs, cell numbers, or specific identifiers in case summaries. Educational logs should remain fully anonymized.
          </p>
        </div>
      </div>

      {/* TABS SELECTOR */}
      <div className="flex border-b border-slate-200/50 dark:border-slate-800/50 gap-4">
        <button
          onClick={() => setActiveTab('postings')}
          className={`pb-3 text-sm font-bold transition-all relative ${
            activeTab === 'postings' 
              ? 'text-teal-500' 
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Active Posting Details
          {activeTab === 'postings' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500 rounded-full"></div>}
        </button>
        <button
          onClick={() => setActiveTab('cases')}
          className={`pb-3 text-sm font-bold transition-all relative ${
            activeTab === 'cases' 
              ? 'text-teal-500' 
              : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          Case Logbook ({caseLogs.length})
          {activeTab === 'cases' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-500 rounded-full"></div>}
        </button>
      </div>

      {/* TAB CONTENTS */}
      {activeTab === 'postings' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
          
          {/* ACTIVE POSTING STATS */}
          {activePosting ? (
            <div className="lg:col-span-2 glass-panel rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/50 shadow-md space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <span className="px-2 py-0.5 bg-teal-500/10 text-teal-600 dark:text-teal-400 font-extrabold text-[10px] rounded-lg tracking-wider uppercase border border-teal-500/15">
                    Active Rotation
                  </span>
                  <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mt-2">
                    {activePosting.department}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 font-medium">
                    📍 {activePosting.ward} • Mentor: {activePosting.mentor}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 font-bold block">Duration</span>
                  <span className="text-xs font-bold text-slate-500">
                    {activePosting.startDate} to {activePosting.endDate}
                  </span>
                </div>
              </div>

              {/* Progress Counters Grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-100/60 dark:bg-slate-900/50 border border-slate-200/30 dark:border-slate-800/30 rounded-2xl p-4 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Cases Seen</span>
                  <span className="text-3xl font-black text-teal-500 mt-1 block">{activePosting.casesCount}</span>
                </div>
                <div className="bg-slate-100/60 dark:bg-slate-900/50 border border-slate-200/30 dark:border-slate-800/30 rounded-2xl p-4 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Procedures Obs</span>
                  <span className="text-3xl font-black text-blue-500 mt-1 block">{activePosting.proceduresObserved}</span>
                </div>
                <div className="bg-slate-100/60 dark:bg-slate-900/50 border border-slate-200/30 dark:border-slate-800/30 rounded-2xl p-4 text-center">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Procedures Perf</span>
                  <span className="text-3xl font-black text-indigo-500 mt-1 block">{activePosting.proceduresPerformed}</span>
                </div>
              </div>

              <div className="border-t border-slate-200/40 dark:border-slate-800/40 pt-4">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Rotation Notes</span>
                <p className="text-xs text-slate-500 font-semibold leading-relaxed mt-1">{activePosting.notes}</p>
              </div>
            </div>
          ) : (
            <div className="lg:col-span-2 glass-panel rounded-3xl p-8 text-center border border-slate-200/50 dark:border-slate-800/50 shadow-md">
              <ClipboardList size={48} className="mx-auto text-slate-300 opacity-60 mb-3" />
              <h3 className="font-extrabold text-lg">No Active Clinical Posting</h3>
              <p className="text-xs text-slate-400 mt-1">Please create a posting for this block to start logging clinical case details.</p>
            </div>
          )}

          {/* HISTORICAL POSTINGS SUMMARY */}
          <div className="glass-panel rounded-3xl p-6 border border-slate-200/50 dark:border-slate-800/50 shadow-md space-y-4">
            <h3 className="font-black text-sm uppercase tracking-wider text-slate-400">Rotation History</h3>
            <div className="space-y-3.5">
              {clinicalPostings.map((cp) => (
                <div key={cp.id} className="flex justify-between items-center p-3 rounded-2xl bg-slate-150/20 dark:bg-slate-900/40 border border-slate-200/30 dark:border-slate-800/30">
                  <div>
                    <h5 className="font-bold text-xs text-slate-800 dark:text-slate-250">{cp.department}</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">{cp.startDate} to {cp.endDate}</p>
                  </div>
                  <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                    cp.completed ? 'bg-emerald-500/10 text-emerald-500' : 'bg-teal-500/10 text-teal-500'
                  }`}>
                    {cp.completed ? 'Completed' : 'Ongoing'}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      ) : (
        /* CASE LOGBOOK RENDER */
        <div className="space-y-4 animate-fade-in">
          
          {/* SEARCH AND FILTERS */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3.5 top-2.5 text-slate-400" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search diagnosis, complaint, learning points..."
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-850 bg-slate-100/50 dark:bg-slate-900/50 text-xs font-semibold focus:ring-2 focus:ring-teal-500 outline-none"
              />
            </div>
            <span className="text-xs font-bold text-slate-400">
              Showing {filteredCases.length} logs
            </span>
          </div>

          {/* CASES LIST */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCases.map((cl) => (
              <div 
                key={cl.id} 
                className="glass-panel rounded-3xl p-5 border border-slate-200/50 dark:border-slate-800/50 shadow-md flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] text-teal-500 font-bold bg-teal-500/5 px-2 py-0.5 rounded border border-teal-500/10">
                      {cl.date}
                    </span>
                    <button
                      onClick={() => deleteCaseLog(cl.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-red-500 transition-all"
                      title="Delete case log"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block">Chief Complaint</span>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{cl.complaint}</h4>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block">Diagnosis Discussed</span>
                      <h4 className="text-xs font-extrabold text-teal-600 dark:text-teal-400">{cl.diagnosis}</h4>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block">Management & Protocol</span>
                      <p className="text-xs text-slate-500 leading-relaxed font-medium mt-0.5">{cl.management}</p>
                    </div>
                    <div className="bg-slate-100/50 dark:bg-slate-900/50 p-3 rounded-2xl border border-slate-200/30 dark:border-slate-800/30">
                      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest block">Learning Insights</span>
                      <p className="text-xs text-slate-500 leading-relaxed font-semibold mt-0.5">{cl.learningPoints}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 text-[9px] text-slate-400 font-bold mt-4 pt-3 border-t border-slate-250/20">
                  <UserCheck size={12} className="text-teal-500" />
                  <span>Validating Mentor: {cl.supervisor}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CREATE POSTING MODAL */}
      {showAddPostingModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel max-w-md w-full rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-150">Create Rotation Posting</h3>
              <button 
                onClick={() => setShowAddPostingModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Plus size={18} className="rotate-45" />
              </button>
            </div>
            <form onSubmit={handleCreatePosting} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Department</label>
                <input
                  type="text"
                  required
                  value={newDept}
                  onChange={(e) => setNewDept(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-sm font-medium"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Mentor Name</label>
                  <input
                    type="text"
                    required
                    value={newMentor}
                    onChange={(e) => setNewMentor(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Ward Location</label>
                  <input
                    type="text"
                    required
                    value={newWard}
                    onChange={(e) => setNewWard(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-sm font-medium"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Start Date</label>
                  <input
                    type="date"
                    required
                    value={newStart}
                    onChange={(e) => setNewStart(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">End Date</label>
                  <input
                    type="date"
                    required
                    value={newEnd}
                    onChange={(e) => setNewEnd(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-xs font-bold"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Special Instructions</label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-xs font-bold h-20 outline-none resize-none"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white text-xs font-black shadow-md hover:shadow-lg transition-all"
              >
                Create Rotation
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ADD CASE MODAL */}
      {showAddCaseModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-panel max-w-lg w-full rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-extrabold text-slate-800 dark:text-slate-150">Log Patient Case Details</h3>
                <span className="text-[10px] text-red-500 font-extrabold uppercase tracking-widest block">⚠️ HIPAA Confidentiality protocol active</span>
              </div>
              <button 
                onClick={() => setShowAddCaseModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Plus size={18} className="rotate-45" />
              </button>
            </div>
            
            <form onSubmit={handleCreateCase} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Select Active Rotation</label>
                <select
                  value={casePostingId}
                  onChange={(e) => setCasePostingId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-xs font-bold outline-none"
                >
                  {clinicalPostings.map((cp) => (
                    <option key={cp.id} value={cp.id}>{cp.department} ({cp.ward})</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Chief Complaint</label>
                <input
                  type="text"
                  required
                  value={caseComplaint}
                  onChange={(e) => setCaseComplaint(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-xs font-semibold outline-none"
                  placeholder="e.g. Dyspnea and orthopnea, high fever for 3 days..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Diagnosis Discussed</label>
                <input
                  type="text"
                  required
                  value={caseDiagnosis}
                  onChange={(e) => setCaseDiagnosis(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-xs font-semibold outline-none"
                  placeholder="e.g. Iron Deficiency Anemia, Mitral Stenosis..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Management Protocol</label>
                <textarea
                  value={caseManagement}
                  onChange={(e) => setCaseManagement(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-xs font-medium h-20 outline-none resize-none"
                  placeholder="e.g. Intravenous Normal Saline, regular insulin infusion..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Clinical Learning Points</label>
                <textarea
                  value={caseLearning}
                  onChange={(e) => setCaseLearning(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-xs font-medium h-20 outline-none resize-none"
                  placeholder="Auscultated mid-diastolic murmur, calculated blood gas values..."
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Supervisor Doctor</label>
                <input
                  type="text"
                  value={caseSupervisor}
                  onChange={(e) => setCaseSupervisor(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-slate-900/50 text-xs font-bold outline-none"
                  placeholder="Dr. Sandeep Sharma"
                />
              </div>
              <button
                type="submit"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-teal-500 to-blue-500 hover:from-teal-600 hover:to-blue-600 text-white text-xs font-black shadow-md hover:shadow-lg transition-all"
              >
                Log Anonymized Case
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
