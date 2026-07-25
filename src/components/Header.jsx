import React from 'react';
import { useTaskContext } from '../context/TaskContext.jsx';

const VIEW_LABELS = {
  dashboard: 'Overview',
  tasks: 'Task List',
  kanban: 'Board',
  calendar: 'Calendar',
  reminders: 'Reminders & Alarms',
  focus: 'Focus Timer',
  analytics: 'Analytics'
};

const Header = ({ activeView }) => {
  const { tasks, reminders, setIsNotificationDrawerOpen, openTaskModal } = useTaskContext();

  const overdueCount = tasks.filter(
    (t) => t.status !== 'Done' && new Date(t.dueDate) < new Date()
  ).length;
  const dueReminderCount = reminders.filter((r) => !r.notified && new Date(r.dateTime) <= new Date()).length;

  return (
    <header className="app-header">
      <span className="header-view-label">{VIEW_LABELS[activeView] || ''}</span>
      <div className="header-actions">
        <button className="btn btn-primary" onClick={() => openTaskModal(null)}>
          + New Task
        </button>
        <span className="kbd-hint">
          press <kbd>N</kbd>
        </span>
        <button
          className="icon-btn"
          onClick={() => setIsNotificationDrawerOpen(true)}
          aria-label="Open notifications"
        >
          ⚑
          {(overdueCount > 0 || dueReminderCount > 0) && <span className="notif-dot" />}
        </button>
      </div>
    </header>
  );
};

export default Header;
