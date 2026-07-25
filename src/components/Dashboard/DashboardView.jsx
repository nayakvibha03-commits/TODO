import React from 'react';
import { useTaskContext } from '../../context/TaskContext.jsx';
import TaskCard from '../Tasks/TaskCard.jsx';

const DashboardView = ({ onNavigate }) => {
  const { tasks } = useTaskContext();

  const total = tasks.length;
  const done = tasks.filter((t) => t.status === 'Done').length;
  const inProgress = tasks.filter((t) => t.status === 'In Progress').length;
  const overdue = tasks.filter((t) => t.status !== 'Done' && new Date(t.dueDate) < new Date()).length;
  const completionRate = total ? Math.round((done / total) * 100) : 0;

  const upcoming = [...tasks]
    .filter((t) => t.status !== 'Done')
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 3);

  const stats = [
    { label: 'Total Tasks', value: total, tone: 'gold' },
    { label: 'In Progress', value: inProgress, tone: 'gold' },
    { label: 'Completed', value: done, tone: 'success' },
    { label: 'Overdue', value: overdue, tone: 'danger' }
  ];

  return (
    <div>
      <h1 className="page-heading">Good to see you.</h1>
      <p className="page-subtitle">Here's where things stand today.</p>

      <div className="stat-grid">
        {stats.map((s) => (
          <div key={s.label} className={`stat-card glass-panel tone-${s.tone}`}>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="dashboard-split">
        <div className="glass-panel progress-panel">
          <div className="panel-title">Completion Rate</div>
          <div className="progress-ring-wrap">
            <svg viewBox="0 0 120 120" className="progress-ring">
              <circle cx="60" cy="60" r="52" className="ring-track" />
              <circle
                cx="60"
                cy="60"
                r="52"
                className="ring-fill"
                style={{
                  strokeDasharray: `${2 * Math.PI * 52}`,
                  strokeDashoffset: `${2 * Math.PI * 52 * (1 - completionRate / 100)}`
                }}
              />
            </svg>
            <div className="progress-ring-label">
              <span className="progress-number">{completionRate}%</span>
              <span className="progress-caption">of tasks done</span>
            </div>
          </div>
        </div>

        <div className="glass-panel upcoming-panel">
          <div className="panel-title-row">
            <div className="panel-title">Upcoming Deadlines</div>
            <button className="btn-link" onClick={() => onNavigate('tasks')}>
              View all →
            </button>
          </div>
          {upcoming.length === 0 ? (
            <p className="empty-copy">Nothing pressing right now. Enjoy the calm.</p>
          ) : (
            <div className="upcoming-list">
              {upcoming.map((task) => (
                <TaskCard key={task.id} task={task} compact />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
