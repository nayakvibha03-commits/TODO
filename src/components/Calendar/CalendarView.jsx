import React, { useState, useMemo } from 'react';
import { useTaskContext } from '../../context/TaskContext.jsx';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const CalendarView = () => {
  const { tasks, openTaskModal } = useTaskContext();
  const [cursor, setCursor] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const tasksByDay = useMemo(() => {
    const map = {};
    tasks.forEach((t) => {
      const d = new Date(t.dueDate);
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
      if (!map[key]) map[key] = [];
      map[key].push(t);
    });
    return map;
  }, [tasks]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const today = new Date();

  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const changeMonth = (delta) => setCursor(new Date(year, month + delta, 1));

  return (
    <div>
      <h1 className="page-heading">Calendar</h1>
      <p className="page-subtitle">See what's due, week by week.</p>

      <div className="calendar-header glass-panel">
        <button className="btn btn-ghost" onClick={() => changeMonth(-1)}>‹ Prev</button>
        <span className="calendar-title">{MONTH_NAMES[month]} {year}</span>
        <button className="btn btn-ghost" onClick={() => changeMonth(1)}>Next ›</button>
      </div>

      <div className="calendar-grid glass-panel">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="calendar-weekday">{d}</div>
        ))}
        {cells.map((day, idx) => {
          if (!day) return <div key={idx} className="calendar-cell empty" />;
          const key = `${year}-${month}-${day}`;
          const dayTasks = tasksByDay[key] || [];
          const isToday =
            day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
          return (
            <div key={idx} className={`calendar-cell ${isToday ? 'today' : ''}`}>
              <span className="calendar-daynum">{day}</span>
              <div className="calendar-tasks">
                {dayTasks.slice(0, 3).map((t) => (
                  <button
                    key={t.id}
                    className={`calendar-task-chip ${t.status === 'Done' ? 'done' : ''}`}
                    onClick={() => openTaskModal(t)}
                    title={t.title}
                  >
                    {t.title}
                  </button>
                ))}
                {dayTasks.length > 3 && <span className="calendar-more">+{dayTasks.length - 3} more</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CalendarView;
