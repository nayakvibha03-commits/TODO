import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

const TaskContext = createContext(null);

const API_BASE = '/api/tasks';
const REMINDERS_API_BASE = '/api/reminders';

// Plays a short two-tone chime using the Web Audio API — no external
// audio asset needed, works offline, and can't be blocked by a 404.
const playAlarmChime = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const now = ctx.currentTime;
    [880, 1108.73].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const start = now + i * 0.22;
      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.22, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.45);
    });
    setTimeout(() => ctx.close(), 1200);
  } catch (err) {
    // Web Audio unsupported/blocked — the in-app toast still carries the alert.
  }
};

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [reminders, setReminders] = useState([]);
  const [notifPermission, setNotifPermission] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'unsupported'
  );

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [isNotificationDrawerOpen, setIsNotificationDrawerOpen] = useState(false);
  const [toasts, setToasts] = useState([]);

  const pushToast = useCallback((message, tone = 'default') => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  }, []);

  const fetchTasks = useCallback(async (isRetry = false) => {
    if (!isRetry) setLoading(true);
    try {
      const res = await fetch(API_BASE);
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      const data = await res.json();
      setTasks(data);
      setError(null);
    } catch (err) {
      setError(
        'Could not reach the API server. Make sure you started it with "npm run dev" from the project root (this launches both the backend on port 5000 and the frontend together).'
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const fetchReminders = useCallback(async () => {
    try {
      const res = await fetch(REMINDERS_API_BASE);
      if (!res.ok) return;
      const data = await res.json();
      setReminders(data);
    } catch (err) {
      // Reminders are a non-critical enhancement — fail silently and retry on next poll.
    }
  }, []);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  useEffect(() => {
    if (typeof Notification === 'undefined' || Notification.permission !== 'default') return;
    Notification.requestPermission().then(setNotifPermission);
  }, []);

  // Auto-retry every 4s while disconnected, so the app recovers on its own
  // once the backend comes up, without needing a manual page refresh.
  useEffect(() => {
    if (!error) return undefined;
    const interval = setInterval(() => {
      fetchTasks(true);
    }, 4000);
    return () => clearInterval(interval);
  }, [error, fetchTasks]);

  const addTask = async (payload, silent = false) => {
    const res = await fetch(API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const newTask = await res.json();
    setTasks((prev) => [newTask, ...prev]);
    if (!silent) pushToast(`"${newTask.title}" created`, 'success');
    return newTask;
  };

  const advanceDate = (iso, recurrence) => {
    const d = new Date(iso);
    if (recurrence === 'Daily') d.setDate(d.getDate() + 1);
    else if (recurrence === 'Weekly') d.setDate(d.getDate() + 7);
    else if (recurrence === 'Monthly') d.setMonth(d.getMonth() + 1);
    return d.toISOString();
  };

  const updateTask = async (id, payload) => {
    const existing = tasks.find((t) => t.id === id);
    const finalPayload = { ...payload };

    const isCompleting = payload.status === 'Done' && existing && existing.status !== 'Done';
    if (isCompleting) finalPayload.completedAt = new Date().toISOString();
    if (payload.status && payload.status !== 'Done') finalPayload.completedAt = null;

    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(finalPayload)
    });
    const updated = await res.json();
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));

    if (isCompleting) {
      pushToast(`Task completed: "${updated.title}"`, 'success');
      if (existing.recurrence && existing.recurrence !== 'None') {
        await addTask(
          {
            title: existing.title,
            description: existing.description,
            category: existing.category,
            priority: existing.priority,
            status: 'Pending',
            dueDate: advanceDate(existing.dueDate, existing.recurrence),
            estimatedMinutes: existing.estimatedMinutes,
            spentMinutes: 0,
            subtasks: (existing.subtasks || []).map((s) => ({ ...s, done: false })),
            tags: existing.tags || [],
            recurrence: existing.recurrence
          },
          true
        );
        pushToast(`Next "${existing.recurrence}" occurrence scheduled`, 'default');
      }
    }

    return updated;
  };

  const deleteTask = async (id) => {
    const existing = tasks.find((t) => t.id === id);
    await fetch(`${API_BASE}/${id}`, { method: 'DELETE' });
    setTasks((prev) => prev.filter((t) => t.id !== id));
    if (existing) pushToast(`"${existing.title}" deleted`, 'danger');
  };

  const moveTaskStatus = (id, status) => updateTask(id, { status });

  // Reorders `draggedId` to sit just before `beforeId` within tasks of the given status.
  // Pass beforeId = null to move it to the end of that status group.
  const reorderTask = (draggedId, beforeId, status) => {
    const dragged = tasks.find((t) => t.id === draggedId);
    if (!dragged) return;

    const group = tasks
      .filter((t) => t.status === status && t.id !== draggedId)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

    let newOrder;
    if (beforeId == null) {
      const last = group[group.length - 1];
      newOrder = last ? (last.order ?? 0) + 1000 : Date.now();
    } else {
      const idx = group.findIndex((t) => t.id === beforeId);
      const next = group[idx];
      const prev = group[idx - 1];
      if (!prev) newOrder = (next?.order ?? Date.now()) - 1000;
      else newOrder = ((prev.order ?? 0) + (next?.order ?? 0)) / 2;
    }

    setTasks((prevTasks) =>
      prevTasks.map((t) => (t.id === draggedId ? { ...t, order: newOrder, status } : t))
    );
    updateTask(draggedId, { order: newOrder, status });
  };

  const openTaskModal = (task = null) => {
    setTaskToEdit(task);
    setIsTaskModalOpen(true);
  };

  const closeTaskModal = () => {
    setIsTaskModalOpen(false);
    setTaskToEdit(null);
  };

  const advanceReminderDate = (iso, repeat) => {
    const d = new Date(iso);
    if (repeat === 'Daily') d.setDate(d.getDate() + 1);
    else if (repeat === 'Weekly') d.setDate(d.getDate() + 7);
    else if (repeat === 'Monthly') d.setMonth(d.getMonth() + 1);
    else if (repeat === 'Yearly') d.setFullYear(d.getFullYear() + 1);
    return d.toISOString();
  };

  const addReminder = async (payload) => {
    const res = await fetch(REMINDERS_API_BASE, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const newReminder = await res.json();
    setReminders((prev) => [newReminder, ...prev]);
    pushToast(`${payload.isEvent ? 'Event' : 'Reminder'} "${newReminder.title}" set`, 'success');
    return newReminder;
  };

  const updateReminder = async (id, payload) => {
    const res = await fetch(`${REMINDERS_API_BASE}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const updated = await res.json();
    setReminders((prev) => prev.map((r) => (r.id === id ? updated : r)));
    return updated;
  };

  const deleteReminder = async (id) => {
    const existing = reminders.find((r) => r.id === id);
    await fetch(`${REMINDERS_API_BASE}/${id}`, { method: 'DELETE' });
    setReminders((prev) => prev.filter((r) => r.id !== id));
    if (existing) pushToast(`"${existing.title}" removed`, 'danger');
  };

  const snoozeReminder = (id, minutes = 10) => {
    const existing = reminders.find((r) => r.id === id);
    if (!existing) return;
    const next = new Date(Date.now() + minutes * 60000).toISOString();
    updateReminder(id, { dateTime: next, notified: false });
    pushToast(`Snoozed "${existing.title}" for ${minutes} min`, 'default');
  };

  // Sweeps reminders every 15s looking for anything whose time has come.
  // Fires a browser Notification (if permitted), plays a chime, and drops
  // an in-app toast — then reschedules recurring ones automatically.
  useEffect(() => {
    const sweep = () => {
      const now = new Date();
      reminders.forEach((r) => {
        if (r.notified) return;
        if (new Date(r.dateTime) > now) return;

        playAlarmChime();
        const label = r.isEvent ? `★ Special Event: ${r.title}` : `⏰ Reminder: ${r.title}`;
        pushToast(label, r.isEvent ? 'success' : 'default');

        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          try {
            new Notification(label, { body: r.notes || 'Time is up.' });
          } catch (err) {
            // Some browsers restrict Notification from certain contexts — the toast still fires.
          }
        }

        updateReminder(r.id, { notified: true });
        if (r.repeat && r.repeat !== 'None') {
          addReminder({
            title: r.title,
            notes: r.notes,
            dateTime: advanceReminderDate(r.dateTime, r.repeat),
            repeat: r.repeat,
            isEvent: r.isEvent,
            notified: false
          });
        }
      });
    };
    const interval = setInterval(sweep, 15000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reminders]);

  const value = {
    tasks,
    loading,
    error,
    fetchTasks,
    addTask,
    updateTask,
    deleteTask,
    moveTaskStatus,
    reorderTask,
    isTaskModalOpen,
    taskToEdit,
    openTaskModal,
    closeTaskModal,
    isNotificationDrawerOpen,
    setIsNotificationDrawerOpen,
    toasts,
    pushToast,
    reminders,
    notifPermission,
    addReminder,
    updateReminder,
    deleteReminder,
    snoozeReminder
  };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export const useTaskContext = () => {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTaskContext must be used within a TaskProvider');
  return ctx;
};
