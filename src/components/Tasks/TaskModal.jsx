import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { useTaskContext } from '../../context/TaskContext.jsx';

const toLocalInput = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const defaultDue = () => {
  const d = new Date(Date.now() + 86400000);
  return toLocalInput(d.toISOString());
};

const TaskModal = () => {
  const { isTaskModalOpen, closeTaskModal, taskToEdit, addTask, updateTask } = useTaskContext();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('General');
  const [priority, setPriority] = useState('Medium');
  const [status, setStatus] = useState('Pending');
  const [dueDate, setDueDate] = useState(defaultDue());
  const [estimatedMinutes, setEstimatedMinutes] = useState(30);
  const [subtaskDraft, setSubtaskDraft] = useState('');
  const [subtasks, setSubtasks] = useState([]);
  const [tags, setTags] = useState([]);
  const [tagDraft, setTagDraft] = useState('');
  const [recurrence, setRecurrence] = useState('None');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title || '');
      setDescription(taskToEdit.description || '');
      setCategory(taskToEdit.category || 'General');
      setPriority(taskToEdit.priority || 'Medium');
      setStatus(taskToEdit.status || 'Pending');
      setDueDate(taskToEdit.dueDate ? toLocalInput(taskToEdit.dueDate) : defaultDue());
      setEstimatedMinutes(taskToEdit.estimatedMinutes || 30);
      setSubtasks(taskToEdit.subtasks || []);
      setTags(taskToEdit.tags || []);
      setRecurrence(taskToEdit.recurrence || 'None');
    } else {
      setTitle('');
      setDescription('');
      setCategory('General');
      setPriority('Medium');
      setStatus('Pending');
      setDueDate(defaultDue());
      setEstimatedMinutes(30);
      setSubtasks([]);
      setTags([]);
      setRecurrence('None');
    }
  }, [taskToEdit, isTaskModalOpen]);

  if (!isTaskModalOpen) return null;

  const addTag = () => {
    const clean = tagDraft.trim();
    if (!clean || tags.includes(clean)) return;
    setTags((prev) => [...prev, clean]);
    setTagDraft('');
  };

  const removeTag = (tag) => setTags((prev) => prev.filter((t) => t !== tag));

  const addSubtask = () => {
    if (!subtaskDraft.trim()) return;
    setSubtasks((prev) => [...prev, { id: `sub-${Date.now()}`, title: subtaskDraft.trim(), done: false }]);
    setSubtaskDraft('');
  };

  const toggleSubtask = (id) => {
    setSubtasks((prev) => prev.map((s) => (s.id === id ? { ...s, done: !s.done } : s)));
  };

  const removeSubtask = (id) => {
    setSubtasks((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    setSaving(true);
    const payload = {
      title: title.trim(),
      description,
      category,
      priority,
      status,
      dueDate: new Date(dueDate).toISOString(),
      estimatedMinutes: Number(estimatedMinutes),
      subtasks,
      tags,
      recurrence
    };
    try {
      if (taskToEdit) await updateTask(taskToEdit.id, payload);
      else await addTask({ ...payload, spentMinutes: 0 });
      closeTaskModal();
    } finally {
      setSaving(false);
    }
  };

  return ReactDOM.createPortal(
    <div className="modal-overlay" onClick={closeTaskModal}>
      <form className="modal-card glass-panel fade-in" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <div className="modal-header">
          <h2>{taskToEdit ? 'Edit Task' : 'New Task'}</h2>
          <button type="button" className="modal-close" onClick={closeTaskModal} aria-label="Close">✕</button>
        </div>

        <label className="field-label">Title</label>
        <input className="field-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="What needs doing?" autoFocus required />

        <label className="field-label">Description</label>
        <textarea className="field-input description-input" rows={6} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add more detail…" />

        <div className="field-row">
          <div>
            <label className="field-label">Category</label>
            <input className="field-input" value={category} onChange={(e) => setCategory(e.target.value)} />
          </div>
          <div>
            <label className="field-label">Priority</label>
            <select className="field-input" value={priority} onChange={(e) => setPriority(e.target.value)}>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </div>
        </div>

        <div className="field-row">
          <div>
            <label className="field-label">Status</label>
            <select className="field-input" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option>Pending</option>
              <option>In Progress</option>
              <option>Done</option>
            </select>
          </div>
          <div>
            <label className="field-label">Due Date</label>
            <input type="datetime-local" className="field-input" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
        </div>

        <div className="field-row">
          <div>
            <label className="field-label">Estimated Minutes</label>
            <input type="number" min="5" step="5" className="field-input" value={estimatedMinutes} onChange={(e) => setEstimatedMinutes(e.target.value)} />
          </div>
          <div>
            <label className="field-label">Repeats</label>
            <select className="field-input" value={recurrence} onChange={(e) => setRecurrence(e.target.value)}>
              <option>None</option>
              <option>Daily</option>
              <option>Weekly</option>
              <option>Monthly</option>
            </select>
          </div>
        </div>

        <label className="field-label">Tags</label>
        <div className="subtask-input-row">
          <input
            className="field-input"
            value={tagDraft}
            onChange={(e) => setTagDraft(e.target.value)}
            placeholder="Add a tag and press Enter"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addTag();
              }
            }}
          />
          <button type="button" className="btn btn-ghost" onClick={addTag}>Add</button>
        </div>
        {tags.length > 0 && (
          <div className="tag-chip-row">
            {tags.map((tag) => (
              <span key={tag} className="tag-chip">
                {tag}
                <button type="button" onClick={() => removeTag(tag)} aria-label={`Remove ${tag}`}>✕</button>
              </span>
            ))}
          </div>
        )}

        <label className="field-label">Subtasks</label>
        <div className="subtask-input-row">
          <input
            className="field-input"
            value={subtaskDraft}
            onChange={(e) => setSubtaskDraft(e.target.value)}
            placeholder="Add a subtask and press Enter"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addSubtask();
              }
            }}
          />
          <button type="button" className="btn btn-ghost" onClick={addSubtask}>Add</button>
        </div>
        {subtasks.length > 0 && (
          <ul className="subtask-list">
            {subtasks.map((s) => (
              <li key={s.id} className={s.done ? 'done' : ''}>
                <button type="button" className={`check-circle small ${s.done ? 'checked' : ''}`} onClick={() => toggleSubtask(s.id)} />
                <span>{s.title}</span>
                <button type="button" className="task-delete" onClick={() => removeSubtask(s.id)}>✕</button>
              </li>
            ))}
          </ul>
        )}

        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={closeTaskModal}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving…' : taskToEdit ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </form>
    </div>,
    document.body
  );
};

export default TaskModal;
