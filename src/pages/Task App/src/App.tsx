import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { AppDataProvider } from './context/DataContext';
import { UIProvider } from './context/UIContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import WorkItems from './pages/WorkItems';
import Notes from './pages/Notes';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import AskAgentPanel from './components/AskAgentPanel';

const TaskApp: React.FC = () => {
  return (
    <AppDataProvider>
      <UIProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/work-items" element={<WorkItems />} />
            <Route path="/notes" element={<Notes />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<Dashboard />} />
          </Routes>
        </Layout>
        <AskAgentPanel />
      </UIProvider>
    </AppDataProvider>
  );
};

export default TaskApp;
