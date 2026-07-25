import React, { useState, useEffect } from 'react';
import Header from './components/Header.jsx';
import DashboardView from './components/Dashboard/DashboardView.jsx';
import TaskListView from './components/Tasks/TaskListView.jsx';
import TaskModal from './components/Tasks/TaskModal.jsx';
import KanbanBoardView from './components/Kanban/KanbanBoardView.jsx';
import CalendarView from './components/Calendar/CalendarView.jsx';
import PomodoroTimer from './components/Pomodoro/PomodoroTimer.jsx';
import NotificationDrawer from './components/Notifications/NotificationDrawer.jsx';
import AnalyticsView from './components/Analytics/AnalyticsView.jsx';
import ReminderView from './components/Reminders/ReminderView.jsx';
import SplashScreen from './components/SplashScreen.jsx';
import ToastStack from './components/ToastStack.jsx';
import { useTaskContext } from './context/TaskContext.jsx';

const VIEWS = [
  { id: 'dashboard', label: 'Overview', icon: '◈' },
  { id: 'tasks', label: 'Tasks', icon: '☰' },
  { id: 'kanban', label: 'Board', icon: '▦' },
  { id: 'calendar', label: 'Calendar', icon: '▤' },
  { id: 'reminders', label: 'Reminders', icon: '🔔' },
  { id: 'focus', label: 'Focus Timer', icon: '◷' },
  { id: 'analytics', label: 'Analytics', icon: '◫' }
];

const App = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [showSplash, setShowSplash] = useState(true);
  const { loading, error, openTaskModal, closeTaskModal, isTaskModalOpen, isNotificationDrawerOpen, setIsNotificationDrawerOpen } = useTaskContext();

  useEffect(() => {
    document.title = 'NexusTask Pro';
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const tag = document.activeElement?.tagName;
      const isTyping = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';

      if (e.key === 'Escape') {
        if (isTaskModalOpen) closeTaskModal();
        if (isNotificationDrawerOpen) setIsNotificationDrawerOpen(false);
        return;
      }
      if (!isTyping && e.key.toLowerCase() === 'n' && !isTaskModalOpen) {
        e.preventDefault();
        openTaskModal(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTaskModalOpen, isNotificationDrawerOpen, openTaskModal, closeTaskModal, setIsNotificationDrawerOpen]);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <div className="app-shell fade-in">
      <aside className="sidebar glass-panel">
        <div className="brand">
          <span className="brand-mark">N</span>
          <div>
            <div className="brand-name">NexusTask</div>
            <div className="brand-tag">Pro</div>
          </div>
        </div>
        <hr className="gold-divider" />
        <nav className="side-nav">
          {VIEWS.map((v) => (
            <button
              key={v.id}
              className={`side-nav-item ${activeView === v.id ? 'active' : ''}`}
              onClick={() => setActiveView(v.id)}
            >
              <span className="side-nav-icon">{v.icon}</span>
              {v.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">Crafted for deep, focused work.</div>
      </aside>

      <div className="content-column">
        <Header activeView={activeView} />
        <main className="main-content fade-in" key={activeView}>
          {error && (
            <div className="banner-error glass-panel">
              <div className="banner-error-icon">⚠</div>
              <div>
                <div className="banner-error-title">Can't reach the API server</div>
                <div className="banner-error-copy">{error}</div>
              </div>
            </div>
          )}
          {loading ? (
            <div className="loading-state">Gathering your tasks…</div>
          ) : (
            <>
              {activeView === 'dashboard' && <DashboardView onNavigate={setActiveView} />}
              {activeView === 'tasks' && <TaskListView />}
              {activeView === 'kanban' && <KanbanBoardView />}
              {activeView === 'calendar' && <CalendarView />}
              {activeView === 'reminders' && <ReminderView />}
              {activeView === 'focus' && <PomodoroTimer />}
              {activeView === 'analytics' && <AnalyticsView />}
            </>
          )}
        </main>
      </div>

      <TaskModal />
      <NotificationDrawer />
      <ToastStack />
    </div>
  );
};

export default App;
