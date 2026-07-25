import React from 'react';
import ReactDOM from 'react-dom';
import { useTaskContext } from '../../context/TaskContext.jsx';

const NotificationDrawer = () => {
  const {
    isNotificationDrawerOpen,
    setIsNotificationDrawerOpen,
    tasks,
    openTaskModal,
    reminders,
    snoozeReminder,
    deleteReminder
  } = useTaskContext();

  if (!isNotificationDrawerOpen) return null;

  const now = new Date();
  const overdue = tasks.filter((t) => t.status !== 'Done' && new Date(t.dueDate) < now);
  const dueSoon = tasks.filter((t) => {
    if (t.status === 'Done') return false;
    const diffHours = (new Date(t.dueDate) - now) / 3600000;
    return diffHours >= 0 && diffHours <= 48;
  });
  const ringingReminders = reminders.filter((r) => !r.notified && new Date(r.dateTime) <= now);

  const close = () => setIsNotificationDrawerOpen(false);

  return ReactDOM.createPortal(
    <div className="drawer-overlay" onClick={close}>
      <div className="drawer-panel glass-panel fade-in" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Notifications</h2>
          <button className="modal-close" onClick={close} aria-label="Close">✕</button>
        </div>

        {ringingReminders.length > 0 && (
          <div className="drawer-section">
            <div className="drawer-section-title danger">Reminders ringing ({ringingReminders.length})</div>
            {ringingReminders.map((r) => (
              <div key={r.id} className="drawer-item">
                <span>{r.isEvent ? `★ ${r.title}` : r.title}</span>
                <span className="drawer-item-date">
                  <button type="button" className="btn-link" onClick={() => snoozeReminder(r.id, 10)}>Snooze</button>
                  {' · '}
                  <button type="button" className="btn-link" onClick={() => deleteReminder(r.id)}>Dismiss</button>
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="drawer-section">
          <div className="drawer-section-title danger">Overdue ({overdue.length})</div>
          {overdue.length === 0 ? (
            <p className="empty-copy small">Nothing overdue. Well done.</p>
          ) : (
            overdue.map((t) => (
              <button key={t.id} className="drawer-item" onClick={() => { openTaskModal(t); close(); }}>
                <span>{t.title}</span>
                <span className="drawer-item-date">{new Date(t.dueDate).toLocaleDateString()}</span>
              </button>
            ))
          )}
        </div>

        <div className="drawer-section">
          <div className="drawer-section-title">Due in the next 48 hours ({dueSoon.length})</div>
          {dueSoon.length === 0 ? (
            <p className="empty-copy small">Nothing due soon.</p>
          ) : (
            dueSoon.map((t) => (
              <button key={t.id} className="drawer-item" onClick={() => { openTaskModal(t); close(); }}>
                <span>{t.title}</span>
                <span className="drawer-item-date">{new Date(t.dueDate).toLocaleDateString()}</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default NotificationDrawer;
