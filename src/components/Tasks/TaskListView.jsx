import React, { useState, useMemo } from 'react';
import { useTaskContext } from '../../context/TaskContext.jsx';
import TaskCard from './TaskCard.jsx';

const FILTERS = ['All', 'Pending', 'In Progress', 'Done'];

const TaskListView = () => {
  const { tasks, reorderTask } = useTaskContext();
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [tagFilter, setTagFilter] = useState('All');

  const counts = useMemo(() => {
    const c = { All: tasks.length, Pending: 0, 'In Progress': 0, Done: 0 };
    tasks.forEach((t) => {
      if (c[t.status] !== undefined) c[t.status] += 1;
    });
    return c;
  }, [tasks]);

  const allTags = useMemo(() => {
    const set = new Set();
    tasks.forEach((t) => (t.tags || []).forEach((tag) => set.add(tag)));
    return Array.from(set).sort();
  }, [tasks]);

  const filtered = tasks
    .filter((t) => filter === 'All' || t.status === filter)
    .filter((t) => tagFilter === 'All' || (t.tags || []).includes(tagFilter))
    .filter((t) => t.title.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const handleDropOnCard = (targetTask) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    const id = e.dataTransfer.getData('text/task-id');
    if (id && id !== targetTask.id) reorderTask(id, targetTask.id, targetTask.status);
  };

  const exportCsv = () => {
    const headers = ['Title', 'Category', 'Priority', 'Status', 'Due Date', 'Tags', 'Estimated Minutes', 'Spent Minutes'];
    const rows = filtered.map((t) => [
      t.title,
      t.category,
      t.priority,
      t.status,
      new Date(t.dueDate).toLocaleString(),
      (t.tags || []).join('; '),
      t.estimatedMinutes,
      t.spentMinutes
    ]);
    const escape = (val) => `"${String(val ?? '').replace(/"/g, '""')}"`;
    const csv = [headers, ...rows].map((row) => row.map(escape).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'nexustask-export.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <h1 className="page-heading">Your Tasks</h1>
      <p className="page-subtitle">Everything you're tracking, in one place. Drag cards to reorder.</p>

      <div className="tasklist-toolbar">
        <div className="filter-tabs">
          {FILTERS.map((f) => (
            <button
              key={f}
              className={`filter-tab ${filter === f ? 'active' : ''}`}
              onClick={() => setFilter(f)}
            >
              {f} <span className="filter-count">{counts[f]}</span>
            </button>
          ))}
        </div>
        <div className="toolbar-right">
          {allTags.length > 0 && (
            <select className="field-input tag-select" value={tagFilter} onChange={(e) => setTagFilter(e.target.value)}>
              <option value="All">All tags</option>
              {allTags.map((tag) => (
                <option key={tag} value={tag}>{tag}</option>
              ))}
            </select>
          )}
          <input
            className="search-input"
            placeholder="Search tasks…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button className="btn btn-ghost" onClick={exportCsv} title="Export visible tasks as CSV">
            ⭳ Export
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <p className="empty-copy">No tasks match this filter yet.</p>
      ) : (
        <div className="task-list">
          {filtered.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              draggable
              onDragStart={(e) => e.dataTransfer.setData('text/task-id', task.id)}
              onDragOverCard={(e) => e.preventDefault()}
              onDropCard={handleDropOnCard(task)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TaskListView;
