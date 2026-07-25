import React, { useMemo, useState } from 'react';
import { useTaskContext } from '../../context/TaskContext.jsx';

const toLocalInput = (iso) => {
  const d = iso ? new Date(iso) : new Date(Date.now() + 3600000);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const formatWhen = (iso) =>
  new Date(iso).toLocaleString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  });

const ReminderView = () => {
  const { reminders, addReminder, deleteReminder, snoozeReminder, notifPermission } = useTaskContext();

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [dateTime, setDateTime] = useState(toLocalInput());
  const [repeat, setRepeat] = useState('None');
  const [isEvent, setIsEvent] = useState(false);
  const [saving, setSaving] = useState(false);

  const { upcoming, due } = useMemo(() => {
    const now = new Date();
    const sorted = [...reminders].sort((a, b) => new Date(a.dateTime) - new Date(b.dateTime));
    return {
      due: sorted.filter((r) => !r.notified && new Date(r.dateTime) <= now),
      upcoming: sorted.filter((r) => r.notified || new Date(r.dateTime) > now)
    };
  }, [reminders]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    try {
      await addReminder({
        title: title.trim(),
        notes: notes.trim(),
        dateTime: new Date(dateTime).toISOString(),
        repeat,
        isEvent,
        notified: false
      });
      setTitle('');
      setNotes('');
      setDateTime(toLocalInput());
      setRepeat('None');
      setIsEvent(false);
    } finally {
      setSaving(false);
    }
  };

  const renderItem = (r, isDue) => (
    <div key={r.id} className={`reminder-item glass-panel ${isDue ? 'is-due' : ''}`}>
      <div className="reminder-item-main">
        <div className="reminder-item-title-row">
          {r.isEvent && <span className="reminder-event-badge">★ Special Event</span>}
          {isDue && <span className="reminder-due-badge">Ringing now</span>}
          <span className="reminder-item-title">{r.title}</span>
        </div>
        {r.notes && <p className="reminder-item-notes">{r.notes}</p>}
        <div className="reminder-item-meta">
          <span>{formatWhen(r.dateTime)}</span>
          {r.repeat && r.repeat !== 'None' && <span className="recur-icon" title={`Repeats ${r.repeat}`}>↻ {r.repeat}</span>}
        </div>
      </div>
      <div className="reminder-item-actions">
        {isDue && (
          <button className="btn btn-ghost" onClick={() => snoozeReminder(r.id, 10)}>
            Snooze 10m
          </button>
        )}
        <button className="task-delete" onClick={() => deleteReminder(r.id)} aria-label="Delete reminder">
          ✕
        </button>
      </div>
    </div>
  );

  return (
    <div>
      <h1 className="page-heading">Reminders &amp; Alarms</h1>
      <p className="page-subtitle">
        Set alarms for anything — deadlines, birthdays, appointments — and mark the ones that matter most as
        special events.
      </p>

      {notifPermission === 'denied' && (
        <p className="empty-copy small">
          Browser notifications are blocked — you'll still get an in-app alert and chime when a reminder goes off.
        </p>
      )}

      <form className="glass-panel reminder-form" onSubmit={handleSubmit}>
        <div className="field-row">
          <div>
            <label className="field-label">Title</label>
            <input
              className="field-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Client call, Anniversary, Pay rent"
              required
            />
          </div>
          <div>
            <label className="field-label">Date &amp; Time</label>
            <input
              type="datetime-local"
              className="field-input"
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              required
            />
          </div>
        </div>

        <label className="field-label">Notes (optional)</label>
        <input
          className="field-input"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any extra detail to show when it rings"
        />

        <div className="field-row">
          <div>
            <label className="field-label">Repeats</label>
            <select className="field-input" value={repeat} onChange={(e) => setRepeat(e.target.value)}>
              <option>None</option>
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
              <option>Yearly</option>
            </select>
          </div>
          <div className="reminder-event-toggle-wrap">
            <label className="field-label">Special Event</label>
            <button
              type="button"
              className={`reminder-event-toggle ${isEvent ? 'on' : ''}`}
              onClick={() => setIsEvent((v) => !v)}
              aria-pressed={isEvent}
            >
              ★ {isEvent ? 'Marked as special' : 'Mark as special'}
            </button>
          </div>
        </div>

        <div className="modal-actions">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : '+ Set Reminder'}
          </button>
        </div>
      </form>

      {due.length > 0 && (
        <>
          <h2 className="reminder-section-title danger">Ringing now ({due.length})</h2>
          <div className="reminder-list">{due.map((r) => renderItem(r, true))}</div>
        </>
      )}

      <h2 className="reminder-section-title">Upcoming ({upcoming.length})</h2>
      {upcoming.length === 0 ? (
        <p className="empty-copy">No reminders scheduled. Add one above.</p>
      ) : (
        <div className="reminder-list">{upcoming.map((r) => renderItem(r, false))}</div>
      )}
    </div>
  );
};

export default ReminderView;
