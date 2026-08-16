import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Layout } from './components/Layout';
import { Onboarding } from './components/Onboarding';
import { DashboardView } from './components/DashboardView';
import { SubjectsView } from './components/SubjectsView';
import { ClinicalView } from './components/ClinicalView';
import { AttendanceView } from './components/AttendanceView';
import { ExamsView } from './components/ExamsView';
import { McqView } from './components/McqView';
import { AiView } from './components/AiView';
import { HealthView } from './components/HealthView';
import { FocusView } from './components/FocusView';
import { JournalView } from './components/JournalView';
import { AchievementsView } from './components/AchievementsView';
import { SettingsView } from './components/SettingsView';

const AppContent: React.FC = () => {
  const { isOnboarded, currentView } = useApp();

  // If first time, render the onboarding setup flow
  if (!isOnboarded) {
    return <Onboarding />;
  }

  // Active panel switching router
  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <DashboardView />;
      case 'subjects':
        return <SubjectsView />;
      case 'clinical':
        return <ClinicalView />;
      case 'attendance':
        return <AttendanceView />;
      case 'exams':
        return <ExamsView />;
      case 'mcq':
        return <McqView />;
      case 'ai':
        return <AiView />;
      case 'health':
        return <HealthView />;
      case 'focus':
        return <FocusView />;
      case 'journal':
        return <JournalView />;
      case 'achievements':
        return <AchievementsView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return <Layout>{renderView()}</Layout>;
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
