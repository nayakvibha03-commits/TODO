import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'tasks.json');
const REMINDERS_FILE = path.join(DATA_DIR, 'reminders.json');
const DIST_DIR = path.join(__dirname, '..', 'dist');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const readTasks = () => {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
      fs.writeFileSync(DATA_FILE, '[]', 'utf8');
      return [];
    }
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(data || '[]');
  } catch (error) {
    return [];
  }
};

const writeTasks = (tasks) => {
  fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
  fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2), 'utf8');
};

const readReminders = () => {
  try {
    if (!fs.existsSync(REMINDERS_FILE)) {
      fs.mkdirSync(path.dirname(REMINDERS_FILE), { recursive: true });
      fs.writeFileSync(REMINDERS_FILE, '[]', 'utf8');
      return [];
    }
    const data = fs.readFileSync(REMINDERS_FILE, 'utf8');
    return JSON.parse(data || '[]');
  } catch (error) {
    return [];
  }
};

const writeReminders = (reminders) => {
  fs.mkdirSync(path.dirname(REMINDERS_FILE), { recursive: true });
  fs.writeFileSync(REMINDERS_FILE, JSON.stringify(reminders, null, 2), 'utf8');
};

// GET all tasks
app.get('/api/tasks', (req, res) => res.json(readTasks()));

// CREATE a task
app.post('/api/tasks', (req, res) => {
  const tasks = readTasks();
  const newTask = {
    id: `task-${Date.now()}`,
    title: req.body.title || 'Untitled Task',
    description: req.body.description || '',
    category: req.body.category || 'General',
    priority: req.body.priority || 'Medium',
    status: req.body.status || 'Pending',
    dueDate: req.body.dueDate || new Date(Date.now() + 86400000).toISOString(),
    estimatedMinutes: Number(req.body.estimatedMinutes) || 30,
    spentMinutes: Number(req.body.spentMinutes) || 0,
    subtasks: req.body.subtasks || [],
    tags: req.body.tags || [],
    recurrence: req.body.recurrence || 'None',
    order: req.body.order ?? Date.now(),
    completedAt: req.body.completedAt || null,
    createdAt: new Date().toISOString()
  };
  tasks.unshift(newTask);
  writeTasks(tasks);
  res.status(201).json(newTask);
});

// UPDATE a task
app.put('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  let tasks = readTasks();
  const index = tasks.findIndex((t) => t.id === id);
  if (index === -1) return res.status(404).json({ error: 'Task not found' });
  tasks[index] = { ...tasks[index], ...req.body, updatedAt: new Date().toISOString() };
  writeTasks(tasks);
  res.json(tasks[index]);
});

// DELETE a task
app.delete('/api/tasks/:id', (req, res) => {
  const { id } = req.params;
  let tasks = readTasks();
  const exists = tasks.some((t) => t.id === id);
  if (!exists) return res.status(404).json({ error: 'Task not found' });
  tasks = tasks.filter((t) => t.id !== id);
  writeTasks(tasks);
  res.json({ message: 'Task deleted', id });
});

// GET all reminders
app.get('/api/reminders', (req, res) => res.json(readReminders()));

// CREATE a reminder / alarm / special event
app.post('/api/reminders', (req, res) => {
  const reminders = readReminders();
  const newReminder = {
    id: `reminder-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    title: req.body.title || 'Untitled Reminder',
    notes: req.body.notes || '',
    dateTime: req.body.dateTime || new Date(Date.now() + 3600000).toISOString(),
    repeat: req.body.repeat || 'None',
    isEvent: Boolean(req.body.isEvent),
    notified: Boolean(req.body.notified) || false,
    createdAt: new Date().toISOString()
  };
  reminders.unshift(newReminder);
  writeReminders(reminders);
  res.status(201).json(newReminder);
});

// UPDATE a reminder (e.g. snooze, mark notified, edit)
app.put('/api/reminders/:id', (req, res) => {
  const { id } = req.params;
  let reminders = readReminders();
  const index = reminders.findIndex((r) => r.id === id);
  if (index === -1) return res.status(404).json({ error: 'Reminder not found' });
  reminders[index] = { ...reminders[index], ...req.body, updatedAt: new Date().toISOString() };
  writeReminders(reminders);
  res.json(reminders[index]);
});

// DELETE a reminder
app.delete('/api/reminders/:id', (req, res) => {
  const { id } = req.params;
  let reminders = readReminders();
  const exists = reminders.some((r) => r.id === id);
  if (!exists) return res.status(404).json({ error: 'Reminder not found' });
  reminders = reminders.filter((r) => r.id !== id);
  writeReminders(reminders);
  res.json({ message: 'Reminder deleted', id });
});

// Health check (used by hosting platforms)
app.get('/healthz', (req, res) => res.json({ ok: true }));

// Serve the built React app in production
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.get(/^\/(?!api\/).*/, (req, res) => res.sendFile(path.join(DIST_DIR, 'index.html')));
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`⚡ NexusTask REST API server listening on http://localhost:${PORT}`);
});
