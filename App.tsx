
import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import ChatInterface from './components/ChatInterface';
import MemoryAnalyzer from './components/MemoryAnalyzer';
import BlessingGenerator from './components/BlessingGenerator';
import { AppView } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);

  const renderView = () => {
    switch (currentView) {
      case AppView.DASHBOARD:
        return <Dashboard onNavigate={setCurrentView} />;
      case AppView.CHAT:
        return <ChatInterface />;
      case AppView.MEMORY_ANALYZER:
        return <MemoryAnalyzer />;
      case AppView.BLESSING_GENERATOR:
        return <BlessingGenerator />;
      default:
        return <Dashboard onNavigate={setCurrentView} />;
    }
  };

  return (
    <Layout activeView={currentView} onViewChange={setCurrentView}>
      {renderView()}
    </Layout>
  );
};

export default App;
